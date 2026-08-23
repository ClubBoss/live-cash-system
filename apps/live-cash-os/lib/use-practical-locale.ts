"use client";

import { useCallback, useEffect, useState } from "react";

const LOCALE_KEY = "live-cash-os:locale";
const LOCALE_CHANGE_EVENT = "live-cash-os:practical-locale-change";
export type PracticalLocale = "ru" | "en";

function readLocale(): PracticalLocale {
  if (typeof window === "undefined") return "ru";
  try { return window.localStorage.getItem(LOCALE_KEY) === "en" ? "en" : "ru"; } catch { return "ru"; }
}

function normalizeLocale(value: unknown): PracticalLocale {
  return value === "en" ? "en" : "ru";
}

export function usePracticalLocale() {
  const [locale, setLocaleState] = useState<PracticalLocale>("ru");

  useEffect(() => {
    const applyLocale = (next: PracticalLocale) => {
      setLocaleState(next);
      document.documentElement.lang = next;
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === LOCALE_KEY) applyLocale(normalizeLocale(event.newValue));
    };
    const onLocaleChange = (event: Event) => {
      applyLocale(normalizeLocale((event as CustomEvent<PracticalLocale>).detail));
    };

    applyLocale(readLocale());
    window.addEventListener("storage", onStorage);
    window.addEventListener(LOCALE_CHANGE_EVENT, onLocaleChange);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(LOCALE_CHANGE_EVENT, onLocaleChange);
    };
  }, []);

  const setLocale = useCallback((next: PracticalLocale) => {
    setLocaleState(next);
    try { window.localStorage.setItem(LOCALE_KEY, next); } catch { /* best effort */ }
    document.documentElement.lang = next;
    window.dispatchEvent(new CustomEvent<PracticalLocale>(LOCALE_CHANGE_EVENT, { detail: next }));
  }, []);

  return [locale, setLocale] as const;
}
