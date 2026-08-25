import assert from "node:assert/strict";
import test from "node:test";
import { allPracticalTableStates, practicalDecisions } from "../content/practical-mastery/index.ts";
import {
  clearQuickStartContinuity,
  recordIntegratedAnswerContinuity,
  restoreIntegratedRound,
  restorePerceptualCursor,
  restoreQuickStartPostAnswer,
  withPerceptualCursor,
  withQuickStartPostAnswer,
} from "../lib/practical-continuity-workspace.ts";
import { createPracticalMasteryState, recordPracticalDecision } from "../lib/practical-mastery-core.ts";
import { createPracticalStudyWorkspace } from "../lib/practical-profile-state.ts";

function answer(state, decision, now) {
  return recordPracticalDecision(state, {
    decisionId: decision.id,
    actionId: decision.correctActionId,
    reasonId: decision.correctReasonId,
    confidence: 65,
    now,
  });
}

test("V3-06b Quick Start continuity restores only the authoritative scored attempt", () => {
  const decision = practicalDecisions[0];
  const before = createPracticalMasteryState(new Date("2026-08-24T00:00:00Z"), true);
  const after = answer(before, decision, new Date("2026-08-24T00:01:00Z"));
  const attempt = after.attempts.at(-1);
  assert.ok(attempt);

  const workspace = withQuickStartPostAnswer(createPracticalStudyWorkspace(), after.contentVersion, {
    skillId: decision.skillId,
    decisionId: decision.id,
    attemptId: attempt.id,
  }, new Date("2026-08-24T00:01:01Z"));
  const restored = restoreQuickStartPostAnswer(workspace, after);
  assert.equal(restored.status, "VALID");
  assert.equal(restored.attempt.id, attempt.id);
  assert.equal(restored.attempt.actionId, attempt.actionId);
  assert.equal(restored.attempt.reasonId, attempt.reasonId);
  assert.equal(after.attempts.length, 1, "restore must not create evidence");

  const cleared = clearQuickStartContinuity(workspace, after.contentVersion, new Date("2026-08-24T00:02:00Z"));
  assert.equal(restoreQuickStartPostAnswer(cleared, after).status, "NONE");
});

test("V3-06b stale content and missing attempt ancestry fail closed", () => {
  const decision = practicalDecisions[0];
  const state = createPracticalMasteryState(new Date("2026-08-24T00:00:00Z"), true);
  const workspace = withQuickStartPostAnswer(createPracticalStudyWorkspace(), state.contentVersion, {
    skillId: decision.skillId,
    decisionId: decision.id,
    attemptId: "missing-attempt",
  });
  assert.equal(restoreQuickStartPostAnswer(workspace, state).status, "INVALID");
  assert.equal(restoreQuickStartPostAnswer({ ...workspace, continuity: { ...workspace.continuity, contentVersion: "old-content" } }, state).status, "STALE");
});

test("V3-06c integrated continuity resumes the next unanswered item without duplicating evidence", () => {
  const [first, second] = practicalDecisions.filter((decision) => decision.skillId === practicalDecisions[0].skillId).slice(0, 2);
  assert.ok(first && second);
  const initial = createPracticalMasteryState(new Date("2026-08-24T00:00:00Z"), true);
  const afterFirst = answer(initial, first, new Date("2026-08-24T00:01:00Z"));
  const attempt = afterFirst.attempts.at(-1);
  assert.ok(attempt);
  const items = [first, second].map((decision, index) => ({
    decisionId: decision.id,
    skillId: decision.skillId,
    priority: 100 - index,
    reason: "REINFORCE",
    whyAfterAnswer: "continuity fixture",
    retentionTierDays: null,
  }));

  const workspace = recordIntegratedAnswerContinuity(createPracticalStudyWorkspace(), afterFirst.contentVersion, {
    focusSkillId: first.skillId,
    items,
    answeredIndex: 0,
    attemptId: attempt.id,
  }, new Date("2026-08-24T00:01:01Z"));
  assert.ok(workspace);
  const restored = restoreIntegratedRound(workspace, afterFirst, first.skillId);
  assert.equal(restored.status, "VALID");
  assert.equal(restored.nextIndex, 1);
  assert.equal(restored.items[1].decisionId, second.id);
  assert.equal(afterFirst.attempts.length, 1, "restoring the cursor must not resubmit Q1");
  assert.equal(restoreIntegratedRound(workspace, afterFirst, null).status, "NONE", "focused workspace cannot leak into generic routing");
});

test("V3-06c integrated workspace fails closed on stale content or broken submitted-attempt prefix", () => {
  const [first, second] = practicalDecisions.filter((decision) => decision.skillId === practicalDecisions[0].skillId).slice(0, 2);
  assert.ok(first && second);
  const state = createPracticalMasteryState(new Date("2026-08-24T00:00:00Z"), true);
  const items = [first, second].map((decision) => ({
    decisionId: decision.id,
    skillId: decision.skillId,
    priority: 90,
    reason: "REINFORCE",
    whyAfterAnswer: "continuity fixture",
    retentionTierDays: null,
  }));
  const base = createPracticalStudyWorkspace();
  const continuity = {
    version: 1,
    contentVersion: state.contentVersion,
    quickStart: null,
    integrated: {
      focusSkillId: first.skillId,
      items,
      nextIndex: 1,
      submittedAttemptIds: ["missing-attempt"],
      updatedAt: new Date().toISOString(),
    },
  };
  const broken = { ...base, continuity };
  assert.equal(restoreIntegratedRound(broken, state, first.skillId).status, "INVALID");
  assert.equal(restoreIntegratedRound({ ...broken, continuity: { ...continuity, contentVersion: "old-content" } }, state, first.skillId).status, "STALE");
});

test("V4-D Table Reading continuity restores only an eligible decision cursor and never creates evidence", () => {
  const [first, second] = allPracticalTableStates.slice(0, 2);
  assert.ok(first && second);
  const state = createPracticalMasteryState(new Date("2026-08-25T00:00:00Z"), true);
  const beforeAttempts = state.attempts.length;
  const beforeRevision = state.revision;
  const workspace = withPerceptualCursor(
    createPracticalStudyWorkspace(),
    state.contentVersion,
    second.decisionId,
    new Date("2026-08-25T00:01:00Z"),
  );

  const restored = restorePerceptualCursor(workspace, state, [first.decisionId, second.decisionId]);
  assert.deepEqual(restored, { status: "VALID", decisionId: second.decisionId });
  assert.equal(state.attempts.length, beforeAttempts, "cursor restore must not create attempts");
  assert.equal(state.revision, beforeRevision, "cursor restore must not mutate mastery revision");
  assert.equal(workspace.continuity?.quickStart, null);
  assert.equal(workspace.continuity?.integrated, null);
});

test("V4-D Table Reading continuity fails closed for stale or ineligible cursors", () => {
  const [first, second] = allPracticalTableStates.slice(0, 2);
  assert.ok(first && second);
  const state = createPracticalMasteryState(new Date("2026-08-25T00:00:00Z"), true);
  const workspace = withPerceptualCursor(createPracticalStudyWorkspace(), state.contentVersion, second.decisionId);

  assert.equal(restorePerceptualCursor(workspace, state, [first.decisionId]).status, "INVALID");
  const stale = {
    ...workspace,
    continuity: { ...workspace.continuity, contentVersion: "old-content" },
  };
  assert.equal(restorePerceptualCursor(stale, state, [first.decisionId, second.decisionId]).status, "STALE");
  assert.equal(state.attempts.length, 0);
  assert.equal(state.revision, 0);
});
