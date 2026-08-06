import type { LearningMode } from "../../lib/model";
import type { Drill, Flashcard } from "../types";
import type { Locale } from "./ui";

const labels = {
  ru: {
    lesson: "урок",
    practice: "практика",
    repair: "разбор ошибки",
    review: "повторение",
    mixed: "смешанная тренировка",
    core: "основная ситуация",
    changed: "изменённая ситуация",
    boundary: "граница правила",
    mixedDrill: "переключение контекста",
    retention: "проверка через время",
    heuristic: "ориентир",
    procedure: "порядок действий",
    diagnosticNotStarted: "не начата",
    diagnosticInProgress: "в процессе",
    diagnosticAwaitingReview: "ждёт проверки",
    diagnosticScored: "проверена",
    diagnosticRouted: "маршрут построен",
  },
  en: {
    lesson: "lesson",
    practice: "practice",
    repair: "repair",
    review: "review",
    mixed: "mixed practice",
    core: "core spot",
    changed: "changed spot",
    boundary: "rule boundary",
    mixedDrill: "context switch",
    retention: "delayed check",
    heuristic: "heuristic",
    procedure: "procedure",
    diagnosticNotStarted: "not started",
    diagnosticInProgress: "in progress",
    diagnosticAwaitingReview: "awaiting review",
    diagnosticScored: "scored",
    diagnosticRouted: "route ready",
  },
} as const;

export function learningModeLabel(locale: Locale, mode: LearningMode): string {
  return labels[locale][mode];
}

export function drillKindLabel(locale: Locale, kind: Drill["kind"]): string {
  return kind === "mixed" ? labels[locale].mixedDrill : labels[locale][kind];
}

export function reviewKindLabel(locale: Locale, kind: "repair" | "retention"): string {
  return labels[locale][kind];
}

export function cardKindLabel(locale: Locale, kind: Flashcard["kind"]): string {
  return labels[locale][kind];
}

export function diagnosticStatusLabel(locale: Locale, status: "NOT_STARTED" | "IN_PROGRESS" | "AWAITING_REVIEW" | "SCORED" | "ROUTED"): string {
  const key = ({
    NOT_STARTED: "diagnosticNotStarted",
    IN_PROGRESS: "diagnosticInProgress",
    AWAITING_REVIEW: "diagnosticAwaitingReview",
    SCORED: "diagnosticScored",
    ROUTED: "diagnosticRouted",
  } as const)[status];
  return labels[locale][key];
}
