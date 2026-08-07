"use client";

import { useEffect } from "react";
import { applyWave5PracticeCopy } from "../content/i18n/wave5-practice-copy";
import type { LocaleCode } from "../lib/model";

function currentLocale(): LocaleCode {
  return document.documentElement.lang === "en" ? "en" : "ru";
}

function syncVisibleFilteringCard(locale: LocaleCode) {
  const session = document.querySelector<HTMLElement>("main .session");
  if (!session) return;
  const code = session.querySelector<HTMLElement>(".module-code")?.textContent ?? "";
  if (!code.includes("LCM-04")) return;
  const heading = session.querySelector<HTMLElement>("h2");
  if (!heading) return;
  const known = new Set([
    "What comes before a blocker?",
    "What should be rebuilt before judging a blocker on a new street?",
    "Что идёт до блокера?",
    "Что восстановить перед оценкой блокера на новой улице?",
  ]);
  if (!known.has(heading.textContent?.trim() ?? "")) return;
  heading.textContent = locale === "ru"
    ? "Что восстановить перед оценкой блокера на новой улице?"
    : "What should be rebuilt before judging a blocker on a new street?";
}

export default function Wave5PracticeCopySync() {
  useEffect(() => {
    let scheduled = false;
    const sync = () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => {
        scheduled = false;
        const locale = currentLocale();
        applyWave5PracticeCopy(locale);
        syncVisibleFilteringCard(locale);
      });
    };
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["lang"],
      childList: true,
      subtree: true,
    });
    return () => observer.disconnect();
  }, []);
  return null;
}
