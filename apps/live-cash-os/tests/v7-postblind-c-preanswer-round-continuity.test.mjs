import assert from "node:assert/strict";
import test from "node:test";
import { practicalDecisions } from "../content/practical-mastery/index.ts";
import {
  activeIntegratedRoundResume,
  advanceIntegratedContinuity,
  recordIntegratedAnswerContinuity,
  recordIntegratedDraftContinuity,
  recordIntegratedRoundStartContinuity,
  restoreIntegratedRound,
} from "../lib/practical-continuity-workspace.ts";
import { createPracticalMasteryState, recordPracticalDecision } from "../lib/practical-mastery-core.ts";
import { createPracticalStudyWorkspace } from "../lib/practical-profile-state.ts";

function itemsFor(skillId) {
  return practicalDecisions.filter((decision) => decision.skillId === skillId).slice(0, 2).map((decision) => ({
    decisionId: decision.id,
    skillId: decision.skillId,
    priority: 100,
    reason: "REINFORCE",
    whyAfterAnswer: "V7-C fixture",
    retentionTierDays: null,
  }));
}

test("V7 Post-Blind C replaces a stale COMPLETE cursor with an explicitly started active Q1 round", () => {
  const mastery = createPracticalMasteryState(new Date("2026-08-26T00:00:00Z"), true);
  const skillId = practicalDecisions[0].skillId;
  const items = itemsFor(skillId);
  assert.equal(items.length, 2);
  const base = createPracticalStudyWorkspace();
  const staleComplete = {
    ...base,
    continuity: {
      version: 1,
      contentVersion: mastery.contentVersion,
      quickStart: null,
      integrated: {
        focusSkillId: skillId,
        items,
        nextIndex: items.length,
        submittedAttemptIds: ["old-a", "old-b"],
        updatedAt: "2026-08-26T00:01:00.000Z",
      },
    },
  };

  const beforeMastery = JSON.stringify(mastery);
  const started = recordIntegratedRoundStartContinuity(staleComplete, mastery.contentVersion, { focusSkillId: skillId, items }, new Date("2026-08-26T00:02:00Z"));
  assert.ok(started);
  assert.equal(started.continuity.integrated.nextIndex, 0);
  assert.deepEqual(started.continuity.integrated.submittedAttemptIds, []);
  const restored = restoreIntegratedRound(started, mastery, skillId);
  assert.equal(restored.status, "VALID");
  assert.equal(restored.nextIndex, 0);
  assert.equal(restored.postAnswerAttempt, null);
  assert.equal(restored.items[0].decisionId, items[0].decisionId);
  assert.equal(JSON.stringify(mastery), beforeMastery, "starting a round must not mutate mastery");
  assert.equal(mastery.attempts.length, 0, "starting a round must create zero attempts/evidence");
  assert.equal(mastery.revision, 0, "starting a round must create zero mastery/progress revision");
});

test("V7 Post-Blind C keeps Q1 feedback durable until explicit Next advances to Q2", () => {
  const initial = createPracticalMasteryState(new Date("2026-08-26T00:00:00Z"), true);
  const skillId = practicalDecisions[0].skillId;
  const items = itemsFor(skillId);
  const started = recordIntegratedRoundStartContinuity(createPracticalStudyWorkspace(), initial.contentVersion, { focusSkillId: skillId, items }, new Date("2026-08-26T00:01:00Z"));
  assert.ok(started);
  const first = practicalDecisions.find((decision) => decision.id === items[0].decisionId);
  assert.ok(first);
  const afterFirst = recordPracticalDecision(initial, {
    decisionId: first.id,
    actionId: first.correctActionId,
    reasonId: first.correctReasonId,
    confidence: 65,
    now: new Date("2026-08-26T00:02:00Z"),
  });
  const attempt = afterFirst.attempts.at(-1);
  assert.ok(attempt);
  const afterSubmit = recordIntegratedAnswerContinuity(started, afterFirst.contentVersion, {
    focusSkillId: skillId,
    items,
    answeredIndex: 0,
    attemptId: attempt.id,
  }, new Date("2026-08-26T00:02:01Z"));
  assert.ok(afterSubmit);
  const restoredFeedback = restoreIntegratedRound(afterSubmit, afterFirst, skillId);
  assert.equal(restoredFeedback.status, "VALID");
  assert.equal(restoredFeedback.nextIndex, 0);
  assert.equal(restoredFeedback.postAnswerAttempt?.id, attempt.id);
  assert.equal(restoredFeedback.items[0].decisionId, items[0].decisionId);
  assert.equal(afterFirst.attempts.length, 1);

  const afterNext = advanceIntegratedContinuity(afterSubmit, afterFirst.contentVersion, {
    focusSkillId: skillId,
    items,
    answeredIndex: 0,
    attemptId: attempt.id,
  }, new Date("2026-08-26T00:02:02Z"));
  assert.ok(afterNext);
  const restoredQ2 = restoreIntegratedRound(afterNext, afterFirst, skillId);
  assert.equal(restoredQ2.status, "VALID");
  assert.equal(restoredQ2.nextIndex, 1);
  assert.equal(restoredQ2.postAnswerAttempt, null);
  assert.equal(restoredQ2.items[1].decisionId, items[1].decisionId);
  assert.equal(afterFirst.attempts.length, 1, "Next must not create a second attempt");
});

test("V7 Post-Blind C rejects empty or oversized round-start checkpoints", () => {
  const mastery = createPracticalMasteryState(new Date("2026-08-26T00:00:00Z"), true);
  const workspace = createPracticalStudyWorkspace();
  assert.equal(recordIntegratedRoundStartContinuity(workspace, mastery.contentVersion, { focusSkillId: null, items: [] }), null);
  const item = itemsFor(practicalDecisions[0].skillId)[0];
  assert.ok(item);
  assert.equal(recordIntegratedRoundStartContinuity(workspace, mastery.contentVersion, { focusSkillId: null, items: Array.from({ length: 9 }, () => item) }), null);
});

test("LC-AUD-025 generic and focused pre-submit drafts survive durable restore without mastery mutation", () => {
  const mastery = createPracticalMasteryState(new Date("2026-09-16T00:00:00Z"), true);
  const skillId = practicalDecisions[0].skillId;
  const items = itemsFor(skillId);
  assert.equal(items.length, 2);
  const first = practicalDecisions.find((decision) => decision.id === items[0].decisionId);
  assert.ok(first);
  const actionId = first.actionOptions[0].id;
  const reasonId = first.reasonOptions[0].id;
  const masteryBefore = JSON.stringify(mastery);

  for (const focusSkillId of [null, skillId]) {
    const started = recordIntegratedRoundStartContinuity(
      createPracticalStudyWorkspace(),
      mastery.contentVersion,
      { focusSkillId, items },
      new Date("2026-09-16T00:01:00Z"),
    );
    assert.ok(started);
    assert.equal(started.continuity.integrated.draft, null);

    const untouchedConfidenceDraft = recordIntegratedDraftContinuity(
      started,
      mastery.contentVersion,
      {
        focusSkillId,
        items,
        index: 0,
        actionId,
        reasonId,
        confidence: 65,
        confidenceProvenance: "NOT_CAPTURED",
      },
      new Date("2026-09-16T00:02:00Z"),
    );
    assert.ok(untouchedConfidenceDraft);
    const durableUntouched = JSON.parse(JSON.stringify(untouchedConfidenceDraft));
    const restoredUntouched = restoreIntegratedRound(durableUntouched, mastery, focusSkillId);
    assert.equal(restoredUntouched.status, "VALID");
    assert.equal(restoredUntouched.nextIndex, 0);
    assert.equal(restoredUntouched.items[0].decisionId, items[0].decisionId);
    assert.deepEqual(restoredUntouched.draft, {
      index: 0,
      actionId,
      reasonId,
      confidence: 65,
      confidenceProvenance: "NOT_CAPTURED",
      updatedAt: "2026-09-16T00:02:00.000Z",
    });
    assert.equal(restoredUntouched.postAnswerAttempt, null);

    const touchedConfidenceDraft = recordIntegratedDraftContinuity(
      durableUntouched,
      mastery.contentVersion,
      {
        focusSkillId,
        items,
        index: 0,
        actionId,
        reasonId,
        confidence: 83,
        confidenceProvenance: "SELF_REPORT",
      },
      new Date("2026-09-16T00:03:00Z"),
    );
    assert.ok(touchedConfidenceDraft);
    const durableTouched = JSON.parse(JSON.stringify(touchedConfidenceDraft));
    const restoredTouched = restoreIntegratedRound(durableTouched, mastery, focusSkillId);
    assert.equal(restoredTouched.status, "VALID");
    assert.equal(restoredTouched.draft?.confidence, 83);
    assert.equal(restoredTouched.draft?.confidenceProvenance, "SELF_REPORT");

    const resume = activeIntegratedRoundResume(durableTouched, mastery);
    assert.ok(resume);
    assert.equal(resume.nextIndex, 0);
    assert.equal(resume.href, focusSkillId ? `/mastery/session?focus=${encodeURIComponent(skillId)}` : "/mastery/session");
  }

  assert.equal(JSON.stringify(mastery), masteryBefore);
  assert.equal(mastery.attempts.length, 0);
  assert.equal(mastery.revision, 0);
});

test("LC-AUD-025 integrated draft validation fails closed for wrong index or impossible option", () => {
  const mastery = createPracticalMasteryState(new Date("2026-09-16T00:00:00Z"), true);
  const skillId = practicalDecisions[0].skillId;
  const items = itemsFor(skillId);
  const started = recordIntegratedRoundStartContinuity(
    createPracticalStudyWorkspace(),
    mastery.contentVersion,
    { focusSkillId: skillId, items },
  );
  assert.ok(started);

  assert.equal(recordIntegratedDraftContinuity(started, mastery.contentVersion, {
    focusSkillId: skillId,
    items,
    index: 1,
    actionId: null,
    reasonId: null,
    confidence: 65,
    confidenceProvenance: "NOT_CAPTURED",
  }), null);
  assert.equal(recordIntegratedDraftContinuity(started, mastery.contentVersion, {
    focusSkillId: skillId,
    items,
    index: 0,
    actionId: "IMPOSSIBLE_OPTION",
    reasonId: null,
    confidence: 65,
    confidenceProvenance: "NOT_CAPTURED",
  }), null);
  assert.equal(mastery.attempts.length, 0);
});
