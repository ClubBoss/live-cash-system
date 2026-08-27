import assert from "node:assert/strict";
import test from "node:test";
import { isOrdinaryLearnerDecision, practicalDecisionById } from "../content/practical-mastery";
import { buildAdaptiveIntegratedSession } from "../lib/practical-adaptive-session";
import { buildIntegratedSession } from "../lib/practical-integrated-session";
import { createPracticalMasteryState, decisionsForPracticalSkill } from "../lib/practical-mastery-core";

const INTERNAL_FIXTURE_ID = "PM-W4-HAND-01-108";

function integratedReadyState() {
  const state = createPracticalMasteryState(new Date("2026-08-28T08:00:00Z"));
  for (const progress of Object.values(state.skills)) {
    progress.conceptTaught = true;
    progress.conceptTaughtAt = "2026-08-28T08:00:00.000Z";
    progress.evidenceStage = "DECISION_TRAINED";
  }
  return state;
}

test("FND-02 retains the internal transfer-validation fixture but excludes it from ordinary learner practice", () => {
  const fixture = practicalDecisionById.get(INTERNAL_FIXTURE_ID);
  assert.ok(fixture, "the internal fixture must remain available to closure tests");
  assert.equal(fixture.learnerEligibility, "INTERNAL_ONLY");
  assert.equal(isOrdinaryLearnerDecision(fixture), false);
  assert.match(fixture.questionEn, /What has been proven\?/u);
  assert.match(fixture.explanationEn, /integrity closure/u);

  const ordinaryW4Hand = decisionsForPracticalSkill("W4-HAND-01");
  assert.ok(ordinaryW4Hand.length > 0, "ordinary W4-HAND poker content must remain reachable");
  assert.equal(ordinaryW4Hand.some((decision) => decision.id === INTERNAL_FIXTURE_ID), false);

  const state = integratedReadyState();
  const generic = buildIntegratedSession(state, new Date("2026-08-28T08:01:00Z"), 64);
  const focused = buildAdaptiveIntegratedSession(state, new Date("2026-08-28T08:02:00Z"), 64, [], "W4-HAND-01");
  assert.ok(focused.some((item) => item.skillId === "W4-HAND-01"), "ordinary focused poker practice must remain reachable");
  assert.equal(generic.some((item) => item.decisionId === INTERNAL_FIXTURE_ID), false);
  assert.equal(focused.some((item) => item.decisionId === INTERNAL_FIXTURE_ID), false);
});
