import { laterStreetLegacySkillBridges, practicalAnchors, practicalDecisionById, practicalDecisions, practicalSkillById, practicalSkillFamilies } from "../content/practical-mastery";
import { isIntegrationDerivedSkill } from "../content/practical-mastery/integration-derived";
import { canonicalFirstJourneySkillIds, hardDependenciesFor, learningRouteScore, softDependenciesFor, whyNowForSkill } from "../content/practical-mastery/learning-route";
import { practicalSourceGapBySkillId } from "../content/practical-mastery/source-gaps";
import { isOrdinaryLearnerDecision, type PracticalDecision, type PracticalEvidenceStage } from "../content/practical-mastery";
import { practicalEvidenceFamilyId, practicalEvidenceScenarioId, practicalLegacyEvidenceFamilyId, practicalLegacyEvidenceScenarioId } from "./practical-stimulus-identity";
import {
  PRACTICAL_HIGH_CONFIDENCE_WRONG,
  practicalMisconceptionEvidenceFamilies,
  selectedWrongPracticalMisconceptionIds,
} from "./practical-current-mistakes";
import {
  hasHighPracticalSelfReportedConfidence,
  isPracticalConfidenceProvenance,
  type PracticalConfidenceProvenance,
} from "./practical-confidence";

export const PRACTICAL_MASTERY_STATE_SCHEMA_VERSION = 5 as const;
export const PRACTICAL_ATTEMPT_TAIL_LIMIT = 256;
export const PRACTICAL_ATTEMPT_COMPACT_TARGET = 128;
export const PRACTICAL_ATTEMPT_DIGEST_HISTORY_LIMIT = 512;
export const PRACTICAL_MASTERY_CONTENT_VERSION = "2026.09-practical-mastery-v4-4bp-objective-revision";
export const PRACTICAL_A7_RU_REASON_SEMANTIC_REVISION = "A7_RU_REASON_POLARITY_V2";
export const PRACTICAL_4BP_OBJECTIVE_SEMANTIC_REVISION = "4BP_OBJECTIVE_SPECIFIC_V3";
const REWRITTEN_4BP_DECISION_ID = /^PM-4BP-0[1-4]-A7-(?:10[1-8])$/u;
function requires4BpObjectiveSemanticRevision(decisionId: string): boolean { return REWRITTEN_4BP_DECISION_ID.test(decisionId); }
function requiresA7RuReasonSemanticRevision(decisionId: string): boolean { return /^PM-(?:3BP|4BP)-\d{2}-A7-\d+$/u.test(decisionId); }
const PRACTICAL_BRIDGE_SKILL_IDS = new Set<string>(Object.keys(laterStreetLegacySkillBridges));
export function isPracticalBridgeSkill(skillId: string): boolean { return PRACTICAL_BRIDGE_SKILL_IDS.has(skillId); }

export type PracticalAttempt = { id: string; decisionId: string; skillId: string; actionId: string; reasonId: string; confidence: number; confidenceProvenance?: PracticalConfidenceProvenance; correct: boolean; answeredAt: string; semanticRevision?: string };
export type PracticalArchivedAttemptRef = { attempt: PracticalAttempt; ordinal: number };
export type PracticalArchivedCorrectAnchor = { decisionId: string; answeredAt: string; ordinal: number };
export type PracticalArchivedRecentAttempt = {
  decisionId: string; correct: boolean; confidence: number; answeredAt: string;
  confidenceProvenance?: PracticalConfidenceProvenance; ordinal: number;
};
export type PracticalArchivedSkillProgress = {
  attempts: number; correct: number; recognitionCorrect: number; directDecisionCorrect: number;
  changedCorrect: number; boundaryCorrect: number; mixedCorrect: number;
  successfulDecisionIds: string[]; lastAttemptAt: string | null; lastIncorrectDecisionId: string | null;
  lastCorrect: PracticalArchivedCorrectAnchor | null;
  recentAttempts: PracticalArchivedRecentAttempt[];
};
export type PracticalAttemptArchive = {
  version: 2; count: number; digest: string; provenanceDigest: string; recentDigests: string[];
  bySkill: Record<string, PracticalArchivedSkillProgress>;
  latestByDecision: Record<string, PracticalArchivedAttemptRef>;
  latestCorrectOrdinalByDecision: Record<string, number>;
  attemptCountByDecision: Record<string, number>;
};
export type PracticalSkillProgress = {
  skillId: string; evidenceStage: PracticalEvidenceStage; conceptTaught: boolean; conceptTaughtAt: string | null;
  recognitionCorrect: number; directDecisionCorrect: number; changedCorrect: number; boundaryCorrect: number; mixedCorrect: number;
  successfulDecisionIds: string[]; retentionDaysPassed: number[]; delayedRetrievalPassed: boolean; realHandTransferReviewed: boolean;
  attempts: number; correct: number; lastAttemptAt: string | null; lastIncorrectDecisionId: string | null;
};
export type PracticalMasteryState = { schemaVersion: typeof PRACTICAL_MASTERY_STATE_SCHEMA_VERSION; contentVersion: string; revision: number; updatedAt: string; resetFromLegacyAt: string | null; skills: Record<string, PracticalSkillProgress>; attemptArchive: PracticalAttemptArchive; attempts: PracticalAttempt[] };
export type PracticalRecommendedSkill = { skillId: string; score: number; whyNow: string };

const PRACTICAL_ATTEMPT_DIGEST_SEED = "cbf29ce484222325";

function practicalAttemptDigestPayload(attempt: PracticalAttempt): string {
  return JSON.stringify([
    attempt.id, attempt.decisionId, attempt.skillId, attempt.actionId, attempt.reasonId,
    attempt.confidence, attempt.confidenceProvenance ?? "NOT_CAPTURED",
    attempt.correct, attempt.answeredAt, attempt.semanticRevision ?? null,
  ]);
}

function fnv1a64(value: string): string {
  let hash = 0xcbf29ce484222325n;
  const prime = 0x100000001b3n;
  const mask = 0xffffffffffffffffn;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= BigInt(value.charCodeAt(index));
    hash = (hash * prime) & mask;
  }
  return hash.toString(16).padStart(16, "0");
}

export function practicalAttemptDigestNext(previousDigest: string, attempt: PracticalAttempt): string {
  return fnv1a64(previousDigest + "\n" + practicalAttemptDigestPayload(attempt));
}

function canonicalCommitmentJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalCommitmentJson).join(",")}]`;
  if (value && typeof value === "object") { const record = value as Record<string, unknown>; return `{${Object.keys(record).sort().map((key) => `${JSON.stringify(key)}:${canonicalCommitmentJson(record[key])}`).join(",")}}`; }
  return JSON.stringify(value);
}
export function practicalAttemptArchiveProvenanceDigest(archive: Record<string, unknown>): string {
  const committed = Object.fromEntries(Object.entries(archive).filter(([key]) => key !== "provenanceDigest"));
  return fnv1a64(`PRACTICAL_ARCHIVE_PROVENANCE_V1\n${canonicalCommitmentJson(committed)}`);
}
export function createPracticalAttemptArchive(): PracticalAttemptArchive {
  const archive = { version: 2 as const, count: 0, digest: PRACTICAL_ATTEMPT_DIGEST_SEED, recentDigests: [], bySkill: {}, latestByDecision: {}, latestCorrectOrdinalByDecision: {}, attemptCountByDecision: {} };
  return { ...archive, provenanceDigest: practicalAttemptArchiveProvenanceDigest(archive) };
}

function archivedSkillProgress(archive: PracticalAttemptArchive, skillId: string): PracticalArchivedSkillProgress {
  return archive.bySkill[skillId] ?? {
    attempts: 0, correct: 0, recognitionCorrect: 0, directDecisionCorrect: 0,
    changedCorrect: 0, boundaryCorrect: 0, mixedCorrect: 0,
    successfulDecisionIds: [], lastAttemptAt: null, lastIncorrectDecisionId: null,
    lastCorrect: null, recentAttempts: [],
  };
}

function archiveAttempt(archive: PracticalAttemptArchive, attempt: PracticalAttempt): void {
  if (!isSemanticallyValidPracticalAttempt(attempt)) throw new Error("Invalid practical attempt during compaction");
  const decision = practicalDecisionById.get(attempt.decisionId);
  if (!decision) throw new Error("Unknown practical decision during compaction: " + attempt.decisionId);
  const ordinal = archive.count + 1;
  const prior = archivedSkillProgress(archive, attempt.skillId);
  const progress = { ...prior, successfulDecisionIds: [...prior.successfulDecisionIds] };
  progress.attempts += 1;
  if (attempt.correct) {
    progress.correct += 1;
    if (!progress.successfulDecisionIds.includes(attempt.decisionId)) progress.successfulDecisionIds.push(attempt.decisionId);
    if (decision.kind === "recognition") progress.recognitionCorrect += 1;
    if (decision.kind === "decision") progress.directDecisionCorrect += 1;
    if (decision.kind === "changed") progress.changedCorrect += 1;
    if (decision.kind === "boundary") progress.boundaryCorrect += 1;
    if (decision.kind === "mixed") progress.mixedCorrect += 1;
    if (progress.lastIncorrectDecisionId === attempt.decisionId) progress.lastIncorrectDecisionId = null;
    progress.lastCorrect = { decisionId: attempt.decisionId, answeredAt: attempt.answeredAt, ordinal };
    archive.latestCorrectOrdinalByDecision[attempt.decisionId] = ordinal;
  } else {
    progress.lastIncorrectDecisionId = attempt.decisionId;
  }
  progress.lastAttemptAt = attempt.answeredAt;
  progress.recentAttempts = [...prior.recentAttempts, {
    decisionId: attempt.decisionId,
    correct: attempt.correct,
    confidence: attempt.confidence,
    answeredAt: attempt.answeredAt,
    ...(attempt.confidenceProvenance ? { confidenceProvenance: attempt.confidenceProvenance } : {}),
    ordinal,
  }].slice(-8);
  archive.bySkill[attempt.skillId] = progress;
  archive.latestByDecision[attempt.decisionId] = { attempt: structuredClone(attempt), ordinal };
  archive.attemptCountByDecision[attempt.decisionId] = (archive.attemptCountByDecision[attempt.decisionId] ?? 0) + 1;
  archive.count = ordinal;
  archive.digest = practicalAttemptDigestNext(archive.digest, attempt);
  archive.recentDigests = [...archive.recentDigests, archive.digest].slice(-PRACTICAL_ATTEMPT_DIGEST_HISTORY_LIMIT);
}

export function compactPracticalAttemptHistory(state: PracticalMasteryState, force = false): PracticalMasteryState {
  const next = structuredClone(state);
  next.attemptArchive ??= createPracticalAttemptArchive();
  const shouldCompact = force
    ? next.attempts.length > PRACTICAL_ATTEMPT_COMPACT_TARGET
    : next.attempts.length > PRACTICAL_ATTEMPT_TAIL_LIMIT;
  if (!shouldCompact) return next;
  const archiveCount = Math.max(0, next.attempts.length - PRACTICAL_ATTEMPT_COMPACT_TARGET);
  for (const attempt of next.attempts.slice(0, archiveCount)) archiveAttempt(next.attemptArchive, attempt);
  next.attemptArchive.provenanceDigest = practicalAttemptArchiveProvenanceDigest(next.attemptArchive as unknown as Record<string, unknown>);
  next.attempts = next.attempts.slice(archiveCount);
  return next;
}

function practicalAttemptArchiveOf(state: PracticalMasteryState): PracticalAttemptArchive {
  return state.attemptArchive ?? createPracticalAttemptArchive();
}

export function practicalLogicalAttemptCount(state: PracticalMasteryState): number {
  return practicalAttemptArchiveOf(state).count + state.attempts.length;
}

export function practicalDecisionAttemptCount(state: PracticalMasteryState, decisionId: string): number {
  const archive = practicalAttemptArchiveOf(state);
  return (archive.attemptCountByDecision[decisionId] ?? 0)
    + state.attempts.filter((attempt) => attempt.decisionId === decisionId && isSemanticallyValidPracticalAttempt(attempt)).length;
}

export function practicalAttemptedDecisionIds(state: PracticalMasteryState): Set<string> {
  const archive = practicalAttemptArchiveOf(state);
  return new Set([
    ...Object.keys(archive.attemptCountByDecision),
    ...state.attempts.filter(isSemanticallyValidPracticalAttempt).map((attempt) => attempt.decisionId),
  ]);
}

export function practicalSuccessfulDecisionIds(state: PracticalMasteryState, skillId: string): Set<string> {
  const archive = practicalAttemptArchiveOf(state);
  const ids = new Set<string>((archive.bySkill[skillId]?.successfulDecisionIds ?? []).filter((decisionId) => { const decision = practicalDecisionById.get(decisionId); return Boolean(decision && isOrdinaryLearnerDecision(decision)); }));
  for (const attempt of state.attempts) {
    if (attempt.skillId === skillId && attempt.correct && isCurrentPracticalEvidenceAttempt(attempt)) ids.add(attempt.decisionId);
  }
  return ids;
}

function logicalLatestEntriesByDecision(state: PracticalMasteryState): Map<string, PracticalArchivedAttemptRef> {
  const archive = practicalAttemptArchiveOf(state);
  const map = new Map<string, PracticalArchivedAttemptRef>(
    Object.entries(archive.latestByDecision).map(([decisionId, entry]) => [decisionId, structuredClone(entry)]),
  );
  const offset = archive.count;
  state.attempts.forEach((attempt, index) => {
    map.set(attempt.decisionId, { attempt, ordinal: offset + index + 1 });
  });
  return new Map([...map.entries()].sort((left, right) => left[1].ordinal - right[1].ordinal));
}

export function practicalLatestAttemptRef(state: PracticalMasteryState, decisionId: string): PracticalArchivedAttemptRef | null {
  return logicalLatestEntriesByDecision(state).get(decisionId) ?? null;
}

export type PracticalCorrectDecisionRef = { decisionId: string; ordinal: number; valid: boolean };

export function practicalLatestCorrectAttemptRefs(state: PracticalMasteryState): Map<string, PracticalCorrectDecisionRef> {
  const archive = practicalAttemptArchiveOf(state);
  const map = new Map<string, PracticalCorrectDecisionRef>(
    Object.entries(archive.latestCorrectOrdinalByDecision).map(([decisionId, ordinal]) => [
      decisionId,
      { decisionId, ordinal, valid: Boolean(practicalDecisionById.get(decisionId) && isOrdinaryLearnerDecision(practicalDecisionById.get(decisionId)!)) },
    ]),
  );
  const offset = archive.count;
  state.attempts.forEach((attempt, index) => {
    if (!attempt.correct) return;
    map.set(attempt.decisionId, {
      decisionId: attempt.decisionId,
      ordinal: offset + index + 1,
      valid: isCurrentPracticalEvidenceAttempt(attempt),
    });
  });
  return new Map([...map.entries()].sort((left, right) => left[1].ordinal - right[1].ordinal));
}

export type PracticalCorrectAttemptAnchor = {
  decisionId: string; skillId: string; answeredAt: string; valid: boolean;
};

export function practicalLatestCorrectAttemptForSkill(state: PracticalMasteryState, skillId: string): PracticalCorrectAttemptAnchor | null {
  const archive = practicalAttemptArchiveOf(state);
  const archived = archive.bySkill[skillId]?.lastCorrect ?? null;
  let latest: (PracticalArchivedCorrectAnchor & { valid: boolean }) | null = archived ? { ...archived, valid: Boolean(practicalDecisionById.get(archived.decisionId) && isOrdinaryLearnerDecision(practicalDecisionById.get(archived.decisionId)!)) } : null;
  state.attempts.forEach((attempt, index) => {
    if (!attempt.correct || attempt.skillId !== skillId) return;
    latest = {
      decisionId: attempt.decisionId,
      answeredAt: attempt.answeredAt,
      ordinal: archive.count + index + 1,
      valid: isCurrentPracticalEvidenceAttempt(attempt),
    };
  });
  return latest ? { decisionId: latest.decisionId, skillId, answeredAt: latest.answeredAt, valid: latest.valid } : null;
}

export type PracticalRecentAttemptSummary = {
  decisionId: string; skillId: string; correct: boolean; confidence: number; answeredAt: string;
  confidenceProvenance?: PracticalConfidenceProvenance; ordinal: number; valid: boolean;
};

export function practicalRecentAttemptsForSkills(
  state: PracticalMasteryState,
  skillIds: ReadonlySet<string>,
  limit = 8,
): PracticalRecentAttemptSummary[] {
  if (limit <= 0 || skillIds.size === 0) return [];
  const archive = practicalAttemptArchiveOf(state);
  const refs: PracticalRecentAttemptSummary[] = [];
  for (const skillId of skillIds) {
    refs.push(...(archive.bySkill[skillId]?.recentAttempts ?? []).map((entry) => ({
      ...entry,
      skillId,
      valid: true,
    })));
  }
  const offset = archive.count;
  state.attempts.forEach((attempt, index) => {
    if (!skillIds.has(attempt.skillId)) return;
    refs.push({
      decisionId: attempt.decisionId,
      skillId: attempt.skillId,
      correct: attempt.correct,
      confidence: attempt.confidence,
      answeredAt: attempt.answeredAt,
      ...(attempt.confidenceProvenance ? { confidenceProvenance: attempt.confidenceProvenance } : {}),
      ordinal: offset + index + 1,
      valid: isSemanticallyValidPracticalAttempt(attempt),
    });
  });
  return refs.sort((left, right) => left.ordinal - right.ordinal).slice(-limit);
}

export function practicalAttemptHistoryDigest(state: PracticalMasteryState): string {
  let digest = practicalAttemptArchiveOf(state).digest;
  for (const attempt of state.attempts) digest = practicalAttemptDigestNext(digest, attempt);
  return digest;
}

export function practicalAttemptHistoryContains(candidate: PracticalMasteryState, base: PracticalMasteryState): boolean {
  const candidateArchive = practicalAttemptArchiveOf(candidate);
  const baseArchive = practicalAttemptArchiveOf(base);
  const candidateTotal = candidateArchive.count + candidate.attempts.length;
  const baseTotal = baseArchive.count + base.attempts.length;
  if (candidateTotal < baseTotal || candidateArchive.count < baseArchive.count) return false;

  const baseFullDigest = practicalAttemptHistoryDigest(base);
  if (candidateArchive.count >= baseTotal) {
    if (candidateArchive.count === baseTotal) return candidateArchive.digest === baseFullDigest;
    return candidateArchive.recentDigests.includes(baseFullDigest);
  }

  const absorbedFromBaseTail = candidateArchive.count - baseArchive.count;
  if (absorbedFromBaseTail < 0 || absorbedFromBaseTail > base.attempts.length) return false;
  let expectedArchiveDigest = baseArchive.digest;
  for (const attempt of base.attempts.slice(0, absorbedFromBaseTail)) {
    expectedArchiveDigest = practicalAttemptDigestNext(expectedArchiveDigest, attempt);
  }
  if (candidateArchive.digest !== expectedArchiveDigest) return false;
  const remainingBaseTail = base.attempts.slice(absorbedFromBaseTail);
  if (candidate.attempts.length < remainingBaseTail.length) return false;
  return remainingBaseTail.every((attempt, index) => JSON.stringify(candidate.attempts[index]) === JSON.stringify(attempt));
}

export function practicalArchivedProgressForSkill(state: PracticalMasteryState, skillId: string): PracticalArchivedSkillProgress | null {
  return practicalAttemptArchiveOf(state).bySkill[skillId] ?? null;
}

export function practicalAttemptArchiveSnapshot(state: PracticalMasteryState): PracticalAttemptArchive {
  return structuredClone(practicalAttemptArchiveOf(state));
}

// Shared canonical semantic-attempt validity authority: whether a persisted
// PracticalAttempt row could legitimately have come from recordPracticalDecision
// (id/decisionId/skillId/actionId/reasonId/answeredAt shape, decision exists,
// skill matches the canonical decision, the selected action/reason are real
// options of that decision, stored `correct` matches the canonically derived
// correctness, and confidence obeys recordPracticalDecision's persisted domain
// — an integer clamped to [0, 100]). It intentionally does NOT require
// isOrdinaryLearnerDecision: recordPracticalDecision itself never gates on
// learner eligibility, so other canonical scored decision types can
// legitimately be persisted too. It also does NOT treat misconception-tag
// presence as validity: a valid untagged wrong attempt is still valid,
// legitimate scheduler evidence. Every scheduler-facing raw attempt read
// (repair queue, repair urgency, recent exposure) and profile-state
// validation both gate on this single predicate so a semantically invalid
// row can never sneak into scheduler behavior through a path that forgot to
// check it separately.
export function isSemanticallyValidPracticalAttempt(attempt: unknown): attempt is PracticalAttempt {
  if (!attempt || typeof attempt !== "object" || Array.isArray(attempt)) return false;
  const candidate = attempt as Record<string, unknown>;
  if (typeof candidate.id !== "string" || candidate.id.length === 0
    || typeof candidate.decisionId !== "string"
    || typeof candidate.skillId !== "string"
    || typeof candidate.actionId !== "string"
    || typeof candidate.reasonId !== "string"
    || typeof candidate.correct !== "boolean"
    || typeof candidate.answeredAt !== "string"
    || !(candidate.confidenceProvenance === undefined || isPracticalConfidenceProvenance(candidate.confidenceProvenance))
    || !(candidate.semanticRevision === undefined || (typeof candidate.semanticRevision === "string" && candidate.semanticRevision.length > 0))) return false;
  // answeredAt must be exactly the canonical ISO-8601 form nowIso()/Date#toISOString
  // produces — not merely Date.parse-able — so a structurally-plausible but
  // out-of-domain timestamp string cannot pass as a legitimate recordPracticalDecision output.
  const answeredAtMs = Date.parse(candidate.answeredAt);
  if (!Number.isFinite(answeredAtMs) || new Date(answeredAtMs).toISOString() !== candidate.answeredAt) return false;
  if (typeof candidate.confidence !== "number"
    || !Number.isInteger(candidate.confidence)
    || candidate.confidence < 0
    || candidate.confidence > 100) return false;
  const decision = practicalDecisionById.get(candidate.decisionId);
  if (!decision || decision.skillId !== candidate.skillId) return false;
  if (!decision.actionOptions.some((option) => option.id === candidate.actionId)) return false;
  if (!decision.reasonOptions.some((option) => option.id === candidate.reasonId)) return false;
  const derivedCorrect = candidate.actionId === decision.correctActionId && candidate.reasonId === decision.correctReasonId;
  return candidate.correct === derivedCorrect;
}


export function isCurrentPracticalEvidenceAttempt(attempt: unknown): attempt is PracticalAttempt {
  if (!isSemanticallyValidPracticalAttempt(attempt)) return false;
  const decision = practicalDecisionById.get(attempt.decisionId)!;
  // Historical/internal compatibility rows remain structurally valid raw history,
  // but they are not current learner evidence. This predicate is the canonical
  // seam between raw validity and evidence-bearing attempts.
  if (!isOrdinaryLearnerDecision(decision)) return false;
  // The 32 4BP A7 tasks were materially rewritten from a shared generic
  // mechanism into four objective-specific ladders. Old rows remain valid raw
  // history, but neither old correct nor old wrong evidence can prove the new
  // semantic generation.
  if (requires4BpObjectiveSemanticRevision(attempt.decisionId)) {
    return attempt.semanticRevision === PRACTICAL_4BP_OBJECTIVE_SEMANTIC_REVISION;
  }
  // A7 RU wrong-reason wording changed materially. Pre-repair persisted rows
  // have no locale/text revision, so a wrong reason cannot be safely mapped
  // onto the repaired misconception. Keep the raw row valid and intact, but
  // exclude that ambiguous row from repair/misconception evidence. Correct
  // reasons remain usable because their semantic identity did not change.
  if (requiresA7RuReasonSemanticRevision(attempt.decisionId) && attempt.reasonId !== decision.correctReasonId) {
    return attempt.semanticRevision === PRACTICAL_A7_RU_REASON_SEMANTIC_REVISION;
  }
  return true;
}

// The scheduler-only generic repair fallback for a real latest wrong whose
// actually-wrong dimensions carry no misconception tag. Feature A never
// synthesizes misconception evidence for these, so the scheduler counts them
// as their own untagged evidence unit per skill (mirrors the "SKILL:" fallback
// already established for in-round scheduling in practical-integrated-session.ts).
function untaggedWrongDecisionIdsForSkill(state: PracticalMasteryState, skillId: string): string[] {
  const ids: string[] = [];
  for (const attempt of latestAttemptsByDecision(state, skillId).values()) {
    if (attempt.correct) continue;
    if (!isCurrentPracticalEvidenceAttempt(attempt)) continue;
    const decision = practicalDecisionById.get(attempt.decisionId)!;
    if (!isOrdinaryLearnerDecision(decision)) continue;
    if (isIntegrationDerivedSkill(attempt.skillId) || isPracticalBridgeSkill(attempt.skillId)) continue;
    if (selectedWrongPracticalMisconceptionIds(attempt).length > 0) continue;
    ids.push(attempt.decisionId);
  }
  return ids;
}

const STAGE_ORDER: PracticalEvidenceStage[] = ["SOURCE_SUPPORTED", "CONCEPT_TAUGHT", "RECOGNITION_TRAINED", "DECISION_TRAINED", "CHANGED_NODE_TRANSFER", "BOUNDARY_TESTED", "DELAYED_RETRIEVAL", "REAL_HAND_TRANSFER"];
const MIN_RECOGNITION_STIMULI = 2; const MIN_RECOGNITION_SCENARIOS = 2; const MIN_DIRECT_DECISION_STIMULI = 3; const MIN_DIRECT_DECISION_SCENARIOS = 2; const MIN_TRANSFER_STIMULI = 2; const MIN_TRANSFER_SCENARIOS = 2; const MIN_BOUNDARY_STIMULI = 1;
function nowIso(now?: Date): string { return (now ?? new Date()).toISOString(); }
// A successful decision only advances the skill it canonically belongs to:
// without the skillId check, an id belonging to another skill's decision
// (of a matching kind) would otherwise be silently counted toward this
// skill's evidence stage.
function distinctSuccessfulByKind(progress: PracticalSkillProgress, kinds: PracticalDecision["kind"][]): number { return new Set(progress.successfulDecisionIds.flatMap((decisionId) => { const decision = practicalDecisionById.get(decisionId); return decision && isOrdinaryLearnerDecision(decision) && decision.skillId === progress.skillId && kinds.includes(decision.kind) ? [practicalEvidenceFamilyId(decision)] : []; })).size; }
function distinctSuccessfulScenariosByKind(progress: PracticalSkillProgress, kinds: PracticalDecision["kind"][]): number { return new Set(progress.successfulDecisionIds.flatMap((decisionId) => { const decision = practicalDecisionById.get(decisionId); return decision && isOrdinaryLearnerDecision(decision) && decision.skillId === progress.skillId && kinds.includes(decision.kind) ? [practicalEvidenceScenarioId(decision)] : []; })).size; }
function legacyDistinctSuccessfulByKind(progress: PracticalSkillProgress, kinds: PracticalDecision["kind"][], includeInternal = false): number { return new Set(progress.successfulDecisionIds.flatMap((id) => { const decision=practicalDecisionById.get(id); return decision && decision.skillId===progress.skillId && kinds.includes(decision.kind) && (includeInternal || isOrdinaryLearnerDecision(decision)) ? [practicalLegacyEvidenceFamilyId(decision)] : []; })).size; }
function legacyDistinctSuccessfulScenariosByKind(progress: PracticalSkillProgress, kinds: PracticalDecision["kind"][], includeInternal = false): number { return new Set(progress.successfulDecisionIds.flatMap((id) => { const decision=practicalDecisionById.get(id); return decision && decision.skillId===progress.skillId && kinds.includes(decision.kind) && (includeInternal || isOrdinaryLearnerDecision(decision)) ? [practicalLegacyEvidenceScenarioId(decision)] : []; })).size; }

function applySourceEvidenceCeiling(skillId: string, stage: PracticalEvidenceStage): PracticalEvidenceStage {
  if (isPracticalBridgeSkill(skillId)) return "SOURCE_SUPPORTED";
  const gap = practicalSourceGapBySkillId.get(skillId);
  if (gap?.status === "SOURCE_BLOCKED") return "SOURCE_SUPPORTED";
  if (gap?.status === "PARTIAL" && STAGE_ORDER.indexOf(stage) > STAGE_ORDER.indexOf("RECOGNITION_TRAINED")) return "RECOGNITION_TRAINED";
  return stage;
}
export function deriveEvidenceStage(progress: PracticalSkillProgress): PracticalEvidenceStage {
  if (!progress.conceptTaught) return applySourceEvidenceCeiling(progress.skillId, "SOURCE_SUPPORTED");
  const recognition = distinctSuccessfulByKind(progress, ["recognition"]); const recognitionScenarios = distinctSuccessfulScenariosByKind(progress, ["recognition"]); const direct = distinctSuccessfulByKind(progress, ["decision"]); const directScenarios = distinctSuccessfulScenariosByKind(progress, ["decision"]); const transfer = distinctSuccessfulByKind(progress, ["changed", "mixed"]); const transferScenarios = distinctSuccessfulScenariosByKind(progress, ["changed", "mixed"]); const boundary = distinctSuccessfulByKind(progress, ["boundary"]);
  let stage: PracticalEvidenceStage;
  if (recognition < MIN_RECOGNITION_STIMULI || recognitionScenarios < MIN_RECOGNITION_SCENARIOS) stage = "CONCEPT_TAUGHT"; else if (direct < MIN_DIRECT_DECISION_STIMULI || directScenarios < MIN_DIRECT_DECISION_SCENARIOS) stage = "RECOGNITION_TRAINED"; else if (transfer < MIN_TRANSFER_STIMULI || transferScenarios < MIN_TRANSFER_SCENARIOS) stage = "DECISION_TRAINED"; else if (boundary < MIN_BOUNDARY_STIMULI) stage = "CHANGED_NODE_TRANSFER"; else if (!progress.delayedRetrievalPassed) stage = "BOUNDARY_TESTED"; else if (!progress.realHandTransferReviewed) stage = "DELAYED_RETRIEVAL"; else stage = "REAL_HAND_TRANSFER";
  return applySourceEvidenceCeiling(progress.skillId, stage);
}
// Compatibility authority for profiles written immediately before the
// independent-recognition-scenario gate was introduced. This is deliberately
// not used by current mastery writers or routing: it exists only so persistence
// can prove that a now-stale derived evidenceStage was legitimate under the
// previous semantics before reconciling it downward to deriveEvidenceStage().
export function derivePreScenarioRecognitionEvidenceStage(progress: PracticalSkillProgress): PracticalEvidenceStage {
  if (!progress.conceptTaught) return applySourceEvidenceCeiling(progress.skillId, "SOURCE_SUPPORTED");
  const recognition = legacyDistinctSuccessfulByKind(progress, ["recognition"]); const direct = legacyDistinctSuccessfulByKind(progress, ["decision"]); const transfer = legacyDistinctSuccessfulByKind(progress, ["changed", "mixed"]); const boundary = legacyDistinctSuccessfulByKind(progress, ["boundary"]);
  let stage: PracticalEvidenceStage;
  if (recognition < MIN_RECOGNITION_STIMULI) stage = "CONCEPT_TAUGHT"; else if (direct < MIN_DIRECT_DECISION_STIMULI) stage = "RECOGNITION_TRAINED"; else if (transfer < MIN_TRANSFER_STIMULI) stage = "DECISION_TRAINED"; else if (boundary < MIN_BOUNDARY_STIMULI) stage = "CHANGED_NODE_TRANSFER"; else if (!progress.delayedRetrievalPassed) stage = "BOUNDARY_TESTED"; else if (!progress.realHandTransferReviewed) stage = "DELAYED_RETRIEVAL"; else stage = "REAL_HAND_TRANSFER";
  return applySourceEvidenceCeiling(progress.skillId, stage);
}

// Compatibility-only authority for schema-v4 profiles persisted before A8 eligibility changed.
export function derivePreA8EligibilityEvidenceStage(progress: PracticalSkillProgress): PracticalEvidenceStage {
  if (!progress.conceptTaught) return applySourceEvidenceCeiling(progress.skillId, "SOURCE_SUPPORTED");
  const families = (kinds: PracticalDecision["kind"][]) => legacyDistinctSuccessfulByKind(progress, kinds, true);
  const scenarios = (kinds: PracticalDecision["kind"][]) => legacyDistinctSuccessfulScenariosByKind(progress, kinds, true);
  const recognition=families(["recognition"]), recognitionScenarios=scenarios(["recognition"]), direct=families(["decision"]), transfer=families(["changed","mixed"]), boundary=families(["boundary"]);
  let stage: PracticalEvidenceStage;
  if (recognition < MIN_RECOGNITION_STIMULI || recognitionScenarios < MIN_RECOGNITION_SCENARIOS) stage="CONCEPT_TAUGHT"; else if (direct < MIN_DIRECT_DECISION_STIMULI) stage="RECOGNITION_TRAINED"; else if (transfer < MIN_TRANSFER_STIMULI) stage="DECISION_TRAINED"; else if (boundary < MIN_BOUNDARY_STIMULI) stage="CHANGED_NODE_TRANSFER"; else if (!progress.delayedRetrievalPassed) stage="BOUNDARY_TESTED"; else if (!progress.realHandTransferReviewed) stage="DELAYED_RETRIEVAL"; else stage="REAL_HAND_TRANSFER";
  return applySourceEvidenceCeiling(progress.skillId, stage);
}
// Exact schema-v4 authority immediately before Final Evidence Integrity Closure.
// Recognition already required scenario diversity; direct/transfer did not.
export function derivePreFinalEvidenceIntegrityStage(progress: PracticalSkillProgress): PracticalEvidenceStage {
  if (!progress.conceptTaught) return applySourceEvidenceCeiling(progress.skillId, "SOURCE_SUPPORTED");
  const recognition=legacyDistinctSuccessfulByKind(progress,["recognition"]), recognitionScenarios=legacyDistinctSuccessfulScenariosByKind(progress,["recognition"]), direct=legacyDistinctSuccessfulByKind(progress,["decision"]), transfer=legacyDistinctSuccessfulByKind(progress,["changed","mixed"]), boundary=legacyDistinctSuccessfulByKind(progress,["boundary"]);
  let stage: PracticalEvidenceStage;
  if (recognition < MIN_RECOGNITION_STIMULI || recognitionScenarios < MIN_RECOGNITION_SCENARIOS) stage="CONCEPT_TAUGHT"; else if (direct < MIN_DIRECT_DECISION_STIMULI) stage="RECOGNITION_TRAINED"; else if (transfer < MIN_TRANSFER_STIMULI) stage="DECISION_TRAINED"; else if (boundary < MIN_BOUNDARY_STIMULI) stage="CHANGED_NODE_TRANSFER"; else if (!progress.delayedRetrievalPassed) stage="BOUNDARY_TESTED"; else if (!progress.realHandTransferReviewed) stage="DELAYED_RETRIEVAL"; else stage="REAL_HAND_TRANSFER";
  return applySourceEvidenceCeiling(progress.skillId, stage);
}
function refreshEvidenceStage(progress: PracticalSkillProgress): void { progress.evidenceStage = deriveEvidenceStage(progress); }

export function createPracticalMasteryState(now = new Date(), resetFromLegacy = false): PracticalMasteryState {
  const skills = Object.fromEntries(practicalSkillFamilies.map((skill) => [skill.id, { skillId: skill.id, evidenceStage: "SOURCE_SUPPORTED" as const, conceptTaught: false, conceptTaughtAt: null, recognitionCorrect: 0, directDecisionCorrect: 0, changedCorrect: 0, boundaryCorrect: 0, mixedCorrect: 0, successfulDecisionIds: [], retentionDaysPassed: [], delayedRetrievalPassed: false, realHandTransferReviewed: false, attempts: 0, correct: 0, lastAttemptAt: null, lastIncorrectDecisionId: null }]));
  return { schemaVersion: PRACTICAL_MASTERY_STATE_SCHEMA_VERSION, contentVersion: PRACTICAL_MASTERY_CONTENT_VERSION, revision: 0, updatedAt: nowIso(now), resetFromLegacyAt: resetFromLegacy ? nowIso(now) : null, skills, attemptArchive: createPracticalAttemptArchive(), attempts: [] };
}
export function stageAtLeast(actual: PracticalEvidenceStage, required: PracticalEvidenceStage): boolean { return STAGE_ORDER.indexOf(actual) >= STAGE_ORDER.indexOf(required); }
export function markPracticalConceptTaught(state: PracticalMasteryState, skillId: string, now = new Date()): PracticalMasteryState { if (!state.skills[skillId]) throw new Error(`Unknown practical skill: ${skillId}`); const next = structuredClone(state); next.skills[skillId].conceptTaught = true; next.skills[skillId].conceptTaughtAt = nowIso(now); refreshEvidenceStage(next.skills[skillId]); next.revision += 1; next.updatedAt = nowIso(now); return next; }

export function practicalSkillCorpusStats(skillId: string) { const decisions = decisionsForPracticalSkill(skillId); const familyCount = (kinds: PracticalDecision["kind"][]) => new Set(decisions.filter((decision) => kinds.includes(decision.kind)).map(practicalEvidenceFamilyId)).size; const scenarioCount = (kinds: PracticalDecision["kind"][]) => new Set(decisions.filter((decision) => kinds.includes(decision.kind)).map(practicalEvidenceScenarioId)).size; return { recognition: familyCount(["recognition"]), direct: familyCount(["decision"]), transfer: familyCount(["changed", "mixed"]), boundary: familyCount(["boundary"]), recognitionScenarios: scenarioCount(["recognition"]), directScenarios: scenarioCount(["decision"]), transferScenarios: scenarioCount(["changed", "mixed"]), total: decisions.length } as const; }
export function practicalSkillCorpusCanReach(skillId: string, stage: PracticalEvidenceStage): boolean {
  if (isPracticalBridgeSkill(skillId)) return false;
  const gap = practicalSourceGapBySkillId.get(skillId); if (gap?.status === "SOURCE_BLOCKED") return false; if (gap?.status === "PARTIAL" && stageAtLeast(stage, "DECISION_TRAINED")) return false;
  const stats = practicalSkillCorpusStats(skillId); if (stageAtLeast(stage, "RECOGNITION_TRAINED") && (stats.recognition < MIN_RECOGNITION_STIMULI || stats.recognitionScenarios < MIN_RECOGNITION_SCENARIOS)) return false; if (stageAtLeast(stage, "DECISION_TRAINED") && (stats.direct < MIN_DIRECT_DECISION_STIMULI || stats.directScenarios < MIN_DIRECT_DECISION_SCENARIOS)) return false; if (stageAtLeast(stage, "CHANGED_NODE_TRANSFER") && (stats.transfer < MIN_TRANSFER_STIMULI || stats.transferScenarios < MIN_TRANSFER_SCENARIOS)) return false; if (stageAtLeast(stage, "BOUNDARY_TESTED") && stats.boundary < MIN_BOUNDARY_STIMULI) return false; return true;
}
export function practicalPrerequisitesMet(state: PracticalMasteryState, skillId: string): boolean { if (!practicalSkillById.has(skillId)) return false; if (practicalSourceGapBySkillId.get(skillId)?.status === "SOURCE_BLOCKED") return false; return hardDependenciesFor(skillId).every((dependency) => { const progress = state.skills[dependency.fromSkillId]; return progress ? stageAtLeast(progress.evidenceStage, "DECISION_TRAINED") : false; }); }
export function availablePracticalSkills(state: PracticalMasteryState) { return practicalSkillFamilies.filter((skill) => practicalPrerequisitesMet(state, skill.id)); }
export function trainablePracticalSkills(state: PracticalMasteryState) { return availablePracticalSkills(state).filter((skill) => !isIntegrationDerivedSkill(skill.id) && !isPracticalBridgeSkill(skill.id) && practicalSkillCorpusCanReach(skill.id, "DECISION_TRAINED")); }

// Re-resolved onto Feature A's canonical (skillId, misconceptionId) evidence
// authority instead of a raw wrong-attempt count: a decision wrong on two
// distinct misconceptions (action and reason both wrong differently) counts as
// two evidence units, not one, and high-confidence wrong evidence is weighted
// the same way Feature A weights it for presentation (PRACTICAL_HIGH_CONFIDENCE_WRONG,
// 2x). The untagged "SKILL:" fallback still contributes its own evidence unit.
// This never reads the Current Mistakes presentation-sorted array or its
// order — only the unsorted per-family evidence counts.
function repairUrgencyForSkill(state: PracticalMasteryState, skillId: string): 0 | 1 | 2 | 3 {
  const families = practicalMisconceptionEvidenceFamilies(state).filter((family) => family.skillId === skillId);
  const latest = latestAttemptsByDecision(state, skillId);
  const untaggedDecisionIds = untaggedWrongDecisionIdsForSkill(state, skillId);
  const untaggedHighConfidenceCount = untaggedDecisionIds.filter((decisionId) => {
    const attempt = latest.get(decisionId);
    return Boolean(attempt && hasHighPracticalSelfReportedConfidence(attempt, PRACTICAL_HIGH_CONFIDENCE_WRONG));
  }).length;
  const evidenceCount = families.reduce((sum, family) => sum + family.evidenceCount, 0) + untaggedDecisionIds.length;
  const highConfidenceEvidenceCount = families.reduce((sum, family) => sum + family.highConfidenceEvidenceCount, 0) + untaggedHighConfidenceCount;
  const weighted = evidenceCount + 2 * highConfidenceEvidenceCount + (families.length >= 2 ? 1 : 0);
  if (weighted >= 4) return 3;
  if (weighted >= 2) return 2;
  if (weighted >= 1) return 1;
  return 0;
}
// Real last-N persisted slots first, then validity: a malformed row occupies
// its own physical slot and contributes zero signal, but must not shrink the
// window in a way that pulls an older, otherwise-out-of-window attempt in to
// compensate. Identical to the pre-repair count for any all-valid history.
export function recentExposurePenaltyForSkill(state: PracticalMasteryState, skillId: string): 0 | 1 | 2 | 3 { const count = state.attempts.slice(-8).filter(isSemanticallyValidPracticalAttempt).filter((attempt) => attempt.skillId === skillId).length; if (count >= 5) return 3; if (count >= 3) return 2; if (count >= 1) return 1; return 0; }
function softReadinessPenalty(state: PracticalMasteryState, skillId: string): number { return softDependenciesFor(skillId).reduce((penalty, dependency) => { const progress = state.skills[dependency.fromSkillId]; if (!progress?.conceptTaught) return penalty + 7; if (!stageAtLeast(progress.evidenceStage, "RECOGNITION_TRAINED")) return penalty + 4; return penalty; }, 0); }
function hasTeachingAnchor(skillId: string): boolean { return practicalAnchors.some((anchor) => anchor.skillId === skillId); }

export function recommendNextPracticalSkill(state: PracticalMasteryState): PracticalRecommendedSkill | null {
  const trainable = trainablePracticalSkills(state); if (!trainable.length) return null;
  const activeRepairSkillId = practicalRepairQueue(state).find((skillId) => trainable.some((skill) => skill.id === skillId)) ?? null;
  const activeRepair = activeRepairSkillId ? trainable.find((skill) => skill.id === activeRepairSkillId) ?? null : null;
  if (activeRepair) { const progress = state.skills[activeRepair.id]; const repairUrgency = repairUrgencyForSkill(state, activeRepair.id); return { skillId: activeRepair.id, score: learningRouteScore({ skill: activeRepair, currentStage: progress.evidenceStage, repairUrgency }), whyNow: whyNowForSkill(activeRepair, progress.evidenceStage, repairUrgency) }; }
  for (const skillId of canonicalFirstJourneySkillIds) { const skill = trainable.find((candidate) => candidate.id === skillId); const progress = skill ? state.skills[skill.id] : null; if (skill && progress && !stageAtLeast(progress.evidenceStage, "RECOGNITION_TRAINED")) return { skillId: skill.id, score: learningRouteScore({ skill, currentStage: progress.evidenceStage }), whyNow: whyNowForSkill(skill, progress.evidenceStage) }; }
  const newCapability = trainable.filter((skill) => !stageAtLeast(state.skills[skill.id]?.evidenceStage ?? "SOURCE_SUPPORTED", "RECOGNITION_TRAINED") && hasTeachingAnchor(skill.id)).map((skill) => { const progress = state.skills[skill.id]; return { skillId: skill.id, score: learningRouteScore({ skill, currentStage: progress.evidenceStage }) - softReadinessPenalty(state, skill.id), whyNow: whyNowForSkill(skill, progress.evidenceStage) }; }).sort((a, b) => b.score - a.score || a.skillId.localeCompare(b.skillId))[0];
  if (newCapability) return newCapability;
  return trainable.map((skill) => { const progress = state.skills[skill.id]; const repairUrgency = repairUrgencyForSkill(state, skill.id); const recentExposurePenalty = recentExposurePenaltyForSkill(state, skill.id); return { skillId: skill.id, score: learningRouteScore({ skill, currentStage: progress.evidenceStage, repairUrgency, recentExposurePenalty }) - softReadinessPenalty(state, skill.id), whyNow: whyNowForSkill(skill, progress.evidenceStage, repairUrgency) }; }).sort((a, b) => b.score - a.score || a.skillId.localeCompare(b.skillId))[0] ?? null;
}

export function recordPracticalDecision(state: PracticalMasteryState, input: { decisionId: string; actionId: string; reasonId: string; confidence: number; confidenceProvenance?: PracticalConfidenceProvenance; now?: Date }): PracticalMasteryState {
  const decision = practicalDecisionById.get(input.decisionId); if (!decision) throw new Error(`Unknown practical decision: ${input.decisionId}`); if (!state.skills[decision.skillId]) throw new Error(`Unknown practical skill: ${decision.skillId}`);
  const confidence = Math.max(0, Math.min(100, Math.round(input.confidence))); const correct = input.actionId === decision.correctActionId && input.reasonId === decision.correctReasonId; const answeredAt = nowIso(input.now);
  const semanticRevision = requires4BpObjectiveSemanticRevision(decision.id)
    ? PRACTICAL_4BP_OBJECTIVE_SEMANTIC_REVISION
    : requiresA7RuReasonSemanticRevision(decision.id) ? PRACTICAL_A7_RU_REASON_SEMANTIC_REVISION : undefined;
  const attempt: PracticalAttempt = { id: `${decision.id}:${state.revision + 1}:${answeredAt}`, decisionId: decision.id, skillId: decision.skillId, actionId: input.actionId, reasonId: input.reasonId, confidence, confidenceProvenance: input.confidenceProvenance ?? "NOT_CAPTURED", correct, answeredAt, ...(semanticRevision ? { semanticRevision } : {}) };
  const next: PracticalMasteryState = structuredClone(state); const nextProgress = next.skills[decision.skillId]; nextProgress.attempts += 1;
  if (correct) { nextProgress.correct += 1; if (!nextProgress.successfulDecisionIds.includes(decision.id)) nextProgress.successfulDecisionIds.push(decision.id); if (decision.kind === "recognition") nextProgress.recognitionCorrect += 1; if (decision.kind === "decision") nextProgress.directDecisionCorrect += 1; if (decision.kind === "changed") nextProgress.changedCorrect += 1; if (decision.kind === "boundary") nextProgress.boundaryCorrect += 1; if (decision.kind === "mixed") nextProgress.mixedCorrect += 1; if (nextProgress.lastIncorrectDecisionId === decision.id) nextProgress.lastIncorrectDecisionId = null; } else nextProgress.lastIncorrectDecisionId = decision.id;
  nextProgress.lastAttemptAt = answeredAt; refreshEvidenceStage(nextProgress); next.attempts.push(attempt); next.revision += 1; next.updatedAt = answeredAt; return compactPracticalAttemptHistory(next);
}
export function decisionsForPracticalSkill(skillId: string): PracticalDecision[] { return practicalDecisions.filter((decision) => decision.skillId === skillId && isOrdinaryLearnerDecision(decision)); }
// Global latest-by-decision identity is built from the FULL unfiltered
// history first (last write per decisionId wins, regardless of skillId), and
// only THEN narrowed to a requested skillId. Narrowing before building would
// let a forged/malformed latest row (whose own skillId field lies about which
// skill it belongs to) become invisible to the true skill's per-skill view,
// silently un-shadowing that decision's older, otherwise-superseded row. For
// any valid history every attempt's stored skillId already matches its
// decision's canonical skillId, so this reordering never changes valid-state
// results.
export function latestAttemptsByDecision(state: PracticalMasteryState, skillId?: string): Map<string, PracticalAttempt> {
  const map = new Map<string, PracticalAttempt>(
    [...logicalLatestEntriesByDecision(state)].map(([decisionId, entry]) => [decisionId, entry.attempt]),
  );
  if (!skillId) return map;
  const scoped = new Map<string, PracticalAttempt>();
  for (const [decisionId, attempt] of map) if (attempt.skillId === skillId) scoped.set(decisionId, attempt);
  return scoped;
}
function hasInterveningCorrectRepairEvidence(state: PracticalMasteryState, repair: PracticalDecision): boolean {
  const latestWrong = practicalLatestAttemptRef(state, repair.id);
  if (!latestWrong || latestWrong.attempt.correct || !isCurrentPracticalEvidenceAttempt(latestWrong.attempt)) return false;
  const repairFamily = practicalEvidenceFamilyId(repair);
  return [...practicalLatestCorrectAttemptRefs(state).values()].some((entry) => {
    if (entry.ordinal <= latestWrong.ordinal || !entry.valid) return false;
    const decision = practicalDecisionById.get(entry.decisionId);
    return Boolean(decision && decision.skillId === repair.skillId && practicalEvidenceFamilyId(decision) !== repairFamily);
  });
}

function unattemptedDecisionOfKinds(state: PracticalMasteryState, skillId: string, kinds: PracticalDecision["kind"][], excludedFamilyIds: ReadonlySet<string> = new Set<string>(), preferNovelScenario = false): PracticalDecision | null { const attemptedDecisionIds = practicalAttemptedDecisionIds(state); const attemptedFamilies = new Set([...attemptedDecisionIds].flatMap((decisionId) => { const decision = practicalDecisionById.get(decisionId); return decision && isOrdinaryLearnerDecision(decision) && decision.skillId === skillId ? [practicalEvidenceFamilyId(decision)] : []; })); const successfulScenarios = new Set((state.skills[skillId]?.successfulDecisionIds ?? []).flatMap((decisionId) => { const decision = practicalDecisionById.get(decisionId); return decision && isOrdinaryLearnerDecision(decision) && kinds.includes(decision.kind) ? [practicalEvidenceScenarioId(decision)] : []; })); const pool = decisionsForPracticalSkill(skillId).filter((decision) => kinds.includes(decision.kind) && !attemptedFamilies.has(practicalEvidenceFamilyId(decision)) && !excludedFamilyIds.has(practicalEvidenceFamilyId(decision))); if (preferNovelScenario) return pool.find((decision) => !successfulScenarios.has(practicalEvidenceScenarioId(decision))) ?? pool[0] ?? null; return pool[0] ?? null; }
export function nextPracticalDecision(state: PracticalMasteryState, skillId: string): PracticalDecision | null {
  if (isPracticalBridgeSkill(skillId) || !practicalPrerequisitesMet(state, skillId)) return null; const pool = decisionsForPracticalSkill(skillId); if (!pool.length) return null; const progress = state.skills[skillId];
  const latest = latestAttemptsByDecision(state, skillId); const unresolved = [...latest.values()].reverse().find((attempt) => !attempt.correct && isCurrentPracticalEvidenceAttempt(attempt)) ?? null; const repair = unresolved ? practicalDecisionById.get(unresolved.decisionId) ?? null : null;
  if (repair) {
    if (hasInterveningCorrectRepairEvidence(state, repair)) return repair;
    const excluded = new Set([practicalEvidenceFamilyId(repair)]);
    return unattemptedDecisionOfKinds(state, skillId, [repair.kind], excluded)
      ?? unattemptedDecisionOfKinds(state, skillId, ["recognition", "decision", "changed", "mixed"], excluded)
      ?? null;
  }
  if (distinctSuccessfulByKind(progress, ["recognition"]) < MIN_RECOGNITION_STIMULI || distinctSuccessfulScenariosByKind(progress, ["recognition"]) < MIN_RECOGNITION_SCENARIOS) return unattemptedDecisionOfKinds(state, skillId, ["recognition"], new Set<string>(), true); if (distinctSuccessfulByKind(progress, ["decision"]) < MIN_DIRECT_DECISION_STIMULI) return unattemptedDecisionOfKinds(state, skillId, ["decision"], new Set<string>(), true); if (distinctSuccessfulByKind(progress, ["changed", "mixed"]) < MIN_TRANSFER_STIMULI) return unattemptedDecisionOfKinds(state, skillId, ["changed", "mixed"], new Set<string>(), true); if (distinctSuccessfulByKind(progress, ["boundary"]) < MIN_BOUNDARY_STIMULI) return unattemptedDecisionOfKinds(state, skillId, ["boundary"]);
  return unattemptedDecisionOfKinds(state, skillId, ["recognition", "decision", "changed", "mixed", "boundary"]);
}
// primaryRepairLoad: which single skill wins "the" active repair slot. Re-resolved
// post-A to weight high-confidence wrong evidence the same way Feature A's own
// presentationEvidenceScore does (PRACTICAL_HIGH_CONFIDENCE_WRONG, 2x), while the
// base wrong-attempt population and its ordering stay byte-identical to before
// when no high-confidence evidence exists.
function practicalRepairQueueWeight(attempts: PracticalAttempt[]): number { return attempts.length + attempts.filter((attempt) => hasHighPracticalSelfReportedConfidence(attempt, PRACTICAL_HIGH_CONFIDENCE_WRONG)).length * 2; }
export function practicalRepairQueue(state: PracticalMasteryState): string[] { const latest = latestAttemptsByDecision(state); const bySkill = new Map<string, PracticalAttempt[]>(); for (const attempt of latest.values()) { const decision = practicalDecisionById.get(attempt.decisionId); if (!decision || !isOrdinaryLearnerDecision(decision) || !isCurrentPracticalEvidenceAttempt(attempt) || attempt.correct || isIntegrationDerivedSkill(attempt.skillId) || isPracticalBridgeSkill(attempt.skillId)) continue; const attempts = bySkill.get(attempt.skillId) ?? []; attempts.push(attempt); bySkill.set(attempt.skillId, attempts); } return [...bySkill.entries()].sort((left, right) => practicalRepairQueueWeight(right[1]) - practicalRepairQueueWeight(left[1]) || left[0].localeCompare(right[0])).map(([skillId]) => skillId); }
export function markDelayedPracticalRetrieval(state: PracticalMasteryState, skillId: string, successful: boolean, now = new Date()): PracticalMasteryState { if (!state.skills[skillId]) throw new Error(`Unknown practical skill: ${skillId}`); const next = structuredClone(state); const nextProgress = next.skills[skillId]; if (successful && deriveEvidenceStage(nextProgress) === "BOUNDARY_TESTED") nextProgress.delayedRetrievalPassed = true; refreshEvidenceStage(nextProgress); next.revision += 1; next.updatedAt = nowIso(now); return next; }
export function markPracticalRealHandTransfer(state: PracticalMasteryState, skillId: string, reviewed: boolean, now = new Date()): PracticalMasteryState { if (!state.skills[skillId]) throw new Error(`Unknown practical skill: ${skillId}`); const next = structuredClone(state); const nextProgress = next.skills[skillId]; if (reviewed && nextProgress.delayedRetrievalPassed) nextProgress.realHandTransferReviewed = true; refreshEvidenceStage(nextProgress); next.revision += 1; next.updatedAt = nowIso(now); return next; }
export function practicalEvidenceRequirements() { return { recognitionStimuli: MIN_RECOGNITION_STIMULI, directDecisionStimuli: MIN_DIRECT_DECISION_STIMULI, transferStimuli: MIN_TRANSFER_STIMULI, boundaryStimuli: MIN_BOUNDARY_STIMULI } as const; }
export function practicalScenarioEvidenceRequirements() { return { recognitionScenarios: MIN_RECOGNITION_SCENARIOS, directDecisionScenarios: MIN_DIRECT_DECISION_SCENARIOS, transferScenarios: MIN_TRANSFER_SCENARIOS } as const; }
