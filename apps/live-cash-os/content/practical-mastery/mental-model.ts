export type PracticalMemoryMode = "TRUE_SEQUENCE" | "TRIGGER_RULE" | "ENVIRONMENTAL_HABIT";

export type PracticalTriggerFamily =
  | "FORCED_UNIT"
  | "STACK_ASYMMETRY"
  | "POT_GEOMETRY"
  | "OPEN_SIZE"
  | "ORIGIN_RANGE"
  | "PLAYERS_BEHIND"
  | "POSITION"
  | "FOLD_EQUITY"
  | "BOARD_OWNERSHIP"
  | "RANGE_CAP"
  | "RUNOUT_SHIFT"
  | "MULTIWAY"
  | "BLOCKER_ROLE";

export type PracticalRule = {
  id: string;
  mode: PracticalMemoryMode;
  triggerFamily: PracticalTriggerFamily;
  skillIds: string[];
  sourceRefs: string[];
  triggerRu: string;
  triggerEn: string;
  defaultRu: string;
  defaultEn: string;
  whyRu: string;
  whyEn: string;
  amplifiersRu: string[];
  amplifiersEn: string[];
  reversalsRu: string[];
  reversalsEn: string[];
  transferCueRu: string;
  transferCueEn: string;
};

const r = (rule: PracticalRule): PracticalRule => rule;

export const practicalRules: PracticalRule[] = [
  r({
    id: "RULE-GEO-FORCED-UNIT",
    mode: "ENVIRONMENTAL_HABIT",
    triggerFamily: "FORCED_UNIT",
    skillIds: ["FND-06"],
    sourceRefs: ["LCM-01"],
    triggerRu: "На столе появился straddle или изменилась обязательная ставка.",
    triggerEn: "A straddle appears or the forced betting unit changes.",
    defaultRu: "До раздачи переякорь рабочую глубину в новой forced unit.",
    defaultEn: "Before the hand, re-anchor working depth to the new forced unit.",
    whyRu: "Номинальные BB могут скрывать, насколько коротким стало реальное preflop-дерево.",
    whyEn: "Nominal big blinds can hide how much shorter the actual preflop tree became.",
    amplifiersRu: ["mandatory straddle", "несколько straddle", "необычные forced bets"],
    amplifiersEn: ["mandatory straddle", "multiple straddles", "unusual forced bets"],
    reversalsRu: ["нет изменения forced unit — не нужно заново проговаривать этот шаг"],
    reversalsEn: ["if the forced unit did not change, there is no need to rehearse this step"],
    transferCueRu: "Оставь те же деньги в стеках, добавь straddle и спроси, что изменилось первым.",
    transferCueEn: "Keep the same dollar stacks, add a straddle, and ask what changes first.",
  }),
  r({
    id: "RULE-GEO-PAIRWISE",
    mode: "ENVIRONMENTAL_HABIT",
    triggerFamily: "STACK_ASYMMETRY",
    skillIds: ["FND-06"],
    sourceRefs: ["LCM-01"],
    triggerRu: "За столом заметно разные стеки или multiway pot.",
    triggerEn: "Stacks are materially asymmetric or the pot is multiway.",
    defaultRu: "Сканируй pairwise effective stack против реально релевантного соперника, а не ищи одну общую глубину.",
    defaultEn: "Read the pairwise effective stack versus the relevant opponent instead of forcing one table-wide depth.",
    whyRu: "В разных confrontation доступна разная сумма, особенно при side-pot geometry.",
    whyEn: "Different confrontations expose different amounts of money, especially with side-pot geometry.",
    amplifiersRu: ["короткий stack среди глубоких", "multiway all-in risk", "side-pot potential"],
    amplifiersEn: ["one short stack among deep stacks", "multiway all-in risk", "side-pot potential"],
    reversalsRu: ["heads-up и равные стеки — pairwise distinction не добавляет новой информации"],
    reversalsEn: ["heads-up with equal stacks makes the pairwise distinction redundant"],
    transferCueRu: "Не меняй Hero stack; укороти только одного из двух opponents.",
    transferCueEn: "Keep Hero's stack fixed; shorten only one of two opponents.",
  }),
  r({
    id: "RULE-GEO-POT-COMPRESSION",
    mode: "TRIGGER_RULE",
    triggerFamily: "POT_GEOMETRY",
    skillIds: ["FND-06"],
    sourceRefs: ["LCM-01", "FTGU-E01"],
    triggerRu: "Крупный raise/call резко увеличил pot относительно remaining stack.",
    triggerEn: "A large raise/call sharply increased the pot relative to the remaining stack.",
    defaultRu: "Перестань мыслить стартовыми BB и заново оцени future SPR/leverage.",
    defaultEn: "Stop thinking in starting-stack big blinds and re-read future SPR/leverage.",
    whyRu: "Глубокий старт может превратиться в короткое postflop-дерево после одного крупного preflop action.",
    whyEn: "A deep starting stack can become a short postflop tree after one large preflop action.",
    amplifiersRu: ["squeeze/4-bet", "large live sizing", "shorter effective opponent"],
    amplifiersEn: ["squeeze/4-bet", "large live sizing", "shorter effective opponent"],
    reversalsRu: ["маленький SRP pot оставляет много future leverage даже при обычных 100bb"],
    reversalsEn: ["a small single-raised pot can preserve substantial future leverage even at ordinary 100bb depth"],
    transferCueRu: "Оставь стартовый stack тем же, но удвой сформированный pot.",
    transferCueEn: "Keep the starting stack unchanged but double the pot that reaches postflop.",
  }),
  r({
    id: "RULE-PF-LATE-RFI",
    mode: "TRIGGER_RULE",
    triggerFamily: "POSITION",
    skillIds: ["PF-01"],
    sourceRefs: ["FTGU-E02"],
    triggerRu: "Та же fringe hand перемещается ближе к BTN.",
    triggerEn: "The same fringe hand moves closer to the button.",
    defaultRu: "Opening attractiveness обычно растёт: игроков позади меньше, realisation лучше.",
    defaultEn: "Opening attractiveness generally rises: fewer players remain and realization improves.",
    whyRu: "Position постепенно расширяет profitable opening region; это не бинарный steal/non-steal switch.",
    whyEn: "Position gradually widens the profitable opening region; it is not a binary steal/non-steal switch.",
    amplifiersRu: ["пассивные/слабые игроки позади", "ниже rake", "better postflop edge"],
    amplifiersEn: ["passive/weak players behind", "lower rake", "better postflop edge"],
    reversalsRu: ["сильные aggressive players behind", "высокий rake", "range становится плохо защищаемым vs 3-bets"],
    reversalsEn: ["strong aggressive players behind", "high rake", "range becomes poorly defensible versus 3-bets"],
    transferCueRu: "Меняй только позицию HJ → CO → BTN при той же hand.",
    transferCueEn: "Change only position HJ → CO → BTN with the same hand.",
  }),
  r({
    id: "RULE-BB-PRICE",
    mode: "TRIGGER_RULE",
    triggerFamily: "OPEN_SIZE",
    skillIds: ["PF-04", "BL-04"],
    sourceRefs: ["FTGU-E05"],
    triggerRu: "Размер open заметно увеличился или уменьшился.",
    triggerEn: "The open size becomes materially larger or smaller.",
    defaultRu: "При большем open marginal BB calls исчезают первыми; при меньшем цена поддерживает больше fringe continues.",
    defaultEn: "As the open gets larger, marginal BB calls disappear first; a smaller price supports more fringe continues.",
    whyRu: "BB получает discount и закрывает action, но этот price edge напрямую меняется sizing-ом.",
    whyEn: "The BB receives a discount and closes the action, but that price edge changes directly with sizing.",
    amplifiersRu: ["высокий rake", "плохая realisation", "сильный origin range"],
    amplifiersEn: ["high rake", "poor realization", "strong origin range"],
    reversalsRu: ["очень широкий opener", "хорошая playability", "малый sizing"],
    reversalsEn: ["very wide opener", "good playability", "small sizing"],
    transferCueRu: "Оставь hand/opener теми же и меняй только 2.5bb → 4bb.",
    transferCueEn: "Keep the hand/opener fixed and change only 2.5bb → 4bb.",
  }),
  r({
    id: "RULE-BB-ORIGIN",
    mode: "TRIGGER_RULE",
    triggerFamily: "ORIGIN_RANGE",
    skillIds: ["PF-04", "BL-01", "BL-02", "BL-03"],
    sourceRefs: ["FTGU-E05"],
    triggerRu: "Opener меняется с BTN/CO на более раннюю позицию.",
    triggerEn: "The opener moves from BTN/CO to an earlier position.",
    defaultRu: "Fringe BB defence сжимается: domination и strong-overpair density растут.",
    defaultEn: "Fringe BB defense contracts as domination and strong-overpair density rise.",
    whyRu: "Одинаковая цена не означает одинаковый EV против разных origin ranges.",
    whyEn: "The same price does not imply the same EV against different origin ranges.",
    amplifiersRu: ["tight opener", "dominated offsuit high cards", "high rake"],
    amplifiersEn: ["tight opener", "dominated offsuit high cards", "high rake"],
    reversalsRu: ["необычно широкий early-position opener", "очень маленький sizing"],
    reversalsEn: ["unusually wide early-position opener", "very small sizing"],
    transferCueRu: "Сохрани hand и sizing, поменяй только BTN → EP.",
    transferCueEn: "Keep hand and sizing fixed; change only BTN → EP.",
  }),
  r({
    id: "RULE-SB-BEHIND",
    mode: "TRIGGER_RULE",
    triggerFamily: "PLAYERS_BEHIND",
    skillIds: ["PF-05", "BL-05"],
    sourceRefs: ["FTGU-E06"],
    triggerRu: "Hero в SB рассматривает flat, а BB ещё действует.",
    triggerEn: "Hero is in the SB considering a flat while the BB still acts.",
    defaultRu: "Не оценивай flat как закрытый heads-up call: добавь squeeze risk и плохую OOP realisation.",
    defaultEn: "Do not price the flat as a closed heads-up call: include squeeze risk and poor OOP realization.",
    whyRu: "SB получает хуже discount, не закрывает action и может потерять всю equity до flop.",
    whyEn: "The SB gets a worse discount, does not close the action and can lose all equity before the flop.",
    amplifiersRu: ["aggressive BB", "capped flatting range", "dominated hand"],
    amplifiersEn: ["aggressive BB", "capped flatting range", "dominated hand"],
    reversalsRu: ["очень пассивный/слабый BB может вернуть часть conditional flats"],
    reversalsEn: ["a very passive/weak BB can restore some conditional flats"],
    transferCueRu: "Оставь opener и hand, поменяй BB passive → aggressive.",
    transferCueEn: "Keep opener and hand fixed; change BB passive → aggressive.",
  }),
  r({
    id: "RULE-PF-FOLD-EQUITY",
    mode: "TRIGGER_RULE",
    triggerFamily: "FOLD_EQUITY",
    skillIds: ["PF-02", "PF-06", "PF-09"],
    sourceRefs: ["FTGU-E03", "FTGU-E15"],
    triggerRu: "Opponent/callers продолжают слишком широко и fold equity падает.",
    triggerEn: "Opponent/callers continue too widely and fold equity falls.",
    defaultRu: "Сдвигай aggressive range к hands, которые хорошо играют when called; убирай bluff-only candidates.",
    defaultEn: "Shift the aggressive range toward hands that perform well when called; remove bluff-only candidates.",
    whyRu: "Когда folds мало, EV агрессии должен переживать called branch, а не жить только за счёт pressure.",
    whyEn: "When folds are scarce, aggression must survive the called branch rather than relying only on pressure.",
    amplifiersRu: ["station-like caller", "multiway likelihood", "large iso getting called"],
    amplifiersEn: ["station-like caller", "multiway likelihood", "large isolation raise still getting called"],
    reversalsRu: ["реальные overfolds", "сильные blockers", "позиция и хорошая postflop realisation"],
    reversalsEn: ["real overfolds", "strong blockers", "position and good postflop realization"],
    transferCueRu: "Не меняй Hero hand; поменяй opponent from overfolding to overcalling.",
    transferCueEn: "Keep Hero's hand fixed; change opponent from overfolding to overcalling.",
  }),
  r({
    id: "RULE-FLOP-OWNERSHIP",
    mode: "TRIGGER_RULE",
    triggerFamily: "BOARD_OWNERSHIP",
    skillIds: ["W4-BOARD-01", "IP-01", "OOP-01"],
    sourceRefs: ["FTGU-E07", "FTGU-E27"],
    triggerRu: "Flop заметно лучше взаимодействует с caller range или нейтрализует PFR overpairs/high cards.",
    triggerEn: "The flop interacts materially better with the caller range or neutralizes the PFR's overpairs/high cards.",
    defaultRu: "Не c-bet по инерции initiative; становись selective или используй protected checking strategy.",
    defaultEn: "Do not c-bet from initiative alone; become selective or use a protected checking strategy.",
    whyRu: "Postflop range/nut advantage определяется board × preflop ranges, а не тем, кто рейзил последним.",
    whyEn: "Postflop range/nut advantage comes from board × preflop ranges, not from who raised last.",
    amplifiersRu: ["low/wet/middling board хорошо попадает в caller", "PFR OOP", "caller retains two-pair/straight density"],
    amplifiersEn: ["low/wet/middling board fits caller", "PFR OOP", "caller retains two-pair/straight density"],
    reversalsRu: ["high-card dry boards сохраняют концентрированное PFR advantage", "small merged range bet может снова стать удобным"],
    reversalsEn: ["high-card dry boards can preserve concentrated PFR advantage", "a small merged range bet can become attractive again"],
    transferCueRu: "Сохрани positions/ranges и поменяй только dry A-high flop → connected low flop.",
    transferCueEn: "Keep positions/ranges fixed and change only dry A-high flop → connected low flop.",
  }),
  r({
    id: "RULE-TURN-CAP-RECHECK",
    mode: "TRIGGER_RULE",
    triggerFamily: "RUNOUT_SHIFT",
    skillIds: ["W4-RUNOUT-01"],
    sourceRefs: ["FTGU-E20", "FTGU-E21"],
    triggerRu: "Новая turn card создаёт relevante two pair/straight/flush/top-pair region для ранее capped range.",
    triggerEn: "The turn creates relevant two-pair/straight/flush/top-pair regions for a range that was previously capped.",
    defaultRu: "Перепроверь cap: старое flop ownership нельзя переносить на turn автоматически.",
    defaultEn: "Recheck the cap; flop ownership cannot be carried to the turn automatically.",
    whyRu: "Action ancestry фильтрует range, но новая карта может вернуть nutted region.",
    whyEn: "Action ancestry filters a range, but the new card can restore a nutted region.",
    amplifiersRu: ["draw completes", "pairing changes nut density", "caller had relevant suited/connective region"],
    amplifiersEn: ["draw completes", "pairing changes nut density", "caller had relevant suited/connective region"],
    reversalsRu: ["blank turn при реально capped flop call часто сохраняет leverage aggressor-а"],
    reversalsEn: ["a blank turn after a genuinely capped flop call often preserves the aggressor's leverage"],
    transferCueRu: "Оставь flop/action теми же, сравни blank turn с draw-completing turn.",
    transferCueEn: "Keep flop/action fixed; compare a blank turn with a draw-completing turn.",
  }),
  r({
    id: "RULE-BLOCKER-ROLE",
    mode: "TRIGGER_RULE",
    triggerFamily: "BLOCKER_ROLE",
    skillIds: ["FND-05"],
    sourceRefs: ["FTGU-E13"],
    triggerRu: "Решение зависит от blocker/unblocker свойства карты Hero.",
    triggerEn: "A decision depends on the blocker/unblocker property of Hero's card.",
    defaultRu: "Сначала назови роль действия — bluff, bluff-catch или value — и только потом оцени removal.",
    defaultEn: "Name the action role first — bluff, bluff-catch or value — then evaluate removal.",
    whyRu: "Одна и та же карта может быть хорошим blocker для bluff и плохим для value или bluff-catch.",
    whyEn: "The same card can be a good blocker for a bluff and a bad one for value or bluff-catching.",
    amplifiersRu: ["узкий river range", "очевидные missed draws", "концентрированный value region"],
    amplifiersEn: ["narrow river range", "obvious missed draws", "concentrated value region"],
    reversalsRu: ["если line не содержит соответствующих value/bluff combos, abstract blocker label мало значит"],
    reversalsEn: ["if the line does not contain the relevant value/bluff combos, an abstract blocker label means little"],
    transferCueRu: "Сохрани board и hand class, поменяй только действие Hero: bluff → bluff-catch → value.",
    transferCueEn: "Keep board and hand class fixed; change only Hero's role: bluff → bluff-catch → value.",
  }),
];

export const practicalRuleById = new Map(practicalRules.map((rule) => [rule.id, rule]));

export function practicalRulesForSkill(skillId: string): PracticalRule[] {
  return practicalRules.filter((rule) => rule.skillIds.includes(skillId));
}

export function practicalRulesForTrigger(triggerFamily: PracticalTriggerFamily): PracticalRule[] {
  return practicalRules.filter((rule) => rule.triggerFamily === triggerFamily);
}

export function practicalEnvironmentalHabits(): PracticalRule[] {
  return practicalRules.filter((rule) => rule.mode === "ENVIRONMENTAL_HABIT");
}
