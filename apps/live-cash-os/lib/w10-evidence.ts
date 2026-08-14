import { drillById } from "../content/modules";
import { assessDiagnosticResponses } from "./diagnostic-feedback";
import { getRuntimeRepairRule } from "./runtime-repair-registry";
import type { InteractionRecord, LearnerState, ModuleId } from "./model-core";

export const W10_OBSERVATION_SCHEMA = "LIVE_CASH_W10_OBSERVATIONS_V1";
export const W10_REPORT_SCHEMA = "LIVE_CASH_W10_EVIDENCE_REPORT_V1";

export type W10SessionPhase = "baseline" | "learning" | "post_instruction" | "delayed" | "field";
export type W10FrictionCategory =
  | "content_error"
  | "language_problem"
  | "ambiguous_question"
  | "weak_distractor"
  | "routing"
  | "scheduling"
  | "visual_friction"
  | "mobile_friction"
  | "field_workflow_friction"
  | "navigation_confusion"
  | "queue_overload"
  | "no_action";
export type W10Severity = "P0" | "P1" | "P2" | "P3";

export type W10SessionObservation = {
  id: string;
  startedAt: string;
  endedAt?: string | null;
  completed: boolean;
  phase: W10SessionPhase;
  intendedAction?: string | null;
  startedIntendedActionWithoutNavigationConfusion?: boolean | null;
  navigationConfusion?: boolean | null;
  unnecessaryClicks?: number | null;
  queueOverload?: boolean | null;
  desireToReturn?: number | null;
  beforePlayUsefulness?: number | null;
  preSessionWarmup?: boolean | null;
  returnedAfterMultiDayBreak?: boolean | null;
  comprehension?: {
    mechanismExplainable?: boolean | null;
    promptUnderstoodFirstRead?: boolean | null;
    assumptionsNoticed?: boolean | null;
  };
};

export type W10FrictionObservation = {
  id: string;
  at: string;
  category: W10FrictionCategory;
  severity: W10Severity;
  repeatKey: string;
  resolved: boolean;
  note?: string;
};

export type W10ObservationLedger = {
  schema: typeof W10_OBSERVATION_SCHEMA;
  sessions: W10SessionObservation[];
  friction: W10FrictionObservation[];
};

type MetricStatus = "MEASURED" | "NOT_ENOUGH_EVIDENCE" | "NOT_MEASURABLE_FROM_EXPORT";
type NumericMetric = {
  status: MetricStatus;
  n: number;
  value: number | null;
  unit: "percent" | "seconds" | "count" | "score_1_5" | "days";
  threshold?: string;
  pass?: boolean | null;
  source: string;
  note?: string;
};

type CoverageGate = {
  value: number | boolean;
  requirement: string;
  pass: boolean;
  source: string;
  note?: string;
};

function finiteDate(value: string | null | undefined): number | null {
  if (!value) return null;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function calendarDay(value: string): string | null {
  const parsed = finiteDate(value);
  return parsed === null ? null : new Date(parsed).toISOString().slice(0, 10);
}

function percent(successes: number, total: number): number | null {
  return total > 0 ? Math.round((successes / total) * 1000) / 10 : null;
}

function average(values: number[], digits = 1): number | null {
  if (!values.length) return null;
  const factor = 10 ** digits;
  return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * factor) / factor;
}

function percentMetric(successes: number, total: number, source: string, threshold?: { label: string; minimum: number }): NumericMetric {
  const value = percent(successes, total);
  return {
    status: total ? "MEASURED" : "NOT_ENOUGH_EVIDENCE",
    n: total,
    value,
    unit: "percent",
    threshold: threshold?.label,
    pass: threshold && value !== null ? value >= threshold.minimum : undefined,
    source,
  };
}

function meanMetric(values: number[], unit: NumericMetric["unit"], source: string): NumericMetric {
  return {
    status: values.length ? "MEASURED" : "NOT_ENOUGH_EVIDENCE",
    n: values.length,
    value: average(values),
    unit,
    source,
  };
}

function notMeasurable(note: string): NumericMetric {
  return {
    status: "NOT_MEASURABLE_FROM_EXPORT",
    n: 0,
    value: null,
    unit: "count",
    source: "state schema v2 export",
    note,
  };
}

function bothCorrect(interaction: InteractionRecord): boolean {
  return interaction.actionOk && interaction.reasonOk;
}

function interactionSession(interaction: InteractionRecord, sessions: W10SessionObservation[]): W10SessionObservation | null {
  const at = finiteDate(interaction.at);
  if (at === null) return null;
  return sessions.find((session) => {
    const start = finiteDate(session.startedAt);
    const end = finiteDate(session.endedAt);
    return start !== null && at >= start && (end === null || at <= end);
  }) ?? null;
}

function runtimeErrorKeys(interaction: InteractionRecord): string[] {
  const keys = new Set<string>();
  if (!interaction.actionOk && interaction.selectedActionOptionId) {
    const rule = getRuntimeRepairRule(interaction.drillId, interaction.selectedActionOptionId);
    if (rule) keys.add(rule.errorKey);
  }
  if (!interaction.reasonOk && interaction.selectedReasonOptionId) {
    const rule = getRuntimeRepairRule(interaction.drillId, interaction.selectedReasonOptionId);
    if (rule) keys.add(rule.errorKey);
  }
  return [...keys];
}

function runtimeErrorCounts(interactions: InteractionRecord[]): Array<{ errorKey: string; count: number }> {
  const counts = new Map<string, number>();
  for (const interaction of interactions) {
    for (const key of runtimeErrorKeys(interaction)) counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([errorKey, count]) => ({ errorKey, count }))
    .sort((left, right) => right.count - left.count || left.errorKey.localeCompare(right.errorKey));
}

function inclusiveStudySpanDays(sessions: W10SessionObservation[]): number {
  const starts = sessions.map((session) => finiteDate(session.startedAt)).filter((value): value is number => value !== null);
  if (!starts.length) return 0;
  return Math.floor((Math.max(...starts) - Math.min(...starts)) / 86_400_000) + 1;
}

function hasMultiDayReturn(sessions: W10SessionObservation[]): boolean {
  if (sessions.some((session) => session.returnedAfterMultiDayBreak === true)) return true;
  const starts = sessions
    .map((session) => finiteDate(session.startedAt))
    .filter((value): value is number => value !== null)
    .sort((left, right) => left - right);
  return starts.some((value, index) => index > 0 && value - starts[index - 1] >= 3 * 86_400_000);
}

function reviewedFieldHandsInPriorityModule(state: LearnerState): { moduleId: ModuleId | null; count: number } {
  const priorities = new Set(state.diagnostic.priorityModules);
  const counts = new Map<ModuleId, number>();
  for (const note of state.fieldNotes) {
    if (!priorities.has(note.moduleId) || note.status === "PENDING_REVIEW") continue;
    counts.set(note.moduleId, (counts.get(note.moduleId) ?? 0) + 1);
  }
  const best = [...counts.entries()].sort((left, right) => right[1] - left[1])[0];
  return best ? { moduleId: best[0], count: best[1] } : { moduleId: null, count: 0 };
}

function unresolvedFrictionSummary(friction: W10FrictionObservation[]) {
  const unresolved = friction.filter((item) => !item.resolved);
  const p0 = unresolved.filter((item) => item.severity === "P0");
  const p1Counts = new Map<string, number>();
  for (const item of unresolved.filter((candidate) => candidate.severity === "P1")) {
    p1Counts.set(item.repeatKey, (p1Counts.get(item.repeatKey) ?? 0) + 1);
  }
  const recurringP1 = [...p1Counts.entries()]
    .filter(([, count]) => count >= 2)
    .map(([repeatKey, count]) => ({ repeatKey, count }));
  return {
    unresolvedCount: unresolved.length,
    unresolvedP0Count: p0.length,
    recurringP1,
    byCategory: Object.fromEntries([...new Set(unresolved.map((item) => item.category))].sort().map((category) => [category, unresolved.filter((item) => item.category === category).length])),
  };
}

function diagnosticColdMetric(state: LearnerState): NumericMetric {
  const assessment = assessDiagnosticResponses(state.diagnostic.responses);
  const cold = state.diagnostic.measurementContext === "COLD_BASELINE";
  if (!cold || !assessment.structured) {
    return {
      status: "NOT_ENOUGH_EVIDENCE",
      n: assessment.items.length,
      value: null,
      unit: "percent",
      source: "structured Diagnostic export",
      note: cold ? "Diagnostic responses are not a complete structured T1 battery." : "Current Diagnostic is not marked COLD_BASELINE.",
    };
  }
  return percentMetric(assessment.items.filter((item) => item.actionOk && item.reasonOk).length, assessment.items.length, "structured cold Diagnostic");
}

function postInstructionMetric(state: LearnerState, sessions: W10SessionObservation[], kind: "changed" | "boundary"): NumericMetric {
  const priorityModules = new Set(state.diagnostic.priorityModules);
  const candidates = state.interactions.filter((interaction) => {
    if (priorityModules.size && !priorityModules.has(interaction.moduleId)) return false;
    const drill = drillById[interaction.drillId];
    if (!drill || drill.kind !== kind) return false;
    return interactionSession(interaction, sessions)?.phase === "post_instruction";
  });
  return percentMetric(
    candidates.filter(bothCorrect).length,
    candidates.length,
    `interaction export joined to observation sessions with phase=post_instruction; drill kind=${kind}`,
    kind === "changed" ? { label: ">=70% on changed-node decisions in priority modules after instruction", minimum: 70 } : undefined,
  );
}

export function validateW10ObservationLedger(value: unknown): W10ObservationLedger {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("W10 observation ledger must be an object");
  const candidate = value as Partial<W10ObservationLedger>;
  if (candidate.schema !== W10_OBSERVATION_SCHEMA) throw new Error(`Expected observation schema ${W10_OBSERVATION_SCHEMA}`);
  if (!Array.isArray(candidate.sessions) || !Array.isArray(candidate.friction)) throw new Error("Observation ledger requires sessions[] and friction[]");
  for (const session of candidate.sessions) {
    if (!session || typeof session !== "object" || !session.id || finiteDate(session.startedAt) === null || typeof session.completed !== "boolean") {
      throw new Error("Every W10 session requires id, valid startedAt and completed");
    }
    if (!["baseline", "learning", "post_instruction", "delayed", "field"].includes(session.phase)) throw new Error(`Invalid W10 session phase for ${session.id}`);
    if (session.endedAt && finiteDate(session.endedAt) === null) throw new Error(`Invalid endedAt for ${session.id}`);
  }
  for (const item of candidate.friction) {
    if (!item || typeof item !== "object" || !item.id || finiteDate(item.at) === null || !item.repeatKey || typeof item.resolved !== "boolean") {
      throw new Error("Every friction item requires id, at, repeatKey and resolved");
    }
    if (!["P0", "P1", "P2", "P3"].includes(item.severity)) throw new Error(`Invalid friction severity for ${item.id}`);
  }
  return candidate as W10ObservationLedger;
}

export function buildW10EvidenceReport(state: LearnerState, ledger: W10ObservationLedger) {
  const sessions = ledger.sessions;
  const completedSessions = sessions.filter((session) => session.completed && finiteDate(session.endedAt) !== null);
  const delayedReviewDays = new Set(state.interactions.filter((item) => item.mode === "review").map((item) => calendarDay(item.at)).filter(Boolean)).size;
  const errorCounts = runtimeErrorCounts(state.interactions);
  const repeatedError = errorCounts.find((item) => item.count >= 2) ?? null;
  const reviewedPriority = reviewedFieldHandsInPriorityModule(state);
  const studySpanDays = inclusiveStudySpanDays(sessions);
  const friction = unresolvedFrictionSummary(ledger.friction);

  const reviewInteractions = state.interactions.filter((item) => item.mode === "review");
  const mixedInteractions = state.interactions.filter((item) => item.mode === "mixed");
  const transferInteractions = state.interactions.filter((item) => item.transferProbe !== null);
  const repairInteractions = state.interactions.filter((item) => item.mode === "repair");
  const allDecisions = state.interactions;

  const navigationKnown = sessions.filter((session) => session.startedIntendedActionWithoutNavigationConfusion !== null && session.startedIntendedActionWithoutNavigationConfusion !== undefined);
  const navigationGood = navigationKnown.filter((session) => session.startedIntendedActionWithoutNavigationConfusion === true);
  const durationSeconds = completedSessions
    .map((session) => {
      const start = finiteDate(session.startedAt);
      const end = finiteDate(session.endedAt);
      return start !== null && end !== null && end >= start ? (end - start) / 1000 : null;
    })
    .filter((value): value is number => value !== null);
  const comprehension = {
    mechanismExplainable: sessions.filter((session) => session.comprehension?.mechanismExplainable !== null && session.comprehension?.mechanismExplainable !== undefined),
    promptUnderstoodFirstRead: sessions.filter((session) => session.comprehension?.promptUnderstoodFirstRead !== null && session.comprehension?.promptUnderstoodFirstRead !== undefined),
    assumptionsNoticed: sessions.filter((session) => session.comprehension?.assumptionsNoticed !== null && session.comprehension?.assumptionsNoticed !== undefined),
  };

  const confidenceErrors = allDecisions.map((item) => Math.abs(item.confidence - (bothCorrect(item) ? 100 : 0)));
  const highConfidenceMisses = allDecisions.filter((item) => !bothCorrect(item) && item.confidence >= 75);
  const fieldReviewed = state.fieldNotes.filter((note) => note.status !== "PENDING_REVIEW");
  const fieldSupporting = fieldReviewed.filter((note) => note.status === "REVIEWED_VALID" && note.cueBeforeAction);

  const coverage = {
    studySpanDays: { value: studySpanDays, requirement: ">=14 calendar-day span", pass: studySpanDays >= 14, source: "observation sessions" } satisfies CoverageGate,
    completedLearningSessions: { value: completedSessions.length, requirement: ">=10 completed sessions", pass: completedSessions.length >= 10, source: "observation sessions" } satisfies CoverageGate,
    delayedReviewDays: { value: delayedReviewDays, requirement: ">=3 delayed-review days", pass: delayedReviewDays >= 3, source: "review interaction timestamps" } satisfies CoverageGate,
    recordedRealHands: { value: state.fieldNotes.length, requirement: ">=5 recorded real hands", pass: state.fieldNotes.length >= 5, source: "fieldNotes" } satisfies CoverageGate,
    reviewedFieldHandsInPriorityModule: {
      value: reviewedPriority.count,
      requirement: ">=2 reviewed field hands in one Diagnostic priority module",
      pass: reviewedPriority.count >= 2,
      source: "fieldNotes + diagnostic.priorityModules",
      note: reviewedPriority.moduleId ? `best priority module=${reviewedPriority.moduleId}` : "No reviewed field hands are linked to a current Diagnostic priority module.",
    } satisfies CoverageGate,
    repeatedRuntimeErrorPath: {
      value: repeatedError !== null,
      requirement: ">=1 repeated runtime error path",
      pass: repeatedError !== null,
      source: "wrong selected option identities mapped through runtime repair registry",
      note: repeatedError ? `${repeatedError.errorKey} x${repeatedError.count}` : "No repeated registered runtime error path yet. This is not a canonical misconception ID.",
    } satisfies CoverageGate,
    preSessionWarmup: { value: sessions.some((session) => session.preSessionWarmup === true), requirement: ">=1 pre-session warm-up", pass: sessions.some((session) => session.preSessionWarmup === true), source: "observation sessions" } satisfies CoverageGate,
    returnAfterMultiDayBreak: { value: hasMultiDayReturn(sessions), requirement: ">=1 return after a multi-day break", pass: hasMultiDayReturn(sessions), source: "explicit observation or >=3-day start-to-start gap" } satisfies CoverageGate,
  };

  const delayedAccuracy = percentMetric(reviewInteractions.filter(bothCorrect).length, reviewInteractions.length, "mode=review interactions", { label: ">=80% delayed-review accuracy on previously working items", minimum: 80 });
  if (delayedReviewDays < 3 && delayedAccuracy.status === "MEASURED") {
    delayedAccuracy.pass = null;
    delayedAccuracy.note = "Accuracy is visible, but the W10 threshold is not admissible until >=3 distinct delayed-review days exist.";
  }
  const changedAfterInstruction = postInstructionMetric(state, sessions, "changed");
  const navigationMetric = percentMetric(navigationGood.length, navigationKnown.length, "explicit session observation", { label: ">=80% sessions start intended action without navigation confusion", minimum: 80 });
  if (completedSessions.length < 10 && navigationMetric.status === "MEASURED") {
    navigationMetric.pass = null;
    navigationMetric.note = "Navigation rate is visible, but the study minimum of 10 completed sessions is not yet met.";
  }

  const hardCoveragePass = Object.values(coverage).every((gate) => gate.pass);
  const thresholdPass = delayedAccuracy.pass === true && changedAfterInstruction.pass === true && navigationMetric.pass === true;
  const noBlockingFriction = friction.unresolvedP0Count === 0 && friction.recurringP1.length === 0;
  const readyForHumanReview = hardCoveragePass && thresholdPass && noBlockingFriction && fieldSupporting.length >= 2;

  return {
    schema: W10_REPORT_SCHEMA,
    generatedAt: new Date().toISOString(),
    acceptanceBoundary: {
      status: readyForHumanReview ? "READY_FOR_HUMAN_W10_REVIEW" : "COLLECTING_EVIDENCE",
      w10Complete: false,
      statement: "This compiler summarizes machine-readable evidence. It cannot create W10 completion, human strategy approval, language approval, or FIELD_VALIDATED truth by itself.",
      humanJudgmentStillRequired: [
        "comprehension quality beyond binary observation",
        "calibration acceptability/change over time",
        "repeated misconception frequency reduction",
        "field-hand mechanism support and review quality",
        "final recurring-friction adjudication",
      ],
    },
    studyCoverage: coverage,
    comprehension: {
      mechanismExplainable: percentMetric(comprehension.mechanismExplainable.filter((session) => session.comprehension?.mechanismExplainable === true).length, comprehension.mechanismExplainable.length, "explicit human observation"),
      promptUnderstoodFirstRead: percentMetric(comprehension.promptUnderstoodFirstRead.filter((session) => session.comprehension?.promptUnderstoodFirstRead === true).length, comprehension.promptUnderstoodFirstRead.length, "explicit human observation"),
      assumptionsNoticed: percentMetric(comprehension.assumptionsNoticed.filter((session) => session.comprehension?.assumptionsNoticed === true).length, comprehension.assumptionsNoticed.length, "explicit human observation"),
    },
    decisionQuality: {
      coldAccuracy: diagnosticColdMetric(state),
      changedNodeAccuracyAllObserved: percentMetric(transferInteractions.filter(bothCorrect).length, transferInteractions.length, "all interactions with admitted transferProbe"),
      changedNodeAccuracyPriorityPostInstruction: changedAfterInstruction,
      boundaryAccuracyPriorityPostInstruction: postInstructionMetric(state, sessions, "boundary"),
      mixedAccuracy: percentMetric(mixedInteractions.filter(bothCorrect).length, mixedInteractions.length, "mode=mixed interactions"),
    },
    retention: {
      delayedAccuracy,
      delayedReviewDays,
      averageResponseSeconds: meanMetric(reviewInteractions.map((item) => item.elapsedSeconds), "seconds", "mode=review interactions"),
      averageConfidence: meanMetric(reviewInteractions.map((item) => item.confidence), "percent", "mode=review interactions"),
      repeatFailures: reviewInteractions.filter((item) => !bothCorrect(item)).length,
    },
    calibration: {
      meanAbsoluteConfidenceError: meanMetric(confidenceErrors, "percent", "all interaction confidence vs binary correctness"),
      highConfidenceMisses: highConfidenceMisses.length,
      highConfidenceMissRate: percentMetric(highConfidenceMisses.length, allDecisions.length, "confidence>=75 on incorrect interaction"),
      trendDecision: "HUMAN_JUDGMENT_REQUIRED",
    },
    repair: {
      repairAccuracy: percentMetric(repairInteractions.filter(bothCorrect).length, repairInteractions.length, "mode=repair interactions"),
      runtimeErrorPaths: errorCounts,
      repeatedRuntimeErrorPaths: errorCounts.filter((item) => item.count >= 2),
      newNodeSuccessAfterRepair: notMeasurable("Schema v2 interactions do not retain a durable repair->later-new-node linkage after queues are consumed."),
      delayedSuccessAfterRepair: notMeasurable("Completed retention queue lineage is not durably retained after the queue item is consumed."),
    },
    fieldTransfer: {
      recordedHands: state.fieldNotes.length,
      reviewedHands: fieldReviewed.length,
      supportingReviewedHands: fieldSupporting.length,
      cueBeforeActionRate: percentMetric(fieldReviewed.filter((note) => note.cueBeforeAction).length, fieldReviewed.length, "reviewed fieldNotes; raw cue/action/reason/evaluator text intentionally omitted"),
      byStatus: {
        pending: state.fieldNotes.filter((note) => note.status === "PENDING_REVIEW").length,
        valid: state.fieldNotes.filter((note) => note.status === "REVIEWED_VALID").length,
        repair: state.fieldNotes.filter((note) => note.status === "REVIEWED_REPAIR").length,
        insufficient: state.fieldNotes.filter((note) => note.status === "INSUFFICIENT").length,
      },
    },
    productUse: {
      completedSessionDuration: meanMetric(durationSeconds, "seconds", "observation sessions"),
      intendedActionWithoutNavigationConfusion: navigationMetric,
      navigationConfusionRate: percentMetric(sessions.filter((session) => session.navigationConfusion === true).length, sessions.filter((session) => session.navigationConfusion !== null && session.navigationConfusion !== undefined).length, "explicit session observation"),
      abandonedSessions: sessions.filter((session) => !session.completed).length,
      averageUnnecessaryClicks: meanMetric(sessions.map((session) => session.unnecessaryClicks).filter((value): value is number => typeof value === "number"), "count", "explicit session observation"),
      queueOverloadRate: percentMetric(sessions.filter((session) => session.queueOverload === true).length, sessions.filter((session) => session.queueOverload !== null && session.queueOverload !== undefined).length, "explicit session observation"),
      desireToReturn: meanMetric(sessions.map((session) => session.desireToReturn).filter((value): value is number => typeof value === "number"), "score_1_5", "explicit session observation"),
      beforePlayUsefulness: meanMetric(sessions.map((session) => session.beforePlayUsefulness).filter((value): value is number => typeof value === "number"), "score_1_5", "explicit session observation"),
    },
    friction: {
      totalObserved: ledger.friction.length,
      ...friction,
      privacy: "Free-text friction notes are intentionally excluded from this summary; raw observation ledger stays local unless explicitly shared.",
    },
    privacy: {
      rawDiagnosticReasoningIncluded: false,
      rawExplainBackIncluded: false,
      rawFieldHandTextIncluded: false,
      userIdentifierIncluded: false,
    },
  };
}
