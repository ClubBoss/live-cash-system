import type { PracticalDecision, PracticalDecisionOption } from "./types";

type DecisionRepair = {
  questionRu: string;
  questionEn: string;
  actionOptions: Record<string, Pick<PracticalDecisionOption, "textRu" | "textEn"> & { misconception?: string }>;
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
        textRu: "Сохранять прежнюю пограничную защиту только потому, что категория руки не изменилась",
        textEn: "Keep the old fringe just because the hand label is unchanged",
        misconception: "SIZE_IGNORED",
      },
    },
  },
  "PM-BL-05-105": {
    questionRu: "Как оценить решение, если колл выглядит плохим?",
    questionEn: "How should the decision be evaluated when flatting looks bad?",
    actionOptions: {
      a: {
        textRu: "Проверить EV 3-бета в ветке, где соперник коллирует, а не повышать агрессию автоматически",
        textEn: "Check the 3-bet called-branch EV instead of escalating aggression automatically",
      },
      b: {
        textRu: "Если колл плох, 3-бет автоматически лучше",
        textEn: "If the flat is bad, the 3-bet is automatically better",
        misconception: "THREE_BET_OR_FOLD_LITERAL",
      },
      c: {
        textRu: "Игнорировать, какие более сильные руки остаются после 3-бета",
        textEn: "Ignore which stronger hands remain after the 3-bet",
        misconception: "FILTERING_IGNORED",
      },
    },
  },
};

export function applyPracticalAssessmentIntegrityRepair(decision: PracticalDecision): PracticalDecision {
  const repair = repairs[decision.id];
  if (!repair) return decision;
  return {
    ...decision,
    questionRu: repair.questionRu,
    questionEn: repair.questionEn,
    actionOptions: decision.actionOptions.map((option) => {
      const next = repair.actionOptions[option.id];
      return next ? { ...option, ...next } : option;
    }),
  };
}
