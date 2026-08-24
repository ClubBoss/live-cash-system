import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { practicalDecisions } from "../content/practical-mastery/index.ts";
import { emptyLearnerState, migrateLearnerState } from "../lib/model-core.ts";
import {
  practicalFieldMechanismKey,
  practicalRepairFocusHref,
  reconcilePracticalFieldTransfer,
  resolvePracticalFieldBinding,
} from "../lib/practical-field-transfer.ts";
import { createPracticalMasteryState } from "../lib/practical-mastery-core.ts";
import {
  createPracticalStudyWorkspace,
  practicalProfileFromLearnerState,
  withPracticalProfile,
} from "../lib/practical-profile-state.ts";
import {
  addFieldResult,
  applyReviewedDiagnostic,
  captureFieldHand,
  reviewFieldHand,
} from "../lib/wave7.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relative) => readFile(path.join(root, relative), "utf8");
const ui = await read("components/Wave7Experience.tsx");
const diagnosticUi = await read("components/DiagnosticExperience.tsx");
const adaptive = await read("lib/practical-adaptive-session.ts");
const integratedUi = await read("components/PracticalIntegratedSessionExperience.tsx");
const core = await read("lib/practical-mastery-core.ts");

const handInput = (moduleId = "preflop") => ({
  moduleId,
  stakes: "2/5",
  heroPosition: "BB",
  villainPositions: "BTN",
  effectiveStacks: "150bb",
  straddle: "none",
  actionSequence: "BTN opens 4bb, BB acts",
  board: "preflop",
  sizings: "4bb",
  cue: "large open",
  action: "call",
  reason: "price and closing action",
  confidence: 70,
});

const expBinding = (fieldHandId, reviewerKind = "HUMAN", signals = { evidenceGeneralizationIssue: true }) =>
  resolvePracticalFieldBinding(fieldHandId, reviewerKind, { practicalSkillId: "EXP-01", signals });

function transferNote(id, signals = { evidenceGeneralizationIssue: true }, outcome = "SUPPORTS_TRANSFER", reviewerKind = "HUMAN") {
  return {
    id,
    cueBeforeAction: true,
    decisionLockedAt: "2026-08-24T00:00:00.000Z",
    status: outcome === "REPAIR_REQUIRED" ? "REVIEWED_REPAIR" : "REVIEWED_VALID",
    reviewOutcome: outcome,
    reviewerKind,
    practicalBinding: expBinding(id, reviewerKind, signals) ?? undefined,
  };
}

function practicalState(delayed = false) {
  const state = createPracticalMasteryState(new Date("2026-08-20T00:00:00.000Z"));
  state.skills["EXP-01"].delayedRetrievalPassed = delayed;
  return state;
}

function learnerWithPractical(delayed = false) {
  const rootState = emptyLearnerState();
  return withPracticalProfile(rootState, {
    version: 1,
    mastery: practicalState(delayed),
    performance: [],
    studyWorkspace: createPracticalStudyWorkspace(),
  });
}

test("legacy module and free text never create a canonical Practical target", () => {
  const captured = captureFieldHand(emptyLearnerState(), handInput("preflop"));
  const note = captured.fieldNotes[0];
  assert.equal(note.practicalBinding, undefined);
  assert.equal(reviewFieldHand(captured, note.id, "REPAIR_REQUIRED", "human review", "HUMAN"), captured);
  assert.match(ui, /broad topic never selects a canonical Practical skill/i);
});

test("structured binding fails closed for one-to-many, invalid skill, invalid decision, and invalid signal shape", () => {
  assert.equal(resolvePracticalFieldBinding("h1", "HUMAN", { signals: { blindIssue: true } }), null);
  assert.equal(resolvePracticalFieldBinding("h1", "HUMAN", { practicalSkillId: "NOT-A-SKILL", signals: { blindIssue: true } }), null);
  assert.equal(resolvePracticalFieldBinding("h1", "HUMAN", { practicalSkillId: "PF-04", signals: { blindIssue: true }, decisionId: "missing-decision" }), null);
  assert.equal(resolvePracticalFieldBinding("h1", "HUMAN", { practicalSkillId: "PF-04", signals: { blindIssue: true, unknownSignal: true } }), null);
  const explicit = resolvePracticalFieldBinding("h1", "HUMAN", { practicalSkillId: "PF-04", signals: { blindIssue: true } });
  assert.equal(explicit?.practicalSkillId, "PF-04");

  const mismatched = practicalDecisions.find((decision) => decision.skillId !== "EXP-01");
  assert.ok(mismatched);
  assert.equal(resolvePracticalFieldBinding("h2", "HUMAN", {
    practicalSkillId: "EXP-01",
    signals: { evidenceGeneralizationIssue: true },
    decisionId: mismatched.id,
  }), null);
});

test("result and showdown cannot create or alter reviewed canonical binding", () => {
  let state = captureFieldHand(emptyLearnerState(), handInput("evidence"));
  const id = state.fieldNotes[0].id;
  state = reviewFieldHand(state, id, "REPAIR_REQUIRED", "scope over-generalized", "HUMAN", {
    practicalSkillId: "EXP-01",
    signals: { evidenceGeneralizationIssue: true },
  });
  const before = structuredClone(state.fieldNotes[0].practicalBinding);
  state = addFieldResult(state, id, "lost pot", "villain showed bluff");
  assert.deepEqual(state.fieldNotes[0].practicalBinding, before);
  assert.equal(practicalRepairFocusHref(state.fieldNotes[0]), "/mastery/session?focus=EXP-01");
});

test("human repair creates exact focused handoff without a second repair queue", () => {
  let state = captureFieldHand(emptyLearnerState(), handInput("evidence"));
  const id = state.fieldNotes[0].id;
  const beforeQueue = structuredClone(state.reviewQueue);
  state = reviewFieldHand(state, id, "REPAIR_REQUIRED", "reviewed causal error", "HUMAN_ASSISTED", {
    practicalSkillId: "EXP-01",
    signals: { evidenceGeneralizationIssue: true },
  });
  assert.deepEqual(state.reviewQueue, beforeQueue);
  assert.equal(state.fieldNotes[0].status, "REVIEWED_REPAIR");
  assert.equal(practicalRepairFocusHref(state.fieldNotes[0]), "/mastery/session?focus=EXP-01");
  assert.match(ui, /data-testid="real-hand-practical-repair"/);
});

test("SELF and non-transfer outcomes cannot award Practical real-hand transfer", () => {
  const base = practicalState(true);
  for (const notes of [
    [transferNote("a"), transferNote("b", { evidenceGeneralizationIssue: true }, "SUPPORTS_TRANSFER", "SELF")],
    [transferNote("a"), transferNote("b", { evidenceGeneralizationIssue: true }, "REVIEWED_OK")],
    [transferNote("a"), transferNote("b", { evidenceGeneralizationIssue: true }, "REPAIR_REQUIRED")],
    [transferNote("a"), { ...transferNote("b"), reviewOutcome: "INSUFFICIENT", status: "INSUFFICIENT" }],
  ]) {
    assert.equal(reconcilePracticalFieldTransfer(base, notes).skills["EXP-01"].realHandTransferReviewed, false);
  }
});

test("one hand, duplicate hand, and different mechanisms cannot combine", () => {
  const base = practicalState(true);
  assert.equal(reconcilePracticalFieldTransfer(base, [transferNote("a")]).skills["EXP-01"].realHandTransferReviewed, false);
  assert.equal(reconcilePracticalFieldTransfer(base, [transferNote("a"), transferNote("a")]).skills["EXP-01"].realHandTransferReviewed, false);
  const secondMechanism = { evidenceGeneralizationIssue: true, street: "preflop" };
  assert.notEqual(practicalFieldMechanismKey({ evidenceGeneralizationIssue: true }), practicalFieldMechanismKey(secondMechanism));
  assert.equal(reconcilePracticalFieldTransfer(base, [transferNote("a"), transferNote("b", secondMechanism)]).skills["EXP-01"].realHandTransferReviewed, false);
});

test("two matching field hands wait for delayed retrieval, then reconcile exactly once", () => {
  const notes = [transferNote("a"), transferNote("b")];
  const beforeDelay = reconcilePracticalFieldTransfer(practicalState(false), notes);
  assert.equal(beforeDelay.skills["EXP-01"].realHandTransferReviewed, false);
  const delayed = structuredClone(beforeDelay);
  delayed.skills["EXP-01"].delayedRetrievalPassed = true;
  const promoted = reconcilePracticalFieldTransfer(delayed, notes, new Date("2026-08-24T01:00:00.000Z"));
  assert.equal(promoted.skills["EXP-01"].realHandTransferReviewed, true);
  const revision = promoted.revision;
  const repeated = reconcilePracticalFieldTransfer(promoted, notes, new Date("2026-08-24T02:00:00.000Z"));
  assert.equal(repeated.revision, revision);
  assert.equal(repeated, promoted);
});

test("delayed-first then second qualifying human hand promotes exactly once through field review", () => {
  let state = learnerWithPractical(true);
  state = captureFieldHand(state, handInput("evidence"));
  const first = state.fieldNotes.at(-1).id;
  state = reviewFieldHand(state, first, "SUPPORTS_TRANSFER", "first independent review", "HUMAN", {
    practicalSkillId: "EXP-01",
    signals: { evidenceGeneralizationIssue: true },
  });
  assert.equal(practicalProfileFromLearnerState(state).mastery.skills["EXP-01"].realHandTransferReviewed, false);

  state = captureFieldHand(state, handInput("evidence"));
  const second = state.fieldNotes.at(-1).id;
  state = reviewFieldHand(state, second, "SUPPORTS_TRANSFER", "second independent review", "HUMAN_ASSISTED", {
    practicalSkillId: "EXP-01",
    signals: { evidenceGeneralizationIssue: true },
  });
  const promoted = practicalProfileFromLearnerState(state).mastery;
  assert.equal(promoted.skills["EXP-01"].realHandTransferReviewed, true);
  const revision = promoted.revision;
  const reconciled = reconcilePracticalFieldTransfer(promoted, state.fieldNotes);
  assert.equal(reconciled.revision, revision);
});

test("export/import round trip preserves reviewed semantic binding and remains idempotent", () => {
  let state = captureFieldHand(emptyLearnerState(), handInput("evidence"));
  const id = state.fieldNotes[0].id;
  state = reviewFieldHand(state, id, "REPAIR_REQUIRED", "reviewed", "HUMAN", {
    practicalSkillId: "EXP-01",
    signals: { evidenceGeneralizationIssue: true },
  });
  const restored = migrateLearnerState(JSON.parse(JSON.stringify(state)));
  const before = state.fieldNotes[0].practicalBinding;
  const after = restored.fieldNotes[0].practicalBinding;
  assert.equal(after?.fieldHandId, before?.fieldHandId);
  assert.equal(after?.reviewerKind, before?.reviewerKind);
  assert.equal(after?.practicalSkillId, before?.practicalSkillId);
  assert.deepEqual(after?.signals, before?.signals);
  assert.equal(after?.decisionId ?? null, before?.decisionId ?? null);
  assert.equal(practicalRepairFocusHref(restored.fieldNotes[0]), "/mastery/session?focus=EXP-01");
});

test("Diagnostic stores recommendations only and canonical continuation stays generic", () => {
  const state = learnerWithPractical(false);
  const beforeProfile = structuredClone(practicalProfileFromLearnerState(state));
  const next = applyReviewedDiagnostic(state, ["preflop", "blinds"]);
  assert.deepEqual(practicalProfileFromLearnerState(next), beforeProfile);
  assert.deepEqual(next.diagnostic.priorityModules, ["preflop", "blinds"]);
  assert.equal(next.diagnostic.status, "SCORED");
  assert.doesNotMatch(diagnosticUi, /Use these priorities in Today|Использовать эти приоритеты в Today/);
  assert.doesNotMatch(diagnosticUi, /focus=/);
  assert.match(diagnosticUi, /window\.location\.assign\("\/mastery\/journey"\)/);
});

test("post-125 generic and focused contracts remain fail-closed", () => {
  assert.match(adaptive, /supportedIntegratedSkillIds\(state\)\.includes\(skillId\)/);
  assert.match(integratedUi, /will not silently substitute a different topic/);
  assert.match(integratedUi, /href="\/mastery\/journey"/);
  assert.match(ui, /practicalRepairFocusHref\(note\)/);
  assert.match(core, /delayedRetrievalPassed/);
  assert.match(core, /applySourceEvidenceCeiling/);
});
