import { createPracticalMasteryState } from "./practical-mastery-core";
import {
  PRACTICAL_PERFORMANCE_LIMIT,
  PRACTICAL_PROFILE_FIELD,
  PRACTICAL_PROFILE_VERSION,
  hasPracticalProfileField,
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
  next.revision += 1;
  next.updatedAt = now.toISOString();
  return next;
}

export function removeLegacyStandalonePracticalKeys(storage: Storage): void {
  // These keys existed only on the unmerged program branch. Removing them after
  // the reliable profile slice is established prevents two competing truths.
  for (const key of [
    "live-cash-os:practical-mastery:v3",
    "live-cash-os:practical-performance:v1",
    "live-cash-os:study-loop:v1",
  ]) {
    try { storage.removeItem(key); } catch { /* best effort after durable profile write */ }
  }
}

export function practicalProfileNeedsMigration(value: unknown): boolean {
  return !hasPracticalProfileField(value);
}
