import assert from "node:assert/strict";
import test from "node:test";
import { practicalDecisions } from "../content/practical-mastery/index.ts";
import {
  advanceIntegratedContinuity,
  recordIntegratedAnswerContinuity,
  recordIntegratedRoundStartContinuity,
  restoreIntegratedRound,
} from "../lib/practical-continuity-workspace.ts";
import { createPracticalMasteryState, recordPracticalDecision } from "../lib/practical-mastery-core.ts";
import { createPracticalStudyWorkspace } from "../lib/practical-profile-state.ts";

function fixture() {
  const skillId = practicalDecisions.find((decision) => practicalDecisions.filter((candidate) => candidate.skillId === decision.skillId).length >= 2).skillId;
  const decisions = practicalDecisions.filter((decision) => decision.skillId === skillId).slice(0, 2);
  const items = decisions.map((decision) => ({
    decisionId: decision.id,
    skillId,
    priority: 100,
    reason: "REINFORCE",
    whyAfterAnswer: "post-answer fixture",
    retentionTierDays: null,
  }));
  return { skillId, decisions, items };
}

function answer(mastery, decision, at) {
  return recordPracticalDecision(mastery, {
    decisionId: decision.id,
    actionId: decision.correctActionId,
    reasonId: decision.correctReasonId,
    confidence: 68,
    now: new Date(at),
  });
}

function submit(workspace, mastery, items, focusSkillId, answeredIndex, attemptId, at) {
  return recordIntegratedAnswerContinuity(workspace, mastery.contentVersion, {
    focusSkillId,
    items,
    answeredIndex,
    attemptId,
  }, new Date(at));
}

test("generic POST_ANSWER restores the same submitted item repeatedly without evidence duplication", () => {
  const { decisions, items } = fixture();
  const initial = createPracticalMasteryState(new Date("2026-08-27T00:00:00Z"), true);
  const started = recordIntegratedRoundStartContinuity(createPracticalStudyWorkspace(), initial.contentVersion, { focusSkillId: null, items }, new Date("2026-08-27T00:00:01Z"));
  assert.ok(started);
  const answered = answer(initial, decisions[0], "2026-08-27T00:01:00Z");
  const attempt = answered.attempts.at(-1);
  assert.ok(attempt);
  const pending = submit(started, answered, items, null, 0, attempt.id, "2026-08-27T00:01:01Z");
  assert.ok(pending);

  const masterySnapshot = JSON.stringify(answered);
  for (let pass = 0; pass < 3; pass += 1) {
    const restored = restoreIntegratedRound(pending, answered, null);
    assert.equal(restored.status, "VALID");
    assert.equal(restored.nextIndex, 0);
    assert.equal(restored.items[0].decisionId, decisions[0].id);
    assert.equal(restored.postAnswerAttempt?.id, attempt.id);
    assert.equal(JSON.stringify(answered), masterySnapshot);
  }
  assert.equal(answered.attempts.length, 1);
  assert.deepEqual(answered.skills[decisions[0].skillId].successfulDecisionIds, [decisions[0].id]);
});

test("focused POST_ANSWER preserves focus identity and Next advances exactly once", () => {
  const { skillId, decisions, items } = fixture();
  const initial = createPracticalMasteryState(new Date("2026-08-27T01:00:00Z"), true);
  const started = recordIntegratedRoundStartContinuity(createPracticalStudyWorkspace(), initial.contentVersion, { focusSkillId: skillId, items }, new Date("2026-08-27T01:00:01Z"));
  assert.ok(started);
  const answered = answer(initial, decisions[0], "2026-08-27T01:01:00Z");
  const attempt = answered.attempts.at(-1);
  const pending = submit(started, answered, items, skillId, 0, attempt.id, "2026-08-27T01:01:01Z");
  assert.ok(pending);

  assert.equal(restoreIntegratedRound(pending, answered, null).status, "NONE");
  const focused = restoreIntegratedRound(pending, answered, skillId);
  assert.equal(focused.status, "VALID");
  assert.equal(focused.nextIndex, 0);
  assert.equal(focused.postAnswerAttempt?.decisionId, decisions[0].id);

  const advanced = advanceIntegratedContinuity(pending, answered.contentVersion, {
    focusSkillId: skillId,
    items,
    answeredIndex: 0,
    attemptId: attempt.id,
  }, new Date("2026-08-27T01:01:02Z"));
  assert.ok(advanced);
  const q2 = restoreIntegratedRound(advanced, answered, skillId);
  assert.equal(q2.status, "VALID");
  assert.equal(q2.nextIndex, 1);
  assert.equal(q2.postAnswerAttempt, null);
  assert.equal(q2.items[1].decisionId, decisions[1].id);
  assert.equal(answered.attempts.length, 1);

  assert.equal(advanceIntegratedContinuity(advanced, answered.contentVersion, {
    focusSkillId: skillId,
    items,
    answeredIndex: 0,
    attemptId: attempt.id,
  }), null, "the same acknowledgement cannot advance twice");
});

test("final-question POST_ANSWER remains on final feedback until acknowledgement, then becomes COMPLETE cursor", () => {
  const { decisions, items } = fixture();
  let mastery = createPracticalMasteryState(new Date("2026-08-27T02:00:00Z"), true);
  let workspace = recordIntegratedRoundStartContinuity(createPracticalStudyWorkspace(), mastery.contentVersion, { focusSkillId: null, items }, new Date("2026-08-27T02:00:01Z"));
  assert.ok(workspace);

  mastery = answer(mastery, decisions[0], "2026-08-27T02:01:00Z");
  let attempt = mastery.attempts.at(-1);
  workspace = submit(workspace, mastery, items, null, 0, attempt.id, "2026-08-27T02:01:01Z");
  workspace = advanceIntegratedContinuity(workspace, mastery.contentVersion, { focusSkillId: null, items, answeredIndex: 0, attemptId: attempt.id }, new Date("2026-08-27T02:01:02Z"));
  assert.ok(workspace);

  mastery = answer(mastery, decisions[1], "2026-08-27T02:02:00Z");
  attempt = mastery.attempts.at(-1);
  const finalPending = submit(workspace, mastery, items, null, 1, attempt.id, "2026-08-27T02:02:01Z");
  assert.ok(finalPending);
  const restoredFinal = restoreIntegratedRound(finalPending, mastery, null);
  assert.equal(restoredFinal.status, "VALID");
  assert.equal(restoredFinal.nextIndex, 1);
  assert.equal(restoredFinal.postAnswerAttempt?.decisionId, decisions[1].id);
  assert.equal(mastery.attempts.length, 2);

  const complete = advanceIntegratedContinuity(finalPending, mastery.contentVersion, { focusSkillId: null, items, answeredIndex: 1, attemptId: attempt.id }, new Date("2026-08-27T02:02:02Z"));
  assert.ok(complete);
  const restoredComplete = restoreIntegratedRound(complete, mastery, null);
  assert.equal(restoredComplete.status, "VALID");
  assert.equal(restoredComplete.nextIndex, items.length);
  assert.equal(restoredComplete.postAnswerAttempt, null);
  assert.equal(mastery.attempts.length, 2);
});

test("pre-answer Q1 checkpoint remains unchanged and creates zero evidence", () => {
  const { items } = fixture();
  const mastery = createPracticalMasteryState(new Date("2026-08-27T03:00:00Z"), true);
  const workspace = recordIntegratedRoundStartContinuity(createPracticalStudyWorkspace(), mastery.contentVersion, { focusSkillId: null, items }, new Date("2026-08-27T03:00:01Z"));
  const restored = restoreIntegratedRound(workspace, mastery, null);
  assert.equal(restored.status, "VALID");
  assert.equal(restored.nextIndex, 0);
  assert.equal(restored.postAnswerAttempt, null);
  assert.equal(mastery.attempts.length, 0);
  assert.equal(mastery.revision, 0);
});
