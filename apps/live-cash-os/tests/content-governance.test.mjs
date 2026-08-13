import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repositoryRoot = path.resolve(root, "../..");

async function text(relativePath) {
  return readFile(path.join(root, relativePath), "utf8");
}

async function repoText(relativePath) {
  return readFile(path.join(repositoryRoot, relativePath), "utf8");
}

test("content authority points to canonical source families without stale Carrot continuity claims", async () => {
  const authority = await text("content/CONTENT_AUTHORITY.md");
  const sourceReadme = await repoText("sources/README.md");

  for (const required of [
    "sources/source-registry.md",
    "sources/carrot-poker/source-registry.md",
    "sources/carrot-poker/source-gap-ledger.md",
    "sources/ftgu/source-registry.md",
    "content/claims/claim.schema.json",
    "content/claims/source-gap-dependencies.json",
    "content/MODULE_GOLD_CHECKLIST.md",
  ]) {
    assert.match(authority, new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  assert.doesNotMatch(authority, /final Lecture 10 pending/i);
  assert.match(sourceReadme, /CP-G3-L01` through `CP-G3-L10/);
  assert.match(sourceReadme, /SOURCE_CONTINUITY_COMPLETE/);
  assert.doesNotMatch(sourceReadme, /Final Lecture 10:\s+pending/i);
});

test("claim schema carries the minimum strategic admission contract", async () => {
  const schema = JSON.parse(await text("content/claims/claim.schema.json"));
  const required = new Set(schema.required);

  for (const field of [
    "claim_id",
    "module_id",
    "claim",
    "source_refs",
    "interpretation",
    "claim_type",
    "confidence",
    "assumptions",
    "exceptions",
    "target_games",
    "depth_scope",
    "conflicts",
    "status",
  ]) {
    assert.equal(required.has(field), true, `Missing required claim field: ${field}`);
  }

  assert.deepEqual(schema.properties.claim_type.enum, ["BASELINE", "HEURISTIC", "EXPLOIT", "SIMPLIFICATION", "OPEN_QUESTION"]);
  assert.deepEqual(schema.properties.confidence.enum, ["HIGH", "MEDIUM", "LOW", "UNRESOLVED"]);
});

test("admitted claim records stay scoped and cannot admit unresolved evidence", async () => {
  const schema = JSON.parse(await text("content/claims/claim.schema.json"));
  const files = [
    ["lcm-01.claims.json", "geometry", /^LCM-01-CL-\d{3}$/],
    ["lcm-02.claims.json", "preflop", /^LCM-02-CL-\d{3}$/],
    ["lcm-03.claims.json", "blinds", /^LCM-03-CL-\d{3}$/],
    ["lcm-06.claims.json", "aggression", /^LCM-06-CL-\d{3}$/],
  ];
  const globalIds = new Set();

  for (const [file, moduleId, pattern] of files) {
    const claims = JSON.parse(await text(`content/claims/${file}`));
    assert.equal(claims.length, 4, `${file}: expected four reviewed claims`);
    for (const claim of claims) {
      for (const field of schema.required) assert.notEqual(claim[field], undefined, `${claim.claim_id ?? "unknown"} misses ${field}`);
      assert.match(claim.claim_id, pattern);
      assert.equal(claim.module_id, moduleId);
      assert.equal(globalIds.has(claim.claim_id), false, `Duplicate claim ID: ${claim.claim_id}`);
      globalIds.add(claim.claim_id);
      assert.ok(claim.source_refs.length > 0);
      assert.ok(claim.assumptions.length > 0);
      assert.ok(claim.target_games.length > 0);
      assert.ok(claim.depth_scope.length > 0);
      if (["LOW", "UNRESOLVED"].includes(claim.confidence)) {
        assert.notEqual(claim.status, "ADMITTED");
        assert.notEqual(claim.status, "FIELD_VALIDATED");
      }
      if (claim.claim_type === "OPEN_QUESTION") {
        assert.ok(["RESEARCH_NOTE", "CANDIDATE", "BLOCKED_SOURCE_GAP", "REJECTED_OR_SUPERSEDED"].includes(claim.status));
      }
    }
  }
});

test("glossary defines priority terms and explicitly rejects hybrid learner jargon", async () => {
  const glossary = await text("content/POKER_GLOSSARY_RU_EN.md");

  for (const term of [
    "effective stack",
    "SPR",
    "range",
    "equity realisation",
    "squeeze",
    "blocker",
    "equity denial",
    "linear range",
    "polar range",
    "closing the action",
    "multiway",
    "straddle",
    "cold-call",
    "delayed review",
    "field evidence",
  ]) {
    assert.match(glossary.toLowerCase(), new RegExp(term.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  for (const prohibited of ["Players-behind gate", "Value squeeze core", "node signature", "credible bluff supply"]) {
    assert.match(glossary, new RegExp(prohibited.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.match(glossary, /not approval tools/i);
});

test("governance truth represents the materialized W1-W5 candidate without claiming release approval", async () => {
  const checklist = await text("content/MODULE_GOLD_CHECKLIST.md");
  const lcm01Conformance = await text("content/LCM-01_CONFORMANCE.md");
  const wave4Conformance = await text("content/WAVE_4_FULL_CURRICULUM_CONFORMANCE.md");
  const acceptanceLedger = await text("ACCEPTANCE_LEDGER.md");
  const manifest = JSON.parse(await text("content/i18n/editorial-manifest.json"));
  const expectedModules = ["geometry", "preflop", "blinds", "filtering", "shape", "aggression", "ancestry", "multiway", "river", "evidence", "transfer"];

  assert.match(checklist, /No script may fill `Decision: MODULE_GOLD`/);
  assert.match(checklist, /DRILLS_REPAIR_REQUIRED/);
  assert.match(checklist, /check:approval/);
  assert.match(lcm01Conformance, /Decision: `MODULE_GOLD_REVALIDATED`/);
  assert.match(lcm01Conformance, /Exact depth\/SPR\/straddle strategic thresholds remain open/);
  assert.match(wave4Conformance, /MODULE_GOLD \/ TECHNICAL_GATE_GREEN \/ WAVE_4_ACCEPTED/);
  assert.match(wave4Conformance, /5a6af4ed4f8d8e5e985950c71cbc6c6ba40efe86/);
  assert.match(wave4Conformance, /31164756544/);

  assert.match(acceptanceLedger, /CURRICULUM_STRATEGY_REVIEW_PENDING/);
  assert.match(acceptanceLedger, /DRILLS_REVIEW_PENDING/);
  assert.match(acceptanceLedger, /WAVE_1_IMPLEMENTATION_ACCEPTED \/ COMPREHENSION_EVIDENCE_PENDING/);
  assert.match(acceptanceLedger, /WAVE_5_IMPLEMENTATION_CLOSED_WITH_ACCEPTED_P2_DEBT/);
  assert.doesNotMatch(acceptanceLedger, /^Status:.*LANGUAGE_REPAIR_REQUIRED/mu);

  assert.equal(manifest.schema_version, 5);
  assert.equal(manifest.status, "TRANSITIONAL_REVIEW_REQUIRED");
  assert.equal(manifest.strategy_status, "CURRICULUM_STRATEGY_REVIEW_PENDING");
  assert.deepEqual(manifest.strategy_repair_scope, ["preflop", "blinds", "aggression"]);
  assert.equal(manifest.strategy_approval, null);
  assert.equal(manifest.drill_content_status, "DRILLS_REVIEW_PENDING");
  assert.deepEqual(manifest.drill_repair_scope, expectedModules);
  assert.equal(manifest.drill_approval, null);
  assert.equal(manifest.final_composition.status, "REVIEW_PENDING");
  assert.match(manifest.final_composition.current_digest, /^[a-f0-9]{64}$/u);
  assert.equal(manifest.final_composition.approved_digest, null);
  assert.equal(manifest.language_repair_owner, "W4R");
  assert.deepEqual(manifest.human_approvals, {});
  assert.match(manifest.review_policy, /can never create an approval/i);
  assert.deepEqual(Object.keys(manifest.modules), expectedModules);
  assert.deepEqual(manifest.repair_source_paths.strategy, [
    "content/claims/lcm-02.claims.json",
    "content/claims/lcm-03.claims.json",
    "content/claims/lcm-06.claims.json",
  ]);
  assert.deepEqual(manifest.repair_source_paths.drills, [
    "content/i18n/wave3-priority-gold.ts",
    "content/i18n/decision-transfer-integrity.ts",
    "content/i18n/decision-option-balance.ts",
    "content/i18n/final-learning-integrity.ts",
  ]);
  for (const sourcePath of [
    "content/i18n/decision-transfer-integrity.ts",
    "content/i18n/decision-option-balance.ts",
    "content/i18n/final-learning-integrity.ts",
  ]) {
    assert.ok(manifest.repair_source_paths.language.includes(sourcePath));
    assert.ok(manifest.source_blobs[sourcePath]);
  }

  for (const moduleId of expectedModules) {
    const localeStatus = manifest.modules[moduleId];
    assert.equal(localeStatus.ru, "REVIEW_REQUIRED", `${moduleId}: RU human review must remain open`);
    assert.equal(localeStatus.en, "REVIEW_REQUIRED", `${moduleId}: EN human review must remain open`);
    assert.equal(typeof localeStatus.note, "string", `${moduleId}: approval boundary note is required`);
    assert.ok(localeStatus.note.trim().length > 0, `${moduleId}: approval boundary note must not be empty`);
  }
});
