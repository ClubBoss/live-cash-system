import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import ts from "typescript";

async function loadTs(relativePath) {
  const source = await readFile(new URL(`../${relativePath}`, import.meta.url), "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
      importsNotUsedAsValues: ts.ImportsNotUsedAsValues.Remove,
    },
  }).outputText;
  const directory = await mkdtemp(join(tmpdir(), "live-cash-os-test-wave7-"));
  const output = join(directory, `${relativePath.replaceAll("/", "-").replace(/\.ts$/u, "")}.mjs`);
  await writeFile(output, compiled, "utf8");
  return import(`${new URL(`file://${output}`).href}?${Date.now()}-${Math.random()}`);
}

const wave7Promise = loadTs("lib/wave7.ts");
const modelPromise = loadTs("lib/model-core.ts");
const parserPromise = loadTs("lib/diagnostic-import.ts");

function hand(overrides = {}) {
  return {
    moduleId: "geometry",
    stakes: "2/5",
    heroPosition: "BB",
    villainPositions: "BTN",
    effectiveStacks: "150bb",
    straddle: "no straddle",
    actionSequence: "BTN opens 3bb, BB calls; flop checks to BTN",
    board: "Qh 7d 4c",
    sizings: "flop 25%",
    cue: "BTN is betting very wide for a small size",
    action: "Call",
    reason: "Keep weaker hands in and protect the calling range before changing the node.",
    confidence: 72,
    populationRead: "Small flop c-bets are common",
    populationReadConfidence: 55,
    ...overrides,
  };
}

const canonicalBinding = () => ({
  practicalSkillId: "EXP-01",
  signals: { evidenceGeneralizationIssue: true },
});

function validScore() {
  return {
    schema_version: "score-0.2",
    scorer_version: "0.2.1",
    learner_id: "current_learner",
    tranche_id: "T1",
    run_id: "t1-wave7-test",
    measurement_context: "COLD_BASELINE",
    locale_at_start: "ru",
    submitted_at: "2026-08-07T10:00:00.000Z",
    responses_scored: 10,
    rerank_ready: true,
    module_summary: Object.fromEntries(Array.from({ length: 10 }, (_, index) => [
      `LCM-${String(index + 1).padStart(2, "0")}`,
      { observed_error_rate: index === 1 ? 0.9 : 0.1, exposures: 1, items: [`LD-${String(index + 1).padStart(3, "0")}`] },
    ])),
    misconception_evidence: {},
    tentative_priority_order: ["H-WAVE7"],
  };
}

async function capturedHand(overrides = {}) {
  const wave7 = await wave7Promise;
  const model = await modelPromise;
  return wave7.captureFieldHand(model.emptyLearnerState(), hand(overrides));
}

test("reviewed T1 priority is routing only and creates no learning evidence", async () => {
  const wave7 = await wave7Promise;
  const model = await modelPromise;
  const state = model.emptyLearnerState();
  const before = structuredClone(state.modules.preflop);
  const next = wave7.applyReviewedDiagnostic(state, ["preflop"], {
    reviewerKind: "HUMAN",
    reviewedAt: "2026-08-07T11:00:00.000Z",
    itemReviews: Array.from({ length: 10 }, (_, index) => ({ itemId: `LD-${String(index + 1).padStart(3, "0")}`, responseClass: index === 0 ? "U" : "A" })),
  });
  assert.deepEqual(next.modules.preflop.evidence, before.evidence);
  assert.equal(next.modules.preflop.state, before.state);
  assert.equal(next.modules.preflop.highConfidenceError, false);
  assert.deepEqual(next.diagnostic.priorityModules, ["preflop"]);
});

test("explain-back persists without creating mastery evidence", async () => {
  const wave7 = await wave7Promise;
  const model = await modelPromise;
  const state = model.emptyLearnerState();
  state.activeSession = {
    mode: "lesson",
    moduleId: "geometry",
    step: 7,
    drillIds: ["geo-01"],
    currentIndex: 0,
    selectedActionId: null,
    selectedReasonId: null,
    confidence: 65,
    startedAt: "2026-08-07T10:00:00.000Z",
    itemStartedAt: "2026-08-07T10:00:00.000Z",
    explainBack: "draft",
    sourceReviewId: undefined,
  };
  const next = wave7.saveExplainBack(state, "geometry", "geometry.explainBack", "I first identify the effective stack and the forced-bet unit, then use that geometry for the decision tree.");
  assert.equal(wave7.explainBackRecords(next, "geometry").length, 1);
  assert.equal(wave7.explainBackRecords(next, "geometry")[0].status, "PENDING_REVIEW");
  assert.deepEqual(next.modules.geometry.evidence, state.modules.geometry.evidence);
  assert.equal(next.modules.geometry.state, "UNEXPOSED");
  assert.equal(next.activeSession.sourceReviewId, undefined);
});

test("reviewed explain-back repair enters the existing W6 repair queue", async () => {
  const wave7 = await wave7Promise;
  const model = await modelPromise;
  const saved = wave7.saveExplainBack(model.emptyLearnerState(), "blinds", "blinds.explainBack", "I need to separate the posted blind price from realisation and the action still behind me before choosing the defence.");
  const record = wave7.explainBackRecords(saved)[0];
  const reviewed = wave7.reviewExplainBack(saved, record.id, "REVIEWED_REPAIR", "The explanation misses the closing-action branch.");
  const repair = reviewed.reviewQueue.find((item) => item.sourceDrillId === `explain:${record.id}`);
  assert.ok(repair);
  assert.equal(repair.kind, "repair");
  assert.equal(repair.moduleId, "blinds");
  assert.equal(reviewed.modules.blinds.evidence.retention.exposures, 0);
});

test("real-hand required fields are deterministic; SELF insufficient stays open and HUMAN insufficient can close", async () => {
  const wave7 = await wave7Promise;
  const model = await modelPromise;
  assert.deepEqual(wave7.validateFieldHandInput(hand()), []);
  assert.ok(wave7.validateFieldHandInput(hand({ stakes: "", confidence: 101 })).includes("stakes"));
  assert.ok(wave7.validateFieldHandInput(hand({ stakes: "", confidence: 101 })).includes("confidence"));
  const captured = wave7.captureFieldHand(model.emptyLearnerState(), hand());
  const note = captured.fieldNotes[0];
  const selfReviewed = wave7.reviewFieldHand(captured, note.id, "INSUFFICIENT", "My own review cannot establish the missing action timing.", "SELF");
  assert.equal(selfReviewed.fieldNotes[0].status, "PENDING_REVIEW");
  assert.equal(selfReviewed.fieldNotes[0].reviewOutcome, "INSUFFICIENT");
  assert.equal(selfReviewed.fieldNotes[0].reviewerKind, "SELF");
  assert.equal(selfReviewed.modules.geometry.evidence.field_transfer.exposures, 0);

  const humanReviewed = wave7.reviewFieldHand(selfReviewed, note.id, "INSUFFICIENT", "Villain position and action timing are not reliable enough to review the decision.", "HUMAN");
  assert.equal(humanReviewed.fieldNotes[0].status, "INSUFFICIENT");
  assert.equal(humanReviewed.fieldNotes[0].reviewOutcome, "INSUFFICIENT");
  assert.equal(humanReviewed.fieldNotes[0].reviewerKind, "HUMAN");
  assert.equal(humanReviewed.modules.geometry.evidence.field_transfer.exposures, 0);
});

test("result addition cannot rewrite the pre-result decision snapshot", async () => {
  const wave7 = await wave7Promise;
  const captured = await capturedHand();
  const note = captured.fieldNotes[0];
  const locked = {
    reason: note.reason,
    cue: note.cue,
    action: note.action,
    decisionLockedAt: note.decisionLockedAt,
  };
  const next = wave7.addFieldResult(captured, note.id, "Villain showed AQ and won", "AQ");
  assert.deepEqual({
    reason: next.fieldNotes[0].reason,
    cue: next.fieldNotes[0].cue,
    action: next.fieldNotes[0].action,
    decisionLockedAt: next.fieldNotes[0].decisionLockedAt,
  }, locked);
  assert.equal(next.fieldNotes[0].result, "Villain showed AQ and won");
  assert.equal(next.fieldNotes[0].showdown, "AQ");
});

test("self-review cannot create field-transfer evidence", async () => {
  const wave7 = await wave7Promise;
  const captured = await capturedHand();
  const note = captured.fieldNotes[0];
  const reviewed = wave7.reviewFieldHand(captured, note.id, "SUPPORTS_TRANSFER", "My own review thinks this matches the mechanism.", "SELF");
  assert.equal(reviewed, captured);
  assert.equal(reviewed.fieldNotes[0].status, "PENDING_REVIEW");
  assert.equal(reviewed.fieldNotes[0].reviewerKind, undefined);
  assert.equal(reviewed.fieldNotes[0].reviewOutcome, undefined);
  assert.equal(reviewed.modules.geometry.evidence.field_transfer.exposures, 0);
  assert.equal(reviewed.modules.geometry.evidence.field_transfer.successes, 0);
  assert.notEqual(reviewed.modules.geometry.state, "FIELD_VALIDATED");
});

test("one canonical human support cannot create legacy FIELD_VALIDATED", async () => {
  const wave7 = await wave7Promise;
  const captured = await capturedHand();
  assert.equal(captured.modules.geometry.evidence.field_transfer.exposures, 0);
  const note = captured.fieldNotes[0];
  const reviewed = wave7.reviewFieldHand(captured, note.id, "SUPPORTS_TRANSFER", "The cue and reason match the reviewed mechanism.", "HUMAN", canonicalBinding());
  assert.equal(reviewed.fieldNotes[0].reviewerKind, "HUMAN");
  assert.equal(reviewed.fieldNotes[0].practicalBinding?.practicalSkillId, "EXP-01");
  assert.equal(reviewed.modules.geometry.evidence.field_transfer.successes, 0);
  assert.notEqual(reviewed.modules.geometry.state, "FIELD_VALIDATED");
});

test("two canonical human supports cannot mutate legacy module evidence", async () => {
  const wave7 = await wave7Promise;
  const model = await modelPromise;
  let state = model.emptyLearnerState();
  state.modules.geometry.contentCompleted = true;
  state = wave7.captureFieldHand(state, hand({ cue: "cue one" }));
  state = wave7.reviewFieldHand(state, state.fieldNotes[0].id, "SUPPORTS_TRANSFER", "First independent reviewed hand.", "HUMAN", canonicalBinding());
  state = wave7.captureFieldHand(state, hand({ cue: "cue two", actionSequence: "BTN opens, BB calls; different hand" }));
  state = wave7.reviewFieldHand(state, state.fieldNotes[1].id, "SUPPORTS_TRANSFER", "Second independent reviewed hand.", "HUMAN_ASSISTED", canonicalBinding());
  assert.equal(state.modules.geometry.evidence.field_transfer.successes, 0);
  assert.notEqual(state.modules.geometry.state, "FIELD_VALIDATED");
  assert.equal(state.modules.geometry.evidence.retention.successes, 0);
  assert.equal(state.modules.geometry.evidence.variant_transfer.successes, 0);
});

test("canonical field reviews cannot promote legacy FIELD_VALIDATED even with old retention and variant evidence", async () => {
  const wave7 = await wave7Promise;
  const model = await modelPromise;
  let state = model.emptyLearnerState();
  state.modules.geometry.contentCompleted = true;
  state.modules.geometry.evidence.retention = { exposures: 1, successes: 1, distinctNodes: ["retained-node"], lastAt: "2026-08-07T09:00:00.000Z" };
  state.modules.geometry.evidence.variant_transfer = { exposures: 1, successes: 1, distinctNodes: ["changed-node:MEDIUM"], lastAt: "2026-08-07T09:00:00.000Z" };
  state = wave7.captureFieldHand(state, hand({ cue: "first support" }));
  state = wave7.reviewFieldHand(state, state.fieldNotes[0].id, "SUPPORTS_TRANSFER", "First reviewed transfer hand.", "HUMAN", canonicalBinding());
  state = wave7.captureFieldHand(state, hand({ cue: "second support", board: "8s 7s 6d" }));
  state = wave7.reviewFieldHand(state, state.fieldNotes[1].id, "SUPPORTS_TRANSFER", "Second reviewed transfer hand.", "HUMAN_ASSISTED", canonicalBinding());
  assert.equal(state.modules.geometry.evidence.field_transfer.successes, 0);
  assert.notEqual(state.modules.geometry.state, "FIELD_VALIDATED");
});

test("canonical field repair never enters the legacy W6 repair queue", async () => {
  const wave7 = await wave7Promise;
  let state = await capturedHand();
  const note = state.fieldNotes[0];
  const beforeQueue = structuredClone(state.reviewQueue);
  state = wave7.reviewFieldHand(
    state,
    note.id,
    "REPAIR_REQUIRED",
    "The action was plausible, but the stated reason ignores the reviewed mechanism.",
    "HUMAN",
    canonicalBinding(),
  );
  assert.deepEqual(state.reviewQueue, beforeQueue);
  assert.equal(state.fieldNotes[0].status, "REVIEWED_REPAIR");
  assert.equal(state.fieldNotes[0].practicalBinding?.practicalSkillId, "EXP-01");
  assert.equal(state.modules.geometry.evidence.field_transfer.successes, 0);
});

test("activeSession and old schema-2 progress survive Wave 7 optional data", async () => {
  const wave7 = await wave7Promise;
  const model = await modelPromise;
  const state = model.emptyLearnerState();
  state.modules.geometry.contentCompleted = true;
  state.activeSession = {
    mode: "practice",
    moduleId: "geometry",
    step: 0,
    drillIds: ["geo-01"],
    currentIndex: 0,
    selectedActionId: "geo-01-a1",
    selectedReasonId: null,
    confidence: 65,
    startedAt: "2026-08-07T10:00:00.000Z",
    itemStartedAt: "2026-08-07T10:00:00.000Z",
    explainBack: "",
    sourceReviewId: "review-source",
  };
  const next = wave7.saveExplainBack(state, "geometry", "geometry.explainBack", "A saved explanation should coexist with the exact resumable W6 active-session identity without changing it.");
  const migrated = model.migrateLearnerState(next);
  assert.equal(migrated.modules.geometry.contentCompleted, true);
  assert.equal(migrated.activeSession.selectedActionId, "geo-01-a1");
  assert.equal(migrated.activeSession.sourceReviewId, "review-source");
  assert.equal(wave7.explainBackRecords(migrated).length, 1);
});

test("Wave 7 Real Hands does not introduce a shadow learner store", async () => {
  const source = await readFile(new URL("../lib/wave7.ts", import.meta.url), "utf8");
  assert.doesNotMatch(source, /localStorage|sessionStorage|indexedDB|fetch\(/u);
});

test("reviewed T1 accepts A/B/C/D/U and rejects legacy E as semantic review class", async () => {
  const parser = await parserPromise;
  const score = validScore();
  score.reviewer_kind = "human-assisted";
  score.reviewed_at = "2026-08-07T11:00:00.000Z";
  score.item_reviews = Array.from({ length: 10 }, (_, index) => ({
    item_id: `LD-${String(index + 1).padStart(3, "0")}`,
    response_class: ["A", "B", "C", "D", "U"][index % 5],
    reviewer_note: "Reviewed semantically outside the deterministic importer.",
  }));
  assert.equal(parser.parseDiagnosticScore(score).item_reviews[4].response_class, "U");
  const invalid = structuredClone(score);
  invalid.item_reviews[0].response_class = "E";
  assert.throws(() => parser.parseDiagnosticScore(invalid), /Invalid reviewed response class/u);
});

test("stable curriculum counts and identities remain untouched", async () => {
  const source = await readFile(new URL("../content/modules.ts", import.meta.url), "utf8");
  assert.match(source, /export const modules/u);
  const model = await modelPromise;
  assert.equal(model.MODULE_IDS.length, 11);
  const wave7Source = await readFile(new URL("../lib/wave7.ts", import.meta.url), "utf8");
  assert.doesNotMatch(wave7Source, /correctActionId|correctReasonId|content\/claims/u);
});
