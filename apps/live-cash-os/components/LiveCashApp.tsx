"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { runtimeCopy } from "../content/i18n/runtime";
import { APP_VERSION } from "../lib/model";
import LiveCashAppCore from "./LiveCashAppCore";

const THEME_KEY = "live-cash-os:theme";
const rawBuildSha = (import.meta as ImportMeta & { env?: { VITE_BUILD_SHA?: string } }).env?.VITE_BUILD_SHA ?? "local";
const buildLabel = rawBuildSha === "local" ? "local" : rawBuildSha.slice(0, 7);

type ThemeMode = "light" | "dark";
type ShellLanguage = "ru" | "en";

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

function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [language, setLanguage] = useState<ShellLanguage>("ru");
  const [target, setTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    const shellTarget = document.querySelector<HTMLElement>(".topmeta");
    setTheme(root.dataset.theme === "dark" ? "dark" : "light");
    setLanguage(root.lang === "en" ? "en" : "ru");
    setTarget(shellTarget);

    const syncLanguageFromControl = (event: Event) => {
      if (!(event.target instanceof Element)) return;
      const button = event.target.closest<HTMLButtonElement>(".mode-switch button");
      if (!button || !shellTarget?.contains(button)) return;
      setLanguage(button.textContent?.trim() === "EN" ? "en" : "ru");
    };

    shellTarget?.addEventListener("click", syncLanguageFromControl);
    return () => shellTarget?.removeEventListener("click", syncLanguageFromControl);
  }, []);

  if (!target) return null;

  const dark = theme === "dark";
  const label = language === "ru" ? "Темная тема" : "Dark theme";
  const title = language === "ru"
    ? dark ? "Переключить на светлую тему" : "Переключить на темную тему"
    : dark ? "Switch to light theme" : "Switch to dark theme";

  function toggleTheme() {
    const next: ThemeMode = dark ? "light" : "dark";
    const root = document.documentElement;
    root.dataset.theme = next;
    root.style.colorScheme = next;
    setTheme(next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // Theme preference is optional; the visual change still applies for this tab.
    }
  }

  return createPortal(
    <button
      type="button"
      className="theme-toggle"
      role="switch"
      aria-checked={dark}
      aria-label={label}
      title={title}
      onClick={toggleTheme}
    >
      <span className="theme-toggle-track" aria-hidden="true">
        <span className="theme-toggle-thumb" />
      </span>
    </button>,
    target,
  );
}

/**
 * Runtime shell. Locale changes are rendered directly by LiveCashAppCore;
 * no DOM text replacement or post-render localisation bridge is used.
 * The accepted Wave 5 practice layer is composed once by app/page.tsx.
 */
export default function LiveCashApp() {
  return <>
    <LiveCashAppCore />
    <ThemeToggle />
    <footer
      data-build-sha={rawBuildSha}
      data-app-version={APP_VERSION}
      aria-label={`Live Cash OS v${APP_VERSION} · Build ${buildLabel}`}
      style={{ padding: "12px 24px 18px", textAlign: "right", fontSize: "12px", opacity: 0.55 }}
    >
      Live Cash OS v{APP_VERSION} · Build {buildLabel}
    </footer>
  </>;
}
