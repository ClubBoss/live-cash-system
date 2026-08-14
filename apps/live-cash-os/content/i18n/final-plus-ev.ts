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
  if (locale === "ru") applyRussianDecisionPolish();
}
