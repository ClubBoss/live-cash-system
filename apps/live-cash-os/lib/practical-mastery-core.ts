import { practicalDecisionById, practicalDecisions, practicalSkillById, practicalSkillFamilies } from "../content/practical-mastery";
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

  const recognition = distinctSuccessfulByKind(progress, ["recognition"]);
  if (recognition < MIN_RECOGNITION_STIMULI) return "CONCEPT_TAUGHT";

  const direct = distinctSuccessfulByKind(progress, ["decision"]);
  if (direct < MIN_DIRECT_DECISION_STIMULI) return "RECOGNITION_TRAINED";

  const transfer = distinctSuccessfulByKind(progress, ["changed", "mixed"]);
  if (transfer < MIN_TRANSFER_STIMULI) return "DECISION_TRAINED";

  const boundary = distinctSuccessfulByKind(progress, ["boundary"]);
  if (boundary < MIN_BOUNDARY_STIMULI) return "CHANGED_NODE_TRANSFER";
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

export function practicalPrerequisitesMet(state: PracticalMasteryState, skillId: string): boolean {
  const skill = practicalSkillById.get(skillId);
  if (!skill) return false;
  return skill.prerequisiteSkillIds.every((prerequisiteId) => {
    const progress = state.skills[prerequisiteId];
    return progress ? stageAtLeast(progress.evidenceStage, "DECISION_TRAINED") : false;
  });
}

export function availablePracticalSkills(state: PracticalMasteryState) {
  return practicalSkillFamilies.filter((skill) => practicalPrerequisitesMet(state, skill.id));
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

export function nextPracticalDecision(state: PracticalMasteryState, skillId: string): PracticalDecision | null {
  if (!practicalPrerequisitesMet(state, skillId)) return null;
  const pool = decisionsForPracticalSkill(skillId);
  if (!pool.length) return null;
  const attemptedIds = new Set(state.attempts.filter((attempt) => attempt.skillId === skillId).map((attempt) => attempt.decisionId));
  return pool.find((decision) => !attemptedIds.has(decision.id)) ?? pool.find((decision) => decision.id === state.skills[skillId]?.lastIncorrectDecisionId) ?? pool[0];
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
  if (successful && deriveEvidenceStage(nextProgress) === "BOUNDARY_TESTED") {
    nextProgress.delayedRetrievalPassed = true;
  }
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
