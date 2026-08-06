import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import ts from "typescript";

async function loadTypeScriptModule(relativePath) {
  const source = await readFile(new URL(`../${relativePath}`, import.meta.url), "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
      importsNotUsedAsValues: ts.ImportsNotUsedAsValues.Remove,
    },
  }).outputText;
  const directory = await mkdtemp(join(tmpdir(), "live-cash-os-test-"));
  const output = join(directory, `${relativePath.replaceAll("/", "-").replace(/\.ts$/, "")}.mjs`);
  await writeFile(output, compiled, "utf8");
  return import(`${new URL(`file://${output}`).href}?${Date.now()}-${Math.random()}`);
}

const modelPromise = loadTypeScriptModule("lib/model.ts");
const contentPromise = loadTypeScriptModule("content/modules.ts");

test("uses canonical response-class semantics", async () => {
  const model = await modelPromise;
  assert.equal(model.classifyResponse(true, true), "A");
  assert.equal(model.classifyResponse(false, true), "B");
  assert.equal(model.classifyResponse(true, false), "C");
  assert.equal(model.classifyResponse(false, false), "D");
});

test("initialises nine separate evidence dimensions per module", async () => {
  const model = await modelPromise;
  const state = model.emptyLearnerState();
  assert.equal(Object.keys(state.modules.geometry.evidence).length, 9);
  assert.equal(state.modules.river.state, "UNEXPOSED");
  assert.equal(state.modules.river.evidence.field_transfer.exposures, 0);
});

test("keeps evidence local to the tested module and queues same-skill repair", async () => {
  const model = await modelPromise;
  const next = model.recordDecision(model.emptyLearnerState(), {
    moduleId: "river",
    drillId: "riv-01",
    nodeKey: "before-blocker",
    variantGroup: "river-audit",
    mode: "practice",
    actionOk: false,
    reasonOk: false,
    confidence: 90,
    elapsedSeconds: 15,
    targetSeconds: 35,
    isBoundary: false,
  });
  assert.equal(next.modules.river.state, "REPAIR_REQUIRED");
  assert.equal(next.modules.geometry.evidence.action_selection.exposures, 0);
  assert.equal(next.reviewQueue.length, 1);
  assert.equal(next.reviewQueue[0].moduleId, "river");
  assert.equal(next.reviewQueue[0].variantGroup, "river-audit");
  assert.equal(next.reviewQueue[0].kind, "repair");
});

test("repair mode alone does not create variant-transfer evidence", async () => {
  const model = await modelPromise;
  const state = model.recordDecision(model.emptyLearnerState(), {
    moduleId: "geometry",
    drillId: "geo-01",
    nodeKey: "mandatory-straddle",
    variantGroup: "denominator",
    mode: "repair",
    actionOk: true,
    reasonOk: true,
    confidence: 80,
    elapsedSeconds: 12,
    targetSeconds: 30,
    isBoundary: false,
  });
  assert.equal(state.modules.geometry.evidence.variant_transfer.exposures, 0);
});

test("an explicit changed-node probe creates variant-transfer evidence", async () => {
  const model = await modelPromise;
  const state = model.recordDecision(model.emptyLearnerState(), {
    moduleId: "geometry",
    drillId: "geo-02",
    nodeKey: "pairwise-multiway",
    variantGroup: "pairwise",
    mode: "practice",
    actionOk: true,
    reasonOk: true,
    confidence: 80,
    elapsedSeconds: 12,
    targetSeconds: 30,
    isBoundary: false,
    transferProbe: { isTransferProbe: true, variantDistance: "NEAR", changedVariables: ["players", "effective_stack"] },
  });
  assert.equal(state.modules.geometry.evidence.variant_transfer.exposures, 1);
  assert.equal(state.modules.geometry.evidence.variant_transfer.successes, 1);
});

test("content completion does not create mastery", async () => {
  const model = await modelPromise;
  const state = model.completeLesson(model.emptyLearnerState(), "geometry");
  assert.equal(state.modules.geometry.contentCompleted, true);
  assert.equal(state.modules.geometry.state, "INTRODUCED");
  assert.equal(state.modules.geometry.evidence.retention.exposures, 0);
});

test("raw field notes do not grant field transfer", async () => {
  const model = await modelPromise;
  const captured = model.addFieldNote(model.emptyLearnerState(), {
    moduleId: "multiway",
    cue: "Player remained behind",
    action: "Called",
    reason: "Shared defence",
    cueBeforeAction: true,
  });
  assert.equal(captured.modules.multiway.evidence.field_transfer.exposures, 0);
  const reviewed = model.reviewFieldNote(captured, captured.fieldNotes[0].id, "REVIEWED_VALID", "Reasoning matches the mechanism.");
  assert.equal(reviewed.modules.multiway.evidence.field_transfer.exposures, 1);
  assert.equal(reviewed.modules.multiway.evidence.field_transfer.successes, 1);
});

test("T1 measurement context is fixed when the run starts", async () => {
  const model = await modelPromise;
  const cold = model.startDiagnosticRun(model.emptyLearnerState(), "ru");
  assert.equal(cold.diagnostic.measurementContext, "COLD_BASELINE");
  assert.equal(cold.diagnostic.localeAtStart, "ru");
  const contaminated = model.completeLesson(cold, "geometry");
  assert.equal(contaminated.diagnostic.measurementContext, "MIXED_EXPOSURE_INVALID_FOR_BASELINE");
});

test("T1 stores the locale of every answer", async () => {
  const model = await modelPromise;
  const started = model.startDiagnosticRun(model.emptyLearnerState(), "ru");
  const next = model.recordDiagnosticResponse(started, {
    item_id: "LD-001",
    answer: "140 straddle blinds",
    reasoning: "The forced ten-dollar unit prices the tree.",
    confidence: 70,
    time_seconds: 20,
    locale: "en",
  }, ["LD-001"]);
  assert.equal(next.diagnostic.responses[0].locale, "en");
  assert.equal(next.diagnostic.status, "AWAITING_REVIEW");
});

test("entity merge preserves independent interactions and field notes", async () => {
  const model = await modelPromise;
  const localBase = model.emptyLearnerState();
  const local = model.addFieldNote(localBase, { moduleId: "geometry", cue: "SPR", action: "Called", reason: "Low SPR", cueBeforeAction: true });
  local.updatedAt = "2026-08-06T11:00:00.000Z";
  const remote = model.recordDecision(model.emptyLearnerState(), {
    moduleId: "river",
    drillId: "riv-01",
    nodeKey: "before-blocker",
    variantGroup: "river-audit",
    mode: "practice",
    actionOk: true,
    reasonOk: true,
    confidence: 70,
    elapsedSeconds: 20,
    targetSeconds: 35,
    isBoundary: false,
  });
  remote.updatedAt = "2026-08-06T10:00:00.000Z";
  const merged = model.mergeLearnerStates(local, remote);
  assert.equal(merged.fieldNotes.length, 1);
  assert.equal(merged.interactions.length, 1);
  assert.ok(merged.revision > Math.max(local.revision, remote.revision));
});

test("ships one runtime-deliverable corpus with stable IDs", async () => {
  const content = await contentPromise;
  assert.equal(content.modules.length, 11);
  assert.equal(content.allDrills.length, 55);
  assert.equal(content.allCards.length, 33);
  assert.equal(new Set(content.allDrills.map((item) => item.id)).size, 55);
  assert.equal(new Set(content.allCards.map((item) => item.id)).size, 33);

  for (const module of content.modules) {
    assert.equal(module.admission, "ADMITTED");
    assert.equal(module.drills.length, 5, `${module.id}: drill count`);
    assert.equal(module.flashcards.length, 3, `${module.id}: card count`);
    assert.equal(module.heuristics.length, 3, `${module.id}: heuristic count`);
    assert.ok(module.decisionTree.length >= 4, `${module.id}: decision tree`);
    assert.ok(module.theory.length >= 3, `${module.id}: theory`);
    assert.ok(module.tableCard.length >= 4, `${module.id}: table card`);
    assert.ok(module.explainBackPrompt.length >= 20, `${module.id}: explain-back`);
  }
});

test("uses plausible mapped distractors instead of global filler", async () => {
  const content = await contentPromise;
  const banned = [
    "Choose the strongest made hand",
    "Apply a universal population rule",
    "It removes all difficult turns",
    "It always increases immediate equity",
  ];
  for (const drill of content.allDrills) {
    for (const option of [...drill.actionOptions, ...drill.reasonOptions]) {
      assert.ok(!banned.includes(option.text), `${drill.id}: banned generic distractor`);
      if (option.id !== drill.correctActionId && option.id !== drill.correctReasonId) {
        assert.match(option.misconceptionId ?? "", /^MC-\d{3}$/u, `${drill.id}: mapped misconception`);
      }
    }
  }
});

test("LCM-01 contains the gold teaching contract and real SPR lab", async () => {
  const content = await contentPromise;
  const geometry = content.moduleById.geometry;
  assert.equal(geometry.lab.type, "spr");
  assert.match(geometry.plainGoal, /сколько|реально|решени/u);
  assert.match(geometry.tableCue, /эффективный|банк/u);
  assert.ok(geometry.workedExample.steps.length >= 3);
  assert.ok(geometry.counterexample.length >= 40);
  assert.ok(geometry.glossary.some((item) => item.term === "SPR"));
});
