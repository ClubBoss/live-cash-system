export type HomeRecommendationIdentity =
  | {
      kind: "ACTIVE_ROUND";
      focusSkillId: string | null;
      nextIndex: number;
      itemCount: number;
      upcomingRecommendationSkillId: string | null;
    }
  | { kind: "RECOMMENDATION"; skillId: string }
  | { kind: "NONE" };

// Single source of truth for the Home/skill-map "what's the primary action"
// card. When an active, valid, incomplete round owns the primary Continue
// CTA (see activeIntegratedRoundResume), the card's label/title/context must
// describe that same round: it must never advertise an unrelated
// recommended-next skill while Continue silently opens the active round
// instead. The next recommendation may still be surfaced, but only as a
// secondary "up next" note that does not contradict the primary CTA.
export function resolveHomeRecommendationIdentity(input: {
  activeResume: { focusSkillId: string | null; nextIndex: number; itemCount: number } | null;
  recommendedSkillId: string | null;
}): HomeRecommendationIdentity {
  if (input.activeResume) {
    return {
      kind: "ACTIVE_ROUND",
      focusSkillId: input.activeResume.focusSkillId,
      nextIndex: input.activeResume.nextIndex,
      itemCount: input.activeResume.itemCount,
      upcomingRecommendationSkillId:
        input.recommendedSkillId && input.recommendedSkillId !== input.activeResume.focusSkillId
          ? input.recommendedSkillId
          : null,
    };
  }
  if (input.recommendedSkillId) return { kind: "RECOMMENDATION", skillId: input.recommendedSkillId };
  return { kind: "NONE" };
}
