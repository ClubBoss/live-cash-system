import assert from "node:assert/strict";
import test from "node:test";

import { practicalDecisions } from "../content/practical-mastery/index.ts";
import {
  createPracticalMasteryState,
  markPracticalConceptTaught,
  practicalPrerequisitesMet,
  recordPracticalDecision,
} from "../lib/practical-mastery-core.ts";
import { firstJourneyProgress, recommendFirstJourneyStep } from "../lib/practical-first-journey.ts";

const QUICK_START_SKILLS = [
  "FND-01",
  "FND-02",
  "PF-01",
  "PF-04",
  "W4-BOARD-01",
  "IP-01",
  "BL-04",
  "W4-RUNOUT-01",
];

function recognitionDecisions(skillId) {
  return practicalDecisions.filter((decision) => decision.skillId === skillId && decision.kind === "recognition");
}

function reachRecognition(state, skillId, clockBase) {
  let next = markPracticalConceptTaught(state, skillId, new Date(clockBase));
  const decisions = recognitionDecisions(skillId);
  assert.ok(decisions.length >= 2, `${skillId} must have two recognition stimuli for Quick Start`);

  for (const [index, decision] of decisions.slice(0, 2).entries()) {
    next = recordPracticalDecision(next, {
      decisionId: decision.id,
      actionId: decision.correctActionId,
      reasonId: decision.correctReasonId,
      confidence: 65,
      now: new Date(clockBase + 1000 + index),
    });
  }
  return next;
}

test("fresh Quick Start reaches all eight canonical steps in exact order at recognition level", () => {
  let state = createPracticalMasteryState(new Date("2026-08-25T00:00:00.000Z"));

  for (const [index, skillId] of QUICK_START_SKILLS.entries()) {
    const recommendation = recommendFirstJourneyStep(state);
    assert.ok(recommendation, `step ${index + 1} must be reachable`);
    assert.equal(recommendation.skillId, skillId, `Quick Start must not skip step ${index + 1}`);
    assert.equal(recommendation.step, index + 1);

    state = reachRecognition(state, skillId, Date.parse("2026-08-25T00:00:00.000Z") + index * 10_000);
    const progress = firstJourneyProgress(state);
    assert.equal(progress.reached, index + 1);
    assert.equal(progress.total, 8);
    assert.equal(progress.completed, index === QUICK_START_SKILLS.length - 1);

    if (skillId === "FND-01") {
      assert.equal(
        practicalPrerequisitesMet(state, "FND-02"),
        false,
        "general mastery must still require DECISION_TRAINED for the hard dependency",
      );
      assert.equal(
        recommendFirstJourneyStep(state)?.skillId,
        "FND-02",
        "Quick Start alone must admit the next canonical step at recognition level",
      );
    }
  }

  assert.equal(recommendFirstJourneyStep(state), null);
  assert.deepEqual(firstJourneyProgress(state), { reached: 8, total: 8, completed: true });
});

test("V5-observed Russian learner-copy defects are absent from final runtime decisions", () => {
  const learnerRu = practicalDecisions.flatMap((decision) => [
    decision.cueRu,
    decision.questionRu,
    decision.explanationRu,
    ...decision.actionOptions.map((option) => option.textRu),
    ...decision.reasonOptions.map((option) => option.textRu),
  ]).join("\n");

  for (const stale of [
    "Небольшой открытие",
    "условия защиты BB из",
    "ограничения диапазона диапазона",
  ]) {
    assert.doesNotMatch(learnerRu, new RegExp(stale));
  }
});
