import type { PracticalDecision, PracticalDecisionOption } from "./types";

type OptionPatch = Partial<Pick<PracticalDecisionOption, "textRu" | "textEn" | "misconception">>;

function patchOptions(options: PracticalDecisionOption[], patches: Record<string, OptionPatch>): PracticalDecisionOption[] {
  return options.map((option) => patches[option.id] ? { ...option, ...patches[option.id] } : option);
}

export function applyPracticalCrossSkillOverlapRepair(decision: PracticalDecision): PracticalDecision {
  if (decision.id === "PM-BL-05-101") return {
    ...decision,
    assumptions: ["PF-05 baseline already taught", "SB faces open", "BB still acts", "BB squeeze tendency is material"],
    cueRu: "База PF-05 уже известна. SB рассматривает flat против open, а BB позади может squeeze.",
    cueEn: "PF-05 baseline is already known. SB considers a flat versus an open while the BB behind can squeeze.",
    questionRu: "Какую переменную теперь нужно оценить, прежде чем вернуть conditional flat?",
    questionEn: "Which variable must now be evaluated before restoring a conditional flat?",
    actionOptions: patchOptions(decision.actionOptions, {
      a: { textRu: "Частоту squeeze BB и цену незакрытого action", textEn: "BB squeeze frequency and the cost of action not being closed" },
      b: { textRu: "Только абсолютную силу руки SB", textEn: "Only the SB hand's absolute strength", misconception: "BB_BEHIND_IGNORED" },
      c: { textRu: "Только уже поставленный small blind", textEn: "Only the small blind already posted", misconception: "BLIND_AMOUNT_ONLY" },
    }),
    reasonOptions: patchOptions(decision.reasonOptions, {
      r1: { textRu: "Падение squeeze risk может вернуть часть flats, но позиционный минус остаётся", textEn: "Lower squeeze risk can restore some flats, while the positional cost remains" },
      r2: { textRu: "BB behind не влияет на EV flat", textEn: "The BB behind does not affect flat EV", misconception: "BB_BEHIND_IGNORED" },
      r3: { textRu: "Passive BB делает SB игроком в позиции", textEn: "A passive BB makes the SB in position", misconception: "POSITION_FALSE" },
    }),
    explanationRu: "Это не повтор базового PF-05: здесь проверяется exception variable. FTGU-E06 допускает часть conditional flats, когда BB позади слабый/пассивный и squeeze risk существенно ниже.",
    explanationEn: "This is not a repeat of baseline PF-05: it tests the exception variable. FTGU-E06 allows some conditional flats when the BB behind is weak/passive and squeeze risk is materially lower.",
  };

  if (decision.id === "PM-BL-05-102") return {
    ...decision,
    assumptions: ["PF-05 baseline already taught", "same SB hand", "same opener", "BB tendency changes"],
    cueRu: "Та же SB hand и тот же opener. Меняется только BB позади: aggressive squeezer → weak/passive.",
    cueEn: "Same SB hand and same opener. Only the BB behind changes: aggressive squeezer → weak/passive.",
    questionRu: "Какой сдвиг должен произойти первым?",
    questionEn: "Which shift should happen first?",
    actionOptions: patchOptions(decision.actionOptions, {
      a: { textRu: "Некоторые conditional flats становятся жизнеспособнее", textEn: "Some conditional flats become more viable" },
      b: { textRu: "SB получает postflop position", textEn: "SB gains postflop position", misconception: "POSITION_FALSE" },
      c: { textRu: "3-bet теперь гарантирует fold opener", textEn: "A 3-bet now guarantees the opener folds", misconception: "FOLD_GUARANTEE" },
    }),
    reasonOptions: patchOptions(decision.reasonOptions, {
      r1: { textRu: "Один из главных штрафов flat — squeeze exposure — стал меньше", textEn: "One major flatting penalty — squeeze exposure — has fallen" },
      r2: { textRu: "Слабый BB squeezes чаще", textEn: "A weak BB squeezes more often", misconception: "PLAYER_TYPE_BACKWARDS" },
      r3: { textRu: "Table behind не участвует в решении SB", textEn: "The table behind is irrelevant to the SB decision", misconception: "BB_BEHIND_IGNORED" },
    }),
    explanationRu: "BL-05 теперь является transfer после PF-05: задача не заново выучить, почему SB неудобен, а распознать, когда изменившийся BB behind реально меняет ветку.",
    explanationEn: "BL-05 is now transfer after PF-05: the task is not to relearn why the SB is awkward, but to recognize when a changed BB-behind condition materially changes the branch.",
  };

  if (decision.id === "PM-BL-05-103") return {
    ...decision,
    assumptions: ["PF-05 baseline already taught", "BB weak/passive", "versatile SB hand", "opener range still contains weaker hands"],
    cueRu: "BB позади почти не squeezes, а versatile SB hand выигрывает от сохранения weaker opener range.",
    cueEn: "The BB behind almost never squeezes, and a versatile SB hand benefits from keeping the opener's weaker range in.",
    questionRu: "Какой branch можно вернуть в рассмотрение?",
    questionEn: "Which branch can return to consideration?",
    actionOptions: patchOptions(decision.actionOptions, {
      a: { textRu: "Conditional flat", textEn: "Conditional flat" },
      b: { textRu: "Обязательный 3-bet", textEn: "Mandatory 3-bet", misconception: "THREE_BET_OR_FOLD_LITERAL" },
      c: { textRu: "Обязательный fold", textEn: "Mandatory fold", misconception: "DEFAULT_AS_LAW" },
    }),
    reasonOptions: patchOptions(decision.reasonOptions, {
      r1: { textRu: "Squeeze risk резко ниже, а flat может сохранять более слабые руки opener", textEn: "Squeeze risk is much lower and flatting can keep weaker opener hands in" },
      r2: { textRu: "Любой passive BB делает flat обязательным", textEn: "Any passive BB makes flatting mandatory", misconception: "PLAYER_TYPE_ABSOLUTE" },
      r3: { textRu: "Conditional flat не зависит от hand class", textEn: "A conditional flat does not depend on hand class", misconception: "HAND_CLASS_IGNORED" },
    }),
    explanationRu: "Source default остаётся 3-bet-or-fold, но это не literal law. BL-05 тренирует именно contextual exceptions после того, как PF-05 уже дал базовую модель.",
    explanationEn: "The source default remains 3-bet-or-fold, but it is not a literal law. BL-05 specifically trains contextual exceptions after PF-05 established the baseline model.",
  };

  if (decision.id === "PM-BL-05-104") return {
    ...decision,
    assumptions: ["PF-05 baseline already taught", "BB aggressive", "SB suited wheel ace", "fold equity meaningful", "called branch playable"],
    cueRu: "BB позади агрессивен. У SB suited wheel ace: blocker создаёт fold equity, а suitedness сохраняет called-branch playability.",
    cueEn: "The BB behind is aggressive. SB holds a suited wheel ace: the blocker creates fold equity and suitedness preserves called-branch playability.",
    questionRu: "Какой branch лучше решает проблему players behind?",
    questionEn: "Which branch better addresses the players-behind problem?",
    actionOptions: patchOptions(decision.actionOptions, {
      a: { textRu: "3-bet candidate", textEn: "3-bet candidate" },
      b: { textRu: "Automatic flat", textEn: "Automatic flat", misconception: "FLAT_AUTOPILOT" },
      c: { textRu: "Automatic fold", textEn: "Automatic fold", misconception: "BLOCKER_IGNORED" },
    }),
    reasonOptions: patchOptions(decision.reasonOptions, {
      r1: { textRu: "3-bet может убрать BB branch, получить folds и всё ещё иметь playability when called", textEn: "The 3-bet can remove the BB branch, generate folds, and still retain playability when called" },
      r2: { textRu: "Blocker гарантирует fold", textEn: "The blocker guarantees a fold", misconception: "BLOCKER_GUARANTEE" },
      r3: { textRu: "Suited hand не может быть dominated", textEn: "A suited hand cannot be dominated", misconception: "DOMINATION_FALSE" },
    }),
    explanationRu: "Вместо повтора 'SB flat плох' этот node сравнивает exception logic: когда BB aggressive, 3-bet candidate должен одновременно использовать removal и выдерживать called branch.",
    explanationEn: "Instead of repeating 'SB flats are bad,' this node tests exception logic: with an aggressive BB behind, a 3-bet candidate should exploit removal and survive the called branch.",
  };

  if (decision.id === "PM-BL-05-105") return {
    ...decision,
    assumptions: ["PF-05 baseline already taught", "BB aggressive", "SB dominated offsuit broadway", "opener continues tightly versus 3-bet"],
    cueRu: "Flat страдает от aggressive BB, но dominated offsuit broadway после 3-bet часто получает action от более сильного concentrated range.",
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
    explanationRu: "Это boundary между PF-05 default и BL-05 transfer: если flat плох, это ещё не превращает любой 3-bet в хорошую ветку; fold остаётся допустимым результатом.",
    explanationEn: "This is the boundary between the PF-05 default and BL-05 transfer: a bad flat does not make every 3-bet a good branch; folding remains a valid outcome.",
  };

  if (decision.id === "PM-MW-04-001") return {
    ...decision,
    assumptions: ["PF-02 baseline already taught", "multiple sticky limpers", "little fold equity", "likely multiway", "implied-odds hand"],
    cueRu: "PF-02 уже изучен. Теперь перед Hero несколько sticky limpers: большой iso почти не создаёт folds, и банк всё равно часто останется multiway.",
    cueEn: "PF-02 is already learned. Now Hero faces several sticky limpers: a large isolation raise creates almost no folds and the pot will still often remain multiway.",
    questionRu: "Что меняется по сравнению с базовым one-limper iso spot?",
    questionEn: "What changes compared with the baseline one-limper isolation spot?",
    actionOptions: patchOptions(decision.actionOptions, {
      a: { textRu: "Чаще сравнивать overlimp/fold с дорогим iso", textEn: "More often compare overlimp/fold with an expensive isolation raise" },
      b: { textRu: "Всегда увеличивать iso size до heads-up", textEn: "Always increase the isolation size until the pot is heads-up", misconception: "ISO_SIZE_ESCALATION" },
      c: { textRu: "Любая playable hand обязана raise", textEn: "Every playable hand must raise", misconception: "ISO_AUTOPILOT" },
    }),
    reasonOptions: patchOptions(decision.reasonOptions, {
      r1: { textRu: "Когда folds почти нет и multiway сохраняется, меньшая инвестиция лучше сохраняет implied-odds branch", textEn: "When folds are scarce and the pot stays multiway, the smaller investment better preserves the implied-odds branch" },
      r2: { textRu: "Большой size гарантирует изоляцию", textEn: "A large size guarantees isolation", misconception: "ISO_GUARANTEE" },
      r3: { textRu: "Multiway сам по себе делает overlimp -EV", textEn: "Multiway play by itself makes overlimping negative EV", misconception: "OVERLIMP_ALWAYS_BAD" },
    }),
    explanationRu: "MW-04 больше не повторяет базовый выбор PF-02. Он проверяет transfer: что делать, когда несколько липких limpers делают heads-up isolation малореалистичной и меняют цену ветки.",
    explanationEn: "MW-04 no longer reteaches the baseline PF-02 choice. It tests transfer: what to do when several sticky limpers make heads-up isolation unlikely and change the branch price.",
  };

  return decision;
}
