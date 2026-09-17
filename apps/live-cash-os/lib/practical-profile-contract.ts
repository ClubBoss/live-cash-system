import { isOrdinaryLearnerDecision, practicalDecisionById, practicalSkillById } from "../content/practical-mastery";
import { isIntegrationDerivedSkill } from "../content/practical-mastery/integration-derived";
import type { CardState } from "./model-core";
import {
  compactPracticalAttemptHistory,
  createPracticalAttemptArchive,
  createPracticalMasteryState,
  deriveEvidenceStage,
  derivePreA8EligibilityEvidenceStage,
  derivePreFinalEvidenceIntegrityStage,
  derivePreScenarioRecognitionEvidenceStage,
  isPracticalBridgeSkill,
  isCurrentPracticalEvidenceAttempt,
  isSemanticallyValidPracticalAttempt,
  practicalAttemptArchiveProvenanceDigest,
  practicalAttemptHistoryContains,
  PRACTICAL_ATTEMPT_DIGEST_HISTORY_LIMIT,
  PRACTICAL_ATTEMPT_TAIL_LIMIT,
  PRACTICAL_MASTERY_CONTENT_VERSION,
  recordPracticalDecision,
  stageAtLeast,
  type PracticalArchivedSkillProgress,
  type PracticalAttemptArchive,
  type PracticalMasteryState,
  type PracticalSkillProgress,
} from "./practical-mastery-core";
import { isPracticalConfidenceProvenance, type PracticalConfidenceProvenance } from "./practical-confidence";
import { isSemanticallyValidPracticalPerformanceEvent, type PracticalPerformanceEvent } from "./practical-performance-telemetry";
// RETENTION_INTERVAL_DAYS is canonically defined in practical-integrated-session.ts
// (the only writer of PracticalSkillProgress.retentionDaysPassed / IntegratedSessionItem.retentionTierDays);
// imported here rather than duplicated so this validator can never drift from the real tier domain.
import { RETENTION_INTERVAL_DAYS } from "./practical-integrated-session";

export const PRACTICAL_PROFILE_FIELD = "_practicalProfile" as const;
export const PRACTICAL_PROFILE_VERSION = 1 as const;
export const PRACTICAL_PROFILE_MASTERY_SCHEMA_VERSION = 5 as const;
const PREVIOUS_PRACTICAL_PROFILE_MASTERY_SCHEMA_VERSION = 4 as const;
const LEGACY_PRACTICAL_PROFILE_MASTERY_SCHEMA_VERSION = 3 as const;
export const PRACTICAL_PERFORMANCE_LIMIT = 512;
const LEGACY_PRACTICAL_PERFORMANCE_LIMIT = 2000;
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

export type PracticalIntegratedDraft = {
  index: number;
  actionId: string | null;
  reasonId: string | null;
  confidence: number;
  confidenceProvenance: PracticalConfidenceProvenance;
  updatedAt: string;
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
    draft: PracticalIntegratedDraft | null;
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
const CANONICAL_PRACTICAL_SKILL_IDS = Object.keys(createPracticalMasteryState(new Date(0)).skills).sort();
function isCurrentEvidenceRow(value: unknown): boolean { return isCurrentPracticalEvidenceAttempt(value); }

function deterministicAttemptFieldsMatch(value: PracticalSkillProgress, replayed: PracticalSkillProgress): boolean {
  return value.attempts === replayed.attempts
    && value.correct === replayed.correct
    && value.recognitionCorrect === replayed.recognitionCorrect
    && value.directDecisionCorrect === replayed.directDecisionCorrect
    && value.changedCorrect === replayed.changedCorrect
    && value.boundaryCorrect === replayed.boundaryCorrect
    && value.mixedCorrect === replayed.mixedCorrect
    && value.lastAttemptAt === replayed.lastAttemptAt
    && value.lastIncorrectDecisionId === replayed.lastIncorrectDecisionId
    && JSON.stringify(value.successfulDecisionIds) === JSON.stringify(replayed.successfulDecisionIds);
}

// The persisted attempt ledger is the authority for fields written only by
// recordPracticalDecision. Replay that ledger through the canonical writer so
// validation cannot drift into a second mastery model. Independent authorities
// (concept/retention/delayed-retrieval/real-hand review) remain validated on
// their own domains below rather than being reconstructed from attempts.
function validSkillProgress(
  skillId: string,
  value: unknown,
  replayed: PracticalSkillProgress,
  allowPreScenarioRecognitionStage = false,
  allowPreA8EligibilityStage = false,
  allowPreFinalEvidenceIntegrityStage = false,
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
  if (value.recognitionCorrect + value.directDecisionCorrect + value.changedCorrect + value.boundaryCorrect + value.mixedCorrect !== value.correct) return false;
  if (!(value.lastAttemptAt === null || typeof value.lastAttemptAt === "string")) return false;
  if (!(value.lastIncorrectDecisionId === null || typeof value.lastIncorrectDecisionId === "string")) return false;

  const seenTiers = new Set<number>();
  for (const day of value.retentionDaysPassed) {
    if (!RETENTION_TIER_SET.has(day) || seenTiers.has(day)) return false;
    seenTiers.add(day);
  }
  for (let index = 1; index < value.retentionDaysPassed.length; index += 1) {
    if (value.retentionDaysPassed[index] <= value.retentionDaysPassed[index - 1]) return false;
  }

  // conceptTaught / retentionDaysPassed / delayedRetrievalPassed /
  // realHandTransferReviewed each have independent persisted/canonical-writer
  // authority; unlike attempts/correct/etc. above, they are never reconstructed
  // from the attempt ledger by deterministicAttemptFieldsMatch. The only
  // required cross-field relationship is directional (delayed requires its
  // retention prerequisite; real-hand transfer requires delayed retrieval).
  // There is deliberately no converse invariant requiring
  // retentionDaysPassed.length > 0 to imply delayedRetrievalPassed === true:
  // supported retention tiers may exist on their own independent authority.
  if (value.delayedRetrievalPassed && value.retentionDaysPassed.length === 0) return false;
  if (value.realHandTransferReviewed && !value.delayedRetrievalPassed) return false;

  if (!deterministicAttemptFieldsMatch(value as PracticalSkillProgress, replayed)) return false;

  const currentStage = deriveEvidenceStage(value as PracticalSkillProgress);
  if (value.evidenceStage !== currentStage) {
    if (!allowPreScenarioRecognitionStage && !allowPreA8EligibilityStage && !allowPreFinalEvidenceIntegrityStage) return false;
    const previousStage = derivePreScenarioRecognitionEvidenceStage(value as PracticalSkillProgress);
    // Compatibility is one-way only: an old stored stage must be exactly what
    // its historical writer derived and may only reconcile to equal/lower current evidence.
    const preA8Stage = derivePreA8EligibilityEvidenceStage(value as PracticalSkillProgress);
    const preFinalStage = derivePreFinalEvidenceIntegrityStage(value as PracticalSkillProgress);
    const preScenarioAccepted = allowPreScenarioRecognitionStage && value.evidenceStage === previousStage && stageAtLeast(previousStage, currentStage);
    const preA8Accepted = allowPreA8EligibilityStage && value.evidenceStage === preA8Stage && stageAtLeast(preA8Stage, currentStage);
    const preFinalAccepted = allowPreFinalEvidenceIntegrityStage && value.evidenceStage === preFinalStage && stageAtLeast(preFinalStage, currentStage);
    if (!preScenarioAccepted && !preA8Accepted && !preFinalAccepted) return false;
  }

  return true;
}

function canonicalIso(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const ms = Date.parse(value);
  return Number.isFinite(ms) && new Date(ms).toISOString() === value;
}

function validArchivedSkillProgress(skillId: string, value: unknown, archiveCount: number): value is PracticalArchivedSkillProgress {
  if (!isRecord(value)) return false;
  for (const key of ["attempts", "correct", "recognitionCorrect", "directDecisionCorrect", "changedCorrect", "boundaryCorrect", "mixedCorrect"]) {
    if (typeof value[key] !== "number" || !Number.isInteger(value[key]) || Number(value[key]) < 0) return false;
  }
  if (Number(value.correct) > Number(value.attempts)) return false;
  if (Number(value.recognitionCorrect) + Number(value.directDecisionCorrect) + Number(value.changedCorrect) + Number(value.boundaryCorrect) + Number(value.mixedCorrect) !== Number(value.correct)) return false;
  if (!Array.isArray(value.successfulDecisionIds) || new Set(value.successfulDecisionIds).size !== value.successfulDecisionIds.length) return false;
  if (!value.successfulDecisionIds.every((decisionId) => typeof decisionId === "string" && practicalDecisionById.get(decisionId)?.skillId === skillId)) return false;
  if (!(value.lastAttemptAt === null || canonicalIso(value.lastAttemptAt))) return false;
  if (!(value.lastIncorrectDecisionId === null || (typeof value.lastIncorrectDecisionId === "string" && practicalDecisionById.get(value.lastIncorrectDecisionId)?.skillId === skillId))) return false;

  if (value.lastCorrect !== null) {
    if (!isRecord(value.lastCorrect)
      || typeof value.lastCorrect.decisionId !== "string"
      || practicalDecisionById.get(value.lastCorrect.decisionId)?.skillId !== skillId
      || !canonicalIso(value.lastCorrect.answeredAt)
      || typeof value.lastCorrect.ordinal !== "number"
      || !Number.isInteger(value.lastCorrect.ordinal)
      || value.lastCorrect.ordinal < 1
      || value.lastCorrect.ordinal > archiveCount
      || !value.successfulDecisionIds.includes(value.lastCorrect.decisionId)) return false;
  } else if (Number(value.correct) > 0) return false;

  if (!Array.isArray(value.recentAttempts) || value.recentAttempts.length > 8 || value.recentAttempts.length > Number(value.attempts)) return false;
  let previousOrdinal = 0;
  for (const rawRef of value.recentAttempts) {
    if (!isRecord(rawRef)
      || typeof rawRef.decisionId !== "string"
      || practicalDecisionById.get(rawRef.decisionId)?.skillId !== skillId
      || typeof rawRef.correct !== "boolean"
      || typeof rawRef.confidence !== "number"
      || !Number.isInteger(rawRef.confidence)
      || rawRef.confidence < 0
      || rawRef.confidence > 100
      || !(rawRef.confidenceProvenance === undefined || isPracticalConfidenceProvenance(rawRef.confidenceProvenance))
      || !canonicalIso(rawRef.answeredAt)
      || typeof rawRef.ordinal !== "number"
      || !Number.isInteger(rawRef.ordinal)
      || rawRef.ordinal < 1
      || rawRef.ordinal > archiveCount
      || rawRef.ordinal <= previousOrdinal) return false;
    previousOrdinal = rawRef.ordinal;
  }
  if (Number(value.attempts) > 0) {
    if (value.recentAttempts.length === 0 || value.lastAttemptAt !== value.recentAttempts.at(-1)?.answeredAt) return false;
  } else if (value.lastAttemptAt !== null || value.lastIncorrectDecisionId !== null || value.lastCorrect !== null) return false;
  return true;
}

function validAttemptArchive(value: unknown): value is PracticalAttemptArchive {
  if (!isRecord(value) || value.version !== 2 || typeof value.count !== "number" || !Number.isInteger(value.count) || value.count < 0) return false;
  if (typeof value.digest !== "string" || !/^[0-9a-f]{16}$/u.test(value.digest)) return false;
  if (typeof value.provenanceDigest !== "string" || !/^[0-9a-f]{16}$/u.test(value.provenanceDigest)) return false;
  if (value.provenanceDigest !== practicalAttemptArchiveProvenanceDigest(value)) return false;
  if (!Array.isArray(value.recentDigests) || value.recentDigests.length > PRACTICAL_ATTEMPT_DIGEST_HISTORY_LIMIT || !value.recentDigests.every((digest) => typeof digest === "string" && /^[0-9a-f]{16}$/u.test(digest))) return false;
  if (!isRecord(value.bySkill) || !isRecord(value.latestByDecision) || !isRecord(value.latestCorrectOrdinalByDecision) || !isRecord(value.attemptCountByDecision)) return false;
  if (value.count === 0) {
    const empty = createPracticalAttemptArchive();
    if (value.digest !== empty.digest
      || value.recentDigests.length !== 0
      || Object.keys(value.bySkill).length
      || Object.keys(value.latestByDecision).length
      || Object.keys(value.latestCorrectOrdinalByDecision).length
      || Object.keys(value.attemptCountByDecision).length) return false;
    return true;
  }
  if (value.recentDigests.length === 0 || value.recentDigests.at(-1) !== value.digest) return false;

  let counted = 0;
  for (const [decisionId, count] of Object.entries(value.attemptCountByDecision)) {
    if (!practicalDecisionById.has(decisionId) || typeof count !== "number" || !Number.isInteger(count) || count <= 0) return false;
    counted += count;
  }
  if (counted !== value.count) return false;

  let skillCount = 0;
  const successfulIds = new Set<string>();
  const maxCorrectBySkill = new Map<string, { decisionId: string; ordinal: number }>();
  for (const [skillId, progress] of Object.entries(value.bySkill)) {
    if (!practicalSkillById.has(skillId) || !validArchivedSkillProgress(skillId, progress, value.count)) return false;
    skillCount += progress.attempts;
    for (const decisionId of progress.successfulDecisionIds) successfulIds.add(decisionId);
  }
  if (skillCount !== value.count) return false;

  for (const [decisionId, rawRef] of Object.entries(value.latestByDecision)) {
    if (!isRecord(rawRef)
      || typeof rawRef.ordinal !== "number"
      || !Number.isInteger(rawRef.ordinal)
      || rawRef.ordinal < 1
      || rawRef.ordinal > value.count
      || !isSemanticallyValidPracticalAttempt(rawRef.attempt)
      || rawRef.attempt.decisionId !== decisionId
      || !(decisionId in value.attemptCountByDecision)) return false;
  }
  if (Object.keys(value.latestByDecision).length !== Object.keys(value.attemptCountByDecision).length) return false;

  const latestCorrectIds = new Set<string>();
  for (const [decisionId, ordinal] of Object.entries(value.latestCorrectOrdinalByDecision)) {
    const decision = practicalDecisionById.get(decisionId);
    const latest = value.latestByDecision[decisionId];
    const latestOrdinal = isRecord(latest) && typeof latest.ordinal === "number" ? latest.ordinal : null;
    if (!decision
      || typeof ordinal !== "number"
      || !Number.isInteger(ordinal)
      || ordinal < 1
      || ordinal > value.count
      || latestOrdinal === null
      || ordinal > latestOrdinal) return false;
    latestCorrectIds.add(decisionId);
    const current = maxCorrectBySkill.get(decision.skillId);
    if (!current || ordinal > current.ordinal) maxCorrectBySkill.set(decision.skillId, { decisionId, ordinal });
  }
  if (latestCorrectIds.size !== successfulIds.size || [...successfulIds].some((decisionId) => !latestCorrectIds.has(decisionId))) return false;

  for (const [skillId, rawProgress] of Object.entries(value.bySkill)) {
    const progress = rawProgress as PracticalArchivedSkillProgress;
    const expected = maxCorrectBySkill.get(skillId) ?? null;
    if (!expected) {
      if (progress.lastCorrect !== null) return false;
    } else if (!progress.lastCorrect
      || progress.lastCorrect.decisionId !== expected.decisionId
      || progress.lastCorrect.ordinal !== expected.ordinal) return false;
  }
  return true;
}

function upgradePreviousAttemptArchive(value: unknown): PracticalAttemptArchive | null {
  if (!isRecord(value) || value.version !== 1 || Object.prototype.hasOwnProperty.call(value, "provenanceDigest")) return null;
  const upgraded = structuredClone(value) as Record<string, unknown>;
  upgraded.version = 2;
  upgraded.provenanceDigest = practicalAttemptArchiveProvenanceDigest(upgraded);
  return validAttemptArchive(upgraded) ? upgraded : null;
}

function masteryHeaderAndSkills(value: Record<string, unknown>): value is Record<string, unknown> & { skills: Record<string, unknown>; attempts: unknown[] } {
  if (typeof value.contentVersion !== "string" || typeof value.revision !== "number" || typeof value.updatedAt !== "string") return false;
  if (!(value.resetFromLegacyAt === null || typeof value.resetFromLegacyAt === "string")) return false;
  if (!isRecord(value.skills) || !Array.isArray(value.attempts)) return false;
  const persistedSkillIds = Object.keys(value.skills).sort();
  return persistedSkillIds.length === CANONICAL_PRACTICAL_SKILL_IDS.length
    && !persistedSkillIds.some((skillId, index) => skillId !== CANONICAL_PRACTICAL_SKILL_IDS[index]);
}

function replayTailFromArchive(mastery: PracticalMasteryState, allowPrevious4BpSemantic = false): PracticalMasteryState | null {
  if (!validAttemptArchive(mastery.attemptArchive) || mastery.attempts.length > PRACTICAL_ATTEMPT_TAIL_LIMIT) return null;
  let replayed = createPracticalMasteryState(new Date(0));
  replayed.attemptArchive = structuredClone(mastery.attemptArchive);
  for (const skillId of CANONICAL_PRACTICAL_SKILL_IDS) {
    const archived = mastery.attemptArchive.bySkill[skillId];
    if (!archived) continue;
    Object.assign(replayed.skills[skillId], {
      attempts: archived.attempts,
      correct: archived.correct,
      recognitionCorrect: archived.recognitionCorrect,
      directDecisionCorrect: archived.directDecisionCorrect,
      changedCorrect: archived.changedCorrect,
      boundaryCorrect: archived.boundaryCorrect,
      mixedCorrect: archived.mixedCorrect,
      successfulDecisionIds: [...archived.successfulDecisionIds],
      lastAttemptAt: archived.lastAttemptAt,
      lastIncorrectDecisionId: archived.lastIncorrectDecisionId,
    });
  }

  const attemptIds = new Set<string>();
  for (const attempt of mastery.attempts) {
    if (!isSemanticallyValidPracticalAttempt(attempt) || attemptIds.has(attempt.id)) return null;
    attemptIds.add(attempt.id);
    const priorProgress = structuredClone(replayed.skills[attempt.skillId]);
    replayed = recordPracticalDecision(replayed, {
      decisionId: attempt.decisionId,
      actionId: attempt.actionId,
      reasonId: attempt.reasonId,
      confidence: attempt.confidence,
      confidenceProvenance: attempt.confidenceProvenance ?? "NOT_CAPTURED",
      now: new Date(attempt.answeredAt),
    });
    // recordPracticalDecision writes today's semantic revision. Replay must not
    // upgrade a persisted pre-revision row merely by reading it. Keep raw attempt/last-attempt accounting, but restore current-generation
    // correct/mastery evidence for
    // any row that is raw-valid yet no longer current evidence.
    replayed.attempts[replayed.attempts.length - 1] = structuredClone(attempt);
    if (!allowPrevious4BpSemantic && !isCurrentEvidenceRow(attempt) && /^PM-4BP-0[1-4]-A7-10[1-8]$/u.test(attempt.decisionId)) {
      const progress = replayed.skills[attempt.skillId];
      progress.correct = priorProgress.correct;
      progress.recognitionCorrect = priorProgress.recognitionCorrect;
      progress.directDecisionCorrect = priorProgress.directDecisionCorrect;
      progress.changedCorrect = priorProgress.changedCorrect;
      progress.boundaryCorrect = priorProgress.boundaryCorrect;
      progress.mixedCorrect = priorProgress.mixedCorrect;
      progress.successfulDecisionIds = [...priorProgress.successfulDecisionIds];
      progress.lastIncorrectDecisionId = priorProgress.lastIncorrectDecisionId;
      progress.evidenceStage = deriveEvidenceStage(progress);
    }
  }
  return replayed;
}

type CurrentProfileCompatibilityOptions = {
  allowPrevious4BpSemantic?: boolean;
  allowPreA8EligibilityStage?: boolean;
};

function validCurrentMasteryState(value: unknown, options: CurrentProfileCompatibilityOptions = {}): value is PracticalMasteryState {
  if (!isRecord(value) || value.schemaVersion !== PRACTICAL_PROFILE_MASTERY_SCHEMA_VERSION || !masteryHeaderAndSkills(value)) return false;
  if (!validAttemptArchive(value.attemptArchive)) return false;
  const mastery = value as unknown as PracticalMasteryState;
  const replayed = replayTailFromArchive(mastery, options.allowPrevious4BpSemantic ?? false);
  if (!replayed) return false;
  return CANONICAL_PRACTICAL_SKILL_IDS.every((skillId) => validSkillProgress(
    skillId,
    mastery.skills[skillId],
    replayed.skills[skillId],
    false,
    options.allowPreA8EligibilityStage ?? false,
  ));
}

function previousMasteryCurrentShape(value: unknown): PracticalMasteryState | null {
  if (!isRecord(value) || value.schemaVersion !== PREVIOUS_PRACTICAL_PROFILE_MASTERY_SCHEMA_VERSION || !masteryHeaderAndSkills(value)) return null;
  const attemptArchive = upgradePreviousAttemptArchive(value.attemptArchive);
  if (!attemptArchive) return null;
  const next = structuredClone(value) as Record<string, unknown>;
  next.schemaVersion = PRACTICAL_PROFILE_MASTERY_SCHEMA_VERSION;
  next.attemptArchive = attemptArchive;
  return next as unknown as PracticalMasteryState;
}

function validPreviousMasteryState(value: unknown, options: CurrentProfileCompatibilityOptions = {}): boolean {
  const mastery = previousMasteryCurrentShape(value);
  if (!mastery) return false;
  const replayed = replayTailFromArchive(mastery, options.allowPrevious4BpSemantic ?? false);
  if (!replayed) return false;
  return CANONICAL_PRACTICAL_SKILL_IDS.every((skillId) => validSkillProgress(
    skillId,
    mastery.skills[skillId],
    replayed.skills[skillId],
    false,
    options.allowPreA8EligibilityStage ?? false,
    true,
  ));
}

function validLegacyMasteryState(value: unknown, allowPreScenarioRecognitionStage = false): boolean {
  if (!isRecord(value) || value.schemaVersion !== LEGACY_PRACTICAL_PROFILE_MASTERY_SCHEMA_VERSION || Object.prototype.hasOwnProperty.call(value, "attemptArchive") || !masteryHeaderAndSkills(value)) return false;
  const skills = value.skills;
  const attemptIds = new Set<string>();
  let replayed = createPracticalMasteryState(new Date(0));
  for (const rawAttempt of value.attempts) {
    if (!isSemanticallyValidPracticalAttempt(rawAttempt) || rawAttempt.confidenceProvenance !== undefined || attemptIds.has(rawAttempt.id)) return false;
    attemptIds.add(rawAttempt.id);
    replayed = recordPracticalDecision(replayed, {
      decisionId: rawAttempt.decisionId,
      actionId: rawAttempt.actionId,
      reasonId: rawAttempt.reasonId,
      confidence: rawAttempt.confidence,
      confidenceProvenance: "NOT_CAPTURED",
      now: new Date(rawAttempt.answeredAt),
    });
  }
  return CANONICAL_PRACTICAL_SKILL_IDS.every((skillId) => (
    validSkillProgress(skillId, skills[skillId], replayed.skills[skillId], allowPreScenarioRecognitionStage)
  ));
}

function validContinuityIntegratedItem(value: unknown): value is PracticalContinuityIntegratedItem {
  if (!isRecord(value)) return false;
  if (typeof value.decisionId !== "string" || typeof value.skillId !== "string") return false;
  if (typeof value.priority !== "number") return false;
  if (!["REPAIR", "RETENTION", "TRANSFER", "REINFORCE", "RECOGNITION"].includes(String(value.reason))) return false;
  if (typeof value.whyAfterAnswer !== "string") return false;
  if (!(value.retentionTierDays === null || (typeof value.retentionTierDays === "number" && RETENTION_TIER_SET.has(value.retentionTierDays)))) return false;
  if ((value.reason === "RETENTION") !== (value.retentionTierDays !== null)) return false;
  const decision = practicalDecisionById.get(value.decisionId);
  if (!decision || decision.skillId !== value.skillId) return false;
  if (!isOrdinaryLearnerDecision(decision)) return false;
  if (isIntegrationDerivedSkill(value.skillId) || isPracticalBridgeSkill(value.skillId)) return false;
  return true;
}

function validIntegratedContinuity(value: unknown): boolean {
  if (!isRecord(value)) return false;
  if (!(value.focusSkillId === null || typeof value.focusSkillId === "string")) return false;
  if (!Array.isArray(value.items) || value.items.length === 0 || value.items.length > 8) return false;

  const focused = value.focusSkillId !== null;
  if (focused && !practicalSkillById.has(value.focusSkillId as string)) return false;

  const decisionIds = new Set<string>();
  const skillCounts = new Map<string, number>();
  for (const item of value.items) {
    if (!validContinuityIntegratedItem(item)) return false;
    if (decisionIds.has(item.decisionId)) return false;
    decisionIds.add(item.decisionId);

    if (focused) {
      if (item.skillId !== value.focusSkillId) return false;
    } else {
      const count = (skillCounts.get(item.skillId) ?? 0) + 1;
      if (count > 3) return false;
      skillCounts.set(item.skillId, count);
    }
  }
  if (typeof value.nextIndex !== "number" || !Number.isInteger(value.nextIndex) || value.nextIndex < 0 || value.nextIndex > value.items.length) return false;
  if (!Array.isArray(value.submittedAttemptIds) || ![value.nextIndex, value.nextIndex + 1].includes(value.submittedAttemptIds.length)) return false;
  if (value.submittedAttemptIds.length > value.items.length) return false;
  if (!value.submittedAttemptIds.every((id) => typeof id === "string")) return false;
  if (!Object.prototype.hasOwnProperty.call(value, "draft")) return false;
  if (value.draft !== null) {
    const draft = value.draft;
    if (!isRecord(draft)
      || typeof draft.index !== "number"
      || !Number.isInteger(draft.index)
      || draft.index !== value.nextIndex
      || draft.index < 0
      || draft.index >= value.items.length
      || value.submittedAttemptIds.length !== value.nextIndex
      || !(draft.actionId === null || typeof draft.actionId === "string")
      || !(draft.reasonId === null || typeof draft.reasonId === "string")
      || typeof draft.confidence !== "number"
      || !Number.isInteger(draft.confidence)
      || draft.confidence < 0
      || draft.confidence > 100
      || !isPracticalConfidenceProvenance(draft.confidenceProvenance)
      || typeof draft.updatedAt !== "string") return false;
    const draftDecision = practicalDecisionById.get(value.items[draft.index].decisionId);
    if (!draftDecision) return false;
    if (draft.actionId !== null && !draftDecision.actionOptions.some((option) => option.id === draft.actionId)) return false;
    if (draft.reasonId !== null && !draftDecision.reasonOptions.some((option) => option.id === draft.reasonId)) return false;
  }
  if (typeof value.updatedAt !== "string") return false;
  return true;
}

function validContinuityWorkspace(value: unknown, allowMissingIntegratedDraft = false): value is PracticalContinuityWorkspace {
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
    if (allowMissingIntegratedDraft && isRecord(value.integrated) && !Object.prototype.hasOwnProperty.call(value.integrated, "draft")) {
      if (!validIntegratedContinuity({ ...value.integrated, draft: null })) return false;
    } else if (!validIntegratedContinuity(value.integrated)) return false;
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

function validStudyWorkspace(value: unknown, allowMissingIntegratedDraft = false): value is PracticalStudyWorkspace {
  return isRecord(value)
    && value.version === 1
    && typeof value.focus === "string"
    && typeof value.repairRule === "string"
    && Array.isArray(value.performanceFlags)
    && value.performanceFlags.every((flag) => typeof flag === "string")
    && typeof value.updatedAt === "string"
    && (value.continuity === undefined || validContinuityWorkspace(value.continuity, allowMissingIntegratedDraft));
}

function validPerformanceEvents(value: unknown[], provenance: "CURRENT" | "LEGACY"): boolean {
  const ids = new Set<string>();
  for (const event of value) {
    if (!isSemanticallyValidPracticalPerformanceEvent(event)) return false;
    if (provenance === "LEGACY" && event.confidenceProvenance !== undefined) return false;
    if (ids.has(event.id)) return false;
    ids.add(event.id);
  }
  return true;
}

function validCurrentPracticalProfileState(value: unknown, options: CurrentProfileCompatibilityOptions = {}): value is PracticalProfileState {
  return isRecord(value)
    && value.version === PRACTICAL_PROFILE_VERSION
    && validCurrentMasteryState(value.mastery, options)
    && Array.isArray(value.performance)
    && value.performance.length <= PRACTICAL_PERFORMANCE_LIMIT
    && validPerformanceEvents(value.performance, "CURRENT")
    && validStudyWorkspace(value.studyWorkspace);
}

function validPreviousPracticalProfileState(value: unknown, options: CurrentProfileCompatibilityOptions = {}): boolean {
  return isRecord(value)
    && value.version === PRACTICAL_PROFILE_VERSION
    && validPreviousMasteryState(value.mastery, options)
    && Array.isArray(value.performance)
    && value.performance.length <= PRACTICAL_PERFORMANCE_LIMIT
    && validPerformanceEvents(value.performance, "CURRENT")
    && validStudyWorkspace(value.studyWorkspace);
}

function validLegacyPracticalProfileState(value: unknown, allowPreScenarioRecognitionStage: boolean): boolean {
  return isRecord(value)
    && value.version === PRACTICAL_PROFILE_VERSION
    && validLegacyMasteryState(value.mastery, allowPreScenarioRecognitionStage)
    && Array.isArray(value.performance)
    && value.performance.length <= LEGACY_PRACTICAL_PERFORMANCE_LIMIT
    && validPerformanceEvents(value.performance, "LEGACY")
    && validStudyWorkspace(value.studyWorkspace, true);
}

function migrateLegacyStudyWorkspace(value: PracticalStudyWorkspace): PracticalStudyWorkspace {
  const next = structuredClone(value);
  if (next.continuity?.integrated && !Object.prototype.hasOwnProperty.call(next.continuity.integrated, "draft")) {
    next.continuity.integrated = { ...next.continuity.integrated, draft: null };
  }
  return next;
}

function migrateLegacyMastery(value: Record<string, unknown>): PracticalMasteryState {
  const legacy = structuredClone(value) as Record<string, unknown> & {
    skills: Record<string, PracticalSkillProgress>;
    attempts: Array<PracticalMasteryState["attempts"][number]>;
  };
  let next = {
    ...legacy,
    schemaVersion: PRACTICAL_PROFILE_MASTERY_SCHEMA_VERSION,
    attemptArchive: createPracticalAttemptArchive(),
    attempts: legacy.attempts.map((attempt) => ({ ...attempt })),
  } as unknown as PracticalMasteryState;
  next = compactPracticalAttemptHistory(next, true);
  for (const progress of Object.values(next.skills)) progress.evidenceStage = deriveEvidenceStage(progress);
  return next;
}

const REWRITTEN_4BP_SKILL_IDS = new Set(["4BP-01", "4BP-02", "4BP-03", "4BP-04"]);
const REWRITTEN_4BP_DECISION_ID = /^PM-4BP-0[1-4]-A7-10[1-8]$/u;

function reconcile4BpObjectiveSemanticRevision(profile: PracticalProfileState): PracticalProfileState {
  if (profile.mastery.contentVersion === PRACTICAL_MASTERY_CONTENT_VERSION) return structuredClone(profile);
  const next = structuredClone(profile);
  const mastery = next.mastery;
  mastery.contentVersion = PRACTICAL_MASTERY_CONTENT_VERSION;

  for (const skillId of REWRITTEN_4BP_SKILL_IDS) {
    const progress = mastery.skills[skillId];
    progress.correct = 0;
    progress.recognitionCorrect = 0;
    progress.directDecisionCorrect = 0;
    progress.changedCorrect = 0;
    progress.boundaryCorrect = 0;
    progress.mixedCorrect = 0;
    progress.successfulDecisionIds = [];
    progress.lastIncorrectDecisionId = null;
    progress.retentionDaysPassed = [];
    progress.delayedRetrievalPassed = false;
    progress.realHandTransferReviewed = false;

    const archived = mastery.attemptArchive.bySkill[skillId];
    if (archived) {
      archived.correct = 0;
      archived.recognitionCorrect = 0;
      archived.directDecisionCorrect = 0;
      archived.changedCorrect = 0;
      archived.boundaryCorrect = 0;
      archived.mixedCorrect = 0;
      archived.successfulDecisionIds = [];
      archived.lastIncorrectDecisionId = null;
      archived.lastCorrect = null;
    }
  }
  for (const decisionId of Object.keys(mastery.attemptArchive.latestCorrectOrdinalByDecision)) {
    if (REWRITTEN_4BP_DECISION_ID.test(decisionId)) delete mastery.attemptArchive.latestCorrectOrdinalByDecision[decisionId];
  }

  // A profile created before this content generation cannot have archived V3
  // evidence. A current V3 row may only exist in its un-compacted tail (for
  // example after an interrupted save around rollout), so rebuild that bounded
  // evidence without touching raw rows or unrelated skills.
  for (const attempt of mastery.attempts) {
    if (!REWRITTEN_4BP_SKILL_IDS.has(attempt.skillId) || !isCurrentEvidenceRow(attempt)) continue;
    const decision = practicalDecisionById.get(attempt.decisionId);
    if (!decision) continue;
    const progress = mastery.skills[attempt.skillId];
    if (attempt.correct) {
      progress.correct += 1;
      if (!progress.successfulDecisionIds.includes(attempt.decisionId)) progress.successfulDecisionIds.push(attempt.decisionId);
      if (decision.kind === "recognition") progress.recognitionCorrect += 1;
      if (decision.kind === "decision") progress.directDecisionCorrect += 1;
      if (decision.kind === "changed") progress.changedCorrect += 1;
      if (decision.kind === "boundary") progress.boundaryCorrect += 1;
      if (decision.kind === "mixed") progress.mixedCorrect += 1;
      if (progress.lastIncorrectDecisionId === attempt.decisionId) progress.lastIncorrectDecisionId = null;
    } else progress.lastIncorrectDecisionId = attempt.decisionId;
  }
  for (const skillId of REWRITTEN_4BP_SKILL_IDS) mastery.skills[skillId].evidenceStage = deriveEvidenceStage(mastery.skills[skillId]);
  mastery.attemptArchive.provenanceDigest = practicalAttemptArchiveProvenanceDigest(mastery.attemptArchive as unknown as Record<string, unknown>);
  return next;
}

export type PracticalProfileNormalization = {
  state: PracticalProfileState;
  migratedFromSchema3: boolean;
  recognitionStageReconciled: boolean;
};

function reconcileEvidenceStagesToCurrent(profile: PracticalProfileState): { state: PracticalProfileState; reconciled: boolean } {
  const next = structuredClone(profile);
  let reconciled = false;
  for (const progress of Object.values(next.mastery.skills)) {
    const currentStage = deriveEvidenceStage(progress);
    if (progress.evidenceStage === currentStage) continue;
    progress.evidenceStage = currentStage;
    reconciled = true;
    if (!stageAtLeast(currentStage, "BOUNDARY_TESTED")) {
      progress.retentionDaysPassed = [];
      progress.delayedRetrievalPassed = false;
      progress.realHandTransferReviewed = false;
    } else if (!stageAtLeast(currentStage, "DELAYED_RETRIEVAL")) {
      progress.delayedRetrievalPassed = false;
      progress.realHandTransferReviewed = false;
    } else if (!stageAtLeast(currentStage, "REAL_HAND_TRANSFER")) {
      progress.realHandTransferReviewed = false;
    }
  }
  return { state: next, reconciled };
}

function migratePreviousPracticalProfile(value: unknown): { state: PracticalProfileState; reconciled: boolean } | null {
  if (!validPreviousPracticalProfileState(value, { allowPrevious4BpSemantic: true, allowPreA8EligibilityStage: true }) || !isRecord(value)) return null;
  const mastery = previousMasteryCurrentShape(value.mastery);
  if (!mastery) return null;
  let next = { ...structuredClone(value), mastery } as unknown as PracticalProfileState;
  next = reconcile4BpObjectiveSemanticRevision(next);
  const stageResult = reconcileEvidenceStagesToCurrent(next);
  next = stageResult.state;
  next.mastery.attemptArchive.provenanceDigest = practicalAttemptArchiveProvenanceDigest(next.mastery.attemptArchive as unknown as Record<string, unknown>);
  return validCurrentPracticalProfileState(next) ? { state: next, reconciled: stageResult.reconciled } : null;
}

export function normalizePracticalProfileState(value: unknown): PracticalProfileNormalization | null {
  if (validCurrentPracticalProfileState(value)) {
    return { state: structuredClone(value), migratedFromSchema3: false, recognitionStageReconciled: false };
  }
  const previous = migratePreviousPracticalProfile(value);
  if (previous) {
    return { state: previous.state, migratedFromSchema3: false, recognitionStageReconciled: previous.reconciled };
  }
  if (!validLegacyPracticalProfileState(value, true) || !isRecord(value) || !isRecord(value.mastery)) return null;

  const recognitionStageReconciled = !validLegacyPracticalProfileState(value, false);
  const legacy = structuredClone(value) as Record<string, unknown> & {
    mastery: Record<string, unknown>;
    performance: PracticalPerformanceEvent[];
    studyWorkspace: PracticalStudyWorkspace;
  };
  const migrated = {
    ...legacy,
    version: PRACTICAL_PROFILE_VERSION,
    mastery: migrateLegacyMastery(legacy.mastery),
    performance: legacy.performance.slice(-PRACTICAL_PERFORMANCE_LIMIT).map((event) => ({ ...event })),
    studyWorkspace: migrateLegacyStudyWorkspace(legacy.studyWorkspace),
  } as PracticalProfileState;
  const reconciled = reconcile4BpObjectiveSemanticRevision(migrated);
  if (!validCurrentPracticalProfileState(reconciled)) return null;
  return { state: reconciled, migratedFromSchema3: true, recognitionStageReconciled };
}

export function validatePracticalProfileState(value: unknown): value is PracticalProfileState {
  return validCurrentPracticalProfileState(value);
}

export function reconcilePreScenarioPracticalProfile(value: unknown): PracticalProfileState | null {
  return normalizePracticalProfileState(value)?.state ?? null;
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

function performancePreserved(candidate: PracticalPerformanceEvent[], base: PracticalPerformanceEvent[]): boolean {
  if (candidate.length > PRACTICAL_PERFORMANCE_LIMIT || base.length > PRACTICAL_PERFORMANCE_LIMIT) return false;
  if (JSON.stringify(candidate) === JSON.stringify(base)) return true;
  if (base.length < PRACTICAL_PERFORMANCE_LIMIT) {
    if (candidate.length < base.length) return false;
    return base.every((event, index) => JSON.stringify(candidate[index]) === JSON.stringify(event));
  }

  // At the bounded telemetry ceiling, canonical writers retain a suffix of the
  // previous window and append new rows. Prove exactly that shape so lost-ack
  // recovery can advance without resurrecting or silently rewriting telemetry.
  for (let dropped = 1; dropped < base.length; dropped += 1) {
    const retained = base.slice(dropped);
    if (candidate.length < retained.length) continue;
    if (!retained.every((event, index) => JSON.stringify(candidate[index]) === JSON.stringify(event))) continue;
    const appended = candidate.slice(retained.length);
    if (appended.length !== dropped) continue;
    const baseIds = new Set(base.map((event) => event.id));
    if (appended.some((event) => baseIds.has(event.id))) continue;
    return true;
  }
  return false;
}

function masteryPreserved(candidate: PracticalMasteryState, base: PracticalMasteryState): boolean {
  if (candidate.revision < base.revision) return false;
  if (!practicalAttemptHistoryContains(candidate, base)) return false;
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
  if (!hasPracticalProfileField(candidateState)) return false;
  const rawBase = (baseState as Record<string, unknown>)[PRACTICAL_PROFILE_FIELD];
  const rawCandidate = (candidateState as Record<string, unknown>)[PRACTICAL_PROFILE_FIELD];
  const base = normalizePracticalProfileState(rawBase)?.state;
  const candidate = normalizePracticalProfileState(rawCandidate)?.state;
  if (!base || !candidate) return false;
  if (JSON.stringify(candidate) === JSON.stringify(base)) return true;
  if (!masteryPreserved(candidate.mastery, base.mastery)) return false;
  if (!performancePreserved(candidate.performance, base.performance)) return false;
  // Study workspace remains mutable rather than evidence-bearing. Without the exact
  // cloud CAS token, changing it cannot prove ancestry safely, so divergence fails closed.
  if (JSON.stringify(candidate.studyWorkspace) !== JSON.stringify(base.studyWorkspace)) return false;
  return true;
}
