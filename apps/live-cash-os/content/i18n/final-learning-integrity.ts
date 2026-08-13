import { moduleById } from "../modules";
import type { LocaleCode, ModuleId } from "../../lib/model";

type DrillPatch = Partial<{
  assumptions: string[];
  cue: string;
  question: string;
  explanation: string;
}>;

function drill(moduleId: ModuleId, drillId: string) {
  const target = moduleById[moduleId].drills.find((item) => item.id === drillId);
  if (!target) throw new Error(`Missing final-learning-integrity drill ${drillId}`);
  return target;
}

function patchDrill(moduleId: ModuleId, drillId: string, patch: DrillPatch) {
  const target = drill(moduleId, drillId);
  if (patch.assumptions) target.assumptions = [...patch.assumptions];
  if (patch.cue) target.cue = patch.cue;
  if (patch.question) target.question = patch.question;
  if (patch.explanation) target.explanation = patch.explanation;
}

function patchWrongOptions(
  moduleId: ModuleId,
  drillId: string,
  kind: "action" | "reason",
  texts: [string, string],
) {
  const target = drill(moduleId, drillId);
  const options = kind === "action" ? target.actionOptions : target.reasonOptions;
  const correctId = kind === "action" ? target.correctActionId : target.correctReasonId;
  const wrong = options.filter((option) => option.id !== correctId);
  if (wrong.length !== 2) throw new Error(`${drillId}.${kind}: expected two distractors`);
  wrong.forEach((option, index) => { option.text = texts[index]; });
}

function applyRussianHandFamilyScaffold() {
  const preflop = moduleById.preflop;
  preflop.plainGoal = "Сначала распознавать семейство и свойства конкретной руки, затем выбирать между коллом, 3-бетом и фолдом по контексту — без заучивания десятков чартов.";
  preflop.tableCue = "Рука → семейство и свойства → контекст → действие.";
  preflop.scope = "Направленная архитектура для live cash. Конкретные руки здесь иллюстрируют семейства и свойства, а не задают точные клетки чарта или частоты; решение всё равно зависит от позиций, глубины, размера открытия, рейка и игроков за спиной.";
  preflop.theory = [
    "Семейства и свойства стартовых рук. Семейство отвечает на вопрос «что это за структурный тип руки?», а свойства — чем эта структура может быть полезна или уязвима. Семейство помогает понять руку, но не выбирает действие за тебя.",
    "TT — карманная пара; 76s и 98s — мастевые связки (suited connectors); A5s — мастевой туз колеса; KTs — мастевой бродвей; KJo — разномастный бродвей. Сначала назови одно-два свойства, которые важны именно здесь, затем проверь позицию, диапазоны, эффективный стек, цену и игроков за спиной.",
    ...preflop.theory,
  ];
  preflop.decisionTree = [
    "Назови семейство руки и релевантные свойства: готовая пара, масть, связность, сила старших карт, доминация, блокер.",
    ...preflop.decisionTree,
  ];
  preflop.tableCard = ["Семейство и 1–2 свойства", ...preflop.tableCard];
  preflop.glossary = [
    ...preflop.glossary,
    { term: "Карманная пара", meaning: "Две карты одного ранга, например TT: готовая пара и потенциал сета. Это не готовая команда на 3-бет или колл." },
    { term: "Мастевая связка (suited connector)", meaning: "Соседние карты одной масти, например 76s или 98s: масть и связность помогают собирать сильные дро, но скромная сила старших карт повышает зависимость от позиции и реализации." },
    { term: "Мастевой туз колеса", meaning: "Структура вроде A2s–A5s: туз-блокер, потенциал натсового флеша и связность к нижнему стриту. Блокер сам по себе не создаёт прибыльный блеф." },
    { term: "Мастевой бродвей", meaning: "Две высокие бродвейные карты одной масти, например KTs: сила старших карт плюс масть. Семейство не задаёт автоматическое продолжение." },
    { term: "Разномастный бродвей", meaning: "Две высокие карты разных мастей, например KJo: потенциал сильной топ-пары сочетается с чувствительностью к доминации и отсутствием преимущества масти." },
  ];
  preflop.workedExample = {
    situation: "200bb. HJ открывается, CO коллирует, Hero на BTN с 76s; блайнды пассивны.",
    steps: [
      "76s — мастевая связка: масть и соседние ранги дают связность, но не делают руку сильной по старшим картам.",
      "В этой модели позиция, глубина и низкий риск нового рейза помогают реализовать эти свойства через колл.",
      "98s относится к тому же широкому семейству, но само семейство не говорит «колл»: при другой позиции, глубине или диапазонах действие нужно выбирать заново.",
    ],
    answer: "Здесь колл сохраняет ценность 76s. Логика — семейство и свойства → контекст → действие, а не «76s = колл».",
  };
  preflop.counterexample = "76s и 98s могут быть одной мастевой связкой, но это не делает их решения взаимозаменяемыми: другой размер открытия, позиция, эффективный стек или активный игрок за спиной могут изменить сравнительную ценность колла, 3-бета и фолда.";
}

function applyEnglishHandFamilyScaffold() {
  const preflop = moduleById.preflop;
  preflop.plainGoal = "Recognise the hand family and relevant traits first, then choose between call, 3-bet and fold from context instead of memorising dozens of charts.";
  preflop.tableCue = "Hand → family and traits → context → decision.";
  preflop.scope = "A directional live-cash framework. Concrete hands illustrate families and traits rather than prescribing exact chart cells or frequencies; positions, depth, open size, rake and players behind still determine the decision.";
  preflop.theory = [
    "Starting-hand families and traits. A family answers what structural kind of hand this is; traits describe where that structure can help or hurt. The family helps you understand the hand, but it does not choose the action for you.",
    "TT is a pocket pair; 76s and 98s are suited connectors; A5s is a suited wheel ace; KTs is suited Broadway; KJo is offsuit Broadway. Name one or two traits that matter in this spot, then apply position, ranges, effective stack, price and players behind.",
    ...preflop.theory,
  ];
  preflop.decisionTree = [
    "Name the hand family and relevant traits: made pair, suitedness, connectivity, high-card strength, domination sensitivity or blocker value.",
    ...preflop.decisionTree,
  ];
  preflop.tableCard = ["Family and 1–2 traits", ...preflop.tableCard];
  preflop.glossary = [
    ...preflop.glossary,
    { term: "Pocket pair", meaning: "Two cards of the same rank, such as TT: a made pair with set potential. The family does not prescribe a 3-bet or call." },
    { term: "Suited connector", meaning: "Adjacent ranks in the same suit, such as 76s or 98s: suitedness and connectivity create strong-draw potential, while modest high-card strength makes position and realisation important." },
    { term: "Suited wheel ace", meaning: "An A2s–A5s-type structure: ace blocker, nut-flush potential and wheel connectivity. The blocker does not create a profitable bluff by itself." },
    { term: "Suited Broadway", meaning: "Two Broadway ranks in the same suit, such as KTs: high-card structure plus suitedness. The family does not prescribe an automatic continue." },
    { term: "Offsuit Broadway", meaning: "Two Broadway ranks in different suits, such as KJo: top-pair potential with more domination sensitivity and no suitedness benefit." },
  ];
  preflop.workedExample = {
    situation: "200bb. HJ opens, CO calls, Hero is on the BTN with 76s, and the blinds are passive.",
    steps: [
      "76s is a suited connector: suitedness and adjacent ranks create connectivity, but the hand has modest high-card strength.",
      "In this model, position, depth and low re-raise risk let those traits realise through the calling branch.",
      "98s belongs to the same broad family, but the family does not say 'call': a different position, depth or source range requires a fresh decision.",
    ],
    answer: "Calling preserves the value of 76s in this stated model. The path is family and traits → context → decision, not '76s = call'.",
  };
  preflop.counterexample = "76s and 98s can share the suited-connector family without sharing an action. A different open size, position, effective stack or active player behind can change the relative value of calling, 3-betting and folding.";
}

function applyRussianTransferPrompts() {
  patchDrill("preflop", "pre-02", {
    assumptions: ["200bb", "HJ открывается", "CO коллирует", "Hero BTN 76s", "блайнды пассивны", "точная частота для 76s по чарту не утверждается"],
    cue: "200bb: HJ open, CO call, Hero BTN с 76s; блайнды пассивны.",
    question: "Сначала назови семейство 76s и важные здесь свойства. Затем выбери действие по позиции, глубине, диапазонам и игрокам за спиной.",
    explanation: "76s — мастевая связка: масть и связность помогают реализации, но не выбирают действие. В этой заданной модели позиция, глубина и пассивные блайнды сохраняют ценность колла. 98s — безопасный пример того же семейства для распознавания, а не новая клетка чарта.",
  });
  patchDrill("preflop", "pre-03", {
    assumptions: ["100bb", "EP открывается 4bb", "HJ коллирует", "Hero CO KJo", "два исходных диапазона сильнее позднего open+call", "точная граница KJo по чарту не утверждается"],
    cue: "EP open 4bb, HJ call, Hero CO с KJo против двух сильных исходных диапазонов.",
    question: "Сначала определи семейство KJo и свойства, которые важны против этих диапазонов. Затем выбери действие.",
    explanation: "KJo — разномастный бродвей: сила старших карт и потенциал топ-пары идут вместе с чувствительностью к доминации и без преимущества масти. В этой модели именно диапазоны и реализация ведут к фолду, а не запомненная формула «KJo = fold».",
  });
  patchDrill("preflop", "pre-04", {
    question: "Условие задачи уже относит A5s к смешанным полярным кандидатам базовой модели. Какую частотную подстройку теперь поддерживает подтверждённо широкий open+call?",
    explanation: "A5s — мастевой туз колеса: блокер, масть и связность к нижнему стриту делают его удобным представителем уже существующей полярной ветки, но не универсальным «4-бет/сквиз-блефом». Здесь проверяется дальнейшая подстройка к широким входам, а не право A5s быть кандидатом вообще.",
  });

  patchDrill("ancestry", "anc-01", {
    assumptions: ["BTN открывается широко", "BB 3-бетит шире базовой модели", "Hero BTN A5s", "точная частота 4-бета и клетка чарта не утверждаются"],
    cue: "BTN open, BB использует широкий 3-бет; Hero держит A5s.",
    question: "Что нужно подтвердить до превращения A5s в 4-бет-блеф?",
    explanation: "A5s даёт туз-блокер, масть и связность к нижнему стриту, но этого недостаточно: сначала нужны правдоподобное вэлью продолжения и реальные более сильные руки, которые сфолдят. Название комбинации не создаёт блеф.",
  });
  patchDrill("ancestry", "anc-02", {
    cue: "Та же A5s, но теперь после раннего открытия SB 3-бетит очень тайтово и почти без блефов.",
    question: "Что именно в новом контексте ломает знакомую идею с A5s?",
    explanation: "Комбо не изменилось: у A5s всё те же структурные свойства. Изменился исходный диапазон SB — почти нет более сильных рук, которые реально сфолдят. Поэтому это не урок «A5s = блеф», а пример одного и того же комбо в двух разных ветках.",
  });
  patchDrill("ancestry", "anc-03", {
    assumptions: ["150bb", "Hero BTN против BB 3-бета", "Hero 98s", "по условию задачи у 98s есть правдоподобная альтернатива колла; точная частота по чарту не утверждается", "98s слабо блокирует премиальные продолжения"],
    cue: "150bb BTN vs BB 3-bet, Hero с 98s. По условию задачи сравнение включает реальную колл-альтернативу.",
    question: "Сначала распознай 98s как мастевую связку. При этом заданном условии что нужно сравнить до превращения руки в 4-бет-блеф?",
    explanation: "98s — мастевая связка того же широкого семейства, что 76s. Здесь условие специально даёт колл-альтернативу, потому что проверяется дальнейшее сравнение реализации против ценности блокеров и реальных фолдов, а не точная клетка чарта 98s.",
  });

  const ancestry = moduleById.ancestry;
  ancestry.counterexample = "Сравни одну и ту же A5s: против широкого 3-бета сначала ищи реальные фолды и только затем оценивай ценность блокера; против тайтового преимущественно вэлью-диапазона эти фолды могут исчезнуть. Комбо то же, контекст другой — поэтому меняется пригодность блефа.";
  if (ancestry.lab.type === "compare") {
    ancestry.lab.title = "Одна A5s — два исходных диапазона";
    ancestry.lab.description = "Сравни один и тот же мастевой туз колеса против широкого 3-бета и против тайтового преимущественно вэлью-диапазона. Семейство руки не меняется; реальные фолды меняются.";
    ancestry.lab.leftTitle = "Широкий 3-бет";
    ancestry.lab.leftText = "Сначала проверь, какие более сильные руки реально сфолдят и какие продолжат; только затем используй блокер.";
    ancestry.lab.rightTitle = "Тайтовый вэлью-диапазон";
    ancestry.lab.rightText = "Продолжения сильнее и реальные фолды могут почти исчезнуть; тот же блокер не создаёт их заново.";
  }
}

function applyEnglishTransferPrompts() {
  patchDrill("preflop", "pre-02", {
    assumptions: ["200bb", "HJ opens", "CO calls", "Hero BTN 76s", "passive blinds", "no exact chart frequency is claimed for 76s"],
    cue: "200bb: HJ opens, CO calls, Hero is on the BTN with 76s, and the blinds are passive.",
    question: "First name the family of 76s and the traits that matter here. Then choose the action from position, depth, ranges and players behind.",
    explanation: "76s is a suited connector: suitedness and connectivity help realisation, but they do not choose the action. In this stated model, position, depth and passive blinds preserve the value of calling. 98s is a safe sibling example of the same family, not a new chart cell.",
  });
  patchDrill("preflop", "pre-03", {
    assumptions: ["100bb", "EP opens 4bb", "HJ calls", "Hero CO KJo", "both source ranges are stronger than a late-position open-plus-call", "no exact KJo chart boundary is claimed"],
    cue: "EP opens 4bb, HJ calls, and Hero is in the CO with KJo against two strong source ranges.",
    question: "First identify KJo's family and the traits that matter against these ranges. Then choose the action.",
    explanation: "KJo is offsuit Broadway: high-card and top-pair potential come with domination sensitivity and no suitedness benefit. In this model, range shape and realisation lead to the fold rather than a memorised 'KJo = fold' rule.",
  });
  patchDrill("preflop", "pre-04", {
    question: "The exercise premise already places A5s in the baseline mixed polar candidate set. Which frequency adjustment is supported once the open-plus-call is confirmed wide?",
    explanation: "A5s is a suited wheel ace: blocker, suitedness and wheel connectivity make it a useful representative of an existing polar branch, not a universal 'squeeze/4-bet bluff hand'. This item tests the downstream adjustment to wide entries, not whether A5s may be a candidate at all.",
  });

  patchDrill("ancestry", "anc-01", {
    assumptions: ["BTN opens wide", "BB 3-bets wider than baseline", "Hero BTN A5s", "no exact 4-bet frequency or chart cell is claimed"],
    cue: "BTN opens and BB uses a wide 3-bet; Hero holds A5s.",
    question: "What must be established before turning A5s into a 4-bet bluff?",
    explanation: "A5s supplies an ace blocker and suited-wheel traits, but those are not enough. First identify credible continuing value and better hands that can actually fold. The combo name does not manufacture a bluff.",
  });
  patchDrill("ancestry", "anc-02", {
    cue: "The same A5s now faces a very tight, almost bluff-free SB 3-bet after an early-position open.",
    question: "Which part of the new context breaks the familiar A5s idea?",
    explanation: "The combo is unchanged and A5s still has the same structural traits. The SB source range changed: almost no better hands actually fold. This is not 'A5s = bluff'; it is the same combo behaving differently across two source branches.",
  });
  patchDrill("ancestry", "anc-03", {
    assumptions: ["150bb", "Hero BTN versus a BB 3-bet", "Hero 98s", "exercise premise: 98s has a credible calling alternative; no exact chart frequency is claimed", "98s poorly blocks premium continues"],
    cue: "150bb BTN versus BB 3-bet with 98s. By exercise premise, the comparison includes a real calling alternative.",
    question: "First recognise 98s as a suited connector. Given the stated premise, what should be compared before turning it into a 4-bet bluff?",
    explanation: "98s is a suited connector in the same broad family as 76s. The exercise premise explicitly supplies a calling alternative because the tested inference is call realisation versus blocker/fold-target value, not an exact 98s chart cell.",
  });

  const ancestry = moduleById.ancestry;
  ancestry.counterexample = "Compare the same A5s across two branches: against a wide 3-bet, identify real folds before valuing the blocker; against a tight value-heavy range, those folds can disappear. The combo stays the same while bluff viability changes with context.";
  if (ancestry.lab.type === "compare") {
    ancestry.lab.title = "One A5s, two source branches";
    ancestry.lab.description = "Compare the same suited wheel ace against a wide 3-bet and a tight value-heavy range. The hand family is unchanged; the real fold targets are not.";
    ancestry.lab.leftTitle = "Wide 3-bet";
    ancestry.lab.leftText = "Identify which better hands can actually fold and which continue before using the blocker.";
    ancestry.lab.rightTitle = "Tight value-heavy 3-bet";
    ancestry.lab.rightText = "Continues are stronger and fold targets can nearly disappear; the same blocker cannot recreate them.";
  }
}

function applyRussianDistractorParity() {
  patchWrongOptions("preflop", "pre-01", "reason", [
    "Сила TT сама оправдывает 3-бет; точный диапазон продолжения и BB вторичны",
    "Минус позиции SB делает инициативу важнее цены колла и состава диапазонов",
  ]);
  patchWrongOptions("preflop", "pre-04", "reason", [
    "Без локальной выборки по fold-to-squeeze безопаснее сохранить базовый микс, несмотря на широкие входы",
    "Масть и потенциал натсового флеша A5s делают постфлоп-реализацию важнее дополнительного сквиза",
  ]);

  patchWrongOptions("blinds", "bli-01", "reason", [
    "Сухой A-high флоп важнее различий исходных SB- и BB-диапазонов",
    "После префлоп-колла диапазоны обоих блайндов достаточно похожи для общего c-bet плана",
  ]);
  patchWrongOptions("blinds", "bli-02", "reason", [
    "Инициатива и изоляция мёртвых денег важнее скидки BB и пассивной реализации",
    "Хорошей цены и сырого эквити достаточно; будущая реализация вторична",
  ]);

  patchWrongOptions("filtering", "fil-05", "action", [
    "Сохранить расширенный баррель-план на большинстве нейтральных тёрнов",
    "Вернуться к базовой линии без дополнительной подстройки сразу после любого колла",
  ]);
  patchWrongOptions("filtering", "fil-05", "reason", [
    "Рид на флопе можно переносить на нейтральные тёрны, пока доска резко не меняется",
    "Сам колл достаточно фильтрует диапазон, поэтому прошлый рид больше не нужен",
  ]);

  patchWrongOptions("shape", "sha-03", "action", [
    "Рейзить KTs чаще ради тонкого вэлью и защиты",
    "Коллить KTs главным образом как замаскированную сильную руку",
  ]);
  patchWrongOptions("shape", "sha-03", "reason", [
    "Сила KTs и защита важнее сохранения сильных рук внутри колл-диапазона",
    "Колл ценен главным образом тем, что маскирует силу KTs против будущих блефов",
  ]);

  patchWrongOptions("aggression", "agg-02", "action", [
    "Чекать среднюю часть и ставить в основном верх диапазона",
    "Сместить ставку к крупному полярному размеру",
  ]);
  patchWrongOptions("aggression", "agg-02", "reason", [
    "Средняя часть лучше реализуется через чек, поэтому широкая малая ставка перегружена",
    "Сильный диапазон лучше монетизировать крупным размером, а не частой малой ставкой",
  ]);
  patchWrongOptions("aggression", "agg-05", "action", [
    "Добавить часть средних готовых рук в пуш ради лишения эквити",
    "Перевести слабые коллы в блеф-рейзы, чтобы разгрузить пассивную ветку",
  ]);
  patchWrongOptions("aggression", "agg-05", "reason", [
    "Низкий SPR делает лишение эквити достаточным основанием добавить средние готовые руки в пуш",
    "Плохие коллы можно превратить в блеф-рейзы ещё до построения вэлью-ветки",
  ]);

  patchWrongOptions("ancestry", "anc-01", "action", [
    "Строить 4-бет прежде всего от туз-блокера и мастевой играбельности A5s",
    "Использовать саму ширину BB 3-бета как достаточную причину для давления",
  ]);
  patchWrongOptions("ancestry", "anc-01", "reason", [
    "Туз-блокер A5s уже даёт достаточно блеф-ценности против широкого 3-бета",
    "Ширина BB создаёт достаточно мёртвых денег для 4-бета без карты реальных фолдов",
  ]);
  patchWrongOptions("ancestry", "anc-02", "action", [
    "Считать главной проблемой слабую пятёрку в составе A5s",
    "Сократить блеф прежде всего из-за уже большого префлоп-банка",
  ]);
  patchWrongOptions("ancestry", "anc-02", "reason", [
    "Слабая пятёрка делает A5s плохим блефом независимо от исходного диапазона",
    "Большой префлоп-банк делает риск блефа важнее состава продолжающего диапазона",
  ]);
  patchWrongOptions("ancestry", "anc-03", "action", [
    "Сделать инициативу 4-бета приоритетнее благодаря масти и связности 98s",
    "Сместиться к фолду, потому что спекулятивная рука слишком хрупка после 3-бета",
  ]);
  patchWrongOptions("ancestry", "anc-03", "reason", [
    "Глубина усиливает связность 98s, поэтому инициатива 4-бета ценнее колла",
    "Будущее давление делает реализацию 98s слишком нестабильной для серьёзной колл-ветки",
  ]);

  patchWrongOptions("multiway", "mul-01", "action", [
    "Начать с heads-up нормы защиты Hero и уже затем поправить её на BB",
    "Сначала оценить уязвимость KQ на K-9-7, а диапазон BB учесть вторым шагом",
  ]);
  patchWrongOptions("multiway", "mul-01", "reason", [
    "Heads-up защита — полезная база; игрок за спиной лишь сдвигает готовую частоту",
    "На динамичной доске хрупкость одной пары важнее ещё не ответившего диапазона",
  ]);

  patchWrongOptions("evidence", "evi-03", "action", [
    "Использовать внешний ориентир по полю как рабочую базу до опровержения",
    "Оставаться на структурной базовой линии и не учитывать внешний ориентир без локальной выборки",
  ]);
  patchWrongOptions("evidence", "evi-03", "reason", [
    "Надёжный внешний ориентир по полю можно принять за рабочую базу до локального опровержения",
    "Без локальной выборки внешний ориентир лучше полностью исключить из текущей модели",
  ]);
}

function applyEnglishDistractorParity() {
  patchWrongOptions("preflop", "pre-01", "reason", [
    "TT is strong enough that exact continuing ranges and the BB behind are secondary",
    "SB's positional disadvantage makes initiative more important than call price and range composition",
  ]);
  patchWrongOptions("preflop", "pre-04", "reason", [
    "Without a local fold-to-squeeze sample, preserving the baseline mix is safer despite wide entries",
    "A5s suitedness and nut-flush potential make postflop realisation more valuable than extra squeezes",
  ]);

  patchWrongOptions("blinds", "bli-01", "reason", [
    "A dry A-high flop matters more than differences between the SB and BB source ranges",
    "After one preflop call, both blind ranges are similar enough for one c-bet plan",
  ]);
  patchWrongOptions("blinds", "bli-02", "reason", [
    "Initiative and dead-money isolation outweigh the BB discount and passive realisation",
    "Good price plus raw equity is enough; future realisation is secondary",
  ]);

  patchWrongOptions("filtering", "fil-05", "action", [
    "Keep the widened barrel plan on most neutral turns",
    "Return to baseline with no exploit premium immediately after any call",
  ]);
  patchWrongOptions("filtering", "fil-05", "reason", [
    "A flop folding read can carry to neutral turns until the board changes sharply",
    "The call filters the range enough that the earlier read should no longer matter",
  ]);

  patchWrongOptions("shape", "sha-03", "action", [
    "Raise KTs more often for thin value and protection",
    "Call KTs mainly to disguise a strong hand",
  ]);
  patchWrongOptions("shape", "sha-03", "reason", [
    "KTs strength and protection matter more than keeping strong hands in the calling range",
    "Calling is valuable mainly because it disguises KTs against future bluffs",
  ]);

  patchWrongOptions("aggression", "agg-02", "action", [
    "Check the middle and bet mainly the top of the range",
    "Shift toward a large polar betting size",
  ]);
  patchWrongOptions("aggression", "agg-02", "reason", [
    "The middle realises better through checks, so a wide small bet overloads the branch",
    "A stronger range monetises its advantage better with size than frequent small bets",
  ]);
  patchWrongOptions("aggression", "agg-05", "action", [
    "Add some medium made hands to the jam for equity denial",
    "Turn weak calls into bluff raises to unload the passive branch",
  ]);
  patchWrongOptions("aggression", "agg-05", "reason", [
    "Low SPR makes denial sufficient reason to add medium made hands to the jam",
    "Poor calls can become bluff raises before the value branch is fully mapped",
  ]);

  patchWrongOptions("ancestry", "anc-01", "action", [
    "Build the 4-bet mainly from A5s's ace blocker and suited playability",
    "Use the width of BB's 3-bet as sufficient reason to apply pressure",
  ]);
  patchWrongOptions("ancestry", "anc-01", "reason", [
    "A5s's ace blocker already supplies enough bluff value against a wide 3-bet",
    "BB's width creates enough dead money for a 4-bet without mapping actual folds",
  ]);
  patchWrongOptions("ancestry", "anc-02", "action", [
    "Treat the low five in A5s as the main problem",
    "Reduce the bluff mainly because the preflop pot is already large",
  ]);
  patchWrongOptions("ancestry", "anc-02", "reason", [
    "The low five makes A5s a poor bluff regardless of the source range",
    "The large preflop pot makes bluff risk more important than continuing-range composition",
  ]);
  patchWrongOptions("ancestry", "anc-03", "action", [
    "Prioritise 4-bet initiative because 98s is suited and connected",
    "Shift toward folding because a speculative hand is too fragile after a 3-bet",
  ]);
  patchWrongOptions("ancestry", "anc-03", "reason", [
    "Depth strengthens 98s connectivity, so 4-bet initiative is more valuable than calling",
    "Future pressure makes 98s realisation too unstable for a serious calling branch",
  ]);

  patchWrongOptions("multiway", "mul-01", "action", [
    "Start from Hero's heads-up defence target and adjust for BB afterward",
    "Judge KQ's vulnerability on K-9-7 first and account for BB second",
  ]);
  patchWrongOptions("multiway", "mul-01", "reason", [
    "Heads-up defence is a useful anchor; the player behind only shifts the target",
    "On a dynamic board, one-pair fragility matters more than the unacted range behind",
  ]);

  patchWrongOptions("evidence", "evi-03", "action", [
    "Use the source-backed population prior as the working default until contradicted",
    "Stay on structural baseline and ignore the external prior until a local sample exists",
  ]);
  patchWrongOptions("evidence", "evi-03", "reason", [
    "A reliable source-backed prior can serve as the field default until locally contradicted",
    "Without a local sample, the external prior should be removed from the current model",
  ]);
}

/**
 * Final bounded candidate repair after the full locale pipeline. This layer is
 * learner-facing copy only: stable IDs, correct-answer identities,
 * misconception mapping, scoring, scheduler, mastery and evidence semantics
 * remain untouched. It is machine/agent-reviewed candidate text, not human
 * poker or language approval.
 */
export function applyFinalLearningIntegrityClosure(locale: LocaleCode) {
  if (locale === "ru") {
    applyRussianHandFamilyScaffold();
    applyRussianTransferPrompts();
    applyRussianDistractorParity();
    return;
  }
  applyEnglishHandFamilyScaffold();
  applyEnglishTransferPrompts();
  applyEnglishDistractorParity();
}
