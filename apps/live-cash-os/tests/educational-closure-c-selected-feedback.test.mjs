import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { practicalDecisions } from "../content/practical-mastery/index.ts";
import { practicalDecisionFeedbackCopy } from "../content/practical-mastery/practical-decision-feedback-copy.ts";
import {
  recordIntegratedAnswerContinuity,
  recordIntegratedRoundStartContinuity,
  restoreIntegratedRound,
  restoreQuickStartPostAnswer,
  withQuickStartPostAnswer,
} from "../lib/practical-continuity-workspace.ts";
import { createPracticalMasteryState, recordPracticalDecision } from "../lib/practical-mastery-core.ts";
import { createPracticalStudyWorkspace } from "../lib/practical-profile-state.ts";
import { practicalSelectedDecisionFeedback } from "../lib/practical-selected-decision-feedback.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const decision = practicalDecisions.find((candidate) =>
  candidate.actionOptions.filter((option) => option.id !== candidate.correctActionId).length >= 2
  && candidate.reasonOptions.some((option) => option.id !== candidate.correctReasonId),
);
assert.ok(decision, "fixture requires one decision with two wrong actions and one wrong reason");

const correctAction = decision.actionOptions.find((option) => option.id === decision.correctActionId);
const correctReason = decision.reasonOptions.find((option) => option.id === decision.correctReasonId);
const wrongActions = decision.actionOptions.filter((option) => option.id !== decision.correctActionId);
const wrongReasons = decision.reasonOptions.filter((option) => option.id !== decision.correctReasonId);
assert.ok(correctAction && correctReason && wrongActions.length >= 2 && wrongReasons.length >= 1);

function diagnose(locale, actionId, reasonId, correct = false) {
  return practicalSelectedDecisionFeedback(decision, locale, actionId, reasonId, correct);
}

test("A/B same decision produces materially different selected-action diagnosis", () => {
  const first = diagnose("en", wrongActions[0].id, correctReason.id);
  const second = diagnose("en", wrongActions[1].id, correctReason.id);
  assert.equal(first.action?.selectedText, wrongActions[0].textEn);
  assert.equal(second.action?.selectedText, wrongActions[1].textEn);
  assert.notEqual(first.action?.selectedText, second.action?.selectedText);
  assert.equal(first.reason, null);
  assert.equal(second.reason, null);
});

test("C raw misconception identifiers never enter learner feedback", () => {
  const allInternalIds = [...decision.actionOptions, ...decision.reasonOptions]
    .map((option) => option.misconception)
    .filter(Boolean);
  const renderedModel = JSON.stringify(diagnose("en", wrongActions[0].id, wrongReasons[0].id));
  for (const internalId of allInternalIds) assert.equal(renderedModel.includes(internalId), false, `${internalId} must stay internal`);
});

test("D/E/F/G dimensions are diagnosed independently and correct response is not falsely corrected", () => {
  const reasonOnly = diagnose("en", correctAction.id, wrongReasons[0].id);
  assert.equal(reasonOnly.action, null);
  assert.equal(reasonOnly.reason?.selectedText, wrongReasons[0].textEn);
  assert.equal(reasonOnly.reason?.correctText, correctReason.textEn);

  const actionOnly = diagnose("en", wrongActions[0].id, correctReason.id);
  assert.equal(actionOnly.action?.selectedText, wrongActions[0].textEn);
  assert.equal(actionOnly.action?.correctText, correctAction.textEn);
  assert.equal(actionOnly.reason, null);

  const both = diagnose("en", wrongActions[0].id, wrongReasons[0].id);
  assert.ok(both.action);
  assert.ok(both.reason);

  const fullyCorrect = diagnose("en", correctAction.id, correctReason.id, true);
  assert.equal(fullyCorrect.action, null);
  assert.equal(fullyCorrect.reason, null);
});

test("H/N authoritative mechanism and boundary remain identical in RU and EN", () => {
  const authoritative = practicalDecisionFeedbackCopy(decision);
  const ru = diagnose("ru", wrongActions[0].id, wrongReasons[0].id);
  const en = diagnose("en", wrongActions[0].id, wrongReasons[0].id);

  assert.equal(ru.action?.selectedText, wrongActions[0].textRu);
  assert.equal(ru.reason?.selectedText, wrongReasons[0].textRu);
  assert.equal(en.action?.selectedText, wrongActions[0].textEn);
  assert.equal(en.reason?.selectedText, wrongReasons[0].textEn);
  assert.equal(ru.mechanism, authoritative.mechanismRu);
  assert.equal(en.mechanism, authoritative.mechanismEn);
  assert.equal(ru.boundary, authoritative.boundaryRu ?? null);
  assert.equal(en.boundary, authoritative.boundaryEn ?? null);
});

test("I/J/M Quick Start immediate and POST_ANSWER restore use identical selected diagnosis with one attempt", () => {
  const initial = createPracticalMasteryState(new Date("2026-08-27T08:00:00Z"), true);
  const answered = recordPracticalDecision(initial, {
    decisionId: decision.id,
    actionId: wrongActions[0].id,
    reasonId: correctReason.id,
    confidence: 65,
    now: new Date("2026-08-27T08:01:00Z"),
  });
  const attempt = answered.attempts.at(-1);
  assert.ok(attempt);
  assert.equal(answered.attempts.length, 1);

  const immediate = practicalSelectedDecisionFeedback(decision, "ru", attempt.actionId, attempt.reasonId, attempt.correct);
  const workspace = withQuickStartPostAnswer(createPracticalStudyWorkspace(), answered.contentVersion, {
    skillId: decision.skillId,
    decisionId: decision.id,
    attemptId: attempt.id,
  });
  const restored = restoreQuickStartPostAnswer(workspace, answered);
  assert.equal(restored.status, "VALID");
  const afterReturn = practicalSelectedDecisionFeedback(decision, "ru", restored.attempt.actionId, restored.attempt.reasonId, restored.attempt.correct);

  assert.deepEqual(afterReturn, immediate);
  assert.equal(answered.attempts.length, 1, "restore must not record another attempt");
});

test("K/L/M Integrated immediate and POST_ANSWER restore use identical selected diagnosis with one attempt", () => {
  const initial = createPracticalMasteryState(new Date("2026-08-27T09:00:00Z"), true);
  const item = {
    decisionId: decision.id,
    skillId: decision.skillId,
    priority: 100,
    reason: "REINFORCE",
    whyAfterAnswer: "selected-feedback fixture",
    retentionTierDays: null,
  };
  const items = [item];
  const started = recordIntegratedRoundStartContinuity(
    createPracticalStudyWorkspace(),
    initial.contentVersion,
    { focusSkillId: null, items },
    new Date("2026-08-27T09:00:01Z"),
  );
  assert.ok(started);
  const answered = recordPracticalDecision(initial, {
    decisionId: decision.id,
    actionId: correctAction.id,
    reasonId: wrongReasons[0].id,
    confidence: 71,
    now: new Date("2026-08-27T09:01:00Z"),
  });
  const attempt = answered.attempts.at(-1);
  assert.ok(attempt);
  assert.equal(answered.attempts.length, 1);

  const immediate = practicalSelectedDecisionFeedback(decision, "en", attempt.actionId, attempt.reasonId, attempt.correct);
  const pending = recordIntegratedAnswerContinuity(started, answered.contentVersion, {
    focusSkillId: null,
    items,
    answeredIndex: 0,
    attemptId: attempt.id,
  }, new Date("2026-08-27T09:01:01Z"));
  assert.ok(pending);

  for (let pass = 0; pass < 2; pass += 1) {
    const restored = restoreIntegratedRound(pending, answered, null);
    assert.equal(restored.status, "VALID");
    assert.equal(restored.postAnswerAttempt?.id, attempt.id);
    const afterReturn = practicalSelectedDecisionFeedback(
      decision,
      "en",
      restored.postAnswerAttempt.actionId,
      restored.postAnswerAttempt.reasonId,
      restored.postAnswerAttempt.correct,
    );
    assert.deepEqual(afterReturn, immediate);
  }
  assert.equal(answered.attempts.length, 1, "repeated restore must not record another attempt");
});

test("all reachable scored feedback callers pass exact selected IDs", async () => {
  const [quickStart, integrated, perceptual] = await Promise.all([
    readFile(path.join(root, "components/PracticalFirstJourneyExperience.tsx"), "utf8"),
    readFile(path.join(root, "components/PracticalIntegratedSessionExperience.tsx"), "utf8"),
    readFile(path.join(root, "components/PracticalPerceptualExperience.tsx"), "utf8"),
  ]);
  for (const source of [quickStart, integrated, perceptual]) {
    assert.match(source, /PracticalDecisionFeedback[^>]+selectedActionId=\{actionId\}[^>]+selectedReasonId=\{reasonId\}/s);
  }
});

test("O selected feedback stays block-flow friendly at 390px", async () => {
  const component = await readFile(path.join(root, "components/PracticalDecisionFeedback.tsx"), "utf8");
  assert.match(component, /data-practical-selected-action/);
  assert.match(component, /data-practical-selected-reason/);
  assert.equal(/whiteSpace\s*:\s*["']nowrap["']/.test(component), false);
  assert.equal(/minWidth\s*:/.test(component), false);
  assert.equal(/width\s*:\s*\d/.test(component), false);
});
