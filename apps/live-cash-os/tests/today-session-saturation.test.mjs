import assert from "node:assert/strict";
import test from "node:test";
import { emptyLearnerState } from "../lib/model.ts";
import { planDailyTraining } from "../lib/scheduler.ts";

const NOW = Date.parse("2026-08-13T00:00:00.000Z");
const catalog = {
  modules: [
    {
      id: "geometry",
      prerequisites: [],
      drills: [
        { id: "geo-core", moduleId: "geometry", nodeKey: "geo-core", variantGroup: "geo", kind: "core", targetSeconds: 30 },
        { id: "geo-change", moduleId: "geometry", nodeKey: "geo-change", variantGroup: "geo", kind: "changed", targetSeconds: 30 },
        { id: "geo-boundary", moduleId: "geometry", nodeKey: "geo-boundary", variantGroup: "geo", kind: "boundary", targetSeconds: 30 },
      ],
    },
    {
      id: "preflop",
      prerequisites: ["geometry"],
      drills: [
        { id: "pre-core", moduleId: "preflop", nodeKey: "pre-core", variantGroup: "pre", kind: "core", targetSeconds: 30 },
      ],
    },
  ],
  cards: [],
};

function saturatedGeometry() {
  const state = emptyLearnerState();
  state.updatedAt = new Date(NOW).toISOString();
  state.modules.geometry.contentCompleted = true;
  state.modules.geometry.lessonStep = 10;
  state.modules.geometry.evidence.variant_transfer.exposures = 2;
  state.modules.geometry.evidence.variant_transfer.successes = 2;
  state.modules.geometry.evidence.boundary_control.exposures = 1;
  state.modules.geometry.evidence.boundary_control.successes = 1;
  return state;
}

test("5-minute Today terminates after useful work is exhausted instead of fabricating filler practice", () => {
  const plan = planDailyTraining(saturatedGeometry(), catalog, { budget: "5", now: NOW, seed: "five-done" });
  assert.deepEqual(plan.items, [{ kind: "done", estimatedMinutes: 0, reasonCode: "done" }]);
});

test("15-minute Today advances to the next eligible lesson when useful review work is exhausted", () => {
  const plan = planDailyTraining(saturatedGeometry(), catalog, { budget: "15", now: NOW, seed: "next-lesson" });
  assert.equal(plan.items[0].kind, "lesson");
  assert.equal(plan.items[0].moduleId, "preflop");
  assert.equal(plan.items.some((item) => item.kind === "practice" && item.reasonCode === "weak"), false);
});

test("recent lesson exposure ends Today cleanly instead of bypassing the one-new-mechanism guard with filler practice", () => {
  const state = saturatedGeometry();
  state.interactions.push({ mode: "lesson", at: new Date(NOW - 60_000).toISOString() });
  const plan = planDailyTraining(state, catalog, { budget: "15", now: NOW, seed: "recent-lesson" });
  assert.deepEqual(plan.items, [{ kind: "done", estimatedMinutes: 0, reasonCode: "done" }]);
});

test("a due delayed review still outranks the next lesson", () => {
  const state = saturatedGeometry();
  state.reviewQueue.push({
    id: "due-retention",
    moduleId: "geometry",
    sourceDrillId: "geo-core",
    variantGroup: "geo",
    kind: "retention",
    dueAt: new Date(NOW - 1).toISOString(),
    attempts: 0,
    sourceInteractionId: "source",
  });
  const plan = planDailyTraining(state, catalog, { budget: "15", now: NOW, seed: "review-first" });
  assert.equal(plan.items[0].kind, "review");
  assert.equal(plan.items[0].sourceReviewId, "due-retention");
});
