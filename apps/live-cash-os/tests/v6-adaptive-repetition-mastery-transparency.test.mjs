import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { practicalDecisionById, practicalDecisions, practicalSkillFamilies } from "../content/practical-mastery";
import { firstJourneySteps } from "../content/practical-mastery/first-journey";
import { buildAdaptiveIntegratedSession, isIntegratedFocusAdmissible } from "../lib/practical-adaptive-session";
import { nextFirstJourneyDecision } from "../lib/practical-first-journey";
import { RETENTION_INTERVAL_DAYS, recordIntegratedDecision } from "../lib/practical-integrated-session";
import { createPracticalMasteryState, markPracticalConceptTaught, recordPracticalDecision, stageAtLeast } from "../lib/practical-mastery-core";
import { PRACTICAL_EXACT_REPEAT_WINDOW, recentSuccessfulDecisionIds } from "../lib/practical-repeat-window";
import { practicalSkillProgressTransparency } from "../lib/practical-skill-transparency";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function correctInput(decisionId, confidence, now) {
  const decision = practicalDecisionById.get(decisionId);
  assert.ok(decision, `missing decision ${decisionId}`);
  return { actionId: decision.correctActionId, reasonId: decision.correctReasonId, confidence, now };
}

function wrongInput(decisionId, confidence, now) {
  const decision = practicalDecisionById.get(decisionId);
  assert.ok(decision, `missing decision ${decisionId}`);
  const actionId = decision.actionOptions.find((option) => option.id !== decision.correctActionId)?.id ?? decision.correctActionId;
  const reasonId = decision.reasonOptions.find((option) => option.id !== decision.correctReasonId)?.id ?? decision.correctReasonId;
  assert.ok(actionId !== decision.correctActionId || reasonId !== decision.correctReasonId, `missing wrong option for ${decisionId}`);
  return { actionId, reasonId, confidence, now };
}

function focusFixture() {
  for (const skillId of [...new Set(practicalDecisions.map((decision) => decision.skillId))]) {
    if (practicalDecisions.filter((decision) => decision.skillId === skillId).length < 6) continue;
    let state = createPracticalMasteryState(new Date("2026-08-26T00:00:00Z"));
    state = markPracticalConceptTaught(state, skillId, new Date("2026-08-26T00:00:01Z"));
    if (isIntegratedFocusAdmissible(state, skillId)) return { state, skillId };
  }
  throw new Error("No admissible multi-stimulus focus fixture found");
}

function quickStartSiblingFixture() {
  for (const step of firstJourneySteps) {
    const recognition = practicalDecisions.filter((decision) => decision.skillId === step.skillId && decision.kind === "recognition");
    if (recognition.length >= 2) return { skillId: step.skillId, decisions: recognition };
  }
  throw new Error("No Quick Start skill with sibling recognition stimuli found");
}

test("recently correct exact decisions are suppressed when another evidence-bearing stimulus exists", () => {
  let { state, skillId } = focusFixture();
  const now = new Date("2026-08-26T00:01:00Z");
  const first = buildAdaptiveIntegratedSession(state, now, 4, [], skillId);
  assert.equal(first.length, 4);

  for (const [index, item] of first.entries()) {
    state = recordIntegratedDecision(state, item, correctInput(item.decisionId, 65 + index * 5, new Date(now.getTime() + index * 1000)));
  }

  const suppressed = recentSuccessfulDecisionIds(state);
  assert.ok(first.every((item) => suppressed.has(item.decisionId)));
  const second = buildAdaptiveIntegratedSession(state, new Date(now.getTime() + 10_000), 4, [], skillId);
  assert.ok(second.length > 0, "fixture should have an eligible alternative");
  assert.ok(second.every((item) => !suppressed.has(item.decisionId)), "next round must prefer non-recent evidence-bearing stimuli");
  assert.deepEqual(
    buildAdaptiveIntegratedSession(state, new Date(now.getTime() + 10_000), 4, [], skillId),
    second,
    "same state/time must schedule deterministically",
  );
});

test("repeat suppression is bounded and never turns confidence into mastery evidence", () => {
  let { state, skillId } = focusFixture();
  const decision = practicalDecisions.find((candidate) => candidate.skillId === skillId);
  assert.ok(decision);
  const initialStage = state.skills[skillId].evidenceStage;

  for (const [index, confidence] of [65, 75, 85, 95].entries()) {
    state = recordPracticalDecision(state, {
      decisionId: decision.id,
      actionId: decision.correctActionId,
      reasonId: decision.correctReasonId,
      confidence,
      now: new Date(`2026-08-26T00:0${index + 2}:00Z`),
    });
  }

  assert.equal(state.skills[skillId].successfulDecisionIds.filter((id) => id === decision.id).length, 1);
  assert.equal(state.skills[skillId].evidenceStage, initialStage, "confidence and exact repeats cannot manufacture a stage advance");
  assert.equal(PRACTICAL_EXACT_REPEAT_WINDOW, 8);
  assert.ok(recentSuccessfulDecisionIds(state).has(decision.id));
});

test("wrong answers remain repair evidence rather than being hidden by successful-repeat suppression", () => {
  let { state, skillId } = focusFixture();
  const decision = practicalDecisions.find((candidate) => candidate.skillId === skillId);
  assert.ok(decision);
  const wrongAction = decision.actionOptions.find((option) => option.id !== decision.correctActionId)?.id ?? decision.correctActionId;
  const wrongReason = decision.reasonOptions.find((option) => option.id !== decision.correctReasonId)?.id ?? decision.correctReasonId;
  assert.ok(wrongAction !== decision.correctActionId || wrongReason !== decision.correctReasonId);

  state = recordPracticalDecision(state, {
    decisionId: decision.id,
    actionId: wrongAction,
    reasonId: wrongReason,
    confidence: 90,
    now: new Date("2026-08-26T00:02:00Z"),
  });

  assert.equal(state.skills[skillId].successfulDecisionIds.includes(decision.id), false);
  assert.equal(state.skills[skillId].lastIncorrectDecisionId, decision.id);
  assert.equal(recentSuccessfulDecisionIds(state).has(decision.id), false);
  const next = buildAdaptiveIntegratedSession(state, new Date("2026-08-26T00:03:00Z"), 4, [], skillId);
  assert.ok(next.length > 0, "wrong evidence must leave an actionable repair/practice path");
});

test("Quick Start wrong answer uses a non-identical sibling before returning to exact repair", () => {
  const { skillId, decisions } = quickStartSiblingFixture();
  let state = createPracticalMasteryState(new Date("2026-08-26T00:10:00Z"));
  state = markPracticalConceptTaught(state, skillId, new Date("2026-08-26T00:10:01Z"));
  state = recordPracticalDecision(state, {
    decisionId: decisions[0].id,
    ...wrongInput(decisions[0].id, 85, new Date("2026-08-26T00:11:00Z")),
  });

  const sibling = nextFirstJourneyDecision(state, skillId);
  assert.ok(sibling, "a non-identical Quick Start sibling should be available");
  assert.notEqual(sibling.id, decisions[0].id, "the exact wrong item must not immediately repeat");
  assert.equal(sibling.kind, "recognition", "same-kind repair is preferred when available");
  assert.deepEqual(nextFirstJourneyDecision(state, skillId), sibling, "Quick Start selection remains deterministic");

  state = recordPracticalDecision(state, {
    decisionId: sibling.id,
    ...correctInput(sibling.id, 70, new Date("2026-08-26T00:12:00Z")),
  });
  // V3-FND-02: the wrong item must not resurface after just this one intervening
  // decision while the skill still has a genuinely untried, non-recent decision
  // available (bypassing recentlyAttemptedDecisionIds() was the root cause of the
  // reported short-gap recurrence). A fresh decision is offered instead.
  const next = nextFirstJourneyDecision(state, skillId);
  assert.ok(next, "a further non-recent decision should be offered instead of repeating the wrong item");
  assert.notEqual(next.id, decisions[0].id, "the wrong item must not repeat after only one intervening decision while a non-recent alternative exists");
  assert.notEqual(next.id, sibling.id, "the just-answered sibling must not immediately repeat either");
  assert.equal(state.attempts.length, 2, "selection itself must not create attempts or double-count evidence");
});

test("Quick Start wrong answer fails closed when every non-identical supported sibling is already satisfied", () => {
  const { skillId, decisions } = quickStartSiblingFixture();
  let state = createPracticalMasteryState(new Date("2026-08-26T00:20:00Z"));
  state = markPracticalConceptTaught(state, skillId, new Date("2026-08-26T00:20:01Z"));
  const target = decisions[0];
  const supportedSiblings = practicalDecisions.filter((decision) => decision.skillId === skillId && decision.id !== target.id && (decision.kind === "recognition" || decision.kind === "decision" || decision.kind === "changed"));
  for (const [index, decision] of supportedSiblings.entries()) {
    state = recordPracticalDecision(state, {
      decisionId: decision.id,
      ...correctInput(decision.id, 70, new Date(1_787_704_100_000 + index * 1000)),
    });
  }
  state = recordPracticalDecision(state, {
    decisionId: target.id,
    ...wrongInput(target.id, 90, new Date("2026-08-26T00:25:00Z")),
  });
  assert.equal(nextFirstJourneyDecision(state, skillId), null, "scheduler must fail closed rather than fabricate a novel evidence item");
});

test("selected-skill transparency identifies satisfied and next required categories without changing policy", () => {
  const skill = practicalSkillFamilies.find((candidate) => stageAtLeast(candidate.targetEvidenceStage, "RECOGNITION_TRAINED") && practicalDecisions.filter((decision) => decision.skillId === candidate.id && decision.kind === "recognition").length >= 2);
  assert.ok(skill, "missing selected-skill transparency fixture");
  let state = createPracticalMasteryState(new Date("2026-08-26T00:30:00Z"));
  state = markPracticalConceptTaught(state, skill.id, new Date("2026-08-26T00:30:01Z"));

  let summary = practicalSkillProgressTransparency(state, skill.id, skill.targetEvidenceStage);
  assert.equal(summary.categories.find((category) => category.key === "CONCEPT")?.satisfied, true);
  assert.equal(summary.nextCategory?.key, "RECOGNITION");

  const recognition = practicalDecisions.find((decision) => decision.skillId === skill.id && decision.kind === "recognition");
  assert.ok(recognition);
  state = recordPracticalDecision(state, { decisionId: recognition.id, ...correctInput(recognition.id, 65, new Date("2026-08-26T00:31:00Z")) });
  state = recordPracticalDecision(state, { decisionId: recognition.id, ...correctInput(recognition.id, 95, new Date("2026-08-26T00:32:00Z")) });
  summary = practicalSkillProgressTransparency(state, skill.id, skill.targetEvidenceStage);
  assert.equal(summary.nextCategory?.key, "RECOGNITION", "one distinct correct recognition item must not satisfy the category");
  assert.equal(summary.recentCorrectCount, 2);
  assert.equal(summary.recentDistinctCorrectCount, 1);
  assert.equal(summary.latestConfidence, 95);
});

test("mastery thresholds and delayed retrieval policy remain unchanged", async () => {
  const core = await readFile(path.join(root, "lib/practical-mastery-core.ts"), "utf8");
  assert.match(core, /MIN_RECOGNITION_STIMULI = 2/);
  assert.match(core, /MIN_DIRECT_DECISION_STIMULI = 3/);
  assert.match(core, /MIN_TRANSFER_STIMULI = 2/);
  assert.match(core, /MIN_BOUNDARY_STIMULI = 1/);
  assert.deepEqual([...RETENTION_INTERVAL_DAYS], [1, 3, 7]);
  assert.match(core, /successfulDecisionIds\.includes\(decision\.id\)/);
});

test("Skill Map explains partial evidence without exposing decision IDs or inflating its percentage", async () => {
  const overview = await readFile(path.join(root, "components/PracticalSkillDomainOverview.tsx"), "utf8");
  const selected = await readFile(path.join(root, "components/PracticalMasteryExperience.tsx"), "utf8");
  assert.match(overview, /enough distinct independent decisions/);
  assert.match(overview, /exact repeat of an already-correct example counts once/i);
  assert.match(overview, /Confidence alone does not raise mastery/);
  assert.match(overview, /recentCorrect\.length/);
  assert.match(overview, /distinctCorrect/);
  assert.match(overview, /stageAtLeast\(mastery\.skills\[skill\.id\]\?\.evidenceStage \?\? "SOURCE_SUPPORTED", "DECISION_TRAINED"\)/);
  assert.match(selected, /HOW THIS SKILL ADVANCES/);
  assert.match(selected, /next required step/);
  assert.match(selected, /practicalSkillProgressTransparency/);
  assert.doesNotMatch(overview, /Частичное evidence|накапливают evidence|повышает mastery/);
  const learnerCopy = `${overview}\n${selected}`.replace(/data-[a-z-]+/giu, "");
  assert.doesNotMatch(learnerCopy, /decisionId\}/);
});

test("Quick Start authority is outside the integrated repeat scheduler seam", async () => {
  const authority = await readFile(path.join(root, "components/PracticalFirstJourneyAuthority.tsx"), "utf8");
  const experience = await readFile(path.join(root, "components/PracticalFirstJourneyExperience.tsx"), "utf8");
  assert.doesNotMatch(authority, /practical-repeat-window|buildAdaptiveIntegratedSession/);
  assert.doesNotMatch(experience, /practical-repeat-window|buildAdaptiveIntegratedSession/);
});
