export type FirstJourneyProgressSnapshot = { reached: number; total: number; completed: boolean };
export type FirstJourneyPresentationState = "ACTIVE" | "BLOCKED" | "COMPLETE";

export function firstJourneyPresentationState(progress: FirstJourneyProgressSnapshot, hasUsableRecommendation: boolean): FirstJourneyPresentationState {
  if (progress.completed) return "COMPLETE";
  return hasUsableRecommendation ? "ACTIVE" : "BLOCKED";
}

// A valid, incomplete integrated round outranks any first-journey/teaching
// recommendation, regardless of how /mastery/journey was reached (root
// redirect, diagnostic handoff, an explicit ?continue=1 or ?focus=, etc).
export function firstJourneyShouldDelegateToPostQuickStartTeaching(input: {
  hasActiveRoundResume: boolean;
  progressCompleted: boolean;
  continueLearning: boolean;
  focusSkillId: string | null;
}): boolean {
  if (input.hasActiveRoundResume) return true;
  return input.progressCompleted && (input.continueLearning || Boolean(input.focusSkillId));
}
