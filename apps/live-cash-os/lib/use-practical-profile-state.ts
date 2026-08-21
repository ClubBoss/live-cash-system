"use client";

import { useCallback, useMemo } from "react";
import type { LearnerState } from "./model";
import {
  PRACTICAL_PERFORMANCE_LIMIT,
  practicalProfileFromLearnerState,
  removeLegacyStandalonePracticalKeys,
  withPracticalProfile,
  type LearnerStateWithPracticalProfile,
  type PracticalProfileState,
  type PracticalStudyWorkspace,
} from "./practical-profile-state";
import type { PracticalMasteryState } from "./practical-mastery-core";
import type { PracticalPerformanceEvent } from "./practical-performance-telemetry";
import { useReliableLearnerState } from "./use-learner-state-sync";

export function usePracticalProfileState() {
  const controller = useReliableLearnerState();
  const profile = useMemo(
    () => practicalProfileFromLearnerState(controller.state),
    [controller.state],
  );

  const commitProfile = useCallback((nextProfile: PracticalProfileState) => {
    const nextLearner = withPracticalProfile(
      controller.state as LearnerState & LearnerStateWithPracticalProfile,
      nextProfile,
    ) as LearnerState;
    controller.setState(nextLearner);
    if (typeof window !== "undefined") removeLegacyStandalonePracticalKeys(window.localStorage);
  }, [controller]);

  const setMastery = useCallback((mastery: PracticalMasteryState) => {
    commitProfile({ ...profile, mastery });
  }, [commitProfile, profile]);

  const setMasteryWithPerformance = useCallback((mastery: PracticalMasteryState, event: PracticalPerformanceEvent) => {
    commitProfile({
      ...profile,
      mastery,
      performance: [...profile.performance, event].slice(-PRACTICAL_PERFORMANCE_LIMIT),
    });
  }, [commitProfile, profile]);

  const setStudyWorkspace = useCallback((studyWorkspace: PracticalStudyWorkspace) => {
    commitProfile({ ...profile, studyWorkspace });
  }, [commitProfile, profile]);

  return {
    mastery: profile.mastery,
    performance: profile.performance,
    studyWorkspace: profile.studyWorkspace,
    setMastery,
    setMasteryWithPerformance,
    setStudyWorkspace,
    ready: controller.ready,
    syncStatus: controller.syncStatus,
    cloudMode: controller.cloudMode,
    recoveryBlocked: controller.recoveryBlocked,
  } as const;
}
