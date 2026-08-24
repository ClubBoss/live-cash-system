export type FirstJourneyProgressSnapshot = { reached: number; total: number; completed: boolean };
export type FirstJourneyPresentationState = "ACTIVE" | "BLOCKED" | "COMPLETE";

export function firstJourneyPresentationState(progress: FirstJourneyProgressSnapshot, hasUsableRecommendation: boolean): FirstJourneyPresentationState {
  if (progress.completed) return "COMPLETE";
  return hasUsableRecommendation ? "ACTIVE" : "BLOCKED";
}
