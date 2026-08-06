export const APP_VERSION = "1.1.0";
export const STATE_SCHEMA_VERSION = 2;
export const CONTENT_VERSION = "2026.08-wave7-integrity";

export const MODULE_IDS = ["geometry", "preflop", "blinds", "filtering", "shape", "aggression", "ancestry", "multiway", "river", "evidence", "transfer"] as const;
export type ModuleId = (typeof MODULE_IDS)[number];
export type LearningMode = "lesson" | "practice" | "repair" | "review" | "mixed";
export type ResponseClass = "A" | "B" | "C" | "D" | "E" | "U";
export type ModuleState = "UNEXPOSED" | "INTRODUCED" | "FRAGILE" | "WORKING" | "RETAINED" | "FIELD_TEST_PENDING" | "FIELD_VALIDATED" | "REPAIR_REQUIRED";
export type LocaleCode = "ru" | "en";
export type MeasurementContext = "COLD_BASELINE" | "POST_LEARNING_DIAGNOSTIC" | "MIXED_EXPOSURE_INVALID_FOR_BASELINE";
export type VariantDistance = "NEAR" | "MEDIUM" | "FAR";

export const DIMENSION_KEYS = ["node_recognition", "mechanism_explanation", "action_selection", "boundary_control", "speed", "confidence_calibration", "variant_transfer", "retention", "field_transfer"] as const;
export type DimensionKey = (typeof DIMENSION_KEYS)[number];

export type EvidenceCell = { exposures: number; successes: number; distinctNodes: string[]; lastAt: string | null };
export type ModuleProgress = {
  state: ModuleState;
  contentCompleted: boolean;
  lessonStep: number;
  evidence: Record<DimensionKey, EvidenceCell>;
  recentClasses: ResponseClass[];
  highConfidenceError: boolean;
  completedBlocks: number;
};
export type TransferProbe = {
  isTransferProbe: true;
  variantDistance: VariantDistance;
  changedVariables: string[];
};
export type InteractionRecord = {
  id: string;
  at: string;
  moduleId: ModuleId;
  drillId: string;
  nodeKey: string;
  mode: LearningMode;
  actionOk: boolean;
  reasonOk: boolean;
  responseClass: ResponseClass;
  confidence: number;
  elapsedSeconds: number;
  transferProbe: TransferProbe | null;
};
export type ReviewItem = {
  id: string;
  moduleId: ModuleId;
  sourceDrillId: string;
  variantGroup: string;
  kind: "repair" | "retention";
  dueAt: string;
  attempts: number;
  sourceInteractionId: string;
};
export type CardState = { dueAt: string; intervalDays: number; repetitions: number; lapses: number; lastGrade: 0 | 1 | 2 | 3 | null };
export type FieldNote = {
  id: string;
  at: string;
  moduleId: ModuleId;
  cue: string;
  action: string;
  reason: string;
  cueBeforeAction: boolean;
  status: "PENDING_REVIEW" | "REVIEWED_VALID" | "REVIEWED_REPAIR" | "INSUFFICIENT";
  evaluatorNote: string;
};
export type DiagnosticRawResponse = {
  item_id: string;
  answer: string;
  reasoning: string;
  confidence: number;
  time_seconds: number;
  locale: LocaleCode;
};
export type DiagnosticState = {
  status: "NOT_STARTED" | "IN_PROGRESS" | "AWAITING_REVIEW" | "SCORED" | "ROUTED";
  runId: string | null;
  startedAt: string | null;
  submittedAt: string | null;
  responses: DiagnosticRawResponse[];
  priorityModules: ModuleId[];
  importedAt: string | null;
  measurementContext: MeasurementContext | null;
  learningExposureAtStart: boolean | null;
  localeAtStart: LocaleCode | null;
};
export type ActiveSession = {
  mode: LearningMode;
  moduleId: ModuleId;
  step: number;
  drillIds: string[];
  currentIndex: number;
  selectedActionId: string | null;
  selectedReasonId: string | null;
  confidence: number;
  startedAt: string;
  itemStartedAt: string;
  explainBack: string;
};
export type LearnerState = {
  schemaVersion: 2;
  appVersion: string;
  contentVersion: string;
  revision: number;
  updatedAt: string;
  modules: Record<ModuleId, ModuleProgress>;
  interactions: InteractionRecord[];
  reviewQueue: ReviewItem[];
  cards: Record<string, CardState>;
  fieldNotes: FieldNote[];
  diagnostic: DiagnosticState;
  activeSession: ActiveSession | null;
};
export type DrillEvidenceInput = {
  moduleId: ModuleId;
  drillId: string;
  nodeKey: string;
  variantGroup: string;
  mode: LearningMode;
  actionOk: boolean;
  reasonOk: boolean;
  confidence: number;
  elapsedSeconds: number;
  targetSeconds: number;
  isBoundary: boolean;
  transferProbe?: TransferProbe | null;
};
export type TodayAction = { kind: "resume" | "review" | "repair" | "lesson" | "diagnostic" | "field"; moduleId?: ModuleId; title: string; reason: string };

const nowIso = () => new Date().toISOString();
const id = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
const clone = <T>(value: T): T => structuredClone(value);
const isRecord = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === "object" && !Array.isArray(value);
const isFiniteNumber = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value);
const isLocale = (value: unknown): value is LocaleCode => value === "ru" || value === "en";
const isMeasurementContext = (value: unknown): value is MeasurementContext =>
  value === "COLD_BASELINE" || value === "POST_LEARNING_DIAGNOSTIC" || value === "MIXED_EXPOSURE_INVALID_FOR_BASELINE";
const isVariantDistance = (value: unknown): value is VariantDistance => value === "NEAR" || value === "MEDIUM" || value === "FAR";
const isResponseClass = (value: unknown): value is ResponseClass => ["A", "B", "C", "D", "E", "U"].includes(String(value));
const isLearningMode = (value: unknown): value is LearningMode => ["lesson", "practice", "repair", "review", "mixed"].includes(String(value));
const isModuleId = (value: unknown): value is ModuleId => MODULE_IDS.includes(value as ModuleId);

export function emptyEvidenceCell(): EvidenceCell { return { exposures: 0, successes: 0, distinctNodes: [], lastAt: null }; }
export function emptyModuleProgress(): ModuleProgress {
  return {
    state: "UNEXPOSED",
    contentCompleted: false,
    lessonStep: 0,
    evidence: Object.fromEntries(DIMENSION_KEYS.map((key) => [key, emptyEvidenceCell()])) as Record<DimensionKey, EvidenceCell>,
    recentClasses: [],
    highConfidenceError: false,
    completedBlocks: 0,
  };
}
export function emptyDiagnosticState(): DiagnosticState {
  return {
    status: "NOT_STARTED",
    runId: null,
    startedAt: null,
    submittedAt: null,
    responses: [],
    priorityModules: [],
    importedAt: null,
    measurementContext: null,
    learningExposureAtStart: null,
    localeAtStart: null,
  };
}
export function emptyLearnerState(): LearnerState {
  return {
    schemaVersion: STATE_SCHEMA_VERSION,
    appVersion: APP_VERSION,
    contentVersion: CONTENT_VERSION,
    revision: 0,
    updatedAt: nowIso(),
    modules: Object.fromEntries(MODULE_IDS.map((moduleId) => [moduleId, emptyModuleProgress()])) as Record<ModuleId, ModuleProgress>,
    interactions: [],
    reviewQueue: [],
    cards: {},
    fieldNotes: [],
    diagnostic: emptyDiagnosticState(),
    activeSession: null,
  };
}
export function classifyResponse(actionOk: boolean, reasonOk: boolean): ResponseClass {
  if (actionOk && reasonOk) return "A";
  if (!actionOk && reasonOk) return "B";
  if (actionOk && !reasonOk) return "C";
  return "D";
}
function touch(state: LearnerState): LearnerState {
  state.revision += 1;
  state.updatedAt = nowIso();
  state.appVersion = APP_VERSION;
  state.contentVersion = CONTENT_VERSION;
  return state;
}
function addEvidence(cell: EvidenceCell, success: boolean, nodeKey: string, at: string) {
  cell.exposures += 1;
  if (success) cell.successes += 1;
  if (!cell.distinctNodes.includes(nodeKey)) cell.distinctNodes.push(nodeKey);
  cell.distinctNodes = cell.distinctNodes.slice(-12);
  cell.lastAt = at;
}
export function evidencePercent(cell: EvidenceCell): number | null {
  return cell.exposures ? Math.round(((cell.successes + 1) / (cell.exposures + 2)) * 100) : null;
}
export function hasLearningExposure(state: LearnerState): boolean {
  return state.interactions.length > 0
    || MODULE_IDS.some((moduleId) => state.modules[moduleId].contentCompleted || state.modules[moduleId].lessonStep > 0);
}
function invalidateColdDiagnosticIfNeeded(state: LearnerState) {
  if (state.diagnostic.status !== "IN_PROGRESS") return;
  if (state.diagnostic.measurementContext === "COLD_BASELINE") {
    state.diagnostic.measurementContext = "MIXED_EXPOSURE_INVALID_FOR_BASELINE";
  }
}
export function startDiagnosticRun(state: LearnerState, locale: LocaleCode): LearnerState {
  const next = clone(state);
  const exposed = hasLearningExposure(next);
  next.diagnostic = {
    status: "IN_PROGRESS",
    runId: id("t1"),
    startedAt: nowIso(),
    submittedAt: null,
    responses: [],
    priorityModules: [],
    importedAt: null,
    measurementContext: exposed ? "POST_LEARNING_DIAGNOSTIC" : "COLD_BASELINE",
    learningExposureAtStart: exposed,
    localeAtStart: locale,
  };
  return touch(next);
}
export function recordDiagnosticResponse(state: LearnerState, response: DiagnosticRawResponse, expectedItemIds: string[]): LearnerState {
  if (state.diagnostic.status !== "IN_PROGRESS") return state;
  if (!expectedItemIds.includes(response.item_id)) return state;
  if (state.diagnostic.responses.some((item) => item.item_id === response.item_id)) return state;
  if (!response.answer.trim() || !response.reasoning.trim()) return state;
  if (!Number.isInteger(response.confidence) || response.confidence < 0 || response.confidence > 100) return state;
  if (!isFiniteNumber(response.time_seconds) || response.time_seconds < 0 || !isLocale(response.locale)) return state;
  const next = clone(state);
  next.diagnostic.responses.push(response);
  const final = next.diagnostic.responses.length === expectedItemIds.length;
  next.diagnostic.status = final ? "AWAITING_REVIEW" : "IN_PROGRESS";
  if (final) next.diagnostic.submittedAt = nowIso();
  return touch(next);
}
export function deriveModuleState(progress: ModuleProgress): ModuleState {
  const exposures = DIMENSION_KEYS.reduce((sum, key) => sum + progress.evidence[key].exposures, 0);
  if (!progress.contentCompleted && exposures === 0) return "UNEXPOSED";
  if (progress.highConfidenceError || progress.recentClasses.at(-1) === "D") return "REPAIR_REQUIRED";
  const action = progress.evidence.action_selection;
  const mechanism = progress.evidence.mechanism_explanation;
  const boundary = progress.evidence.boundary_control;
  const variant = progress.evidence.variant_transfer;
  const retention = progress.evidence.retention;
  const field = progress.evidence.field_transfer;
  const fieldValidated = field.successes >= 2 && field.distinctNodes.length >= 2 && retention.successes >= 1 && variant.successes >= 1;
  if (fieldValidated) return "FIELD_VALIDATED";
  if (retention.successes >= 1 && variant.successes >= 2 && boundary.successes >= 1) return "FIELD_TEST_PENDING";
  if (retention.successes >= 1 && variant.successes >= 1) return "RETAINED";
  if (action.successes >= 2 && mechanism.successes >= 2 && new Set([...action.distinctNodes, ...mechanism.distinctNodes]).size >= 2) return "WORKING";
  if (progress.recentClasses.some((value) => value !== "A")) return "FRAGILE";
  return "INTRODUCED";
}
function queueReview(state: LearnerState, input: DrillEvidenceInput, interactionId: string, passed: boolean) {
  const kind: ReviewItem["kind"] = passed ? "retention" : "repair";
  const dueAt = new Date(Date.now() + (passed ? 24 * 60 * 60 * 1000 : 0)).toISOString();
  const existing = state.reviewQueue.find((item) => item.moduleId === input.moduleId && item.variantGroup === input.variantGroup && item.kind === kind);
  if (existing) {
    existing.dueAt = new Date(Math.min(Date.parse(existing.dueAt), Date.parse(dueAt))).toISOString();
    existing.sourceInteractionId = interactionId;
    return;
  }
  state.reviewQueue.push({ id: id("review"), moduleId: input.moduleId, sourceDrillId: input.drillId, variantGroup: input.variantGroup, kind, dueAt, attempts: 0, sourceInteractionId: interactionId });
}
function normalizeTransferProbe(value: TransferProbe | null | undefined): TransferProbe | null {
  if (!value || value.isTransferProbe !== true || !isVariantDistance(value.variantDistance)) return null;
  const changedVariables = [...new Set(value.changedVariables.map((item) => item.trim()).filter(Boolean))];
  if (!changedVariables.length) return null;
  return { isTransferProbe: true, variantDistance: value.variantDistance, changedVariables };
}
export function recordDecision(state: LearnerState, input: DrillEvidenceInput): LearnerState {
  const next = clone(state);
  invalidateColdDiagnosticIfNeeded(next);
  const at = nowIso();
  const responseClass = classifyResponse(input.actionOk, input.reasonOk);
  const interactionId = id("interaction");
  const progress = next.modules[input.moduleId];
  const both = input.actionOk && input.reasonOk;
  const transferProbe = normalizeTransferProbe(input.transferProbe);
  const dueRetention = input.mode === "review"
    ? next.reviewQueue.find((item) => item.moduleId === input.moduleId
      && item.variantGroup === input.variantGroup
      && item.kind === "retention"
      && Date.parse(item.dueAt) <= Date.now())
    : undefined;

  addEvidence(progress.evidence.node_recognition, input.actionOk || input.reasonOk, input.nodeKey, at);
  addEvidence(progress.evidence.action_selection, input.actionOk, input.nodeKey, at);
  addEvidence(progress.evidence.mechanism_explanation, input.reasonOk, input.nodeKey, at);
  if (input.isBoundary) addEvidence(progress.evidence.boundary_control, both, input.nodeKey, at);
  addEvidence(progress.evidence.speed, both && input.elapsedSeconds <= input.targetSeconds, input.nodeKey, at);
  addEvidence(progress.evidence.confidence_calibration, (both && input.confidence >= 60) || (!both && input.confidence < 65), input.nodeKey, at);
  if (transferProbe) addEvidence(progress.evidence.variant_transfer, both, `${input.nodeKey}:${transferProbe.variantDistance}`, at);
  if (dueRetention) addEvidence(progress.evidence.retention, both, input.nodeKey, at);

  progress.recentClasses = [...progress.recentClasses, responseClass].slice(-6);
  if (!both && input.confidence >= 75) progress.highConfidenceError = true;
  else if (both && input.mode !== "lesson") progress.highConfidenceError = false;

  next.interactions.push({
    id: interactionId,
    at,
    moduleId: input.moduleId,
    drillId: input.drillId,
    nodeKey: input.nodeKey,
    mode: input.mode,
    actionOk: input.actionOk,
    reasonOk: input.reasonOk,
    responseClass,
    confidence: input.confidence,
    elapsedSeconds: input.elapsedSeconds,
    transferProbe,
  });
  next.interactions = next.interactions.slice(-500);

  if (input.mode === "review") {
    if (dueRetention) {
      dueRetention.attempts += 1;
      if (both) next.reviewQueue = next.reviewQueue.filter((item) => item.id !== dueRetention.id);
      else dueRetention.dueAt = new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString();
    }
  } else if (input.mode === "repair") {
    const due = next.reviewQueue.find((item) => item.moduleId === input.moduleId && item.variantGroup === input.variantGroup && item.kind === "repair" && Date.parse(item.dueAt) <= Date.now());
    if (due) {
      due.attempts += 1;
      if (both) next.reviewQueue = next.reviewQueue.filter((item) => item.id !== due.id);
      else due.dueAt = new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString();
    }
    if (both) queueReview(next, input, interactionId, true);
    else if (!due) queueReview(next, input, interactionId, false);
  } else {
    queueReview(next, input, interactionId, both);
  }

  progress.state = deriveModuleState(progress);
  return touch(next);
}
export function completeLesson(state: LearnerState, moduleId: ModuleId): LearnerState {
  const next = clone(state);
  invalidateColdDiagnosticIfNeeded(next);
  next.modules[moduleId].contentCompleted = true;
  next.modules[moduleId].lessonStep = 10;
  next.modules[moduleId].state = deriveModuleState(next.modules[moduleId]);
  next.activeSession = null;
  return touch(next);
}
export function completeBlock(state: LearnerState, moduleId?: ModuleId): LearnerState {
  const next = clone(state);
  invalidateColdDiagnosticIfNeeded(next);
  if (moduleId) {
    next.modules[moduleId].completedBlocks += 1;
    next.modules[moduleId].state = deriveModuleState(next.modules[moduleId]);
  }
  next.activeSession = null;
  return touch(next);
}
export function saveActiveSession(state: LearnerState, session: ActiveSession | null): LearnerState {
  const next = clone(state);
  next.activeSession = session;
  return touch(next);
}
export function moduleAvailable(state: LearnerState, moduleId: ModuleId, prerequisites: ModuleId[]): boolean {
  return moduleId === "geometry" || prerequisites.every((required) => state.modules[required].contentCompleted);
}
export function dueReviewItems(state: LearnerState, now = Date.now()): ReviewItem[] {
  return state.reviewQueue.filter((item) => Date.parse(item.dueAt) <= now).sort((left, right) => Date.parse(left.dueAt) - Date.parse(right.dueAt));
}
export function chooseTodayAction(state: LearnerState, moduleOrder: ModuleId[]): TodayAction {
  if (state.activeSession) return { kind: "resume", moduleId: state.activeSession.moduleId, title: "Продолжить текущую сессию", reason: "Сохранили точное место остановки." };
  const due = dueReviewItems(state)[0];
  if (due) return { kind: due.kind === "repair" ? "repair" : "review", moduleId: due.moduleId, title: due.kind === "repair" ? "Закрыть свежую ошибку" : "Проверить, что навык удержался", reason: "Это сейчас самое ценное действие по накопленным результатам практики." };
  const repair = moduleOrder.find((moduleId) => state.modules[moduleId].state === "REPAIR_REQUIRED");
  if (repair) return { kind: "repair", moduleId: repair, title: "Исправить ключевую ошибку", reason: "Ошибка с высокой уверенностью делает эту ситуацию приоритетной." };
  const nextLesson = moduleOrder.find((moduleId) => !state.modules[moduleId].contentCompleted);
  if (nextLesson) return { kind: "lesson", moduleId: nextLesson, title: "Изучить следующий механизм", reason: "Один новый механизм, затем перенос и повторение." };
  if (state.diagnostic.status === "NOT_STARTED") return { kind: "diagnostic", title: "Уточнить маршрут через T1", reason: "Необязательно, но полезно для персонализации." };
  return { kind: "field", title: "Разобрать реальную руку", reason: "Следующий рост требует проверенных примеров из игры." };
}
export function gradeCard(state: LearnerState, cardId: string, grade: 0 | 1 | 2 | 3): LearnerState {
  const next = clone(state);
  const previous = next.cards[cardId] ?? { dueAt: nowIso(), intervalDays: 0, repetitions: 0, lapses: 0, lastGrade: null };
  let intervalDays = previous.intervalDays;
  let delayMs = 0;
  if (grade === 0) { intervalDays = 0; delayMs = 10 * 60 * 1000; previous.lapses += 1; }
  if (grade === 1) { intervalDays = Math.max(1, Math.round(previous.intervalDays * 1.2) || 1); delayMs = intervalDays * 86400000; }
  if (grade === 2) { intervalDays = Math.max(2, Math.round(previous.intervalDays * 2.2) || 2); delayMs = intervalDays * 86400000; }
  if (grade === 3) { intervalDays = Math.max(4, Math.round(previous.intervalDays * 3.5) || 4); delayMs = intervalDays * 86400000; }
  next.cards[cardId] = { dueAt: new Date(Date.now() + delayMs).toISOString(), intervalDays, repetitions: previous.repetitions + 1, lapses: previous.lapses, lastGrade: grade };
  return touch(next);
}
export function addFieldNote(state: LearnerState, input: Omit<FieldNote, "id" | "at" | "status" | "evaluatorNote">): LearnerState {
  const next = clone(state);
  next.fieldNotes.push({ ...input, id: id("field"), at: nowIso(), status: "PENDING_REVIEW", evaluatorNote: "" });
  return touch(next);
}
export function reviewFieldNote(state: LearnerState, noteId: string, status: FieldNote["status"], evaluatorNote: string): LearnerState {
  const next = clone(state);
  const note = next.fieldNotes.find((item) => item.id === noteId);
  if (!note || note.status !== "PENDING_REVIEW") return state;
  note.status = status;
  note.evaluatorNote = evaluatorNote.trim();
  if (status === "REVIEWED_VALID" && note.cueBeforeAction) {
    const progress = next.modules[note.moduleId];
    addEvidence(progress.evidence.field_transfer, true, `field:${note.id}`, nowIso());
    progress.state = deriveModuleState(progress);
  }
  if (status === "REVIEWED_REPAIR") {
    const exists = next.reviewQueue.some((item) => item.sourceDrillId === `field:${note.id}` && item.kind === "repair");
    if (!exists) next.reviewQueue.push({ id: id("review"), moduleId: note.moduleId, sourceDrillId: `field:${note.id}`, variantGroup: `field-${note.moduleId}`, kind: "repair", dueAt: nowIso(), attempts: 0, sourceInteractionId: note.id });
  }
  return touch(next);
}

/**
 * Deterministic last-write-wins merge. This is intentionally not described as
 * conflict-safe: independent offline events can still be lost and require a
 * future event-level sync contract.
 */
export function mergeLearnerStates(local: LearnerState, remote: LearnerState | null): LearnerState {
  if (!remote) return local;
  const localTime = Date.parse(local.updatedAt) || 0;
  const remoteTime = Date.parse(remote.updatedAt) || 0;
  if (localTime !== remoteTime) return localTime > remoteTime ? local : remote;
  return local.revision >= remote.revision ? local : remote;
}

function validEvidenceCell(value: unknown): value is EvidenceCell {
  if (!isRecord(value)) return false;
  return isFiniteNumber(value.exposures)
    && isFiniteNumber(value.successes)
    && value.exposures >= 0
    && value.successes >= 0
    && value.successes <= value.exposures
    && Array.isArray(value.distinctNodes)
    && value.distinctNodes.every((node) => typeof node === "string")
    && (value.lastAt === null || typeof value.lastAt === "string");
}
function validModuleProgress(value: unknown): value is ModuleProgress {
  if (!isRecord(value) || typeof value.contentCompleted !== "boolean" || !isFiniteNumber(value.lessonStep) || !isRecord(value.evidence)) return false;
  if (!["UNEXPOSED", "INTRODUCED", "FRAGILE", "WORKING", "RETAINED", "FIELD_TEST_PENDING", "FIELD_VALIDATED", "REPAIR_REQUIRED"].includes(String(value.state))) return false;
  if (!Array.isArray(value.recentClasses) || !value.recentClasses.every(isResponseClass)) return false;
  if (typeof value.highConfidenceError !== "boolean" || !isFiniteNumber(value.completedBlocks)) return false;
  const evidence = value.evidence as Record<string, unknown>;
  return DIMENSION_KEYS.every((key) => validEvidenceCell(evidence[key]));
}
function validTransferProbe(value: unknown): value is TransferProbe | null {
  if (value === null) return true;
  if (!isRecord(value) || value.isTransferProbe !== true || !isVariantDistance(value.variantDistance) || !Array.isArray(value.changedVariables)) return false;
  return value.changedVariables.length > 0 && value.changedVariables.every((item) => typeof item === "string" && item.trim().length > 0);
}
function validInteraction(value: unknown): value is InteractionRecord {
  if (!isRecord(value)) return false;
  return typeof value.id === "string"
    && typeof value.at === "string"
    && isModuleId(value.moduleId)
    && typeof value.drillId === "string"
    && typeof value.nodeKey === "string"
    && isLearningMode(value.mode)
    && typeof value.actionOk === "boolean"
    && typeof value.reasonOk === "boolean"
    && isResponseClass(value.responseClass)
    && isFiniteNumber(value.confidence)
    && isFiniteNumber(value.elapsedSeconds)
    && validTransferProbe(value.transferProbe);
}
function validDiagnosticResponse(value: unknown): value is DiagnosticRawResponse {
  if (!isRecord(value)) return false;
  return typeof value.item_id === "string"
    && typeof value.answer === "string"
    && value.answer.trim().length > 0
    && typeof value.reasoning === "string"
    && value.reasoning.trim().length > 0
    && Number.isInteger(value.confidence)
    && Number(value.confidence) >= 0
    && Number(value.confidence) <= 100
    && isFiniteNumber(value.time_seconds)
    && value.time_seconds >= 0
    && isLocale(value.locale);
}
function validDiagnostic(value: unknown): value is DiagnosticState {
  if (!isRecord(value)) return false;
  if (!["NOT_STARTED", "IN_PROGRESS", "AWAITING_REVIEW", "SCORED", "ROUTED"].includes(String(value.status))) return false;
  if (!(value.runId === null || typeof value.runId === "string")) return false;
  if (!(value.startedAt === null || typeof value.startedAt === "string")) return false;
  if (!(value.submittedAt === null || typeof value.submittedAt === "string")) return false;
  if (!Array.isArray(value.responses) || !value.responses.every(validDiagnosticResponse)) return false;
  if (!Array.isArray(value.priorityModules) || !value.priorityModules.every(isModuleId)) return false;
  if (!(value.importedAt === null || typeof value.importedAt === "string")) return false;
  if (!(value.measurementContext === null || isMeasurementContext(value.measurementContext))) return false;
  if (!(value.learningExposureAtStart === null || typeof value.learningExposureAtStart === "boolean")) return false;
  if (!(value.localeAtStart === null || isLocale(value.localeAtStart))) return false;
  return true;
}
export function validateLearnerState(value: unknown): value is LearnerState {
  if (!isRecord(value) || value.schemaVersion !== STATE_SCHEMA_VERSION || !isFiniteNumber(value.revision) || typeof value.updatedAt !== "string") return false;
  if (typeof value.appVersion !== "string" || typeof value.contentVersion !== "string") return false;
  if (!isRecord(value.modules) || !Array.isArray(value.interactions) || !Array.isArray(value.reviewQueue) || !isRecord(value.cards) || !Array.isArray(value.fieldNotes) || !validDiagnostic(value.diagnostic)) return false;
  if (!(value.activeSession === null || isRecord(value.activeSession))) return false;
  const moduleRecord = value.modules as Record<string, unknown>;
  if (!MODULE_IDS.every((moduleId) => validModuleProgress(moduleRecord[moduleId]))) return false;
  if (!value.interactions.every(validInteraction)) return false;
  return true;
}
function normalizeDiagnostic(raw: unknown): DiagnosticState {
  const base = emptyDiagnosticState();
  if (!isRecord(raw)) return base;
  const responses = Array.isArray(raw.responses)
    ? raw.responses.filter(isRecord).map((entry) => ({
      item_id: String(entry.item_id ?? ""),
      answer: String(entry.answer ?? ""),
      reasoning: String(entry.reasoning ?? ""),
      confidence: Math.max(0, Math.min(100, Math.round(Number(entry.confidence ?? 0)))),
      time_seconds: Math.max(0, Number(entry.time_seconds ?? 0)),
      locale: isLocale(entry.locale) ? entry.locale : "ru",
    })).filter(validDiagnosticResponse)
    : [];
  const status = ["NOT_STARTED", "IN_PROGRESS", "AWAITING_REVIEW", "SCORED", "ROUTED"].includes(String(raw.status))
    ? raw.status as DiagnosticState["status"]
    : responses.length >= 10 ? "AWAITING_REVIEW" : responses.length ? "IN_PROGRESS" : "NOT_STARTED";
  return {
    status,
    runId: typeof raw.runId === "string" ? raw.runId : status === "NOT_STARTED" ? null : id("t1-migrated"),
    startedAt: typeof raw.startedAt === "string" ? raw.startedAt : null,
    submittedAt: typeof raw.submittedAt === "string" ? raw.submittedAt : null,
    responses,
    priorityModules: Array.isArray(raw.priorityModules) ? raw.priorityModules.filter(isModuleId).slice(0, 2) : [],
    importedAt: typeof raw.importedAt === "string" ? raw.importedAt : null,
    measurementContext: isMeasurementContext(raw.measurementContext)
      ? raw.measurementContext
      : status === "NOT_STARTED" ? null : "MIXED_EXPOSURE_INVALID_FOR_BASELINE",
    learningExposureAtStart: typeof raw.learningExposureAtStart === "boolean" ? raw.learningExposureAtStart : null,
    localeAtStart: isLocale(raw.localeAtStart) ? raw.localeAtStart : status === "NOT_STARTED" ? null : "ru",
  };
}
function normalizeInteraction(entry: Record<string, unknown>): InteractionRecord | null {
  if (!isModuleId(entry.moduleId) || !isLearningMode(entry.mode)) return null;
  const actionOk = Boolean(entry.actionOk);
  const reasonOk = Boolean(entry.reasonOk);
  const transferProbe = isRecord(entry.transferProbe)
    && entry.transferProbe.isTransferProbe === true
    && isVariantDistance(entry.transferProbe.variantDistance)
    && Array.isArray(entry.transferProbe.changedVariables)
    ? normalizeTransferProbe({
      isTransferProbe: true,
      variantDistance: entry.transferProbe.variantDistance,
      changedVariables: entry.transferProbe.changedVariables.map(String),
    })
    : null;
  return {
    id: typeof entry.id === "string" ? entry.id : id("interaction-migrated"),
    at: typeof entry.at === "string" ? entry.at : nowIso(),
    moduleId: entry.moduleId,
    drillId: String(entry.drillId ?? "legacy"),
    nodeKey: String(entry.nodeKey ?? "legacy"),
    mode: entry.mode,
    actionOk,
    reasonOk,
    responseClass: isResponseClass(entry.responseClass) ? entry.responseClass : classifyResponse(actionOk, reasonOk),
    confidence: Math.max(0, Math.min(100, Number(entry.confidence ?? 0))),
    elapsedSeconds: Math.max(0, Number(entry.elapsedSeconds ?? 0)),
    transferProbe,
  };
}
export function migrateLearnerState(raw: unknown): LearnerState {
  if (validateLearnerState(raw)) return { ...raw, appVersion: APP_VERSION, contentVersion: CONTENT_VERSION };
  const base = emptyLearnerState();
  if (!isRecord(raw)) return base;

  if (raw.schemaVersion === STATE_SCHEMA_VERSION && isRecord(raw.modules)) {
    const moduleRecord = raw.modules as Record<string, unknown>;
    for (const moduleId of MODULE_IDS) {
      if (validModuleProgress(moduleRecord[moduleId])) base.modules[moduleId] = clone(moduleRecord[moduleId] as ModuleProgress);
    }
    base.interactions = Array.isArray(raw.interactions)
      ? raw.interactions.filter(isRecord).map(normalizeInteraction).filter((item): item is InteractionRecord => item !== null).slice(-500)
      : [];
    base.reviewQueue = Array.isArray(raw.reviewQueue)
      ? raw.reviewQueue.filter(isRecord).map((entry) => ({
        id: String(entry.id ?? id("review-migrated")),
        moduleId: isModuleId(entry.moduleId) ? entry.moduleId : "geometry",
        sourceDrillId: String(entry.sourceDrillId ?? "legacy"),
        variantGroup: String(entry.variantGroup ?? "legacy"),
        kind: entry.kind === "retention" ? "retention" as const : "repair" as const,
        dueAt: typeof entry.dueAt === "string" ? entry.dueAt : nowIso(),
        attempts: Math.max(0, Number(entry.attempts ?? 0)),
        sourceInteractionId: String(entry.sourceInteractionId ?? "legacy"),
      }))
      : [];
    base.cards = isRecord(raw.cards) ? clone(raw.cards as Record<string, CardState>) : {};
    base.fieldNotes = Array.isArray(raw.fieldNotes)
      ? raw.fieldNotes.filter(isRecord).map((note) => ({
        id: typeof note.id === "string" ? note.id : id("field-migrated"),
        at: typeof note.at === "string" ? note.at : nowIso(),
        moduleId: isModuleId(note.moduleId) ? note.moduleId : "geometry",
        cue: String(note.cue ?? ""),
        action: String(note.action ?? ""),
        reason: String(note.reason ?? ""),
        cueBeforeAction: Boolean(note.cueBeforeAction),
        status: ["PENDING_REVIEW", "REVIEWED_VALID", "REVIEWED_REPAIR", "INSUFFICIENT"].includes(String(note.status))
          ? note.status as FieldNote["status"]
          : "PENDING_REVIEW",
        evaluatorNote: String(note.evaluatorNote ?? ""),
      }))
      : [];
    base.diagnostic = normalizeDiagnostic(raw.diagnostic);
    base.activeSession = raw.activeSession === null || isRecord(raw.activeSession) ? raw.activeSession as ActiveSession | null : null;
    base.revision = Math.max(0, Number(raw.revision ?? 0));
    base.updatedAt = typeof raw.updatedAt === "string" ? raw.updatedAt : nowIso();
    return base;
  }

  const legacyDimension = isRecord(raw.dimension) ? raw.dimension : {};
  const legacyHistory = Array.isArray(raw.history) ? raw.history : [];
  const geometry = base.modules.geometry;
  geometry.contentCompleted = legacyHistory.length > 0 || Number(raw.completed ?? 0) >= 5;
  geometry.completedBlocks = legacyHistory.length;
  const map: Partial<Record<DimensionKey, string>> = { node_recognition: "node", mechanism_explanation: "mechanism", action_selection: "action", boundary_control: "boundary", speed: "speed", confidence_calibration: "calibration", retention: "retention", variant_transfer: "transfer" };
  for (const key of DIMENSION_KEYS) {
    const oldKey = map[key];
    const score = oldKey ? Number(legacyDimension[oldKey] ?? 0) : 0;
    if (score > 0) geometry.evidence[key] = { exposures: 1, successes: score >= 60 ? 1 : 0, distinctNodes: ["legacy-import"], lastAt: nowIso() };
  }
  geometry.state = deriveModuleState(geometry);
  if (Array.isArray(raw.fieldNotes)) {
    base.fieldNotes = raw.fieldNotes.filter(isRecord).map((note) => ({
      id: typeof note.id === "string" ? note.id : id("legacy-field"),
      at: typeof note.at === "string" ? note.at : nowIso(),
      moduleId: isModuleId(note.moduleId) ? note.moduleId : "geometry",
      cue: String(note.cue ?? ""),
      action: String(note.action ?? ""),
      reason: String(note.reason ?? ""),
      cueBeforeAction: false,
      status: "PENDING_REVIEW",
      evaluatorNote: "Imported from v0.4.1; review required.",
    }));
  }
  base.diagnostic = normalizeDiagnostic(raw.diagnostic);
  return touch(base);
}
