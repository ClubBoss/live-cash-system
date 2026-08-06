export * from "./model-core";

import * as core from "./model-core";
import type {
  DiagnosticRawResponse,
  DrillEvidenceInput,
  LearnerState,
  LocaleCode,
  ReviewItem,
  TransferProbe,
} from "./model-core";

const EXPLICIT_TRANSFER_PROBES: Readonly<Record<string, TransferProbe>> = {
  "geo-04": {
    isTransferProbe: true,
    variantDistance: "MEDIUM",
    changedVariables: ["starting_depth", "preflop_pot_size", "post_action_spr"],
  },
  "geo-05": {
    isTransferProbe: true,
    variantDistance: "MEDIUM",
    changedVariables: ["starting_depth", "preflop_pot_size", "post_action_spr"],
  },
};

function isImplicitRuntimeFallback(input: DrillEvidenceInput): boolean {
  const changed = input.transferProbe?.changedVariables ?? [];
  return (changed.length === 1 && changed[0] === input.variantGroup)
    || (changed.length === 2 && changed[0] === "boundary_condition" && changed[1] === input.variantGroup);
}

function admittedTransferProbe(input: DrillEvidenceInput): TransferProbe | null {
  const registered = EXPLICIT_TRANSFER_PROBES[input.drillId];
  if (registered) return registered;
  if (!input.transferProbe || isImplicitRuntimeFallback(input)) return null;
  return input.transferProbe;
}

function activeReviewItem(state: LearnerState): ReviewItem | undefined {
  if (state.activeSession?.mode !== "review") return undefined;
  return core.dueReviewItems(state).find((item) => item.kind === "retention");
}

function activeFieldRepairItem(state: LearnerState, moduleId: DrillEvidenceInput["moduleId"]): ReviewItem | undefined {
  if (state.activeSession?.mode !== "repair") return undefined;
  const firstDueRepair = core.dueReviewItems(state).find((item) => item.kind === "repair" && item.moduleId === moduleId);
  return firstDueRepair?.sourceDrillId.startsWith("field:") ? firstDueRepair : undefined;
}

export function recordDecision(state: LearnerState, input: DrillEvidenceInput): LearnerState {
  const normalized: DrillEvidenceInput = {
    ...input,
    transferProbe: admittedTransferProbe(input),
  };

  if (input.mode === "review") {
    const reviewItem = activeReviewItem(state);
    if (reviewItem) normalized.variantGroup = reviewItem.variantGroup;
  }

  if (input.mode === "repair") {
    const fieldRepair = activeFieldRepairItem(state, input.moduleId);
    if (fieldRepair) normalized.variantGroup = fieldRepair.variantGroup;
  }

  return core.recordDecision(state, normalized);
}

export function recordDiagnosticResponse(
  state: LearnerState,
  response: DiagnosticRawResponse,
  expectedItemIds: string[],
): LearnerState {
  if (state.diagnostic.responses.length || !state.diagnostic.startedAt) {
    return core.recordDiagnosticResponse(state, response, expectedItemIds);
  }

  const startedAt = Date.parse(state.diagnostic.startedAt);
  const elapsed = Number.isFinite(startedAt)
    ? Math.max(1, Math.round((Date.now() - startedAt) / 1000))
    : response.time_seconds;

  return core.recordDiagnosticResponse(state, { ...response, time_seconds: elapsed }, expectedItemIds);
}

export function startDiagnosticRun(state: LearnerState, locale: LocaleCode): LearnerState {
  return core.startDiagnosticRun(state, locale);
}
