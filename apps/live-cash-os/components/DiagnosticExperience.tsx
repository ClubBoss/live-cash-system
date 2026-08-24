"use client";

import { useMemo, useState } from "react";
import { diagnosticT1 } from "../content/diagnostic";
import { drillById, moduleById } from "../content/modules";
import {
  assessDiagnosticResponses,
  diagnosticFeedbackLevelLabel,
  isStructuredDiagnosticResponse,
} from "../lib/diagnostic-feedback";
import {
  recordDiagnosticResponse,
  startDiagnosticRun,
  type LearnerState,
  type LocaleCode,
} from "../lib/model";
import { applyReviewedDiagnostic } from "../lib/wave7";

const T1_IDS = diagnosticT1.map((item) => item.id);

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

function downloadJson(filename: string, value: unknown) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], { type: "application/json" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function optionText(options: Array<{ id: string; text: string }>, id: string): string {
  return options.find((option) => option.id === id)?.text ?? "—";
}

function levelClass(level: string): string {
  return level === "NEEDS_WORK" ? "counterexample" : "answer-panel";
}

export default function DiagnosticExperience({
  locale,
  state,
  setState,
  onExit,
}: {
  locale: LocaleCode;
  state: LearnerState;
  setState: (value: LearnerState) => void;
  onExit: () => void;
  onRouted?: () => void;
}) {
  const diagnostic = state.diagnostic;
  const sourceItem = diagnosticT1[diagnostic.responses.length];
  const drill = sourceItem ? drillById[sourceItem.drillId] : undefined;
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null);
  const [selectedReasonId, setSelectedReasonId] = useState<string | null>(null);
  const [confidence, setConfidence] = useState(65);
  const [startedAt, setStartedAt] = useState(Date.now());
  const runSeed = diagnostic.runId ?? "diagnostic-not-started";
  const actionOptions = useMemo(() => drill ? shuffle(drill.actionOptions, `${runSeed}:${drill.id}:action`) : [], [drill, runSeed]);
  const reasonOptions = useMemo(() => drill ? shuffle(drill.reasonOptions, `${runSeed}:${drill.id}:reason`) : [], [drill, runSeed]);
  const assessment = assessDiagnosticResponses(diagnostic.responses);
  const legacyRun = diagnostic.responses.length > 0 && diagnostic.responses.some((response) => !isStructuredDiagnosticResponse(response));
  const ru = locale === "ru";

  const role = ru
    ? "Диагностика — необязательная проверка текущего хода решения. Выбери действие, причину и примерную уверенность. Ответы скрыты до конца всех 10 ситуаций. Результат показывает рекомендуемые темы для старта, но не выбирает точный навык и сам по себе не подтверждает освоение."
    : "Diagnostic is an optional check of how you currently make decisions. Choose an action, a reason, and rough confidence. Answers stay hidden until all 10 spots are complete. The result suggests topics to start from, but it does not choose an exact skill or prove mastery by itself.";

  function begin() {
    setSelectedActionId(null);
    setSelectedReasonId(null);
    setConfidence(65);
    setStartedAt(Date.now());
    setState(startDiagnosticRun(state, locale));
  }

  function submit() {
    if (!sourceItem || !drill || !selectedActionId || !selectedReasonId) return;
    setState(recordDiagnosticResponse(state, {
      item_id: sourceItem.id,
      answer: selectedActionId,
      reasoning: selectedReasonId,
      confidence,
      time_seconds: Math.max(1, Math.round((Date.now() - startedAt) / 1000)),
      locale,
    }, T1_IDS));
    setSelectedActionId(null);
    setSelectedReasonId(null);
    setConfidence(65);
    setStartedAt(Date.now());
  }

  function exportRun() {
    downloadJson("live-cash-t1-raw-v0.2.json", {
      schema_version: "raw-0.2",
      learner_id: "current_learner",
      tranche_id: "T1",
      run_id: diagnostic.runId,
      measurement_context: diagnostic.measurementContext,
      locale_at_start: diagnostic.localeAtStart,
      submitted_at: diagnostic.submittedAt,
      responses: diagnostic.responses,
    });
  }

  if (diagnostic.status === "NOT_STARTED") {
    return <section className="surface"><div className="section-head">
      <p className="eyebrow">{ru ? "СТАРТОВАЯ ДИАГНОСТИКА" : "STARTING DIAGNOSTIC"}</p>
      <h1>{ru ? "Проверь, как принимаешь решения сейчас." : "Check how you make decisions now."}</h1>
      <p className="support">{ru ? "10 ситуаций · около 15 минут · можно пропустить" : "10 spots · about 15 minutes · optional"}</p>
      <p>{role}</p>
      <p className="support">{ru ? "Ответы сохранятся для отдельного разбора. Формат тот же, что в практике: действие → причина → уверенность. Диагностика использует отдельные проверочные ситуации, чтобы последующий урок не превращался в узнавание уже показанного ответа." : "Your answers are saved for a separate review. The format matches practice: action → reason → confidence. Diagnostic uses separate check spots so the later lesson does not become recognition of an answer you have already seen."}</p>
      <button className="primary" onClick={begin}>{ru ? "Начать диагностику" : "Start Diagnostic"} <span aria-hidden="true">→</span></button>
    </div></section>;
  }

  if (legacyRun) {
    return <section className="surface"><div className="section-head">
      <p className="eyebrow">{ru ? "ДИАГНОСТИКА · СОХРАНЁН ПРЕДЫДУЩИЙ ФОРМАТ" : "DIAGNOSTIC · PREVIOUS FORMAT SAVED"}</p>
      <h1>{diagnostic.responses.length}/10 {ru ? "ответов из предыдущего формата сохранено." : "responses from the previous format are saved."}</h1>
      <p>{ru ? "Их нельзя честно оценить автоматически: в старых ответах нет однозначно выбранных вариантов действия и причины." : "They cannot be scored honestly by the app because the older answers do not contain unambiguous action and reason choices."}</p>
      <p className="support">{ru ? "Можно скачать старую попытку перед перезапуском. Новый запуск использует текущий формат; старые ответы не меняют статус навыка." : "You can download the previous attempt before restarting. A new run uses the current format; the older answers do not change skill status."}</p>
      <div className="button-row"><button className="secondary" onClick={exportRun}>{ru ? "Скачать старую попытку" : "Download previous run"}</button><button className="primary" onClick={begin}>{ru ? "Начать новый формат" : "Start current format"} <span aria-hidden="true">→</span></button></div>
    </div></section>;
  }

  if (["AWAITING_REVIEW", "SCORED", "ROUTED"].includes(diagnostic.status) && assessment.structured) {
    const counts = assessment.items.reduce((result, item) => {
      result[item.level] = (result[item.level] ?? 0) + 1;
      return result;
    }, {} as Record<string, number>);
    const continueToPractical = () => {
      setState(applyReviewedDiagnostic(state, assessment.priorityModules));
      window.location.assign("/mastery/journey");
    };
    return <section className="surface">
      <div className="section-head">
        <p className="eyebrow">{ru ? "ДИАГНОСТИКА · ФИДБЕК" : "DIAGNOSTIC · FEEDBACK"}</p>
        <h1>{ru ? "Теперь видно, с каких тем разумно начать." : "Now you can see which topics are reasonable starting areas."}</h1>
        <p>{role}</p>
        <div className="metrics">
          <div><b>{counts.STRONG ?? 0}</b><span>{diagnosticFeedbackLevelLabel("STRONG", locale)}</span></div>
          <div><b>{counts.FRAGILE ?? 0}</b><span>{diagnosticFeedbackLevelLabel("FRAGILE", locale)}</span></div>
          <div><b>{counts.NEEDS_WORK ?? 0}</b><span>{diagnosticFeedbackLevelLabel("NEEDS_WORK", locale)}</span></div>
          <div><b>{counts.UNCERTAIN ?? 0}</b><span>{diagnosticFeedbackLevelLabel("UNCERTAIN", locale)}</span></div>
        </div>
        <p className="assumption-strip">{ru ? "Это рекомендации по темам, а не точный маршрут Practical. Диагностика не повышает mastery, не обходит предпосылки и не угадывает один canonical skill из широкой темы." : "These are topic recommendations, not an exact Practical route. Diagnostic does not advance mastery, bypass prerequisites, or guess one canonical skill from a broad topic."}</p>
        {assessment.priorityModules.length > 0 && <><h2>{ru ? "Рекомендуемые темы для старта" : "Recommended starting areas"}</h2>{assessment.priorityModules.map((moduleId) => <p key={moduleId} className="priority-box">{moduleById[moduleId].lcm} · {moduleById[moduleId].title}</p>)}</>}
        <button className="primary" onClick={continueToPractical}>{ru ? "Перейти в Practical" : "Continue in Practical"} <span aria-hidden="true">→</span></button>
        <button className="textbutton" onClick={exportRun}>{ru ? "Скачать ответы" : "Download responses"}</button>
      </div>
      <div className="queue">{assessment.items.map((item, index) => {
        const sourceDrill = drillById[item.drillId];
        const response = diagnostic.responses.find((candidate) => candidate.item_id === item.itemId)!;
        return <article key={item.itemId} className={levelClass(item.level)}>
          <span className="kind">{index + 1}/10 · {diagnosticFeedbackLevelLabel(item.level, locale)}</span>
          <h3>{moduleById[sourceDrill.moduleId].lcm} · {sourceDrill.question}</h3>
          <p><b>{ru ? "Твой выбор" : "Your choice"}</b></p>
          <p>{ru ? "Действие" : "Action"}: {optionText(sourceDrill.actionOptions, response.answer)}</p>
          <p>{ru ? "Причина" : "Reason"}: {optionText(sourceDrill.reasonOptions, response.reasoning)}</p>
          <p className="support">{ru ? "Уверенность" : "Confidence"}: {response.confidence}%</p>
          <details><summary>{ru ? "Показать рабочий ответ и объяснение" : "Show working answer and explanation"}</summary><p><b>{ru ? "Рабочее действие" : "Working action"}</b>: {optionText(sourceDrill.actionOptions, sourceDrill.correctActionId)}</p><p><b>{ru ? "Рабочая причина" : "Working reason"}</b>: {optionText(sourceDrill.reasonOptions, sourceDrill.correctReasonId)}</p><p>{sourceDrill.explanation}</p></details>
        </article>;
      })}</div>
    </section>;
  }

  if (!sourceItem || !drill) return null;
  const missing = [!selectedActionId ? (ru ? "действие" : "an action") : "", !selectedReasonId ? (ru ? "причину" : "a reason") : ""].filter(Boolean);
  const spotNumber = diagnostic.responses.length + 1;
  return <section className="session">
    <div className="session-head"><div><span>{ru ? "Диагностика" : "Diagnostic"} · {spotNumber}/10</span><div className="progress"><i style={{ width: `${Math.round((spotNumber / 10) * 100)}%` }} /></div></div><button className="quiet" onClick={onExit}>{ru ? "Сохранить и выйти" : "Save and exit"}</button></div>
    <p className="eyebrow">{sourceItem.id} · {ru ? `Ситуация ${spotNumber}` : `Diagnostic spot ${spotNumber}`}</p>
    <p className="support">{ru ? "Ответы и объяснение появятся только после 10/10, чтобы не подсказывать следующие вопросы." : "Answers and explanations appear only after 10/10 so earlier feedback cannot cue later questions."}</p>
    <p className="cue">{drill.cue}</p>
    <h2>{drill.question}</h2>
    <p className="assumption-strip">{ru ? "Условия" : "Conditions"}: {drill.assumptions.join(" · ")}</p>
    <fieldset className="answer-set"><legend>{ru ? "Выбери действие" : "Choose an action"}</legend>{actionOptions.map((option) => <button type="button" key={option.id} aria-pressed={selectedActionId === option.id} className={selectedActionId === option.id ? "selected" : ""} onClick={() => setSelectedActionId(option.id)}>{option.text}</button>)}</fieldset>
    <fieldset className="answer-set"><legend>{ru ? "Выбери причину" : "Choose a reason"}</legend>{reasonOptions.map((option) => <button type="button" key={option.id} aria-pressed={selectedReasonId === option.id} className={selectedReasonId === option.id ? "selected" : ""} onClick={() => setSelectedReasonId(option.id)}>{option.text}</button>)}</fieldset>
    <label className="confidence">{ru ? "Уверенность" : "Confidence"} <b>{ru ? "примерно" : "roughly"} {confidence}%</b><input type="range" min="0" max="100" step="5" value={confidence} onChange={(event) => setConfidence(Number(event.target.value))} /></label>
    <p className="support">{ru ? "Грубая самооценка до фидбека, не точная вероятность." : "A rough self-rating before feedback, not an exact probability."}</p>
    {missing.length > 0 && <p className="support">{ru ? `Чтобы сохранить ответ, выбери ${missing.join(" и ")}.` : `To save the response, choose ${missing.join(" and ")}.`}</p>}
    <button className="primary" disabled={missing.length > 0} onClick={submit}>{ru ? "Зафиксировать ответ" : "Lock response"} <span aria-hidden="true">→</span></button>
  </section>;
}
