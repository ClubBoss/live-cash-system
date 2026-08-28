import assert from "node:assert/strict";
import test from "node:test";
import { practicalDecisionById } from "../content/practical-mastery";
import { buildAdaptiveIntegratedSession } from "../lib/practical-adaptive-session";
import {
  activeIntegratedRoundResume,
  advanceIntegratedContinuity,
  recordIntegratedAnswerContinuity,
  recordIntegratedRoundStartContinuity,
} from "../lib/practical-continuity-workspace";
import { recordIntegratedDecision } from "../lib/practical-integrated-session";
import { createPracticalMasteryState, markPracticalConceptTaught, recommendNextPracticalSkill } from "../lib/practical-mastery-core";
import { resolvePostQuickStartLearningTarget } from "../lib/practical-post-quick-start-learning";
import { createPracticalStudyWorkspace } from "../lib/practical-profile-state";

const FOCUS = "FND-01";

// Reproduces FND-V2-01: a learner enters a focused round, answers item 1, reaches
// item 2/8, leaves through Home, and uses the generic Continue affordance. The
// canonical Continue authority must now resume the active round rather than start
// an unrelated lesson.
function roundInProgressAtItemTwo() {
  let state = createPracticalMasteryState(new Date("2026-08-28T08:00:00Z"));
  state = markPracticalConceptTaught(state, FOCUS, new Date("2026-08-28T08:00:01Z"));
  const items = buildAdaptiveIntegratedSession(state, new Date("2026-08-28T08:00:02Z"), 8, [], FOCUS);
  assert.equal(items.length, 8, "focused round must be a full 8-item same-skill round");
  assert.ok(items.every((item) => item.skillId === FOCUS));

  let workspace = recordIntegratedRoundStartContinuity(createPracticalStudyWorkspace(), state.contentVersion, {
    focusSkillId: FOCUS,
    items,
  }, new Date("2026-08-28T08:00:03Z"));
  assert.ok(workspace);

  const first = practicalDecisionById.get(items[0].decisionId);
  state = recordIntegratedDecision(state, items[0], { actionId: first.correctActionId, reasonId: first.correctReasonId, confidence: 65, now: new Date("2026-08-28T08:01:00Z") });
  const attempt = state.attempts.at(-1);
  workspace = recordIntegratedAnswerContinuity(workspace, state.contentVersion, {
    focusSkillId: FOCUS, items, answeredIndex: 0, attemptId: attempt.id,
  }, new Date("2026-08-28T08:01:01Z"));
  assert.ok(workspace);
  workspace = advanceIntegratedContinuity(workspace, state.contentVersion, {
    focusSkillId: FOCUS, items, answeredIndex: 0, attemptId: attempt.id,
  }, new Date("2026-08-28T08:01:02Z"));
  assert.ok(workspace);

  return { state, workspace, items, firstAttempt: attempt };
}

test("FND-V2-01 the generic Continue authority resumes an active incomplete focused round at 2/8", () => {
  const { state, workspace, firstAttempt } = roundInProgressAtItemTwo();

  const resume = activeIntegratedRoundResume(workspace, state);
  assert.ok(resume, "an active, valid, incomplete round must be resumable");
  assert.equal(resume.href, `/mastery/session?focus=${FOCUS}`);
  assert.equal(resume.focusSkillId, FOCUS);
  assert.equal(resume.nextIndex, 1, "resume must return to item 2/8, not restart");
  assert.equal(resume.itemCount, 8);

  // The already-scored item 1 answer is preserved and not duplicated.
  const forDecision = state.attempts.filter((candidate) => candidate.decisionId === firstAttempt.decisionId);
  assert.equal(forDecision.length, 1);
  assert.equal(state.attempts.length, 1, "resume query must never create or resubmit evidence");
});

test("FND-V2-01 a completed round does not keep hijacking Continue", () => {
  let { state, workspace, items } = roundInProgressAtItemTwo();
  for (let index = 1; index < items.length; index += 1) {
    const decision = practicalDecisionById.get(items[index].decisionId);
    state = recordIntegratedDecision(state, items[index], { actionId: decision.correctActionId, reasonId: decision.correctReasonId, confidence: 65, now: new Date(`2026-08-28T09:${String(10 + index).padStart(2, "0")}:00Z`) });
    const attempt = state.attempts.at(-1);
    workspace = recordIntegratedAnswerContinuity(workspace, state.contentVersion, { focusSkillId: FOCUS, items, answeredIndex: index, attemptId: attempt.id }, new Date());
    assert.ok(workspace);
    workspace = advanceIntegratedContinuity(workspace, state.contentVersion, { focusSkillId: FOCUS, items, answeredIndex: index, attemptId: attempt.id }, new Date());
    assert.ok(workspace);
  }
  assert.equal(activeIntegratedRoundResume(workspace, state), null, "a fully answered round is done and must not pre-empt the next lesson");
});

test("FND-V2-01 stale / invalid / absent rounds never hijack Continue", () => {
  const { state, workspace } = roundInProgressAtItemTwo();

  assert.equal(activeIntegratedRoundResume(createPracticalStudyWorkspace(), state), null, "no saved round -> no resume");

  const staleContentVersion = { ...workspace, continuity: { ...workspace.continuity, contentVersion: "old-content-version" } };
  assert.equal(activeIntegratedRoundResume(staleContentVersion, state), null, "stale content version must fail closed");

  const brokenItems = {
    ...workspace,
    continuity: {
      ...workspace.continuity,
      integrated: { ...workspace.continuity.integrated, items: [{ decisionId: "NOT-A-DECISION", skillId: FOCUS, priority: 1, reason: "REINFORCE", whyAfterAnswer: "x", retentionTierDays: null }] },
    },
  };
  assert.equal(activeIntegratedRoundResume(brokenItems, state), null, "structurally invalid round must fail closed");
});

test("FND-V2-01 repair authority and post-Quick-Start learning are unchanged when no round is active", () => {
  let state = createPracticalMasteryState(new Date("2026-08-28T08:00:00Z"));
  state = markPracticalConceptTaught(state, FOCUS, new Date("2026-08-28T08:00:01Z"));
  const emptyWorkspace = createPracticalStudyWorkspace();

  assert.equal(activeIntegratedRoundResume(emptyWorkspace, state), null);
  // These authorities keep working exactly as before with no active round.
  assert.doesNotThrow(() => recommendNextPracticalSkill(state));
  assert.doesNotThrow(() => resolvePostQuickStartLearningTarget(state));
});
