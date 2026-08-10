import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import ts from "typescript";

async function loadModel() {
  const source = await readFile(new URL("../lib/model-core.ts", import.meta.url), "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
      importsNotUsedAsValues: ts.ImportsNotUsedAsValues.Remove,
    },
  }).outputText;
  const directory = await mkdtemp(join(tmpdir(), "live-cash-os-test-wave-d-completion-"));
  const output = join(directory, "model-core.mjs");
  await writeFile(output, compiled, "utf8");
  return import(`${new URL(`file://${output}`).href}?${Date.now()}-${Math.random()}`);
}

const modelPromise = loadModel();

function lessonSession(now) {
  return {
    mode: "lesson",
    moduleId: "geometry",
    step: 9,
    drillIds: ["geo-perfect-1", "geo-perfect-2", "geo-perfect-3"],
    currentIndex: 2,
    selectedActionId: null,
    selectedReasonId: null,
    confidence: 65,
    startedAt: now,
    itemStartedAt: now,
    explainBack: "A sufficiently long learner explanation that is already saved.",
  };
}

function decision(overrides = {}) {
  return {
    moduleId: "geometry",
    drillId: "geo-perfect-1",
    nodeKey: "geometry:test-node",
    variantGroup: "geometry:test-family",
    mode: "lesson",
    actionOk: true,
    reasonOk: true,
    selectedActionOptionId: "action-ok",
    selectedReasonOptionId: "reason-ok",
    confidence: 70,
    elapsedSeconds: 8,
    targetSeconds: 20,
    isBoundary: false,
    transferProbe: null,
    ...overrides,
  };
}

test("perfect lesson completion clears resume truth without creating fake repair evidence", async () => {
  const model = await modelPromise;
  let state = model.emptyLearnerState();
  const now = new Date().toISOString();
  state = model.saveActiveSession(state, lessonSession(now));
  state = model.recordDecision(state, decision({ drillId: "geo-perfect-1", nodeKey: "geometry:n1", variantGroup: "geometry:f1" }));
  state = model.recordDecision(state, decision({ drillId: "geo-perfect-2", nodeKey: "geometry:n2", variantGroup: "geometry:f2" }));
  state = model.recordDecision(state, decision({ drillId: "geo-perfect-3", nodeKey: "geometry:n3", variantGroup: "geometry:f3" }));
  assert.equal(state.interactions.length, 3);
  assert.ok(state.interactions.every((item) => item.actionOk && item.reasonOk));
  assert.equal(state.reviewQueue.filter((item) => item.kind === "repair").length, 0);
  const completed = model.completeLesson(state, "geometry");
  assert.equal(completed.modules.geometry.contentCompleted, true);
  assert.equal(completed.modules.geometry.lessonStep, 10);
  assert.equal(completed.activeSession, null);
  assert.equal(completed.reviewQueue.filter((item) => item.kind === "repair").length, 0);
  assert.equal(completed.modules.geometry.highConfidenceError, false);
});

test("one actual graded miss creates one repair item but completion still clears the session", async () => {
  const model = await modelPromise;
  let state = model.emptyLearnerState();
  const now = new Date().toISOString();
  state = model.saveActiveSession(state, lessonSession(now));
  state = model.recordDecision(state, decision({
    drillId: "geo-miss",
    nodeKey: "geometry:miss",
    variantGroup: "geometry:miss-family",
    actionOk: false,
    reasonOk: true,
    selectedActionOptionId: "action-wrong",
    confidence: 60,
  }));
  assert.equal(state.reviewQueue.filter((item) => item.kind === "repair").length, 1);
  assert.equal(state.interactions.filter((item) => !item.actionOk || !item.reasonOk).length, 1);
  const completed = model.completeLesson(state, "geometry");
  assert.equal(completed.activeSession, null);
  assert.equal(completed.modules.geometry.contentCompleted, true);
  assert.equal(completed.reviewQueue.filter((item) => item.kind === "repair").length, 1);
  assert.equal(completed.interactions.filter((item) => !item.actionOk || !item.reasonOk).length, 1);
});

test("repeated completion cannot duplicate learner evidence or error evidence", async () => {
  const model = await modelPromise;
  let state = model.emptyLearnerState();
  const now = new Date().toISOString();
  state = model.saveActiveSession(state, lessonSession(now));
  state = model.recordDecision(state, decision({ drillId: "geo-perfect-once" }));
  const first = model.completeLesson(state, "geometry");
  const second = model.completeLesson(first, "geometry");
  assert.equal(second.activeSession, null);
  assert.equal(second.modules.geometry.contentCompleted, true);
  assert.equal(second.modules.geometry.lessonStep, 10);
  assert.deepEqual(second.interactions, first.interactions);
  assert.deepEqual(second.reviewQueue, first.reviewQueue);
  assert.equal(second.reviewQueue.filter((item) => item.kind === "repair").length, 0);
});