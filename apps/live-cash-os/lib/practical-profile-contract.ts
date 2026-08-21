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

export type PracticalStudyWorkspace = {
  version: 1;
  focus: string;
  repairRule: string;
  performanceFlags: string[];
  updatedAt: string;
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

function validStudyWorkspace(value: unknown): value is PracticalStudyWorkspace {
  return isRecord(value)
    && value.version === 1
    && typeof value.focus === "string"
    && typeof value.repairRule === "string"
    && Array.isArray(value.performanceFlags)
    && value.performanceFlags.every((flag) => typeof flag === "string")
    && typeof value.updatedAt === "string";
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
  // Free-form study notes are mutable rather than append-only. Without the exact
  // cloud CAS token, changing them cannot prove ancestry safely.
  if (JSON.stringify(candidate.studyWorkspace) !== JSON.stringify(base.studyWorkspace)) return false;
  return true;
}
