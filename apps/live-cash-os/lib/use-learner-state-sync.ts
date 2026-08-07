"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  STATE_SCHEMA_VERSION,
  emptyLearnerState,
  migrateLearnerState,
  validateLearnerState,
  type LearnerState,
} from "./model";
import {
  EMPTY_SYNC_META,
  chooseRestoreState,
  parseSyncMeta,
  prepareLearnerStateImport,
  readLocalLearnerState,
  runtimeCompatible,
  type RuntimeIdentity,
  type SyncMeta,
} from "./reliability";

export const LEARNER_STORAGE_KEY = "live-cash-os:learner-state";
export const SYNC_META_KEY = "live-cash-os:sync-meta";
export const RECOVERY_BACKUP_KEY = "live-cash-os:recovery-backup";
export const IMPORT_BACKUP_KEY = "live-cash-os:pre-import-backup";
export const CONFLICT_BACKUP_KEY = "live-cash-os:sync-conflict";

export type SyncStatus = "loading" | "local" | "syncing" | "synced" | "offline" | "conflict" | "error";
export type CloudMode = "cloud" | "local";
export type RecoveryCode =
  | "LOCAL_STATE_RECOVERED"
  | "LOCAL_STATE_CORRUPT"
  | "FUTURE_STATE_UNSUPPORTED"
  | "CLOUD_STATE_UNREADABLE"
  | "STATE_CONFLICT"
  | "UPDATE_REQUIRED"
  | "LOCAL_WRITE_FAILED"
  | "STATE_TOO_LARGE"
  | null;

export type ConflictSnapshot = {
  at: string;
  local: LearnerState;
  remote: LearnerState | null;
};

export type ImportResult = {
  ok: boolean;
  requiresConfirmation?: boolean;
  candidate?: LearnerState;
  reason?: "malformed_json" | "invalid_state" | "unsupported_future_schema" | "storage_failed";
};

type StateApiPayload = {
  state?: unknown;
  runtime?: RuntimeIdentity;
  cloudDeleted?: boolean;
  deletedAt?: string;
  code?: string;
  revision?: number;
  updatedAt?: string;
};

function safeSet(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function safeRemove(key: string) {
  try { localStorage.removeItem(key); } catch { /* best effort */ }
}

function safeGet(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}

function writeSyncMeta(meta: SyncMeta) {
  safeSet(SYNC_META_KEY, JSON.stringify(meta));
}

function payloadState(payload: StateApiPayload): LearnerState | null {
  if (!payload.state || !validateLearnerState(payload.state)) return null;
  return migrateLearnerState(payload.state);
}

export function useReliableLearnerState() {
  const [state, setState] = useState<LearnerState>(emptyLearnerState);
  const [ready, setReady] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("loading");
  const [cloudMode, setCloudMode] = useState<CloudMode>("cloud");
  const [recoveryCode, setRecoveryCode] = useState<RecoveryCode>(null);
  const [lastErrorCode, setLastErrorCode] = useState<string | null>(null);
  const [lastLocalSaveAt, setLastLocalSaveAt] = useState<string | null>(null);
  const [lastCloudSaveAt, setLastCloudSaveAt] = useState<string | null>(null);
  const [conflict, setConflict] = useState<ConflictSnapshot | null>(null);
  const [recoveryRaw, setRecoveryRaw] = useState<string | null>(null);
  const [retryNonce, setRetryNonce] = useState(0);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const serverRevision = useRef<number | null>(null);
  const serverUpdatedAt = useRef<string | null>(null);
  const cloudDisabled = useRef(false);
  const authUnavailable = useRef(false);
  const updateRequired = useRef(false);
  const conflictRef = useRef<ConflictSnapshot | null>(null);
  const mounted = useRef(true);

  const persistMeta = useCallback((patch: Partial<SyncMeta> = {}) => {
    const current = parseSyncMeta(safeGet(SYNC_META_KEY));
    const next: SyncMeta = {
      ...current,
      cloudDisabled: cloudDisabled.current,
      lastCloudRevision: serverRevision.current,
      lastCloudUpdatedAt: serverUpdatedAt.current,
      lastCloudSaveAt,
      ...patch,
    };
    writeSyncMeta(next);
  }, [lastCloudSaveAt]);

  const rememberConflict = useCallback((local: LearnerState, remote: LearnerState | null) => {
    const snapshot: ConflictSnapshot = { at: new Date().toISOString(), local, remote };
    conflictRef.current = snapshot;
    setConflict(snapshot);
    setSyncStatus("conflict");
    setRecoveryCode("STATE_CONFLICT");
    setLastErrorCode("STATE_CONFLICT");
    safeSet(CONFLICT_BACKUP_KEY, JSON.stringify(snapshot));
  }, []);

  const acceptCloudAck = useCallback((payload: StateApiPayload, fallback: LearnerState) => {
    serverRevision.current = typeof payload.revision === "number" ? payload.revision : fallback.revision;
    serverUpdatedAt.current = typeof payload.updatedAt === "string" ? payload.updatedAt : fallback.updatedAt;
    const savedAt = new Date().toISOString();
    setLastCloudSaveAt(savedAt);
    setLastErrorCode(null);
    setSyncStatus("synced");
    const meta: SyncMeta = {
      cloudDisabled: false,
      lastCloudRevision: serverRevision.current,
      lastCloudUpdatedAt: serverUpdatedAt.current,
      lastCloudSaveAt: savedAt,
    };
    writeSyncMeta(meta);
  }, []);

  const postState = useCallback(async (
    candidate: LearnerState,
    options: { baseRevision?: number | null; baseUpdatedAt?: string | null; resumeCloudSync?: boolean } = {},
  ) => {
    const response = await fetch("/api/state", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        state: candidate,
        baseRevision: options.baseRevision ?? serverRevision.current,
        baseUpdatedAt: options.baseUpdatedAt ?? serverUpdatedAt.current,
        resumeCloudSync: options.resumeCloudSync === true,
      }),
    });
    let payload: StateApiPayload = {};
    try { payload = await response.json() as StateApiPayload; } catch { /* status is still useful */ }

    if (payload.runtime && !runtimeCompatible(payload.runtime)) {
      updateRequired.current = true;
      setRecoveryCode("UPDATE_REQUIRED");
      setLastErrorCode("UPDATE_REQUIRED");
      setSyncStatus("error");
      return { ok: false, response, payload };
    }

    if (response.ok) {
      authUnavailable.current = false;
      cloudDisabled.current = false;
      setCloudMode("cloud");
      acceptCloudAck(payload, candidate);
      return { ok: true, response, payload };
    }

    if (response.status === 401) {
      authUnavailable.current = true;
      setSyncStatus("local");
      setLastErrorCode("AUTH_REQUIRED");
      return { ok: false, response, payload };
    }
    if (response.status === 409) {
      rememberConflict(candidate, payloadState(payload));
      return { ok: false, response, payload };
    }
    if (response.status === 410 || payload.cloudDeleted) {
      cloudDisabled.current = true;
      setCloudMode("local");
      setSyncStatus("local");
      setLastErrorCode("CLOUD_STATE_DELETED");
      writeSyncMeta({ ...EMPTY_SYNC_META, cloudDisabled: true });
      return { ok: false, response, payload };
    }
    if (response.status === 413) {
      setRecoveryCode("STATE_TOO_LARGE");
      setLastErrorCode("STATE_TOO_LARGE");
    } else {
      setLastErrorCode(payload.code ?? `HTTP_${response.status}`);
    }
    setSyncStatus("error");
    return { ok: false, response, payload };
  }, [acceptCloudAck, rememberConflict]);

  useEffect(() => {
    mounted.current = true;
    async function restore() {
      const meta = parseSyncMeta(safeGet(SYNC_META_KEY));
      cloudDisabled.current = meta.cloudDisabled;
      serverRevision.current = meta.lastCloudRevision;
      serverUpdatedAt.current = meta.lastCloudUpdatedAt;
      setLastCloudSaveAt(meta.lastCloudSaveAt);
      if (meta.cloudDisabled) setCloudMode("local");

      const rawLocal = safeGet(LEARNER_STORAGE_KEY);
      const localRead = readLocalLearnerState(rawLocal);
      if (localRead.kind === "future") {
        if (localRead.raw) {
          safeSet(RECOVERY_BACKUP_KEY, localRead.raw);
          setRecoveryRaw(localRead.raw);
        }
        updateRequired.current = true;
        setRecoveryCode("FUTURE_STATE_UNSUPPORTED");
        setLastErrorCode("FUTURE_STATE_UNSUPPORTED");
      } else if (localRead.kind === "corrupt" || localRead.kind === "recovered") {
        if (localRead.raw) {
          safeSet(RECOVERY_BACKUP_KEY, localRead.raw);
          setRecoveryRaw(localRead.raw);
        }
        setRecoveryCode(localRead.kind === "corrupt" ? "LOCAL_STATE_CORRUPT" : "LOCAL_STATE_RECOVERED");
        setLastErrorCode(localRead.kind === "corrupt" ? "LOCAL_STATE_CORRUPT" : "LOCAL_STATE_RECOVERED");
      }

      let remote: LearnerState | null = null;
      let remotePayload: StateApiPayload = {};
      let remoteAvailable = false;
      if (!cloudDisabled.current) {
        try {
          const response = await fetch("/api/state", { cache: "no-store" });
          try { remotePayload = await response.json() as StateApiPayload; } catch { remotePayload = {}; }
          if (remotePayload.runtime && !runtimeCompatible(remotePayload.runtime)) {
            updateRequired.current = true;
            setRecoveryCode("UPDATE_REQUIRED");
            setLastErrorCode("UPDATE_REQUIRED");
            setSyncStatus("error");
          } else if (response.ok) {
            remoteAvailable = true;
            if (remotePayload.cloudDeleted) {
              cloudDisabled.current = true;
              setCloudMode("local");
              setSyncStatus("local");
              writeSyncMeta({ ...EMPTY_SYNC_META, cloudDisabled: true });
            } else if (remotePayload.state && !validateLearnerState(remotePayload.state)) {
              setRecoveryCode("CLOUD_STATE_UNREADABLE");
              setLastErrorCode("CLOUD_STATE_UNREADABLE");
              setSyncStatus("error");
            } else {
              remote = payloadState(remotePayload);
              if (remote) {
                serverRevision.current = remote.revision;
                serverUpdatedAt.current = remote.updatedAt;
              } else {
                serverRevision.current = null;
                serverUpdatedAt.current = null;
              }
              setSyncStatus("synced");
            }
          } else if (response.status === 401) {
            authUnavailable.current = true;
            setSyncStatus("local");
            setLastErrorCode("AUTH_REQUIRED");
          } else {
            setSyncStatus("error");
            setLastErrorCode(remotePayload.code ?? `HTTP_${response.status}`);
          }
        } catch {
          setSyncStatus("offline");
          setLastErrorCode("NETWORK_OFFLINE");
        }
      } else {
        setSyncStatus("local");
      }

      const decision = chooseRestoreState(localRead, remote);
      if (decision.kind === "conflict") {
        rememberConflict(decision.state, decision.remoteState);
      } else {
        setState(decision.state);
      }

      if (remoteAvailable && remote && decision.kind !== "conflict") {
        serverRevision.current = remote.revision;
        serverUpdatedAt.current = remote.updatedAt;
      }

      if (localRead.kind === "future") setSyncStatus("error");
      setReady(true);
    }
    void restore();
    return () => { mounted.current = false; };
  }, [rememberConflict]);

  useEffect(() => {
    if (!ready) return;
    const serialized = JSON.stringify(state);
    if (!safeSet(LEARNER_STORAGE_KEY, serialized)) {
      setRecoveryCode("LOCAL_WRITE_FAILED");
      setLastErrorCode("LOCAL_WRITE_FAILED");
      setSyncStatus("error");
      return;
    }
    setLastLocalSaveAt(new Date().toISOString());

    if (saveTimer.current) clearTimeout(saveTimer.current);
    if (cloudDisabled.current || authUnavailable.current || updateRequired.current || conflictRef.current) return;
    saveTimer.current = setTimeout(async () => {
      setSyncStatus("syncing");
      try {
        await postState(state);
      } catch {
        if (!mounted.current) return;
        setSyncStatus("offline");
        setLastErrorCode("NETWORK_SAVE_FAILED");
      }
    }, 800);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [postState, ready, retryNonce, state]);

  useEffect(() => {
    const retry = () => {
      if (ready && !cloudDisabled.current && !updateRequired.current && !conflictRef.current) {
        authUnavailable.current = false;
        setRetryNonce((value) => value + 1);
      }
    };
    window.addEventListener("online", retry);
    return () => window.removeEventListener("online", retry);
  }, [ready]);

  const retrySync = useCallback(() => {
    if (cloudDisabled.current || updateRequired.current || conflictRef.current) return;
    authUnavailable.current = false;
    setRetryNonce((value) => value + 1);
  }, []);

  const deleteCloud = useCallback(async () => {
    try {
      const response = await fetch("/api/state", { method: "DELETE" });
      let payload: StateApiPayload = {};
      try { payload = await response.json() as StateApiPayload; } catch { /* no-op */ }
      if (!response.ok) {
        setLastErrorCode(payload.code ?? `HTTP_${response.status}`);
        setSyncStatus(response.status === 401 ? "local" : "error");
        return false;
      }
      cloudDisabled.current = true;
      serverRevision.current = null;
      serverUpdatedAt.current = null;
      setCloudMode("local");
      setSyncStatus("local");
      setLastErrorCode(null);
      writeSyncMeta({ ...EMPTY_SYNC_META, cloudDisabled: true });
      return true;
    } catch {
      setSyncStatus("offline");
      setLastErrorCode("NETWORK_DELETE_FAILED");
      return false;
    }
  }, []);

  const enableCloud = useCallback(async () => {
    try {
      setSyncStatus("syncing");
      const result = await postState(state, { baseRevision: null, baseUpdatedAt: null, resumeCloudSync: true });
      if (result.ok) {
        cloudDisabled.current = false;
        setCloudMode("cloud");
        return true;
      }
      return false;
    } catch {
      setSyncStatus("offline");
      setLastErrorCode("NETWORK_SAVE_FAILED");
      return false;
    }
  }, [postState, state]);

  const resolveConflictWithCloud = useCallback(() => {
    const current = conflictRef.current;
    if (!current?.remote) return false;
    setState(current.remote);
    serverRevision.current = current.remote.revision;
    serverUpdatedAt.current = current.remote.updatedAt;
    conflictRef.current = null;
    setConflict(null);
    safeRemove(CONFLICT_BACKUP_KEY);
    setRecoveryCode(null);
    setLastErrorCode(null);
    setSyncStatus("synced");
    return true;
  }, []);

  const resolveConflictWithLocal = useCallback(async () => {
    const current = conflictRef.current;
    if (!current) return false;
    try {
      const result = await postState(current.local, {
        baseRevision: current.remote?.revision ?? null,
        baseUpdatedAt: current.remote?.updatedAt ?? null,
      });
      if (!result.ok) return false;
      setState(current.local);
      conflictRef.current = null;
      setConflict(null);
      safeRemove(CONFLICT_BACKUP_KEY);
      setRecoveryCode(null);
      setLastErrorCode(null);
      return true;
    } catch {
      setSyncStatus("offline");
      setLastErrorCode("NETWORK_SAVE_FAILED");
      return false;
    }
  }, [postState]);

  const prepareImport = useCallback((text: string): ImportResult => {
    const prepared = prepareLearnerStateImport(text, state);
    if (!prepared.ok) return { ok: false, reason: prepared.reason };
    return {
      ok: true,
      candidate: prepared.state,
      requiresConfirmation: prepared.requiresConfirmation,
    };
  }, [state]);

  const applyImport = useCallback((candidate: LearnerState) => {
    if (!validateLearnerState(candidate)) return false;
    if (!safeSet(IMPORT_BACKUP_KEY, JSON.stringify(state))) {
      setLastErrorCode("IMPORT_BACKUP_FAILED");
      return false;
    }
    setState(candidate);
    return true;
  }, [state]);

  const resetLocal = useCallback(async () => {
    safeRemove(LEARNER_STORAGE_KEY);
    safeRemove(RECOVERY_BACKUP_KEY);
    setRecoveryRaw(null);
    setRecoveryCode(null);

    if (cloudDisabled.current || authUnavailable.current) {
      setState(emptyLearnerState());
      return true;
    }

    try {
      const response = await fetch("/api/state", { cache: "no-store" });
      const payload = await response.json() as StateApiPayload;
      if (response.ok && payload.runtime && runtimeCompatible(payload.runtime) && !payload.cloudDeleted) {
        const remote = payloadState(payload);
        if (remote) {
          serverRevision.current = remote.revision;
          serverUpdatedAt.current = remote.updatedAt;
          setState(remote);
          setSyncStatus("synced");
          return true;
        }
      }
      setState(emptyLearnerState());
      return true;
    } catch {
      setState(emptyLearnerState());
      setSyncStatus("offline");
      return true;
    }
  }, []);

  return {
    state,
    setState,
    ready,
    syncStatus,
    cloudMode,
    recoveryCode,
    lastErrorCode,
    lastLocalSaveAt,
    lastCloudSaveAt,
    conflict,
    recoveryRaw,
    retrySync,
    deleteCloud,
    enableCloud,
    resolveConflictWithCloud,
    resolveConflictWithLocal,
    prepareImport,
    applyImport,
    resetLocal,
    stateSchemaVersion: STATE_SCHEMA_VERSION,
  };
}
