import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { practicalDecisionById, practicalDecisions } from "../content/practical-mastery";
import { buildAdaptiveIntegratedSession, isIntegratedFocusAdmissible } from "../lib/practical-adaptive-session";
import { RETENTION_INTERVAL_DAYS, recordIntegratedDecision } from "../lib/practical-integrated-session";
import { createPracticalMasteryState, markPracticalConceptTaught, recordPracticalDecision } from "../lib/practical-mastery-core";
import { PRACTICAL_EXACT_REPEAT_WINDOW, recentSuccessfulDecisionIds } from "../lib/practical-repeat-window";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function correctInput(decisionId, confidence, now) {
  const decision = practicalDecisionById.get(decisionId);
  assert.ok(decision, `missing decision ${decisionId}`);
  return { actionId: decision.correctActionId, reasonId: decision.correctReasonId, confidence, now };
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
  assert.match(overview, /enough distinct independent decisions/);
  assert.match(overview, /exact repeat of an already-correct example counts once/i);
  assert.match(overview, /Confidence alone does not raise mastery/);
  assert.match(overview, /recentCorrect\.length/);
  assert.match(overview, /distinctCorrect/);
  assert.match(overview, /stageAtLeast\(mastery\.skills\[skill\.id\]\?\.evidenceStage \?\? "SOURCE_SUPPORTED", "DECISION_TRAINED"\)/);
  const learnerCopy = overview.replace(/data-[a-z-]+/giu, "");
  assert.doesNotMatch(learnerCopy, /decisionId\}/);
});

test("Quick Start authority is outside the repeat scheduler seam", async () => {
  const authority = await readFile(path.join(root, "components/PracticalFirstJourneyAuthority.tsx"), "utf8");
  const experience = await readFile(path.join(root, "components/PracticalFirstJourneyExperience.tsx"), "utf8");
  assert.doesNotMatch(authority, /practical-repeat-window|buildAdaptiveIntegratedSession/);
  assert.doesNotMatch(experience, /practical-repeat-window|buildAdaptiveIntegratedSession/);
});
