"use client";

import { useMemo, useState } from "react";
import { diagnosticT1 } from "../content/diagnostic";
import type { Drill, ModuleContent } from "../content/types";
import {
  recordDecision,
  type LearnerState,
  type LocaleCode,
  type TransferProbe,
} from "../lib/model";

const DIAGNOSTIC_DRILL_IDS = new Set(diagnosticT1.map((item) => item.drillId));

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

function transferProbeFor(drill: Drill): TransferProbe | null {
  if (drill.transferProbe) return drill.transferProbe;
  if (drill.kind === "changed") return { isTransferProbe: true, variantDistance: "NEAR", changedVariables: [drill.variantGroup] };
  if (drill.kind === "boundary") return { isTransferProbe: true, variantDistance: "MEDIUM", changedVariables: ["boundary_condition", drill.variantGroup] };
  return null;
}

function optionText(options: Array<{ id: string; text: string }>, id: string | undefined): string {
  return options.find((option) => option.id === id)?.text ?? "—";
}

function verificationDrill(module: ModuleContent, state: LearnerState): Drill {
  const used = new Set([...(state.activeSession?.drillIds ?? []), ...DIAGNOSTIC_DRILL_IDS]);
  const drill = module.drills.find((candidate) => !used.has(candidate.id) && (candidate.kind === "changed" || candidate.kind === "boundary"))
    ?? module.drills.find((candidate) => !used.has(candidate.id));
  if (!drill) throw new Error(`Module ${module.id} has no independent verification drill`);
  return drill;
}

export default function ExplainBackSelfCheck({
  locale,
  state,
  setState,
  module,
  onNext,
}: {
  locale: LocaleCode;
  state: LearnerState;
  setState: (value: LearnerState) => void;
  module: ModuleContent;
  onNext: () => void;
}) {
  const ru = locale === "ru";
  const session = state.activeSession!;
  const drill = verificationDrill(module, state);
  const interaction = [...state.interactions].reverse().find((item) => item.drillId === drill.id && item.mode === "lesson" && Date.parse(item.at) >= Date.parse(session.itemStartedAt));
  const [selfCheck, setSelfCheck] = useState<"covered" | "partial" | "missed" | null>(null);
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null);
  const [selectedReasonId, setSelectedReasonId] = useState<string | null>(null);
  const [confidence, setConfidence] = useState(65);
  const [verificationStartedAt, setVerificationStartedAt] = useState(Date.now());
  const actionOptions = useMemo(() => shuffle(drill.actionOptions, `${session.startedAt}:${drill.id}:explain-action`), [drill, session.startedAt]);
  const reasonOptions = useMemo(() => shuffle(drill.reasonOptions, `${session.startedAt}:${drill.id}:explain-reason`), [drill, session.startedAt]);

  function chooseSelfCheck(value: "covered" | "partial" | "missed") {
    setSelfCheck(value);
    setVerificationStartedAt(Date.now());
  }

  function lock() {
    if (!selectedActionId || !selectedReasonId || interaction) return;
    setState(recordDecision(state, {
      moduleId: drill.moduleId,
      drillId: drill.id,
      nodeKey: drill.nodeKey,
      variantGroup: drill.variantGroup,
      mode: "lesson",
      actionOk: selectedActionId === drill.correctActionId,
      reasonOk: selectedReasonId === drill.correctReasonId,
      selectedActionOptionId: selectedActionId,
      selectedReasonOptionId: selectedReasonId,
      confidence,
      elapsedSeconds: Math.max(1, Math.round((Date.now() - verificationStartedAt) / 1000)),
      targetSeconds: drill.targetSeconds,
      isBoundary: drill.kind === "boundary",
      transferProbe: transferProbeFor(drill),
    }));
  }

  if (interaction) {
    return <>
      <p className="eyebrow">9 · {ru ? "ПРОВЕРКА В НОВЫХ УСЛОВИЯХ" : "TRANSFER CHECK"}</p>
      <h2>{interaction.actionOk && interaction.reasonOk ? (ru ? "Ты применил идею в новой ситуации." : "The mechanism transferred to a new spot.") : (ru ? "Новая ситуация показала, что идею ещё нужно закрепить." : "The changed spot shows the mechanism is still fragile.")}</h2>
      <div className="answer-panel">
        <b>{ru ? "Твой выбор" : "Your choice"}</b>
        <p>{ru ? "Действие" : "Action"}: {optionText(drill.actionOptions, interaction.selectedActionOptionId)}</p>
        <p>{ru ? "Причина" : "Reason"}: {optionText(drill.reasonOptions, interaction.selectedReasonOptionId)}</p>
        <b>{ru ? "Лучший выбор здесь" : "Working choice"}</b>
        <p>{ru ? "Действие" : "Action"}: {optionText(drill.actionOptions, drill.correctActionId)}</p>
        <p>{ru ? "Причина" : "Reason"}: {optionText(drill.reasonOptions, drill.correctReasonId)}</p>
      </div>
      <p className="support">{drill.explanation}</p>
      <p className="assumption-strip">{ru ? "Твоё объяснение и самооценка сами по себе не меняют прогресс. Здесь учитывается только отдельное решение в новой ситуации, которой не было в Диагностике." : "The explain-back and self-check did not award evidence by themselves. Only this separate decision on a spot not used in Diagnostic creates learner evidence."}</p>
      <button className="primary" aria-label={ru ? "Открыть итог урока" : "Open lesson summary"} onClick={onNext}>{ru ? "Открыть итог урока" : "Open lesson summary"} <span aria-hidden="true">→</span></button>
    </>;
  }

  if (!selfCheck) {
    return <>
      <p className="eyebrow">9 · {ru ? "СРАВНИ СВОЁ ОБЪЯСНЕНИЕ" : "COMPARE YOUR EXPLANATION"}</p>
      <h2>{ru ? "Сверь ход решения, а не отдельные слова." : "Compare the mechanism, not exact wording."}</h2>
      <p className="support">{ru ? "Это самопроверка, а не автоматическая оценка текста. Система не ищет ключевые слова и не делает вид, что понимает написанное." : "This is a self-check, not automatic text grading. The system does not keyword-score or pretend it understood your free text."}</p>
      <div className="answer-panel"><b>{ru ? "На что опираться" : "Reference cue"}</b><p>{module.tableCue}</p></div>
      <div className="table-card">{module.tableCard.map((item, index) => <div key={item}><span>{String(index + 1).padStart(2, "0")}</span><b>{item}</b></div>)}</div>
      <details><summary>{ru ? "Термины и подробности" : "Terms and details"}</summary><div className="glossary">{module.glossary.map((item) => <p key={item.term}><b>{item.term}</b>{item.meaning}</p>)}</div></details>
      <p className="support">{ru ? "Что было в твоём объяснении? Эта отметка нужна только тебе и не меняет статус навыка." : "How much of this was present in your explanation? This mark is only for you and does not change skill state."}</p>
      <div className="grade-row">
        <button onClick={() => chooseSelfCheck("covered")}>{ru ? "Покрыл главное" : "Covered the core"}</button>
        <button onClick={() => chooseSelfCheck("partial")}>{ru ? "Частично" : "Partial"}</button>
        <button onClick={() => chooseSelfCheck("missed")}>{ru ? "Упустил главную идею" : "Missed the mechanism"}</button>
      </div>
    </>;
  }

  const missing = [!selectedActionId ? (ru ? "действие" : "an action") : "", !selectedReasonId ? (ru ? "причину" : "a reason") : ""].filter(Boolean);
  return <>
    <p className="eyebrow">9 · {ru ? "ПРОВЕРЬ В НОВОЙ СИТУАЦИИ" : "VERIFY ON A CHANGED SPOT"}</p>
    <h2>{ru ? "Теперь примени ту же идею в другой ситуации." : "Now verify transfer with a separate decision."}</h2>
    <p className="support">{ru ? "Не возвращайся к своему тексту. Выбери действие и причину в изменённой ситуации, которой не было в Диагностике." : "Do not return to your text. Choose an action and reason in a changed situation that was not used in Diagnostic."}</p>
    <p className="cue">{drill.cue}</p>
    <h2>{drill.question}</h2>
    <p className="assumption-strip">{ru ? "Условия" : "Conditions"}: {drill.assumptions.join(" · ")}</p>
    <fieldset className="answer-set"><legend>{ru ? "Выбери действие" : "Choose an action"}</legend>{actionOptions.map((option) => <button type="button" key={option.id} aria-pressed={selectedActionId === option.id} className={selectedActionId === option.id ? "selected" : ""} onClick={() => setSelectedActionId(option.id)}>{option.text}</button>)}</fieldset>
    <fieldset className="answer-set"><legend>{ru ? "Выбери причину" : "Choose a reason"}</legend>{reasonOptions.map((option) => <button type="button" key={option.id} aria-pressed={selectedReasonId === option.id} className={selectedReasonId === option.id ? "selected" : ""} onClick={() => setSelectedReasonId(option.id)}>{option.text}</button>)}</fieldset>
    <label className="confidence">{ru ? "Уверенность" : "Confidence"} <b>{ru ? "примерно" : "roughly"} {confidence}%</b><input type="range" min="0" max="100" step="5" value={confidence} onChange={(event) => setConfidence(Number(event.target.value))} /></label>
    {missing.length > 0 && <p className="support">{ru ? `Чтобы ответить, выбери ${missing.join(" и ")}.` : `To submit, choose ${missing.join(" and ")}.`}</p>}
    <button className="primary" aria-label={ru ? "Зафиксировать решение" : "Lock decision"} disabled={missing.length > 0} onClick={lock}>{ru ? "Зафиксировать решение" : "Lock decision"} <span aria-hidden="true">→</span></button>
  </>;
}