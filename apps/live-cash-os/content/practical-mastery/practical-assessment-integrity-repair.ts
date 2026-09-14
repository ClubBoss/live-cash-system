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


type Locale = "Ru" | "En";

function optionText(option: PracticalDecisionOption, locale: Locale): string {
  return locale === "Ru" ? option.textRu : option.textEn;
}

function longestOptionId(options: PracticalDecisionOption[], locale: Locale): string | null {
  if (!options.length) return null;
  return options.reduce((best, option) => (
    optionText(option, locale).length > optionText(best, locale).length ? option : best
  )).id;
}

function shortcutContext(skillId: string, locale: Locale): string {
  const family = skillId.split("-")[0] ?? "";
  if (locale === "Ru") {
    if (family === "PF") return "Такой выбор ошибочно предполагает, что одного префлоп-признака достаточно, поэтому позицию, цену, диапазон продолжения и игроков позади можно не пересчитывать.";
    if (family === "BL") return "Такой выбор ошибочно предполагает, что одного признака защиты блайнда достаточно, поэтому цену, исходный диапазон, порядок действий и будущую реализацию можно не пересчитывать.";
    if (family === "TURN" || family === "RIV") return "Такой выбор ошибочно предполагает, что текущая улица или карта сама задаёт действие, поэтому историю линии, оставшиеся сильные руки и блефы, цену и размер ставки можно не пересчитывать.";
    if (family === "MW") return "Такой выбор ошибочно сводит многосторонний банк к одному сопернику и позволяет не учитывать дополнительные диапазоны, игроков позади, порядок действий и риск усиления чужой руки.";
    if (family === "DEEP") return "Такой выбор ошибочно делает номинальную глубину готовым ключом к действию и позволяет не учитывать эффективный стек, позицию, будущие решения и обратные потенциальные шансы.";
    if (family === "EXP" || family === "LIVE") return "Такой выбор ошибочно превращает одно наблюдение в общий вывод и позволяет не проверять ветку, силу выборки, противоречащие наблюдения и то, действительно ли прочитанный признак относится к этой ситуации.";
    if (family === "OOP" || family === "IP" || family === "3BP" || family === "4BP" || family === "SRP") return "Такой выбор ошибочно делает роль или внешний вид доски достаточными и позволяет не проверять пришедшие диапазоны, их взаимодействие, размер ставки и будущий ответ соперника.";
    if (family === "W4") return "Такой выбор ошибочно превращает визуальный ярлык в готовую стратегию и позволяет не проверять пришедшие диапазоны, покрытие сильных комбинаций и историю предыдущих действий.";
    if (family === "FND") return "Такой выбор ошибочно делает один заметный признак достаточным и позволяет не проверять цену, диапазон соперника, геометрию банка и качество будущей реализации.";
    return "Такой выбор ошибочно делает один заметный признак достаточным для решения и позволяет не проверять остальные причинные переменные, которые способны изменить итог.";
  }
  if (family === "PF") return "This choice wrongly treats one preflop signal as sufficient, so position, price, the continuing range, and players behind supposedly need no recomputation.";
  if (family === "BL") return "This choice wrongly treats one blind-defense signal as sufficient, so price, origin range, action order, and future realization supposedly need no recomputation.";
  if (family === "TURN" || family === "RIV") return "This choice wrongly treats the current street or card as action-complete, so line ancestry, surviving value and bluffs, price, and sizing supposedly need no recomputation.";
  if (family === "MW") return "This choice wrongly reduces a multiway pot to one opponent, ignoring additional ranges, players behind, action order, and the risk that another range improves.";
  if (family === "DEEP") return "This choice wrongly turns nominal depth into an action key, ignoring effective stack, position, future decision leverage, and reverse implied-odds exposure.";
  if (family === "EXP" || family === "LIVE") return "This choice wrongly promotes one observation into a global read without checking branch scope, sample strength, contradictory evidence, or whether the read applies here.";
  if (family === "OOP" || family === "IP" || family === "3BP" || family === "4BP" || family === "SRP") return "This choice wrongly treats role or board appearance as sufficient, so arriving ranges, range interaction, sizing, and the opponent's future response supposedly need no check.";
  if (family === "W4") return "This choice wrongly turns a visual label into a finished strategy without checking arriving ranges, strong-hand coverage, or prior action history.";
  if (family === "FND") return "This choice wrongly makes one visible signal sufficient and ignores price, the opponent's range, pot geometry, and the quality of future realization.";
  return "This choice wrongly makes one visible signal sufficient and ignores the other causal variables in the spot that can change the result.";
}

function articulateShortcutOption(
  option: PracticalDecisionOption,
  decision: PracticalDecision,
  locale: Locale,
  minimumLength: number,
): PracticalDecisionOption {
  const base = optionText(option, locale).replace(/[.!?]+$/u, "");
  const first = `${base}. ${shortcutContext(decision.skillId, locale)}`;
  const second = locale === "Ru"
    ? "Ошибка здесь именно в переносе действия без повторной проверки причинной структуры ситуации, а не просто в выборе другой кнопки."
    : "The mistake is carrying the action forward without re-checking the spot's causal structure, not merely choosing a different button.";
  const expanded = first.length > minimumLength ? first : `${first} ${second}`;
  return locale === "Ru" ? { ...option, textRu: expanded } : { ...option, textEn: expanded };
}

function repairJointLengthShortcut(decision: PracticalDecision, locale: Locale): PracticalDecision {
  if (longestOptionId(decision.actionOptions, locale) !== decision.correctActionId
    || longestOptionId(decision.reasonOptions, locale) !== decision.correctReasonId) return decision;

  const correct = decision.actionOptions.find((option) => option.id === decision.correctActionId);
  if (!correct) return decision;
  const candidates = decision.actionOptions
    .filter((option) => option.id !== decision.correctActionId && option.misconception)
    .sort((left, right) => optionText(right, locale).length - optionText(left, locale).length);
  const target = candidates[0];
  if (!target) return decision;

  return {
    ...decision,
    actionOptions: decision.actionOptions.map((option) => (
      option.id === target.id
        ? articulateShortcutOption(option, decision, locale, optionText(correct, locale).length)
        : option
    )),
  };
}

function repairAssessmentLengthShortcuts(decision: PracticalDecision): PracticalDecision {
  return repairJointLengthShortcut(repairJointLengthShortcut(decision, "Ru"), "En");
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
  return repairAssessmentLengthShortcuts(repaired);
}
