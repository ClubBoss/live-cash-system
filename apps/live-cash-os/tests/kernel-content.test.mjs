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
  const state = model.emptyLearnerState();
  const next = model.recordDecision(state, {
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

test("content completion does not create mastery", async () => {
  const model = await modelPromise;
  const state = model.completeLesson(model.emptyLearnerState(), "geometry");
  assert.equal(state.modules.geometry.contentCompleted, true);
  assert.equal(state.modules.geometry.state, "INTRODUCED");
  assert.equal(state.modules.geometry.evidence.retention.exposures, 0);
});

test("raw field notes do not grant field transfer", async () => {
  const model = await modelPromise;
  const initial = model.emptyLearnerState();
  const captured = model.addFieldNote(initial, {
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

test("newer learner state wins deterministic merge", async () => {
  const model = await modelPromise;
  const older = model.emptyLearnerState();
  older.updatedAt = "2026-08-06T10:00:00.000Z";
  const newer = model.emptyLearnerState();
  newer.updatedAt = "2026-08-06T11:00:00.000Z";
  newer.revision = 4;
  assert.equal(model.mergeLearnerStates(older, newer).revision, 4);
  assert.equal(model.mergeLearnerStates(newer, older).revision, 4);
});

test("ships a complete admitted Russian-first module corpus", async () => {
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
