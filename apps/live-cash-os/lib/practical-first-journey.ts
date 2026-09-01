import { firstJourneySteps } from "../content/practical-mastery/first-journey";
import { hardDependenciesFor } from "../content/practical-mastery/learning-route";
import { isOrdinaryLearnerDecision, practicalDecisions, practicalSkillById, type PracticalDecision } from "../content/practical-mastery";
import { isSemanticallyValidPracticalAttempt, practicalSkillCorpusCanReach, stageAtLeast, type PracticalMasteryState } from "./practical-mastery-core";
import { recentlyAttemptedDecisionIds } from "./practical-repeat-window";

export type FirstJourneyRecommendation = {
  skillId: string;
  step: number;
  whyNowRu: string;
  whyNowEn: string;
  isRepair: boolean;
};

function latestAttemptForDecision(state: PracticalMasteryState, decisionId: string) {
  const attempt = [...state.attempts].reverse().find((candidate) => candidate.decisionId === decisionId) ?? null;
  return attempt && isSemanticallyValidPracticalAttempt(attempt) ? attempt : null;
}

function unresolvedWrongDecisionIds(state: PracticalMasteryState, skillId: string): string[] {
  return practicalDecisions
    .filter((decision) => decision.skillId === skillId && isOrdinaryLearnerDecision(decision))
    .map((decision) => ({ decision, latest: latestAttemptForDecision(state, decision.id) }))
    .filter(({ latest }) => latest && !latest.correct)
    .map(({ decision }) => decision.id);
}

function unresolvedWrongCount(state: PracticalMasteryState, skillId: string): number {
  return unresolvedWrongDecisionIds(state, skillId).length;
}

function quickStartPrerequisitesMet(state: PracticalMasteryState, skillId: string): boolean {
  return hardDependenciesFor(skillId).every((dependency) => {
    const prerequisite = state.skills[dependency.fromSkillId];
    return prerequisite ? stageAtLeast(prerequisite.evidenceStage, "RECOGNITION_TRAINED") : false;
  });
}

function quickStartRecognitionReady(state: PracticalMasteryState, skillId: string): boolean {
  return quickStartPrerequisitesMet(state, skillId)
    && practicalSkillCorpusCanReach(skillId, "RECOGNITION_TRAINED");
}

export function nextFirstJourneyDecision(state: PracticalMasteryState, skillId: string): PracticalDecision | null {
  const skillDecisions = practicalDecisions.filter((decision) => decision.skillId === skillId && isOrdinaryLearnerDecision(decision));
  const successfulIds = new Set(
    state.attempts.filter((attempt) => attempt.skillId === skillId && attempt.correct && isSemanticallyValidPracticalAttempt(attempt)).map((attempt) => attempt.decisionId),
  );
  const unresolved = unresolvedWrongDecisionIds(state, skillId);
  if (unresolved.length) {
    const repair = skillDecisions.find((decision) => decision.id === unresolved[0]) ?? null;
    if (!repair) return null;
    // Exact prompt reuse is held back for the shared recent-attempt window, not
    // merely the single immediately-preceding attempt: a wrong item must not
    // reappear after only one intervening decision while a non-identical,
    // non-recent sibling remains available.
    const recentlyAttempted = recentlyAttemptedDecisionIds(state);
    if (!recentlyAttempted.has(repair.id)) return repair;

    const sameKindSibling = skillDecisions.find((decision) => decision.id !== repair.id && decision.kind === repair.kind && !successfulIds.has(decision.id) && !recentlyAttempted.has(decision.id)) ?? null;
    if (sameKindSibling) return sameKindSibling;

    const supportedSibling = skillDecisions.find((decision) => decision.id !== repair.id && (decision.kind === "recognition" || decision.kind === "decision" || decision.kind === "changed") && !successfulIds.has(decision.id) && !recentlyAttempted.has(decision.id)) ?? null;
    return supportedSibling;
  }

  return skillDecisions.find((decision) => decision.kind === "recognition" && !successfulIds.has(decision.id))
    ?? skillDecisions.find((decision) => (decision.kind === "decision" || decision.kind === "changed") && !successfulIds.has(decision.id))
    ?? null;
}

export function recommendFirstJourneyStep(state: PracticalMasteryState): FirstJourneyRecommendation | null {
  const recognitionReadyIds = new Set(
    firstJourneySteps
      .filter((step) => quickStartRecognitionReady(state, step.skillId))
      .map((step) => step.skillId),
  );

  const repair = firstJourneySteps
    .filter((step) => recognitionReadyIds.has(step.skillId) && unresolvedWrongCount(state, step.skillId) >= 2)
    .sort((a, b) => unresolvedWrongCount(state, b.skillId) - unresolvedWrongCount(state, a.skillId) || a.order - b.order)[0];

  if (repair) {
    const skill = practicalSkillById.get(repair.skillId);
    return {
      skillId: repair.skillId,
      step: repair.order,
      whyNowRu: `Сейчас полезнее исправить повторяющуюся ошибку в «${skill?.titleRu ?? repair.skillId}», чем открывать новый узел.`,
      whyNowEn: `Repairing the repeated miss in “${skill?.titleEn ?? repair.skillId}” has more value now than opening a new node.`,
      isRepair: true,
    };
  }

  for (const step of firstJourneySteps) {
    if (!recognitionReadyIds.has(step.skillId)) continue;
    const progress = state.skills[step.skillId];
    if (!progress || !stageAtLeast(progress.evidenceStage, "RECOGNITION_TRAINED")) {
      return {
        skillId: step.skillId,
        step: step.order,
        whyNowRu: `Шаг ${step.order}: получить базовое распознавание и сразу связать его со следующим table-relevant узлом. Полный mastery придёт позже через возвраты.`,
        whyNowEn: `Step ${step.order}: build basic recognition, then connect it to the next table-relevant node. Full mastery comes later through revisits.`,
        isRepair: false,
      };
    }
  }

  return null;
}

export function firstJourneyProgress(state: PracticalMasteryState) {
  const reached = firstJourneySteps.filter((step) => stageAtLeast(state.skills[step.skillId]?.evidenceStage ?? "SOURCE_SUPPORTED", "RECOGNITION_TRAINED")).length;
  return {
    reached,
    total: firstJourneySteps.length,
    completed: reached === firstJourneySteps.length,
  } as const;
}
