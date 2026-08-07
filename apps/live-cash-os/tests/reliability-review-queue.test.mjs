import assert from "node:assert/strict";
import test from "node:test";
import { emptyLearnerState } from "../lib/model-core.ts";
import { isSafeSuccessor } from "../lib/reliability.ts";

function baseWithReview() {
  const state = emptyLearnerState();
  state.reviewQueue.push({
    id: "review-exact",
    moduleId: "geometry",
    sourceDrillId: "geo-01",
    variantGroup: "denominator",
    kind: "repair",
    dueAt: "2026-08-07T12:00:00.000Z",
    attempts: 0,
    sourceInteractionId: "source-1",
    sourceActionOptionId: "call",
    sourceReasonOptionId: "reason-1",
  });
  state.revision = 5;
  return state;
}

test("a newer snapshot cannot silently drop an unresolved review item", () => {
  const base = baseWithReview();
  const candidate = structuredClone(base);
  candidate.reviewQueue = [];
  candidate.revision = 6;
  candidate.updatedAt = "2026-08-07T12:01:00.000Z";
  assert.equal(isSafeSuccessor(candidate, base), false);
});

test("an exact sourceReviewId interaction proves legitimate review consumption", () => {
  const base = baseWithReview();
  const candidate = structuredClone(base);
  candidate.reviewQueue = [];
  candidate.revision = 6;
  candidate.updatedAt = "2026-08-07T12:01:00.000Z";
  candidate.interactions.push({
    id: "interaction-review",
    at: "2026-08-07T12:01:00.000Z",
    moduleId: "geometry",
    drillId: "geo-04",
    nodeKey: "nominal-100bb",
    variantGroup: "future-spr",
    mode: "repair",
    actionOk: true,
    reasonOk: true,
    responseClass: "A",
    selectedActionOptionId: "raise",
    selectedReasonOptionId: "reason-2",
    sourceReviewId: "review-exact",
    confidence: 80,
    elapsedSeconds: 12,
    transferProbe: null,
  });
  assert.equal(isSafeSuccessor(candidate, base), true);
});
