"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { diagnosticT1 } from "../content/diagnostic";
import { allCards, drillById, moduleById, modules } from "../content/modules";
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
  type LearnerState,
  type LearningMode,
  type ModuleId,
  type ResponseClass,
} from "../lib/model";

const STORAGE_KEY = "live-cash-os:learner-state";
type Tab = "today" | "learn" | "review" | "cards" | "map" | "field" | "diagnostic" | "debug";
type SyncStatus = "loading" | "local" | "syncing" | "synced" | "offline" | "conflict" | "error";
type Feedback = { drill: Drill; actionOk: boolean; reasonOk: boolean; responseClass: ResponseClass };

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

function startSession(state: LearnerState, mode: LearningMode, moduleId: ModuleId, drillIds: string[], step = 0): LearnerState {
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

function moduleStateLabel(value: string): string {
  return ({
    UNEXPOSED: "не начато",
    INTRODUCED: "введено",
    FRAGILE: "хрупко",
    WORKING: "работает",
    RETAINED: "удержано",
    FIELD_TEST_PENDING: "нужна реальная рука",
    FIELD_VALIDATED: "подтверждено в игре",
    REPAIR_REQUIRED: "нужен repair",
  } as Record<string, string>)[value] ?? value;
}

function dimensionLabel(value: string): string {
  return ({
    node_recognition: "узел",
    mechanism_explanation: "механизм",
    action_selection: "действие",
    boundary_control: "границы",
    speed: "скорость",
    confidence_calibration: "уверенность",
    variant_transfer: "перенос",
    retention: "удержание",
    field_transfer: "реальная игра",
  } as Record<string, string>)[value] ?? value;
}

function classCopy(value: ResponseClass): string {
  return ({
    A: "Действие и причина верны.",
    B: "Причина верна, действие требует ремонта.",
    C: "Действие верно, причина требует ремонта.",
    D: "Нужно перестроить и действие, и механизм.",
    E: "Baseline выбран верно, но exploit-уверенность завышена.",
    U: "Честный UNKNOWN допустим в этой границе evidence.",
  } as Record<ResponseClass, string>)[value];
}

function downloadJson(filename: string, value: unknown) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], { type: "application/json" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function selectRepair(state: LearnerState, moduleId: ModuleId): Drill[] {
  const module = moduleById[moduleId];
  const target = dueReviewItems(state).find((item) => item.moduleId === moduleId && item.kind === "repair");
  const family = target ? module.drills.filter((drill) => drill.variantGroup === target.variantGroup && drill.id !== target.sourceDrillId) : [];
  const boundary = module.drills.filter((drill) => drill.kind === "boundary");
  return [...family, ...boundary, ...module.drills]
    .filter((drill, index, list) => list.findIndex((candidate) => candidate.id === drill.id) === index)
    .slice(0, 3);
}

function selectReview(state: LearnerState): Drill[] {
  return dueReviewItems(state)
    .filter((item) => item.kind === "retention")
    .slice(0, 3)
    .map((item) => moduleById[item.moduleId].drills.find((drill) => drill.variantGroup === item.variantGroup && drill.id !== item.sourceDrillId)
      ?? moduleById[item.moduleId].drills.find((drill) => drill.kind === "changed")
      ?? moduleById[item.moduleId].drills[0]);
}

function selectMixed(state: LearnerState): Drill[] {
  const eligible = modules.filter((module) => state.modules[module.id].contentCompleted);
  const source = eligible.length ? eligible : [moduleById.geometry];
  return source.slice(-5).map((module, index) => module.drills[(state.revision + index) % module.drills.length]);
}

export default function LiveCashApp() {
  const [state, setState] = useState<LearnerState>(emptyLearnerState);
  const [tab, setTab] = useState<Tab>("today");
  const [ready, setReady] = useState(false);
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
        } else setSyncStatus(response.status === 401 ? "local" : "error");
      } catch { setSyncStatus("offline"); }
      setState(mergeLearnerStates(local, remote));
      setReady(true);
      if ("serviceWorker" in navigator) void navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }
    void restore();
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      if (syncStatus !== "local") setSyncStatus("syncing");
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

  const today = useMemo(() => chooseTodayAction(state, [...MODULE_IDS]), [state]);
  const session = state.activeSession;

  function openLesson(moduleId: ModuleId) {
    const module = moduleById[moduleId];
    if (!moduleAvailable(state, moduleId, module.prerequisites)) {
      setNotice("Сначала закончи объяснение предыдущего модуля. Это порядок teaching layer, а не mastery-gate.");
      return;
    }
    const changed = module.drills.filter((drill) => drill.kind === "changed" || drill.kind === "boundary").slice(0, 2);
    setState(startSession(state, "lesson", moduleId, [module.drills[0].id, ...changed.map((drill) => drill.id)]));
    setFeedback(null);
    setTab("learn");
  }

  function openPractice(moduleId: ModuleId) {
    setState(startSession(state, "practice", moduleId, moduleById[moduleId].drills.map((drill) => drill.id)));
    setFeedback(null);
    setTab("learn");
  }

  function openRepair(moduleId: ModuleId) {
    setState(startSession(state, "repair", moduleId, selectRepair(state, moduleId).map((drill) => drill.id)));
    setFeedback(null);
    setTab("learn");
  }

  function openReview() {
    const drills = selectReview(state);
    if (!drills.length) { setTab("review"); return; }
    setState(startSession(state, "review", drills[0].moduleId, drills.map((drill) => drill.id)));
    setFeedback(null);
    setTab("learn");
  }

  function openMixed() {
    const drills = selectMixed(state);
    setState(startSession(state, "mixed", drills[0].moduleId, drills.map((drill) => drill.id)));
    setFeedback(null);
    setTab("learn");
  }

  function runToday() {
    if (today.kind === "resume") { setTab("learn"); return; }
    if (today.kind === "review") { openReview(); return; }
    if (today.kind === "repair" && today.moduleId) { openRepair(today.moduleId); return; }
    if (today.kind === "lesson" && today.moduleId) { openLesson(today.moduleId); return; }
    setTab(today.kind === "diagnostic" ? "diagnostic" : "field");
  }

  function exitSession() {
    setState(saveActiveSession(state, null));
    setFeedback(null);
    setTab("today");
  }

  if (!ready) return <main className="loading"><p>Загружаем learner state…</p></main>;

  return <main>
    <header className="topbar">
      <button className="brand" onClick={() => setTab("today")}>LIVE CASH OS</button>
      <div className="topmeta"><span>v{APP_VERSION}</span><SyncBadge status={syncStatus} /><button className="quiet" onClick={() => setTab("debug")}>система</button></div>
    </header>
    <nav className="tabs" aria-label="Основная навигация">
      {(["today", "learn", "review", "cards", "map", "field", "diagnostic"] as Tab[]).map((id) => <button key={id} aria-current={tab === id ? "page" : undefined} onClick={() => setTab(id)}>{({ today: "Сегодня", learn: "Учиться", review: "Повтор", cards: "Карточки", map: "Карта", field: "Руки", diagnostic: "T1" } as Record<string, string>)[id]}</button>)}
    </nav>
    <div className="sr-live" aria-live="polite">{notice}</div>
    {notice && <div className="notice"><span>{notice}</span><button onClick={() => setNotice("")}>Закрыть</button></div>}

    {tab === "today" && <Today state={state} onRun={runToday} onCards={() => setTab("cards")} onDiagnostic={() => setTab("diagnostic")} />}
    {tab === "learn" && !session && <Learn state={state} onLesson={openLesson} onPractice={openPractice} onMixed={openMixed} />}
    {tab === "learn" && session && <Session state={state} setState={setState} feedback={feedback} setFeedback={setFeedback} onExit={exitSession} />}
    {tab === "review" && <Review state={state} onReview={openReview} onRepair={openRepair} />}
    {tab === "cards" && <Cards state={state} setState={setState} />}
    {tab === "map" && <Map state={state} onLesson={openLesson} onPractice={openPractice} />}
    {tab === "field" && <Field state={state} setState={setState} />}
    {tab === "diagnostic" && <Diagnostic state={state} setState={setState} onExit={() => setTab("today")} />}
    {tab === "debug" && <Debug state={state} setState={setState} syncStatus={syncStatus} setSyncStatus={setSyncStatus} />}
  </main>;
}

function SyncBadge({ status }: { status: SyncStatus }) {
  const label = ({ loading: "загрузка", local: "локально", syncing: "синхронизация", synced: "синхронизировано", offline: "офлайн", conflict: "конфликт", error: "ошибка sync" } as Record<SyncStatus, string>)[status];
  return <span className={`sync sync-${status}`}>{label}</span>;
}

function Today({ state, onRun, onCards, onDiagnostic }: { state: LearnerState; onRun: () => void; onCards: () => void; onDiagnostic: () => void }) {
  const action = chooseTodayAction(state, [...MODULE_IDS]);
  const completed = modules.filter((module) => state.modules[module.id].contentCompleted).length;
  const working = modules.filter((module) => ["WORKING", "RETAINED", "FIELD_TEST_PENDING", "FIELD_VALIDATED"].includes(state.modules[module.id].state)).length;
  return <>
    <section className="hero compact-hero"><p className="eyebrow">СЕГОДНЯ · ОДНО ГЛАВНОЕ ДЕЙСТВИЕ</p><h1>Учись коротко.<br/><em>Переноси глубоко.</em></h1><p className="lede">Следующий шаг выбирается по реальным ошибкам, due review и порядку механизмов — не по красивому общему проценту.</p><div className="today-card"><p className="eyebrow">СЕЙЧАС</p><h2>{action.title}</h2><p>{action.reason}</p><button className="primary" onClick={onRun}>Начать <span>→</span></button></div></section>
    <section className="metrics"><div><b>{completed}/11</b><span>teaching layers пройдено</span></div><div><b>{working}</b><span>механизмов с working evidence</span></div><div><b>{dueReviewItems(state).length}</b><span>повторов/repair due</span></div></section>
    <section className="quick-grid"><article><p className="eyebrow">ПЕРСОНАЛИЗАЦИЯ</p><h3>T1 — дополнительный cold diagnostic</h3><p>Полезен для приоритизации, но не блокирует первый урок.</p><button className="textbutton" onClick={onDiagnostic}>Открыть T1 →</button></article><article><p className="eyebrow">ПЕРЕД ИГРОЙ</p><h3>90 секунд table cues</h3><p>Три due или слабые карточки без длинного урока.</p><button className="textbutton" onClick={onCards}>Быстрый warm-up →</button></article></section>
    <section className="integrity"><h2>Что система не утверждает</h2><p>Просмотр контента не равен mastery. Retention появляется после задержки, а field transfer — после review реальной руки.</p></section>
  </>;
}

function Learn({ state, onLesson, onPractice, onMixed }: { state: LearnerState; onLesson: (id: ModuleId) => void; onPractice: (id: ModuleId) => void; onMixed: () => void }) {
  return <section className="surface"><div className="section-head"><p className="eyebrow">УЧИТЬСЯ</p><h1>Один механизм.<br/><em>Десять ясных шагов.</em></h1><p>Cold check → теория → эвристики → tree → example → lab → changed nodes → explain-back → table card → delayed review.</p></div><div className="module-list">{modules.map((module) => {
    const progress = state.modules[module.id];
    const available = moduleAvailable(state, module.id, module.prerequisites);
    return <article key={module.id} className={!available ? "locked" : progress.state === "REPAIR_REQUIRED" ? "repair" : ""}><div><span className="module-code">{module.lcm}</span><span className={`state-pill state-${progress.state.toLowerCase()}`}>{moduleStateLabel(progress.state)}</span></div><h2>{module.title}</h2><p>{module.plainGoal}</p><p className="table-cue">{module.tableCue}</p><div className="module-actions"><button disabled={!available} className="primary" onClick={() => onLesson(module.id)}>{progress.contentCompleted ? "Повторить объяснение" : "Изучить"} <span>→</span></button><button disabled={!progress.contentCompleted} className="textbutton" onClick={() => onPractice(module.id)}>5 решений</button></div></article>;
  })}</div><button className="secondary wide" disabled={modules.filter((module) => state.modules[module.id].contentCompleted).length < 2} onClick={onMixed}>Mixed context-switch block</button></section>;
}

function Session({ state, setState, feedback, setFeedback, onExit }: { state: LearnerState; setState: (value: LearnerState) => void; feedback: Feedback | null; setFeedback: (value: Feedback | null) => void; onExit: () => void }) {
  const session = state.activeSession;
  if (!session) return null;
  return session.mode === "lesson"
    ? <LessonSession state={state} setState={setState} module={moduleById[session.moduleId]} feedback={feedback} setFeedback={setFeedback} onExit={onExit} />
    : <PracticeSession state={state} setState={setState} feedback={feedback} setFeedback={setFeedback} onExit={onExit} />;
}

function SessionHeader({ label, progress, onExit }: { label: string; progress: number; onExit?: () => void }) {
  return <div className="session-head"><div><span>{label}</span><div className="progress"><i style={{ width: `${progress}%` }} /></div></div>{onExit && <button className="quiet" onClick={onExit}>Выйти и сохранить</button>}</div>;
}

function LessonSession({ state, setState, module, feedback, setFeedback, onExit }: { state: LearnerState; setState: (value: LearnerState) => void; module: ModuleContent; feedback: Feedback | null; setFeedback: (value: Feedback | null) => void; onExit: () => void }) {
  const session = state.activeSession!;
  const setStep = (step: number, currentIndex = session.currentIndex) => setState(patchSession(state, { step, currentIndex, selectedActionId: null, selectedReasonId: null, itemStartedAt: new Date().toISOString() }));
  return <section className="session"><SessionHeader label={`${module.lcm} · УРОК`} progress={Math.round(((session.step + 1) / 10) * 100)} onExit={onExit} />
    {session.step === 0 && <><p className="eyebrow">1 · COLD CHECK</p><h2>Сначала твоя текущая модель</h2><p className="support">Один вопрос без подсказки. Это не экзамен и не mastery.</p><Decision state={state} setState={setState} drill={module.drills[0]} feedback={feedback} setFeedback={setFeedback} onContinue={() => setStep(1)} /></>}
    {session.step === 1 && <ContentStep eyebrow="2 · ПРОСТАЯ ТЕОРИЯ" title={module.plainGoal} paragraphs={module.theory} footer={module.scope} onNext={() => setStep(2)} />}
    {session.step === 2 && <ListStep eyebrow="3 · ТРИ ЭВРИСТИКИ" title={module.tableCue} items={module.heuristics} onNext={() => setStep(3)} />}
    {session.step === 3 && <ListStep eyebrow="4 · DECISION TREE" title="Порядок проверок" items={module.decisionTree} numbered onNext={() => setStep(4)} />}
    {session.step === 4 && <Worked module={module} onNext={() => setStep(5)} />}
    {session.step === 5 && <Lab module={module} onNext={() => setStep(6, 1)} />}
    {session.step === 6 && <><p className="eyebrow">7 · CHANGED NODE</p><h2>Тот же механизм, другие детали</h2><p className="support">Проверяется перенос, а не повтор фразы.</p><Decision state={state} setState={setState} drill={drillById[session.drillIds[session.currentIndex]]} feedback={feedback} setFeedback={setFeedback} onContinue={() => session.currentIndex + 1 < session.drillIds.length ? setStep(6, session.currentIndex + 1) : setStep(7)} /></>}
    {session.step === 7 && <ExplainBack state={state} setState={setState} module={module} onNext={() => setStep(8)} />}
    {session.step === 8 && <TableCard module={module} onNext={() => setStep(9)} />}
    {session.step === 9 && <section className="summary"><p className="eyebrow">10 · УРОК ЗАВЕРШЁН</p><h1>Механизм введён.<br/><em>Не объявлен mastered.</em></h1><p className="lede">Дальше — practice и delayed review.</p><button className="primary" onClick={() => setState(completeLesson(state, module.id))}>Сохранить и вернуться <span>→</span></button></section>}
  </section>;
}

function ContentStep({ eyebrow, title, paragraphs, footer, onNext }: { eyebrow: string; title: string; paragraphs: string[]; footer: string; onNext: () => void }) {
  return <><p className="eyebrow">{eyebrow}</p><h2>{title}</h2><div className="theory-stack">{paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div><p className="assumption-strip">Граница: {footer}</p><button className="primary" onClick={onNext}>Дальше <span>→</span></button></>;
}

function ListStep({ eyebrow, title, items, numbered = false, onNext }: { eyebrow: string; title: string; items: string[]; numbered?: boolean; onNext: () => void }) {
  const Tag = numbered ? "ol" : "ul";
  return <><p className="eyebrow">{eyebrow}</p><h2>{title}</h2><Tag className="learning-list">{items.map((item) => <li key={item}>{item}</li>)}</Tag><button className="primary" onClick={onNext}>Дальше <span>→</span></button></>;
}

function Worked({ module, onNext }: { module: ModuleContent; onNext: () => void }) {
  return <><p className="eyebrow">5 · WORKED EXAMPLE</p><h2>{module.workedExample.situation}</h2><ol className="learning-list">{module.workedExample.steps.map((step) => <li key={step}>{step}</li>)}</ol><div className="answer-panel"><b>Вывод</b><p>{module.workedExample.answer}</p></div><div className="counterexample"><b>Граница правила</b><p>{module.counterexample}</p></div><button className="primary" onClick={onNext}>Открыть lab <span>→</span></button></>;
}

function Lab({ module, onNext }: { module: ModuleContent; onNext: () => void }) {
  const lab = module.lab;
  const [pot, setPot] = useState(lab.type === "spr" ? lab.initialPot : 0);
  const [stack, setStack] = useState(lab.type === "spr" ? lab.stack : 0);
  const [bet, setBet] = useState(lab.type === "spr" ? lab.bet : 0);
  const spr = lab.type === "spr" && pot + bet * 2 > 0 ? Math.max(0, (stack - bet) / (pot + bet * 2)) : 0;
  return <><p className="eyebrow">6 · LAB</p><h2>{lab.title}</h2><p className="support">{lab.description}</p>{lab.type === "spr" ? <div className="spr-lab"><label>Банк до ставки<input type="number" value={pot} onChange={(event) => setPot(Number(event.target.value))} /></label><label>Оставшийся стек<input type="number" value={stack} onChange={(event) => setStack(Number(event.target.value))} /></label><label>Ставка / call<input type="number" value={bet} onChange={(event) => setBet(Number(event.target.value))} /></label><div className="spr-result"><span>SPR после call</span><b>{spr.toFixed(2)}</b><small>({stack}−{bet}) / ({pot}+2×{bet})</small></div></div> : <div className="compare-lab"><article><b>{lab.leftTitle}</b><p>{lab.leftText}</p></article><article><b>{lab.rightTitle}</b><p>{lab.rightText}</p></article></div>}<button className="primary" onClick={onNext}>Changed nodes <span>→</span></button></>;
}

function ExplainBack({ state, setState, module, onNext }: { state: LearnerState; setState: (value: LearnerState) => void; module: ModuleContent; onNext: () => void }) {
  const value = state.activeSession?.explainBack ?? "";
  return <><p className="eyebrow">8 · EXPLAIN-BACK</p><h2>{module.explainBackPrompt}</h2><textarea className="large-input" value={value} onChange={(event) => setState(patchSession(state, { explainBack: event.target.value }))} placeholder="2–4 предложения своими словами…"/><button className="primary" disabled={value.trim().length < 30} onClick={onNext}>Зафиксировать объяснение <span>→</span></button></>;
}

function TableCard({ module, onNext }: { module: ModuleContent; onNext: () => void }) {
  return <><p className="eyebrow">9 · TABLE CARD</p><h2>{module.tableCue}</h2><div className="table-card">{module.tableCard.map((item, index) => <div key={item}><span>{String(index + 1).padStart(2, "0")}</span><b>{item}</b></div>)}</div><div className="glossary">{module.glossary.map((item) => <p key={item.term}><b>{item.term}</b>{item.meaning}</p>)}</div><button className="primary" onClick={onNext}>Завершить урок <span>→</span></button></>;
}

function PracticeSession({ state, setState, feedback, setFeedback, onExit }: { state: LearnerState; setState: (value: LearnerState) => void; feedback: Feedback | null; setFeedback: (value: Feedback | null) => void; onExit: () => void }) {
  const session = state.activeSession!;
  const drill = drillById[session.drillIds[session.currentIndex]];
  const advance = () => {
    if (session.currentIndex + 1 < session.drillIds.length) setState(patchSession(state, { currentIndex: session.currentIndex + 1, selectedActionId: null, selectedReasonId: null, confidence: 65, itemStartedAt: new Date().toISOString() }));
    else setState(completeBlock(state, session.mode === "practice" || session.mode === "repair" ? session.moduleId : undefined));
    setFeedback(null);
  };
  return <section className="session"><SessionHeader label={`${session.mode.toUpperCase()} · ${session.currentIndex + 1}/${session.drillIds.length}`} progress={Math.round(((session.currentIndex + 1) / session.drillIds.length) * 100)} onExit={onExit} /><Decision state={state} setState={setState} drill={drill} feedback={feedback} setFeedback={setFeedback} onContinue={advance} /><div className="mini-results">{(["A", "B", "C", "D"] as ResponseClass[]).map((kind) => <span key={kind}>{kind}: {state.interactions.filter((item) => Date.parse(item.at) >= Date.parse(session.startedAt) && item.responseClass === kind).length}</span>)}</div></section>;
}

function Decision({ state, setState, drill, feedback, setFeedback, onContinue }: { state: LearnerState; setState: (value: LearnerState) => void; drill: Drill; feedback: Feedback | null; setFeedback: (value: Feedback | null) => void; onContinue: () => void }) {
  const session = state.activeSession!;
  const actionOptions = useMemo(() => shuffle(drill.actionOptions, `${session.startedAt}:${drill.id}:action`), [drill.actionOptions, drill.id, session.startedAt]);
  const reasonOptions = useMemo(() => shuffle(drill.reasonOptions, `${session.startedAt}:${drill.id}:reason`), [drill.reasonOptions, drill.id, session.startedAt]);
  function lock() {
    if (!session.selectedActionId || !session.selectedReasonId) return;
    const actionOk = session.selectedActionId === drill.correctActionId;
    const reasonOk = session.selectedReasonId === drill.correctReasonId;
    setState(recordDecision(state, { moduleId: drill.moduleId, drillId: drill.id, nodeKey: drill.nodeKey, variantGroup: drill.variantGroup, mode: session.mode, actionOk, reasonOk, confidence: session.confidence, elapsedSeconds: Math.max(1, Math.round((Date.now() - Date.parse(session.itemStartedAt)) / 1000)), targetSeconds: drill.targetSeconds, isBoundary: drill.kind === "boundary" }));
    setFeedback({ drill, actionOk, reasonOk, responseClass: classifyResponse(actionOk, reasonOk) });
  }
  if (feedback) return <div className="feedback-view" aria-live="polite"><p className="eyebrow">DECISION REVIEW · CLASS {feedback.responseClass}</p><h2>{classCopy(feedback.responseClass)}</h2><div className="answer-panel"><b>Рабочее действие</b><p>{feedback.drill.actionOptions.find((item) => item.id === feedback.drill.correctActionId)?.text}</p><b>Почему</b><p>{feedback.drill.reasonOptions.find((item) => item.id === feedback.drill.correctReasonId)?.text}</p></div><p className="support">{feedback.drill.explanation}</p><p className="assumption-strip">Assumptions: {feedback.drill.assumptions.join(" · ")}</p><button className="primary" onClick={onContinue}>Продолжить <span>→</span></button></div>;
  return <div className="decision-card"><p className="eyebrow">{drill.moduleId.toUpperCase()} · {drill.kind}</p><p className="cue">{drill.cue}</p><h2>{drill.question}</h2><p className="assumption-strip">Условия: {drill.assumptions.join(" · ")}</p><OptionGroup legend="Выбери действие" options={actionOptions} selected={session.selectedActionId} onSelect={(selectedActionId) => setState(patchSession(state, { selectedActionId }))} /><OptionGroup legend="Выбери причину" options={reasonOptions} selected={session.selectedReasonId} onSelect={(selectedReasonId) => setState(patchSession(state, { selectedReasonId }))} /><label className="confidence">Уверенность <b>{session.confidence}%</b><input type="range" min="0" max="100" value={session.confidence} onChange={(event) => setState(patchSession(state, { confidence: Number(event.target.value) }))} /></label><button className="primary" disabled={!session.selectedActionId || !session.selectedReasonId} onClick={lock}>Зафиксировать решение <span>→</span></button></div>;
}

function OptionGroup({ legend, options, selected, onSelect }: { legend: string; options: Option[]; selected: string | null; onSelect: (id: string) => void }) {
  return <fieldset className="answer-set"><legend>{legend}</legend>{options.map((option) => <button type="button" key={option.id} aria-pressed={selected === option.id} className={selected === option.id ? "selected" : ""} onClick={() => onSelect(option.id)}>{option.text}</button>)}</fieldset>;
}

function Review({ state, onReview, onRepair }: { state: LearnerState; onReview: () => void; onRepair: (id: ModuleId) => void }) {
  const due = dueReviewItems(state);
  return <section className="surface"><div className="section-head"><p className="eyebrow">ПОВТОР И REPAIR</p><h1>Позже.<br/><em>На похожем, но новом узле.</em></h1></div>{due.length ? <div className="queue">{due.map((item) => <article key={item.id}><span className={`kind kind-${item.kind}`}>{item.kind}</span><h3>{moduleById[item.moduleId].title}</h3><p>Family: {item.variantGroup}</p><button className="primary" onClick={() => item.kind === "repair" ? onRepair(item.moduleId) : onReview()}>Начать <span>→</span></button></article>)}</div> : <div className="empty-state"><h2>Сейчас ничего не due.</h2><p>После урока и practice появятся skill-specific items.</p></div>}</section>;
}

function Cards({ state, setState }: { state: LearnerState; setState: (value: LearnerState) => void }) {
  const [mode, setMode] = useState<"warmup" | "due" | "all">("warmup");
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const due = allCards.filter((card) => !state.cards[card.id] || Date.parse(state.cards[card.id].dueAt) <= Date.now());
  const cards = mode === "due" ? due : mode === "warmup" ? (due.length ? due : allCards).slice(0, 3) : allCards;
  const card = cards[index];
  useEffect(() => { setIndex(0); setRevealed(false); }, [mode]);
  if (!card) return <section className="surface"><div className="empty-state"><h2>Все карточки повторены.</h2></div></section>;
  const apply = (grade: 0 | 1 | 2 | 3) => { setState(gradeCard(state, card.id, grade)); setIndex(index + 1 >= cards.length ? 0 : index + 1); setRevealed(false); };
  return <section className="session"><div className="mode-switch"><button aria-pressed={mode === "warmup"} onClick={() => setMode("warmup")}>90 секунд</button><button aria-pressed={mode === "due"} onClick={() => setMode("due")}>Due only</button><button aria-pressed={mode === "all"} onClick={() => setMode("all")}>Все</button></div><p className="eyebrow">ACTIVE RECALL · {index + 1}/{cards.length}</p><h2>{card.front}</h2><p className="module-code">{moduleById[card.moduleId].lcm} · {card.kind}</p>{revealed ? <><div className="card-answer">{card.back}</div><div className="grade-row"><button onClick={() => apply(0)}>Не вспомнил</button><button onClick={() => apply(1)}>Трудно</button><button onClick={() => apply(2)}>Нормально</button><button className="primary" onClick={() => apply(3)}>Легко</button></div></> : <button className="primary" onClick={() => setRevealed(true)}>Показать ответ <span>→</span></button>}<p className="support">Карточки не повышают retention mastery сами по себе.</p></section>;
}

function Map({ state, onLesson, onPractice }: { state: LearnerState; onLesson: (id: ModuleId) => void; onPractice: (id: ModuleId) => void }) {
  return <section className="surface"><div className="section-head"><p className="eyebrow">КАРТА НАВЫКОВ</p><h1>Evidence по механизмам,<br/><em>не галочки курса.</em></h1></div><div className="map-grid">{modules.map((module) => <article key={module.id}><div className="map-title"><span>{module.lcm}</span><b>{moduleStateLabel(state.modules[module.id].state)}</b></div><h3>{module.shortTitle}</h3><div className="dimension-grid">{DIMENSION_KEYS.map((key) => { const cell = state.modules[module.id].evidence[key]; const score = evidencePercent(cell); return <div key={key}><span>{dimensionLabel(key)}</span><b>{score === null ? "—" : `${score}%`}</b><small>{cell.exposures} exp</small></div>; })}</div><div className="module-actions"><button className="textbutton" onClick={() => onLesson(module.id)}>Теория</button><button className="textbutton" disabled={!state.modules[module.id].contentCompleted} onClick={() => onPractice(module.id)}>Practice</button></div></article>)}</div></section>;
}

function Field({ state, setState }: { state: LearnerState; setState: (value: LearnerState) => void }) {
  const [moduleId, setModuleId] = useState<ModuleId>("geometry");
  const [cue, setCue] = useState("");
  const [action, setAction] = useState("");
  const [reason, setReason] = useState("");
  const [cueBeforeAction, setCueBeforeAction] = useState(true);
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const save = () => { if (cue.trim() && action.trim() && reason.trim()) { setState(addFieldNote(state, { moduleId, cue: cue.trim(), action: action.trim(), reason: reason.trim(), cueBeforeAction })); setCue(""); setAction(""); setReason(""); } };
  return <section className="surface"><div className="section-head"><p className="eyebrow">РЕАЛЬНЫЕ РУКИ</p><h1>Сначала capture.<br/><em>Потом review.</em></h1></div><div className="field-layout"><div className="field-form"><label>Механизм<select value={moduleId} onChange={(event) => setModuleId(event.target.value as ModuleId)}>{modules.map((module) => <option key={module.id} value={module.id}>{module.lcm} · {module.shortTitle}</option>)}</select></label><label>Что заметил до действия?<textarea value={cue} onChange={(event) => setCue(event.target.value)} /></label><label>Что сделал?<textarea value={action} onChange={(event) => setAction(event.target.value)} /></label><label>Почему?<textarea value={reason} onChange={(event) => setReason(event.target.value)} /></label><label className="check"><input type="checkbox" checked={cueBeforeAction} onChange={(event) => setCueBeforeAction(event.target.checked)} /> Cue был замечен до действия</label><button className="primary" disabled={!cue.trim() || !action.trim() || !reason.trim()} onClick={save}>Сохранить pending note <span>→</span></button></div><div className="field-list">{[...state.fieldNotes].reverse().map((note) => { const reviewText = reviewNotes[note.id] ?? ""; return <article key={note.id}><span className={`kind kind-${note.status.toLowerCase()}`}>{note.status}</span><h3>{moduleById[note.moduleId].shortTitle}</h3><p><b>Cue:</b> {note.cue}</p><p><b>Action:</b> {note.action}</p><p><b>Reason:</b> {note.reason}</p>{note.status === "PENDING_REVIEW" ? <><textarea placeholder="Проверка reasoning…" value={reviewText} onChange={(event) => setReviewNotes({ ...reviewNotes, [note.id]: event.target.value })} /><div className="review-actions"><button onClick={() => setState(reviewFieldNote(state, note.id, "INSUFFICIENT", reviewText))}>Недостаточно</button><button disabled={!reviewText.trim()} onClick={() => setState(reviewFieldNote(state, note.id, "REVIEWED_REPAIR", reviewText))}>Нужен repair</button><button className="primary" disabled={!note.cueBeforeAction || !reviewText.trim()} onClick={() => setState(reviewFieldNote(state, note.id, "REVIEWED_VALID", reviewText))}>Valid</button></div></> : <p className="support">Review: {note.evaluatorNote || "без комментария"}</p>}</article>; })}</div></div></section>;
}

function Diagnostic({ state, setState, onExit }: { state: LearnerState; setState: (value: LearnerState) => void; onExit: () => void }) {
  const diagnostic = state.diagnostic;
  const item = diagnosticT1[diagnostic.responses.length];
  const baselineEligible = state.interactions.length === 0 && modules.every((module) => !state.modules[module.id].contentCompleted);
  const [answer, setAnswer] = useState("");
  const [reasoning, setReasoning] = useState("");
  const [confidence, setConfidence] = useState(65);
  const [startedAt, setStartedAt] = useState(Date.now());
  const begin = () => setState(mutate(state, (next) => { next.diagnostic.status = "IN_PROGRESS"; next.diagnostic.startedAt ??= new Date().toISOString(); }));
  const submit = () => {
    if (!item || !answer.trim() || !reasoning.trim()) return;
    const response: DiagnosticRawResponse = { item_id: item.id, answer: answer.trim(), reasoning: reasoning.trim(), confidence, time_seconds: Math.max(1, Math.round((Date.now() - startedAt) / 1000)) };
    setState(mutate(state, (next) => { next.diagnostic.responses.push(response); const final = next.diagnostic.responses.length === diagnosticT1.length; next.diagnostic.status = final ? "AWAITING_REVIEW" : "IN_PROGRESS"; if (final) next.diagnostic.submittedAt = new Date().toISOString(); }));
    setAnswer(""); setReasoning(""); setConfidence(65); setStartedAt(Date.now());
  };
  async function importEvaluated(file: File) {
    try {
      const payload = JSON.parse(await file.text()) as Record<string, unknown>;
      const lcm: Record<string, ModuleId> = { "LCM-01": "geometry", "LCM-02": "preflop", "LCM-03": "blinds", "LCM-04": "filtering", "LCM-05": "shape", "LCM-06": "aggression", "LCM-07": "ancestry", "LCM-08": "multiway", "LCM-09": "river", "LCM-10": "evidence", "LCM-11": "transfer" };
      const priority: ModuleId[] = [];
      if (Array.isArray(payload.priority_modules)) for (const value of payload.priority_modules) if (typeof value === "string" && MODULE_IDS.includes(value as ModuleId)) priority.push(value as ModuleId);
      if (payload.module_summary && typeof payload.module_summary === "object") for (const key of Object.keys(payload.module_summary)) if (lcm[key] && !priority.includes(lcm[key])) priority.push(lcm[key]);
      if (!priority.length) throw new Error("В evaluated record нет понятного module route.");
      setState(mutate(state, (next) => { next.diagnostic.status = "ROUTED"; next.diagnostic.priorityModules = priority.slice(0, 2); next.diagnostic.importedAt = new Date().toISOString(); for (const moduleId of next.diagnostic.priorityModules) { next.modules[moduleId].state = "REPAIR_REQUIRED"; next.modules[moduleId].highConfidenceError = true; } }));
    } catch (error) { alert(error instanceof Error ? error.message : "Не удалось импортировать evaluated record."); }
  }
  if (diagnostic.status === "NOT_STARTED") return <section className="surface"><div className="section-head"><p className="eyebrow">{baselineEligible ? "T1 · COLD BASELINE AVAILABLE" : "T1 · POST-LEARNING DIAGNOSTIC"}</p><h1>Измерить текущую модель.<br/><em>Не блокировать обучение.</em></h1><p>{baselineEligible ? "10 cold free-text decisions. Feedback скрыт до конца." : "Обучение уже началось: результат полезен для маршрута, но не является исходным cold baseline."}</p><button className="primary" onClick={begin}>Начать T1 <span>→</span></button></div></section>;
  if (["AWAITING_REVIEW", "SCORED", "ROUTED"].includes(diagnostic.status)) return <section className="surface"><div className="section-head"><p className="eyebrow">T1 · {diagnostic.status}</p><h1>{diagnostic.responses.length}/10 ответов сохранено.</h1><p>Raw record не содержит evaluation и не притворяется автоматическим scorer.</p><div className="button-row"><button className="primary" onClick={() => downloadJson("live-cash-t1-raw.json", { schema_version: "raw-0.1", learner_id: "current_learner", tranche_id: "T1", measurement_context: baselineEligible ? "COLD_BASELINE" : "POST_LEARNING_DIAGNOSTIC", submitted_at: diagnostic.submittedAt, responses: diagnostic.responses })}>Скачать raw record <span>↓</span></button><label className="file-button">Импорт evaluated result<input type="file" accept="application/json" onChange={(event) => { const file = event.target.files?.[0]; if (file) void importEvaluated(file); }} /></label></div>{diagnostic.priorityModules.map((moduleId) => <p key={moduleId} className="priority-box">{moduleById[moduleId].lcm} · {moduleById[moduleId].title}</p>)}</div></section>;
  if (!item) return null;
  return <section className="session"><SessionHeader label={`T1 · ${diagnostic.responses.length + 1}/10`} progress={Math.round(((diagnostic.responses.length + 1) / 10) * 100)} onExit={onExit} /><p className="eyebrow">{item.id} · {item.title}</p><p className="support">{baselineEligible ? "Cold baseline: отвечай из текущего процесса, не ищи charts и answer keys." : "Post-learning diagnostic: используй текущую модель; результат не будет называться исходным baseline."}</p><h2>{item.prompt}</h2><label className="diagnostic-input">Action / direction<textarea value={answer} onChange={(event) => setAnswer(event.target.value)} /></label><label className="diagnostic-input">Причина одним предложением<textarea value={reasoning} onChange={(event) => setReasoning(event.target.value)} /></label><label className="confidence">Уверенность <b>{confidence}%</b><input type="range" min="0" max="100" value={confidence} onChange={(event) => setConfidence(Number(event.target.value))} /></label><button className="primary" disabled={!answer.trim() || !reasoning.trim()} onClick={submit}>Зафиксировать cold response <span>→</span></button></section>;
}

function Debug({ state, setState, syncStatus, setSyncStatus }: { state: LearnerState; setState: (value: LearnerState) => void; syncStatus: SyncStatus; setSyncStatus: (value: SyncStatus) => void }) {
  async function deleteCloud() { try { const response = await fetch("/api/state", { method: "DELETE" }); setSyncStatus(response.ok ? "synced" : response.status === 401 ? "local" : "error"); } catch { setSyncStatus("offline"); } }
  async function importState(file: File) { try { const migrated = migrateLearnerState(JSON.parse(await file.text())); if (!validateLearnerState(migrated)) throw new Error(); setState(migrated); } catch { alert("Не удалось импортировать learner state."); } }
  function reset() { if (confirm("Удалить локальный learner state?")) { localStorage.removeItem(STORAGE_KEY); setState(emptyLearnerState()); } }
  return <section className="surface"><div className="section-head"><p className="eyebrow">SYSTEM / OWNER VIEW</p><h1>Прозрачное состояние.</h1></div><div className="debug-grid"><div><span>App</span><b>{APP_VERSION}</b></div><div><span>State schema</span><b>{STATE_SCHEMA_VERSION}</b></div><div><span>Content</span><b>{CONTENT_VERSION}</b></div><div><span>Revision</span><b>{state.revision}</b></div><div><span>Sync</span><b>{syncStatus}</b></div><div><span>Review queue</span><b>{state.reviewQueue.length}</b></div><div><span>Interactions</span><b>{state.interactions.length}</b></div><div><span>Field pending</span><b>{state.fieldNotes.filter((note) => note.status === "PENDING_REVIEW").length}</b></div></div><div className="button-row"><button className="secondary" onClick={() => downloadJson("live-cash-progress.json", state)}>Экспорт progress</button><label className="file-button">Импорт progress<input type="file" accept="application/json" onChange={(event) => { const file = event.target.files?.[0]; if (file) void importState(file); }} /></label><button className="secondary" onClick={() => void deleteCloud()}>Удалить cloud state</button><button className="danger" onClick={reset}>Сбросить локально</button></div></section>;
}
