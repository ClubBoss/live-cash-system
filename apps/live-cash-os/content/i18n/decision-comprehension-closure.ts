import { moduleById } from "../modules";
import type { LocaleCode, ModuleId } from "../../lib/model";

type DrillPatch = Partial<{
  assumptions: string[];
  cue: string;
  question: string;
  explanation: string;
  actions: Record<string, string>;
  reasons: Record<string, string>;
}>;

function patchDrill(moduleId: ModuleId, drillId: string, patch: DrillPatch) {
  const drill = moduleById[moduleId].drills.find((item) => item.id === drillId);
  if (!drill) throw new Error(`Missing comprehension-closure drill ${drillId}`);
  if (patch.assumptions) drill.assumptions = [...patch.assumptions];
  if (patch.cue) drill.cue = patch.cue;
  if (patch.question) drill.question = patch.question;
  if (patch.explanation) drill.explanation = patch.explanation;
  for (const [id, text] of Object.entries(patch.actions ?? {})) {
    const option = drill.actionOptions.find((candidate) => candidate.id === id);
    if (!option) throw new Error(`Missing action option ${id}`);
    option.text = text;
  }
  for (const [id, text] of Object.entries(patch.reasons ?? {})) {
    const option = drill.reasonOptions.find((candidate) => candidate.id === id);
    if (!option) throw new Error(`Missing reason option ${id}`);
    option.text = text;
  }
}

function applyRussianDecisionComprehensionClosure() {
  patchDrill("preflop", "pre-01", {
    question: "Что здесь лучше рассматривать в первую очередь?",
    actions: { "pre-01-a1": "Пассивный колл как основной выбор" },
    explanation: "Здесь сквиз выигрывает из-за силы TT и структуры SB: он изолирует более слабые руки и уменьшает риск сквиза от BB. Это не означает, что TT нужно автоматически 3-бетить в любой похожей ситуации.",
  });
  patchDrill("preflop", "pre-02", {
    assumptions: ["200bb", "HJ открывается", "CO коллирует", "Hero BTN 76s", "блайнды пассивны"],
    question: "Сначала назови семейство 76s и его важные свойства. Затем выбери действие с учётом позиции, глубины и пассивных блайндов.",
    explanation: "76s — мастевая связка: масть и связность помогают реализации, но сами по себе не выбирают действие. Здесь позиция, глубина и низкий риск сквиза сохраняют ценность колла. 98s относится к тому же семейству, но конкретное действие каждый раз зависит от контекста.",
  });
  patchDrill("preflop", "pre-03", {
    assumptions: ["100bb", "EP открывается 4bb", "HJ коллирует", "Hero CO KJo", "оба исходных диапазона сильнее позднего открытия и колла"],
    cue: "EP открывается 4bb, HJ коллирует, Hero в CO с KJo против двух сильных диапазонов.",
    question: "Сначала классифицируй KJo и вспомни его слабые стороны против сильных диапазонов. Что делать здесь?",
    reasons: {
      "pre-03-r0": "Доминация и слабая реализация KJo против сильных продолжений перевешивают силу его старших карт",
      "pre-03-r1": "KJo всё ещё делает сильные топ-пары, поэтому может достаточно хорошо реализовать позицию",
    },
  });
  patchDrill("preflop", "pre-04", {
    assumptions: [
      "100bb",
      "поздняя позиция открывается шире обычного",
      "следующий игрок тоже коллирует широко",
      "Hero SB с A5s",
      "в базовом плане A5s иногда используется для сквиза",
      "нет рида, что соперники слишком часто продолжают против сквиза",
      "BB пассивный",
    ],
    cue: "Поздняя позиция открывается шире обычного, следующий игрок тоже коллирует широко. Hero в SB с A5s.",
    question: "Если A5s уже иногда используется для сквиза, что меняется против подтверждённо более широких входов?",
    reasons: { "pre-04-r0": "В более широких диапазонах больше слабых рук, поэтому уже подходящий кандидат можно сквизить чаще" },
    explanation: "A5s подходит для полярного сквиза благодаря туз-блокеру, масти и дополнительному эквити. Здесь вопрос не в том, можно ли сквизить A5s вообще, а в том, стоит ли делать это чаще против более широкого рейза и колла.",
  });
  patchDrill("blinds", "bli-01", {
    assumptions: ["CO открывается 3bb", "сухой флоп A-7-2 радугой", "сравнивается защита BB и холодный колл SB"],
    cue: "Один и тот же A-7-2 радугой после открытия CO: в одной раздаче соперник защищал BB, в другой коллировал из SB.",
  });
  patchDrill("blinds", "bli-04", {
    actions: { "bli-04-a2": "Рейзить, чтобы избежать сложных решений на тёрне" },
  });
  patchDrill("blinds", "bli-05", {
    reasons: { "bli-05-r2": "Теоретический диапазон лучше не менять по данным поля" },
  });
  patchDrill("filtering", "fil-02", {
    cue: "Соперник часто ставит небольшим размером.",
    actions: { "fil-02-a2": "Рейзить уязвимые пары" },
  });
  patchDrill("filtering", "fil-03", {
    explanation: "Чек — тоже фильтр. Его смысл зависит от того, насколько сильные руки соперник способен оставить в диапазоне чека.",
  });
  patchDrill("aggression", "agg-02", {
    assumptions: ["обычный сильный 3-бет-диапазон", "сухая старшая или спаренная доска", "премиальные пары и сильные руки со старшими картами чаще остаются у 3-беттора"],
    explanation: "Это направление, а не точная частота: сухая доска может сохранить настолько сильное преимущество 3-беттора, что небольшая частая ставка становится естественной.",
  });
  patchDrill("aggression", "agg-03", {
    cue: "Доска уравняла диапазоны сильнее, чем сухой флоп с тузом или спаренный флоп.",
    actions: {
      "agg-03-a0": "Она уступает место более селективному разделению ставок и чеков",
      "agg-03-a2": "Нужно сильно сместиться к чеку почти всем диапазоном",
    },
  });
  patchDrill("aggression", "agg-04", {
    reasons: { "agg-04-r2": "Колл удаляет сильные руки и оставляет только руки средней силы" },
  });
  patchDrill("ancestry", "anc-01", {
    assumptions: ["BTN открывается широко", "BB 3-бетит заметно шире обычного", "Hero BTN A5s"],
    explanation: "A5s даёт туз-блокер, масть и связность, но этого недостаточно: для 4-бет-блефа нужны правдоподобное вэлью-продолжение и реальные более сильные руки, которые могут сфолдить.",
  });
  patchDrill("ancestry", "anc-02", {
    explanation: "Комбо A5s не изменилось; изменился диапазон SB. Против очень тайтового 3-бета почти нет более сильных рук, которые реально сфолдят, поэтому ценность 4-бет-блефа резко падает.",
  });
  patchDrill("ancestry", "anc-03", {
    assumptions: ["150bb", "Hero BTN против BB 3-бета", "Hero 98s", "колл остаётся реальной альтернативой", "98s слабо блокирует премиальные продолжения"],
    cue: "150bb. BTN открыл, BB 3-бетит, Hero на BTN с 98s. Колл остаётся реальной альтернативой.",
    question: "Что нужно сравнить прежде, чем превращать 98s в 4-бет-блеф?",
    explanation: "98s — мастевая связка. На такой глубине и в позиции колл может хорошо реализовать её свойства. 4-бет должен выигрывать достаточно от фолдов, чтобы не сжигать более ценную колл-линию.",
  });
  patchDrill("ancestry", "anc-05", {
    reasons: {
      "anc-05-r1": "Старший блокер по умолчанию лучший блеф-кетчер",
      "anc-05-r2": "Очень большая ставка обычно содержит достаточно блефов для колла",
    },
  });
  patchDrill("multiway", "mul-01", {
    assumptions: ["HJ открывается, BTN и BB коллируют", "флоп K-9-7 с двумя картами одной масти", "HJ ставит", "Hero BTN KQ", "BB ещё не действовал"],
    cue: "Три игрока на K-9-7 с двумя картами одной масти: HJ ставит, Hero на BTN с KQ, BB остаётся за спиной.",
    question: "Что нужно проверить прежде, чем автоматически защищать KQ?",
  });
  patchDrill("multiway", "mul-02", {
    assumptions: ["та же KQ на K-9-7 с двумя картами одной масти", "теперь Hero действует последним после ставки и колла"],
    cue: "Та же KQ на K-9-7 с двумя картами одной масти, но теперь Hero закрывает торговлю после ставки и колла.",
  });
  patchDrill("multiway", "mul-03", {
    actions: { "mul-03-a1": "Отдать доску BB как самому широкому диапазону" },
  });
  patchDrill("multiway", "mul-05", {
    assumptions: ["блайнд несколько раз показал широкий оверколл в этой префлоп-линии", "наблюдение относится именно к этой линии"],
    actions: { "mul-05-a0": "Локально обновить диапазон именно этого оверколла" },
    reasons: {
      "mul-05-r0": "Рид локально меняет диапазон этого оверколла",
      "mul-05-r1": "Практические риды не должны менять базовый план",
    },
  });
  patchDrill("river", "riv-03", {
    reasons: { "riv-03-r2": "Большой размер обычно содержит достаточно блефов для колла" },
  });
  patchDrill("evidence", "evi-03", {
    actions: {
      "evi-03-a0": "Играть базово, а внешнюю тенденцию использовать как подсказку, что наблюдать",
      "evi-03-a1": "Сразу подстроиться так, будто тенденция уже подтверждена за этим столом",
      "evi-03-a2": "Полностью игнорировать внешние данные, пока не накопится большая локальная выборка",
    },
    reasons: {
      "evi-03-r0": "Внешние данные задают направление наблюдения, но не доказывают локальную частоту",
      "evi-03-r1": "Достаточно надёжный общий рид можно сразу считать точным для текущего стола",
      "evi-03-r2": "Без большой локальной выборки внешняя информация не должна влиять даже на то, что мы наблюдаем",
    },
  });
  patchDrill("transfer", "tra-01", {
    assumptions: ["проверяется тот же механизм", "изменилась важная переменная: страддл или игрок за спиной"],
    question: "Что покажет, что принцип действительно перенесён?",
    explanation: "Перенос означает, что при изменении важной переменной ты заново учитываешь её, но сохраняешь тот же причинный принцип.",
  });
  patchDrill("transfer", "tra-04", {
    reasons: {
      "tra-04-r0": "Одна успешная коррекция ещё не доказывает удержание навыка",
      "tra-04-r1": "Одна новая задача полностью закрывает прежнюю ошибку",
    },
  });
  patchDrill("transfer", "tra-05", {
    question: "Какой статус навыка теперь оправдан?",
    explanation: "Только сочетание нескольких разобранных реальных рук, удержания после паузы и переноса на изменённую ситуацию оправдывает статус «Подтверждено в реальной игре». Один удачный эпизод этого не доказывает.",
  });
}

function applyEnglishDecisionComprehensionClosure() {
  patchDrill("preflop", "pre-01", {
    question: "Which line should be considered first here?",
    explanation: "Squeezing is the leading candidate because TT is strong and the SB structure rewards isolation while reducing the BB's re-squeeze risk. This does not mean TT is an automatic 3-bet in every similar spot.",
  });
  patchDrill("preflop", "pre-02", {
    assumptions: ["200bb", "HJ opens", "CO calls", "Hero BTN 76s", "passive blinds"],
    question: "Name the family of 76s and its relevant traits first, then choose the action using position, depth and the passive blinds.",
    explanation: "76s is a suited connector: suitedness and connectivity help realisation, but they do not choose the action by themselves. Here, position, depth and low squeeze risk preserve the value of calling. 98s belongs to the same family, but its action still depends on context.",
  });
  patchDrill("preflop", "pre-03", {
    assumptions: ["100bb", "EP opens 4bb", "HJ calls", "Hero CO KJo", "the opener and caller ranges are both stronger than a late-position open-plus-call"],
    question: "Classify KJo and recall its weaknesses against strong ranges. What should Hero do here?",
  });
  patchDrill("preflop", "pre-04", {
    assumptions: ["100bb", "late position opens wider than usual", "the next player also calls wide", "Hero SB A5s", "A5s is already used sometimes as a squeeze in the baseline plan", "no read that either player over-continues versus squeezes", "passive BB"],
    cue: "Late position opens wider than usual and the next player also calls wide. Hero is in the SB with A5s.",
    question: "If A5s is already used sometimes as a squeeze, what changes against confirmed wider entries?",
    reasons: { "pre-04-r0": "Wider entry ranges contain more weak hands, so an already suitable bluff candidate can squeeze more often" },
    explanation: "A5s can fit a polar squeeze because of its ace blocker, suitedness and extra equity. The question is not whether A5s can ever squeeze; it is whether confirmed wider opening and calling ranges support doing it more often.",
  });
  patchDrill("blinds", "bli-01", {
    assumptions: ["CO opens 3bb", "dry A-7-2 rainbow flop", "compare a BB defend with an SB cold-call"],
  });
  patchDrill("aggression", "agg-02", {
    explanation: "This is a direction rather than an exact frequency: a dry board can preserve enough of the 3-bettor's premium advantage for a frequent small bet to be natural.",
  });
  patchDrill("ancestry", "anc-01", {
    assumptions: ["BTN opens wide", "BB 3-bets noticeably wider than usual", "Hero BTN A5s"],
    explanation: "A5s has an ace blocker, suitedness and wheel connectivity, but that is not enough by itself: a 4-bet bluff still needs a credible value region and genuinely stronger hands that can fold.",
  });
  patchDrill("ancestry", "anc-02", {
    explanation: "The A5s combo is unchanged; the SB range changed. Against a very tight 3-bet there are few stronger hands that can actually fold, so the value of the 4-bet bluff drops sharply.",
  });
  patchDrill("ancestry", "anc-03", {
    assumptions: ["150bb", "Hero BTN versus a BB 3-bet", "Hero 98s", "calling remains a real alternative", "98s weakly blocks premium continues"],
    cue: "150bb. BTN opened, BB 3-bets, and Hero is on the BTN with 98s. Calling remains a real alternative.",
    question: "What should Hero compare before turning 98s into a 4-bet bluff?",
    explanation: "98s is a suited connector. At this depth and in position, calling can realise its properties well. A 4-bet needs enough value from folds to justify giving up a more valuable calling line.",
  });
  patchDrill("transfer", "tra-01", {
    assumptions: ["the same mechanism is being tested", "one material variable changed: the straddle or a player behind"],
    question: "What would show that the principle actually transferred?",
    explanation: "Transfer means recalculating the changed variable while preserving the same causal principle.",
  });
  patchDrill("transfer", "tra-05", {
    question: "Which skill status is justified now?",
    explanation: "Only the combination of multiple reviewed real hands, retention after a delay and transfer to a changed spot justifies a field-validated status. One successful episode cannot prove that by itself.",
  });
}

export function applyDecisionComprehensionClosure(locale: LocaleCode) {
  if (locale === "ru") applyRussianDecisionComprehensionClosure();
  else applyEnglishDecisionComprehensionClosure();
}
