export type SessionSyncStatus =
  | "loading"
  | "local"
  | "syncing"
  | "synced"
  | "offline"
  | "conflict"
  | "error";

export type LessonSkillState =
  | "UNEXPOSED"
  | "INTRODUCED"
  | "FRAGILE"
  | "WORKING"
  | "RETAINED"
  | "FIELD_TEST_PENDING"
  | "FIELD_VALIDATED"
  | "REPAIR_REQUIRED";

export type SessionSaveState =
  | "saving"
  | "saved"
  | "saved_local"
  | "saved_syncing"
  | "offline_saved_local"
  | "sync_needed"
  | "attention"
  | "failed";

export function deriveLessonSkillTruth(contentCompleted: boolean, state: LessonSkillState) {
  return {
    contentCompleted,
    skillState: state,
    explainRepair: contentCompleted && state === "REPAIR_REQUIRED",
  } as const;
}

export function deriveLessonStep(zeroBasedStep: number) {
  return { step: zeroBasedStep + 1, total: 10 } as const;
}

export function localSaveAcknowledged(stateUpdatedAt: string, lastLocalSaveAt: string | null): boolean {
  if (!lastLocalSaveAt) return false;
  const stateTime = Date.parse(stateUpdatedAt);
  const saveTime = Date.parse(lastLocalSaveAt);
  return Number.isFinite(stateTime) && Number.isFinite(saveTime) && saveTime >= stateTime;
}

export function deriveSessionSaveState(
  status: SessionSyncStatus,
  recoveryCode: string | null,
  stateUpdatedAt: string,
  lastLocalSaveAt: string | null,
): SessionSaveState {
  if (recoveryCode === "LOCAL_WRITE_FAILED") return "failed";
  if (!localSaveAcknowledged(stateUpdatedAt, lastLocalSaveAt)) return "saving";
  if (status === "offline") return "offline_saved_local";
  if (status === "local" || status === "loading") return "saved_local";
  if (status === "syncing") return "saved_syncing";
  if (status === "synced") return "saved";
  if (status === "conflict") return "sync_needed";
  if (status === "error") return recoveryCode ? "attention" : "sync_needed";
  return "saved_local";
}

export function deriveDiagnosticContinuation(status: string, savedResponses: number) {
  if (status !== "IN_PROGRESS" || savedResponses >= 10) return null;
  return { savedResponses, nextQuestion: savedResponses + 1 } as const;
}
