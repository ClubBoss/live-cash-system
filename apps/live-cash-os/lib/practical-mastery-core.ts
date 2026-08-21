import { practicalDecisionById, practicalDecisions, practicalSkillById, practicalSkillFamilies } from "../content/practical-mastery";
import type { PracticalDecision, PracticalEvidenceStage } from "../content/practical-mastery";

export const PRACTICAL_MASTERY_STATE_SCHEMA_VERSION = 1 as const;
export const PRACTICAL_MASTERY_CONTENT_VERSION = "2026.08-practical-mastery-v1";

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
  attempts: number;
  correct: number;
  changedCorrect: number;
  boundaryCorrect: number;
  mixedCorrect: number;
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

function nowIso(now?: Date): string {
  return (now ?? new Date()).toISOString();
}

export function createPracticalMasteryState(now = new Date(), resetFromLegacy = false): PracticalMasteryState {
  const skills = Object.fromEntries(practicalSkillFamilies.map((skill) => [
    skill.id,
    {
      skillId: skill.id,
      evidenceStage: "SOURCE_SUPPORTED" as const,
      attempts: 0,
      correct: 0,
      changedCorrect: 0,
      boundaryCorrect: 0,
      mixedCorrect: 0,
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

function deriveImmediateStage(progress: PracticalSkillProgress, decision: PracticalDecision, correct: boolean): PracticalEvidenceStage {
  if (!correct) return progress.evidenceStage;
  if (decision.kind === "boundary") return "BOUNDARY_TESTED";
  if (decision.kind === "changed") return "CHANGED_NODE_TRANSFER";
  if (decision.kind === "mixed") return "CHANGED_NODE_TRANSFER";
  if (decision.kind === "decision") return "DECISION_TRAINED";
  return "RECOGNITION_TRAINED";
}

function maxStage(left: PracticalEvidenceStage, right: PracticalEvidenceStage): PracticalEvidenceStage {
  return STAGE_ORDER.indexOf(left) >= STAGE_ORDER.indexOf(right) ? left : right;
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
    if (decision.kind === "changed") nextProgress.changedCorrect += 1;
    if (decision.kind === "boundary") nextProgress.boundaryCorrect += 1;
    if (decision.kind === "mixed") nextProgress.mixedCorrect += 1;
    nextProgress.evidenceStage = maxStage(nextProgress.evidenceStage, deriveImmediateStage(nextProgress, decision, true));
  } else {
    nextProgress.lastIncorrectDecisionId = decision.id;
  }
  nextProgress.lastAttemptAt = answeredAt;
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
  if (successful) next.skills[skillId].evidenceStage = maxStage(progress.evidenceStage, "DELAYED_RETRIEVAL");
  next.revision += 1;
  next.updatedAt = nowIso(now);
  return next;
}

export function markPracticalRealHandTransfer(state: PracticalMasteryState, skillId: string, reviewed: boolean, now = new Date()): PracticalMasteryState {
  const progress = state.skills[skillId];
  if (!progress) throw new Error(`Unknown practical skill: ${skillId}`);
  const next = structuredClone(state);
  if (reviewed) next.skills[skillId].evidenceStage = maxStage(progress.evidenceStage, "REAL_HAND_TRANSFER");
  next.revision += 1;
  next.updatedAt = nowIso(now);
  return next;
}
