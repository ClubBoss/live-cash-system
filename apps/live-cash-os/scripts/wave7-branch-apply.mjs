import { readFile, writeFile } from "node:fs/promises";

function replaceOne(source, oldText, newText, label) {
  if (!source.includes(oldText)) throw new Error(`Wave 7 patch marker missing: ${label}`);
  return source.replace(oldText, newText);
}

function replaceSection(source, startMarker, endMarker, replacement, label) {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start + startMarker.length);
  if (start < 0 || end < 0) throw new Error(`Wave 7 section marker missing: ${label}`);
  return `${source.slice(0, start)}${replacement}${source.slice(end)}`;
}

const corePath = new URL("../components/LiveCashAppCore.tsx", import.meta.url);
let core = await readFile(corePath, "utf8");

core = replaceOne(core,
`  diagnosticStatusLabel,
  drillKindLabel,
  fieldFactLabels,
  fieldStatusLabel,
  labLabels,`,
`  diagnosticStatusLabel,
  drillKindLabel,
  labLabels,`,
"remove legacy field labels");

core = replaceOne(core,
`  STATE_SCHEMA_VERSION,
  addFieldNote,
  classifyResponse,`,
`  STATE_SCHEMA_VERSION,
  classifyResponse,`,
"remove legacy field add helper");

core = replaceOne(core,
`  recordDiagnosticResponse,
  reviewFieldNote,
  routeDiagnosticPriorities,
  saveActiveSession,`,
`  recordDiagnosticResponse,
  saveActiveSession,`,
"remove legacy field/T1 routing helpers");

core = replaceOne(core,
`} from "../lib/model";
import LearningRoute from "./LearningRoute";`,
`} from "../lib/model";
import { applyReviewedDiagnostic, pendingHumanReviewCount, saveExplainBack } from "../lib/wave7";
import LearningRoute from "./LearningRoute";
import { Wave7ExplainBackHistory, Wave7FieldPanel, Wave7ProgressDetails } from "./Wave7Experience";`,
"add Wave 7 imports");

core = replaceOne(core,
`    {tab === "today" && <Today locale={locale} state={state} plan={plan} budget={dailyBudget} onBudget={setDailyBudget} onRun={runToday} onCards={() => setTab("cards")} onDiagnostic={() => setTab("diagnostic")} />}`,
`    {tab === "today" && <Today locale={locale} state={state} plan={plan} budget={dailyBudget} onBudget={setDailyBudget} onRun={runToday} onCards={() => setTab("cards")} onDiagnostic={() => setTab("diagnostic")} onField={() => setTab("field")} />}`,
"Today field entry");

core = replaceOne(core,
`    {tab === "field" && <Field locale={locale} state={state} setState={setState} />}`,
`    {tab === "field" && <Wave7FieldPanel locale={locale} state={state} setState={setState} />}`,
"Wave 7 field panel");

core = replaceOne(core,
`function Today({ locale, state, plan, budget, onBudget, onRun, onCards, onDiagnostic }: { locale: LocaleCode; state: LearnerState; plan: DailyPlan; budget: DailyBudget; onBudget: (value: DailyBudget) => void; onRun: () => void; onCards: () => void; onDiagnostic: () => void }) {`,
`function Today({ locale, state, plan, budget, onBudget, onRun, onCards, onDiagnostic, onField }: { locale: LocaleCode; state: LearnerState; plan: DailyPlan; budget: DailyBudget; onBudget: (value: DailyBudget) => void; onRun: () => void; onCards: () => void; onDiagnostic: () => void; onField: () => void }) {`,
"Today props");

core = replaceOne(core,
`  const working = modules.filter((module) => ["WORKING", "RETAINED", "FIELD_TEST_PENDING", "FIELD_VALIDATED"].includes(state.modules[module.id].state)).length;
  const budgets: DailyBudget[] = ["5", "15", "30", "warmup", "post"];`,
`  const working = modules.filter((module) => ["WORKING", "RETAINED", "FIELD_TEST_PENDING", "FIELD_VALIDATED"].includes(state.modules[module.id].state)).length;
  const pendingHuman = pendingHumanReviewCount(state);
  const budgets: DailyBudget[] = ["5", "15", "30", "warmup", "post"];`,
"Today pending review count");

core = replaceOne(core,
`      <article><p className="eyebrow">{t.personalisation}</p><h3>{t.diagnosticTitle}</h3><p>{t.diagnosticDescription}</p><button className="textbutton" onClick={onDiagnostic}>{t.openT1}</button></article>
      <article><p className="eyebrow">{t.beforePlay}</p>`,
`      <article><p className="eyebrow">{t.personalisation}</p><h3>{t.diagnosticTitle}</h3><p>{t.diagnosticDescription}</p><button className="textbutton" onClick={onDiagnostic}>{t.openT1}</button></article>
      <article><p className="eyebrow">{locale === "ru" ? "РАЗБОР" : "REVIEW"}</p><h3>{locale === "ru" ? "Реальные руки и explain-back" : "Real hands and explain-back"}</h3><p>{pendingHuman > 0 ? (locale === "ru" ? `${pendingHuman} записей ждут явного разбора.` : `${pendingHuman} records are waiting for explicit review.`) : (locale === "ru" ? "Запиши решение до результата или открой историю объяснений." : "Record a decision before the result or review your explanation history.")}</p><button className="textbutton" onClick={onField}>{locale === "ru" ? "Открыть разбор" : "Open review"}</button></article>
      <article><p className="eyebrow">{t.beforePlay}</p>`,
"Today review card");

core = replaceOne(core,
`    {session.step === 7 && <ExplainBack locale={locale} state={state} setState={setState} module={source} onNext={() => setStep(8)} />}`,
`    {session.step === 7 && <ExplainBack locale={locale} state={state} setState={setState} module={source} />}`,
"lesson explain-back persistence");

const explainReplacement = `
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
    const saved = saveExplainBack(withDraft, module.id, \\`\${module.id}.explainBack\\`, value);
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

`;
core = replaceSection(core, "\nfunction ExplainBack(", "\nfunction TableCard(", explainReplacement, "ExplainBack");

const skillMapReplacement = `
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
          return <div key={key}><span>{dimensionLabel(locale, key)}</span><b>{score === null ? "—" : \\`\${score}%\\`}</b><small>{cell.exposures}</small></div>;
        })}</div>
        <Wave7ProgressDetails locale={locale} state={state} moduleId={module.id} />
        <div className="module-actions"><button className="textbutton" onClick={() => onLesson(module.id)}>{t.theory}</button><button className="textbutton" disabled={!state.modules[module.id].contentCompleted} onClick={() => onPractice(module.id)}>{t.practice}</button></div>
      </article>;
    })}</div>
  </section>;
}

`;
core = replaceSection(core, "\nfunction SkillMap(", "\nfunction Field(", skillMapReplacement, "SkillMap");
core = replaceSection(core, "\nfunction Field(", "\nfunction Diagnostic(", "\n", "legacy Field");

core = replaceOne(core,
`      const priority = deriveDiagnosticPriorityModules(score);
      setState(routeDiagnosticPriorities(state, priority));`,
`      if (!score.item_reviews || !score.reviewer_kind || !score.reviewed_at) throw new Error("human-review");
      const priority = deriveDiagnosticPriorityModules(score);
      setState(applyReviewedDiagnostic(state, priority, {
        reviewerKind: score.reviewer_kind === "human" ? "HUMAN" : "HUMAN_ASSISTED",
        reviewedAt: score.reviewed_at,
        itemReviews: score.item_reviews.map((item) => ({
          itemId: item.item_id,
          responseClass: item.response_class,
          reviewerNote: item.reviewer_note,
        })),
      }));`,
"reviewed diagnostic import");

core = replaceOne(core,
`<p>{t.rawBoundary}</p><div className="button-row">`,
`<p>{t.rawBoundary}</p><p className="support">{locale === "ru" ? "Семантический разбор делает человек или человек с инструментом. Импорт может направить практику, но не создаёт mastery, retention или field evidence." : "Semantic review is done by a human or human-assisted reviewer. Import can route practice, but it does not create mastery, retention, or field evidence."}</p><div className="button-row">`,
"diagnostic review boundary copy");

await writeFile(corePath, core, "utf8");

const cssPath = new URL("../app/globals.css", import.meta.url);
let css = await readFile(cssPath, "utf8");
if (!css.includes(".w7-history")) {
  css += `

.w7-review-inbox { margin: 0 0 30px; padding: 24px; border: 1px solid var(--line); }
.w7-history { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 20px 0; }
.w7-history article, .w7-progress, .w7-result { padding: 16px; border: 1px solid var(--line); background: var(--paper); }
.w7-history article p:last-child { white-space: pre-wrap; }
.w7-progress { margin: 18px 0; }
.w7-progress p { margin: 7px 0; }
.w7-result { margin: 22px 0; }
.w7-result label { display: block; margin: 12px 0; font-size: 12px; font-weight: 800; }
.w7-result textarea { width: 100%; min-height: 72px; margin-top: 7px; border: 1px solid var(--line); background: transparent; padding: 12px; color: var(--ink); resize: vertical; }

@media (max-width: 650px) {
  .w7-history { grid-template-columns: 1fr; }
  .w7-review-inbox { padding: 18px; }
}
`;
}
await writeFile(cssPath, css, "utf8");

console.log("Wave 7 bounded runtime patch applied.");
