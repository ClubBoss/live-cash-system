import { moduleById } from "../modules";
import type { LocaleCode, ModuleId } from "../../lib/model";
import { CALL_PRICE_SCAFFOLD } from "./novice-scaffold";

function rewriteGlossary(moduleId: "shape" | "ancestry" | "river" | "evidence", entries: Array<{ term: string; meaning: string }>) {
  const target = moduleById[moduleId];
  target.glossary.splice(0, target.glossary.length, ...entries);
}

/**
 * Final low-risk learner-language cleanup. This layer only removes residual
 * jargon and clarifies arithmetic interpretation; it does not change strategy,
 * correct-answer IDs, scheduler routing, mastery, retention, or evidence truth.
 */
export function applyFinalPlusEvCopy(locale: LocaleCode) {
  if (locale === "ru") {
    rewriteGlossary("shape", [
      { term: "Устойчивая рука", meaning: "Рука, которая хорошо переносит будущие карты и давление и поэтому не обязана сразу рейзить." },
      { term: "Линейный рейз", meaning: "Рейз включает не только самые сильные руки, но и часть уязвимого вэлью." },
    ]);
    rewriteGlossary("ancestry", [
      { term: "Происхождение диапазона", meaning: "Какие руки могли войти в линию и пережить все предыдущие действия до текущего решения." },
      { term: "Реальные блефы по линии", meaning: "Семейства блефов, которые действительно могли дойти до текущего решения через все прошлые действия." },
    ]);
    rewriteGlossary("river", [
      { term: "Реальные блефы", meaning: "Количество и семейства естественных блефов, которые действительно дошли до ривера." },
      { term: "Что исключает размер ставки", meaning: "Руки на вэлью, которые обычно выбрали бы другой размер и поэтому хуже подходят к наблюдаемому сайзингу." },
    ]);
    rewriteGlossary("evidence", [
      { term: "Что опровергнет рид", meaning: "Наблюдение, после которого текущий вывод о сопернике нужно ослабить или отменить." },
      { term: "Базовая линия без рида", meaning: "Обычное решение по структуре ситуации, пока надёжных наблюдений о конкретном сопернике недостаточно." },
    ]);
    CALL_PRICE_SCAFFOLD.ru.example = "Пример: после ставки соперника в банке 150, колл стоит 50. После колла будет 200, значит цена = 50 / 200 = 25%. То есть колл составляет четверть итогового банка. Это только цена; сама формула не выбирает покерное действие.";
    return;
  }

  CALL_PRICE_SCAFFOLD.en.example = "Example: after Villain bets, the pot is 150 and the call costs 50. The pot after calling is 200, so the price is 50 / 200 = 25%. In other words, the call is one quarter of the final pot. This is only the price; the formula does not choose a poker action.";
}

function drill(moduleId: ModuleId, drillId: string) {
  const target = moduleById[moduleId].drills.find((item) => item.id === drillId);
  if (!target) throw new Error(`Missing learner-language drill ${drillId}`);
  return target;
}

type ExactCopyMap = Record<string, string>;

function rewriteExact(value: string, replacements: ExactCopyMap): string {
  return replacements[value] ?? value;
}

function applyExactCopyMap(moduleId: ModuleId, replacements: ExactCopyMap) {
  const module = moduleById[moduleId];
  module.title = rewriteExact(module.title, replacements);
  module.shortTitle = rewriteExact(module.shortTitle, replacements);
  module.description = rewriteExact(module.description, replacements);
  module.scope = rewriteExact(module.scope, replacements);
  module.plainGoal = rewriteExact(module.plainGoal, replacements);
  module.tableCue = rewriteExact(module.tableCue, replacements);
  module.technicalTerm = rewriteExact(module.technicalTerm, replacements);
  module.theory = module.theory.map((value) => rewriteExact(value, replacements));
  module.heuristics = module.heuristics.map((value) => rewriteExact(value, replacements));
  module.decisionTree = module.decisionTree.map((value) => rewriteExact(value, replacements));
  module.workedExample.situation = rewriteExact(module.workedExample.situation, replacements);
  module.workedExample.steps = module.workedExample.steps.map((value) => rewriteExact(value, replacements));
  module.workedExample.answer = rewriteExact(module.workedExample.answer, replacements);
  module.counterexample = rewriteExact(module.counterexample, replacements);
  module.lab.title = rewriteExact(module.lab.title, replacements);
  module.lab.description = rewriteExact(module.lab.description, replacements);
  if (module.lab.type === "compare") {
    module.lab.leftTitle = rewriteExact(module.lab.leftTitle, replacements);
    module.lab.leftText = rewriteExact(module.lab.leftText, replacements);
    module.lab.rightTitle = rewriteExact(module.lab.rightTitle, replacements);
    module.lab.rightText = rewriteExact(module.lab.rightText, replacements);
  }
  module.explainBackPrompt = rewriteExact(module.explainBackPrompt, replacements);
  module.tableCard = module.tableCard.map((value) => rewriteExact(value, replacements));
  module.glossary.forEach((entry) => {
    entry.term = rewriteExact(entry.term, replacements);
    entry.meaning = rewriteExact(entry.meaning, replacements);
  });
  module.drills.forEach((item) => {
    item.assumptions = item.assumptions.map((value) => rewriteExact(value, replacements));
    item.cue = rewriteExact(item.cue, replacements);
    item.question = rewriteExact(item.question, replacements);
    item.actionOptions.forEach((option) => { option.text = rewriteExact(option.text, replacements); });
    item.reasonOptions.forEach((option) => { option.text = rewriteExact(option.text, replacements); });
    item.explanation = rewriteExact(item.explanation, replacements);
  });
  module.flashcards.forEach((card) => {
    card.front = rewriteExact(card.front, replacements);
    card.back = rewriteExact(card.back, replacements);
  });
}

const RU_EXACT_POLISH: ExactCopyMap = {
  "Компенсация диапазона, частая малая ставка, селективная полярная ставка и OOP raise gate.": "Ширина префлоп 3-бета, частота маленькой ставки, выборочная полярная ставка и условия для крупного рейза вне позиции.",
  "Для OOP-рейза в 3-бет-банке сначала нужен настоящий верх диапазона. При низком SPR олл-ин строится вокруг сильного вэлью, лучших блефов и отдельных гибридов; одно лишь желание выбить эквити не оправдывает пуш средней части диапазона.": "Для крупного рейза вне позиции в 3-бет-банке сначала нужен настоящий верх диапазона. При низком SPR олл-ин строится вокруг сильного вэлью, лучших блефов и отдельных гибридов; одно лишь желание выбить эквити не оправдывает пуш средней части диапазона.",
  "После колла перестрой диапазоны; для OOP-рейза отдельно проверь наличие верхнего вэлью и подходящих блефов.": "После колла перестрой диапазоны; для рейза вне позиции отдельно проверь сильное вэлью и подходящие блефы.",
  "Объясни, почему слишком широкий префлоп 3-бет должен менять постфлоп-частоты, а флоп range-bet после колла не переносится автоматически на тёрн.": "Объясни, почему слишком широкий префлоп 3-бет должен менять постфлоп-частоты, а частая ставка почти всем диапазоном после колла не переносится автоматически на тёрн.",
  "Есть ли верх для OOP-рейза": "Есть ли достаточно сильного вэлью для рейза вне позиции",
  "Что меняется после range-bet и колла?": "Что меняется после частой ставки почти всем диапазоном и колла?",
  "Да; если флоп был range-bet, тёрн тоже range-bet": "Да; если на флопе ставили почти всем диапазоном, на тёрне тоже нужно ставить почти всем диапазоном",
  "OOP защищается в 3-бет-банке": "Hero вне позиции защищается в 3-бет-банке",
  "в рассматриваемой ветке у OOP почти нет рук верхнего вэлью-класса": "в этой линии у игрока вне позиции почти нет рук верхнего вэлью-класса",
  "Сначала проверь реальные fold targets. Название A5s не превращает 4-бет-блеф в автоматическую линию.": "Сначала проверь, какие более сильные руки реально сфолдят. Название A5s не превращает 4-бет-блеф в автоматическую линию.",
  "Блокер полезен только при реальных fold targets": "Блокер полезен только если есть реальные более сильные руки, которые могут сфолдить",
  "Не играть банк на троих и более как heads-up и помнить, что защита распределяется между несколькими игроками.": "Не играть банк на троих и более как один на один и помнить, что защита распределяется между несколькими игроками.",
  "Sandwich, closing action, shared defence и multiway range ownership.": "Игрок за спиной, закрытие торговли, распределённая защита и преимущество по сильнейшим рукам в мультивее.",
  "Защита мультивей распределяется между несколькими диапазонами: один игрок не обязан в одиночку нести heads-up норму защиты.": "Защита в банке на троих и более распределяется между несколькими диапазонами: один игрок не обязан в одиночку обеспечивать всю защиту.",
  "Не считай, что один игрок обязан нести всю heads-up-защиту.": "Не считай, что один игрок обязан нести всю защиту как в игре один на один.",
  "Часть общей защиты может выполнить BB, поэтому KQ нельзя оценивать как heads-up bluff-catcher в вакууме.": "Часть общей защиты может выполнить BB, поэтому KQ нельзя оценивать как обычный блеф-кетчер один на один.",
  "Сначала учти диапазон BB за спиной и порядок действий; абсолютная сила KQ не отменяет sandwich pressure.": "Сначала учти диапазон BB за спиной и порядок действий; абсолютная сила KQ не отменяет давления игрока, который ещё не ответил.",
  "Обязан ли Hero один нести всю heads-up-защиту?": "Обязан ли Hero один нести всю защиту как в игре один на один?",
  "Начать с heads-up нормы защиты Hero и уже затем поправить её на BB": "Начать с нормы защиты один на один и уже затем поправить её на BB",
  "Heads-up защита — полезная база; игрок за спиной лишь сдвигает готовую частоту": "Защита один на один — полезная база; игрок за спиной лишь немного сдвигает готовую частоту",
  "Field evidence уточняет конкретную ветку; оно не превращается в глобальный ярлык.": "Реальное наблюдение уточняет конкретную линию; оно не превращается в глобальный ярлык.",
};

const EN_EXACT_POLISH: ExactCopyMap = {
  "98s belongs to the same broad family, but the family does not say 'call': a different position, depth or source range requires a fresh decision.": "98s belongs to the same broad family, but the family does not say 'call': a different position, depth or starting range requires a fresh decision.",
  "both source ranges are stronger than a late-position open-plus-call": "both starting ranges are stronger than a late-position open-plus-call",
  "EP opens 4bb, HJ calls, and Hero is in the CO with KJo against two strong source ranges.": "EP opens 4bb, HJ calls, and Hero is in the CO with KJo against two strong starting ranges.",
  "The same hand and board change value when price, action order and the source range change.": "The same hand and board change value when price, action order and the starting range change.",
  "A reliable player read can widen or tighten the source range, but it does not erase action order or price.": "A reliable player read can widen or tighten the starting range, but it does not erase action order or price.",
  "How does this source range interact with the opener's range?": "How does this range interact with the opener's range?",
  "Which preflop source range reached this board?": "Which preflop range reached this board?",
  "Rebuild each blind's preflop source range first": "Rebuild each blind's preflop range first",
  "A dry A-high flop matters more than differences between the SB and BB source ranges": "A dry A-high flop matters more than differences between the SB and BB preflop ranges",
  "Widen the source range while keeping price and action order in the analysis": "Widen the preflop range while keeping price and action order in the analysis",
  "The observation updates the source range. Structural properties of the position remain part of the node.": "The observation updates the preflop range. Structural properties of the position remain part of the decision.",
  "A range-filtering framework. Exact combinations depend on source ranges, positions, sizing, and the actual line.": "A range-filtering framework. Exact combinations depend on starting ranges, positions, sizing, and the actual line.",
  "The current decision starts with the source range and the full action history, not with the board card in isolation.": "The current decision starts with the starting range and the full action history, not with the board card in isolation.",
  "Compare a source range with the hands that survive a voluntary continue.": "Compare the starting range with the hands that survive a voluntary continue.",
  "Arriving range": "Range that reached this decision",
  "Directional sizing and response architecture. Exact sizes, frequencies, mixed actions, and combo thresholds remain node-specific.": "Directional sizing and response architecture. Exact sizes, frequencies, mixed actions, and combo thresholds remain specific to the decision.",
  "Directional branch reconstruction. Exact combos, frequencies, and solver EV require concrete source ranges and visual verification where material.": "Directional reconstruction of the line. Exact combos, frequencies, and solver EV require concrete starting ranges and visual verification where material.",
  "The low five makes A5s a poor bluff regardless of the source range": "The low five makes A5s a poor bluff regardless of the opponent's starting range",
  "The combo is unchanged and A5s still has the same structural traits. The SB source range changed: almost no better hands actually fold. This is not 'A5s = bluff'; it is the same combo behaving differently across two source branches.": "The combo is unchanged and A5s still has the same structural traits. The SB starting range changed: almost no better hands actually fold. This is not 'A5s = bluff'; it is the same combo behaving differently in two starting-range contexts.",
  "tight source range": "tight starting range",
  "Compare nuts, strong made hands, and draws in each source range.": "Compare nuts, strong made hands, and draws in each starting range.",
  "Source ranges and top-end ownership on the actual board.": "Starting ranges and who has more of the strongest hands on the actual board.",
  "Update that exact overcall source range locally": "Update that exact overcall range locally",
  "Repeated branch evidence changes the source range without removing action-order constraints or other branches": "Repeated evidence from this line changes the starting range without removing action-order constraints or other lines",
  "Make large river calls and folds from actual value/bluff supply, size, and then blocker effects.": "Make large river calls and folds from the actual value and bluff combinations, the size, and then blocker effects.",
  "Rebuild the source range and all filters in the line.": "Rebuild the starting range and all filters in the line.",
  "Do not call from blocker aesthetics alone. If credible bluff supply is missing, a baseline fold is legitimate.": "Do not call from blocker aesthetics alone. If realistic bluffs are missing, a baseline fold is legitimate.",
  "With a very wide source range, an air-rich path, and a blocker that removes concentrated value without touching bluffs, the same nominal hand class can become a strong call.": "With a very wide starting range, an air-rich path, and a blocker that removes concentrated value without touching bluffs, the same nominal hand class can become a strong call.",
  "Explain why a nut blocker can make a river call worse and why an extreme size does not prove sufficient bluff supply.": "Explain why a nut blocker can make a river call worse and why an extreme size does not prove there are enough realistic bluffs.",
  "Source range": "Starting range",
  "Remove it from credible bluff supply": "Remove it from the realistic bluffs",
  "Theory guarantees enough bluffs regardless of the source range": "Theory guarantees enough bluffs regardless of the starting range",
  "Size exclusion is an input to the audit, not the final decision.": "What this size removes is an input to the decision, not the final answer.",
  "Without credible bluff supply the required aggression frequency is not supported": "Without enough realistic bluffs, the required aggression frequency is not supported",
};

function applyRussianDecisionPolish() {
  const sha04 = drill("shape", "sha-04");
  sha04.question = "Что должно оправдывать рейз T6s, кроме желания упростить следующие улицы?";
  sha04.actionOptions.forEach((option) => {
    if (option.id === sha04.correctActionId) option.text = "Худшие продолжения и/или заметное выбивание эквити";
  });
  const sha04WrongActions = sha04.actionOptions.filter((option) => option.id !== sha04.correctActionId);
  sha04WrongActions[0].text = "Желание сделать следующие улицы проще";
  sha04WrongActions[1].text = "То, что T6s сейчас впереди части диапазона";
  sha04.reasonOptions.forEach((option) => {
    if (option.id === sha04.correctReasonId) option.text = "Рейз должен дать вэлью или выгодно выбить заметное эквити";
  });
  sha04.explanation = "Уязвимость сама по себе не повод рейзить. Сначала назови худшие руки, которые продолжат, или руки с заметным эквити, которые действительно сфолдят.";

  const mul04 = drill("multiway", "mul-04");
  mul04.cue = "Три игрока на флопе 6-5-4 радугой: HJ был префлоп-агрессором, BTN и BB заколлировали.";
  mul04.question = "Что HJ нужно проверить перед контбетом?";
  mul04.actionOptions.forEach((option) => {
    if (option.id === mul04.correctActionId) option.text = "Сильнейшие руки у BB и влияние игрока за спиной";
  });
  const mul04WrongActions = mul04.actionOptions.filter((option) => option.id !== mul04.correctActionId);
  mul04WrongActions[0].text = "Поставить, потому что HJ был префлоп-агрессором";
  mul04WrongActions[1].text = "Чекать, потому что банк на троих";
  mul04.reasonOptions.forEach((option) => {
    if (option.id === mul04.correctReasonId) option.text = "У BB больше низких сильных рук, а HJ играет против двоих";
  });
  const mul04WrongReasons = mul04.reasonOptions.filter((option) => option.id !== mul04.correctReasonId);
  mul04WrongReasons[0].text = "Префлоп-агрессор обычно сохраняет преимущество и после флопа";
  mul04WrongReasons[1].text = "В банке на троих ставка слишком часто получает продолжение";
  mul04.explanation = "На низкой связанной доске одной префлоп-инициативы недостаточно. Сначала сравни сильнейшие комбинации в диапазонах и учти, что HJ играет сразу против BTN и BB.";

  const agg04 = drill("aggression", "agg-04");
  agg04.question = "Можно ли автоматически снова ставить почти всем диапазоном на тёрне?";

  const riv01 = drill("river", "riv-01");
  riv01.actionOptions.forEach((option) => {
    if (option.id === riv01.correctActionId) option.text = "Вэлью и блефы, реально дошедшие по линии";
  });
  riv01.explanation = "Сначала восстанови линию и посчитай правдоподобные вэлью и блефы. Только после этого оцени, что именно меняет блокер.";

  const riv02 = drill("river", "riv-02");
  riv02.actionOptions.forEach((option) => {
    if (option.id === riv02.correctActionId) option.text = "Убрать эту комбинацию из возможных блефов";
  });

  const riv03 = drill("river", "riv-03");
  riv03.actionOptions.forEach((option) => {
    if (option.id === riv03.correctActionId) option.text = "Какие вэлью и блефы остаются с этим размером";
  });
  riv03.explanation = "Крупный размер может убрать часть среднего вэлью, но сам по себе не доказывает, что блефов достаточно для колла.";

  const riv05 = drill("river", "riv-05");
  riv05.explanation = "Если естественных блефов по этой линии не видно, базовый фолд или честное «данных недостаточно» лучше выдуманного колла. Чтобы отойти от этого, нужны данные именно по такой линии.";

  const evi02 = drill("evidence", "evi-02");
  evi02.actionOptions.forEach((option) => {
    if (option.id === evi02.correctActionId) option.text = "Рид именно на колл флопа → фолд тёрна";
  });
  evi02.explanation = "Храни рид именно на эту последовательность действий. Не превращай её в общий ярлык на все решения соперника.";

  const evi03 = drill("evidence", "evi-03");
  evi03.cue = "Есть внешнее наблюдение о типичной ошибке поля, но за текущим столом своих данных ещё нет.";
  evi03.actionOptions.forEach((option) => {
    if (option.id === evi03.correctActionId) option.text = "Играть от базовой линии и считать внешнее наблюдение лишь слабой подсказкой";
  });
  evi03.explanation = "Внешние данные подсказывают, на что смотреть, но не доказывают величину отклонения за текущим столом. Пока своих наблюдений мало, держись базовой линии.";
}

/**
 * Evidence-backed final wording repair over the assembled learner corpus.
 * It is deliberately explicit: no corpus-wide search/replace is allowed here.
 * Stable semantic identities and all learning-state semantics stay unchanged.
 */
export function applyFinalLanguagePolish(locale: LocaleCode) {
  const replacements = locale === "ru" ? RU_EXACT_POLISH : EN_EXACT_POLISH;
  (Object.keys(moduleById) as ModuleId[]).forEach((moduleId) => applyExactCopyMap(moduleId, replacements));
  if (locale === "ru") applyRussianDecisionPolish();
}
