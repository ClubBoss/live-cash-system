import type { PracticalDecision, PracticalDecisionOption } from "./types";

type OptionPatch = Partial<Pick<PracticalDecisionOption, "textRu" | "textEn" | "misconception">>;

function patchOptions(options: PracticalDecisionOption[], patches: Record<string, OptionPatch>): PracticalDecisionOption[] {
  return options.map((option) => patches[option.id] ? { ...option, ...patches[option.id] } : option);
}

export function applyPracticalCrossSkillOverlapRepair(decision: PracticalDecision): PracticalDecision {
  if (decision.id === "PM-BL-05-101") return {
    ...decision,
    assumptions: ["PF-05 baseline already taught", "SB faces open", "BB still acts", "BB squeeze tendency is material"],
    cueRu: "SB рассматривает колл против открытия, а BB позади ещё может сделать сквиз.",
    cueEn: "PF-05 baseline is already known. SB considers a flat versus an open while the BB behind can squeeze.",
    questionRu: "Какую переменную нужно оценить, прежде чем вернуть колл в допустимую ветку?",
    questionEn: "Which variable must now be evaluated before restoring a conditional flat?",
    actionOptions: patchOptions(decision.actionOptions, {
      a: { textRu: "Частоту сквиза BB и цену незакрытой торговли", textEn: "BB squeeze frequency and the cost of action not being closed" },
      b: { textRu: "Только абсолютную силу руки SB", textEn: "Only the SB hand's absolute strength", misconception: "BB_BEHIND_IGNORED" },
      c: { textRu: "Только уже поставленный малый блайнд", textEn: "Only the small blind already posted", misconception: "BLIND_AMOUNT_ONLY" },
    }),
    reasonOptions: patchOptions(decision.reasonOptions, {
      r1: { textRu: "Снижение риска сквиза может вернуть часть коллов, но позиционный минус остаётся", textEn: "Lower squeeze risk can restore some flats, while the positional cost remains" },
      r2: { textRu: "Игрок в BB позади не влияет на EV колла", textEn: "The BB behind does not affect flat EV", misconception: "BB_BEHIND_IGNORED" },
      r3: { textRu: "Пассивный BB делает SB игроком в позиции", textEn: "A passive BB makes the SB in position", misconception: "POSITION_FALSE" },
    }),
    explanationRu: "Здесь проверяется исключение из базовой модели: часть коллов возвращается, когда BB слабый или пассивный и риск сквиза существенно ниже.",
    explanationEn: "This is not a repeat of baseline PF-05: it tests the exception variable. FTGU-E06 allows some conditional flats when the BB behind is weak/passive and squeeze risk is materially lower.",
  };

  if (decision.id === "PM-BL-05-102") return {
    ...decision,
    assumptions: ["PF-05 baseline already taught", "same SB hand", "same opener", "BB tendency changes"],
    cueRu: "Та же рука на SB и тот же открывшийся игрок. Меняется только BB позади: из агрессивного становится слабым и пассивным.",
    cueEn: "Same SB hand and same opener. Only the BB behind changes: aggressive squeezer → weak/passive.",
    questionRu: "Какой сдвиг должен произойти первым?",
    questionEn: "Which shift should happen first?",
    actionOptions: patchOptions(decision.actionOptions, {
      a: { textRu: "Некоторые условные коллы становятся жизнеспособнее", textEn: "Some conditional flats become more viable" },
      b: { textRu: "SB получает позицию постфлоп", textEn: "SB gains postflop position", misconception: "POSITION_FALSE" },
      c: { textRu: "3-бет теперь гарантирует фолд открывшегося игрока", textEn: "A 3-bet now guarantees the opener folds", misconception: "FOLD_GUARANTEE" },
    }),
    reasonOptions: patchOptions(decision.reasonOptions, {
      r1: { textRu: "Один из главных штрафов колла — риск сквиза — стал меньше", textEn: "One major flatting penalty — squeeze exposure — has fallen" },
      r2: { textRu: "Слабый BB сквизит чаще", textEn: "A weak BB squeezes more often", misconception: "PLAYER_TYPE_BACKWARDS" },
      r3: { textRu: "Игроки позади не участвуют в решении SB", textEn: "The table behind is irrelevant to the SB decision", misconception: "BB_BEHIND_IGNORED" },
    }),
    explanationRu: "Задача не заново выучить, почему SB неудобен, а распознать, когда изменившийся BB позади действительно меняет ветку.",
    explanationEn: "BL-05 is now transfer after PF-05: the task is not to relearn why the SB is awkward, but to recognize when a changed BB-behind condition materially changes the branch.",
  };

  if (decision.id === "PM-BL-05-103") return {
    ...decision,
    assumptions: ["PF-05 baseline already taught", "BB weak/passive", "versatile SB hand", "opener range still contains weaker hands"],
    cueRu: "BB позади почти не сквизит, а руке SB выгодно оставить в диапазоне открывшегося игрока более слабые руки.",
    cueEn: "The BB behind almost never squeezes, and a versatile SB hand benefits from keeping the opener's weaker range in.",
    questionRu: "Какую ветку можно вернуть в рассмотрение?",
    questionEn: "Which branch can return to consideration?",
    actionOptions: patchOptions(decision.actionOptions, {
      a: { textRu: "Условный колл", textEn: "Conditional flat" },
      b: { textRu: "Обязательный 3-бет", textEn: "Mandatory 3-bet", misconception: "THREE_BET_OR_FOLD_LITERAL" },
      c: { textRu: "Обязательный фолд", textEn: "Mandatory fold", misconception: "DEFAULT_AS_LAW" },
    }),
    reasonOptions: patchOptions(decision.reasonOptions, {
      r1: { textRu: "Риск сквиза резко ниже, а колл может оставить в игре более слабые руки открывшегося игрока", textEn: "Squeeze risk is much lower and flatting can keep weaker opener hands in" },
      r2: { textRu: "Любой пассивный BB делает колл обязательным", textEn: "Any passive BB makes flatting mandatory", misconception: "PLAYER_TYPE_ABSOLUTE" },
      r3: { textRu: "Условный колл не зависит от типа руки", textEn: "A conditional flat does not depend on hand class", misconception: "HAND_CLASS_IGNORED" },
    }),
    explanationRu: "Базовая линия остаётся 3-bet-or-fold, но это не абсолютный закон: при слабом или пассивном BB некоторые коллы снова становятся допустимыми.",
    explanationEn: "The source default remains 3-bet-or-fold, but it is not a literal law. BL-05 specifically trains contextual exceptions after PF-05 established the baseline model.",
  };

  if (decision.id === "PM-BL-05-104") return {
    ...decision,
    assumptions: ["PF-05 baseline already taught", "BB aggressive", "SB suited wheel ace", "fold equity meaningful", "called branch playable"],
    cueRu: "BB позади агрессивен. У SB мастевой младший туз: туз блокирует часть сильных продолжений, а масть сохраняет играбельность после колла.",
    cueEn: "The BB behind is aggressive. SB holds a suited wheel ace: the blocker creates fold equity and suitedness preserves called-branch playability.",
    questionRu: "Какая ветка лучше решает проблему игрока позади?",
    questionEn: "Which branch better addresses the players-behind problem?",
    actionOptions: patchOptions(decision.actionOptions, {
      a: { textRu: "Кандидат на 3-бет", textEn: "3-bet candidate" },
      b: { textRu: "Автоматический колл", textEn: "Automatic flat", misconception: "FLAT_AUTOPILOT" },
      c: { textRu: "Автоматический фолд", textEn: "Automatic fold", misconception: "BLOCKER_IGNORED" },
    }),
    reasonOptions: patchOptions(decision.reasonOptions, {
      r1: { textRu: "3-bet может убрать ветку с участием BB, получить фолды и сохранить играбельность после колла", textEn: "The 3-bet can remove the BB branch, generate folds, and still retain playability when called" },
      r2: { textRu: "Блокер гарантирует фолд", textEn: "The blocker guarantees a fold", misconception: "BLOCKER_GUARANTEE" },
      r3: { textRu: "Мастевая рука не может быть доминирована", textEn: "A suited hand cannot be dominated", misconception: "DOMINATION_FALSE" },
    }),
    explanationRu: "Вместо повтора «колл с SB плох» здесь проверяется исключение: против агрессивного BB кандидат на 3-бет должен одновременно использовать эффект блокера и сохранять приемлемую игру после колла.",
    explanationEn: "Instead of repeating 'SB flats are bad,' this node tests exception logic: with an aggressive BB behind, a 3-bet candidate should exploit removal and survive the called branch.",
  };

  if (decision.id === "PM-BL-05-105") return {
    ...decision,
    assumptions: ["PF-05 baseline already taught", "BB aggressive", "SB dominated offsuit broadway", "opener continues tightly versus 3-bet"],
    cueRu: "Доминируемая разномастная бродвейная рука SB; 3-бет коллируют концентрированным диапазоном более сильных бродвеев.",
    cueEn: "Flatting suffers against an aggressive BB, but a dominated offsuit broadway that 3-bets often gets action from a stronger concentrated range.",
    questionRu: "Как оценить решение, если и flat, и called 3-bet branch проблемны?",
    questionEn: "How should the decision be evaluated when both the flat and the called 3-bet branch are problematic?",
    actionOptions: patchOptions(decision.actionOptions, {
      a: { textRu: "Сравнить EV 3-бета при колле и допустить fold", textEn: "Compare the called-branch EV of the 3-bet and allow folding" },
      b: { textRu: "Форсировать 3-bet только потому, что flat слабый", textEn: "Force a 3-bet only because flatting is weak", misconception: "THREE_BET_OR_FOLD_LITERAL" },
      c: { textRu: "Игнорировать фильтрацию continue range", textEn: "Ignore filtering of the continuing range", misconception: "FILTERING_IGNORED" },
    }),
    reasonOptions: patchOptions(decision.reasonOptions, {
      r1: { textRu: "Плохой flat сам по себе не делает dominated 3-bet прибыльным", textEn: "A bad flat alone does not make a dominated 3-bet profitable" },
      r2: { textRu: "Агрессия сама по себе создаёт +EV", textEn: "Aggression alone creates positive EV", misconception: "AGGRESSION_AUTOPILOT" },
      r3: { textRu: "После 3-bet continue range становится слабее по определению", textEn: "After a 3-bet the continuing range becomes weaker by definition", misconception: "FILTERING_BACKWARDS" },
    }),
    explanationRu: "Нельзя превращать вывод «колл непривлекателен» в вывод «поэтому нужен 3-бет»: если ветка после колла соперника плоха, фолд остаётся допустимым результатом.",
    explanationEn: "This is the boundary between the PF-05 default and BL-05 transfer: a bad flat does not make every 3-bet a good branch; folding remains a valid outcome.",
  };

  if (decision.id === "PM-MW-04-001") return {
    ...decision,
    assumptions: ["PF-02 baseline already taught", "multiple sticky limpers", "little fold equity", "likely multiway", "implied-odds hand"],
    cueRu: "Перед Hero несколько липких лимперов: крупный изолирующий рейз почти не создаёт фолдов, и банк всё равно часто останется мультивей.",
    cueEn: "PF-02 is already learned. Now Hero faces several sticky limpers: a large isolation raise creates almost no folds and the pot will still often remain multiway.",
    questionRu: "Что меняется по сравнению с базовой ситуацией против одного лимпера?",
    questionEn: "What changes compared with the baseline one-limper isolation spot?",
    actionOptions: patchOptions(decision.actionOptions, {
      a: { textRu: "Чаще сравнивать оверлимп или фолд с дорогим изолирующим рейзом", textEn: "More often compare overlimp/fold with an expensive isolation raise" },
      b: { textRu: "Всегда увеличивать размер изолирующего рейза до игры один на один", textEn: "Always increase the isolation size until the pot is heads-up", misconception: "ISO_SIZE_ESCALATION" },
      c: { textRu: "Любая играбельная рука обязана рейзить", textEn: "Every playable hand must raise", misconception: "ISO_AUTOPILOT" },
    }),
    reasonOptions: patchOptions(decision.reasonOptions, {
      r1: { textRu: "Когда фолдов почти нет и мультивей сохраняется, меньшая инвестиция лучше сохраняет ветку с хорошими implied odds", textEn: "When folds are scarce and the pot stays multiway, the smaller investment better preserves the implied-odds branch" },
      r2: { textRu: "Большой размер гарантирует изоляцию", textEn: "A large size guarantees isolation", misconception: "ISO_GUARANTEE" },
      r3: { textRu: "Мультивей сам по себе делает оверлимп убыточным", textEn: "Multiway play by itself makes overlimping negative EV", misconception: "OVERLIMP_ALWAYS_BAD" },
    }),
    explanationRu: "Здесь проверяется перенос базовой модели: несколько липких лимперов делают изоляцию один на один малореалистичной и меняют цену ветки.",
    explanationEn: "MW-04 no longer reteaches the baseline PF-02 choice. It tests transfer: what to do when several sticky limpers make heads-up isolation unlikely and change the branch price.",
  };

  return decision;
}
