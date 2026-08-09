"use client";

import { type FormEvent, type ReactNode, useEffect, useState } from "react";
import { PORTABLE_PROFILE_KEY } from "../lib/use-learner-state-sync";

declare const __LIVE_CASH_TEST_INVITE_MODE__: boolean;

const PROFILE_HEADER = "x-live-cash-profile-code";
const CODE_PATTERN = /^LCO-[A-Z0-9_-]{20,80}$/;

function storedCode(): string {
  try { return localStorage.getItem(PORTABLE_PROFILE_KEY)?.trim().toUpperCase() ?? ""; } catch { return ""; }
}

function rememberCode(code: string) {
  try { localStorage.setItem(PORTABLE_PROFILE_KEY, code); } catch { /* The server check still protects the mirror. */ }
}

async function validInvite(code: string): Promise<boolean> {
  if (!CODE_PATTERN.test(code)) return false;
  try {
    const response = await fetch("/api/state", {
      cache: "no-store",
      headers: { [PROFILE_HEADER]: code },
    });
    return response.ok;
  } catch {
    return false;
  }
}

export default function TestInviteGate({ children }: { children: ReactNode }) {
  const enabled = __LIVE_CASH_TEST_INVITE_MODE__;
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"checking" | "ready" | "invalid" | "offline">("checking");
  const [accessGranted, setAccessGranted] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const existing = storedCode();
    if (!existing) {
      setStatus("ready");
      return;
    }
    void validInvite(existing).then((valid) => {
      if (valid) setAccessGranted(true);
      else {
        setCode(existing);
        setStatus("ready");
      }
    });
  }, [enabled]);

  if (!enabled) return <>{children}</>;
  if (accessGranted) return <>{children}</>;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = code.trim().toUpperCase();
    setStatus("checking");
    const valid = await validInvite(normalized);
    if (valid) {
      rememberCode(normalized);
      setAccessGranted(true);
      return;
    }
    setStatus(navigator.onLine ? "invalid" : "offline");
  }

  if (status === "checking") {
    return <main className="loading"><p>Проверяем код доступа…</p></main>;
  }

  return <main className="loading">
    <section aria-labelledby="test-access-title" style={{ maxWidth: 420, padding: 24, textAlign: "left" }}>
      <p style={{ margin: "0 0 8px", opacity: 0.7 }}>LIVE CASH OS · TEST</p>
      <h1 id="test-access-title">Вход для тестирования</h1>
      <p>Введите выданный вам код. До подтверждения доступ к обучению и локальному прогрессу закрыт.</p>
      <form onSubmit={submit}>
        <label htmlFor="test-invite-code">Код доступа</label>
        <input
          id="test-invite-code"
          value={code}
          onChange={(event) => setCode(event.target.value.toUpperCase())}
          placeholder="LCO-TEST-…"
          autoCapitalize="characters"
          autoCorrect="off"
          autoComplete="off"
          required
          style={{ display: "block", width: "100%", margin: "8px 0 12px" }}
        />
        <button type="submit">Продолжить</button>
      </form>
      {status === "invalid" && <p role="alert">Код не найден или отключён. Проверьте его и попробуйте ещё раз.</p>}
      {status === "offline" && <p role="alert">Нужен интернет, чтобы проверить код доступа.</p>}
    </section>
  </main>;
}
