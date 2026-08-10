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
export const PORTABLE_PROFILE_KEY = "live-cash-os:portable-profile-code";
const PORTABLE_PROFILE_HEADER = "x-live-cash-profile-code";
const PORTABLE_PROFILE_PATTERN = /^LCO-[A-Z0-9_-]{20,80}$/;

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
  cloudToken?: string | null;
  code?: string;
  revision?: number;
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

function mutationResponseNeedsRuntime(response: Response): boolean {
  return response.status !== 401 && response.status < 500;
}

export function useReliableLearnerState() {
  const [state, setState] = useState<LearnerState>(emptyLearnerState);
  const [ready, setReady] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("loading");
  const [cloudMode, setCloudMode] = useState<CloudMode>("cloud");
  const [recoveryCode, setRecoveryCode] = useState<RecoveryCode>(null);
  const [recoveryBlocked, setRecoveryBlocked] = useState(false);
  const [lastErrorCode, setLastErrorCode] = useState<string | null>(null);
  const [lastLocalSaveAt, setLastLocalSaveAt] = useState<string | null>(null);
  const [lastCloudSaveAt, setLastCloudSaveAt] = useState<string | null>(null);
  const [conflict, setConflict] = useState<ConflictSnapshot | null>(null);
  const [recoveryRaw, setRecoveryRaw] = useState<string | null>(null);
  const [retryNonce, setRetryNonce] = useState(0);
  const [portableProfileActive, setPortableProfileActive] = useState(false);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const serverRevision = useRef<number | null>(null);
  const serverCloudToken = useRef<string | null>(null);
  const cloudDisabled = useRef(false);
  const authUnavailable = useRef(false);
  const updateRequired = useRef(false);
  const conflictRef = useRef<ConflictSnapshot | null>(null);
  const mounted = useRef(true);
  const portableProfileCode = useRef<string | null>(null);
  const restoreSettled = useRef(false);

  const profileHeaders = useCallback((): HeadersInit => {
    const code = portableProfileCode.current;
    return code ? { [PORTABLE_PROFILE_HEADER]: code } : {};
  }, []);

  const requireUpdate = useCallback(() => {
    updateRequired.current = true;
    setRecoveryBlocked(true);
    setRecoveryCode("UPDATE_REQUIRED");
    setLastErrorCode("UPDATE_REQUIRED");
    setSyncStatus("error");
  }, []);

  const rememberConflict = useCallback((local: LearnerState, remote: LearnerState | null) => {
    const snapshot: ConflictSnapshot = { at: new Date().toISOString(), local, remote };
    setState(local);
    conflictRef.current = snapshot;
    setConflict(snapshot);
    setSyncStatus("conflict");
    setRecoveryCode("STATE_CONFLICT");
    setLastErrorCode("STATE_CONFLICT");
    safeSet(CONFLICT_BACKUP_KEY, JSON.stringify(snapshot));
  }, []);

  const acceptCloudAck = useCallback((payload: StateApiPayload, fallback: LearnerState) => {
    serverRevision.current = typeof payload.revision === "number" ? payload.revision : fallback.revision;
    serverCloudToken.current = typeof payload.cloudToken === "string" ? payload.cloudToken : serverCloudToken.current;
    const savedAt = new Date().toISOString();
    setLastCloudSaveAt(savedAt);
    setLastErrorCode(null);
    setSyncStatus("synced");
    const meta: SyncMeta = {
      cloudDisabled: false,
      lastCloudRevision: serverRevision.current,
      lastCloudUpdatedAt: serverCloudToken.current,
      lastCloudSaveAt: savedAt,
    };
    writeSyncMeta(meta);
  }, []);

  const postState = useCallback(async (
    candidate: LearnerState,
    options: { baseRevision?: number | null; baseCloudToken?: string | null; resumeCloudSync?: boolean } = {},
  ) => {
    const response = await fetch("/api/state", {
      method: "POST",
      headers: { "content-type": "application/json", ...profileHeaders() },
      body: JSON.stringify({
        state: candidate,
        baseRevision: options.baseRevision ?? serverRevision.current,
        baseCloudToken: options.baseCloudToken ?? serverCloudToken.current,
        resumeCloudSync: options.resumeCloudSync === true,
      }),
    });
    let payload: StateApiPayload = {};
    try { payload = await response.json() as StateApiPayload; } catch { /* status is still useful */ }

    if (payload.code === "UPDATE_REQUIRED"
      || (mutationResponseNeedsRuntime(response) && (!payload.runtime || !runtimeCompatible(payload.runtime)))) {
      requireUpdate();
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
      const remote = payloadState(payload);
      if (remote) serverRevision.current = remote.revision;
      if (typeof payload.cloudToken === "string") serverCloudToken.current = payload.cloudToken;
      rememberConflict(candidate, remote);
      return { ok: false, response, payload };
    }
    if (response.status === 410 || payload.cloudDeleted) {
      cloudDisabled.current = true;
      if (typeof payload.cloudToken === "string") serverCloudToken.current = payload.cloudToken;
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
  }, [acceptCloudAck, profileHeaders, rememberConflict, requireUpdate]);

  useEffect(() => {
    mounted.current = true;
    restoreSettled.current = false;

    async function restore() {
      const meta = parseSyncMeta(safeGet(SYNC_META_KEY));
      portableProfileCode.current = safeGet(PORTABLE_PROFILE_KEY);
      setPortableProfileActive(Boolean(portableProfileCode.current));
      cloudDisabled.current = meta.cloudDisabled;
      serverRevision.current = meta.lastCloudRevision;
      serverCloudToken.current = meta.lastCloudUpdatedAt;
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
        setRecoveryBlocked(true);
        setRecoveryCode("FUTURE_STATE_UNSUPPORTED");
        setLastErrorCode("FUTURE_STATE_UNSUPPORTED");
      } else if (localRead.kind === "corrupt") {
        if (localRead.raw) {
          safeSet(RECOVERY_BACKUP_KEY, localRead.raw);
          setRecoveryRaw(localRead.raw);
        }
        setRecoveryBlocked(true);
        setRecoveryCode("LOCAL_STATE_CORRUPT");
        setLastErrorCode("LOCAL_STATE_CORRUPT");
      } else if (localRead.kind === "recovered") {
        if (localRead.raw) {
          safeSet(RECOVERY_BACKUP_KEY, localRead.raw);
          setRecoveryRaw(localRead.raw);
        }
        setRecoveryCode("LOCAL_STATE_RECOVERED");
        setLastErrorCode("LOCAL_STATE_RECOVERED");
      }

      // Fast path: a valid local snapshot is durable learner data, so render it
      // immediately. Cloud reconciliation continues in the background and cloud
      // writes stay gated until reconciliation settles.
      const localDecision = chooseRestoreState(localRead, null);
      const canHydrateLocally = Boolean(localRead.state) || cloudDisabled.current;
      if (canHydrateLocally) {
        setState(localDecision.state);
        if (cloudDisabled.current) {
          setSyncStatus("local");
        } else if (meta.lastCloudRevision === localDecision.state.revision) {
          setSyncStatus("synced");
        } else {
          setSyncStatus("local");
        }
        setReady(true);
      }

      let remote: LearnerState | null = null;
      let remotePayload: StateApiPayload = {};
      let remoteAvailable = false;
      if (!cloudDisabled.current) {
        try {
          const response = await fetch("/api/state", { cache: "no-store", headers: profileHeaders() });
          try { remotePayload = await response.json() as StateApiPayload; } catch { remotePayload = {}; }
          if (response.ok && (!remotePayload.runtime || !runtimeCompatible(remotePayload.runtime))) {
            requireUpdate();
          } else if (response.ok) {
            remoteAvailable = true;
            if (typeof remotePayload.cloudToken === "string") serverCloudToken.current = remotePayload.cloudToken;
            else if (remotePayload.cloudToken === null) serverCloudToken.current = null;
            if (remotePayload.cloudDeleted) {
              cloudDisabled.current = true;
              setCloudMode("local");
              setSyncStatus("local");
              writeSyncMeta({ ...EMPTY_SYNC_META, cloudDisabled: true });
            } else if (remotePayload.code === "CLOUD_STATE_UNREADABLE"
              || (remotePayload.state && !validateLearnerState(remotePayload.state))) {
              setRecoveryCode("CLOUD_STATE_UNREADABLE");
              setLastErrorCode("CLOUD_STATE_UNREADABLE");
              setSyncStatus("error");
            } else {
              remote = payloadState(remotePayload);
              serverRevision.current = remote?.revision ?? null;
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

      // Re-read localStorage after the network wait. If the learner interacted
      // while reconciliation was in flight, those local edits participate in the
      // same conservative ancestry/conflict decision and can never be overwritten
      // by the late GET response.
      const currentLocalRead = readLocalLearnerState(safeGet(LEARNER_STORAGE_KEY));
      const decision = chooseRestoreState(currentLocalRead, remote);
      if (decision.kind === "conflict") {
        rememberConflict(decision.state, decision.remoteState);
      } else {
        setState(decision.state);
      }

      if (remoteAvailable && remote && decision.kind !== "conflict") {
        serverRevision.current = remote.revision;
        if (localRead.kind === "corrupt" && (decision.kind === "remote" || decision.kind === "equivalent")) {
          setRecoveryBlocked(false);
        }
        setSyncStatus(decision.kind === "local" ? "local" : "synced");
      }

      if (localRead.kind === "future") setSyncStatus("error");
      restoreSettled.current = true;
      setReady(true);

      // A locally newer snapshot intentionally waits until reconciliation is
      // complete, then gets one debounced background push against the observed
      // cloud revision. No blocking spinner is needed.
      if (remoteAvailable && decision.kind === "local" && !cloudDisabled.current && !conflictRef.current) {
        setRetryNonce((value) => value + 1);
      }
    }

    void restore();
    return () => {
      mounted.current = false;
      restoreSettled.current = false;
    };
  }, [profileHeaders, rememberConflict, requireUpdate]);

  useEffect(() => {
    if (!ready || recoveryBlocked) return;
    const serialized = JSON.stringify(state);
    if (!safeSet(LEARNER_STORAGE_KEY, serialized)) {
      setRecoveryCode("LOCAL_WRITE_FAILED");
      setLastErrorCode("LOCAL_WRITE_FAILED");
      setSyncStatus("error");
      return;
    }
    setLastLocalSaveAt(new Date().toISOString());

    if (saveTimer.current) clearTimeout(saveTimer.current);
    if (!restoreSettled.current || cloudDisabled.current || authUnavailable.current || updateRequired.current || conflictRef.current) return;
    saveTimer.current = setTimeout(async () => {
      try {
        await postState(state);
      } catch {
        if (!mounted.current) return;
        setSyncStatus("offline");
        setLastErrorCode("NETWORK_SAVE_FAILED");
      }
    }, 800);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [postState, ready, recoveryBlocked, retryNonce, state]);

  useEffect(() => {
    const retry = () => {
      if (ready && restoreSettled.current && !recoveryBlocked && !cloudDisabled.current && !updateRequired.current && !conflictRef.current) {
        authUnavailable.current = false;
        setRetryNonce((value) => value + 1);
      }
    };
    window.addEventListener("online", retry);
    return () => window.removeEventListener("online", retry);
  }, [ready, recoveryBlocked]);

  const retrySync = useCallback(() => {
    if (recoveryBlocked || !restoreSettled.current || cloudDisabled.current || updateRequired.current || conflictRef.current) return;
    authUnavailable.current = false;
    setRetryNonce((value) => value + 1);
  }, [recoveryBlocked]);

  const deleteCloud = useCallback(async () => {
    try {
      const response = await fetch("/api/state", { method: "DELETE", headers: profileHeaders() });
      let payload: StateApiPayload = {};
      try { payload = await response.json() as StateApiPayload; } catch { /* no-op */ }
      if (response.ok && (!payload.runtime || !runtimeCompatible(payload.runtime))) {
        requireUpdate();
        return false;
      }
      if (!response.ok) {
        setLastErrorCode(payload.code ?? `HTTP_${response.status}`);
        setSyncStatus(response.status === 401 ? "local" : "error");
        return false;
      }
      cloudDisabled.current = true;
      serverRevision.current = null;
      serverCloudToken.current = typeof payload.cloudToken === "string" ? payload.cloudToken : null;
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
  }, [profileHeaders, requireUpdate]);

  const enableCloud = useCallback(async () => {
    if (recoveryBlocked) return false;
    try {
      setSyncStatus("syncing");
      const result = await postState(state, { baseRevision: null, baseCloudToken: null, resumeCloudSync: true });
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
  }, [postState, recoveryBlocked, state]);

  const resolveConflictWithCloud = useCallback(() => {
    const current = conflictRef.current;
    if (!current?.remote) return false;
    setState(current.remote);
    serverRevision.current = current.remote.revision;
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
        baseCloudToken: serverCloudToken.current,
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
    updateRequired.current = false;
    setRecoveryBlocked(false);
    setRecoveryCode(null);
    setState(candidate);
    return true;
  }, [state]);

  const resetLocal = useCallback(async () => {
    if (cloudDisabled.current || authUnavailable.current) {
      safeRemove(LEARNER_STORAGE_KEY);
      safeRemove(RECOVERY_BACKUP_KEY);
      updateRequired.current = false;
      setRecoveryRaw(null);
      setRecoveryBlocked(false);
      setRecoveryCode(null);
      setState(emptyLearnerState());
      return true;
    }

    try {
      const response = await fetch("/api/state", { cache: "no-store", headers: profileHeaders() });
      let payload: StateApiPayload = {};
      try { payload = await response.json() as StateApiPayload; } catch { /* no-op */ }
      if (!response.ok) {
        setSyncStatus(response.status === 401 ? "local" : "error");
        setLastErrorCode(payload.code ?? `HTTP_${response.status}`);
        return false;
      }
      if (!payload.runtime || !runtimeCompatible(payload.runtime)) {
        requireUpdate();
        return false;
      }
      if (payload.code === "CLOUD_STATE_UNREADABLE") {
        setRecoveryCode("CLOUD_STATE_UNREADABLE");
        setLastErrorCode("CLOUD_STATE_UNREADABLE");
        setSyncStatus("error");
        return false;
      }

      const remote = payload.cloudDeleted ? null : payloadState(payload);
      safeRemove(LEARNER_STORAGE_KEY);
      safeRemove(RECOVERY_BACKUP_KEY);
      updateRequired.current = false;
      setRecoveryRaw(null);
      setRecoveryBlocked(false);
      setRecoveryCode(null);
      if (payload.cloudDeleted) {
        cloudDisabled.current = true;
        writeSyncMeta({ ...EMPTY_SYNC_META, cloudDisabled: true });
        setCloudMode("local");
        setState(emptyLearnerState());
        setSyncStatus("local");
        return true;
      }
      serverRevision.current = remote?.revision ?? null;
      serverCloudToken.current = typeof payload.cloudToken === "string" ? payload.cloudToken : null;
      setState(remote ?? emptyLearnerState());
      setSyncStatus("synced");
      return true;
    } catch {
      setSyncStatus("offline");
      setLastErrorCode("NETWORK_RESET_FAILED");
      return false;
    }
  }, [profileHeaders, requireUpdate]);

  const activatePortableProfile = useCallback((rawCode: string) => {
    const code = rawCode.trim().toUpperCase();
    if (!PORTABLE_PROFILE_PATTERN.test(code)) return false;
    if (!safeSet(PORTABLE_PROFILE_KEY, code)) return false;
    portableProfileCode.current = code;
    setPortableProfileActive(true);
    window.location.reload();
    return true;
  }, []);

  const disconnectPortableProfile = useCallback(() => {
    safeRemove(PORTABLE_PROFILE_KEY);
    portableProfileCode.current = null;
    setPortableProfileActive(false);
    window.location.reload();
  }, []);

  return {
    state,
    setState,
    ready,
    syncStatus,
    cloudMode,
    recoveryCode,
    recoveryBlocked,
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
    portableProfileActive,
    activatePortableProfile,
    disconnectPortableProfile,
    stateSchemaVersion: STATE_SCHEMA_VERSION,
  };
}

export type ReliableLearnerStateController = ReturnType<typeof useReliableLearnerState>;
