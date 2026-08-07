import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import ts from "typescript";

async function loadTsModule(relativePath, filename) {
  const source = await readFile(new URL(relativePath, import.meta.url), "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
      importsNotUsedAsValues: ts.ImportsNotUsedAsValues.Remove,
    },
  }).outputText;
  const directory = await mkdtemp(join(tmpdir(), "live-cash-os-test-"));
  const output = join(directory, filename);
  await writeFile(output, compiled, "utf8");
  return import(`${new URL(`file://${output}`).href}?${Date.now()}-${Math.random()}`);
}

const loadCore = () => loadTsModule("../lib/model-core.ts", "model-core.mjs");
const loadReliability = () => loadTsModule("../lib/reliability.ts", "reliability.mjs");
const loadCloudContract = () => loadTsModule("../lib/cloud-sync-contract.ts", "cloud-sync-contract.mjs");

function meaningfulState(core) {
  const state = core.emptyLearnerState();
  state.modules.geometry.contentCompleted = true;
  state.modules.geometry.lessonStep = 10;
  state.modules.geometry.completedBlocks = 1;
  state.revision = 4;
  state.updatedAt = "2026-08-07T12:00:00.000Z";
  return state;
}

function interaction(id, overrides = {}) {
  return {
    id,
    at: "2026-08-07T12:05:00.000Z",
    moduleId: "geometry",
    drillId: "geo-01",
    nodeKey: "n1",
    variantGroup: "vg",
    mode: "practice",
    actionOk: true,
    reasonOk: true,
    responseClass: "A",
    confidence: 80,
    elapsedSeconds: 10,
    transferProbe: null,
    ...overrides,
  };
}

test("fresh local storage never beats meaningful cloud state", async () => {
  const [core, reliability] = await Promise.all([loadCore(), loadReliability()]);
  const remote = meaningfulState(core);
  const decision = reliability.chooseRestoreState(reliability.readLocalLearnerState(null), remote);
  assert.equal(decision.kind, "remote");
  assert.equal(decision.state.revision, 4);
  assert.equal(decision.state.modules.geometry.contentCompleted, true);
});

test("precedence uses safe ancestry, not timestamps", async () => {
  const [core, reliability] = await Promise.all([loadCore(), loadReliability()]);
  const remote = meaningfulState(core);
  const local = structuredClone(remote);
  local.revision = 5;
  local.updatedAt = "2020-01-01T00:00:00.000Z";
  local.modules.geometry.completedBlocks = 2;
  const read = { kind: "valid", state: local, raw: JSON.stringify(local) };
  const decision = reliability.chooseRestoreState(read, remote);
  assert.equal(decision.kind, "local");
  assert.equal(decision.state.revision, 5);
});

test("divergent meaningful histories become a conflict instead of silent LWW", async () => {
  const [core, reliability] = await Promise.all([loadCore(), loadReliability()]);
  const local = meaningfulState(core);
  const remote = meaningfulState(core);
  local.interactions.push(interaction("local-only"));
  remote.interactions.push(interaction("remote-only", { drillId: "geo-02", nodeKey: "n2", variantGroup: "vg2", actionOk: true, reasonOk: false, responseClass: "C" }));
  local.revision = 6;
  remote.revision = 6;
  local.updatedAt = "2030-01-01T00:00:00.000Z";
  remote.updatedAt = "2020-01-01T00:00:00.000Z";
  const decision = reliability.chooseRestoreState({ kind: "valid", state: local, raw: JSON.stringify(local) }, remote);
  assert.equal(decision.kind, "conflict");
  assert.equal(decision.state.interactions.some((row) => row.id === "local-only"), true);
  assert.equal(decision.remoteState.interactions.some((row) => row.id === "remote-only"), true);
});

test("future local schema is refused without destructive downgrade", async () => {
  const reliability = await loadReliability();
  const read = reliability.readLocalLearnerState(JSON.stringify({ schemaVersion: 99, revision: 999, modules: {} }));
  assert.equal(read.kind, "future");
  assert.equal(read.state, null);
  assert.match(read.reason, /newer than supported/);
});

test("supported legacy state migrates", async () => {
  const reliability = await loadReliability();
  const read = reliability.readLocalLearnerState(JSON.stringify({ completed: 5, history: [{ id: 1 }], dimension: { action: 80 } }));
  assert.equal(read.kind, "migrated");
  assert.equal(read.state.schemaVersion, 2);
  assert.equal(read.state.modules.geometry.contentCompleted, true);
});

test("malformed current-schema import fails closed and cannot mutate current state", async () => {
  const [core, reliability] = await Promise.all([loadCore(), loadReliability()]);
  const current = meaningfulState(core);
  const before = JSON.stringify(current);
  const prepared = reliability.prepareLearnerStateImport(JSON.stringify({ schemaVersion: 2, revision: 999, updatedAt: "x" }), current);
  assert.equal(prepared.ok, false);
  assert.equal(prepared.reason, "invalid_state");
  assert.equal(JSON.stringify(current), before);
});

test("future-schema import fails closed", async () => {
  const [core, reliability] = await Promise.all([loadCore(), loadReliability()]);
  const prepared = reliability.prepareLearnerStateImport(JSON.stringify({ schemaVersion: 3 }), core.emptyLearnerState());
  assert.equal(prepared.ok, false);
  assert.equal(prepared.reason, "unsupported_future_schema");
});

test("W7 explain-back and structured field data survive normal schema-v2 persistence", async () => {
  const [core, reliability] = await Promise.all([loadCore(), loadReliability()]);
  const state = meaningfulState(core);
  state.explainBackRecords = [{
    id: "explain-1", at: "2026-08-07T12:02:00.000Z", moduleId: "geometry", promptKey: "geometry.explainBack",
    text: "A sufficiently long learner explanation that must survive persistence.", status: "PENDING_REVIEW", reviewerNote: "",
  }];
  state.fieldNotes.push({
    id: "field-1", at: "2026-08-07T12:03:00.000Z", moduleId: "geometry", cue: "straddle", action: "call", reason: "effective depth",
    cueBeforeAction: true, status: "PENDING_REVIEW", evaluatorNote: "", stakes: "2/5/10", heroPosition: "BTN",
    villainPositions: "SB", effectiveStacks: "140 straddles", straddle: "10", actionSequence: "open/call", board: "preflop",
    sizings: "30", confidence: 70, decisionLockedAt: "2026-08-07T12:03:00.000Z",
  });
  const read = reliability.readLocalLearnerState(JSON.stringify(state));
  assert.equal(read.kind, "valid");
  assert.equal(read.state.explainBackRecords[0].text, state.explainBackRecords[0].text);
  assert.equal(read.state.fieldNotes[0].stakes, "2/5/10");
  assert.equal(read.state.fieldNotes[0].status, "PENDING_REVIEW");
  assert.equal(read.state.modules.geometry.evidence.field_transfer.successes, 0);
});

test("cloud contract makes identical retry idempotent", async () => {
  const [core, cloud] = await Promise.all([loadCore(), loadCloudContract()]);
  const existing = meaningfulState(core);
  assert.deepEqual(cloud.assessCloudWrite(existing, structuredClone(existing), 0, null, "cloud-1"), { kind: "idempotent" });
});

test("cloud contract accepts exact opaque-token CAS advance and rejects stale divergent device", async () => {
  const [core, cloud] = await Promise.all([loadCore(), loadCloudContract()]);
  const base = meaningfulState(core);
  const exactAdvance = structuredClone(base);
  exactAdvance.revision += 1;
  exactAdvance.updatedAt = "2026-08-07T12:04:00.000Z";
  exactAdvance.modules.geometry.completedBlocks += 1;
  assert.equal(cloud.assessCloudWrite(base, exactAdvance, base.revision, "cloud-1", "cloud-1").kind, "accept");

  const cloudAfterOtherDevice = structuredClone(base);
  cloudAfterOtherDevice.revision = 5;
  cloudAfterOtherDevice.interactions.push(interaction("other-device"));
  const staleDevice = structuredClone(base);
  staleDevice.revision = 5;
  staleDevice.interactions.push(interaction("stale-device", { drillId: "geo-03", nodeKey: "n3", variantGroup: "vg3", actionOk: false, reasonOk: false, responseClass: "D", confidence: 90 }));
  assert.equal(cloud.assessCloudWrite(cloudAfterOtherDevice, staleDevice, base.revision, "cloud-1", "cloud-2").kind, "conflict");
});

test("same learner timestamp does not bypass an opaque cloud token", async () => {
  const [core, cloud] = await Promise.all([loadCore(), loadCloudContract()]);
  const firstWriter = meaningfulState(core);
  firstWriter.revision = 5;
  firstWriter.interactions.push(interaction("first"));
  const staleSecondWriter = meaningfulState(core);
  staleSecondWriter.revision = 5;
  staleSecondWriter.updatedAt = firstWriter.updatedAt;
  staleSecondWriter.interactions.push(interaction("second", { drillId: "geo-02", nodeKey: "n2", variantGroup: "vg2", actionOk: false, reasonOk: true, responseClass: "B", confidence: 75 }));
  assert.equal(cloud.assessCloudWrite(firstWriter, staleSecondWriter, 4, "cloud-before-first", "cloud-after-first").kind, "conflict");
});

test("safe debug summary excludes learner prose", async () => {
  const [core, reliability] = await Promise.all([loadCore(), loadReliability()]);
  const state = meaningfulState(core);
  state.fieldNotes.push({ id: "field-secret", at: "2026-08-07T12:00:00.000Z", moduleId: "geometry", cue: "SECRET_CUE", action: "SECRET_ACTION", reason: "SECRET_REASON", cueBeforeAction: true, status: "PENDING_REVIEW", evaluatorNote: "" });
  const summary = reliability.buildSafeDebugSummary({ state, locale: "ru", syncStatus: "synced", cloudMode: "cloud", lastLocalSaveAt: null, lastCloudSaveAt: null, route: "today", online: true });
  const text = JSON.stringify(summary);
  assert.equal(text.includes("SECRET_CUE"), false);
  assert.equal(text.includes("SECRET_ACTION"), false);
  assert.equal(text.includes("SECRET_REASON"), false);
  assert.equal(summary.stateRevision, state.revision);
});
