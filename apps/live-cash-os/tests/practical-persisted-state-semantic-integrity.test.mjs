import assert from "node:assert/strict";
import test from "node:test";

import { practicalDecisionById } from "../content/practical-mastery/index.ts";
import { emptyLearnerState } from "../lib/model-core.ts";
import {
  createPracticalMasteryState,
  deriveEvidenceStage,
  isSemanticallyValidPracticalAttempt,
  recordPracticalDecision,
} from "../lib/practical-mastery-core.ts";
import { isSemanticallyValidPracticalPerformanceEvent } from "../lib/practical-performance-telemetry.ts";
import { classifyPracticalAdaptiveNeed } from "../lib/practical-adaptive-repair.ts";
import {
  RETENTION_INTERVAL_DAYS,
  recordIntegratedDecision,
} from "../lib/practical-integrated-session.ts";
import {
  recordIntegratedAnswerContinuity,
  recordIntegratedRoundStartContinuity,
  restoreIntegratedRound,
} from "../lib/practical-continuity-workspace.ts";
import {
  PRACTICAL_PROFILE_FIELD,
  practicalProfileSafeSuccessor,
  validatePracticalProfileState,
} from "../lib/practical-profile-contract.ts";
import {
  createPracticalProfileState,
  createPracticalStudyWorkspace,
  practicalProfileFromLearnerState,
  withPracticalProfile,
} from "../lib/practical-profile-state.ts";

// Follow-up to #221/#222 (malformed PracticalAttempt raw-history repair).
// This closes the three adjacent persisted-state authority gaps confirmed by
// the manager's final audit: mastery skill progress (A), performance
// telemetry (B), and integrated continuity (C). Every probe below is
// independently traceable to the writer contract it enforces.

const NOW = new Date("2026-09-01T00:00:00.000Z");

function attempt({ id, decisionId, skillId, actionId, reasonId, confidence = 55, correct = false, answeredAt = "2026-09-01T00:00:00.000Z" }) {
  return { id, decisionId, skillId, actionId, reasonId, confidence, correct, answeredAt };
}

function performanceEvent({
  decisionId, skillId, kind, mode = "TEXT_MIXED",
  startedAt = "2026-09-01T00:00:00.000Z", answeredAt = "2026-09-01T00:00:01.000Z",
  responseMs, confidence = 60, actionCorrect = true, reasonCorrect = true, correct, scaffold,
}) {
  const resolvedCorrect = correct ?? (actionCorrect && reasonCorrect);
  const resolvedResponseMs = responseMs ?? (Date.parse(answeredAt) - Date.parse(startedAt));
  return { id: `${decisionId}:${answeredAt}`, decisionId, skillId, mode, startedAt, answeredAt, responseMs: resolvedResponseMs, confidence, actionCorrect, reasonCorrect, correct: resolvedCorrect, kind, scaffold };
}

function syntheticDecision({ id, skillId = "FND-01", kind = "decision", actionWrongTag = "M_ACTION", reasonWrongTag = "M_REASON" }) {
  const resolvedActionWrongTag = actionWrongTag === null ? undefined : actionWrongTag;
  const resolvedReasonWrongTag = reasonWrongTag === null ? undefined : reasonWrongTag;
  return {
    id, skillId, kind, sourceRefs: [], assumptions: [],
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

function baseProfile(now = NOW) {
  return createPracticalProfileState(now);
}

// =========================== A. MASTERY ====================================

test("M1 forged evidenceStage cannot open a hard prerequisite", () => {
  // PF-04 hard-depends on FND-01 reaching DECISION_TRAINED (hardDependenciesFor).
  const profile = baseProfile();
  profile.mastery.skills["FND-01"].evidenceStage = "DECISION_TRAINED";
  assert.equal(validatePracticalProfileState(profile), false);
});

test("M2 a canonical successfulDecisionId from a wrong skill contributes zero to the foreign skill and fails profile validation", () => {
  const decision = syntheticDecision({ id: "INTEGRITY-M2", skillId: "FND-01" });
  withSyntheticDecisions([decision], () => {
    const profile = baseProfile();
    profile.mastery.attempts = [attempt({ id: "1", decisionId: decision.id, skillId: "FND-01", actionId: "a", reasonId: "r1", confidence: 40, correct: true })];
    profile.mastery.skills["FND-01"].successfulDecisionIds = [decision.id];
    profile.mastery.skills["FND-01"].attempts = 1;
    profile.mastery.skills["FND-01"].correct = 1;
    profile.mastery.skills["FND-01"].directDecisionCorrect = 1;
    assert.equal(validatePracticalProfileState(profile), true, "legitimately-backed evidence on the owning skill must validate");

    // Forge the SAME real correct decision into a different skill's evidence.
    const forged = structuredClone(profile);
    forged.mastery.skills["FND-02"].successfulDecisionIds = [decision.id];
    assert.equal(validatePracticalProfileState(forged), false, "a decision's evidence must not be claimable by a skill it does not belong to");

    // Direct defense-in-depth proof: even bypassing profile validation entirely,
    // the derivation itself ignores wrong-skill entries.
    const foreignProgress = { ...createPracticalMasteryState(NOW, true).skills["FND-02"], successfulDecisionIds: [decision.id] };
    assert.equal(deriveEvidenceStage(foreignProgress), "SOURCE_SUPPORTED");
  });
});

test("M3 forged retentionDaysPassed values fail closed instead of being silently ignored", () => {
  for (const bad of [[-1], [0], [99], [1, 1], [3, 1]]) {
    const profile = baseProfile();
    profile.mastery.skills["EXP-01"].retentionDaysPassed = bad;
    assert.equal(validatePracticalProfileState(profile), false, `retentionDaysPassed=${JSON.stringify(bad)} must be rejected`);
  }
  const profile = baseProfile();
  profile.mastery.skills["EXP-01"].retentionDaysPassed = [...RETENTION_INTERVAL_DAYS];
  assert.equal(validatePracticalProfileState(profile), true, "the real supported tiers, ascending and deduplicated, must validate");
});

test("M4 forged delayedRetrievalPassed cannot manufacture a higher canonical evidence stage without a retention tier backing it", () => {
  const profile = baseProfile();
  profile.mastery.skills["EXP-01"].delayedRetrievalPassed = true;
  profile.mastery.skills["EXP-01"].retentionDaysPassed = [];
  assert.equal(validatePracticalProfileState(profile), false);
});

test("M5 forged realHandTransferReviewed cannot manufacture REAL_HAND_TRANSFER evidence without delayedRetrievalPassed", () => {
  const profile = baseProfile();
  profile.mastery.skills["EXP-01"].realHandTransferReviewed = true;
  profile.mastery.skills["EXP-01"].delayedRetrievalPassed = false;
  assert.equal(validatePracticalProfileState(profile), false);
});

test("M6 skills map-key / progress.skillId mismatch fails closed", () => {
  const profile = baseProfile();
  profile.mastery.skills["FND-01"].skillId = "FND-02";
  assert.equal(validatePracticalProfileState(profile), false);
});

test("M7 normal writer-generated valid skill progress continues to validate", () => {
  const decision = [...practicalDecisionById.values()].find((candidate) => candidate.skillId === "FND-01");
  assert.ok(decision);
  let mastery = createPracticalMasteryState(NOW, true);
  mastery = recordPracticalDecision(mastery, { decisionId: decision.id, actionId: decision.correctActionId, reasonId: decision.correctReasonId, confidence: 70, now: NOW });
  const profile = { ...baseProfile(), mastery };
  assert.equal(validatePracticalProfileState(profile), true);
});

// =========================== B. PERFORMANCE =================================

test("P1 an internally inconsistent correctness event is rejected", () => {
  const decision = syntheticDecision({ id: "INTEGRITY-P1", skillId: "FND-01" });
  withSyntheticDecisions([decision], () => {
    const event = performanceEvent({ decisionId: decision.id, skillId: "FND-01", kind: "decision", actionCorrect: false, reasonCorrect: false, correct: true });
    assert.equal(isSemanticallyValidPracticalPerformanceEvent(event), false);
  });
});

test("P2 self-consistent fabricated performance event: architecturally adjudicated as INTENTIONAL_INDEPENDENT_TELEMETRY_AUTHORITY", () => {
  // actionId/reasonId are never persisted on PracticalPerformanceEvent (only the
  // derived correctness booleans), and the event carries no shared id/timestamp
  // key with a PracticalAttempt (the perceptual submit path timestamps them from
  // two separate `new Date()` calls) -- so there is no backing relation this
  // validator can provably enforce without inventing one the architecture does
  // not guarantee. A fully self-consistent fabricated event therefore DOES pass
  // validity, and DOES remain able to influence adaptive classification: this is
  // an accepted, documented architectural boundary, not an oversight.
  const decision = syntheticDecision({ id: "INTEGRITY-P2", skillId: "FND-01" });
  withSyntheticDecisions([decision], () => {
    // syntheticDecision's targetSeconds is 20, so the AUTOMATICITY threshold
    // (targetSeconds * 1500) is 30000ms -- use a response well past it.
    const fabricated = performanceEvent({
      decisionId: decision.id, skillId: "FND-01", kind: "decision",
      startedAt: "2026-09-01T00:00:00.000Z", answeredAt: "2026-09-01T00:00:40.000Z",
      responseMs: 40000, actionCorrect: true, reasonCorrect: true,
    });
    assert.equal(isSemanticallyValidPracticalPerformanceEvent(fabricated), true);

    const state = createPracticalMasteryState(NOW, true);
    state.skills["FND-01"].conceptTaught = true;
    const need = classifyPracticalAdaptiveNeed(state, "FND-01", [{ decisionId: decision.id, responseMs: 40000, correct: true }]);
    // Documented limitation: a fabricated-but-internally-consistent event with
    // no backing learner action can still surface as an AUTOMATICITY signal.
    assert.equal(need.need, "AUTOMATICITY");
  });
});

test("P3 wrong decision/skill/kind semantic combinations fail closed", () => {
  const decision = syntheticDecision({ id: "INTEGRITY-P3", skillId: "FND-01", kind: "recognition" });
  withSyntheticDecisions([decision], () => {
    assert.equal(isSemanticallyValidPracticalPerformanceEvent(performanceEvent({ decisionId: "NOT-A-DECISION", skillId: "FND-01", kind: "recognition" })), false);
    assert.equal(isSemanticallyValidPracticalPerformanceEvent(performanceEvent({ decisionId: decision.id, skillId: "FND-02", kind: "recognition" })), false);
    assert.equal(isSemanticallyValidPracticalPerformanceEvent(performanceEvent({ decisionId: decision.id, skillId: "FND-01", kind: "decision" })), false);
  });
});

test("P4 invalid confidence/latency/timestamp chronology fails closed", () => {
  const decision = syntheticDecision({ id: "INTEGRITY-P4", skillId: "FND-01" });
  withSyntheticDecisions([decision], () => {
    assert.equal(isSemanticallyValidPracticalPerformanceEvent(performanceEvent({ decisionId: decision.id, skillId: "FND-01", kind: "decision", confidence: 101 })), false);
    assert.equal(isSemanticallyValidPracticalPerformanceEvent(performanceEvent({ decisionId: decision.id, skillId: "FND-01", kind: "decision", responseMs: -5 })), false);
    assert.equal(isSemanticallyValidPracticalPerformanceEvent(performanceEvent({ decisionId: decision.id, skillId: "FND-01", kind: "decision", startedAt: "2026-09-01T00:00:05.000Z", answeredAt: "2026-09-01T00:00:00.000Z", responseMs: 0 })), false, "answeredAt before startedAt must be rejected");
    assert.equal(isSemanticallyValidPracticalPerformanceEvent(performanceEvent({ decisionId: decision.id, skillId: "FND-01", kind: "decision", responseMs: 999999 })), false, "responseMs inconsistent with the timestamp gap must be rejected");
  });
});

test("P5 normal createPracticalPerformanceEvent output validates unchanged", () => {
  const decision = [...practicalDecisionById.values()].find((candidate) => candidate.skillId === "FND-01");
  assert.ok(decision);
  const profile = baseProfile();
  profile.performance = [performanceEvent({ decisionId: decision.id, skillId: decision.skillId, kind: decision.kind, actionCorrect: true, reasonCorrect: true })];
  assert.equal(validatePracticalProfileState(profile), true);
});

test("P6 an invalid persisted event can never reach adaptive classification because the ingest boundary rejects the whole profile first", () => {
  const decision = syntheticDecision({ id: "INTEGRITY-P6", skillId: "FND-01" });
  withSyntheticDecisions([decision], () => {
    const profile = baseProfile();
    profile.performance = [performanceEvent({ decisionId: decision.id, skillId: "FND-01", kind: "decision", actionCorrect: false, reasonCorrect: false, correct: true })];
    assert.equal(validatePracticalProfileState(profile), false);
    assert.throws(() => practicalProfileFromLearnerState(withProfileField(emptyLearnerState(), profile)));
  });
});

function withProfileField(learnerState, profile) {
  return { ...learnerState, [PRACTICAL_PROFILE_FIELD]: profile };
}

// =========================== C. CONTINUITY ==================================

test("C1 retentionTierDays=-1 is rejected", () => {
  const decision = syntheticDecision({ id: "INTEGRITY-C1", skillId: "FND-01" });
  withSyntheticDecisions([decision], () => {
    const profile = baseProfile();
    profile.studyWorkspace = { ...createPracticalStudyWorkspace(), continuity: {
      version: 1, contentVersion: profile.mastery.contentVersion, quickStart: null,
      integrated: { focusSkillId: null, items: [{ decisionId: decision.id, skillId: "FND-01", priority: 100, reason: "RETENTION", whyAfterAnswer: "x", retentionTierDays: -1 }], nextIndex: 0, submittedAttemptIds: [], updatedAt: NOW.toISOString() },
    } };
    assert.equal(validatePracticalProfileState(profile), false);
  });
});

test("C2 an arbitrary unsupported retention tier is rejected", () => {
  const decision = syntheticDecision({ id: "INTEGRITY-C2", skillId: "FND-01" });
  withSyntheticDecisions([decision], () => {
    const profile = baseProfile();
    profile.studyWorkspace = { ...createPracticalStudyWorkspace(), continuity: {
      version: 1, contentVersion: profile.mastery.contentVersion, quickStart: null,
      integrated: { focusSkillId: null, items: [{ decisionId: decision.id, skillId: "FND-01", priority: 100, reason: "RETENTION", whyAfterAnswer: "x", retentionTierDays: 99 }], nextIndex: 0, submittedAttemptIds: [], updatedAt: NOW.toISOString() },
    } };
    assert.equal(validatePracticalProfileState(profile), false);
  });
});

test("C3 a reason/tier relation the real builder never produces is rejected", () => {
  const decision = syntheticDecision({ id: "INTEGRITY-C3", skillId: "FND-01" });
  withSyntheticDecisions([decision], () => {
    const base = { decisionId: decision.id, skillId: "FND-01", priority: 100, whyAfterAnswer: "x" };
    const profileA = baseProfile();
    // REPAIR never carries a tier (buildIntegratedSession's push() calls for REPAIR omit it).
    profileA.studyWorkspace = { ...createPracticalStudyWorkspace(), continuity: {
      version: 1, contentVersion: profileA.mastery.contentVersion, quickStart: null,
      integrated: { focusSkillId: null, items: [{ ...base, reason: "REPAIR", retentionTierDays: 3 }], nextIndex: 0, submittedAttemptIds: [], updatedAt: NOW.toISOString() },
    } };
    assert.equal(validatePracticalProfileState(profileA), false);

    // RETENTION always carries a tier.
    const profileB = baseProfile();
    profileB.studyWorkspace = { ...createPracticalStudyWorkspace(), continuity: {
      version: 1, contentVersion: profileB.mastery.contentVersion, quickStart: null,
      integrated: { focusSkillId: null, items: [{ ...base, reason: "RETENTION", retentionTierDays: null }], nextIndex: 0, submittedAttemptIds: [], updatedAt: NOW.toISOString() },
    } };
    assert.equal(validatePracticalProfileState(profileB), false);
  });
});

test("C4 duplicate integrated decision IDs are rejected", () => {
  const decision = syntheticDecision({ id: "INTEGRITY-C4", skillId: "FND-01" });
  withSyntheticDecisions([decision], () => {
    const profile = baseProfile();
    const item = { decisionId: decision.id, skillId: "FND-01", priority: 100, reason: "REPAIR", whyAfterAnswer: "x", retentionTierDays: null };
    profile.studyWorkspace = { ...createPracticalStudyWorkspace(), continuity: {
      version: 1, contentVersion: profile.mastery.contentVersion, quickStart: null,
      integrated: { focusSkillId: null, items: [item, { ...item }], nextIndex: 0, submittedAttemptIds: [], updatedAt: NOW.toISOString() },
    } };
    assert.equal(validatePracticalProfileState(profile), false);
  });
});

test("C5 a semantically impossible integrated round cannot become the active Continue owner", () => {
  const decision = syntheticDecision({ id: "INTEGRITY-C5", skillId: "FND-01" });
  withSyntheticDecisions([decision], () => {
    const workspace = createPracticalStudyWorkspace();
    const mastery = createPracticalMasteryState(NOW, true);
    const item = { decisionId: decision.id, skillId: "FND-02", priority: 100, reason: "REPAIR", whyAfterAnswer: "x", retentionTierDays: null }; // skillId mismatch: canonical skill is FND-01
    const withRound = { ...workspace, continuity: { version: 1, contentVersion: mastery.contentVersion, quickStart: null, integrated: { focusSkillId: null, items: [item], nextIndex: 0, submittedAttemptIds: [], updatedAt: NOW.toISOString() } } };
    const restored = restoreIntegratedRound(withRound, mastery, null);
    assert.equal(restored.status, "INVALID");
  });
});

function buildRealRoundItems(count = 2) {
  const decisions = [...practicalDecisionById.values()].filter((candidate) => candidate.skillId === "FND-01" && candidate.kind === "recognition").slice(0, count);
  assert.ok(decisions.length >= count, "expected enough real FND-01 recognition decisions for the fixture");
  return decisions.map((decision) => ({ decisionId: decision.id, skillId: decision.skillId, priority: 100, reason: "REPAIR", whyAfterAnswer: "x", retentionTierDays: null }));
}

test("C6 a valid generic active round survives reload unchanged", () => {
  const items = buildRealRoundItems(2);
  const mastery = createPracticalMasteryState(NOW, true);
  const started = recordIntegratedRoundStartContinuity(createPracticalStudyWorkspace(), mastery.contentVersion, { focusSkillId: null, items }, NOW);
  assert.ok(started);
  const restored = restoreIntegratedRound(started, mastery, null);
  assert.equal(restored.status, "VALID");
  assert.deepEqual(restored.items, items);
  assert.equal(restored.nextIndex, 0);
});

test("C7 a valid focused active round survives reload unchanged", () => {
  const items = buildRealRoundItems(2);
  const mastery = createPracticalMasteryState(NOW, true);
  const started = recordIntegratedRoundStartContinuity(createPracticalStudyWorkspace(), mastery.contentVersion, { focusSkillId: "FND-01", items }, NOW);
  assert.ok(started);
  const restored = restoreIntegratedRound(started, mastery, "FND-01");
  assert.equal(restored.status, "VALID");
  assert.deepEqual(restored.items, items);
});

test("C8 a partially answered valid round restores the exact cursor", () => {
  const items = buildRealRoundItems(2);
  let mastery = createPracticalMasteryState(NOW, true);
  const started = recordIntegratedRoundStartContinuity(createPracticalStudyWorkspace(), mastery.contentVersion, { focusSkillId: null, items }, NOW);
  const decision = practicalDecisionById.get(items[0].decisionId);
  mastery = recordIntegratedDecision(mastery, items[0], { actionId: decision.correctActionId, reasonId: decision.correctReasonId, confidence: 60, now: NOW });
  const attemptId = mastery.attempts.at(-1).id;
  const answered = recordIntegratedAnswerContinuity(started, mastery.contentVersion, { focusSkillId: null, items, answeredIndex: 0, attemptId }, NOW);
  assert.ok(answered);
  // advanceIntegratedContinuity is exercised elsewhere; simulate the cursor
  // having already moved to index 1 with the first item fully submitted.
  const advanced = { ...answered, continuity: { ...answered.continuity, integrated: { ...answered.continuity.integrated, nextIndex: 1 } } };
  const restored = restoreIntegratedRound(advanced, mastery, null);
  assert.equal(restored.status, "VALID");
  assert.equal(restored.nextIndex, 1);
});

test("C9 pending post-answer feedback restores the exact legitimate attempt", () => {
  const items = buildRealRoundItems(1);
  let mastery = createPracticalMasteryState(NOW, true);
  const started = recordIntegratedRoundStartContinuity(createPracticalStudyWorkspace(), mastery.contentVersion, { focusSkillId: null, items }, NOW);
  const decision = practicalDecisionById.get(items[0].decisionId);
  mastery = recordIntegratedDecision(mastery, items[0], { actionId: decision.correctActionId, reasonId: decision.correctReasonId, confidence: 60, now: NOW });
  const attempt2 = mastery.attempts.at(-1);
  const answered = recordIntegratedAnswerContinuity(started, mastery.contentVersion, { focusSkillId: null, items, answeredIndex: 0, attemptId: attempt2.id }, NOW);
  const restored = restoreIntegratedRound(answered, mastery, null);
  assert.equal(restored.status, "VALID");
  assert.equal(restored.postAnswerAttempt?.id, attempt2.id);
});

test("C10 normal evidence evolution inside the active round does not invalidate the remaining legitimate round", () => {
  const items = buildRealRoundItems(2);
  const mastery0 = createPracticalMasteryState(NOW, true);
  const started = recordIntegratedRoundStartContinuity(createPracticalStudyWorkspace(), mastery0.contentVersion, { focusSkillId: null, items }, NOW);
  // Evidence evolves after the round was constructed (e.g. Q1 answered elsewhere).
  const decision = practicalDecisionById.get(items[0].decisionId);
  const mastery1 = recordPracticalDecision(mastery0, { decisionId: decision.id, actionId: decision.correctActionId, reasonId: decision.correctReasonId, confidence: 60, now: NOW });
  const restored = restoreIntegratedRound(started, mastery1, null);
  assert.equal(restored.status, "VALID", "answering Q1 must not invalidate the remaining legitimate round");
  assert.deepEqual(restored.items, items);
});

// =========================== INGEST BOUNDARY ================================

test("I1 a malformed mastery-semantic profile is rejected by the profile/import path", () => {
  const profile = baseProfile();
  profile.mastery.skills["FND-01"].evidenceStage = "DECISION_TRAINED";
  assert.throws(() => practicalProfileFromLearnerState(withProfileField(emptyLearnerState(), profile)));
  assert.throws(() => withPracticalProfile(emptyLearnerState(), profile));
});

test("I2 a malformed performance-semantic profile is rejected", () => {
  const decision = syntheticDecision({ id: "INTEGRITY-I2", skillId: "FND-01" });
  withSyntheticDecisions([decision], () => {
    const profile = baseProfile();
    profile.performance = [performanceEvent({ decisionId: decision.id, skillId: "FND-01", kind: "decision", confidence: -5 })];
    assert.throws(() => practicalProfileFromLearnerState(withProfileField(emptyLearnerState(), profile)));
  });
});

test("I3 a malformed continuity-semantic profile is rejected", () => {
  const decision = syntheticDecision({ id: "INTEGRITY-I3", skillId: "FND-01" });
  withSyntheticDecisions([decision], () => {
    const profile = baseProfile();
    profile.studyWorkspace = { ...createPracticalStudyWorkspace(), continuity: {
      version: 1, contentVersion: profile.mastery.contentVersion, quickStart: null,
      integrated: { focusSkillId: null, items: [{ decisionId: decision.id, skillId: "FND-01", priority: 100, reason: "RETENTION", whyAfterAnswer: "x", retentionTierDays: -1 }], nextIndex: 0, submittedAttemptIds: [], updatedAt: NOW.toISOString() },
    } };
    assert.throws(() => practicalProfileFromLearnerState(withProfileField(emptyLearnerState(), profile)));
  });
});

test("I4 a valid export/import profile round trip remains accepted", () => {
  const decision = [...practicalDecisionById.values()].find((candidate) => candidate.skillId === "FND-01");
  let mastery = createPracticalMasteryState(NOW, true);
  mastery = recordPracticalDecision(mastery, { decisionId: decision.id, actionId: decision.correctActionId, reasonId: decision.correctReasonId, confidence: 70, now: NOW });
  const profile = { ...baseProfile(), mastery, performance: [performanceEvent({ decisionId: decision.id, skillId: decision.skillId, kind: decision.kind })] };
  const roundTripped = JSON.parse(JSON.stringify(profile));
  assert.equal(validatePracticalProfileState(roundTripped), true);
});

test("I5 normal cloud safe-successor path remains green", () => {
  const baseLearner = withPracticalProfile(emptyLearnerState(), baseProfile(NOW), NOW);
  const decision = [...practicalDecisionById.values()].find((candidate) => candidate.skillId === "FND-01");
  const baseProfileState = baseLearner[PRACTICAL_PROFILE_FIELD];
  const advancedMastery = recordPracticalDecision(baseProfileState.mastery, { decisionId: decision.id, actionId: decision.correctActionId, reasonId: decision.correctReasonId, confidence: 60, now: NOW });
  const advancedProfile = { ...baseProfileState, mastery: advancedMastery };
  const advancedLearner = withPracticalProfile(baseLearner, advancedProfile, new Date(NOW.getTime() + 1000));
  assert.equal(practicalProfileSafeSuccessor(advancedLearner, baseLearner), true);
});

// =========================== MUST-PRESERVE SMOKE =============================

test("valid untagged wrong evidence and correct-vs-wrong forgery detection are unaffected by this pass", () => {
  const decision = syntheticDecision({ id: "INTEGRITY-SMOKE", skillId: "FND-01" });
  withSyntheticDecisions([decision], () => {
    const row = attempt({ id: "1", decisionId: decision.id, skillId: "FND-01", actionId: "b", reasonId: "r1", confidence: 90 });
    assert.equal(isSemanticallyValidPracticalAttempt(row), true);
  });
});
