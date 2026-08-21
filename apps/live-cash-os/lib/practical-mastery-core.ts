import { practicalDecisionById, practicalDecisions, practicalSkillById, practicalSkillFamilies } from "../content/practical-mastery";
import { canonicalFirstJourneySkillIds, hardDependenciesFor, learningRouteScore, whyNowForSkill } from "../content/practical-mastery/learning-route";
import { practicalSourceGapBySkillId } from "../content/practical-mastery/source-gaps";
import type { PracticalDecision, PracticalEvidenceStage } from "../content/practical-mastery";

export const PRACTICAL_MASTERY_STATE_SCHEMA_VERSION = 2 as const;
export const PRACTICAL_MASTERY_CONTENT_VERSION = "2026.08-practical-mastery-v2";

export type PracticalAttempt = {
  id: string;
  decisionId: string;
  skillId: string;
  actionId: string;
  reasonId: string;
  confidence: number;
  correct: boolean;
  answeredAt: string;
};

export type PracticalSkillProgress = {
  skillId: string;
  evidenceStage: PracticalEvidenceStage;
  conceptTaught: boolean;
  conceptTaughtAt: string | null;
  recognitionCorrect: number;
  directDecisionCorrect: number;
  changedCorrect: number;
  boundaryCorrect: number;
  mixedCorrect: number;
  successfulDecisionIds: string[];
  delayedRetrievalPassed: boolean;
  realHandTransferReviewed: boolean;
  attempts: number;
  correct: number;
  lastAttemptAt: string | null;
  lastIncorrectDecisionId: string | null;
};

export type PracticalMasteryState = {
  schemaVersion: typeof PRACTICAL_MASTERY_STATE_SCHEMA_VERSION;
  contentVersion: string;
  revision: number;
  updatedAt: string;
  resetFromLegacyAt: string | null;
  skills: Record<string, PracticalSkillProgress>;
  attempts: PracticalAttempt[];
};

export type PracticalRecommendedSkill = {
  skillId: string;
  score: number;
  whyNow: string;
};

const STAGE_ORDER: PracticalEvidenceStage[] = [
  "SOURCE_SUPPORTED",
  "CONCEPT_TAUGHT",
  "RECOGNITION_TRAINED",
  "DECISION_TRAINED",
  "CHANGED_NODE_TRANSFER",
  "BOUNDARY_TESTED",
  "DELAYED_RETRIEVAL",
  "REAL_HAND_TRANSFER",
];

const MIN_RECOGNITION_STIMULI = 2;
const MIN_DIRECT_DECISION_STIMULI = 3;
const MIN_TRANSFER_STIMULI = 2;
const MIN_BOUNDARY_STIMULI = 1;

function nowIso(now?: Date): string {
  return (now ?? new Date()).toISOString();
}

function distinctSuccessfulByKind(progress: PracticalSkillProgress, kinds: PracticalDecision["kind"][]): number {
  return new Set(
    progress.successfulDecisionIds.filter((decisionId) => {
      const decision = practicalDecisionById.get(decisionId);
      return decision ? kinds.includes(decision.kind) : false;
    }),
  ).size;
}

function deriveEvidenceStage(progress: PracticalSkillProgress): PracticalEvidenceStage {
  if (!progress.conceptTaught) return "SOURCE_SUPPORTED";
  if (distinctSuccessfulByKind(progress, ["recognition"]) < MIN_RECOGNITION_STIMULI) return "CONCEPT_TAUGHT";
  if (distinctSuccessfulByKind(progress, ["decision"]) < MIN_DIRECT_DECISION_STIMULI) return "RECOGNITION_TRAINED";
  if (distinctSuccessfulByKind(progress, ["changed", "mixed"]) < MIN_TRANSFER_STIMULI) return "DECISION_TRAINED";
  if (distinctSuccessfulByKind(progress, ["boundary"]) < MIN_BOUNDARY_STIMULI) return "CHANGED_NODE_TRANSFER";
  if (!progress.delayedRetrievalPassed) return "BOUNDARY_TESTED";
  if (!progress.realHandTransferReviewed) return "DELAYED_RETRIEVAL";
  return "REAL_HAND_TRANSFER";
}

function refreshEvidenceStage(progress: PracticalSkillProgress): void {
  progress.evidenceStage = deriveEvidenceStage(progress);
}

export function createPracticalMasteryState(now = new Date(), resetFromLegacy = false): PracticalMasteryState {
  const skills = Object.fromEntries(practicalSkillFamilies.map((skill) => [
    skill.id,
    {
      skillId: skill.id,
      evidenceStage: "SOURCE_SUPPORTED" as const,
      conceptTaught: false,
      conceptTaughtAt: null,
      recognitionCorrect: 0,
      directDecisionCorrect: 0,
      changedCorrect: 0,
      boundaryCorrect: 0,
      mixedCorrect: 0,
      successfulDecisionIds: [],
      delayedRetrievalPassed: false,
      realHandTransferReviewed: false,
      attempts: 0,
      correct: 0,
      lastAttemptAt: null,
      lastIncorrectDecisionId: null,
    },
  ]));
  return {
    schemaVersion: PRACTICAL_MASTERY_STATE_SCHEMA_VERSION,
    contentVersion: PRACTICAL_MASTERY_CONTENT_VERSION,
    revision: 0,
    updatedAt: nowIso(now),
    resetFromLegacyAt: resetFromLegacy ? nowIso(now) : null,
    skills,
    attempts: [],
  };
}

export function stageAtLeast(actual: PracticalEvidenceStage, required: PracticalEvidenceStage): boolean {
  return STAGE_ORDER.indexOf(actual) >= STAGE_ORDER.indexOf(required);
}

export function markPracticalConceptTaught(state: PracticalMasteryState, skillId: string, now = new Date()): PracticalMasteryState {
  if (!state.skills[skillId]) throw new Error(`Unknown practical skill: ${skillId}`);
  const next = structuredClone(state);
  next.skills[skillId].conceptTaught = true;
  next.skills[skillId].conceptTaughtAt = nowIso(now);
  refreshEvidenceStage(next.skills[skillId]);
  next.revision += 1;
  next.updatedAt = nowIso(now);
  return next;
}

export function practicalSkillCorpusStats(skillId: string) {
  const decisions = practicalDecisions.filter((decision) => decision.skillId === skillId);
  return {
    recognition: decisions.filter((decision) => decision.kind === "recognition").length,
    direct: decisions.filter((decision) => decision.kind === "decision").length,
    transfer: decisions.filter((decision) => decision.kind === "changed" || decision.kind === "mixed").length,
    boundary: decisions.filter((decision) => decision.kind === "boundary").length,
    total: decisions.length,
  } as const;
}

export function practicalSkillCorpusCanReach(skillId: string, stage: PracticalEvidenceStage): boolean {
  const gap = practicalSourceGapBySkillId.get(skillId);
  if (gap?.status === "SOURCE_BLOCKED") return false;
  const stats = practicalSkillCorpusStats(skillId);
  if (stageAtLeast(stage, "RECOGNITION_TRAINED") && stats.recognition < MIN_RECOGNITION_STIMULI) return false;
  if (stageAtLeast(stage, "DECISION_TRAINED") && stats.direct < MIN_DIRECT_DECISION_STIMULI) return false;
  if (stageAtLeast(stage, "CHANGED_NODE_TRANSFER") && stats.transfer < MIN_TRANSFER_STIMULI) return false;
  if (stageAtLeast(stage, "BOUNDARY_TESTED") && stats.boundary < MIN_BOUNDARY_STIMULI) return false;
  return true;
}

export function practicalPrerequisitesMet(state: PracticalMasteryState, skillId: string): boolean {
  if (!practicalSkillById.has(skillId)) return false;
  if (practicalSourceGapBySkillId.get(skillId)?.status === "SOURCE_BLOCKED") return false;
  return hardDependenciesFor(skillId).every((dependency) => {
    const progress = state.skills[dependency.fromSkillId];
    return progress ? stageAtLeast(progress.evidenceStage, "DECISION_TRAINED") : false;
  });
}

export function availablePracticalSkills(state: PracticalMasteryState) {
  return practicalSkillFamilies.filter((skill) => practicalPrerequisitesMet(state, skill.id));
}

export function trainablePracticalSkills(state: PracticalMasteryState) {
  return availablePracticalSkills(state).filter((skill) => practicalSkillCorpusCanReach(skill.id, "DECISION_TRAINED"));
}

function repairUrgencyForSkill(state: PracticalMasteryState, skillId: string): 0 | 1 | 2 | 3 {
  const attempts = state.attempts.filter((attempt) => attempt.skillId === skillId);
  const wrong = attempts.filter((attempt) => !attempt.correct).length;
  if (wrong >= 4) return 3;
  if (wrong >= 2) return 2;
  if (wrong >= 1) return 1;
  return 0;
}

function recentExposurePenaltyForSkill(state: PracticalMasteryState, skillId: string): 0 | 1 | 2 | 3 {
  const recent = state.attempts.slice(-8);
  const count = recent.filter((attempt) => attempt.skillId === skillId).length;
  if (count >= 5) return 3;
  if (count >= 3) return 2;
  if (count >= 1) return 1;
  return 0;
}

export function recommendNextPracticalSkill(state: PracticalMasteryState): PracticalRecommendedSkill | null {
  const trainable = trainablePracticalSkills(state);
  if (!trainable.length) return null;

  // During the first journey, prefer the next unfinished canonical step that is
  // genuinely trainable. This is a spiral route hypothesis, not a permanent
  // chapter lock; repair urgency can still interrupt it below.
  const urgentRepair = trainable
    .map((skill) => ({ skill, urgency: repairUrgencyForSkill(state, skill.id) }))
    .filter((candidate) => candidate.urgency >= 2)
    .sort((a, b) => b.urgency - a.urgency)[0];

  if (urgentRepair) {
    const progress = state.skills[urgentRepair.skill.id];
    return {
      skillId: urgentRepair.skill.id,
      score: learningRouteScore({ skill: urgentRepair.skill, currentStage: progress.evidenceStage, repairUrgency: urgentRepair.urgency }),
      whyNow: whyNowForSkill(urgentRepair.skill, progress.evidenceStage, urgentRepair.urgency),
    };
  }

  for (const skillId of canonicalFirstJourneySkillIds) {
    const skill = trainable.find((candidate) => candidate.id === skillId);
    const progress = skill ? state.skills[skill.id] : null;
    if (skill && progress && !stageAtLeast(progress.evidenceStage, "CHANGED_NODE_TRANSFER")) {
      return {
        skillId: skill.id,
        score: learningRouteScore({ skill, currentStage: progress.evidenceStage, recentExposurePenalty: recentExposurePenaltyForSkill(state, skill.id) }),
        whyNow: whyNowForSkill(skill, progress.evidenceStage),
      };
    }
  }

  const ranked = trainable.map((skill) => {
    const progress = state.skills[skill.id];
    const repairUrgency = repairUrgencyForSkill(state, skill.id);
    const recentExposurePenalty = recentExposurePenaltyForSkill(state, skill.id);
    return {
      skillId: skill.id,
      score: learningRouteScore({ skill, currentStage: progress.evidenceStage, repairUrgency, recentExposurePenalty }),
      whyNow: whyNowForSkill(skill, progress.evidenceStage, repairUrgency),
    };
  }).sort((a, b) => b.score - a.score || a.skillId.localeCompare(b.skillId));

  return ranked[0] ?? null;
}

export function recordPracticalDecision(
  state: PracticalMasteryState,
  input: { decisionId: string; actionId: string; reasonId: string; confidence: number; now?: Date },
): PracticalMasteryState {
  const decision = practicalDecisionById.get(input.decisionId);
  if (!decision) throw new Error(`Unknown practical decision: ${input.decisionId}`);
  const progress = state.skills[decision.skillId];
  if (!progress) throw new Error(`Unknown practical skill: ${decision.skillId}`);
  const confidence = Math.max(0, Math.min(100, Math.round(input.confidence)));
  const correct = input.actionId === decision.correctActionId && input.reasonId === decision.correctReasonId;
  const answeredAt = nowIso(input.now);
  const attempt: PracticalAttempt = {
    id: `${decision.id}:${state.revision + 1}:${answeredAt}`,
    decisionId: decision.id,
    skillId: decision.skillId,
    actionId: input.actionId,
    reasonId: input.reasonId,
    confidence,
    correct,
    answeredAt,
  };
  const next: PracticalMasteryState = structuredClone(state);
  const nextProgress = next.skills[decision.skillId];
  nextProgress.attempts += 1;
  if (correct) {
    nextProgress.correct += 1;
    if (!nextProgress.successfulDecisionIds.includes(decision.id)) nextProgress.successfulDecisionIds.push(decision.id);
    if (decision.kind === "recognition") nextProgress.recognitionCorrect += 1;
    if (decision.kind === "decision") nextProgress.directDecisionCorrect += 1;
    if (decision.kind === "changed") nextProgress.changedCorrect += 1;
    if (decision.kind === "boundary") nextProgress.boundaryCorrect += 1;
    if (decision.kind === "mixed") nextProgress.mixedCorrect += 1;
  } else {
    nextProgress.lastIncorrectDecisionId = decision.id;
  }
  nextProgress.lastAttemptAt = answeredAt;
  refreshEvidenceStage(nextProgress);
  next.attempts.push(attempt);
  next.revision += 1;
  next.updatedAt = answeredAt;
  return next;
}

export function decisionsForPracticalSkill(skillId: string): PracticalDecision[] {
  return practicalDecisions.filter((decision) => decision.skillId === skillId);
}

function unattemptedDecisionOfKinds(state: PracticalMasteryState, skillId: string, kinds: PracticalDecision["kind"][]): PracticalDecision | null {
  const attemptedIds = new Set(state.attempts.filter((attempt) => attempt.skillId === skillId).map((attempt) => attempt.decisionId));
  return decisionsForPracticalSkill(skillId).find((decision) => kinds.includes(decision.kind) && !attemptedIds.has(decision.id)) ?? null;
}

export function nextPracticalDecision(state: PracticalMasteryState, skillId: string): PracticalDecision | null {
  if (!practicalPrerequisitesMet(state, skillId)) return null;
  const pool = decisionsForPracticalSkill(skillId);
  if (!pool.length) return null;
  const progress = state.skills[skillId];

  const repair = progress?.lastIncorrectDecisionId ? practicalDecisionById.get(progress.lastIncorrectDecisionId) ?? null : null;
  if (repair) return repair;

  if (distinctSuccessfulByKind(progress, ["recognition"]) < MIN_RECOGNITION_STIMULI) return unattemptedDecisionOfKinds(state, skillId, ["recognition"]);
  if (distinctSuccessfulByKind(progress, ["decision"]) < MIN_DIRECT_DECISION_STIMULI) return unattemptedDecisionOfKinds(state, skillId, ["decision"]);
  if (distinctSuccessfulByKind(progress, ["changed", "mixed"]) < MIN_TRANSFER_STIMULI) return unattemptedDecisionOfKinds(state, skillId, ["changed", "mixed"]);
  if (distinctSuccessfulByKind(progress, ["boundary"]) < MIN_BOUNDARY_STIMULI) return unattemptedDecisionOfKinds(state, skillId, ["boundary"]);

  const attemptedIds = new Set(state.attempts.filter((attempt) => attempt.skillId === skillId).map((attempt) => attempt.decisionId));
  return pool.find((decision) => !attemptedIds.has(decision.id)) ?? null;
}

export function practicalRepairQueue(state: PracticalMasteryState): string[] {
  const bySkill = new Map<string, PracticalAttempt[]>();
  for (const attempt of state.attempts) {
    const attempts = bySkill.get(attempt.skillId) ?? [];
    attempts.push(attempt);
    bySkill.set(attempt.skillId, attempts);
  }
  return [...bySkill.entries()]
    .filter(([, attempts]) => attempts.some((attempt) => !attempt.correct))
    .sort((left, right) => {
      const leftWrong = left[1].filter((attempt) => !attempt.correct).length;
      const rightWrong = right[1].filter((attempt) => !attempt.correct).length;
      return rightWrong - leftWrong || left[0].localeCompare(right[0]);
    })
    .map(([skillId]) => skillId);
}

export function markDelayedPracticalRetrieval(state: PracticalMasteryState, skillId: string, successful: boolean, now = new Date()): PracticalMasteryState {
  const progress = state.skills[skillId];
  if (!progress) throw new Error(`Unknown practical skill: ${skillId}`);
  const next = structuredClone(state);
  const nextProgress = next.skills[skillId];
  if (successful && deriveEvidenceStage(nextProgress) === "BOUNDARY_TESTED") nextProgress.delayedRetrievalPassed = true;
  refreshEvidenceStage(nextProgress);
  next.revision += 1;
  next.updatedAt = nowIso(now);
  return next;
}

export function markPracticalRealHandTransfer(state: PracticalMasteryState, skillId: string, reviewed: boolean, now = new Date()): PracticalMasteryState {
  const progress = state.skills[skillId];
  if (!progress) throw new Error(`Unknown practical skill: ${skillId}`);
  const next = structuredClone(state);
  const nextProgress = next.skills[skillId];
  if (reviewed && nextProgress.delayedRetrievalPassed) nextProgress.realHandTransferReviewed = true;
  refreshEvidenceStage(nextProgress);
  next.revision += 1;
  next.updatedAt = nowIso(now);
  return next;
}

export function practicalEvidenceRequirements() {
  return {
    recognitionStimuli: MIN_RECOGNITION_STIMULI,
    directDecisionStimuli: MIN_DIRECT_DECISION_STIMULI,
    transferStimuli: MIN_TRANSFER_STIMULI,
    boundaryStimuli: MIN_BOUNDARY_STIMULI,
  } as const;
}
