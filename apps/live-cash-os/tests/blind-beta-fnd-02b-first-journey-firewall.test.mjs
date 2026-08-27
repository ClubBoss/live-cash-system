import assert from "node:assert/strict";
import test from "node:test";
import { practicalDecisionById } from "../content/practical-mastery";
import {
  createPracticalMasteryState,
  markPracticalConceptTaught,
  recordPracticalDecision,
} from "../lib/practical-mastery-core";
import { nextFirstJourneyDecision } from "../lib/practical-first-journey";

const INTERNAL_FIXTURE_ID = "PM-W4-HAND-01-108";
const SKILL_ID = "W4-HAND-01";

// FND-02 excluded the internal transfer-validation fixture from the core,
// integrated, and adaptive schedulers but not from the First Journey scheduler.
// A learner carrying a persisted wrong attempt on the fixture (possible from
// pre-FND-02 integrated practice) could still be handed it as a First Journey
// repair item. FND-02b closes that path with the same eligibility filter.

test("FND-02b keeps the internal fixture out of First Journey scheduling", () => {
  const fixture = practicalDecisionById.get(INTERNAL_FIXTURE_ID);
  assert.equal(fixture.learnerEligibility, "INTERNAL_ONLY");

  let state = createPracticalMasteryState(new Date("2026-08-28T08:00:00Z"));
  state = markPracticalConceptTaught(state, SKILL_ID, new Date("2026-08-28T08:00:00Z"));
  state = recordPracticalDecision(state, {
    decisionId: INTERNAL_FIXTURE_ID,
    actionId: "b",
    reasonId: "r2",
    confidence: 55,
    now: new Date("2026-08-28T08:05:00Z"),
  });
  state = recordPracticalDecision(state, {
    decisionId: "PM-W4-HAND-01-101",
    actionId: "a",
    reasonId: "r1",
    confidence: 80,
    now: new Date("2026-08-28T08:10:00Z"),
  });

  for (let i = 0; i < 12; i += 1) {
    const next = nextFirstJourneyDecision(state, SKILL_ID);
    if (!next) break;
    assert.notEqual(next.id, INTERNAL_FIXTURE_ID, "First Journey must never serve the internal fixture");
    assert.notEqual(next.learnerEligibility, "INTERNAL_ONLY");
    if (next.id === "PM-W4-HAND-001" || next.id === "PM-W4-HAND-01-101") {
      // already answered correctly earlier in this scenario; guard against a loop
      state = recordPracticalDecision(state, { decisionId: next.id, actionId: next.correctActionId, reasonId: next.correctReasonId, confidence: 80, now: new Date("2026-08-28T09:00:00Z") });
      continue;
    }
    state = recordPracticalDecision(state, {
      decisionId: next.id,
      actionId: next.correctActionId,
      reasonId: next.correctReasonId,
      confidence: 80,
      now: new Date(`2026-08-28T09:${String(10 + i).padStart(2, "0")}:00Z`),
    });
  }

  const ordinaryW4Hand = nextFirstJourneyDecision(
    markPracticalConceptTaught(createPracticalMasteryState(new Date("2026-08-28T08:00:00Z")), SKILL_ID, new Date("2026-08-28T08:00:00Z")),
    SKILL_ID,
  );
  assert.ok(ordinaryW4Hand, "ordinary First Journey poker practice must remain reachable");
  assert.notEqual(ordinaryW4Hand.learnerEligibility, "INTERNAL_ONLY");
});
