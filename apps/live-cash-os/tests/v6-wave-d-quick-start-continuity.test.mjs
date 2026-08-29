import assert from "node:assert/strict";
import test from "node:test";
import { practicalDecisions } from "../content/practical-mastery/index.ts";
import {
  restoreQuickStartDraft,
  restoreQuickStartPostAnswer,
  withQuickStartDraft,
  withQuickStartPostAnswer,
} from "../lib/practical-continuity-workspace.ts";
import { createPracticalMasteryState, recordPracticalDecision } from "../lib/practical-mastery-core.ts";
import { createPracticalStudyWorkspace } from "../lib/practical-profile-state.ts";

test("V6-D in-progress Quick Start draft restores semantic selections with zero mastery or evidence mutation", () => {
  const decision = practicalDecisions[0];
  assert.ok(decision);
  const state = createPracticalMasteryState(new Date("2026-08-26T00:00:00Z"), true);
  const masteryBefore = JSON.stringify(state);
  const workspace = withQuickStartDraft(createPracticalStudyWorkspace(), state.contentVersion, {
    skillId: decision.skillId,
    decisionId: decision.id,
    selectedActionId: decision.correctActionId,
    selectedReasonId: decision.correctReasonId,
  }, new Date("2026-08-26T00:01:00Z"));

  assert.equal(workspace.continuity?.quickStart?.phase, "IN_PROGRESS");
  const restored = restoreQuickStartDraft(workspace, state, decision.skillId, decision.id);
  assert.deepEqual(restored, {
    status: "VALID",
    skillId: decision.skillId,
    decisionId: decision.id,
    selectedActionId: decision.correctActionId,
    selectedReasonId: decision.correctReasonId,
  });
  assert.equal(JSON.stringify(state), masteryBefore, "draft save/restore must not mutate mastery");
  assert.equal(state.attempts.length, 0, "draft must not create an attempt");
  assert.equal(state.revision, 0, "draft must not increment mastery revision");
});

test("CONT-01 unanswered Quick Start item restores its exact identity without fabricating selections or evidence", () => {
  const decision = practicalDecisions[0];
  assert.ok(decision);
  const state = createPracticalMasteryState(new Date("2026-08-29T00:00:00Z"), true);
  const masteryBefore = JSON.stringify(state);
  const workspace = withQuickStartDraft(createPracticalStudyWorkspace(), state.contentVersion, {
    skillId: decision.skillId,
    decisionId: decision.id,
    selectedActionId: null,
    selectedReasonId: null,
  });

  const restored = restoreQuickStartDraft(workspace, state, decision.skillId, decision.id);
  assert.deepEqual(restored, {
    status: "VALID",
    skillId: decision.skillId,
    decisionId: decision.id,
    selectedActionId: null,
    selectedReasonId: null,
  });
  assert.equal(JSON.stringify(state), masteryBefore);
  assert.equal(state.attempts.length, 0);
});

test("V6-D stale or incompatible Quick Start drafts fail closed", () => {
  const [decision, otherDecision] = practicalDecisions.slice(0, 2);
  assert.ok(decision && otherDecision);
  const state = createPracticalMasteryState(new Date("2026-08-26T00:00:00Z"), true);
  const workspace = withQuickStartDraft(createPracticalStudyWorkspace(), state.contentVersion, {
    skillId: decision.skillId,
    decisionId: decision.id,
    selectedActionId: decision.correctActionId,
    selectedReasonId: null,
  });
  const masteryBefore = JSON.stringify(state);

  assert.equal(restoreQuickStartDraft({
    ...workspace,
    continuity: { ...workspace.continuity, contentVersion: "stale-v6-content" },
  }, state, decision.skillId, decision.id).status, "STALE");
  assert.equal(restoreQuickStartDraft(workspace, state, otherDecision.skillId, otherDecision.id).status, "INVALID");
  assert.equal(restoreQuickStartDraft({
    ...workspace,
    continuity: {
      ...workspace.continuity,
      quickStart: {
        ...workspace.continuity.quickStart,
        selectedActionId: "UNKNOWN-ACTION",
      },
    },
  }, state, decision.skillId, decision.id).status, "INVALID");
  assert.equal(JSON.stringify(state), masteryBefore);
  assert.equal(state.attempts.length, 0);
  assert.equal(state.revision, 0);
});

test("V6-D accepted submit atomically replaces the draft with one authoritative post-answer attempt", () => {
  const decision = practicalDecisions[0];
  assert.ok(decision);
  const initial = createPracticalMasteryState(new Date("2026-08-26T00:00:00Z"), true);
  const draftWorkspace = withQuickStartDraft(createPracticalStudyWorkspace(), initial.contentVersion, {
    skillId: decision.skillId,
    decisionId: decision.id,
    selectedActionId: decision.correctActionId,
    selectedReasonId: decision.correctReasonId,
  });
  const submitted = recordPracticalDecision(initial, {
    decisionId: decision.id,
    actionId: decision.correctActionId,
    reasonId: decision.correctReasonId,
    confidence: 65,
    now: new Date("2026-08-26T00:02:00Z"),
  });
  const attempt = submitted.attempts.at(-1);
  assert.ok(attempt);

  const postAnswerWorkspace = withQuickStartPostAnswer(draftWorkspace, submitted.contentVersion, {
    skillId: decision.skillId,
    decisionId: decision.id,
    attemptId: attempt.id,
  });
  assert.equal(postAnswerWorkspace.continuity?.quickStart?.phase, "POST_ANSWER");
  assert.equal(restoreQuickStartDraft(postAnswerWorkspace, submitted, decision.skillId, decision.id).status, "NONE");
  const restored = restoreQuickStartPostAnswer(postAnswerWorkspace, submitted);
  assert.equal(restored.status, "VALID");
  assert.equal(restored.attempt.id, attempt.id);
  assert.equal(submitted.attempts.length, 1, "one submit must create exactly one attempt");
});
