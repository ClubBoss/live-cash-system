export const APP_VERSION = "1.1.0";
export const STATE_SCHEMA_VERSION = 2;
export const CONTENT_VERSION = "2026.08-wave6";

export const MODULE_IDS = ["geometry", "preflop", "blinds", "filtering", "shape", "aggression", "ancestry", "multiway", "river", "evidence", "transfer"] as const;
export type ModuleId = (typeof MODULE_IDS)[number];
export type LearningMode = "lesson" | "practice" | "repair" | "review" | "mixed";
export type ResponseClass = "A" | "B" | "C" | "D" | "E" | "U";
export type ModuleState = "UNEXPOSED" | "INTRODUCED" | "FRAGILE" | "WORKING" | "RETAINED" | "FIELD_TEST_PENDING" | "FIELD_VALIDATED" | "REPAIR_REQUIRED";
export type LocaleCode = "ru" | "en";
export type MeasurementContext = "COLD_BASELINE" | "POST_LEARNING_DIAGNOSTIC" | "MIXED_EXPOSURE_INVALID_FOR_BASELINE";
export type VariantDistance = "NONE" | "NEAR" | "MEDIUM" | "FAR";

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
  variantDistance: Exclude<VariantDistance, "NONE">;
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

export type EvaluatedDiagnosticImport = {
  schema_version: "0.1";
  learner_id: string;
  tranche_id: "T1";
  responses_scored: number;
  rerank_ready: boolean;
  module_summary: Record<string, { observed_error_rate: number; exposures: number; items: string[] }>;
  misconception_evidence: Record<string, { observations: number; high_confidence: number; items: string[] }>;
  tentative_priority_order: string[];
};

const nowIso = () => new Date().toISOString();
const id = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
const clone = <T>(value: T): T => structuredClone(value);
const isRecord = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === "object" && !Array.isArray(value);
const isFiniteNumber = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value);
const isLocale = (value: unknown): value is LocaleCode => value === "ru" || value === "en";
const isMeasurementContext = (value: unknown): value is MeasurementContext => ["COLD_BASELINE", "POST_LEARNING_DIAGNOSTIC", "MIXED_EXPOSURE_INVALID_FOR_BASELINE"].includes(String(value));

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
  return state.interactions.length > 0 || MODULE_IDS.some((moduleId) => state.modules[moduleId].contentCompleted || state.modules[moduleId].lessonStep > 0);
}
function invalidateColdDiagnosticIfNeeded(state: LearnerState) {
  if (state.diagnostic.status !== "IN_PROGRESS") return;
  if (state.diagnostic.measurementContext === "COLD_BASELINE") state.diagnostic.measurementContext = "MIXED_EXPOSURE_INVALID_FOR_BASELINE";
}
export function startDiagnosticRun(state: LearnerState, locale: LocaleCode): LearnerState {
  const next = clone(state);
  const exposed = hasLearningExposure(next);
  next.diagnostic = {
    status: "IN_PROGRESS",
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
  const next = clone(state);
  if (next.diagnostic.status !== "IN_PROGRESS") return state;
  if (!expectedItemIds.includes(response.item_id)) return state;
  if (next.diagnostic.responses.some((item) => item.item_id === response.item_id)) return state;
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
export function recordDecision(state: LearnerState, input: DrillEvidenceInput): LearnerState {
  const next = clone(state);
  invalidateColdDiagnosticIfNeeded(next);
  const at = nowIso();
  const responseClass = classifyResponse(input.actionOk, input.reasonOk);
  const interactionId = id("interaction");
  const progress = next.modules[input.moduleId];
  const both = input.actionOk && input.reasonOk;
  const transferProbe = input.transferProbe?.isTransferProbe && input.transferProbe.changedVariables.length > 0 ? input.transferProbe : null;
  addEvidence(progress.evidence.node_recognition, input.actionOk || input.reasonOk, input.nodeKey, at);
  addEvidence(progress.evidence.action_selection, input.actionOk, input.nodeKey, at);
  addEvidence(progress.evidence.mechanism_explanation, input.reasonOk, input.nodeKey, at);
  if (input.isBoundary) addEvidence(progress.evidence.boundary_control, both, input.nodeKey, at);
  addEvidence(progress.evidence.speed, both && input.elapsedSeconds <= input.targetSeconds, input.nodeKey, at);
  addEvidence(progress.evidence.confidence_calibration, (both && input.confidence >= 60) || (!both && input.confidence < 65), input.nodeKey, at);
  if (transferProbe) addEvidence(progress.evidence.variant_transfer, both, `${input.nodeKey}:${transferProbe.variantDistance}`, at);
  if (input.mode === "review") addEvidence(progress.evidence.retention, both, input.nodeKey, at);
  progress.recentClasses = [...progress.recentClasses, responseClass].slice(-6);
  if (!both && input.confidence >= 75) progress.highConfidenceError = true;
  else if (both && input.mode !== "lesson") progress.highConfidenceError = false;
  next.interactions.push({ id: interactionId, at, moduleId: input.moduleId, drillId: input.drillId, nodeKey: input.nodeKey, mode: input.mode, actionOk: input.actionOk, reasonOk: input.reasonOk, responseClass, confidence: input.confidence, elapsedSeconds: input.elapsedSeconds, transferProbe });
  next.interactions = next.interactions.slice(-500);

  if (input.mode === "review") {
    const due = next.reviewQueue.find((item) => item.moduleId === input.moduleId && item.variantGroup === input.variantGroup && item.kind === "retention" && Date.parse(item.dueAt) <= Date.now());
    if (due) {
      due.attempts += 1;
      if (both) next.reviewQueue = next.reviewQueue.filter((item) => item.id !== due.id);
      else due.dueAt = new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString();
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
  if (state.activeSession) return { kind: "resume", moduleId: state.activeSession.moduleId, title: "resume", reason: "active_session" };
  const due = dueReviewItems(state)[0];
  if (due) return { kind: due.kind === "repair" ? "repair" : "review", moduleId: due.moduleId, title: due.kind, reason: "due" };
  const repair = moduleOrder.find((moduleId) => state.modules[moduleId].state === "REPAIR_REQUIRED");
  if (repair) return { kind: "repair", moduleId: repair, title: "repair", reason: "high_confidence_error" };
  const nextLesson = moduleOrder.find((moduleId) => !state.modules[moduleId].contentCompleted);
  if (nextLesson) return { kind: "lesson", moduleId: nextLesson, title: "lesson", reason: "curriculum_order" };
  if (state.diagnostic.status === "NOT_STARTED") return { kind: "diagnostic", title: "diagnostic", reason: "optional_personalisation" };
  return { kind: "field", title: "field", reason: "field_evidence" };
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

function maxIso(left: string | null, right: string | null): string | null {
  if (!left) return right;
  if (!right) return left;
  return Date.parse(left) >= Date.parse(right) ? left : right;
}
function mergeEvidenceCell(left: EvidenceCell, right: EvidenceCell): EvidenceCell {
  return {
    exposures: Math.max(left.exposures, right.exposures),
    successes: Math.max(left.successes, right.successes),
    distinctNodes: [...new Set([...left.distinctNodes, ...right.distinctNodes])].slice(-12),
    lastAt: maxIso(left.lastAt, right.lastAt),
  };
}
function unionById<T extends { id: string }>(left: T[], right: T[], choose: (a: T, b: T) => T = (a, b) => b): T[] {
  const map = new Map<string, T>();
  for (const item of left) map.set(item.id, item);
  for (const item of right) map.set(item.id, map.has(item.id) ? choose(map.get(item.id) as T, item) : item);
  return [...map.values()];
}
function diagnosticRank(status: DiagnosticState["status"]): number {
  return ["NOT_STARTED", "IN_PROGRESS", "AWAITING_REVIEW", "SCORED", "ROUTED"].indexOf(status);
}
function mergeDiagnostic(left: DiagnosticState, right: DiagnosticState): DiagnosticState {
  const primary = diagnosticRank(right.status) > diagnosticRank(left.status) ? right : left;
  const secondary = primary === left ? right : left;
  const responses = new Map<string, DiagnosticRawResponse>();
  for (const response of [...secondary.responses, ...primary.responses]) responses.set(response.item_id, response);
  let measurementContext = primary.measurementContext ?? secondary.measurementContext;
  if (left.measurementContext && right.measurementContext && left.measurementContext !== right.measurementContext) measurementContext = "MIXED_EXPOSURE_INVALID_FOR_BASELINE";
  return {
    ...primary,
    responses: [...responses.values()],
    priorityModules: [...new Set([...left.priorityModules, ...right.priorityModules])].slice(0, 2),
    startedAt: maxIso(left.startedAt, right.startedAt),
    submittedAt: maxIso(left.submittedAt, right.submittedAt),
    importedAt: maxIso(left.importedAt, right.importedAt),
    measurementContext,
    learningExposureAtStart: primary.learningExposureAtStart ?? secondary.learningExposureAtStart,
    localeAtStart: primary.localeAtStart ?? secondary.localeAtStart,
  };
}
export function mergeLearnerStates(local: LearnerState, remote: LearnerState | null): LearnerState {
  if (!remote) return local;
  const newer = Date.parse(local.updatedAt) >= Date.parse(remote.updatedAt) ? local : remote;
  const older = newer === local ? remote : local;
  const merged = clone(newer);
  for (const moduleId of MODULE_IDS) {
    const left = local.modules[moduleId];
    const right = remote.modules[moduleId];
    const progress: ModuleProgress = {
      state: "UNEXPOSED",
      contentCompleted: left.contentCompleted || right.contentCompleted,
      lessonStep: Math.max(left.lessonStep, right.lessonStep),
      evidence: Object.fromEntries(DIMENSION_KEYS.map((key) => [key, mergeEvidenceCell(left.evidence[key], right.evidence[key])])) as Record<DimensionKey, EvidenceCell>,
      recentClasses: [...left.recentClasses, ...right.recentClasses].slice(-6),
      highConfidenceError: left.highConfidenceError || right.highConfidenceError,
      completedBlocks: Math.max(left.completedBlocks, right.completedBlocks),
    };
    progress.state = deriveModuleState(progress);
    merged.modules[moduleId] = progress;
  }
  merged.interactions = unionById(local.interactions, remote.interactions, (a, b) => Date.parse(a.at) >= Date.parse(b.at) ? a : b).sort((a, b) => Date.parse(a.at) - Date.parse(b.at)).slice(-500);
  merged.reviewQueue = unionById(local.reviewQueue, remote.reviewQueue, (a, b) => a.attempts > b.attempts ? a : b);
  merged.fieldNotes = unionById(local.fieldNotes, remote.fieldNotes, (a, b) => a.status === "PENDING_REVIEW" && b.status !== "PENDING_REVIEW" ? b : a);
  merged.cards = { ...older.cards, ...newer.cards };
  merged.diagnostic = mergeDiagnostic(local.diagnostic, remote.diagnostic);
  merged.activeSession = newer.activeSession ?? older.activeSession;
  merged.revision = Math.max(local.revision, remote.revision) + 1;
  merged.updatedAt = nowIso();
  merged.appVersion = APP_VERSION;
  merged.contentVersion = CONTENT_VERSION;
  return merged;
}

export function validateEvaluatedDiagnosticImport(value: unknown): value is EvaluatedDiagnosticImport {
  if (!isRecord(value) || value.schema_version !== "0.1" || value.tranche_id !== "T1") return false;
  if (typeof value.learner_id !== "string" || !value.learner_id.trim()) return false;
  if (!isFiniteNumber(value.responses_scored) || value.responses_scored !== 10 || value.rerank_ready !== true) return false;
  if (!isRecord(value.module_summary) || !isRecord(value.misconception_evidence) || !Array.isArray(value.tentative_priority_order)) return false;
  for (const [key, row] of Object.entries(value.module_summary)) {
    if (!/^LCM-(?:0[1-9]|1[01])$/u.test(key) || !isRecord(row)) return false;
    if (!isFiniteNumber(row.observed_error_rate) || row.observed_error_rate < 0 || row.observed_error_rate > 1) return false;
    if (!isFiniteNumber(row.exposures) || row.exposures < 1 || !Array.isArray(row.items)) return false;
    if (!row.items.every((item) => typeof item === "string" && /^LD-\d{3}$/u.test(item))) return false;
  }
  for (const [key, row] of Object.entries(value.misconception_evidence)) {
    if (!/^MC-\d{3}$/u.test(key) || !isRecord(row)) return false;
    if (!isFiniteNumber(row.observations) || !isFiniteNumber(row.high_confidence) || !Array.isArray(row.items)) return false;
  }
  return value.tentative_priority_order.every((item) => typeof item === "string");
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
  if (!Array.isArray(value.recentClasses) || !value.recentClasses.every((item) => ["A", "B", "C", "D", "E", "U"].includes(String(item)))) return false;
  if (typeof value.highConfidenceError !== "boolean" || !isFiniteNumber(value.completedBlocks)) return false;
  const evidence = value.evidence as Record<string, unknown>;
  return DIMENSION_KEYS.every((key) => validEvidenceCell(evidence[key]));
}
function validDiagnosticResponse(value: unknown): value is DiagnosticRawResponse {
  if (!isRecord(value)) return false;
  return typeof value.item_id === "string"
    && typeof value.answer === "string"
    && typeof value.reasoning === "string"
    && isFiniteNumber(value.confidence)
    && value.confidence >= 0
    && value.confidence <= 100
    && isFiniteNumber(value.time_seconds)
    && value.time_seconds >= 0
    && isLocale(value.locale);
}
function normalizeDiagnostic(raw: unknown): DiagnosticState {
  const base = emptyDiagnosticState();
  if (!isRecord(raw)) return base;
  const responses = Array.isArray(raw.responses) ? raw.responses.filter(isRecord).map((entry) => ({
    item_id: String(entry.item_id ?? ""),
    answer: String(entry.answer ?? ""),
    reasoning: String(entry.reasoning ?? ""),
    confidence: Math.max(0, Math.min(100, Number(entry.confidence ?? 0))),
    time_seconds: Math.max(0, Number(entry.time_seconds ?? 0)),
    locale: isLocale(entry.locale) ? entry.locale : "ru",
  })) : [];
  const status = ["NOT_STARTED", "IN_PROGRESS", "AWAITING_REVIEW", "SCORED", "ROUTED"].includes(String(raw.status)) ? raw.status as DiagnosticState["status"] : responses.length >= 10 ? "AWAITING_REVIEW" : responses.length ? "IN_PROGRESS" : "NOT_STARTED";
  return {
    status,
    startedAt: typeof raw.startedAt === "string" ? raw.startedAt : null,
    submittedAt: typeof raw.submittedAt === "string" ? raw.submittedAt : null,
    responses,
    priorityModules: Array.isArray(raw.priorityModules) ? raw.priorityModules.filter((item): item is ModuleId => MODULE_IDS.includes(item as ModuleId)).slice(0, 2) : [],
    importedAt: typeof raw.importedAt === "string" ? raw.importedAt : null,
    measurementContext: isMeasurementContext(raw.measurementContext) ? raw.measurementContext : status === "NOT_STARTED" ? null : "MIXED_EXPOSURE_INVALID_FOR_BASELINE",
    learningExposureAtStart: typeof raw.learningExposureAtStart === "boolean" ? raw.learningExposureAtStart : null,
    localeAtStart: isLocale(raw.localeAtStart) ? raw.localeAtStart : null,
  };
}
export function validateLearnerState(value: unknown): value is LearnerState {
  if (!isRecord(value) || value.schemaVersion !== STATE_SCHEMA_VERSION || !isFiniteNumber(value.revision) || typeof value.updatedAt !== "string") return false;
  if (typeof value.appVersion !== "string" || typeof value.contentVersion !== "string") return false;
  if (!isRecord(value.modules) || !Array.isArray(value.interactions) || !Array.isArray(value.reviewQueue) || !isRecord(value.cards) || !Array.isArray(value.fieldNotes) || !isRecord(value.diagnostic)) return false;
  if (!(value.activeSession === null || isRecord(value.activeSession))) return false;
  const moduleRecord = value.modules as Record<string, unknown>;
  if (!MODULE_IDS.every((moduleId) => validModuleProgress(moduleRecord[moduleId]))) return false;
  const diagnostic = value.diagnostic as Record<string, unknown>;
  if (!["NOT_STARTED", "IN_PROGRESS", "AWAITING_REVIEW", "SCORED", "ROUTED"].includes(String(diagnostic.status))) return false;
  if (!Array.isArray(diagnostic.responses) || !diagnostic.responses.every(validDiagnosticResponse) || !Array.isArray(diagnostic.priorityModules)) return false;
  if (!(diagnostic.measurementContext === null || isMeasurementContext(diagnostic.measurementContext))) return false;
  if (!(diagnostic.localeAtStart === null || isLocale(diagnostic.localeAtStart))) return false;
  return true;
}
export function migrateLearnerState(raw: unknown): LearnerState {
  if (validateLearnerState(raw)) return { ...raw, appVersion: APP_VERSION, contentVersion: CONTENT_VERSION };
  const base = emptyLearnerState();
  if (!isRecord(raw)) return base;

  if (raw.schemaVersion === 2 && isRecord(raw.modules)) {
    const modulesRaw = raw.modules as Record<string, unknown>;
    for (const moduleId of MODULE_IDS) if (validModuleProgress(modulesRaw[moduleId])) base.modules[moduleId] = clone(modulesRaw[moduleId]);
    base.interactions = Array.isArray(raw.interactions) ? raw.interactions.filter(isRecord).map((entry) => ({
      id: String(entry.id ?? id("interaction")),
      at: typeof entry.at === "string" ? entry.at : nowIso(),
      moduleId: MODULE_IDS.includes(entry.moduleId as ModuleId) ? entry.moduleId as ModuleId : "geometry",
      drillId: String(entry.drillId ?? "legacy"),
      nodeKey: String(entry.nodeKey ?? "legacy"),
      mode: ["lesson", "practice", "repair", "review", "mixed"].includes(String(entry.mode)) ? entry.mode as LearningMode : "practice",
      actionOk: Boolean(entry.actionOk),
      reasonOk: Boolean(entry.reasonOk),
      responseClass: ["A", "B", "C", "D", "E", "U"].includes(String(entry.responseClass)) ? entry.responseClass as ResponseClass : classifyResponse(Boolean(entry.actionOk), Boolean(entry.reasonOk)),
      confidence: Number(entry.confidence ?? 0),
      elapsedSeconds: Number(entry.elapsedSeconds ?? 0),
      transferProbe: isRecord(entry.transferProbe) && entry.transferProbe.isTransferProbe === true && ["NEAR", "MEDIUM", "FAR"].includes(String(entry.transferProbe.variantDistance)) && Array.isArray(entry.transferProbe.changedVariables)
        ? { isTransferProbe: true, variantDistance: entry.transferProbe.variantDistance as Exclude<VariantDistance, "NONE">, changedVariables: entry.transferProbe.changedVariables.map(String) }
        : null,
    })) : [];
    base.reviewQueue = Array.isArray(raw.reviewQueue) ? raw.reviewQueue.filter(isRecord).map((entry) => ({
      id: String(entry.id ?? id("review")),
      moduleId: MODULE_IDS.includes(entry.moduleId as ModuleId) ? entry.moduleId as ModuleId : "geometry",
      sourceDrillId: String(entry.sourceDrillId ?? "legacy"),
      variantGroup: String(entry.variantGroup ?? "legacy"),
      kind: entry.kind === "retention" ? "retention" : "repair",
      dueAt: typeof entry.dueAt === "string" ? entry.dueAt : nowIso(),
      attempts: Math.max(0, Number(entry.attempts ?? 0)),
      sourceInteractionId: String(entry.sourceInteractionId ?? "legacy"),
    })) : [];
    base.cards = isRecord(raw.cards) ? raw.cards as Record<string, CardState> : {};
    base.fieldNotes = Array.isArray(raw.fieldNotes) ? raw.fieldNotes.filter(isRecord).map((note) => ({
      id: typeof note.id === "string" ? note.id : id("legacy-field"),
      at: typeof note.at === "string" ? note.at : nowIso(),
      moduleId: MODULE_IDS.includes(note.moduleId as ModuleId) ? note.moduleId as ModuleId : "geometry",
      cue: String(note.cue ?? ""),
      action: String(note.action ?? ""),
      reason: String(note.reason ?? ""),
      cueBeforeAction: Boolean(note.cueBeforeAction),
      status: ["PENDING_REVIEW", "REVIEWED_VALID", "REVIEWED_REPAIR", "INSUFFICIENT"].includes(String(note.status)) ? note.status as FieldNote["status"] : "PENDING_REVIEW",
      evaluatorNote: String(note.evaluatorNote ?? ""),
    })) : [];
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
  if (Array.isArray(raw.fieldNotes)) base.fieldNotes = raw.fieldNotes.filter(isRecord).map((note) => ({ id: typeof note.id === "string" ? note.id : id("legacy-field"), at: typeof note.at === "string" ? note.at : nowIso(), moduleId: MODULE_IDS.includes(note.moduleId as ModuleId) ? note.moduleId as ModuleId : "geometry", cue: String(note.cue ?? ""), action: String(note.action ?? ""), reason: String(note.reason ?? ""), cueBeforeAction: false, status: "PENDING_REVIEW", evaluatorNote: "Imported from v0.4.1; review required." }));
  base.diagnostic = normalizeDiagnostic(raw.diagnostic);
  return touch(base);
}
