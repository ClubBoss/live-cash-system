import { moduleById } from "../modules";
import type { LocaleCode, ModuleId } from "../../lib/model";

type ExactCopyMap = Record<string, string>;

function rewriteValue(value: unknown, replacements: ExactCopyMap): unknown {
  if (typeof value === "string") return replacements[value] ?? value;
  if (Array.isArray(value)) return value.map((item) => rewriteValue(item, replacements));
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    for (const key of Object.keys(record)) record[key] = rewriteValue(record[key], replacements);
  }
  return value;
}

function rewriteModule(moduleId: ModuleId, replacements: ExactCopyMap) {
  rewriteValue(moduleById[moduleId], replacements);
}

function drill(moduleId: ModuleId, drillId: string) {
  const target = moduleById[moduleId].drills.find((item) => item.id === drillId);
  if (!target) throw new Error(`Missing poker-native terminology drill ${drillId}`);
  return target;
}

const RU_POKER_NATIVE_REBALANCE: ExactCopyMap = {
  "Ширина префлоп 3-бета, частота маленькой ставки, выборочная полярная ставка и условия для крупного рейза вне позиции.": "Ширина префлоп 3-бета, частота маленькой ставки, выборочная полярная ставка и условия для крупного рейза OOP (вне позиции).",
  "Для крупного рейза вне позиции в 3-бет-банке сначала нужен настоящий верх диапазона. При низком SPR олл-ин строится вокруг сильного вэлью, лучших блефов и отдельных гибридов; одно лишь желание выбить эквити не оправдывает пуш средней части диапазона.": "Для крупного рейза OOP (вне позиции) в 3-бет-банке сначала нужен настоящий верх диапазона. При низком SPR олл-ин строится вокруг сильного вэлью, лучших блефов и отдельных гибридов; одно лишь желание выбить эквити не оправдывает пуш средней части диапазона.",
  "После колла перестрой диапазоны; для рейза вне позиции отдельно проверь сильное вэлью и подходящие блефы.": "После колла перестрой диапазоны; для OOP-рейза (вне позиции) отдельно проверь сильное вэлью и подходящие блефы.",
  "Есть ли достаточно сильного вэлью для рейза вне позиции": "Есть ли достаточно сильного вэлью для OOP-рейза (вне позиции)",
  "Hero вне позиции защищается в 3-бет-банке": "Hero OOP (вне позиции) защищается в 3-бет-банке",
  "в этой линии у игрока вне позиции почти нет рук верхнего вэлью-класса": "в этой линии у Hero OOP (вне позиции) почти нет рук верхнего вэлью-класса",

  "Объясни, почему слишком широкий префлоп 3-бет должен менять постфлоп-частоты, а частая ставка почти всем диапазоном после колла не переносится автоматически на тёрн.": "Объясни, почему слишком широкий префлоп 3-бет должен менять постфлоп-частоты, а range-bet (ставка почти всем диапазоном) после колла не переносится автоматически на тёрн.",
  "Что меняется после частой ставки почти всем диапазоном и колла?": "Что меняется после range-bet (ставки почти всем диапазоном) и колла?",
  "Да; если на флопе ставили почти всем диапазоном, на тёрне тоже нужно ставить почти всем диапазоном": "Да; если на флопе был range-bet, на тёрне тоже нужен range-bet",

  "Не играть банк на троих и более как один на один и помнить, что защита распределяется между несколькими игроками.": "Не играть мультивей (банк на троих и более) как хедз-ап (один на один) и помнить, что защита распределяется между несколькими игроками.",
  "Защита в банке на троих и более распределяется между несколькими диапазонами: один игрок не обязан в одиночку обеспечивать всю защиту.": "В мультивее защита распределяется между несколькими диапазонами: один игрок не обязан в одиночку обеспечивать всю защиту.",
  "Часть общей защиты может выполнить BB, поэтому KQ нельзя оценивать как обычный блеф-кетчер один на один.": "Часть общей защиты может выполнить BB, поэтому KQ нельзя оценивать как обычный хедз-ап блеф-кетчер.",
  "Обязан ли Hero один нести всю защиту как в игре один на один?": "Обязан ли Hero один нести всю хедз-ап-защиту?",
  "Начать с нормы защиты один на один и уже затем поправить её на BB": "Начать с нормы защиты в хедз-апе и уже затем поправить её на BB",
  "Защита один на один — полезная база; игрок за спиной лишь немного сдвигает готовую частоту": "Хедз-ап защита — полезная база; игрок за спиной лишь немного сдвигает готовую частоту",
};

/**
 * Evidence-backed correction after the full learner-language polish.
 * Standard poker vocabulary is retained when it helps transfer to courses,
 * software and live discussion, but its first learner-facing use stays
 * scaffolded in plain Russian. Internal/research shorthand remains excluded.
 */
export function applyPokerNativeTerminologyRebalance(locale: LocaleCode) {
  if (locale !== "ru") return;

  (Object.keys(moduleById) as ModuleId[]).forEach((moduleId) => rewriteModule(moduleId, RU_POKER_NATIVE_REBALANCE));

  const agg04 = drill("aggression", "agg-04");
  agg04.question = "Можно ли автоматически продолжить range-bet (ставку почти всем диапазоном) на тёрне?";

  const mul04 = drill("multiway", "mul-04");
  mul04.cue = "Мультивей: HJ, BTN и BB смотрят флоп 6-5-4 радугой; HJ был префлоп-агрессором.";
  mul04.question = "Что HJ нужно проверить перед контбетом?";
  mul04.actionOptions.forEach((option) => {
    if (option.id === mul04.correctActionId) option.text = "Преимущество BB по натсам и другим сильным рукам плюс второй соперник";
  });
  const wrongActions = mul04.actionOptions.filter((option) => option.id !== mul04.correctActionId);
  wrongActions[0].text = "Поставить, потому что HJ был префлоп-агрессором";
  wrongActions[1].text = "Чекать: в мультивее контбет получает слишком много продолжений";
  mul04.reasonOptions.forEach((option) => {
    if (option.id === mul04.correctReasonId) option.text = "У BB больше низких сильных рук, а HJ против двоих";
  });
  const wrongReasons = mul04.reasonOptions.filter((option) => option.id !== mul04.correctReasonId);
  wrongReasons[0].text = "Префлоп-агрессор обычно сохраняет преимущество и после флопа";
  wrongReasons[1].text = "Сам факт мультивея делает контбет невыгодным";
  mul04.explanation = "На низкой связанной доске одной префлоп-инициативы недостаточно. Сначала сравни натсы и другие сильные комбинации в диапазонах и учти, что HJ играет сразу против BTN и BB.";
}
