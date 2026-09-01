import { isOrdinaryLearnerDecision, practicalDecisionById, practicalSkillById } from "../content/practical-mastery";
import { isIntegrationDerivedSkill } from "../content/practical-mastery/integration-derived";
import type { CardState } from "./model-core";
import {
  deriveEvidenceStage,
  isPracticalBridgeSkill,
  isSemanticallyValidPracticalAttempt,
  type PracticalMasteryState,
  type PracticalSkillProgress,
} from "./practical-mastery-core";
import { isSemanticallyValidPracticalPerformanceEvent, type PracticalPerformanceEvent } from "./practical-performance-telemetry";
// RETENTION_INTERVAL_DAYS is canonically defined in practical-integrated-session.ts
// (the only writer of PracticalSkillProgress.retentionDaysPassed / IntegratedSessionItem.retentionTierDays);
// imported here rather than duplicated so this validator can never drift from the real tier domain.
import { RETENTION_INTERVAL_DAYS } from "./practical-integrated-session";

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

const RETENTION_TIER_SET = new Set<number>(RETENTION_INTERVAL_DAYS);

// A canonical skill's evidence fields are either a PRIMARY authority the
// writer sets directly (conceptTaught, conceptTaughtAt), a DERIVED authority
// that must match the product's canonical derivation (evidenceStage, and the
// coherence relations below), or a counter the writer only ever moves in one
// direction by fixed increments. successfulDecisionIds is validated against
// the sibling PracticalAttempt array in the SAME state: recordPracticalDecision
// is the only writer, and it always appends the attempt and the
// successfulDecisionIds entry atomically together, so every legitimate id is
// backed by a real correct, semantically valid attempt on that same skill —
// closing both forged and wrong-skill evidence claims at once.
function validSkillProgress(
  skillId: string,
  value: unknown,
  correctDecisionIdsBySkill: ReadonlyMap<string, ReadonlySet<string>>,
): value is PracticalSkillProgress {
  if (!isRecord(value)) return false;
  if (value.skillId !== skillId || !practicalSkillById.has(skillId)) return false;
  if (typeof value.evidenceStage !== "string") return false;
  if (typeof value.conceptTaught !== "boolean") return false;
  if (!(value.conceptTaughtAt === null || typeof value.conceptTaughtAt === "string")) return false;
  if (!Array.isArray(value.successfulDecisionIds) || !value.successfulDecisionIds.every((id) => typeof id === "string")) return false;
  if (!Array.isArray(value.retentionDaysPassed) || !value.retentionDaysPassed.every((day) => typeof day === "number")) return false;
  if (typeof value.delayedRetrievalPassed !== "boolean" || typeof value.realHandTransferReviewed !== "boolean") return false;
  if (typeof value.attempts !== "number" || !Number.isInteger(value.attempts) || value.attempts < 0) return false;
  if (typeof value.correct !== "number" || !Number.isInteger(value.correct) || value.correct < 0 || value.correct > value.attempts) return false;
  if (typeof value.recognitionCorrect !== "number" || !Number.isInteger(value.recognitionCorrect) || value.recognitionCorrect < 0) return false;
  if (typeof value.directDecisionCorrect !== "number" || !Number.isInteger(value.directDecisionCorrect) || value.directDecisionCorrect < 0) return false;
  if (typeof value.changedCorrect !== "number" || !Number.isInteger(value.changedCorrect) || value.changedCorrect < 0) return false;
  if (typeof value.boundaryCorrect !== "number" || !Number.isInteger(value.boundaryCorrect) || value.boundaryCorrect < 0) return false;
  if (typeof value.mixedCorrect !== "number" || !Number.isInteger(value.mixedCorrect) || value.mixedCorrect < 0) return false;
  // Every correct answer increments `correct` and exactly one of the five
  // kind-specific counters (the five PracticalDecision["kind"] values are
  // exhaustive), so the sum must always equal the total.
  if (value.recognitionCorrect + value.directDecisionCorrect + value.changedCorrect + value.boundaryCorrect + value.mixedCorrect !== value.correct) return false;
  if (!(value.lastAttemptAt === null || typeof value.lastAttemptAt === "string")) return false;
  if (!(value.lastIncorrectDecisionId === null || typeof value.lastIncorrectDecisionId === "string")) return false;

  // retentionDaysPassed: only canonical supported tiers, no duplicates,
  // strictly ascending — recordIntegratedDecision always writes through
  // `[...new Set([...prev, tier])].sort((a, b) => a - b)`.
  const seenTiers = new Set<number>();
  for (const day of value.retentionDaysPassed) {
    if (!RETENTION_TIER_SET.has(day) || seenTiers.has(day)) return false;
    seenTiers.add(day);
  }
  for (let index = 1; index < value.retentionDaysPassed.length; index += 1) {
    if (value.retentionDaysPassed[index] <= value.retentionDaysPassed[index - 1]) return false;
  }

  // delayedRetrievalPassed/realHandTransferReviewed can only legitimately be
  // true alongside the prerequisite the canonical writer always establishes
  // first: markDelayedPracticalRetrieval only ever fires in the same branch
  // that just granted a retention tier, and markPracticalRealHandTransfer
  // only sets true when delayedRetrievalPassed is already true.
  if (value.delayedRetrievalPassed && value.retentionDaysPassed.length === 0) return false;
  if (value.realHandTransferReviewed && !value.delayedRetrievalPassed) return false;

  const correctForSkill = correctDecisionIdsBySkill.get(skillId);
  for (const decisionId of value.successfulDecisionIds) {
    if (!correctForSkill?.has(decisionId)) return false;
  }

  // The persisted stage must equal the canonical re-derivation from the
  // now-validated fields above — a forged stage the persisted evidence could
  // not legitimately have produced fails closed rather than being trusted.
  if (value.evidenceStage !== deriveEvidenceStage(value as PracticalSkillProgress)) return false;

  return true;
}

function validMasteryState(value: unknown): value is PracticalMasteryState {
  if (!isRecord(value)) return false;
  if (value.schemaVersion !== PRACTICAL_PROFILE_MASTERY_SCHEMA_VERSION) return false;
  if (typeof value.contentVersion !== "string" || typeof value.revision !== "number" || typeof value.updatedAt !== "string") return false;
  if (!(value.resetFromLegacyAt === null || typeof value.resetFromLegacyAt === "string")) return false;
  if (!isRecord(value.skills) || !Array.isArray(value.attempts)) return false;
  // A persisted/imported/restored attempt row cannot make the profile valid
  // unless it is legitimate product-generated evidence: fail closed here
  // rather than silently dropping or sanitizing a corrupted row, matching the
  // existing recovery contract (practicalProfileFromLearnerState throws,
  // cloud sync surfaces a conflict) instead of inventing a repair path.
  // Duplicate attempt ids are rejected too: continuity restoration resolves a
  // saved attemptId via `.find(id)`, and a collision would silently resolve
  // to whichever row happens to come first rather than the intended one.
  const attemptIds = new Set<string>();
  const correctDecisionIdsBySkill = new Map<string, Set<string>>();
  for (const attempt of value.attempts) {
    if (!isSemanticallyValidPracticalAttempt(attempt)) return false;
    if (attemptIds.has(attempt.id)) return false;
    attemptIds.add(attempt.id);
    if (attempt.correct) {
      const decisionIds = correctDecisionIdsBySkill.get(attempt.skillId) ?? new Set<string>();
      decisionIds.add(attempt.decisionId);
      correctDecisionIdsBySkill.set(attempt.skillId, decisionIds);
    }
  }
  return Object.entries(value.skills).every(([skillId, progress]) => validSkillProgress(skillId, progress, correctDecisionIdsBySkill));
}

function validContinuityIntegratedItem(value: unknown): value is PracticalContinuityIntegratedItem {
  if (!isRecord(value)) return false;
  if (typeof value.decisionId !== "string" || typeof value.skillId !== "string") return false;
  if (typeof value.priority !== "number") return false;
  if (!["REPAIR", "RETENTION", "TRANSFER", "REINFORCE", "RECOGNITION"].includes(String(value.reason))) return false;
  if (typeof value.whyAfterAnswer !== "string") return false;
  if (!(value.retentionTierDays === null || (typeof value.retentionTierDays === "number" && RETENTION_TIER_SET.has(value.retentionTierDays)))) return false;
  // Only the RETENTION pass in buildIntegratedSession ever attaches a tier;
  // every other pass's push() call always omits it (practical-integrated-session.ts).
  if ((value.reason === "RETENTION") !== (value.retentionTierDays !== null)) return false;
  const decision = practicalDecisionById.get(value.decisionId);
  if (!decision || decision.skillId !== value.skillId) return false;
  // Content-only, mastery-state-independent properties: safe to check
  // unconditionally without re-validating dynamic eligibility (which must
  // not invalidate an already-legitimate active round as mastery evolves).
  if (!isOrdinaryLearnerDecision(decision)) return false;
  if (isIntegrationDerivedSkill(value.skillId) || isPracticalBridgeSkill(value.skillId)) return false;
  return true;
}

function validIntegratedContinuity(value: unknown): boolean {
  if (!isRecord(value)) return false;
  if (!(value.focusSkillId === null || typeof value.focusSkillId === "string")) return false;
  if (!Array.isArray(value.items) || value.items.length === 0 || value.items.length > 8) return false;
  const decisionIds = new Set<string>();
  const skillCounts = new Map<string, number>();
  for (const item of value.items) {
    if (!validContinuityIntegratedItem(item)) return false;
    // buildIntegratedSession's push() tracks `excluded` (no decision reused
    // within a round) and caps `skillUse` at 2 per skill; a persisted round
    // could never legitimately have been constructed otherwise.
    if (decisionIds.has(item.decisionId)) return false;
    decisionIds.add(item.decisionId);
    const count = (skillCounts.get(item.skillId) ?? 0) + 1;
    if (count > 2) return false;
    skillCounts.set(item.skillId, count);
  }
  if (typeof value.nextIndex !== "number" || !Number.isInteger(value.nextIndex) || value.nextIndex < 0 || value.nextIndex > value.items.length) return false;
  if (!Array.isArray(value.submittedAttemptIds) || ![value.nextIndex, value.nextIndex + 1].includes(value.submittedAttemptIds.length)) return false;
  if (value.submittedAttemptIds.length > value.items.length) return false;
  if (!value.submittedAttemptIds.every((id) => typeof id === "string")) return false;
  if (typeof value.updatedAt !== "string") return false;
  return true;
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
  if (value.integrated !== null && !validIntegratedContinuity(value.integrated)) return false;
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

function validPerformanceEvents(value: unknown[]): boolean {
  const ids = new Set<string>();
  for (const event of value) {
    if (!isSemanticallyValidPracticalPerformanceEvent(event)) return false;
    // Duplicate ids would collapse in rowsById's Map and could confuse
    // safe-successor identity comparison the same way duplicate attempt ids would.
    if (ids.has(event.id)) return false;
    ids.add(event.id);
  }
  return true;
}

export function validatePracticalProfileState(value: unknown): value is PracticalProfileState {
  return isRecord(value)
    && value.version === PRACTICAL_PROFILE_VERSION
    && validMasteryState(value.mastery)
    && Array.isArray(value.performance)
    && value.performance.length <= PRACTICAL_PERFORMANCE_LIMIT
    && validPerformanceEvents(value.performance)
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