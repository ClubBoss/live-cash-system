import { canonicalFirstJourneySkillIds } from "./learning-route";
import { practicalRulesForSkill } from "./mental-model";
import { practicalSkillFamilies } from "./registry";

export type FirstJourneyStep = {
  order: number;
  skillId: string;
  titleRu: string;
  titleEn: string;
  purposeRu: string;
  purposeEn: string;
  tableUseRu: string;
  tableUseEn: string;
  memoryRuleIds: string[];
  requiresHiddenCue: boolean;
};

const copyBySkillId: Record<string, { titleRu: string; titleEn: string; purposeRu: string; purposeEn: string; tableUseRu: string; tableUseEn: string }> = {
  "FND-01": {
    titleRu: "Когда колл окупается?",
    titleEn: "When does a call pay for itself?",
    purposeRu: "Сравнивать стоимость колла с тем, как часто рука должна выигрывать, чтобы решение хотя бы не теряло деньги.",
    purposeEn: "Compare the cost of a call with how often the hand must win for the decision to break even.",
    tableUseRu: "Нужно почти каждый раз, когда перед тобой ставка и ты выбираешь между коллом и фолдом.",
    tableUseEn: "You need this whenever you face a bet and choose between calling and folding.",
  },
  "FND-02": {
    titleRu: "Почему шанс выиграть — ещё не весь результат?",
    titleEn: "Why is win probability not the whole result?",
    purposeRu: "Понять, почему позиция и будущие решения могут не дать руке сохранить всю её потенциальную силу.",
    purposeEn: "Understand why position and future decisions can prevent a hand from preserving all of its potential.",
    tableUseRu: "Особенно важно вне позиции и в пограничных защитах, где впереди ещё несколько решений.",
    tableUseEn: "Especially important out of position and in marginal defenses with several decisions still to come.",
  },
  "PF-01": {
    titleRu: "Как позиция меняет решение до флопа?",
    titleEn: "How does position change a preflop decision?",
    purposeRu: "Понять, почему одна и та же рука может открываться ближе к баттону и выбрасываться раньше.",
    purposeEn: "Understand why the same hand can be opened closer to the button and folded earlier.",
    tableUseRu: "Используется каждый раз, когда до тебя все сфолдили и ты решаешь, входить ли в банк рейзом.",
    tableUseEn: "Used whenever everyone folds to you and you decide whether to enter the pot with a raise.",
  },
  "PF-04": {
    titleRu: "Когда защищать большой блайнд?",
    titleEn: "When should the big blind defend?",
    purposeRu: "Оценивать колл большого блайнда через цену, порядок действий и то, насколько удобно будет играть дальше.",
    purposeEn: "Judge a big-blind call through price, action order, and how playable the future decisions are.",
    tableUseRu: "Защита большого блайнда — одна из самых частых ситуаций в live cash; небольшая ошибка здесь повторяется постоянно.",
    tableUseEn: "Big-blind defense is one of the most frequent live-cash situations, so small errors repeat constantly.",
  },
  "W4-BOARD-01": {
    titleRu: "Как доска меняет преимущество?",
    titleEn: "How does the board change who has the advantage?",
    purposeRu: "Смотреть не только на инициативу, а на то, какие сильные руки реально есть у обоих игроков на этом флопе.",
    purposeEn: "Look beyond initiative and ask which strong hands each player can actually have on this flop.",
    tableUseRu: "Это база для решения: ставить, чекать, повышать или защищаться почти в любом постфлоп-банке.",
    tableUseEn: "This is the base for deciding whether to bet, check, raise, or defend in almost every postflop pot.",
  },
  "IP-01": {
    titleRu: "Когда ставить часто, а когда выбирать руки?",
    titleEn: "When should you bet often versus selectively?",
    purposeRu: "Выбирать между частой маленькой ставкой и более выборочной стратегией в зависимости от доски и дошедших рук.",
    purposeEn: "Choose between a frequent small bet and a more selective strategy based on the board and the hands that reached it.",
    tableUseRu: "После префлоп-рейза ты часто увидишь флоп в позиции и должен быстро выбрать общий план ставки.",
    tableUseEn: "After raising preflop you often reach the flop in position and must quickly choose the overall betting plan.",
  },
  "BL-04": {
    titleRu: "Как размер рейза меняет защиту большого блайнда?",
    titleEn: "How does raise size change big-blind defense?",
    purposeRu: "Не копировать одну и ту же защиту: более крупное открытие делает пограничные коллы дороже.",
    purposeEn: "Do not copy one defense: a larger open makes marginal calls more expensive.",
    tableUseRu: "В live игре размеры открытия заметно меняются, поэтому одна и та же рука может иметь разное решение против 2.5bb и 4bb.",
    tableUseEn: "Live open sizes vary, so the same hand can have a different decision versus 2.5bb and 4bb.",
  },
  "W4-RUNOUT-01": {
    titleRu: "Как новая карта меняет решение?",
    titleEn: "How does a new card change the decision?",
    purposeRu: "Замечать карты тёрна и ривера, которые реально меняют набор сильных рук у обоих игроков.",
    purposeEn: "Notice turn and river cards that materially change the strong hands available to both players.",
    tableUseRu: "Новая карта может превратить прежнюю хорошую ставку в чек или, наоборот, открыть новый повод для давления.",
    tableUseEn: "A new card can turn a good bet into a check or create a new reason to apply pressure.",
  },
};

export const firstJourneySteps: FirstJourneyStep[] = canonicalFirstJourneySkillIds.map((skillId, index) => {
  const rules = practicalRulesForSkill(skillId);
  const copy = copyBySkillId[skillId] ?? { titleRu: skillId, titleEn: skillId, purposeRu: skillId, purposeEn: skillId, tableUseRu: skillId, tableUseEn: skillId };
  return {
    order: index + 1,
    skillId,
    titleRu: copy.titleRu,
    titleEn: copy.titleEn,
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
