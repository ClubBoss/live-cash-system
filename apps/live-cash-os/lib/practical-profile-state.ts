import { createPracticalMasteryState } from "./practical-mastery-core";
import {
  PRACTICAL_PERFORMANCE_LIMIT,
  PRACTICAL_PROFILE_ANCHOR_CARD_ID,
  PRACTICAL_PROFILE_FIELD,
  PRACTICAL_PROFILE_VERSION,
  validatePracticalProfileState,
  type LearnerStateWithPracticalProfile,
  type PracticalProfileState,
  type PracticalStudyWorkspace,
} from "./practical-profile-contract";

export * from "./practical-profile-contract";

export function createPracticalStudyWorkspace(): PracticalStudyWorkspace {
  return {
    version: 1,
    focus: "",
    repairRule: "",
    performanceFlags: [],
    updatedAt: new Date(0).toISOString(),
  };
}

export function createPracticalProfileState(now = new Date()): PracticalProfileState {
  return {
    version: PRACTICAL_PROFILE_VERSION,
    mastery: createPracticalMasteryState(now, true),
    performance: [],
    studyWorkspace: createPracticalStudyWorkspace(),
  };
}

export function practicalProfileFromLearnerState(value: unknown, now = new Date()): PracticalProfileState {
  if (!value || typeof value !== "object" || Array.isArray(value)) return createPracticalProfileState(now);
  const candidate = (value as Record<string, unknown>)[PRACTICAL_PROFILE_FIELD];
  if (candidate === undefined) return createPracticalProfileState(now);
  if (!validatePracticalProfileState(candidate)) throw new Error("Invalid Practical Profile state");
  return structuredClone(candidate);
}

export function withPracticalProfile<T extends LearnerStateWithPracticalProfile>(
  learnerState: T,
  practicalProfile: PracticalProfileState,
  now = new Date(),
): T {
  if (!validatePracticalProfileState(practicalProfile)) throw new Error("Invalid Practical Profile state");
  const next = structuredClone(learnerState);
  next[PRACTICAL_PROFILE_FIELD] = {
    ...structuredClone(practicalProfile),
    performance: structuredClone(practicalProfile.performance).slice(-PRACTICAL_PERFORMANCE_LIMIT),
  };
  // This reserved, non-content card is an ancestry marker only. Existing
  // reliability already proves card preservation on imports/restores/lost-ack
  // writes, so a pre-Practical snapshot cannot silently replace a profile that
  // already contains Practical Mastery evidence. Learner-facing card lists are
  // sourced from canonical content IDs and never render this reserved ID.
  next.cards[PRACTICAL_PROFILE_ANCHOR_CARD_ID] ??= {
    dueAt: "9999-12-31T23:59:59.999Z",
    intervalDays: 36500,
    repetitions: 0,
    lapses: 0,
    lastGrade: null,
  };
  next.revision += 1;
  next.updatedAt = now.toISOString();
  return next;
}
