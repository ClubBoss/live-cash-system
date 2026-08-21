export type CompressedPotMemoryRule = {
  id: string;
  triggerRu: string;
  triggerEn: string;
  ruleRu: string;
  ruleEn: string;
  boundaryRu: string;
  boundaryEn: string;
  skillIds: string[];
  sourceRefs: string[];
};

export const compressedPotMemoryRules: CompressedPotMemoryRule[] = [
  {
    id: "A7-RULE-ROLE-FIRST",
    triggerRu: "Попал в 3-bet pot.", triggerEn: "Entered a 3-bet pot.",
    ruleRu: "Сначала назови роль: aggressor/caller × IP/OOP. Только потом вспоминай board/sizing default.",
    ruleEn: "Name the role first: aggressor/caller × IP/OOP. Only then retrieve the board/sizing default.",
    boundaryRu: "Одинаковый flop не означает одинаковую strategy для четырёх ролей.",
    boundaryEn: "The same flop does not imply the same strategy for all four roles.",
    skillIds: ["3BP-01","3BP-02","3BP-03","3BP-04","3BP-05"], sourceRefs:["FTGU-E28","FTGU-E29","CP-G3-L09"],
  },
  {
    id: "A7-RULE-ADVANTAGE-SURVIVES",
    triggerRu: "Dry/high/paired 3BP flop.", triggerEn: "Dry/high/paired 3BP flop.",
    ruleRu: "Не спрашивай «это хороший board?». Спроси: сохранилась ли concentrated premium advantage именно у этой arriving range?",
    ruleEn: "Do not ask 'is this a good board?'. Ask whether concentrated premium advantage survived for this arriving range.",
    boundaryRu: "Если board equalises ranges, small range-bet shortcut ослабевает.",
    boundaryEn: "If the board equalizes ranges, the small range-bet shortcut weakens.",
    skillIds:["3BP-01","3BP-02","3BP-05"],sourceRefs:["FTGU-E28","FTGU-E29"],
  },
  {
    id: "A7-RULE-SIZE-IS-RANGE",
    triggerRu: "Размер c-bet меняется.", triggerEn: "The c-bet size changes.",
    ruleRu: "Цена и selection идут вместе: larger size обычно убирает marginal bettor/defender regions.",
    ruleEn: "Price and selection move together: a larger size usually removes marginal bettor/defender regions.",
    boundaryRu: "Не интерпретируй small bet как weakness и big bet как автоматическую силу без branch context.",
    boundaryEn: "Do not read small as weakness or big as automatic strength without branch context.",
    skillIds:["3BP-03","3BP-04","3BP-05"],sourceRefs:["FTGU-E28","FTGU-E29","CP-G3-L09"],
  },
  {
    id: "A7-RULE-LOW-SPR-COMPRESSES",
    triggerRu: "4-bet pot / low SPR.", triggerEn: "4-bet pot / low SPR.",
    ruleRu: "Low SPR сокращает число будущих веток; он не выбирает action за тебя.",
    ruleEn: "Low SPR reduces future branches; it does not choose the action for you.",
    boundaryRu: "One-pair/overpair не становятся automatic stack-off только из-за low SPR.",
    boundaryEn: "One-pair/overpair hands do not become automatic stack-offs merely because SPR is low.",
    skillIds:["4BP-01","4BP-02"],sourceRefs:["CP-G3-L10"],
  },
  {
    id: "A7-RULE-PLAN-JAM-BEFORE-BET",
    triggerRu: "Bet/raise в compressed pot может открыть jam.", triggerEn: "A bet/raise in a compressed pot can expose a jam.",
    ruleRu: "До инвестиции назови: что делаю против jam/reopen? Если ответа нет, sizing ещё не спланирован.",
    ruleEn: "Before investing, name the response to a jam/reopen. If you cannot, the sizing is not yet planned.",
    boundaryRu: "Уже вложенные фишки не делают следующий call обязательным.",
    boundaryEn: "Already-invested chips do not make the next call mandatory.",
    skillIds:["4BP-04"],sourceRefs:["CP-G3-L04","CP-G3-L10"],
  },
  {
    id: "A7-RULE-CHECK-CAN-BE-STRONG",
    triggerRu: "Хочется bet every strong hand в low-SPR pot.", triggerEn: "Want to bet every strong hand in a low-SPR pot.",
    ruleRu: "Проверь, нужна ли protected checking range и сохраняет ли check будущие ошибки/opponent bluffs.",
    ruleEn: "Check whether a protected checking range is needed and whether checking preserves future opponent mistakes/bluffs.",
    boundaryRu: "Check не должен автоматически означать weakness.",
    boundaryEn: "A check must not automatically mean weakness.",
    skillIds:["4BP-03"],sourceRefs:["CP-G3-L10"],
  },
];
