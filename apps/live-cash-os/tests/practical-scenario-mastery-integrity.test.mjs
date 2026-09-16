import assert from "node:assert/strict";
import test from "node:test";

import { practicalDecisionById } from "../content/practical-mastery/index.ts";
import {
  createPracticalMasteryState,
  markPracticalConceptTaught,
  practicalSkillCorpusCanReach,
  practicalSkillCorpusStats,
  nextPracticalDecision,
  recordPracticalDecision,
} from "../lib/practical-mastery-core.ts";

const CLOSURE_SKILLS = [
  "FND-04",
  "BL-07",
  "BL-08",
  "BL-09",
  "W4-DRAW-01",
  "TURN-04",
  "TURN-05",
  "RIV-02",
  "RIV-04",
  "RIV-05",
  "MW-03",
  "MW-04",
  "MW-05",
  "DEEP-02",
  "DEEP-04",
  "EXP-02",
  "EXP-03",
  "EXP-04",
  "EXP-05",
  "EXP-06",
];

function answerCorrect(state, decisionId, second) {
  const decision = practicalDecisionById.get(decisionId);
  assert.ok(decision, `missing fixture ${decisionId}`);
  return recordPracticalDecision(state, {
    decisionId,
    actionId: decision.correctActionId,
    reasonId: decision.correctReasonId,
    confidence: 70,
    now: new Date(`2026-09-01T00:00:0${second}Z`),
  });
}

test("one generated scenario family cannot grant recognition mastery by wording depth alone", () => {
  let state = createPracticalMasteryState(new Date("2026-09-01T00:00:00Z"));
  state = markPracticalConceptTaught(state, "FND-04", new Date("2026-09-01T00:00:01Z"));

  state = answerCorrect(state, "PM-FND-04-B1-101", 2);
  state = answerCorrect(state, "PM-FND-04-B1-102", 3);
  assert.equal(
    state.skills["FND-04"].evidenceStage,
    "CONCEPT_TAUGHT",
    "two differently worded recognition items from one scenario must not satisfy recognition mastery",
  );

  const novelRecognition = nextPracticalDecision(state, "FND-04");
  assert.equal(
    novelRecognition?.id,
    "PM-FND-04-S2-101",
    "scheduler must continue recognition until independent scenario diversity is satisfied",
  );

  state = answerCorrect(state, "PM-FND-04-S2-101", 4);
  assert.equal(
    state.skills["FND-04"].evidenceStage,
    "RECOGNITION_TRAINED",
    "a second independent recognition scenario should satisfy the unchanged 2-stimulus floor",
  );
});

test("scenario-diversity closure preserves decision-training reachability for every affected skill", () => {
  for (const skillId of CLOSURE_SKILLS) {
    const stats = practicalSkillCorpusStats(skillId);
    assert.ok(stats.recognition >= 2, `${skillId}: recognition stimulus floor regressed`);
    assert.ok(stats.recognitionScenarios >= 2, `${skillId}: still lacks two independent recognition scenarios`);
    assert.equal(
      practicalSkillCorpusCanReach(skillId, "DECISION_TRAINED"),
      true,
      `${skillId}: scenario hardening must not make the canonical skill unreachable`,
    );
  }
});
