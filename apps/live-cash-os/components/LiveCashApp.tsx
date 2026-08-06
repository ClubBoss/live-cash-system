"use client";

import { useEffect, useState } from "react";
import { applyGeometryLocale } from "../content/i18n/geometry-locale";
import { getLearningRoute } from "../content/i18n/learning-route";
import type { LocaleCode } from "../lib/model";
import LiveCashAppCore from "./LiveCashAppCore";

const MODULE_LABELS: Record<string, string> = {
  GEOMETRY: "ЭФФЕКТИВНЫЙ СТЕК",
  PREFLOP: "ПРЕФЛОП",
  BLINDS: "БЛАЙНДЫ",
  FILTERING: "СУЖЕНИЕ ДИАПАЗОНА",
  SHAPE: "РАЗМЕР СТАВКИ",
  AGGRESSION: "АГРЕССИЯ",
  ANCESTRY: "ИСТОРИЯ ДИАПАЗОНА",
  MULTIWAY: "МУЛЬТИВЕЙ",
  RIVER: "РИВЕР",
  EVIDENCE: "НАДЁЖНОСТЬ РИДСА",
  TRANSFER: "ПРИМЕНЕНИЕ В ИГРЕ",
};

const KIND_LABELS: Record<string, string> = {
  core: "ОСНОВНАЯ ЗАДАЧА",
  changed: "НОВЫЕ УСЛОВИЯ",
  boundary: "ВАЖНОЕ ИСКЛЮЧЕНИЕ",
  mixed: "СМЕШАННАЯ ЗАДАЧА",
};

const SESSION_LABELS: Record<string, string> = {
  PRACTICE: "ПРАКТИКА",
  REPAIR: "РАБОТА НАД ОШИБКОЙ",
  REVIEW: "ПОВТОР ПОСЛЕ ПАУЗЫ",
  MIXED: "СМЕШАННАЯ ПРАКТИКА",
};

function setExactText(selector: string, source: string, target: string) {
  document.querySelectorAll<HTMLElement>(selector).forEach((element) => {
    if (element.textContent?.trim() === source && source !== target) element.textContent = target;
  });
}

function parseLocalizedDrillLabel(text: string): { moduleId: string; kind: string } | null {
  const english = text.match(/^([A-Z]+) · (core|changed|boundary|mixed)$/u);
  if (english) return { moduleId: english[1], kind: english[2] };
  for (const [moduleId, label] of Object.entries(MODULE_LABELS)) {
    if (!text.startsWith(`${label} · `)) continue;
    const localizedKind = text.slice(label.length + 3);
    const kind = Object.entries(KIND_LABELS).find(([, value]) => value === localizedKind)?.[0];
    if (kind) return { moduleId, kind };
  }
  return null;
}

function parseSessionLabel(text: string): { mode: string; progress: string } | null {
  const separator = " · ";
  const index = text.indexOf(separator);
  if (index < 0) return null;
  const label = text.slice(0, index);
  const progress = text.slice(index + separator.length);
  if (label in SESSION_LABELS) return { mode: label, progress };
  const mode = Object.entries(SESSION_LABELS).find(([, value]) => value === label)?.[0];
  return mode ? { mode, progress } : null;
}

function localizeHardcodedLabels(locale: LocaleCode) {
  const ru = locale === "ru";
  const exact: Array<[string, string, string]> = [
    [".session .eyebrow", "1 · COLD CHECK", ru ? "1 · РЕШИ БЕЗ ПОДСКАЗКИ" : "1 · COLD CHECK"],
    [".session .eyebrow", "1 · РЕШИ БЕЗ ПОДСКАЗКИ", ru ? "1 · РЕШИ БЕЗ ПОДСКАЗКИ" : "1 · COLD CHECK"],
    [".session .eyebrow", "6 · LAB", ru ? "6 · ТРЕНАЖЁР" : "6 · LAB"],
    [".session .eyebrow", "6 · ТРЕНАЖЁР", ru ? "6 · ТРЕНАЖЁР" : "6 · LAB"],
    [".mode-switch button", "90 sec", ru ? "90 сек" : "90 sec"],
    [".mode-switch button", "90 сек", ru ? "90 сек" : "90 sec"],
    [".mode-switch button", "Due", ru ? "К повторению" : "Due"],
    [".mode-switch button", "К повторению", ru ? "К повторению" : "Due"],
    [".mode-switch button", "All", ru ? "Все" : "All"],
    [".mode-switch button", "Все", ru ? "Все" : "All"],
    [".field-list b", "Cue:", ru ? "Что заметил:" : "Cue:"],
    [".field-list b", "Что заметил:", ru ? "Что заметил:" : "Cue:"],
    [".field-list b", "Action:", ru ? "Как сыграл:" : "Action:"],
    [".field-list b", "Как сыграл:", ru ? "Как сыграл:" : "Action:"],
    [".field-list b", "Reason:", ru ? "Почему:" : "Reason:"],
    [".field-list b", "Почему:", ru ? "Почему:" : "Reason:"],
  ];
  for (const [selector, source, target] of exact) setExactText(selector, source, target);

  document.querySelectorAll<HTMLElement>(".session .eyebrow").forEach((element) => {
    const text = element.textContent?.trim() ?? "";
    const review = text.match(/^DECISION REVIEW · CLASS ([A-Z])$/u) ?? text.match(/^РАЗБОР РЕШЕНИЯ · ([A-Z])$/u);
    if (review) {
      const target = ru ? `РАЗБОР РЕШЕНИЯ · ${review[1]}` : `DECISION REVIEW · CLASS ${review[1]}`;
      if (text !== target) element.textContent = target;
      return;
    }
    const parsed = parseLocalizedDrillLabel(text);
    if (!parsed) return;
    const target = ru
      ? `${MODULE_LABELS[parsed.moduleId] ?? parsed.moduleId} · ${KIND_LABELS[parsed.kind] ?? parsed.kind}`
      : `${parsed.moduleId} · ${parsed.kind}`;
    if (text !== target) element.textContent = target;
  });

  document.querySelectorAll<HTMLElement>(".session-head > div > span").forEach((element) => {
    const text = element.textContent?.trim() ?? "";
    const parsed = parseSessionLabel(text);
    if (!parsed) return;
    const target = `${ru ? SESSION_LABELS[parsed.mode] : parsed.mode} · ${parsed.progress}`;
    if (text !== target) element.textContent = target;
  });

  const badges: Record<string, [string, string]> = {
    repair: ["исправление ошибки", "repair"],
    retention: ["повторение после паузы", "retention"],
    PENDING_REVIEW: ["ждёт разбора", "PENDING_REVIEW"],
    REVIEWED_VALID: ["подтверждено", "REVIEWED_VALID"],
    REVIEWED_REPAIR: ["нужна тренировка", "REVIEWED_REPAIR"],
    INSUFFICIENT: ["данных недостаточно", "INSUFFICIENT"],
  };
  document.querySelectorAll<HTMLElement>(".kind").forEach((element) => {
    const text = element.textContent?.trim() ?? "";
    const entry = Object.entries(badges).find(([key, values]) => key === text || values.includes(text));
    if (!entry) return;
    const target = ru ? entry[1][0] : entry[1][1];
    if (text !== target) element.textContent = target;
  });
}

function currentRuntimeView(): { locale: LocaleCode; showRoute: boolean } {
  const locale: LocaleCode = document.documentElement.lang === "en" ? "en" : "ru";
  const activeTab = document.querySelector<HTMLButtonElement>(".tabs button[aria-current='page']")?.textContent?.trim();
  const sessionLabel = document.querySelector<HTMLElement>(".session-head span")?.textContent ?? "";
  const decisionLabel = document.querySelector<HTMLElement>(".decision-card .eyebrow")?.textContent ?? "";
  const cardLabel = document.querySelector<HTMLElement>(".session .module-code")?.textContent ?? "";
  const geometryApproved = sessionLabel.includes("LCM-01") || decisionLabel.includes("GEOMETRY") || decisionLabel.includes("ЭФФЕКТИВНЫЙ СТЕК") || cardLabel.includes("LCM-01");
  document.documentElement.dataset.editorialGeometry = geometryApproved ? "approved" : "";
  return { locale, showRoute: activeTab === "Сегодня" || activeTab === "Today" };
}

function LearningRoute({ locale }: { locale: LocaleCode }) {
  const route = getLearningRoute(locale);
  const title = locale === "ru" ? "Что означает путь 0→100%" : "What the 0→100% route means";
  const boundary = locale === "ru"
    ? "Это не общий процент мастерства. Каждый этап подтверждается отдельной практикой."
    : "This is an evidence map, not a decorative overall percentage. Every stage requires a distinct learner-state event.";
  return <section className="surface learning-route" aria-labelledby="learning-route-title">
    <div className="section-head">
      <p className="eyebrow">{locale === "ru" ? "МАРШРУТ НАВЫКА" : "SKILL ROUTE"}</p>
      <h2 id="learning-route-title">{title}</h2>
      <p>{boundary}</p>
    </div>
    <div className="route-grid">
      {route.map((stage) => <article key={stage.percent}>
        <span>{stage.percent}%</span>
        <h3>{stage.title}</h3>
        <p>{stage.description}</p>
        <small>{stage.evidenceGate}</small>
      </article>)}
    </div>
  </section>;
}

export default function LiveCashApp() {
  const [view, setView] = useState<{ locale: LocaleCode; showRoute: boolean }>({ locale: "ru", showRoute: false });

  useEffect(() => {
    const sync = () => {
      const next = currentRuntimeView();
      applyGeometryLocale(next.locale);
      localizeHardcodedLabels(next.locale);
      setView((previous) => previous.locale === next.locale && previous.showRoute === next.showRoute ? previous : next);
    };
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["lang", "aria-current"],
      childList: true,
      subtree: true,
    });
    return () => observer.disconnect();
  }, []);

  return <>
    <LiveCashAppCore />
    {view.showRoute && <LearningRoute locale={view.locale} />}
  </>;
}
