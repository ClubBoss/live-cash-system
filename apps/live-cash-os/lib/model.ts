export const APP_VERSION = "1.0.0";
export const STATE_SCHEMA_VERSION = 2;
export const CONTENT_VERSION = "2026.08-wave6";

export const MODULE_IDS = [
  "geometry",
  "preflop",
  "blinds",
  "filtering",
  "shape",
  "aggression",
  "ancestry",
  "multiway",
  "river",
  "evidence",
  "transfer",
] as const;

export type ModuleId = (typeof MODULE_IDS)[number];
export type LearningMode = "lesson" | "practice" | "repair" | "review" | "mixed";
export type ResponseClass = "A" | "B" | "C" | "D" | "E" | "U";
export type ModuleState =
  | "UNEXPOSED"
  | "INTRODUCED"
  | "FRAGILE"
  | "WORKING"
  | "RETAINED"
  | "FIELD_TEST_PENDING"
  | "FIELD_VALIDATED"
  | "REPAIR_REQUIRED";

export const DIMENSION_KEYS = [
  "node_recognition",
  "mechanism_explanation",
  "action_selection",
  "boundary_control",
  "speed",
  "confidence_calibration",
  "variant_transfer",
  "retention",
  "field_transfer",
] as const;
export type DimensionKey = (typeof DIMENSION_KEYS)[number];

export type EvidenceCell = {
  exposures: number;
  successes: number;
  distinctNodes: string[];
  lastAt: string | null;
};

export type ModuleProgress = {
  state: ModuleState;
  contentCompleted: boolean;
  lessonStep: number;
  evidence: Record<DimensionKey, EvidenceCell>;
  recentClasses: ResponseClass[];
  highConfidenceError: boolean;
  completedBlocks: number;
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

export type CardState = {
  dueAt: string;
  intervalDays: number;
  repetitions: number;
  lapses: number;
  lastGrade: 0 | 1 | 2 | 3 | null;
};

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
};

export type DiagnosticState = {
  status: "NOT_STARTED" | "IN_PROGRESS" | "AWAITING_REVIEW" | "SCORED" | "ROUTED";
  startedAt: string | null;
  submittedAt: string | null;
  responses: DiagnosticRawResponse[];
  priorityModules: ModuleId[];
  importedAt: string | null;
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
  explainBack: string;
} | null;

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
  activeSession: ActiveSession;
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
};

const isoNow = () => new Date().toISOString();
const makeId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export function emptyEvidenceCell(): EvidenceCell {
  return { exposures: 0, successes: 0, distinctNodes: [], lastAt: null };
}

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

export function emptyLearnerState(): LearnerState {
  return {
    schemaVersion: STATE_SCHEMA_VERSION,
    appVersion: APP_VERSION,
    contentVersion: CONTENT_VERSION,
    revision: 0,
    updatedAt: isoNow(),
    modules: Object.fromEntries(MODULE_IDS.map((id) => [id, emptyModuleProgress()])) as Record<ModuleId, ModuleProgress>,
    interactions: [],
    reviewQueue: [],
    cards: {},
    fieldNotes: [],
    diagnostic: {
      status: "NOT_STARTED",
      startedAt: null,
      submittedAt: null,
      responses: [],
      priorityModules: [],
      importedAt: null,
    },
    activeSession: null,
  };
}

export function classifyResponse(actionOk: boolean, reasonOk: boolean): ResponseClass {
  if (actionOk && reasonOk) return "A";
  if (!actionOk && reasonOk) return "B";
  if (actionOk && !reasonOk) return "C";
  return "D";
}

function cloneState(state: LearnerState): LearnerState {
  return structuredClone(state);
}

function touch(state: LearnerState): LearnerState {
  state.revision += 1;
  state.updatedAt = isoNow();
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
  if (cell.exposures === 0) return null;
  return Math.round(((cell.successes + 1) / (cell.exposures + 2)) * 100);
}

export function deriveModuleState(progress: ModuleProgress): ModuleState {
  const totalExposures = DIMENSION_KEYS.reduce((sum, key) => sum + progress.evidence[key].exposures, 0);
  if (!progress.contentCompleted && totalExposures === 0) return "UNEXPOSED";
  if (progress.highConfidenceError || progress.recentClasses.at(-1) === "D") return "REPAIR_REQUIRED";

  const action = progress.evidence.action_selection;
  const mechanism = progress.evidence.mechanism_explanation;
  const boundary = progress.evidence.boundary_control;
  const variant = progress.evidence.variant_transfer;
  const retention = progress.evidence.retention;
  const field = progress.evidence.field_transfer;

  if (field.successes >= 1) return "FIELD_VALIDATED";
  if (retention.successes >= 1 && variant.successes >= 2 && boundary.successes >= 1) return "FIELD_TEST_PENDING";
  if (retention.successes >= 1 && variant.successes >= 1) return "RETAINED";
  if (action.successes >= 2 && mechanism.successes >= 2 && new Set([...action.distinctNodes, ...mechanism.distinctNodes]).size >= 2) return "WORKING";
  if (progress.recentClasses.some((value) => value !== "A")) return "FRAGILE";
  return "INTRODUCED";
}

function queueReview(state: LearnerState, input: DrillEvidenceInput, interactionId: string, passed: boolean) {
  const now = Date.now();
  const kind: ReviewItem["kind"] = passed ? "retention" : "repair";
  const delayMs = passed ? 24 * 60 * 60 * 1000 : 0;
  const duplicate = state.reviewQueue.find(
    (item) => item.moduleId === input.moduleId && item.variantGroup === input.variantGroup && item.kind === kind,
  );
  if (duplicate) {
    duplicate.dueAt = new Date(Math.min(Date.parse(duplicate.dueAt), now + delayMs)).toISOString();
    duplicate.sourceInteractionId = interactionId;
    return;
  }
  state.reviewQueue.push({
    id: makeId("review"),
    moduleId: input.moduleId,
    sourceDrillId: input.drillId,
    variantGroup: input.variantGroup,
    kind,
    dueAt: new Date(now + delayMs).toISOString(),
    attempts: 0,
    sourceInteractionId: interactionId,
  });
}

export function recordDecision(state: LearnerState, input: DrillEvidenceInput): LearnerState {
  const next = cloneState(state);
  const at = isoNow();
  const responseClass = classifyResponse(input.actionOk, input.reasonOk);
  const interactionId = makeId("interaction");
  const progress = next.modules[input.moduleId];
  const both = input.actionOk && input.reasonOk;

  addEvidence(progress.evidence.node_recognition, input.actionOk || input.reasonOk, input.nodeKey, at);
  addEvidence(progress.evidence.action_selection, input.actionOk, input.nodeKey, at);
  addEvidence(progress.evidence.mechanism_explanation, input.reasonOk, input.nodeKey, at);
  if (input.isBoundary) addEvidence(progress.evidence.boundary_control, both, input.nodeKey, at);
  addEvidence(progress.evidence.speed, both && input.elapsedSeconds <= input.targetSeconds, input.nodeKey, at);
  const calibrated = (both && input.confidence >= 60) || (!both && input.confidence < 65);
  addEvidence(progress.evidence.confidence_calibration, calibrated, input.nodeKey, at);
  if (input.mode === "mixed" || input.mode === "repair" || input.mode === "review") {
    addEvidence(progress.evidence.variant_transfer, both, input.nodeKey, at);
  }
  if (input.mode === "review") addEvidence(progress.evidence.retention, both, input.nodeKey, at);

  progress.recentClasses = [...progress.recentClasses, responseClass].slice(-6);
  progress.highConfidenceError = !both && input.confidence >= 75;

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
  });
  next.interactions = next.interactions.slice(-500);

  if (input.mode === "review") {
    const due = next.reviewQueue.find(
      (item) => item.moduleId === input.moduleId && item.variantGroup === input.variantGroup && Date.parse(item.dueAt) <= Date.now(),
    );
    if (due) {
      due.attempts += 1;
      if (both) next.reviewQueue = next.reviewQueue.filter((item) => item.id !== due.id);
      else due.dueAt = new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString();
    }
  } else {
    queueReview(next, input, interactionId, both);
  }

  progress.state = deriveModuleState(progress);
  return touch(next);
}

export function completeLesson(state: LearnerState, moduleId: ModuleId): LearnerState {
  const next = cloneState(state);
  const progress = next.modules[moduleId];
  progress.contentCompleted = true;
  progress.lessonStep = 10;
  progress.state = deriveModuleState(progress);
  next.activeSession = null;
  return touch(next);
}

export function completeBlock(state: LearnerState, moduleId: ModuleId): LearnerState {
  const next = cloneState(state);
  next.modules[moduleId].completedBlocks += 1;
  next.modules[moduleId].state = deriveModuleState(next.modules[moduleId]);
  next.activeSession = null;
  return touch(next);
}

export function saveActiveSession(state: LearnerState, session: ActiveSession): LearnerState {
  const next = cloneState(state);
  next.activeSession = session;
  return touch(next);
}

export function moduleAvailable(state: LearnerState, moduleId: ModuleId, prerequisites: ModuleId[]): boolean {
  if (moduleId === "geometry") return true;
  return prerequisites.every((id) => state.modules[id].contentCompleted);
}

export function dueReviewItems(state: LearnerState, now = Date.now()): ReviewItem[] {
  return state.reviewQueue
    .filter((item) => Date.parse(item.dueAt) <= now)
    .sort((a, b) => Date.parse(a.dueAt) - Date.parse(b.dueAt));
}

export type TodayAction = {
  kind: "resume" | "review" | "repair" | "lesson" | "diagnostic" | "field";
  moduleId?: ModuleId;
  title: string;
  reason: string;
};

export function chooseTodayAction(state: LearnerState, moduleOrder: ModuleId[]): TodayAction {
  if (state.activeSession) {
    return { kind: "resume", moduleId: state.activeSession.moduleId, title: "Продолжить текущую сессию", reason: "Сохранили точное место остановки." };
  }
  const due = dueReviewItems(state);
  if (due.length) {
    return { kind: due[0].kind, moduleId: due[0].moduleId, title: due[0].kind === "repair" ? "Закрыть свежую ошибку" : "Проверить, что навык удержался", reason: "Это сейчас самое ценное действие по накопленным evidence." };
  }
  const priorityRepair = moduleOrder.find((id) => state.modules[id].state === "REPAIR_REQUIRED");
  if (priorityRepair) return { kind: "repair", moduleId: priorityRepair, title: "Починить структурную ошибку", reason: "Высокая уверенность при ошибке делает этот узел приоритетным." };
  const nextLesson = moduleOrder.find((id) => !state.modules[id].contentCompleted);
  if (nextLesson) return { kind: "lesson", moduleId: nextLesson, title: "Изучить следующий механизм", reason: "Один новый механизм, затем перенос и повторение." };
  if (state.diagnostic.status === "NOT_STARTED") return { kind: "diagnostic", title: "Персонализировать маршрут через T1", reason: "Необязательно, но полезно после первого знакомства с системой." };
  return { kind: "field", title: "Разобрать реальную руку", reason: "Теория уже покрыта; следующий рост требует полевого evidence." };
}

export function gradeCard(state: LearnerState, cardId: string, grade: 0 | 1 | 2 | 3): LearnerState {
  const next = cloneState(state);
  const previous = next.cards[cardId] ?? { dueAt: isoNow(), intervalDays: 0, repetitions: 0, lapses: 0, lastGrade: null };
  let intervalDays = previous.intervalDays;
  let dueMs = Date.now();
  if (grade === 0) {
    intervalDays = 0;
    dueMs += 10 * 60 * 1000;
    previous.lapses += 1;
  } else if (grade === 1) {
    intervalDays = Math.max(1, Math.round(previous.intervalDays * 1.2) || 1);
    dueMs += intervalDays * 24 * 60 * 60 * 1000;
  } else if (grade === 2) {
    intervalDays = Math.max(2, Math.round(previous.intervalDays * 2.2) || 2);
    dueMs += intervalDays * 24 * 60 * 60 * 1000;
  } else {
    intervalDays = Math.max(4, Math.round(previous.intervalDays * 3.5) || 4);
    dueMs += intervalDays * 24 * 60 * 60 * 1000;
  }
  next.cards[cardId] = {
    dueAt: new Date(dueMs).toISOString(),
    intervalDays,
    repetitions: previous.repetitions + 1,
    lapses: previous.lapses,
    lastGrade: grade,
  };
  return touch(next);
}

export function addFieldNote(
  state: LearnerState,
  input: Omit<FieldNote, "id" | "at" | "status" | "evaluatorNote">,
): LearnerState {
  const next = cloneState(state);
  next.fieldNotes.push({ ...input, id: makeId("field"), at: isoNow(), status: "PENDING_REVIEW", evaluatorNote: "" });
  return touch(next);
}

export function reviewFieldNote(
  state: LearnerState,
  noteId: string,
  status: FieldNote["status"],
  evaluatorNote: string,
): LearnerState {
  const next = cloneState(state);
  const note = next.fieldNotes.find((item) => item.id === noteId);
  if (!note) return state;
  note.status = status;
  note.evaluatorNote = evaluatorNote.trim();
  if (status === "REVIEWED_VALID" && note.cueBeforeAction) {
    const progress = next.modules[note.moduleId];
    addEvidence(progress.evidence.field_transfer, true, `field:${note.id}`, isoNow());
    progress.state = deriveModuleState(progress);
  }
  if (status === "REVIEWED_REPAIR") {
    next.reviewQueue.push({
      id: makeId("review"),
      moduleId: note.moduleId,
      sourceDrillId: `field:${note.id}`,
      variantGroup: `field-${note.moduleId}`,
      kind: "repair",
      dueAt: isoNow(),
      attempts: 0,
      sourceInteractionId: note.id,
    });
  }
  return touch(next);
}

export function mergeLearnerStates(local: LearnerState, remote: LearnerState | null): LearnerState {
  if (!remote) return local;
  const localTime = Date.parse(local.updatedAt) || 0;
  const remoteTime = Date.parse(remote.updatedAt) || 0;
  if (localTime !== remoteTime) return localTime > remoteTime ? local : remote;
  return local.revision >= remote.revision ? local : remote;
}

function safeRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function validateLearnerState(value: unknown): value is LearnerState {
  if (!safeRecord(value)) return false;
  if (value.schemaVersion !== STATE_SCHEMA_VERSION) return false;
  if (typeof value.revision !== "number" || typeof value.updatedAt !== "string") return false;
  if (!safeRecord(value.modules) || !Array.isArray(value.interactions) || !Array.isArray(value.reviewQueue)) return false;
  return MODULE_IDS.every((id) => safeRecord(value.modules[id]));
}

export function migrateLearnerState(raw: unknown): LearnerState {
  const base = emptyLearnerState();
  if (validateLearnerState(raw)) return raw;
  if (!safeRecord(raw)) return base;

  const legacyDimension = safeRecord(raw.dimension) ? raw.dimension : {};
  const legacyHistory = Array.isArray(raw.history) ? raw.history : [];
  const geometry = base.modules.geometry;
  geometry.contentCompleted = legacyHistory.length > 0 || Number(raw.completed ?? 0) >= 5;
  geometry.completedBlocks = legacyHistory.length;

  const mapping: Partial<Record<DimensionKey, string>> = {
    node_recognition: "node",
    mechanism_explanation: "mechanism",
    action_selection: "action",
    boundary_control: "boundary",
    speed: "speed",
    confidence_calibration: "calibration",
    retention: "retention",
    variant_transfer: "transfer",
  };
  for (const key of DIMENSION_KEYS) {
    const legacyKey = mapping[key];
    const score = legacyKey ? Number(legacyDimension[legacyKey] ?? 0) : 0;
    if (score > 0) {
      geometry.evidence[key] = {
        exposures: 1,
        successes: score >= 60 ? 1 : 0,
        distinctNodes: ["legacy-import"],
        lastAt: isoNow(),
      };
    }
  }
  geometry.state = deriveModuleState(geometry);

  if (Array.isArray(raw.fieldNotes)) {
    base.fieldNotes = raw.fieldNotes
      .filter(safeRecord)
      .map((note) => ({
        id: typeof note.id === "string" ? note.id : makeId("legacy-field"),
        at: typeof note.at === "string" ? note.at : isoNow(),
        moduleId: MODULE_IDS.includes(note.moduleId as ModuleId) ? (note.moduleId as ModuleId) : "geometry",
        cue: String(note.cue ?? ""),
        action: String(note.action ?? ""),
        reason: String(note.reason ?? ""),
        cueBeforeAction: false,
        status: "PENDING_REVIEW" as const,
        evaluatorNote: "Imported from v0.4.1; review required.",
      }));
  }

  const legacyDiagnostic = safeRecord(raw.diagnostic) ? raw.diagnostic : null;
  if (legacyDiagnostic && Array.isArray(legacyDiagnostic.responses)) {
    base.diagnostic.responses = legacyDiagnostic.responses.filter(safeRecord).map((entry) => ({
      item_id: String(entry.item_id ?? ""),
      answer: String(entry.answer ?? ""),
      reasoning: String(entry.reasoning ?? ""),
      confidence: Number(entry.confidence ?? 0),
      time_seconds: Number(entry.time_seconds ?? 0),
    }));
    base.diagnostic.status = base.diagnostic.responses.length >= 10 ? "AWAITING_REVIEW" : base.diagnostic.responses.length ? "IN_PROGRESS" : "NOT_STARTED";
    base.diagnostic.startedAt = typeof legacyDiagnostic.startedAt === "string" ? legacyDiagnostic.startedAt : null;
    base.diagnostic.submittedAt = typeof legacyDiagnostic.submittedAt === "string" ? legacyDiagnostic.submittedAt : null;
  }

  return touch(base);
}
