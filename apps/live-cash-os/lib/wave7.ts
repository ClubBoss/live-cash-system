import {
  APP_VERSION,
  CONTENT_VERSION,
  MODULE_IDS,
  type DiagnosticState,
  type FieldNote,
  type LearnerState,
  type LocaleCode,
  type ModuleId,
  type ResponseClass,
} from "./model-core";
import {
  reconcilePracticalFieldTransfer,
  resolvePracticalFieldBinding,
  type PracticalFieldBinding,
  type PracticalFieldBindingInput,
} from "./practical-field-transfer";
import {
  practicalProfileFromLearnerState,
  withPracticalProfile,
  type LearnerStateWithPracticalProfile,
} from "./practical-profile-state";

export type ReviewedResponseClass = Exclude<ResponseClass, "E">;
export type ExplainBackReviewStatus = "PENDING_REVIEW" | "REVIEWED_OK" | "REVIEWED_REPAIR" | "INSUFFICIENT";
export type FieldReviewOutcome = "REVIEWED_OK" | "INSUFFICIENT" | "REPAIR_REQUIRED" | "SUPPORTS_TRANSFER";
export type FieldReviewerKind = "SELF" | "HUMAN" | "HUMAN_ASSISTED";

export type DiagnosticItemReview = {
  itemId: string;
  responseClass: ReviewedResponseClass;
  reviewerNote?: string;
};

export type DiagnosticReviewSummary = {
  reviewerKind: "HUMAN" | "HUMAN_ASSISTED";
  reviewedAt: string;
  itemReviews: DiagnosticItemReview[];
};

export type ExplainBackRecord = {
  id: string;
  at: string;
  moduleId: ModuleId;
  promptKey: string;
  text: string;
  status: ExplainBackReviewStatus;
  reviewerNote: string;
  reviewedAt?: string;
};

export type StructuredFieldNote = FieldNote & {
  stakes?: string;
  heroPosition?: string;
  villainPositions?: string;
  effectiveStacks?: string;
  straddle?: string;
  actionSequence?: string;
  board?: string;
  sizings?: string;
  confidence?: number;
  populationRead?: string;
  populationReadConfidence?: number;
  decisionLockedAt?: string;
  result?: string;
  showdown?: string;
  resultAddedAt?: string;
  reviewOutcome?: FieldReviewOutcome;
  reviewerKind?: FieldReviewerKind;
  reviewedAt?: string;
  practicalBinding?: PracticalFieldBinding;
};

export type FieldHandInput = {
  moduleId: ModuleId;
  stakes: string;
  heroPosition: string;
  villainPositions: string;
  effectiveStacks: string;
  straddle: string;
  actionSequence: string;
  board: string;
  sizings: string;
  cue: string;
  action: string;
  reason: string;
  confidence: number;
  populationRead?: string;
  populationReadConfidence?: number;
};

type Wave7State = LearnerState & {
  explainBackRecords?: ExplainBackRecord[];
  fieldNotes: StructuredFieldNote[];
  diagnostic: DiagnosticState & { review?: DiagnosticReviewSummary };
};

const nowIso = () => new Date().toISOString();
const id = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
const clone = <T>(value: T): T => structuredClone(value);

function touch<T extends LearnerState>(state: T): T {
  state.revision += 1;
  state.updatedAt = nowIso();
  state.appVersion = APP_VERSION;
  state.contentVersion = CONTENT_VERSION;
  return state;
}

function asWave7(state: LearnerState): Wave7State {
  const next = clone(state) as Wave7State;
  next.explainBackRecords ??= [];
  return next;
}

function queueReviewedRepair(state: Wave7State, moduleId: ModuleId, sourceId: string) {
  const sourceDrillId = `explain:${sourceId}`;
  if (state.reviewQueue.some((item) => item.kind === "repair" && item.sourceDrillId === sourceDrillId)) return;
  state.reviewQueue.push({
    id: id("review"),
    moduleId,
    sourceDrillId,
    variantGroup: `explain-${moduleId}`,
    kind: "repair",
    dueAt: nowIso(),
    attempts: 0,
    sourceInteractionId: sourceId,
  });
}

function persistReviewedFieldHand(next: Wave7State): LearnerState {
  try {
    const profile = practicalProfileFromLearnerState(next);
    const mastery = reconcilePracticalFieldTransfer(profile.mastery, next.fieldNotes);
    if (mastery === profile.mastery) return touch(next);
    const touched = touch(next) as LearnerState & LearnerStateWithPracticalProfile;
    return withPracticalProfile(touched, { ...profile, mastery });
  } catch {
    // A damaged Practical slice is recovery-owned. Preserve the field review
    // without replacing or guessing at the unreadable canonical profile.
    return touch(next);
  }
}

export function explainBackRecords(state: LearnerState, moduleId?: ModuleId): ExplainBackRecord[] {
  const rows = (state as Wave7State).explainBackRecords ?? [];
  return moduleId ? rows.filter((row) => row.moduleId === moduleId) : rows;
}

export function isGenuineExplainBackAttempt(text: string): boolean {
  const words = text.toLocaleLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];
  return words.length >= 2 && new Set(words).size >= 2;
}

export function saveExplainBack(state: LearnerState, moduleId: ModuleId, promptKey: string, text: string): LearnerState {
  const trimmed = text.trim();
  if (!isGenuineExplainBackAttempt(trimmed) || !promptKey.trim()) return state;
  const next = asWave7(state);
  next.explainBackRecords!.push({
    id: id("explain"),
    at: nowIso(),
    moduleId,
    promptKey: promptKey.trim(),
    text: trimmed,
    status: "PENDING_REVIEW",
    reviewerNote: "",
  });
  return touch(next);
}

export function reviewExplainBack(
  state: LearnerState,
  recordId: string,
  status: Exclude<ExplainBackReviewStatus, "PENDING_REVIEW">,
  reviewerNote: string,
): LearnerState {
  const next = asWave7(state);
  const record = next.explainBackRecords!.find((row) => row.id === recordId);
  if (!record || record.status !== "PENDING_REVIEW") return state;
  const note = reviewerNote.trim();
  if (!note) return state;
  record.status = status;
  record.reviewerNote = note;
  record.reviewedAt = nowIso();
  if (status === "REVIEWED_REPAIR") queueReviewedRepair(next, record.moduleId, record.id);
  return touch(next);
}

export function validateFieldHandInput(input: FieldHandInput): string[] {
  const required: Array<[keyof FieldHandInput, unknown]> = [
    ["stakes", input.stakes],
    ["heroPosition", input.heroPosition],
    ["villainPositions", input.villainPositions],
    ["effectiveStacks", input.effectiveStacks],
    ["straddle", input.straddle],
    ["actionSequence", input.actionSequence],
    ["board", input.board],
    ["sizings", input.sizings],
    ["cue", input.cue],
    ["action", input.action],
    ["reason", input.reason],
  ];
  const errors = required
    .filter(([, value]) => typeof value !== "string" || !value.trim())
    .map(([key]) => String(key));
  if (!MODULE_IDS.includes(input.moduleId)) errors.push("moduleId");
  if (!Number.isInteger(input.confidence) || input.confidence < 0 || input.confidence > 100) errors.push("confidence");
  if (input.populationRead?.trim()) {
    if (!Number.isInteger(input.populationReadConfidence) || Number(input.populationReadConfidence) < 0 || Number(input.populationReadConfidence) > 100) {
      errors.push("populationReadConfidence");
    }
  }
  return errors;
}

export function captureFieldHand(state: LearnerState, input: FieldHandInput): LearnerState {
  const errors = validateFieldHandInput(input);
  if (errors.length) throw new Error(`Invalid real-hand fields: ${errors.join(", ")}`);
  const next = asWave7(state);
  const at = nowIso();
  next.fieldNotes.push({
    id: id("field"),
    at,
    moduleId: input.moduleId,
    cue: input.cue.trim(),
    action: input.action.trim(),
    reason: input.reason.trim(),
    cueBeforeAction: true,
    status: "PENDING_REVIEW",
    evaluatorNote: "",
    stakes: input.stakes.trim(),
    heroPosition: input.heroPosition.trim(),
    villainPositions: input.villainPositions.trim(),
    effectiveStacks: input.effectiveStacks.trim(),
    straddle: input.straddle.trim(),
    actionSequence: input.actionSequence.trim(),
    board: input.board.trim(),
    sizings: input.sizings.trim(),
    confidence: input.confidence,
    populationRead: input.populationRead?.trim() || undefined,
    populationReadConfidence: input.populationRead?.trim() ? input.populationReadConfidence : undefined,
    decisionLockedAt: at,
  });
  return touch(next);
}

export function addFieldResult(state: LearnerState, noteId: string, result: string, showdown = ""): LearnerState {
  const next = asWave7(state);
  const note = next.fieldNotes.find((row) => row.id === noteId) as StructuredFieldNote | undefined;
  if (!note?.decisionLockedAt || !result.trim()) return state;
  note.result = result.trim();
  note.showdown = showdown.trim() || undefined;
  note.resultAddedAt = nowIso();
  return touch(next);
}

export function reviewFieldHand(
  state: LearnerState,
  noteId: string,
  outcome: FieldReviewOutcome,
  reviewerNote: string,
  reviewerKind: FieldReviewerKind = "SELF",
  bindingInput?: PracticalFieldBindingInput,
): LearnerState {
  const next = asWave7(state);
  const note = next.fieldNotes.find((row) => row.id === noteId) as StructuredFieldNote | undefined;
  const reviewText = reviewerNote.trim();
  if (!note || note.status !== "PENDING_REVIEW" || !reviewText) return state;

  const hasIndependentReviewer = reviewerKind === "HUMAN" || reviewerKind === "HUMAN_ASSISTED";
  const binding = hasIndependentReviewer && bindingInput
    ? resolvePracticalFieldBinding(note.id, reviewerKind, bindingInput)
    : null;
  if (hasIndependentReviewer && bindingInput && !binding) return state;

  const hasLockedPreResultDecision = Boolean(note.decisionLockedAt && note.cueBeforeAction);
  if (outcome === "SUPPORTS_TRANSFER" && (!hasIndependentReviewer || !hasLockedPreResultDecision || !binding)) return state;
  if (outcome === "REPAIR_REQUIRED" && hasIndependentReviewer && !binding) return state;

  note.reviewOutcome = outcome;
  note.reviewerKind = reviewerKind;
  note.evaluatorNote = reviewText;
  note.reviewedAt = nowIso();
  if (binding) note.practicalBinding = binding;

  // Self-review remains non-terminal and cannot establish canonical Practical
  // identity or enqueue a second learning scheduler. A later independent
  // review must supply a fresh note and an explicit structured binding.
  if (reviewerKind === "SELF") {
    note.status = "PENDING_REVIEW";
    return touch(next);
  }

  if (outcome === "INSUFFICIENT") note.status = "INSUFFICIENT";
  if (outcome === "REVIEWED_OK") note.status = "REVIEWED_VALID";
  if (outcome === "REPAIR_REQUIRED") note.status = "REVIEWED_REPAIR";
  if (outcome === "SUPPORTS_TRANSFER") note.status = "REVIEWED_VALID";
  return persistReviewedFieldHand(next);
}

export function applyReviewedDiagnostic(
  state: LearnerState,
  priorityModules: ModuleId[],
  review?: DiagnosticReviewSummary,
): LearnerState {
  const next = asWave7(state);
  next.diagnostic.status = "SCORED";
  next.diagnostic.priorityModules = [...new Set(priorityModules.filter((moduleId) => MODULE_IDS.includes(moduleId)))].slice(0, 2);
  next.diagnostic.importedAt = nowIso();
  if (review) {
    const ids = new Set(review.itemReviews.map((item) => item.itemId));
    if (review.itemReviews.length !== 10 || ids.size !== 10) return state;
    next.diagnostic.review = clone(review);
  }
  return touch(next);
}

export function pendingHumanReviewCount(state: LearnerState): number {
  const next = state as Wave7State;
  const explainPending = (next.explainBackRecords ?? []).filter((row) => row.status === "PENDING_REVIEW").length;
  const fieldPending = next.fieldNotes.filter((row) => row.status === "PENDING_REVIEW").length;
  return explainPending + fieldPending;
}

export function deriveProgressExplanation(state: LearnerState, moduleId: ModuleId, locale: LocaleCode): {
  reason: string;
  next: string;
  fieldSupports: number;
  delayedSuccesses: number;
  variantSuccesses: number;
  pendingRepairs: number;
} {
  const progress = state.modules[moduleId];
  const fieldSupports = (state.fieldNotes as StructuredFieldNote[]).filter((note) => note.moduleId === moduleId
    && note.reviewOutcome === "SUPPORTS_TRANSFER"
    && (note.reviewerKind === "HUMAN" || note.reviewerKind === "HUMAN_ASSISTED")
    && Boolean(note.practicalBinding)).length;
  const delayedSuccesses = progress.evidence.retention.successes;
  const variantSuccesses = progress.evidence.variant_transfer.successes;
  const pendingRepairs = state.reviewQueue.filter((item) => item.moduleId === moduleId && item.kind === "repair").length;
  const ru = locale === "ru";
  const reasonByState: Record<typeof progress.state, string> = {
    UNEXPOSED: ru ? "Тема ещё не проходилась." : "This topic has not been studied yet.",
    INTRODUCED: ru ? "Объяснение пройдено, но устойчивое решение ещё не доказано." : "The explanation is complete, but reliable decision evidence is not there yet.",
    FRAGILE: ru ? "Есть практика, но недавние ответы были неустойчивыми." : "There is practice evidence, but recent decisions are still inconsistent.",
    WORKING: ru ? "Действие и объяснение уже получаются на нескольких ситуациях." : "Action and reasoning are working across more than one spot.",
    RETAINED: ru ? "Навык удалось вспомнить после паузы и перенести на изменённую ситуацию." : "The skill survived a delay and a changed spot.",
    FIELD_TEST_PENDING: ru ? "Учебные проверки пройдены; теперь нужны разобранные реальные руки." : "Study checks are in place; reviewed real hands are the missing step.",
    FIELD_VALIDATED: ru ? "Есть минимум две разобранные реальные руки, успешное повторение после паузы и перенос на изменённую ситуацию." : "At least two reviewed real hands are supported by delayed recall and changed-spot evidence.",
    REPAIR_REQUIRED: ru ? "Есть конкретная ошибка, которую нужно исправить до дальнейшего продвижения." : "A specific mistake needs repair before moving forward.",
  };
  const nextByState: Record<typeof progress.state, string> = {
    UNEXPOSED: ru ? "Начать урок." : "Start the lesson.",
    INTRODUCED: ru ? "Решить несколько самостоятельных задач." : "Do a few independent decisions.",
    FRAGILE: ru ? "Закрыть ошибки и повторить изменённую ситуацию." : "Repair misses and retry a changed spot.",
    WORKING: ru ? "Вернуться после паузы для delayed review." : "Return after a delay for a fresh recall check.",
    RETAINED: ru ? "Проверить границу правила и реальную раздачу." : "Test a boundary and then a real hand.",
    FIELD_TEST_PENDING: ru ? "Записать и разобрать реальные решения." : "Capture and review real table decisions.",
    FIELD_VALIDATED: ru ? "Поддерживать навык обычными повторениями." : "Maintain it through normal review.",
    REPAIR_REQUIRED: ru ? "Сделать назначенную работу над ошибкой." : "Complete the assigned mistake practice.",
  };
  return { reason: reasonByState[progress.state], next: nextByState[progress.state], fieldSupports, delayedSuccesses, variantSuccesses, pendingRepairs };
}

export function deriveCalibrationSummary(state: LearnerState, moduleId?: ModuleId) {
  const rows = state.interactions.filter((row) => !moduleId || row.moduleId === moduleId).slice(-20);
  let overconfidenceCases = 0;
  let underconfidenceCases = 0;
  let correctCases = 0;
  for (const row of rows) {
    const correct = row.actionOk && row.reasonOk;
    if (correct) correctCases += 1;
    if (!correct && row.confidence >= 75) overconfidenceCases += 1;
    if (correct && row.confidence <= 40) underconfidenceCases += 1;
  }
  return { sampleSize: rows.length, correctCases, overconfidenceCases, underconfidenceCases };
}
