"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { allCards, drillById, moduleById, modules } from "../content/modules";
import { diagnosticT1 } from "../content/diagnostic";
import type { Drill, ModuleContent, Option } from "../content/types";
import {
  APP_VERSION,
  CONTENT_VERSION,
  DIMENSION_KEYS,
  MODULE_IDS,
  STATE_SCHEMA_VERSION,
  addFieldNote,
  chooseTodayAction,
  classifyResponse,
  completeBlock,
  completeLesson,
  deriveModuleState,
  dueReviewItems,
  emptyLearnerState,
  evidencePercent,
  gradeCard,
  mergeLearnerStates,
  migrateLearnerState,
  moduleAvailable,
  recordDecision,
  reviewFieldNote,
  saveActiveSession,
  validateLearnerState,
  type ActiveSession,
  type DiagnosticRawResponse,
  type FieldNote,
  type LearnerState,
  type LearningMode,
  type ModuleId,
  type ResponseClass,
} from "../lib/model";

const STORAGE_KEY = "live-cash-os:learner-state";
type Tab = "today" | "learn" | "review" | "cards" | "map" | "field" | "diagnostic" | "debug";
type SyncStatus = "loading" | "local" | "syncing" | "synced" | "offline" | "conflict" | "error";

type Feedback = {
  drill: Drill;
  actionOk: boolean;
  reasonOk: boolean;
  responseClass: ResponseClass;
};

function seededNumber(value: string): number {
  let hash = 2166136261;
  for (const char of value) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  return hash >>> 0;
}

function shuffled<T>(items: T[], seed: string): T[] {
  const result = [...items];
  let state = seededNumber(seed) || 1;
  for (let index = result.length - 1; index > 0; index -= 1) {
    state = (state * 1664525 + 1013904223) >>> 0;
    const target = state % (index + 1);
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
}

function touchState(state: LearnerState): LearnerState {
  const next = structuredClone(state);
  next.revision += 1;
  next.updatedAt = new Date().toISOString();
  next.appVersion = APP_VERSION;
  next.contentVersion = CONTENT_VERSION;
  return next;
}

function moduleStateLabel(value: string): string {
  const labels: Record<string, string> = {
    UNEXPOSED: "не начато",
    INTRODUCED: "введено",
    FRAGILE: "хрупко",
    WORKING: "работает",
    RETAINED: "удержано",
    FIELD_TEST_PENDING: "нужна реальная рука",
    FIELD_VALIDATED: "подтверждено в игре",
    REPAIR_REQUIRED: "нужен repair",
  };
  return labels[value] ?? value;
}

function dimensionLabel(value: string): string {
  const labels: Record<string, string> = {
    node_recognition: "узел",
    mechanism_explanation: "механизм",
    action_selection: "действие",
    boundary_control: "границы",
    speed: "скорость",
    confidence_calibration: "уверенность",
    variant_transfer: "перенос",
    retention: "удержание",
    field_transfer: "реальная игра",
  };
  return labels[value] ?? value;
}

function classCopy(value: ResponseClass): string {
  const copy: Record<ResponseClass, string> = {
    A: "Действие и причина верны.",
    B: "Причина верна, действие требует ремонта.",
    C: "Действие верно, причина требует ремонта.",
    D: "Нужно перестроить и действие, и механизм.",
    E: "Baseline выбран верно, но exploit-уверенность завышена.",
    U: "Честный UNKNOWN допустим в этой границе evidence.",
  };
  return copy[value];
}

function currentSessionDrill(state: LearnerState): Drill | null {
  const session = state.activeSession;
  if (!session || !session.drillIds.length) return null;
  return drillById[session.drillIds[session.currentIndex]] ?? null;
}

function selectRepairDrills(state: LearnerState, moduleId: ModuleId): Drill[] {
  const due = dueReviewItems(state).find((item) => item.moduleId === moduleId && item.kind === "repair");
  const module = moduleById[moduleId];
  if (!due) return module.drills.filter((drill) => drill.kind !== "core").slice(0, 3);
  const sameFamily = module.drills.filter((drill) => drill.variantGroup === due.variantGroup && drill.id !== due.sourceDrillId);
  const boundary = module.drills.filter((drill) => drill.kind === "boundary" && !sameFamily.some((item) => item.id === drill.id));
  return [...sameFamily, ...boundary, ...module.drills].filter((drill, index, list) => list.findIndex((item) => item.id === drill.id) === index).slice(0, 3);
}

function selectReviewDrills(state: LearnerState): Drill[] {
  const due = dueReviewItems(state).filter((item) => item.kind === "retention").slice(0, 3);
  return due.map((item) => {
    const module = moduleById[item.moduleId];
    return module.drills.find((drill) => drill.variantGroup === item.variantGroup && drill.id !== item.sourceDrillId)
      ?? module.drills.find((drill) => drill.kind === "changed")
      ?? module.drills[0];
  });
}

function selectMixedDrills(state: LearnerState): Drill[] {
  const eligible = modules.filter((module) => state.modules[module.id].contentCompleted);
  const source = eligible.length ? eligible : [moduleById.geometry];
  return source.slice(-5).map((module, index) => module.drills[(index + state.revision) % module.drills.length]);
}

function startSession(
  state: LearnerState,
  mode: LearningMode,
  moduleId: ModuleId,
  drillIds: string[],
  lessonStep = 0,
): LearnerState {
  const session: ActiveSession = {
    mode,
    moduleId,
    step: lessonStep,
    drillIds,
    currentIndex: 0,
    selectedActionId: null,
    selectedReasonId: null,
    confidence: 65,
    startedAt: new Date().toISOString(),
    explainBack: "",
  };
  return saveActiveSession(state, session);
}

function stateWithSessionPatch(state: LearnerState, patch: Partial<NonNullable<ActiveSession>>): LearnerState {
  if (!state.activeSession) return state;
  const next = structuredClone(state);
  next.activeSession = { ...next.activeSession, ...patch };
  return touchState(next);
}

function downloadJson(filename: string, value: unknown) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], { type: "application/json" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function LiveCashApp() {
  const [state, setState] = useState<LearnerState>(emptyLearnerState);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<Tab>("today");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("loading");
  const [notice, setNotice] = useState("");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    async function restore() {
      let local = emptyLearnerState();
      try { local = migrateLearnerState(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null")); } catch { local = emptyLearnerState(); }
      let remote: LearnerState | null = null;
      try {
        const response = await fetch("/api/state", { cache: "no-store" });
        if (response.ok) {
          const payload = await response.json() as { state?: unknown };
          remote = payload.state ? migrateLearnerState(payload.state) : null;
          setSyncStatus("synced");
        } else if (response.status === 401) setSyncStatus("local");
        else setSyncStatus("error");
      } catch {
        setSyncStatus("offline");
      }
      const merged = mergeLearnerStates(local, remote);
      setState(merged);
      setReady(true);
      if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
        void navigator.serviceWorker.register("/sw.js").catch(() => undefined);
      }
    }
    void restore();
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSyncStatus((value) => value === "local" ? "local" : "syncing");
      try {
        const response = await fetch("/api/state", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ state }),
        });
        if (response.ok) setSyncStatus("synced");
        else if (response.status === 401) setSyncStatus("local");
        else if (response.status === 409) setSyncStatus("conflict");
        else setSyncStatus("error");
      } catch { setSyncStatus("offline"); }
    }, 700);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [state, ready]);

  const today = useMemo(() => chooseTodayAction(state, MODULE_IDS as unknown as ModuleId[]), [state]);
  const due = useMemo(() => dueReviewItems(state), [state]);
  const session = state.activeSession;
  const activeModule = session ? moduleById[session.moduleId] : null;

  function openLesson(moduleId: ModuleId) {
    const module = moduleById[moduleId];
    if (!moduleAvailable(state, moduleId, module.prerequisites)) {
      setNotice("Сначала закончи teaching layer предыдущего модуля. Это не mastery-gate, а порядок объяснений.");
      return;
    }
    setFeedback(null);
    setState(startSession(state, "lesson", moduleId, [module.drills[0].id, ...module.drills.filter((item) => item.kind === "changed" || item.kind === "boundary").slice(0, 2).map((item) => item.id)], 0));
    setTab("learn");
  }

  function openPractice(moduleId: ModuleId) {
    const module = moduleById[moduleId];
    setFeedback(null);
    setState(startSession(state, "practice", moduleId, module.drills.map((item) => item.id)));
    setTab("learn");
  }

  function openRepair(moduleId: ModuleId) {
    const drills = selectRepairDrills(state, moduleId);
    setFeedback(null);
    setState(startSession(state, "repair", moduleId, drills.map((item) => item.id)));
    setTab("learn");
  }

  function openReview() {
    const drills = selectReviewDrills(state);
    if (!drills.length) { setTab("review"); return; }
    setFeedback(null);
    setState(startSession(state, "review", drills[0].moduleId, drills.map((item) => item.id)));
    setTab("learn");
  }

  function openMixed() {
    const drills = selectMixedDrills(state);
    setFeedback(null);
    setState(startSession(state, "mixed", drills[0].moduleId, drills.map((item) => item.id)));
    setTab("learn");
  }

  function runTodayAction() {
    if (today.kind === "resume") { setTab("learn"); return; }
    if (today.kind === "review") { openReview(); return; }
    if (today.kind === "repair" && today.moduleId) { openRepair(today.moduleId); return; }
    if (today.kind === "lesson" && today.moduleId) { openLesson(today.moduleId); return; }
    if (today.kind === "diagnostic") { setTab("diagnostic"); return; }
    setTab("field");
  }

  function resetSession() {
    const next = structuredClone(state);
    next.activeSession = null;
    setState(touchState(next));
    setFeedback(null);
    setTab("today");
  }

  if (!ready) return <main className="loading"><p>Загружаем learner state…</p></main>;

  return (
    <main>
      <header className="topbar">
        <button className="brand" onClick={() => setTab("today")}>LIVE CASH OS</button>
        <div className="topmeta"><span>v{APP_VERSION}</span><SyncBadge status={syncStatus} /><button className="quiet" onClick={() => setTab("debug")}>система</button></div>
      </header>

      <nav className="tabs" aria-label="Основная навигация">
        {([
          ["today", "Сегодня"], ["learn", "Учиться"], ["review", "Повтор"], ["cards", "Карточки"], ["map", "Карта"], ["field", "Руки"], ["diagnostic", "T1"],
        ] as Array<[Tab, string]>).map(([id, label]) => <button key={id} aria-current={tab === id ? "page" : undefined} onClick={() => setTab(id)}>{label}</button>)}
      </nav>

      <div className="sr-live" aria-live="polite">{notice}</div>
      {notice && <div className="notice"><span>{notice}</span><button onClick={() => setNotice("")}>Закрыть</button></div>}

      {tab === "today" && <TodayView state={state} action={today} dueCount={due.length} onRun={runTodayAction} onDiagnostic={() => setTab("diagnostic")} onCards={() => setTab("cards")} />}
      {tab === "learn" && !session && <LearnHome state={state} onLesson={openLesson} onPractice={openPractice} onMixed={openMixed} />}
      {tab === "learn" && session && activeModule && <SessionView state={state} setState={setState} module={activeModule} feedback={feedback} setFeedback={setFeedback} onExit={resetSession} />}
      {tab === "review" && <ReviewHome state={state} onReview={openReview} onRepair={openRepair} />}
      {tab === "cards" && <CardsView state={state} setState={setState} />}
      {tab === "map" && <MapView state={state} onLesson={openLesson} onPractice={openPractice} />}
      {tab === "field" && <FieldView state={state} setState={setState} />}
      {tab === "diagnostic" && <DiagnosticView state={state} setState={setState} />}
      {tab === "debug" && <DebugView state={state} setState={setState} syncStatus={syncStatus} setSyncStatus={setSyncStatus} />}
    </main>
  );
}

function SyncBadge({ status }: { status: SyncStatus }) {
  const labels: Record<SyncStatus, string> = { loading: "загрузка", local: "локально", syncing: "синхронизация", synced: "синхронизировано", offline: "офлайн", conflict: "конфликт", error: "ошибка sync" };
  return <span className={`sync sync-${status}`}>{labels[status]}</span>;
}

function TodayView({ state, action, dueCount, onRun, onDiagnostic, onCards }: { state: LearnerState; action: ReturnType<typeof chooseTodayAction>; dueCount: number; onRun: () => void; onDiagnostic: () => void; onCards: () => void }) {
  const completed = modules.filter((module) => state.modules[module.id].contentCompleted).length;
  const working = modules.filter((module) => ["WORKING", "RETAINED", "FIELD_TEST_PENDING", "FIELD_VALIDATED"].includes(state.modules[module.id].state)).length;
  return <>
    <section className="hero compact-hero">
      <p className="eyebrow">СЕГОДНЯ · ОДНО ГЛАВНОЕ ДЕЙСТВИЕ</p>
      <h1>Учись коротко.<br/><em>Переноси глубоко.</em></h1>
      <p className="lede">Система выбирает следующий шаг по реальным ошибкам, due review и порядку механизмов — не по красивому общему проценту.</p>
      <div className="today-card"><p className="eyebrow">СЕЙЧАС</p><h2>{action.title}</h2><p>{action.reason}</p><button className="primary" onClick={onRun}>Начать <span>→</span></button></div>
    </section>
    <section className="metrics"><div><b>{completed}/11</b><span>teaching layers пройдено</span></div><div><b>{working}</b><span>механизмов с working evidence</span></div><div><b>{dueCount}</b><span>повторов/repair due</span></div></section>
    <section className="quick-grid">
      <article><p className="eyebrow">ПЕРСОНАЛИЗАЦИЯ</p><h3>T1 — дополнительный cold diagnostic</h3><p>Полезен для приоритизации, но не блокирует первый урок.</p><button className="textbutton" onClick={onDiagnostic}>Открыть T1 →</button></article>
      <article><p className="eyebrow">ПЕРЕД ИГРОЙ</p><h3>90 секунд table cues</h3><p>Три due/слабые карточки без длинного урока.</p><button className="textbutton" onClick={onCards}>Быстрый warm-up →</button></article>
    </section>
    <section className="integrity"><h2>Что система не утверждает</h2><p>Просмотр контента не равен mastery. Retention появляется только после задержки, а field transfer — только после review реальной руки.</p></section>
  </>;
}

function LearnHome({ state, onLesson, onPractice, onMixed }: { state: LearnerState; onLesson: (id: ModuleId) => void; onPractice: (id: ModuleId) => void; onMixed: () => void }) {
  return <section className="surface"><div className="section-head"><p className="eyebrow">УЧИТЬСЯ</p><h1>Один механизм.<br/><em>Десять ясных шагов.</em></h1><p>Cold check → простая теория → эвристики → decision tree → example → lab → changed nodes → explain-back → table card → delayed review.</p></div>
    <div className="module-list">{modules.map((module) => {
      const progress = state.modules[module.id];
      const available = moduleAvailable(state, module.id, module.prerequisites);
      return <article key={module.id} className={!available ? "locked" : progress.state === "REPAIR_REQUIRED" ? "repair" : ""}>
        <div><span className="module-code">{module.lcm}</span><span className={`state-pill state-${progress.state.toLowerCase()}`}>{moduleStateLabel(progress.state)}</span></div>
        <h2>{module.title}</h2><p>{module.plainGoal}</p><p className="table-cue">{module.tableCue}</p>
        <div className="module-actions"><button disabled={!available} className="primary" onClick={() => onLesson(module.id)}>{progress.contentCompleted ? "Повторить объяснение" : "Изучить"} <span>→</span></button><button disabled={!progress.contentCompleted} className="textbutton" onClick={() => onPractice(module.id)}>5 решений</button></div>
      </article>;
    })}</div>
    <button className="secondary wide" disabled={modules.filter((module) => state.modules[module.id].contentCompleted).length < 2} onClick={onMixed}>Mixed context-switch block</button>
  </section>;
}

function SessionView({ state, setState, module, feedback, setFeedback, onExit }: { state: LearnerState; setState: (value: LearnerState) => void; module: ModuleContent; feedback: Feedback | null; setFeedback: (value: Feedback | null) => void; onExit: () => void }) {
  const session = state.activeSession;
  if (!session) return null;
  if (session.mode === "lesson") return <LessonSession state={state} setState={setState} module={module} feedback={feedback} setFeedback={setFeedback} onExit={onExit} />;
  return <PracticeSession state={state} setState={setState} feedback={feedback} setFeedback={setFeedback} onExit={onExit} />;
}

function LessonSession({ state, setState, module, feedback, setFeedback, onExit }: { state: LearnerState; setState: (value: LearnerState) => void; module: ModuleContent; feedback: Feedback | null; setFeedback: (value: Feedback | null) => void; onExit: () => void }) {
  const session = state.activeSession!;
  const step = session.step;
  const progress = Math.round(((step + 1) / 10) * 100);
  const setStep = (nextStep: number) => setState(stateWithSessionPatch(state, { step: nextStep, currentIndex: nextStep === 6 ? 1 : session.currentIndex, selectedActionId: null, selectedReasonId: null }));

  return <section className="session"><SessionHeader label={`${module.lcm} · УРОК`} progress={progress} onExit={onExit} />
    {step === 0 && <><p className="eyebrow">1 · COLD CHECK</p><h2>Сначала твоя текущая модель</h2><p className="support">Один вопрос без подсказки. Это не экзамен и не mastery.</p><DecisionCard state={state} setState={setState} drill={module.drills[0]} feedback={feedback} setFeedback={setFeedback} onComplete={() => setStep(1)} /></>}
    {step === 1 && <ContentStep eyebrow="2 · ПРОСТАЯ ТЕОРИЯ" title={module.plainGoal} paragraphs={module.theory} footer={module.scope} onNext={() => setStep(2)} />}
    {step === 2 && <ListStep eyebrow="3 · ТРИ ЭВРИСТИКИ" title={module.tableCue} items={module.heuristics} onNext={() => setStep(3)} />}
    {step === 3 && <ListStep eyebrow="4 · DECISION TREE" title="Порядок проверок" items={module.decisionTree} numbered onNext={() => setStep(4)} />}
    {step === 4 && <WorkedExampleStep module={module} onNext={() => setStep(5)} />}
    {step === 5 && <LabStep module={module} onNext={() => setStep(6)} />}
    {step === 6 && <><p className="eyebrow">7 · CHANGED NODE</p><h2>Тот же механизм, другие детали</h2><p className="support">Здесь проверяется перенос, а не повтор фразы.</p><DecisionCard state={state} setState={setState} drill={drillById[session.drillIds[session.currentIndex]] ?? module.drills[1]} feedback={feedback} setFeedback={setFeedback} onComplete={() => session.currentIndex + 1 < session.drillIds.length ? setState(stateWithSessionPatch(state, { currentIndex: session.currentIndex + 1, selectedActionId: null, selectedReasonId: null })) : setStep(7)} /></>}
    {step === 7 && <ExplainBackStep state={state} setState={setState} module={module} onNext={() => setStep(8)} />}
    {step === 8 && <TableCardStep module={module} onNext={() => setStep(9)} />}
    {step === 9 && <section className="summary"><p className="eyebrow">10 · УРОК ЗАВЕРШЁН</p><h1>Механизм введён.<br/><em>Не объявлен mastered.</em></h1><p className="lede">Следующий этап — отдельный practice, затем changed-node review через время.</p><button className="primary" onClick={() => setState(completeLesson(state, module.id))}>Сохранить и вернуться <span>→</span></button></section>}
  </section>;
}

function ContentStep({ eyebrow, title, paragraphs, footer, onNext }: { eyebrow: string; title: string; paragraphs: string[]; footer?: string; onNext: () => void }) {
  return <><p className="eyebrow">{eyebrow}</p><h2>{title}</h2><div className="theory-stack">{paragraphs.map((text) => <p key={text}>{text}</p>)}</div>{footer && <p className="assumption-strip">Граница: {footer}</p>}<button className="primary" onClick={onNext}>Дальше <span>→</span></button></>;
}

function ListStep({ eyebrow, title, items, numbered = false, onNext }: { eyebrow: string; title: string; items: string[]; numbered?: boolean; onNext: () => void }) {
  const Tag = numbered ? "ol" : "ul";
  return <><p className="eyebrow">{eyebrow}</p><h2>{title}</h2><Tag className="learning-list">{items.map((item) => <li key={item}>{item}</li>)}</Tag><button className="primary" onClick={onNext}>Дальше <span>→</span></button></>;
}

function WorkedExampleStep({ module, onNext }: { module: ModuleContent; onNext: () => void }) {
  return <><p className="eyebrow">5 · WORKED EXAMPLE</p><h2>{module.workedExample.situation}</h2><ol className="learning-list">{module.workedExample.steps.map((step) => <li key={step}>{step}</li>)}</ol><div className="answer-panel"><b>Вывод</b><p>{module.workedExample.answer}</p></div><div className="counterexample"><b>Граница правила</b><p>{module.counterexample}</p></div><button className="primary" onClick={onNext}>Открыть lab <span>→</span></button></>;
}

function LabStep({ module, onNext }: { module: ModuleContent; onNext: () => void }) {
  const lab = module.lab;
  const [pot, setPot] = useState(lab.type === "spr" ? lab.initialPot : 0);
  const [stack, setStack] = useState(lab.type === "spr" ? lab.stack : 0);
  const [bet, setBet] = useState(lab.type === "spr" ? lab.bet : 0);
  const spr = lab.type === "spr" && pot + bet * 2 > 0 ? Math.max(0, (stack - bet) / (pot + bet * 2)) : 0;
  return <><p className="eyebrow">6 · LAB</p><h2>{lab.title}</h2><p className="support">{lab.description}</p>{lab.type === "spr" ? <div className="spr-lab"><label>Банк до ставки<input type="number" value={pot} onChange={(event) => setPot(Number(event.target.value))} /></label><label>Оставшийся стек<input type="number" value={stack} onChange={(event) => setStack(Number(event.target.value))} /></label><label>Ставка / call<input type="number" value={bet} onChange={(event) => setBet(Number(event.target.value))} /></label><div className="spr-result"><span>SPR после call</span><b>{spr.toFixed(2)}</b><small>({stack}−{bet}) / ({pot}+2×{bet})</small></div></div> : <div className="compare-lab"><article><b>{lab.leftTitle}</b><p>{lab.leftText}</p></article><article><b>{lab.rightTitle}</b><p>{lab.rightText}</p></article></div>}<button className="primary" onClick={onNext}>Changed nodes <span>→</span></button></>;
}

function ExplainBackStep({ state, setState, module, onNext }: { state: LearnerState; setState: (value: LearnerState) => void; module: ModuleContent; onNext: () => void }) {
  const value = state.activeSession?.explainBack ?? "";
  return <><p className="eyebrow">8 · EXPLAIN-BACK</p><h2>{module.explainBackPrompt}</h2><textarea className="large-input" value={value} onChange={(event) => setState(stateWithSessionPatch(state, { explainBack: event.target.value }))} placeholder="2–4 предложения своими словами…"/><button className="primary" disabled={value.trim().length < 30} onClick={onNext}>Зафиксировать объяснение <span>→</span></button></>;
}

function TableCardStep({ module, onNext }: { module: ModuleContent; onNext: () => void }) {
  return <><p className="eyebrow">9 · TABLE CARD</p><h2>{module.tableCue}</h2><div className="table-card">{module.tableCard.map((item, index) => <div key={item}><span>{String(index + 1).padStart(2, "0")}</span><b>{item}</b></div>)}</div><div className="glossary">{module.glossary.map((item) => <p key={item.term}><b>{item.term}</b>{item.meaning}</p>)}</div><button className="primary" onClick={onNext}>Завершить урок <span>→</span></button></>;
}

function PracticeSession({ state, setState, feedback, setFeedback, onExit }: { state: LearnerState; setState: (value: LearnerState) => void; feedback: Feedback | null; setFeedback: (value: Feedback | null) => void; onExit: () => void }) {
  const session = state.activeSession!;
  const drill = currentSessionDrill(state);
  if (!drill) return <section className="summary"><h2>В блоке нет валидных items.</h2><button onClick={onExit}>Выйти</button></section>;
  const complete = () => {
    if (session.currentIndex + 1 < session.drillIds.length) {
      setState(stateWithSessionPatch(state, { currentIndex: session.currentIndex + 1, selectedActionId: null, selectedReasonId: null, confidence: 65 }));
      setFeedback(null);
    } else {
      setState(completeBlock(state, session.moduleId));
      setFeedback(null);
    }
  };
  const interactions = state.interactions.filter((item) => Date.parse(item.at) >= Date.parse(session.startedAt) && session.drillIds.includes(item.drillId));
  if (!state.activeSession) return null;
  return <><SessionHeader label={`${session.mode.toUpperCase()} · ${session.currentIndex + 1}/${session.drillIds.length}`} progress={Math.round(((session.currentIndex + 1) / session.drillIds.length) * 100)} onExit={onExit} /><DecisionCard state={state} setState={setState} drill={drill} feedback={feedback} setFeedback={setFeedback} onComplete={complete} /><div className="mini-results" aria-label="Результаты текущего блока">{(["A","B","C","D"] as ResponseClass[]).map((kind) => <span key={kind}>{kind}: {interactions.filter((item) => item.responseClass === kind).length}</span>)}</div></>;
}

function SessionHeader({ label, progress, onExit }: { label: string; progress: number; onExit: () => void }) {
  return <div className="session-head"><div><span>{label}</span><div className="progress"><i style={{ width: `${progress}%` }} /></div></div><button className="quiet" onClick={onExit}>Выйти и сохранить</button></div>;
}

function DecisionCard({ state, setState, drill, feedback, setFeedback, onComplete }: { state: LearnerState; setState: (value: LearnerState) => void; drill: Drill; feedback: Feedback | null; setFeedback: (value: Feedback | null) => void; onComplete: () => void }) {
  const session = state.activeSession!;
  const actionOptions = useMemo(() => shuffled(drill.actionOptions, `${session.startedAt}:${drill.id}:action`), [session.startedAt, drill.id]);
  const reasonOptions = useMemo(() => shuffled(drill.reasonOptions, `${session.startedAt}:${drill.id}:reason`), [session.startedAt, drill.id]);
  const elapsedSeconds = Math.max(1, Math.round((Date.now() - Date.parse(session.startedAt)) / 1000));

  function lockDecision() {
    if (!session.selectedActionId || !session.selectedReasonId) return;
    const actionOk = session.selectedActionId === drill.correctActionId;
    const reasonOk = session.selectedReasonId === drill.correctReasonId;
    const next = recordDecision(state, { moduleId: drill.moduleId, drillId: drill.id, nodeKey: drill.nodeKey, variantGroup: drill.variantGroup, mode: session.mode, actionOk, reasonOk, confidence: session.confidence, elapsedSeconds, targetSeconds: drill.targetSeconds, isBoundary: drill.kind === "boundary" });
    setState(next);
    setFeedback({ drill, actionOk, reasonOk, responseClass: classifyResponse(actionOk, reasonOk) });
  }

  if (feedback) return <div className="feedback-view" aria-live="polite"><p className="eyebrow">DECISION REVIEW · CLASS {feedback.responseClass}</p><h2>{classCopy(feedback.responseClass)}</h2><div className="answer-panel"><b>Рабочее действие</b><p>{feedback.drill.actionOptions.find((item) => item.id === feedback.drill.correctActionId)?.text}</p><b>Почему</b><p>{feedback.drill.reasonOptions.find((item) => item.id === feedback.drill.correctReasonId)?.text}</p></div><p className="support">{feedback.drill.explanation}</p><p className="assumption-strip">Assumptions: {feedback.drill.assumptions.join(" · ")}</p><button className="primary" onClick={onComplete}>Продолжить <span>→</span></button></div>;

  return <div className="decision-card"><p className="eyebrow">{drill.moduleId.toUpperCase()} · {drill.kind}</p><p className="cue">{drill.cue}</p><h2>{drill.question}</h2><p className="assumption-strip">Условия: {drill.assumptions.join(" · ")}</p><OptionGroup legend="Выбери действие" options={actionOptions} selected={session.selectedActionId} onSelect={(id) => setState(stateWithSessionPatch(state, { selectedActionId: id }))} /><OptionGroup legend="Выбери причину" options={reasonOptions} selected={session.selectedReasonId} onSelect={(id) => setState(stateWithSessionPatch(state, { selectedReasonId: id }))} /><label className="confidence">Уверенность <b>{session.confidence}%</b><input type="range" min="0" max="100" value={session.confidence} onChange={(event) => setState(stateWithSessionPatch(state, { confidence: Number(event.target.value) }))} /></label><button className="primary" disabled={!session.selectedActionId || !session.selectedReasonId} onClick={lockDecision}>Зафиксировать решение <span>→</span></button></div>;
}

function OptionGroup({ legend, options, selected, onSelect }: { legend: string; options: Option[]; selected: string | null; onSelect: (id: string) => void }) {
  return <fieldset className="answer-set"><legend>{legend}</legend>{options.map((item) => <button type="button" key={item.id} aria-pressed={selected === item.id} className={selected === item.id ? "selected" : ""} onClick={() => onSelect(item.id)}>{item.text}</button>)}</fieldset>;
}

function ReviewHome({ state, onReview, onRepair }: { state: LearnerState; onReview: () => void; onRepair: (id: ModuleId) => void }) {
  const due = dueReviewItems(state);
  return <section className="surface"><div className="section-head"><p className="eyebrow">ПОВТОР И REPAIR</p><h1>Позже.<br/><em>На похожем, но новом узле.</em></h1><p>Retention начисляется только по тому же механизму после задержки. Свежая ошибка получает контрастный repair.</p></div>{due.length ? <div className="queue">{due.map((item) => <article key={item.id}><span className={`kind kind-${item.kind}`}>{item.kind}</span><h3>{moduleById[item.moduleId].title}</h3><p>Family: {item.variantGroup}</p><button className="primary" onClick={() => item.kind === "repair" ? onRepair(item.moduleId) : onReview()}>Начать <span>→</span></button></article>)}</div> : <div className="empty-state"><h2>Сейчас ничего не due.</h2><p>После урока и practice система создаст отдельные review items по конкретным skills.</p></div>}</section>;
}

function CardsView({ state, setState }: { state: LearnerState; setState: (value: LearnerState) => void }) {
  const [mode, setMode] = useState<"warmup" | "due" | "all">("warmup");
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const now = Date.now();
  const due = allCards.filter((card) => !state.cards[card.id] || Date.parse(state.cards[card.id].dueAt) <= now);
  const cards = mode === "due" ? due : mode === "warmup" ? (due.length ? due : allCards).slice(0, 3) : allCards;
  const card = cards[index];
  useEffect(() => { setIndex(0); setRevealed(false); }, [mode]);
  if (!card) return <section className="surface"><div className="empty-state"><h2>Все карточки повторены.</h2><p>Следующая due появится по scheduler.</p></div></section>;
  function applyGrade(grade: 0 | 1 | 2 | 3) {
    setState(gradeCard(state, card.id, grade));
    if (index + 1 >= cards.length) { setIndex(0); setRevealed(false); }
    else { setIndex(index + 1); setRevealed(false); }
  }
  return <section className="session"><div className="mode-switch"><button aria-pressed={mode === "warmup"} onClick={() => setMode("warmup")}>90 секунд</button><button aria-pressed={mode === "due"} onClick={() => setMode("due")}>Due only</button><button aria-pressed={mode === "all"} onClick={() => setMode("all")}>Все</button></div><p className="eyebrow">ACTIVE RECALL · {index + 1}/{cards.length}</p><h2>{card.front}</h2><p className="module-code">{moduleById[card.moduleId].lcm} · {card.kind}</p>{revealed ? <><div className="card-answer">{card.back}</div><div className="grade-row"><button onClick={() => applyGrade(0)}>Не вспомнил</button><button onClick={() => applyGrade(1)}>Трудно</button><button onClick={() => applyGrade(2)}>Нормально</button><button className="primary" onClick={() => applyGrade(3)}>Легко</button></div></> : <button className="primary" onClick={() => setRevealed(true)}>Показать ответ <span>→</span></button>}<p className="support">Карточки поддерживают retrieval, но сами по себе не повышают retention mastery.</p></section>;
}

function MapView({ state, onLesson, onPractice }: { state: LearnerState; onLesson: (id: ModuleId) => void; onPractice: (id: ModuleId) => void }) {
  return <section className="surface"><div className="section-head"><p className="eyebrow">КАРТА НАВЫКОВ</p><h1>Evidence по механизмам,<br/><em>не галочки курса.</em></h1></div><div className="map-grid">{modules.map((module) => { const progress = state.modules[module.id]; return <article key={module.id}><div className="map-title"><span>{module.lcm}</span><b>{moduleStateLabel(progress.state)}</b></div><h3>{module.shortTitle}</h3><div className="dimension-grid">{DIMENSION_KEYS.map((key) => { const score = evidencePercent(progress.evidence[key]); return <div key={key}><span>{dimensionLabel(key)}</span><b>{score === null ? "—" : `${score}%`}</b><small>{progress.evidence[key].exposures} exp</small></div>; })}</div><div className="module-actions"><button className="textbutton" onClick={() => onLesson(module.id)}>Теория</button><button className="textbutton" disabled={!progress.contentCompleted} onClick={() => onPractice(module.id)}>Practice</button></div></article>; })}</div></section>;
}

function FieldView({ state, setState }: { state: LearnerState; setState: (value: LearnerState) => void }) {
  const [moduleId, setModuleId] = useState<ModuleId>("geometry");
  const [cue, setCue] = useState("");
  const [action, setAction] = useState("");
  const [reason, setReason] = useState("");
  const [cueBeforeAction, setCueBeforeAction] = useState(true);
  const [notes, setNotes] = useState<Record<string, string>>({});
  function save() {
    if (!cue.trim() || !action.trim() || !reason.trim()) return;
    setState(addFieldNote(state, { moduleId, cue: cue.trim(), action: action.trim(), reason: reason.trim(), cueBeforeAction }));
    setCue(""); setAction(""); setReason("");
  }
  return <section className="surface"><div className="section-head"><p className="eyebrow">РЕАЛЬНЫЕ РУКИ</p><h1>Сначала capture.<br/><em>Потом review.</em></h1><p>Raw note не является field mastery. Она получает valid, repair или insufficient verdict после проверки reasoning.</p></div><div className="field-layout"><div className="field-form"><label>Механизм<select value={moduleId} onChange={(event) => setModuleId(event.target.value as ModuleId)}>{modules.map((module) => <option key={module.id} value={module.id}>{module.lcm} · {module.shortTitle}</option>)}</select></label><label>Что заметил до действия?<textarea value={cue} onChange={(event) => setCue(event.target.value)} /></label><label>Что сделал?<textarea value={action} onChange={(event) => setAction(event.target.value)} /></label><label>Почему?<textarea value={reason} onChange={(event) => setReason(event.target.value)} /></label><label className="check"><input type="checkbox" checked={cueBeforeAction} onChange={(event) => setCueBeforeAction(event.target.checked)} /> Cue был замечен до действия</label><button className="primary" disabled={!cue.trim() || !action.trim() || !reason.trim()} onClick={save}>Сохранить pending note <span>→</span></button></div><div className="field-list">{state.fieldNotes.length === 0 && <p className="empty-state">Полевых заметок пока нет.</p>}{[...state.fieldNotes].reverse().map((note) => <article key={note.id}><span className={`kind kind-${note.status.toLowerCase()}`}>{note.status}</span><h3>{moduleById[note.moduleId].shortTitle}</h3><p><b>Cue:</b> {note.cue}</p><p><b>Action:</b> {note.action}</p><p><b>Reason:</b> {note.reason}</p>{note.status === "PENDING_REVIEW" ? <><textarea placeholder="Короткая проверка reasoning…" value={notes[note.id] ?? ""} onChange={(event) => setNotes({ ...notes, [note.id]: event.target.value })} /><div className="review-actions"><button onClick={() => setState(reviewFieldNote(state, note.id, "INSUFFICIENT", notes[note.id] ?? ""))}>Недостаточно</button><button onClick={() => setState(reviewFieldNote(state, note.id, "REVIEWED_REPAIR", notes[note.id] ?? ""))}>Нужен repair</button><button className="primary" onClick={() => setState(reviewFieldNote(state, note.id, "REVIEWED_VALID", notes[note.id] ?? ""))}>Valid</button></div></> : <p className="support">Review: {note.evaluatorNote || "без комментария"}</p>}</article>)}</div></div></section>;
}

function DiagnosticView({ state, setState }: { state: LearnerState; setState: (value: LearnerState) => void }) {
  const diagnostic = state.diagnostic;
  const index = diagnostic.responses.length;
  const item = diagnosticT1[index];
  const [answer, setAnswer] = useState("");
  const [reasoning, setReasoning] = useState("");
  const [confidence, setConfidence] = useState(65);
  const [startedAt, setStartedAt] = useState(Date.now());

  function begin() {
    const next = structuredClone(state);
    next.diagnostic.status = "IN_PROGRESS";
    next.diagnostic.startedAt ??= new Date().toISOString();
    setState(touchState(next));
    setStartedAt(Date.now());
  }
  function submit() {
    if (!item || !answer.trim() || !reasoning.trim()) return;
    const response: DiagnosticRawResponse = { item_id: item.id, answer: answer.trim(), reasoning: reasoning.trim(), confidence, time_seconds: Math.max(1, Math.round((Date.now() - startedAt) / 1000)) };
    const next = structuredClone(state);
    next.diagnostic.responses.push(response);
    const final = next.diagnostic.responses.length === diagnosticT1.length;
    next.diagnostic.status = final ? "AWAITING_REVIEW" : "IN_PROGRESS";
    if (final) next.diagnostic.submittedAt = new Date().toISOString();
    setState(touchState(next));
    setAnswer(""); setReasoning(""); setConfidence(65); setStartedAt(Date.now());
  }
  function exportRaw() {
    downloadJson("live-cash-t1-raw.json", { schema_version: "raw-0.1", learner_id: "current_learner", tranche_id: "T1", submitted_at: diagnostic.submittedAt, responses: diagnostic.responses });
  }
  async function importEvaluated(file: File) {
    try {
      const payload = JSON.parse(await file.text()) as Record<string, unknown>;
      const priority: ModuleId[] = [];
      const direct = Array.isArray(payload.priority_modules) ? payload.priority_modules : [];
      const lcmMap: Record<string, ModuleId> = { "LCM-01": "geometry", "LCM-02": "preflop", "LCM-03": "blinds", "LCM-04": "filtering", "LCM-05": "shape", "LCM-06": "aggression", "LCM-07": "ancestry", "LCM-08": "multiway", "LCM-09": "river", "LCM-10": "evidence", "LCM-11": "transfer" };
      for (const value of direct) if (typeof value === "string" && (MODULE_IDS as readonly string[]).includes(value)) priority.push(value as ModuleId);
      const moduleSummary = payload.module_summary && typeof payload.module_summary === "object" ? Object.keys(payload.module_summary as Record<string, unknown>) : [];
      for (const key of moduleSummary) if (lcmMap[key] && !priority.includes(lcmMap[key])) priority.push(lcmMap[key]);
      if (!priority.length) throw new Error("В evaluated record нет понятного module route.");
      const next = structuredClone(state);
      next.diagnostic.status = "ROUTED";
      next.diagnostic.priorityModules = priority.slice(0, 2);
      next.diagnostic.importedAt = new Date().toISOString();
      for (const moduleId of next.diagnostic.priorityModules) {
        next.modules[moduleId].state = "REPAIR_REQUIRED";
        next.modules[moduleId].highConfidenceError = true;
      }
      setState(touchState(next));
    } catch (error) {
      alert(error instanceof Error ? error.message : "Не удалось импортировать evaluated record.");
    }
  }

  if (diagnostic.status === "NOT_STARTED") return <section className="surface"><div className="section-head"><p className="eyebrow">T1 · OPTIONAL PERSONALISATION</p><h1>Измерить текущую модель.<br/><em>Не блокировать обучение.</em></h1><p>10 cold free-text decisions. Feedback скрыт до конца. T1 помогает выбрать максимум две repair families.</p><button className="primary" onClick={begin}>Начать T1 <span>→</span></button></div></section>;
  if (diagnostic.status === "AWAITING_REVIEW" || diagnostic.status === "SCORED" || diagnostic.status === "ROUTED") return <section className="surface"><div className="section-head"><p className="eyebrow">T1 · {diagnostic.status}</p><h1>{diagnostic.responses.length}/10 ответов сохранено.</h1><p>Raw record не содержит evaluation и не притворяется автоматическим стратегическим scorer. Эксперт добавляет A–E/U, misconception IDs и запускает canonical scorer.</p><div className="button-row"><button className="primary" onClick={exportRaw}>Скачать raw record <span>↓</span></button><label className="file-button">Импорт evaluated result<input type="file" accept="application/json" onChange={(event) => { const file = event.target.files?.[0]; if (file) void importEvaluated(file); }} /></label></div>{diagnostic.priorityModules.length > 0 && <div className="priority-box"><b>Активный route</b>{diagnostic.priorityModules.map((id) => <p key={id}>{moduleById[id].lcm} · {moduleById[id].title}</p>)}</div>}</div></section>;
  if (!item) return null;
  return <section className="session"><SessionHeader label={`T1 · ${index + 1}/10`} progress={Math.round(((index + 1) / 10) * 100)} onExit={() => undefined} /><p className="eyebrow">{item.id} · {item.title}</p><p className="support">Отвечай из текущего процесса. Не ищи charts и answer keys. Язык смешивает русский и стандартные poker terms, чтобы не тестировать английскую беглость.</p><h2>{item.prompt}</h2><label className="diagnostic-input">Action / direction<textarea value={answer} onChange={(event) => setAnswer(event.target.value)} /></label><label className="diagnostic-input">Причина одним предложением<textarea value={reasoning} onChange={(event) => setReasoning(event.target.value)} /></label><label className="confidence">Уверенность <b>{confidence}%</b><input type="range" min="0" max="100" value={confidence} onChange={(event) => setConfidence(Number(event.target.value))} /></label><button className="primary" disabled={!answer.trim() || !reasoning.trim()} onClick={submit}>Зафиксировать cold response <span>→</span></button></section>;
}

function DebugView({ state, setState, syncStatus, setSyncStatus }: { state: LearnerState; setState: (value: LearnerState) => void; syncStatus: SyncStatus; setSyncStatus: (value: SyncStatus) => void }) {
  async function deleteCloud() {
    try {
      const response = await fetch("/api/state", { method: "DELETE" });
      if (response.ok || response.status === 401) setSyncStatus(response.ok ? "synced" : "local");
    } catch { setSyncStatus("offline"); }
  }
  function resetAll() {
    if (!confirm("Удалить локальный learner state? Cloud state удаляется отдельной кнопкой.")) return;
    localStorage.removeItem(STORAGE_KEY);
    setState(emptyLearnerState());
  }
  async function importState(file: File) {
    try {
      const value = JSON.parse(await file.text());
      const migrated = migrateLearnerState(value);
      if (!validateLearnerState(migrated)) throw new Error("State invalid");
      setState(migrated);
    } catch { alert("Не удалось импортировать learner state."); }
  }
  return <section className="surface"><div className="section-head"><p className="eyebrow">SYSTEM / OWNER VIEW</p><h1>Прозрачное состояние.</h1><p>Здесь нет answer keys T1. Панель показывает версии, очередь и сохранение.</p></div><div className="debug-grid"><div><span>App</span><b>{APP_VERSION}</b></div><div><span>State schema</span><b>{STATE_SCHEMA_VERSION}</b></div><div><span>Content</span><b>{CONTENT_VERSION}</b></div><div><span>Revision</span><b>{state.revision}</b></div><div><span>Sync</span><b>{syncStatus}</b></div><div><span>Review queue</span><b>{state.reviewQueue.length}</b></div><div><span>Interactions</span><b>{state.interactions.length}</b></div><div><span>Field pending</span><b>{state.fieldNotes.filter((item) => item.status === "PENDING_REVIEW").length}</b></div></div><div className="button-row"><button className="secondary" onClick={() => downloadJson("live-cash-progress.json", state)}>Экспорт progress</button><label className="file-button">Импорт progress<input type="file" accept="application/json" onChange={(event) => { const file = event.target.files?.[0]; if (file) void importState(file); }} /></label><button className="secondary" onClick={() => void deleteCloud()}>Удалить cloud state</button><button className="danger" onClick={resetAll}>Сбросить локально</button></div></section>;
}
