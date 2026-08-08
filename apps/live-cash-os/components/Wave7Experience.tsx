"use client";

import { useState } from "react";
import { moduleById, modules } from "../content/modules";
import type { LearnerState, LocaleCode, ModuleId } from "../lib/model";
import {
  addFieldResult,
  captureFieldHand,
  deriveCalibrationSummary,
  deriveProgressExplanation,
  explainBackRecords,
  reviewExplainBack,
  reviewFieldHand,
  validateFieldHandInput,
  type FieldHandInput,
  type FieldReviewOutcome,
  type StructuredFieldNote,
} from "../lib/wave7";

const emptyHand = (): FieldHandInput => ({
  moduleId: "geometry",
  stakes: "",
  heroPosition: "",
  villainPositions: "",
  effectiveStacks: "",
  straddle: "",
  actionSequence: "",
  board: "",
  sizings: "",
  cue: "",
  action: "",
  reason: "",
  confidence: 65,
  populationRead: "",
  populationReadConfidence: 50,
});

const REQUIRED_HAND_FIELDS = [
  "stakes",
  "heroPosition",
  "villainPositions",
  "effectiveStacks",
  "straddle",
  "actionSequence",
  "board",
  "sizings",
  "cue",
  "action",
  "reason",
] as const satisfies readonly (keyof FieldHandInput)[];

function copy(locale: LocaleCode) {
  return locale === "ru" ? {
    captureTitle: "Запиши решение до результата",
    captureBody: "Здесь фиксируй реальную раздачу до того, как результат повлияет на оценку решения. Сначала ситуация, наблюдение, действие и причина; результат добавляется после сохранения. Одна раздача — наблюдение, а не доказательство частоты или общего типа игрока.",
    stakes: "Лимиты",
    heroPosition: "Позиция Hero",
    villainPositions: "Позиции релевантных соперников",
    effectiveStacks: "Эффективные стеки",
    straddle: "Страддл / без страддла",
    actionSequence: "Последовательность действий",
    board: "Борд (для префлопа: preflop)",
    sizings: "Сайзинги",
    cue: "Что заметил до решения",
    action: "Как сыграл",
    reason: "Почему — до результата",
    confidence: "Уверенность",
    confidenceHelp: "Это грубая самооценка, а не точная вероятность. Отметь примерно, насколько был уверен до результата.",
    populationRead: "Рид на поле / игрока (если релевантно)",
    populationConfidence: "Уверенность в риде",
    module: "Связанная тема",
    lock: "Зафиксировать решение",
    locked: "Решение зафиксировано до результата",
    requiredProgress: "обязательных полей заполнено",
    missingFields: "Не хватает",
    allRequired: "Все обязательные поля заполнены. Можно фиксировать решение.",
    resultTitle: "Результат — отдельным шагом",
    result: "Результат",
    showdown: "Шоудаун (если был)",
    addResult: "Добавить результат",
    resultRequired: "Укажи результат; шоудаун можно оставить пустым, если его не было.",
    review: "Разбор",
    reviewPlaceholder: "Коротко: что подтверждено или что нужно исправить…",
    reviewRequired: "Добавь короткий комментарий разбора — без него эти действия недоступны.",
    legacyTransferBlocked: "Эту старую запись нельзя засчитать как поддержку переноса: в ней нет зафиксированного решения до результата.",
    insufficient: "Недостаточно данных",
    reviewedOk: "Разобрано, дополнительная практика не нужна",
    repair: "Нужна практика",
    supports: "Поддерживает перенос",
    explainInbox: "Объяснение своими словами ждёт разбора",
    noInbox: "Новых explain-back для разбора нет.",
    earlier: "Раннее объяснение",
    later: "Последнее объяснение",
    evidence: "Доказательства",
    next: "Что дальше",
    calibration: "Уверенность по последним решениям",
    sample: "решений",
    over: "ошибок с высокой уверенностью",
    under: "верных ответов с низкой уверенностью",
    notEnoughCalibration: "Пока мало решений для полезной картины уверенности.",
    fieldSupports: "разобранных рук в поддержку",
    delayed: "успешных повторов после паузы",
    variants: "успешных изменённых ситуаций",
    pendingRepair: "заданий на работу над ошибкой",
  } : {
    captureTitle: "Record the decision before the result",
    captureBody: "Use this section to capture a real hand before the result can bias the decision review. Lock the spot, what you noticed, your action and your reason first; add the result afterward. One hand is an observation, not proof of a frequency or a global player type.",
    stakes: "Stakes",
    heroPosition: "Hero position",
    villainPositions: "Relevant villain positions",
    effectiveStacks: "Effective stacks",
    straddle: "Straddle / no straddle",
    actionSequence: "Action sequence",
    board: "Board (use preflop before the flop)",
    sizings: "Sizings",
    cue: "What you noticed before acting",
    action: "What you did",
    reason: "Why — before the result",
    confidence: "Confidence",
    confidenceHelp: "This is a rough self-rating, not an exact probability. Mark approximately how sure you were before seeing the result.",
    populationRead: "Population / player read (if relevant)",
    populationConfidence: "Confidence in the read",
    module: "Linked topic",
    lock: "Lock the decision",
    locked: "Decision locked before the result",
    requiredProgress: "required fields complete",
    missingFields: "Missing",
    allRequired: "All required fields are complete. You can lock the decision.",
    resultTitle: "Result — added separately",
    result: "Result",
    showdown: "Showdown (if any)",
    addResult: "Add result",
    resultRequired: "Enter the result; showdown can stay empty if there was none.",
    review: "Review",
    reviewPlaceholder: "Briefly: what was supported or what needs repair…",
    reviewRequired: "Add a short review note before choosing a review outcome.",
    legacyTransferBlocked: "This legacy note cannot support transfer because it has no decision locked before the result.",
    insufficient: "Not enough information",
    reviewedOk: "Reviewed, no extra practice",
    repair: "Needs practice",
    supports: "Supports transfer",
    explainInbox: "Your explanation is awaiting review",
    noInbox: "No new explain-back is waiting for review.",
    earlier: "Earlier explanation",
    later: "Latest explanation",
    evidence: "Evidence",
    next: "What next",
    calibration: "Confidence in recent decisions",
    sample: "decisions",
    over: "high-confidence misses",
    under: "correct low-confidence answers",
    notEnoughCalibration: "There are not enough decisions yet for a useful confidence pattern.",
    fieldSupports: "reviewed supporting hands",
    delayed: "successful reviews after a delay",
    variants: "successful changed spots",
    pendingRepair: "mistake-practice tasks queued",
  };
}

function fieldStatus(locale: LocaleCode, note: StructuredFieldNote, baseStatusLabel: (locale: LocaleCode, status: string) => string): string {
  const outcome = note.reviewOutcome;
  if (locale === "ru") {
    if (outcome === "SUPPORTS_TRANSFER") return "разобрано: поддерживает перенос";
    if (outcome === "REPAIR_REQUIRED") return "разобрано: нужна практика";
    if (outcome === "REVIEWED_OK") return "разобрано: дополнительная практика не нужна";
    if (outcome === "INSUFFICIENT" || note.status === "INSUFFICIENT") return "недостаточно данных";
    return baseStatusLabel(locale, note.status);
  }
  if (outcome === "SUPPORTS_TRANSFER") return "reviewed: supports transfer";
  if (outcome === "REPAIR_REQUIRED") return "reviewed: needs practice";
  if (outcome === "REVIEWED_OK") return "reviewed: no extra practice";
  if (outcome === "INSUFFICIENT" || note.status === "INSUFFICIENT") return "not enough information";
  return baseStatusLabel(locale, note.status);
}

export function Wave7ExplainBackHistory({ locale, state, moduleId }: { locale: LocaleCode; state: LearnerState; moduleId: ModuleId }) {
  const c = copy(locale);
  const rows = explainBackRecords(state, moduleId);
  if (!rows.length) return null;
  const first = rows[0];
  const last = rows.at(-1)!;
  return <div className="w7-history">
    <article><p className="eyebrow">{c.earlier}</p><p>{first.text}</p></article>
    {last.id !== first.id && <article><p className="eyebrow">{c.later}</p><p>{last.text}</p></article>}
  </div>;
}

export function Wave7ProgressDetails({ locale, state, moduleId }: { locale: LocaleCode; state: LearnerState; moduleId: ModuleId }) {
  const c = copy(locale);
  const progress = deriveProgressExplanation(state, moduleId, locale);
  const calibration = deriveCalibrationSummary(state, moduleId);
  return <div className="w7-progress">
    <p><b>{c.evidence}:</b> {progress.reason}</p>
    <p><b>{c.next}:</b> {progress.next}</p>
    <p className="support">{progress.fieldSupports} {c.fieldSupports} · {progress.delayedSuccesses} {c.delayed} · {progress.variantSuccesses} {c.variants} · {progress.pendingRepairs} {c.pendingRepair}</p>
    <p className="support"><b>{c.calibration}:</b> {calibration.sampleSize < 5
      ? c.notEnoughCalibration
      : `${calibration.sampleSize} ${c.sample} · ${calibration.overconfidenceCases} ${c.over} · ${calibration.underconfidenceCases} ${c.under}`}</p>
  </div>;
}

export function Wave7FieldPanel({ locale, state, setState, fieldStatusLabel, fieldFactLabels }: { locale: LocaleCode; state: LearnerState; setState: (value: LearnerState) => void; fieldStatusLabel: (locale: LocaleCode, status: string) => string; fieldFactLabels: (locale: LocaleCode) => { cue: string; action: string; reason: string } }) {
  const c = copy(locale);
  const facts = fieldFactLabels(locale);
  const [hand, setHand] = useState<FieldHandInput>(emptyHand);
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [resultDrafts, setResultDrafts] = useState<Record<string, string>>({});
  const [showdownDrafts, setShowdownDrafts] = useState<Record<string, string>>({});
  const [explainNotes, setExplainNotes] = useState<Record<string, string>>({});
  const explainPending = explainBackRecords(state).filter((row) => row.status === "PENDING_REVIEW");
  const errors = validateFieldHandInput(hand);
  const requiredLabels: Record<(typeof REQUIRED_HAND_FIELDS)[number], string> = {
    stakes: c.stakes,
    heroPosition: c.heroPosition,
    villainPositions: c.villainPositions,
    effectiveStacks: c.effectiveStacks,
    straddle: c.straddle,
    actionSequence: c.actionSequence,
    board: c.board,
    sizings: c.sizings,
    cue: facts.cue,
    action: facts.action,
    reason: facts.reason,
  };
  const missingRequired = REQUIRED_HAND_FIELDS.filter((key) => errors.includes(key));
  const completedRequired = REQUIRED_HAND_FIELDS.length - missingRequired.length;

  function patch<K extends keyof FieldHandInput>(key: K, value: FieldHandInput[K]) {
    setHand((current) => ({ ...current, [key]: value }));
  }

  function save() {
    if (errors.length) return;
    setState(captureFieldHand(state, hand));
    setHand(emptyHand());
  }

  function reviewHand(noteId: string, outcome: FieldReviewOutcome) {
    const text = reviewNotes[noteId] ?? "";
    if (!text.trim()) return;
    setState(reviewFieldHand(state, noteId, outcome, text));
  }

  return <section className="surface">
    <div className="section-head"><p className="eyebrow">{locale === "ru" ? "РЕАЛЬНЫЕ РАЗДАЧИ" : "REAL HANDS"}</p><h1>{c.captureTitle}</h1><p>{c.captureBody}</p></div>

    <section className="w7-review-inbox">
      <h2>{c.explainInbox}</h2>
      {!explainPending.length && <p className="support">{c.noInbox}</p>}
      <div className="field-list">{explainPending.map((record) => {
        const reviewText = explainNotes[record.id] ?? "";
        return <article key={record.id}>
          <span className="kind">{locale === "ru" ? "ждёт разбора" : "awaiting review"}</span>
          <h3>{moduleById[record.moduleId].shortTitle}</h3>
          <p>{record.text}</p>
          <textarea aria-label={`${c.review} ${record.id}`} placeholder={c.reviewPlaceholder} value={reviewText} onChange={(event) => setExplainNotes((current) => ({ ...current, [record.id]: event.target.value }))} />
          {!reviewText.trim() && <p className="support">{c.reviewRequired}</p>}
          <div className="review-actions">
            <button disabled={!reviewText.trim()} onClick={() => setState(reviewExplainBack(state, record.id, "INSUFFICIENT", reviewText))}>{c.insufficient}</button>
            <button disabled={!reviewText.trim()} onClick={() => setState(reviewExplainBack(state, record.id, "REVIEWED_REPAIR", reviewText))}>{c.repair}</button>
            <button className="primary" disabled={!reviewText.trim()} onClick={() => setState(reviewExplainBack(state, record.id, "REVIEWED_OK", reviewText))}>{c.reviewedOk}</button>
          </div>
        </article>;
      })}</div>
    </section>

    <div className="field-layout">
      <div className="field-form">
        <label>{c.module}<select value={hand.moduleId} onChange={(event) => patch("moduleId", event.target.value as ModuleId)}>{modules.map((module) => <option key={module.id} value={module.id}>{module.lcm} · {module.shortTitle}</option>)}</select></label>
        <label>{c.stakes}<input value={hand.stakes} onChange={(event) => patch("stakes", event.target.value)} placeholder="1/3, 2/5…" /></label>
        <label>{c.heroPosition}<input value={hand.heroPosition} onChange={(event) => patch("heroPosition", event.target.value)} placeholder="BTN, BB…" /></label>
        <label>{c.villainPositions}<input value={hand.villainPositions} onChange={(event) => patch("villainPositions", event.target.value)} placeholder="CO, SB…" /></label>
        <label>{c.effectiveStacks}<input value={hand.effectiveStacks} onChange={(event) => patch("effectiveStacks", event.target.value)} placeholder="150bb vs BTN" /></label>
        <label>{c.straddle}<input value={hand.straddle} onChange={(event) => patch("straddle", event.target.value)} placeholder={locale === "ru" ? "без страддла / $10 UTG" : "no straddle / $10 UTG"} /></label>
        <label>{c.actionSequence}<textarea value={hand.actionSequence} onChange={(event) => patch("actionSequence", event.target.value)} /></label>
        <label>{c.board}<input value={hand.board} onChange={(event) => patch("board", event.target.value)} placeholder="Qh 7d 4c / preflop" /></label>
        <label>{c.sizings}<input value={hand.sizings} onChange={(event) => patch("sizings", event.target.value)} placeholder="3bb → 12bb; flop 25%" /></label>
        <label>{facts.cue}<textarea value={hand.cue} onChange={(event) => patch("cue", event.target.value)} /></label>
        <label>{facts.action}<textarea value={hand.action} onChange={(event) => patch("action", event.target.value)} /></label>
        <label>{facts.reason} — {locale === "ru" ? "до результата" : "before the result"}<textarea value={hand.reason} onChange={(event) => patch("reason", event.target.value)} /></label>
        <label className="confidence">{c.confidence} <b>{locale === "ru" ? "примерно" : "roughly"} {hand.confidence}%</b><input type="range" min="0" max="100" step="5" value={hand.confidence} onChange={(event) => patch("confidence", Number(event.target.value))} /></label>
        <p className="support">{c.confidenceHelp}</p>
        <label>{c.populationRead}<textarea value={hand.populationRead ?? ""} onChange={(event) => patch("populationRead", event.target.value)} /></label>
        {(hand.populationRead ?? "").trim() && <><label className="confidence">{c.populationConfidence} <b>{locale === "ru" ? "примерно" : "roughly"} {hand.populationReadConfidence ?? 50}%</b><input type="range" min="0" max="100" step="5" value={hand.populationReadConfidence ?? 50} onChange={(event) => patch("populationReadConfidence", Number(event.target.value))} /></label><p className="support">{c.confidenceHelp}</p></>}
        <p className="support"><b>{completedRequired}/{REQUIRED_HAND_FIELDS.length} {c.requiredProgress}.</b> {missingRequired.length ? `${c.missingFields}: ${missingRequired.map((key) => requiredLabels[key]).join(", ")}.` : c.allRequired}</p>
        <button className="primary" disabled={errors.length > 0} onClick={save}>{c.lock} <span>→</span></button>
      </div>

      <div className="field-list">{[...(state.fieldNotes as StructuredFieldNote[])].reverse().map((note) => {
        const reviewText = reviewNotes[note.id] ?? "";
        const resultText = resultDrafts[note.id] ?? "";
        const showdownText = showdownDrafts[note.id] ?? "";
        return <article key={note.id}>
          <span className={`kind kind-${note.status.toLowerCase()}`}>{fieldStatus(locale, note, fieldStatusLabel)}</span>
          <h3>{moduleById[note.moduleId].shortTitle}</h3>
          {note.decisionLockedAt && <p className="assumption-strip"><b>{c.locked}</b> · {new Date(note.decisionLockedAt).toLocaleString(locale === "ru" ? "ru-RU" : "en-US")}</p>}
          {note.stakes && <p><b>{c.stakes}:</b> {note.stakes}</p>}
          {note.heroPosition && <p><b>{c.heroPosition}:</b> {note.heroPosition}</p>}
          {note.villainPositions && <p><b>{c.villainPositions}:</b> {note.villainPositions}</p>}
          {note.effectiveStacks && <p><b>{c.effectiveStacks}:</b> {note.effectiveStacks}</p>}
          {note.straddle && <p><b>{c.straddle}:</b> {note.straddle}</p>}
          {note.actionSequence && <p><b>{c.actionSequence}:</b> {note.actionSequence}</p>}
          {note.board && <p><b>{c.board}:</b> {note.board}</p>}
          {note.sizings && <p><b>{c.sizings}:</b> {note.sizings}</p>}
          <p><b>{facts.cue}:</b> {note.cue}</p>
          <p><b>{facts.action}:</b> {note.action}</p>
          <p><b>{facts.reason}:</b> {note.reason}</p>
          {typeof note.confidence === "number" && <p><b>{c.confidence}:</b> {locale === "ru" ? "примерно" : "roughly"} {note.confidence}%</p>}
          {note.populationRead && <p><b>{c.populationRead}:</b> {note.populationRead} ({locale === "ru" ? "примерно" : "roughly"} {note.populationReadConfidence ?? "—"}%)</p>}

          <div className="w7-result">
            <p className="eyebrow">{c.resultTitle}</p>
            {note.result ? <><p><b>{c.result}:</b> {note.result}</p>{note.showdown && <p><b>{c.showdown}:</b> {note.showdown}</p>}</> : note.decisionLockedAt ? <>
              <label>{c.result}<textarea value={resultText} onChange={(event) => setResultDrafts((current) => ({ ...current, [note.id]: event.target.value }))} /></label>
              <label>{c.showdown}<textarea value={showdownText} onChange={(event) => setShowdownDrafts((current) => ({ ...current, [note.id]: event.target.value }))} /></label>
              {!resultText.trim() && <p className="support">{c.resultRequired}</p>}
              <button className="secondary" disabled={!resultText.trim()} onClick={() => setState(addFieldResult(state, note.id, resultText, showdownText))}>{c.addResult}</button>
            </> : <p className="support">{locale === "ru" ? "Старая запись: pre-result lock ещё не существовал." : "Legacy note: the pre-result lock did not exist yet."}</p>}
          </div>

          {note.status === "PENDING_REVIEW" ? <>
            <textarea aria-label={`${c.review} ${note.id}`} placeholder={c.reviewPlaceholder} value={reviewText} onChange={(event) => setReviewNotes((current) => ({ ...current, [note.id]: event.target.value }))} />
            {!reviewText.trim() && <p className="support">{c.reviewRequired}</p>}
            {!note.decisionLockedAt && <p className="support">{c.legacyTransferBlocked}</p>}
            <div className="review-actions">
              <button disabled={!reviewText.trim()} onClick={() => reviewHand(note.id, "INSUFFICIENT")}>{c.insufficient}</button>
              <button disabled={!reviewText.trim()} onClick={() => reviewHand(note.id, "REVIEWED_OK")}>{c.reviewedOk}</button>
              <button disabled={!reviewText.trim()} onClick={() => reviewHand(note.id, "REPAIR_REQUIRED")}>{c.repair}</button>
              <button className="primary" disabled={!reviewText.trim() || !note.decisionLockedAt} onClick={() => reviewHand(note.id, "SUPPORTS_TRANSFER")}>{c.supports}</button>
            </div>
          </> : <p className="support"><b>{c.review}:</b> {note.evaluatorNote || "—"}</p>}
        </article>;
      })}</div>
    </div>
  </section>;
}
