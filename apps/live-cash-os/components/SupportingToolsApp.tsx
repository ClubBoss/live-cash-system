"use client";

import { useEffect, useState } from "react";
import { fieldFactLabels, fieldStatusLabel } from "../content/i18n/learner-ui";
import { applyLocaleData } from "../content/i18n/locale-pipeline";
import { runtimeCopy } from "../content/i18n/runtime";
import { APP_VERSION, type LocaleCode } from "../lib/model";
import { resolveToolsRuntime, supportTabFromSearch, type SupportTab } from "../lib/support-tools-routing";
import { useReliableLearnerState } from "../lib/use-learner-state-sync";
import DataSafetyPanel from "./DataSafetyPanel";
import DiagnosticExperience from "./DiagnosticExperience";
import Gauntlet4LearningIntegrityLayer from "./Gauntlet4LearningIntegrityLayer";
import LegacyToolDeepLink from "./LegacyToolDeepLink";
import LiveCashApp from "./LiveCashApp";
import RealUseLessonAssist from "./RealUseLessonAssist";
import ScrollContinuityGuard from "./ScrollContinuityGuard";
import Wave5PracticeLayer from "./Wave5PracticeLayer";
import { Wave7FieldPanel } from "./Wave7Experience";
import Wave8AccessibilityLayer from "./Wave8AccessibilityLayer";

declare const __LIVE_CASH_LEGACY_TOOLS_MODE__: boolean;

const LOCALE_KEY = "live-cash-os:locale";
const E2E_LEGACY_TOOLS_KEY = "live-cash-os:e2e-legacy-tools";

function LegacyToolsRuntime() {
  return <>
    <LegacyToolDeepLink />
    <LiveCashApp />
    <Wave5PracticeLayer />
    <Wave8AccessibilityLayer />
    <Gauntlet4LearningIntegrityLayer />
    <RealUseLessonAssist />
    <ScrollContinuityGuard />
  </>;
}

function initialSupportTab(): SupportTab {
  if (typeof window === "undefined") return "data";
  return supportTabFromSearch(window.location.search);
}

function requestedRuntime(): "support" | "legacy" {
  return resolveToolsRuntime({
    legacyToolsMode: __LIVE_CASH_LEGACY_TOOLS_MODE__,
    search: window.location.search,
    legacyMarker: localStorage.getItem(E2E_LEGACY_TOOLS_KEY),
    referrer: document.referrer,
    origin: window.location.origin,
  });
}

function SupportingToolsRuntime() {
  const [locale, setLocale] = useState<LocaleCode>("ru");
  const [tab, setTab] = useState<SupportTab>(initialSupportTab);
  const controller = useReliableLearnerState();
  const { state, setState, ready, syncStatus, lastLocalSaveAt } = controller;
  const t = runtimeCopy[locale];

  useEffect(() => {
    const storedLocale = localStorage.getItem(LOCALE_KEY);
    const nextLocale: LocaleCode = storedLocale === "en" ? "en" : "ru";
    applyLocaleData(nextLocale);
    setLocale(nextLocale);
    document.documentElement.lang = nextLocale;
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(LOCALE_KEY, locale);
    document.documentElement.lang = locale;
  }, [locale, ready]);

  useEffect(() => {
    const syncTabFromHistory = () => {
      const nextTab = supportTabFromSearch(window.location.search);
      const requested = new URLSearchParams(window.location.search).get("tab");
      setTab(nextTab);
      if (requested && requested !== "field" && requested !== "diagnostic" && requested !== "data") {
        const url = new URL(window.location.href);
        url.searchParams.set("tab", nextTab);
        window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
      }
    };
    window.addEventListener("popstate", syncTabFromHistory);
    syncTabFromHistory();
    return () => window.removeEventListener("popstate", syncTabFromHistory);
  }, []);

  function navigateSupportTab(nextTab: SupportTab) {
    const url = new URL(window.location.href);
    const currentTab = supportTabFromSearch(url.search);
    if (currentTab === nextTab && tab === nextTab && url.searchParams.get("tab") === nextTab) return;
    url.searchParams.set("tab", nextTab);
    window.history.pushState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
    setTab(nextTab);
  }

  function changeLocale(nextLocale: LocaleCode) {
    applyLocaleData(nextLocale);
    setLocale(nextLocale);
  }

  if (!ready) {
    return <main className="loading"><p>{locale === "ru" ? "Загрузка инструментов..." : "Loading tools..."}</p></main>;
  }

  const copy = locale === "ru" ? {
    title: "Инструменты",
    description: "Дополнительные инструменты для игры, разбора рук и восстановления данных. Основное обучение проходит в Practical Mastery.",
    back: "Вернуться в Practical Mastery",
    nav: "Инструменты",
    field: "Реальные руки",
    diagnostic: "Диагностика",
    data: "Данные и восстановление",
    diagnosticNote: "Диагностика здесь — дополнительная проверка текущего хода решений. Основной учебный путь остаётся в Practical Mastery.",
  } : {
    title: "Tools",
    description: "Supporting tools for play, hand review, and data recovery. Your primary learning path is Practical Mastery.",
    back: "Back to Practical Mastery",
    nav: "Support tools",
    field: "Real Hands",
    diagnostic: "Diagnostic",
    data: "Data & Recovery",
    diagnosticNote: "Diagnostic is an optional check of your current decision process. Your primary learning path remains Practical Mastery.",
  };

  return <main>
    <header className="topbar">
      <a className="brand" href="/mastery/journey">LIVE CASH OS</a>
      <div className="topmeta">
        <span>v{APP_VERSION}</span>
        <span className={`sync sync-${syncStatus}`}>{t.sync[syncStatus]}</span>
        <div className="mode-switch" aria-label={locale === "ru" ? "Язык" : "Language"}>
          <button aria-pressed={locale === "ru"} onClick={() => changeLocale("ru")}>RU</button>
          <button aria-pressed={locale === "en"} onClick={() => changeLocale("en")}>EN</button>
        </div>
      </div>
    </header>

    <section className="supporting-tools-intro" style={{ maxWidth: 860, margin: "0 auto 18px" }}>
      <p className="eyebrow">{locale === "ru" ? "ПОДДЕРЖКА" : "SUPPORT"}</p>
      <h1 style={{ marginBottom: 12 }}>{copy.title}</h1>
      <p className="lede" style={{ marginBottom: 16 }}>{copy.description}</p>
      <a className="secondary" href="/mastery/journey">{copy.back} <span aria-hidden="true">→</span></a>
    </section>

    <nav className="tabs" aria-label={copy.nav}>
      <button aria-current={tab === "field" ? "page" : undefined} onClick={() => navigateSupportTab("field")}>{copy.field}</button>
      <button aria-current={tab === "diagnostic" ? "page" : undefined} onClick={() => navigateSupportTab("diagnostic")}>{copy.diagnostic}</button>
      <button aria-current={tab === "data" ? "page" : undefined} onClick={() => navigateSupportTab("data")}>{copy.data}</button>
    </nav>

    {tab === "field" && <Wave7FieldPanel locale={locale} state={state} setState={setState} lastLocalSaveAt={lastLocalSaveAt} fieldStatusLabel={fieldStatusLabel} fieldFactLabels={fieldFactLabels} />}
    {tab === "diagnostic" && <>
      <p className="support" style={{ maxWidth: 860, margin: "0 auto 18px" }}>{copy.diagnosticNote}</p>
      <DiagnosticExperience
        locale={locale}
        state={state}
        setState={setState}
        onExit={() => navigateSupportTab("data")}
        onRouted={() => window.location.assign("/mastery/journey")}
      />
    </>}
    {tab === "data" && <DataSafetyPanel locale={locale} controller={controller} route="tools:data" />}
  </main>;
}

export default function SupportingToolsApp() {
  const [mode, setMode] = useState<"pending" | "support" | "legacy">("pending");

  useEffect(() => {
    setMode(requestedRuntime());
  }, []);

  if (mode === "pending") return <main className="loading" aria-busy="true" />;
  return mode === "legacy" ? <LegacyToolsRuntime /> : <SupportingToolsRuntime />;
}