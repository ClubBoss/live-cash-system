import type { CardState } from "./model-core";
import type { PracticalMasteryState } from "./practical-mastery-core";
import type { PracticalPerformanceEvent } from "./practical-performance-telemetry";

export const PRACTICAL_PROFILE_FIELD = "_practicalProfile" as const;
export const PRACTICAL_PROFILE_VERSION = 1 as const;
export const PRACTICAL_PROFILE_MASTERY_SCHEMA_VERSION = 3 as const;
export const PRACTICAL_PERFORMANCE_LIMIT = 2000;
export const PRACTICAL_PROFILE_ANCHOR_CARD_ID = "__system:practical-profile:v1" as const;
export const PRACTICAL_PROFILE_LINEAGE_CARD_PREFIX = "__system:practical-profile-lineage:v1:" as const;
export const PRACTICAL_PROFILE_LINEAGE_LIMIT = 256;

export type PracticalContinuityIntegratedItem = {
  decisionId: string;
  skillId: string;
  priority: number;
  reason: "REPAIR" | "RETENTION" | "TRANSFER" | "REINFORCE" | "RECOGNITION";
  whyAfterAnswer: string;
  retentionTierDays: number | null;
};

export type PracticalContinuityWorkspace = {
  version: 1;
  contentVersion: string;
  quickStart: {
    skillId: string;
    decisionId: string;
    selectedActionId: string | null;
    selectedReasonId: string | null;
    phase: "IN_PROGRESS";
    updatedAt: string;
  } | {
    skillId: string;
    decisionId: string;
    attemptId: string;
    phase: "POST_ANSWER";
    updatedAt: string;
  } | null;
  integrated: {
    focusSkillId: string | null;
    items: PracticalContinuityIntegratedItem[];
    nextIndex: number;
    submittedAttemptIds: string[];
    updatedAt: string;
  } | null;
  perceptual?: {
    decisionId: string;
    updatedAt: string;
  } | null;
  skillMap?: {
    skillId: string;
    updatedAt: string;
  } | null;
};

export type PracticalStudyWorkspace = {
  version: 1;
  focus: string;
  repairRule: string;
  performanceFlags: string[];
  updatedAt: string;
  continuity?: PracticalContinuityWorkspace;
};

export type PracticalProfileState = {
  version: typeof PRACTICAL_PROFILE_VERSION;
  mastery: PracticalMasteryState;
  performance: PracticalPerformanceEvent[];
  studyWorkspace: PracticalStudyWorkspace;
};

export type LearnerStateWithPracticalProfile = Record<string, unknown> & {
  revision: number;
  updatedAt: string;
  cards: Record<string, CardState>;
  [PRACTICAL_PROFILE_FIELD]?: PracticalProfileState;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function validMasteryState(value: unknown): value is PracticalMasteryState {
  if (!isRecord(value)) return false;
  if (value.schemaVersion !== PRACTICAL_PROFILE_MASTERY_SCHEMA_VERSION) return false;
  if (typeof value.contentVersion !== "string" || typeof value.revision !== "number" || typeof value.updatedAt !== "string") return false;
  if (!isRecord(value.skills) || !Array.isArray(value.attempts)) return false;
  return Object.values(value.skills).every((progress) => isRecord(progress)
    && typeof progress.skillId === "string"
    && typeof progress.evidenceStage === "string"
    && typeof progress.conceptTaught === "boolean"
    && Array.isArray(progress.successfulDecisionIds)
    && Array.isArray(progress.retentionDaysPassed)
    && typeof progress.attempts === "number"
    && typeof progress.correct === "number");
}

function validPerformanceEvent(value: unknown): value is PracticalPerformanceEvent {
  if (!isRecord(value)) return false;
  return typeof value.id === "string"
    && typeof value.decisionId === "string"
    && typeof value.skillId === "string"
    && typeof value.mode === "string"
    && typeof value.startedAt === "string"
    && typeof value.answeredAt === "string"
    && typeof value.responseMs === "number"
    && typeof value.confidence === "number"
    && typeof value.actionCorrect === "boolean"
    && typeof value.reasonCorrect === "boolean"
    && typeof value.correct === "boolean"
    && typeof value.kind === "string";
}

function validContinuityIntegratedItem(value: unknown): value is PracticalContinuityIntegratedItem {
  if (!isRecord(value)) return false;
  return typeof value.decisionId === "string"
    && typeof value.skillId === "string"
    && typeof value.priority === "number"
    && ["REPAIR", "RETENTION", "TRANSFER", "REINFORCE", "RECOGNITION"].includes(String(value.reason))
    && typeof value.whyAfterAnswer === "string"
    && (value.retentionTierDays === null || typeof value.retentionTierDays === "number");
}

function validContinuityWorkspace(value: unknown): value is PracticalContinuityWorkspace {
  if (!isRecord(value) || value.version !== 1 || typeof value.contentVersion !== "string") return false;
  if (value.quickStart !== null) {
    if (!isRecord(value.quickStart)
      || typeof value.quickStart.skillId !== "string"
      || typeof value.quickStart.decisionId !== "string"
      || typeof value.quickStart.updatedAt !== "string") return false;
    if (value.quickStart.phase === "POST_ANSWER") {
      if (typeof value.quickStart.attemptId !== "string") return false;
    } else if (value.quickStart.phase === "IN_PROGRESS") {
      if (!(value.quickStart.selectedActionId === null || typeof value.quickStart.selectedActionId === "string")
        || !(value.quickStart.selectedReasonId === null || typeof value.quickStart.selectedReasonId === "string")) return false;
    } else return false;
  }
  if (value.integrated !== null) {
    if (!isRecord(value.integrated)
      || !(value.integrated.focusSkillId === null || typeof value.integrated.focusSkillId === "string")
      || !Array.isArray(value.integrated.items)
      || value.integrated.items.length > 8
      || !value.integrated.items.every(validContinuityIntegratedItem)
      || typeof value.integrated.nextIndex !== "number"
      || !Number.isInteger(value.integrated.nextIndex)
      || value.integrated.nextIndex < 0
      || value.integrated.nextIndex > value.integrated.items.length
      || !Array.isArray(value.integrated.submittedAttemptIds)
      || ![value.integrated.nextIndex, value.integrated.nextIndex + 1].includes(value.integrated.submittedAttemptIds.length)
      || value.integrated.submittedAttemptIds.length > value.integrated.items.length
      || !value.integrated.submittedAttemptIds.every((id) => typeof id === "string")
      || typeof value.integrated.updatedAt !== "string") return false;
  }
  if (value.perceptual !== undefined && value.perceptual !== null) {
    if (!isRecord(value.perceptual)
      || typeof value.perceptual.decisionId !== "string"
      || typeof value.perceptual.updatedAt !== "string") return false;
  }
  if (value.skillMap !== undefined && value.skillMap !== null) {
    if (!isRecord(value.skillMap)
      || typeof value.skillMap.skillId !== "string"
      || typeof value.skillMap.updatedAt !== "string") return false;
  }
  return true;
}

function validStudyWorkspace(value: unknown): value is PracticalStudyWorkspace {
  return isRecord(value)
    && value.version === 1
    && typeof value.focus === "string"
    && typeof value.repairRule === "string"
    && Array.isArray(value.performanceFlags)
    && value.performanceFlags.every((flag) => typeof flag === "string")
    && typeof value.updatedAt === "string"
    && (value.continuity === undefined || validContinuityWorkspace(value.continuity));
}

export function validatePracticalProfileState(value: unknown): value is PracticalProfileState {
  return isRecord(value)
    && value.version === PRACTICAL_PROFILE_VERSION
    && validMasteryState(value.mastery)
    && Array.isArray(value.performance)
    && value.performance.length <= PRACTICAL_PERFORMANCE_LIMIT
    && value.performance.every(validPerformanceEvent)
    && validStudyWorkspace(value.studyWorkspace);
}

export function hasPracticalProfileField(value: unknown): boolean {
  return isRecord(value) && Object.prototype.hasOwnProperty.call(value, PRACTICAL_PROFILE_FIELD);
}

export function learnerStateHasValidPracticalProfile(value: unknown): boolean {
  return isRecord(value) && validatePracticalProfileState(value[PRACTICAL_PROFILE_FIELD]);
}

export function optionalPracticalProfileValid(value: unknown): boolean {
  return !hasPracticalProfileField(value) || learnerStateHasValidPracticalProfile(value);
}

function rowsById(values: PracticalPerformanceEvent[]): Map<string, PracticalPerformanceEvent> {
  return new Map(values.map((event) => [event.id, event]));
}

function performancePreserved(candidate: PracticalPerformanceEvent[], base: PracticalPerformanceEvent[]): boolean {
  const next = rowsById(candidate);
  return base.every((event) => JSON.stringify(next.get(event.id)) === JSON.stringify(event));
}

function masteryPreserved(candidate: PracticalMasteryState, base: PracticalMasteryState): boolean {
  if (candidate.revision < base.revision) return false;
  const candidateAttempts = new Map(candidate.attempts.map((attempt) => [attempt.id, attempt]));
  for (const attempt of base.attempts) {
    if (JSON.stringify(candidateAttempts.get(attempt.id)) !== JSON.stringify(attempt)) return false;
  }
  for (const [skillId, previous] of Object.entries(base.skills)) {
    const next = candidate.skills[skillId];
    if (!next) return false;
    if (previous.conceptTaught && !next.conceptTaught) return false;
    if (next.attempts < previous.attempts || next.correct < previous.correct) return false;
    if (!previous.successfulDecisionIds.every((id) => next.successfulDecisionIds.includes(id))) return false;
    if (!previous.retentionDaysPassed.every((day) => next.retentionDaysPassed.includes(day))) return false;
    if (previous.delayedRetrievalPassed && !next.delayedRetrievalPassed) return false;
    if (previous.realHandTransferReviewed && !next.realHandTransferReviewed) return false;
  }
  return true;
}

export function practicalProfileSafeSuccessor(candidateState: unknown, baseState: unknown): boolean {
  if (!hasPracticalProfileField(baseState)) return true;
  if (!learnerStateHasValidPracticalProfile(baseState) || !learnerStateHasValidPracticalProfile(candidateState)) return false;
  const base = (baseState as Record<string, unknown>)[PRACTICAL_PROFILE_FIELD] as PracticalProfileState;
  const candidate = (candidateState as Record<string, unknown>)[PRACTICAL_PROFILE_FIELD] as PracticalProfileState;
  if (JSON.stringify(candidate) === JSON.stringify(base)) return true;
  if (!masteryPreserved(candidate.mastery, base.mastery)) return false;
  if (!performancePreserved(candidate.performance, base.performance)) return false;
  // Study workspace remains mutable rather than evidence-bearing. Without the exact
  // cloud CAS token, changing it cannot prove ancestry safely, so divergence fails closed.
  if (JSON.stringify(candidate.studyWorkspace) !== JSON.stringify(base.studyWorkspace)) return false;
  return true;
}