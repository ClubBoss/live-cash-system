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
    textRu: "Если известны текущая цена и класс руки, предыдущую линию можно не учитывать при восстановлении сохранившегося диапазона",
    textEn: "Once current price and hand class are known, prior action can be ignored when reconstructing the surviving range",
  },
  GEOMETRY_IGNORED: {
    textRu: "Если класс руки игрока не изменился, глубина, число игроков и относительная позиция не должны менять выбор ветки",
    textEn: "If Hero's hand class is unchanged, depth, player count, and relative position should not change the branch choice",
  },
  ARCHETYPE_AS_EVIDENCE: {
    textRu: "Если одно наблюдение похоже на тип игрока, этого достаточно, чтобы переносить рид на соседние ветки",
    textEn: "If one observation fits a player type, that is enough to carry the read into nearby branches",
  },
};

function applyGeneratedReasonRepairs(decision: PracticalDecision): PracticalDecision {
  const cluster = decision.id.match(/-(A8|A9|A10)-10[1-8]$/u)?.[1];
  if (!cluster) return decision;
  return {
    ...decision,
    reasonOptions: decision.reasonOptions.map((option) => {
      if (option.id === decision.correctReasonId) return option;
      const next = option.misconception ? generatedReasonRepairs[option.misconception] : undefined;
      return next ? { ...option, ...next } : option;
    }),
  };
}

const exactCorrectReasonRepairs: Readonly<Record<string, Pick<PracticalDecisionOption, "textRu" | "textEn">>> = {
  "PM-B3-TURN02-104": {
    textRu: "Класс руки изменился: рука со средней шоудаун-ценностью реже нуждается в превращении в блеф, поэтому чек чаще сохраняет её EV.",
    textEn: "The hand class changed: a medium-showdown hand has less reason to turn itself into a bluff, so checking preserves its EV more often.",
  },
  "PM-B4-TURN02-101": {
    textRu: "При большом будущем SPR одной текущей фолд-эквити недостаточно: тонкое вэлью и пограничные блефы должны ещё устойчиво реализовываться на ривере, иначе EV барреля падает.",
    textEn: "With a large future SPR, current fold equity is not enough: thin value and marginal bluffs must also realize robustly on the river or the barrel loses EV.",
  },
  "PM-B4-TURN02-102": {
    textRu: "Глубокий остаток стека усиливает будущие решения и риск дорогих ошибок, поэтому баррель сохраняют прежде всего устойчивое вэлью и качественные блефы.",
    textEn: "A deep remaining stack amplifies future decisions and costly mistakes, so robust value and high-quality bluffs are the barrel classes that survive best.",
  },
  "PM-B4-TURN02-103": {
    textRu: "Переход от малого остатка стека к глубокому повышает будущий SPR: разгон банка пограничными классами становится дороже, поэтому их баррель сужается.",
    textEn: "Moving from a shallow remainder to a deep stack raises future SPR: inflating the pot with marginal classes becomes more costly, so their barrel region contracts.",
  },
  "PM-B4-TURN02-104": {
    textRu: "Глубина повышает цену будущих ошибок, но не отменяет прибыльные баррели: устойчивое вэлью и качественные блефы продолжают, а пограничные классы отбираются строже.",
    textEn: "Depth raises the cost of future mistakes but does not erase profitable barrels: robust value and strong bluffs continue while marginal classes are selected more strictly.",
  },
  "PM-B4-RIV03-103": {
    textRu: "При той же цене повторяющийся недоблеф именно в этой ветке уменьшает ожидаемый запас блефов, поэтому пограничный колл теряет EV и порог сдвигается к фолду.",
    textEn: "At the same price, repeated underbluffing in this exact branch lowers expected bluff supply, so a marginal call loses EV and the threshold shifts toward folding.",
  },
  "PM-B4-RIV03-104": {
    textRu: "Рид на недоблеф действует только в подтверждённой ветке: другой сайзинг или линия меняют состав возможных блефов и требуют новой реконструкции.",
    textEn: "An underbluff read applies only to the evidenced branch: a different size or line changes the possible bluff set and requires a fresh reconstruction.",
  },
  "PM-TURN-02-FINAL-101": {
    textRu: "Колл флопа уже отфильтровал префлоп-диапазон; рейзить тёрн могут только руки, которые реально дошли до этого узла.",
    textEn: "The flop call already filtered the preflop range; only hands that actually reached this node can appear in the turn-raising range.",
  },
  "PM-TURN-02-FINAL-102": {
    textRu: "Наблюдения в конкретной ветке уменьшают ожидаемый запас естественных блефов; при той же цене это сужает прибыльный диапазон продолжения.",
    textEn: "Branch-specific evidence lowers the expected natural bluff supply; at the same price, that narrows the profitable continuing range.",
  },
  "PM-TURN-02-FINAL-103": {
    textRu: "Карта, закрывающая дро или возвращающая сильные комбинации коллеру, добавляет реальные сильные руки и естественные блефы в диапазон рейза; бланк этого не делает.",
    textEn: "A turn that completes draws or restores strong caller combinations adds real value hands and natural bluffs to the raising range; a blank does not.",
  },
  "PM-TURN-02-FINAL-104": {
    textRu: "Уже вложенные фишки — невозвратные издержки, а не эквити; продолжение определяется текущим диапазоном соперника и ценой колла сейчас.",
    textEn: "Previously invested chips are sunk cost, not equity; continuing depends on Villain's current range and the call price now.",
  },
  "PM-TURN-02-ETC-101": {
    textRu: "Ремонтная карта лишь запускает пересчёт: если Hero сохраняет достаточно сильный верх диапазона и ставка всё ещё имеет вэлью- или фолд-эквити-задачу, агрессия остаётся прибыльной.",
    textEn: "A range-repairing turn triggers a recomputation rather than an automatic check: if Hero retains enough top-end ownership and the bet still has a value or fold-equity purpose, aggression can remain profitable.",
  },
  "PM-TURN-02-ETC-102": {
    textRu: "Бланк означает лишь отсутствие нового усиления соперника; он не создаёт ни худших коллов для вэлью, ни дополнительных фолдов, поэтому цель второй ставки нужно доказать отдельно.",
    textEn: "A blank only means Villain did not gain new strength; it creates neither worse value calls nor extra folds, so the purpose of a second barrel must be established separately.",
  },
  "PM-RIV-03-C0-201": {
    textRu: "Широкий старт даёт больше потенциального воздуха, но действия по улицам его фильтруют; колл на ривере должен опираться на блефы, которые действительно дожили до этой линии.",
    textEn: "A wide starting range creates more potential air, but street-by-street action filters it; a river call must use bluffs that actually survive the line.",
  },
  "PM-RIV-03-C0-202": {
    textRu: "Разномастные широкие классы содержат больше стартовых комбинаций, поэтому потенциальных блеф-кандидатов может быть больше; это не означает, что весь этот воздух доживает до ривера.",
    textEn: "Wide offsuit classes contain more starting combinations, so they can create more potential bluff candidates; that does not mean all of that air survives to the river.",
  },
  "PM-RIV-03-C0-205": {
    textRu: "Смена широкого BTN-старта на тайтовый ранний диапазон уменьшает исходный запас воздуха; затем его всё равно нужно провести через те же фильтры борда и линии.",
    textEn: "Changing from a wide BTN origin to a tight early-position range reduces the prior air supply; it still must be passed through the same board and line filters.",
  },
  "PM-RIV-03-C0-207": {
    textRu: "Широкий старт — только исходная оценка запаса воздуха: конкретная линия может удалить его, а утверждение о переблефе пула требует отдельных наблюдений.",
    textEn: "A wide origin is only a prior on air supply: the line can remove that air, and a population-overbluff claim requires separate evidence.",
  },
  "PM-RIV-03-C0-208": {
    textRu: "Тайтовый старт может уменьшить исходный запас блефов, но не доказывает их отсутствие: после всей линии всё равно нужно перечислить правдоподобные блефы и сопоставить их с ценой и блокерами.",
    textEn: "A tight origin can reduce prior bluff supply but does not prove there are no bluffs: credible bluffs must still be enumerated after the full line and compared with price and blockers.",
  },
};

function applyExactCorrectReasonRepair(decision: PracticalDecision): PracticalDecision {
  const repair = exactCorrectReasonRepairs[decision.id];
  if (!repair) return decision;
  return {
    ...decision,
    reasonOptions: decision.reasonOptions.map((option) =>
      option.id === decision.correctReasonId ? { ...option, ...repair } : option
    ),
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

const internalSourceIdPattern = /\b(?:FTGU|SLC|LCM|CINJ|CP)-[A-Z0-9-]+(?:\/E\d+)*\b/gu;

function naturalizeSourceReferences(text: string, locale: "ru" | "en"): string {
  if (!internalSourceIdPattern.test(text)) return text;
  internalSourceIdPattern.lastIndex = 0;
  let next = text.replace(internalSourceIdPattern, locale === "ru" ? "материал" : "source material");
  internalSourceIdPattern.lastIndex = 0;
  if (locale === "ru") {
    next = next
      .replace(/материал\s*(?:и|\/)\s*материал/giu, "материалы")
      .replace(/материалы\s*(?:и|\/)\s*материал/giu, "материалы")
      .replace(/Геометрия\s+материал(?:а|ов|ы)?\s*:/giu, "Геометрия:")
      .replace(/^материал\b/u, "Материал")
      .replace(/^материалы\b/u, "Материалы")
      .replace(/^Материал\s+связывают\b/u, "Материал связывает")
      .replace(/^Материал\s+требуют\b/u, "Материал требует");
  } else {
    next = next
      .replace(/source material\s*(?:and|\/)\s*source material/giu, "source materials")
      .replace(/source materials\s*(?:and|\/)\s*source material/giu, "source materials")
      .replace(/^source material\b/u, "Source material")
      .replace(/^source materials\b/u, "Source materials");
  }
  return next.replace(/\s{2,}/gu, " ").replace(/\s+([,.:;])/gu, "$1").trim();
}

function cleanLearnerExplanationSourceIds(decision: PracticalDecision): PracticalDecision {
  const explanationRu = naturalizeSourceReferences(decision.explanationRu, "ru");
  const explanationEn = naturalizeSourceReferences(decision.explanationEn, "en");
  if (explanationRu === decision.explanationRu && explanationEn === decision.explanationEn) return decision;
  return { ...decision, explanationRu, explanationEn };
}

function applyOptions(options: PracticalDecisionOption[], repair?: Record<string, OptionRepair>) {
  if (!repair) return options;
  return options.map((option) => {
    const next = repair[option.id];
    return next ? { ...option, ...next } : option;
  });
}

export function applyPracticalAssessmentIntegrityRepair(decision: PracticalDecision): PracticalDecision {
  const generated = applyGeneratedReasonRepairs(decision);
  const exact = applyExactCorrectReasonRepair(generated);
  const repair = repairs[exact.id];
  const repaired = repair
    ? {
        ...exact,
        questionRu: repair.questionRu,
        questionEn: repair.questionEn,
        actionOptions: applyOptions(exact.actionOptions, repair.actionOptions),
        reasonOptions: applyOptions(exact.reasonOptions, repair.reasonOptions),
      }
    : exact;
  return cleanLearnerExplanationSourceIds(repaired);
}
