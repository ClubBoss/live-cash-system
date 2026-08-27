"use client";

import { useEffect, useState } from "react";
import { firstJourneyStepForSkill } from "../content/practical-mastery/first-journey";
import { practicalSkillById } from "../content/practical-mastery";
import { firstJourneyPresentationState, type FirstJourneyPresentationState } from "../lib/practical-first-journey-authority";
import { firstJourneyProgress, recommendFirstJourneyStep } from "../lib/practical-first-journey";
import { usePracticalProfileState } from "../lib/use-practical-profile-state";
import PracticalFirstJourneyExperience from "./PracticalFirstJourneyExperience";
import PracticalPostQuickStartTeaching from "./PracticalPostQuickStartTeaching";

type JourneyRouteIntent = {
  continueLearning: boolean;
  focusSkillId: string | null;
};

export default function PracticalFirstJourneyAuthority() {
  const profile = usePracticalProfileState();
  const { mastery: state, ready, recoveryBlocked } = profile;
  const [routeIntent, setRouteIntent] = useState<JourneyRouteIntent | null>(null);
  let presentation: FirstJourneyPresentationState | null = null;

  useEffect(() => {
    const syncRouteIntent = () => {
      const params = new URLSearchParams(window.location.search);
      setRouteIntent({
        continueLearning: params.get("continue") === "1",
        focusSkillId: params.get("focus"),
      });
    };
    syncRouteIntent();
    window.addEventListener("popstate", syncRouteIntent);
    return () => window.removeEventListener("popstate", syncRouteIntent);
  }, []);

  if (ready && !recoveryBlocked && routeIntent !== null) {
    const progress = firstJourneyProgress(state);
    if (progress.completed && (routeIntent.continueLearning || routeIntent.focusSkillId)) {
      return <PracticalPostQuickStartTeaching profile={profile} requestedSkillId={routeIntent.focusSkillId} />;
    }

    const recommendation = recommendFirstJourneyStep(state);
    const skill = recommendation ? practicalSkillById.get(recommendation.skillId) ?? null : null;
    const journeyStep = recommendation ? firstJourneyStepForSkill(recommendation.skillId) : null;
    presentation = firstJourneyPresentationState(progress, Boolean(recommendation && skill && journeyStep));
  }

  return <PracticalFirstJourneyExperience presentation={presentation} profile={profile} />;
}
