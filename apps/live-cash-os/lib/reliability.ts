import {
  APP_VERSION,
  CONTENT_VERSION,
  MODULE_IDS,
  STATE_SCHEMA_VERSION,
  emptyLearnerState,
  migrateLearnerState,
  validateLearnerState,
  type LearnerState,
} from "./model-core";

export type RuntimeIdentity = {
  appVersion: string;
  contentVersion: string;
  schemaVersion: number;
};

export const CURRENT_RUNTIME: RuntimeIdentity = {
  appVersion: APP_VERSION,
  contentVersion: CONTENT_VERSION,
  schemaVersion: STATE_SCHEMA_VERSION,
};

export type LocalStateKind = "missing" | "valid" | "migrated" | "recovered" | "corrupt" | "future";

export type LocalStateRead = {
  kind: LocalStateKind;
  state: LearnerState | null;
  raw: string | null;
  reason?: string;
};

export type RestoreDecision = {
  kind: "local" | "remote" | "equivalent" | "conflict" | "empty";
  state: LearnerState;
  remoteState: LearnerState | null;
};

export type ImportPreparation = {
  ok: boolean;
  state?: LearnerState;
  migrated?: boolean;
  requiresConfirmation?: boolean;
  reason?: "malformed_json" | "invalid_state" | "unsupported_future_schema";
};

export type SyncMeta = {
  cloudDisabled: boolean;
  lastCloudRevision: number | null;
  // Historical key name retained for schema-v2 local compatibility. The value
  // is now an opaque server CAS token, not learner-state updatedAt.
  lastCloudUpdatedAt: string | null;
  lastCloudSaveAt: string | null;
};

export const EMPTY_SYNC_META: SyncMeta = {
  cloudDisabled: false,
  lastCloudRevision: null,
  lastCloudUpdatedAt: null,
  lastCloudSaveAt: null,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function schemaVersionOf(value: unknown): number | null {
  if (!isRecord(value)) return null;
  if (value.schemaVersion === undefined) return 0;
  return typeof value.schemaVersion === "number" && Number.isFinite(value.schemaVersion)
    ? value.schemaVersion
    : null;
}

function parseJson(raw: string): unknown {
  return JSON.parse(raw) as unknown;
}

function legacySchemaSupported(version: number): boolean {
  return version >= 0 && version < STATE_SCHEMA_VERSION;
}

export function readLocalLearnerState(raw: string | null): LocalStateRead {
  if (raw === null) return { kind: "missing", state: null, raw: null };

  let parsed: unknown;
  try {
    parsed = parseJson(raw);
  } catch {
    return { kind: "corrupt", state: null, raw, reason: "Malformed JSON" };
  }

  const version = schemaVersionOf(parsed);
  if (version === null) return { kind: "corrupt", state: null, raw, reason: "Invalid schema version" };
  if (version > STATE_SCHEMA_VERSION) {
    return { kind: "future", state: null, raw, reason: `State schema ${version} is newer than supported schema ${STATE_SCHEMA_VERSION}` };
  }

  if (version === STATE_SCHEMA_VERSION && validateLearnerState(parsed)) {
    return { kind: "valid", state: migrateLearnerState(parsed), raw };
  }

  if (legacySchemaSupported(version)) {
    const migrated = migrateLearnerState(parsed);
    if (validateLearnerState(migrated)) return { kind: "migrated", state: migrated, raw };
    return { kind: "corrupt", state: null, raw, reason: "Legacy state could not be migrated safely" };
  }

  // A malformed schema-v2 local snapshot is recoverable only as a quarantined
  // best-effort copy. The caller preserves the original raw value first.
  const recovered = migrateLearnerState(parsed);
  if (validateLearnerState(recovered)) {
    return { kind: "recovered", state: recovered, raw, reason: "Schema-v2 state required recovery" };
  }
  return { kind: "corrupt", state: null, raw, reason: "State failed validation" };
}

export function prepareLearnerStateImport(text: string, current: LearnerState): ImportPreparation {
  let parsed: unknown;
  try {
    parsed = parseJson(text);
  } catch {
    return { ok: false, reason: "malformed_json" };
  }

  const version = schemaVersionOf(parsed);
  if (version === null) return { ok: false, reason: "invalid_state" };
  if (version > STATE_SCHEMA_VERSION) return { ok: false, reason: "unsupported_future_schema" };

  let candidate: LearnerState;
  let migrated = false;
  if (version === STATE_SCHEMA_VERSION) {
    // Import is fail-closed: unlike local corruption recovery, a malformed
    // current-schema import is never silently salvaged into the live state.
    if (!validateLearnerState(parsed)) return { ok: false, reason: "invalid_state" };
    candidate = migrateLearnerState(parsed);
  } else if (legacySchemaSupported(version)) {
    candidate = migrateLearnerState(parsed);
    migrated = true;
    if (!validateLearnerState(candidate)) return { ok: false, reason: "invalid_state" };
  } else {
    return { ok: false, reason: "invalid_state" };
  }

  return {
    ok: true,
    state: candidate,
    migrated,
    requiresConfirmation: !sameLearnerState(candidate, current) && !isSafeSuccessor(candidate, current),
  };
}

export function hasMeaningfulLearnerData(state: LearnerState): boolean {
  if (state.interactions.length || state.reviewQueue.length || Object.keys(state.cards).length || state.fieldNotes.length || state.activeSession) return true;
  if (state.diagnostic.status !== "NOT_STARTED" || state.diagnostic.responses.length) return true;
  const wave7 = state as LearnerState & { explainBackRecords?: unknown[] };
  if (wave7.explainBackRecords?.length) return true;
  return MODULE_IDS.some((moduleId) => {
    const progress = state.modules[moduleId];
    return progress.contentCompleted
      || progress.lessonStep > 0
      || progress.completedBlocks > 0
      || Object.values(progress.evidence).some((cell) => cell.exposures > 0 || cell.successes > 0);
  });
}

export function sameLearnerState(left: LearnerState, right: LearnerState): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function mapById(values: unknown): Map<string, Record<string, unknown>> {
  const result = new Map<string, Record<string, unknown>>();
  if (!Array.isArray(values)) return result;
  for (const value of values) {
    if (isRecord(value) && typeof value.id === "string") result.set(value.id, value);
  }
  return result;
}

function immutableRowsPreserved(candidateRows: unknown, baseRows: unknown): boolean {
  const candidate = mapById(candidateRows);
  const base = mapById(baseRows);
  for (const [id, row] of base) {
    const next = candidate.get(id);
    if (!next || JSON.stringify(next) !== JSON.stringify(row)) return false;
  }
  return true;
}

const FIELD_STATUS_RANK: Record<string, number> = {
  PENDING_REVIEW: 0,
  INSUFFICIENT: 1,
  REVIEWED_VALID: 1,
  REVIEWED_REPAIR: 1,
};

function fieldRowsPreserved(candidateState: LearnerState, baseState: LearnerState): boolean {
  const candidate = mapById(candidateState.fieldNotes);
  const base = mapById(baseState.fieldNotes);
  for (const [id, row] of base) {
    const next = candidate.get(id);
    if (!next) return false;
    for (const key of ["moduleId", "cue", "action", "reason", "at"]) {
      if (next[key] !== row[key]) return false;
    }
    const baseStatus = String(row.status);
    const nextStatus = String(next.status);
    const baseRank = FIELD_STATUS_RANK[baseStatus] ?? 0;
    const nextRank = FIELD_STATUS_RANK[nextStatus] ?? 0;
    if (nextRank < baseRank) return false;
    if (baseStatus !== "PENDING_REVIEW" && nextStatus !== baseStatus) return false;
    if (typeof row.evaluatorNote === "string" && row.evaluatorNote && next.evaluatorNote !== row.evaluatorNote) return false;
    if (typeof row.reviewedAt === "string" && row.reviewedAt && next.reviewedAt !== row.reviewedAt) return false;
  }
  return true;
}

function explainRowsPreserved(candidateState: LearnerState, baseState: LearnerState): boolean {
  const candidateRows = (candidateState as LearnerState & { explainBackRecords?: unknown[] }).explainBackRecords ?? [];
  const baseRows = (baseState as LearnerState & { explainBackRecords?: unknown[] }).explainBackRecords ?? [];
  const candidate = mapById(candidateRows);
  const base = mapById(baseRows);
  for (const [id, row] of base) {
    const next = candidate.get(id);
    if (!next) return false;
    for (const key of ["moduleId", "promptKey", "text", "at"]) {
      if (next[key] !== row[key]) return false;
    }
    if (row.status !== "PENDING_REVIEW" && next.status !== row.status) return false;
    if (typeof row.reviewerNote === "string" && row.reviewerNote && next.reviewerNote !== row.reviewerNote) return false;
  }
  return true;
}

function diagnosticPreserved(candidate: LearnerState, base: LearnerState): boolean {
  const nextResponses = new Map(candidate.diagnostic.responses.map((row) => [row.item_id, JSON.stringify(row)]));
  for (const row of base.diagnostic.responses) {
    if (nextResponses.get(row.item_id) !== JSON.stringify(row)) return false;
  }
  const baseReview = (base.diagnostic as LearnerState["diagnostic"] & { review?: unknown }).review;
  if (baseReview !== undefined) {
    const nextReview = (candidate.diagnostic as LearnerState["diagnostic"] & { review?: unknown }).review;
    if (JSON.stringify(nextReview) !== JSON.stringify(baseReview)) return false;
  }
  return true;
}

function modulesDoNotRegress(candidate: LearnerState, base: LearnerState): boolean {
  for (const moduleId of MODULE_IDS) {
    const next = candidate.modules[moduleId];
    const previous = base.modules[moduleId];
    if (previous.contentCompleted && !next.contentCompleted) return false;
    if (next.lessonStep < previous.lessonStep || next.completedBlocks < previous.completedBlocks) return false;
    for (const key of Object.keys(previous.evidence) as Array<keyof typeof previous.evidence>) {
      if (next.evidence[key].exposures < previous.evidence[key].exposures) return false;
      if (next.evidence[key].successes < previous.evidence[key].successes) return false;
    }
  }
  return true;
}

function cardsDoNotRegress(candidate: LearnerState, base: LearnerState): boolean {
  for (const [cardId, previous] of Object.entries(base.cards)) {
    const next = candidate.cards[cardId];
    if (!next) return false;
    if (next.repetitions < previous.repetitions || next.lapses < previous.lapses) return false;
  }
  return true;
}

function activeSessionPreserved(candidate: LearnerState, base: LearnerState): boolean {
  const previous = base.activeSession;
  if (!previous) return true;
  if (JSON.stringify(candidate.activeSession) === JSON.stringify(previous)) return true;

  // A partial choice/explain-back draft is user data. If no durable evidence or
  // completion advanced after the base snapshot, a different active session is
  // ambiguous and must become a conflict rather than an automatic winner.
  const baseInteractionIds = new Set(base.interactions.map((row) => row.id));
  const hasNewInteraction = candidate.interactions.some((row) => !baseInteractionIds.has(row.id));
  const baseProgress = base.modules[previous.moduleId];
  const nextProgress = candidate.modules[previous.moduleId];
  const completedForward = (!baseProgress.contentCompleted && nextProgress.contentCompleted)
    || nextProgress.completedBlocks > baseProgress.completedBlocks;
  return hasNewInteraction || completedForward;
}

/**
 * Conservative whole-snapshot ancestry check.
 *
 * This is not a merge. It only proves that accepting a newer whole snapshot
 * cannot discard already-recorded learner evidence or an unfinished answer.
 * If that proof is unavailable, callers surface a conflict instead of guessing
 * a winner.
 */
export function isSafeSuccessor(candidate: LearnerState, base: LearnerState): boolean {
  if (sameLearnerState(candidate, base)) return true;
  if (candidate.revision < base.revision) return false;
  if (!immutableRowsPreserved(candidate.interactions, base.interactions)) return false;
  if (!fieldRowsPreserved(candidate, base)) return false;
  if (!explainRowsPreserved(candidate, base)) return false;
  if (!diagnosticPreserved(candidate, base)) return false;
  if (!modulesDoNotRegress(candidate, base)) return false;
  if (!cardsDoNotRegress(candidate, base)) return false;
  if (!activeSessionPreserved(candidate, base)) return false;
  return true;
}

export function chooseRestoreState(localRead: LocalStateRead, remote: LearnerState | null): RestoreDecision {
  const local = localRead.state;
  if (!local && !remote) return { kind: "empty", state: emptyLearnerState(), remoteState: null };
  if (!local && remote) return { kind: "remote", state: remote, remoteState: remote };
  if (local && !remote) return { kind: "local", state: local, remoteState: null };

  const localState = local as LearnerState;
  const remoteState = remote as LearnerState;
  if (sameLearnerState(localState, remoteState)) return { kind: "equivalent", state: remoteState, remoteState };

  if (localRead.kind === "missing" || !hasMeaningfulLearnerData(localState)) {
    if (hasMeaningfulLearnerData(remoteState)) return { kind: "remote", state: remoteState, remoteState };
  }
  if (!hasMeaningfulLearnerData(remoteState) && hasMeaningfulLearnerData(localState)) {
    return { kind: "local", state: localState, remoteState };
  }

  const localFollowsRemote = isSafeSuccessor(localState, remoteState);
  const remoteFollowsLocal = isSafeSuccessor(remoteState, localState);
  if (localFollowsRemote && !remoteFollowsLocal) return { kind: "local", state: localState, remoteState };
  if (remoteFollowsLocal && !localFollowsRemote) return { kind: "remote", state: remoteState, remoteState };

  return { kind: "conflict", state: localState, remoteState };
}

export function runtimeCompatible(remote: RuntimeIdentity | null | undefined): boolean {
  return Boolean(remote)
    && remote?.appVersion === APP_VERSION
    && remote?.contentVersion === CONTENT_VERSION
    && remote?.schemaVersion === STATE_SCHEMA_VERSION;
}

export function parseSyncMeta(raw: string | null): SyncMeta {
  if (!raw) return { ...EMPTY_SYNC_META };
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!isRecord(parsed)) return { ...EMPTY_SYNC_META };
    return {
      cloudDisabled: parsed.cloudDisabled === true,
      lastCloudRevision: typeof parsed.lastCloudRevision === "number" ? parsed.lastCloudRevision : null,
      lastCloudUpdatedAt: typeof parsed.lastCloudUpdatedAt === "string" ? parsed.lastCloudUpdatedAt : null,
      lastCloudSaveAt: typeof parsed.lastCloudSaveAt === "string" ? parsed.lastCloudSaveAt : null,
    };
  } catch {
    return { ...EMPTY_SYNC_META };
  }
}

export function buildSafeDebugSummary(input: {
  state: LearnerState;
  locale: string;
  syncStatus: string;
  cloudMode: string;
  lastLocalSaveAt: string | null;
  lastCloudSaveAt: string | null;
  route: string;
  online: boolean;
  lastErrorCode?: string | null;
}) {
  const { state } = input;
  const serializedBytes = new TextEncoder().encode(JSON.stringify(state)).byteLength;
  return {
    generatedAt: new Date().toISOString(),
    appVersion: APP_VERSION,
    contentVersion: CONTENT_VERSION,
    stateSchemaVersion: STATE_SCHEMA_VERSION,
    locale: input.locale,
    syncStatus: input.syncStatus,
    cloudMode: input.cloudMode,
    stateRevision: state.revision,
    stateUpdatedAt: state.updatedAt,
    lastLocalSaveAt: input.lastLocalSaveAt,
    lastCloudSaveAt: input.lastCloudSaveAt,
    route: input.route,
    activeSession: state.activeSession ? {
      mode: state.activeSession.mode,
      moduleId: state.activeSession.moduleId,
      step: state.activeSession.step,
      currentIndex: state.activeSession.currentIndex,
      itemCount: state.activeSession.drillIds.length,
    } : null,
    online: input.online,
    serializedBytes,
    validation: validateLearnerState(state) ? "valid" : "invalid",
    lastErrorCode: input.lastErrorCode ?? null,
  };
}
