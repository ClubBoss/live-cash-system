"use client";

import type { ActiveSession } from "./model";
import { PORTABLE_PROFILE_KEY } from "./use-learner-state-sync";

export const SESSION_ORIGIN_KEY = "live-cash-os:ui-session-origin:v1";
export const REAL_HAND_DRAFT_KEY = "live-cash-os:real-hand-draft:v1";

const UI_STORAGE_VERSION = 1;
const SESSION_ORIGIN_TTL_MS = 30 * 24 * 60 * 60 * 1_000;
const FUTURE_SKEW_MS = 5 * 60 * 1_000;

export type SessionOrigin = "today" | "review";

type StoredEnvelope = {
  version: number;
  profileMarker: string;
  updatedAt: number;
  value: unknown;
};

type StoredSessionOriginValue = {
  origin: SessionOrigin;
  sessionStartedAt: string;
  mode: string;
};

function safeGet(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}

function safeSet(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function clearUiStorage(key: string) {
  try { localStorage.removeItem(key); } catch { /* best-effort UI metadata cleanup */ }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hashProfileCode(value: string): string {
  let left = 2166136261;
  let right = 3339675911;
  for (const character of value) {
    const code = character.charCodeAt(0);
    left = Math.imul(left ^ code, 16777619);
    right = Math.imul(right ^ code, 2246822519);
  }
  return `p-${(left >>> 0).toString(16).padStart(8, "0")}${(right >>> 0).toString(16).padStart(8, "0")}`;
}

export function currentUiProfileMarker(): string {
  const code = safeGet(PORTABLE_PROFILE_KEY);
  return code ? hashProfileCode(code) : "local";
}

export function writeProfileScopedUiValue(key: string, value: unknown): boolean {
  const envelope: StoredEnvelope = {
    version: UI_STORAGE_VERSION,
    profileMarker: currentUiProfileMarker(),
    updatedAt: Date.now(),
    value,
  };
  return safeSet(key, JSON.stringify(envelope));
}

export function readProfileScopedUiValue<T>(
  key: string,
  ttlMs: number,
  parseValue: (value: unknown) => T | null,
): T | null {
  const raw = safeGet(key);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!isRecord(parsed)
      || parsed.version !== UI_STORAGE_VERSION
      || typeof parsed.profileMarker !== "string"
      || typeof parsed.updatedAt !== "number"
      || !Number.isFinite(parsed.updatedAt)
      || parsed.updatedAt > Date.now() + FUTURE_SKEW_MS
      || Date.now() - parsed.updatedAt > ttlMs
      || parsed.profileMarker !== currentUiProfileMarker()) {
      clearUiStorage(key);
      return null;
    }
    const value = parseValue(parsed.value);
    if (value === null) clearUiStorage(key);
    return value;
  } catch {
    clearUiStorage(key);
    return null;
  }
}

function parseSessionOriginValue(value: unknown): StoredSessionOriginValue | null {
  if (!isRecord(value)
    || (value.origin !== "today" && value.origin !== "review")
    || typeof value.sessionStartedAt !== "string"
    || !value.sessionStartedAt
    || typeof value.mode !== "string"
    || !value.mode) return null;
  return {
    origin: value.origin,
    sessionStartedAt: value.sessionStartedAt,
    mode: value.mode,
  };
}

export function persistSessionOrigin(origin: SessionOrigin, session: ActiveSession): boolean {
  return writeProfileScopedUiValue(SESSION_ORIGIN_KEY, {
    origin,
    sessionStartedAt: session.startedAt,
    mode: session.mode,
  } satisfies StoredSessionOriginValue);
}

export function restoreSessionOrigin(session: ActiveSession | null): SessionOrigin | null {
  if (!session) {
    clearUiStorage(SESSION_ORIGIN_KEY);
    return null;
  }
  const stored = readProfileScopedUiValue(SESSION_ORIGIN_KEY, SESSION_ORIGIN_TTL_MS, parseSessionOriginValue);
  if (!stored) return null;
  if (stored.sessionStartedAt !== session.startedAt || stored.mode !== session.mode) {
    clearUiStorage(SESSION_ORIGIN_KEY);
    return null;
  }
  return stored.origin;
}

export function clearSessionOrigin() {
  clearUiStorage(SESSION_ORIGIN_KEY);
}
