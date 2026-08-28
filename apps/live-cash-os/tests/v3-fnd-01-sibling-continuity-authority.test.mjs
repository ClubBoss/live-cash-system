import assert from "node:assert/strict";
import test from "node:test";
import { buildAdaptiveIntegratedSession } from "../lib/practical-adaptive-session";
import {
  activeIntegratedRoundResume,
  nextLearningHref,
  recordIntegratedRoundStartContinuity,
} from "../lib/practical-continuity-workspace";
import { firstJourneyProgress } from "../lib/practical-first-journey";
import { firstJourneyShouldDelegateToPostQuickStartTeaching } from "../lib/practical-first-journey-authority";
import { createPracticalMasteryState, markPracticalConceptTaught } from "../lib/practical-mastery-core";
import { createPracticalStudyWorkspace } from "../lib/practical-profile-state";

const FOCUS = "FND-01";

// Reproduces the V3 sibling: a learner with an active, valid, incomplete
// focused round (started before First Journey is fully complete) lands on
// /mastery/journey through a bare entry point (app root redirect, the
// diagnostic handoff, or the supporting-tools "back" link) with neither
// ?continue=1 nor ?focus= set. The journey authority must still resume the
// round instead of silently showing an unrelated first-journey/teaching
// recommendation.
function focusedRoundInProgress() {
  let state = createPracticalMasteryState(new Date("2026-08-28T08:00:00Z"));
  state = markPracticalConceptTaught(state, FOCUS, new Date("2026-08-28T08:00:01Z"));
  const items = buildAdaptiveIntegratedSession(state, new Date("2026-08-28T08:00:02Z"), 8, [], FOCUS);
  assert.equal(items.length, 8, "focused round must be a full 8-item same-skill round");

  const workspace = recordIntegratedRoundStartContinuity(createPracticalStudyWorkspace(), state.contentVersion, {
    focusSkillId: FOCUS,
    items,
  }, new Date("2026-08-28T08:00:03Z"));
  assert.ok(workspace);

  return { state, workspace };
}

test("V3-FND-01 an active round outranks the /mastery/journey root entry point even before First Journey completes", () => {
  const { state, workspace } = focusedRoundInProgress();

  const progress = firstJourneyProgress(state);
  assert.equal(progress.completed, false, "this fixture must not have completed First Journey");

  const resume = activeIntegratedRoundResume(workspace, state);
  assert.ok(resume, "an active, valid, incomplete round must be resumable");

  // Bare /mastery/journey: no ?continue=1, no ?focus=.
  const delegate = firstJourneyShouldDelegateToPostQuickStartTeaching({
    hasActiveRoundResume: Boolean(resume),
    progressCompleted: progress.completed,
    continueLearning: false,
    focusSkillId: null,
  });
  assert.equal(delegate, true, "an active round must resume even on a bare /mastery/journey visit");
});

test("V3-FND-01 no active round preserves prior first-journey routing exactly", () => {
  assert.equal(firstJourneyShouldDelegateToPostQuickStartTeaching({
    hasActiveRoundResume: false, progressCompleted: false, continueLearning: false, focusSkillId: null,
  }), false);
  assert.equal(firstJourneyShouldDelegateToPostQuickStartTeaching({
    hasActiveRoundResume: false, progressCompleted: true, continueLearning: false, focusSkillId: null,
  }), false, "completion alone, without ?continue=1 or ?focus=, must not delegate");
  assert.equal(firstJourneyShouldDelegateToPostQuickStartTeaching({
    hasActiveRoundResume: false, progressCompleted: true, continueLearning: true, focusSkillId: null,
  }), true);
  assert.equal(firstJourneyShouldDelegateToPostQuickStartTeaching({
    hasActiveRoundResume: false, progressCompleted: true, continueLearning: false, focusSkillId: "SOME-SKILL",
  }), true);
});

test("V3-FND-01 nextLearningHref lets a fixed-destination CTA yield to an active round resume", () => {
  const { state, workspace } = focusedRoundInProgress();
  const resume = activeIntegratedRoundResume(workspace, state);
  assert.equal(nextLearningHref(resume, "/mastery/session"), resume.href);
  assert.equal(nextLearningHref(null, "/mastery/session"), "/mastery/session");
});
