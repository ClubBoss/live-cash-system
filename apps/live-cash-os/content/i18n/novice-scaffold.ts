import { moduleById } from "../modules";
import type { LocaleCode, ModuleId } from "../../lib/model";

export type NoviceTerm = {
  term: string;
  meaning: string;
};

const ESSENTIAL_TERMS: Partial<Record<ModuleId, Record<LocaleCode, NoviceTerm[]>>> = {
  geometry: {
    ru: [
      {
        term: "Эффективный стек",
        meaning: "Меньший из стека Hero и стека конкретного соперника. В мультивее считай его отдельно против каждого релевантного игрока.",
      },
      {
        term: "SPR",
        meaning: "Отношение оставшегося стека к банку. Чем ниже SPR, тем меньше стека осталось относительно банка и тем меньше глубины будущих решений; чем выше SPR, тем больше. Фиксированные пороги здесь не нужны.",
      },
      {
        term: "Шансы банка / цена колла",
        meaning: "Сколько текущий колл стоит относительно итогового банка после колла. Полный быстрый расчёт будет в следующей теме.",
      },
    ],
    en: [
      {
        term: "Effective stack",
        meaning: "The smaller of Hero's stack and the specific opponent's stack. In a multiway pot, calculate it separately against each relevant player.",
      },
      {
        term: "SPR",
        meaning: "The remaining stack divided by the pot. Lower SPR means less stack remains relative to the pot and less future decision depth; higher SPR means more. No fixed thresholds are needed here.",
      },
      {
        term: "Pot odds / call price",
        meaning: "How much the current call costs relative to the final pot after calling. The full quick calculation comes in the next topic.",
      },
    ],
  },
  preflop: {
    ru: [
      {
        term: "Диапазон",
        meaning: "Набор рук, с которыми игрок может прийти в эту точку решения.",
      },
      {
        term: "Эквити",
        meaning: "Доля банка, которая в среднем принадлежит руке или диапазону против заданного диапазона с учётом возможных исходов.",
      },
      {
        term: "Реализация эквити",
        meaning: "То, какую часть своего эквити рука реально сохраняет через будущие решения. Иметь эквити не значит автоматически суметь его реализовать.",
      },
      {
        term: "Доминация",
        meaning: "Ситуация, где две руки часто попадают в похожую сильную комбинацию, но у одной системно сильнее кикер или старшая часть руки.",
      },
      {
        term: "Блокер",
        meaning: "Карта у Hero уменьшает число комбинаций с этой картой у соперника. Сам по себе блокер не создаёт фолды.",
      },
      {
        term: "Полярный сквиз",
        meaning: "Сквиз, где рядом с сильным вэлью есть отдельные блеф-кандидаты. Это описание формы диапазона, а не готовая частота.",
      },
    ],
    en: [
      {
        term: "Range",
        meaning: "The set of hands a player can arrive at this decision point with.",
      },
      {
        term: "Equity",
        meaning: "The average share of the pot a hand or range owns against a specified range across possible outcomes.",
      },
      {
        term: "Equity realisation",
        meaning: "How much of that equity the hand can actually preserve through future decisions. Having equity does not mean you can automatically realise all of it.",
      },
      {
        term: "Domination",
        meaning: "A situation where two hands often make a similar strong hand, but one systematically has the better kicker or higher component.",
      },
      {
        term: "Blocker",
        meaning: "A card in Hero's hand reduces the number of combinations containing that card in Villain's range. A blocker does not create folds by itself.",
      },
      {
        term: "Polar squeeze",
        meaning: "A squeeze range with strong value plus separate bluff candidates. It describes range shape, not a prescribed frequency.",
      },
    ],
  },
  aggression: {
    ru: [
      {
        term: "Низкий SPR",
        meaning: "Банк уже велик относительно оставшегося стека, поэтому по размеру стека впереди меньше глубины решений. Это направление, а не фиксированный порог и не готовое правило действия.",
      },
    ],
    en: [
      {
        term: "Low SPR",
        meaning: "The pot is already large relative to the remaining stack, so there is less future decision depth by stack size. This is directional meaning, not a fixed threshold or an action rule.",
      },
    ],
  },
};

export const CALL_PRICE_SCAFFOLD: Record<LocaleCode, {
  why: string;
  what: string;
  formula: string;
  shortcut: string;
  example: string;
}> = {
  ru: {
    why: "Цена колла показывает, сколько ты вкладываешь сейчас относительно банка, который будет разыгрываться после колла.",
    what: "Pot odds / цена колла — доля итогового банка, которую составляет сумма твоего колла.",
    formula: "Цена колла = колл / (банк после ставки соперника + твой колл).",
    shortcut: "За столом: прибавь свой колл к текущему банку, округли числа при необходимости и оцени, какую долю итогового банка составляет колл.",
    example: "Пример: после ставки соперника в банке 150, колл стоит 50. После колла будет 200, значит цена = 50 / 200 = 25%. Это измеряет цену; формула сама не выбирает действие.",
  },
  en: {
    why: "Call price tells you how much you invest now relative to the pot that will be contested after you call.",
    what: "Pot odds / call price are the share of the final pot represented by your call amount.",
    formula: "Call price = call / (pot after Villain's bet + your call).",
    shortcut: "At the table: add your call to the current pot, round if useful, then estimate what share of that final pot your call represents.",
    example: "Example: after Villain bets, the pot is 150 and the call costs 50. The pot after calling is 200, so the price is 50 / 200 = 25%. This measures the price; the formula does not choose an action by itself.",
  },
};

export function callPriceFraction(potAfterBet: number, callAmount: number): number {
  const finalPot = potAfterBet + callAmount;
  if (potAfterBet < 0 || callAmount < 0 || finalPot <= 0) return 0;
  return callAmount / finalPot;
}

export function essentialTermsFor(moduleId: ModuleId, locale: LocaleCode): NoviceTerm[] {
  const explicit = ESSENTIAL_TERMS[moduleId]?.[locale];
  if (explicit) return explicit;
  return moduleById[moduleId].glossary.slice(0, 3).map((item) => ({ term: item.term, meaning: item.meaning }));
}

function optionText(moduleId: ModuleId, drillId: string, optionId: string, text: string) {
  const drill = moduleById[moduleId].drills.find((item) => item.id === drillId);
  const option = drill ? [...drill.actionOptions, ...drill.reasonOptions].find((item) => item.id === optionId) : undefined;
  if (option) option.text = text;
}

function cardText(moduleId: ModuleId, cardId: string, front: string, back: string) {
  const card = moduleById[moduleId].flashcards.find((item) => item.id === cardId);
  if (!card) return;
  card.front = front;
  card.back = back;
}

/**
 * Bounded N1 learner-language repair. This runs after the existing locale corpus
 * has been applied. It changes copy only: stable module/drill/card/option IDs,
 * correct-answer IDs, strategy meaning, scheduler order and evidence contracts
 * remain untouched. Content Authority remains pending.
 */
export function applyNoviceTerminologyCopy(locale: LocaleCode) {
  const preflop = moduleById.preflop;
  const blinds = moduleById.blinds;
  const filtering = moduleById.filtering;
  const multiway = moduleById.multiway;

  if (locale === "ru") {
    preflop.technicalTerm = "Архитектура preflop-диапазона: линейный/вэлью-сквиз, полярный сквиз и защищённый колл.";
    optionText("preflop", "pre-01", "pre-01-a0", "Сквиз на вэлью");
    optionText("preflop", "pre-03", "pre-03-r0", "Сильные исходные диапазоны, доминация и слабая реализация эквити в мультивее перевешивают поверхностный эффект блокера");
    const pre03 = preflop.drills.find((item) => item.id === "pre-03");
    if (pre03) pre03.explanation = "Решение следует из исходных диапазонов и риска доминации в этой ситуации.";

    blinds.technicalTerm = "Откуда пришёл диапазон, закрытие торговли и реализация эквити.";
    if (blinds.heuristics[0]) blinds.heuristics[0] = "Сначала назови, откуда пришёл диапазон.";
    if (blinds.tableCard[0]) blinds.tableCard[0] = "Откуда пришёл диапазон";
    optionText("blinds", "bli-01", "bli-01-a0", "Нет; сначала разделить диапазоны по тому, откуда они пришли");
    const bli01 = blinds.drills.find((item) => item.id === "bli-01");
    if (bli01) bli01.explanation = "То, как диапазон дошёл до флопа, остаётся частью ситуации.";
    const bli03 = blinds.drills.find((item) => item.id === "bli-03");
    if (bli03) bli03.explanation = "Игрок за спиной отличает SB-колл от BB, который закрывает торговлю.";

    if (filtering.tableCard[0]) filtering.tableCard[0] = "Исходный диапазон";
    optionText("filtering", "fil-01", "fil-01-a0", "Пропустить исходный диапазон через оба колла");
    cardText("filtering", "fil-card-source", "Три шага обновления диапазона?", "Исходный диапазон → действие → оставшиеся руки.");

    multiway.scope = "Направленная логика для банка на троих и более; точные частоты защиты здесь не заявляются.";
    multiway.plainGoal = "Не играть банк на троих и более как heads-up и помнить, что защита распределяется между несколькими игроками.";
    if (multiway.heuristics[0]) multiway.heuristics[0] = "Не считай, что один игрок обязан нести всю heads-up-защиту.";
    if (multiway.heuristics[1]) multiway.heuristics[1] = "Игрок за спиной — отдельный риск.";
    multiway.workedExample.answer = "Не переносить heads-up-защиту один к одному; сначала учесть игрока за спиной и его продолжающий диапазон.";
    const mul01 = multiway.drills.find((item) => item.id === "mul-01");
    if (mul01) {
      mul01.question = "Что проверить первым?";
      mul01.explanation = "Когда игроков несколько, защита распределяется, а игрок за спиной меняет цену продолжения.";
    }
    optionText("multiway", "mul-01", "mul-01-a1", "Считать, что BTN один обязан обеспечить всю heads-up-защиту");
    optionText("multiway", "mul-01", "mul-01-r0", "Защита распределяется, а игрок за спиной может продолжить с сильной рукой");
    cardText("multiway", "mul-card-mdf", "Обязан ли Hero один нести всю heads-up-защиту?", "Нет; когда игроков несколько, защита распределяется между несколькими диапазонами.");
    multiway.tableCard = ["Игроки", "Порядок действий", "Диапазон за спиной", "Распределённая защита", "Кто чаще имеет сильнейшие руки"];
    return;
  }

  preflop.technicalTerm = "Preflop range architecture: linear/value squeezes, polar squeezes, and protected calls.";
  optionText("preflop", "pre-01", "pre-01-a0", "Value squeeze");
  optionText("preflop", "pre-03", "pre-03-r0", "Strong starting ranges, domination, and poor multiway equity realisation outweigh the superficial blocker effect");
  const pre03 = preflop.drills.find((item) => item.id === "pre-03");
  if (pre03) pre03.explanation = "The decision follows from the starting ranges and domination risk in this spot.";

  blinds.technicalTerm = "Where the range came from, closing the action, and equity realisation.";
  if (blinds.heuristics[0]) blinds.heuristics[0] = "Start by naming where the range came from.";
  if (blinds.tableCard[0]) blinds.tableCard[0] = "Where the range came from";
  optionText("blinds", "bli-01", "bli-01-a0", "No; first separate the ranges by how they reached the flop");
  const bli01 = blinds.drills.find((item) => item.id === "bli-01");
  if (bli01) bli01.explanation = "How the range reached the flop remains part of the decision point.";
  const bli03 = blinds.drills.find((item) => item.id === "bli-03");
  if (bli03) bli03.explanation = "The player behind separates an SB cold-call from a BB decision that closes the action.";

  if (filtering.tableCard[0]) filtering.tableCard[0] = "Starting range";
  optionText("filtering", "fil-01", "fil-01-a0", "Pass the starting range through both calls");
  cardText("filtering", "fil-card-source", "Three steps to update a range?", "Starting range → action → remaining hands.");

  multiway.scope = "Directional multiway framework; exact defence frequencies are not claimed.";
  multiway.plainGoal = "Do not play a multiway pot as if it were heads-up; defence is shared across more than one player.";
  if (multiway.heuristics[0]) multiway.heuristics[0] = "Do not assume one player carries the entire heads-up defence burden.";
  if (multiway.heuristics[1]) multiway.heuristics[1] = "A player behind is a separate risk.";
  multiway.workedExample.answer = "Do not copy heads-up defence one-for-one; first account for the player behind and that player's continuing range.";
  const mul01 = multiway.drills.find((item) => item.id === "mul-01");
  if (mul01) {
    mul01.question = "What should you check first?";
    mul01.explanation = "In a multiway pot, defence is shared and a player behind changes the cost of continuing.";
  }
  optionText("multiway", "mul-01", "mul-01-a1", "Assume BTN alone must provide the entire heads-up defence");
  optionText("multiway", "mul-01", "mul-01-r0", "Defence is shared, and the player behind can continue with a strong range");
  cardText("multiway", "mul-card-mdf", "Must Hero alone carry the entire heads-up defence?", "No; in a multiway pot, defence is shared across multiple ranges.");
  multiway.tableCard = ["Players", "Action order", "Range behind", "Shared defence", "Who has more of the strongest hands"];
}
