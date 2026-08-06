import type { Locale } from "./ui";

export type RouteStage = {
  percent: 0 | 10 | 20 | 35 | 50 | 65 | 80 | 90 | 100;
  title: string;
  description: string;
};

const ROUTE: Record<Locale, RouteStage[]> = {
  ru: [
    { percent: 0, title: "Старт", description: "Выбери язык. Прогресс пока не начисляется." },
    { percent: 10, title: "Исходная точка", description: "Необязательный T1 или первый вопрос модуля без подсказки." },
    { percent: 20, title: "Понять идею", description: "Короткое объяснение, три ориентира и порядок решения." },
    { percent: 35, title: "Увидеть в действии", description: "Разобранный пример, контрпример и тренажёр." },
    { percent: 50, title: "Применить на другой ситуации", description: "Меняются глубина, позиция, размер или порядок действий." },
    { percent: 65, title: "Исправить ошибки", description: "Точечный разбор причины и близкая проверочная ситуация." },
    { percent: 80, title: "Вспомнить позже", description: "Повторение через время без свежей подсказки." },
    { percent: 90, title: "Применить за столом", description: "Записать реальную руку и логику решения до результата." },
    { percent: 100, title: "Подтвердить навык", description: "Разобранные реальные руки плюс перенос и удержание по этой теме." },
  ],
  en: [
    { percent: 0, title: "Start", description: "Choose a language. No skill evidence is awarded yet." },
    { percent: 10, title: "Establish a baseline", description: "Use optional T1 or the module's first cold decision." },
    { percent: 20, title: "Understand the mechanism", description: "Read the short explanation, three cues and decision order." },
    { percent: 35, title: "See it applied", description: "Work through an example, counterexample and interactive lab." },
    { percent: 50, title: "Transfer it", description: "Apply the mechanism after depth, position, size or action order changes." },
    { percent: 65, title: "Repair mistakes", description: "Fix the precise cause and answer a nearby contrast spot." },
    { percent: 80, title: "Retrieve it later", description: "Review after a real delay without the fresh explanation." },
    { percent: 90, title: "Use it at the table", description: "Capture a real hand and the reasoning before judging the result." },
    { percent: 100, title: "Validate the skill", description: "Reviewed field hands plus retained transfer for this module." },
  ],
};

export function getLearningRoute(locale: Locale): RouteStage[] {
  return ROUTE[locale];
}
