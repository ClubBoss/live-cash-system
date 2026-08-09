import type { Drill } from "../types";
import type { LearningMode, LocaleCode, ResponseClass } from "../../lib/model";

const choose = (locale: LocaleCode, ru: string, en: string) => locale === "ru" ? ru : en;

export function sessionModeLabel(locale: LocaleCode, mode: LearningMode): string {
  const labels: Record<LearningMode, [string, string]> = {
    lesson: ["УРОК", "LESSON"],
    practice: ["ПРАКТИКА", "PRACTICE"],
    repair: ["РАБОТА НАД ОШИБКОЙ", "FIX A MISTAKE"],
    review: ["ПОВТОР ПОСЛЕ ПАУЗЫ", "REVIEW AFTER A DELAY"],
    mixed: ["СМЕШАННАЯ ПРАКТИКА", "MIXED PRACTICE"],
  };
  return labels[mode][locale === "ru" ? 0 : 1];
}

export function drillKindLabel(locale: LocaleCode, kind: Drill["kind"]): string {
  const labels: Record<Drill["kind"], [string, string]> = {
    core: ["ОСНОВНАЯ ЗАДАЧА", "CORE DECISION"],
    changed: ["НОВЫЕ УСЛОВИЯ", "CHANGED SPOT"],
    boundary: ["ВАЖНОЕ ИСКЛЮЧЕНИЕ", "IMPORTANT EXCEPTION"],
    mixed: ["СМЕШАННАЯ ЗАДАЧА", "MIXED DECISION"],
  };
  return labels[kind][locale === "ru" ? 0 : 1];
}

export function reviewKindLabel(locale: LocaleCode, kind: string): string {
  if (kind === "repair") return choose(locale, "Работа над ошибкой", "Fix a mistake");
  if (kind === "retention") return choose(locale, "Повтор после паузы", "Review after a delay");
  return choose(locale, "Повтор", "Review");
}

export function cardKindLabel(locale: LocaleCode, kind: string): string {
  const labels: Record<string, [string, string]> = {
    heuristic: ["ОРИЕНТИР", "KEY CUE"],
    boundary: ["ИСКЛЮЧЕНИЕ", "EXCEPTION"],
    procedure: ["ПОРЯДОК РЕШЕНИЯ", "DECISION ORDER"],
  };
  const label = labels[kind];
  return label ? label[locale === "ru" ? 0 : 1] : choose(locale, "КАРТОЧКА", "CARD");
}

export function cardModeLabel(locale: LocaleCode, mode: "warmup" | "due" | "all"): string {
  const labels = {
    warmup: ["До 2 мин", "Up to 2 min"],
    due: ["К повторению", "Due"],
    all: ["Все", "All"],
  } as const;
  return labels[mode][locale === "ru" ? 0 : 1];
}

export function recallLabel(locale: LocaleCode): string {
  return choose(locale, "ВСПОМНИ БЕЗ ПОДСКАЗКИ", "RECALL WITHOUT HINTS");
}

export function decisionReviewLabel(locale: LocaleCode): string {
  return choose(locale, "РАЗБОР РЕШЕНИЯ", "DECISION REVIEW");
}

export function responseClassShortLabel(locale: LocaleCode, value: ResponseClass): string {
  const labels: Record<ResponseClass, [string, string]> = {
    A: ["верно", "correct"],
    B: ["причина верна", "reason correct"],
    C: ["действие верно", "action correct"],
    D: ["нужно пересмотреть", "needs review"],
    E: ["слишком уверен", "overconfident"],
    U: ["данных мало", "not enough info"],
  };
  return labels[value][locale === "ru" ? 0 : 1];
}

export function fieldStatusLabel(locale: LocaleCode, status: string): string {
  const labels: Record<string, [string, string]> = {
    PENDING_REVIEW: ["ждёт разбора", "awaiting review"],
    REVIEWED_VALID: ["разобрано: решение подтверждено", "reviewed: decision supported"],
    REVIEWED_REPAIR: ["разобрано: нужна практика", "reviewed: needs practice"],
    INSUFFICIENT: ["данных недостаточно", "not enough information"],
  };
  const label = labels[status];
  return label ? label[locale === "ru" ? 0 : 1] : choose(locale, "статус неизвестен", "unknown status");
}

export function diagnosticStatusLabel(locale: LocaleCode, status: string): string {
  const labels: Record<string, [string, string]> = {
    AWAITING_REVIEW: ["ЖДЁТ РАЗБОРА", "AWAITING REVIEW"],
    SCORED: ["РАЗОБРАНО", "REVIEWED"],
    ROUTED: ["ПРИОРИТЕТЫ ВЫБРАНЫ", "PRIORITIES SET"],
  };
  const label = labels[status];
  return label ? label[locale === "ru" ? 0 : 1] : choose(locale, "ДИАГНОСТИКА", "DIAGNOSTIC");
}

export function fieldFactLabels(locale: LocaleCode): { cue: string; action: string; reason: string } {
  return locale === "ru"
    ? { cue: "Что заметил", action: "Как сыграл", reason: "Почему" }
    : { cue: "What you noticed", action: "What you did", reason: "Why" };
}

export function labLabels(locale: LocaleCode): { eyebrow: string; pot: string; stack: string; betCall: string } {
  return locale === "ru"
    ? { eyebrow: "ТРЕНАЖЁР", pot: "Банк", stack: "Стек", betCall: "Ставка / колл" }
    : { eyebrow: "LAB", pot: "Pot", stack: "Stack", betCall: "Bet / call" };
}
