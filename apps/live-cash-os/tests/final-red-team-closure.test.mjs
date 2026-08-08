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
  const directory = await mkdtemp(join(tmpdir(), "live-cash-os-final-red-team-"));
  const output = join(directory, filename);
  await writeFile(output, compiled, "utf8");
  return import(`${new URL(`file://${output}`).href}?${Date.now()}-${Math.random()}`);
}

const loadModel = () => loadTsModule("../lib/model.ts", "model.mjs");
const loadReliability = () => loadTsModule("../lib/reliability.ts", "reliability.mjs");

function decision(overrides = {}) {
  return {
    moduleId: "geometry",
    drillId: "geo-02",
    nodeKey: "pairwise-multiway",
    variantGroup: "pairwise",
    mode: "review",
    actionOk: true,
    reasonOk: true,
    confidence: 75,
    elapsedSeconds: 12,
    targetSeconds: 30,
    isBoundary: false,
    ...overrides,
  };
}

function reviewItem(id, overrides = {}) {
  return {
    id,
    moduleId: "geometry",
    sourceDrillId: "geo-01",
    variantGroup: `group-${id}`,
    kind: "retention",
    dueAt: "2020-01-01T00:00:00.000Z",
    attempts: 0,
    sourceInteractionId: `source-${id}`,
    ...overrides,
  };
}

function session(mode, sourceReviewId) {
  return {
    mode,
    moduleId: "geometry",
    step: 0,
    drillIds: ["geo-02"],
    currentIndex: 0,
    selectedActionId: null,
    selectedReasonId: null,
    confidence: 65,
    startedAt: "2026-08-09T00:00:00.000Z",
    itemStartedAt: "2026-08-09T00:00:00.000Z",
    explainBack: "",
    ...(sourceReviewId === undefined ? {} : { sourceReviewId }),
  };
}

test("two due retentions plus an explicit stale id mutate nothing", async () => {
  const model = await loadModel();
  const state = model.emptyLearnerState();
  state.reviewQueue.push(reviewItem("ret-a"), reviewItem("ret-b"));
  state.activeSession = session("review", "ret-stale");
  const before = structuredClone(state);

  const next = model.recordDecision(state, decision({ sourceReviewId: "ret-stale" }));
  assert.deepEqual(next, before);
  assert.equal(next.interactions.length, 0);
  assert.equal(next.modules.geometry.evidence.retention.exposures, 0);
});

test("explicit live retention mutates only the named due item", async () => {
  const model = await loadModel();
  const state = model.emptyLearnerState();
  state.reviewQueue.push(reviewItem("ret-a"), reviewItem("ret-b"));
  state.activeSession = session("review", "ret-b");
  const untouched = structuredClone(state.reviewQueue[0]);

  const next = model.recordDecision(state, decision());
  assert.deepEqual(next.reviewQueue.find((item) => item.id === "ret-a"), untouched);
  const target = next.reviewQueue.find((item) => item.id === "ret-b");
  assert.ok(target);
  assert.equal(target.attempts, 1);
  assert.equal(target.sourceDrillId, "geo-02");
  assert.ok(Date.parse(target.dueAt) > Date.now());
  assert.equal(next.modules.geometry.evidence.retention.exposures, 1);
});

test("no explicit retention id preserves the documented first-due fallback", async () => {
  const model = await loadModel();
  const state = model.emptyLearnerState();
  state.reviewQueue.push(
    reviewItem("ret-first", { dueAt: "2019-01-01T00:00:00.000Z" }),
    reviewItem("ret-second", { dueAt: "2020-01-01T00:00:00.000Z" }),
  );
  state.activeSession = session("review");

  const next = model.recordDecision(state, decision({ variantGroup: "unrelated-input-group" }));
  const first = next.reviewQueue.find((item) => item.id === "ret-first");
  const second = next.reviewQueue.find((item) => item.id === "ret-second");
  assert.ok(first);
  assert.equal(first.attempts, 1);
  assert.equal(second.attempts, 0);
});

test("queue race after session open cannot credit the neighbouring retention", async () => {
  const model = await loadModel();
  const state = model.emptyLearnerState();
  state.activeSession = session("review", "ret-opened");
  state.reviewQueue.push(reviewItem("ret-neighbour"));
  const before = structuredClone(state);

  const next = model.recordDecision(state, decision());
  assert.deepEqual(next, before);
  assert.equal(next.reviewQueue[0].attempts, 0);
  assert.equal(next.modules.geometry.evidence.retention.exposures, 0);
});

test("explicit retention id from another module is a no-op", async () => {
  const model = await loadModel();
  const state = model.emptyLearnerState();
  state.reviewQueue.push(reviewItem("ret-preflop", { moduleId: "preflop" }));
  state.activeSession = session("review", "ret-preflop");
  const before = structuredClone(state);

  const next = model.recordDecision(state, decision());
  assert.deepEqual(next, before);
});

test("stale explicit repair id cannot mutate a neighbouring repair or enqueue retention", async () => {
  const model = await loadModel();
  const state = model.emptyLearnerState();
  state.reviewQueue.push(reviewItem("repair-live", {
    kind: "repair",
    sourceDrillId: "field:hand-live",
    variantGroup: "field-geometry",
  }));
  state.activeSession = session("repair", "repair-stale");
  const before = structuredClone(state);

  const next = model.recordDecision(state, decision({ mode: "repair", sourceReviewId: "repair-stale" }));
  assert.deepEqual(next, before);
  assert.equal(next.interactions.length, 0);
});

test("schema-v2 validator rejects malformed runtime-used persisted structures", async () => {
  const model = await loadModel();
  const valid = model.emptyLearnerState();
  assert.equal(model.validateLearnerState(valid), true);

  const badSession = structuredClone(valid);
  badSession.activeSession = {};
  assert.equal(model.validateLearnerState(badSession), false);

  const badReview = structuredClone(valid);
  badReview.reviewQueue.push(reviewItem("bad-review", { dueAt: "not-a-date" }));
  assert.equal(model.validateLearnerState(badReview), false);

  const badCard = structuredClone(valid);
  badCard.cards["card-1"] = { dueAt: "2026-08-09T00:00:00.000Z", intervalDays: -1, repetitions: 2, lapses: 0, lastGrade: 4 };
  assert.equal(model.validateLearnerState(badCard), false);

  const badField = structuredClone(valid);
  badField.fieldNotes.push({
    id: "field-bad", at: "2026-08-09T00:00:00.000Z", moduleId: "geometry", cue: "cue", action: "call", reason: "reason",
    cueBeforeAction: true, status: "PENDING_REVIEW", evaluatorNote: "", confidence: "high",
  });
  assert.equal(model.validateLearnerState(badField), false);

  const badExplain = structuredClone(valid);
  badExplain.explainBackRecords = [{
    id: "explain-bad", at: "2026-08-09T00:00:00.000Z", moduleId: "geometry", promptKey: "geometry.explain",
    text: "A valid-looking explanation body.", status: "PENDING_REVIEW", reviewerNote: 42,
  }];
  assert.equal(model.validateLearnerState(badExplain), false);
});

test("valid historical schema-v2 and current Wave7 extensions still validate", async () => {
  const model = await loadModel();
  const historical = model.emptyLearnerState();
  historical.reviewQueue.push(reviewItem("ret-valid"));
  historical.cards["card-valid"] = {
    dueAt: "2026-08-10T00:00:00.000Z", intervalDays: 2, repetitions: 3, lapses: 1, lastGrade: 2,
  };
  historical.fieldNotes.push({
    id: "field-historical", at: "2026-08-08T00:00:00.000Z", moduleId: "geometry", cue: "cue", action: "call", reason: "reason",
    cueBeforeAction: false, status: "PENDING_REVIEW", evaluatorNote: "",
  });
  assert.equal(model.validateLearnerState(historical), true);

  const current = structuredClone(historical);
  current.activeSession = session("review", "ret-valid");
  current.explainBackRecords = [{
    id: "explain-current", at: "2026-08-09T00:00:00.000Z", moduleId: "geometry", promptKey: "geometry.explain",
    text: "A sufficiently long current learner explanation.", status: "REVIEWED_OK", reviewerNote: "Reviewed by a person.",
    reviewedAt: "2026-08-09T00:05:00.000Z",
  }];
  current.fieldNotes.push({
    id: "field-current", at: "2026-08-09T00:00:00.000Z", moduleId: "geometry", cue: "cue", action: "call", reason: "reason",
    cueBeforeAction: true, status: "REVIEWED_VALID", evaluatorNote: "Separate review completed.", stakes: "2/5",
    heroPosition: "BB", villainPositions: "BTN", effectiveStacks: "150bb", straddle: "none", actionSequence: "BTN opens, BB calls",
    board: "Qh 7d 4c", sizings: "25%", confidence: 70, populationRead: "small flop bet", populationReadConfidence: 55,
    decisionLockedAt: "2026-08-09T00:00:00.000Z", result: "call won", showdown: "none", resultAddedAt: "2026-08-09T00:02:00.000Z",
    reviewOutcome: "SUPPORTS_TRANSFER", reviewerKind: "HUMAN_ASSISTED", reviewedAt: "2026-08-09T00:05:00.000Z",
  });
  current.diagnostic.review = {
    reviewerKind: "HUMAN",
    reviewedAt: "2026-08-09T00:10:00.000Z",
    itemReviews: [{ itemId: "LD-001", responseClass: "A", reviewerNote: "clear" }],
  };
  assert.equal(model.validateLearnerState(current), true);
});

test("malformed nested schema-v2 import remains fail-closed", async () => {
  const [model, reliability] = await Promise.all([loadModel(), loadReliability()]);
  const current = model.emptyLearnerState();
  current.modules.geometry.contentCompleted = true;
  const before = structuredClone(current);
  const incoming = structuredClone(current);
  incoming.activeSession = {};

  const prepared = reliability.prepareLearnerStateImport(JSON.stringify(incoming), current);
  assert.equal(prepared.ok, false);
  assert.equal(prepared.reason, "invalid_state");
  assert.deepEqual(current, before);
});

test("cloud POST keeps the shared deep validator ahead of persistence", async () => {
  const route = await readFile(new URL("../app/api/state/route.ts", import.meta.url), "utf8");
  assert.match(route, /const rawState = "state" in payload \? payload\.state : null/);
  assert.match(route, /if \(!validateLearnerState\(rawState\)\) \{[\s\S]*code: "INVALID_STATE"[\s\S]*\}/);
  assert.ok(route.indexOf("validateLearnerState(rawState)") < route.indexOf("assessCloudWrite("));
});

test("learner-facing Wave7 copy does not expose reviewer or transfer enum labels", async () => {
  const source = await readFile(new URL("../components/Wave7Experience.tsx", import.meta.url), "utf8");
  assert.match(source, /reviewerSelf: "Самопроверка"/);
  assert.match(source, /reviewerHuman: "Разбор с человеком"/);
  assert.match(source, /reviewerAssisted: "Разбор с человеком и инструментом"/);
  assert.match(source, /supportTransfer: "Подтверждает перенос в реальную игру"/);
  assert.match(source, /reviewerSelf: "Self-review"/);
  assert.match(source, /reviewerHuman: "Human review"/);
  assert.match(source, /reviewerAssisted: "Human review with a tool"/);
  assert.match(source, /supportTransfer: "Supports real-table transfer"/);

  for (const leaked of [
    'selfReviewTitle: "SELF',
    'reviewerSelf: "SELF ·',
    'reviewerHuman: "HUMAN ·',
    'reviewerAssisted: "HUMAN_ASSISTED ·',
    "SUPPORTS_TRANSFER доступен",
    "SUPPORTS_TRANSFER is available",
  ]) assert.equal(source.includes(leaked), false, `learner copy leaked ${leaked}`);
});
