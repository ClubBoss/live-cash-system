import type { LearnerState, ModuleId, ReviewItem } from "./model-core";

export type DailyBudget = "5" | "15" | "30" | "warmup" | "post";
export type SchedulerDrillKind = "core" | "changed" | "boundary" | "mixed";
export type PlanReasonCode =
  | "resume"
  | "overdue_retention"
  | "repair"
  | "diagnostic_priority"
  | "weak"
  | "stale"
  | "changed"
  | "boundary"
  | "mixed"
  | "new"
  | "warmup"
  | "done";
export type PlanItemKind = "resume" | "review" | "repair" | "practice" | "mixed" | "lesson" | "cards" | "done";

export type SchedulerDrill = {
  id: string;
  moduleId: ModuleId;
  nodeKey: string;
  variantGroup: string;
  kind: SchedulerDrillKind;
  targetSeconds: number;
};
export type SchedulerModule = {
  id: ModuleId;
  prerequisites: readonly ModuleId[];
  drills: readonly SchedulerDrill[];
};
export type SchedulerCard = { id: string; moduleId: ModuleId };
export type SchedulerCatalog = {
  modules: readonly SchedulerModule[];
  cards: readonly SchedulerCard[];
};
export type PlanItem = {
  kind: PlanItemKind;
  moduleId?: ModuleId;
  drillIds?: string[];
  cardIds?: string[];
  sourceReviewId?: string;
  estimatedMinutes: number;
  reasonCode: PlanReasonCode;
};
export type DailyPlan = {
  budget: DailyBudget;
  targetMinutes: number;
  estimatedMinutes: number;
  items: PlanItem[];
  deferredDueCount: number;
  absenceDays: number;
  returnAfterBreak: boolean;
};
export type PlanDailyTrainingOptions = {
  budget: DailyBudget;
  now: number;
  seed: string;
  ownerPriorityModules?: readonly ModuleId[];
};

export const DEFAULT_OWNER_PRIORITY_MODULES: readonly ModuleId[] = ["preflop", "blinds", "aggression"];

// Route policy changes eligibility only. Poker content, state schema, mastery,
// review order, retention intervals and owner-priority weights stay unchanged.
export const ROUTE_POLICY_VERSION = "2026.08-hard-prereq-v1";
export const RECOMMENDED_MODULE_ORDER: readonly ModuleId[] = [
  "geometry",
  "preflop",
  "blinds",
  "filtering",
  "shape",
  "aggression",
  "ancestry",
  "multiway",
  "river",
  "evidence",
  "transfer",
];
export const HARD_PREREQUISITES: Readonly<Record<ModuleId, readonly ModuleId[]>> = {
  geometry: [],
  preflop: ["geometry"],
  blinds: ["preflop"],
  filtering: ["preflop"],
  shape: ["filtering"],
  aggression: ["shape"],
  ancestry: ["filtering"],
  multiway: ["filtering"],
  river: ["ancestry"],
  evidence: ["preflop"],
  transfer: ["geometry"],
};

const DAY = 86_400_000;
const TARGET_MINUTES: Record<DailyBudget, number> = { "5": 5, "15": 15, "30": 30, warmup: 2, post: 10 };
const DUE_LIMIT: Record<DailyBudget, number> = { "5": 2, "15": 4, "30": 6, warmup: 0, post: 4 };
const HIGH_CONFIDENCE_WRONG_THRESHOLD = 75;

function hash(value: string): number {
  let result = 2166136261;
  for (const character of value) result = Math.imul(result ^ character.charCodeAt(0), 16777619);
  return result >>> 0;
}
function daysBetween(now: number, then: number): number {
  return Math.max(0, Math.floor((now - then) / DAY));
}
function parseTime(value: string | null | undefined): number {
  if (!value) return 0;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}
function moduleLastEvidenceAt(state: LearnerState, moduleId: ModuleId): number {
  return Math.max(0, ...Object.values(state.modules[moduleId].evidence).map((cell) => parseTime(cell.lastAt)));
}
function moduleWeakness(state: LearnerState, moduleId: ModuleId): number {
  const progress = state.modules[moduleId];
  const recentErrors = progress.recentClasses.filter((value) => value !== "A").length;
  const actionMisses = progress.evidence.action_selection.exposures - progress.evidence.action_selection.successes;
  const reasonMisses = progress.evidence.mechanism_explanation.exposures - progress.evidence.mechanism_explanation.successes;
  return (progress.highConfidenceError ? 12 : 0) + recentErrors * 4 + actionMisses * 2 + reasonMisses * 2;
}
function priorityBoost(state: LearnerState, moduleId: ModuleId, ownerPriorityModules: readonly ModuleId[]): number {
  const t1Index = state.diagnostic.priorityModules.indexOf(moduleId);
  const t1 = t1Index === 0 ? 18 : t1Index === 1 ? 12 : 0;
  return t1 + (ownerPriorityModules.includes(moduleId) ? 6 : 0);
}
function deterministicTie(seed: string, key: string): number {
  return hash(`${seed}:${key}`);
}
function recommendedRank(moduleId: ModuleId, catalog: SchedulerCatalog): number {
  const canonical = RECOMMENDED_MODULE_ORDER.indexOf(moduleId);
  if (canonical >= 0) return canonical;
  const fallback = catalog.modules.findIndex((module) => module.id === moduleId);
  return fallback >= 0 ? RECOMMENDED_MODULE_ORDER.length + fallback : Number.MAX_SAFE_INTEGER;
}
function highConfidenceWrongRepair(state: LearnerState, item: ReviewItem): boolean {
  if (item.kind !== "repair") return false;
  const source = state.interactions.find((interaction) => interaction.id === item.sourceInteractionId);
  return Boolean(source
    && (!source.actionOk || !source.reasonOk)
    && source.confidence >= HIGH_CONFIDENCE_WRONG_THRESHOLD);
}
function reviewScore(state: LearnerState, item: ReviewItem, now: number, ownerPriorityModules: readonly ModuleId[]): number {
  const overdueDays = daysBetween(now, parseTime(item.dueAt));
  const tier = overdueDays >= 30 ? 3 : overdueDays >= 14 ? 2 : overdueDays >= 7 ? 1 : 0;
  // Product heuristic: a confident wrong decision is repaired before a neutral
  // due retrieval. This is deterministic routing, not an empirical threshold.
  const kind = highConfidenceWrongRepair(state, item) ? 700 : item.kind === "retention" ? 500 : 400;
  return kind + tier * 100 + Math.min(30, overdueDays) + priorityBoost(state, item.moduleId, ownerPriorityModules);
}
function sortReviews(state: LearnerState, items: ReviewItem[], now: number, seed: string, ownerPriorityModules: readonly ModuleId[]): ReviewItem[] {
  return [...items].sort((left, right) => {
    const score = reviewScore(state, right, now, ownerPriorityModules) - reviewScore(state, left, now, ownerPriorityModules);
    if (score) return score;
    const due = parseTime(left.dueAt) - parseTime(right.dueAt);
    if (due) return due;
    return deterministicTie(seed, left.id) - deterministicTie(seed, right.id);
  });
}
function diverseTake(items: ReviewItem[], limit: number): ReviewItem[] {
  const selected: ReviewItem[] = [];
  const modules = new Set<ModuleId>();
  for (const item of items) {
    if (selected.length >= limit) break;
    if (modules.has(item.moduleId)) continue;
    selected.push(item);
    modules.add(item.moduleId);
  }
  for (const item of items) {
    if (selected.length >= limit) break;
    if (selected.some((candidate) => candidate.id === item.id)) continue;
    selected.push(item);
  }
  return selected;
}
function availableModule(state: LearnerState, module: SchedulerModule): boolean {
  return HARD_PREREQUISITES[module.id].every((required) => state.modules[required].contentCompleted);
}
function pickDrills(module: SchedulerModule, kind: SchedulerDrillKind, count: number, seed: string): string[] {
  return module.drills
    .filter((drill) => drill.kind === kind)
    .sort((left, right) => deterministicTie(seed, left.id) - deterministicTie(seed, right.id))
    .slice(0, count)
    .map((drill) => drill.id);
}
function recentLessonExposure(state: LearnerState, now: number): boolean {
  return state.interactions.some((item) => item.mode === "lesson" && now - parseTime(item.at) < 18 * 60 * 60 * 1000);
}
function chooseRankedModule(
  state: LearnerState,
  modules: SchedulerModule[],
  now: number,
  seed: string,
  ownerPriorityModules: readonly ModuleId[],
  predicate: (module: SchedulerModule) => boolean,
): SchedulerModule | undefined {
  return modules
    .filter(predicate)
    .map((module) => {
      const weakness = moduleWeakness(state, module.id);
      const lastAt = moduleLastEvidenceAt(state, module.id);
      const stale = lastAt ? Math.min(20, daysBetween(now, lastAt)) : 0;
      return { module, score: weakness * 10 + stale + priorityBoost(state, module.id, ownerPriorityModules) };
    })
    .sort((left, right) => right.score - left.score || deterministicTie(seed, left.module.id) - deterministicTie(seed, right.module.id))[0]?.module;
}

export function selectWarmupCardIds(
  state: LearnerState,
  catalog: SchedulerCatalog,
  now: number,
  seed: string,
  ownerPriorityModules: readonly ModuleId[] = DEFAULT_OWNER_PRIORITY_MODULES,
): string[] {
  // A warm-up may only recall material from completed topics. An unfinished
  // active lesson is preserved, but it does not make its cards eligible yet.
  const eligibleModules = new Set<ModuleId>(catalog.modules
    .filter((module) => state.modules[module.id].contentCompleted)
    .map((module) => module.id));
  if (!eligibleModules.size) return [];
  return catalog.cards
    .filter((card) => eligibleModules.has(card.moduleId))
    .map((card) => {
      const cardState = state.cards[card.id];
      const due = !cardState || parseTime(cardState.dueAt) <= now;
      const score = (due ? 100 : 0)
        + priorityBoost(state, card.moduleId, ownerPriorityModules)
        + moduleWeakness(state, card.moduleId);
      return { card, score };
    })
    .sort((left, right) => right.score - left.score || deterministicTie(seed, left.card.id) - deterministicTie(seed, right.card.id))
    .slice(0, 2)
    .map(({ card }) => card.id);
}

export function planDailyTraining(state: LearnerState, catalog: SchedulerCatalog, options: PlanDailyTrainingOptions): DailyPlan {
  const ownerPriorityModules = options.ownerPriorityModules ?? DEFAULT_OWNER_PRIORITY_MODULES;
  const targetMinutes = TARGET_MINUTES[options.budget];
  const capMinutes = targetMinutes * 1.2;
  const updatedAt = parseTime(state.updatedAt) || options.now;
  const absenceDays = daysBetween(options.now, updatedAt);
  const plan: DailyPlan = {
    budget: options.budget,
    targetMinutes,
    estimatedMinutes: 0,
    items: [],
    deferredDueCount: 0,
    absenceDays,
    returnAfterBreak: absenceDays >= 7,
  };

  // "Before play" is an explicit alternate mode, not an alias for Resume.
  // When another session is saved we leave it untouched and offer only cards
  // from already completed topics; starting a repair would overwrite that session.
  if (options.budget === "warmup") {
    const cardIds = selectWarmupCardIds(state, catalog, options.now, options.seed, ownerPriorityModules);
    if (state.activeSession) {
      if (cardIds.length) plan.items.push({ kind: "cards", cardIds, estimatedMinutes: 1, reasonCode: "warmup" });
      else plan.items.push({ kind: "done", estimatedMinutes: 0, reasonCode: "done" });
      plan.estimatedMinutes = plan.items.reduce((sum, item) => sum + item.estimatedMinutes, 0);
      return plan;
    }

    const dueRepairs = sortReviews(
      state,
      state.reviewQueue.filter((item) => item.kind === "repair" && parseTime(item.dueAt) <= options.now),
      options.now,
      `${options.seed}:warmup-repair`,
      ownerPriorityModules,
    );
    const repair = dueRepairs[0];
    if (repair) {
      plan.items.push({ kind: "repair", moduleId: repair.moduleId, sourceReviewId: repair.id, estimatedMinutes: 1, reasonCode: "warmup" });
      if (cardIds.length) plan.items.push({ kind: "cards", cardIds, estimatedMinutes: 1, reasonCode: "warmup" });
    } else if (cardIds.length) {
      plan.items.push({ kind: "cards", cardIds, estimatedMinutes: 1, reasonCode: "warmup" });
    } else {
      plan.items.push({ kind: "done", estimatedMinutes: 0, reasonCode: "done" });
    }
    plan.estimatedMinutes = plan.items.reduce((sum, item) => sum + item.estimatedMinutes, 0);
    return plan;
  }

  if (state.activeSession) {
    const remaining = Math.max(1, state.activeSession.drillIds.length - state.activeSession.currentIndex);
    const estimate = Math.min(targetMinutes, Math.max(2, remaining * 2));
    plan.items.push({ kind: "resume", moduleId: state.activeSession.moduleId, estimatedMinutes: estimate, reasonCode: "resume" });
    plan.estimatedMinutes = estimate;
    return plan;
  }

  const add = (item: PlanItem) => {
    if (plan.items.length && plan.estimatedMinutes + item.estimatedMinutes > capMinutes) return false;
    plan.items.push(item);
    plan.estimatedMinutes += item.estimatedMinutes;
    return true;
  };

  const due = state.reviewQueue.filter((item) => parseTime(item.dueAt) <= options.now);
  const orderedDue = sortReviews(state, due, options.now, options.seed, ownerPriorityModules);
  const selectedDue = diverseTake(orderedDue, DUE_LIMIT[options.budget]);
  plan.deferredDueCount = Math.max(0, due.length - selectedDue.length);
  for (const item of selectedDue) {
    add({
      kind: item.kind === "retention" ? "review" : "repair",
      moduleId: item.moduleId,
      sourceReviewId: item.id,
      estimatedMinutes: 2,
      reasonCode: item.kind === "retention" ? "overdue_retention" : "repair",
    });
  }

  const plannedModules = new Set(plan.items.flatMap((item) => item.moduleId ? [item.moduleId] : []));
  const completed = catalog.modules.filter((module) => state.modules[module.id].contentCompleted);

  const priorityWeak = chooseRankedModule(state, completed, options.now, `${options.seed}:priority`, ownerPriorityModules, (module) =>
    !plannedModules.has(module.id)
      && moduleWeakness(state, module.id) > 0
      && (state.diagnostic.priorityModules.includes(module.id) || ownerPriorityModules.includes(module.id)));
  if (priorityWeak) {
    const drills = pickDrills(priorityWeak, "changed", 2, options.seed);
    if (add({
      kind: "practice",
      moduleId: priorityWeak.id,
      drillIds: drills.length ? drills : priorityWeak.drills.slice(0, 2).map((drill) => drill.id),
      estimatedMinutes: 3,
      reasonCode: state.diagnostic.priorityModules.includes(priorityWeak.id) ? "diagnostic_priority" : "weak",
    })) plannedModules.add(priorityWeak.id);
  }

  const weak = chooseRankedModule(state, completed, options.now, `${options.seed}:weak`, ownerPriorityModules, (module) =>
    !plannedModules.has(module.id) && moduleWeakness(state, module.id) > 0);
  if (weak) {
    const drills = pickDrills(weak, "changed", 2, options.seed);
    if (add({ kind: "practice", moduleId: weak.id, drillIds: drills.length ? drills : weak.drills.slice(0, 2).map((drill) => drill.id), estimatedMinutes: 3, reasonCode: "weak" })) plannedModules.add(weak.id);
  }

  const stale = chooseRankedModule(state, completed, options.now, `${options.seed}:stale`, ownerPriorityModules, (module) => {
    const lastAt = moduleLastEvidenceAt(state, module.id);
    return !plannedModules.has(module.id) && lastAt > 0 && daysBetween(options.now, lastAt) >= 14;
  });
  if (stale) {
    const drills = pickDrills(stale, "changed", 2, options.seed);
    if (add({ kind: "practice", moduleId: stale.id, drillIds: drills.length ? drills : stale.drills.slice(0, 2).map((drill) => drill.id), estimatedMinutes: 3, reasonCode: "stale" })) plannedModules.add(stale.id);
  }

  const transferNeed = chooseRankedModule(state, completed, options.now, `${options.seed}:changed`, ownerPriorityModules, (module) =>
    !plannedModules.has(module.id) && state.modules[module.id].evidence.variant_transfer.exposures < 2 && module.drills.some((drill) => drill.kind === "changed"));
  if (transferNeed) {
    if (add({ kind: "practice", moduleId: transferNeed.id, drillIds: pickDrills(transferNeed, "changed", 2, options.seed), estimatedMinutes: 3, reasonCode: "changed" })) plannedModules.add(transferNeed.id);
  }

  const boundaryNeed = chooseRankedModule(state, completed, options.now, `${options.seed}:boundary`, ownerPriorityModules, (module) =>
    !plannedModules.has(module.id) && state.modules[module.id].evidence.boundary_control.exposures < 1 && module.drills.some((drill) => drill.kind === "boundary"));
  if (boundaryNeed) {
    if (add({ kind: "practice", moduleId: boundaryNeed.id, drillIds: pickDrills(boundaryNeed, "boundary", 1, options.seed), estimatedMinutes: 3, reasonCode: "boundary" })) plannedModules.add(boundaryNeed.id);
  }

  if (completed.length >= 3 && plan.estimatedMinutes + 5 <= capMinutes) {
    const mixedModules = [...completed]
      .sort((left, right) => priorityBoost(state, right.id, ownerPriorityModules) - priorityBoost(state, left.id, ownerPriorityModules)
        || deterministicTie(`${options.seed}:mixed`, left.id) - deterministicTie(`${options.seed}:mixed`, right.id))
      .slice(0, options.budget === "30" ? 5 : 3);
    const drillIds = mixedModules.map((module, index) => module.drills[deterministicTie(`${options.seed}:mixed:${index}`, module.id) % module.drills.length].id);
    add({ kind: "mixed", moduleId: mixedModules[0].id, drillIds, estimatedMinutes: 5, reasonCode: "mixed" });
  }

  const hasUnresolvedRepair = state.reviewQueue.some((item) => item.kind === "repair")
    || catalog.modules.some((module) => state.modules[module.id].highConfidenceError || state.modules[module.id].recentClasses.includes("D"));
  const newAllowed = options.budget !== "post" && options.budget !== "5" && !hasUnresolvedRepair && !recentLessonExposure(state, options.now);
  if (newAllowed) {
    const availableNew = catalog.modules.filter((module) => !state.modules[module.id].contentCompleted && availableModule(state, module));
    const nextNew = [...availableNew].sort((left, right) =>
      priorityBoost(state, right.id, ownerPriorityModules) - priorityBoost(state, left.id, ownerPriorityModules)
        || recommendedRank(left.id, catalog) - recommendedRank(right.id, catalog))[0];
    if (nextNew) add({ kind: "lesson", moduleId: nextNew.id, estimatedMinutes: 8, reasonCode: "new" });
  }

  if (!plan.items.length && completed.length) {
    const module = chooseRankedModule(state, completed, options.now, `${options.seed}:steady`, ownerPriorityModules, () => true) ?? completed[0];
    const drills = module.drills.slice(0, 2).map((drill) => drill.id);
    add({ kind: "practice", moduleId: module.id, drillIds: drills, estimatedMinutes: Math.min(3, targetMinutes), reasonCode: "weak" });
  }

  if (!plan.items.length) plan.items.push({ kind: "done", estimatedMinutes: 0, reasonCode: "done" });
  return plan;
}
