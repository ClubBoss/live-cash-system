"use client";

import { useEffect, useState } from "react";
import { moduleById, modules } from "../content/modules";
import type { LearnerState, LocaleCode, ModuleId } from "../lib/model";
import {
  practicalRepairFocusHref,
  resolvePracticalFieldBinding,
  type PracticalFieldBindingInput,
} from "../lib/practical-field-transfer";
import {
  REAL_HAND_DRAFT_KEY,
  clearUiStorage,
  readProfileScopedUiValue,
  writeProfileScopedUiValue,
} from "../lib/ui-session-storage";
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
  type FieldReviewerKind,
  type FieldReviewOutcome,
  type StructuredFieldNote,
} from "../lib/wave7";
import RealHandCanonicalReview from "./RealHandCanonicalReview";

const REAL_HAND_DRAFT_TTL_MS = 30 * 24 * 60 * 60 * 1_000;
const MAX_DRAFT_TEXT = 5_000;

const emptyHand = (): FieldHandInput => ({
  // Deliberately blank: field evidence must never inherit a silent module.
  moduleId: "" as ModuleId,
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

const DRAFT_STRING_FIELDS = [
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
  "populationRead",
] as const satisfies readonly (keyof FieldHandInput)[];

type PendingFieldSave = {
  revision: number;
  updatedAt: string;
  noteId: string;
  previousLocalSaveAt: string | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function boundedText(value: unknown): string | null {
  return typeof value === "string" && value.length <= MAX_DRAFT_TEXT ? value : null;
}

function validPercent(value: unknown): number | null {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= 100 ? value : null;
}

function parseRealHandDraft(value: unknown): FieldHandInput | null {
  if (!isRecord(value)) return null;
  const moduleId = boundedText(value.moduleId);
  if (moduleId === null || (moduleId !== "" && !(moduleId in moduleById))) return null;
  const strings = Object.fromEntries(DRAFT_STRING_FIELDS.map((key) => [key, boundedText(value[key])])) as Record<(typeof DRAFT_STRING_FIELDS)[number], string | null>;
  if (DRAFT_STRING_FIELDS.some((key) => strings[key] === null)) return null;
  const confidence = validPercent(value.confidence);
  const populationReadConfidence = validPercent(value.populationReadConfidence);
  if (confidence === null || populationReadConfidence === null) return null;
  return {
    moduleId: moduleId as ModuleId,
    stakes: strings.stakes!,
    heroPosition: strings.heroPosition!,
    villainPositions: strings.villainPositions!,
    effectiveStacks: strings.effectiveStacks!,
    straddle: strings.straddle!,
    actionSequence: strings.actionSequence!,
    board: strings.board!,
    sizings: strings.sizings!,
    cue: strings.cue!,
    action: strings.action!,
    reason: strings.reason!,
    confidence,
    populationRead: strings.populationRead!,
    populationReadConfidence,
  };
}

function hasDraftContent(hand: FieldHandInput): boolean {
  return String(hand.moduleId).trim() !== ""
    || DRAFT_STRING_FIELDS.some((key) => String(hand[key] ?? "").trim() !== "")
    || hand.confidence !== 65
    || (hand.populationReadConfidence ?? 50) !== 50;
}

function readRealHandDraft(): FieldHandInput {
  return readProfileScopedUiValue(REAL_HAND_DRAFT_KEY, REAL_HAND_DRAFT_TTL_MS, parseRealHandDraft) ?? emptyHand();
}

function persistRealHandDraft(hand: FieldHandInput): boolean {
  if (!hasDraftContent(hand)) {
    clearUiStorage(REAL_HAND_DRAFT_KEY);
    return true;
  }
  return writeProfileScopedUiValue(REAL_HAND_DRAFT_KEY, {
    ...hand,
    populationRead: hand.populationRead ?? "",
    populationReadConfidence: hand.populationReadConfidence ?? 50,
  });
}

function copy(locale: LocaleCode) {
  return locale === "ru" ? {
    captureTitle: "После игры: сначала сохрани 1–3 руки",
    captureBody: "Сначала быстро зафиксируй 1–3 решения до результата. Затем выбери одну руку и сделай самопроверку. Только если отдельный разбор с человеком установил конкретный механизм, его можно связать с точным навыком Practical. Одна раздача — наблюдение, а не доказательство частоты или общего типа игрока.",
    workflow: "Порядок: 1) выбрать связанную тему и сохранить 1–3 руки → 2) разобрать одну → 3) при human review явно классифицировать механизм; Practical остаётся единственным маршрутом обучения.",
    draftLocalOnly: "Черновик хранится только на этом устройстве. Он не считается прогрессом, доказательством навыка или разбором.",
    clearDraft: "Очистить черновик и поля",
    exampleSummary: "Показать пример хорошо записанной руки",
    exampleDisclaimer: "Это пример формата записи, а не оценка правильности линии.",
    exampleLines: [
      "Лимиты: 2/5",
      "Позиции: Hero BTN, Villain BB",
      "Эффективный стек: 150bb",
      "Страддл: без страддла",
      "Последовательность действий: BTN открывает до $15, BB коллирует; флоп — чек-чек.",
      "Борд / префлоп: preflop → Qh 7d 4c",
      "Сайзинги: $15 префлоп",
      "Что заметил до решения: BB коллировал префлоп; до действия отметил эффективный стек.",
      "Как сыграл: чек позади.",
      "Почему — до результата: записал, какой сигнал заметил и почему выбрал именно это действие, не используя результат руки.",
    ],
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
    chooseModule: "Выбери тему, к которой относится это решение…",
    moduleRequired: "Связанная тема не выбрана. Выбери её явно для истории записи. Эта широкая тема сама по себе никогда не выбирает canonical Practical skill.",
    lock: "Зафиксировать решение",
    locked: "Решение зафиксировано до результата",
    requiredProgress: "обязательных полей заполнено",
    missingFields: "Не хватает",
    allRequired: "Все обязательные поля заполнены и тема выбрана. Можно фиксировать решение.",
    fieldsReadyModuleMissing: "Все 11 обязательных полей заполнены. Осталось выбрать связанную тему.",
    resultTitle: "Результат — отдельным шагом",
    result: "Результат",
    showdown: "Шоудаун (если был)",
    addResult: "Добавить результат",
    resultRequired: "Укажи результат; шоудаун можно оставить пустым, если его не было.",
    review: "Разбор",
    reviewPlaceholder: "Коротко: что в решении было рабочим или что нужно исправить…",
    reviewRequired: "Добавь короткую заметку разбора — без неё эти действия недоступны.",
    selfReviewTitle: "Самопроверка не подтверждает перенос и не назначает canonical repair",
    selfReviewBody: "Самопроверка может отметить нехватку данных, закончить собственный разбор или зафиксировать, что видишь проблему. Focused Practical repair и transfer требуют отдельного HUMAN / HUMAN_ASSISTED разбора с явной структурной классификацией механизма.",
    selfReviewSaved: "Самопроверка сохранена. Эта рука остаётся открытой для отдельного разбора с человеком. Чтобы провести его, выбери соответствующий источник ниже и добавь новую заметку разбора.",
    reviewerSource: "Как выполнен разбор",
    reviewerSourceHelp: "Самопроверка — твой собственный разбор. Другие варианты выбирай только после реального отдельного разбора с человеком. Приложение не проверяет, кто проводил разбор.",
    reviewerSelf: "Самопроверка",
    reviewerHuman: "Разбор с человеком",
    reviewerAssisted: "Разбор с человеком и инструментом",
    supportTransfer: "Подтверждает перенос в реальную игру",
    supportTransferHelp: "Нужны human review, решение до результата, cue-before-action и валидная structured canonical binding. Одна рука transfer не подтверждает.",
    legacyTransferBlocked: "Эту старую запись нельзя засчитать как поддержку переноса: в ней нет зафиксированного решения до результата.",
    insufficient: "Недостаточно данных",
    reviewedOk: "Разбор закончен",
    repair: "Нужна практика",
    openRepair: "Открыть точный repair в Practical",
    canonicalSkill: "Canonical Practical skill",
    explainInbox: "Объяснения для самопроверки",
    noInbox: "Новых объяснений для самопроверки нет.",
    earlier: "Раннее объяснение",
    later: "Последнее объяснение",
    evidence: "Доказательства",
    next: "Что дальше",
    calibration: "Уверенность по последним решениям",
    sample: "решений",
    over: "ошибок с высокой уверенностью",
    under: "верных ответов с низкой уверенностью",
    notEnoughCalibration: "Пока мало решений для полезной картины уверенности.",
    fieldSupports: "разобранных с человеком рук в поддержку",
    delayed: "успешных повторов после паузы",
    variants: "успешных изменённых ситуаций",
    pendingRepair: "legacy-заданий на работу над ошибкой",
    reviewedBySelf: "самопроверка",
    reviewedByHuman: "разбор с человеком",
    reviewedByAssisted: "разбор с человеком и инструментом",
  } : {
    captureTitle: "After play: save 1–3 hands first",
    captureBody: "First capture 1–3 decisions quickly before the result can bias them. Then review one hand. Only a separate human review that establishes a concrete mechanism may bind it to an exact Practical skill. One hand is an observation, not proof of a frequency or a global player type.",
    workflow: "Order: 1) choose the linked topic and save 1–3 hands → 2) review one → 3) during human review explicitly classify the mechanism; Practical remains the only learning route.",
    draftLocalOnly: "This draft is stored only on this device. It is not progress, skill evidence, or a review.",
    clearDraft: "Clear draft and fields",
    exampleSummary: "Show an example of a well-recorded hand",
    exampleDisclaimer: "This is an example of recording format, not an assessment of whether the line is correct.",
    exampleLines: [
      "Stakes: 2/5",
      "Positions: Hero BTN, Villain BB",
      "Effective stack: 150bb",
      "Straddle: none",
      "Action sequence: BTN opens to $15, BB calls; flop checks through.",
      "Board / preflop: preflop → Qh 7d 4c",
      "Sizings: $15 preflop",
      "Cue before acting: BB called preflop; I noted the effective stack before acting.",
      "Action: checked back.",
      "Reason before result: I recorded what I noticed and why I chose the action without using the hand result.",
    ],
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
    chooseModule: "Choose the topic this decision belongs to…",
    moduleRequired: "No linked topic is selected. Choose one explicitly for note history. This broad topic never selects a canonical Practical skill by itself.",
    lock: "Lock the decision",
    locked: "Decision locked before the result",
    requiredProgress: "required fields complete",
    missingFields: "Missing",
    allRequired: "All required fields are complete and the topic is selected. You can lock the decision.",
    fieldsReadyModuleMissing: "All 11 required fields are complete. Choose the linked topic before locking the decision.",
    resultTitle: "Result — added separately",
    result: "Result",
    showdown: "Showdown (if any)",
    addResult: "Add result",
    resultRequired: "Enter the result; showdown can stay empty if there was none.",
    review: "Review",
    reviewPlaceholder: "Briefly: what worked in the decision or what needs repair…",
    reviewRequired: "Add a short review note before choosing an outcome.",
    selfReviewTitle: "Self-review does not confirm transfer or assign canonical repair",
    selfReviewBody: "Self-review can mark missing information, finish your own review, or record that you see a problem. Focused Practical repair and transfer require a separate HUMAN / HUMAN_ASSISTED review with explicit structured causal classification.",
    selfReviewSaved: "Self-review is saved. This hand remains open for a separate human review. To do that, choose the appropriate review source below and add a new review note.",
    reviewerSource: "How this was reviewed",
    reviewerSourceHelp: "Self-review is your own review. Choose the other options only after a real separate human review. The app does not verify who performed it.",
    reviewerSelf: "Self-review",
    reviewerHuman: "Human review",
    reviewerAssisted: "Human review with a tool",
    supportTransfer: "Supports real-table transfer",
    supportTransferHelp: "Requires human review, a pre-result lock, cue-before-action, and a valid structured canonical binding. One hand never proves transfer.",
    legacyTransferBlocked: "This legacy note cannot support transfer because it has no decision locked before the result.",
    insufficient: "Not enough information",
    reviewedOk: "Finish review",
    repair: "Needs practice",
    openRepair: "Open exact repair in Practical",
    canonicalSkill: "Canonical Practical skill",
    explainInbox: "Explanations for self-review",
    noInbox: "No new explanation is waiting for self-review.",
    earlier: "Earlier explanation",
    later: "Latest explanation",
    evidence: "Evidence",
    next: "What next",
    calibration: "Confidence in recent decisions",
    sample: "decisions",
    over: "high-confidence misses",
    under: "correct low-confidence answers",
    notEnoughCalibration: "There are not enough decisions yet for a useful confidence pattern.",
    fieldSupports: "human-reviewed supporting hands",
    delayed: "successful reviews after a delay",
    variants: "successful changed spots",
    pendingRepair: "legacy mistake-practice tasks queued",
    reviewedBySelf: "self-review",
    reviewedByHuman: "human review",
    reviewedByAssisted: "human review with a tool",
  };
}

function fieldStatus(locale: LocaleCode, note: StructuredFieldNote, baseStatusLabel: (locale: LocaleCode, status: string) => string): string {
  const outcome = note.reviewOutcome;
  const selfReviewedPending = note.status === "PENDING_REVIEW" && note.reviewerKind === "SELF" && Boolean(note.reviewedAt);
  if (locale === "ru") {
    if (selfReviewedPending) return "самопроверка сохранена · разбор с человеком ещё возможен";
    if (outcome === "SUPPORTS_TRANSFER") return "разобрано: подтверждает перенос навыка";
    if (outcome === "REPAIR_REQUIRED") return "разобрано: нужен точный Practical repair";
    if (outcome === "REVIEWED_OK") return "разобрано: дополнительная практика не нужна";
    if (outcome === "INSUFFICIENT" || note.status === "INSUFFICIENT") return "недостаточно данных";
    return baseStatusLabel(locale, note.status);
  }
  if (selfReviewedPending) return "self-review saved · human review still available";
  if (outcome === "SUPPORTS_TRANSFER") return "reviewed: supports transfer evidence";
  if (outcome === "REPAIR_REQUIRED") return "reviewed: exact Practical repair needed";
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

export function Wave7FieldPanel({ locale, state, setState, lastLocalSaveAt, fieldStatusLabel, fieldFactLabels }: { locale: LocaleCode; state: LearnerState; setState: (value: LearnerState) => void; lastLocalSaveAt: string | null; fieldStatusLabel: (locale: LocaleCode, status: string) => string; fieldFactLabels: (locale: LocaleCode) => { cue: string; action: string; reason: string } }) {
  const c = copy(locale);
  const facts = fieldFactLabels(locale);
  const [hand, setHand] = useState<FieldHandInput>(() => readRealHandDraft());
  const [pendingSave, setPendingSave] = useState<PendingFieldSave | null>(null);
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [reviewerKinds, setReviewerKinds] = useState<Record<string, FieldReviewerKind>>({});
  const [bindingInputs, setBindingInputs] = useState<Record<string, PracticalFieldBindingInput>>({});
  const [resultDrafts, setResultDrafts] = useState<Record<string, string>>({});
  const [showdownDrafts, setShowdownDrafts] = useState<Record<string, string>>({});
  const [explainNotes, setExplainNotes] = useState<Record<string, string>>({});
  const explainPending = explainBackRecords(state).filter((row) => row.status === "PENDING_REVIEW");
  const errors = validateFieldHandInput(hand);
  const moduleMissing = errors.includes("moduleId");
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

  useEffect(() => {
    if (!pendingSave || !lastLocalSaveAt || lastLocalSaveAt === pendingSave.previousLocalSaveAt) return;
    const acknowledgement = Date.parse(lastLocalSaveAt);
    const target = Date.parse(pendingSave.updatedAt);
    const notePersistedInController = state.revision >= pendingSave.revision
      && (state.fieldNotes as StructuredFieldNote[]).some((note) => note.id === pendingSave.noteId);
    if (!Number.isFinite(acknowledgement) || !Number.isFinite(target) || acknowledgement < target || !notePersistedInController) return;
    clearUiStorage(REAL_HAND_DRAFT_KEY);
    setHand(emptyHand());
    setPendingSave(null);
  }, [lastLocalSaveAt, pendingSave, state.fieldNotes, state.revision]);

  function patch<K extends keyof FieldHandInput>(key: K, value: FieldHandInput[K]) {
    const next = { ...hand, [key]: value };
    setHand(next);
    persistRealHandDraft(next);
  }

  function clearDraft() {
    if (pendingSave) return;
    clearUiStorage(REAL_HAND_DRAFT_KEY);
    setHand(emptyHand());
  }

  function save() {
    if (errors.length || pendingSave) return;
    if (!persistRealHandDraft(hand)) return;
    const next = captureFieldHand(state, hand);
    const previousIds = new Set((state.fieldNotes as StructuredFieldNote[]).map((note) => note.id));
    const created = (next.fieldNotes as StructuredFieldNote[]).find((note) => !previousIds.has(note.id));
    if (!created) return;
    setPendingSave({
      revision: next.revision,
      updatedAt: next.updatedAt,
      noteId: created.id,
      previousLocalSaveAt: lastLocalSaveAt,
    });
    setState(next);
  }

  function reviewHand(noteId: string, outcome: FieldReviewOutcome) {
    const text = reviewNotes[noteId] ?? "";
    const reviewerKind = reviewerKinds[noteId] ?? "SELF";
    if (!text.trim()) return;
    const input = bindingInputs[noteId];
    const resolved = reviewerKind === "SELF" ? null : resolvePracticalFieldBinding(noteId, reviewerKind, input);
    if ((outcome === "REPAIR_REQUIRED" || outcome === "SUPPORTS_TRANSFER") && reviewerKind !== "SELF" && !resolved) return;
    setState(reviewFieldHand(state, noteId, outcome, text, reviewerKind, resolved ? input : undefined));
    if (reviewerKind === "SELF") {
      setReviewNotes((current) => ({ ...current, [noteId]: "" }));
    }
  }

  function reviewerLabel(note: StructuredFieldNote): string {
    if (note.reviewerKind === "HUMAN") return c.reviewedByHuman;
    if (note.reviewerKind === "HUMAN_ASSISTED") return c.reviewedByAssisted;
    return c.reviewedBySelf;
  }

  return <section className="surface">
    <div className="section-head"><p className="eyebrow">{locale === "ru" ? "РЕАЛЬНЫЕ РАЗДАЧИ" : "REAL HANDS"}</p><h1>{c.captureTitle}</h1><p>{c.captureBody}</p><p className="assumption-strip">{c.workflow}</p></div>

    <section className="w7-review-inbox">
      <h2>{c.explainInbox}</h2>
      <p className="support">{c.selfReviewBody}</p>
      {!explainPending.length && <p className="support">{c.noInbox}</p>}
      <div className="field-list">{explainPending.map((record) => {
        const reviewText = explainNotes[record.id] ?? "";
        return <article key={record.id}>
          <span className="kind">{locale === "ru" ? "ждёт самопроверки" : "awaiting self-review"}</span>
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
        <div data-testid="real-hand-draft-tools">
          <p className="support">{c.draftLocalOnly}</p>
          <button type="button" className="textbutton" disabled={Boolean(pendingSave)} onClick={clearDraft}>{c.clearDraft}</button>
        </div>
        <details data-testid="real-hand-example">
          <summary>{c.exampleSummary}</summary>
          <p className="support"><b>{c.exampleDisclaimer}</b></p>
          {c.exampleLines.map((line) => <p key={line}>{line}</p>)}
        </details>
        <label>{c.module}<select data-testid="real-hand-moduleId" value={hand.moduleId} onChange={(event) => patch("moduleId", event.target.value as ModuleId)}><option value="" disabled>{c.chooseModule}</option>{modules.map((module) => <option key={module.id} value={module.id}>{module.lcm} · {module.shortTitle}</option>)}</select></label>
        {moduleMissing && <p className="support">{c.moduleRequired}</p>}
        <label>{c.stakes}<input data-testid="real-hand-stakes" value={hand.stakes} onChange={(event) => patch("stakes", event.target.value)} placeholder="1/3, 2/5…" /></label>
        <label>{c.heroPosition}<input data-testid="real-hand-heroPosition" value={hand.heroPosition} onChange={(event) => patch("heroPosition", event.target.value)} placeholder="BTN, BB…" /></label>
        <label>{c.villainPositions}<input data-testid="real-hand-villainPositions" value={hand.villainPositions} onChange={(event) => patch("villainPositions", event.target.value)} placeholder="CO, SB…" /></label>
        <label>{c.effectiveStacks}<input data-testid="real-hand-effectiveStacks" value={hand.effectiveStacks} onChange={(event) => patch("effectiveStacks", event.target.value)} placeholder="150bb vs BTN" /></label>
        <label>{c.straddle}<input data-testid="real-hand-straddle" value={hand.straddle} onChange={(event) => patch("straddle", event.target.value)} placeholder={locale === "ru" ? "без страддла / $10 UTG" : "no straddle / $10 UTG"} /></label>
        <label>{c.actionSequence}<textarea data-testid="real-hand-actionSequence" value={hand.actionSequence} onChange={(event) => patch("actionSequence", event.target.value)} /></label>
        <label>{c.board}<input data-testid="real-hand-board" value={hand.board} onChange={(event) => patch("board", event.target.value)} placeholder="Qh 7d 4c / preflop" /></label>
        <label>{c.sizings}<input data-testid="real-hand-sizings" value={hand.sizings} onChange={(event) => patch("sizings", event.target.value)} placeholder="3bb → 12bb; flop 25%" /></label>
        <label>{facts.cue}<textarea data-testid="real-hand-cue" value={hand.cue} onChange={(event) => patch("cue", event.target.value)} /></label>
        <label>{facts.action}<textarea data-testid="real-hand-action" value={hand.action} onChange={(event) => patch("action", event.target.value)} /></label>
        <label>{facts.reason} — {locale === "ru" ? "до результата" : "before the result"}<textarea data-testid="real-hand-reason" value={hand.reason} onChange={(event) => patch("reason", event.target.value)} /></label>
        <label className="confidence">{c.confidence} <b>{locale === "ru" ? "примерно" : "roughly"} {hand.confidence}%</b><input data-testid="real-hand-confidence" type="range" min="0" max="100" step="5" value={hand.confidence} onChange={(event) => patch("confidence", Number(event.target.value))} /></label>
        <p className="support">{c.confidenceHelp}</p>
        <label>{c.populationRead}<textarea data-testid="real-hand-populationRead" value={hand.populationRead ?? ""} onChange={(event) => patch("populationRead", event.target.value)} /></label>
        {(hand.populationRead ?? "").trim() && <><label className="confidence">{c.populationConfidence} <b>{locale === "ru" ? "примерно" : "roughly"} {hand.populationReadConfidence ?? 50}%</b><input data-testid="real-hand-populationReadConfidence" type="range" min="0" max="100" step="5" value={hand.populationReadConfidence ?? 50} onChange={(event) => patch("populationReadConfidence", Number(event.target.value))} /></label><p className="support">{c.confidenceHelp}</p></>}
        <p className="support"><b>{completedRequired}/{REQUIRED_HAND_FIELDS.length} {c.requiredProgress}.</b> {missingRequired.length ? `${c.missingFields}: ${missingRequired.map((key) => requiredLabels[key]).join(", ")}.` : moduleMissing ? c.fieldsReadyModuleMissing : c.allRequired}</p>
        <button className="primary" disabled={errors.length > 0 || Boolean(pendingSave)} onClick={save}>{c.lock} <span>→</span></button>
      </div>

      <div className="field-list">{[...(state.fieldNotes as StructuredFieldNote[])].reverse().map((note) => {
        const reviewText = reviewNotes[note.id] ?? "";
        const selfReviewed = note.status === "PENDING_REVIEW" && note.reviewerKind === "SELF" && Boolean(note.reviewedAt);
        const reviewerKind = reviewerKinds[note.id] ?? "SELF";
        const bindingInput = bindingInputs[note.id] ?? { signals: {} };
        const resolvedBinding = reviewerKind === "SELF" ? null : resolvePracticalFieldBinding(note.id, reviewerKind, bindingInput);
        const resultText = resultDrafts[note.id] ?? "";
        const showdownText = showdownDrafts[note.id] ?? "";
        const canSupportTransfer = reviewerKind !== "SELF" && Boolean(note.decisionLockedAt) && Boolean(reviewText.trim()) && Boolean(resolvedBinding);
        const canAssignRepair = Boolean(reviewText.trim()) && (reviewerKind === "SELF" || Boolean(resolvedBinding));
        const selfActionsLocked = selfReviewed && reviewerKind === "SELF";
        const repairHref = practicalRepairFocusHref(note);
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
          {note.practicalBinding && <p className="assumption-strip"><b>{c.canonicalSkill}:</b> {note.practicalBinding.practicalSkillId}</p>}

          <div className="w7-result">
            <p className="eyebrow">{c.resultTitle}</p>
            {note.result ? <><p><b>{c.result}:</b> {note.result}</p>{note.showdown && <p><b>{c.showdown}:</b> {note.showdown}</p>}</> : note.decisionLockedAt ? <>
              <label>{c.result}<textarea value={resultText} onChange={(event) => setResultDrafts((current) => ({ ...current, [note.id]: event.target.value }))} /></label>
              <label>{c.showdown}<textarea value={showdownText} onChange={(event) => setShowdownDrafts((current) => ({ ...current, [note.id]: event.target.value }))} /></label>
              {!resultText.trim() && <p className="support">{c.resultRequired}</p>}
              <button className="secondary" disabled={!resultText.trim()} onClick={() => setState(addFieldResult(state, note.id, resultText, showdownText))}>{c.addResult}</button>
            </> : <p className="support">{locale === "ru" ? "Старая запись: фиксации до результата ещё не было." : "Legacy note: the pre-result lock did not exist yet."}</p>}
          </div>

          {note.status === "PENDING_REVIEW" ? <>
            <div className="answer-panel"><b>{c.selfReviewTitle}</b><p>{c.selfReviewBody}</p></div>
            {selfReviewed && <div className="counterexample"><b>{c.review} ({c.reviewedBySelf})</b><p>{note.evaluatorNote}</p><p>{c.selfReviewSaved}</p></div>}
            <label>{c.reviewerSource}<select aria-label={`${c.reviewerSource} ${note.id}`} value={reviewerKind} onChange={(event) => setReviewerKinds((current) => ({ ...current, [note.id]: event.target.value as FieldReviewerKind }))}><option value="SELF">{c.reviewerSelf}</option><option value="HUMAN">{c.reviewerHuman}</option><option value="HUMAN_ASSISTED">{c.reviewerAssisted}</option></select></label>
            <p className="support">{c.reviewerSourceHelp}</p>
            {reviewerKind !== "SELF" && <RealHandCanonicalReview locale={locale} value={bindingInput} onChange={(value) => setBindingInputs((current) => ({ ...current, [note.id]: value }))} />}
            <textarea aria-label={`${c.review} ${note.id}`} placeholder={c.reviewPlaceholder} value={reviewText} onChange={(event) => setReviewNotes((current) => ({ ...current, [note.id]: event.target.value }))} />
            {!reviewText.trim() && <p className="support">{selfActionsLocked ? c.selfReviewSaved : c.reviewRequired}</p>}
            {!note.decisionLockedAt && <p className="support">{c.legacyTransferBlocked}</p>}
            {!canSupportTransfer && reviewerKind !== "SELF" && <p className="support">{c.supportTransferHelp}</p>}
            <div className="review-actions">
              <button disabled={!reviewText.trim() || selfActionsLocked} onClick={() => reviewHand(note.id, "INSUFFICIENT")}>{c.insufficient}</button>
              <button disabled={!reviewText.trim() || selfActionsLocked} onClick={() => reviewHand(note.id, "REVIEWED_OK")}>{c.reviewedOk}</button>
              <button disabled={!canAssignRepair || selfActionsLocked} onClick={() => reviewHand(note.id, "REPAIR_REQUIRED")}>{c.repair}</button>
              <button className="primary" disabled={!canSupportTransfer} onClick={() => reviewHand(note.id, "SUPPORTS_TRANSFER")}>{c.supportTransfer}</button>
            </div>
          </> : <>
            <p className="support"><b>{c.review} ({reviewerLabel(note)}):</b> {note.evaluatorNote || "—"}</p>
            {repairHref && <p><a className="primary" data-testid="real-hand-practical-repair" href={repairHref}>{c.openRepair} →</a></p>}
          </>}
        </article>;
      })}</div>
    </div>
  </section>;
}
