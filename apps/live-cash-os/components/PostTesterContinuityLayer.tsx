"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { runtimeCopy } from "../content/i18n/runtime";
import type { LocaleCode } from "../lib/model";
import { LEARNER_STORAGE_KEY } from "../lib/use-learner-state-sync";

export const SESSION_ORIGIN_KEY = "live-cash-os:ui-session-origin:v1";
export const REAL_HAND_DRAFT_KEY = "live-cash-os:real-hand-draft:v1";

const SESSION_ORIGIN_VERSION = 1;
const REAL_HAND_DRAFT_VERSION = 1;
const UNBOUND_ORIGIN_TTL_MS = 5_000;
const BOUND_ORIGIN_TTL_MS = 7 * 24 * 60 * 60 * 1_000;
const REAL_HAND_DRAFT_TTL_MS = 30 * 24 * 60 * 60 * 1_000;
const MAX_DRAFT_TEXT = 5_000;

type SessionOrigin = "today" | "review";

type StoredSessionOrigin = {
  version: 1;
  origin: SessionOrigin;
  createdAt: number;
  sessionStartedAt?: string;
  mode?: string;
};

type ActiveSessionIdentity = {
  startedAt: string;
  mode: string;
};

type RealHandDraftValues = {
  moduleId: string;
  stakes: string;
  heroPosition: string;
  villainPositions: string;
  effectiveStacks: string;
  straddle: string;
  actionSequence: string;
  board: string;
  sizings: string;
  cue: string;
  action: string;
  reason: string;
  confidence: number;
  populationRead: string;
  populationReadConfidence: number;
};

type StoredRealHandDraft = {
  version: 1;
  updatedAt: number;
  values: RealHandDraftValues;
};

type DraftField = keyof RealHandDraftValues;

type FormControl = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

const REQUIRED_BINDINGS: ReadonlyArray<{ key: DraftField; tag: "INPUT" | "TEXTAREA" | "SELECT"; type?: string }> = [
  { key: "moduleId", tag: "SELECT" },
  { key: "stakes", tag: "INPUT" },
  { key: "heroPosition", tag: "INPUT" },
  { key: "villainPositions", tag: "INPUT" },
  { key: "effectiveStacks", tag: "INPUT" },
  { key: "straddle", tag: "INPUT" },
  { key: "actionSequence", tag: "TEXTAREA" },
  { key: "board", tag: "INPUT" },
  { key: "sizings", tag: "INPUT" },
  { key: "cue", tag: "TEXTAREA" },
  { key: "action", tag: "TEXTAREA" },
  { key: "reason", tag: "TEXTAREA" },
  { key: "confidence", tag: "INPUT", type: "range" },
  { key: "populationRead", tag: "TEXTAREA" },
];

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

function safeRemove(key: string) {
  try { localStorage.removeItem(key); } catch { /* best effort UI metadata cleanup */ }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function finitePercent(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, Math.min(100, value))
    : fallback;
}

function boundedText(value: unknown): string | null {
  return typeof value === "string" && value.length <= MAX_DRAFT_TEXT ? value : null;
}

function readActiveSession(): ActiveSessionIdentity | null {
  try {
    const raw = safeGet(LEARNER_STORAGE_KEY);
    if (!raw) return null;
    const state = JSON.parse(raw) as unknown;
    if (!isRecord(state) || !isRecord(state.activeSession)) return null;
    const startedAt = state.activeSession.startedAt;
    const mode = state.activeSession.mode;
    if (typeof startedAt !== "string" || !startedAt || typeof mode !== "string" || !mode) return null;
    return { startedAt, mode };
  } catch {
    return null;
  }
}

function parseSessionOrigin(raw: string | null): StoredSessionOrigin | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as unknown;
    if (!isRecord(value)
      || value.version !== SESSION_ORIGIN_VERSION
      || (value.origin !== "today" && value.origin !== "review")
      || typeof value.createdAt !== "number"
      || !Number.isFinite(value.createdAt)) return null;
    if (value.sessionStartedAt !== undefined && (typeof value.sessionStartedAt !== "string" || !value.sessionStartedAt)) return null;
    if (value.mode !== undefined && typeof value.mode !== "string") return null;
    return {
      version: 1,
      origin: value.origin,
      createdAt: value.createdAt,
      sessionStartedAt: value.sessionStartedAt,
      mode: value.mode,
    };
  } catch {
    return null;
  }
}

function readSessionOrigin(): StoredSessionOrigin | null {
  const raw = safeGet(SESSION_ORIGIN_KEY);
  const parsed = parseSessionOrigin(raw);
  if (!parsed && raw !== null) safeRemove(SESSION_ORIGIN_KEY);
  return parsed;
}

function writePendingOrigin(origin: SessionOrigin) {
  const value: StoredSessionOrigin = { version: 1, origin, createdAt: Date.now() };
  safeSet(SESSION_ORIGIN_KEY, JSON.stringify(value));
}

function bindOrigin(origin: StoredSessionOrigin, session: ActiveSessionIdentity) {
  const bound: StoredSessionOrigin = {
    ...origin,
    sessionStartedAt: session.startedAt,
    mode: session.mode,
  };
  safeSet(SESSION_ORIGIN_KEY, JSON.stringify(bound));
}

function parseRealHandDraft(raw: string | null): StoredRealHandDraft | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as unknown;
    if (!isRecord(value)
      || value.version !== REAL_HAND_DRAFT_VERSION
      || typeof value.updatedAt !== "number"
      || !Number.isFinite(value.updatedAt)
      || Date.now() - value.updatedAt > REAL_HAND_DRAFT_TTL_MS
      || !isRecord(value.values)) return null;

    const strings: Array<Exclude<DraftField, "confidence" | "populationReadConfidence">> = [
      "moduleId",
      "stakes",
      "heroPosition",
      "villainPositions",
      "effectiveStacks",
      "straddle",
      "actionSequence",
      "board",
      "sizings",
      "cue",
      "action",
      "reason",
      "populationRead",
    ];
    const parsedStrings = Object.fromEntries(strings.map((key) => [key, boundedText(value.values[key])])) as Record<string, string | null>;
    if (strings.some((key) => parsedStrings[key] === null)) return null;

    return {
      version: 1,
      updatedAt: value.updatedAt,
      values: {
        moduleId: parsedStrings.moduleId!,
        stakes: parsedStrings.stakes!,
        heroPosition: parsedStrings.heroPosition!,
        villainPositions: parsedStrings.villainPositions!,
        effectiveStacks: parsedStrings.effectiveStacks!,
        straddle: parsedStrings.straddle!,
        actionSequence: parsedStrings.actionSequence!,
        board: parsedStrings.board!,
        sizings: parsedStrings.sizings!,
        cue: parsedStrings.cue!,
        action: parsedStrings.action!,
        reason: parsedStrings.reason!,
        confidence: finitePercent(value.values.confidence, 65),
        populationRead: parsedStrings.populationRead!,
        populationReadConfidence: finitePercent(value.values.populationReadConfidence, 50),
      },
    };
  } catch {
    return null;
  }
}

function readRealHandDraft(): StoredRealHandDraft | null {
  const raw = safeGet(REAL_HAND_DRAFT_KEY);
  const parsed = parseRealHandDraft(raw);
  if (!parsed && raw !== null) safeRemove(REAL_HAND_DRAFT_KEY);
  return parsed;
}

function controlsFor(form: HTMLElement): FormControl[] {
  return Array.from(form.querySelectorAll<FormControl>("select, input, textarea"));
}

function bindDraftFields(form: HTMLElement): boolean {
  const controls = controlsFor(form);
  if (controls.length < REQUIRED_BINDINGS.length) return false;
  for (let index = 0; index < REQUIRED_BINDINGS.length; index += 1) {
    const binding = REQUIRED_BINDINGS[index];
    const control = controls[index];
    if (control.tagName !== binding.tag) return false;
    if (binding.type && (!(control instanceof HTMLInputElement) || control.type !== binding.type)) return false;
    control.dataset.waveBDraftField = binding.key;
  }
  const populationConfidence = controls.find((control, index) => index >= REQUIRED_BINDINGS.length
    && control instanceof HTMLInputElement
    && control.type === "range");
  if (populationConfidence) populationConfidence.dataset.waveBDraftField = "populationReadConfidence";
  return true;
}

function fieldControl(form: HTMLElement, key: DraftField): FormControl | null {
  return form.querySelector<FormControl>(`[data-wave-b-draft-field="${key}"]`);
}

function numericControlValue(form: HTMLElement, key: "confidence" | "populationReadConfidence", fallback: number): number {
  const control = fieldControl(form, key);
  const value = control instanceof HTMLInputElement ? Number(control.value) : Number.NaN;
  return Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : fallback;
}

function stringControlValue(form: HTMLElement, key: Exclude<DraftField, "confidence" | "populationReadConfidence">): string {
  return fieldControl(form, key)?.value ?? "";
}

function snapshotDraft(form: HTMLElement): StoredRealHandDraft {
  return {
    version: 1,
    updatedAt: Date.now(),
    values: {
      moduleId: stringControlValue(form, "moduleId"),
      stakes: stringControlValue(form, "stakes"),
      heroPosition: stringControlValue(form, "heroPosition"),
      villainPositions: stringControlValue(form, "villainPositions"),
      effectiveStacks: stringControlValue(form, "effectiveStacks"),
      straddle: stringControlValue(form, "straddle"),
      actionSequence: stringControlValue(form, "actionSequence"),
      board: stringControlValue(form, "board"),
      sizings: stringControlValue(form, "sizings"),
      cue: stringControlValue(form, "cue"),
      action: stringControlValue(form, "action"),
      reason: stringControlValue(form, "reason"),
      confidence: numericControlValue(form, "confidence", 65),
      populationRead: stringControlValue(form, "populationRead"),
      populationReadConfidence: numericControlValue(form, "populationReadConfidence", 50),
    },
  };
}

function hasDraftContent(values: RealHandDraftValues): boolean {
  return values.moduleId !== ""
    || values.stakes.trim() !== ""
    || values.heroPosition.trim() !== ""
    || values.villainPositions.trim() !== ""
    || values.effectiveStacks.trim() !== ""
    || values.straddle.trim() !== ""
    || values.actionSequence.trim() !== ""
    || values.board.trim() !== ""
    || values.sizings.trim() !== ""
    || values.cue.trim() !== ""
    || values.action.trim() !== ""
    || values.reason.trim() !== ""
    || values.populationRead.trim() !== ""
    || values.confidence !== 65
    || values.populationReadConfidence !== 50;
}

function nativeSetValue(control: FormControl, value: string) {
  const prototype = control instanceof HTMLInputElement
    ? HTMLInputElement.prototype
    : control instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : HTMLSelectElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;
  if (!setter) return;
  setter.call(control, value);
  control.dispatchEvent(new Event(control instanceof HTMLSelectElement ? "change" : "input", { bubbles: true }));
}

function restoreDraft(form: HTMLElement, draft: StoredRealHandDraft) {
  if (!bindDraftFields(form)) return;
  const restore = (key: DraftField, value: string | number) => {
    const control = fieldControl(form, key);
    if (!control) return;
    if (key === "moduleId" && control instanceof HTMLSelectElement && !Array.from(control.options).some((option) => option.value === value)) return;
    nativeSetValue(control, String(value));
  };

  restore("moduleId", draft.values.moduleId);
  restore("stakes", draft.values.stakes);
  restore("heroPosition", draft.values.heroPosition);
  restore("villainPositions", draft.values.villainPositions);
  restore("effectiveStacks", draft.values.effectiveStacks);
  restore("straddle", draft.values.straddle);
  restore("actionSequence", draft.values.actionSequence);
  restore("board", draft.values.board);
  restore("sizings", draft.values.sizings);
  restore("cue", draft.values.cue);
  restore("action", draft.values.action);
  restore("reason", draft.values.reason);
  restore("confidence", draft.values.confidence);
  restore("populationRead", draft.values.populationRead);

  requestAnimationFrame(() => requestAnimationFrame(() => {
    bindDraftFields(form);
    restore("populationReadConfidence", draft.values.populationReadConfidence);
  }));
}

function resetDraftForm(form: HTMLElement) {
  if (!bindDraftFields(form)) return;
  const defaults: Record<DraftField, string> = {
    moduleId: "",
    stakes: "",
    heroPosition: "",
    villainPositions: "",
    effectiveStacks: "",
    straddle: "",
    actionSequence: "",
    board: "",
    sizings: "",
    cue: "",
    action: "",
    reason: "",
    confidence: "65",
    populationRead: "",
    populationReadConfidence: "50",
  };
  for (const [key, value] of Object.entries(defaults) as Array<[DraftField, string]>) {
    const control = fieldControl(form, key);
    if (control) nativeSetValue(control, value);
  }
}

function formLooksReset(form: HTMLElement): boolean {
  bindDraftFields(form);
  const values = snapshotDraft(form).values;
  return !hasDraftContent(values);
}

function currentTabIndex(): number {
  const tabs = Array.from(document.querySelectorAll<HTMLButtonElement>(".tabs button"));
  return tabs.findIndex((button) => button.getAttribute("aria-current") === "page");
}

function clickTab(origin: SessionOrigin) {
  const index = origin === "review" ? 2 : 0;
  document.querySelectorAll<HTMLButtonElement>(".tabs button")[index]?.click();
}

function localCopy(locale: LocaleCode) {
  return locale === "ru" ? {
    localOnly: "Черновик хранится только на этом устройстве. Он не считается прогрессом, доказательством навыка или разбором.",
    saved: "Черновик сохранён на устройстве.",
    clear: "Очистить черновик и поля",
    exampleSummary: "Показать пример хорошо записанной руки",
    exampleDisclaimer: "Это пример формата записи, а не оценка правильности линии.",
    example: {
      stakes: "Лимиты: 2/5",
      positions: "Позиции: Hero BTN, Villain BB",
      stack: "Эффективный стек: 150bb",
      straddle: "Страддл: нет",
      sequence: "Действия: CO fold, BTN open $15, BB call. Flop Qh 7d 4c: BB check, BTN bet $10, BB call. Turn 2s: BB check.",
      board: "Борд / префлоп: preflop → Qh 7d 4c → 2s",
      sizings: "Сайзинги: $15 префлоп; $10 в $32 на флопе",
      cue: "Что заметил: BB заколлировал префлоп и флоп; тёрн не изменил позиции; я не был уверен, насколько широко BB продолжает.",
      action: "Действие: чекнул бихайнд тёрн.",
      reason: "Причина до результата: считал диапазон продолжения BB сильнее после колла флопа и не был уверен, что ещё одна ставка достаточно полезна. Здесь записана мысль, а не вердикт о правильности действия.",
    },
  } : {
    localOnly: "This draft stays on this device only. It is not progress, skill evidence, or a review.",
    saved: "Draft saved on this device.",
    clear: "Clear draft and fields",
    exampleSummary: "Show an example of a well-recorded hand",
    exampleDisclaimer: "This is an example of recording format, not an assessment of whether the line is correct.",
    example: {
      stakes: "Stakes: 2/5",
      positions: "Positions: Hero BTN, Villain BB",
      stack: "Effective stack: 150bb",
      straddle: "Straddle: none",
      sequence: "Action sequence: CO folds, BTN opens to $15, BB calls. Flop Qh 7d 4c: BB checks, BTN bets $10, BB calls. Turn 2s: BB checks.",
      board: "Board / preflop: preflop → Qh 7d 4c → 2s",
      sizings: "Sizings: $15 preflop; $10 into $32 on the flop",
      cue: "Cue: BB called preflop and flop; the turn did not change positions; I was unsure how wide BB continued.",
      action: "Action: checked back the turn.",
      reason: "Reason before result: I thought BB's continuing range had become stronger after the flop call and I was unsure whether another bet accomplished enough. This records the thought, not a verdict on whether the action was correct.",
    },
  };
}

function RealHandDraftTools({ locale, draftPresent }: { locale: LocaleCode; draftPresent: boolean }) {
  const c = localCopy(locale);
  const clear = () => window.dispatchEvent(new Event("live-cash-os:clear-real-hand-draft"));
  return <div className="w7-review-inbox" data-testid="real-hand-draft-tools">
    <p className="support" data-testid="real-hand-draft-status">{draftPresent ? c.saved : c.localOnly}</p>
    <button type="button" className="textbutton" onClick={clear}>{c.clear}</button>
    <details data-testid="real-hand-example">
      <summary>{c.exampleSummary}</summary>
      <div className="answer-panel">
        <p><b>{c.exampleDisclaimer}</b></p>
        <p>{c.example.stakes}</p>
        <p>{c.example.positions}</p>
        <p>{c.example.stack}</p>
        <p>{c.example.straddle}</p>
        <p>{c.example.sequence}</p>
        <p>{c.example.board}</p>
        <p>{c.example.sizings}</p>
        <p>{c.example.cue}</p>
        <p>{c.example.action}</p>
        <p>{c.example.reason}</p>
      </div>
    </details>
  </div>;
}

export default function PostTesterContinuityLayer() {
  const [fieldForm, setFieldForm] = useState<HTMLElement | null>(null);
  const [locale, setLocale] = useState<LocaleCode>("ru");
  const [draftPresent, setDraftPresent] = useState(false);

  useEffect(() => {
    let sawMatchingSession = false;
    let suppressDraftSave = false;
    let suppressDraftRestoreUntil = 0;
    let observedForm: HTMLElement | null = null;

    const clearOrigin = () => {
      safeRemove(SESSION_ORIGIN_KEY);
      sawMatchingSession = false;
    };

    const reconcileOrigin = () => {
      const origin = readSessionOrigin();
      if (!origin) return;
      const age = Date.now() - origin.createdAt;
      const session = readActiveSession();

      if (origin.sessionStartedAt) {
        if (age > BOUND_ORIGIN_TTL_MS) {
          clearOrigin();
          return;
        }
        if (session) {
          if (session.startedAt !== origin.sessionStartedAt) {
            clearOrigin();
            return;
          }
          sawMatchingSession = true;
          return;
        }
        if (sawMatchingSession) {
          const destination = origin.origin;
          clearOrigin();
          clickTab(destination);
        } else {
          clearOrigin();
        }
        return;
      }

      if (age > UNBOUND_ORIGIN_TTL_MS) {
        clearOrigin();
        return;
      }
      if (session) {
        bindOrigin(origin, session);
        sawMatchingSession = true;
      }
    };

    const persistDraft = (form: HTMLElement) => {
      if (suppressDraftSave || !bindDraftFields(form)) return;
      const draft = snapshotDraft(form);
      if (!hasDraftContent(draft.values)) {
        safeRemove(REAL_HAND_DRAFT_KEY);
        setDraftPresent(false);
        return;
      }
      if (safeSet(REAL_HAND_DRAFT_KEY, JSON.stringify(draft))) setDraftPresent(true);
    };

    const restoreForm = (form: HTMLElement) => {
      if (Date.now() < suppressDraftRestoreUntil || form === observedForm) return;
      observedForm = form;
      if (!bindDraftFields(form)) return;
      const draft = readRealHandDraft();
      setDraftPresent(Boolean(draft));
      if (!draft) return;
      suppressDraftSave = true;
      restoreDraft(form, draft);
      requestAnimationFrame(() => { suppressDraftSave = false; });
    };

    const syncSurface = () => {
      const nextLocale: LocaleCode = document.documentElement.lang === "en" ? "en" : "ru";
      setLocale((previous) => previous === nextLocale ? previous : nextLocale);
      const nextForm = document.querySelector<HTMLElement>(".field-form");
      setFieldForm((previous) => previous === nextForm ? previous : nextForm);
      if (nextForm) restoreForm(nextForm);
      reconcileOrigin();
    };

    const handleDraftEvent = (event: Event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const form = target.closest<HTMLElement>(".field-form");
      if (!form || !target.dataset.waveBDraftField) return;
      persistDraft(form);
    };

    const handleClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const button = target.closest<HTMLButtonElement>("button");
      if (!button) return;
      const tabIndex = currentTabIndex();

      if (tabIndex === 2 && button.matches(".queue button.primary")) {
        writePendingOrigin("review");
        sawMatchingSession = false;
        requestAnimationFrame(reconcileOrigin);
        return;
      }

      if (tabIndex === 0 && button.matches(".today-card button.primary")) {
        const currentLocale: LocaleCode = document.documentElement.lang === "en" ? "en" : "ru";
        if (button.getAttribute("aria-label") === runtimeCopy[currentLocale].start) {
          writePendingOrigin("today");
          sawMatchingSession = false;
          requestAnimationFrame(reconcileOrigin);
        }
        return;
      }

      if ((tabIndex === 1 || tabIndex === 4) && !readActiveSession()) {
        clearOrigin();
      }

      const form = button.closest<HTMLElement>(".field-form");
      if (form && button.matches("button.primary") && !button.disabled) {
        suppressDraftRestoreUntil = Date.now() + 2_000;
        window.setTimeout(() => {
          if (form.isConnected && formLooksReset(form)) {
            safeRemove(REAL_HAND_DRAFT_KEY);
            setDraftPresent(false);
          }
        }, 120);
      }
    };

    const handleClearDraft = () => {
      const form = document.querySelector<HTMLElement>(".field-form");
      suppressDraftRestoreUntil = Date.now() + 2_000;
      suppressDraftSave = true;
      safeRemove(REAL_HAND_DRAFT_KEY);
      if (form) resetDraftForm(form);
      setDraftPresent(false);
      requestAnimationFrame(() => { suppressDraftSave = false; });
    };

    document.addEventListener("click", handleClick, true);
    document.addEventListener("input", handleDraftEvent, true);
    document.addEventListener("change", handleDraftEvent, true);
    window.addEventListener("storage", syncSurface);
    window.addEventListener("focus", syncSurface);
    window.addEventListener("live-cash-os:clear-real-hand-draft", handleClearDraft);
    const timer = window.setInterval(syncSurface, 200);
    syncSurface();

    return () => {
      document.removeEventListener("click", handleClick, true);
      document.removeEventListener("input", handleDraftEvent, true);
      document.removeEventListener("change", handleDraftEvent, true);
      window.removeEventListener("storage", syncSurface);
      window.removeEventListener("focus", syncSurface);
      window.removeEventListener("live-cash-os:clear-real-hand-draft", handleClearDraft);
      window.clearInterval(timer);
    };
  }, []);

  return fieldForm
    ? createPortal(<RealHandDraftTools locale={locale} draftPresent={draftPresent} />, fieldForm)
    : null;
}
