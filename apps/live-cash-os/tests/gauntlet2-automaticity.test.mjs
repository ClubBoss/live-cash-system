import assert from "node:assert/strict";
import test from "node:test";
import {
  HIGH_CONFIDENCE_WRONG_THRESHOLD,
  RETENTION_CHAIN_DAYS,
  isTableBurst,
  nextRetentionDelayMs,
  planAutomaticTraining,
  selectRetentionDrillId,
  selectTableBurstDrillIds,
  shouldFadeDecisionContext,
} from "../lib/automaticity.ts";
import { emptyLearnerState, recordDecision } from "../lib/model.ts";

const DAY = 86_400_000;
const T0 = Date.parse("2026-08-08T12:00:00.000Z");

const catalog = {
  modules: [
    { id: "geometry", prerequisites: [], drills: [
      { id: "geo-a", moduleId: "geometry", nodeKey: "geo-a", variantGroup: "geo-family", kind: "core", targetSeconds: 30 },
      { id: "geo-b", moduleId: "geometry", nodeKey: "geo-b", variantGroup: "geo-family", kind: "changed", targetSeconds: 30 },
      { id: "geo-c", moduleId: "geometry", nodeKey: "geo-c", variantGroup: "geo-other", kind: "boundary", targetSeconds: 30 },
    ] },
    { id: "preflop", prerequisites: ["geometry"], drills: [
      { id: "pre-a", moduleId: "preflop", nodeKey: "pre-a", variantGroup: "pre-family", kind: "core", targetSeconds: 30 },
      { id: "pre-b", moduleId: "preflop", nodeKey: "pre-b", variantGroup: "pre-family", kind: "changed", targetSeconds: 30 },
      { id: "pre-c", moduleId: "preflop", nodeKey: "pre-c", variantGroup: "pre-other", kind: "boundary", targetSeconds: 30 },
    ] },
    { id: "blinds", prerequisites: ["preflop"], drills: [
      { id: "bli-a", moduleId: "blinds", nodeKey: "bli-a", variantGroup: "bli-family", kind: "core", targetSeconds: 30 },
      { id: "bli-b", moduleId: "blinds", nodeKey: "bli-b", variantGroup: "bli-family", kind: "changed", targetSeconds: 30 },
      { id: "bli-c", moduleId: "blinds", nodeKey: "bli-c", variantGroup: "bli-other", kind: "boundary", targetSeconds: 30 },
    ] },
    { id: "filtering", prerequisites: ["preflop"], drills: [
      { id: "fil-a", moduleId: "filtering", nodeKey: "fil-a", variantGroup: "fil-family", kind: "core", targetSeconds: 30 },
      { id: "fil-b", moduleId: "filtering", nodeKey: "fil-b", variantGroup: "fil-family", kind: "changed", targetSeconds: 30 },
    ] },
  ],
  cards: [
    { id: "geo-card-1", moduleId: "geometry" },
    { id: "geo-card-2", moduleId: "geometry" },
    { id: "geo-card-3", moduleId: "geometry" },
  ],
};

function decision(overrides = {}) {
  return {
    moduleId: "geometry",
    drillId: "geo-a",
    nodeKey: "geo-a",
    variantGroup: "geo-family",
    mode: "practice",
    actionOk: true,
    reasonOk: true,
    selectedActionOptionId: "action-ok",
    selectedReasonOptionId: "reason-ok",
    confidence: 70,
    elapsedSeconds: 12,
    targetSeconds: 30,
    isBoundary: false,
    ...overrides,
  };
}

function enableClock(t, now = T0) {
  t.mock.timers.enable({ apis: ["Date"], now });
}

test("decision spacing is a bounded 1d -> 3d -> 7d chain", (t) => {
  enableClock(t);
  assert.deepEqual(RETENTION_CHAIN_DAYS, [1, 3, 7]);
  assert.equal(nextRetentionDelayMs(0), DAY);
  assert.equal(nextRetentionDelayMs(1), 3 * DAY);
  assert.equal(nextRetentionDelayMs(2), 7 * DAY);
  assert.equal(nextRetentionDelayMs(3), null);

  let state = recordDecision(emptyLearnerState(), decision());
  assert.equal(state.reviewQueue.length, 1);
  const reviewId = state.reviewQueue[0].id;
  assert.equal(Date.parse(state.reviewQueue[0].dueAt), T0 + DAY);

  t.mock.timers.setTime(T0 + DAY);
  state = recordDecision(state, decision({
    drillId: "geo-b",
    nodeKey: "geo-b",
    mode: "review",
    sourceReviewId: reviewId,
  }));
  assert.equal(state.reviewQueue.length, 1);
  assert.equal(state.reviewQueue[0].id, reviewId);
  assert.equal(Date.parse(state.reviewQueue[0].dueAt), T0 + DAY + 3 * DAY);

  t.mock.timers.setTime(T0 + 4 * DAY);
  state = recordDecision(state, decision({ mode: "review", sourceReviewId: reviewId }));
  assert.equal(state.reviewQueue.length, 1);
  assert.equal(Date.parse(state.reviewQueue[0].dueAt), T0 + 4 * DAY + 7 * DAY);

  t.mock.timers.setTime(T0 + 11 * DAY);
  state = recordDecision(state, decision({
    drillId: "geo-b",
    nodeKey: "geo-b",
    mode: "review",
    sourceReviewId: reviewId,
  }));
  assert.equal(state.reviewQueue.length, 0);
  assert.equal(state.modules.geometry.evidence.retention.successes, 3);
});

test("wrong delayed review becomes one repair and repair restarts the chain", (t) => {
  enableClock(t);
  let state = recordDecision(emptyLearnerState(), decision());
  const reviewId = state.reviewQueue[0].id;

  t.mock.timers.setTime(T0 + DAY);
  state = recordDecision(state, decision({
    drillId: "geo-b",
    nodeKey: "geo-b",
    mode: "review",
    sourceReviewId: reviewId,
    actionOk: false,
    reasonOk: true,
    selectedActionOptionId: "action-wrong",
    confidence: 90,
  }));
  assert.equal(state.reviewQueue.length, 1);
  assert.equal(state.reviewQueue[0].id, reviewId);
  assert.equal(state.reviewQueue[0].kind, "repair");
  assert.equal(Date.parse(state.reviewQueue[0].dueAt), T0 + DAY);

  t.mock.timers.setTime(T0 + DAY + 60_000);
  state = recordDecision(state, decision({
    drillId: "geo-a",
    mode: "repair",
    sourceReviewId: reviewId,
    actionOk: true,
    reasonOk: true,
  }));
  assert.equal(state.reviewQueue.length, 1);
  assert.equal(state.reviewQueue[0].kind, "retention");
  assert.notEqual(state.reviewQueue[0].id, reviewId);
  assert.equal(Date.parse(state.reviewQueue[0].dueAt), T0 + DAY + 60_000 + DAY);
});

test("same-family retrieval changes wording when another stable drill exists", () => {
  const item = {
    id: "review",
    moduleId: "geometry",
    sourceDrillId: "geo-a",
    variantGroup: "geo-family",
    kind: "retention",
    dueAt: new Date(T0).toISOString(),
    attempts: 0,
    sourceInteractionId: "source",
  };
  assert.equal(selectRetentionDrillId(item, catalog, "same-family"), "geo-b");
  const oneDrillCatalog = {
    modules: [{ ...catalog.modules[0], drills: [catalog.modules[0].drills[0]] }],
    cards: [],
  };
  assert.equal(selectRetentionDrillId(item, oneDrillCatalog, "fallback"), "geo-a");
});

test("high-confidence wrong repair deterministically outranks neutral delayed retrieval", () => {
  const state = emptyLearnerState();
  state.updatedAt = new Date(T0).toISOString();
  state.interactions.push({
    id: "high-wrong",
    at: new Date(T0 - 1_000).toISOString(),
    moduleId: "geometry",
    drillId: "geo-a",
    nodeKey: "geo-a",
    variantGroup: "geo-family",
    mode: "practice",
    actionOk: false,
    reasonOk: false,
    responseClass: "D",
    confidence: HIGH_CONFIDENCE_WRONG_THRESHOLD,
    elapsedSeconds: 10,
    transferProbe: null,
  });
  state.reviewQueue.push(
    { id: "neutral-retention", moduleId: "preflop", sourceDrillId: "pre-a", variantGroup: "pre-family", kind: "retention", dueAt: new Date(T0 - DAY).toISOString(), attempts: 0, sourceInteractionId: "neutral" },
    { id: "high-repair", moduleId: "geometry", sourceDrillId: "geo-a", variantGroup: "geo-family", kind: "repair", dueAt: new Date(T0).toISOString(), attempts: 0, sourceInteractionId: "high-wrong" },
  );
  const plan = planAutomaticTraining(state, catalog, { budget: "5", now: T0, seed: "priority" });
  assert.equal(plan.items[0].sourceReviewId, "high-repair");
  assert.equal(plan.items[0].kind, "repair");
});

test("warm-up is one repair-relevant decision plus at most two studied cards", () => {
  const state = emptyLearnerState();
  state.updatedAt = new Date(T0).toISOString();
  state.modules.geometry.contentCompleted = true;
  state.interactions.push({
    id: "miss",
    at: new Date(T0 - 1_000).toISOString(),
    moduleId: "geometry",
    drillId: "geo-a",
    nodeKey: "geo-a",
    variantGroup: "geo-family",
    mode: "practice",
    actionOk: false,
    reasonOk: true,
    responseClass: "B",
    confidence: 60,
    elapsedSeconds: 10,
    transferProbe: null,
  });
  state.reviewQueue.push({ id: "repair", moduleId: "geometry", sourceDrillId: "geo-a", variantGroup: "geo-family", kind: "repair", dueAt: new Date(T0).toISOString(), attempts: 0, sourceInteractionId: "miss" });

  const plan = planAutomaticTraining(state, catalog, { budget: "warmup", now: T0, seed: "warm" });
  assert.equal(plan.items[0].kind, "repair");
  assert.equal(plan.items[1].kind, "cards");
  assert.ok(plan.items[1].cardIds.length <= 2);
  assert.equal(plan.items.some((item) => item.kind === "lesson"), false);
  assert.ok(plan.estimatedMinutes <= 2);

  state.reviewQueue = [];
  const fallback = planAutomaticTraining(state, catalog, { budget: "warmup", now: T0, seed: "warm" });
  assert.equal(fallback.items[0].kind, "cards");
  assert.ok(fallback.items[0].cardIds.length <= 2);
});

test("review and mixed decisions fade topic hints until feedback", () => {
  assert.equal(shouldFadeDecisionContext("review", false), true);
  assert.equal(shouldFadeDecisionContext("mixed", false), true);
  assert.equal(shouldFadeDecisionContext("practice", false), false);
  assert.equal(shouldFadeDecisionContext("repair", false), false);
  assert.equal(shouldFadeDecisionContext("review", true), false);
});

test("Table Burst selects 6-10 stable drills only from completed material", () => {
  const state = emptyLearnerState();
  for (const moduleId of ["geometry", "preflop", "blinds"]) state.modules[moduleId].contentCompleted = true;
  const ids = selectTableBurstDrillIds(state, catalog, "burst");
  assert.equal(ids.length, 8);
  assert.equal(isTableBurst("mixed", ids.length), true);
  assert.equal(ids.some((id) => id.startsWith("fil-")), false);
  assert.equal(new Set(ids).size, ids.length);
});

test("mixed Burst evidence cannot fabricate delayed retention or field validation", (t) => {
  enableClock(t);
  let state = emptyLearnerState();
  state.modules.geometry.contentCompleted = true;
  for (let index = 0; index < 8; index += 1) {
    state = recordDecision(state, decision({
      drillId: `burst-${index}`,
      nodeKey: `burst-node-${index}`,
      variantGroup: `burst-family-${index}`,
      mode: "mixed",
    }));
  }
  assert.equal(state.modules.geometry.evidence.retention.exposures, 0);
  assert.equal(state.modules.geometry.evidence.field_transfer.exposures, 0);
  assert.notEqual(state.modules.geometry.state, "RETAINED");
  assert.notEqual(state.modules.geometry.state, "FIELD_TEST_PENDING");
  assert.notEqual(state.modules.geometry.state, "FIELD_VALIDATED");
});
