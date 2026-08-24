"use client";

import { type FormEvent, type ReactNode, useEffect, useRef, useState } from "react";
import { rememberStateBootstrap } from "../lib/state-bootstrap";
import {
  CONFLICT_BACKUP_KEY,
  IMPORT_BACKUP_KEY,
  LEARNER_STORAGE_KEY,
  PORTABLE_PROFILE_KEY,
  RECOVERY_BACKUP_KEY,
  SYNC_META_KEY,
} from "../lib/use-learner-state-sync";

declare const __LIVE_CASH_TEST_INVITE_MODE__: boolean;

const PROFILE_HEADER = "x-live-cash-profile-code";
const CODE_PATTERN = /^LCO-[A-Z0-9_-]{20,80}$/;
const LOCALE_KEY = "live-cash-os:locale";
const INVITE_CHECK_TIMEOUT_MS = 10_000;
const PROFILE_LOCAL_STATE_KEYS = [
  LEARNER_STORAGE_KEY,
  SYNC_META_KEY,
  RECOVERY_BACKUP_KEY,
  IMPORT_BACKUP_KEY,
  CONFLICT_BACKUP_KEY,
] as const;

type GateLocale = "ru" | "en";
type InviteCheckResult = "VALID" | "INVALID" | "OFFLINE" | "SERVICE_UNAVAILABLE";
type GateStatus = "CHECKING" | "READY" | Exclude<InviteCheckResult, "VALID">;

const GATE_COPY = {
  ru: {
    language: "Язык интерфейса",
    title: "Вход для тестирования",
    description: "Введите выданный вам код. До подтверждения доступ к обучению и локальному прогрессу закрыт.",
    codeLabel: "Код доступа",
    continue: "Продолжить",
    retry: "Повторить проверку",
    checking: "Проверяем код доступа…",
    invalid: "Код не найден или отключён. Проверьте его и попробуйте ещё раз.",
    offline: "Нет подключения к интернету. Подключитесь к сети, чтобы проверить код доступа.",
    serviceUnavailable: "Сервис проверки временно недоступен. Код может быть корректным — попробуйте ещё раз чуть позже.",
  },
  en: {
    language: "Interface language",
    title: "Test access",
    description: "Enter the code you were given. Training and local progress stay locked until it is verified.",
    codeLabel: "Access code",
    continue: "Continue",
    retry: "Retry verification",
    checking: "Checking access code…",
    invalid: "The code was not found or has been disabled. Check it and try again.",
    offline: "No internet connection. Connect to the internet to verify the access code.",
    serviceUnavailable: "The verification service is temporarily unavailable. Your code may still be valid — try again a little later.",
  },
} as const;

function storedCode(): string {
  try { return localStorage.getItem(PORTABLE_PROFILE_KEY)?.trim().toUpperCase() ?? ""; } catch { return ""; }
}

function clearPreviousProfileLocalState() {
  try {
    for (const key of PROFILE_LOCAL_STATE_KEYS) localStorage.removeItem(key);
  } catch { /* Server identity still prevents cross-account cloud access. */ }
}

function rememberCode(code: string) {
  try {
    const previous = localStorage.getItem(PORTABLE_PROFILE_KEY)?.trim().toUpperCase() ?? "";
    if (previous !== code) clearPreviousProfileLocalState();
    localStorage.setItem(PORTABLE_PROFILE_KEY, code);
  } catch { /* The server check still protects the mirror. */ }
}

function storedLocale(): GateLocale {
  try { return localStorage.getItem(LOCALE_KEY) === "en" ? "en" : "ru"; } catch { return "ru"; }
}

function rememberLocale(locale: GateLocale) {
  try { localStorage.setItem(LOCALE_KEY, locale); } catch { /* Locale persistence is best effort only. */ }
}

async function checkInvite(code: string): Promise<InviteCheckResult> {
  if (!CODE_PATTERN.test(code)) return "INVALID";
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), INVITE_CHECK_TIMEOUT_MS);
  try {
    const response = await fetch("/api/state", {
      cache: "no-store",
      headers: { [PROFILE_HEADER]: code },
      signal: controller.signal,
    });
    if (response.ok) {
      try {
        rememberStateBootstrap(code, await response.json() as unknown);
      } catch {
        return "SERVICE_UNAVAILABLE";
      }
      return "VALID";
    }
    if (response.status === 401) return "INVALID";
    return "SERVICE_UNAVAILABLE";
  } catch {
    return navigator.onLine ? "SERVICE_UNAVAILABLE" : "OFFLINE";
  } finally {
    window.clearTimeout(timeout);
  }
}

export default function TestInviteGate({ children }: { children: ReactNode }) {
  const enabled = __LIVE_CASH_TEST_INVITE_MODE__;
  const [code, setCode] = useState("");
  const [locale, setLocale] = useState<GateLocale>("ru");
  const [status, setStatus] = useState<GateStatus>("CHECKING");
  const [accessGranted, setAccessGranted] = useState(false);
  const checkingRef = useRef(false);
  const copy = GATE_COPY[locale];

  useEffect(() => {
    if (!enabled) return;
    const nextLocale = storedLocale();
    setLocale(nextLocale);
    document.documentElement.lang = nextLocale;
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    const existing = storedCode();
    if (!existing) {
      setStatus("READY");
      return;
    }

    setCode(existing);
    checkingRef.current = true;
    void checkInvite(existing).then((result) => {
      if (cancelled) return;
      checkingRef.current = false;
      if (result === "VALID") {
        setAccessGranted(true);
        return;
      }
      setStatus(result);
    });

    return () => {
      cancelled = true;
      checkingRef.current = false;
    };
  }, [enabled]);

  if (!enabled) return <>{children}</>;
  if (accessGranted) return <>{children}</>;

  function changeLocale(nextLocale: GateLocale) {
    setLocale(nextLocale);
    rememberLocale(nextLocale);
    document.documentElement.lang = nextLocale;
  }

  async function verify(normalized: string) {
    if (checkingRef.current) return;
    checkingRef.current = true;
    setStatus("CHECKING");
    try {
      const result = await checkInvite(normalized);
      if (result === "VALID") {
        rememberCode(normalized);
        setAccessGranted(true);
        return;
      }
      setStatus(result);
    } finally {
      checkingRef.current = false;
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await verify(code.trim().toUpperCase());
  }

  const alert = status === "INVALID"
    ? copy.invalid
    : status === "OFFLINE"
      ? copy.offline
      : status === "SERVICE_UNAVAILABLE"
        ? copy.serviceUnavailable
        : null;
  const submitLabel = status === "CHECKING"
    ? copy.checking
    : status === "SERVICE_UNAVAILABLE" || status === "OFFLINE"
      ? copy.retry
      : copy.continue;

  return <main className="loading">
    <section aria-labelledby="test-access-title" style={{ maxWidth: 420, padding: 24, textAlign: "left" }}>
      <p style={{ margin: "0 0 8px", opacity: 0.7 }}>LIVE CASH OS · TEST</p>
      <div className="mode-switch" role="group" aria-label={copy.language} style={{ marginBottom: 20 }}>
        <button type="button" aria-pressed={locale === "ru"} onClick={() => changeLocale("ru")}>RU</button>
        <button type="button" aria-pressed={locale === "en"} onClick={() => changeLocale("en")}>EN</button>
      </div>
      <h1 id="test-access-title">{copy.title}</h1>
      <p>{copy.description}</p>
      <form onSubmit={submit} aria-busy={status === "CHECKING"}>
        <label htmlFor="test-invite-code">{copy.codeLabel}</label>
        <input
          id="test-invite-code"
          value={code}
          onChange={(event) => setCode(event.target.value.toUpperCase())}
          placeholder="LCO-TEST-…"
          autoCapitalize="characters"
          autoCorrect="off"
          autoComplete="off"
          disabled={status === "CHECKING"}
          required
          style={{ display: "block", width: "100%", margin: "8px 0 12px" }}
        />
        <button type="submit" disabled={status === "CHECKING"}>
          {submitLabel}
        </button>
      </form>
      {status === "CHECKING" && <p role="status">{copy.checking}</p>}
      {alert && <p role="alert">{alert}</p>}
    </section>
  </main>;
}
