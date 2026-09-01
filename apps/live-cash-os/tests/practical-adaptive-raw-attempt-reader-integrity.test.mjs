import assert from "node:assert/strict";
import test from "node:test";

import { isOrdinaryLearnerDecision, practicalDecisionById, practicalDecisions } from "../content/practical-mastery/index.ts";
import { buildAdaptiveIntegratedSession } from "../lib/practical-adaptive-session.ts";
import { createPracticalMasteryState, isSemanticallyValidPracticalAttempt } from "../lib/practical-mastery-core.ts";
import { recentlyAttemptedDecisionIds } from "../lib/practical-repeat-window.ts";

const NOW = new Date("2026-09-01T00:00:00.000Z");
const SKILL_ID = "FND-01";

function answeredAt(offsetSeconds) {
  return new Date(NOW.getTime() + offsetSeconds * 1000).toISOString();
}

function introducedState() {
  const state = createPracticalMasteryState(NOW, true);
  state.skills[SKILL_ID].conceptTaught = true;
  state.skills[SKILL_ID].conceptTaughtAt = NOW.toISOString();
  return state;
}

function invalidAttempt(decision, id, offsetSeconds) {
  return {
    id,
    decisionId: decision.id,
    skillId: decision.skillId,
    actionId: "GHOST",
    reasonId: decision.correctReasonId,
    confidence: 80,
    correct: false,
    answeredAt: answeredAt(offsetSeconds),
  };
}

function validWrongAttempt(decision, id, offsetSeconds) {
  const wrongAction = decision.actionOptions.find((option) => option.id !== decision.correctActionId)?.id;
  assert.ok(wrongAction, `decision ${decision.id} must have a wrong action option for this regression`);
  return {
    id,
    decisionId: decision.id,
    skillId: decision.skillId,
    actionId: wrongAction,
    reasonId: decision.correctReasonId,
    confidence: 60,
    correct: false,
    answeredAt: answeredAt(offsetSeconds),
  };
}

function canonicalDecision(decisionId) {
  const decision = practicalDecisionById.get(decisionId);
  assert.ok(decision, `missing canonical decision ${decisionId}`);
  return decision;
}

function automaticityPerformance() {
  const decision = practicalDecisions.find((candidate) =>
    candidate.skillId === SKILL_ID
    && isOrdinaryLearnerDecision(candidate)
    && ["recognition", "changed", "mixed"].includes(candidate.kind));
  assert.ok(decision, `${SKILL_ID} must expose an ordinary automaticity-compatible decision`);
  return [{ decisionId: decision.id, responseMs: decision.targetSeconds * 2000, correct: true }];
}

function genericItems(state, size = 8) {
  return buildAdaptiveIntegratedSession(state, NOW, size, automaticityPerformance());
}

function focusedItems(state, size = 8) {
  return buildAdaptiveIntegratedSession(state, NOW, size, automaticityPerformance(), SKILL_ID);
}

function ids(items) {
  return items.map((item) => item.decisionId);
}

function distinctSkillDecisionExcluding(excludedId) {
  const decision = practicalDecisions.find((candidate) =>
    candidate.skillId === SKILL_ID
    && isOrdinaryLearnerDecision(candidate)
    && candidate.id !== excludedId);
  assert.ok(decision, `${SKILL_ID} must expose at least two ordinary decisions`);
  return decision;
}

test("G1/G2: generic all-invalid latest history is no signal and cannot exclude its decision", () => {
  const baseline = genericItems(introducedState());
  const targetItem = baseline.find((item) => item.skillId === SKILL_ID);
  assert.ok(targetItem, "baseline generic session must contain the focused skill");
  const target = canonicalDecision(targetItem.decisionId);

  const poisoned = introducedState();
  const invalid = invalidAttempt(target, "adaptive-g2-invalid-latest", 1);
  assert.equal(isSemanticallyValidPracticalAttempt(invalid), false);
  poisoned.attempts = [invalid];

  assert.deepEqual(ids(genericItems(poisoned)), ids(baseline));
});

test("G3: invalid true-latest shadows older valid latest-attempt evidence without backward resurrection", () => {
  const baseline = genericItems(introducedState());
  const targetItem = baseline.find((item) => item.skillId === SKILL_ID);
  assert.ok(targetItem, "baseline generic session must contain the focused skill");
  const target = canonicalDecision(targetItem.decisionId);
  const filler = distinctSkillDecisionExcluding(target.id);

  const state = introducedState();
  const olderValid = validWrongAttempt(target, "adaptive-g3-older-valid", 0);
  const invalidFillers = Array.from({ length: 8 }, (_, index) => invalidAttempt(
    filler,
    `adaptive-g3-invalid-${index}`,
    index + 1,
  ));
  assert.equal(isSemanticallyValidPracticalAttempt(olderValid), true);
  assert.equal(isSemanticallyValidPracticalAttempt(invalidFillers.at(-1)), false);
  state.attempts = [olderValid, ...invalidFillers];

  assert.equal(recentlyAttemptedDecisionIds(state).has(target.id), false, "older valid row must stay outside the last-eight physical window");
  assert.equal(
    ids(genericItems(state)).includes(target.id),
    true,
    "invalid true-latest must not resurrect the older valid row as adaptive latest-decision exclusion",
  );
});

test("F1/F2: focused all-invalid history does not mark decisions historically attempted", () => {
  const baselineState = introducedState();
  const baseline = focusedItems(baselineState);
  const seededIds = new Set(genericItems(baselineState).filter((item) => item.skillId === SKILL_ID).map((item) => item.decisionId));
  const targetId = ids(baseline).find((decisionId) => !seededIds.has(decisionId));
  assert.ok(targetId, "focused session must contain at least one fill decision beyond the generic seed");
  const target = canonicalDecision(targetId);
  const filler = distinctSkillDecisionExcluding(target.id);

  const poisoned = introducedState();
  poisoned.attempts = [
    invalidAttempt(target, "adaptive-f2-invalid-target", 0),
    ...Array.from({ length: 8 }, (_, index) => invalidAttempt(filler, `adaptive-f2-invalid-${index}`, index + 1)),
  ];
  assert.equal(poisoned.attempts.every((attempt) => !isSemanticallyValidPracticalAttempt(attempt)), true);

  assert.deepEqual(ids(focusedItems(poisoned)), ids(baseline));
});

test("F3: legitimate historical attempted evidence keeps the established focused ordering behavior", () => {
  const baselineState = introducedState();
  const baseline = focusedItems(baselineState);
  const baselineIds = ids(baseline);
  const seededIds = new Set(genericItems(baselineState).filter((item) => item.skillId === SKILL_ID).map((item) => item.decisionId));
  const targetId = baselineIds.find((decisionId) => !seededIds.has(decisionId));
  assert.ok(targetId, "focused session must contain at least one fill decision beyond the generic seed");
  const target = canonicalDecision(targetId);
  const filler = distinctSkillDecisionExcluding(target.id);

  const attempted = introducedState();
  const validHistorical = validWrongAttempt(target, "adaptive-f3-valid-target", 0);
  attempted.attempts = [
    validHistorical,
    ...Array.from({ length: 8 }, (_, index) => invalidAttempt(filler, `adaptive-f3-invalid-${index}`, index + 1)),
  ];
  assert.equal(isSemanticallyValidPracticalAttempt(validHistorical), true);
  assert.equal(recentlyAttemptedDecisionIds(attempted).has(target.id), false);

  const attemptedIds = ids(focusedItems(attempted));
  const baselineIndex = baselineIds.indexOf(target.id);
  const attemptedIndex = attemptedIds.indexOf(target.id);
  assert.ok(
    attemptedIndex === -1 || attemptedIndex > baselineIndex,
    "a legitimate historical attempt must retain the existing attempted-after-unattempted ordering effect",
  );
});

test("F4: adaptive repair leaves the canonical physical recent-window authority unchanged", () => {
  const decisions = practicalDecisions.filter((candidate) => candidate.skillId === SKILL_ID && isOrdinaryLearnerDecision(candidate));
  assert.ok(decisions.length >= 2, `${SKILL_ID} must expose at least two ordinary decisions`);
  const target = decisions[0];
  const filler = decisions[1];

  const outsideWindow = introducedState();
  const olderValid = validWrongAttempt(target, "adaptive-f4-old-valid", 0);
  outsideWindow.attempts = [
    olderValid,
    ...Array.from({ length: 8 }, (_, index) => invalidAttempt(filler, `adaptive-f4-invalid-${index}`, index + 1)),
  ];
  assert.equal(recentlyAttemptedDecisionIds(outsideWindow).has(target.id), false);

  const insideWindow = introducedState();
  const recentValid = validWrongAttempt(target, "adaptive-f4-recent-valid", 8);
  insideWindow.attempts = [
    ...Array.from({ length: 8 }, (_, index) => invalidAttempt(filler, `adaptive-f4-leading-invalid-${index}`, index)),
    recentValid,
  ];
  assert.equal(recentlyAttemptedDecisionIds(insideWindow).has(target.id), true);
});

test("adaptive raw-reader repair preserves deterministic output and session caps", () => {
  const state = introducedState();
  const firstGeneric = genericItems(state);
  const secondGeneric = genericItems(state);
  const firstFocused = focusedItems(state);
  const secondFocused = focusedItems(state);

  assert.deepEqual(ids(firstGeneric), ids(secondGeneric));
  assert.deepEqual(ids(firstFocused), ids(secondFocused));
  assert.ok(firstGeneric.length <= 8);
  assert.ok(firstFocused.length <= 8);
});
