import { firstJourneySteps } from "../content/practical-mastery/first-journey";
import { practicalDecisions, practicalSkillById, type PracticalDecision } from "../content/practical-mastery";
import { trainablePracticalSkills, stageAtLeast, type PracticalMasteryState } from "./practical-mastery-core";

export type FirstJourneyRecommendation = {
  skillId: string;
  step: number;
  whyNowRu: string;
  whyNowEn: string;
  isRepair: boolean;
};

function latestAttemptForDecision(state: PracticalMasteryState, decisionId: string) {
  return [...state.attempts].reverse().find((attempt) => attempt.decisionId === decisionId) ?? null;
}

function unresolvedWrongDecisionIds(state: PracticalMasteryState, skillId: string): string[] {
  return practicalDecisions
    .filter((decision) => decision.skillId === skillId)
    .map((decision) => ({ decision, latest: latestAttemptForDecision(state, decision.id) }))
    .filter(({ latest }) => latest && !latest.correct)
    .map(({ decision }) => decision.id);
}

function unresolvedWrongCount(state: PracticalMasteryState, skillId: string): number {
  return unresolvedWrongDecisionIds(state, skillId).length;
}

export function nextFirstJourneyDecision(state: PracticalMasteryState, skillId: string): PracticalDecision | null {
  const skillDecisions = practicalDecisions.filter((decision) => decision.skillId === skillId);
  const unresolved = unresolvedWrongDecisionIds(state, skillId);
  if (unresolved.length) return skillDecisions.find((decision) => decision.id === unresolved[0]) ?? null;

  const successfulIds = new Set(
    state.attempts.filter((attempt) => attempt.skillId === skillId && attempt.correct).map((attempt) => attempt.decisionId),
  );

  // First-journey purpose is recognition + a fast table link, not full topic
  // mastery. Prefer independent recognition stimuli, then one direct/changed
  // table decision if recognition corpus is already exhausted.
  return skillDecisions.find((decision) => decision.kind === "recognition" && !successfulIds.has(decision.id))
    ?? skillDecisions.find((decision) => (decision.kind === "decision" || decision.kind === "changed") && !successfulIds.has(decision.id))
    ?? null;
}

export function recommendFirstJourneyStep(state: PracticalMasteryState): FirstJourneyRecommendation | null {
  const trainableIds = new Set(trainablePracticalSkills(state).map((skill) => skill.id));

  const repair = firstJourneySteps
    .filter((step) => trainableIds.has(step.skillId) && unresolvedWrongCount(state, step.skillId) >= 2)
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
    if (!trainableIds.has(step.skillId)) continue;
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
