import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { diagnosticT1 } from "../content/diagnostic.ts";
import { applyLocaleData } from "../content/i18n/locale-pipeline.ts";
import { diagnosticEnglish } from "../content/i18n/runtime.ts";
import { moduleById } from "../content/modules.ts";
import { selectRetentionDrillId } from "../lib/automaticity.ts";
import { emptyLearnerState, recordDecision } from "../lib/model.ts";
import { selectLessonDrillIds } from "../lib/retrieval-integrity.ts";

const DAY = 86_400_000;
const T0 = Date.parse("2026-08-10T12:00:00.000Z");

function geoDecision(overrides = {}) {
  return {
    moduleId: "geometry",
    drillId: "geo-04",
    nodeKey: "nominal-100bb",
    variantGroup: "future-spr",
    mode: "practice",
    actionOk: true,
    reasonOk: true,
    selectedActionOptionId: "action-ok",
    selectedReasonOptionId: "reason-ok",
    confidence: 70,
    elapsedSeconds: 12,
    targetSeconds: 25,
    isBoundary: true,
    ...overrides,
  };
}

function enableClock(t, now = T0) {
  t.mock.timers.enable({ apis: ["Date"], now });
}

test("cued lesson, practice and repair do not create independent transfer evidence", (t) => {
  enableClock(t);
  for (const mode of ["lesson", "practice"]) {
    const state = recordDecision(emptyLearnerState(), geoDecision({ mode }));
    assert.equal(state.modules.geometry.evidence.variant_transfer.exposures, 0, mode);
    assert.equal(state.modules.geometry.evidence.variant_transfer.successes, 0, mode);
  }

  let repairState = recordDecision(emptyLearnerState(), geoDecision({
    actionOk: false,
    reasonOk: true,
    selectedActionOptionId: "action-wrong",
  }));
  const repair = repairState.reviewQueue.find((item) => item.kind === "repair");
  assert.ok(repair);
  repairState = recordDecision(repairState, geoDecision({
    drillId: "geo-05",
    nodeKey: "nominal-400bb-compressed",
    mode: "repair",
    sourceReviewId: repair.id,
  }));
  assert.equal(repairState.modules.geometry.evidence.variant_transfer.exposures, 0);
  assert.equal(repairState.modules.geometry.evidence.variant_transfer.successes, 0);
});

test("concealed mixed retrieval still creates admitted transfer evidence", (t) => {
  enableClock(t);
  const state = recordDecision(emptyLearnerState(), geoDecision({ mode: "mixed" }));
  assert.equal(state.modules.geometry.evidence.variant_transfer.exposures, 1);
  assert.equal(state.modules.geometry.evidence.variant_transfer.successes, 1);
});

test("non-identical delayed review can create retention and admitted transfer evidence", (t) => {
  enableClock(t);
  let state = recordDecision(emptyLearnerState(), geoDecision());
  const review = state.reviewQueue.find((item) => item.kind === "retention");
  assert.ok(review);

  t.mock.timers.setTime(T0 + DAY);
  state = recordDecision(state, geoDecision({
    drillId: "geo-05",
    nodeKey: "nominal-400bb-compressed",
    mode: "review",
    sourceReviewId: review.id,
  }));

  assert.equal(state.modules.geometry.evidence.retention.exposures, 1);
  assert.equal(state.modules.geometry.evidence.retention.successes, 1);
  assert.equal(state.modules.geometry.evidence.variant_transfer.exposures, 1);
  assert.equal(state.modules.geometry.evidence.variant_transfer.successes, 1);
});

test("exact delayed repeat is maintenance, keeps its stage, and does not create strong evidence", (t) => {
  enableClock(t);
  let state = recordDecision(emptyLearnerState(), geoDecision());
  const review = state.reviewQueue.find((item) => item.kind === "retention");
  assert.ok(review);

  t.mock.timers.setTime(T0 + DAY);
  state = recordDecision(state, geoDecision({
    mode: "review",
    sourceReviewId: review.id,
  }));

  assert.equal(state.modules.geometry.evidence.retention.exposures, 0);
  assert.equal(state.modules.geometry.evidence.retention.successes, 0);
  assert.equal(state.modules.geometry.evidence.variant_transfer.exposures, 0);
  assert.equal(state.modules.geometry.evidence.variant_transfer.successes, 0);
  const retry = state.reviewQueue.find((item) => item.id === review.id && item.kind === "retention");
  assert.ok(retry);
  assert.equal(retry.attempts, review.attempts);
  assert.equal(Date.parse(retry.dueAt), T0 + 2 * DAY);
});

test("exact maintenance does not dead-end a later non-identical retention proof", (t) => {
  enableClock(t);
  let state = recordDecision(emptyLearnerState(), geoDecision());
  const review = state.reviewQueue.find((item) => item.kind === "retention");
  assert.ok(review);

  t.mock.timers.setTime(T0 + DAY);
  state = recordDecision(state, geoDecision({ mode: "review", sourceReviewId: review.id }));
  const retry = state.reviewQueue.find((item) => item.id === review.id && item.kind === "retention");
  assert.ok(retry);
  assert.equal(retry.attempts, 0);

  t.mock.timers.setTime(T0 + 2 * DAY);
  state = recordDecision(state, geoDecision({
    drillId: "geo-05",
    nodeKey: "nominal-400bb-compressed",
    mode: "review",
    sourceReviewId: retry.id,
  }));

  assert.equal(state.modules.geometry.evidence.retention.exposures, 1);
  assert.equal(state.modules.geometry.evidence.retention.successes, 1);
  const nextStage = state.reviewQueue.find((item) => item.id === review.id && item.kind === "retention");
  assert.ok(nextStage);
  assert.equal(nextStage.attempts, 1);
  assert.equal(Date.parse(nextStage.dueAt), T0 + 5 * DAY);
});

test("future transfer policy preserves grandfathered historical aggregate evidence", (t) => {
  enableClock(t);
  const state = emptyLearnerState();
  state.modules.geometry.evidence.variant_transfer = {
    exposures: 1,
    successes: 1,
    distinctNodes: ["legacy-node:MEDIUM"],
    lastAt: new Date(T0 - DAY).toISOString(),
  };

  const next = recordDecision(state, geoDecision({ mode: "lesson" }));
  assert.equal(next.modules.geometry.evidence.variant_transfer.exposures, 1);
  assert.equal(next.modules.geometry.evidence.variant_transfer.successes, 1);
  assert.deepEqual(next.modules.geometry.evidence.variant_transfer.distinctNodes, ["legacy-node:MEDIUM"]);
});

test("retention prefers a deterministic non-identical sibling from the same mechanism", () => {
  const catalog = {
    modules: [{
      id: "preflop",
      prerequisites: [],
      drills: [
        { id: "pre-01", moduleId: "preflop", nodeKey: "protected", variantGroup: "family-a", kind: "core", targetSeconds: 30 },
        { id: "pre-04", moduleId: "preflop", nodeKey: "protected", variantGroup: "family-b", kind: "changed", targetSeconds: 30 },
        { id: "pre-05", moduleId: "preflop", nodeKey: "domination", variantGroup: "family-c", kind: "boundary", targetSeconds: 30 },
      ],
    }],
    cards: [],
  };
  const item = {
    id: "review",
    moduleId: "preflop",
    sourceDrillId: "pre-01",
    variantGroup: "family-a",
    kind: "retention",
    dueAt: new Date(T0).toISOString(),
    attempts: 0,
    sourceInteractionId: "source",
  };

  assert.equal(selectRetentionDrillId(item, catalog, "wave-e"), "pre-04");
  assert.equal(selectRetentionDrillId(item, catalog, "wave-e"), "pre-04");
});

test("singleton with only unrelated alternatives repeats for maintenance instead of inventing retention", () => {
  const catalog = {
    modules: [{
      id: "preflop",
      prerequisites: [],
      drills: [
        { id: "pre-01", moduleId: "preflop", nodeKey: "value", variantGroup: "singleton-a", kind: "core", targetSeconds: 30 },
        { id: "pre-04", moduleId: "preflop", nodeKey: "protected", variantGroup: "singleton-b", kind: "changed", targetSeconds: 30 },
        { id: "pre-05", moduleId: "preflop", nodeKey: "domination", variantGroup: "singleton-c", kind: "boundary", targetSeconds: 30 },
      ],
    }],
    cards: [],
  };
  const item = {
    id: "review",
    moduleId: "preflop",
    sourceDrillId: "pre-01",
    variantGroup: "singleton-a",
    kind: "retention",
    dueAt: new Date(T0).toISOString(),
    attempts: 0,
    sourceInteractionId: "source",
  };
  assert.equal(selectRetentionDrillId(item, catalog, "maintenance"), "pre-01");
});

test("lesson substitutions are pure and leave canonical drill order untouched", () => {
  const expected = {
    geometry: ["geo-01", "geo-02", "geo-03", "geo-04", "geo-05"],
    blinds: ["bli-01", "bli-02", "bli-03", "bli-04", "bli-05"],
    shape: ["sha-01", "sha-02", "sha-03", "sha-04", "sha-05"],
  };

  for (const [moduleId, ids] of Object.entries(expected)) {
    assert.deepEqual(moduleById[moduleId].drills.map((drill) => drill.id), ids);
  }

  assert.deepEqual(selectLessonDrillIds(moduleById.geometry), ["geo-01", "geo-05", "geo-02"]);
  assert.deepEqual(selectLessonDrillIds(moduleById.blinds), ["bli-01", "bli-02", "bli-04"]);
  assert.deepEqual(selectLessonDrillIds(moduleById.shape), ["sha-01", "sha-02", "sha-05"]);

  for (const [moduleId, ids] of Object.entries(expected)) {
    assert.deepEqual(moduleById[moduleId].drills.map((drill) => drill.id), ids);
  }
});

test("lesson selector preserves the default composition outside bounded overrides", () => {
  const module = {
    id: "other",
    drills: [
      { id: "o-01", kind: "core" },
      { id: "o-02", kind: "changed" },
      { id: "o-03", kind: "boundary" },
      { id: "o-04", kind: "changed" },
    ],
  };
  assert.deepEqual(selectLessonDrillIds(module), ["o-01", "o-02", "o-03"]);
});

test("openLesson is the only lesson-ordering integration point", () => {
  const source = readFileSync(new URL("../components/LiveCashAppCore.tsx", import.meta.url), "utf8");
  assert.match(source, /import \{ selectLessonDrillIds \} from "\.\.\/lib\/retrieval-integrity";/u);
  assert.match(source, /const lessonDrillIds = selectLessonDrillIds\(module\);/u);
  assert.match(source, /startBoundSession\(startSession\(state, "lesson", moduleId, lessonDrillIds\), origin\);/u);
  assert.doesNotMatch(source, /applyLessonIntegrityOrdering/u);
});

test("diagnostic labels stay neutral in both locales without changing stable IDs", () => {
  const ids = diagnosticT1.map((item) => item.id);

  applyLocaleData("ru");
  assert.deepEqual(
    diagnosticT1.map((item) => item.title),
    ids.map((_, index) => `Диагностический спот ${index + 1}`),
  );

  applyLocaleData("en");
  assert.deepEqual(
    ids.map((id) => diagnosticEnglish[id].title),
    ids.map((_, index) => `Diagnostic spot ${index + 1}`),
  );
  assert.deepEqual(diagnosticT1.map((item) => item.id), ids);
});
