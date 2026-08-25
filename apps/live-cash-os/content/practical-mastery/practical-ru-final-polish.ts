import type { PracticalDecision, PracticalDecisionOption } from "./types";

const FINAL_RU_POLISH = new Map<string, string>([
  ["Небольшой открытие + широкий диапазон + закрытие торгов.", "Небольшой open + широкий диапазон + закрытие торгов."],
  ["Небольшой открытие, широкий диапазон поздней позиции, BB закрывает торги.", "Небольшой open, широкий диапазон поздней позиции, BB закрывает торги."],
  ["Это явные благоприятные условия защиты BB из.", "Это явные благоприятные условия для защиты BB."],
  ["Кандидат на изменение игры / снятие верхнего ограничения диапазона диапазона", "Кандидат на изменение игры / снятие верхнего ограничения диапазона"],
]);

function polishRu(text: string): string {
  return FINAL_RU_POLISH.get(text) ?? text;
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
