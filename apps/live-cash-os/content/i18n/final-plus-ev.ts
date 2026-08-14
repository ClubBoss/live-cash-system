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

function replaceAll(text: string, replacements: Array<[RegExp, string]>): string {
  return replacements.reduce((result, [pattern, replacement]) => result.replace(pattern, replacement), text);
}

const RU_PLAIN_LANGUAGE: Array<[RegExp, string]> = [
  [/\bheads-up MDF\b/giu, "защиту как один на один"],
  [/\bheads-up\b/giu, "один на один"],
  [/\bMDF\b/gu, "норму защиты"],
  [/\bsource ranges\b/giu, "исходные диапазоны"],
  [/\bsource range\b/giu, "исходный диапазон"],
  [/\barriving ranges\b/giu, "диапазоны, дошедшие до этой ситуации"],
  [/\barriving range\b/giu, "диапазон, дошедший до этой ситуации"],
  [/\barrival ranges\b/giu, "диапазоны, дошедшие до этой ситуации"],
  [/\barrival range\b/giu, "диапазон, дошедший до этой ситуации"],
  [/\bcontinuing range\b/giu, "диапазон продолжения"],
  [/\bbetting range\b/giu, "диапазон ставки"],
  [/\brange shape\b/giu, "структуру диапазона"],
  [/\brange construction\b/giu, "построение диапазона"],
  [/\bsource branch\b/giu, "исходную ветку"],
  [/\bbranch-specific\b/giu, "привязанный к конкретной линии"],
  [/\bbranches\b/giu, "ветки"],
  [/\bbranch\b/giu, "ветка"],
  [/\branges\b/giu, "диапазоны"],
  [/\brange\b/giu, "диапазон"],
  [/\bplayers behind\b/giu, "игроки за спиной"],
  [/\bplayer behind\b/giu, "игрок за спиной"],
  [/\bclosing action\b/giu, "закрытие торговли"],
  [/\bshared defence\b/giu, "общая защита"],
  [/\bsandwich pressure\b/giu, "давление игрока за спиной"],
  [/\bsandwich\b/giu, "ситуация с игроком за спиной"],
  [/\bnut ownership\b/giu, "преимущество по сильнейшим комбинациям"],
  [/\bboard ownership\b/giu, "преимущество по сильным комбинациям на доске"],
  [/\bownership\b/giu, "преимущество по сильнейшим комбинациям"],
  [/\bbluff supply\b/giu, "естественные блефы"],
  [/\bbluff-supply\b/giu, "естественные блефы"],
  [/\bfold supply\b/giu, "руки, которые могут сфолдить"],
  [/\bfold targets\b/giu, "руки, которые должны сфолдить"],
  [/\bpopulation prior\b/giu, "предварительное наблюдение о поле"],
  [/\bpopulation evidence\b/giu, "данные о поле"],
  [/\bfield evidence\b/giu, "подтверждение на разобранных реальных руках"],
  [/\bfield validation\b/giu, "подтверждение в разобранных реальных руках"],
  [/\bsolver-like\b/giu, "теоретический"],
  [/\bsize exclusion\b/giu, "то, что исключает этот размер"],
  [/\bnode-specific\b/giu, "привязанный к этой ситуации"],
  [/\bnode signature\b/giu, "условия ситуации"],
  [/\bdecision node\b/giu, "ситуацию"],
  [/\bnode\b/giu, "ситуация"],
  [/\bgate\b/giu, "проверка"],
  [/\bprobe\b/giu, "проверка"],
  [/\bOOP-рейз/giu, "рейз вне позиции"],
  [/\bOOP\b/gu, "вне позиции"],
  [/\bIP\b/gu, "в позиции"],
  [/\brealisation\b/giu, "реализация эквити"],
  [/\bplayability\b/giu, "играбельность"],
  [/\bhigh-card\b/giu, "силу старших карт"],
  [/\bsmall-wide\b/giu, "маленькая широкая ставка"],
  [/\blarge-selective\b/giu, "крупная выборочная ставка"],
  [/\blarge-polar\b/giu, "крупная полярная ставка"],
  [/\bnear-range\b/giu, "почти всем диапазоном"],
  [/\baction order\b/giu, "порядок действий"],
  [/\baction history\b/giu, "история действий"],
  [/\bpost-action SPR\b/giu, "SPR после действия"],
  [/\btransfer\b/giu, "применение в новых условиях"],
  [/\bretention\b/giu, "повтор после паузы"],
  [/\bstructural prior\b/giu, "базовое ожидание по структуре ситуации"],
  [/\bdirectional shift\b/giu, "изменение направления"],
  [/\bcredible bluff supply\b/giu, "правдоподобные блефы"],
  [/\bvalue hands\b/giu, "вэлью-руки"],
  [/\bmade hands\b/giu, "готовые руки"],
  [/\bmedium hands\b/giu, "средние руки"],
  [/\bweak hands\b/giu, "слабые руки"],
  [/\bhand strength\b/giu, "сила руки"],
];

const EN_PLAIN_LANGUAGE: Array<[RegExp, string]> = [
  [/\barrival ranges\b/giu, "ranges that reached this spot"],
  [/\barrival range\b/giu, "range that reached this spot"],
  [/\barriving ranges\b/giu, "ranges that reached this spot"],
  [/\barriving range\b/giu, "range that reached this spot"],
  [/\bsource ranges\b/giu, "starting ranges"],
  [/\bsource range\b/giu, "starting range"],
  [/\bbluff supply\b/giu, "realistic bluffs"],
  [/\bsize exclusion\b/giu, "value hands this size removes"],
  [/\bnode-specific\b/giu, "specific to this spot"],
  [/\bfield evidence\b/giu, "reviewed real-hand evidence"],
  [/\bpopulation prior\b/giu, "outside population read"],
  [/\bstructural prior\b/giu, "structural baseline"],
  [/\bnut ownership\b/giu, "advantage in the strongest hands"],
  [/\bboard ownership\b/giu, "advantage in strong hands on this board"],
];

function polishString(locale: LocaleCode, value: string): string {
  const replacements = locale === "ru" ? RU_PLAIN_LANGUAGE : EN_PLAIN_LANGUAGE;
  return replaceAll(value, replacements)
    .replace(/\s{2,}/gu, " ")
    .trim();
}

function polishModule(moduleId: ModuleId, locale: LocaleCode) {
  const module = moduleById[moduleId];
  module.title = polishString(locale, module.title);
  module.shortTitle = polishString(locale, module.shortTitle);
  module.description = polishString(locale, module.description);
  module.scope = polishString(locale, module.scope);
  module.plainGoal = polishString(locale, module.plainGoal);
  module.tableCue = polishString(locale, module.tableCue);
  module.technicalTerm = polishString(locale, module.technicalTerm);
  module.theory = module.theory.map((text) => polishString(locale, text));
  module.heuristics = module.heuristics.map((text) => polishString(locale, text));
  module.decisionTree = module.decisionTree.map((text) => polishString(locale, text));
  module.workedExample.situation = polishString(locale, module.workedExample.situation);
  module.workedExample.steps = module.workedExample.steps.map((text) => polishString(locale, text));
  module.workedExample.answer = polishString(locale, module.workedExample.answer);
  module.counterexample = polishString(locale, module.counterexample);
  module.lab.title = polishString(locale, module.lab.title);
  module.lab.description = polishString(locale, module.lab.description);
  if (module.lab.type === "compare") {
    module.lab.leftTitle = polishString(locale, module.lab.leftTitle);
    module.lab.leftText = polishString(locale, module.lab.leftText);
    module.lab.rightTitle = polishString(locale, module.lab.rightTitle);
    module.lab.rightText = polishString(locale, module.lab.rightText);
  }
  module.explainBackPrompt = polishString(locale, module.explainBackPrompt);
  module.tableCard = module.tableCard.map((text) => polishString(locale, text));
  module.glossary.forEach((entry) => {
    entry.term = polishString(locale, entry.term);
    entry.meaning = polishString(locale, entry.meaning);
  });
  module.drills.forEach((drill) => {
    drill.assumptions = drill.assumptions.map((text) => polishString(locale, text));
    drill.cue = polishString(locale, drill.cue);
    drill.question = polishString(locale, drill.question);
    drill.actionOptions.forEach((option) => { option.text = polishString(locale, option.text); });
    drill.reasonOptions.forEach((option) => { option.text = polishString(locale, option.text); });
    drill.explanation = polishString(locale, drill.explanation);
  });
  module.flashcards.forEach((card) => {
    card.front = polishString(locale, card.front);
    card.back = polishString(locale, card.back);
  });
}

function patchRussianHighFrictionDecisions() {
  const shape = moduleById.shape.drills.find((item) => item.id === "sha-04");
  if (shape) {
    shape.question = "Что должно оправдывать рейз T6s, кроме желания упростить следующие улицы?";
    shape.actionOptions.forEach((option) => {
      if (option.id === shape.correctActionId) option.text = "Худшие руки, которые продолжат, и/или заметное выбивание их эквити";
    });
    const wrongActions = shape.actionOptions.filter((option) => option.id !== shape.correctActionId);
    if (wrongActions[0]) wrongActions[0].text = "Желание сделать следующие улицы проще";
    if (wrongActions[1]) wrongActions[1].text = "То, что T6s сейчас впереди части диапазона";
    shape.reasonOptions.forEach((option) => {
      if (option.id === shape.correctReasonId) option.text = "Рейз должен либо получить вэлью от худших рук, либо выгодно заставить сфолдить руки с реальными аутами";
    });
    shape.explanation = "Уязвимость сама по себе не повод рейзить. Сначала назови худшие руки, которые продолжат, или руки с заметным эквити, которые действительно сфолдят.";
  }

  const multiway = moduleById.multiway.drills.find((item) => item.id === "mul-04");
  if (multiway) {
    multiway.cue = "Три игрока на флопе 6-5-4 радугой: HJ был префлоп-агрессором, BTN и BB заколлировали.";
    multiway.question = "Что HJ нужно проверить перед контбетом?";
    multiway.actionOptions.forEach((option) => {
      if (option.id === multiway.correctActionId) option.text = "У кого больше сильнейших рук на этой доске и как влияет игрок за спиной";
    });
    const wrongActions = multiway.actionOptions.filter((option) => option.id !== multiway.correctActionId);
    if (wrongActions[0]) wrongActions[0].text = "Поставить, потому что HJ был префлоп-агрессором";
    if (wrongActions[1]) wrongActions[1].text = "Чекать, потому что банк на троих";
    multiway.reasonOptions.forEach((option) => {
      if (option.id === multiway.correctReasonId) option.text = "У BB больше низких двух пар, сетов и стритов, а HJ ещё играет против BTN и BB";
    });
    const wrongReasons = multiway.reasonOptions.filter((option) => option.id !== multiway.correctReasonId);
    if (wrongReasons[0]) wrongReasons[0].text = "Префлоп-агрессор обычно сохраняет преимущество и после флопа";
    if (wrongReasons[1]) wrongReasons[1].text = "В банке на троих ставка слишком часто получает продолжение";
    multiway.explanation = "На низкой связанной доске одной префлоп-инициативы недостаточно. Сначала сравни сильнейшие комбинации в диапазонах и учти, что HJ играет сразу против BTN и BB.";
  }

  const river = moduleById.river;
  const riv01 = river.drills.find((item) => item.id === "riv-01");
  if (riv01) {
    riv01.actionOptions.forEach((option) => {
      if (option.id === riv01.correctActionId) option.text = "Вэлью и естественные блефы, которые реально дошли по всей линии";
    });
    riv01.explanation = "Сначала восстанови линию и посчитай правдоподобные вэлью и блефы. Только после этого оцени, что именно меняет блокер.";
  }
  const riv02 = river.drills.find((item) => item.id === "riv-02");
  if (riv02) {
    riv02.actionOptions.forEach((option) => {
      if (option.id === riv02.correctActionId) option.text = "Убрать эту комбинацию из списка возможных блефов";
    });
  }
  const riv03 = river.drills.find((item) => item.id === "riv-03");
  if (riv03) riv03.explanation = "Крупный размер может убрать часть среднего вэлью, но сам по себе не доказывает, что блефов достаточно для колла.";
  const riv05 = river.drills.find((item) => item.id === "riv-05");
  if (riv05) riv05.explanation = "Если естественных блефов по этой линии не видно, базовый фолд или честное «данных недостаточно» лучше выдуманного колла. Чтобы отойти от этого, нужны данные именно по такой линии.";

  const evidence = moduleById.evidence;
  const evi02 = evidence.drills.find((item) => item.id === "evi-02");
  if (evi02) {
    evi02.actionOptions.forEach((option) => {
      if (option.id === evi02.correctActionId) option.text = "Как рид на конкретную линию: широкий колл маленькой ставки на флопе → частый фолд на тёрне";
    });
    evi02.explanation = "Храни рид именно на эту последовательность действий. Не превращай её в общий ярлык на все решения соперника.";
  }
  const evi03 = evidence.drills.find((item) => item.id === "evi-03");
  if (evi03) {
    evi03.cue = "Есть внешнее наблюдение о типичной ошибке поля, но за текущим столом своих данных ещё нет.";
    evi03.actionOptions.forEach((option) => {
      if (option.id === evi03.correctActionId) option.text = "Играть от базовой линии и считать внешнее наблюдение лишь слабой подсказкой";
    });
    evi03.explanation = "Внешние данные подсказывают, на что смотреть, но не доказывают величину отклонения за текущим столом. Пока своих наблюдений мало, держись базовой линии.";
  }
}

/**
 * Evidence-backed final learner-language normalisation over the assembled
 * runtime corpus. It changes wording only. Stable module/drill/card/option IDs,
 * correct-answer IDs, misconception IDs, scoring, state, scheduler, mastery and
 * evidence semantics remain untouched.
 */
export function applyFinalLanguagePolish(locale: LocaleCode) {
  (Object.keys(moduleById) as ModuleId[]).forEach((moduleId) => polishModule(moduleId, locale));
  if (locale === "ru") patchRussianHighFrictionDecisions();
}
