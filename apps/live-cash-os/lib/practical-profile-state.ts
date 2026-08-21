import {
  PRACTICAL_MASTERY_STATE_SCHEMA_VERSION,
  createPracticalMasteryState,
  type PracticalMasteryState,
} from "./practical-mastery-core";
import type { PracticalPerformanceEvent } from "./practical-performance-telemetry";

export const PRACTICAL_PROFILE_FIELD = "_practicalProfile" as const;
export const PRACTICAL_PROFILE_VERSION = 1 as const;
export const PRACTICAL_PERFORMANCE_LIMIT = 2000;

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
  [PRACTICAL_PROFILE_FIELD]?: PracticalProfileState;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

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

function validMasteryState(value: unknown): value is PracticalMasteryState {
  if (!isRecord(value)) return false;
  if (value.schemaVersion !== PRACTICAL_MASTERY_STATE_SCHEMA_VERSION) return false;
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

export function practicalProfileFromLearnerState(value: unknown, now = new Date()): PracticalProfileState {
  if (!isRecord(value)) return createPracticalProfileState(now);
  const candidate = value[PRACTICAL_PROFILE_FIELD];
  return validatePracticalProfileState(candidate) ? structuredClone(candidate) : createPracticalProfileState(now);
}

export function learnerStateHasValidPracticalProfile(value: unknown): boolean {
  return isRecord(value) && validatePracticalProfileState(value[PRACTICAL_PROFILE_FIELD]);
}

export function withPracticalProfile<T extends LearnerStateWithPracticalProfile>(
  learnerState: T,
  practicalProfile: PracticalProfileState,
  now = new Date(),
): T {
  if (!validatePracticalProfileState(practicalProfile)) throw new Error("Invalid Practical Profile state");
  const next = structuredClone(learnerState);
  next[PRACTICAL_PROFILE_FIELD] = structuredClone(practicalProfile);
  next.revision += 1;
  next.updatedAt = now.toISOString();
  return next;
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
  if (!isRecord(baseState)) return true;
  const baseRaw = baseState[PRACTICAL_PROFILE_FIELD];
  if (baseRaw === undefined) return true;
  if (!validatePracticalProfileState(baseRaw) || !isRecord(candidateState)) return false;
  const candidateRaw = candidateState[PRACTICAL_PROFILE_FIELD];
  if (!validatePracticalProfileState(candidateRaw)) return false;
  if (JSON.stringify(candidateRaw) === JSON.stringify(baseRaw)) return true;
  if (!masteryPreserved(candidateRaw.mastery, baseRaw.mastery)) return false;
  if (!performancePreserved(candidateRaw.performance, baseRaw.performance)) return false;
  // Free-form study notes are mutable rather than append-only. Without the exact
  // cloud CAS token, changing them cannot prove ancestry safely.
  if (JSON.stringify(candidateRaw.studyWorkspace) !== JSON.stringify(baseRaw.studyWorkspace)) return false;
  return true;
}
