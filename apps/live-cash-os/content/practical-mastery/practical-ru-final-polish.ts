import type { PracticalDecision, PracticalDecisionOption } from "./types";

const FINAL_RU_POLISH = new Map<string, string>([
  ["Небольшой открытие + широкий диапазон + закрытие торгов.", "Небольшое открытие + широкий диапазон + закрытие торгов."],
  ["Небольшой открытие, широкий диапазон поздней позиции, BB закрывает торги.", "Небольшое открытие, широкий диапазон поздней позиции, BB закрывает торги."],
  ["Это явные благоприятные условия защиты BB из.", "Это явные благоприятные условия для защиты BB."],
  ["Кандидат на изменение игры / снятие верхнего ограничения диапазона диапазона", "Кандидат на изменение игры / снятие верхнего ограничения диапазона"],
]);

const FINAL_RU_PHRASE_POLISH: ReadonlyArray<readonly [RegExp, string]> = [
  [/небольшой открытие/giu, "небольшое открытие"],
  [/преимущество диапазона сконцентрирован(?![А-Яа-яЁё])/giu, "преимущество диапазона сконцентрировано"],
  [/концентрированный преимущество/giu, "сконцентрированное преимущество"],
  [/расширение диапазон(?![А-Яа-яЁё])/giu, "расширение диапазона"],
  [/визуальный упрощённое правило/giu, "визуальное упрощённое правило"],
  [/обычного холодный коллер/giu, "обычного холодного коллера"],
  [/часть коллы/giu, "часть коллов"],
  [/лишение эквити equity BB/giu, "лишение equity BB"],
  [/с избыточный фолд/giu, "с избыточными фолдами"],
  [/больший стек-к-банк отношение/giu, "большее отношение стека к банку"],
  [/реализации одномастный коннекторы/giu, "реализации одномастных коннекторов"],
  [/реализацию одномастный коннекторы/giu, "реализацию одномастных коннекторов"],
  [/позиция рейзер(?![А-Яа-яЁё])/giu, "позиция рейзера"],
  [/больше слабых сохранившиеся комбинации/giu, "больше слабых сохранившихся комбинаций"],
  [/избирательный доски требуют/giu, "избирательные доски требуют"],
  [/убирают слабые кандидаты(?![А-Яа-яЁё])/giu, "убирают слабых кандидатов"],
  [/конкретными ран-ауты(?![А-Яа-яЁё])/giu, "конкретными ран-аутами"],
];

function preserveInitialCase(match: string, replacement: string): string {
  if (!/^[А-ЯЁ]/u.test(match)) return replacement;
  return `${replacement.charAt(0).toLocaleUpperCase("ru-RU")}${replacement.slice(1)}`;
}

function polishRu(text: string): string {
  let polished = FINAL_RU_POLISH.get(text) ?? text;
  for (const [pattern, replacement] of FINAL_RU_PHRASE_POLISH) {
    polished = polished.replace(pattern, (match) => preserveInitialCase(match, replacement));
  }
  return polished;
}

function polishOption(option: PracticalDecisionOption): PracticalDecisionOption {
  return { ...option, textRu: polishRu(option.textRu) };
}

export function applyPracticalRuFinalPolish(decision: PracticalDecision): PracticalDecision {
  return {
    ...decision,
    cueRu: polishRu(decision.cueRu),
    questionRu: polishRu(decision.questionRu),
    explanationRu: polishRu(decision.explanationRu),
    actionOptions: decision.actionOptions.map(polishOption),
    reasonOptions: decision.reasonOptions.map(polishOption),
  };
}
