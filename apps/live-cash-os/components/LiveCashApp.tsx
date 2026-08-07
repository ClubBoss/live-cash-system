"use client";

import { useEffect, useState } from "react";
import { applyGeometryLocale } from "../content/i18n/geometry-locale";
import { getLearningRoute } from "../content/i18n/learning-route";
import { applyWave3PriorityLocale } from "../content/i18n/wave3-priority-gold";
import { applyWave4CurriculumLocale } from "../content/i18n/wave4-curriculum-gold";
import { applyWave4FinalEditorialLocale } from "../content/i18n/wave4-final-editorial";
import { applyWave5PracticeCopy } from "../content/i18n/wave5-practice-copy";
import type { LocaleCode } from "../lib/model";
import LiveCashAppCore from "./LiveCashAppCore";

const MODULE_LABELS: Record<string, string> = {
  GEOMETRY: "ЭФФЕКТИВНЫЙ СТЕК",
  PREFLOP: "ПРЕФЛОП",
  BLINDS: "БЛАЙНДЫ",
  FILTERING: "СУЖЕНИЕ ДИАПАЗОНА",
  SHAPE: "РАЗМЕР СТАВКИ",
  AGGRESSION: "3-БЕТ-БАНКИ",
  ANCESTRY: "ИСТОРИЯ ДИАПАЗОНА",
  MULTIWAY: "МУЛЬТИВЕЙ",
  RIVER: "РИВЕР",
  EVIDENCE: "НАДЁЖНОСТЬ РИДА",
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

const CARD_KIND_LABELS: Record<string, string> = {
  heuristic: "ОРИЕНТИР",
  boundary: "ГРАНИЦА ПРАВИЛА",
  procedure: "ПОРЯДОК РЕШЕНИЯ",
};

const STATUS_LABELS: Record<string, string> = {
  repair: "исправление ошибки",
  retention: "повторение после паузы",
  PENDING_REVIEW: "ждёт разбора",
  REVIEWED_VALID: "разобрано: решение подтверждено",
  REVIEWED_REPAIR: "разобрано: нужна тренировка",
  INSUFFICIENT: "данных недостаточно",
};

const DIAGNOSTIC_STATUS_LABELS: Record<string, string> = {
  AWAITING_REVIEW: "ЖДЁТ РАЗБОРА",
  SCORED: "РАЗОБРАНО",
  ROUTED: "ПРИОРИТЕТЫ ВЫБРАНЫ",
};

const MODULE_LCM: Record<string, string> = {
  geometry: "LCM-01",
  preflop: "LCM-02",
  blinds: "LCM-03",
  filtering: "LCM-04",
  shape: "LCM-05",
  aggression: "LCM-06",
  ancestry: "LCM-07",
  multiway: "LCM-08",
  river: "LCM-09",
  evidence: "LCM-10",
  transfer: "LCM-11",
};

const GOLD_LCMS = new Set(Array.from({ length: 11 }, (_, index) => `LCM-${String(index + 1).padStart(2, "0")}`));

function localizedLeafText(locale: LocaleCode, text: string): string | null {
  const ru = locale === "ru";
  const exact: Record<string, [string, string]> = {
    "1 · COLD CHECK": ["1 · РЕШИ БЕЗ ПОДСКАЗКИ", "1 · COLD CHECK"],
    "1 · РЕШИ БЕЗ ПОДСКАЗКИ": ["1 · РЕШИ БЕЗ ПОДСКАЗКИ", "1 · COLD CHECK"],
    "6 · LAB": ["6 · ТРЕНАЖЁР", "6 · LAB"],
    "6 · ТРЕНАЖЁР": ["6 · ТРЕНАЖЁР", "6 · LAB"],
    "90 sec": ["90 сек", "90 sec"],
    "90 сек": ["90 сек", "90 sec"],
    Due: ["К повторению", "Due"],
    "К повторению": ["К повторению", "Due"],
    All: ["Все", "All"],
    "Все": ["Все", "All"],
    "Cue:": ["Что заметил:", "Cue:"],
    "Что заметил:": ["Что заметил:", "Cue:"],
    "Action:": ["Как сыграл:", "Action:"],
    "Как сыграл:": ["Как сыграл:", "Action:"],
    "Reason:": ["Почему:", "Reason:"],
    "Почему:": ["Почему:", "Reason:"],
  };
  if (text in exact) return exact[text][ru ? 0 : 1];

  const review = text.match(/^DECISION REVIEW · CLASS ([A-Z])$/u) ?? text.match(/^РАЗБОР РЕШЕНИЯ · ([A-Z])$/u);
  if (review) return ru ? `РАЗБОР РЕШЕНИЯ · ${review[1]}` : `DECISION REVIEW · CLASS ${review[1]}`;

  const drill = text.match(/^([A-Z]+) · (core|changed|boundary|mixed)$/u);
  if (drill) return ru ? `${MODULE_LABELS[drill[1]] ?? drill[1]} · ${KIND_LABELS[drill[2]] ?? drill[2]}` : text;
  for (const [moduleId, moduleLabel] of Object.entries(MODULE_LABELS)) {
    if (!text.startsWith(`${moduleLabel} · `)) continue;
    const localizedKind = text.slice(moduleLabel.length + 3);
    const kind = Object.entries(KIND_LABELS).find(([, label]) => label === localizedKind)?.[0];
    if (kind) return ru ? text : `${moduleId} · ${kind}`;
  }

  const session = text.match(/^(PRACTICE|REPAIR|REVIEW|MIXED) · (.+)$/u);
  if (session) return ru ? `${SESSION_LABELS[session[1]]} · ${session[2]}` : text;
  for (const [mode, label] of Object.entries(SESSION_LABELS)) {
    if (text.startsWith(`${label} · `)) return ru ? text : `${mode} · ${text.slice(label.length + 3)}`;
  }

  const recall = text.match(/^(?:ACTIVE RECALL|АКТИВНОЕ ВСПОМИНАНИЕ) · (.+)$/u);
  if (recall) return ru ? `АКТИВНОЕ ВСПОМИНАНИЕ · ${recall[1]}` : `ACTIVE RECALL · ${recall[1]}`;

  const card = text.match(/^(LCM-\d{2}) · (heuristic|boundary|procedure)$/u);
  if (card) return ru ? `${card[1]} · ${CARD_KIND_LABELS[card[2]]}` : text;
  const localizedCard = text.match(/^(LCM-\d{2}) · (ОРИЕНТИР|ГРАНИЦА ПРАВИЛА|ПОРЯДОК РЕШЕНИЯ)$/u);
  if (localizedCard) {
    const kind = Object.entries(CARD_KIND_LABELS).find(([, label]) => label === localizedCard[2])?.[0];
    return ru || !kind ? text : `${localizedCard[1]} · ${kind}`;
  }

  if (text in STATUS_LABELS) return ru ? STATUS_LABELS[text] : text;
  const status = Object.entries(STATUS_LABELS).find(([, label]) => label === text)?.[0];
  if (status) return ru ? text : status;

  const diagnostic = text.match(/^T1 · (AWAITING_REVIEW|SCORED|ROUTED)$/u);
  if (diagnostic) return ru ? `T1 · ${DIAGNOSTIC_STATUS_LABELS[diagnostic[1]]}` : `T1 · ${diagnostic[1].toLowerCase().replaceAll("_", " ")}`;
  for (const [statusKey, label] of Object.entries(DIAGNOSTIC_STATUS_LABELS)) {
    if (text === `T1 · ${label}`) return ru ? text : `T1 · ${statusKey.toLowerCase().replaceAll("_", " ")}`;
  }

  if (text === "English UI and T1 are active. Module bodies remain source-locked until poker-aware editorial approval.") {
    return ru ? "Английская версия включена. Текущая сессия и прогресс сохранены." : "English interface enabled. Your current session and progress are preserved.";
  }
  if (text === "Русская версия включена. Текущая сессия и прогресс сохранены.") {
    return ru ? text : "English interface enabled. Your current session and progress are preserved.";
  }

  return null;
}

function annotateLegacyUi(locale: LocaleCode) {
  const selector = [
    ".session .eyebrow",
    ".session-head > div > span",
    ".mode-switch button",
    ".field-list b",
    ".kind",
    ".session .module-code",
    ".notice span",
  ].join(",");
  document.querySelectorAll<HTMLElement>(selector).forEach((element) => {
    const text = element.textContent?.trim() ?? "";
    const target = localizedLeafText(locale, text);
    if (target && target !== text) {
      element.dataset.wave4rLabel = target;
      element.setAttribute("aria-label", target);
    } else {
      delete element.dataset.wave4rLabel;
      element.removeAttribute("aria-label");
    }
  });

  document.querySelectorAll<HTMLElement>(".assumption-strip").forEach((element) => {
    if (element.textContent?.trim() === ":") {
      element.dataset.wave4rEmptyFallback = "true";
      element.hidden = true;
    } else if (element.dataset.wave4rEmptyFallback === "true") {
      delete element.dataset.wave4rEmptyFallback;
      element.hidden = false;
    }
  });
}

function codeFromText(text: string): string | null {
  return text.match(/LCM-\d{2}/u)?.[0] ?? null;
}

function activeSessionCode(): string | null {
  try {
    const raw = localStorage.getItem("live-cash-os:learner-state");
    if (!raw) return null;
    const moduleId = JSON.parse(raw)?.activeSession?.moduleId;
    return typeof moduleId === "string" ? MODULE_LCM[moduleId] ?? null : null;
  } catch {
    return null;
  }
}

function setGoldMarker(element: HTMLElement, code: string | null) {
  if (!code) return;
  if (GOLD_LCMS.has(code)) element.dataset.editorialGold = "approved";
  else delete element.dataset.editorialGold;
}

function markEditorialGoldSurfaces() {
  document.querySelectorAll<HTMLElement>(".module-list article").forEach((article) => {
    setGoldMarker(article, codeFromText(article.querySelector<HTMLElement>(".module-code")?.textContent ?? ""));
  });

  document.querySelectorAll<HTMLElement>(".session").forEach((session) => {
    const visibleCode = codeFromText(session.querySelector<HTMLElement>(".session-head span, .module-code")?.textContent ?? "");
    setGoldMarker(session, visibleCode ?? activeSessionCode());
  });
}

function currentRuntimeView(): { locale: LocaleCode; showRoute: boolean } {
  const locale: LocaleCode = document.documentElement.lang === "en" ? "en" : "ru";
  const activeTab = document.querySelector<HTMLButtonElement>(".tabs button[aria-current='page']")?.textContent?.trim();
  return { locale, showRoute: activeTab === "Сегодня" || activeTab === "Today" };
}

function applyLocaleData(locale: LocaleCode) {
  applyGeometryLocale(locale);
  applyWave3PriorityLocale(locale);
  applyWave4CurriculumLocale(locale);
  applyWave4FinalEditorialLocale(locale);
  applyWave5PracticeCopy(locale);
}

function LearningRoute({ locale }: { locale: LocaleCode }) {
  const route = getLearningRoute(locale);
  const title = locale === "ru" ? "Что означает путь 0→100%" : "What the 0→100% route means";
  const boundary = locale === "ru"
    ? "Это не общий процент мастерства. Каждый этап подтверждается отдельной практикой."
    : "This is not one overall mastery score. Each step is confirmed by a different kind of practice.";
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
    let syncScheduled = false;
    let structureScheduled = false;

    const syncLocaleAndRoute = () => {
      if (syncScheduled) return;
      syncScheduled = true;
      requestAnimationFrame(() => {
        syncScheduled = false;
        const next = currentRuntimeView();
        applyLocaleData(next.locale);
        annotateLegacyUi(next.locale);
        markEditorialGoldSurfaces();
        setView((previous) => previous.locale === next.locale && previous.showRoute === next.showRoute ? previous : next);
      });
    };

    const syncStructure = () => {
      if (structureScheduled) return;
      structureScheduled = true;
      requestAnimationFrame(() => {
        structureScheduled = false;
        const next = currentRuntimeView();
        annotateLegacyUi(next.locale);
        markEditorialGoldSurfaces();
      });
    };

    syncLocaleAndRoute();
    syncStructure();

    const attributeObserver = new MutationObserver(syncLocaleAndRoute);
    attributeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["lang", "aria-current"],
      subtree: true,
    });

    const structureObserver = new MutationObserver(syncStructure);
    structureObserver.observe(document.documentElement, {
      childList: true,
      characterData: true,
      subtree: true,
    });

    return () => {
      attributeObserver.disconnect();
      structureObserver.disconnect();
    };
  }, []);

  return <>
    <style>{`
      [data-wave4r-label] { font-size: 0 !important; }
      [data-wave4r-label]::after { content: attr(data-wave4r-label); font-size: .75rem; }
      .notice [data-wave4r-label]::after,
      .field-list b[data-wave4r-label]::after { font-size: inherit; }
      .module-list article[data-editorial-gold="approved"] > .assumption-strip,
      .session[data-editorial-gold="approved"] > .assumption-strip { display: none; }
    `}</style>
    <LiveCashAppCore />
    {view.showRoute && <LearningRoute locale={view.locale} />}
  </>;
}
