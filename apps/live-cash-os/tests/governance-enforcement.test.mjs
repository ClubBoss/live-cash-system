import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  corpusFingerprint,
  validateClaimAdmission,
  validateManifest,
  validateSourceLockState,
} from "../scripts/governance-contract.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const openGapIds = new Set(["GAP-X"]);
const digestA = "a".repeat(64);
const digestB = "b".repeat(64);

function claim(overrides = {}) {
  return {
    claim_id: "LCM-99-CL-001",
    claim_type: "HEURISTIC",
    confidence: "HIGH",
    status: "ADMITTED",
    ...overrides,
  };
}

function humanEvidence(fingerprint, overrides = {}) {
  return {
    reviewer_kind: "HUMAN",
    reviewer: "reviewer-a",
    reviewed_at: "2026-08-07",
    corpus_fingerprint: fingerprint,
    ...overrides,
  };
}

function repairManifest(overrides = {}) {
  const sourceBlobs = { "content/example.ts": "0123456789abcdef0123456789abcdef01234567" };
  return {
    schema_version: 5,
    status: "TRANSITIONAL_REVIEW_REQUIRED",
    strategy_status: "CURRICULUM_STRATEGY_REPAIR_REQUIRED",
    strategy_repair_scope: ["geometry"],
    drill_content_status: "DRILLS_REPAIR_REQUIRED",
    drill_repair_scope: ["geometry"],
    language_repair_owner: "W4R",
    review_policy: "Deterministic checks can reject work but can never create an approval.",
    strategy_approval: null,
    drill_approval: null,
    source_blobs: sourceBlobs,
    repair_source_paths: {
      strategy: ["content/example.ts"],
      drills: ["content/example.ts"],
      language: [],
    },
    final_composition: {
      status: "STALE_REVIEW_REQUIRED",
      current_digest: null,
      approved_digest: null,
    },
    human_approvals: {},
    modules: { geometry: { ru: "REVIEW_REQUIRED", en: "REVIEW_REQUIRED", note: "fixture" } },
    ...overrides,
  };
}

function goldManifest() {
  const manifest = repairManifest();
  const fingerprint = corpusFingerprint(manifest.source_blobs);
  manifest.status = "FULLY_ACCEPTED";
  manifest.strategy_status = "CURRICULUM_STRATEGY_GOLD";
  manifest.strategy_repair_scope = [];
  manifest.strategy_approval = humanEvidence(fingerprint);
  manifest.drill_content_status = "DRILLS_APPROVED";
  manifest.drill_repair_scope = [];
  manifest.drill_approval = humanEvidence(fingerprint, { reviewer: "reviewer-b" });
  manifest.final_composition = { status: "CURRENT", current_digest: digestA, approved_digest: digestA };
  manifest.modules.geometry = { ru: "APPROVED", en: "APPROVED", note: "fixture" };
  manifest.human_approvals = {
    "geometry.ru": humanEvidence(fingerprint, { reviewer: "reviewer-ru", final_composition_digest: digestA }),
    "geometry.en": humanEvidence(fingerprint, { reviewer: "reviewer-en", final_composition_digest: digestA }),
  };
  return manifest;
}

const repairLedger = "CURRICULUM_STRATEGY_REPAIR_REQUIRED / LANGUAGE_REPAIR_REQUIRED";
const goldLedger = "CURRICULUM_STRATEGY_GOLD";

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

test("GOLD -> REPAIR_REQUIRED is a valid governance transition", () => {
  const approved = goldManifest();
  assert.doesNotThrow(() => validateManifest(approved, goldLedger));

  const reopened = repairManifest();
  assert.doesNotThrow(() => validateManifest(reopened, repairLedger));
  assert.equal(reopened.strategy_approval, null);
  assert.equal(reopened.drill_approval, null);
});

test("semantic or hash mutation invalidates old approval evidence", () => {
  const approved = goldManifest();
  const oldFingerprint = corpusFingerprint(approved.source_blobs);
  assert.equal(approved.strategy_approval.corpus_fingerprint, oldFingerprint);

  approved.source_blobs["content/example.ts"] = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
  assert.throws(() => validateManifest(approved, goldLedger), /approved corpus fingerprint is stale/);
});

test("REPAIR_REQUIRED candidate governance accepts only explicitly scoped stale locks", () => {
  const manifest = repairManifest();
  const actual = { "content/example.ts": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" };
  assert.doesNotThrow(() => validateManifest(manifest, repairLedger));
  const result = validateSourceLockState(manifest, actual);
  assert.deepEqual(result.stalePaths, ["content/example.ts"]);

  manifest.repair_source_paths.strategy = [];
  manifest.repair_source_paths.drills = [];
  assert.throws(() => validateSourceLockState(manifest, actual), /outside an explicit repair scope/);
});

test("release/full-approval gate rejects REPAIR_REQUIRED and REVIEW_PENDING", () => {
  assert.throws(
    () => validateManifest(repairManifest(), repairLedger, { requireRelease: true }),
    /requires FULLY_ACCEPTED|rejects unresolved repair/,
  );

  const pending = repairManifest({
    strategy_status: "CURRICULUM_STRATEGY_REVIEW_PENDING",
    drill_content_status: "DRILLS_REVIEW_PENDING",
  });
  assert.doesNotThrow(() => validateManifest(pending, repairLedger));
  assert.throws(() => validateManifest(pending, repairLedger, { requireRelease: true }), /requires FULLY_ACCEPTED|unresolved repair/);
});

test("REVIEW_PENDING -> APPROVED cannot be satisfied by deterministic reviewer evidence", () => {
  const pending = repairManifest({ strategy_status: "CURRICULUM_STRATEGY_REVIEW_PENDING" });
  assert.doesNotThrow(() => validateManifest(pending, repairLedger));

  const fingerprint = corpusFingerprint(pending.source_blobs);
  pending.strategy_status = "CURRICULUM_STRATEGY_GOLD";
  pending.strategy_repair_scope = [];
  pending.strategy_approval = {
    reviewer_kind: "AUTOMATED",
    reviewer: "governance-check",
    reviewed_at: "2026-08-07",
    corpus_fingerprint: fingerprint,
  };
  assert.throws(() => validateManifest(pending, "LANGUAGE_REPAIR_REQUIRED"), /approval is human-only/);
});

test("refreshing hashes cannot carry old APPROVED evidence forward", () => {
  const approved = goldManifest();
  const oldFingerprint = corpusFingerprint(approved.source_blobs);
  approved.source_blobs["content/example.ts"] = "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
  assert.notEqual(corpusFingerprint(approved.source_blobs), oldFingerprint);
  assert.throws(() => validateManifest(approved, goldLedger), /approved corpus fingerprint is stale/);
});

test("FULLY_ACCEPTED rejects stale final learner-facing composition digest", () => {
  const approved = goldManifest();
  approved.final_composition.approved_digest = digestB;
  assert.throws(() => validateManifest(approved, goldLedger), /final composition digest is stale/);
});

test("FULLY_ACCEPTED cannot coexist with strategy repair truth", () => {
  const contradictory = repairManifest({ status: "FULLY_ACCEPTED" });
  assert.throws(() => validateManifest(contradictory, repairLedger), /cannot contradict an upper repair state|FULLY_ACCEPTED/);
});

test("APPROVED locale remains human-only and final-composition-bound", () => {
  const approved = goldManifest();
  approved.human_approvals["geometry.ru"].reviewer_kind = "AUTOMATED";
  assert.throws(() => validateManifest(approved, goldLedger), /approval is human-only/);

  approved.human_approvals["geometry.ru"].reviewer_kind = "HUMAN";
  approved.human_approvals["geometry.ru"].final_composition_digest = digestB;
  assert.throws(() => validateManifest(approved, goldLedger), /final composition digest is stale/);
});

test("governance and editorial scripts are rejection tools, not approval writers", async () => {
  const scriptsDir = path.join(root, "scripts");
  const scripts = (await readdir(scriptsDir)).filter((name) => name.endsWith(".mjs"));
  for (const name of scripts) {
    const source = await readFile(path.join(scriptsDir, name), "utf8");
    if (!/editorial-manifest\.json|MODULE_GOLD|RU_APPROVED|EN_APPROVED|DRILLS_APPROVED|CURRICULUM_STRATEGY_GOLD/u.test(source)) continue;
    assert.doesNotMatch(source, /\b(?:writeFile|appendFile|rename|copyFile|truncate|unlink)\s*\(/u, `${name} can write approval truth`);
  }
});
