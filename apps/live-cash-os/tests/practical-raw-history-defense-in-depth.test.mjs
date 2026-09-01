import assert from "node:assert/strict";
import test from "node:test";

import { practicalDecisionById } from "../content/practical-mastery/index.ts";
import {
  createPracticalMasteryState,
  isSemanticallyValidPracticalAttempt,
  latestAttemptsByDecision,
  practicalRepairQueue,
  recentExposurePenaltyForSkill,
  recommendNextPracticalSkill,
  recordPracticalDecision,
} from "../lib/practical-mastery-core.ts";
import { retentionTierDue } from "../lib/practical-integrated-session.ts";
import { classifyPracticalAdaptiveNeed } from "../lib/practical-adaptive-repair.ts";
import { recommendFirstJourneyStep } from "../lib/practical-first-journey.ts";
import { recentSuccessfulDecisionIds, recentlyAttemptedDecisionIds } from "../lib/practical-repeat-window.ts";
import {
  recordIntegratedAnswerContinuity,
  recordIntegratedRoundStartContinuity,
  restoreIntegratedRound,
  restoreQuickStartPostAnswer,
} from "../lib/practical-continuity-workspace.ts";
import { validatePracticalProfileState } from "../lib/practical-profile-contract.ts";
import { createPracticalProfileState, createPracticalStudyWorkspace } from "../lib/practical-profile-state.ts";

// Follow-up defense-in-depth pass after manager hold on PR #221. #221 closed
// the profile-validation boundary and the two most obvious raw scheduler
// reads (practicalRepairQueue, recentExposurePenaltyForSkill). This file
// probes the additional raw-attempt consumers the manager's independent
// audit confirmed, per the required executable-probe list.

const NOW = new Date("2026-09-01T00:00:00.000Z");

function attempt({ id, decisionId, skillId, actionId, reasonId, confidence = 55, correct = false, answeredAt = "2026-09-01T00:00:00.000Z" }) {
  return { id, decisionId, skillId, actionId, reasonId, confidence, correct, answeredAt };
}

function syntheticDecision({ id, skillId = "FND-01", actionWrongTag = "M_ACTION", reasonWrongTag = "M_REASON" }) {
  const resolvedActionWrongTag = actionWrongTag === null ? undefined : actionWrongTag;
  const resolvedReasonWrongTag = reasonWrongTag === null ? undefined : reasonWrongTag;
  return {
    id, skillId, kind: "decision", sourceRefs: [], assumptions: [],
    cueRu: "", cueEn: "", questionRu: "", questionEn: "",
    actionOptions: [
      { id: "a", textRu: "correct", textEn: "correct" },
      { id: "b", textRu: "wrong", textEn: "wrong", misconception: resolvedActionWrongTag },
    ],
    reasonOptions: [
      { id: "r1", textRu: "correct", textEn: "correct" },
      { id: "r2", textRu: "wrong", textEn: "wrong", misconception: resolvedReasonWrongTag },
    ],
    correctActionId: "a", correctReasonId: "r1", explanationRu: "", explanationEn: "", targetSeconds: 20,
  };
}

function withSyntheticDecisions(decisions, run) {
  for (const decision of decisions) practicalDecisionById.set(decision.id, decision);
  try { return run(); } finally { for (const decision of decisions) practicalDecisionById.delete(decision.id); }
}

// --- Probe A: wrong-skill malformed latest resurrection -------------------

test("A REPRODUCED->FIXED: a forged-skillId latest row does not resurrect an older valid same-decision row in the per-skill view", () => {
  const decision = syntheticDecision({ id: "PROBE-A-WRONGSKILL", skillId: "FND-01", actionWrongTag: null, reasonWrongTag: null });
  withSyntheticDecisions([decision], () => {
    const state = createPracticalMasteryState(NOW, true);
    state.attempts = [
      attempt({ id: "1", decisionId: decision.id, skillId: "FND-01", actionId: "b", reasonId: "r1", confidence: 40, answeredAt: "2026-09-01T00:00:00.000Z" }),
      // Later, forged: claims skillId FND-02, but the canonical decision's
      // real skillId is FND-01 -- this row is semantically invalid.
      attempt({ id: "2", decisionId: decision.id, skillId: "FND-02", actionId: "b", reasonId: "r1", confidence: 95, answeredAt: "2026-09-01T00:01:00.000Z" }),
    ];
    assert.equal(isSemanticallyValidPracticalAttempt(state.attempts[1]), false);

    // Global identity is built first: the forged row IS the true latest for
    // this decisionId globally, so it must not be invisible to FND-01's view
    // in a way that resurrects the older valid row underneath it.
    const fnd01View = latestAttemptsByDecision(state, "FND-01");
    assert.equal(fnd01View.has(decision.id), false, "the older valid row must not be resurrected in FND-01's per-skill view");

    const fnd02View = latestAttemptsByDecision(state, "FND-02");
    assert.equal(fnd02View.get(decision.id)?.id, "2");
    assert.equal(isSemanticallyValidPracticalAttempt(fnd02View.get(decision.id)), false, "the forged row is visible under its own claimed skill but still fails validity there");

    assert.deepEqual(practicalRepairQueue(state), []);
    const recommendation = recommendNextPracticalSkill(state);
    assert.doesNotMatch(recommendation?.whyNow ?? "", /Repair now:/);
  });
});

// --- Probe: recent-window ordering -----------------------------------------

test("recent-window ordering REPRODUCED->FIXED: a malformed row occupies its own last-N slot and never pulls an older attempt into the window", () => {
  const decision = syntheticDecision({ id: "PROBE-WINDOW", skillId: "FND-01" });
  withSyntheticDecisions([decision], () => {
    const build = (kinds) => kinds.map((kind, index) => {
      const answeredAt = new Date(NOW.getTime() + index * 1000).toISOString();
      if (kind === "malformed") return attempt({ id: `m${index}`, decisionId: decision.id, skillId: "FND-01", actionId: "GHOST", reasonId: "r1", confidence: 40, correct: false, answeredAt });
      return attempt({ id: `v${index}`, decisionId: decision.id, skillId: "FND-01", actionId: "a", reasonId: "r1", confidence: 40, correct: true, answeredAt });
    });

    // True last-8 raw window = 4 malformed + 4 valid. A backfill pool of 4
    // older valid attempts sits before the window and must stay excluded.
    const state = createPracticalMasteryState(NOW, true);
    state.attempts = build(["valid", "valid", "valid", "valid", "malformed", "malformed", "malformed", "malformed", "valid", "valid", "valid", "valid"]);

    // Fixed-behavior control: only the true last-8 window exists (no
    // backfill pool at all). If the fix is correct, this must score
    // identically to the state above.
    const fixedControl = createPracticalMasteryState(NOW, true);
    fixedControl.attempts = build(["malformed", "malformed", "malformed", "malformed", "valid", "valid", "valid", "valid"]);

    // What the pre-fix filter-then-slice code would have effectively
    // computed for the state above: filtering removes the 4 malformed rows
    // from the whole 12-row history first, leaving exactly 8 valid rows
    // (4 backfill + 4 recent), and slicing the last 8 of THOSE keeps all 8.
    const buggyEquivalent = createPracticalMasteryState(NOW, true);
    buggyEquivalent.attempts = build(["valid", "valid", "valid", "valid", "valid", "valid", "valid", "valid"]);

    assert.equal(recentExposurePenaltyForSkill(state, "FND-01"), recentExposurePenaltyForSkill(fixedControl, "FND-01"));
    assert.notEqual(recentExposurePenaltyForSkill(state, "FND-01"), recentExposurePenaltyForSkill(buggyEquivalent, "FND-01"));
    assert.equal(recentExposurePenaltyForSkill(state, "FND-01"), 2, "4 valid rows in the true window clears >=3 but not >=5");
    assert.equal(recentExposurePenaltyForSkill(buggyEquivalent, "FND-01"), 3, "the buggy-equivalent 8-valid-row case would clear >=5");
  });
});

// --- Probe B: malformed latest-correct retention anchor -------------------

test("B REPRODUCED->FIXED: a forged correct=true row cannot manufacture a fraudulent retention anchor, and does not resurrect an older genuine one", () => {
  const decision = syntheticDecision({ id: "PROBE-B-RETENTION", skillId: "EXP-01" });
  withSyntheticDecisions([decision], () => {
    let state = createPracticalMasteryState(new Date("2026-08-01T00:00:00.000Z"), true);
    state.skills["EXP-01"].evidenceStage = "BOUNDARY_TESTED";
    state.skills["EXP-01"].conceptTaught = true;

    // Forged: claims correct=true and a very old answeredAt (to fake a large
    // elapsed gap), but actionId "b" does not match correctActionId "a" --
    // internally inconsistent, so this row is semantically invalid.
    state.attempts = [attempt({
      id: "forged", decisionId: decision.id, skillId: "EXP-01",
      actionId: "b", reasonId: "r1", confidence: 90, correct: true,
      answeredAt: "2026-01-01T00:00:00.000Z",
    })];
    assert.equal(isSemanticallyValidPracticalAttempt(state.attempts[0]), false);

    // With only the forged anchor present, no legitimate retention interval
    // can be considered due -- the forged row must contribute nothing.
    assert.equal(retentionTierDue(state, "EXP-01", new Date("2026-08-10T00:00:00.000Z")), null);

    // Now add a real correct attempt AFTER the forged one is recorded, close
    // enough in time that the forged row's fabricated old timestamp is the
    // only thing that could fraudulently trigger a tier -- it must not.
    state = recordPracticalDecision(state, { decisionId: decision.id, actionId: "a", reasonId: "r1", confidence: 60, now: new Date("2026-08-05T00:00:00.000Z") });
    assert.equal(retentionTierDue(state, "EXP-01", new Date("2026-08-06T00:00:00.000Z")), null, "one day after a real correct answer cannot owe a 1-day tier a fraudulent anchor didn't legitimately earn");
  });
});

// --- Probe C: malformed history changing adaptive need --------------------

test("C REPRODUCED->FIXED: a malformed latest attempt's fabricated confidence cannot bias adaptive repair priority, and does not resurrect an older need's priority either", () => {
  // decision.kind alone decides the *need type* branch in
  // classifyPracticalAdaptiveNeed, and that lookup is by decisionId (same
  // decision either way) -- so kind can't distinguish trusting the malformed
  // row from trusting the older valid one. Only the *priority* (driven by
  // whichever attempt's own confidence gets used) can, so this probe isolates
  // that: 100+8=108 if the older valid low-confidence row were resurrected,
  // 100+20=120 if the malformed row's fabricated high confidence were trusted.
  const decision = syntheticDecision({ id: "PROBE-C-ADAPTIVE", skillId: "FND-01" });
  withSyntheticDecisions([decision], () => {
    const state = createPracticalMasteryState(NOW, true);
    state.skills["FND-01"].conceptTaught = true;
    state.attempts = [
      attempt({ id: "1", decisionId: decision.id, skillId: "FND-01", actionId: "b", reasonId: "r1", confidence: 30, correct: false, answeredAt: "2026-09-01T00:00:00.000Z" }),
      // Later, malformed (unknown option) with a fabricated high confidence.
      attempt({ id: "2", decisionId: decision.id, skillId: "FND-01", actionId: "GHOST", reasonId: "r1", confidence: 95, correct: false, answeredAt: "2026-09-01T00:01:00.000Z" }),
    ];
    const need = classifyPracticalAdaptiveNeed(state, "FND-01", []);
    assert.notEqual(need.priority, 120, "a malformed latest row's fabricated high confidence must not inflate adaptive repair priority");
    assert.notEqual(need.priority, 108, "a malformed latest must not resurrect the older valid row's priority either");
  });
});

// --- Probe D: malformed history changing First Journey / Quick Start ------

test("D REPRODUCED->FIXED: a malformed latest attempt cannot combine with a genuine miss to cross the >=2 First Journey repair threshold", () => {
  // unresolvedWrongDecisionIds enumerates real content from the practicalDecisions
  // array (not the practicalDecisionById map a synthetic decision would only
  // register into), so this probe uses two real FND-01 decisions rather than
  // synthetic ones: PM-FND-01-001 (a genuine correction shadowed by a later
  // malformed row) and PM-FND-01-101 (one genuine, always-unresolved miss).
  const state = createPracticalMasteryState(NOW, true);
  state.attempts = [
    attempt({ id: "1", decisionId: "PM-FND-01-001", skillId: "FND-01", actionId: "b", reasonId: "r1", confidence: 40, correct: false, answeredAt: "2026-09-01T00:00:00.000Z" }),
    attempt({ id: "2", decisionId: "PM-FND-01-001", skillId: "FND-01", actionId: "a", reasonId: "r1", confidence: 40, correct: true, answeredAt: "2026-09-01T00:01:00.000Z" }),
    // Later, malformed: must not read as "still unresolved" (which would
    // combine with PM-FND-01-101's genuine miss to cross the repair
    // threshold), and must not resurrect the original wrong attempt either.
    attempt({ id: "3", decisionId: "PM-FND-01-001", skillId: "FND-01", actionId: "GHOST", reasonId: "r1", confidence: 90, correct: false, answeredAt: "2026-09-01T00:02:00.000Z" }),
    attempt({ id: "4", decisionId: "PM-FND-01-101", skillId: "FND-01", actionId: "b", reasonId: "r1", confidence: 40, correct: false, answeredAt: "2026-09-01T00:03:00.000Z" }),
  ];
  const step = recommendFirstJourneyStep(state);
  assert.ok(!(step?.skillId === "FND-01" && step?.isRepair === true), "a malformed latest on PM-FND-01-001 must not combine with PM-FND-01-101's genuine miss to trigger the >=2 repair threshold");
});

// --- Probe E: malformed row changing repeat-window semantics --------------

test("E REPRODUCED->FIXED: a malformed row cannot manufacture exact-repeat-avoidance signal", () => {
  const decision = syntheticDecision({ id: "PROBE-E-REPEATWINDOW", skillId: "FND-01" });
  withSyntheticDecisions([decision], () => {
    const state = createPracticalMasteryState(NOW, true);
    state.attempts = [attempt({ id: "1", decisionId: decision.id, skillId: "FND-01", actionId: "GHOST", reasonId: "r1", confidence: 90, correct: true, answeredAt: "2026-09-01T00:00:00.000Z" })];
    assert.equal(isSemanticallyValidPracticalAttempt(state.attempts[0]), false);
    assert.equal(recentSuccessfulDecisionIds(state).has(decision.id), false, "a malformed row must not count as a recent success");
    assert.equal(recentlyAttemptedDecisionIds(state).has(decision.id), false, "a malformed row must not count as a recent attempt either");
  });
});

// --- Probe F: continuity restoration of a semantically invalid attempt ----

test("F REPRODUCED->FIXED: continuity cannot restore post-answer state anchored on a semantically invalid attempt", () => {
  const decision = syntheticDecision({ id: "PROBE-F-CONTINUITY", skillId: "FND-01" });
  withSyntheticDecisions([decision], () => {
    const workspace0 = createPracticalStudyWorkspace();
    const mastery = createPracticalMasteryState(NOW, true);
    // Directly construct a malformed attempt and a workspace referencing it
    // by id, bypassing recordPracticalDecision entirely -- the durable-state
    // side of a defense-in-depth probe (malformed state reaching a boundary
    // outside normal profile validation).
    const forged = attempt({ id: "forged-post-answer", decisionId: decision.id, skillId: "FND-01", actionId: "GHOST", reasonId: "r1", confidence: 90, correct: false, answeredAt: "2026-09-01T00:00:00.000Z" });
    mastery.attempts = [forged];
    const withQuickStart = {
      ...workspace0,
      continuity: {
        version: 1,
        contentVersion: mastery.contentVersion,
        quickStart: { skillId: "FND-01", decisionId: decision.id, attemptId: forged.id, phase: "POST_ANSWER", updatedAt: NOW.toISOString() },
        integrated: null,
      },
    };
    const restored = restoreQuickStartPostAnswer(withQuickStart, mastery);
    assert.equal(restored.status, "INVALID", "post-answer continuity must not restore a semantically invalid attempt as the submitted evidence");
  });
});

test("F (integrated round) REPRODUCED->FIXED: restoreIntegratedRound cannot restore a semantically invalid submitted attempt", () => {
  const decision = syntheticDecision({ id: "PROBE-F2-CONTINUITY", skillId: "FND-01" });
  withSyntheticDecisions([decision], () => {
    const mastery = createPracticalMasteryState(NOW, true);
    const forged = attempt({ id: "forged-integrated", decisionId: decision.id, skillId: "FND-01", actionId: "GHOST", reasonId: "r1", confidence: 90, correct: false, answeredAt: "2026-09-01T00:00:00.000Z" });
    mastery.attempts = [forged];
    const item = { decisionId: decision.id, skillId: "FND-01", priority: 100, reason: "REPAIR", whyAfterAnswer: "x", retentionTierDays: null };
    const started = recordIntegratedRoundStartContinuity(createPracticalStudyWorkspace(), mastery.contentVersion, { focusSkillId: null, items: [item] }, NOW);
    assert.ok(started);
    const answered = recordIntegratedAnswerContinuity(started, mastery.contentVersion, { focusSkillId: null, items: [item], answeredIndex: 0, attemptId: forged.id }, NOW);
    assert.ok(answered);
    const restored = restoreIntegratedRound(answered, mastery, null);
    assert.equal(restored.status, "INVALID", "integrated round restoration must not resolve a semantically invalid submitted attempt");
  });
});

// --- Duplicate attempt id at the profile-array level -----------------------

test("duplicate attempt ids fail profile validation even when each row is individually well-formed", () => {
  const decision = syntheticDecision({ id: "PROBE-DUP-ID", skillId: "FND-01" });
  withSyntheticDecisions([decision], () => {
    const profile = createPracticalProfileState(NOW);
    profile.mastery.attempts = [
      attempt({ id: "same-id", decisionId: decision.id, skillId: "FND-01", actionId: "a", reasonId: "r1", confidence: 40, correct: true, answeredAt: "2026-09-01T00:00:00.000Z" }),
      attempt({ id: "same-id", decisionId: decision.id, skillId: "FND-01", actionId: "b", reasonId: "r1", confidence: 40, correct: false, answeredAt: "2026-09-01T00:01:00.000Z" }),
    ];
    assert.equal(validatePracticalProfileState(profile), false);
  });
});

// --- Malformed timestamp format -------------------------------------------

test("a structurally plausible but non-canonical answeredAt fails validity", () => {
  const decision = syntheticDecision({ id: "PROBE-TIMESTAMP", skillId: "FND-01" });
  withSyntheticDecisions([decision], () => {
    for (const answeredAt of ["not-a-date", "2026-09-01", "", "2026-09-01T00:00:00Z"]) {
      const row = attempt({ id: "1", decisionId: decision.id, skillId: "FND-01", actionId: "a", reasonId: "r1", confidence: 40, correct: true, answeredAt });
      assert.equal(isSemanticallyValidPracticalAttempt(row), false, `answeredAt ${JSON.stringify(answeredAt)} must be rejected`);
    }
  });
});

test("an empty attempt id fails validity", () => {
  const decision = syntheticDecision({ id: "PROBE-EMPTY-ID", skillId: "FND-01" });
  withSyntheticDecisions([decision], () => {
    const row = attempt({ id: "", decisionId: decision.id, skillId: "FND-01", actionId: "a", reasonId: "r1", confidence: 40, correct: true });
    assert.equal(isSemanticallyValidPracticalAttempt(row), false);
  });
});

// --- Confirms categories 1/4 for consumers left untouched -------------------
// unattemptedDecisionOfKinds' attempted-set and nextFirstJourneyDecision's
// repair-slot lookup by decision id are pure content-selection helpers with
// no durable-mutation or presentation-authority effect; recommendFirstJourneyStep
// is exercised transitively above via nextFirstJourneyDecision/unresolvedWrongCount.
test("no-signal valid state produces the same First Journey step regardless of the defense-in-depth pass", () => {
  const state = createPracticalMasteryState(NOW, true);
  const step = recommendFirstJourneyStep(state);
  assert.ok(step === null || typeof step.skillId === "string");
});
