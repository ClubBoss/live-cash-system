"use client";

import { runtimeCopy } from "../content/i18n/runtime";
import { APP_VERSION } from "../lib/model";
import FeedbackDedupGuard from "./FeedbackDedupGuard";
import LiveCashAppCore from "./LiveCashAppCore";

const rawBuildSha = (import.meta as ImportMeta & { env?: { VITE_BUILD_SHA?: string } }).env?.VITE_BUILD_SHA ?? "local";
const buildLabel = rawBuildSha === "local" ? "local" : rawBuildSha.slice(0, 7);

Object.assign(runtimeCopy.ru, { diagnosticTitle: "Стартовая диагностика", openT1: "Открыть диагностику →", startT1: "Начать диагностику", coldAvailable: "СТАРТОВАЯ ДИАГНОСТИКА · T1", postLearning: "ТЕКУЩАЯ ДИАГНОСТИКА · T1", warmupTitle: "Быстрая разминка · до 2 минут", warmupDescription: "Одно знакомое решение из недавней ошибки и до двух уже изученных карточек.", finishLesson: "Открыть итог урока", lessonFinished: "Итог урока", saveReturn: "Завершить урок и вернуться" });
Object.assign(runtimeCopy.en, { diagnosticTitle: "Starting Diagnostic", openT1: "Open Diagnostic →", startT1: "Start Diagnostic", coldAvailable: "STARTING DIAGNOSTIC · T1", postLearning: "CURRENT DIAGNOSTIC · T1", warmupTitle: "Quick warm-up · up to 2 minutes", warmupDescription: "One familiar decision from a recent miss and up to two cards you have already studied.", finishLesson: "Open lesson summary", lessonFinished: "Lesson summary", saveReturn: "Complete lesson and return" });

export default function LiveCashApp() {
  return <><LiveCashAppCore /><FeedbackDedupGuard /><footer data-build-sha={rawBuildSha} data-app-version={APP_VERSION} aria-label={`Live Cash OS v${APP_VERSION} · Build ${buildLabel}`} style={{ padding: "12px 24px 18px", textAlign: "right", fontSize: "12px", opacity: 0.55 }}>Live Cash OS v{APP_VERSION} · Build {buildLabel}</footer></>;
}
