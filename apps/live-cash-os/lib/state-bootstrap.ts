"use client";

export const STATE_BOOTSTRAP_KEY = "live-cash-os:state-bootstrap";

type StateBootstrapEnvelope = {
  profileCode: string;
  payload: unknown;
};

export function rememberStateBootstrap(profileCode: string, payload: unknown): void {
  try {
    sessionStorage.setItem(STATE_BOOTSTRAP_KEY, JSON.stringify({ profileCode, payload } satisfies StateBootstrapEnvelope));
  } catch {
    // Bootstrap reuse is an optimization only; normal state loading remains safe.
  }
}

export function consumeStateBootstrap(profileCode: string | null): unknown | null {
  if (!profileCode) return null;
  try {
    const raw = sessionStorage.getItem(STATE_BOOTSTRAP_KEY);
    sessionStorage.removeItem(STATE_BOOTSTRAP_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StateBootstrapEnvelope>;
    return parsed.profileCode === profileCode ? parsed.payload ?? null : null;
  } catch {
    try { sessionStorage.removeItem(STATE_BOOTSTRAP_KEY); } catch { /* best effort */ }
    return null;
  }
}