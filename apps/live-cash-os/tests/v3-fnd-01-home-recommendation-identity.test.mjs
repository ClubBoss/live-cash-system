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
import { resolveHomeRecommendationIdentity } from "../lib/practical-home-recommendation-identity";
import { createPracticalStudyWorkspace } from "../lib/practical-profile-state";

const FOCUS = "FND-01";

// Reproduces V3-FND-01: a learner reaches item 2/8 of a focused round on
// "Relative strength and vulnerability", navigates Home, and the Home card
// must describe that same active round (not an unrelated recommended-next
// skill like "BB vs BTN") while Continue resumes the exact active round.
function roundInProgressAtItemTwo() {
  let state = createPracticalMasteryState(new Date("2026-08-28T08:00:00Z"));
  state = markPracticalConceptTaught(state, FOCUS, new Date("2026-08-28T08:00:01Z"));
  const items = buildAdaptiveIntegratedSession(state, new Date("2026-08-28T08:00:02Z"), 8, [], FOCUS);
  assert.equal(items.length, 8);

  let workspace = recordIntegratedRoundStartContinuity(createPracticalStudyWorkspace(), state.contentVersion, {
    focusSkillId: FOCUS,
    items,
  }, new Date("2026-08-28T08:00:03Z"));
  assert.ok(workspace);

  const first = practicalDecisionById.get(items[0].decisionId);
  state = recordIntegratedDecision(state, items[0], { actionId: first.correctActionId, reasonId: first.correctReasonId, confidence: 65, now: new Date("2026-08-28T08:01:00Z") });
  const attempt = state.attempts.at(-1);
  workspace = recordIntegratedAnswerContinuity(workspace, state.contentVersion, { focusSkillId: FOCUS, items, answeredIndex: 0, attemptId: attempt.id }, new Date("2026-08-28T08:01:01Z"));
  workspace = advanceIntegratedContinuity(workspace, state.contentVersion, { focusSkillId: FOCUS, items, answeredIndex: 0, attemptId: attempt.id }, new Date("2026-08-28T08:01:02Z"));
  assert.ok(workspace);

  return { state, workspace, items };
}

test("V3-FND-01 Home identity matches the active round at 2/8, not an unrelated recommendation", () => {
  const { state, workspace } = roundInProgressAtItemTwo();
  const resume = activeIntegratedRoundResume(workspace, state);
  assert.ok(resume);
  assert.equal(resume.nextIndex, 1, "must resume at item 2/8, i.e. index 1");

  const otherRecommendation = recommendNextPracticalSkill(state);
  // The recommendation authority may legitimately point elsewhere while a
  // round is mid-flight; the Home card must not surface it as primary.
  const identity = resolveHomeRecommendationIdentity({
    activeResume: { focusSkillId: resume.focusSkillId, nextIndex: resume.nextIndex, itemCount: resume.itemCount },
    recommendedSkillId: otherRecommendation?.skillId ?? null,
  });

  assert.equal(identity.kind, "ACTIVE_ROUND");
  assert.equal(identity.focusSkillId, FOCUS, "primary identity must be the active round's own skill");
  assert.equal(identity.nextIndex, 1);
  assert.equal(identity.itemCount, 8);
});

test("V3-FND-01 a same-skill recommendation is not surfaced as a contradicting secondary note", () => {
  const identity = resolveHomeRecommendationIdentity({
    activeResume: { focusSkillId: FOCUS, nextIndex: 1, itemCount: 8 },
    recommendedSkillId: FOCUS,
  });
  assert.equal(identity.kind, "ACTIVE_ROUND");
  assert.equal(identity.upcomingRecommendationSkillId, null, "recommendation matching the active round must not be shown as a contradicting 'next' note");
});

test("V3-FND-01 a genuinely different upcoming recommendation may be shown secondarily", () => {
  const identity = resolveHomeRecommendationIdentity({
    activeResume: { focusSkillId: FOCUS, nextIndex: 1, itemCount: 8 },
    recommendedSkillId: "SOME-OTHER-SKILL",
  });
  assert.equal(identity.kind, "ACTIVE_ROUND");
  assert.equal(identity.upcomingRecommendationSkillId, "SOME-OTHER-SKILL");
});

test("V3-FND-01 a completed round no longer hijacks Home identity; normal recommendation resumes", () => {
  let { state, workspace, items } = roundInProgressAtItemTwo();
  for (let index = 1; index < items.length; index += 1) {
    const decision = practicalDecisionById.get(items[index].decisionId);
    state = recordIntegratedDecision(state, items[index], { actionId: decision.correctActionId, reasonId: decision.correctReasonId, confidence: 65, now: new Date(`2026-08-28T09:${String(10 + index).padStart(2, "0")}:00Z`) });
    const attempt = state.attempts.at(-1);
    workspace = recordIntegratedAnswerContinuity(workspace, state.contentVersion, { focusSkillId: FOCUS, items, answeredIndex: index, attemptId: attempt.id }, new Date());
    workspace = advanceIntegratedContinuity(workspace, state.contentVersion, { focusSkillId: FOCUS, items, answeredIndex: index, attemptId: attempt.id }, new Date());
  }
  assert.equal(activeIntegratedRoundResume(workspace, state), null, "round is fully answered");

  const recommendation = recommendNextPracticalSkill(state);
  const identity = resolveHomeRecommendationIdentity({ activeResume: null, recommendedSkillId: recommendation?.skillId ?? null });
  if (recommendation) {
    assert.equal(identity.kind, "RECOMMENDATION");
    assert.equal(identity.skillId, recommendation.skillId);
  } else {
    assert.equal(identity.kind, "NONE");
  }
});

test("V3-FND-01 stale/invalid round never hijacks Home identity", () => {
  const { state, workspace } = roundInProgressAtItemTwo();
  const staleContentVersion = { ...workspace, continuity: { ...workspace.continuity, contentVersion: "old-content-version" } };
  assert.equal(activeIntegratedRoundResume(staleContentVersion, state), null, "stale content version must fail closed");

  const recommendation = recommendNextPracticalSkill(state);
  const identity = resolveHomeRecommendationIdentity({ activeResume: null, recommendedSkillId: recommendation?.skillId ?? null });
  assert.notEqual(identity.kind, "ACTIVE_ROUND");
});

test("V3-FND-01 no active round, no recommendation -> NONE", () => {
  assert.deepEqual(resolveHomeRecommendationIdentity({ activeResume: null, recommendedSkillId: null }), { kind: "NONE" });
});

test("V3-FND-01 no active round preserves prior normal recommendation behavior unchanged", () => {
  const identity = resolveHomeRecommendationIdentity({ activeResume: null, recommendedSkillId: "BTN-VS-BB" });
  assert.deepEqual(identity, { kind: "RECOMMENDATION", skillId: "BTN-VS-BB" });
});
