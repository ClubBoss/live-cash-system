"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { diagnosticT1 } from "../content/diagnostic";
import { diagnosticEnglish, moduleHeadings, runtimeCopy, classMessage } from "../content/i18n/runtime";
import { applyLocaleData } from "../content/i18n/locale-pipeline";
import {
  cardKindLabel,
  cardModeLabel,
  decisionReviewLabel,
  diagnosticStatusLabel,
  drillKindLabel,
  fieldFactLabels,
  fieldStatusLabel,
  labLabels,
  recallLabel,
  responseClassShortLabel,
  reviewKindLabel,
  sessionModeLabel,
} from "../content/i18n/learner-ui";
import { allCards, drillById, moduleById, modules } from "../content/modules";
import type { Drill, ModuleContent, Option } from "../content/types";
import { deriveDiagnosticPriorityModules, parseDiagnosticScore } from "../lib/diagnostic-import";
import { getRuntimeRepairRule } from "../lib/runtime-repair-registry";
import { planDailyTraining, type DailyBudget, type DailyPlan, type PlanItem } from "../lib/scheduler";
import {
  APP_VERSION,
  CONTENT_VERSION,
  DIMENSION_KEYS,
  STATE_SCHEMA_VERSION,
  classifyResponse,
  completeBlock,
  completeLesson,
  dueReviewItems,
  emptyLearnerState,
  evidencePercent,
  gradeCard,
  mergeLearnerStates,
  migrateLearnerState,
  moduleAvailable,
  recordDecision,
  recordDiagnosticResponse,
  saveActiveSession,
  startDiagnosticRun,
  validateLearnerState,
  type ActiveSession,
  type LearnerState,
  type LearningMode,
  type LocaleCode,
  type ModuleId,
  type ResponseClass,
  type TransferProbe,
} from "../lib/model";
import { applyReviewedDiagnostic, pendingHumanReviewCount, saveExplainBack } from "../lib/wave7";
import LearningRoute from "./LearningRoute";
import { Wave7ExplainBackHistory, Wave7FieldPanel, Wave7ProgressDetails } from "./Wave7Experience";

const STORAGE_KEY = "live-cash-os:learner-state";
const LOCALE_KEY = "live-cash-os:locale";
const T1_IDS = diagnosticT1.map((item) => item.id);
const PRIMARY_TABS = ["today", "learn", "review", "cards", "map", "field", "diagnostic"] as const;
const SCHEDULER_CATALOG = {
  modules: modules.map((module) => ({
    id: module.id,
    prerequisites: module.prerequisites,
    drills: module.drills.map((drill) => ({
      id: drill.id,
      moduleId: drill.moduleId,
      nodeKey: drill.nodeKey,
      variantGroup: drill.variantGroup,
      kind: drill.kind,
      targetSeconds: drill.targetSeconds,
    })),
  })),
  cards: allCards.map((card) => ({ id: card.id, moduleId: card.moduleId })),
};

type Tab = (typeof PRIMARY_TABS)[number] | "debug";
type SyncStatus = "loading" | "local" | "syncing" | "synced" | "offline" | "conflict" | "error";

function mutate(state: LearnerState, change: (next: LearnerState) => void): LearnerState {
  const next = structuredClone(state);
  change(next);
  next.revision += 1;
  next.updatedAt = new Date().toISOString();
  next.appVersion = APP_VERSION;
  next.contentVersion = CONTENT_VERSION;
  return next;
}

function patchSession(state: LearnerState, patch: Partial<ActiveSession>): LearnerState {
  const current = state.activeSession;
  if (!current) return state;
  return mutate(state, (next) => { next.activeSession = { ...current, ...patch }; });
}

function startSession(state: LearnerState, mode: LearningMode, moduleId: ModuleId, drillIds: string[], step = 0, sourceReviewId?: string): LearnerState {
  const now = new Date().toISOString();
  return saveActiveSession(state, {
    mode,
    moduleId,
    step,
    drillIds,
    currentIndex: 0,
    selectedActionId: null,
    selectedReasonId: null,
    confidence: 65,
    startedAt: now,
    itemStartedAt: now,
    explainBack: "",
    sourceReviewId,
  });
}

function seeded(value: string): number {
  let hash = 2166136261;
  for (const character of value) hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  return hash >>> 0;
}

function shuffle<T>(items: T[], seedValue: string): T[] {
  const result = [...items];
  let state = seeded(seedValue) || 1;
  for (let index = result.length - 1; index > 0; index -= 1) {
    state = (state * 1664525 + 1013904223) >>> 0;
    const target = state % (index + 1);
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
}

function localizedModule(module: ModuleContent, locale: LocaleCode) {
  if (locale === "ru") return module;
  const heading = moduleHeadings[module.id].en;
  return { ...module, ...heading };
}

function moduleStateLabel(locale: LocaleCode, value: string): string {
  const labels: Record<LocaleCode, Record<string, string>> = {
    ru: {
      UNEXPOSED: "не начато",
      INTRODUCED: "тема пройдена",
      FRAGILE: "нужно закрепить",
      WORKING: "получается",
      RETAINED: "вспоминается после паузы",
      FIELD_TEST_PENDING: "нужны разобранные реальные руки",
      FIELD_VALIDATED: "подтверждено в разобранных руках",
      REPAIR_REQUIRED: "нужно разобрать ошибку",
    },
    en: {
      UNEXPOSED: "not started",
      INTRODUCED: "lesson completed",
      FRAGILE: "needs reinforcement",
      WORKING: "working in practice",
      RETAINED: "recalled after a delay",
      FIELD_TEST_PENDING: "needs reviewed real hands",
      FIELD_VALIDATED: "supported by reviewed real hands",
      REPAIR_REQUIRED: "mistake needs work",
    },
  };
  return labels[locale][value] ?? value;
}

function dimensionLabel(locale: LocaleCode, value: string): string {
  const labels: Record<LocaleCode, Record<string, string>> = {
    ru: {
      node_recognition: "распознавание ситуации",
      mechanism_explanation: "объяснение решения",
      action_selection: "выбор действия",
      boundary_control: "исключения",
      speed: "скорость",
      confidence_calibration: "точность уверенности",
      variant_transfer: "новые условия",
      retention: "воспоминание после паузы",
      field_transfer: "реальная игра",
    },
    en: {
      node_recognition: "spot recognition",
      mechanism_explanation: "decision reasoning",
      action_selection: "action choice",
      boundary_control: "exceptions",
      speed: "speed",
      confidence_calibration: "confidence accuracy",
      variant_transfer: "changed spots",
      retention: "later recall",
      field_transfer: "real play",
    },
  };
  return labels[locale][value] ?? value;
}

function dailyPlanItemCopy(locale: LocaleCode, item: PlanItem): { title: string; reason: string } {
  const copy: Record<LocaleCode, Record<PlanItem["reasonCode"], { title: string; reason: string }>> = {
    ru: {
      resume: { title: "Продолжить сохранённую сессию", reason: "Вернёмся ровно к месту остановки." },
      overdue_retention: { title: "Проверить навык после паузы", reason: "Пришло время вспомнить решение без свежей подсказки." },
      repair: { title: "Исправить конкретную ошибку", reason: "Сначала разберём промах из последнего решения, затем вернём его позже." },
      diagnostic_priority: { title: "Подтянуть приоритетную тему", reason: "Проверка T1 подняла эту тему в очереди, но не засчитала навык за тебя." },
      weak: { title: "Закрепить слабое место", reason: "В последних решениях здесь чаще возникали ошибки." },
      stale: { title: "Освежить давно не проверенный навык", reason: "Эту тему давно не приходилось вспоминать самостоятельно." },
      changed: { title: "Решить изменённую ситуацию", reason: "Проверим тот же механизм при других важных условиях." },
      boundary: { title: "Проверить границу правила", reason: "Короткий контраст помогает не превращать правило в автопилот." },
      mixed: { title: "Смешанная практика", reason: "Темы перемешаны, чтобы решение начиналось с распознавания ситуации." },
      new: { title: "Изучить один новый механизм", reason: "Сегодня добавляем не больше одной новой идеи." },
      warmup: { title: "Быстрая разминка перед игрой", reason: "До трёх знакомых подсказок, без новых тем." },
      done: { title: "На сейчас достаточно", reason: "Срочных повторений нет; можно вернуться позже или выбрать практику вручную." },
    },
    en: {
      resume: { title: "Resume the saved session", reason: "Continue from the exact point where you stopped." },
      overdue_retention: { title: "Test the skill after a delay", reason: "It is time to recall the decision without the fresh explanation." },
      repair: { title: "Fix the exact mistake", reason: "Start with the miss from your last decision, then bring it back later." },
      diagnostic_priority: { title: "Work on a priority topic", reason: "The reviewed T1 check moved this topic up the queue; it did not award learning credit." },
      weak: { title: "Reinforce a weak spot", reason: "Recent decisions show more misses here." },
      stale: { title: "Refresh a stale skill", reason: "You have not recalled this topic independently for a while." },
      changed: { title: "Solve a changed spot", reason: "Use the same mechanism after an important condition changes." },
      boundary: { title: "Test the edge of the rule", reason: "A short contrast helps prevent autopilot." },
      mixed: { title: "Mixed practice", reason: "Topics are mixed so the first job is recognising the spot." },
      new: { title: "Learn one new mechanism", reason: "Add no more than one new idea today." },
      warmup: { title: "Quick pre-session warm-up", reason: "Up to three familiar prompts, with no new topics." },
      done: { title: "Enough for now", reason: "Nothing urgent is due; return later or choose practice manually." },
    },
  };
  return copy[locale][item.reasonCode];
}

function dailyBudgetLabel(locale: LocaleCode, budget: DailyBudget): string {
  const labels: Record<LocaleCode, Record<DailyBudget, string>> = {
    ru: { "5": "5 мин", "15": "15 мин", "30": "30 мин", warmup: "Перед игрой", post: "После игры" },
    en: { "5": "5 min", "15": "15 min", "30": "30 min", warmup: "Before play", post: "After play" },
  };
  return labels[locale][budget];
}

function downloadJson(filename: string, value: unknown) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], { type: "application/json" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function transferProbeFor(drill: Drill): TransferProbe | null {
  if (drill.transferProbe) return drill.transferProbe;
  if (drill.kind === "changed") {
    return { isTransferProbe: true, variantDistance: "NEAR", changedVariables: [drill.variantGroup] };
  }
  if (drill.kind === "boundary") {
    return { isTransferProbe: true, variantDistance: "MEDIUM", changedVariables: ["boundary_condition", drill.variantGroup] };
  }
  return null;
}

function selectRepair(state: LearnerState, moduleId: ModuleId): { drills: Drill[]; sourceReviewId?: string } {
  const module = moduleById[moduleId];
  const target = dueReviewItems(state).find((item) => item.moduleId === moduleId && item.kind === "repair");
  const candidateRules = target
    ? [target.sourceActionOptionId, target.sourceReasonOptionId]
      .filter((optionId): optionId is string => Boolean(optionId))
      .map((optionId) => getRuntimeRepairRule(target.sourceDrillId, optionId))
      .filter((rule): rule is NonNullable<typeof rule> => Boolean(rule))
    : [];
  const eligible = module.drills.filter((drill) => drill.id !== target?.sourceDrillId);
  const preferredNode = candidateRules.flatMap((rule) => rule.preferredNodeKey ? eligible.filter((drill) => drill.nodeKey === rule.preferredNodeKey) : []);
  const preferredFamily = candidateRules.flatMap((rule) => rule.preferredVariantGroup ? eligible.filter((drill) => drill.variantGroup === rule.preferredVariantGroup) : []);
  const preferredKind = candidateRules.flatMap((rule) => rule.preferredKind ? eligible.filter((drill) => drill.kind === rule.preferredKind) : []);
  const family = target ? eligible.filter((drill) => drill.variantGroup === target.variantGroup) : [];
  const boundary = eligible.filter((drill) => drill.kind === "boundary");
  const changed = eligible.filter((drill) => drill.kind === "changed");
  const drills = [...preferredNode, ...preferredFamily, ...preferredKind, ...family, ...boundary, ...changed, ...eligible]
    .filter((drill, index, list) => list.findIndex((candidate) => candidate.id === drill.id) === index)
    .slice(0, 1);
  return { drills: drills.length ? drills : module.drills.slice(0, 1), sourceReviewId: target?.id };
}

function selectReview(state: LearnerState, limit = 3): Drill[] {
  return dueReviewItems(state)
    .filter((item) => item.kind === "retention")
    .slice(0, limit)
    .map((item) => moduleById[item.moduleId].drills.find((drill) => drill.variantGroup === item.variantGroup && drill.id !== item.sourceDrillId)
      ?? moduleById[item.moduleId].drills.find((drill) => drill.kind === "changed")
      ?? moduleById[item.moduleId].drills[0]);
}

function selectMixed(state: LearnerState): Drill[] {
  const eligible = modules.filter((module) => state.modules[module.id].contentCompleted);
  const source = eligible.length ? eligible : [moduleById.geometry];
  return source.slice(-5).map((module, index) => module.drills[(state.revision + index) % module.drills.length]);
}

export default function LiveCashAppV11() {
  const [state, setState] = useState<LearnerState>(emptyLearnerState);
  const [locale, setLocale] = useState<LocaleCode>("ru");
  const [tab, setTab] = useState<Tab>("today");
  const [ready, setReady] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("loading");
  const [notice, setNotice] = useState("");
  const [dailyBudget, setDailyBudget] = useState<DailyBudget>("15");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const syncStatusRef = useRef(syncStatus);
  const t = runtimeCopy[locale];

  useEffect(() => {
    syncStatusRef.current = syncStatus;
  }, [syncStatus]);

  useEffect(() => {
    async function restore() {
      const storedLocale = localStorage.getItem(LOCALE_KEY);
      const nextLocale: LocaleCode = storedLocale === "en" ? "en" : "ru";
      applyLocaleData(nextLocale);
      setLocale(nextLocale);
      document.documentElement.lang = nextLocale;

      let local = emptyLearnerState();
      try { local = migrateLearnerState(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null")); } catch { local = emptyLearnerState(); }
      let remote: LearnerState | null = null;
      try {
        const response = await fetch("/api/state", { cache: "no-store" });
        if (response.ok) {
          const payload = await response.json() as { state?: unknown };
          remote = payload.state ? migrateLearnerState(payload.state) : null;
          setSyncStatus("synced");
        } else setSyncStatus(response.status === 401 ? "local" : "error");
      } catch { setSyncStatus("offline"); }
      const merged = mergeLearnerStates(local, remote);
      setState(merged);
      if (merged.activeSession) setTab("learn");
      setReady(true);
      if ("serviceWorker" in navigator) void navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }
    void restore();
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(LOCALE_KEY, locale);
    document.documentElement.lang = locale;
  }, [locale, ready]);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      if (syncStatusRef.current !== "local") setSyncStatus("syncing");
      try {
        const response = await fetch("/api/state", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ state }) });
        if (response.ok) setSyncStatus("synced");
        else if (response.status === 401) setSyncStatus("local");
        else if (response.status === 409) setSyncStatus("conflict");
        else setSyncStatus("error");
      } catch { setSyncStatus("offline"); }
    }, 700);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [ready, state]);

  const planningNow = Date.now();
  const plan = planDailyTraining(state, SCHEDULER_CATALOG, { budget: dailyBudget, now: planningNow, seed: `${state.revision}:${dailyBudget}` });
  const warmupPlan = planDailyTraining(state, SCHEDULER_CATALOG, { budget: "warmup", now: planningNow, seed: `${state.revision}:warmup` });
  const warmupCardIds = warmupPlan.items[0]?.cardIds ?? [];
  const session = state.activeSession;

  function changeLocale(next: LocaleCode) {
    applyLocaleData(next);
    setLocale(next);
    setNotice(next === "en"
      ? "English version enabled. Your current session and progress are preserved."
      : "Русская версия включена. Текущая сессия и прогресс сохранены.");
  }

  function openLesson(moduleId: ModuleId) {
    const module = moduleById[moduleId];
    if (!moduleAvailable(state, moduleId, module.prerequisites)) {
      setNotice(locale === "ru" ? "Сначала закончи объяснение предыдущего модуля." : "Complete the previous module explanation first.");
      return;
    }
    const changed = module.drills.filter((drill) => drill.kind === "changed" || drill.kind === "boundary").slice(0, 2);
    setState(startSession(state, "lesson", moduleId, [module.drills[0].id, ...changed.map((drill) => drill.id)]));
    setTab("learn");
  }

  function openPractice(moduleId: ModuleId) {
    setState(startSession(state, "practice", moduleId, moduleById[moduleId].drills.map((drill) => drill.id)));
    setTab("learn");
  }

  function openRepair(moduleId: ModuleId) {
    const selection = selectRepair(state, moduleId);
    if (!selection.drills.length) return;
    setState(startSession(state, "repair", moduleId, selection.drills.map((drill) => drill.id), 0, selection.sourceReviewId));
    setTab("learn");
  }

  function openReview(limit = 3) {
    const drills = selectReview(state, limit);
    if (!drills.length) { setTab("review"); return; }
    setState(startSession(state, "review", drills[0].moduleId, drills.map((drill) => drill.id)));
    setTab("learn");
  }

  function openMixed() {
    const drills = selectMixed(state);
    setState(startSession(state, "mixed", drills[0].moduleId, drills.map((drill) => drill.id)));
    setTab("learn");
  }

  function runToday() {
    const item = plan.items[0];
    if (!item || item.kind === "done") return;
    if (item.kind === "resume") { setTab("learn"); return; }
    if (item.kind === "review") { openReview(1); return; }
    if (item.kind === "repair" && item.moduleId) { openRepair(item.moduleId); return; }
    if (item.kind === "lesson" && item.moduleId) { openLesson(item.moduleId); return; }
    if (item.kind === "cards") { setTab("cards"); return; }
    if ((item.kind === "practice" || item.kind === "mixed") && item.moduleId && item.drillIds?.length) {
      setState(startSession(state, item.kind === "mixed" ? "mixed" : "practice", item.moduleId, item.drillIds));
      setTab("learn");
    }
  }

  function exitSession() {
    setNotice(locale === "ru" ? "Сессия сохранена. Можно продолжить с этого места." : "Session saved. You can resume from this exact point.");
    setTab("today");
  }

  if (!ready) return <main className="loading"><p>{t.loading}</p></main>;

  return <main>
    <header className="topbar">
      <button className="brand" onClick={() => setTab("today")}>LIVE CASH OS</button>
      <div className="topmeta">
        <span>v{APP_VERSION}</span>
        <span className={`sync sync-${syncStatus}`}>{t.sync[syncStatus]}</span>
        <div className="mode-switch" aria-label={locale === "ru" ? "Язык" : "Language"}>
          <button aria-pressed={locale === "ru"} onClick={() => changeLocale("ru")}>RU</button>
          <button aria-pressed={locale === "en"} onClick={() => changeLocale("en")}>EN</button>
        </div>
        <button className="quiet" onClick={() => setTab("debug")}>{t.system}</button>
      </div>
    </header>
    <nav className="tabs" aria-label={locale === "ru" ? "Основная навигация" : "Primary navigation"}>
      {PRIMARY_TABS.map((id) =>
        <button key={id} aria-current={tab === id ? "page" : undefined} onClick={() => setTab(id)}>{t.nav[id]}</button>)}
    </nav>
    <div className="sr-live" aria-live="polite">{notice}</div>
    {notice && <div className="notice"><span>{notice}</span><button onClick={() => setNotice("")}>{t.close}</button></div>}

    {tab === "today" && <Today locale={locale} state={state} plan={plan} budget={dailyBudget} onBudget={setDailyBudget} onRun={runToday} onCards={() => setTab("cards")} onDiagnostic={() => setTab("diagnostic")} onField={() => setTab("field")} />}
    {tab === "learn" && !session && <Learn locale={locale} state={state} onLesson={openLesson} onPractice={openPractice} onMixed={openMixed} />}
    {tab === "learn" && session && <Session locale={locale} state={state} setState={setState} onExit={exitSession} />}
    {tab === "review" && <Review locale={locale} state={state} onReview={openReview} onRepair={openRepair} />}
    {tab === "cards" && <Cards locale={locale} state={state} setState={setState} warmupIds={warmupCardIds} />}
    {tab === "map" && <SkillMap locale={locale} state={state} onLesson={openLesson} onPractice={openPractice} />}
    {tab === "field" && <Wave7FieldPanel locale={locale} state={state} setState={setState} fieldStatusLabel={fieldStatusLabel} fieldFactLabels={fieldFactLabels} />}
    {tab === "diagnostic" && <Diagnostic locale={locale} state={state} setState={setState} onExit={() => setTab("today")} />}
    {tab === "debug" && <Debug locale={locale} state={state} setState={setState} syncStatus={syncStatus} setSyncStatus={setSyncStatus} />}
  </main>;
}

function Today({ locale, state, plan, budget, onBudget, onRun, onCards, onDiagnostic, onField }: { locale: LocaleCode; state: LearnerState; plan: DailyPlan; budget: DailyBudget; onBudget: (value: DailyBudget) => void; onRun: () => void; onCards: () => void; onDiagnostic: () => void; onField: () => void }) {
  const t = runtimeCopy[locale];
  const primary = plan.items[0];
  const next = primary ? dailyPlanItemCopy(locale, primary) : dailyPlanItemCopy(locale, { kind: "done", estimatedMinutes: 0, reasonCode: "done" });
  const completed = modules.filter((module) => state.modules[module.id].contentCompleted).length;
  const working = modules.filter((module) => ["WORKING", "RETAINED", "FIELD_TEST_PENDING", "FIELD_VALIDATED"].includes(state.modules[module.id].state)).length;
  const pendingHuman = pendingHumanReviewCount(state);
  const budgets: DailyBudget[] = ["5", "15", "30", "warmup", "post"];
  const returnCopy = locale === "ru"
    ? "После паузы берём ограниченный набор самых полезных повторений — весь накопившийся хвост сразу не показываем."
    : "After a break, start with a bounded set of the highest-value reviews instead of dumping the whole backlog at once.";
  const deferredCopy = locale === "ru"
    ? `Ещё ${plan.deferredDueCount} повторений останутся в очереди после этой сессии.`
    : `${plan.deferredDueCount} more review items stay queued after this session.`;
  return <>
    <section className="hero compact-hero">
      <p className="eyebrow">{t.todayEyebrow}</p>
      <h1>{t.todayTitle}<br/><em>{t.todayEmphasis}</em></h1>
      <p className="lede">{t.todayDescription}</p>
      <div className="mode-switch" aria-label={locale === "ru" ? "Длительность занятия" : "Session length"}>{budgets.map((value) => <button key={value} aria-pressed={budget === value} onClick={() => onBudget(value)}>{dailyBudgetLabel(locale, value)}</button>)}</div>
      <div className="today-card"><p className="eyebrow">{t.now} · ≈{plan.estimatedMinutes} {locale === "ru" ? "мин" : "min"}</p><h2>{next.title}</h2><p>{next.reason}</p>{plan.returnAfterBreak && <p className="support">{returnCopy}</p>}{plan.deferredDueCount > 0 && <p className="support">{deferredCopy}</p>}<button className="primary" aria-label={t.start} disabled={!primary || primary.kind === "done"} onClick={onRun}>{t.start} <span>→</span></button></div>
    </section>
    <section className="metrics">
      <div><b>{completed}/11</b><span>{t.completedLessons}</span></div>
      <div><b>{working}</b><span>{t.workingSkills}</span></div>
      <div><b>{dueReviewItems(state).length}</b><span>{t.dueItems}</span></div>
    </section>
    <section className="quick-grid">
      <article><p className="eyebrow">{locale === "ru" ? "ПЛАН" : "PLAN"}</p><h3>{locale === "ru" ? "Что входит дальше" : "What comes next"}</h3>{plan.items.slice(0, 3).map((item, index) => { const copy = dailyPlanItemCopy(locale, item); return <p key={`${item.kind}-${item.moduleId ?? index}`}>{index + 1}. {copy.title} · ≈{item.estimatedMinutes} {locale === "ru" ? "мин" : "min"}</p>; })}</article>
      <article><p className="eyebrow">{t.personalisation}</p><h3>{t.diagnosticTitle}</h3><p>{t.diagnosticDescription}</p><button className="textbutton" onClick={onDiagnostic}>{t.openT1}</button></article>
      <article><p className="eyebrow">{locale === "ru" ? "РАЗБОР" : "REVIEW"}</p><h3>{locale === "ru" ? "Реальные руки и объяснения" : "Real hands and explanations"}</h3><p>{pendingHuman > 0 ? (locale === "ru" ? pendingHuman + " записей ждут явного разбора." : pendingHuman + " records are waiting for explicit review.") : (locale === "ru" ? "Запиши решение до результата или открой историю объяснений." : "Record a decision before the result or review your explanation history.")}</p><button className="textbutton" onClick={onField}>{locale === "ru" ? "Открыть разбор" : "Open review"}</button></article>
      <article><p className="eyebrow">{t.beforePlay}</p><h3>{t.warmupTitle}</h3><p>{t.warmupDescription}</p><button className="textbutton" onClick={onCards}>{t.quickWarmup}</button></article>
    </section>
    <section className="integrity"><h2>{t.integrityTitle}</h2><p>{t.integrityBody}</p></section>
    <LearningRoute locale={locale} />
  </>;
}

function Learn({ locale, state, onLesson, onPractice, onMixed }: { locale: LocaleCode; state: LearnerState; onLesson: (id: ModuleId) => void; onPractice: (id: ModuleId) => void; onMixed: () => void }) {
  const t = runtimeCopy[locale];
  return <section className="surface">
    <div className="section-head"><p className="eyebrow">{t.learnEyebrow}</p><h1>{t.learnTitle}<br/><em>{t.learnEmphasis}</em></h1><p>{t.learnDescription}</p></div>
    <div className="module-list">{modules.map((source) => {
      const module = localizedModule(source, locale);
      const progress = state.modules[module.id];
      const available = moduleAvailable(state, module.id, module.prerequisites);
      return <article key={module.id} className={!available ? "locked" : progress.state === "REPAIR_REQUIRED" ? "repair" : ""}>
        <div><span className="module-code">{module.lcm}</span><span className={`state-pill state-${progress.state.toLowerCase()}`}>{moduleStateLabel(locale, progress.state)}</span></div>
        <h2>{module.title}</h2><p>{module.plainGoal}</p><p className="table-cue">{module.tableCue}</p>
        <div className="module-actions"><button disabled={!available} className="primary" onClick={() => onLesson(module.id)}>{progress.contentCompleted ? t.repeatLesson : t.study} <span>→</span></button><button disabled={!progress.contentCompleted} className="textbutton" onClick={() => onPractice(module.id)}>{t.decisions}</button></div>
      </article>;
    })}</div>
    <button className="secondary wide" disabled={modules.filter((module) => state.modules[module.id].contentCompleted).length < 2} onClick={onMixed}>{t.mixedBlock}</button>
  </section>;
}

function Session({ locale, state, setState, onExit }: { locale: LocaleCode; state: LearnerState; setState: (value: LearnerState) => void; onExit: () => void }) {
  const session = state.activeSession;
  if (!session) return null;
  return session.mode === "lesson"
    ? <LessonSession locale={locale} state={state} setState={setState} source={moduleById[session.moduleId]} onExit={onExit} />
    : <PracticeSession locale={locale} state={state} setState={setState} onExit={onExit} />;
}

function SessionHeader({ locale, label, progress, onExit }: { locale: LocaleCode; label: string; progress: number; onExit?: () => void }) {
  const t = runtimeCopy[locale];
  return <div className="session-head"><div><span>{label}</span><div className="progress"><i style={{ width: `${progress}%` }} /></div></div>{onExit && <button className="quiet" onClick={onExit}>{t.saveExit}</button>}</div>;
}

function LessonSession({ locale, state, setState, source, onExit }: { locale: LocaleCode; state: LearnerState; setState: (value: LearnerState) => void; source: ModuleContent; onExit: () => void }) {
  const t = runtimeCopy[locale];
  const module = localizedModule(source, locale);
  const session = state.activeSession!;
  const setStep = (step: number, currentIndex = session.currentIndex) => setState(patchSession(state, { step, currentIndex, selectedActionId: null, selectedReasonId: null, itemStartedAt: new Date().toISOString() }));
  return <section className="session"><SessionHeader locale={locale} label={`${module.lcm} · ${t.lesson}`} progress={Math.round(((session.step + 1) / 10) * 100)} onExit={onExit} />
    {session.step === 0 && <><p className="eyebrow">1 · {locale === "ru" ? "РЕШИ БЕЗ ПОДСКАЗКИ" : "COLD CHECK"}</p><h2>{t.currentModel}</h2><p className="support">{t.coldCheckHelp}</p><Decision locale={locale} state={state} setState={setState} drill={source.drills[0]} onContinue={() => setStep(1)} /></>}
    {session.step === 1 && <ContentStep locale={locale} eyebrow={`2 · ${t.simpleTheory}`} title={module.plainGoal} paragraphs={source.theory} footer={source.scope} onNext={() => setStep(2)} />}
    {session.step === 2 && <ListStep locale={locale} eyebrow={`3 · ${t.heuristics}`} title={module.tableCue} items={source.heuristics} onNext={() => setStep(3)} />}
    {session.step === 3 && <ListStep locale={locale} eyebrow={`4 · ${t.decisionTree}`} title={t.decisionTree} items={source.decisionTree} numbered onNext={() => setStep(4)} />}
    {session.step === 4 && <Worked locale={locale} module={source} onNext={() => setStep(5)} />}
    {session.step === 5 && <Lab locale={locale} module={source} onNext={() => setStep(6, 1)} />}
    {session.step === 6 && <><p className="eyebrow">7 · {t.changedSituation}</p><h2>{t.changedSituationTitle}</h2><p className="support">{t.changedSituationHelp}</p><Decision locale={locale} state={state} setState={setState} drill={drillById[session.drillIds[session.currentIndex]]} onContinue={() => session.currentIndex + 1 < session.drillIds.length ? setStep(6, session.currentIndex + 1) : setStep(7)} /></>}
    {session.step === 7 && <ExplainBack locale={locale} state={state} setState={setState} module={source} />}
    {session.step === 8 && <TableCard locale={locale} module={source} onNext={() => setStep(9)} />}
    {session.step === 9 && <section className="summary"><p className="eyebrow">10 · {t.lessonFinished}</p><h1>{t.lessonIntroduced}<br/><em>{t.lessonNotMastered}</em></h1><p className="lede">{t.lessonNext}</p><button className="primary" onClick={() => setState(completeLesson(state, source.id))}>{t.saveReturn} <span>→</span></button></section>}
  </section>;
}

function ContentStep({ locale, eyebrow, title, paragraphs, footer, onNext }: { locale: LocaleCode; eyebrow: string; title: string; paragraphs: string[]; footer: string; onNext: () => void }) {
  const t = runtimeCopy[locale];
  return <><p className="eyebrow">{eyebrow}</p><h2>{title}</h2><div className="theory-stack">{paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div><p className="assumption-strip">{t.ruleBoundary}: {footer}</p><button className="primary" onClick={onNext}>{t.continue} <span>→</span></button></>;
}

function ListStep({ locale, eyebrow, title, items, numbered = false, onNext }: { locale: LocaleCode; eyebrow: string; title: string; items: string[]; numbered?: boolean; onNext: () => void }) {
  const t = runtimeCopy[locale];
  const Tag = numbered ? "ol" : "ul";
  return <><p className="eyebrow">{eyebrow}</p><h2>{title}</h2><Tag className="learning-list">{items.map((item) => <li key={item}>{item}</li>)}</Tag><button className="primary" onClick={onNext}>{t.continue} <span>→</span></button></>;
}

function Worked({ locale, module, onNext }: { locale: LocaleCode; module: ModuleContent; onNext: () => void }) {
  const t = runtimeCopy[locale];
  return <><p className="eyebrow">5 · {t.workedExample}</p><h2>{module.workedExample.situation}</h2><ol className="learning-list">{module.workedExample.steps.map((step) => <li key={step}>{step}</li>)}</ol><div className="answer-panel"><b>{t.conclusion}</b><p>{module.workedExample.answer}</p></div><div className="counterexample"><b>{t.ruleBoundary}</b><p>{module.counterexample}</p></div><button className="primary" onClick={onNext}>{t.openLab} <span>→</span></button></>;
}

function Lab({ locale, module, onNext }: { locale: LocaleCode; module: ModuleContent; onNext: () => void }) {
  const t = runtimeCopy[locale];
  const lab = module.lab;
  const labels = labLabels(locale);
  const [pot, setPot] = useState(lab.type === "spr" ? lab.initialPot : 0);
  const [stack, setStack] = useState(lab.type === "spr" ? lab.stack : 0);
  const [bet, setBet] = useState(lab.type === "spr" ? lab.bet : 0);
  const spr = lab.type === "spr" && pot + bet * 2 > 0 ? Math.max(0, (stack - bet) / (pot + bet * 2)) : 0;
  return <><p className="eyebrow">6 · {labels.eyebrow}</p><h2>{lab.title}</h2><p className="support">{lab.description}</p>{lab.type === "spr" ? <div className="spr-lab"><label>{labels.pot}<input type="number" value={pot} onChange={(event) => setPot(Number(event.target.value))} /></label><label>{labels.stack}<input type="number" value={stack} onChange={(event) => setStack(Number(event.target.value))} /></label><label>{labels.betCall}<input type="number" value={bet} onChange={(event) => setBet(Number(event.target.value))} /></label><div className="spr-result"><span>SPR</span><b>{spr.toFixed(2)}</b><small>({stack}−{bet}) / ({pot}+2×{bet})</small></div></div> : <div className="compare-lab"><article><b>{lab.leftTitle}</b><p>{lab.leftText}</p></article><article><b>{lab.rightTitle}</b><p>{lab.rightText}</p></article></div>}<button className="primary" onClick={onNext}>{t.changedSituation} <span>→</span></button></>;
}

function ExplainBack({ locale, state, setState, module }: { locale: LocaleCode; state: LearnerState; setState: (value: LearnerState) => void; module: ModuleContent }) {
  const t = runtimeCopy[locale];
  const [value, setValue] = useState(state.activeSession?.explainBack ?? "");
  const savedDraft = state.activeSession?.explainBack ?? "";

  function persistDraft() {
    if (value !== savedDraft) setState(patchSession(state, { explainBack: value }));
  }

  function saveAndContinue() {
    if (value.trim().length < 30) return;
    const withDraft = value === savedDraft ? state : patchSession(state, { explainBack: value });
    const saved = saveExplainBack(withDraft, module.id, module.id + ".explainBack", value);
    if (!saved.activeSession) return;
    setState(patchSession(saved, {
      step: 8,
      selectedActionId: null,
      selectedReasonId: null,
      itemStartedAt: new Date().toISOString(),
    }));
  }

  return <>
    <p className="eyebrow">8 · {t.explainBack}</p>
    <h2>{module.explainBackPrompt}</h2>
    <Wave7ExplainBackHistory locale={locale} state={state} moduleId={module.id} />
    <textarea className="large-input" value={value} onChange={(event) => setValue(event.target.value)} onBlur={persistDraft} placeholder={t.explainPlaceholder}/>
    <button className="primary" disabled={value.trim().length < 30} onClick={saveAndContinue}>{t.saveExplanation} <span>→</span></button>
  </>;
}


function TableCard({ locale, module, onNext }: { locale: LocaleCode; module: ModuleContent; onNext: () => void }) {
  const t = runtimeCopy[locale];
  return <><p className="eyebrow">9 · {t.tableCard}</p><h2>{localizedModule(module, locale).tableCue}</h2><div className="table-card">{module.tableCard.map((item, index) => <div key={item}><span>{String(index + 1).padStart(2, "0")}</span><b>{item}</b></div>)}</div><div className="glossary">{module.glossary.map((item) => <p key={item.term}><b>{item.term}</b>{item.meaning}</p>)}</div><button className="primary" onClick={onNext}>{t.finishLesson} <span>→</span></button></>;
}

function PracticeSession({ locale, state, setState, onExit }: { locale: LocaleCode; state: LearnerState; setState: (value: LearnerState) => void; onExit: () => void }) {
  const session = state.activeSession!;
  const drill = drillById[session.drillIds[session.currentIndex]];
  const advance = () => {
    if (session.currentIndex + 1 < session.drillIds.length) {
      setState(patchSession(state, { currentIndex: session.currentIndex + 1, selectedActionId: null, selectedReasonId: null, confidence: 65, itemStartedAt: new Date().toISOString() }));
    } else {
      setState(completeBlock(state, session.mode === "practice" || session.mode === "repair" ? session.moduleId : undefined));
    }
  };
  return <section className="session"><SessionHeader locale={locale} label={`${sessionModeLabel(locale, session.mode)} · ${session.currentIndex + 1}/${session.drillIds.length}`} progress={Math.round(((session.currentIndex + 1) / session.drillIds.length) * 100)} onExit={onExit} /><Decision locale={locale} state={state} setState={setState} drill={drill} onContinue={advance} /><div className="mini-results">{(["A", "B", "C", "D"] as ResponseClass[]).map((kind) => <span key={kind}>{responseClassShortLabel(locale, kind)}: {state.interactions.filter((item) => Date.parse(item.at) >= Date.parse(session.startedAt) && item.responseClass === kind).length}</span>)}</div></section>;
}

function Decision({ locale, state, setState, drill, onContinue }: { locale: LocaleCode; state: LearnerState; setState: (value: LearnerState) => void; drill: Drill; onContinue: () => void }) {
  const t = runtimeCopy[locale];
  const session = state.activeSession!;
  const actionOptions = useMemo(() => shuffle(drill.actionOptions, `${session.startedAt}:${drill.id}:action`), [drill.actionOptions, drill.id, session.startedAt]);
  const reasonOptions = useMemo(() => shuffle(drill.reasonOptions, `${session.startedAt}:${drill.id}:reason`), [drill.reasonOptions, drill.id, session.startedAt]);
  const interaction = [...state.interactions].reverse().find((item) => item.drillId === drill.id && Date.parse(item.at) >= Date.parse(session.itemStartedAt));

  function lock() {
    if (interaction || !session.selectedActionId || !session.selectedReasonId) return;
    const actionOk = session.selectedActionId === drill.correctActionId;
    const reasonOk = session.selectedReasonId === drill.correctReasonId;
    setState(recordDecision(state, {
      moduleId: drill.moduleId,
      drillId: drill.id,
      nodeKey: drill.nodeKey,
      variantGroup: drill.variantGroup,
      mode: session.mode,
      actionOk,
      reasonOk,
      selectedActionOptionId: session.selectedActionId,
      selectedReasonOptionId: session.selectedReasonId,
      sourceReviewId: session.sourceReviewId,
      confidence: session.confidence,
      elapsedSeconds: Math.max(1, Math.round((Date.now() - Date.parse(session.itemStartedAt)) / 1000)),
      targetSeconds: drill.targetSeconds,
      isBoundary: drill.kind === "boundary",
      transferProbe: transferProbeFor(drill),
    }));
  }

  if (interaction) {
    const responseClass = classifyResponse(interaction.actionOk, interaction.reasonOk);
    return <div className="feedback-view" aria-live="polite"><p className="eyebrow">{decisionReviewLabel(locale)}</p><h2>{classMessage(locale, responseClass)}</h2><div className="answer-panel"><b>{t.workingAction}</b><p>{drill.actionOptions.find((item) => item.id === drill.correctActionId)?.text}</p><b>{t.why}</b><p>{drill.reasonOptions.find((item) => item.id === drill.correctReasonId)?.text}</p></div><p className="support">{drill.explanation}</p><p className="assumption-strip">{t.assumptions}: {drill.assumptions.join(" · ")}</p><button className="primary" onClick={onContinue}>{t.continue} <span>→</span></button></div>;
  }

  return <div className="decision-card"><p className="eyebrow">{moduleById[drill.moduleId].lcm} · {drillKindLabel(locale, drill.kind)}</p><p className="cue">{drill.cue}</p><h2>{drill.question}</h2><p className="assumption-strip">{t.conditions}: {drill.assumptions.join(" · ")}</p><OptionGroup legend={t.chooseAction} options={actionOptions} selected={session.selectedActionId} onSelect={(selectedActionId) => setState(patchSession(state, { selectedActionId }))} /><OptionGroup legend={t.chooseReason} options={reasonOptions} selected={session.selectedReasonId} onSelect={(selectedReasonId) => setState(patchSession(state, { selectedReasonId }))} /><label className="confidence">{t.confidence} <b>{session.confidence}%</b><input type="range" min="0" max="100" value={session.confidence} onChange={(event) => setState(patchSession(state, { confidence: Number(event.target.value) }))} /></label><button className="primary" disabled={!session.selectedActionId || !session.selectedReasonId} onClick={lock}>{t.lockDecision} <span>→</span></button></div>;
}

function OptionGroup({ legend, options, selected, onSelect }: { legend: string; options: Option[]; selected: string | null; onSelect: (id: string) => void }) {
  return <fieldset className="answer-set"><legend>{legend}</legend>{options.map((option) => <button type="button" key={option.id} aria-pressed={selected === option.id} className={selected === option.id ? "selected" : ""} onClick={() => onSelect(option.id)}>{option.text}</button>)}</fieldset>;
}

function Review({ locale, state, onReview, onRepair }: { locale: LocaleCode; state: LearnerState; onReview: () => void; onRepair: (id: ModuleId) => void }) {
  const t = runtimeCopy[locale];
  const due = dueReviewItems(state);
  return <section className="surface"><div className="section-head"><p className="eyebrow">{t.reviewEyebrow}</p><h1>{t.reviewTitle}<br/><em>{t.reviewEmphasis}</em></h1></div>{due.length ? <div className="queue">{due.map((item) => <article key={item.id}><span className={`kind kind-${item.kind}`}>{reviewKindLabel(locale, item.kind)}</span><h3>{localizedModule(moduleById[item.moduleId], locale).title}</h3><button className="primary" onClick={() => item.kind === "repair" ? onRepair(item.moduleId) : onReview()}>{t.start} <span>→</span></button></article>)}</div> : <div className="empty-state"><h2>{t.nothingDue}</h2><p>{t.reviewEmptyBody}</p></div>}</section>;
}

function Cards({ locale, state, setState, warmupIds }: { locale: LocaleCode; state: LearnerState; setState: (value: LearnerState) => void; warmupIds: string[] }) {
  const t = runtimeCopy[locale];
  const [mode, setMode] = useState<"warmup" | "due" | "all">("warmup");
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const due = allCards.filter((card) => !state.cards[card.id] || Date.parse(state.cards[card.id].dueAt) <= Date.now());
  const warmup = allCards.filter((card) => warmupIds.includes(card.id));
  const cards = mode === "due" ? due : mode === "warmup" ? warmup : allCards;
  const card = cards[index];
  useEffect(() => { setIndex(0); setRevealed(false); }, [mode]);
  if (!card) return <section className="surface"><p className="eyebrow">{recallLabel(locale)}</p><div className="empty-state"><h2>{locale === "ru" ? "Пока нечего повторять." : "Nothing to review yet."}</h2><p>{locale === "ru" ? "После первого урока здесь появятся короткие карточки по уже изученным темам." : "After your first lesson, short cards from topics you have already seen will appear here."}</p></div></section>;
  const apply = (grade: 0 | 1 | 2 | 3) => { setState(gradeCard(state, card.id, grade)); setIndex(index + 1 >= cards.length ? 0 : index + 1); setRevealed(false); };
  return <section className="session"><div className="mode-switch"><button aria-pressed={mode === "warmup"} onClick={() => setMode("warmup")}>{cardModeLabel(locale, "warmup")}</button><button aria-pressed={mode === "due"} onClick={() => setMode("due")}>{cardModeLabel(locale, "due")}</button><button aria-pressed={mode === "all"} onClick={() => setMode("all")}>{cardModeLabel(locale, "all")}</button></div><p className="eyebrow">{recallLabel(locale)} · {index + 1}/{cards.length}</p><h2>{card.front}</h2><p className="module-code">{moduleById[card.moduleId].lcm} · {cardKindLabel(locale, card.kind)}</p>{revealed ? <><div className="card-answer">{card.back}</div><div className="grade-row"><button onClick={() => apply(0)}>{t.forgot}</button><button onClick={() => apply(1)}>{t.hard}</button><button onClick={() => apply(2)}>{t.good}</button><button className="primary" onClick={() => apply(3)}>{t.easy}</button></div></> : <button className="primary" onClick={() => setRevealed(true)}>{t.showAnswer} <span>→</span></button>}<p className="support">{t.cardsBoundary}</p></section>;
}

function SkillMap({ locale, state, onLesson, onPractice }: { locale: LocaleCode; state: LearnerState; onLesson: (id: ModuleId) => void; onPractice: (id: ModuleId) => void }) {
  const t = runtimeCopy[locale];
  return <section className="surface">
    <div className="section-head"><p className="eyebrow">{t.skillMap}</p><h1>{t.mapTitle}<br/><em>{t.mapEmphasis}</em></h1></div>
    <div className="map-grid">{modules.map((source) => {
      const module = localizedModule(source, locale);
      return <article key={module.id}>
        <div className="map-title"><span>{module.lcm}</span><b>{moduleStateLabel(locale, state.modules[module.id].state)}</b></div>
        <h3>{module.shortTitle}</h3>
        <div className="dimension-grid">{DIMENSION_KEYS.map((key) => {
          const cell = state.modules[module.id].evidence[key];
          const score = evidencePercent(cell);
          return <div key={key}><span>{dimensionLabel(locale, key)}</span><b>{score === null ? "—" : String(score) + "%"}</b><small>{cell.exposures}</small></div>;
        })}</div>
        <Wave7ProgressDetails locale={locale} state={state} moduleId={module.id} />
        <div className="module-actions"><button className="textbutton" onClick={() => onLesson(module.id)}>{t.theory}</button><button className="textbutton" disabled={!state.modules[module.id].contentCompleted} onClick={() => onPractice(module.id)}>{t.practice}</button></div>
      </article>;
    })}</div>
  </section>;
}



function Diagnostic({ locale, state, setState, onExit }: { locale: LocaleCode; state: LearnerState; setState: (value: LearnerState) => void; onExit: () => void }) {
  const t = runtimeCopy[locale];
  const diagnostic = state.diagnostic;
  const sourceItem = diagnosticT1[diagnostic.responses.length];
  const item = sourceItem && locale === "en" ? { ...sourceItem, ...diagnosticEnglish[sourceItem.id] } : sourceItem;
  const [answer, setAnswer] = useState("");
  const [reasoning, setReasoning] = useState("");
  const [confidence, setConfidence] = useState(65);
  const [startedAt, setStartedAt] = useState(Date.now());
  const preExposure = state.interactions.length === 0 && modules.every((module) => !state.modules[module.id].contentCompleted && state.modules[module.id].lessonStep === 0);
  const context = diagnostic.measurementContext;
  const instructions = context === "MIXED_EXPOSURE_INVALID_FOR_BASELINE" ? t.mixedInstructions : context === "COLD_BASELINE" ? t.coldInstructions : t.postInstructions;

  const begin = () => {
    setStartedAt(Date.now());
    setState(startDiagnosticRun(state, locale));
  };
  const submit = () => {
    if (!item || !answer.trim() || !reasoning.trim()) return;
    setState(recordDiagnosticResponse(state, {
      item_id: item.id,
      answer: answer.trim(),
      reasoning: reasoning.trim(),
      confidence,
      time_seconds: Math.max(1, Math.round((Date.now() - startedAt) / 1000)),
      locale,
    }, T1_IDS));
    setAnswer("");
    setReasoning("");
    setConfidence(65);
    setStartedAt(Date.now());
  };

  async function importScore(file: File) {
    try {
      const score = parseDiagnosticScore(JSON.parse(await file.text()));
      if (!diagnostic.runId || score.run_id !== diagnostic.runId) throw new Error("run");
      if (score.measurement_context !== diagnostic.measurementContext) throw new Error("context");
      if (score.locale_at_start !== diagnostic.localeAtStart) throw new Error("locale");
      if (!score.item_reviews || !score.reviewer_kind || !score.reviewed_at) throw new Error("human-review");
      const priority = deriveDiagnosticPriorityModules(score);
      setState(applyReviewedDiagnostic(state, priority, {
        reviewerKind: score.reviewer_kind === "human" ? "HUMAN" : "HUMAN_ASSISTED",
        reviewedAt: score.reviewed_at,
        itemReviews: score.item_reviews.map((item) => ({
          itemId: item.item_id,
          responseClass: item.response_class,
          reviewerNote: item.reviewer_note,
        })),
      }));
    } catch {
      alert(locale === "ru" ? "Не удалось загрузить результат разбора для этой проверки T1." : "Could not import the reviewed result for this T1 check.");
    }
  }

  if (diagnostic.status === "NOT_STARTED") {
    return <section className="surface"><div className="section-head"><p className="eyebrow">{preExposure ? t.coldAvailable : t.postLearning}</p><h1>{t.diagnosticMeasureTitle}<br/><em>{t.diagnosticMeasureEmphasis}</em></h1><p>{preExposure ? t.coldIntro : t.postIntro}</p><button className="primary" aria-label={t.startT1} onClick={begin}>{t.startT1} <span>→</span></button></div></section>;
  }

  if (["AWAITING_REVIEW", "SCORED", "ROUTED"].includes(diagnostic.status)) {
    const exportReady = Boolean(diagnostic.runId && diagnostic.measurementContext && diagnostic.localeAtStart && diagnostic.submittedAt && diagnostic.responses.length === 10);
    return <section className="surface"><div className="section-head"><p className="eyebrow">T1 · {diagnosticStatusLabel(locale, diagnostic.status)}</p><h1>{diagnostic.responses.length}/10 {t.answersSaved}.</h1><p>{t.rawBoundary}</p><p className="support">{locale === "ru" ? "Семантический разбор делает человек или человек с инструментом. Импорт может поднять тему в очереди, но сам по себе не подтверждает навык, запоминание после паузы или игру за столом." : "Semantic review is done by a human or human-assisted reviewer. Import may move a topic up the queue, but by itself it does not prove the skill, later recall, or real-table use."}</p><div className="button-row"><button className="primary" disabled={!exportReady} onClick={() => downloadJson("live-cash-t1-raw-v0.2.json", {
      schema_version: "raw-0.2",
      learner_id: "current_learner",
      tranche_id: "T1",
      run_id: diagnostic.runId,
      measurement_context: diagnostic.measurementContext,
      locale_at_start: diagnostic.localeAtStart,
      submitted_at: diagnostic.submittedAt,
      responses: diagnostic.responses,
    })}>{t.downloadRaw} <span>↓</span></button><label className="file-button">{t.importScore}<input type="file" accept="application/json" onChange={(event) => { const file = event.target.files?.[0]; if (file) void importScore(file); }} /></label></div>{diagnostic.priorityModules.map((moduleId) => <p key={moduleId} className="priority-box">{moduleById[moduleId].lcm} · {localizedModule(moduleById[moduleId], locale).title}</p>)}</div></section>;
  }

  if (!item) return null;
  return <section className="session"><SessionHeader locale={locale} label={`T1 · ${diagnostic.responses.length + 1}/10`} progress={Math.round(((diagnostic.responses.length + 1) / 10) * 100)} onExit={onExit} /><p className="eyebrow">{item.id} · {item.title}</p><p className="support">{instructions}</p><h2>{item.prompt}</h2><label className="diagnostic-input">{t.actionDirection}<textarea value={answer} onChange={(event) => setAnswer(event.target.value)} /></label><label className="diagnostic-input">{t.oneSentenceReason}<textarea value={reasoning} onChange={(event) => setReasoning(event.target.value)} /></label><label className="confidence">{t.confidence} <b>{confidence}%</b><input type="range" min="0" max="100" value={confidence} onChange={(event) => setConfidence(Number(event.target.value))} /></label><button className="primary" disabled={!answer.trim() || !reasoning.trim()} onClick={submit}>{t.recordResponse} <span>→</span></button></section>;
}

function Debug({ locale, state, setState, syncStatus, setSyncStatus }: { locale: LocaleCode; state: LearnerState; setState: (value: LearnerState) => void; syncStatus: SyncStatus; setSyncStatus: (value: SyncStatus) => void }) {
  async function deleteCloud() { try { const response = await fetch("/api/state", { method: "DELETE" }); setSyncStatus(response.ok ? "synced" : response.status === 401 ? "local" : "error"); } catch { setSyncStatus("offline"); } }
  async function importState(file: File) { try { const migrated = migrateLearnerState(JSON.parse(await file.text())); if (!validateLearnerState(migrated)) throw new Error(); setState(migrated); } catch { alert(locale === "ru" ? "Не удалось импортировать прогресс." : "Progress import failed."); } }
  function reset() { if (confirm(locale === "ru" ? "Удалить локальный прогресс?" : "Delete local progress?")) { localStorage.removeItem(STORAGE_KEY); setState(emptyLearnerState()); } }
  return <section className="surface"><div className="section-head"><p className="eyebrow">SYSTEM / OWNER VIEW</p><h1>{locale === "ru" ? "Прозрачное состояние." : "Transparent state."}</h1></div><div className="debug-grid"><div><span>App</span><b>{APP_VERSION}</b></div><div><span>State schema</span><b>{STATE_SCHEMA_VERSION}</b></div><div><span>Content</span><b>{CONTENT_VERSION}</b></div><div><span>Revision</span><b>{state.revision}</b></div><div><span>Sync</span><b>{syncStatus}</b></div><div><span>Review queue</span><b>{state.reviewQueue.length}</b></div><div><span>Interactions</span><b>{state.interactions.length}</b></div><div><span>Field pending</span><b>{state.fieldNotes.filter((note) => note.status === "PENDING_REVIEW").length}</b></div><div><span>T1 context</span><b>{state.diagnostic.measurementContext ?? "—"}</b></div><div><span>T1 locale</span><b>{state.diagnostic.localeAtStart ?? "—"}</b></div></div><div className="button-row"><button className="secondary" onClick={() => downloadJson("live-cash-progress.json", state)}>Export</button><label className="file-button">Import<input type="file" accept="application/json" onChange={(event) => { const file = event.target.files?.[0]; if (file) void importState(file); }} /></label><button className="secondary" onClick={() => void deleteCloud()}>Delete cloud state</button><button className="danger" onClick={reset}>Reset local</button></div><p className="assumption-strip">Sync contract: deterministic last-write-wins. Independent offline events are not claimed to be conflict-safe.</p></section>;
}
