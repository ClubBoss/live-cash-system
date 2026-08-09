import { runtimeCopy } from "../content/i18n/runtime";

export type SessionLocale = "ru" | "en";

export type SessionSyncStatus =
  | "loading"
  | "local"
  | "syncing"
  | "synced"
  | "offline"
  | "conflict"
  | "error";

export type LessonSkillState =
  | "UNEXPOSED"
  | "INTRODUCED"
  | "FRAGILE"
  | "WORKING"
  | "RETAINED"
  | "FIELD_TEST_PENDING"
  | "FIELD_VALIDATED"
  | "REPAIR_REQUIRED";

// Today already counts dueReviewItems. Keep that scheduler truth intact and only
// give the existing counter a learner-facing label that says what it measures.
runtimeCopy.ru.dueItems = "повторений на сегодня";
runtimeCopy.en.dueItems = "reviews due";

const skillLabels: Record<SessionLocale, Record<LessonSkillState, string>> = {
  ru: {
    UNEXPOSED: "не начато",
    INTRODUCED: "только знакомство",
    FRAGILE: "нужно закрепить",
    WORKING: "получается",
    RETAINED: "вспоминается после паузы",
    FIELD_TEST_PENDING: "нужны разобранные реальные руки",
    FIELD_VALIDATED: "подтверждено в разобранных руках",
    REPAIR_REQUIRED: "нуждается в работе",
  },
  en: {
    UNEXPOSED: "not started",
    INTRODUCED: "introduced",
    FRAGILE: "needs reinforcement",
    WORKING: "working in practice",
    RETAINED: "recalled after a delay",
    FIELD_TEST_PENDING: "needs reviewed real hands",
    FIELD_VALIDATED: "supported by reviewed real hands",
    REPAIR_REQUIRED: "needs repair",
  },
};

export function skillStateLabel(locale: SessionLocale, state: LessonSkillState): string {
  return skillLabels[locale][state];
}

export function lessonSkillTruth(
  locale: SessionLocale,
  contentCompleted: boolean,
  state: LessonSkillState,
): { lesson: string; skill: string; explanation: string | null } {
  const lesson = locale === "ru"
    ? `Урок: ${contentCompleted ? "пройден" : "не пройден"}`
    : `Lesson: ${contentCompleted ? "completed" : "not completed"}`;
  const skill = locale === "ru"
    ? `Навык: ${skillStateLabel(locale, state)}`
    : `Skill: ${skillStateLabel(locale, state)}`;
  const explanation = contentCompleted && state === "REPAIR_REQUIRED"
    ? locale === "ru"
      ? "Урок завершён. В самостоятельной проверке была ошибка, поэтому отдельное задание добавлено в Повтор."
      : "Lesson completed. A self-check found a mistake, so a separate repair task was added to Review."
    : null;
  return { lesson, skill, explanation };
}

export function lessonStepLabel(locale: SessionLocale, lcm: string, zeroBasedStep: number): string {
  const step = zeroBasedStep + 1;
  return locale === "ru"
    ? `${lcm} · Урок · шаг ${step} из 10`
    : `${lcm} · Lesson · step ${step} of 10`;
}

export function sessionSaveLabel(
  locale: SessionLocale,
  status: SessionSyncStatus,
  recoveryCode: string | null,
): string {
  const ru = locale === "ru";
  if (recoveryCode === "LOCAL_WRITE_FAILED") return ru ? "Сохранение не удалось" : "Save failed";
  if (status === "syncing") return ru ? "Сохраняем…" : "Saving…";
  if (status === "synced") return ru ? "Сохранено" : "Saved";
  if (status === "local") return ru ? "Сохранено на устройстве" : "Saved on device";
  if (status === "offline") return ru ? "Нет сети · сохранено локально" : "Offline · saved locally";
  if (status === "conflict") return ru ? "Нужна синхронизация" : "Sync needed";
  if (status === "error") {
    return recoveryCode
      ? ru ? "Сохранение требует внимания" : "Save needs attention"
      : ru ? "Нужна синхронизация" : "Sync needed";
  }
  return ru ? "Проверяем сохранение…" : "Checking save…";
}

export function diagnosticContinuation(
  locale: SessionLocale,
  status: string,
  savedResponses: number,
): { title: string; body: string; action: string } | null {
  if (status !== "IN_PROGRESS" || savedResponses >= 10) return null;
  const next = savedResponses + 1;
  return locale === "ru"
    ? {
        title: `Диагностика · ${savedResponses}/10 сохранено`,
        body: `Сохранённые ответы не потеряны. Продолжишь с ${next}-го вопроса.`,
        action: "Продолжить",
      }
    : {
        title: `Diagnostic · ${savedResponses}/10 saved`,
        body: `Your saved answers are still here. Continue with question ${next}.`,
        action: "Continue",
      };
}
