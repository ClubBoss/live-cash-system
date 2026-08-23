"use client";

import { runtimeCopy } from "../content/i18n/runtime";
import BuildIdentityFooter from "./BuildIdentityFooter";
import FeedbackDedupGuard from "./FeedbackDedupGuard";
import LiveCashAppCore from "./LiveCashAppCore";

// Final learner-facing terminology cleanup. The canonical runtime copy is already
// composed through Object.assign in content/i18n/runtime.ts; keep this bounded to
// generic shell language and do not change curriculum or strategy semantics.
Object.assign(runtimeCopy.ru, {
  diagnosticTitle: "Стартовая диагностика",
  openT1: "Открыть диагностику →",
  startT1: "Начать диагностику",
  coldAvailable: "СТАРТОВАЯ ДИАГНОСТИКА · T1",
  postLearning: "ТЕКУЩАЯ ДИАГНОСТИКА · T1",
  warmupTitle: "Быстрая разминка · до 2 минут",
  warmupDescription: "Одно знакомое решение из недавней ошибки и до двух уже изученных карточек.",
  finishLesson: "Открыть итог урока",
  lessonFinished: "Итог урока",
  saveReturn: "Завершить урок и вернуться",
});

Object.assign(runtimeCopy.en, {
  diagnosticTitle: "Starting Diagnostic",
  openT1: "Open Diagnostic →",
  startT1: "Start Diagnostic",
  coldAvailable: "STARTING DIAGNOSTIC · T1",
  postLearning: "CURRENT DIAGNOSTIC · T1",
  warmupTitle: "Quick warm-up · up to 2 minutes",
  warmupDescription: "One familiar decision from a recent miss and up to two cards you have already studied.",
  finishLesson: "Open lesson summary",
  lessonFinished: "Lesson summary",
  saveReturn: "Complete lesson and return",
});

/**
 * Runtime shell. Locale changes are rendered directly by LiveCashAppCore;
 * no DOM text replacement or post-render localisation bridge is used.
 * The accepted Wave 5 practice layer is composed once by app/tools/page.tsx.
 */
export default function LiveCashApp() {
  return <>
    <LiveCashAppCore />
    <FeedbackDedupGuard />
    <BuildIdentityFooter />
  </>;
}
