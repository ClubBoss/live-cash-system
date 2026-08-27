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
    triggerRu: "На столе появился страддл или изменилась обязательная ставка.",
    triggerEn: "A straddle appears or the forced betting unit changes.",
    defaultRu: "До раздачи переякорь рабочую глубину в новой обязательной единице ставки.",
    defaultEn: "Before the hand, re-anchor working depth to the new forced unit.",
    whyRu: "Номинальные BB могут скрывать, насколько короче стало реальное префлоп-дерево.",
    whyEn: "Nominal big blinds can hide how much shorter the actual preflop tree became.",
    amplifiersRu: ["обязательный страддл", "несколько страддлов", "необычные обязательные ставки"],
    amplifiersEn: ["mandatory straddle", "multiple straddles", "unusual forced bets"],
    reversalsRu: ["если обязательная единица ставки не изменилась, заново проговаривать этот шаг не нужно"],
    reversalsEn: ["if the forced unit did not change, there is no need to rehearse this step"],
    transferCueRu: "Оставь те же деньги в стеках, добавь страддл и спроси, что изменилось первым.",
    transferCueEn: "Keep the same dollar stacks, add a straddle, and ask what changes first.",
  }),
  r({
    id: "RULE-GEO-PAIRWISE",
    mode: "ENVIRONMENTAL_HABIT",
    triggerFamily: "STACK_ASYMMETRY",
    skillIds: ["FND-06"],
    sourceRefs: ["LCM-01"],
    triggerRu: "За столом заметно разные стеки или банк мультивей.",
    triggerEn: "Stacks are materially asymmetric or the pot is multiway.",
    defaultRu: "Сканируй эффективный стек отдельно против каждого реально релевантного соперника, а не ищи одну общую глубину.",
    defaultEn: "Read the pairwise effective stack versus the relevant opponent instead of forcing one table-wide depth.",
    whyRu: "В разных противостояниях в игре находится разная сумма, особенно при возможном сайд-поте.",
    whyEn: "Different confrontations expose different amounts of money, especially with side-pot geometry.",
    amplifiersRu: ["один короткий стек среди глубоких", "риск мультивей-олл-ина", "возможность сайд-пота"],
    amplifiersEn: ["one short stack among deep stacks", "multiway all-in risk", "side-pot potential"],
    reversalsRu: ["хедз-ап и равные стеки — попарное различие не добавляет новой информации"],
    reversalsEn: ["heads-up with equal stacks makes the pairwise distinction redundant"],
    transferCueRu: "Не меняй стек Hero; укороти только одного из двух соперников.",
    transferCueEn: "Keep Hero's stack fixed; shorten only one of two opponents.",
  }),
  r({
    id: "RULE-GEO-POT-COMPRESSION",
    mode: "TRIGGER_RULE",
    triggerFamily: "POT_GEOMETRY",
    skillIds: ["FND-06"],
    sourceRefs: ["LCM-01", "FTGU-E01"],
    triggerRu: "Крупный рейз/колл резко увеличил банк относительно оставшегося стека.",
    triggerEn: "A large raise/call sharply increased the pot relative to the remaining stack.",
    defaultRu: "Перестань мыслить стартовыми BB и заново оцени будущий SPR и леверидж.",
    defaultEn: "Stop thinking in starting-stack big blinds and re-read future SPR/leverage.",
    whyRu: "Глубокий старт может превратиться в короткое постфлоп-дерево после одного крупного префлоп-действия.",
    whyEn: "A deep starting stack can become a short postflop tree after one large preflop action.",
    amplifiersRu: ["сквиз/4-бет", "крупный лайв-сайзинг", "более короткий эффективный соперник"],
    amplifiersEn: ["squeeze/4-bet", "large live sizing", "shorter effective opponent"],
    reversalsRu: ["небольшой банк после одного рейза оставляет много будущего левериджа даже при обычной глубине 100 BB"],
    reversalsEn: ["a small single-raised pot can preserve substantial future leverage even at ordinary 100bb depth"],
    transferCueRu: "Оставь стартовый стек тем же, но удвой сформированный банк.",
    transferCueEn: "Keep the starting stack unchanged but double the pot that reaches postflop.",
  }),
  r({
    id: "RULE-PF-LATE-RFI",
    mode: "TRIGGER_RULE",
    triggerFamily: "POSITION",
    skillIds: ["PF-01"],
    sourceRefs: ["FTGU-E02"],
    triggerRu: "Та же пограничная рука перемещается ближе к BTN.",
    triggerEn: "The same fringe hand moves closer to the button.",
    defaultRu: "Привлекательность открытия обычно растёт: игроков позади меньше, реализация эквити лучше.",
    defaultEn: "Opening attractiveness generally rises: fewer players remain and realization improves.",
    whyRu: "Позиция постепенно расширяет прибыльный диапазон открытия; это не бинарный переключатель «стил / не стил».",
    whyEn: "Position gradually widens the profitable opening region; it is not a binary steal/non-steal switch.",
    amplifiersRu: ["пассивные/слабые игроки позади", "ниже рейк", "большее постфлоп-преимущество"],
    amplifiersEn: ["passive/weak players behind", "lower rake", "better postflop edge"],
    reversalsRu: ["сильные агрессивные игроки позади", "высокий рейк", "диапазон становится плохо защищаемым против 3-бетов"],
    reversalsEn: ["strong aggressive players behind", "high rake", "range becomes poorly defensible versus 3-bets"],
    transferCueRu: "Меняй только позицию HJ → CO → BTN при той же руке.",
    transferCueEn: "Change only position HJ → CO → BTN with the same hand.",
  }),
  r({
    id: "RULE-BB-PRICE",
    mode: "TRIGGER_RULE",
    triggerFamily: "OPEN_SIZE",
    skillIds: ["PF-04", "BL-04"],
    sourceRefs: ["FTGU-E05"],
    triggerRu: "Размер опен-рейза заметно увеличился или уменьшился.",
    triggerEn: "The open size becomes materially larger or smaller.",
    defaultRu: "При большем опен-рейзе первыми уходят пограничные коллы BB; при меньшем сайзинге цена позволяет продолжать с большим числом пограничных рук.",
    defaultEn: "As the open gets larger, marginal BB calls disappear first; a smaller price supports more fringe continues.",
    whyRu: "BB получает скидку и закрывает экшен, но это ценовое преимущество напрямую зависит от сайзинга.",
    whyEn: "The BB receives a discount and closes the action, but that price edge changes directly with sizing.",
    amplifiersRu: ["высокий рейк", "плохая реализация эквити", "сильный исходный диапазон"],
    amplifiersEn: ["high rake", "poor realization", "strong origin range"],
    reversalsRu: ["очень широкий опенер", "хорошая играбельность", "малый сайзинг"],
    reversalsEn: ["very wide opener", "good playability", "small sizing"],
    transferCueRu: "Оставь руку и опенера теми же и меняй только 2.5 BB → 4 BB.",
    transferCueEn: "Keep the hand/opener fixed and change only 2.5bb → 4bb.",
  }),
  r({
    id: "RULE-BB-ORIGIN",
    mode: "TRIGGER_RULE",
    triggerFamily: "ORIGIN_RANGE",
    skillIds: ["PF-04", "BL-01", "BL-02", "BL-03"],
    sourceRefs: ["FTGU-E05"],
    triggerRu: "Опенер меняется с BTN/CO на более раннюю позицию.",
    triggerEn: "The opener moves from BTN/CO to an earlier position.",
    defaultRu: "Пограничная защита BB сжимается: риск доминации и плотность сильных оверпар растут.",
    defaultEn: "Fringe BB defense contracts as domination and strong-overpair density rise.",
    whyRu: "Одинаковая цена не означает одинаковый EV против разных исходных диапазонов.",
    whyEn: "The same price does not imply the same EV against different origin ranges.",
    amplifiersRu: ["тайтовый опенер", "доминируемые разномастные старшие карты", "высокий рейк"],
    amplifiersEn: ["tight opener", "dominated offsuit high cards", "high rake"],
    reversalsRu: ["необычно широкий опенер из ранней позиции", "очень маленький сайзинг"],
    reversalsEn: ["unusually wide early-position opener", "very small sizing"],
    transferCueRu: "Сохрани руку и сайзинг, поменяй только BTN → EP.",
    transferCueEn: "Keep hand and sizing fixed; change only BTN → EP.",
  }),
  r({
    id: "RULE-SB-BEHIND",
    mode: "TRIGGER_RULE",
    triggerFamily: "PLAYERS_BEHIND",
    skillIds: ["PF-05", "BL-05"],
    sourceRefs: ["FTGU-E06"],
    triggerRu: "Hero в SB рассматривает колл, а BB ещё действует.",
    triggerEn: "Hero is in the SB considering a flat while the BB still acts.",
    defaultRu: "Не оценивай колл как закрытый хедз-ап-колл: учти риск сквиза и плохую реализацию эквити OOP.",
    defaultEn: "Do not price the flat as a closed heads-up call: include squeeze risk and poor OOP realization.",
    whyRu: "SB получает меньшую скидку, не закрывает экшен и может потерять всё эквити до флопа.",
    whyEn: "The SB gets a worse discount, does not close the action and can lose all equity before the flop.",
    amplifiersRu: ["агрессивный BB", "капнутый диапазон колла", "доминируемая рука"],
    amplifiersEn: ["aggressive BB", "capped flatting range", "dominated hand"],
    reversalsRu: ["очень пассивный/слабый BB может вернуть часть условных коллов"],
    reversalsEn: ["a very passive/weak BB can restore some conditional flats"],
    transferCueRu: "Оставь опенера и руку, поменяй BB: пассивный → агрессивный.",
    transferCueEn: "Keep opener and hand fixed; change BB passive → aggressive.",
  }),
  r({
    id: "RULE-PF-FOLD-EQUITY",
    mode: "TRIGGER_RULE",
    triggerFamily: "FOLD_EQUITY",
    skillIds: ["PF-02", "PF-06", "PF-09"],
    sourceRefs: ["FTGU-E03", "FTGU-E15"],
    triggerRu: "Соперник/коллеры продолжают слишком широко, и фолд-эквити падает.",
    triggerEn: "Opponent/callers continue too widely and fold equity falls.",
    defaultRu: "Сдвигай агрессивный диапазон к рукам, которые хорошо играют после колла соперника; убирай кандидатов, работающих только как блеф.",
    defaultEn: "Shift the aggressive range toward hands that perform well when called; remove bluff-only candidates.",
    whyRu: "Когда фолдов мало, EV агрессии должен сохраняться в ветке после колла, а не зависеть только от давления.",
    whyEn: "When folds are scarce, aggression must survive the called branch rather than relying only on pressure.",
    amplifiersRu: ["коллер, склонный широко продолжать", "высокая вероятность мультивея", "крупный изолейт всё равно получает колл"],
    amplifiersEn: ["station-like caller", "multiway likelihood", "large isolation raise still getting called"],
    reversalsRu: ["реальные оверфолды", "сильные блокеры", "позиция и хорошая постфлоп-реализация эквити"],
    reversalsEn: ["real overfolds", "strong blockers", "position and good postflop realization"],
    transferCueRu: "Не меняй руку Hero; поменяй тенденцию соперника: от оверфолдов к оверколлам.",
    transferCueEn: "Keep Hero's hand fixed; change opponent from overfolding to overcalling.",
  }),
  r({
    id: "RULE-FLOP-OWNERSHIP",
    mode: "TRIGGER_RULE",
    triggerFamily: "BOARD_OWNERSHIP",
    skillIds: ["W4-BOARD-01", "IP-01", "OOP-01"],
    sourceRefs: ["FTGU-E07", "FTGU-E27"],
    triggerRu: "Флоп заметно лучше попадает в диапазон коллера или нейтрализует оверпары/старшие карты PFR.",
    triggerEn: "The flop interacts materially better with the caller range or neutralizes the PFR's overpairs/high cards.",
    defaultRu: "Не ставь c-bet только по инерции инициативы; выбирай споты избирательнее или используй защищённую стратегию чека.",
    defaultEn: "Do not c-bet from initiative alone; become selective or use a protected checking strategy.",
    whyRu: "Постфлоп-преимущество по диапазону/натсам определяется доской и префлоп-диапазонами, а не тем, кто рейзил последним.",
    whyEn: "Postflop range/nut advantage comes from board × preflop ranges, not from who raised last.",
    amplifiersRu: ["низкая/дровяная/средняя по рангам доска хорошо попадает в диапазон коллера", "PFR OOP", "у коллера сохраняется плотность двух пар/стритов"],
    amplifiersEn: ["low/wet/middling board fits caller", "PFR OOP", "caller retains two-pair/straight density"],
    reversalsRu: ["сухие доски со старшей высокой картой могут сохранять концентрированное преимущество PFR", "небольшая ставка объединённым диапазоном снова может стать привлекательной"],
    reversalsEn: ["high-card dry boards can preserve concentrated PFR advantage", "a small merged range bet can become attractive again"],
    transferCueRu: "Сохрани позиции/диапазоны и поменяй только сухой флоп A-high → связный низкий флоп.",
    transferCueEn: "Keep positions/ranges fixed and change only dry A-high flop → connected low flop.",
  }),
  r({
    id: "RULE-TURN-CAP-RECHECK",
    mode: "TRIGGER_RULE",
    triggerFamily: "RUNOUT_SHIFT",
    skillIds: ["W4-RUNOUT-01"],
    sourceRefs: ["FTGU-E20", "FTGU-E21"],
    triggerRu: "На новой карте тёрна в ранее капнутом диапазоне появляются релевантные две пары/стриты/флеши/топ-пары.",
    triggerEn: "The turn creates relevant two-pair/straight/flush/top-pair regions for a range that was previously capped.",
    defaultRu: "Перепроверь, остался ли диапазон капнутым: преимущество на флопе нельзя автоматически переносить на тёрн.",
    defaultEn: "Recheck the cap; flop ownership cannot be carried to the turn automatically.",
    whyRu: "Последовательность действий фильтрует диапазон, но новая карта может вернуть в него натсовую часть.",
    whyEn: "Action ancestry filters a range, but the new card can restore a nutted region.",
    amplifiersRu: ["закрылся дро", "спаривание доски меняет плотность натсов", "в диапазоне коллера была релевантная одномастная/связанная часть"],
    amplifiersEn: ["draw completes", "pairing changes nut density", "caller had relevant suited/connective region"],
    reversalsRu: ["бланковый тёрн после действительно капнутого колла на флопе часто сохраняет леверидж агрессора"],
    reversalsEn: ["a blank turn after a genuinely capped flop call often preserves the aggressor's leverage"],
    transferCueRu: "Оставь флоп/экшен теми же, сравни бланковый тёрн с тёрном, закрывающим дро.",
    transferCueEn: "Keep flop/action fixed; compare a blank turn with a draw-completing turn.",
  }),
  r({
    id: "RULE-BLOCKER-ROLE",
    mode: "TRIGGER_RULE",
    triggerFamily: "BLOCKER_ROLE",
    skillIds: ["FND-05"],
    sourceRefs: ["FTGU-E13"],
    triggerRu: "Решение зависит от свойства карты Hero как блокера или анблокера.",
    triggerEn: "A decision depends on the blocker/unblocker property of Hero's card.",
    defaultRu: "Сначала назови роль действия — блеф, блеф-кетч или вэлью — и только потом оцени эффект блокировки комбинаций.",
    defaultEn: "Name the action role first — bluff, bluff-catch or value — then evaluate removal.",
    whyRu: "Одна и та же карта может быть хорошим блокером для блефа и плохим для вэлью или блеф-кетча.",
    whyEn: "The same card can be a good blocker for a bluff and a bad one for value or bluff-catching.",
    amplifiersRu: ["узкий диапазон ривера", "очевидные незакрывшиеся дро", "концентрированный вэлью-регион"],
    amplifiersEn: ["narrow river range", "obvious missed draws", "concentrated value region"],
    reversalsRu: ["если линия не содержит соответствующих вэлью- и блеф-комбинаций, сам по себе ярлык «блокер» мало значит"],
    reversalsEn: ["if the line does not contain the relevant value/bluff combos, an abstract blocker label means little"],
    transferCueRu: "Сохрани доску и класс руки, поменяй только роль действия Hero: блеф → блеф-кетч → вэлью.",
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
