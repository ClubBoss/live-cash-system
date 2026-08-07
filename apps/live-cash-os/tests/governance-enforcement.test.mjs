import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  corpusFingerprint,
  validateClaimAdmission,
  validateManifest,
} from "../scripts/governance-contract.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const openGapIds = new Set(["GAP-X"]);

function claim(overrides = {}) {
  return {
    claim_id: "LCM-99-CL-001",
    claim_type: "HEURISTIC",
    confidence: "HIGH",
    status: "ADMITTED",
    ...overrides,
  };
}

function manifest(overrides = {}) {
  const sourceBlobs = { "content/example.ts": "0123456789abcdef0123456789abcdef01234567" };
  return {
    schema_version: 4,
    status: "TRANSITIONAL_LANGUAGE_REVIEW_REQUIRED",
    strategy_status: "CURRICULUM_STRATEGY_GOLD",
    language_repair_owner: "W4R",
    review_policy: "Deterministic checks can reject work but can never create an approval.",
    source_blobs: sourceBlobs,
    human_approvals: {},
    modules: { geometry: { ru: "REVIEW_REQUIRED", en: "REVIEW_REQUIRED", note: "fixture" } },
    ...overrides,
  };
}

test("LOW and UNRESOLVED claims cannot become admitted", () => {
  for (const confidence of ["LOW", "UNRESOLVED"]) {
    assert.throws(() => validateClaimAdmission(claim({ confidence }), [], openGapIds), /cannot be admitted/);
  }
});

test("OPEN_QUESTION cannot become prescription", () => {
  assert.throws(
    () => validateClaimAdmission(claim({ claim_type: "OPEN_QUESTION", status: "ADMITTED" }), [], openGapIds),
    /OPEN_QUESTION became learner prescription/,
  );
});

test("material unresolved source gap blocks a dependent claim", () => {
  assert.throws(
    () => validateClaimAdmission(claim(), [{ gap_id: "GAP-X", materiality: "MATERIAL_BLOCKING", rationale: "missing exact source evidence" }], openGapIds),
    /material unresolved source gap must block admission/,
  );
  assert.doesNotThrow(() => validateClaimAdmission(
    claim({ status: "BLOCKED_SOURCE_GAP" }),
    [{ gap_id: "GAP-X", materiality: "MATERIAL_BLOCKING", rationale: "missing exact source evidence" }],
    openGapIds,
  ));
});

test("scoped non-blocking source gap requires an explicit rationale", () => {
  assert.throws(
    () => validateClaimAdmission(claim(), [{ gap_id: "GAP-X", materiality: "NON_BLOCKING_SCOPED", rationale: "" }], openGapIds),
    /needs rationale/,
  );
  assert.doesNotThrow(() => validateClaimAdmission(
    claim(),
    [{ gap_id: "GAP-X", materiality: "NON_BLOCKING_SCOPED", rationale: "The admitted claim stops below the missing exact threshold." }],
    openGapIds,
  ));
});

test("upper acceptance ledger forces an explicit transitional manifest state", () => {
  const contradictory = manifest({
    status: "FULLY_ACCEPTED",
    modules: { geometry: { ru: "REVIEW_REQUIRED", en: "REVIEW_REQUIRED", note: "fixture" } },
  });
  assert.throws(() => validateManifest(contradictory, "LANGUAGE_REPAIR_REQUIRED"), /cannot contradict upper acceptance ledger|FULLY_ACCEPTED/);
  assert.doesNotThrow(() => validateManifest(manifest(), "LANGUAGE_REPAIR_REQUIRED"));
});

test("APPROVED is human-only and bound to the current corpus fingerprint", () => {
  const base = manifest({ status: "FULLY_ACCEPTED", language_repair_owner: undefined });
  base.modules.geometry = { ru: "APPROVED", en: "APPROVED", note: "fixture" };

  assert.throws(() => validateManifest(base, "CURRICULUM_STRATEGY_GOLD"), /requires explicit human evidence/);

  const fingerprint = corpusFingerprint(base.source_blobs);
  base.human_approvals = {
    "geometry.ru": { reviewer_kind: "AUTOMATED", reviewer: "script", reviewed_at: "2026-08-07", corpus_fingerprint: fingerprint },
    "geometry.en": { reviewer_kind: "HUMAN", reviewer: "reviewer-b", reviewed_at: "2026-08-07", corpus_fingerprint: fingerprint },
  };
  assert.throws(() => validateManifest(base, "CURRICULUM_STRATEGY_GOLD"), /approval is human-only/);

  base.human_approvals["geometry.ru"] = { reviewer_kind: "HUMAN", reviewer: "reviewer-a", reviewed_at: "2026-08-07", corpus_fingerprint: "stale" };
  assert.throws(() => validateManifest(base, "CURRICULUM_STRATEGY_GOLD"), /fingerprint is stale/);

  base.human_approvals["geometry.ru"].corpus_fingerprint = fingerprint;
  assert.doesNotThrow(() => validateManifest(base, "CURRICULUM_STRATEGY_GOLD"));
});

test("changing a locked approved claim or copy invalidates prior human review", () => {
  const sourceBlobs = { "content/example.ts": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" };
  const approved = manifest({
    status: "FULLY_ACCEPTED",
    language_repair_owner: undefined,
    source_blobs: sourceBlobs,
    modules: { geometry: { ru: "APPROVED", en: "APPROVED", note: "fixture" } },
  });
  const oldFingerprint = corpusFingerprint(sourceBlobs);
  approved.human_approvals = {
    "geometry.ru": { reviewer_kind: "HUMAN", reviewer: "reviewer-a", reviewed_at: "2026-08-07", corpus_fingerprint: oldFingerprint },
    "geometry.en": { reviewer_kind: "HUMAN", reviewer: "reviewer-b", reviewed_at: "2026-08-07", corpus_fingerprint: oldFingerprint },
  };
  assert.doesNotThrow(() => validateManifest(approved, "CURRICULUM_STRATEGY_GOLD"));

  approved.source_blobs["content/example.ts"] = "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
  assert.throws(() => validateManifest(approved, "CURRICULUM_STRATEGY_GOLD"), /fingerprint is stale/);
});

test("governance and editorial scripts are rejection tools, not approval writers", async () => {
  const scriptsDir = path.join(root, "scripts");
  const scripts = (await readdir(scriptsDir)).filter((name) => name.endsWith(".mjs"));
  for (const name of scripts) {
    const source = await readFile(path.join(scriptsDir, name), "utf8");
    if (!/editorial-manifest\.json|MODULE_GOLD|RU_APPROVED|EN_APPROVED/u.test(source)) continue;
    assert.doesNotMatch(source, /\b(?:writeFile|appendFile|rename|copyFile|truncate|unlink)\s*\(/u, `${name} can write approval truth`);
  }
});
