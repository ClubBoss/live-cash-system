import assert from "node:assert/strict";
import test from "node:test";

import { firstJourneySteps } from "../content/practical-mastery/first-journey.ts";
import {
  createPracticalMasteryState,
  markPracticalConceptTaught,
  recordPracticalDecision,
  stageAtLeast,
} from "../lib/practical-mastery-core.ts";
import { nextFirstJourneyDecision } from "../lib/practical-first-journey.ts";

function wrongInput(decision, now) {
  const action = decision.actionOptions.find((option) => option.id !== decision.correctActionId);
  const reason = decision.reasonOptions.find((option) => option.id !== decision.correctReasonId);
  assert.ok(action && reason, `${decision.id}: fixture needs wrong action/reason options`);
  return { actionId: action.id, reasonId: reason.id, confidence: 70, now };
}

function correctInput(decision, now) {
  return {
    actionId: decision.correctActionId,
    reasonId: decision.correctReasonId,
    confidence: 70,
    now,
  };
}

test("one wrong Quick Start recognition uses one independent sibling before retesting the miss", () => {
  for (const step of firstJourneySteps) {
    let state = createPracticalMasteryState(new Date("2026-09-01T00:00:00Z"));
    state = markPracticalConceptTaught(state, step.skillId, new Date("2026-09-01T00:00:01Z"));

    const first = nextFirstJourneyDecision(state, step.skillId);
    assert.ok(first, `${step.skillId}: missing first recognition`);
    assert.equal(first.kind, "recognition", `${step.skillId}: first item must be recognition`);

    state = recordPracticalDecision(
      state,
      { decisionId: first.id, ...wrongInput(first, new Date("2026-09-01T00:01:00Z")) },
    );

    const sibling = nextFirstJourneyDecision(state, step.skillId);
    assert.ok(sibling, `${step.skillId}: wrong answer dead-ended immediately`);
    assert.equal(sibling.kind, "recognition", `${step.skillId}: first repair must stay inside recognition`);
    assert.notEqual(sibling.id, first.id, `${step.skillId}: repair repeated the failed item immediately`);

    state = recordPracticalDecision(
      state,
      { decisionId: sibling.id, ...correctInput(sibling, new Date("2026-09-01T00:02:00Z")) },
    );

    const retest = nextFirstJourneyDecision(state, step.skillId);
    assert.ok(retest, `${step.skillId}: failed item did not become independently retestable`);
    assert.equal(retest.id, first.id, `${step.skillId}: repair should retest the original miss after one correct sibling`);

    state = recordPracticalDecision(
      state,
      { decisionId: retest.id, ...correctInput(retest, new Date("2026-09-01T00:03:00Z")) },
    );

    for (let index = 0; index < 20 && !stageAtLeast(state.skills[step.skillId].evidenceStage, "RECOGNITION_TRAINED"); index += 1) {
      const decision = nextFirstJourneyDecision(state, step.skillId);
      assert.ok(decision, `${step.skillId}: Quick Start dead-ended before scenario-diverse recognition completion`);
      state = recordPracticalDecision(
        state,
        {
          decisionId: decision.id,
          ...correctInput(decision, new Date(Date.UTC(2026, 8, 1, 0, index + 4, 0))),
        },
      );
    }

    assert.equal(
      stageAtLeast(state.skills[step.skillId].evidenceStage, "RECOGNITION_TRAINED"),
      true,
      `${step.skillId}: one initial miss must remain recoverable under the scenario-diversity gate`,
    );
  }
});

