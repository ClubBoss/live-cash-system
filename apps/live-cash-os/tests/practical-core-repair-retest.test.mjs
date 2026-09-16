import assert from "node:assert/strict";
import test from "node:test";

import {
  createPracticalMasteryState,
  markPracticalConceptTaught,
  nextPracticalDecision,
  practicalRepairQueue,
  recordPracticalDecision,
} from "../lib/practical-mastery-core.ts";

function wrongAnswer(decision, now) {
  const action = decision.actionOptions.find((option) => option.id !== decision.correctActionId);
  const reason = decision.reasonOptions.find((option) => option.id !== decision.correctReasonId);
  assert.ok(action && reason, `${decision.id}: expected at least one wrong action/reason`);
  return {
    decisionId: decision.id,
    actionId: action.id,
    reasonId: reason.id,
    confidence: 70,
    now,
  };
}

function correctAnswer(decision, now) {
  return {
    decisionId: decision.id,
    actionId: decision.correctActionId,
    reasonId: decision.correctReasonId,
    confidence: 70,
    now,
  };
}

test("core repair is novelty-first and later admits the failed item for an independent retest", () => {
  const skillId = "FND-01";
  let state = createPracticalMasteryState(new Date("2026-09-01T00:00:00Z"));
  state = markPracticalConceptTaught(state, skillId, new Date("2026-09-01T00:00:01Z"));

  const failed = nextPracticalDecision(state, skillId);
  assert.ok(failed);
  state = recordPracticalDecision(state, wrongAnswer(failed, new Date("2026-09-01T00:01:00Z")));
  assert.ok(practicalRepairQueue(state).includes(skillId));

  const immediate = nextPracticalDecision(state, skillId);
  assert.ok(immediate, "wrong answer must still have a novelty-first repair route");
  assert.notEqual(immediate.id, failed.id, "core repair must not immediately repeat the failed item");

  let solvedDifferentFamily = false;
  let retest = null;
  for (let index = 0; index < 30; index += 1) {
    const decision = nextPracticalDecision(state, skillId);
    assert.ok(decision, "core repair dead-ended before the failed item became independently retestable");

    if (decision.id === failed.id) {
      retest = decision;
      break;
    }

    solvedDifferentFamily = true;
    state = recordPracticalDecision(
      state,
      correctAnswer(decision, new Date(Date.UTC(2026, 8, 1, 0, index + 2, 0))),
    );
  }

  assert.equal(solvedDifferentFamily, true);
  assert.ok(retest, "failed item must eventually return after intervening correct evidence");

  state = recordPracticalDecision(state, correctAnswer(retest, new Date("2026-09-01T01:00:00Z")));
  assert.equal(practicalRepairQueue(state).includes(skillId), false, "successful retest must resolve the repair queue");
});
