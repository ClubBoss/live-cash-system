import { createPracticalMasteryState } from "./practical-mastery-core";
import {
  PRACTICAL_PERFORMANCE_LIMIT,
  PRACTICAL_PROFILE_ANCHOR_CARD_ID,
  PRACTICAL_PROFILE_FIELD,
  PRACTICAL_PROFILE_LINEAGE_CARD_PREFIX,
  PRACTICAL_PROFILE_LINEAGE_LIMIT,
  PRACTICAL_PROFILE_VERSION,
  validatePracticalProfileState,
  type LearnerStateWithPracticalProfile,
  type PracticalProfileState,
  type PracticalStudyWorkspace,
} from "./practical-profile-contract";

export * from "./practical-profile-contract";

const SYSTEM_CARD = {
  dueAt: "9999-12-31T23:59:59.999Z",
  intervalDays: 36500,
  repetitions: 0,
  lapses: 0,
  lastGrade: null,
} as const;

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

function lineageHash(value: string): string {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function lineageRevision(id: string): number {
  if (!id.startsWith(PRACTICAL_PROFILE_LINEAGE_CARD_PREFIX)) return Number.POSITIVE_INFINITY;
  const suffix = id.slice(PRACTICAL_PROFILE_LINEAGE_CARD_PREFIX.length);
  const revision = Number(suffix.split(":", 1)[0]);
  return Number.isFinite(revision) ? revision : Number.POSITIVE_INFINITY;
}

function appendPracticalLineageMarker<T extends LearnerStateWithPracticalProfile>(
  state: T,
  practicalProfile: PracticalProfileState,
  now: Date,
): void {
  const nextRevision = state.revision + 1;
  const fingerprint = lineageHash(JSON.stringify({
    rootRevision: nextRevision,
    rootUpdatedAt: now.toISOString(),
    masteryRevision: practicalProfile.mastery.revision,
    masteryUpdatedAt: practicalProfile.mastery.updatedAt,
    lastPerformanceId: practicalProfile.performance.at(-1)?.id ?? null,
    studyUpdatedAt: practicalProfile.studyWorkspace.updatedAt,
  }));
  const markerId = `${PRACTICAL_PROFILE_LINEAGE_CARD_PREFIX}${nextRevision}:${fingerprint}`;
  state.cards[markerId] = { ...SYSTEM_CARD };

  const lineageIds = Object.keys(state.cards)
    .filter((id) => id.startsWith(PRACTICAL_PROFILE_LINEAGE_CARD_PREFIX))
    .sort((left, right) => lineageRevision(left) - lineageRevision(right));
  const excess = lineageIds.length - PRACTICAL_PROFILE_LINEAGE_LIMIT;
  if (excess > 0) {
    // Pruning intentionally trades automatic ancestry proof for an explicit
    // conflict on very old snapshots; it can never make a divergent snapshot
    // look safer than it is.
    for (const id of lineageIds.slice(0, excess)) delete state.cards[id];
  }
}

export function withPracticalProfile<T extends LearnerStateWithPracticalProfile>(
  learnerState: T,
  practicalProfile: PracticalProfileState,
  now = new Date(),
): T {
  if (!validatePracticalProfileState(practicalProfile)) throw new Error("Invalid Practical Profile state");
  const next = structuredClone(learnerState);
  const boundedProfile: PracticalProfileState = {
    ...structuredClone(practicalProfile),
    performance: structuredClone(practicalProfile.performance).slice(-PRACTICAL_PERFORMANCE_LIMIT),
  };
  next[PRACTICAL_PROFILE_FIELD] = boundedProfile;

  // Existing reliability already treats card IDs as append-only durable
  // evidence. The fixed anchor prevents pre-Practical snapshots from silently
  // replacing a practical profile, while bounded lineage markers make offline
  // divergence fail closed without a second sync engine.
  next.cards[PRACTICAL_PROFILE_ANCHOR_CARD_ID] ??= { ...SYSTEM_CARD };
  appendPracticalLineageMarker(next, boundedProfile, now);

  next.revision += 1;
  next.updatedAt = now.toISOString();
  return next;
}
