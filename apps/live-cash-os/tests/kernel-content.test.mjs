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
const diagnosticImportPromise = loadTypeScriptModule("lib/diagnostic-import.ts");

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
  const next = model.recordDecision(model.emptyLearnerState(), decision({
    moduleId: "river",
    drillId: "riv-01",
    nodeKey: "before-blocker",
    variantGroup: "river-audit",
    actionOk: false,
    reasonOk: false,
    confidence: 90,
  }));
  assert.equal(next.modules.river.state, "REPAIR_REQUIRED");
  assert.equal(next.modules.geometry.evidence.action_selection.exposures, 0);
  assert.equal(next.reviewQueue.length, 1);
  assert.equal(next.reviewQueue[0].moduleId, "river");
  assert.equal(next.reviewQueue[0].variantGroup, "river-audit");
  assert.equal(next.reviewQueue[0].kind, "repair");
});

test("repair, review and mixed modes do not imply transfer", async () => {
  const model = await modelPromise;
  for (const mode of ["repair", "review", "mixed"]) {
    const next = model.recordDecision(model.emptyLearnerState(), decision({ mode }));
    assert.equal(next.modules.geometry.evidence.variant_transfer.exposures, 0, mode);
    assert.equal(next.interactions[0].transferProbe, null, mode);
  }
});

test("only an explicit changed-node probe creates transfer evidence", async () => {
  const model = await modelPromise;
  const next = model.recordDecision(model.emptyLearnerState(), decision({
    transferProbe: {
      isTransferProbe: true,
      variantDistance: "NEAR",
      changedVariables: ["effective_stack", "forced_bet_unit"],
    },
  }));
  assert.equal(next.modules.geometry.evidence.variant_transfer.exposures, 1);
  assert.equal(next.modules.geometry.evidence.variant_transfer.successes, 1);
  assert.deepEqual(next.interactions[0].transferProbe.changedVariables, ["effective_stack", "forced_bet_unit"]);
});

test("retention requires a due delayed review item", async () => {
  const model = await modelPromise;
  const immediate = model.recordDecision(model.emptyLearnerState(), decision({ mode: "review" }));
  assert.equal(immediate.modules.geometry.evidence.retention.exposures, 0);

  const seeded = model.emptyLearnerState();
  seeded.reviewQueue.push({
    id: "review-due",
    moduleId: "geometry",
    sourceDrillId: "geo-00",
    variantGroup: "denominator",
    kind: "retention",
    dueAt: "2020-01-01T00:00:00.000Z",
    attempts: 0,
    sourceInteractionId: "source",
  });
  const delayed = model.recordDecision(seeded, decision({ mode: "review" }));
  assert.equal(delayed.modules.geometry.evidence.retention.exposures, 1);
  assert.equal(delayed.modules.geometry.evidence.retention.successes, 1);
  assert.equal(delayed.reviewQueue.length, 0);
});

test("content completion does not create mastery", async () => {
  const model = await modelPromise;
  const state = model.completeLesson(model.emptyLearnerState(), "geometry");
  assert.equal(state.modules.geometry.contentCompleted, true);
  assert.equal(state.modules.geometry.state, "INTRODUCED");
  assert.equal(state.modules.geometry.evidence.retention.exposures, 0);
});

test("raw field notes and one reviewed note cannot create field validation", async () => {
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
  assert.notEqual(reviewed.modules.multiway.state, "FIELD_VALIDATED");
});

test("T1 freezes start context and invalidates a contaminated cold run", async () => {
  const model = await modelPromise;
  const cold = model.startDiagnosticRun(model.emptyLearnerState(), "ru");
  assert.equal(cold.diagnostic.measurementContext, "COLD_BASELINE");
  assert.equal(cold.diagnostic.learningExposureAtStart, false);
  assert.equal(cold.diagnostic.localeAtStart, "ru");
  assert.match(cold.diagnostic.runId, /^t1-/u);

  const contaminated = model.completeLesson(cold, "geometry");
  assert.equal(contaminated.diagnostic.measurementContext, "MIXED_EXPOSURE_INVALID_FOR_BASELINE");

  const exposed = model.completeLesson(model.emptyLearnerState(), "geometry");
  const post = model.startDiagnosticRun(exposed, "en");
  assert.equal(post.diagnostic.measurementContext, "POST_LEARNING_DIAGNOSTIC");
  assert.equal(post.diagnostic.learningExposureAtStart, true);
  assert.equal(post.diagnostic.localeAtStart, "en");
});

test("T1 stores each answer locale and rejects duplicates", async () => {
  const model = await modelPromise;
  const started = model.startDiagnosticRun(model.emptyLearnerState(), "ru");
  const response = {
    item_id: "LD-001",
    answer: "140 straddle blinds",
    reasoning: "The forced ten-dollar unit prices the tree.",
    confidence: 70,
    time_seconds: 20,
    locale: "en",
  };
  const once = model.recordDiagnosticResponse(started, response, ["LD-001"]);
  const duplicate = model.recordDiagnosticResponse(once, response, ["LD-001"]);
  assert.equal(once.diagnostic.responses[0].locale, "en");
  assert.equal(once.diagnostic.status, "AWAITING_REVIEW");
  assert.equal(duplicate.diagnostic.responses.length, 1);
});

test("migrates accepted schema-2 state without resetting progress", async () => {
  const model = await modelPromise;
  const legacy = model.emptyLearnerState();
  legacy.appVersion = "1.0.0";
  legacy.contentVersion = "2026.08-wave6";
  legacy.modules.geometry.contentCompleted = true;
  legacy.interactions = [{
    id: "old",
    at: "2026-08-06T10:00:00.000Z",
    moduleId: "geometry",
    drillId: "geo-01",
    nodeKey: "denominator",
    mode: "practice",
    actionOk: true,
    reasonOk: true,
    responseClass: "A",
    confidence: 80,
    elapsedSeconds: 10,
  }];
  legacy.diagnostic = {
    status: "IN_PROGRESS",
    startedAt: "2026-08-06T09:00:00.000Z",
    submittedAt: null,
    responses: [{
      item_id: "LD-001",
      answer: "140",
      reasoning: "straddle unit",
      confidence: 80,
      time_seconds: 10,
    }],
    priorityModules: [],
    importedAt: null,
  };
  const migrated = model.migrateLearnerState(legacy);
  assert.equal(migrated.modules.geometry.contentCompleted, true);
  assert.equal(migrated.interactions.length, 1);
  assert.equal(migrated.interactions[0].transferProbe, null);
  assert.equal(migrated.diagnostic.responses[0].locale, "ru");
  assert.equal(migrated.diagnostic.measurementContext, "MIXED_EXPOSURE_INVALID_FOR_BASELINE");
  assert.equal(migrated.appVersion, "1.2.0");
});

test("keeps deterministic LWW sync semantics without pretending event merge", async () => {
  const model = await modelPromise;
  const older = model.emptyLearnerState();
  older.updatedAt = "2026-08-06T10:00:00.000Z";
  const newer = model.emptyLearnerState();
  newer.updatedAt = "2026-08-06T11:00:00.000Z";
  newer.revision = 4;
  assert.equal(model.mergeLearnerStates(older, newer).revision, 4);
  assert.equal(model.mergeLearnerStates(newer, older).revision, 4);
});

test("strict score import requires exact T1 identity and coverage", async () => {
  const parser = await diagnosticImportPromise;
  const moduleSummary = Object.fromEntries(Array.from({ length: 10 }, (_, index) => [
    `LCM-${String(index + 1).padStart(2, "0")}`,
    { observed_error_rate: index === 9 ? 0.8 : 0.1, exposures: 1, items: [`LD-${String(index + 1).padStart(3, "0")}`] },
  ]));
  const valid = {
    schema_version: "score-0.2",
    scorer_version: "0.2.0",
    learner_id: "current_learner",
    tranche_id: "T1",
    run_id: "t1-abc-123",
    measurement_context: "COLD_BASELINE",
    locale_at_start: "ru",
    submitted_at: "2026-08-07T00:00:00.000Z",
    responses_scored: 10,
    rerank_ready: true,
    module_summary: moduleSummary,
    misconception_evidence: {},
    tentative_priority_order: ["H-GEOMETRY"],
  };
  const parsed = parser.parseDiagnosticScore(valid);
  assert.equal(parsed.run_id, "t1-abc-123");
  assert.deepEqual(parser.deriveDiagnosticPriorityModules(parsed), ["evidence", "geometry"]);

  assert.throws(() => parser.parseDiagnosticScore({ ...valid, run_id: "wrong" }), /run identity/u);
  assert.throws(() => parser.parseDiagnosticScore({ ...valid, unknown: true }), /unknown fields/u);
  const incomplete = structuredClone(valid);
  delete incomplete.module_summary["LCM-10"];
  assert.throws(() => parser.parseDiagnosticScore(incomplete), /exactly LD-001 through LD-010/u);
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
