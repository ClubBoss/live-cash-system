import assert from "node:assert/strict";
import test from "node:test";

import { practicalDecisionById } from "../content/practical-mastery/index.ts";
import { selectedWrongPracticalMisconceptionIds } from "../lib/practical-current-mistakes.ts";
import {
  PRACTICAL_A7_RU_REASON_SEMANTIC_REVISION,
  createPracticalMasteryState,
  isCurrentPracticalEvidenceAttempt,
  isSemanticallyValidPracticalAttempt,
  practicalRepairQueue,
  recordPracticalDecision,
} from "../lib/practical-mastery-core.ts";

const DECISION_ID = "PM-3BP-04-A7-101";
const NOW = new Date("2026-09-15T00:00:00.000Z");

function legacyWrongReasonAttempt() {
  const decision = practicalDecisionById.get(DECISION_ID);
  assert.ok(decision);
  const wrongReason = decision.reasonOptions.find((option) => option.id !== decision.correctReasonId);
  assert.ok(wrongReason);
  return {
    id: `${DECISION_ID}:legacy:2026-09-01T00:00:00.000Z`,
    decisionId: DECISION_ID,
    skillId: decision.skillId,
    actionId: decision.correctActionId,
    reasonId: wrongReason.id,
    confidence: 90,
    correct: false,
    answeredAt: "2026-09-01T00:00:00.000Z",
  };
}

test("pre-repair A7 wrong-reason rows remain raw-valid but are excluded from current misconception evidence", () => {
  const attempt = legacyWrongReasonAttempt();
  assert.equal(isSemanticallyValidPracticalAttempt(attempt), true);
  assert.equal(isCurrentPracticalEvidenceAttempt(attempt), false);
  assert.deepEqual(selectedWrongPracticalMisconceptionIds(attempt), []);

  const state = createPracticalMasteryState(NOW, true);
  state.attempts = [attempt];
  assert.deepEqual(practicalRepairQueue(state), []);
  assert.equal(state.attempts[0], attempt, "raw historical row must not be rewritten or deleted");
});

test("new A7 attempts carry the semantic revision and can create current repair evidence", () => {
  const decision = practicalDecisionById.get(DECISION_ID);
  assert.ok(decision);
  const wrongReason = decision.reasonOptions.find((option) => option.id !== decision.correctReasonId);
  assert.ok(wrongReason);

  const state = recordPracticalDecision(createPracticalMasteryState(NOW, true), {
    decisionId: DECISION_ID,
    actionId: decision.correctActionId,
    reasonId: wrongReason.id,
    confidence: 90,
    now: NOW,
  });
  const attempt = state.attempts.at(-1);
  assert.ok(attempt);
  assert.equal(attempt.semanticRevision, PRACTICAL_A7_RU_REASON_SEMANTIC_REVISION);
  assert.equal(isSemanticallyValidPracticalAttempt(attempt), true);
  assert.equal(isCurrentPracticalEvidenceAttempt(attempt), true);
  assert.ok(selectedWrongPracticalMisconceptionIds(attempt).length > 0);
  assert.deepEqual(practicalRepairQueue(state), [decision.skillId]);
});

test("old A7 correct-reason rows remain usable because the correct semantic identity did not change", () => {
  const decision = practicalDecisionById.get(DECISION_ID);
  assert.ok(decision);
  const wrongAction = decision.actionOptions.find((option) => option.id !== decision.correctActionId);
  assert.ok(wrongAction);
  const attempt = {
    id: `${DECISION_ID}:legacy-action:2026-09-01T00:00:00.000Z`,
    decisionId: DECISION_ID,
    skillId: decision.skillId,
    actionId: wrongAction.id,
    reasonId: decision.correctReasonId,
    confidence: 70,
    correct: false,
    answeredAt: "2026-09-01T00:00:00.000Z",
  };
  assert.equal(isSemanticallyValidPracticalAttempt(attempt), true);
  assert.equal(isCurrentPracticalEvidenceAttempt(attempt), true);
  assert.ok(selectedWrongPracticalMisconceptionIds(attempt).includes(wrongAction.misconception));
});
