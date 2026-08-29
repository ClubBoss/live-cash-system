import { canonicalFirstJourneySkillIds } from "./learning-route";
import { practicalRulesForSkill } from "./mental-model";
import { practicalSkillFamilies } from "./registry";

export type FirstJourneyStep = {
  order: number;
  skillId: string;
  purposeRu: string;
  purposeEn: string;
  tableUseRu: string;
  tableUseEn: string;
  memoryRuleIds: string[];
  requiresHiddenCue: boolean;
};

const copyBySkillId: Record<string, { purposeRu: string; purposeEn: string; tableUseRu: string; tableUseEn: string }> = {
  "FND-01": {
    purposeRu: "Сначала видеть цену колла в банке, затем считать минимальную equity для прибыльного call.",
    purposeEn: "Quickly calculate the minimum equity required for a profitable call.",
    tableUseRu: "Нужно почти каждый раз, когда перед тобой ставка и ты выбираешь между call и fold: цена колла меняется вместе с банком и сайзингом.",
    tableUseEn: "You need this whenever you face a bet and choose between calling and folding.",
  },
  "FND-02": {
    purposeRu: "Отличать equity руки от той части equity, которую удастся реализовать.",
    purposeEn: "Separate a hand's raw equity from how much of it can actually be realized.",
    tableUseRu: "Особенно важно OOP и в маргинальных защитах, где будущие решения могут съесть номинальное преимущество.",
    tableUseEn: "Especially important OOP and in marginal defenses where future decisions can erase nominal equity.",
  },
  "PF-01": {
    purposeRu: "Понимать, почему одна и та же рука может быть open в поздней позиции и fold раньше.",
    purposeEn: "Understand why the same hand can be an open late and a fold earlier.",
    tableUseRu: "Используется в каждой unopened preflop ситуации: позиция меняет число игроков позади и качество реализации.",
    tableUseEn: "Used in every unopened preflop spot: position changes players behind and realization quality.",
  },
  "PF-04": {
    purposeRu: "Оценивать BB call через цену, закрытие action и реализацию, а не через силу руки в вакууме.",
    purposeEn: "Judge a BB call through price, closing action, and realization rather than hand strength in isolation.",
    tableUseRu: "BB defend — одна из самых частых live-cash ситуаций, и маленькая ошибка повторяется сотни раз.",
    tableUseEn: "BB defense is one of the most frequent cash-game situations, so small errors repeat constantly.",
  },
  "W4-BOARD-01": {
    purposeRu: "Читать flop через взаимодействие доски с двумя диапазонами, а не через инициативу.",
    purposeEn: "Read a flop through how it interacts with both ranges, not through initiative alone.",
    tableUseRu: "Это база для c-bet, check, raise и защиты почти во всех postflop банках.",
    tableUseEn: "This is the base for c-betting, checking, raising, and defending in almost every postflop pot.",
  },
  "IP-01": {
    purposeRu: "Выбирать между частой маленькой ставкой и более выборочной c-bet стратегией.",
    purposeEn: "Choose between a frequent small bet and a more selective c-bet strategy.",
    tableUseRu: "После preflop raise ты постоянно оказываешься IP на flop и должен быстро выбрать shape стратегии.",
    tableUseEn: "After raising preflop you repeatedly reach flops IP and must quickly choose the strategy shape.",
  },
  "BL-04": {
    purposeRu: "Менять BB defend, когда меняется размер open, вместо копирования одного диапазона.",
    purposeEn: "Adjust BB defense when open size changes instead of copying one range.",
    tableUseRu: "В live игре open sizes сильно гуляют; цена 2.5bb и 4bb создаёт разные решения той же рукой.",
    tableUseEn: "Live open sizes vary widely; 2.5bb and 4bb create different decisions with the same hand.",
  },
  "W4-RUNOUT-01": {
    purposeRu: "Замечать карты turn/river, которые действительно меняют диапазоны и nut advantage.",
    purposeEn: "Notice turn and river cards that materially change ranges and nut advantage.",
    tableUseRu: "Новая карта может превратить прежний хороший barrel в check или открыть новую ветку давления.",
    tableUseEn: "A new card can turn a good barrel into a check or create a new pressure branch.",
  },
};

export const firstJourneySteps: FirstJourneyStep[] = canonicalFirstJourneySkillIds.map((skillId, index) => {
  const rules = practicalRulesForSkill(skillId);
  const copy = copyBySkillId[skillId] ?? { purposeRu: skillId, purposeEn: skillId, tableUseRu: skillId, tableUseEn: skillId };
  return {
    order: index + 1,
    skillId,
    purposeRu: copy.purposeRu,
    purposeEn: copy.purposeEn,
    tableUseRu: copy.tableUseRu,
    tableUseEn: copy.tableUseEn,
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
