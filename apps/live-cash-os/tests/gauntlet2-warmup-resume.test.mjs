import assert from "node:assert/strict";
import test from "node:test";
import { planAutomaticTraining } from "../lib/automaticity.ts";
import { emptyLearnerState, recordDecision } from "../lib/model.ts";

const DAY = 86_400_000;
const catalog = {
  modules: [{
    id: "geometry",
    prerequisites: [],
    drills: [{ id: "geo-a", moduleId: "geometry", nodeKey: "geo-a", variantGroup: "geo-family", kind: "core", targetSeconds: 30 }],
  }],
  cards: [{ id: "geo-card", moduleId: "geometry" }],
};

function reviewInput(sourceReviewId) {
  return {
    moduleId: "geometry",
    drillId: "geo-a",
    nodeKey: "geo-a",
    variantGroup: "geo-family",
    mode: "review",
    actionOk: true,
    reasonOk: true,
    selectedActionOptionId: "action-ok",
    selectedReasonOptionId: "reason-ok",
    sourceReviewId,
    confidence: 70,
    elapsedSeconds: 10,
    targetSeconds: 30,
    isBoundary: false,
  };
}

test("pre-session warm-up preserves an unfinished active session", () => {
  const state = emptyLearnerState();
  state.activeSession = {
    mode: "lesson",
    moduleId: "geometry",
    step: 3,
    drillIds: ["geo-a"],
    currentIndex: 0,
    selectedActionId: null,
    selectedReasonId: null,
    confidence: 65,
    startedAt: "2026-08-08T12:00:00.000Z",
    itemStartedAt: "2026-08-08T12:00:00.000Z",
    explainBack: "",
  };

  const plan = planAutomaticTraining(state, catalog, {
    budget: "warmup",
    now: Date.parse("2026-08-08T13:00:00.000Z"),
    seed: "resume-first",
  });

  assert.equal(plan.items.length, 1);
  assert.equal(plan.items[0].kind, "resume");
  assert.equal(plan.items[0].moduleId, "geometry");
  assert.equal(plan.items.some((item) => item.kind === "cards" || item.kind === "repair"), false);
});

test("legacy failed-review attempts cannot skip the first successful retrieval stage", () => {
  const state = emptyLearnerState();
  const sourceAt = new Date(Date.now() - 2 * DAY).toISOString();
  state.interactions.push({
    id: "legacy-source",
    at: sourceAt,
    moduleId: "geometry",
    drillId: "geo-a",
    nodeKey: "geo-a",
    variantGroup: "geo-family",
    mode: "practice",
    actionOk: true,
    reasonOk: true,
    responseClass: "A",
    confidence: 70,
    elapsedSeconds: 10,
    transferProbe: null,
  });
  state.reviewQueue.push({
    id: "legacy-retention",
    moduleId: "geometry",
    sourceDrillId: "geo-a",
    variantGroup: "geo-family",
    kind: "retention",
    dueAt: "2020-01-01T00:00:00.000Z",
    attempts: 4,
    sourceInteractionId: "legacy-source",
  });
  state.activeSession = {
    mode: "review",
    moduleId: "geometry",
    step: 0,
    drillIds: ["geo-a"],
    currentIndex: 0,
    selectedActionId: null,
    selectedReasonId: null,
    confidence: 65,
    startedAt: new Date().toISOString(),
    itemStartedAt: new Date().toISOString(),
    explainBack: "",
    sourceReviewId: "legacy-retention",
  };

  const next = recordDecision(state, reviewInput("legacy-retention"));
  const staged = next.reviewQueue.find((item) => item.id === "legacy-retention");
  assert.ok(staged);
  assert.equal(staged.attempts, 1);
  assert.ok(Date.parse(staged.dueAt) >= Date.now() + 3 * DAY - 1_000);
});

test("successful reviews from the same family cannot advance another review item", () => {
  const state = emptyLearnerState();
  const now = new Date().toISOString();
  state.interactions.push({
    id: "target-stage-one",
    at: now,
    moduleId: "geometry",
    drillId: "geo-a",
    nodeKey: "geo-a",
    variantGroup: "geo-family",
    mode: "review",
    actionOk: true,
    reasonOk: true,
    responseClass: "A",
    confidence: 70,
    elapsedSeconds: 10,
    transferProbe: null,
  });
  for (let index = 0; index < 4; index += 1) {
    state.interactions.push({
      id: `other-review-${index}`,
      at: now,
      moduleId: "geometry",
      drillId: "geo-a",
      nodeKey: "geo-a",
      variantGroup: "geo-family",
      mode: "review",
      actionOk: true,
      reasonOk: true,
      responseClass: "A",
      confidence: 70,
      elapsedSeconds: 10,
      transferProbe: null,
    });
  }
  state.reviewQueue.push({
    id: "target-chain",
    moduleId: "geometry",
    sourceDrillId: "geo-a",
    variantGroup: "geo-family",
    kind: "retention",
    dueAt: "2020-01-01T00:00:00.000Z",
    attempts: 1,
    sourceInteractionId: "target-stage-one",
  });
  state.activeSession = {
    mode: "review",
    moduleId: "geometry",
    step: 0,
    drillIds: ["geo-a"],
    currentIndex: 0,
    selectedActionId: null,
    selectedReasonId: null,
    confidence: 65,
    startedAt: now,
    itemStartedAt: now,
    explainBack: "",
    sourceReviewId: "target-chain",
  };

  const next = recordDecision(state, reviewInput("target-chain"));
  const target = next.reviewQueue.find((item) => item.id === "target-chain");
  assert.ok(target);
  assert.equal(target.attempts, 2);
  assert.ok(Date.parse(target.dueAt) > Date.now() + 6 * DAY);
});
