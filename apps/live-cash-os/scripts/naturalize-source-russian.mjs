import { readFile, writeFile } from "node:fs/promises";

const path = new URL("../content/modules.ts", import.meta.url);
let source = await readFile(path, "utf8");

const phraseReplacements = [
  [/teaching layer/gi, "учебная часть"],
  [/working evidence/gi, "подтверждение в практике"],
  [/field evidence/gi, "подтверждение за столом"],
  [/field transfer/gi, "применение за столом"],
  [/delayed retrieval/gi, "повторение через время"],
  [/delayed review/gi, "повторение через время"],
  [/changed nodes?/gi, "изменённые ситуации"],
  [/node signature/gi, "условия ситуации"],
  [/explain-back/gi, "объяснение своими словами"],
  [/table card/gi, "памятка за столом"],
  [/cold diagnostic/gi, "диагностика без подсказок"],
  [/mastery/gi, "устойчивый навык"],
  [/evidence grade/gi, "надёжность подтверждения"],
  [/field note/gi, "запись реальной руки"],
  [/repair family/gi, "тип ошибки для исправления"],
  [/variant transfer/gi, "перенос на изменённую ситуацию"],
  [/variant distance/gi, "степень изменения ситуации"],
  [/structural baseline/gi, "базовая стратегическая линия"],
  [/branch-specific/gi, "привязанный к конкретной ветке"],
  [/source ranges?/gi, "исходные диапазоны"],
  [/range source/gi, "источник диапазона"],
  [/arrival range/gi, "диапазон, дошедший до решения"],
  [/action history/gi, "история действий"],
  [/future tree/gi, "дальнейший розыгрыш"],
  [/decision tree/gi, "порядок решения"],
  [/players behind/gi, "игроки сзади"],
  [/player behind/gi, "игрок сзади"],
  [/closing action/gi, "закрытие торгов"],
  [/shared defence/gi, "общая защита нескольких диапазонов"],
  [/raw equity/gi, "исходное эквити"],
  [/realised equity/gi, "реализованное эквити"],
  [/realized equity/gi, "реализованное эквити"],
  [/equity realisation/gi, "реализация эквити"],
  [/equity realization/gi, "реализация эквити"],
  [/range ownership/gi, "преимущество диапазона по сильным рукам"],
  [/nut ownership/gi, "преимущество по натсам"],
  [/board ownership/gi, "преимущество диапазона на этой доске"],
  [/bluff supply/gi, "набор возможных блефов"],
  [/value region/gi, "вэлью-часть диапазона"],
  [/value threshold/gi, "граница вэлью"],
  [/jobless bluff/gi, "блеф без стратегической задачи"],
  [/future jobs?/gi, "план на следующие улицы"],
  [/river jobs?/gi, "план на ривер"],
  [/range jobs?/gi, "задачи внутри диапазона"],
  [/bluff jobs?/gi, "задачи блефа"],
  [/line jobs?/gi, "задачи линии"],
  [/high-confidence miss/gi, "ошибка при высокой уверенности"],
  [/structural miss/gi, "ошибка в понимании механизма"],
  [/response shape/gi, "форма ответа диапазона"],
  [/range shape/gi, "форма диапазона"],
  [/betting range/gi, "диапазон ставки"],
  [/continuing range/gi, "диапазон продолжения"],
  [/protected call/gi, "защищённая ветка колла"],
  [/protected flat/gi, "защищённая ветка колла"],
  [/small-wide/gi, "маленькая широкая ставка"],
  [/large-selective/gi, "крупная выборочная ставка"],
  [/large-polar/gi, "крупная полярная ставка"],
  [/near-range/gi, "почти всем диапазоном"],
  [/value-heavy/gi, "смещённый к вэлью"],
  [/bluff-heavy/gi, "смещённый к блефам"],
  [/over-wide/gi, "слишком широкий"],
  [/over-cbet/gi, "слишком частый c-bet"],
  [/overfold/gi, "слишком частый фолд"],
  [/overcall/gi, "слишком широкий колл"],
  [/fold targets?/gi, "руки, которые могут сфолдить"],
  [/value targets?/gi, "более слабые руки, которые продолжат"],
  [/denial targets?/gi, "руки с живым эквити, которые можно выбить"],
  [/credible bluffs?/gi, "обоснованные блефы"],
  [/credible value/gi, "обоснованное вэлью"],
  [/credible fold equity/gi, "обоснованное фолд-эквити"],
  [/credible future aggression/gi, "реалистичная будущая агрессия"],
  [/high-confidence error/gi, "ошибка при высокой уверенности"],
  [/evidence missing/gi, "подтверждений пока нет"],
  [/evidence discipline/gi, "дисциплина работы с наблюдениями"],
  [/opponent model/gi, "модель соперника"],
  [/population evidence/gi, "данные по полю"],
  [/field review/gi, "разбор реальной руки"],
  [/learner state/gi, "прогресс ученика"],
  [/learner/gi, "ученик"],
  [/feedback/gi, "разбор ответа"],
  [/falsifier/gi, "признак, который опровергнет вывод"],
  [/ownership/gi, "преимущество диапазона"],
  [/surviving value/gi, "вэлью, дошедшее до решения"],
  [/surviving bluffs?/gi, "блефы, дошедшие до решения"],
  [/surviving air/gi, "воздух, дошедший до решения"],
  [/source range/gi, "исходный диапазон"],
  [/branch read/gi, "наблюдение по конкретной ветке"],
  [/global label/gi, "общий ярлык"],
  [/global rule/gi, "универсальное правило"],
  [/pattern/gi, "схема"],
  [/default/gi, "базовая линия"],
  [/gate/gi, "проверка"],
  [/skill/gi, "навык"],
  [/items?/gi, "задания"],
];

const exactReplacements = new Map([
  ["У каждой ставки есть job", "У каждой ставки есть задача"],
  ["Value сначала. Потом job каждой bluff-hand.", "Сначала вэлью. Затем — задача каждой руки для блефа."],
  ["Value сначала. Потом job каждой bluff-hand.", "Сначала вэлью. Затем — задача каждой руки для блефа."],
  ["Weakest value", "Самое тонкое вэлью"],
  ["Folds blocked?", "Не блокируем ли мы фолды?"],
  ["River plan", "План на ривер"],
  ["Source → action → survivors.", "Исходный диапазон → действие → что осталось."],
  ["Value → bluffs → size → blocker → evidence.", "Вэлью → блефы → размер → блокер → данные."],
  ["Changed node → delay → field review.", "Изменённая ситуация → пауза → разбор реальной руки."],
  ["Correct → variant transfer → retention → field validation.", "Верный ответ → перенос → удержание → подтверждение за столом."],
  ["Immediate", "Сразу после объяснения"],
  ["Transfer + delay", "Перенос и повторение позже"],
  ["WORKING evidence", "локальное подтверждение в практике"],
  ["FIELD_VALIDATED", "подтверждено за столом"],
]);

function transform(text) {
  if (exactReplacements.has(text)) return exactReplacements.get(text);
  let result = text;
  for (const [pattern, replacement] of phraseReplacements) result = result.replace(pattern, replacement);
  return result.replace(/\s+/gu, " ").trim();
}

source = source.replace(/"(?:\\.|[^"\\])*"/gu, (literal) => {
  let value;
  try { value = JSON.parse(literal); } catch { return literal; }
  if (typeof value !== "string") return literal;
  if (/^(?:MC-|LCM-|H-|geo-|pre-|bli-|fil-|sha-|agg-|anc-|mul-|riv-|evi-|tra-)/u.test(value)) return literal;
  return JSON.stringify(transform(value));
});

await writeFile(path, source, "utf8");
console.log("Naturalized canonical Russian learner copy while preserving conventional poker notation and stable IDs.");
