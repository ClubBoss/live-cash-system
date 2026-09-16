import assert from "node:assert/strict";
import test from "node:test";
import { emptyLearnerState } from "../lib/model-core.ts";
import { applyReviewedDiagnostic } from "../lib/wave7.ts";

function practicalSentinel() {
  return {
    schemaVersion: 3,
    mastery: { marker: "must-stay-byte-equivalent" },
    performance: [{ marker: "telemetry-untouched" }],
    studyWorkspace: { marker: "continuity-untouched" },
  };
}

test("LC-AUD-005 reviewed Diagnostic changes routing metadata only and cannot mutate Practical evidence", () => {
  const state = emptyLearnerState();
  state._practicalProfile = practicalSentinel();
  const beforePractical = structuredClone(state._practicalProfile);
  const beforeModules = structuredClone(state.modules);

  const routed = applyReviewedDiagnostic(state, ["preflop", "blinds"]);

  assert.deepEqual(routed.diagnostic.priorityModules, ["preflop", "blinds"]);
  assert.equal(routed.diagnostic.status, "SCORED");
  assert.deepEqual(routed._practicalProfile, beforePractical);
  assert.deepEqual(routed.modules, beforeModules);
});

test("LC-AUD-005 Diagnostic routing never grants legacy lesson/mastery evidence", () => {
  const state = emptyLearnerState();
  const routed = applyReviewedDiagnostic(state, ["preflop"]);
  assert.equal(routed.modules.preflop.state, "UNEXPOSED");
  assert.equal(routed.modules.preflop.contentCompleted, false);
  assert.equal(routed.modules.preflop.highConfidenceError, false);
  for (const cell of Object.values(routed.modules.preflop.evidence)) {
    assert.equal(cell.exposures, 0);
    assert.equal(cell.successes, 0);
  }
});
