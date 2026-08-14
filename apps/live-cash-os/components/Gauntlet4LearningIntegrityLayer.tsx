"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import { drillById, moduleById } from "../content/modules";
import type { Drill } from "../content/types";
import type { LocaleCode, ModuleId } from "../lib/model";
import { activeProfileStorageKey, LEARNER_STORAGE_KEY } from "../lib/profile-storage";

const MAX_ORDERING_ATTEMPTS = 3;

type FeedbackSnapshot = {
  drillId: string;
  actionOk: boolean;
  reasonOk: boolean;
  selectedActionOptionId: string;
  selectedReasonOptionId: string;
  confidence: number;
};

type IntegritySnapshot = {
  locale: LocaleCode;
  moduleId: ModuleId | null;
  mode: string | null;
  step: number | null;
  startedAt: string;
  revision: number;
  feedback: FeedbackSnapshot | null;
};

const EMPTY_SNAPSHOT: IntegritySnapshot = { locale: "ru", moduleId: null, mode: null, step: null, startedAt: "", revision: -1, feedback: null };

function feedbackKey(feedback: FeedbackSnapshot | null): string {
  return feedback ? [feedback.drillId, feedback.actionOk, feedback.reasonOk, feedback.selectedActionOptionId, feedback.selectedReasonOptionId, feedback.confidence].join(":") : "";
}

function sameSnapshot(left: IntegritySnapshot, right: IntegritySnapshot): boolean {
  return left.locale === right.locale && left.moduleId === right.moduleId && left.mode === right.mode && left.step === right.step && left.startedAt === right.startedAt && left.revision === right.revision && feedbackKey(left.feedback) === feedbackKey(right.feedback);
}

function readSnapshot(): IntegritySnapshot {
  const locale: LocaleCode = document.documentElement.lang === "en" ? "en" : "ru";
  try {
    const raw = localStorage.getItem(activeProfileStorageKey(LEARNER_STORAGE_KEY));
    if (!raw) return { ...EMPTY_SNAPSHOT, locale };
    const state = JSON.parse(raw) as {
      revision?: number;
      activeSession?: { moduleId?: string; mode?: string; step?: number; startedAt?: string; itemStartedAt?: string } | null;
      interactions?: Array<{ at?: string; drillId?: string; actionOk?: boolean; reasonOk?: boolean; selectedActionOptionId?: string; selectedReasonOptionId?: string; confidence?: number }>;
    };
    const session = state.activeSession;
    const moduleId = typeof session?.moduleId === "string" && session.moduleId in moduleById ? session.moduleId as ModuleId : null;
    const itemStartedAt = Date.parse(session?.itemStartedAt ?? "");
    const interaction = [...(state.interactions ?? [])].reverse().find((item) => {
      const at = Date.parse(item.at ?? "");
      return Number.isFinite(itemStartedAt) && Number.isFinite(at) && at >= itemStartedAt;
    });
    const feedback = interaction && typeof interaction.drillId === "string" && typeof interaction.actionOk === "boolean" && typeof interaction.reasonOk === "boolean" && typeof interaction.selectedActionOptionId === "string" && typeof interaction.selectedReasonOptionId === "string"
      ? { drillId: interaction.drillId, actionOk: interaction.actionOk, reasonOk: interaction.reasonOk, selectedActionOptionId: interaction.selectedActionOptionId, selectedReasonOptionId: interaction.selectedReasonOptionId, confidence: typeof interaction.confidence === "number" ? interaction.confidence : 65 }
      : null;
    return { locale, moduleId, mode: typeof session?.mode === "string" ? session.mode : null, step: typeof session?.step === "number" ? session.step : null, startedAt: typeof session?.startedAt === "string" ? session.startedAt : "", revision: typeof state.revision === "number" ? state.revision : 0, feedback };
  } catch {
    return { ...EMPTY_SNAPSHOT, locale };
  }
}

function quietBackgroundSaveCopy(locale: LocaleCode) {
  const node = document.querySelector<HTMLElement>("[data-testid='session-save'][data-save-state='saved_syncing']");
  if (!node) return;
  const short = locale === "ru" ? "Сохранено" : "Saved";
  const detail = locale === "ru" ? "Сохранено на устройстве; облако обновляется в фоне." : "Saved on this device; cloud sync continues in the background.";
  if (node.textContent !== short) node.textContent = short;
  if (node.title !== detail) node.title = detail;
}

function useIntegritySnapshot(): IntegritySnapshot {
  const [snapshot, setSnapshot] = useState<IntegritySnapshot>(EMPTY_SNAPSHOT);
  useEffect(() => {
    let frame = 0;
    const sync = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const next = readSnapshot();
        quietBackgroundSaveCopy(next.locale);
        setSnapshot((previous) => sameSnapshot(previous, next) ? previous : next);
      });
    };
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    const events: Array<keyof DocumentEventMap> = ["click", "input", "change", "keydown"];
    for (const event of events) document.addEventListener(event, sync, true);
    window.addEventListener("storage", sync);
    window.addEventListener("focus", sync);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      for (const event of events) document.removeEventListener(event, sync, true);
      window.removeEventListener("storage", sync);
      window.removeEventListener("focus", sync);
    };
  }, []);
  return snapshot;
}

function useLiveHost(selector: string, enabled: boolean, identity: string): HTMLElement | null {
  const [host, setHost] = useState<HTMLElement | null>(null);
  useEffect(() => {
    if (!enabled) { setHost(null); return; }
    const sync = () => {
      const next = document.querySelector<HTMLElement>(selector);
      setHost((previous) => previous === next ? previous : next);
    };
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [selector, enabled, identity]);
  return host;
}

function seeded(value: string): number {
  let hash = 2166136261;
  for (const character of value) hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  return hash >>> 0;
}

function deterministicShuffle<T>(items: T[], seedValue: string): T[] {
  const result = [...items];
  let state = seeded(seedValue) || 1;
  for (let index = result.length - 1; index > 0; index -= 1) {
    state = (state * 1664525 + 1013904223) >>> 0;
    const target = state % (index + 1);
    [result[index], result[target]] = [result[target], result[index]];
  }
  if (result.length > 1 && result.every((item, index) => item === items[index])) result.unshift(result.pop() as T);
  return result;
}

function move<T>(items: T[], from: number, to: number): T[] {
  if (to < 0 || to >= items.length) return items;
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

function clickHiddenCorePrimary(host: HTMLElement) {
  requestAnimationFrame(() => host.querySelector<HTMLButtonElement>(":scope > button.primary")?.click());
}

function OrderingExercise({ host, locale, moduleId, startedAt }: { host: HTMLElement; locale: LocaleCode; moduleId: ModuleId; startedAt: string }) {
  const canonical = moduleById[moduleId].decisionTree;
  const [order, setOrder] = useState(() => deterministicShuffle(canonical, `${moduleId}:${startedAt}:g4-order`));
  const [attempts, setAttempts] = useState(0);
  const [status, setStatus] = useState<"idle" | "wrong" | "correct" | "revealed">("idle");
  const copy = locale === "ru"
    ? { eyebrow: "4 · ПОРЯДОК РЕШЕНИЯ", title: "Собери шаги в рабочем порядке", help: "Перемещай шаги вверх и вниз. Затем проверь порядок.", up: "Вверх", down: "Вниз", check: "Проверить", correct: "Верно. Порядок собран.", wrong: "Порядок пока не собран. Переставь шаги и попробуй ещё раз.", revealed: "Показан рабочий порядок. Разбери его и продолжай без тупика.", next: "Сначала решить пример" }
    : { eyebrow: "4 · DECISION ORDER", title: "Put the steps in working order", help: "Move steps up or down, then check the order.", up: "Move up", down: "Move down", check: "Check order", correct: "Correct. The order is complete.", wrong: "The order is not complete yet. Reorder the steps and try again.", revealed: "The working order is now shown. Review it and continue without a dead end.", next: "Solve the example first" };

  function checkOrder() {
    const correct = order.length === canonical.length && order.every((item, index) => item === canonical[index]);
    if (correct) { setStatus("correct"); return; }
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);
    if (nextAttempts >= MAX_ORDERING_ATTEMPTS) { setOrder([...canonical]); setStatus("revealed"); } else setStatus("wrong");
  }
  const canContinue = status === "correct" || status === "revealed";
  return <section className="g4-ordering" data-g4-ordering-state={status}>
    <p className="eyebrow">{copy.eyebrow}</p><h2>{copy.title}</h2><p className="support">{copy.help}</p>
    <ol className="g4-order-list">{order.map((item, index) => <li key={item}><span className="g4-order-text">{item}</span><span className="g4-order-controls"><button type="button" disabled={index === 0 || canContinue} aria-label={`${copy.up}: ${item}`} onClick={() => setOrder((current) => move(current, index, index - 1))}>↑</button><button type="button" disabled={index === order.length - 1 || canContinue} aria-label={`${copy.down}: ${item}`} onClick={() => setOrder((current) => move(current, index, index + 1))}>↓</button></span></li>)}</ol>
    {status === "wrong" && <p className="g4-state-message" role="alert">{copy.wrong}</p>}{status === "correct" && <p className="g4-state-message" role="status">{copy.correct}</p>}{status === "revealed" && <p className="g4-state-message" role="status">{copy.revealed}</p>}
    {!canContinue ? <button className="primary" type="button" onClick={checkOrder}>{copy.check}</button> : <button className="primary" type="button" onClick={() => clickHiddenCorePrimary(host)}>{copy.next} <span>→</span></button>}
  </section>;
}

function OrderingPortal({ snapshot }: { snapshot: IntegritySnapshot }) {
  const enabled = snapshot.mode === "lesson" && snapshot.moduleId === "geometry" && snapshot.step === 3;
  const host = useLiveHost("main .session", enabled, `${snapshot.moduleId}:${snapshot.step}:${snapshot.revision}`);
  useLayoutEffect(() => {
    if (!enabled || !host) return;
    host.classList.add("g4-ordering-active");
    return () => host.classList.remove("g4-ordering-active");
  }, [enabled, host]);
  if (!enabled || !host || !snapshot.moduleId) return null;
  return createPortal(<OrderingExercise key={`${snapshot.locale}:${snapshot.startedAt}`} host={host} locale={snapshot.locale} moduleId={snapshot.moduleId} startedAt={snapshot.startedAt} />, host);
}

function FeedbackCard({ host, locale, feedback, drill }: { host: HTMLElement; locale: LocaleCode; feedback: FeedbackSnapshot; drill: Drill }) {
  const selectedAction = drill.actionOptions.find((item) => item.id === feedback.selectedActionOptionId)?.text ?? "—";
  const selectedReason = drill.reasonOptions.find((item) => item.id === feedback.selectedReasonOptionId)?.text ?? "—";
  const workingAction = drill.actionOptions.find((item) => item.id === drill.correctActionId)?.text ?? "—";
  const workingReason = drill.reasonOptions.find((item) => item.id === drill.correctReasonId)?.text ?? "—";
  const fullyCorrect = feedback.actionOk && feedback.reasonOk;
  const partial = feedback.actionOk !== feedback.reasonOk;
  const state = fullyCorrect ? "correct" : partial ? "partial" : "wrong";
  const copy = locale === "ru"
    ? { correctTitle: "Верно", actionCorrectTitle: "Действие верное", actionCorrectSub: "Причину нужно уточнить", reasonCorrectTitle: "Причина верная", reasonCorrectSub: "Действие нужно исправить", wrongTitle: "Нужно исправить решение", correctPair: "Действие и причина верны", actionMatch: "Действие совпало", reasonMatch: "Причина совпала", yoursReason: "Твоя причина", workingReason: "Рабочая причина", yoursAction: "Твоё действие", workingAction: "Рабочее действие", yours: "Твой выбор", working: "Рабочий выбор", action: "Действие", reason: "Причина", lowConfidence: "Ответ верный, но уверенность была низкой — полезно закрепить механизм, а не только результат.", next: "Продолжить" }
    : { correctTitle: "Correct", actionCorrectTitle: "Action is correct", actionCorrectSub: "The reason needs refinement", reasonCorrectTitle: "Reason is correct", reasonCorrectSub: "The action needs correction", wrongTitle: "This decision needs correction", correctPair: "The action and reason are correct", actionMatch: "The action matches", reasonMatch: "The reason matches", yoursReason: "Your reason", workingReason: "Working reason", yoursAction: "Your action", workingAction: "Working action", yours: "Your choice", working: "Working choice", action: "Action", reason: "Reason", lowConfidence: "The answer is correct, but confidence was low. Reinforce the mechanism, not just the result.", next: "Continue" };
  const title = fullyCorrect ? copy.correctTitle : feedback.actionOk ? copy.actionCorrectTitle : feedback.reasonOk ? copy.reasonCorrectTitle : copy.wrongTitle;
  const subtitle = partial ? (feedback.actionOk ? copy.actionCorrectSub : copy.reasonCorrectSub) : null;
  const showExplanation = !fullyCorrect || feedback.confidence < 50;
  return <div className="g4-feedback-card" data-g4-feedback-state={state} role="status" aria-live="polite">
    <div className="g4-feedback-status"><span aria-hidden="true">{fullyCorrect ? "✓" : partial ? "!" : "×"}</span><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div></div>
    {fullyCorrect && <div className="g4-compare compact"><b>{copy.correctPair}</b><p>{copy.action}: {selectedAction}</p><p>{copy.reason}: {selectedReason}</p></div>}
    {feedback.actionOk && !feedback.reasonOk && <div className="g4-compare"><b>{copy.actionMatch}: {selectedAction}</b><p><strong>{copy.yoursReason}:</strong> {selectedReason}</p><p><strong>{copy.workingReason}:</strong> {workingReason}</p></div>}
    {!feedback.actionOk && feedback.reasonOk && <div className="g4-compare"><b>{copy.reasonMatch}: {selectedReason}</b><p><strong>{copy.yoursAction}:</strong> {selectedAction}</p><p><strong>{copy.workingAction}:</strong> {workingAction}</p></div>}
    {!feedback.actionOk && !feedback.reasonOk && <div className="g4-compare"><b>{copy.yours}</b><p>{copy.action}: {selectedAction}</p><p>{copy.reason}: {selectedReason}</p><b>{copy.working}</b><p>{copy.action}: {workingAction}</p><p>{copy.reason}: {workingReason}</p></div>}
    {showExplanation && <p className="support">{drill.explanation}</p>}{fullyCorrect && feedback.confidence < 50 && <p className="g4-state-message">{copy.lowConfidence}</p>}
    <button className="primary" type="button" onClick={() => host.querySelector<HTMLButtonElement>(":scope > button.primary")?.click()}>{copy.next} <span>→</span></button>
  </div>;
}

function FeedbackPortal({ snapshot }: { snapshot: IntegritySnapshot }) {
  const drill = snapshot.feedback ? drillById[snapshot.feedback.drillId] : null;
  const enabled = Boolean(snapshot.feedback && drill);
  const identity = `${snapshot.moduleId}:${feedbackKey(snapshot.feedback)}:${snapshot.revision}`;
  const host = useLiveHost("main .session .feedback-view", enabled, identity);
  useLayoutEffect(() => {
    if (!enabled || !host || !drill) return;
    host.classList.add("g4-feedback-active");
    return () => host.classList.remove("g4-feedback-active");
  }, [enabled, host, drill]);
  if (!enabled || !host || !snapshot.feedback || !drill) return null;
  return createPortal(<FeedbackCard key={`${snapshot.feedback.drillId}:${feedbackKey(snapshot.feedback)}:${snapshot.locale}`} host={host} locale={snapshot.locale} feedback={snapshot.feedback} drill={drill} />, host);
}

export default function Gauntlet4LearningIntegrityLayer() {
  const snapshot = useIntegritySnapshot();
  return <>
    <style>{`
      .session.g4-ordering-active > :not(.session-head):not(.g4-ordering) { display: none !important; }
      .feedback-view.g4-feedback-active > :not(.g4-feedback-card) { display: none !important; }
      .g4-ordering, .g4-feedback-card { display: block; }
      .g4-order-list { display: grid; gap: .65rem; padding-left: 1.4rem; }
      .g4-order-list li { min-height: 52px; display: grid; grid-template-columns: 1fr auto; gap: .75rem; align-items: center; border: 1px solid currentColor; border-radius: 12px; padding: .65rem .75rem; }
      .g4-order-controls { display: flex; gap: .4rem; }
      .g4-order-controls button { min-width: 44px; min-height: 44px; font: inherit; border-radius: 10px; }
      .g4-state-message { font-weight: 700; padding: .75rem 1rem; border-left: 4px solid currentColor; background: color-mix(in srgb, currentColor 7%, transparent); }
      .g4-feedback-card { border: 2px solid currentColor; border-radius: 16px; padding: 1rem; }
      .g4-feedback-card[data-g4-feedback-state="partial"] { border-style: dashed; }
      .g4-feedback-card[data-g4-feedback-state="wrong"] { border-style: double; border-width: 4px; }
      .g4-feedback-status { display: flex; gap: .75rem; align-items: flex-start; margin-bottom: 1rem; }
      .g4-feedback-status > span { display: grid; place-items: center; min-width: 36px; min-height: 36px; border: 2px solid currentColor; border-radius: 50%; font-weight: 900; }
      .g4-feedback-status h2, .g4-feedback-status p { margin: 0; }
      .g4-feedback-status p { margin-top: .25rem; font-weight: 700; }
      .g4-compare { padding: .85rem 1rem; border-left: 4px solid currentColor; background: color-mix(in srgb, currentColor 6%, transparent); margin-bottom: .9rem; }
      .g4-compare.compact { border-left-style: solid; }
      .g4-compare p { margin: .35rem 0; }
      @media (max-width: 520px) { .g4-order-list { padding-left: 1.15rem; } .g4-order-list li { grid-template-columns: 1fr; } .g4-order-controls { justify-content: flex-end; } }
      @media (prefers-reduced-motion: reduce) { .g4-ordering *, .g4-feedback-card * { scroll-behavior: auto !important; transition: none !important; animation: none !important; } }
    `}</style>
    <OrderingPortal snapshot={snapshot} /><FeedbackPortal snapshot={snapshot} />
  </>;
}
