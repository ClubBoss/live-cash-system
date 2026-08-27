import type { ModuleId } from "../../lib/model";

export const PRACTICAL_WAVE_IDS = [
  "W1_FOUNDATION",
  "W2_PREFLOP",
  "W3_BLINDS",
  "W4_RECOGNITION",
  "W5_SRP_OOP",
  "W6_SRP_IP",
  "W7_3BET",
  "W8_4BET_LOW_SPR",
  "W9_TURN",
  "W10_RIVER",
  "W11_MULTIWAY_LIMP",
  "W12_DEEP_STRADDLE",
  "W13_EXPLOIT_LIVE",
  "W14_INTEGRATED",
] as const;

export type PracticalWaveId = (typeof PRACTICAL_WAVE_IDS)[number];

export const PRACTICAL_EVIDENCE_STAGES = [
  "SOURCE_SUPPORTED",
  "CONCEPT_TAUGHT",
  "RECOGNITION_TRAINED",
  "DECISION_TRAINED",
  "CHANGED_NODE_TRANSFER",
  "BOUNDARY_TESTED",
  "DELAYED_RETRIEVAL",
  "REAL_HAND_TRANSFER",
] as const;

export type PracticalEvidenceStage = (typeof PRACTICAL_EVIDENCE_STAGES)[number];

export type PracticalSkillFamily = {
  id: string;
  wave: PracticalWaveId;
  titleRu: string;
  titleEn: string;
  objectiveRu: string;
  objectiveEn: string;
  legacyModuleIds: ModuleId[];
  prerequisiteSkillIds: string[];
  sourceRefs: string[];
  targetEvidenceStage: PracticalEvidenceStage;
  competencyGate?: boolean;
  livePriority: "P0" | "P1" | "P2";
};

export type PracticalAnchor = {
  id: string;
  skillId: string;
  kind: "recognition" | "decision" | "changed" | "boundary" | "mixed";
  sourceRefs: string[];
  assumptions: string[];
  promptRu: string;
  promptEn: string;
  answerRu: string;
  answerEn: string;
  rationaleRu: string;
  rationaleEn: string;
  changedVariables?: string[];
};

export type PracticalDecisionOption = {
  id: string;
  textRu: string;
  textEn: string;
  misconception?: string;
};

export type PracticalDecision = {
  id: string;
  skillId: string;
  learnerEligibility?: "ORDINARY" | "INTERNAL_ONLY";
  kind: "recognition" | "decision" | "changed" | "boundary" | "mixed";
  sourceRefs: string[];
  assumptions: string[];
  cueRu: string;
  cueEn: string;
  questionRu: string;
  questionEn: string;
  actionOptions: PracticalDecisionOption[];
  reasonOptions: PracticalDecisionOption[];
  correctActionId: string;
  correctReasonId: string;
  explanationRu: string;
  explanationEn: string;
  changedVariables?: string[];
  targetSeconds: number;
};

export function isOrdinaryLearnerDecision(decision: PracticalDecision): boolean {
  return decision.learnerEligibility !== "INTERNAL_ONLY";
}
