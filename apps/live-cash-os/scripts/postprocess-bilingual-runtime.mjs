import { readFile, writeFile } from "node:fs/promises";

const path = new URL("../components/LiveCashApp.tsx", import.meta.url);
let source = await readFile(path, "utf8");

function replaceOnce(from, to, label) {
  if (!source.includes(from)) throw new Error(`Postprocess target missing: ${label}`);
  source = source.replace(from, to);
}

replaceOnce(
  'import { ui, type Locale, type UiKey } from "../content/i18n/ui";',
  'import { cardKindLabel, diagnosticStatusLabel, drillKindLabel, learningModeLabel, reviewKindLabel } from "../content/i18n/labels";\nimport { ui, type Locale, type UiKey } from "../content/i18n/ui";',
  "locale label imports",
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
replaceOnce(
  'const response: DiagnosticRawResponse = { item_id: item.id, answer: answer.trim(), reasoning: reasoning.trim(), confidence, time_seconds: Math.max(1, Math.round((Date.now() - startedAt) / 1000)) };',
  'const response: DiagnosticRawResponse = { item_id: item.id, answer: answer.trim(), reasoning: reasoning.trim(), confidence, time_seconds: Math.max(1, Math.round((Date.now() - startedAt) / 1000)), locale };',
  "per-response diagnostic locale",
);
replaceOnce(
  'schema_version: "raw-0.1"',
  'schema_version: "raw-0.2"',
  "bilingual raw diagnostic schema version",
);
replaceOnce(
  '<p className="eyebrow">T1 · {diagnostic.status}</p>',
  '<p className="eyebrow">T1 · {diagnosticStatusLabel(locale, diagnostic.status)}</p>',
  "diagnostic status label",
);

if (source.includes("feedback.drill.")) throw new Error("Locale-stale feedback references remain");
if (source.includes("if (feedback) return")) throw new Error("Feedback recovery was not installed");
await writeFile(path, source, "utf8");
console.log("Postprocessed bilingual runtime labels, feedback recovery and raw diagnostic v0.2 locale context.");
