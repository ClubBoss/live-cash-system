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

const DAY_MS = 86_400_000;
const RETENTION_CHAIN_DAYS = [1, 3, 7] as const;

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

function nextRetentionDelayMs(completedSuccessfulStages: number): number | null {
  if (completedSuccessfulStages <= 0) return RETENTION_CHAIN_DAYS[0] * DAY_MS;
  if (completedSuccessfulStages === 1) return RETENTION_CHAIN_DAYS[1] * DAY_MS;
  if (completedSuccessfulStages === 2) return RETENTION_CHAIN_DAYS[2] * DAY_MS;
  return null;
}

export function cardIsDue(card: core.CardState | undefined, now = Date.now()): boolean {
  if (!card) return true;
  const dueAt = Date.parse(card.dueAt);
  return Number.isFinite(dueAt) && dueAt <= now;
}

export function gradeCard(state: LearnerState, cardId: string, grade: 0 | 1 | 2 | 3): LearnerState {
  const current = state.cards[cardId];
  // Rating a card is a scheduling mutation, not a generic browse action. Once a
  // card has a future dueAt, an early UI path must not move that deadline.
  if (current && !cardIsDue(current)) return state;
  return core.gradeCard(state, cardId, grade);
}

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

function explicitReviewId(state: LearnerState, mode: "review" | "repair", sourceReviewId?: string): string | undefined {
  if (sourceReviewId !== undefined) return sourceReviewId;
  return state.activeSession?.mode === mode ? state.activeSession.sourceReviewId : undefined;
}

function activeReviewItem(state: LearnerState, sourceReviewId?: string): ReviewItem | undefined {
  if (state.activeSession?.mode !== "review" && sourceReviewId === undefined) return undefined;
  const due = core.dueReviewItems(state).filter((item) => item.kind === "retention");
  const exactId = explicitReviewId(state, "review", sourceReviewId);
  if (exactId !== undefined) return due.find((item) => item.id === exactId);
  return due[0];
}

function activeRepairItem(state: LearnerState, moduleId: DrillEvidenceInput["moduleId"], sourceReviewId?: string): ReviewItem | undefined {
  if (state.activeSession?.mode !== "repair" && sourceReviewId === undefined) return undefined;
  const due = core.dueReviewItems(state).filter((item) => item.kind === "repair" && item.moduleId === moduleId);
  const exactId = explicitReviewId(state, "repair", sourceReviewId);
  if (exactId !== undefined) return due.find((item) => item.id === exactId);
  return due[0];
}

function completedRetentionStages(state: LearnerState, item: ReviewItem): number {
  const source = state.interactions.find((interaction) => interaction.id === item.sourceInteractionId);
  // Before Gauntlet 2, attempts counted failed review tries. Baseline retention
  // items never pointed at a review interaction because success removed them.
  // A successful review source therefore acts as an additive stage marker while
  // legacy items, regardless of attempts, safely restart at stage zero.
  if (!source || source.mode !== "review" || !source.actionOk || !source.reasonOk) return 0;
  return Math.max(0, item.attempts);
}

function activeFieldRepairItem(state: LearnerState, moduleId: DrillEvidenceInput["moduleId"], sourceReviewId?: string): ReviewItem | undefined {
  const repair = activeRepairItem(state, moduleId, sourceReviewId);
  return repair?.sourceDrillId.startsWith("field:") ? repair : undefined;
}

function independentTransferEligible(input: DrillEvidenceInput, reviewItem: ReviewItem | undefined): boolean {
  if (input.mode === "mixed") return true;
  return input.mode === "review" && reviewItem !== undefined && input.drillId !== reviewItem.sourceDrillId;
}

function snapshotRetentionEvidence(state: LearnerState, input: DrillEvidenceInput) {
  const evidence = state.modules[input.moduleId].evidence.retention;
  return {
    ...evidence,
    distinctNodes: [...evidence.distinctNodes],
  };
}

export function recordDecision(state: LearnerState, input: DrillEvidenceInput): LearnerState {
  const sourceReviewId = input.mode === "review" || input.mode === "repair"
    ? explicitReviewId(state, input.mode, input.sourceReviewId)
    : input.sourceReviewId;
  const reviewItem = input.mode === "review" ? activeReviewItem(state, sourceReviewId) : undefined;
  const repairItem = input.mode === "repair" ? activeRepairItem(state, input.moduleId, sourceReviewId) : undefined;

  // An explicit queue identity is authoritative. If it is stale, belongs to a
  // different module, or is no longer due, the submission is a complete no-op.
  if (input.mode === "review" && sourceReviewId !== undefined && (!reviewItem || reviewItem.moduleId !== input.moduleId)) return state;
  if (input.mode === "repair" && sourceReviewId !== undefined && !repairItem) return state;

  const exactReviewRepeat = reviewItem !== undefined && input.drillId === reviewItem.sourceDrillId;
  const priorRetentionEvidence = exactReviewRepeat ? snapshotRetentionEvidence(state, input) : null;
  const normalized: DrillEvidenceInput = {
    ...input,
    sourceReviewId,
    transferProbe: independentTransferEligible(input, reviewItem) ? admittedTransferProbe(input) : null,
  };
  const priorSuccessfulStages = reviewItem ? completedRetentionStages(state, reviewItem) : 0;

  if (reviewItem) normalized.variantGroup = reviewItem.variantGroup;

  if (input.mode === "repair") {
    const fieldRepair = activeFieldRepairItem(state, input.moduleId, sourceReviewId);
    if (fieldRepair) normalized.variantGroup = fieldRepair.variantGroup;
  }

  const next = core.recordDecision(state, normalized);
  if (priorRetentionEvidence) {
    next.modules[input.moduleId].evidence.retention = priorRetentionEvidence;
    next.modules[input.moduleId].state = core.deriveModuleState(next.modules[input.moduleId]);
  }
  if (!reviewItem) return next;

  const latest = next.interactions.at(-1);
  if (!latest || latest.mode !== "review") return next;

  if (latest.actionOk && latest.reasonOk) {
    // Exact-repeat recall may remain useful maintenance practice, but it is not
    // strong delayed-retention evidence and does not advance the 1d/3d/7d chain.
    // Keep the current stage alive so a later non-identical review can still
    // provide the missing independent evidence instead of silently dead-ending.
    if (exactReviewRepeat) {
      const retryDelayMs = nextRetentionDelayMs(priorSuccessfulStages);
      if (retryDelayMs !== null) {
        next.reviewQueue = next.reviewQueue.filter((item) => item.id !== reviewItem.id);
        next.reviewQueue.push({
          ...reviewItem,
          sourceInteractionId: latest.id,
          sourceDrillId: input.drillId,
          sourceActionOptionId: input.selectedActionOptionId,
          sourceReasonOptionId: input.selectedReasonOptionId,
          dueAt: new Date(Date.now() + retryDelayMs).toISOString(),
          attempts: priorSuccessfulStages,
        });
      }
      return next;
    }

    const completedSuccessfulStages = priorSuccessfulStages + 1;
    const nextDelayMs = nextRetentionDelayMs(completedSuccessfulStages);
    if (nextDelayMs !== null) {
      next.reviewQueue = next.reviewQueue.filter((item) => item.id !== reviewItem.id);
      next.reviewQueue.push({
        ...reviewItem,
        sourceInteractionId: latest.id,
        sourceDrillId: input.drillId,
        sourceActionOptionId: input.selectedActionOptionId,
        sourceReasonOptionId: input.selectedReasonOptionId,
        dueAt: new Date(Date.now() + nextDelayMs).toISOString(),
        attempts: completedSuccessfulStages,
      });
    }
    return next;
  }

  // A failed delayed retrieval becomes an explicit repair instead of leaving a
  // neutral review loop. A successful repair will create a fresh 1-day chain.
  const queued = next.reviewQueue.find((item) => item.id === reviewItem.id);
  if (queued) {
    queued.kind = "repair";
    queued.dueAt = new Date().toISOString();
    queued.sourceInteractionId = latest.id;
    queued.sourceDrillId = input.drillId;
    queued.sourceActionOptionId = input.selectedActionOptionId;
    queued.sourceReasonOptionId = input.selectedReasonOptionId;
  }
  return next;
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
