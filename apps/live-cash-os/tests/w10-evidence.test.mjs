import assert from "node:assert/strict";
import test from "node:test";
import { emptyLearnerState } from "../lib/model-core.ts";
import {
  W10_OBSERVATION_SCHEMA,
  buildW10EvidenceReport,
  validateW10ObservationLedger,
} from "../lib/w10-evidence.ts";

function ledger(overrides = {}) {
  return {
    schema: W10_OBSERVATION_SCHEMA,
    sessions: [],
    friction: [],
    ...overrides,
  };
}

function wrongGeometryInteraction(id, at) {
  return {
    id,
    at,
    moduleId: "geometry",
    drillId: "geo-03",
    nodeKey: "nominal-100bb",
    variantGroup: "future-spr",
    selectedActionOptionId: "geo-03-a1",
    selectedReasonOptionId: "geo-03-r1",
    mode: "practice",
    actionOk: false,
    reasonOk: false,
    responseClass: "D",
    confidence: 90,
    elapsedSeconds: 8,
    transferProbe: null,
  };
}

test("W10 compiler stays fail-closed with empty evidence", () => {
  const state = emptyLearnerState();
  const report = buildW10EvidenceReport(state, validateW10ObservationLedger(ledger()));

  assert.equal(report.acceptanceBoundary.status, "COLLECTING_EVIDENCE");
  assert.equal(report.acceptanceBoundary.w10Complete, false);
  assert.equal(report.studyCoverage.completedLearningSessions.pass, false);
  assert.equal(report.retention.delayedAccuracy.status, "NOT_ENOUGH_EVIDENCE");
  assert.equal(report.repair.newNodeSuccessAfterRepair.status, "NOT_MEASURABLE_FROM_EXPORT");
});

test("W10 summary detects repeated registered runtime error paths without leaking raw learner text", () => {
  const state = emptyLearnerState();
  state.diagnostic.priorityModules = ["geometry"];
  state.interactions = [
    wrongGeometryInteraction("i-1", "2026-08-01T08:05:00.000Z"),
    wrongGeometryInteraction("i-2", "2026-08-02T08:05:00.000Z"),
  ];
  state.fieldNotes = [{
    id: "field-secret",
    at: "2026-08-02T20:00:00.000Z",
    moduleId: "geometry",
    cue: "SECRET RAW CUE",
    action: "SECRET RAW ACTION",
    reason: "SECRET RAW REASON",
    cueBeforeAction: true,
    status: "REVIEWED_VALID",
    evaluatorNote: "SECRET REVIEWER NOTE",
  }];
  const observations = validateW10ObservationLedger(ledger({
    friction: [{
      id: "f-1",
      at: "2026-08-02T08:10:00.000Z",
      category: "navigation_confusion",
      severity: "P2",
      repeatKey: "mobile-nav",
      resolved: false,
      note: "SECRET FRICTION NOTE",
    }],
  }));

  const report = buildW10EvidenceReport(state, observations);
  assert.equal(report.studyCoverage.repeatedRuntimeErrorPath.pass, true);
  assert.ok(report.repair.repeatedRuntimeErrorPaths.some((item) => item.errorKey === "current-price-vs-future-geometry" && item.count === 2));
  assert.equal(report.fieldTransfer.recordedHands, 1);

  const serialized = JSON.stringify(report);
  for (const secret of ["SECRET RAW CUE", "SECRET RAW ACTION", "SECRET RAW REASON", "SECRET REVIEWER NOTE", "SECRET FRICTION NOTE"]) {
    assert.equal(serialized.includes(secret), false);
  }
});

test("W10 observation validator rejects synthetic schema drift", () => {
  assert.throws(() => validateW10ObservationLedger({ schema: "wrong", sessions: [], friction: [] }), /Expected observation schema/);
});
