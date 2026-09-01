import assert from "node:assert/strict";
import test from "node:test";

import { practicalDecisionById } from "../content/practical-mastery/index.ts";
import { emptyLearnerState } from "../lib/model-core.ts";
import {
  createPracticalMasteryState,
  isSemanticallyValidPracticalAttempt,
  practicalRepairQueue,
  recommendNextPracticalSkill,
  recordPracticalDecision,
} from "../lib/practical-mastery-core.ts";
import {
  practicalMisconceptionEvidenceFamilies,
  selectedWrongPracticalMisconceptionIds,
} from "../lib/practical-current-mistakes.ts";
import {
  PRACTICAL_PROFILE_FIELD,
  practicalProfileSafeSuccessor,
  validatePracticalProfileState,
} from "../lib/practical-profile-contract.ts";
import {
  createPracticalProfileState,
  practicalProfileFromLearnerState,
  withPracticalProfile,
} from "../lib/practical-profile-state.ts";

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

test("A unknown action option is semantically invalid and contributes nothing to the scheduler", () => {
  const decision = syntheticDecision({ id: "INTEGRITY-A", skillId: "FND-01" });
  withSyntheticDecisions([decision], () => {
    const row = attempt({ id: "1", decisionId: decision.id, skillId: "FND-01", actionId: "NOT_A_REAL_OPTION", reasonId: "r1", confidence: 90 });
    assert.equal(isSemanticallyValidPracticalAttempt(row), false);
    const state = createPracticalMasteryState(NOW, true);
    state.attempts = [row];
    assert.deepEqual(practicalMisconceptionEvidenceFamilies(state), []);
    assert.deepEqual(practicalRepairQueue(state), []);
  });
});

test("B unknown reason option is semantically invalid and contributes nothing to the scheduler", () => {
  const decision = syntheticDecision({ id: "INTEGRITY-B", skillId: "FND-01" });
  withSyntheticDecisions([decision], () => {
    const row = attempt({ id: "1", decisionId: decision.id, skillId: "FND-01", actionId: "b", reasonId: "NOT_A_REAL_OPTION", confidence: 90 });
    assert.equal(isSemanticallyValidPracticalAttempt(row), false);
    const state = createPracticalMasteryState(NOW, true);
    state.attempts = [row];
    assert.deepEqual(practicalMisconceptionEvidenceFamilies(state), []);
    assert.deepEqual(practicalRepairQueue(state), []);
  });
});

test("C canonical decision / wrong skill mismatch is semantically invalid", () => {
  const decision = syntheticDecision({ id: "INTEGRITY-C", skillId: "FND-01" });
  withSyntheticDecisions([decision], () => {
    const row = attempt({ id: "1", decisionId: decision.id, skillId: "FND-02", actionId: "b", reasonId: "r1", confidence: 90 });
    assert.equal(isSemanticallyValidPracticalAttempt(row), false);
    const state = createPracticalMasteryState(NOW, true);
    state.attempts = [row];
    assert.deepEqual(practicalRepairQueue(state), []);
  });
});

test("D forged correct flag is semantically invalid regardless of direction", () => {
  const decision = syntheticDecision({ id: "INTEGRITY-D", skillId: "FND-01" });
  withSyntheticDecisions([decision], () => {
    // actually wrong (b/r1 != a/r1) but persisted as correct: true.
    const forgedTrue = attempt({ id: "1", decisionId: decision.id, skillId: "FND-01", actionId: "b", reasonId: "r1", confidence: 90, correct: true });
    // actually correct (a/r1) but persisted as correct: false.
    const forgedFalse = attempt({ id: "2", decisionId: decision.id, skillId: "FND-01", actionId: "a", reasonId: "r1", confidence: 90, correct: false });
    assert.equal(isSemanticallyValidPracticalAttempt(forgedTrue), false);
    assert.equal(isSemanticallyValidPracticalAttempt(forgedFalse), false);
  });
});

test("E unknown decision id is semantically invalid", () => {
  const row = attempt({ id: "1", decisionId: "NOT-A-CANONICAL-DECISION", skillId: "FND-01", actionId: "b", reasonId: "r1", confidence: 90 });
  assert.equal(isSemanticallyValidPracticalAttempt(row), false);
  const state = createPracticalMasteryState(NOW, true);
  state.attempts = [row];
  assert.deepEqual(practicalRepairQueue(state), []);
});

test("F malformed confidence is semantically invalid", () => {
  const decision = syntheticDecision({ id: "INTEGRITY-F", skillId: "FND-01" });
  withSyntheticDecisions([decision], () => {
    for (const confidence of [-1, 101, 1.5, NaN, Infinity, -Infinity]) {
      const row = attempt({ id: "1", decisionId: decision.id, skillId: "FND-01", actionId: "b", reasonId: "r1", confidence });
      assert.equal(isSemanticallyValidPracticalAttempt(row), false, `confidence ${confidence} must be rejected`);
    }
    // Non-number confidence (e.g. injected via untyped persistence) must also fail closed.
    const wrongType = attempt({ id: "2", decisionId: decision.id, skillId: "FND-01", actionId: "b", reasonId: "r1", confidence: "90" });
    assert.equal(isSemanticallyValidPracticalAttempt(wrongType), false);
  });
});

test("G a valid untagged wrong attempt remains legitimate scheduler-only repair evidence", () => {
  const decision = syntheticDecision({ id: "INTEGRITY-G", skillId: "FND-01", actionWrongTag: null, reasonWrongTag: null });
  withSyntheticDecisions([decision], () => {
    const row = attempt({ id: "1", decisionId: decision.id, skillId: "FND-01", actionId: "b", reasonId: "r1", confidence: 90 });
    assert.equal(isSemanticallyValidPracticalAttempt(row), true);
    assert.deepEqual(selectedWrongPracticalMisconceptionIds(row), []);
    const state = createPracticalMasteryState(NOW, true);
    state.attempts = [row];
    assert.deepEqual(practicalRepairQueue(state), ["FND-01"]);
    assert.match(recommendNextPracticalSkill(state)?.whyNow ?? "", /Repair now:/);
  });
});

test("H a malformed latest attempt fails closed without resurrecting older valid evidence for the same decision", () => {
  const decision = syntheticDecision({ id: "INTEGRITY-H", skillId: "FND-01" });
  withSyntheticDecisions([decision], () => {
    const state = createPracticalMasteryState(NOW, true);
    state.attempts = [
      attempt({ id: "1", decisionId: decision.id, skillId: "FND-01", actionId: "b", reasonId: "r1", confidence: 40, answeredAt: "2026-09-01T00:00:00.000Z" }),
      // Later, malformed: unknown action option. This is now the latest row
      // for this decisionId and must fail closed, not fall back to the
      // still-technically-present older valid row above.
      attempt({ id: "2", decisionId: decision.id, skillId: "FND-01", actionId: "GHOST", reasonId: "r1", confidence: 90, answeredAt: "2026-09-01T00:01:00.000Z" }),
    ];
    assert.deepEqual(practicalMisconceptionEvidenceFamilies(state), []);
    assert.deepEqual(practicalRepairQueue(state), []);
    assert.doesNotMatch(recommendNextPracticalSkill(state)?.whyNow ?? "", /Repair now:/);
  });
});

test("I a malformed attempt constructed directly on scheduler state cannot outrank or bias a genuinely-evidenced skill", () => {
  const genuine = syntheticDecision({ id: "INTEGRITY-I-GENUINE", skillId: "FND-03" });
  const target = syntheticDecision({ id: "INTEGRITY-I-TARGET", skillId: "FND-01" });
  withSyntheticDecisions([genuine, target], () => {
    const state = createPracticalMasteryState(NOW, true);
    state.attempts = [
      attempt({ id: "1", decisionId: genuine.id, skillId: "FND-03", actionId: "b", reasonId: "r1", confidence: 40 }),
      // Constructed directly on the mastery state, outside recordPracticalDecision
      // and outside profile validation, with a fabricated high confidence and an
      // action option that does not exist on the canonical decision.
      attempt({ id: "2", decisionId: target.id, skillId: "FND-01", actionId: "GHOST_OPTION", reasonId: "r1", confidence: 99, correct: false }),
    ];
    assert.equal(isSemanticallyValidPracticalAttempt(state.attempts[1]), false);
    assert.deepEqual(practicalRepairQueue(state), ["FND-03"]);
    const recommendation = recommendNextPracticalSkill(state);
    assert.equal(recommendation?.skillId, "FND-03");
    assert.match(recommendation?.whyNow ?? "", /Repair now:/);
  });
});

test("J a malformed persisted profile fails closed at profile validation", () => {
  const decision = syntheticDecision({ id: "INTEGRITY-J", skillId: "FND-01" });
  withSyntheticDecisions([decision], () => {
    const profile = createPracticalProfileState(NOW);
    profile.mastery.attempts = [
      attempt({ id: "1", decisionId: decision.id, skillId: "FND-01", actionId: "GHOST", reasonId: "r1", confidence: 90 }),
    ];
    assert.equal(validatePracticalProfileState(profile), false);

    const validLearner = withPracticalProfile(emptyLearnerState(), createPracticalProfileState(NOW), NOW);
    const corrupted = structuredClone(validLearner);
    corrupted[PRACTICAL_PROFILE_FIELD].mastery.attempts = profile.mastery.attempts;
    assert.throws(() => practicalProfileFromLearnerState(corrupted));
    assert.throws(() => withPracticalProfile(emptyLearnerState(), corrupted[PRACTICAL_PROFILE_FIELD], NOW));
  });
});

test("K a valid export/import profile round trip still validates", () => {
  const decision = syntheticDecision({ id: "INTEGRITY-K", skillId: "FND-01" });
  withSyntheticDecisions([decision], () => {
    const profile = createPracticalProfileState(NOW);
    profile.mastery = recordPracticalDecision(profile.mastery, { decisionId: decision.id, actionId: "b", reasonId: "r1", confidence: 40, now: NOW });
    const roundTripped = JSON.parse(JSON.stringify(profile));
    assert.equal(validatePracticalProfileState(roundTripped), true);
  });
});

test("L a legitimate profile advance remains a safe successor; the same advance corrupted with an invalid row is not", () => {
  const decision = syntheticDecision({ id: "INTEGRITY-L", skillId: "FND-01" });
  withSyntheticDecisions([decision], () => {
    const baseProfile = createPracticalProfileState(NOW);
    const baseLearner = withPracticalProfile(emptyLearnerState(), baseProfile, NOW);

    const advancedMastery = recordPracticalDecision(baseProfile.mastery, { decisionId: decision.id, actionId: "b", reasonId: "r1", confidence: 40, now: NOW });
    const advancedProfile = { ...baseProfile, mastery: advancedMastery };
    const advancedLearner = withPracticalProfile(baseLearner, advancedProfile, new Date(NOW.getTime() + 1000));
    assert.equal(practicalProfileSafeSuccessor(advancedLearner, baseLearner), true);

    const corruptedLearner = structuredClone(advancedLearner);
    corruptedLearner[PRACTICAL_PROFILE_FIELD].mastery.attempts.push(
      attempt({ id: "corrupt", decisionId: decision.id, skillId: "FND-01", actionId: "GHOST", reasonId: "r1", confidence: 90, answeredAt: "2026-09-01T00:05:00.000Z" }),
    );
    assert.equal(practicalProfileSafeSuccessor(corruptedLearner, baseLearner), false);
  });
});

test("N a valid no-signal profile recommends exactly as if the integrity gate were never exercised", () => {
  const emptyState = createPracticalMasteryState(NOW, true);
  assert.deepEqual(practicalRepairQueue(emptyState), []);
  assert.doesNotMatch(recommendNextPracticalSkill(emptyState)?.whyNow ?? "", /Repair now:/);

  const decision = syntheticDecision({ id: "INTEGRITY-N", skillId: "FND-01" });
  withSyntheticDecisions([decision], () => {
    const correctOnly = createPracticalMasteryState(NOW, true);
    correctOnly.attempts = [attempt({ id: "1", decisionId: decision.id, skillId: "FND-01", actionId: "a", reasonId: "r1", confidence: 40, correct: true })];
    assert.deepEqual(practicalRepairQueue(correctOnly), []);
    assert.doesNotMatch(recommendNextPracticalSkill(correctOnly)?.whyNow ?? "", /Repair now:/);
  });
});
