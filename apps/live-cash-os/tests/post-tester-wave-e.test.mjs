import assert from "node:assert/strict";
import test from "node:test";
import { selectRetentionDrillId } from "../lib/automaticity.ts";
import { emptyLearnerState, recordDecision } from "../lib/model.ts";

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

test("exact delayed repeat is maintenance, not strong retention or transfer evidence", (t) => {
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
  assert.equal(state.reviewQueue.some((item) => item.id === review.id), false);
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

test("singleton variant groups prefer deterministic non-identical module applications", () => {
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

  const first = selectRetentionDrillId(item, catalog, "wave-e");
  const second = selectRetentionDrillId(item, catalog, "wave-e");
  assert.notEqual(first, "pre-01");
  assert.equal(first, second);
  assert.ok(first === "pre-04" || first === "pre-05");
});

test("true one-drill catalog may repeat exact item for maintenance only", () => {
  const catalog = {
    modules: [{
      id: "geometry",
      prerequisites: [],
      drills: [
        { id: "geo-only", moduleId: "geometry", nodeKey: "only", variantGroup: "only", kind: "core", targetSeconds: 30 },
      ],
    }],
    cards: [],
  };
  const item = {
    id: "review",
    moduleId: "geometry",
    sourceDrillId: "geo-only",
    variantGroup: "only",
    kind: "retention",
    dueAt: new Date(T0).toISOString(),
    attempts: 0,
    sourceInteractionId: "source",
  };
  assert.equal(selectRetentionDrillId(item, catalog, "maintenance"), "geo-only");
});
