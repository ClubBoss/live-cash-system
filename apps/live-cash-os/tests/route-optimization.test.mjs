import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import ts from "typescript";

async function loadTs(relativePath) {
  const source = await readFile(new URL(`../${relativePath}`, import.meta.url), "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, importsNotUsedAsValues: ts.ImportsNotUsedAsValues.Remove },
  }).outputText;
  const directory = await mkdtemp(join(tmpdir(), "live-cash-os-route-"));
  const output = join(directory, `${relativePath.replaceAll("/", "-").replace(/\.ts$/u, "")}.mjs`);
  await writeFile(output, compiled, "utf8");
  return import(`${new URL(`file://${output}`).href}?${Date.now()}-${Math.random()}`);
}

const schedulerPromise = loadTs("lib/scheduler.ts");
const modelPromise = loadTs("lib/model-core.ts");
const NOW = Date.parse("2026-08-08T12:00:00.000Z");

const MODULE_ORDER = ["geometry", "preflop", "blinds", "filtering", "shape", "aggression", "ancestry", "multiway", "river", "evidence", "transfer"];
const HARD = {
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

const catalog = {
  modules: MODULE_ORDER.map((id) => ({
    id,
    // Deliberately retain a legacy linear predecessor chain in the fixture.
    // The route policy must use HARD_PREREQUISITES rather than this field.
    prerequisites: id === "geometry" ? [] : [MODULE_ORDER[MODULE_ORDER.indexOf(id) - 1]],
    drills: [
      { id: `${id}-core`, moduleId: id, nodeKey: `${id}-core`, variantGroup: `${id}-core`, kind: "core", targetSeconds: 30 },
      { id: `${id}-changed`, moduleId: id, nodeKey: `${id}-changed`, variantGroup: `${id}-changed`, kind: "changed", targetSeconds: 30 },
      { id: `${id}-boundary`, moduleId: id, nodeKey: `${id}-boundary`, variantGroup: `${id}-boundary`, kind: "boundary", targetSeconds: 30 },
    ],
  })),
  cards: [],
};

function neutralizeCompleted(state, moduleId) {
  state.modules[moduleId].contentCompleted = true;
  state.modules[moduleId].evidence.variant_transfer.exposures = 2;
  state.modules[moduleId].evidence.variant_transfer.successes = 2;
  state.modules[moduleId].evidence.boundary_control.exposures = 1;
  state.modules[moduleId].evidence.boundary_control.successes = 1;
}

function nextLesson(plan) {
  return plan.items.find((item) => item.kind === "lesson")?.moduleId;
}

test("route policy separates canonical recommendation from audited hard prerequisites", async () => {
  const scheduler = await schedulerPromise;
  assert.equal(scheduler.ROUTE_POLICY_VERSION, "2026.08-hard-prereq-v1");
  assert.deepEqual([...scheduler.RECOMMENDED_MODULE_ORDER], MODULE_ORDER);
  assert.deepEqual(scheduler.HARD_PREREQUISITES, HARD);
  assert.deepEqual([...scheduler.DEFAULT_OWNER_PRIORITY_MODULES], ["preflop", "blinds", "aggression"]);
});

test("hard prerequisite graph is valid, acyclic and fully reachable from geometry", async () => {
  const scheduler = await schedulerPromise;
  const known = new Set(MODULE_ORDER);
  for (const moduleId of MODULE_ORDER) {
    for (const required of scheduler.HARD_PREREQUISITES[moduleId]) assert.equal(known.has(required), true, `${moduleId} references unknown prerequisite ${required}`);
  }

  const visiting = new Set();
  const visited = new Set();
  function visit(id) {
    if (visiting.has(id)) throw new Error(`cycle at ${id}`);
    if (visited.has(id)) return;
    visiting.add(id);
    for (const required of scheduler.HARD_PREREQUISITES[id]) visit(required);
    visiting.delete(id);
    visited.add(id);
  }
  for (const id of MODULE_ORDER) visit(id);
  assert.equal(visited.size, 11);
});

test("default route remains the canonical 01→11 spine", async () => {
  const scheduler = await schedulerPromise;
  const model = await modelPromise;
  const state = model.emptyLearnerState();
  state.updatedAt = new Date(NOW).toISOString();

  const observed = [];
  for (let index = 0; index < MODULE_ORDER.length; index += 1) {
    const plan = scheduler.planDailyTraining(state, catalog, { budget: "15", now: NOW, seed: `default-${index}` });
    const lesson = nextLesson(plan);
    observed.push(lesson);
    assert.equal(lesson, MODULE_ORDER[index]);
    neutralizeCompleted(state, lesson);
  }
  assert.deepEqual(observed, MODULE_ORDER);
});

test("diagnostic priority may promote an eligible later module but cannot skip its hard foundation", async () => {
  const scheduler = await schedulerPromise;
  const model = await modelPromise;

  const blocked = model.emptyLearnerState();
  blocked.updatedAt = new Date(NOW).toISOString();
  neutralizeCompleted(blocked, "geometry");
  blocked.diagnostic.priorityModules = ["evidence"];
  blocked.diagnostic.status = "ROUTED";
  const blockedPlan = scheduler.planDailyTraining(blocked, catalog, { budget: "15", now: NOW, seed: "blocked-evidence" });
  assert.equal(nextLesson(blockedPlan), "preflop", "LCM-10 must not skip its preflop foundation");

  const eligible = model.emptyLearnerState();
  eligible.updatedAt = new Date(NOW).toISOString();
  neutralizeCompleted(eligible, "geometry");
  neutralizeCompleted(eligible, "preflop");
  eligible.diagnostic.priorityModules = ["evidence"];
  eligible.diagnostic.status = "ROUTED";
  const eligiblePlan = scheduler.planDailyTraining(eligible, catalog, { budget: "15", now: NOW, seed: "eligible-evidence" });
  assert.equal(nextLesson(eligiblePlan), "evidence", "LCM-10 may move earlier only after its hard foundation is complete");
});

test("ancestry priority cannot skip filtering even though legacy predecessor metadata is no longer the hard gate", async () => {
  const scheduler = await schedulerPromise;
  const model = await modelPromise;
  const state = model.emptyLearnerState();
  state.updatedAt = new Date(NOW).toISOString();
  neutralizeCompleted(state, "geometry");
  neutralizeCompleted(state, "preflop");
  state.diagnostic.priorityModules = ["ancestry"];
  state.diagnostic.status = "ROUTED";
  let plan = scheduler.planDailyTraining(state, catalog, { budget: "15", now: NOW, seed: "ancestry-blocked" });
  assert.notEqual(nextLesson(plan), "ancestry");

  neutralizeCompleted(state, "filtering");
  plan = scheduler.planDailyTraining(state, catalog, { budget: "15", now: NOW, seed: "ancestry-eligible" });
  assert.equal(nextLesson(plan), "ancestry");
});

test("canonical poker module corpus is byte-for-byte unchanged from the pre-route baseline", async () => {
  const bytes = await readFile(new URL("../content/modules.ts", import.meta.url));
  const header = Buffer.from(`blob ${bytes.length}\0`);
  const blobSha = createHash("sha1").update(header).update(bytes).digest("hex");
  assert.equal(blobSha, "077cca4459b9ab8f0bd6f1b28dfe1af77bfb7d09");
});

test("route closure does not introduce a learner-state migration or new mastery semantics", async () => {
  const modelSource = await readFile(new URL("../lib/model-core.ts", import.meta.url), "utf8");
  const facade = await readFile(new URL("../lib/model.ts", import.meta.url), "utf8");
  const scheduler = await readFile(new URL("../lib/scheduler.ts", import.meta.url), "utf8");
  assert.match(modelSource, /STATE_SCHEMA_VERSION = 2/u);
  assert.match(modelSource, /const kind: ReviewItem\["kind"\] = passed \? "retention" : "repair"/u);
  assert.match(modelSource, /field\.successes >= 2/u);
  assert.match(facade, /HARD_PREREQUISITES/u);
  assert.match(facade, /export function moduleAvailable/u);
  assert.doesNotMatch(scheduler, /AI|LLM|recommender/iu);
});

test("evidence hygiene is learner-facing in both locales without claiming one hand proves a population", async () => {
  const field = await readFile(new URL("../components/Wave7Experience.tsx", import.meta.url), "utf8");
  const core = await readFile(new URL("../components/LiveCashAppCore.tsx", import.meta.url), "utf8");
  assert.match(field, /Одна раздача — наблюдение, а не доказательство частоты или общего типа игрока/u);
  assert.match(field, /One hand is an observation, not proof of a frequency or a global player type/u);
  assert.match(core, /обязательную базовую тему/u);
  assert.match(core, /required foundation/u);
  assert.doesNotMatch(core, /Сначала закончи объяснение предыдущего модуля/u);
});
