import type { PracticalEvidenceStage } from "../content/practical-mastery";
import { isSemanticallyValidPracticalAttempt, stageAtLeast, type PracticalMasteryState } from "./practical-mastery-core";

export type PracticalSkillProgressCategoryKey =
  | "CONCEPT"
  | "RECOGNITION"
  | "INDEPENDENT_DECISION"
  | "CHANGED_CONDITIONS"
  | "BOUNDARY"
  | "DELAYED_RECALL"
  | "REAL_HAND";

export type PracticalSkillProgressCategory = {
  key: PracticalSkillProgressCategoryKey;
  stage: PracticalEvidenceStage;
  satisfied: boolean;
};

const CATEGORY_STAGES: ReadonlyArray<{ key: PracticalSkillProgressCategoryKey; stage: PracticalEvidenceStage }> = [
  { key: "CONCEPT", stage: "CONCEPT_TAUGHT" },
  { key: "RECOGNITION", stage: "RECOGNITION_TRAINED" },
  { key: "INDEPENDENT_DECISION", stage: "DECISION_TRAINED" },
  { key: "CHANGED_CONDITIONS", stage: "CHANGED_NODE_TRANSFER" },
  { key: "BOUNDARY", stage: "BOUNDARY_TESTED" },
  { key: "DELAYED_RECALL", stage: "DELAYED_RETRIEVAL" },
  { key: "REAL_HAND", stage: "REAL_HAND_TRANSFER" },
];

export function practicalSkillProgressTransparency(
  state: PracticalMasteryState,
  skillId: string,
  targetStage: PracticalEvidenceStage,
) {
  const progress = state.skills[skillId];
  const currentStage = progress?.evidenceStage ?? "SOURCE_SUPPORTED";
  const categories: PracticalSkillProgressCategory[] = CATEGORY_STAGES
    .filter((category) => stageAtLeast(targetStage, category.stage))
    .map((category) => ({
      ...category,
      satisfied: stageAtLeast(currentStage, category.stage),
    }));
  const recentPhysicalAttempts = state.attempts.filter((attempt) => attempt.skillId === skillId).slice(-8);
  const recentAttempts = recentPhysicalAttempts.filter(isSemanticallyValidPracticalAttempt);
  const recentCorrect = recentAttempts.filter((attempt) => attempt.correct);
  const latestPhysicalAttempt = recentPhysicalAttempts.at(-1) ?? null;

  return {
    currentStage,
    categories,
    nextCategory: categories.find((category) => !category.satisfied) ?? null,
    recentAttemptCount: recentAttempts.length,
    recentCorrectCount: recentCorrect.length,
    recentDistinctCorrectCount: new Set(recentCorrect.map((attempt) => attempt.decisionId)).size,
    latestConfidence: latestPhysicalAttempt && isSemanticallyValidPracticalAttempt(latestPhysicalAttempt)
      ? latestPhysicalAttempt.confidence
      : null,
  } as const;
}
