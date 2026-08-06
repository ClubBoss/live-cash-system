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
    { percent: 0, title: "Start", description: "Choose a language. The choice itself creates no skill evidence.", evidenceGate: "No evidence" },
    { percent: 10, title: "Establish a baseline", description: "T1 or the module's first cold decision records the current model.", evidenceGate: "Cold response" },
    { percent: 20, title: "Understand the mechanism", description: "Use the short explanation, three cues and check order.", evidenceGate: "Content introduced" },
    { percent: 35, title: "See it applied", description: "Work through an example, counterexample and practical lab.", evidenceGate: "Guided application" },
    { percent: 50, title: "Transfer it", description: "An explicitly admitted probe changes depth, pot geometry or another material variable.", evidenceGate: "Explicit transfer probe" },
    { percent: 65, title: "Repair the mistake", description: "A targeted repair closes the exact reasoning failure instead of replaying the whole lesson.", evidenceGate: "Repair resolved" },
    { percent: 80, title: "Retrieve it later", description: "The skill is tested after a real delay without the fresh explanation.", evidenceGate: "Due retention passed" },
    { percent: 90, title: "Use it at the table", description: "A real hand records the cue, action and reason before outcome review.", evidenceGate: "Reviewed field hand" },
    { percent: 100, title: "Validate the skill", description: "Retention, explicit transfer and at least two reviewed field hands support the module.", evidenceGate: "Field validated" },
  ],
};

export function getLearningRoute(locale: LocaleCode): RouteStage[] {
  return ROUTE[locale];
}
