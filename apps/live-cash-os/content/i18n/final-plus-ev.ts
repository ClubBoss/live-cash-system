import { moduleById } from "../modules";
import type { LocaleCode } from "../../lib/model";
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
      { term: "Линейный рейз", meaning: "Рейз включает не только самые сильные руки и блефы, но и часть уязвимого вэлью." },
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
