import { laterStreetLegacySkillBridges, practicalAnchors, practicalDecisionById, practicalDecisions, practicalSkillById, practicalSkillFamilies } from "../content/practical-mastery";
import { isIntegrationDerivedSkill } from "../content/practical-mastery/integration-derived";
import { canonicalFirstJourneySkillIds, hardDependenciesFor, learningRouteScore, softDependenciesFor, whyNowForSkill } from "../content/practical-mastery/learning-route";
import { practicalSourceGapBySkillId } from "../content/practical-mastery/source-gaps";
import { isOrdinaryLearnerDecision, type PracticalDecision, type PracticalEvidenceStage } from "../content/practical-mastery";
import {
  PRACTICAL_HIGH_CONFIDENCE_WRONG,
  practicalMisconceptionEvidenceFamilies,
  selectedWrongPracticalMisconceptionIds,
} from "./practical-current-mistakes";

export const PRACTICAL_MASTERY_STATE_SCHEMA_VERSION = 3 as const;
export const PRACTICAL_MASTERY_CONTENT_VERSION = "2026.08-practical-mastery-v3";
const PRACTICAL_BRIDGE_SKILL_IDS = new Set<string>(Object.keys(laterStreetLegacySkillBridges));
export function isPracticalBridgeSkill(skillId: string): boolean { return PRACTICAL_BRIDGE_SKILL_IDS.has(skillId); }

export type PracticalAttempt = { id: string; decisionId: string; skillId: string; actionId: string; reasonId: string; confidence: number; correct: boolean; answeredAt: string };
export type PracticalSkillProgress = {
  skillId: string; evidenceStage: PracticalEvidenceStage; conceptTaught: boolean; conceptTaughtAt: string | null;
  recognitionCorrect: number; directDecisionCorrect: number; changedCorrect: number; boundaryCorrect: number; mixedCorrect: number;
  successfulDecisionIds: string[]; retentionDaysPassed: number[]; delayedRetrievalPassed: boolean; realHandTransferReviewed: boolean;
  attempts: number; correct: number; lastAttemptAt: string | null; lastIncorrectDecisionId: string | null;
};
export type PracticalMasteryState = { schemaVersion: typeof PRACTICAL_MASTERY_STATE_SCHEMA_VERSION; contentVersion: string; revision: number; updatedAt: string; resetFromLegacyAt: string | null; skills: Record<string, PracticalSkillProgress>; attempts: PracticalAttempt[] };
export type PracticalRecommendedSkill = { skillId: string; score: number; whyNow: string };

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
  if (typeof candidate.id !== "string"
    || typeof candidate.decisionId !== "string"
    || typeof candidate.skillId !== "string"
    || typeof candidate.actionId !== "string"
    || typeof candidate.reasonId !== "string"
    || typeof candidate.correct !== "boolean"
    || typeof candidate.answeredAt !== "string") return false;
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

// The scheduler-only generic repair fallback for a real latest wrong whose
// actually-wrong dimensions carry no misconception tag. Feature A never
// synthesizes misconception evidence for these, so the scheduler counts them
// as their own untagged evidence unit per skill (mirrors the "SKILL:" fallback
// already established for in-round scheduling in practical-integrated-session.ts).
function untaggedWrongDecisionIdsForSkill(state: PracticalMasteryState, skillId: string): string[] {
  const ids: string[] = [];
  for (const attempt of latestAttemptsByDecision(state, skillId).values()) {
    if (attempt.correct) continue;
    if (!isSemanticallyValidPracticalAttempt(attempt)) continue;
    const decision = practicalDecisionById.get(attempt.decisionId)!;
    if (!isOrdinaryLearnerDecision(decision)) continue;
    if (isIntegrationDerivedSkill(attempt.skillId) || isPracticalBridgeSkill(attempt.skillId)) continue;
    if (selectedWrongPracticalMisconceptionIds(attempt).length > 0) continue;
    ids.push(attempt.decisionId);
  }
  return ids;
}

const STAGE_ORDER: PracticalEvidenceStage[] = ["SOURCE_SUPPORTED", "CONCEPT_TAUGHT", "RECOGNITION_TRAINED", "DECISION_TRAINED", "CHANGED_NODE_TRANSFER", "BOUNDARY_TESTED", "DELAYED_RETRIEVAL", "REAL_HAND_TRANSFER"];
const MIN_RECOGNITION_STIMULI = 2; const MIN_DIRECT_DECISION_STIMULI = 3; const MIN_TRANSFER_STIMULI = 2; const MIN_BOUNDARY_STIMULI = 1;
function nowIso(now?: Date): string { return (now ?? new Date()).toISOString(); }
function distinctSuccessfulByKind(progress: PracticalSkillProgress, kinds: PracticalDecision["kind"][]): number { return new Set(progress.successfulDecisionIds.filter((decisionId) => { const decision = practicalDecisionById.get(decisionId); return decision ? kinds.includes(decision.kind) : false; })).size; }

function applySourceEvidenceCeiling(skillId: string, stage: PracticalEvidenceStage): PracticalEvidenceStage {
  if (isPracticalBridgeSkill(skillId)) return "SOURCE_SUPPORTED";
  const gap = practicalSourceGapBySkillId.get(skillId);
  if (gap?.status === "SOURCE_BLOCKED") return "SOURCE_SUPPORTED";
  if (gap?.status === "PARTIAL" && STAGE_ORDER.indexOf(stage) > STAGE_ORDER.indexOf("RECOGNITION_TRAINED")) return "RECOGNITION_TRAINED";
  return stage;
}
function deriveEvidenceStage(progress: PracticalSkillProgress): PracticalEvidenceStage {
  if (!progress.conceptTaught) return applySourceEvidenceCeiling(progress.skillId, "SOURCE_SUPPORTED");
  const recognition = distinctSuccessfulByKind(progress, ["recognition"]); const direct = distinctSuccessfulByKind(progress, ["decision"]); const transfer = distinctSuccessfulByKind(progress, ["changed", "mixed"]); const boundary = distinctSuccessfulByKind(progress, ["boundary"]);
  let stage: PracticalEvidenceStage;
  if (recognition < MIN_RECOGNITION_STIMULI) stage = "CONCEPT_TAUGHT"; else if (direct < MIN_DIRECT_DECISION_STIMULI) stage = "RECOGNITION_TRAINED"; else if (transfer < MIN_TRANSFER_STIMULI) stage = "DECISION_TRAINED"; else if (boundary < MIN_BOUNDARY_STIMULI) stage = "CHANGED_NODE_TRANSFER"; else if (!progress.delayedRetrievalPassed) stage = "BOUNDARY_TESTED"; else if (!progress.realHandTransferReviewed) stage = "DELAYED_RETRIEVAL"; else stage = "REAL_HAND_TRANSFER";
  return applySourceEvidenceCeiling(progress.skillId, stage);
}
function refreshEvidenceStage(progress: PracticalSkillProgress): void { progress.evidenceStage = deriveEvidenceStage(progress); }

export function createPracticalMasteryState(now = new Date(), resetFromLegacy = false): PracticalMasteryState {
  const skills = Object.fromEntries(practicalSkillFamilies.map((skill) => [skill.id, { skillId: skill.id, evidenceStage: "SOURCE_SUPPORTED" as const, conceptTaught: false, conceptTaughtAt: null, recognitionCorrect: 0, directDecisionCorrect: 0, changedCorrect: 0, boundaryCorrect: 0, mixedCorrect: 0, successfulDecisionIds: [], retentionDaysPassed: [], delayedRetrievalPassed: false, realHandTransferReviewed: false, attempts: 0, correct: 0, lastAttemptAt: null, lastIncorrectDecisionId: null }]));
  return { schemaVersion: PRACTICAL_MASTERY_STATE_SCHEMA_VERSION, contentVersion: PRACTICAL_MASTERY_CONTENT_VERSION, revision: 0, updatedAt: nowIso(now), resetFromLegacyAt: resetFromLegacy ? nowIso(now) : null, skills, attempts: [] };
}
export function stageAtLeast(actual: PracticalEvidenceStage, required: PracticalEvidenceStage): boolean { return STAGE_ORDER.indexOf(actual) >= STAGE_ORDER.indexOf(required); }
export function markPracticalConceptTaught(state: PracticalMasteryState, skillId: string, now = new Date()): PracticalMasteryState { if (!state.skills[skillId]) throw new Error(`Unknown practical skill: ${skillId}`); const next = structuredClone(state); next.skills[skillId].conceptTaught = true; next.skills[skillId].conceptTaughtAt = nowIso(now); refreshEvidenceStage(next.skills[skillId]); next.revision += 1; next.updatedAt = nowIso(now); return next; }

export function practicalSkillCorpusStats(skillId: string) { const decisions = decisionsForPracticalSkill(skillId); return { recognition: decisions.filter((decision) => decision.kind === "recognition").length, direct: decisions.filter((decision) => decision.kind === "decision").length, transfer: decisions.filter((decision) => decision.kind === "changed" || decision.kind === "mixed").length, boundary: decisions.filter((decision) => decision.kind === "boundary").length, total: decisions.length } as const; }
export function practicalSkillCorpusCanReach(skillId: string, stage: PracticalEvidenceStage): boolean {
  if (isPracticalBridgeSkill(skillId)) return false;
  const gap = practicalSourceGapBySkillId.get(skillId); if (gap?.status === "SOURCE_BLOCKED") return false; if (gap?.status === "PARTIAL" && stageAtLeast(stage, "DECISION_TRAINED")) return false;
  const stats = practicalSkillCorpusStats(skillId); if (stageAtLeast(stage, "RECOGNITION_TRAINED") && stats.recognition < MIN_RECOGNITION_STIMULI) return false; if (stageAtLeast(stage, "DECISION_TRAINED") && stats.direct < MIN_DIRECT_DECISION_STIMULI) return false; if (stageAtLeast(stage, "CHANGED_NODE_TRANSFER") && stats.transfer < MIN_TRANSFER_STIMULI) return false; if (stageAtLeast(stage, "BOUNDARY_TESTED") && stats.boundary < MIN_BOUNDARY_STIMULI) return false; return true;
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
  const untaggedHighConfidenceCount = untaggedDecisionIds.filter((decisionId) => (latest.get(decisionId)?.confidence ?? 0) >= PRACTICAL_HIGH_CONFIDENCE_WRONG).length;
  const evidenceCount = families.reduce((sum, family) => sum + family.evidenceCount, 0) + untaggedDecisionIds.length;
  const highConfidenceEvidenceCount = families.reduce((sum, family) => sum + family.highConfidenceEvidenceCount, 0) + untaggedHighConfidenceCount;
  const weighted = evidenceCount + 2 * highConfidenceEvidenceCount + (families.length >= 2 ? 1 : 0);
  if (weighted >= 4) return 3;
  if (weighted >= 2) return 2;
  if (weighted >= 1) return 1;
  return 0;
}
function recentExposurePenaltyForSkill(state: PracticalMasteryState, skillId: string): 0 | 1 | 2 | 3 { const count = state.attempts.filter(isSemanticallyValidPracticalAttempt).slice(-8).filter((attempt) => attempt.skillId === skillId).length; if (count >= 5) return 3; if (count >= 3) return 2; if (count >= 1) return 1; return 0; }
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

export function recordPracticalDecision(state: PracticalMasteryState, input: { decisionId: string; actionId: string; reasonId: string; confidence: number; now?: Date }): PracticalMasteryState {
  const decision = practicalDecisionById.get(input.decisionId); if (!decision) throw new Error(`Unknown practical decision: ${input.decisionId}`); if (!state.skills[decision.skillId]) throw new Error(`Unknown practical skill: ${decision.skillId}`);
  const confidence = Math.max(0, Math.min(100, Math.round(input.confidence))); const correct = input.actionId === decision.correctActionId && input.reasonId === decision.correctReasonId; const answeredAt = nowIso(input.now);
  const attempt: PracticalAttempt = { id: `${decision.id}:${state.revision + 1}:${answeredAt}`, decisionId: decision.id, skillId: decision.skillId, actionId: input.actionId, reasonId: input.reasonId, confidence, correct, answeredAt };
  const next: PracticalMasteryState = structuredClone(state); const nextProgress = next.skills[decision.skillId]; nextProgress.attempts += 1;
  if (correct) { nextProgress.correct += 1; if (!nextProgress.successfulDecisionIds.includes(decision.id)) nextProgress.successfulDecisionIds.push(decision.id); if (decision.kind === "recognition") nextProgress.recognitionCorrect += 1; if (decision.kind === "decision") nextProgress.directDecisionCorrect += 1; if (decision.kind === "changed") nextProgress.changedCorrect += 1; if (decision.kind === "boundary") nextProgress.boundaryCorrect += 1; if (decision.kind === "mixed") nextProgress.mixedCorrect += 1; if (nextProgress.lastIncorrectDecisionId === decision.id) nextProgress.lastIncorrectDecisionId = null; } else nextProgress.lastIncorrectDecisionId = decision.id;
  nextProgress.lastAttemptAt = answeredAt; refreshEvidenceStage(nextProgress); next.attempts.push(attempt); next.revision += 1; next.updatedAt = answeredAt; return next;
}
export function decisionsForPracticalSkill(skillId: string): PracticalDecision[] { return practicalDecisions.filter((decision) => decision.skillId === skillId && isOrdinaryLearnerDecision(decision)); }
export function latestAttemptsByDecision(state: PracticalMasteryState, skillId?: string): Map<string, PracticalAttempt> { const map = new Map<string, PracticalAttempt>(); for (const attempt of state.attempts) if (!skillId || attempt.skillId === skillId) map.set(attempt.decisionId, attempt); return map; }
function unattemptedDecisionOfKinds(state: PracticalMasteryState, skillId: string, kinds: PracticalDecision["kind"][]): PracticalDecision | null { const attemptedIds = new Set(state.attempts.filter((attempt) => attempt.skillId === skillId).map((attempt) => attempt.decisionId)); return decisionsForPracticalSkill(skillId).find((decision) => kinds.includes(decision.kind) && !attemptedIds.has(decision.id)) ?? null; }
export function nextPracticalDecision(state: PracticalMasteryState, skillId: string): PracticalDecision | null {
  if (isPracticalBridgeSkill(skillId) || !practicalPrerequisitesMet(state, skillId)) return null; const pool = decisionsForPracticalSkill(skillId); if (!pool.length) return null; const progress = state.skills[skillId];
  const latest = latestAttemptsByDecision(state, skillId); const unresolved = [...latest.values()].reverse().find((attempt) => !attempt.correct) ?? null; const repair = unresolved ? practicalDecisionById.get(unresolved.decisionId) ?? null : null; if (repair) return repair;
  if (distinctSuccessfulByKind(progress, ["recognition"]) < MIN_RECOGNITION_STIMULI) return unattemptedDecisionOfKinds(state, skillId, ["recognition"]); if (distinctSuccessfulByKind(progress, ["decision"]) < MIN_DIRECT_DECISION_STIMULI) return unattemptedDecisionOfKinds(state, skillId, ["decision"]); if (distinctSuccessfulByKind(progress, ["changed", "mixed"]) < MIN_TRANSFER_STIMULI) return unattemptedDecisionOfKinds(state, skillId, ["changed", "mixed"]); if (distinctSuccessfulByKind(progress, ["boundary"]) < MIN_BOUNDARY_STIMULI) return unattemptedDecisionOfKinds(state, skillId, ["boundary"]);
  const attemptedIds = new Set(state.attempts.filter((attempt) => attempt.skillId === skillId).map((attempt) => attempt.decisionId)); return pool.find((decision) => !attemptedIds.has(decision.id)) ?? null;
}
// primaryRepairLoad: which single skill wins "the" active repair slot. Re-resolved
// post-A to weight high-confidence wrong evidence the same way Feature A's own
// presentationEvidenceScore does (PRACTICAL_HIGH_CONFIDENCE_WRONG, 2x), while the
// base wrong-attempt population and its ordering stay byte-identical to before
// when no high-confidence evidence exists.
function practicalRepairQueueWeight(attempts: PracticalAttempt[]): number { return attempts.length + attempts.filter((attempt) => attempt.confidence >= PRACTICAL_HIGH_CONFIDENCE_WRONG).length * 2; }
export function practicalRepairQueue(state: PracticalMasteryState): string[] { const latest = latestAttemptsByDecision(state); const bySkill = new Map<string, PracticalAttempt[]>(); for (const attempt of latest.values()) { if (!isSemanticallyValidPracticalAttempt(attempt) || attempt.correct || isIntegrationDerivedSkill(attempt.skillId) || isPracticalBridgeSkill(attempt.skillId)) continue; const attempts = bySkill.get(attempt.skillId) ?? []; attempts.push(attempt); bySkill.set(attempt.skillId, attempts); } return [...bySkill.entries()].sort((left, right) => practicalRepairQueueWeight(right[1]) - practicalRepairQueueWeight(left[1]) || left[0].localeCompare(right[0])).map(([skillId]) => skillId); }
export function markDelayedPracticalRetrieval(state: PracticalMasteryState, skillId: string, successful: boolean, now = new Date()): PracticalMasteryState { if (!state.skills[skillId]) throw new Error(`Unknown practical skill: ${skillId}`); const next = structuredClone(state); const nextProgress = next.skills[skillId]; if (successful && deriveEvidenceStage(nextProgress) === "BOUNDARY_TESTED") nextProgress.delayedRetrievalPassed = true; refreshEvidenceStage(nextProgress); next.revision += 1; next.updatedAt = nowIso(now); return next; }
export function markPracticalRealHandTransfer(state: PracticalMasteryState, skillId: string, reviewed: boolean, now = new Date()): PracticalMasteryState { if (!state.skills[skillId]) throw new Error(`Unknown practical skill: ${skillId}`); const next = structuredClone(state); const nextProgress = next.skills[skillId]; if (reviewed && nextProgress.delayedRetrievalPassed) nextProgress.realHandTransferReviewed = true; refreshEvidenceStage(nextProgress); next.revision += 1; next.updatedAt = nowIso(now); return next; }
export function practicalEvidenceRequirements() { return { recognitionStimuli: MIN_RECOGNITION_STIMULI, directDecisionStimuli: MIN_DIRECT_DECISION_STIMULI, transferStimuli: MIN_TRANSFER_STIMULI, boundaryStimuli: MIN_BOUNDARY_STIMULI } as const; }
