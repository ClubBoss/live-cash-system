import assert from "node:assert/strict";
import test from "node:test";

import { practicalDecisionById } from "../content/practical-mastery/index.ts";
import {
  createPracticalMasteryState,
  markPracticalConceptTaught,
  recordPracticalDecision,
} from "../lib/practical-mastery-core.ts";
import {
  recordIntegratedDecision,
  retentionTierDue,
} from "../lib/practical-integrated-session.ts";
import { recommendedPracticalScaffold } from "../lib/practical-scaffold-fading.ts";
import {
  practicalEvidenceFamilyId,
  practicalEvidenceScenarioId,
} from "../lib/practical-stimulus-identity.ts";

function correct(state, decision, iso) {
  return recordPracticalDecision(state, {
    decisionId: decision.id,
    actionId: decision.correctActionId,
    reasonId: decision.correctReasonId,
    confidence: 70,
    confidenceProvenance: "SELF_REPORT",
    now: new Date(iso),
  });
}
function wrong(state, decision, iso) {
  const wrongAction = decision.actionOptions.find((option) => option.id !== decision.correctActionId);
  assert.ok(wrongAction);
  return recordPracticalDecision(state, {
    decisionId: decision.id,
    actionId: wrongAction.id,
    reasonId: decision.correctReasonId,
    confidence: 70,
    confidenceProvenance: "SELF_REPORT",
    now: new Date(iso),
  });
}

function boundaryReadyState(skillId) {
  let state = createPracticalMasteryState(new Date("2026-08-01T00:00:00.000Z"), true);
  state = markPracticalConceptTaught(state, skillId, new Date("2026-08-01T00:00:01.000Z"));
  state.skills[skillId].evidenceStage = "BOUNDARY_TESTED";
  return state;
}

test("LC-AUD-018 unresolved wrong evidence blocks retention and repair resets the delay anchor", () => {
  const anchor = practicalDecisionById.get("PM-RIV-03-A8-106");
  const repair = practicalDecisionById.get("PM-RIV-03-C0-205");
  assert.ok(anchor && repair);
  let state = boundaryReadyState("RIV-03");
  state = correct(state, anchor, "2026-08-01T00:01:00.000Z");
  state.skills["RIV-03"].evidenceStage = "BOUNDARY_TESTED";
  assert.equal(retentionTierDue(state, "RIV-03", new Date("2026-08-03T00:01:00.000Z")), 1);
  state = wrong(state, repair, "2026-08-03T00:02:00.000Z");
  state.skills["RIV-03"].evidenceStage = "BOUNDARY_TESTED";
  assert.equal(
    retentionTierDue(state, "RIV-03", new Date("2026-08-04T00:01:00.000Z")),
    null,
    "a fresh unresolved miss contradicts delayed-retention eligibility",
  );

  state = wrong(state, repair, "2026-08-04T00:02:00.000Z");
  state.skills["RIV-03"].evidenceStage = "BOUNDARY_TESTED";
  assert.equal(retentionTierDue(state, "RIV-03", new Date("2026-08-05T00:01:00.000Z")), null);

  state = correct(state, repair, "2026-08-05T00:02:00.000Z");
  state.skills["RIV-03"].evidenceStage = "BOUNDARY_TESTED";
  assert.equal(
    retentionTierDue(state, "RIV-03", new Date("2026-08-05T00:03:00.000Z")),
    null,
    "same-round repair must not inherit the old delayed anchor",
  );
  assert.equal(
    retentionTierDue(state, "RIV-03", new Date("2026-08-06T00:02:00.000Z")),
    1,
    "retention can become due only after a fresh delay from the repair",
  );
});

test("LC-AUD-003 retention credit requires a new semantic stimulus as well as a new scenario", () => {
  const anchor = practicalDecisionById.get("PM-RIV-03-A8-106");
  const aliasSibling = practicalDecisionById.get("PM-B3-RIV03-103");
  assert.ok(anchor && aliasSibling);
  assert.equal(practicalEvidenceFamilyId(anchor), practicalEvidenceFamilyId(aliasSibling));
  assert.notEqual(practicalEvidenceScenarioId(anchor), practicalEvidenceScenarioId(aliasSibling));

  let state = boundaryReadyState("RIV-03");
  state = correct(state, anchor, "2026-08-01T00:01:00.000Z");
  state.skills["RIV-03"].evidenceStage = "BOUNDARY_TESTED";
  const next = recordIntegratedDecision(state, {
    decisionId: aliasSibling.id,
    skillId: aliasSibling.skillId,
    priority: 101,
    reason: "RETENTION",
    whyAfterAnswer: "master semantic-identity seam",
    retentionTierDays: 1,
  }, {
    actionId: aliasSibling.correctActionId,
    reasonId: aliasSibling.correctReasonId,
    confidence: 70,
    confidenceProvenance: "SELF_REPORT",
    now: new Date("2026-08-03T00:01:00.000Z"),
  });
  assert.deepEqual(next.skills["RIV-03"].retentionDaysPassed, []);
});
