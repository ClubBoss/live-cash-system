"use client";

import { firstJourneyStepForSkill } from "../content/practical-mastery/first-journey";
import { practicalSkillById } from "../content/practical-mastery";
import { firstJourneyPresentationState, type FirstJourneyPresentationState } from "../lib/practical-first-journey-authority";
import { firstJourneyProgress, recommendFirstJourneyStep } from "../lib/practical-first-journey";
import { usePracticalProfileState } from "../lib/use-practical-profile-state";
import PracticalFirstJourneyExperience from "./PracticalFirstJourneyExperience";

export default function PracticalFirstJourneyAuthority() {
  const profile = usePracticalProfileState();
  const { mastery: state, ready, recoveryBlocked } = profile;
  let presentation: FirstJourneyPresentationState | null = null;

  if (ready && !recoveryBlocked) {
    const progress = firstJourneyProgress(state);
    const recommendation = recommendFirstJourneyStep(state);
    const skill = recommendation ? practicalSkillById.get(recommendation.skillId) ?? null : null;
    const journeyStep = recommendation ? firstJourneyStepForSkill(recommendation.skillId) : null;
    presentation = firstJourneyPresentationState(progress, Boolean(recommendation && skill && journeyStep));
  }

  return <PracticalFirstJourneyExperience presentation={presentation} profile={profile} />;
}
