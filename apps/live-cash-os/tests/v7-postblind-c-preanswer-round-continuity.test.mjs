import assert from "node:assert/strict";
import test from "node:test";
import { practicalDecisions } from "../content/practical-mastery/index.ts";
import {
  recordIntegratedAnswerContinuity,
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
  assert.equal(restored.items[0].decisionId, items[0].decisionId);
  assert.equal(JSON.stringify(mastery), beforeMastery, "starting a round must not mutate mastery");
  assert.equal(mastery.attempts.length, 0, "starting a round must create zero attempts/evidence");
  assert.equal(mastery.revision, 0, "starting a round must create zero mastery/progress revision");
});

test("V7 Post-Blind C keeps the existing Q1-submit -> Q2 restore contract", () => {
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
  const restored = restoreIntegratedRound(afterSubmit, afterFirst, skillId);
  assert.equal(restored.status, "VALID");
  assert.equal(restored.nextIndex, 1);
  assert.equal(restored.items[1].decisionId, items[1].decisionId);
  assert.equal(afterFirst.attempts.length, 1);
});

test("V7 Post-Blind C rejects empty or oversized round-start checkpoints", () => {
  const mastery = createPracticalMasteryState(new Date("2026-08-26T00:00:00Z"), true);
  const workspace = createPracticalStudyWorkspace();
  assert.equal(recordIntegratedRoundStartContinuity(workspace, mastery.contentVersion, { focusSkillId: null, items: [] }), null);
  const item = itemsFor(practicalDecisions[0].skillId)[0];
  assert.ok(item);
  assert.equal(recordIntegratedRoundStartContinuity(workspace, mastery.contentVersion, { focusSkillId: null, items: Array.from({ length: 9 }, () => item) }), null);
});
