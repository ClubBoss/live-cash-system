"use client";

import { useSearchParams } from "next/navigation";
import { firstJourneyStepForSkill } from "../content/practical-mastery/first-journey";
import { practicalSkillById } from "../content/practical-mastery";
import { activeIntegratedRoundResume } from "../lib/practical-continuity-workspace";
import {
  firstJourneyPresentationState,
  firstJourneyShouldDelegateToPostQuickStartTeaching,
  type FirstJourneyPresentationState,
} from "../lib/practical-first-journey-authority";
import { firstJourneyProgress, recommendFirstJourneyStep } from "../lib/practical-first-journey";
import { usePracticalProfileState } from "../lib/use-practical-profile-state";
import PracticalFirstJourneyExperience from "./PracticalFirstJourneyExperience";
import PracticalPostQuickStartTeaching from "./PracticalPostQuickStartTeaching";

export default function PracticalFirstJourneyAuthority() {
  const searchParams = useSearchParams();
  const profile = usePracticalProfileState();
  const { mastery: state, studyWorkspace, ready, recoveryBlocked } = profile;
  const continueLearning = searchParams.get("continue") === "1";
  const focusSkillId = searchParams.get("focus");
  let presentation: FirstJourneyPresentationState | null = null;

  if (ready && !recoveryBlocked) {
    const progress = firstJourneyProgress(state);
    const hasActiveRoundResume = Boolean(activeIntegratedRoundResume(studyWorkspace, state));
    if (firstJourneyShouldDelegateToPostQuickStartTeaching({
      hasActiveRoundResume,
      progressCompleted: progress.completed,
      continueLearning,
      focusSkillId,
    })) {
      return <PracticalPostQuickStartTeaching profile={profile} requestedSkillId={focusSkillId} />;
    }

    const recommendation = recommendFirstJourneyStep(state);
    const skill = recommendation ? practicalSkillById.get(recommendation.skillId) ?? null : null;
    const journeyStep = recommendation ? firstJourneyStepForSkill(recommendation.skillId) : null;
    presentation = firstJourneyPresentationState(progress, Boolean(recommendation && skill && journeyStep));
  }

  return <PracticalFirstJourneyExperience presentation={presentation} profile={profile} />;
}
