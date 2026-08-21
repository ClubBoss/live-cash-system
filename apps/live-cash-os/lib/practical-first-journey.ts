import { firstJourneySteps } from "../content/practical-mastery/first-journey";
import { practicalSkillById } from "../content/practical-mastery";
import { trainablePracticalSkills, stageAtLeast, type PracticalMasteryState } from "./practical-mastery-core";

export type FirstJourneyRecommendation = {
  skillId: string;
  step: number;
  whyNowRu: string;
  whyNowEn: string;
  isRepair: boolean;
};

function wrongCount(state: PracticalMasteryState, skillId: string): number {
  return state.attempts.filter((attempt) => attempt.skillId === skillId && !attempt.correct).length;
}

export function recommendFirstJourneyStep(state: PracticalMasteryState): FirstJourneyRecommendation | null {
  const trainableIds = new Set(trainablePracticalSkills(state).map((skill) => skill.id));

  const repair = firstJourneySteps
    .filter((step) => trainableIds.has(step.skillId) && wrongCount(state, step.skillId) >= 2)
    .sort((a, b) => wrongCount(state, b.skillId) - wrongCount(state, a.skillId) || a.order - b.order)[0];

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
    // First exposure is intentionally lighter than full mastery. Once the
    // learner has recognition evidence, the spiral moves on and later returns
    // through transfer, mixed retrieval and repair.
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
