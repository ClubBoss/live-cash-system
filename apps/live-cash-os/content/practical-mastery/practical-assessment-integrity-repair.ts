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
    textRu: "Текущая цена и сила руки важнее предыдущей линии, поэтому её можно считать вторичной",
    textEn: "Current price and hand strength matter more than ancestry, so prior action can be treated as secondary",
  },
  GEOMETRY_IGNORED: {
    textRu: "Класс руки игрока задаёт решение, а глубина, число игроков и относительная позиция — лишь небольшие поправки",
    textEn: "Hero's hand class drives the decision; depth, player count, and relative position are only minor adjustments",
  },
  ARCHETYPE_AS_EVIDENCE: {
    textRu: "Если наблюдение совпадает с типом игрока, переносить рид на соседние ветки до обратных данных",
    textEn: "If the observation fits a player type, carry the read into nearby branches until contrary evidence appears",
  },
};

type LocalizedReason = Pick<PracticalDecisionOption, "textRu" | "textEn">;

const skillReasonRepairs: Record<string, Partial<Record<PracticalDecision["kind"], LocalizedReason>>> = {
  "TURN-02": {
    recognition: {
      textRu: "Второй баррель зависит от карты тёрна, сохранившихся диапазонов и класса руки игрока",
      textEn: "A turn barrel depends on the runout, surviving ranges, and Hero's hand class",
    },
    decision: {
      textRu: "Продолжать давление стоит только когда класс руки и карта тёрна поддерживают второй баррель",
      textEn: "Continue only when the value or bluff class and runout support pressure",
    },
    changed: {
      textRu: "Новая карта или сдвиг диапазонов меняют давление и набор подходящих вторых баррелей",
      textEn: "A runout or range shift changes leverage and which hands should barrel",
    },
    boundary: {
      textRu: "Ставка на флопе не обязывает автоматически ставить второй баррель на тёрне",
      textEn: "A flop bet does not obligate a turn barrel",
    },
  },
  "RIV-03": {
    recognition: {
      textRu: "Блафф-кэтч зависит от цены, правдоподобных блефов после линии и блокеров",
      textEn: "A bluff-catch depends on price, credible bluffs after the line, and removal",
    },
    decision: {
      textRu: "Колл нужен только когда оставшихся блефов достаточно для текущей цены",
      textEn: "Call only when surviving bluff supply is sufficient for the current price",
    },
    changed: {
      textRu: "Предыдущая линия и блокеры меняют число блефов даже при той же цене",
      textEn: "Line ancestry or removal changes bluff supply even at the same price",
    },
    boundary: {
      textRu: "Хорошая цена сама не требует колла, если правдоподобных блефов недостаточно",
      textEn: "A good price alone does not force a call without enough credible bluffs",
    },
  },
};

const generatedCorrectReasonByCluster: Record<string, Pick<PracticalDecisionOption, "textRu" | "textEn">> = {
  A8: {
    textRu: "Текущий узел зависит от предыдущей линии, сохранившихся диапазонов и цены, а не только от ярлыка ситуации",
    textEn: "The current node depends on ancestry, surviving ranges, and price rather than the situation label alone",
  },
  A9: {
    textRu: "Геометрия живой игры меняет доступные ветки и их ценность, даже когда карты игрока те же",
    textEn: "Live geometry changes the available branches and their EV even when Hero's cards stay the same",
  },
  A10: {
    textRu: "Отклонение от базовой стратегии должно быть привязано к конкретной ветке и силе повторяющихся наблюдений",
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
