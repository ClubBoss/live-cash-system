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

test("LCM-01 claim records are stable, scoped and cannot admit unresolved evidence", async () => {
  const schema = JSON.parse(await text("content/claims/claim.schema.json"));
  const claims = JSON.parse(await text("content/claims/lcm-01.claims.json"));
  const ids = new Set();

  assert.equal(claims.length, 4);
  for (const claim of claims) {
    for (const field of schema.required) assert.notEqual(claim[field], undefined, `${claim.claim_id ?? "unknown"} misses ${field}`);
    assert.match(claim.claim_id, /^LCM-01-CL-\d{3}$/);
    assert.equal(claim.module_id, "geometry");
    assert.equal(ids.has(claim.claim_id), false, `Duplicate claim ID: ${claim.claim_id}`);
    ids.add(claim.claim_id);
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

test("module gold remains an explicit human admission decision", async () => {
  const checklist = await text("content/MODULE_GOLD_CHECKLIST.md");
  const conformance = await text("content/LCM-01_CONFORMANCE.md");
  const manifest = JSON.parse(await text("content/i18n/editorial-manifest.json"));

  assert.match(checklist, /No script may fill `Decision: MODULE_GOLD`/);
  assert.match(conformance, /Decision: `MODULE_GOLD_REVALIDATED`/);
  assert.match(conformance, /Exact depth\/SPR\/straddle strategic thresholds remain open/);
  assert.equal(Object.keys(manifest.modules).length, 11);
  assert.deepEqual(manifest.modules.geometry, {
    ru: "APPROVED",
    en: "APPROVED",
    note: "LCM-01 is the manually curated bilingual gold module with stable drill and card IDs.",
  });
  for (const [moduleId, localeStatus] of Object.entries(manifest.modules)) {
    if (moduleId === "geometry") continue;
    assert.equal(localeStatus.ru, "PENDING");
    assert.equal(localeStatus.en, "PENDING");
  }
});
