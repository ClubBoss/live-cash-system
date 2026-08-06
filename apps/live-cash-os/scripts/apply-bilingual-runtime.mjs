import { readFile, writeFile } from "node:fs/promises";

const componentPath = new URL("../components/LiveCashApp.tsx", import.meta.url);
const cssPath = new URL("../app/globals.css", import.meta.url);
let source = await readFile(componentPath, "utf8");

function replaceOnce(from, to, label) {
  if (!source.includes(from)) throw new Error(`Missing replacement target: ${label}`);
  source = source.replace(from, to);
}

function replaceBlock(start, end, replacement, label) {
  const startIndex = source.indexOf(start);
  const endIndex = source.indexOf(end, startIndex + start.length);
  if (startIndex < 0 || endIndex < 0) throw new Error(`Missing block: ${label}`);
  source = `${source.slice(0, startIndex)}${replacement}\n\n${source.slice(endIndex)}`;
}

replaceOnce(
  'import { useEffect, useMemo, useRef, useState } from "react";',
  'import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";',
  "React imports",
);
replaceOnce(
  'import { diagnosticT1 } from "../content/diagnostic";\nimport { allCards, drillById, moduleById, modules } from "../content/modules";',
  'import { moduleById as sourceModuleById, modules as sourceModules } from "../content/modules";\nimport { getDiagnostic } from "../content/i18n/diagnostic";\nimport { getLocalizedContent, type LocalizedContent } from "../content/i18n/runtime";\nimport { ui, type Locale, type UiKey } from "../content/i18n/ui";',
  "content imports",
);

replaceOnce(
  'const STORAGE_KEY = "live-cash-os:learner-state";',
  'const STORAGE_KEY = "live-cash-os:learner-state";\nconst LOCALE_KEY = "live-cash-os:locale";',
  "locale storage key",
);

replaceOnce(
  'type Feedback = { drill: Drill; actionOk: boolean; reasonOk: boolean; responseClass: ResponseClass };',
  `type Feedback = { drill: Drill; actionOk: boolean; reasonOk: boolean; responseClass: ResponseClass };

type I18nValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  content: LocalizedContent;
  t: (key: UiKey) => string;
};

const I18nContext = createContext<I18nValue | null>(null);
function useI18n(): I18nValue {
  const value = useContext(I18nContext);
  if (!value) throw new Error("Live Cash OS i18n context is missing");
  return value;
}

function moduleStateLabel(value: string, t: I18nValue["t"]): string {
  const key = ({
    UNEXPOSED: "unexposed",
    INTRODUCED: "introduced",
    FRAGILE: "fragile",
    WORKING: "working",
    RETAINED: "retained",
    FIELD_TEST_PENDING: "fieldPending",
    FIELD_VALIDATED: "fieldValidated",
    REPAIR_REQUIRED: "repairRequired",
  } as Record<string, UiKey>)[value];
  return key ? t(key) : value;
}

function dimensionLabel(value: string, t: I18nValue["t"]): string {
  const key = ({
    node_recognition: "dimNode",
    mechanism_explanation: "dimMechanism",
    action_selection: "dimAction",
    boundary_control: "dimBoundary",
    speed: "dimSpeed",
    confidence_calibration: "dimCalibration",
    variant_transfer: "dimVariant",
    retention: "dimRetention",
    field_transfer: "dimField",
  } as Record<string, UiKey>)[value];
  return key ? t(key) : value;
}

function classCopy(value: ResponseClass, t: I18nValue["t"]): string {
  return t(({ A: "classA", B: "classB", C: "classC", D: "classD", E: "classE", U: "classU" } as Record<ResponseClass, UiKey>)[value]);
}

function fieldStatusLabel(value: string, locale: Locale): string {
  const labels: Record<Locale, Record<string, string>> = {
    ru: { PENDING_REVIEW: "ждёт разбора", REVIEWED_VALID: "подтверждено", REVIEWED_REPAIR: "нужно исправить", INSUFFICIENT: "недостаточно данных" },
    en: { PENDING_REVIEW: "pending review", REVIEWED_VALID: "validated", REVIEWED_REPAIR: "needs repair", INSUFFICIENT: "insufficient" },
  };
  return labels[locale][value] ?? value;
}

function todayActionCopy(kind: string, locale: Locale): { title: string; reason: string } {
  const copy: Record<Locale, Record<string, { title: string; reason: string }>> = {
    ru: {
      resume: { title: "Продолжить текущую сессию", reason: "Вернёмся ровно к месту, на котором ты остановился." },
      review: { title: "Проверить, что навык сохранился", reason: "Пришло время повторить знакомую идею на немного другой ситуации." },
      repair: { title: "Разобрать свежую ошибку", reason: "Сначала исправим конкретный сбой, затем продолжим курс." },
      lesson: { title: "Изучить следующую идею", reason: "Одна новая тема, затем практика и повторение." },
      diagnostic: { title: "Настроить маршрут через T1", reason: "Дополнительная диагностика поможет выбрать приоритеты." },
      field: { title: "Разобрать реальную руку", reason: "Следующий рост требует примеров из настоящей игры." },
    },
    en: {
      resume: { title: "Resume the current session", reason: "Continue from the exact point where you stopped." },
      review: { title: "Check that the skill held up", reason: "Review the same mechanism on a slightly different spot." },
      repair: { title: "Repair the latest mistake", reason: "Fix the specific breakdown before adding more material." },
      lesson: { title: "Learn the next mechanism", reason: "One new idea, followed by practice and delayed review." },
      diagnostic: { title: "Personalise the route with T1", reason: "The optional diagnostic can help set priorities." },
      field: { title: "Review a real hand", reason: "Further progress now needs evidence from actual play." },
    },
  };
  return copy[locale][kind] ?? copy[locale].lesson;
}`,
  "i18n context and labels",
);

const oldStateHelpersStart = 'function moduleStateLabel(value: string): string {';
const oldStateHelpersEnd = 'function downloadJson(filename: string, value: unknown) {';
const helperStart = source.indexOf(oldStateHelpersStart);
if (helperStart >= 0) {
  const helperEnd = source.indexOf(oldStateHelpersEnd, helperStart);
  if (helperEnd < 0) throw new Error("Could not remove legacy label helpers");
  source = `${source.slice(0, helperStart)}${source.slice(helperEnd)}`;
}

source = source
  .replaceAll("moduleById[moduleId]", "sourceModuleById[moduleId]")
  .replaceAll("moduleById[item.moduleId]", "sourceModuleById[item.moduleId]")
  .replaceAll("const eligible = modules.filter", "const eligible = sourceModules.filter")
  .replaceAll("[moduleById.geometry]", "[sourceModuleById.geometry]");

const application = `export default function LiveCashApp() {
  const [state, setState] = useState<LearnerState>(emptyLearnerState);
  const [tab, setTab] = useState<Tab>("today");
  const [ready, setReady] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("loading");
  const [notice, setNotice] = useState("");
  const [locale, setLocale] = useState<Locale>("ru");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const content = useMemo(() => getLocalizedContent(locale), [locale]);
  const t = useMemo(() => (key: UiKey) => ui(locale, key), [locale]);

  useEffect(() => {
    async function restore() {
      const savedLocale = localStorage.getItem(LOCALE_KEY);
      if (savedLocale === "ru" || savedLocale === "en") setLocale(savedLocale);
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
    localStorage.setItem(LOCALE_KEY, locale);
    document.documentElement.lang = locale;
  }, [locale]);

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
    const module = sourceModuleById[moduleId];
    if (!moduleAvailable(state, moduleId, module.prerequisites)) {
      setNotice(locale === "ru" ? "Сначала закончи объяснение предыдущей темы. Это порядок курса, а не оценка мастерства." : "Finish the previous explanation first. This is curriculum order, not a mastery gate.");
      return;
    }
    const changed = module.drills.filter((drill) => drill.kind === "changed" || drill.kind === "boundary").slice(0, 2);
    setState(startSession(state, "lesson", moduleId, [module.drills[0].id, ...changed.map((drill) => drill.id)]));
    setFeedback(null);
    setTab("learn");
  }
  function openPractice(moduleId: ModuleId) {
    setState(startSession(state, "practice", moduleId, sourceModuleById[moduleId].drills.map((drill) => drill.id)));
    setFeedback(null); setTab("learn");
  }
  function openRepair(moduleId: ModuleId) {
    setState(startSession(state, "repair", moduleId, selectRepair(state, moduleId).map((drill) => drill.id)));
    setFeedback(null); setTab("learn");
  }
  function openReview() {
    const drills = selectReview(state);
    if (!drills.length) { setTab("review"); return; }
    setState(startSession(state, "review", drills[0].moduleId, drills.map((drill) => drill.id)));
    setFeedback(null); setTab("learn");
  }
  function openMixed() {
    const drills = selectMixed(state);
    setState(startSession(state, "mixed", drills[0].moduleId, drills.map((drill) => drill.id)));
    setFeedback(null); setTab("learn");
  }
  function runToday() {
    if (today.kind === "resume") { setTab("learn"); return; }
    if (today.kind === "review") { openReview(); return; }
    if (today.kind === "repair" && today.moduleId) { openRepair(today.moduleId); return; }
    if (today.kind === "lesson" && today.moduleId) { openLesson(today.moduleId); return; }
    setTab(today.kind === "diagnostic" ? "diagnostic" : "field");
  }
  function exitSession() { setState(saveActiveSession(state, null)); setFeedback(null); setTab("today"); }

  const context = { locale, setLocale, content, t } satisfies I18nValue;
  if (!ready) return <main className="loading"><p>{t("loading")}</p></main>;

  return <I18nContext.Provider value={context}><main>
    <header className="topbar">
      <button className="brand" onClick={() => setTab("today")}>LIVE CASH OS</button>
      <div className="topmeta"><span>v{APP_VERSION}</span><SyncBadge status={syncStatus} /><div className="language-switch" role="group" aria-label={t("language")}><button aria-pressed={locale === "ru"} onClick={() => setLocale("ru")}>RU</button><button aria-pressed={locale === "en"} onClick={() => setLocale("en")}>EN</button></div><button className="quiet" onClick={() => setTab("debug")}>{t("system")}</button></div>
    </header>
    <nav className="tabs" aria-label={t("navLabel")}>
      {(["today", "learn", "review", "cards", "map", "field", "diagnostic"] as Tab[]).map((id) => <button key={id} aria-current={tab === id ? "page" : undefined} onClick={() => setTab(id)}>{({ today: t("today"), learn: t("learn"), review: t("review"), cards: t("cards"), map: t("map"), field: t("field"), diagnostic: "T1" } as Record<string, string>)[id]}</button>)}
    </nav>
    <div className="sr-live" aria-live="polite">{notice}</div>
    {notice && <div className="notice"><span>{notice}</span><button onClick={() => setNotice("")}>{t("close")}</button></div>}
    {tab === "today" && <Today state={state} actionKind={today.kind} onRun={runToday} onCards={() => setTab("cards")} onDiagnostic={() => setTab("diagnostic")} />}
    {tab === "learn" && !session && <Learn state={state} onLesson={openLesson} onPractice={openPractice} onMixed={openMixed} />}
    {tab === "learn" && session && <Session state={state} setState={setState} feedback={feedback} setFeedback={setFeedback} onExit={exitSession} />}
    {tab === "review" && <Review state={state} onReview={openReview} onRepair={openRepair} />}
    {tab === "cards" && <Cards state={state} setState={setState} />}
    {tab === "map" && <Map state={state} onLesson={openLesson} onPractice={openPractice} />}
    {tab === "field" && <Field state={state} setState={setState} />}
    {tab === "diagnostic" && <Diagnostic state={state} setState={setState} onExit={() => setTab("today")} />}
    {tab === "debug" && <Debug state={state} setState={setState} syncStatus={syncStatus} setSyncStatus={setSyncStatus} />}
  </main></I18nContext.Provider>;
}`;

replaceBlock("export default function LiveCashApp() {", "function SyncBadge", application, "application shell");

const tail = `function SyncBadge({ status }: { status: SyncStatus }) {
  const { t } = useI18n();
  const key = ({ loading: "syncLoading", local: "syncLocal", syncing: "syncSyncing", synced: "syncSynced", offline: "syncOffline", conflict: "syncConflict", error: "syncError" } as Record<SyncStatus, UiKey>)[status];
  return <span className={\`sync sync-\${status}\`}>{t(key)}</span>;
}

function Today({ state, actionKind, onRun, onCards, onDiagnostic }: { state: LearnerState; actionKind: string; onRun: () => void; onCards: () => void; onDiagnostic: () => void }) {
  const { content, locale, t } = useI18n();
  const completed = content.modules.filter((module) => state.modules[module.id].contentCompleted).length;
  const working = content.modules.filter((module) => ["WORKING", "RETAINED", "FIELD_TEST_PENDING", "FIELD_VALIDATED"].includes(state.modules[module.id].state)).length;
  const action = todayActionCopy(actionKind, locale);
  return <><section className="hero compact-hero"><p className="eyebrow">{t("todayEyebrow")}</p><h1>{t("heroLine1")}<br/><em>{t("heroLine2")}</em></h1><p className="lede">{t("heroLead")}</p><div className="today-card"><p className="eyebrow">{t("now")}</p><h2>{action.title}</h2><p>{action.reason}</p><button className="primary" onClick={onRun}>{t("start")} <span>→</span></button></div></section><section className="metrics"><div><b>{completed}/11</b><span>{t("lessonsDone")}</span></div><div><b>{working}</b><span>{t("workingSkills")}</span></div><div><b>{dueReviewItems(state).length}</b><span>{t("reviewsDue")}</span></div></section><section className="quick-grid"><article><p className="eyebrow">{t("personalisation")}</p><h3>{t("t1Optional")}</h3><p>{t("t1OptionalBody")}</p><button className="textbutton" onClick={onDiagnostic}>{t("openT1")} →</button></article><article><p className="eyebrow">{t("beforePlay")}</p><h3>{t("warmupTitle")}</h3><p>{t("warmupBody")}</p><button className="textbutton" onClick={onCards}>{t("warmup")} →</button></article></section><section className="integrity"><h2>{t("integrityTitle")}</h2><p>{t("integrityBody")}</p></section></>;
}

function Learn({ state, onLesson, onPractice, onMixed }: { state: LearnerState; onLesson: (id: ModuleId) => void; onPractice: (id: ModuleId) => void; onMixed: () => void }) {
  const { content, t } = useI18n();
  return <section className="surface"><div className="section-head"><p className="eyebrow">{t("learnEyebrow")}</p><h1>{t("learnLine1")}<br/><em>{t("learnLine2")}</em></h1><p>{t("learnSequence")}</p></div><div className="module-list">{content.modules.map((module) => { const progress = state.modules[module.id]; const available = moduleAvailable(state, module.id, module.prerequisites); return <article key={module.id} className={!available ? "locked" : progress.state === "REPAIR_REQUIRED" ? "repair" : ""}><div><span className="module-code">{module.lcm}</span><span className={\`state-pill state-\${progress.state.toLowerCase()}\`}>{moduleStateLabel(progress.state, t)}</span></div><h2>{module.title}</h2><p>{module.plainGoal}</p><p className="table-cue">{module.tableCue}</p><div className="module-actions"><button disabled={!available} className="primary" onClick={() => onLesson(module.id)}>{progress.contentCompleted ? t("repeatExplanation") : t("study")} <span>→</span></button><button disabled={!progress.contentCompleted} className="textbutton" onClick={() => onPractice(module.id)}>{t("fiveDecisions")}</button></div></article>; })}</div><button className="secondary wide" disabled={content.modules.filter((module) => state.modules[module.id].contentCompleted).length < 2} onClick={onMixed}>{t("mixedBlock")}</button></section>;
}

function Session({ state, setState, feedback, setFeedback, onExit }: { state: LearnerState; setState: (value: LearnerState) => void; feedback: Feedback | null; setFeedback: (value: Feedback | null) => void; onExit: () => void }) {
  const { content } = useI18n(); const session = state.activeSession; if (!session) return null;
  return session.mode === "lesson" ? <LessonSession state={state} setState={setState} module={content.moduleById[session.moduleId]} feedback={feedback} setFeedback={setFeedback} onExit={onExit} /> : <PracticeSession state={state} setState={setState} feedback={feedback} setFeedback={setFeedback} onExit={onExit} />;
}

function SessionHeader({ label, progress, onExit }: { label: string; progress: number; onExit?: () => void }) { const { t } = useI18n(); return <div className="session-head"><div><span>{label}</span><div className="progress"><i style={{ width: \`\${progress}%\` }} /></div></div>{onExit && <button className="quiet" onClick={onExit}>{t("exitSave")}</button>}</div>; }

function LessonSession({ state, setState, module, feedback, setFeedback, onExit }: { state: LearnerState; setState: (value: LearnerState) => void; module: ModuleContent; feedback: Feedback | null; setFeedback: (value: Feedback | null) => void; onExit: () => void }) {
  const { content, t } = useI18n(); const session = state.activeSession!; const setStep = (step: number, currentIndex = session.currentIndex) => setState(patchSession(state, { step, currentIndex, selectedActionId: null, selectedReasonId: null, itemStartedAt: new Date().toISOString() }));
  return <section className="session"><SessionHeader label={\`\${module.lcm} · \${t("lesson")}\`} progress={Math.round(((session.step + 1) / 10) * 100)} onExit={onExit} />{session.step === 0 && <><p className="eyebrow">{t("coldCheck")}</p><h2>{t("currentModel")}</h2><p className="support">{t("currentModelBody")}</p><Decision state={state} setState={setState} drill={module.drills[0]} feedback={feedback} setFeedback={setFeedback} onContinue={() => setStep(1)} /></>}{session.step === 1 && <ContentStep eyebrow={t("simpleTheory")} title={module.plainGoal} paragraphs={module.theory} footer={module.scope} onNext={() => setStep(2)} />}{session.step === 2 && <ListStep eyebrow={t("threeHeuristics")} title={module.tableCue} items={module.heuristics} onNext={() => setStep(3)} />}{session.step === 3 && <ListStep eyebrow={t("decisionTree")} title={t("checkOrder")} items={module.decisionTree} numbered onNext={() => setStep(4)} />}{session.step === 4 && <Worked module={module} onNext={() => setStep(5)} />}{session.step === 5 && <Lab module={module} onNext={() => setStep(6, 1)} />}{session.step === 6 && <><p className="eyebrow">{t("changedNode")}</p><h2>{t("sameMechanism")}</h2><p className="support">{t("sameMechanismBody")}</p><Decision state={state} setState={setState} drill={content.drillById[session.drillIds[session.currentIndex]]} feedback={feedback} setFeedback={setFeedback} onContinue={() => session.currentIndex + 1 < session.drillIds.length ? setStep(6, session.currentIndex + 1) : setStep(7)} /></>}{session.step === 7 && <ExplainBack state={state} setState={setState} module={module} onNext={() => setStep(8)} />}{session.step === 8 && <TableCard module={module} onNext={() => setStep(9)} />}{session.step === 9 && <section className="summary"><p className="eyebrow">{t("lessonDone")}</p><h1>{t("mechanismIntroduced1")}<br/><em>{t("mechanismIntroduced2")}</em></h1><p className="lede">{t("mechanismIntroducedBody")}</p><button className="primary" onClick={() => setState(completeLesson(state, module.id))}>{t("saveReturn")} <span>→</span></button></section>}</section>;
}

function ContentStep({ eyebrow, title, paragraphs, footer, onNext }: { eyebrow: string; title: string; paragraphs: string[]; footer: string; onNext: () => void }) { const { t } = useI18n(); return <><p className="eyebrow">{eyebrow}</p><h2>{title}</h2><div className="theory-stack">{paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div><p className="assumption-strip">{t("boundary")}: {footer}</p><button className="primary" onClick={onNext}>{t("next")} <span>→</span></button></>; }
function ListStep({ eyebrow, title, items, numbered = false, onNext }: { eyebrow: string; title: string; items: string[]; numbered?: boolean; onNext: () => void }) { const { t } = useI18n(); const Tag = numbered ? "ol" : "ul"; return <><p className="eyebrow">{eyebrow}</p><h2>{title}</h2><Tag className="learning-list">{items.map((item) => <li key={item}>{item}</li>)}</Tag><button className="primary" onClick={onNext}>{t("next")} <span>→</span></button></>; }
function Worked({ module, onNext }: { module: ModuleContent; onNext: () => void }) { const { t } = useI18n(); return <><p className="eyebrow">{t("workedExample")}</p><h2>{module.workedExample.situation}</h2><ol className="learning-list">{module.workedExample.steps.map((step) => <li key={step}>{step}</li>)}</ol><div className="answer-panel"><b>{t("conclusion")}</b><p>{module.workedExample.answer}</p></div><div className="counterexample"><b>{t("ruleBoundary")}</b><p>{module.counterexample}</p></div><button className="primary" onClick={onNext}>{t("openTrainer")} <span>→</span></button></>; }
function Lab({ module, onNext }: { module: ModuleContent; onNext: () => void }) { const { t } = useI18n(); const lab = module.lab; const [pot, setPot] = useState(lab.type === "spr" ? lab.initialPot : 0); const [stack, setStack] = useState(lab.type === "spr" ? lab.stack : 0); const [bet, setBet] = useState(lab.type === "spr" ? lab.bet : 0); const spr = lab.type === "spr" && pot + bet * 2 > 0 ? Math.max(0, (stack - bet) / (pot + bet * 2)) : 0; return <><p className="eyebrow">{t("trainer")}</p><h2>{lab.title}</h2><p className="support">{lab.description}</p>{lab.type === "spr" ? <div className="spr-lab"><label>{t("potBeforeBet")}<input type="number" value={pot} onChange={(event) => setPot(Number(event.target.value))} /></label><label>{t("stackBehind")}<input type="number" value={stack} onChange={(event) => setStack(Number(event.target.value))} /></label><label>{t("betOrCall")}<input type="number" value={bet} onChange={(event) => setBet(Number(event.target.value))} /></label><div className="spr-result"><span>{t("sprAfterCall")}</span><b>{spr.toFixed(2)}</b><small>({stack}−{bet}) / ({pot}+2×{bet})</small></div></div> : <div className="compare-lab"><article><b>{lab.leftTitle}</b><p>{lab.leftText}</p></article><article><b>{lab.rightTitle}</b><p>{lab.rightText}</p></article></div>}<button className="primary" onClick={onNext}>{t("changedNode")} <span>→</span></button></>; }
function ExplainBack({ state, setState, module, onNext }: { state: LearnerState; setState: (value: LearnerState) => void; module: ModuleContent; onNext: () => void }) { const { t } = useI18n(); const value = state.activeSession?.explainBack ?? ""; return <><p className="eyebrow">{t("explainBack")}</p><h2>{module.explainBackPrompt}</h2><textarea className="large-input" value={value} onChange={(event) => setState(patchSession(state, { explainBack: event.target.value }))} placeholder={t("explainPlaceholder")} /><button className="primary" disabled={value.trim().length < 30} onClick={onNext}>{t("lockExplanation")} <span>→</span></button></>; }
function TableCard({ module, onNext }: { module: ModuleContent; onNext: () => void }) { const { t } = useI18n(); return <><p className="eyebrow">{t("tableCard")}</p><h2>{module.tableCue}</h2><div className="table-card">{module.tableCard.map((item, index) => <div key={item}><span>{String(index + 1).padStart(2, "0")}</span><b>{item}</b></div>)}</div><div className="glossary">{module.glossary.map((item) => <p key={item.term}><b>{item.term}</b>{item.meaning}</p>)}</div><button className="primary" onClick={onNext}>{t("finishLesson")} <span>→</span></button></>; }

function PracticeSession({ state, setState, feedback, setFeedback, onExit }: { state: LearnerState; setState: (value: LearnerState) => void; feedback: Feedback | null; setFeedback: (value: Feedback | null) => void; onExit: () => void }) { const { content } = useI18n(); const session = state.activeSession!; const drill = content.drillById[session.drillIds[session.currentIndex]]; const advance = () => { if (session.currentIndex + 1 < session.drillIds.length) setState(patchSession(state, { currentIndex: session.currentIndex + 1, selectedActionId: null, selectedReasonId: null, confidence: 65, itemStartedAt: new Date().toISOString() })); else setState(completeBlock(state, session.mode === "practice" || session.mode === "repair" ? session.moduleId : undefined)); setFeedback(null); }; return <section className="session"><SessionHeader label={\`\${session.mode.toUpperCase()} · \${session.currentIndex + 1}/\${session.drillIds.length}\`} progress={Math.round(((session.currentIndex + 1) / session.drillIds.length) * 100)} onExit={onExit} /><Decision state={state} setState={setState} drill={drill} feedback={feedback} setFeedback={setFeedback} onContinue={advance} /><div className="mini-results">{(["A", "B", "C", "D"] as ResponseClass[]).map((kind) => <span key={kind}>{kind}: {state.interactions.filter((item) => Date.parse(item.at) >= Date.parse(session.startedAt) && item.responseClass === kind).length}</span>)}</div></section>; }

function Decision({ state, setState, drill, feedback, setFeedback, onContinue }: { state: LearnerState; setState: (value: LearnerState) => void; drill: Drill; feedback: Feedback | null; setFeedback: (value: Feedback | null) => void; onContinue: () => void }) { const { t } = useI18n(); const session = state.activeSession!; const actionOptions = useMemo(() => shuffle(drill.actionOptions, \`\${session.startedAt}:\${drill.id}:action\`), [drill.actionOptions, drill.id, session.startedAt]); const reasonOptions = useMemo(() => shuffle(drill.reasonOptions, \`\${session.startedAt}:\${drill.id}:reason\`), [drill.reasonOptions, drill.id, session.startedAt]); function lock() { if (!session.selectedActionId || !session.selectedReasonId) return; const actionOk = session.selectedActionId === drill.correctActionId; const reasonOk = session.selectedReasonId === drill.correctReasonId; setState(recordDecision(state, { moduleId: drill.moduleId, drillId: drill.id, nodeKey: drill.nodeKey, variantGroup: drill.variantGroup, mode: session.mode, actionOk, reasonOk, confidence: session.confidence, elapsedSeconds: Math.max(1, Math.round((Date.now() - Date.parse(session.itemStartedAt)) / 1000)), targetSeconds: drill.targetSeconds, isBoundary: drill.kind === "boundary" })); setFeedback({ drill, actionOk, reasonOk, responseClass: classifyResponse(actionOk, reasonOk) }); } if (feedback) return <div className="feedback-view" aria-live="polite"><p className="eyebrow">{t("decisionsReview")} · CLASS {feedback.responseClass}</p><h2>{classCopy(feedback.responseClass, t)}</h2><div className="answer-panel"><b>{t("workingAction")}</b><p>{feedback.drill.actionOptions.find((item) => item.id === feedback.drill.correctActionId)?.text}</p><b>{t("why")}</b><p>{feedback.drill.reasonOptions.find((item) => item.id === feedback.drill.correctReasonId)?.text}</p></div><p className="support">{feedback.drill.explanation}</p><p className="assumption-strip">{t("conditions")}: {feedback.drill.assumptions.join(" · ")}</p><button className="primary" onClick={onContinue}>{t("continue")} <span>→</span></button></div>; return <div className="decision-card"><p className="eyebrow">{drill.moduleId.toUpperCase()} · {drill.kind}</p><p className="cue">{drill.cue}</p><h2>{drill.question}</h2><p className="assumption-strip">{t("conditions")}: {drill.assumptions.join(" · ")}</p><OptionGroup legend={t("chooseAction")} options={actionOptions} selected={session.selectedActionId} onSelect={(selectedActionId) => setState(patchSession(state, { selectedActionId }))} /><OptionGroup legend={t("chooseReason")} options={reasonOptions} selected={session.selectedReasonId} onSelect={(selectedReasonId) => setState(patchSession(state, { selectedReasonId }))} /><label className="confidence">{t("confidence")} <b>{session.confidence}%</b><input type="range" min="0" max="100" value={session.confidence} onChange={(event) => setState(patchSession(state, { confidence: Number(event.target.value) }))} /></label><button className="primary" disabled={!session.selectedActionId || !session.selectedReasonId} onClick={lock}>{t("lockDecision")} <span>→</span></button></div>; }
function OptionGroup({ legend, options, selected, onSelect }: { legend: string; options: Option[]; selected: string | null; onSelect: (id: string) => void }) { return <fieldset className="answer-set"><legend>{legend}</legend>{options.map((option) => <button type="button" key={option.id} aria-pressed={selected === option.id} className={selected === option.id ? "selected" : ""} onClick={() => onSelect(option.id)}>{option.text}</button>)}</fieldset>; }

function Review({ state, onReview, onRepair }: { state: LearnerState; onReview: () => void; onRepair: (id: ModuleId) => void }) { const { content, t } = useI18n(); const due = dueReviewItems(state); return <section className="surface"><div className="section-head"><p className="eyebrow">{t("reviewEyebrow")}</p><h1>{t("reviewLine1")}<br/><em>{t("reviewLine2")}</em></h1></div>{due.length ? <div className="queue">{due.map((item) => <article key={item.id}><span className={\`kind kind-\${item.kind}\`}>{item.kind}</span><h3>{content.moduleById[item.moduleId].title}</h3><p>{item.variantGroup}</p><button className="primary" onClick={() => item.kind === "repair" ? onRepair(item.moduleId) : onReview()}>{t("startReview")} <span>→</span></button></article>)}</div> : <div className="empty-state"><h2>{t("nothingDue")}</h2><p>{t("nothingDueBody")}</p></div>}</section>; }

function Cards({ state, setState }: { state: LearnerState; setState: (value: LearnerState) => void }) { const { content, t } = useI18n(); const [mode, setMode] = useState<"warmup" | "due" | "all">("warmup"); const [index, setIndex] = useState(0); const [revealed, setRevealed] = useState(false); const due = content.allCards.filter((card) => !state.cards[card.id] || Date.parse(state.cards[card.id].dueAt) <= Date.now()); const cards = mode === "due" ? due : mode === "warmup" ? (due.length ? due : content.allCards).slice(0, 3) : content.allCards; const card = cards[index]; useEffect(() => { setIndex(0); setRevealed(false); }, [mode]); if (!card) return <section className="surface"><div className="empty-state"><h2>{t("cardsDone")}</h2></div></section>; const apply = (grade: 0 | 1 | 2 | 3) => { setState(gradeCard(state, card.id, grade)); setIndex(index + 1 >= cards.length ? 0 : index + 1); setRevealed(false); }; return <section className="session"><div className="mode-switch"><button aria-pressed={mode === "warmup"} onClick={() => setMode("warmup")}>{t("warmup90")}</button><button aria-pressed={mode === "due"} onClick={() => setMode("due")}>{t("dueOnly")}</button><button aria-pressed={mode === "all"} onClick={() => setMode("all")}>{t("allCards")}</button></div><p className="eyebrow">{t("activeRecall")} · {index + 1}/{cards.length}</p><h2>{card.front}</h2><p className="module-code">{content.moduleById[card.moduleId].lcm} · {card.kind}</p>{revealed ? <><div className="card-answer">{card.back}</div><div className="grade-row"><button onClick={() => apply(0)}>{t("forgot")}</button><button onClick={() => apply(1)}>{t("hard")}</button><button onClick={() => apply(2)}>{t("okay")}</button><button className="primary" onClick={() => apply(3)}>{t("easy")}</button></div></> : <button className="primary" onClick={() => setRevealed(true)}>{t("showAnswer")} <span>→</span></button>}<p className="support">{t("cardsNoMastery")}</p></section>; }

function Map({ state, onLesson, onPractice }: { state: LearnerState; onLesson: (id: ModuleId) => void; onPractice: (id: ModuleId) => void }) { const { content, t } = useI18n(); return <section className="surface"><div className="section-head"><p className="eyebrow">{t("skillMapEyebrow")}</p><h1>{t("skillMapLine1")}<br/><em>{t("skillMapLine2")}</em></h1></div><div className="map-grid">{content.modules.map((module) => <article key={module.id}><div className="map-title"><span>{module.lcm}</span><b>{moduleStateLabel(state.modules[module.id].state, t)}</b></div><h3>{module.shortTitle}</h3><div className="dimension-grid">{DIMENSION_KEYS.map((key) => { const cell = state.modules[module.id].evidence[key]; const score = evidencePercent(cell); return <div key={key}><span>{dimensionLabel(key, t)}</span><b>{score === null ? "—" : \`\${score}%\`}</b><small>{cell.exposures}</small></div>; })}</div><div className="module-actions"><button className="textbutton" onClick={() => onLesson(module.id)}>{t("theory")}</button><button className="textbutton" disabled={!state.modules[module.id].contentCompleted} onClick={() => onPractice(module.id)}>{t("practice")}</button></div></article>)}</div></section>; }

function Field({ state, setState }: { state: LearnerState; setState: (value: LearnerState) => void }) { const { content, locale, t } = useI18n(); const [moduleId, setModuleId] = useState<ModuleId>("geometry"); const [cue, setCue] = useState(""); const [action, setAction] = useState(""); const [reason, setReason] = useState(""); const [cueBeforeAction, setCueBeforeAction] = useState(true); const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({}); const save = () => { if (cue.trim() && action.trim() && reason.trim()) { setState(addFieldNote(state, { moduleId, cue: cue.trim(), action: action.trim(), reason: reason.trim(), cueBeforeAction })); setCue(""); setAction(""); setReason(""); } }; return <section className="surface"><div className="section-head"><p className="eyebrow">{t("realHands")}</p><h1>{t("fieldLine1")}<br/><em>{t("fieldLine2")}</em></h1></div><div className="field-layout"><div className="field-form"><label>{t("mechanism")}<select value={moduleId} onChange={(event) => setModuleId(event.target.value as ModuleId)}>{content.modules.map((module) => <option key={module.id} value={module.id}>{module.lcm} · {module.shortTitle}</option>)}</select></label><label>{t("noticedBefore")}<textarea value={cue} onChange={(event) => setCue(event.target.value)} /></label><label>{t("didWhat")}<textarea value={action} onChange={(event) => setAction(event.target.value)} /></label><label>{t("reasonWhy")}<textarea value={reason} onChange={(event) => setReason(event.target.value)} /></label><label className="check"><input type="checkbox" checked={cueBeforeAction} onChange={(event) => setCueBeforeAction(event.target.checked)} /> {t("cueBeforeAction")}</label><button className="primary" disabled={!cue.trim() || !action.trim() || !reason.trim()} onClick={save}>{t("savePending")} <span>→</span></button></div><div className="field-list">{[...state.fieldNotes].reverse().map((note) => { const reviewText = reviewNotes[note.id] ?? ""; return <article key={note.id}><span className={\`kind kind-\${note.status.toLowerCase()}\`}>{fieldStatusLabel(note.status, locale)}</span><h3>{content.moduleById[note.moduleId].shortTitle}</h3><p><b>{t("cue")}:</b> {note.cue}</p><p><b>{t("action")}:</b> {note.action}</p><p><b>{t("reason")}:</b> {note.reason}</p>{note.status === "PENDING_REVIEW" ? <><textarea placeholder={t("reviewReasoning")} value={reviewText} onChange={(event) => setReviewNotes({ ...reviewNotes, [note.id]: event.target.value })} /><div className="review-actions"><button onClick={() => setState(reviewFieldNote(state, note.id, "INSUFFICIENT", reviewText))}>{t("insufficient")}</button><button disabled={!reviewText.trim()} onClick={() => setState(reviewFieldNote(state, note.id, "REVIEWED_REPAIR", reviewText))}>{t("needsRepair")}</button><button className="primary" disabled={!note.cueBeforeAction || !reviewText.trim()} onClick={() => setState(reviewFieldNote(state, note.id, "REVIEWED_VALID", reviewText))}>{t("valid")}</button></div></> : <p className="support">{t("reviewLabel")}: {note.evaluatorNote || t("noComment")}</p>}</article>; })}</div></div></section>; }

function Diagnostic({ state, setState, onExit }: { state: LearnerState; setState: (value: LearnerState) => void; onExit: () => void }) { const { content, locale, t } = useI18n(); const items = getDiagnostic(locale); const diagnostic = state.diagnostic; const item = items[diagnostic.responses.length]; const baselineEligible = state.interactions.length === 0 && sourceModules.every((module) => !state.modules[module.id].contentCompleted); const [answer, setAnswer] = useState(""); const [reasoning, setReasoning] = useState(""); const [confidence, setConfidence] = useState(65); const [startedAt, setStartedAt] = useState(Date.now()); const begin = () => setState(mutate(state, (next) => { next.diagnostic.status = "IN_PROGRESS"; next.diagnostic.startedAt ??= new Date().toISOString(); })); const submit = () => { if (!item || !answer.trim() || !reasoning.trim()) return; const response: DiagnosticRawResponse = { item_id: item.id, answer: answer.trim(), reasoning: reasoning.trim(), confidence, time_seconds: Math.max(1, Math.round((Date.now() - startedAt) / 1000)) }; setState(mutate(state, (next) => { next.diagnostic.responses.push(response); const final = next.diagnostic.responses.length === items.length; next.diagnostic.status = final ? "AWAITING_REVIEW" : "IN_PROGRESS"; if (final) next.diagnostic.submittedAt = new Date().toISOString(); })); setAnswer(""); setReasoning(""); setConfidence(65); setStartedAt(Date.now()); }; async function importEvaluated(file: File) { try { const payload = JSON.parse(await file.text()) as Record<string, unknown>; const lcm: Record<string, ModuleId> = { "LCM-01": "geometry", "LCM-02": "preflop", "LCM-03": "blinds", "LCM-04": "filtering", "LCM-05": "shape", "LCM-06": "aggression", "LCM-07": "ancestry", "LCM-08": "multiway", "LCM-09": "river", "LCM-10": "evidence", "LCM-11": "transfer" }; const priority: ModuleId[] = []; if (Array.isArray(payload.priority_modules)) for (const value of payload.priority_modules) if (typeof value === "string" && MODULE_IDS.includes(value as ModuleId)) priority.push(value as ModuleId); if (payload.module_summary && typeof payload.module_summary === "object") for (const key of Object.keys(payload.module_summary)) if (lcm[key] && !priority.includes(lcm[key])) priority.push(lcm[key]); if (!priority.length) throw new Error(t("importEvaluatedError")); setState(mutate(state, (next) => { next.diagnostic.status = "ROUTED"; next.diagnostic.priorityModules = priority.slice(0, 2); next.diagnostic.importedAt = new Date().toISOString(); for (const moduleId of next.diagnostic.priorityModules) { next.modules[moduleId].state = "REPAIR_REQUIRED"; next.modules[moduleId].highConfidenceError = true; } })); } catch (error) { alert(error instanceof Error ? error.message : t("importEvaluatedError")); } } if (diagnostic.status === "NOT_STARTED") return <section className="surface"><div className="section-head"><p className="eyebrow">{baselineEligible ? t("t1ColdAvailable") : t("t1PostLearning")}</p><h1>{t("diagnoseLine1")}<br/><em>{t("diagnoseLine2")}</em></h1><p>{baselineEligible ? t("coldBody") : t("postBody")}</p><button className="primary" onClick={begin}>{t("startT1")} <span>→</span></button></div></section>; if (["AWAITING_REVIEW", "SCORED", "ROUTED"].includes(diagnostic.status)) return <section className="surface"><div className="section-head"><p className="eyebrow">T1 · {diagnostic.status}</p><h1>{diagnostic.responses.length}/10 {t("answersSaved")}</h1><p>{t("rawHonesty")}</p><div className="button-row"><button className="primary" onClick={() => downloadJson("live-cash-t1-raw.json", { schema_version: "raw-0.1", learner_id: "current_learner", tranche_id: "T1", measurement_context: baselineEligible ? "COLD_BASELINE" : "POST_LEARNING_DIAGNOSTIC", locale, submitted_at: diagnostic.submittedAt, responses: diagnostic.responses })}>{t("downloadRaw")} <span>↓</span></button><label className="file-button">{t("importEvaluated")}<input type="file" accept="application/json" onChange={(event) => { const file = event.target.files?.[0]; if (file) void importEvaluated(file); }} /></label></div>{diagnostic.priorityModules.map((moduleId) => <p key={moduleId} className="priority-box">{content.moduleById[moduleId].lcm} · {content.moduleById[moduleId].title}</p>)}</div></section>; if (!item) return null; return <section className="session"><SessionHeader label={\`T1 · \${diagnostic.responses.length + 1}/10\`} progress={Math.round(((diagnostic.responses.length + 1) / 10) * 100)} onExit={onExit} /><p className="eyebrow">{item.id} · {item.title}</p><p className="support">{baselineEligible ? t("coldInstruction") : t("postInstruction")}</p><h2>{item.prompt}</h2><label className="diagnostic-input">{t("actionDirection")}<textarea value={answer} onChange={(event) => setAnswer(event.target.value)} /></label><label className="diagnostic-input">{t("oneSentenceReason")}<textarea value={reasoning} onChange={(event) => setReasoning(event.target.value)} /></label><label className="confidence">{t("confidence")} <b>{confidence}%</b><input type="range" min="0" max="100" value={confidence} onChange={(event) => setConfidence(Number(event.target.value))} /></label><button className="primary" disabled={!answer.trim() || !reasoning.trim()} onClick={submit}>{t("lockResponse")} <span>→</span></button></section>; }

function Debug({ state, setState, syncStatus, setSyncStatus }: { state: LearnerState; setState: (value: LearnerState) => void; syncStatus: SyncStatus; setSyncStatus: (value: SyncStatus) => void }) { const { locale, t } = useI18n(); async function deleteCloud() { try { const response = await fetch("/api/state", { method: "DELETE" }); setSyncStatus(response.ok ? "synced" : response.status === 401 ? "local" : "error"); } catch { setSyncStatus("offline"); } } async function importState(file: File) { try { const migrated = migrateLearnerState(JSON.parse(await file.text())); if (!validateLearnerState(migrated)) throw new Error(); setState(migrated); } catch { alert(t("importStateError")); } } function reset() { if (confirm(t("deleteLocalConfirm"))) { localStorage.removeItem(STORAGE_KEY); setState(emptyLearnerState()); } } return <section className="surface"><div className="section-head"><p className="eyebrow">SYSTEM / OWNER VIEW</p><h1>{t("transparentState")}</h1></div><div className="debug-grid"><div><span>App</span><b>{APP_VERSION}</b></div><div><span>State schema</span><b>{STATE_SCHEMA_VERSION}</b></div><div><span>Content</span><b>{CONTENT_VERSION}</b></div><div><span>Locale</span><b>{locale}</b></div><div><span>Revision</span><b>{state.revision}</b></div><div><span>Sync</span><b>{syncStatus}</b></div><div><span>Review queue</span><b>{state.reviewQueue.length}</b></div><div><span>Interactions</span><b>{state.interactions.length}</b></div></div><div className="button-row"><button className="secondary" onClick={() => downloadJson("live-cash-progress.json", state)}>{t("exportProgress")}</button><label className="file-button">{t("importProgress")}<input type="file" accept="application/json" onChange={(event) => { const file = event.target.files?.[0]; if (file) void importState(file); }} /></label><button className="secondary" onClick={() => void deleteCloud()}>{t("deleteCloud")}</button><button className="danger" onClick={reset}>{t("resetLocal")}</button></div></section>; }`;

const syncStart = source.indexOf("function SyncBadge");
if (syncStart < 0) throw new Error("Could not find old component tail");
source = `${source.slice(0, syncStart)}${tail}\n`;
await writeFile(componentPath, source, "utf8");

let css = await readFile(cssPath, "utf8");
if (!css.includes(".language-switch")) {
  css += `\n.language-switch { display: inline-flex; border: 1px solid var(--line); border-radius: 999px; padding: 2px; }\n.language-switch button { min-width: 34px; border: 0; border-radius: 999px; padding: 5px 8px; background: transparent; color: var(--muted); font-size: 11px; font-weight: 800; }\n.language-switch button[aria-pressed=\"true\"] { background: var(--ink); color: white; }\n@media (max-width: 650px) { .topmeta { gap: 7px; } .language-switch button { min-width: 31px; padding: 5px 6px; } }\n`;
  await writeFile(cssPath, css, "utf8");
}
console.log("Applied bilingual runtime and natural learner-facing UI copy.");
