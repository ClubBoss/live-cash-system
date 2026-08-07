import { moduleById } from "../modules";
import type { LocaleCode } from "../../lib/model";

function setDrill(
  moduleId: keyof typeof moduleById,
  drillId: string,
  copy: Partial<{
    assumptions: string[];
    cue: string;
    question: string;
    actions: [string, string, string];
    reasons: [string, string, string];
    explanation: string;
  }>,
) {
  const drill = moduleById[moduleId].drills.find((item) => item.id === drillId);
  if (!drill) throw new Error(`Missing drill ${drillId}`);
  if (copy.assumptions) drill.assumptions = [...copy.assumptions];
  if (copy.cue) drill.cue = copy.cue;
  if (copy.question) drill.question = copy.question;
  if (copy.actions) drill.actionOptions.forEach((option, index) => { option.text = copy.actions![index]; });
  if (copy.reasons) drill.reasonOptions.forEach((option, index) => { option.text = copy.reasons![index]; });
  if (copy.explanation) drill.explanation = copy.explanation;
}

function setCard(moduleId: keyof typeof moduleById, cardId: string, front: string, back: string) {
  const card = moduleById[moduleId].flashcards.find((item) => item.id === cardId);
  if (!card) throw new Error(`Missing card ${cardId}`);
  card.front = front;
  card.back = back;
}

function applyRussianPokerNative() {
  const preflop = moduleById.preflop;
  Object.assign(preflop, {
    scope: "Практическая логика live cash. Точные комбинации и частоты зависят от позиций, глубины, размера открытия, рейка и игроков за спиной.",
    workedExample: {
      ...preflop.workedExample,
      situation: "200bb. HJ открывается, CO коллирует, Hero на BTN с мастевой связкой у нижней границы обычного колла; блайнды пассивны.",
    },
  });
  setDrill("preflop", "pre-02", {
    assumptions: ["200bb", "HJ открывается", "CO коллирует", "Hero BTN", "мастевая связка у нижней границы обычного колла", "блайнды пассивны"],
  });
  setDrill("preflop", "pre-04", {
    assumptions: ["100bb", "широкое позднее открытие", "широкий колл", "Hero в SB", "рука, которую базовая стратегия иногда использует как полярный 3-бет", "BB пассивный"],
    cue: "Соперники входят слишком широко, а у Hero уже есть рука, подходящая для полярного 3-бета.",
    question: "Как расширять сквиз без случайных новых блефов?",
    actions: ["Чаще 3-бетить этим уже подходящим кандидатом", "Добавить любые мастевые руки, которые выглядят играбельно", "Убрать все блефы и 3-бетить только премиумы"],
    reasons: ["Подстройка усиливает уже логичную ветку с fold equity и играбельностью, не добавляя случайную часть диапазона", "Масть сама гарантирует прибыль после колла", "Широкие входные диапазоны соперников всегда означают, что они никогда не фолдят на 3-бет"],
    explanation: "Когда соперники входят слишком широко, чаще выбирай 3-бет теми руками, которые уже подходят для него, вместо случайного расширения блефов.",
  });

  const shape = moduleById.shape;
  shape.scope = "Практическая логика сайзинга и ответа. Точные размеры, частоты и смешанные действия зависят от конкретной ситуации.";
  shape.technicalTerm = "Широкая маленькая ставка, полярная крупная ставка и сильные руки, которые остаются в колле.";

  const aggression = moduleById.aggression;
  aggression.technicalTerm = "Ширина 3-бет-диапазона, частота c-bet, выборочная ставка и верх диапазона для OOP-рейза.";
  aggression.theory[0] = "Префлоп-подстройка продолжается после флопа. Если игрок 3-бетит заметно шире обычного, в его диапазоне становится больше слабых рук, поэтому часть из них должна чаще уходить в чек.";
  aggression.workedExample = {
    ...aggression.workedExample,
    answer: "Не защищайся как против обычного сильного 3-бет-диапазона: сначала проверь, стал ли широкий 3-беттор чаще чекать слабую часть.",
  };
  setDrill("aggression", "agg-01", {
    actions: ["Защищаться шире базовой линии", "Фолдить как против сильного нормального 3-бет-диапазона", "Рейзить любую пару"],
    reasons: ["Соперник добавил слабые руки префлоп, но не снизил частоту c-bet, поэтому в ставке стало больше воздуха", "3-бет всегда означает одинаковую силу диапазона", "Частая ставка автоматически делает любой рейз прибыльным"],
    explanation: "Если широкий 3-беттор не начинает чаще чекать слабую часть, его частая c-bet содержит больше воздуха и позволяет защищаться шире.",
  });
  setDrill("aggression", "agg-02", {
    assumptions: ["200bb", "тот же широкий префлоп 3-бет", "но флоп-соперник часто чекал и ставит только выбранную сильную/полярную часть"],
    cue: "Широкий префлоп-диапазон есть, но флоп-агрессия уже стала выборочной.",
    question: "Можно ли автоматически продолжать шире только из-за широкого 3-бета префлоп?",
  });
  setDrill("aggression", "agg-04", {
    question: "Что нужно проверить перед крупным OOP-рейзом или пушем?",
    actions: ["Есть ли достаточно сильное вэлью и подходящие блефы для этого размера", "Достаточно ли неприятен будущий тёрн", "Есть ли у Hero хоть какое-то эквити"],
  });

  const ancestry = moduleById.ancestry;
  ancestry.scope = "Практическое восстановление диапазона по всей линии. Точные комбинации и частоты зависят от позиций, сайзингов и предыдущих решений.";
  ancestry.technicalTerm = "Откуда пришёл диапазон, какие руки дошли до этой точки и что реально блокирует Hero.";

  const multiway = moduleById.multiway;
  multiway.scope = "Практическая логика мультивея. Точные частоты защиты зависят от позиций, цены и конкретных диапазонов.";
  multiway.technicalTerm = "Игрок за спиной, закрытие торговли, общая защита банка и владение сильнейшими комбинациями.";

  const river = moduleById.river;
  river.scope = "Практический разбор bluff-catch на ривере. Точные частоты и EV зависят от конкретной линии и соперника.";
  river.technicalTerm = "Вэлью соперника, естественные блефы, размер ставки и влияние блокеров.";
}

function applyEnglishTransferNative() {
  const module = moduleById.transfer;
  Object.assign(module, {
    title: "From understanding to real-table use",
    shortTitle: "Know it now, remember it later, use it live",
    description: "A lesson can feel clear immediately and still fail later. The trainer checks the idea again in a changed spot, after a delay, and in reviewed real hands.",
    scope: "This module explains how the trainer separates immediate understanding, later recall and real-table use. Its current thresholds are product rules, not universal definitions of mastery.",
    plainGoal: "Know what still needs to happen after a correct answer before you can trust the skill at the table.",
    tableCue: "Changed spot → later recall → reviewed real hand.",
    technicalTerm: "Transfer to a changed spot, delayed recall and reviewed real-hand use.",
    theory: [
      "Finishing a lesson means you have seen the idea. It does not yet show that you can use it independently.",
      "The next check changes an important detail—position, depth, sizing or action order—and asks you to rebuild the decision instead of repeating the old answer.",
      "A correct answer immediately after feedback is useful, but the idea still needs to be recalled after a real delay.",
      "A real hand starts as a note. It supports the skill only after the reasoning is reviewed, and one hand is not enough on its own.",
    ],
    heuristics: [
      "Use the same idea when one important detail changes.",
      "Check it again later, not only while the explanation is fresh.",
      "Judge the decision made before the result, not whether the pot was won.",
    ],
    decisionTree: [
      "Name the exact idea or recurring mistake.",
      "Solve a similar spot with one important detail changed.",
      "Recall the idea again after a real delay.",
      "Record a real hand: what you noticed, what you did and why.",
      "Review several real hands before calling the skill reliable at the table.",
    ],
    workedExample: {
      situation: "Hero answers correctly one minute after reading the explanation.",
      steps: [
        "The correction is available right now.",
        "A changed position or stack depth checks whether Hero can rebuild the idea.",
        "A later review checks whether the idea can still be recalled without the fresh explanation.",
      ],
      answer: "Immediate improvement is useful, but it is not yet later recall or real-table use.",
    },
    counterexample: "Even a winning live hand does not prove the skill if the decision used the wrong reason or the important cue was noticed only after the result.",
    lab: {
      type: "compare" as const,
      title: "Four different checks",
      description: "Compare events that can feel similar but answer different questions.",
      leftTitle: "Right after learning",
      leftText: "Shows that the idea is available now, while the explanation is still fresh.",
      rightTitle: "Changed spot + delay + real play",
      rightText: "Separately checks adaptation, later recall and use in reviewed hands.",
    },
    explainBackPrompt: "Explain why a correct answer now, a correct answer in a changed spot, later recall and a reviewed real hand are four different things.",
    tableCard: ["Correct now", "Changed spot", "Recall later", "Real hand", "Review before trust"],
    glossary: [
      { term: "Transfer", meaning: "Using the same idea after an important part of the situation changes." },
      { term: "Delayed recall", meaning: "Retrieving the idea again after a real pause." },
      { term: "Reviewed real-hand support", meaning: "A real hand whose pre-result reasoning was reviewed and supports the trained idea." },
    ],
  });

  setDrill("transfer", "tra-01", {
    assumptions: ["same underlying idea", "an important detail such as straddle or a player behind changes", "the task is meant to test adaptation"],
    cue: "The spot looks familiar, but the decision structure has genuinely changed.",
    question: "What shows that the idea transferred?",
    actions: ["Recalculate the changed part while keeping the same underlying logic", "Repeat the memorised answer", "Treat every change as a completely new skill"],
    reasons: ["Good transfer keeps the causal rule and updates the details that actually changed", "Similar cards guarantee the same action", "Any difference makes earlier learning useless"],
    explanation: "The point is to rebuild the decision when a meaningful variable changes, not to recognise the old answer.",
  });
  setDrill("transfer", "tra-02", {
    assumptions: ["answer is correct immediately after feedback", "the later review has not happened yet"],
    cue: "The correction was just shown and the next answer is already correct.",
    question: "What is still unproven?",
    actions: ["That the idea can be recalled after a delay", "Nothing; the skill is already proven", "Only higher subjective confidence"],
    reasons: ["Fresh feedback can support immediate performance; later recall is a separate check", "Any correct answer proves long-term memory", "Confidence replaces the need to test later"],
    explanation: "Being right now and remembering later are different achievements.",
  });
  setDrill("transfer", "tra-03", {
    assumptions: ["a real hand is saved", "what Hero noticed, did and thought is recorded", "the hand has not been reviewed"],
    cue: "The real hand is documented, but the reasoning has not been checked yet.",
    question: "What must happen before the hand supports the skill?",
    actions: ["Review the reasoning against the trained idea", "Merely record the hand", "Win money in the hand"],
    reasons: ["Playing a hand does not by itself prove that the decision process was sound", "Any live attempt proves transfer", "Winning the pot proves the reasoning was correct"],
    explanation: "A real hand becomes useful evidence only after the decision made before the result is reviewed.",
  });
  setDrill("transfer", "tra-04", {
    assumptions: ["one new correction exercise is passed after an error", "no later review yet"],
    cue: "The correction worked on one fresh example.",
    question: "What does this result show?",
    actions: ["The correction works now, but later recall is still untested", "The whole module is now durable", "The earlier error is erased"],
    reasons: ["A stronger conclusion needs a changed situation and a later recall check", "One repair exercise fixes the misconception forever", "One new correct answer outweighs all earlier history"],
    explanation: "A successful correction is progress, but it does not erase earlier mistakes or prove later recall.",
  });
  setDrill("transfer", "tra-05", {
    assumptions: ["two different reviewed real hands support the decision", "later recall has passed", "a changed-spot check has passed"],
    cue: "The idea has now survived independent checks in study and real play.",
    question: "What can the trainer reasonably say now?",
    actions: ["The skill has supporting evidence from real play", "One raw hand would have been enough", "Only that the lesson was opened"],
    reasons: ["Several reviewed hands plus later recall and adaptation provide stronger support than any one event", "One winning pot proves mastery", "Practice after the lesson should not change what the trainer knows"],
    explanation: "The trainer can now treat the skill as supported in real play, while still allowing future evidence to change that conclusion.",
  });

  setCard("transfer", "tra-card-levels", "What still comes after a correct answer now?", "Changed spot → later recall → reviewed use at the table.");
  setCard("transfer", "tra-card-delay", "Why is an immediate correction not later recall?", "The explanation is still fresh; recall needs a separate check after a pause.");
  setCard("transfer", "tra-card-field", "When does a real hand support the skill?", "After the pre-result reasoning is reviewed—not because the pot was won.");
}

function applyEnglishPokerNative() {
  const preflop = moduleById.preflop;
  preflop.scope = "Practical live-cash decision logic. Exact combinations and frequencies depend on position, depth, open size, rake and players behind.";
  preflop.workedExample = {
    ...preflop.workedExample,
    situation: "200bb. HJ opens, CO calls, Hero is on the BTN with a suited connector near the bottom of the normal calling range; the blinds are passive.",
  };
  setDrill("preflop", "pre-02", {
    assumptions: ["200bb", "HJ opens", "CO calls", "Hero BTN", "suited connector near the bottom of a normal calling range", "passive blinds"],
  });
  setDrill("preflop", "pre-04", {
    assumptions: ["100bb", "wide late-position open", "wide call", "Hero SB", "hand is a polar 3-bet candidate that baseline sometimes mixes", "passive BB"],
    cue: "The field enters too wide and Hero already has a hand that naturally fits the polar 3-bet region.",
    question: "How should the squeeze range expand without inventing random bluffs?",
    actions: ["3-bet this existing candidate more often", "Add any suited hand that looks playable", "Remove all bluffs and 3-bet only premiums"],
    reasons: ["The adjustment increases frequency with a hand that already has fold equity and playability instead of adding a new arbitrary region", "Being suited guarantees profit after a call", "Wide entry ranges mean opponents never fold to a 3-bet"],
    explanation: "Against overly wide entry ranges, increase 3-bet frequency with hands already suited to the job instead of creating random new bluffs.",
  });

  const filtering = moduleById.filtering;
  filtering.scope = "Practical range reconstruction. Exact combinations depend on the starting range, positions, sizing and the actual line.";
  filtering.technicalTerm = "Range filtering: which hands can still be present at the current decision.";
  filtering.glossary = filtering.glossary.map((entry) => entry.term === "Arriving range"
    ? { term: "Current range", meaning: "The hands that can realistically survive the earlier actions and still be present now." }
    : entry);

  const shape = moduleById.shape;
  shape.scope = "Practical sizing and defence logic. Exact sizes, frequencies, mixed actions and combo thresholds remain spot-specific.";

  const aggression = moduleById.aggression;
  aggression.scope = "Practical 3-bet-pot logic without fixed solver frequencies. Exact board and sizing mixes require spot-specific source review.";
  aggression.technicalTerm = "Preflop range width, c-bet frequency, selective betting and the value needed for a large OOP raise.";
  aggression.theory[0] = "A preflop adjustment carries into postflop. If a player 3-bets much wider than normal, more weak hands reach the flop, so some of that extra width should show up as more checks.";
  aggression.workedExample = {
    ...aggression.workedExample,
    answer: "Do not defend as if the range were still a normal strong 3-bet range. First ask whether the wider 3-bettor actually checks more of the extra weak hands.",
  };
  setDrill("aggression", "agg-01", {
    reasons: ["The range became weaker preflop but the c-bet frequency did not fall, so the bet contains more air", "A 3-bet always represents the same strength", "A frequent bet makes every raise profitable"],
    explanation: "If a wider 3-bettor keeps the old high c-bet frequency, more weak hands remain inside the bet and defence can expand.",
  });
  setDrill("aggression", "agg-04", {
    question: "What must be checked before a large OOP raise or shove?",
  });

  const ancestry = moduleById.ancestry;
  ancestry.scope = "Reconstruct the line from preflop to the current decision. Exact combinations and frequencies depend on positions, sizings and earlier actions.";
  ancestry.technicalTerm = "Where the range started, which hands survived the line, and what Hero actually blocks.";

  const multiway = moduleById.multiway;
  multiway.scope = "Practical multiway logic. Exact defence frequencies depend on positions, price and the actual ranges involved.";
  multiway.technicalTerm = "Player behind, closing the action, shared defence and who holds more of the strongest hands.";

  const river = moduleById.river;
  river.scope = "Practical river bluff-catch process. Exact frequencies and EV depend on the line and opponent.";
  river.technicalTerm = "Villain's value, realistic bluffs, bet size and blocker effects.";

  const evidence = moduleById.evidence;
  evidence.scope = "Use reads only where they were actually observed. Outside-course population ideas can guide attention, but exact Batumi frequencies remain unproven until local hands support them.";
  evidence.technicalTerm = "A read tied to a specific line, a confidence level, and the observation that would weaken it.";
  setDrill("evidence", "evi-03", {
    assumptions: ["a trusted course suggests a population tendency", "no local Batumi sample yet"],
    cue: "A course suggests a possible field tendency, but the current game has not produced local evidence yet.",
    actions: ["Use the normal baseline and keep the external tendency at limited confidence", "Treat the population tendency as proven immediately", "Discard every outside prior"],
    reasons: ["The source tells you what to watch for, while the size of the leak in a new pool is still unknown", "Population tendencies are identical in every game", "Without local data no reasonable prior can exist"],
    explanation: "The mechanism can be credible while the size of the population leak in this game remains unproven.",
  });

  applyEnglishTransferNative();
}

export function applyWave4RPokerNativeLocale(locale: LocaleCode) {
  if (locale === "ru") applyRussianPokerNative();
  else applyEnglishPokerNative();
}
