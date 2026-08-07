import type { LocaleCode } from "../../lib/model";

export type RouteStage = {
  percent: 0 | 10 | 20 | 35 | 50 | 65 | 80 | 90 | 100;
  title: string;
  description: string;
  evidenceGate: string;
};

const ROUTE: Record<LocaleCode, RouteStage[]> = {
  ru: [
    { percent: 0, title: "Старт", description: "Выбери язык и посмотри, с чего лучше начать.", evidenceGate: "Пока без оценки" },
    { percent: 10, title: "Исходная точка", description: "T1 или первый вопрос без подсказки показывает, как ты рассуждаешь сейчас.", evidenceGate: "Решение без подсказки" },
    { percent: 20, title: "Разобрать идею", description: "Короткое объяснение, три ориентира и понятный порядок решения.", evidenceGate: "Тема разобрана" },
    { percent: 35, title: "Увидеть на примере", description: "Разобранная раздача, важное исключение и практический тренажёр.", evidenceGate: "Пример пройден" },
    { percent: 50, title: "Применить в новых условиях", description: "Проверь ту же идею, когда меняются глубина, размер банка или другой важный параметр.", evidenceGate: "Проверка в новой ситуации" },
    { percent: 65, title: "Исправить ошибку", description: "Короткая тренировка закрывает конкретную причину ошибки, не заставляя проходить весь урок заново.", evidenceGate: "Ошибка исправлена" },
    { percent: 80, title: "Вспомнить после паузы", description: "Вернись к теме позже и реши задачу без свежей подсказки.", evidenceGate: "Повторение после паузы" },
    { percent: 90, title: "Применить за столом", description: "Запиши реальную руку: что заметил, как сыграл и почему выбрал эту линию.", evidenceGate: "Реальная рука разобрана" },
    { percent: 100, title: "Подтвердить навык", description: "Тема подтверждается только после повторения, новых условий и нескольких разобранных реальных рук.", evidenceGate: "Навык подтверждён" },
  ],
  en: [
    { percent: 0, title: "Start", description: "Choose a language and see where to begin.", evidenceGate: "No score yet" },
    { percent: 10, title: "See your starting point", description: "T1 or the first unprompted question shows how you make the decision right now.", evidenceGate: "Decision without hints" },
    { percent: 20, title: "Understand the idea", description: "Use a short explanation, three practical cues and a clear decision order.", evidenceGate: "Idea understood" },
    { percent: 35, title: "See it in a hand", description: "Work through an example, an important exception and a practical lab.", evidenceGate: "Example completed" },
    { percent: 50, title: "Use it in a new spot", description: "Try the same idea when depth, pot size or another important detail changes.", evidenceGate: "Solved in changed conditions" },
    { percent: 65, title: "Fix the mistake", description: "A short targeted exercise works on the exact reason for the error instead of replaying the whole lesson.", evidenceGate: "Mistake corrected" },
    { percent: 80, title: "Recall it later", description: "Return after a real delay and solve again without the fresh explanation in front of you.", evidenceGate: "Recalled after a delay" },
    { percent: 90, title: "Use it at the table", description: "Record a real hand: what you noticed, what you did and why you chose that line.", evidenceGate: "Real hand reviewed" },
    { percent: 100, title: "Confirm the skill", description: "A topic is confirmed only after later recall, changed situations and more than one reviewed real hand.", evidenceGate: "Skill confirmed" },
  ],
};

export function getLearningRoute(locale: LocaleCode): RouteStage[] {
  return ROUTE[locale];
}
