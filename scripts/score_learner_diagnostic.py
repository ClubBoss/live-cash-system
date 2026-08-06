#!/usr/bin/env python3
"""Validate and aggregate evaluated Live Cash T1 responses conservatively."""

from __future__ import annotations

import argparse
import json
import re
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
CANONICAL_MC = {f"MC-{index:03d}" for index in range(1, 31)}
CLASS_ERROR = {"A": 0.0, "B": 0.55, "C": 0.70, "D": 1.0, "E": 0.65, "U": 0.0}
PRIOR_ALPHA = 2.0
PRIOR_BETA = 2.0


def load_json(path: Path) -> Any:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise ValueError(f"Cannot read valid JSON from {path}: {exc}") from exc


def require_exact_keys(value: dict[str, Any], allowed: set[str], label: str) -> None:
    extras = sorted(set(value) - allowed)
    if extras:
        raise ValueError(f"{label} contains unknown fields: {extras}")


def validate(manifest: dict[str, Any], record: dict[str, Any]) -> dict[str, dict[str, Any]]:
    require_exact_keys(
        record,
        {
            "schema_version",
            "learner_id",
            "tranche_id",
            "run_id",
            "measurement_context",
            "locale_at_start",
            "submitted_at",
            "responses",
        },
        "evaluated record",
    )
    if record.get("schema_version") != "evaluated-0.2":
        raise ValueError("schema_version must be evaluated-0.2")
    if record.get("learner_id") != "current_learner":
        raise ValueError("learner_id must be current_learner")
    if record.get("tranche_id") != "T1":
        raise ValueError("only T1 is accepted by scorer v0.2")
    run_id = record.get("run_id")
    if not isinstance(run_id, str) or not re.fullmatch(r"t1-[A-Za-z0-9-]+", run_id):
        raise ValueError("run_id must identify one immutable T1 run")
    if record.get("measurement_context") not in ALLOWED_CONTEXTS:
        raise ValueError("measurement_context is required and must be valid")
    if record.get("locale_at_start") not in ALLOWED_LOCALES:
        raise ValueError("locale_at_start must be ru or en")
    submitted_at = record.get("submitted_at")
    if not isinstance(submitted_at, str) or not submitted_at:
        raise ValueError("submitted_at is required")

    item_map = {item["id"]: item for item in manifest.get("items", []) if isinstance(item, dict) and "id" in item}
    expected_ids = set(manifest.get("tranches", {}).get("T1", {}).get("items", []))
    responses = record.get("responses")
    if len(expected_ids) != 10:
        raise ValueError("manifest must define exactly ten T1 item IDs")
    if not item_map or not isinstance(responses, list) or len(responses) != 10:
        raise ValueError("T1 requires exactly ten evaluated responses")

    seen: set[str] = set()
    for response in responses:
        if not isinstance(response, dict):
            raise ValueError("every response must be an object")
        require_exact_keys(
            response,
            {"item_id", "answer", "reasoning", "confidence", "time_seconds", "locale", "evaluation"},
            "response",
        )
        item_id = response.get("item_id")
        if item_id not in item_map or item_id not in expected_ids:
            raise ValueError(f"Unknown or non-T1 item_id: {item_id}")
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
        require_exact_keys(
            evaluation,
            {
                "response_class",
                "action_score",
                "reasoning_score",
                "boundary_score",
                "misconceptions",
                "evaluator_note",
            },
            f"{item_id} evaluation",
        )
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
        if not isinstance(misconceptions, list) or len(misconceptions) != len(set(misconceptions)):
            raise ValueError(f"{item_id}: misconceptions must be a unique list")
        if not all(value in CANONICAL_MC for value in misconceptions):
            raise ValueError(f"{item_id}: misconceptions must use canonical MC-001..MC-030 identifiers")

    if seen != expected_ids:
        raise ValueError(
            f"T1 item mismatch; missing={sorted(expected_ids - seen)}, extra={sorted(seen - expected_ids)}"
        )
    return item_map


def evidence_grade(exposure: float, changed: int, delayed: int) -> str:
    if exposure <= 0:
        return "UNMEASURED"
    if exposure < 2 or changed == 0:
        return "TENTATIVE"
    if exposure < 5 or delayed == 0:
        return "WORKING"
    return "STABLE_ESTIMATE"


def score(manifest: dict[str, Any], record: dict[str, Any]) -> dict[str, Any]:
    item_map = validate(manifest, record)
    candidates = defaultdict(
        lambda: {
            "errors": 0.0,
            "exposure": 0.0,
            "base": 0.0,
            "changed": 0,
            "delayed": 0,
            "items": [],
        }
    )
    modules = defaultdict(lambda: {"errors": 0.0, "exposure": 0, "items": []})
    misconceptions = defaultdict(lambda: {"observations": 0, "high_confidence": 0, "items": []})
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

        changed = int("VARIANT_TRANSFER" in item.get("dimensions", []))
        delayed = 0
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
        module["exposure"] += 1
        module["items"].append(response["item_id"])

        for misconception_id in evaluation["misconceptions"]:
            row = misconceptions[misconception_id]
            row["observations"] += 1
            row["high_confidence"] += int(confidence >= 80)
            row["items"].append(response["item_id"])

    candidate_summary: dict[str, Any] = {}
    for candidate_id, row in candidates.items():
        posterior = (PRIOR_ALPHA + row["errors"]) / (PRIOR_ALPHA + PRIOR_BETA + row["exposure"])
        grade = evidence_grade(row["exposure"], row["changed"], row["delayed"])
        confidence_factor = {
            "UNMEASURED": 0.0,
            "TENTATIVE": 0.55,
            "WORKING": 0.80,
            "STABLE_ESTIMATE": 1.0,
        }[grade]
        mean_base = row["base"] / row["exposure"]
        candidate_summary[candidate_id] = {
            "posterior_error_mean": round(posterior, 4),
            "evidence_grade": grade,
            "weighted_errors": round(row["errors"], 4),
            "exposures": int(row["exposure"]),
            "priority_index": round(posterior * mean_base * confidence_factor, 4),
            "items": row["items"],
        }

    ranked = sorted(
        candidate_summary,
        key=lambda candidate_id: candidate_summary[candidate_id]["priority_index"],
        reverse=True,
    )
    return {
        "schema_version": "score-0.2",
        "scorer_version": SCORER_VERSION,
        "learner_id": record["learner_id"],
        "tranche_id": record["tranche_id"],
        "run_id": record["run_id"],
        "measurement_context": record["measurement_context"],
        "locale_at_start": record["locale_at_start"],
        "submitted_at": record["submitted_at"],
        "responses_scored": 10,
        "rerank_ready": True,
        "response_class_counts": dict(sorted(class_counts.items())),
        "candidate_summary": candidate_summary,
        "tentative_priority_order": ranked,
        "module_summary": {
            module_id: {
                "observed_error_rate": round(row["errors"] / row["exposure"], 4),
                "exposures": row["exposure"],
                "items": row["items"],
            }
            for module_id, row in modules.items()
        },
        "misconception_evidence": dict(misconceptions),
        "notes": [
            "posterior estimates are prioritisation aids, not true EV loss",
            "TENTATIVE estimates require explicit changed-node and delayed evidence",
            "MIXED_EXPOSURE_INVALID_FOR_BASELINE cannot be interpreted as a cold baseline",
            "untested candidates remain UNMEASURED",
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
