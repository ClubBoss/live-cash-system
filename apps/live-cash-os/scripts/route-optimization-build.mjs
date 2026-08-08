import { readFile, writeFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);

async function read(relativePath) {
  return readFile(new URL(relativePath, root), "utf8");
}

async function write(relativePath, value) {
  await writeFile(new URL(relativePath, root), value, "utf8");
}

function replaceOnce(source, from, to, label) {
  if (source.includes(to)) return source;
  const count = source.split(from).length - 1;
  if (count !== 1) throw new Error(`${label}: expected exactly one source match, found ${count}`);
  return source.replace(from, to);
}

async function patchScheduler() {
  let source = await read("lib/scheduler.ts");
  source = replaceOnce(
    source,
    'export const DEFAULT_OWNER_PRIORITY_MODULES: readonly ModuleId[] = ["preflop", "blinds", "aggression"];',
    `export const DEFAULT_OWNER_PRIORITY_MODULES: readonly ModuleId[] = ["preflop", "blinds", "aggression"];

// ROUTE_POLICY_VERSION intentionally changes only eligibility, not poker content,
// state schema, mastery thresholds, review order or priority weights.
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
};`,
    "scheduler route policy",
  );

  source = replaceOnce(
    source,
    `function availableModule(state: LearnerState, module: SchedulerModule): boolean {
  return module.prerequisites.every((required) => state.modules[required].contentCompleted);
}`,
    `function availableModule(state: LearnerState, module: SchedulerModule): boolean {
  return HARD_PREREQUISITES[module.id].every((required) => state.modules[required].contentCompleted);
}`,
    "scheduler hard prerequisite gate",
  );

  source = replaceOnce(
    source,
    `function deterministicTie(seed: string, key: string): number {
  return hash(\`${"${seed}:${key}"}\`);
}`,
    `function deterministicTie(seed: string, key: string): number {
  return hash(\`${"${seed}:${key}"}\`);
}
function recommendedRank(moduleId: ModuleId, catalog: SchedulerCatalog): number {
  const canonical = RECOMMENDED_MODULE_ORDER.indexOf(moduleId);
  if (canonical >= 0) return canonical;
  const fallback = catalog.modules.findIndex((module) => module.id === moduleId);
  return fallback >= 0 ? RECOMMENDED_MODULE_ORDER.length + fallback : Number.MAX_SAFE_INTEGER;
}`,
    "scheduler recommended rank",
  );

  source = replaceOnce(
    source,
    `      priorityBoost(state, right.id, ownerPriorityModules) - priorityBoost(state, left.id, ownerPriorityModules)
        || catalog.modules.indexOf(left) - catalog.modules.indexOf(right))[0];`,
    `      priorityBoost(state, right.id, ownerPriorityModules) - priorityBoost(state, left.id, ownerPriorityModules)
        || recommendedRank(left.id, catalog) - recommendedRank(right.id, catalog))[0];`,
    "scheduler recommended route tie-break",
  );

  await write("lib/scheduler.ts", source);
}

async function patchModelFacade() {
  let source = await read("lib/model.ts");
  source = replaceOnce(
    source,
    'import * as core from "./model-core";',
    'import * as core from "./model-core";\nimport { HARD_PREREQUISITES } from "./scheduler";',
    "model route policy import",
  );
  source = replaceOnce(
    source,
    `  LearnerState,
  LocaleCode,`,
    `  LearnerState,
  LocaleCode,
  ModuleId,`,
    "model ModuleId type",
  );
  source = replaceOnce(
    source,
    `const EXPLICIT_TRANSFER_PROBES: Readonly<Record<string, TransferProbe>> = {`,
    `export function moduleAvailable(state: LearnerState, moduleId: ModuleId, _legacyPrerequisites: readonly ModuleId[]): boolean {
  return HARD_PREREQUISITES[moduleId].every((required) => state.modules[required].contentCompleted);
}

const EXPLICIT_TRANSFER_PROBES: Readonly<Record<string, TransferProbe>> = {`,
    "model hard prerequisite facade",
  );
  await write("lib/model.ts", source);
}

async function patchLearnerCopy() {
  let field = await read("components/Wave7Experience.tsx");
  field = replaceOnce(
    field,
    'captureBody: "Сначала зафиксируй ситуацию, что заметил, действие и причину. Результат добавляется только после сохранения этого снимка.",',
    'captureBody: "Сначала зафиксируй ситуацию, что заметил, действие и причину. Результат добавляется только после сохранения этого снимка. Одна раздача — наблюдение, а не доказательство частоты или общего типа игрока.",',
    "RU evidence hygiene",
  );
  field = replaceOnce(
    field,
    'captureBody: "Lock the spot, what you noticed, your action and your reason first. Add the result only after that snapshot is saved.",',
    'captureBody: "Lock the spot, what you noticed, your action and your reason first. Add the result only after that snapshot is saved. One hand is an observation, not proof of a frequency or a global player type.",',
    "EN evidence hygiene",
  );
  await write("components/Wave7Experience.tsx", field);

  let coreSource = await read("components/LiveCashAppCore.tsx");
  coreSource = replaceOnce(
    coreSource,
    'setNotice(locale === "ru" ? "Сначала закончи объяснение предыдущего модуля." : "Complete the previous module explanation first.");',
    'setNotice(locale === "ru" ? "Сначала закончи обязательную базовую тему для этого модуля." : "Complete the required foundation for this module first.");',
    "hard prerequisite learner notice",
  );
  await write("components/LiveCashAppCore.tsx", coreSource);
}

await patchScheduler();
await patchModelFacade();
await patchLearnerCopy();
console.log("ROUTE_OPTIMIZATION_BUILD_OK");
