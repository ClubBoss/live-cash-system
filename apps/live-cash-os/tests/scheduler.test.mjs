import assert from "node:assert/strict";
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
  const directory = await mkdtemp(join(tmpdir(), "live-cash-os-w6-"));
  const output = join(directory, `${relativePath.replaceAll("/", "-").replace(/\.ts$/u, "")}.mjs`);
  await writeFile(output, compiled, "utf8");
  return import(`${new URL(`file://${output}`).href}?${Date.now()}-${Math.random()}`);
}

const schedulerPromise = loadTs("lib/scheduler.ts");
const modelPromise = loadTs("lib/model-core.ts");
const registryPromise = loadTs("lib/runtime-repair-registry.ts");

const NOW = Date.parse("2026-08-07T12:00:00.000Z");
const DAY = 86_400_000;
const catalog = {
  modules: [
    { id: "geometry", prerequisites: [], drills: [
      { id: "geo-core", moduleId: "geometry", nodeKey: "geo-core", variantGroup: "geo", kind: "core", targetSeconds: 30 },
      { id: "geo-change", moduleId: "geometry", nodeKey: "geo-change", variantGroup: "geo", kind: "changed", targetSeconds: 30 },
      { id: "geo-boundary", moduleId: "geometry", nodeKey: "geo-boundary", variantGroup: "geo", kind: "boundary", targetSeconds: 30 },
    ] },
    { id: "preflop", prerequisites: ["geometry"], drills: [
      { id: "pre-core", moduleId: "preflop", nodeKey: "pre-core", variantGroup: "pre", kind: "core", targetSeconds: 30 },
      { id: "pre-change", moduleId: "preflop", nodeKey: "pre-change", variantGroup: "pre", kind: "changed", targetSeconds: 30 },
      { id: "pre-boundary", moduleId: "preflop", nodeKey: "pre-boundary", variantGroup: "pre", kind: "boundary", targetSeconds: 30 },
    ] },
    { id: "blinds", prerequisites: ["preflop"], drills: [
      { id: "bli-core", moduleId: "blinds", nodeKey: "bli-core", variantGroup: "bli", kind: "core", targetSeconds: 30 },
      { id: "bli-change", moduleId: "blinds", nodeKey: "bli-change", variantGroup: "bli", kind: "changed", targetSeconds: 30 },
      { id: "bli-boundary", moduleId: "blinds", nodeKey: "bli-boundary", variantGroup: "bli", kind: "boundary", targetSeconds: 30 },
    ] },
    { id: "filtering", prerequisites: ["blinds"], drills: [{ id: "fil-core", moduleId: "filtering", nodeKey: "fil", variantGroup: "fil", kind: "core", targetSeconds: 30 }] },
  ],
  cards: [
    { id: "geo-card", moduleId: "geometry" },
    { id: "pre-card", moduleId: "preflop" },
    { id: "bli-card", moduleId: "blinds" },
    { id: "fil-card", moduleId: "filtering" },
  ],
};

function review(overrides = {}) {
  return { id: "review-1", moduleId: "geometry", sourceDrillId: "geo-core", variantGroup: "geo", kind: "retention", dueAt: new Date(NOW - DAY).toISOString(), attempts: 0, sourceInteractionId: "source", ...overrides };
}
function decision(overrides = {}) {
  return { moduleId: "geometry", drillId: "geo-01", nodeKey: "node", variantGroup: "source-family", mode: "practice", actionOk: false, reasonOk: true, selectedActionOptionId: "geo-01-a1", selectedReasonOptionId: "geo-01-r0", confidence: 80, elapsedSeconds: 20, targetSeconds: 30, isBoundary: false, ...overrides };
}

for (const budget of ["5", "15", "30"]) {
  test(`${budget}-minute plan stays inside the deterministic budget cap`, async () => {
    const scheduler = await schedulerPromise;
    const model = await modelPromise;
    const state = model.emptyLearnerState();
    state.updatedAt = new Date(NOW).toISOString();
    const plan = scheduler.planDailyTraining(state, catalog, { budget, now: NOW, seed: "same" });
    assert.ok(plan.estimatedMinutes <= Number(budget) * 1.2);
    assert.equal(plan.items.filter((item) => item.kind === "lesson").length <= 1, true);
  });
}

test("same state, time and seed produce the same plan without mutating history", async () => {
  const scheduler = await schedulerPromise;
  const model = await modelPromise;
  const state = model.emptyLearnerState();
  state.updatedAt = new Date(NOW).toISOString();
  const before = structuredClone(state);
  const left = scheduler.planDailyTraining(state, catalog, { budget: "15", now: NOW, seed: "fixed" });
  const right = scheduler.planDailyTraining(state, catalog, { budget: "15", now: NOW, seed: "fixed" });
  assert.deepEqual(left, right);
  assert.deepEqual(state, before);
});

test("due delayed retrieval outranks a fresh genuine repair", async () => {
  const scheduler = await schedulerPromise;
  const model = await modelPromise;
  const state = model.emptyLearnerState();
  state.updatedAt = new Date(NOW).toISOString();
  state.reviewQueue.push(review(), review({ id: "repair", kind: "repair", dueAt: new Date(NOW).toISOString() }));
  const plan = scheduler.planDailyTraining(state, catalog, { budget: "5", now: NOW, seed: "priority" });
  assert.equal(plan.items[0].kind, "review");
});

test("genuine repair is first when no delayed retrieval is due", async () => {
  const scheduler = await schedulerPromise;
  const model = await modelPromise;
  const state = model.emptyLearnerState();
  state.updatedAt = new Date(NOW).toISOString();
  state.reviewQueue.push(review({ id: "repair", kind: "repair", dueAt: new Date(NOW).toISOString() }));
  const plan = scheduler.planDailyTraining(state, catalog, { budget: "5", now: NOW, seed: "repair" });
  assert.equal(plan.items[0].kind, "repair");
});

test("diagnostic routing changes priority only and never fabricates learning evidence", async () => {
  const scheduler = await schedulerPromise;
  const model = await modelPromise;
  const state = model.emptyLearnerState();
  const routed = model.routeDiagnosticPriorities(state, ["preflop"]);
  assert.deepEqual(routed.diagnostic.priorityModules, ["preflop"]);
  assert.equal(routed.modules.preflop.state, "UNEXPOSED");
  assert.equal(routed.modules.preflop.highConfidenceError, false);
  assert.equal(routed.modules.preflop.evidence.retention.exposures, 0);
  assert.equal(routed.modules.preflop.evidence.variant_transfer.exposures, 0);
  assert.equal(routed.modules.preflop.evidence.field_transfer.exposures, 0);
  routed.updatedAt = new Date(NOW).toISOString();
  const plan = scheduler.planDailyTraining(routed, catalog, { budget: "15", now: NOW, seed: "t1" });
  assert.ok(plan.items.length > 0);
});

test("migration clears legacy diagnostic-only repair flags but keeps observed errors", async () => {
  const model = await modelPromise;
  const legacy = model.emptyLearnerState();
  legacy.diagnostic.priorityModules = ["preflop"];
  legacy.diagnostic.status = "ROUTED";
  legacy.modules.preflop.state = "REPAIR_REQUIRED";
  legacy.modules.preflop.highConfidenceError = true;
  const clean = model.migrateLearnerState(legacy);
  assert.equal(clean.modules.preflop.highConfidenceError, false);
  assert.equal(clean.modules.preflop.state, "UNEXPOSED");

  const observed = model.recordDecision(model.emptyLearnerState(), decision({ moduleId: "preflop", drillId: "pre-01", nodeKey: "pre", variantGroup: "pre" }));
  observed.diagnostic.priorityModules = ["preflop"];
  const preserved = model.migrateLearnerState(observed);
  assert.equal(preserved.modules.preflop.highConfidenceError, true);
  assert.equal(preserved.modules.preflop.state, "REPAIR_REQUIRED");
});

test("wrong response persists exact selected option identities into repair source", async () => {
  const model = await modelPromise;
  const next = model.recordDecision(model.emptyLearnerState(), decision());
  assert.equal(next.interactions[0].selectedActionOptionId, "geo-01-a1");
  assert.equal(next.interactions[0].selectedReasonOptionId, "geo-01-r0");
  assert.equal(next.interactions[0].variantGroup, "source-family");
  assert.equal(next.reviewQueue[0].sourceActionOptionId, "geo-01-a1");
  assert.equal(next.reviewQueue[0].sourceReasonOptionId, "geo-01-r0");
});

test("sourceReviewId lets changed-node repair resolve the exact miss and schedules delayed retrieval only", async () => {
  const model = await modelPromise;
  const seeded = model.recordDecision(model.emptyLearnerState(), decision());
  const repairId = seeded.reviewQueue[0].id;
  const repaired = model.recordDecision(seeded, decision({
    drillId: "geo-05",
    nodeKey: "changed-node",
    variantGroup: "changed-family",
    mode: "repair",
    actionOk: true,
    reasonOk: true,
    selectedActionOptionId: "geo-05-a0",
    selectedReasonOptionId: "geo-05-r0",
    sourceReviewId: repairId,
    confidence: 70,
  }));
  assert.equal(repaired.reviewQueue.some((item) => item.id === repairId), false);
  assert.equal(repaired.reviewQueue.some((item) => item.kind === "retention" && item.variantGroup === "changed-family"), true);
  assert.equal(repaired.modules.geometry.evidence.retention.exposures, 0);
});

test("runtime repair registry uses exact response identity and has a safe no-match path", async () => {
  const registry = await registryPromise;
  assert.equal(registry.getRuntimeRepairRule("bli-02", "bli-02-a1").preferredNodeKey, "sb-player-behind");
  assert.equal(registry.getRuntimeRepairRule("bli-02", "not-an-option"), undefined);
  assert.equal(registry.getRuntimeRepairRule("unrelated", "bli-02-a1"), undefined);
});

test("runtime repair registry contains no canonical diagnostic mapping surface", async () => {
  const source = await readFile(new URL("../lib/runtime-repair-registry.ts", import.meta.url), "utf8");
  assert.doesNotMatch(source, /MISCONCEPTION_TAXONOMY|canonicalT1|canonicalMisconception/u);
  assert.doesNotMatch(source, /MC-\d{3}/u);
});

test("warm-up uses at most three cards from already exposed modules", async () => {
  const scheduler = await schedulerPromise;
  const model = await modelPromise;
  const state = model.emptyLearnerState();
  state.updatedAt = new Date(NOW).toISOString();
  state.modules.geometry.contentCompleted = true;
  const plan = scheduler.planDailyTraining(state, catalog, { budget: "warmup", now: NOW, seed: "warm" });
  assert.equal(plan.items[0].kind, "cards");
  assert.deepEqual(plan.items[0].cardIds, ["geo-card"]);
  assert.ok(plan.estimatedMinutes <= 2);
});

test("one-new-mechanism guard blocks another new lesson after recent lesson exposure", async () => {
  const scheduler = await schedulerPromise;
  const model = await modelPromise;
  const state = model.recordDecision(model.emptyLearnerState(), decision({ mode: "lesson", actionOk: true, reasonOk: true, confidence: 60 }));
  state.updatedAt = new Date(NOW).toISOString();
  state.interactions[0].at = new Date(NOW - 60_000).toISOString();
  state.reviewQueue = [];
  state.modules.geometry.contentCompleted = true;
  const plan = scheduler.planDailyTraining(state, catalog, { budget: "30", now: NOW, seed: "guard" });
  assert.equal(plan.items.some((item) => item.kind === "lesson"), false);
});

test("mixed practice spans distinct completed modules when enough material exists", async () => {
  const scheduler = await schedulerPromise;
  const model = await modelPromise;
  const state = model.emptyLearnerState();
  state.updatedAt = new Date(NOW).toISOString();
  for (const moduleId of ["geometry", "preflop", "blinds"]) {
    state.modules[moduleId].contentCompleted = true;
    state.modules[moduleId].evidence.variant_transfer.exposures = 2;
    state.modules[moduleId].evidence.boundary_control.exposures = 1;
  }
  const plan = scheduler.planDailyTraining(state, catalog, { budget: "15", now: NOW, seed: "mixed" });
  const mixed = plan.items.find((item) => item.kind === "mixed");
  assert.ok(mixed);
  assert.equal(new Set(mixed.drillIds.map((id) => id.slice(0, 3))).size >= 3, true);
});

test("long absence bounds backlog without resetting mastery", async () => {
  const scheduler = await schedulerPromise;
  const model = await modelPromise;
  const state = model.emptyLearnerState();
  state.updatedAt = new Date(NOW - 31 * DAY).toISOString();
  state.modules.geometry.contentCompleted = true;
  state.modules.geometry.state = "WORKING";
  for (let index = 0; index < 10; index += 1) state.reviewQueue.push(review({ id: `old-${index}`, dueAt: new Date(NOW - (8 + index) * DAY).toISOString() }));
  const plan = scheduler.planDailyTraining(state, catalog, { budget: "5", now: NOW, seed: "absence" });
  assert.equal(plan.returnAfterBreak, true);
  assert.ok(plan.deferredDueCount >= 8);
  assert.ok(plan.estimatedMinutes <= 6);
  assert.equal(state.modules.geometry.state, "WORKING");
});

test("scheduler works with optional T1 absent and respects prerequisites", async () => {
  const scheduler = await schedulerPromise;
  const model = await modelPromise;
  const state = model.emptyLearnerState();
  state.updatedAt = new Date(NOW).toISOString();
  const plan = scheduler.planDailyTraining(state, catalog, { budget: "15", now: NOW, seed: "no-t1" });
  assert.deepEqual(state.diagnostic.priorityModules, []);
  assert.equal(plan.items.find((item) => item.kind === "lesson")?.moduleId, "geometry");
});
