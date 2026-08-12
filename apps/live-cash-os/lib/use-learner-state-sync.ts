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
import { consumeStateBootstrap } from "./state-bootstrap";
import {
  CONFLICT_BACKUP_KEY,
  IMPORT_BACKUP_KEY,
  LEARNER_STORAGE_KEY,
  PORTABLE_PROFILE_KEY,
  PROFILE_LOCAL_STATE_KEYS,
  PROFILE_STORAGE_MIGRATION_KEY,
  RECOVERY_BACKUP_KEY,
  SYNC_META_KEY,
  profileStorageKey,
} from "./profile-storage";

export {
  CONFLICT_BACKUP_KEY,
  IMPORT_BACKUP_KEY,
  LEARNER_STORAGE_KEY,
  PORTABLE_PROFILE_KEY,
  PROFILE_STORAGE_MIGRATION_KEY,
  RECOVERY_BACKUP_KEY,
  SYNC_META_KEY,
} from "./profile-storage";

const PORTABLE_PROFILE_HEADER = "x-live-cash-profile-code";
const PORTABLE_PROFILE_PATTERN = /^LCO-[A-Z0-9_-]{20,80}$/;
const CLOUD_SAVE_DEBOUNCE_MS = 500;

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

function writeSyncMeta(key: string, meta: SyncMeta) {
  safeSet(key, JSON.stringify(meta));
}

function claimLegacyProfileStorage(profileCode: string | null) {
  if (!profileCode || safeGet(PROFILE_STORAGE_MIGRATION_KEY)) return;
  const legacyLearner = safeGet(LEARNER_STORAGE_KEY);
  if (legacyLearner === null) {
    safeSet(PROFILE_STORAGE_MIGRATION_KEY, "1");
    return;
  }

  const scopedLearnerKey = profileStorageKey(LEARNER_STORAGE_KEY, profileCode);
  const existingScopedLearner = safeGet(scopedLearnerKey);
  if (existingScopedLearner !== null && existingScopedLearner !== legacyLearner) {
    safeSet(PROFILE_STORAGE_MIGRATION_KEY, "1");
    return;
  }

  const movable: string[] = [];
  for (const baseKey of PROFILE_LOCAL_STATE_KEYS) {
    const legacy = safeGet(baseKey);
    if (legacy === null) continue;
    const targetKey = profileStorageKey(baseKey, profileCode);
    const target = safeGet(targetKey);
    if (target === null) {
      if (!safeSet(targetKey, legacy)) return;
      movable.push(baseKey);
    } else if (target === legacy) {
      movable.push(baseKey);
    }
  }

  if (!safeSet(PROFILE_STORAGE_MIGRATION_KEY, "1")) return;
  for (const baseKey of movable) safeRemove(baseKey);
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
  const latestState = useRef<LearnerState>(state);
  const lastAckedSerialized = useRef<string | null>(null);
  const cloudSaveInFlight = useRef(false);
  const queuedCloudState = useRef<LearnerState | null>(null);

  useEffect(() => {
    latestState.current = state;
  }, [state]);

  const setLearnerState = useCallback((next: LearnerState) => {
    latestState.current = next;
    setState(next);
  }, []);

  const accountKey = useCallback((baseKey: string) => profileStorageKey(baseKey, portableProfileCode.current), []);

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
    setLearnerState(local);
    conflictRef.current = snapshot;
    setConflict(snapshot);
    setSyncStatus("conflict");
    setRecoveryCode("STATE_CONFLICT");
    setLastErrorCode("STATE_CONFLICT");
    safeSet(accountKey(CONFLICT_BACKUP_KEY), JSON.stringify(snapshot));
  }, [accountKey, setLearnerState]);

  const acceptCloudAck = useCallback((payload: StateApiPayload, fallback: LearnerState) => {
    const acknowledged = JSON.stringify(fallback);
    serverRevision.current = typeof payload.revision === "number" ? payload.revision : fallback.revision;
    serverCloudToken.current = typeof payload.cloudToken === "string" ? payload.cloudToken : serverCloudToken.current;
    lastAckedSerialized.current = acknowledged;
    const savedAt = new Date().toISOString();
    setLastCloudSaveAt(savedAt);
    setLastErrorCode(null);
    if (JSON.stringify(latestState.current) === acknowledged) setSyncStatus("synced");
    const meta: SyncMeta = {
      cloudDisabled: false,
      lastCloudRevision: serverRevision.current,
      lastCloudUpdatedAt: serverCloudToken.current,
      lastCloudSaveAt: savedAt,
    };
    writeSyncMeta(accountKey(SYNC_META_KEY), meta);
  }, [accountKey]);

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
      rememberConflict(latestState.current, remote);
      return { ok: false, response, payload };
    }
    if (response.status === 410 || payload.cloudDeleted) {
      cloudDisabled.current = true;
      if (typeof payload.cloudToken === "string") serverCloudToken.current = payload.cloudToken;
      setCloudMode("local");
      setSyncStatus("local");
      setLastErrorCode("CLOUD_STATE_DELETED");
      writeSyncMeta(accountKey(SYNC_META_KEY), { ...EMPTY_SYNC_META, cloudDisabled: true });
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
  }, [acceptCloudAck, accountKey, profileHeaders, rememberConflict, requireUpdate]);

  const flushCloudState = useCallback(async (candidate: LearnerState) => {
    const serialized = JSON.stringify(candidate);
    if (serialized === lastAckedSerialized.current) return;
    if (cloudSaveInFlight.current) {
      queuedCloudState.current = candidate;
      return;
    }

    cloudSaveInFlight.current = true;
    try {
      await postState(candidate);
    } catch {
      if (mounted.current) {
        setSyncStatus("offline");
        setLastErrorCode("NETWORK_SAVE_FAILED");
      }
    } finally {
      cloudSaveInFlight.current = false;
      const queued = queuedCloudState.current;
      queuedCloudState.current = null;
      if (queued
        && !cloudDisabled.current
        && !authUnavailable.current
        && !updateRequired.current
        && !conflictRef.current
        && JSON.stringify(queued) !== lastAckedSerialized.current) {
        setRetryNonce((value) => value + 1);
      }
    }
  }, [postState]);

  useEffect(() => {
    mounted.current = true;
    restoreSettled.current = false;

    async function restore() {
      portableProfileCode.current = safeGet(PORTABLE_PROFILE_KEY);
      claimLegacyProfileStorage(portableProfileCode.current);
      setPortableProfileActive(Boolean(portableProfileCode.current));
      const meta = parseSyncMeta(safeGet(accountKey(SYNC_META_KEY)));
      cloudDisabled.current = meta.cloudDisabled;
      serverRevision.current = meta.lastCloudRevision;
      serverCloudToken.current = meta.lastCloudUpdatedAt;
      setLastCloudSaveAt(meta.lastCloudSaveAt);
      if (meta.cloudDisabled) setCloudMode("local");

      const rawLocal = safeGet(accountKey(LEARNER_STORAGE_KEY));
      const localRead = readLocalLearnerState(rawLocal);
      if (localRead.kind === "future") {
        if (localRead.raw) {
          safeSet(accountKey(RECOVERY_BACKUP_KEY), localRead.raw);
          setRecoveryRaw(localRead.raw);
        }
        updateRequired.current = true;
        setRecoveryBlocked(true);
        setRecoveryCode("FUTURE_STATE_UNSUPPORTED");
        setLastErrorCode("FUTURE_STATE_UNSUPPORTED");
      } else if (localRead.kind === "corrupt") {
        if (localRead.raw) {
          safeSet(accountKey(RECOVERY_BACKUP_KEY), localRead.raw);
          setRecoveryRaw(localRead.raw);
        }
        setRecoveryBlocked(true);
        setRecoveryCode("LOCAL_STATE_CORRUPT");
        setLastErrorCode("LOCAL_STATE_CORRUPT");
      } else if (localRead.kind === "recovered") {
        if (localRead.raw) {
          safeSet(accountKey(RECOVERY_BACKUP_KEY), localRead.raw);
          setRecoveryRaw(localRead.raw);
        }
        setRecoveryCode("LOCAL_STATE_RECOVERED");
        setLastErrorCode("LOCAL_STATE_RECOVERED");
      }

      const localDecision = chooseRestoreState(localRead, null);
      const canHydrateLocally = Boolean(localRead.state) || cloudDisabled.current;
      if (canHydrateLocally) {
        setLearnerState(localDecision.state);
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
      let remoteResponseOk = false;
      const bootstrap = consumeStateBootstrap(portableProfileCode.current);

      if (!cloudDisabled.current) {
        try {
          if (bootstrap) {
            remotePayload = bootstrap as StateApiPayload;
            remoteResponseOk = true;
          } else {
            const response = await fetch("/api/state", { cache: "no-store", headers: profileHeaders() });
            remoteResponseOk = response.ok;
            try { remotePayload = await response.json() as StateApiPayload; } catch { remotePayload = {}; }
            if (!response.ok) {
              if (response.status === 401) {
                authUnavailable.current = true;
                setSyncStatus("local");
                setLastErrorCode("AUTH_REQUIRED");
              } else {
                setSyncStatus("error");
                setLastErrorCode(remotePayload.code ?? `HTTP_${response.status}`);
              }
            }
          }

          if (remoteResponseOk && (!remotePayload.runtime || !runtimeCompatible(remotePayload.runtime))) {
            requireUpdate();
          } else if (remoteResponseOk) {
            remoteAvailable = true;
            if (typeof remotePayload.cloudToken === "string") serverCloudToken.current = remotePayload.cloudToken;
            else if (remotePayload.cloudToken === null) serverCloudToken.current = null;
            if (remotePayload.cloudDeleted) {
              cloudDisabled.current = true;
              setCloudMode("local");
              setSyncStatus("local");
              writeSyncMeta(accountKey(SYNC_META_KEY), { ...EMPTY_SYNC_META, cloudDisabled: true });
            } else if (remotePayload.code === "CLOUD_STATE_UNREADABLE"
              || (remotePayload.state && !validateLearnerState(remotePayload.state))) {
              setRecoveryCode("CLOUD_STATE_UNREADABLE");
              setLastErrorCode("CLOUD_STATE_UNREADABLE");
              setSyncStatus("error");
            } else {
              remote = payloadState(remotePayload);
              serverRevision.current = remote?.revision ?? null;
            }
          }
        } catch {
          setSyncStatus("offline");
          setLastErrorCode("NETWORK_OFFLINE");
        }
      } else {
        setSyncStatus("local");
      }

      const durableLocalRead = readLocalLearnerState(safeGet(accountKey(LEARNER_STORAGE_KEY)));
      const durableRevision = durableLocalRead.state?.revision ?? -1;
      const currentLocalRead = Boolean(localRead.state) && latestState.current.revision > durableRevision
        ? { kind: "valid" as const, state: latestState.current, raw: JSON.stringify(latestState.current) }
        : durableLocalRead;
      const decision = chooseRestoreState(currentLocalRead, remote);
      if (decision.kind === "conflict") {
        rememberConflict(decision.state, decision.remoteState);
      } else if (JSON.stringify(latestState.current) !== JSON.stringify(decision.state)) {
        setLearnerState(decision.state);
      }

      if (remoteAvailable && decision.kind !== "conflict") {
        if (remote) serverRevision.current = remote.revision;
        if (decision.kind === "remote" || decision.kind === "equivalent" || decision.kind === "empty") {
          lastAckedSerialized.current = JSON.stringify(decision.state);
          setSyncStatus("synced");
          setLastErrorCode(null);
        } else if (decision.kind === "local") {
          setSyncStatus("local");
        }
        if (localRead.kind === "corrupt" && (decision.kind === "remote" || decision.kind === "equivalent")) {
          setRecoveryBlocked(false);
        }
      }

      if (localRead.kind === "future") setSyncStatus("error");
      restoreSettled.current = true;
      setReady(true);

      if (remoteAvailable && decision.kind === "local" && !cloudDisabled.current && !conflictRef.current) {
        setRetryNonce((value) => value + 1);
      }
    }

    void restore();
    return () => {
      mounted.current = false;
      restoreSettled.current = false;
    };
  }, [accountKey, profileHeaders, rememberConflict, requireUpdate, setLearnerState]);

  useEffect(() => {
    if (!ready || recoveryBlocked) return;
    latestState.current = state;
    const serialized = JSON.stringify(state);
    if (!safeSet(accountKey(LEARNER_STORAGE_KEY), serialized)) {
      setRecoveryCode("LOCAL_WRITE_FAILED");
      setLastErrorCode("LOCAL_WRITE_FAILED");
      setSyncStatus("error");
      return;
    }
    setLastLocalSaveAt(new Date().toISOString());

    if (saveTimer.current) clearTimeout(saveTimer.current);
    if (!restoreSettled.current
      || serialized === lastAckedSerialized.current
      || cloudDisabled.current
      || authUnavailable.current
      || updateRequired.current
      || conflictRef.current) return;

    setSyncStatus((current) => current === "synced" ? "local" : current);
    saveTimer.current = setTimeout(() => {
      void flushCloudState(latestState.current);
    }, CLOUD_SAVE_DEBOUNCE_MS);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [accountKey, flushCloudState, ready, recoveryBlocked, retryNonce, state]);

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
      lastAckedSerialized.current = null;
      queuedCloudState.current = null;
      setCloudMode("local");
      setSyncStatus("local");
      setLastErrorCode(null);
      writeSyncMeta(accountKey(SYNC_META_KEY), { ...EMPTY_SYNC_META, cloudDisabled: true });
      return true;
    } catch {
      setSyncStatus("offline");
      setLastErrorCode("NETWORK_DELETE_FAILED");
      return false;
    }
  }, [accountKey, profileHeaders, requireUpdate]);

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
    setLearnerState(current.remote);
    serverRevision.current = current.remote.revision;
    lastAckedSerialized.current = JSON.stringify(current.remote);
    conflictRef.current = null;
    setConflict(null);
    safeRemove(accountKey(CONFLICT_BACKUP_KEY));
    setRecoveryCode(null);
    setLastErrorCode(null);
    setSyncStatus("synced");
    return true;
  }, [accountKey, setLearnerState]);

  const resolveConflictWithLocal = useCallback(async () => {
    const current = conflictRef.current;
    if (!current) return false;
    try {
      const result = await postState(current.local, {
        baseRevision: current.remote?.revision ?? null,
        baseCloudToken: serverCloudToken.current,
      });
      if (!result.ok) return false;
      setLearnerState(current.local);
      conflictRef.current = null;
      setConflict(null);
      safeRemove(accountKey(CONFLICT_BACKUP_KEY));
      setRecoveryCode(null);
      setLastErrorCode(null);
      return true;
    } catch {
      setSyncStatus("offline");
      setLastErrorCode("NETWORK_SAVE_FAILED");
      return false;
    }
  }, [accountKey, postState, setLearnerState]);

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
    if (!safeSet(accountKey(IMPORT_BACKUP_KEY), JSON.stringify(state))) {
      setLastErrorCode("IMPORT_BACKUP_FAILED");
      return false;
    }
    updateRequired.current = false;
    setRecoveryBlocked(false);
    setRecoveryCode(null);
    setLearnerState(candidate);
    return true;
  }, [accountKey, setLearnerState, state]);

  const resetLocal = useCallback(async () => {
    if (cloudDisabled.current || authUnavailable.current) {
      safeRemove(accountKey(LEARNER_STORAGE_KEY));
      safeRemove(accountKey(RECOVERY_BACKUP_KEY));
      updateRequired.current = false;
      setRecoveryRaw(null);
      setRecoveryBlocked(false);
      setRecoveryCode(null);
      lastAckedSerialized.current = null;
      queuedCloudState.current = null;
      setLearnerState(emptyLearnerState());
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
      safeRemove(accountKey(LEARNER_STORAGE_KEY));
      safeRemove(accountKey(RECOVERY_BACKUP_KEY));
      updateRequired.current = false;
      setRecoveryRaw(null);
      setRecoveryBlocked(false);
      setRecoveryCode(null);
      if (payload.cloudDeleted) {
        cloudDisabled.current = true;
        writeSyncMeta(accountKey(SYNC_META_KEY), { ...EMPTY_SYNC_META, cloudDisabled: true });
        setCloudMode("local");
        lastAckedSerialized.current = null;
        queuedCloudState.current = null;
        setLearnerState(emptyLearnerState());
        setSyncStatus("local");
        return true;
      }
      serverRevision.current = remote?.revision ?? null;
      serverCloudToken.current = typeof payload.cloudToken === "string" ? payload.cloudToken : null;
      const restored = remote ?? emptyLearnerState();
      lastAckedSerialized.current = JSON.stringify(restored);
      queuedCloudState.current = null;
      setLearnerState(restored);
      setSyncStatus("synced");
      return true;
    } catch {
      setSyncStatus("offline");
      setLastErrorCode("NETWORK_RESET_FAILED");
      return false;
    }
  }, [accountKey, profileHeaders, requireUpdate, setLearnerState]);

  const activatePortableProfile = useCallback((rawCode: string) => {
    const code = rawCode.trim().toUpperCase();
    if (!PORTABLE_PROFILE_PATTERN.test(code)) return false;
    // Switching identity never copies the current learner snapshot into the
    // target namespace. An existing target restores its own local/cloud state;
    // a fresh target starts fresh. Cross-profile transfer stays explicit via import.
    if (!safeSet(PROFILE_STORAGE_MIGRATION_KEY, "1")) return false;
    if (!safeSet(PORTABLE_PROFILE_KEY, code)) return false;
    portableProfileCode.current = code;
    setPortableProfileActive(true);
    window.location.reload();
    return true;
  }, []);

  const disconnectPortableProfile = useCallback(() => {
    const serialized = JSON.stringify(latestState.current);
    if (!safeSet(LEARNER_STORAGE_KEY, serialized)
      || !safeSet(SYNC_META_KEY, JSON.stringify({ ...EMPTY_SYNC_META, cloudDisabled: true }))
      || !safeSet(PROFILE_STORAGE_MIGRATION_KEY, "1")) {
      setRecoveryCode("LOCAL_WRITE_FAILED");
      setLastErrorCode("LOCAL_WRITE_FAILED");
      setSyncStatus("error");
      return false;
    }
    safeRemove(PORTABLE_PROFILE_KEY);
    portableProfileCode.current = null;
    setPortableProfileActive(false);
    window.location.reload();
    return true;
  }, []);

  return {
    state,
    setState: setLearnerState,
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
