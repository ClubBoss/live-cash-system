import type { LearnerState, LearningMode, ReviewItem } from "./model-core";
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

  // Singleton variant groups are common in the reviewed corpus. Prefer an
  // existing changed/boundary application from the same module over repeating
  // the exact wording/answer pair. This is deterministic and adds no poker truth.
  const application = retentionOrder(
    nonIdentical.filter((drill) => drill.kind === "changed" || drill.kind === "boundary"),
    `${seed}:application`,
  );
  if (application.length) return application[0].id;

  const alternate = retentionOrder(nonIdentical, `${seed}:alternate`);
  if (alternate.length) return alternate[0].id;

  // A true one-drill module can still offer exact maintenance practice. The
  // model layer explicitly prevents that repeat from becoming strong retention.
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
