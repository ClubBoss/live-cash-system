import type { PracticalDecision, PracticalDecisionOption } from "./types";

type OptionRepair = Pick<PracticalDecisionOption, "textRu" | "textEn"> & { misconception?: string };

type DecisionRepair = {
  questionRu: string;
  questionEn: string;
  actionOptions: Record<string, OptionRepair>;
  reasonOptions?: Record<string, OptionRepair>;
};

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
    questionRu: "Как оценить решение, если колл выглядит плохим?",
    questionEn: "How should the decision be evaluated when flatting looks bad?",
    actionOptions: {
      a: {
        textRu: "Сравнить EV 3-бета при колле соперника",
        textEn: "Compare the 3-bet called-branch EV",
      },
      b: {
        textRu: "Считать 3-бет лучшей линией из-за слабого колла",
        textEn: "Treat the 3-bet as better because flatting is weak",
        misconception: "THREE_BET_OR_FOLD_LITERAL",
      },
      c: {
        textRu: "Оценивать 3-бет без фильтрации диапазона продолжения",
        textEn: "Evaluate the 3-bet without filtering the continuing range",
        misconception: "FILTERING_IGNORED",
      },
    },
    reasonOptions: {
      r1: {
        textRu: "Слабый колл сам по себе не делает 3-бет прибыльным",
        textEn: "A bad flat alone does not make the 3-bet profitable",
      },
      r2: {
        textRu: "Фолд-эквити от агрессии само по себе делает 3-бет прибыльным",
        textEn: "Fold equity from aggression alone makes the 3-bet profitable",
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


const materialShortcutSkills = new Set([
  "FND-06",
  "PF-01", "PF-02", "PF-04", "PF-06", "PF-07",
  "BL-03", "BL-04",
  "W4-BOARD-01", "W4-RUNOUT-01", "W4-REL-01",
  "OOP-02", "OOP-03", "IP-01",
  "3BP-05",
  "TURN-01", "TURN-02", "TURN-03",
  "RIV-01", "RIV-03",
  "MW-01", "MW-02",
  "DEEP-01", "DEEP-03",
  "EXP-01",
]);

function misconceptionContext(skillId: string): { ru: string; en: string } {
  if (skillId.startsWith("PF-")) return {
    ru: "Такой вывод делает один префлоп-сигнал достаточным и пропускает origin range, players behind, price или called branch, которые меняют EV.",
    en: "That conclusion makes one preflop signal sufficient and skips the origin range, players behind, price, or called branch that changes EV.",
  };
  if (skillId.startsWith("BL-")) return {
    ru: "Такой вывод делает один blind-сигнал достаточным и пропускает цену, origin range и postflop realization.",
    en: "That conclusion makes one blind signal sufficient and skips price, origin range, and postflop realization.",
  };
  if (skillId.startsWith("W4-")) return {
    ru: "Такой вывод превращает визуальный label в готовую стратегию и пропускает arriving ranges, coverage и action ancestry.",
    en: "That conclusion turns a visual label into a finished strategy and skips arriving ranges, coverage, and action ancestry.",
  };
  if (skillId.startsWith("OOP-") || skillId.startsWith("IP-")) return {
    ru: "Такой вывод делает position/initiative достаточными и пропускает range interaction, sizing и future response.",
    en: "That conclusion makes position/initiative sufficient and skips range interaction, sizing, and future response.",
  };
  if (skillId.startsWith("3BP-") || skillId.startsWith("4BP-")) return {
    ru: "Такой вывод делает pot/role label достаточным и пропускает arriving ranges, board interaction, sizing и SPR exposure.",
    en: "That conclusion makes the pot/role label sufficient and skips arriving ranges, board interaction, sizing, and SPR exposure.",
  };
  if (skillId.startsWith("TURN-") || skillId.startsWith("RIV-")) return {
    ru: "Такой вывод пропускает ancestry линии, surviving value/bluff regions и текущую цену или sizing.",
    en: "That conclusion skips line ancestry, surviving value/bluff regions, and the current price or sizing.",
  };
  if (skillId.startsWith("MW-")) return {
    ru: "Такой вывод сводит multiway node к одному игроку и пропускает дополнительные surviving ranges, players behind и closing-action risk.",
    en: "That conclusion reduces a multiway node to one player and skips additional surviving ranges, players behind, and closing-action risk.",
  };
  if (skillId.startsWith("DEEP-")) return {
    ru: "Такой вывод делает nominal depth готовым action key и пропускает effective depth, position, future leverage и reverse implied odds.",
    en: "That conclusion turns nominal depth into an action key and skips effective depth, position, future leverage, and reverse implied odds.",
  };
  if (skillId.startsWith("EXP-")) return {
    ru: "Такой вывод превращает наблюдение в глобальный read и пропускает branch scope, sample strength и противоречащие evidence.",
    en: "That conclusion turns an observation into a global read and skips branch scope, sample strength, and contradictory evidence.",
  };
  return {
    ru: "Такой вывод делает один видимый сигнал достаточным и пропускает остальные причинные inputs, указанные в spot.",
    en: "That conclusion makes one visible signal sufficient and skips the other causal inputs represented in the spot.",
  };
}

function alreadyArticulatedMisconception(textRu: string, textEn: string): boolean {
  return /Считать|Применить|Использовать|пропускает|можно не проверять/iu.test(textRu)
    || /Treat|Assume|Use the shortcut|skips|need not be checked/iu.test(textEn);
}

function articulateMaterialWrongReasons(decision: PracticalDecision): PracticalDecision {
  if (!materialShortcutSkills.has(decision.skillId)) return decision;
  const context = misconceptionContext(decision.skillId);
  let changed = false;
  const reasonOptions = decision.reasonOptions.map((option) => {
    if (option.id === decision.correctReasonId || !option.misconception
      || alreadyArticulatedMisconception(option.textRu, option.textEn)) return option;
    changed = true;
    return {
      ...option,
      textRu: `Ошибочная модель: «${option.textRu}». ${context.ru}`,
      textEn: `Wrong model: “${option.textEn}” ${context.en}`,
    };
  });
  return changed ? { ...decision, reasonOptions } : decision;
}

function applyOptions(options: PracticalDecisionOption[], repair?: Record<string, OptionRepair>) {
  if (!repair) return options;
  return options.map((option) => {
    const next = repair[option.id];
    return next ? { ...option, ...next } : option;
  });
}

export function applyPracticalAssessmentIntegrityRepair(decision: PracticalDecision): PracticalDecision {
  const repair = repairs[decision.id];
  const repaired = repair ? {
    ...decision,
    questionRu: repair.questionRu,
    questionEn: repair.questionEn,
    actionOptions: applyOptions(decision.actionOptions, repair.actionOptions),
    reasonOptions: applyOptions(decision.reasonOptions, repair.reasonOptions),
  } : decision;
  return articulateMaterialWrongReasons(repaired);
}
