"use client";

import { useCallback, useEffect, useState } from "react";

const LOCALE_KEY = "live-cash-os:locale";
export type PracticalLocale = "ru" | "en";

function readLocale(): PracticalLocale {
  if (typeof window === "undefined") return "ru";
  try { return window.localStorage.getItem(LOCALE_KEY) === "en" ? "en" : "ru"; } catch { return "ru"; }
}

export function usePracticalLocale() {
  const [locale, setLocaleState] = useState<PracticalLocale>("ru");

  useEffect(() => {
    const next = readLocale();
    setLocaleState(next);
    document.documentElement.lang = next;
  }, []);

  const setLocale = useCallback((next: PracticalLocale) => {
    setLocaleState(next);
    try { window.localStorage.setItem(LOCALE_KEY, next); } catch { /* best effort */ }
    document.documentElement.lang = next;
  }, []);

  return [locale, setLocale] as const;
}
