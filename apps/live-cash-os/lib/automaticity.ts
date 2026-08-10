import { modules } from "../content/modules";
import type { LearnerState, LearningMode, ReviewItem } from "./model-core";
import { applyLessonIntegrityOrdering } from "./retrieval-integrity";
import {
  planDailyTraining,
  type DailyPlan,
  type PlanDailyTrainingOptions,
  type SchedulerCatalog,
  type SchedulerDrill,
} from "./scheduler";

const DAY_MS = 86_400_000;

// Product heuristic, not an empirical truth. Wave 10 evidence may justify moving it.
export const HIGH_CONFIDENCE_WRONG_THRESHOLD = 75;
export const RETENTION_CHAIN_DAYS = [1, 3, 7] as const;
export const TABLE_BURST_SIZE = 8;

// LiveCashAppCore still derives lesson applications from module drill order. Keep
// the bounded leak repairs in a pure policy module, then apply that order before
// the app builds its scheduler catalog or opens a lesson. Drill identity and
// poker content are unchanged.
applyLessonIntegrityOrdering(modules);

function hash(value: string): number {
  let result = 2166136261;
  for (const character of value) result = Math.imul(result ^ character.charCodeAt(0), 16777619);
  return result >>> 0;
}

export function planAutomaticTraining(
  state: LearnerState,
  catalog: SchedulerCatalog,
  options: PlanDailyTrainingOptions,
): DailyPlan {
  return planDailyTraining(state, catalog, options);
}

export function nextRetentionDelayMs(completedSuccessfulStages: number): number | null {
  if (completedSuccessfulStages <= 0) return RETENTION_CHAIN_DAYS[0] * DAY_MS;
  if (completedSuccessfulStages === 1) return RETENTION_CHAIN_DAYS[1] * DAY_MS;
  if (completedSuccessfulStages === 2) return RETENTION_CHAIN_DAYS[2] * DAY_MS;
  return null;
}

function retentionOrder(drills: readonly SchedulerDrill[], seed: string): SchedulerDrill[] {
  return [...drills].sort((left, right) => hash(`${seed}:${left.id}`) - hash(`${seed}:${right.id}`) || left.id.localeCompare(right.id));
}

export function selectRetentionDrillId(item: ReviewItem, catalog: SchedulerCatalog, seed: string): string | undefined {
  const module = catalog.modules.find((candidate) => candidate.id === item.moduleId);
  if (!module) return undefined;

  const nonIdentical = module.drills.filter((drill) => drill.id !== item.sourceDrillId);
  const sameFamily = retentionOrder(
    nonIdentical.filter((drill) => drill.variantGroup === item.variantGroup),
    `${seed}:family`,
  );
  if (sameFamily.length) return sameFamily[0].id;

  const source = module.drills.find((drill) => drill.id === item.sourceDrillId);
  if (source) {
    const sameNode = retentionOrder(
      nonIdentical.filter((drill) => drill.nodeKey === source.nodeKey),
      `${seed}:node`,
    );
    if (sameNode.length) return sameNode[0].id;
  }

  // Do not substitute an arbitrary drill from the same module. A different node
  // may test a different mechanism and would make the original retention claim
  // stronger than the evidence supports. Exact recall remains useful maintenance
  // practice; model.ts prevents it from becoming strong retention evidence.
  if (source) return source.id;
  return undefined;
}

function orderedDrills(drills: readonly SchedulerDrill[], seed: string): SchedulerDrill[] {
  return [...drills].sort((left, right) => hash(`${seed}:${left.id}`) - hash(`${seed}:${right.id}`) || left.id.localeCompare(right.id));
}

export function selectTableBurstDrillIds(
  state: LearnerState,
  catalog: SchedulerCatalog,
  seed: string,
  targetCount = TABLE_BURST_SIZE,
): string[] {
  const eligible = catalog.modules
    .filter((module) => state.modules[module.id].contentCompleted && module.drills.length > 0)
    .sort((left, right) => hash(`${seed}:${left.id}`) - hash(`${seed}:${right.id}`) || left.id.localeCompare(right.id));
  if (eligible.length < 3) return [];

  const pools = new Map(eligible.map((module) => [module.id, orderedDrills(module.drills, `${seed}:${module.id}`)]));
  const selected: string[] = [];
  let round = 0;
  while (selected.length < Math.min(10, targetCount)) {
    let added = false;
    for (const module of eligible) {
      const drill = pools.get(module.id)?.[round];
      if (!drill) continue;
      selected.push(drill.id);
      added = true;
      if (selected.length >= Math.min(10, targetCount)) break;
    }
    if (!added) break;
    round += 1;
  }
  return selected.length >= 6 ? selected : [];
}

export function shouldFadeDecisionContext(mode: LearningMode, answered: boolean): boolean {
  return !answered && (mode === "review" || mode === "mixed");
}

export function isTableBurst(mode: LearningMode, drillCount: number): boolean {
  return mode === "mixed" && drillCount >= 6 && drillCount <= 10;
}
