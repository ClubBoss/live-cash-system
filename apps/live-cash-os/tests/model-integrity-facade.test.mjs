import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import ts from "typescript";

async function loadModel() {
  const source = await readFile(new URL("../lib/model.ts", import.meta.url), "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
      importsNotUsedAsValues: ts.ImportsNotUsedAsValues.Remove,
    },
  }).outputText;
  const directory = await mkdtemp(join(tmpdir(), "live-cash-os-test-"));
  const output = join(directory, "lib-model.mjs");
  await writeFile(output, compiled, "utf8");
  return import(`${new URL(`file://${output}`).href}?${Date.now()}-${Math.random()}`);
}

function decision(overrides = {}) {
  return {
    moduleId: "geometry",
    drillId: "geo-01",
    nodeKey: "mandatory-straddle",
    variantGroup: "denominator",
    mode: "practice",
    actionOk: true,
    reasonOk: true,
    confidence: 80,
    elapsedSeconds: 12,
    targetSeconds: 30,
    isBoundary: false,
    ...overrides,
  };
}

test("rejects UI fallback probes but admits declared and registered probes", async () => {
  const model = await loadModel();
  const ignored = model.recordDecision(model.emptyLearnerState(), decision({
    mode: "mixed",
    transferProbe: {
      isTransferProbe: true,
      variantDistance: "NEAR",
      changedVariables: ["denominator"],
    },
  }));
  assert.equal(ignored.modules.geometry.evidence.variant_transfer.exposures, 0);
  assert.equal(ignored.interactions[0].transferProbe, null);

  const declared = model.recordDecision(model.emptyLearnerState(), decision({
    mode: "mixed",
    transferProbe: {
      isTransferProbe: true,
      variantDistance: "NEAR",
      changedVariables: ["effective_stack", "forced_bet_unit"],
    },
  }));
  assert.equal(declared.modules.geometry.evidence.variant_transfer.exposures, 1);
  assert.deepEqual(declared.interactions[0].transferProbe.changedVariables, ["effective_stack", "forced_bet_unit"]);

  const admitted = model.recordDecision(model.emptyLearnerState(), decision({
    drillId: "geo-04",
    nodeKey: "nominal-100bb",
    variantGroup: "future-spr",
    mode: "mixed",
    isBoundary: true,
  }));
  assert.equal(admitted.modules.geometry.evidence.variant_transfer.exposures, 1);
  assert.deepEqual(admitted.interactions[0].transferProbe.changedVariables, [
    "starting_depth",
    "preflop_pot_size",
    "post_action_spr",
  ]);
});

test("binds a review decision to the active due queue item and advances its staged retrieval", async () => {
  const model = await loadModel();
  const state = model.emptyLearnerState();
  state.reviewQueue.push({
    id: "review-due",
    moduleId: "geometry",
    sourceDrillId: "geo-01",
    variantGroup: "denominator",
    kind: "retention",
    dueAt: "2020-01-01T00:00:00.000Z",
    attempts: 0,
    sourceInteractionId: "source",
  });
  state.activeSession = {
    mode: "review",
    moduleId: "geometry",
    step: 0,
    drillIds: ["geo-02"],
    currentIndex: 0,
    selectedActionId: null,
    selectedReasonId: null,
    confidence: 65,
    startedAt: "2026-08-07T00:00:00.000Z",
    itemStartedAt: "2026-08-07T00:00:00.000Z",
    explainBack: "",
  };

  const next = model.recordDecision(state, decision({
    drillId: "geo-02",
    nodeKey: "pairwise-multiway",
    variantGroup: "pairwise",
    mode: "review",
  }));
  assert.equal(next.modules.geometry.evidence.retention.exposures, 1);
  const staged = next.reviewQueue.find((item) => item.id === "review-due");
  assert.ok(staged);
  assert.equal(staged.kind, "retention");
  assert.equal(staged.variantGroup, "denominator");
  assert.equal(staged.sourceDrillId, "geo-02");
  assert.equal(staged.attempts, 1);
  assert.ok(Date.parse(staged.dueAt) > Date.now());
});

test("resolves a synthetic field repair through a module repair block", async () => {
  const model = await loadModel();
  const state = model.emptyLearnerState();
  state.reviewQueue.push({
    id: "field-repair",
    moduleId: "geometry",
    sourceDrillId: "field:hand-1",
    variantGroup: "field-geometry",
    kind: "repair",
    dueAt: "2020-01-01T00:00:00.000Z",
    attempts: 0,
    sourceInteractionId: "hand-1",
  });
  state.activeSession = {
    mode: "repair",
    moduleId: "geometry",
    step: 0,
    drillIds: ["geo-04"],
    currentIndex: 0,
    selectedActionId: null,
    selectedReasonId: null,
    confidence: 65,
    startedAt: "2026-08-07T00:00:00.000Z",
    itemStartedAt: "2026-08-07T00:00:00.000Z",
    explainBack: "",
  };

  const next = model.recordDecision(state, decision({
    drillId: "geo-04",
    nodeKey: "nominal-100bb",
    variantGroup: "future-spr",
    mode: "repair",
    isBoundary: true,
  }));
  assert.equal(next.reviewQueue.some((item) => item.kind === "repair" && item.sourceDrillId.startsWith("field:")), false);
  assert.equal(next.reviewQueue.some((item) => item.kind === "retention" && item.variantGroup === "field-geometry"), true);
});

test("measures the first T1 item from the actual run start", async () => {
  const model = await loadModel();
  const started = model.startDiagnosticRun(model.emptyLearnerState(), "ru");
  started.diagnostic.startedAt = new Date(Date.now() - 5_000).toISOString();
  const next = model.recordDiagnosticResponse(started, {
    item_id: "LD-001",
    answer: "140 straddle blinds",
    reasoning: "The forced unit prices the tree.",
    confidence: 70,
    time_seconds: 999,
    locale: "ru",
  }, ["LD-001"]);
  assert.ok(next.diagnostic.responses[0].time_seconds >= 4);
  assert.ok(next.diagnostic.responses[0].time_seconds <= 7);
});
