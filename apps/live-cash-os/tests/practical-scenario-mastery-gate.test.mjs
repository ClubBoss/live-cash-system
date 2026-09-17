import assert from "node:assert/strict";
import test from "node:test";

import { practicalDecisionById } from "../content/practical-mastery/index.ts";
import {
  createPracticalMasteryState,
  deriveEvidenceStage,
  markPracticalConceptTaught,
  practicalScenarioEvidenceRequirements,
  practicalSkillCorpusCanReach,
  practicalSkillCorpusStats,
  recordPracticalDecision,
} from "../lib/practical-mastery-core.ts";
import { practicalProgressCountingSkills } from "../lib/practical-learner-skill-set.ts";

function answerCorrect(state, decisionId, now) {
  const decision = practicalDecisionById.get(decisionId);
  assert.ok(decision, `missing canonical decision ${decisionId}`);
  return recordPracticalDecision(state, {
    decisionId,
    actionId: decision.correctActionId,
    reasonId: decision.correctReasonId,
    confidence: 70,
    now,
  });
}

test("one generated scenario family cannot satisfy recognition mastery by wording depth alone", () => {
  let state = createPracticalMasteryState(new Date("2026-09-01T00:00:00Z"));
  state = markPracticalConceptTaught(state, "FND-04", new Date("2026-09-01T00:00:01Z"));

  state = answerCorrect(state, "PM-FND-04-B1-101", new Date("2026-09-01T00:01:00Z"));
  state = answerCorrect(state, "PM-FND-04-B1-102", new Date("2026-09-01T00:02:00Z"));

  assert.equal(
    deriveEvidenceStage(state.skills["FND-04"]),
    "CONCEPT_TAUGHT",
    "two differently worded recognition stimuli from one scenario family must not create recognition mastery",
  );

  state = answerCorrect(state, "PM-FND-04-S2-101", new Date("2026-09-01T00:03:00Z"));
  assert.equal(deriveEvidenceStage(state.skills["FND-04"]), "RECOGNITION_TRAINED");
});

test("every progress-counting skill has enough independent recognition scenarios for the hard gate", () => {
  const requirement = practicalScenarioEvidenceRequirements();
  assert.deepEqual(requirement, { recognitionScenarios: 2, directDecisionScenarios: 2, transferScenarios: 2 });

  const skills = practicalProgressCountingSkills();
  assert.ok(skills.length >= 70, `unexpectedly narrow progress set: ${skills.length}`);
  for (const skill of skills) {
    const stats = practicalSkillCorpusStats(skill.id);
    assert.ok(
      stats.recognitionScenarios >= requirement.recognitionScenarios,
      `${skill.id}: only ${stats.recognitionScenarios} recognition scenario family/families`,
    );
    assert.ok(stats.directScenarios >= requirement.directDecisionScenarios, `${skill.id}: insufficient direct scenario diversity`);
    assert.ok(stats.transferScenarios >= requirement.transferScenarios, `${skill.id}: insufficient transfer scenario diversity`);
    assert.equal(practicalSkillCorpusCanReach(skill.id, "DECISION_TRAINED"), true);
    assert.equal(practicalSkillCorpusCanReach(skill.id, "CHANGED_NODE_TRANSFER"), true);
  }
});
