"use client";

import { useCallback, useMemo } from "react";
import type { LearnerState } from "./model";
import {
  PRACTICAL_PERFORMANCE_LIMIT,
  createPracticalProfileState,
  practicalProfileFromLearnerState,
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
  const resolved = useMemo(() => {
    try {
      return { profile: practicalProfileFromLearnerState(controller.state), profileError: false } as const;
    } catch {
      // Never overwrite an unreadable slice with an empty one. Keep the raw root
      // learner snapshot intact so Data & Recovery can export/restore it.
      return { profile: createPracticalProfileState(new Date()), profileError: true } as const;
    }
  }, [controller.state]);
  const { profile, profileError } = resolved;

  const commitProfile = useCallback((nextProfile: PracticalProfileState) => {
    if (profileError || controller.recoveryBlocked) return false;
    const nextLearner = withPracticalProfile(
      controller.state as LearnerState & LearnerStateWithPracticalProfile,
      nextProfile,
    ) as LearnerState;
    controller.setState(nextLearner);
    return true;
  }, [controller, profileError]);

  const setMastery = useCallback((mastery: PracticalMasteryState) => {
    return commitProfile({ ...profile, mastery });
  }, [commitProfile, profile]);

  const setMasteryWithPerformance = useCallback((mastery: PracticalMasteryState, event: PracticalPerformanceEvent) => {
    return commitProfile({
      ...profile,
      mastery,
      performance: [...profile.performance, event].slice(-PRACTICAL_PERFORMANCE_LIMIT),
    });
  }, [commitProfile, profile]);

  const setStudyWorkspace = useCallback((studyWorkspace: PracticalStudyWorkspace) => {
    return commitProfile({ ...profile, studyWorkspace });
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
    recoveryBlocked: controller.recoveryBlocked || profileError,
    profileError,
  } as const;
}
