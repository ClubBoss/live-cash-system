import assert from "node:assert/strict";
import test from "node:test";

import { practicalDecisionById } from "../content/practical-mastery/index.ts";
import {
  createPracticalMasteryState,
  deriveEvidenceStage,
  markPracticalConceptTaught,
  nextPracticalDecision,
  practicalScenarioEvidenceRequirements,
  practicalSkillCorpusCanReach,
  practicalSkillCorpusStats,
  recordPracticalDecision,
} from "../lib/practical-mastery-core.ts";
import { practicalProgressCountingSkills } from "../lib/practical-learner-skill-set.ts";
import { practicalEvidenceScenarioId } from "../lib/practical-stimulus-identity.ts";

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

const TURN02_RECOGNITION_SAME_SCENARIO = ["PM-TURN-02-A8-101", "PM-TURN-02-A8-202"];
const TURN02_RECOGNITION_OTHER_SCENARIO = "PM-B3-TURN02-101";
const TURN02_DIRECT_SAME_SCENARIO = ["PM-TURN-02-A8-103", "PM-TURN-02-A8-104", "PM-TURN-02-A8-205"];
const TURN02_DIRECT_OTHER_SCENARIO = "PM-B3-TURN02-102";
const TURN02_TRANSFER_SAME_SCENARIO = ["PM-TURN-02-A8-106", "PM-TURN-02-A8-207"];

function taughtTurn02() {
  return markPracticalConceptTaught(
    createPracticalMasteryState(new Date("2026-09-18T03:00:00Z")),
    "TURN-02",
    new Date("2026-09-18T03:00:01Z"),
  );
}

function turn02RecognitionReady() {
  let state = taughtTurn02();
  state = answerCorrect(state, TURN02_RECOGNITION_SAME_SCENARIO[0], new Date("2026-09-18T03:00:02Z"));
  state = answerCorrect(state, TURN02_RECOGNITION_OTHER_SCENARIO, new Date("2026-09-18T03:00:03Z"));
  assert.equal(deriveEvidenceStage(state.skills["TURN-02"]), "RECOGNITION_TRAINED");
  return state;
}

test("scheduler keeps recognition routing inside recognition until the scenario floor is met", () => {
  let state = taughtTurn02();
  state = answerCorrect(state, TURN02_RECOGNITION_SAME_SCENARIO[0], new Date("2026-09-18T03:01:00Z"));
  state = answerCorrect(state, TURN02_RECOGNITION_SAME_SCENARIO[1], new Date("2026-09-18T03:01:01Z"));
  assert.equal(deriveEvidenceStage(state.skills["TURN-02"]), "CONCEPT_TAUGHT");
  const next = nextPracticalDecision(state, "TURN-02");
  assert.ok(next);
  assert.equal(next.kind, "recognition");
  assert.notEqual(
    practicalEvidenceScenarioId(next),
    practicalEvidenceScenarioId(practicalDecisionById.get(TURN02_RECOGNITION_SAME_SCENARIO[0])),
  );
});

test("scheduler routes to a novel direct scenario when direct families are already sufficient", () => {
  let state = turn02RecognitionReady();
  TURN02_DIRECT_SAME_SCENARIO.forEach((id, index) => {
    state = answerCorrect(state, id, new Date(Date.UTC(2026, 8, 18, 3, 2, index)));
  });
  assert.equal(deriveEvidenceStage(state.skills["TURN-02"]), "RECOGNITION_TRAINED");
  const next = nextPracticalDecision(state, "TURN-02");
  assert.ok(next);
  assert.equal(next.kind, "decision");
  assert.notEqual(
    practicalEvidenceScenarioId(next),
    practicalEvidenceScenarioId(practicalDecisionById.get(TURN02_DIRECT_SAME_SCENARIO[0])),
  );
});

test("scheduler routes to a novel transfer scenario when transfer families are already sufficient", () => {
  let state = turn02RecognitionReady();
  for (const [index, id] of [...TURN02_DIRECT_SAME_SCENARIO, TURN02_DIRECT_OTHER_SCENARIO].entries()) {
    state = answerCorrect(state, id, new Date(Date.UTC(2026, 8, 18, 3, 3, index)));
  }
  TURN02_TRANSFER_SAME_SCENARIO.forEach((id, index) => {
    state = answerCorrect(state, id, new Date(Date.UTC(2026, 8, 18, 3, 4, index)));
  });
  assert.equal(deriveEvidenceStage(state.skills["TURN-02"]), "DECISION_TRAINED");
  const next = nextPracticalDecision(state, "TURN-02");
  assert.ok(next);
  assert.ok(next.kind === "changed" || next.kind === "mixed");
  assert.notEqual(
    practicalEvidenceScenarioId(next),
    practicalEvidenceScenarioId(practicalDecisionById.get(TURN02_TRANSFER_SAME_SCENARIO[0])),
  );
});

test("after the missing direct and transfer scenarios are supplied the scheduler advances", () => {
  let directState = turn02RecognitionReady();
  TURN02_DIRECT_SAME_SCENARIO.forEach((id, index) => {
    directState = answerCorrect(directState, id, new Date(Date.UTC(2026, 8, 18, 3, 5, index)));
  });
  const novelDirect = nextPracticalDecision(directState, "TURN-02");
  assert.ok(novelDirect && novelDirect.kind === "decision");
  directState = answerCorrect(directState, novelDirect.id, new Date("2026-09-18T03:06:00Z"));
  assert.ok(["changed", "mixed"].includes(nextPracticalDecision(directState, "TURN-02")?.kind));

  let transferState = turn02RecognitionReady();
  for (const [index, id] of [...TURN02_DIRECT_SAME_SCENARIO, TURN02_DIRECT_OTHER_SCENARIO].entries()) {
    transferState = answerCorrect(transferState, id, new Date(Date.UTC(2026, 8, 18, 3, 7, index)));
  }
  TURN02_TRANSFER_SAME_SCENARIO.forEach((id, index) => {
    transferState = answerCorrect(transferState, id, new Date(Date.UTC(2026, 8, 18, 3, 8, index)));
  });
  const novelTransfer = nextPracticalDecision(transferState, "TURN-02");
  assert.ok(novelTransfer && ["changed", "mixed"].includes(novelTransfer.kind));
  transferState = answerCorrect(transferState, novelTransfer.id, new Date("2026-09-18T03:09:00Z"));
  assert.equal(nextPracticalDecision(transferState, "TURN-02")?.kind, "boundary");
});

test("repair and retest routing stays ahead of scenario progression", () => {
  let state = turn02RecognitionReady();
  const failed = practicalDecisionById.get(TURN02_DIRECT_SAME_SCENARIO[0]);
  assert.ok(failed);
  const wrongAction = failed.actionOptions.find((option) => option.id !== failed.correctActionId);
  assert.ok(wrongAction);
  state = recordPracticalDecision(state, {
    decisionId: failed.id,
    actionId: wrongAction.id,
    reasonId: failed.correctReasonId,
    confidence: 80,
    now: new Date("2026-09-18T03:10:00Z"),
  });
  const repairSibling = nextPracticalDecision(state, "TURN-02");
  assert.ok(repairSibling && repairSibling.kind === "decision");
  assert.notEqual(repairSibling.id, failed.id);

  state = answerCorrect(state, repairSibling.id, new Date("2026-09-18T03:11:00Z"));
  assert.equal(nextPracticalDecision(state, "TURN-02")?.id, failed.id);
});

test("scenario-aware scheduler reaches transfer without looping across the progress corpus", () => {
  for (const skill of practicalProgressCountingSkills()) {
    if (!practicalSkillCorpusCanReach(skill.id, "CHANGED_NODE_TRANSFER")) continue;
    let state = createPracticalMasteryState(new Date("2026-09-18T04:00:00Z"));
    for (const progress of Object.values(state.skills)) progress.evidenceStage = "DECISION_TRAINED";
    state = markPracticalConceptTaught(state, skill.id, new Date("2026-09-18T04:00:01Z"));
    const routedIds = new Set();
    for (let step = 0; step < 32 && deriveEvidenceStage(state.skills[skill.id]) !== "CHANGED_NODE_TRANSFER"; step += 1) {
      const next = nextPracticalDecision(state, skill.id);
      assert.ok(next, skill.id + ": scheduler stranded before transfer");
      assert.equal(routedIds.has(next.id), false, skill.id + ": repeated " + next.id);
      routedIds.add(next.id);
      state = answerCorrect(state, next.id, new Date(Date.UTC(2026, 8, 18, 4, 1, step)));
    }
    assert.equal(
      deriveEvidenceStage(state.skills[skill.id]),
      "CHANGED_NODE_TRANSFER",
      skill.id + ": scheduler did not reach transfer inside bounded corpus",
    );
  }
});
