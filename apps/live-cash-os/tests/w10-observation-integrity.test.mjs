import assert from "node:assert/strict";
import test from "node:test";
import { W10_OBSERVATION_SCHEMA } from "../lib/w10-evidence.ts";
import { validateStrictW10ObservationLedger } from "../lib/w10-observation-integrity.ts";

function session(overrides = {}) {
  return {
    id: "session-001",
    startedAt: "2026-08-14T08:00:00.000Z",
    endedAt: "2026-08-14T08:12:00.000Z",
    completed: true,
    phase: "learning",
    startedIntendedActionWithoutNavigationConfusion: true,
    navigationConfusion: false,
    unnecessaryClicks: 0,
    queueOverload: false,
    desireToReturn: 4,
    beforePlayUsefulness: null,
    preSessionWarmup: false,
    returnedAfterMultiDayBreak: false,
    comprehension: {
      mechanismExplainable: true,
      promptUnderstoodFirstRead: true,
      assumptionsNoticed: true,
    },
    ...overrides,
  };
}

function ledger(overrides = {}) {
  return {
    schema: W10_OBSERVATION_SCHEMA,
    sessions: [session()],
    friction: [],
    ...overrides,
  };
}

test("strict W10 observation validation accepts a valid bounded session", () => {
  const result = validateStrictW10ObservationLedger(ledger());
  assert.equal(result.sessions.length, 1);
});

test("strict W10 observation validation rejects duplicate session ids", () => {
  assert.throws(
    () => validateStrictW10ObservationLedger(ledger({ sessions: [session(), session()] })),
    /Duplicate W10 session id/,
  );
});

test("strict W10 observation validation rejects reversed session chronology", () => {
  assert.throws(
    () => validateStrictW10ObservationLedger(ledger({ sessions: [session({ endedAt: "2026-08-14T07:59:00.000Z" })] })),
    /ended before it started/,
  );
});

test("strict W10 observation validation rejects unknown friction categories", () => {
  assert.throws(
    () => validateStrictW10ObservationLedger(ledger({
      friction: [{
        id: "friction-001",
        at: "2026-08-14T08:03:00.000Z",
        category: "made_up_category",
        severity: "P2",
        repeatKey: "bad-category",
        resolved: false,
      }],
    })),
    /Invalid friction category/,
  );
});

test("strict W10 observation validation rejects values that could contaminate metrics", () => {
  assert.throws(
    () => validateStrictW10ObservationLedger(ledger({ sessions: [session({ unnecessaryClicks: -1 })] })),
    /Invalid unnecessaryClicks/,
  );
  assert.throws(
    () => validateStrictW10ObservationLedger(ledger({ sessions: [session({ desireToReturn: 6 })] })),
    /Invalid desireToReturn/,
  );
  assert.throws(
    () => validateStrictW10ObservationLedger(ledger({ sessions: [session({ navigationConfusion: "no" })] })),
    /Invalid navigationConfusion/,
  );
});
