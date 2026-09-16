import type { PracticalDecision, PracticalDecisionOption } from "./types";

type OptionRepair = Pick<PracticalDecisionOption, "textRu" | "textEn"> & { misconception?: string };

type DecisionRepair = {
  questionRu: string;
  questionEn: string;
  actionOptions: Record<string, OptionRepair>;
  reasonOptions?: Record<string, OptionRepair>;
};

const generatedReasonRepairs: Record<string, Pick<PracticalDecisionOption, "textRu" | "textEn">> = {
  HISTORY_IGNORED: {
    textRu: "Текущая цена и сила руки важнее ancestry, поэтому прошлую линию можно считать вторичной",
    textEn: "Current price and hand strength matter more than ancestry, so prior action can be treated as secondary",
  },
  GEOMETRY_IGNORED: {
    textRu: "Класс руки Hero задаёт решение, а глубина, число игроков и relative position — лишь небольшие поправки",
    textEn: "Hero's hand class drives the decision; depth, player count, and relative position are only minor adjustments",
  },
  ARCHETYPE_AS_EVIDENCE: {
    textRu: "Если наблюдение совпадает с типом игрока, переносить рид на соседние ветки до обратных данных",
    textEn: "If the observation fits a player type, carry the read into nearby branches until contrary evidence appears",
  },
};

type LocalizedReason = Pick<PracticalDecisionOption, "textRu" | "textEn">;

const skillReasonRepairs: Record<string, Partial<Record<PracticalDecision["kind"], LocalizedReason>>> = {
  "FND-04": {
    recognition: { textRu: "Качество аута зависит от того, даёт ли улучшение лучшую руку против range", textEn: "Out quality depends on whether the improvement wins against the opponent range" },
    decision: { textRu: "Чистые ауты считаются полностью, а dirty outs требуют дисконта", textEn: "Count clean outs fully and discount cards that often improve into a losing hand" },
    changed: { textRu: "Более сильный opponent range превращает часть apparent outs в dirty outs", textEn: "A stronger opponent range turns some apparent outs into dirty outs" },
    boundary: { textRu: "Карта, улучшающая Hero, не становится clean out автоматически", textEn: "A card that improves Hero is not automatically a clean out" },
  },
  "FND-06": {
    recognition: { textRu: "Эффективный стек вместе с банком задаёт SPR и доступное будущее давление", textEn: "Effective stack and pot size jointly set SPR and future leverage" },
    decision: { textRu: "Сравни оставшийся эффективный стек с банком, а не с номинальным buy-in", textEn: "Compare the remaining effective stack with the pot, not the nominal buy-in" },
    changed: { textRu: "Изменение банка или effective stack меняет SPR и глубину будущего дерева", textEn: "Changing the pot or effective stack changes SPR and the depth of the future tree" },
    boundary: { textRu: "Номинальные BB не заменяют пересчёт effective stack и SPR в текущей ветке", textEn: "Headline BB depth does not replace recomputing effective stack and SPR in the current branch" },
  },
  "PF-01": {
    recognition: { textRu: "Позиция меняет число игроков позади, steal EV и будущую реализацию", textEn: "Position changes players behind, steal EV, and future realization" },
    decision: { textRu: "RFI EV зависит от позиции, rake и игроков позади, а не только от карт", textEn: "RFI EV depends on position, rake, and players behind, not cards alone" },
    changed: { textRu: "Сдвиг rake или давления позади двигает EV пограничных opens", textEn: "Changes in rake or pressure behind move the EV of fringe opens" },
    boundary: { textRu: "Чарт — baseline; table context может сдвинуть пограничную часть", textEn: "A chart is a baseline; table context can move the fringe" },
  },
  "PF-02": {
    recognition: { textRu: "Limp-ветку оценивают через fold equity, позицию и риск multiway", textEn: "A limp branch depends on fold equity, position, and multiway risk" },
    decision: { textRu: "Iso, overlimp и fold сравниваются по EV после folds и calls", textEn: "Compare isolate, overlimp, and fold through their fold and called branches" },
    changed: { textRu: "Изменение реакции limpers меняет EV iso и overlimp по-разному", textEn: "Changing limper responses moves isolate and overlimp EV differently" },
    boundary: { textRu: "Playable hand не делает isolation автоматическим без прибыльной called branch", textEn: "A playable hand does not force isolation without a profitable called branch" },
  },
  "PF-04": {
    recognition: { textRu: "BB defense задают цена, origin range, closing action и realization", textEn: "BB defense depends on price, origin range, closing action, and realization" },
    decision: { textRu: "Колл из BB сравнивается с fold по текущей цене и realizable equity", textEn: "Compare a BB call with folding through current price and realizable equity" },
    changed: { textRu: "Изменение sizing или origin range меняет требуемую реализацию и fringe", textEn: "Changing sizing or origin range moves required realization and the defense fringe" },
    boundary: { textRu: "Closing action помогает, но не гарантирует прибыльную защиту любой руки", textEn: "Closing the action helps but does not make every hand a profitable defense" },
  },
  "PF-06": {
    recognition: { textRu: "Shape 3-bet зависит от fold equity и качества ветки после call", textEn: "3-bet shape depends on fold equity and the quality of the called branch" },
    decision: { textRu: "3-bet выбирают по fold branch и when-called EV, не по одному blocker", textEn: "Choose a 3-bet through fold-branch and when-called EV, not one blocker alone" },
    changed: { textRu: "Сдвиг fold equity или call range меняет linear/polar incentives", textEn: "Changes in fold equity or the calling range move linear and polar incentives" },
    boundary: { textRu: "Слабый call сам по себе не делает 3-bet прибыльным", textEn: "A weak call option does not by itself make a 3-bet profitable" },
  },
  "PF-07": {
    recognition: { textRu: "Defense vs 3-bet зависит от size, position и структуры диапазонов", textEn: "Defense versus a 3-bet depends on size, position, and range structure" },
    decision: { textRu: "Fold, call и 4-bet сравнивают по текущей цене и EV оставшихся веток", textEn: "Compare fold, call, and 4-bet through current price and remaining-branch EV" },
    changed: { textRu: "Изменение size или position сдвигает fringe defense", textEn: "Changing size or position moves the defense fringe" },
    boundary: { textRu: "Ballpark частота не переопределяет evidence о реальном 3-bet range", textEn: "A ballpark frequency does not override evidence about the actual 3-bet range" },
  },
  "PF-08": {
    recognition: { textRu: "4-bet bluff EV требует fold equity, blocker value и учёта будущей ветки", textEn: "4-bet bluff EV needs fold equity, blocker value, and future-branch consequences" },
    decision: { textRu: "Value/bluff branch выбирают по continue range соперника и stack consequences", textEn: "Choose the value or bluff branch from the opponent continuing range and stack consequences" },
    changed: { textRu: "Сдвиг fold equity или continue range меняет стимулы к bluff 4-bet", textEn: "A shift in fold equity or continuing range changes bluff 4-bet incentives" },
    boundary: { textRu: "Blocker помогает выбору, но сам не делает bluff прибыльным", textEn: "A blocker helps selection but does not make a bluff profitable by itself" },
  },
  "PF-10": {
    recognition: { textRu: "Live preflop branch зависит от rake, depth, sizing, caller pool и straddle geometry", textEn: "A live preflop branch depends on rake, depth, sizing, caller pool, and straddle geometry" },
    decision: { textRu: "Пересчитай ветку, когда rake, depth, open size или caller pool меняются materially", textEn: "Recompute the branch when rake, depth, open size, or caller pool changes materially" },
    changed: { textRu: "Изменение working depth или rake двигает EV пограничных preflop actions", textEn: "Changing working depth or rake moves the EV of marginal preflop actions" },
    boundary: { textRu: "Nominal BB или seat label не сохраняют ту же ветку после straddle", textEn: "Nominal BB depth or a seat label does not preserve the same branch after a straddle" },
  },
  "BL-03": {
    recognition: { textRu: "Wide BTN range и цена расширяют BB defense, но не отменяют realization", textEn: "A wide BTN range and price widen BB defense but do not remove realization costs" },
    decision: { textRu: "BB defend зависит от BTN range, sizing, rake и playability", textEn: "BB defense depends on BTN range, sizing, rake, and playability" },
    changed: { textRu: "Больший open или tighter BTN range сужают marginal defense", textEn: "A larger open or tighter BTN range contracts marginal defense" },
    boundary: { textRu: "Seat BTN не заменяет evidence о фактической ширине opening range", textEn: "The BTN seat label does not replace evidence about the actual opening range" },
  },
  "BL-06": {
    recognition: { textRu: "SB first-in branch зависит от структуры диапазонов и ответа BB, а не от одной universal action", textEn: "The SB first-in branch depends on range structure and BB response, not one universal action" },
    decision: { textRu: "Raise, limp и fold выбирают из source-supported branch с учётом ответа BB", textEn: "Choose raise, limp, or fold from the source-supported branch and BB response" },
    changed: { textRu: "Изменение ответа BB или sizing сдвигает SB first-in branch", textEn: "Changing BB response or sizing moves the SB first-in branch" },
    boundary: { textRu: "Без source support нельзя превращать SB first-in в одну universal frequency", textEn: "Without source support, SB first-in should not become one universal frequency" },
  },
  "BL-07": {
    recognition: { textRu: "BB против SB получает цену, closing action и postflop position", textEn: "BB versus SB gets price, closing action, and postflop position" },
    decision: { textRu: "Call/3-bet split зависит от price, sizing и свойств руки, а не копии другого BB node", textEn: "The call or 3-bet split depends on price, sizing, and hand properties, not another BB node" },
    changed: { textRu: "Больший SB sizing сужает слабый defend и меняет 3-bet incentives", textEn: "A larger SB size contracts weak defense and changes 3-bet incentives" },
    boundary: { textRu: "BB-vs-SB нельзя копировать из BB-vs-EP/BTN: origin и postflop position другие", textEn: "BB-versus-SB cannot copy BB-versus-EP or BTN because origin and postflop position differ" },
  },
  "BL-09": {
    recognition: { textRu: "После aggression продолжение строится от уже отфильтрованных blind-vs-blind ranges", textEn: "After aggression, continue from the already filtered blind-versus-blind ranges" },
    decision: { textRu: "Ответ зависит от предыдущего raise/3-bet, sizing и сохранившихся диапазонов", textEn: "The response depends on prior raise or 3-bet, sizing, and surviving ranges" },
    changed: { textRu: "Изменение sizing или истории aggression меняет continue range и ответ", textEn: "Changing sizing or aggression history changes the continuing range and response" },
    boundary: { textRu: "Широкий first-in range не означает широкое продолжение после aggression", textEn: "A wide first-in range does not imply wide continuation after aggression" },
  },
  "W4-BOARD-01": {
    recognition: { textRu: "Board class задают connectivity, suits, pairing и распределение high cards", textEn: "Board class comes from connectivity, suits, pairing, and high-card distribution" },
    decision: { textRu: "Сначала классифицируй texture; absolute hand rank сам не выбирает action", textEn: "Classify the texture first; absolute hand rank does not choose the action alone" },
    changed: { textRu: "Изменение rank или suit может сдвинуть connectivity, nut и coverage class", textEn: "Changing one rank or suit can shift connectivity, nut, and coverage class" },
    boundary: { textRu: "Ярлык dry/wet полезен только когда отражает range-relevant структуру", textEn: "A dry or wet label matters only when it captures range-relevant structure" },
  },
  "TURN-02": {
    recognition: { textRu: "Turn barrel зависит от runout, surviving ranges и класса руки Hero", textEn: "A turn barrel depends on the runout, surviving ranges, and Hero's hand class" },
    decision: { textRu: "Продолжай только когда value/bluff class и runout поддерживают давление", textEn: "Continue only when the value or bluff class and runout support pressure" },
    changed: { textRu: "Runout или range shift меняют leverage и набор подходящих barrels", textEn: "A runout or range shift changes leverage and which hands should barrel" },
    boundary: { textRu: "Flop bet не обязывает продолжать barrel на turn", textEn: "A flop bet does not obligate a turn barrel" },
  },
  "RIV-03": {
    recognition: { textRu: "Bluff-catch зависит от price, credible bluffs после линии и removal", textEn: "A bluff-catch depends on price, credible bluffs after the line, and removal" },
    decision: { textRu: "Call нужен только когда surviving bluff supply достаточен для текущей цены", textEn: "Call only when surviving bluff supply is sufficient for the current price" },
    changed: { textRu: "Line ancestry или removal меняют bluff supply даже при той же цене", textEn: "Line ancestry or removal changes bluff supply even at the same price" },
    boundary: { textRu: "Хорошая цена сама не заставляет call без достаточных credible bluffs", textEn: "A good price alone does not force a call without enough credible bluffs" },
  },
};

const generatedCorrectReasonByCluster: Record<string, Pick<PracticalDecisionOption, "textRu" | "textEn">> = {
  A8: {
    textRu: "Текущий узел зависит от ancestry, сохранившихся диапазонов и цены, а не только от ярлыка ситуации",
    textEn: "The current node depends on ancestry, surviving ranges, and price rather than the situation label alone",
  },
  A9: {
    textRu: "Live-геометрия меняет доступные ветки и их EV, даже когда карты Hero остаются теми же",
    textEn: "Live geometry changes the available branches and their EV even when Hero's cards stay the same",
  },
  A10: {
    textRu: "Exploit должен быть привязан к конкретной ветке и силе повторяющихся наблюдений",
    textEn: "An exploit should stay scoped to the exact branch and the strength of repeated evidence",
  },
};

function applyGeneratedReasonRepairs(decision: PracticalDecision): PracticalDecision {
  const cluster = decision.id.match(/-(A8|A9|A10)-10[1-8]$/u)?.[1];
  const skillReason = decision.learnerEligibility === "INTERNAL_ONLY"
    ? undefined
    : skillReasonRepairs[decision.skillId]?.[decision.kind];
  if (!cluster && !skillReason) return decision;
  return {
    ...decision,
    reasonOptions: decision.reasonOptions.map((option) => {
      if (option.id === decision.correctReasonId) {
        if (cluster) return { ...option, ...generatedCorrectReasonByCluster[cluster] };
        if (skillReason) return { ...option, ...skillReason };
      }
      const next = cluster && option.misconception ? generatedReasonRepairs[option.misconception] : undefined;
      return next ? { ...option, ...next } : option;
    }),
  };
}

const repairs: Record<string, DecisionRepair> = {
  "PM-BL-03-103": {
    questionRu: "Какой вывод лучше против широкого диапазона небольшого опен-рейза BTN?",
    questionEn: "Which conclusion is better against a wide small BTN open?",
    actionOptions: {
      a: {
        textRu: "Фолдить, потому что рука часто позади диапазона BTN",
        textEn: "Fold because the hand is often behind the BTN range",
        misconception: "SHOWDOWN_EQUITY_OVERFOLD",
      },
      b: {
        textRu: "Колл может быть лучше фолда, даже если рука часто проигрывает",
        textEn: "A call can beat folding even when the hand loses often",
      },
      c: {
        textRu: "Считать, что против BTN нужно защищать любые две карты",
        textEn: "Assume any two cards must defend against BTN",
        misconception: "ANY_TWO",
      },
    },
    reasonOptions: {
      r3: {
        textRu: "Ширина диапазона BTN сама по себе делает любую защиту прибыльной",
        textEn: "The width of the BTN range alone makes every defense profitable",
        misconception: "RANGE_ABSOLUTE",
      },
    },
  },
  "PM-BL-04-104": {
    questionRu: "Что обязательно пересчитать при большом сайзинге опен-рейза?",
    questionEn: "What must be recomputed against a large open?",
    actionOptions: {
      a: {
        textRu: "Дополнительную цену колла относительно итогового банка",
        textEn: "The incremental call price relative to the final pot",
      },
      b: {
        textRu: "Считать только уже поставленный блайнд: дополнительный колл цену не меняет",
        textEn: "Count only the posted blind: the extra call does not change the price",
        misconception: "SUNK_BLIND_OVERUSED",
      },
      c: {
        textRu: "Сохранить прежнюю пограничную защиту при той же категории руки",
        textEn: "Keep the same fringe defense when the hand category is unchanged",
        misconception: "SIZE_IGNORED",
      },
    },
  },
  "PM-BL-05-105": {
    questionRu: "Как оценить решение, если и колл, и ветка 3-бета после колла соперника проблемны?",
    questionEn: "How should the decision be evaluated when both the flat and the called 3-bet branch are problematic?",
    actionOptions: {
      a: {
        textRu: "Сравнить EV 3-бета после колла соперника и допустить фолд",
        textEn: "Compare the called-branch EV of the 3-bet and allow folding",
      },
      b: {
        textRu: "Форсировать 3-бет только потому, что колл слабый",
        textEn: "Force a 3-bet only because flatting is weak",
        misconception: "THREE_BET_OR_FOLD_LITERAL",
      },
      c: {
        textRu: "Игнорировать фильтрацию диапазона продолжения",
        textEn: "Ignore filtering of the continuing range",
        misconception: "FILTERING_IGNORED",
      },
    },
    reasonOptions: {
      r1: {
        textRu: "Плохой колл сам по себе не делает доминируемый 3-бет прибыльным",
        textEn: "A bad flat alone does not make a dominated 3-bet profitable",
      },
      r2: {
        textRu: "Агрессия сама по себе создаёт +EV",
        textEn: "Aggression alone creates positive EV",
        misconception: "AGGRESSION_AUTOPILOT",
      },
      r3: {
        textRu: "После 3-бета диапазон продолжения становится слабее по определению",
        textEn: "After a 3-bet the continuing range becomes weaker by definition",
        misconception: "FILTERING_BACKWARDS",
      },
    },
  },
};

function applyOptions(options: PracticalDecisionOption[], repair?: Record<string, OptionRepair>) {
  if (!repair) return options;
  return options.map((option) => {
    const next = repair[option.id];
    return next ? { ...option, ...next } : option;
  });
}

export function applyPracticalAssessmentIntegrityRepair(decision: PracticalDecision): PracticalDecision {
  const generated = applyGeneratedReasonRepairs(decision);
  const repair = repairs[generated.id];
  if (!repair) return generated;
  return {
    ...generated,
    questionRu: repair.questionRu,
    questionEn: repair.questionEn,
    actionOptions: applyOptions(generated.actionOptions, repair.actionOptions),
    reasonOptions: applyOptions(generated.reasonOptions, repair.reasonOptions),
  };
}
