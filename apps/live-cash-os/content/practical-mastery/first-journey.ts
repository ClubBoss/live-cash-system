import { canonicalFirstJourneySkillIds } from "./learning-route";
import { practicalRulesForSkill } from "./mental-model";
import { practicalSkillFamilies } from "./registry";

export type FirstJourneyStep = {
  order: number;
  skillId: string;
  purposeRu: string;
  purposeEn: string;
  memoryRuleIds: string[];
  requiresHiddenCue: boolean;
};

const purposeBySkillId: Record<string, { ru: string; en: string }> = {
  "FND-01": { ru: "Понять, почему цена решения важнее интуиции «надо выигрывать чаще половины».", en: "Understand why decision price matters more than a 'must win over half' intuition." },
  "FND-02": { ru: "Увидеть, почему raw equity не гарантирует хороший EV, если equity плохо реализуется.", en: "See why raw equity does not guarantee good EV when realization is poor." },
  "PF-01": { ru: "Связать позицию с количеством игроков позади и качеством realisation.", en: "Connect position with players behind and realization quality." },
  "PF-04": { ru: "Понять уникальную цену BB и закрытие action.", en: "Understand the BB's unique price and closing-action advantage." },
  "W4-BOARD-01": { ru: "Перестать ставить по инерции initiative и начать видеть board × range ownership.", en: "Stop betting from initiative alone and begin seeing board × range ownership." },
  "IP-01": { ru: "Сделать первое postflop решение: range-bet или selective strategy.", en: "Make the first postflop decision: range bet or selective strategy." },
  "BL-04": { ru: "Перенести BB-модель на changed node через другой open size.", en: "Transfer the BB model to a changed node through a different open size." },
  "W4-RUNOUT-01": { ru: "Увидеть, как новая карта может изменить ownership и cap.", en: "See how a new card can change ownership and cappedness." },
};

export const firstJourneySteps: FirstJourneyStep[] = canonicalFirstJourneySkillIds.map((skillId, index) => {
  const rules = practicalRulesForSkill(skillId);
  const purpose = purposeBySkillId[skillId] ?? { ru: skillId, en: skillId };
  return {
    order: index + 1,
    skillId,
    purposeRu: purpose.ru,
    purposeEn: purpose.en,
    memoryRuleIds: rules.map((rule) => rule.id),
    requiresHiddenCue: index >= canonicalFirstJourneySkillIds.length - 2,
  };
});

export function firstJourneyStepForSkill(skillId: string): FirstJourneyStep | null {
  return firstJourneySteps.find((step) => step.skillId === skillId) ?? null;
}

export function firstJourneySkillExists(skillId: string): boolean {
  return practicalSkillFamilies.some((skill) => skill.id === skillId);
}

export const firstJourneyIntegrity = {
  interleavesWaves: new Set(firstJourneySteps.map((step) => practicalSkillFamilies.find((skill) => skill.id === step.skillId)?.wave)).size >= 4,
  reachesPostflop: firstJourneySteps.some((step) => step.skillId === "IP-01"),
  includesChangedBlindNode: firstJourneySteps.some((step) => step.skillId === "BL-04"),
  fadesScaffold: firstJourneySteps.some((step) => step.requiresHiddenCue),
} as const;
