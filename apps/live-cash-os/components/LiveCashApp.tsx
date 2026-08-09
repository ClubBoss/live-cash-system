"use client";

import { runtimeCopy } from "../content/i18n/runtime";
import LiveCashAppCore from "./LiveCashAppCore";

const rawBuildSha = (import.meta as ImportMeta & { env?: { VITE_BUILD_SHA?: string } }).env?.VITE_BUILD_SHA ?? "local";
const buildLabel = rawBuildSha === "local" ? "local" : rawBuildSha.slice(0, 7);

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
});

Object.assign(runtimeCopy.en, {
  diagnosticTitle: "Starting Diagnostic",
  openT1: "Open Diagnostic →",
  startT1: "Start Diagnostic",
  coldAvailable: "STARTING DIAGNOSTIC · T1",
  postLearning: "CURRENT DIAGNOSTIC · T1",
  warmupTitle: "Quick warm-up · up to 2 minutes",
  warmupDescription: "One familiar decision from a recent miss and up to two cards you have already studied.",
});

/**
 * Runtime shell. Locale changes are rendered directly by LiveCashAppCore;
 * no DOM text replacement or post-render localisation bridge is used.
 * The accepted Wave 5 practice layer is composed once by app/page.tsx.
 */
export default function LiveCashApp() {
  return <>
    <LiveCashAppCore />
    <footer
      data-build-sha={rawBuildSha}
      aria-label={`Build ${buildLabel}`}
      style={{ padding: "12px 24px 18px", textAlign: "right", fontSize: "12px", opacity: 0.55 }}
    >
      Build {buildLabel}
    </footer>
  </>;
}
