import { readFile, writeFile } from "node:fs/promises";

const path = new URL("../components/LiveCashApp.tsx", import.meta.url);
let source = await readFile(path, "utf8");

function replaceOnce(from, to, label) {
  if (!source.includes(from)) throw new Error(`Postprocess target missing: ${label}`);
  source = source.replace(from, to);
}
function replaceBlock(start, end, replacement, label) {
  const startIndex = source.indexOf(start);
  const endIndex = source.indexOf(end, startIndex + start.length);
  if (startIndex < 0 || endIndex < 0) throw new Error(`Postprocess block missing: ${label}`);
  source = `${source.slice(0, startIndex)}${replacement}\n\n${source.slice(endIndex)}`;
}

replaceOnce(
  'import { ui, type Locale, type UiKey } from "../content/i18n/ui";',
  'import { deriveDiagnosticPriorityModules, parseDiagnosticScore } from "../lib/diagnostic-import";\nimport { cardKindLabel, diagnosticStatusLabel, drillKindLabel, learningModeLabel, reviewKindLabel } from "../content/i18n/labels";\nimport { ui, type Locale, type UiKey } from "../content/i18n/ui";',
  "locale and diagnostic imports",
);
replaceOnce(
  '  recordDecision,\n  reviewFieldNote,',
  '  recordDecision,\n  recordDiagnosticResponse,\n  startDiagnosticRun,\n  hasLearningExposure,\n  reviewFieldNote,',
  "diagnostic model imports",
);
replaceOnce(
  'type Feedback = { drill: Drill; actionOk: boolean; reasonOk: boolean; responseClass: ResponseClass };',
  'type Feedback = { drillId: string; actionOk: boolean; reasonOk: boolean; responseClass: ResponseClass };',
  "locale-stable feedback shape",
);
replaceOnce(
  'setFeedback({ drill, actionOk, reasonOk, responseClass: classifyResponse(actionOk, reasonOk) });',
  'setFeedback({ drillId: drill.id, actionOk, reasonOk, responseClass: classifyResponse(actionOk, reasonOk) });',
  "feedback capture",
);
source = source
  .replaceAll("feedback.drill.actionOptions", "drill.actionOptions")
  .replaceAll("feedback.drill.reasonOptions", "drill.reasonOptions")
  .replaceAll("feedback.drill.correctActionId", "drill.correctActionId")
  .replaceAll("feedback.drill.correctReasonId", "drill.correctReasonId")
  .replaceAll("feedback.drill.explanation", "drill.explanation")
  .replaceAll("feedback.drill.assumptions", "drill.assumptions");

replaceOnce(
  'function PracticeSession({ state, setState, feedback, setFeedback, onExit }: { state: LearnerState; setState: (value: LearnerState) => void; feedback: Feedback | null; setFeedback: (value: Feedback | null) => void; onExit: () => void }) { const { content } = useI18n();',
  'function PracticeSession({ state, setState, feedback, setFeedback, onExit }: { state: LearnerState; setState: (value: LearnerState) => void; feedback: Feedback | null; setFeedback: (value: Feedback | null) => void; onExit: () => void }) { const { content, locale } = useI18n();',
  "practice locale",
);
replaceOnce(
  'label={`${session.mode.toUpperCase()} · ${session.currentIndex + 1}/${session.drillIds.length}`}',
  'label={`${learningModeLabel(locale, session.mode)} · ${session.currentIndex + 1}/${session.drillIds.length}`}',
  "practice mode label",
);
replaceOnce(
  'function Decision({ state, setState, drill, feedback, setFeedback, onContinue }: { state: LearnerState; setState: (value: LearnerState) => void; drill: Drill; feedback: Feedback | null; setFeedback: (value: Feedback | null) => void; onContinue: () => void }) { const { t } = useI18n();',
  'function Decision({ state, setState, drill, feedback, setFeedback, onContinue }: { state: LearnerState; setState: (value: LearnerState) => void; drill: Drill; feedback: Feedback | null; setFeedback: (value: Feedback | null) => void; onContinue: () => void }) { const { locale, t } = useI18n();',
  "decision locale",
);
replaceOnce(
  'const reasonOptions = useMemo(() => shuffle(drill.reasonOptions, `${session.startedAt}:${drill.id}:reason`), [drill.reasonOptions, drill.id, session.startedAt]); function lock()',
  'const reasonOptions = useMemo(() => shuffle(drill.reasonOptions, `${session.startedAt}:${drill.id}:reason`), [drill.reasonOptions, drill.id, session.startedAt]); const recoveredInteraction = [...state.interactions].reverse().find((item) => item.drillId === drill.id && Date.parse(item.at) >= Date.parse(session.itemStartedAt)); const resolvedFeedback: Feedback | null = feedback ?? (recoveredInteraction ? { drillId: drill.id, actionOk: recoveredInteraction.actionOk, reasonOk: recoveredInteraction.reasonOk, responseClass: recoveredInteraction.responseClass } : null); function lock()',
  "feedback recovery from persisted interaction",
);
replaceOnce(
  'isBoundary: drill.kind === "boundary" }));',
  'isBoundary: drill.kind === "boundary", transferProbe: drill.kind === "changed" ? { isTransferProbe: true, variantDistance: session.mode === "review" ? "MEDIUM" : "NEAR", changedVariables: [drill.variantGroup, drill.nodeKey] } : null }));',
  "explicit changed-node transfer probe",
);
replaceOnce('if (feedback) return <div className="feedback-view"', 'if (resolvedFeedback) return <div className="feedback-view"', "recovered feedback branch");
source = source.replaceAll("feedback.responseClass", "resolvedFeedback.responseClass");
replaceOnce(
  '<p className="eyebrow">{drill.moduleId.toUpperCase()} · {drill.kind}</p>',
  '<p className="eyebrow">{drill.moduleId.toUpperCase()} · {drillKindLabel(locale, drill.kind)}</p>',
  "drill kind label",
);
replaceOnce(
  'function Review({ state, onReview, onRepair }: { state: LearnerState; onReview: () => void; onRepair: (id: ModuleId) => void }) { const { content, t } = useI18n();',
  'function Review({ state, onReview, onRepair }: { state: LearnerState; onReview: () => void; onRepair: (id: ModuleId) => void }) { const { content, locale, t } = useI18n();',
  "review locale",
);
replaceOnce(
  '<span className={`kind kind-${item.kind}`}>{item.kind}</span>',
  '<span className={`kind kind-${item.kind}`}>{reviewKindLabel(locale, item.kind)}</span>',
  "review kind label",
);
replaceOnce(
  'function Cards({ state, setState }: { state: LearnerState; setState: (value: LearnerState) => void }) { const { content, t } = useI18n();',
  'function Cards({ state, setState }: { state: LearnerState; setState: (value: LearnerState) => void }) { const { content, locale, t } = useI18n();',
  "cards locale",
);
replaceOnce(
  '{content.moduleById[card.moduleId].lcm} · {card.kind}',
  '{content.moduleById[card.moduleId].lcm} · {cardKindLabel(locale, card.kind)}',
  "card kind label",
);

const diagnostic = String.raw`function Diagnostic({ state, setState, onExit }: { state: LearnerState; setState: (value: LearnerState) => void; onExit: () => void }) {
  const { content, locale, t } = useI18n();
  const items = getDiagnostic(locale);
  const expectedIds = items.map((entry) => entry.id);
  const diagnostic = state.diagnostic;
  const item = items[diagnostic.responses.length];
  const previewContext = diagnostic.measurementContext ?? (hasLearningExposure(state) ? "POST_LEARNING_DIAGNOSTIC" : "COLD_BASELINE");
  const [answer, setAnswer] = useState("");
  const [reasoning, setReasoning] = useState("");
  const [confidence, setConfidence] = useState(65);
  const [startedAt, setStartedAt] = useState(Date.now());
  const begin = () => setState(startDiagnosticRun(state, locale));
  const submit = () => {
    if (!item || !answer.trim() || !reasoning.trim()) return;
    const response: DiagnosticRawResponse = {
      item_id: item.id,
      answer: answer.trim(),
      reasoning: reasoning.trim(),
      confidence,
      time_seconds: Math.max(1, Math.round((Date.now() - startedAt) / 1000)),
      locale,
    };
    setState(recordDiagnosticResponse(state, response, expectedIds));
    setAnswer("");
    setReasoning("");
    setConfidence(65);
    setStartedAt(Date.now());
  };
  async function importEvaluated(file: File) {
    try {
      const score = parseDiagnosticScore(JSON.parse(await file.text()));
      if (score.measurement_context !== diagnostic.measurementContext) throw new Error(locale === "ru" ? "Контекст scorer-файла не совпадает с этим запуском T1." : "The scorer context does not match this T1 run.");
      if (score.locale_at_start !== diagnostic.localeAtStart) throw new Error(locale === "ru" ? "Язык начала scorer-файла не совпадает с этим запуском T1." : "The scorer start locale does not match this T1 run.");
      const priority = deriveDiagnosticPriorityModules(score);
      setState(mutate(state, (next) => {
        next.diagnostic.status = priority.length ? "ROUTED" : "SCORED";
        next.diagnostic.priorityModules = priority;
        next.diagnostic.importedAt = new Date().toISOString();
        for (const moduleId of priority) {
          next.modules[moduleId].state = "REPAIR_REQUIRED";
          next.modules[moduleId].highConfidenceError = true;
        }
      }));
    } catch (error) {
      alert(error instanceof Error ? error.message : t("importEvaluatedError"));
    }
  }
  const contextLabel = previewContext === "COLD_BASELINE" ? t("t1ColdAvailable") : previewContext === "POST_LEARNING_DIAGNOSTIC" ? t("t1PostLearning") : (locale === "ru" ? "T1 · СМЕШАННЫЙ КОНТЕКСТ" : "T1 · MIXED EXPOSURE");
  const instruction = previewContext === "COLD_BASELINE" ? t("coldInstruction") : previewContext === "POST_LEARNING_DIAGNOSTIC" ? t("postInstruction") : (locale === "ru" ? "Во время T1 началось обучение. Результат можно использовать для маршрута, но нельзя считать исходным замером." : "Learning started during T1. The result can guide routing but is not a valid cold baseline.");
  if (diagnostic.status === "NOT_STARTED") return <section className="surface"><div className="section-head"><p className="eyebrow">{contextLabel}</p><h1>{t("diagnoseLine1")}<br/><em>{t("diagnoseLine2")}</em></h1><p>{previewContext === "COLD_BASELINE" ? t("coldBody") : t("postBody")}</p><button className="primary" onClick={begin}>{t("startT1")} <span>→</span></button></div></section>;
  if (["AWAITING_REVIEW", "SCORED", "ROUTED"].includes(diagnostic.status)) return <section className="surface"><div className="section-head"><p className="eyebrow">T1 · {diagnosticStatusLabel(locale, diagnostic.status)}</p><h1>{diagnostic.responses.length}/10 {t("answersSaved")}</h1><p>{t("rawHonesty")}</p>{diagnostic.measurementContext === "MIXED_EXPOSURE_INVALID_FOR_BASELINE" && <p className="notice">{instruction}</p>}<div className="button-row"><button className="primary" onClick={() => downloadJson("live-cash-t1-raw.json", { schema_version: "raw-0.2", learner_id: "current_learner", tranche_id: "T1", measurement_context: diagnostic.measurementContext ?? "MIXED_EXPOSURE_INVALID_FOR_BASELINE", locale_at_start: diagnostic.localeAtStart ?? "ru", submitted_at: diagnostic.submittedAt, responses: diagnostic.responses })}>{t("downloadRaw")} <span>↓</span></button><label className="file-button">{t("importEvaluated")}<input type="file" accept="application/json" onChange={(event) => { const file = event.target.files?.[0]; if (file) void importEvaluated(file); }} /></label></div>{diagnostic.priorityModules.map((moduleId) => <p key={moduleId} className="priority-box">{content.moduleById[moduleId].lcm} · {content.moduleById[moduleId].title}</p>)}</div></section>;
  if (!item) return null;
  return <section className="session"><SessionHeader label={\`T1 · \${diagnostic.responses.length + 1}/10\`} progress={Math.round(((diagnostic.responses.length + 1) / 10) * 100)} onExit={onExit} /><p className="eyebrow">{item.id} · {item.title}</p><p className="support">{instruction}</p><h2>{item.prompt}</h2><label className="diagnostic-input">{t("actionDirection")}<textarea value={answer} onChange={(event) => setAnswer(event.target.value)} /></label><label className="diagnostic-input">{t("oneSentenceReason")}<textarea value={reasoning} onChange={(event) => setReasoning(event.target.value)} /></label><label className="confidence">{t("confidence")} <b>{confidence}%</b><input type="range" min="0" max="100" value={confidence} onChange={(event) => setConfidence(Number(event.target.value))} /></label><button className="primary" disabled={!answer.trim() || !reasoning.trim()} onClick={submit}>{t("lockResponse")} <span>→</span></button></section>;
}`;
replaceBlock("function Diagnostic(", "function Debug(", diagnostic, "diagnostic runtime");

if (source.includes("feedback.drill.")) throw new Error("Locale-stale feedback references remain");
if (source.includes("if (feedback) return")) throw new Error("Feedback recovery was not installed");
if (source.includes('baselineEligible ? "COLD_BASELINE"')) throw new Error("Dynamic diagnostic context remains");
if (source.includes("payload.priority_modules")) throw new Error("Weak diagnostic import remains");
if (!source.includes("transferProbe: drill.kind === \"changed\"")) throw new Error("Explicit transfer probe was not installed");
await writeFile(path, source, "utf8");
console.log("Postprocessed bilingual runtime with stable feedback, fixed T1 context, strict scorer import and explicit transfer probes.");
