#!/usr/bin/env python3
"""Aggregate evaluated Live Cash diagnostic responses conservatively."""

from __future__ import annotations

import argparse
import json
import sys
from collections import defaultdict
from pathlib import Path
from typing import Any

SCORER_VERSION = "0.2.0"
ALLOWED_CLASSES = {"A", "B", "C", "D", "E", "U"}
ALLOWED_CONTEXTS = {
    "COLD_BASELINE",
    "POST_LEARNING_DIAGNOSTIC",
    "MIXED_EXPOSURE_INVALID_FOR_BASELINE",
}
ALLOWED_LOCALES = {"ru", "en"}
CLASS_ERROR = {"A": 0.0, "B": 0.55, "C": 0.70, "D": 1.0, "E": 0.65, "U": 0.0}
PRIOR_ALPHA = 2.0
PRIOR_BETA = 2.0


def load_json(path: Path) -> Any:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise ValueError(f"Cannot read valid JSON from {path}: {exc}") from exc


def validate(manifest: dict[str, Any], record: dict[str, Any]) -> dict[str, dict[str, Any]]:
    item_map = {item["id"]: item for item in manifest.get("items", [])}
    responses = record.get("responses")
    if not item_map or not isinstance(responses, list) or not responses:
        raise ValueError("Manifest items and non-empty responses are required")
    if record.get("schema_version") != "evaluated-0.2":
        raise ValueError("schema_version must be evaluated-0.2")
    if record.get("learner_id") != "current_learner":
        raise ValueError("learner_id must be current_learner")
    tranche_id = record.get("tranche_id")
    if tranche_id not in {"T1", "T2", "RETEST", "DELAYED"}:
        raise ValueError("unsupported tranche_id")
    if record.get("measurement_context") not in ALLOWED_CONTEXTS:
        raise ValueError("measurement_context is required and must be valid")
    if record.get("locale_at_start") not in ALLOWED_LOCALES:
        raise ValueError("locale_at_start must be ru or en")
    if not isinstance(record.get("submitted_at"), str) or not record["submitted_at"]:
        raise ValueError("submitted_at is required")

    expected_ids = set(manifest.get("tranches", {}).get(tranche_id, {}).get("items", []))
    if tranche_id == "T1" and len(responses) != 10:
        raise ValueError("T1 requires exactly 10 evaluated responses")

    seen: set[str] = set()
    for response in responses:
        if not isinstance(response, dict):
            raise ValueError("every response must be an object")
        item_id = response.get("item_id")
        if item_id not in item_map:
            raise ValueError(f"Unknown item_id: {item_id}")
        if expected_ids and item_id not in expected_ids:
            raise ValueError(f"{item_id} does not belong to tranche {tranche_id}")
        if item_id in seen:
            raise ValueError(f"Duplicate item_id: {item_id}")
        seen.add(item_id)

        if not isinstance(response.get("answer"), str) or not response["answer"].strip():
            raise ValueError(f"{item_id}: answer is required")
        if not isinstance(response.get("reasoning"), str) or not response["reasoning"].strip():
            raise ValueError(f"{item_id}: reasoning is required")
        if response.get("locale") not in ALLOWED_LOCALES:
            raise ValueError(f"{item_id}: locale must be ru or en")
        confidence = response.get("confidence")
        if not isinstance(confidence, int) or not 0 <= confidence <= 100:
            raise ValueError(f"{item_id}: confidence must be an integer 0..100")
        time_seconds = response.get("time_seconds")
        if not isinstance(time_seconds, (int, float)) or time_seconds < 0:
            raise ValueError(f"{item_id}: time_seconds must be non-negative")

        evaluation = response.get("evaluation")
        if not isinstance(evaluation, dict):
            raise ValueError(f"{item_id}: evaluation object is required")
        if evaluation.get("response_class") not in ALLOWED_CLASSES:
            raise ValueError(f"{item_id}: invalid response_class")
        for name, lower, upper in (
            ("action_score", 0.0, 1.0),
            ("reasoning_score", 0.0, 2.0),
            ("boundary_score", 0.0, 1.0),
        ):
            value = evaluation.get(name)
            if not isinstance(value, (int, float)) or not lower <= value <= upper:
                raise ValueError(f"{item_id}: {name} must be within {lower}..{upper}")
        misconceptions = evaluation.get("misconceptions")
        if not isinstance(misconceptions, list) or not all(
            isinstance(value, str) and value.startswith("MC-") for value in misconceptions
        ):
            raise ValueError(f"{item_id}: misconceptions must be MC identifiers")

    if expected_ids and seen != expected_ids:
        missing = sorted(expected_ids - seen)
        extra = sorted(seen - expected_ids)
        raise ValueError(f"tranche item mismatch; missing={missing}, extra={extra}")
    return item_map


def grade(exposure: float, changed: int, delayed: int) -> str:
    if exposure <= 0:
        return "UNMEASURED"
    if exposure < 2 or changed == 0:
        return "TENTATIVE"
    if exposure < 5 or delayed == 0:
        return "WORKING"
    return "STABLE_ESTIMATE"


def score(manifest: dict[str, Any], record: dict[str, Any]) -> dict[str, Any]:
    item_map = validate(manifest, record)
    candidates = defaultdict(lambda: {
        "errors": 0.0, "exposure": 0.0, "base": 0.0,
        "changed": 0, "delayed": 0, "items": []
    })
    modules = defaultdict(lambda: {"errors": 0.0, "exposure": 0.0, "items": []})
    misconceptions = defaultdict(lambda: {"observations": 0, "high_confidence": 0, "items": []})
    confidence_flags: list[dict[str, Any]] = []
    latency_flags: list[dict[str, Any]] = []
    class_counts = defaultdict(int)

    for response in record["responses"]:
        item = item_map[response["item_id"]]
        evaluation = response["evaluation"]
        response_class = evaluation["response_class"]
        class_counts[response_class] += 1
        error = CLASS_ERROR[response_class]
        confidence = response["confidence"]
        if error > 0 and confidence > 70:
            error *= 1.0 + min(0.15, (confidence - 70) / 200.0)
        error = min(1.0, error)

        if response_class in {"C", "D", "E"} and confidence >= 80:
            confidence_flags.append({"item_id": response["item_id"], "flag": "HIGH_CONFIDENCE_STRUCTURAL_ERROR", "confidence": confidence})
        if response_class == "A" and confidence <= 40:
            confidence_flags.append({"item_id": response["item_id"], "flag": "LOW_CONFIDENCE_CORRECT", "confidence": confidence})
        if response["time_seconds"] > item["target_seconds"] * 1.75:
            latency_flags.append({"item_id": response["item_id"], "time_seconds": response["time_seconds"], "target_seconds": item["target_seconds"]})

        changed = int("VARIANT_TRANSFER" in item.get("dimensions", []))
        delayed = int(record.get("tranche_id") == "DELAYED")
        for candidate_id in item["candidates"]:
            row = candidates[candidate_id]
            row["errors"] += error
            row["exposure"] += 1.0
            row["base"] += float(item["base_ev_weight"])
            row["changed"] += changed
            row["delayed"] += delayed
            row["items"].append(response["item_id"])

        module = modules[item["module"]]
        module["errors"] += error
        module["exposure"] += 1.0
        module["items"].append(response["item_id"])

        for misconception_id in evaluation["misconceptions"]:
            row = misconceptions[misconception_id]
            row["observations"] += 1
            row["high_confidence"] += int(confidence >= 80)
            row["items"].append(response["item_id"])

    output_candidates: dict[str, Any] = {}
    for candidate_id, row in candidates.items():
        posterior = (PRIOR_ALPHA + row["errors"]) / (PRIOR_ALPHA + PRIOR_BETA + row["exposure"])
        evidence = grade(row["exposure"], row["changed"], row["delayed"])
        confidence_factor = {"UNMEASURED": 0.0, "TENTATIVE": 0.55, "WORKING": 0.80, "STABLE_ESTIMATE": 1.0}[evidence]
        mean_base = row["base"] / row["exposure"]
        output_candidates[candidate_id] = {
            "posterior_error_mean": round(posterior, 4),
            "evidence_grade": evidence,
            "weighted_errors": round(row["errors"], 4),
            "exposures": row["exposure"],
            "priority_index": round(posterior * mean_base * confidence_factor, 4),
            "items": row["items"],
        }

    ranked = sorted(output_candidates, key=lambda cid: output_candidates[cid]["priority_index"], reverse=True)
    return {
        "schema_version": "score-0.2",
        "scorer_version": SCORER_VERSION,
        "learner_id": record.get("learner_id"),
        "tranche_id": record.get("tranche_id"),
        "measurement_context": record.get("measurement_context"),
        "locale_at_start": record.get("locale_at_start"),
        "submitted_at": record.get("submitted_at"),
        "responses_scored": len(record["responses"]),
        "rerank_ready": len(record["responses"]) >= 8,
        "response_class_counts": dict(sorted(class_counts.items())),
        "candidate_estimates": output_candidates,
        "tentative_priority_order": ranked,
        "module_summary": {
            module_id: {
                "observed_error_rate": round(row["errors"] / row["exposure"], 4),
                "exposures": row["exposure"],
                "items": row["items"],
            } for module_id, row in modules.items()
        },
        "misconception_evidence": dict(misconceptions),
        "confidence_flags": confidence_flags,
        "latency_flags": latency_flags,
        "truth_boundary": [
            "posterior estimates are prioritisation aids, not true EV loss",
            "TENTATIVE estimates require changed-node and delayed evidence",
            "untested candidates remain UNMEASURED",
            "MIXED_EXPOSURE_INVALID_FOR_BASELINE cannot be interpreted as a cold baseline",
        ],
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--manifest", type=Path, required=True)
    parser.add_argument("--responses", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    try:
        result = score(load_json(args.manifest), load_json(args.responses))
        args.output.write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
    except ValueError as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 2
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
