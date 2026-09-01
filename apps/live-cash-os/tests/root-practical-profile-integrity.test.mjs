import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { practicalDecisionById } from "../content/practical-mastery/index.ts";
import { assessCloudWrite } from "../lib/cloud-sync-contract.ts";
import {
  emptyLearnerState,
  migrateLearnerState,
  validateLearnerState,
} from "../lib/model-core.ts";
import {
  markDelayedPracticalRetrieval,
  markPracticalConceptTaught,
  markPracticalRealHandTransfer,
  practicalSkillCorpusCanReach,
  recordPracticalDecision,
} from "../lib/practical-mastery-core.ts";
import {
  recordIntegratedDecision,
  RETENTION_INTERVAL_DAYS,
} from "../lib/practical-integrated-session.ts";
import { PRACTICAL_PROFILE_FIELD } from "../lib/practical-profile-contract.ts";
import {
  createPracticalProfileState,
  practicalProfileFromLearnerState,
  withPracticalProfile,
} from "../lib/practical-profile-state.ts";
import {
  chooseRestoreState,
  isSafeSuccessor,
  prepareLearnerStateImport,
  readLocalLearnerState,
  validateRootLearnerState,
} from "../lib/reliability.ts";

const NOW = new Date("2026-09-01T18:30:00.000Z");
const LATER = new Date("2026-09-01T18:31:00.000Z");

function stateWithProfile(profile = createPracticalProfileState(NOW)) {
  return withPracticalProfile(emptyLearnerState(), profile, NOW);
}

function stateWithMastery(mastery, now = LATER) {
  const profile = createPracticalProfileState(NOW);
  return withPracticalProfile(emptyLearnerState(), { ...profile, mastery }, now);
}

function malformedProfileRoot() {
  const state = stateWithProfile();
  state[PRACTICAL_PROFILE_FIELD].version = 999;
  return state;
}

function stateWithCanonicalAttempt() {
  const decision = [...practicalDecisionById.values()].find((candidate) => candidate.skillId === "FND-01");
  assert.ok(decision, "FND-01 must have a canonical Practical decision");
  const profile = createPracticalProfileState(NOW);
  const mastery = recordPracticalDecision(profile.mastery, {
    decisionId: decision.id,
    actionId: decision.correctActionId,
    reasonId: decision.correctReasonId,
    confidence: 70,
    now: NOW,
  });
  return {
    decision,
    originProfile: profile,
    state: withPracticalProfile(emptyLearnerState(), { ...profile, mastery }, LATER),
  };
}

function wrongSelectionFor(decision) {
  const wrongAction = decision.actionOptions.find((option) => option.id !== decision.correctActionId)?.id ?? decision.correctActionId;
  const wrongReason = wrongAction === decision.correctActionId
    ? decision.reasonOptions.find((option) => option.id !== decision.correctReasonId)?.id
    : decision.correctReasonId;
  assert.ok(wrongReason, `${decision.id} must expose a wrong action or reason option`);
  assert.ok(
    wrongAction !== decision.correctActionId || wrongReason !== decision.correctReasonId,
    `${decision.id} must expose a canonical wrong selection`,
  );
  return { actionId: wrongAction, reasonId: wrongReason };
}

function canonicalBoundaryMastery() {
  const skillIds = [...new Set([...practicalDecisionById.values()].map((decision) => decision.skillId))];
  const skillId = skillIds.find((candidate) => practicalSkillCorpusCanReach(candidate, "BOUNDARY_TESTED"));
  assert.ok(skillId, "at least one Practical skill must canonically reach BOUNDARY_TESTED");
  const decisions = [...practicalDecisionById.values()].filter((decision) => decision.skillId === skillId);
  const required = [
    ...decisions.filter((decision) => decision.kind === "recognition").slice(0, 2),
    ...decisions.filter((decision) => decision.kind === "decision").slice(0, 3),
    ...decisions.filter((decision) => decision.kind === "changed" || decision.kind === "mixed").slice(0, 2),
    ...decisions.filter((decision) => decision.kind === "boundary").slice(0, 1),
  ];
  assert.equal(required.length, 8, `${skillId} must expose the canonical evidence corpus needed for BOUNDARY_TESTED`);
  assert.equal(new Set(required.map((decision) => decision.id)).size, required.length, "boundary fixture must use distinct decisions");

  let mastery = markPracticalConceptTaught(createPracticalProfileState(NOW).mastery, skillId, NOW);
  required.forEach((decision, index) => {
    mastery = recordPracticalDecision(mastery, {
      decisionId: decision.id,
      actionId: decision.correctActionId,
      reasonId: decision.correctReasonId,
      confidence: 70,
      now: new Date(NOW.getTime() + (index + 1) * 60_000),
    });
  });
  assert.equal(mastery.skills[skillId].evidenceStage, "BOUNDARY_TESTED");
  return { mastery, skillId, decisions };
}

function canonicalPracticalSuccessor() {
  const base = stateWithProfile();
  const profile = practicalProfileFromLearnerState(base);
  const mastery = markPracticalConceptTaught(profile.mastery, "FND-01", LATER);
  const candidate = withPracticalProfile(base, { ...profile, mastery }, LATER);
  return { base, candidate };
}

function practicalRegression() {
  const { state: base, originProfile } = stateWithCanonicalAttempt();
  const candidate = structuredClone(base);
  candidate[PRACTICAL_PROFILE_FIELD] = structuredClone(originProfile);
  candidate.revision = base.revision + 10;
  candidate.updatedAt = "2026-09-01T18:40:00.000Z";
  return { base, candidate };
}

test("R1-R4 root validation makes Practical Profile part of root integrity while preserving pre-Practical compatibility", () => {
  const malformed = malformedProfileRoot();
  assert.equal(validateLearnerState(malformed), true, "generic schema remains structurally valid for this adversarial fixture");
  assert.equal(validateRootLearnerState(malformed), false, "R1 malformed _practicalProfile must invalidate the root");

  const { state: validWithAttempt, decision } = stateWithCanonicalAttempt();
  assert.equal(validateRootLearnerState(validWithAttempt), true, "R3 canonical Practical writer output must be accepted");

  const wrongSkill = structuredClone(validWithAttempt);
  wrongSkill[PRACTICAL_PROFILE_FIELD].mastery.attempts[0].skillId = decision.skillId === "FND-02" ? "FND-01" : "FND-02";
  assert.equal(validateLearnerState(wrongSkill), true);
  assert.equal(validateRootLearnerState(wrongSkill), false, "R2 wrong canonical skill must invalidate the root");

  const derivedMismatch = structuredClone(validWithAttempt);
  derivedMismatch[PRACTICAL_PROFILE_FIELD].mastery.attempts[0].correct = !derivedMismatch[PRACTICAL_PROFILE_FIELD].mastery.attempts[0].correct;
  assert.equal(validateLearnerState(derivedMismatch), true);
  assert.equal(validateRootLearnerState(derivedMismatch), false, "R2 forged derived correctness must invalidate the root");

  assert.equal(validateRootLearnerState(emptyLearnerState()), true, "R4 an absent Practical Profile remains compatible");
});

test("R5-R8 malformed Practical imports and current-schema local recovery fail closed without replacing trusted state", () => {
  const current = stateWithProfile();
  const before = JSON.stringify(current);
  const malformed = malformedProfileRoot();

  const prepared = prepareLearnerStateImport(JSON.stringify(malformed), current);
  assert.equal(prepared.ok, false, "R5 malformed Practical import must be rejected");
  assert.equal(prepared.reason, "invalid_state");
  assert.equal(prepared.state, undefined);
  assert.equal(JSON.stringify(current), before, "R6 rejected candidate cannot mutate or replace current state");

  const local = readLocalLearnerState(JSON.stringify(malformed));
  assert.equal(local.kind, "corrupt", "R7 malformed current-schema snapshot must not hydrate as valid");
  assert.equal(local.state, null);

  assert.equal(validateLearnerState(malformed), true, "fixture must isolate the Practical root-integrity gap from generic schema validity");
  const genericMigration = migrateLearnerState(malformed);
  assert.equal(validateLearnerState(genericMigration), true);
  assert.equal(Object.prototype.hasOwnProperty.call(genericMigration, PRACTICAL_PROFILE_FIELD), true);
  assert.equal(validateRootLearnerState(genericMigration), false, "R8 generic migration/recovery cannot make malformed Practical evidence trusted");
});

test("R9-R11 whole-state ancestry protects Practical evidence and permits canonical writer successors", () => {
  const { base, candidate: regressed } = practicalRegression();
  assert.equal(validateRootLearnerState(base), true);
  assert.equal(validateRootLearnerState(regressed), true, "regression fixture itself must remain structurally valid");
  assert.ok(regressed.revision > base.revision);
  assert.equal(isSafeSuccessor(regressed, base), false, "R9 higher generic revision cannot discard Practical history/evidence");

  const dropped = structuredClone(base);
  delete dropped[PRACTICAL_PROFILE_FIELD];
  dropped.revision = base.revision + 11;
  dropped.updatedAt = "2026-09-01T18:41:00.000Z";
  assert.equal(validateRootLearnerState(dropped), true, "profile absence remains structurally compatible for old snapshots");
  assert.equal(isSafeSuccessor(dropped, base), false, "R10 a successor cannot drop an already-durable Practical Profile");

  const canonical = canonicalPracticalSuccessor();
  assert.equal(validateRootLearnerState(canonical.candidate), true);
  assert.equal(isSafeSuccessor(canonical.candidate, canonical.base), true, "R11 canonical Practical writer successor remains accepted");
});

test("R12 malformed browser cloud payload cannot hydrate as a valid restore candidate", async () => {
  const malformed = malformedProfileRoot();
  const decision = chooseRestoreState({ kind: "missing", state: null, raw: null }, malformed);
  assert.equal(decision.kind, "empty");
  assert.equal(validateRootLearnerState(decision.state), true);
  assert.equal(Object.prototype.hasOwnProperty.call(decision.state, PRACTICAL_PROFILE_FIELD), false);

  const hook = await readFile(new URL("../lib/use-learner-state-sync.ts", import.meta.url), "utf8");
  assert.match(hook, /function payloadState\(payload: StateApiPayload\): LearnerState \| null/);
  assert.match(hook, /!validateRootLearnerState\(payload\.state\)/);
  assert.match(hook, /remotePayload\.state && !validateRootLearnerState\(remotePayload\.state\)/);
});

test("R13 stored malformed Practical cloud slice remains CLOUD_STATE_UNREADABLE", async () => {
  const malformed = malformedProfileRoot();
  assert.equal(validateLearnerState(malformed), true);
  assert.equal(validateRootLearnerState(malformed), false);

  const route = await readFile(new URL("../app/api/state/route.ts", import.meta.url), "utf8");
  assert.match(route, /function migrateStoredState\(value: unknown\): LearnerState \| null/);
  assert.match(route, /version === STATE_SCHEMA_VERSION && !validateRootLearnerState\(value\)/);
  assert.match(route, /code: "CLOUD_STATE_UNREADABLE"/);
  assert.match(route, /Existing cloud state cannot be read safely; refusing to overwrite it/);
});

test("R14-R17 cloud write contract rejects malformed/regressing Practical state while preserving CAS semantics", () => {
  const malformed = migrateLearnerState(malformedProfileRoot());
  assert.deepEqual(
    assessCloudWrite(null, malformed, null, null, null),
    { kind: "conflict", reason: "divergent_history" },
    "R14 a malformed Practical POST candidate must fail closed even on first write",
  );

  const canonical = canonicalPracticalSuccessor();
  assert.deepEqual(
    assessCloudWrite(canonical.base, canonical.candidate, null, null, "token-current"),
    { kind: "accept" },
    "R15 a legitimate lost-token canonical Practical successor remains accepted",
  );

  const { base, candidate: regressed } = practicalRegression();
  assert.deepEqual(
    assessCloudWrite(base, regressed, null, null, "token-current"),
    { kind: "conflict", reason: "divergent_history" },
    "R16 a Practical-regressing lost-token candidate remains a conflict",
  );

  assert.deepEqual(
    assessCloudWrite(canonical.base, canonical.candidate, canonical.base.revision, "token-current", "token-current"),
    { kind: "accept" },
    "R17 exact-token CAS behavior remains unchanged",
  );

  assert.deepEqual(
    assessCloudWrite(canonical.base, malformed, canonical.base.revision, "token-current", "token-current"),
    { kind: "conflict", reason: "divergent_history" },
    "R14 malformed Practical state must be rejected before exact-token acceptance",
  );
});

test("R18 import and recovery backups remain ordered before destructive state changes", async () => {
  const hook = await readFile(new URL("../lib/use-learner-state-sync.ts", import.meta.url), "utf8");

  const recoveryBackup = hook.indexOf("safeSet(accountKey(RECOVERY_BACKUP_KEY), localRead.raw)");
  assert.ok(recoveryBackup >= 0, "recovery backup write must remain present");
  assert.match(hook, /localRead\.kind === "corrupt"/);
  assert.match(hook, /localRead\.kind === "recovered"/);

  const applyImport = hook.indexOf("const applyImport = useCallback");
  const rootGuard = hook.indexOf("if (!validateRootLearnerState(candidate)) return false;", applyImport);
  const importBackup = hook.indexOf("safeSet(accountKey(IMPORT_BACKUP_KEY), JSON.stringify(state))", applyImport);
  const importMutation = hook.indexOf("setLearnerState(candidate);", applyImport);
  assert.ok(applyImport >= 0 && rootGuard > applyImport);
  assert.ok(importBackup > rootGuard, "import backup must happen only after root validation");
  assert.ok(importMutation > importBackup, "R18 import backup must be durable before imported state replaces current state");
});

test("L1-L7 canonical mastery skill-set and successful-decision ledger integrity are exact", () => {
  const canonical = stateWithProfile();
  assert.equal(validateRootLearnerState(canonical), true, "L1 untouched canonical mastery and complete Practical Profile inside root state must be valid");

  const skillIds = Object.keys(canonical[PRACTICAL_PROFILE_FIELD].mastery.skills);
  assert.ok(skillIds.length >= 2, "canonical mastery must contain multiple skills for deletion coverage");

  const missingFirst = structuredClone(canonical);
  delete missingFirst[PRACTICAL_PROFILE_FIELD].mastery.skills[skillIds[0]];
  assert.equal(validateRootLearnerState(missingFirst), false, "L2 removing one canonical mastery skill must invalidate root state");

  const missingSecond = structuredClone(canonical);
  delete missingSecond[PRACTICAL_PROFILE_FIELD].mastery.skills[skillIds[1]];
  assert.equal(validateRootLearnerState(missingSecond), false, "L3 removing a different canonical mastery skill must invalidate root state");

  const extra = structuredClone(canonical);
  extra[PRACTICAL_PROFILE_FIELD].mastery.skills["IMPOSSIBLE-PRACTICAL-SKILL"] = {
    ...structuredClone(extra[PRACTICAL_PROFILE_FIELD].mastery.skills[skillIds[0]]),
    skillId: "IMPOSSIBLE-PRACTICAL-SKILL",
  };
  assert.equal(validateRootLearnerState(extra), false, "L4 adding an impossible extra mastery skill must invalidate root state");

  const reordered = structuredClone(canonical);
  reordered[PRACTICAL_PROFILE_FIELD].mastery.skills = Object.fromEntries(
    Object.entries(reordered[PRACTICAL_PROFILE_FIELD].mastery.skills).reverse(),
  );
  assert.equal(validateRootLearnerState(reordered), true, "L5 object-key reorder alone must remain valid");

  const { state: attempted, decision } = stateWithCanonicalAttempt();
  const suppressed = structuredClone(attempted);
  suppressed[PRACTICAL_PROFILE_FIELD].mastery.skills[decision.skillId].successfulDecisionIds = [];
  assert.equal(validateRootLearnerState(suppressed), false, "L6 suppressing the writer-owned successfulDecisionId must invalidate root state");

  const forged = structuredClone(attempted);
  forged[PRACTICAL_PROFILE_FIELD].mastery.skills[decision.skillId].successfulDecisionIds.push("FORGED-PRACTICAL-DECISION");
  assert.equal(validateRootLearnerState(forged), false, "L7 forging a successfulDecisionId must invalidate root state");
});

test("L8-L16 every deterministic recordPracticalDecision-owned skill field is replay-validated independently", () => {
  const { state, decision } = stateWithCanonicalAttempt();
  const mutations = [
    ["L8 attempts", (progress) => { progress.attempts += 1; }],
    ["L9 correct", (progress) => { progress.correct += 1; }],
    ["L10 recognitionCorrect", (progress) => { progress.recognitionCorrect += 1; }],
    ["L11 directDecisionCorrect", (progress) => { progress.directDecisionCorrect += 1; }],
    ["L12 changedCorrect", (progress) => { progress.changedCorrect += 1; }],
    ["L13 boundaryCorrect", (progress) => { progress.boundaryCorrect += 1; }],
    ["L14 mixedCorrect", (progress) => { progress.mixedCorrect += 1; }],
    ["L15 lastAttemptAt", (progress) => {
      progress.lastAttemptAt = new Date(Date.parse(progress.lastAttemptAt) + 1_000).toISOString();
    }],
    ["L16 lastIncorrectDecisionId", (progress) => { progress.lastIncorrectDecisionId = "FORGED-PRACTICAL-DECISION"; }],
  ];

  for (const [label, mutate] of mutations) {
    const candidate = structuredClone(state);
    mutate(candidate[PRACTICAL_PROFILE_FIELD].mastery.skills[decision.skillId]);
    assert.equal(validateRootLearnerState(candidate), false, `${label} mutation must invalidate root state`);
  }
});

test("L17-L19 canonical repeated and correction-order writers remain valid", () => {
  const decision = [...practicalDecisionById.values()].find((candidate) => candidate.skillId === "FND-01");
  assert.ok(decision, "FND-01 must expose a canonical Practical decision");
  const wrong = wrongSelectionFor(decision);

  let repeated = createPracticalProfileState(NOW).mastery;
  repeated = recordPracticalDecision(repeated, {
    decisionId: decision.id,
    actionId: decision.correctActionId,
    reasonId: decision.correctReasonId,
    confidence: 70,
    now: NOW,
  });
  repeated = recordPracticalDecision(repeated, {
    decisionId: decision.id,
    actionId: decision.correctActionId,
    reasonId: decision.correctReasonId,
    confidence: 75,
    now: LATER,
  });
  assert.equal(validateRootLearnerState(stateWithMastery(repeated)), true, "L17 repeated correct same decision must remain valid");
  assert.deepEqual(repeated.skills[decision.skillId].successfulDecisionIds, [decision.id]);

  let wrongThenCorrect = createPracticalProfileState(NOW).mastery;
  wrongThenCorrect = recordPracticalDecision(wrongThenCorrect, {
    decisionId: decision.id,
    ...wrong,
    confidence: 80,
    now: NOW,
  });
  wrongThenCorrect = recordPracticalDecision(wrongThenCorrect, {
    decisionId: decision.id,
    actionId: decision.correctActionId,
    reasonId: decision.correctReasonId,
    confidence: 80,
    now: LATER,
  });
  assert.equal(validateRootLearnerState(stateWithMastery(wrongThenCorrect)), true, "L18 wrong -> correct canonical history must remain valid");
  assert.equal(wrongThenCorrect.skills[decision.skillId].lastIncorrectDecisionId, null);

  let correctThenWrong = createPracticalProfileState(NOW).mastery;
  correctThenWrong = recordPracticalDecision(correctThenWrong, {
    decisionId: decision.id,
    actionId: decision.correctActionId,
    reasonId: decision.correctReasonId,
    confidence: 80,
    now: NOW,
  });
  correctThenWrong = recordPracticalDecision(correctThenWrong, {
    decisionId: decision.id,
    ...wrong,
    confidence: 80,
    now: LATER,
  });
  assert.equal(validateRootLearnerState(stateWithMastery(correctThenWrong)), true, "L19 correct -> wrong canonical history must remain valid");
  assert.equal(correctThenWrong.skills[decision.skillId].lastIncorrectDecisionId, decision.id);
});

test("L20 independent concept, retention, delayed-retrieval and real-hand authorities remain valid through canonical writers", () => {
  const firstSkillId = Object.keys(createPracticalProfileState(NOW).mastery.skills)[0];
  const conceptTaught = markPracticalConceptTaught(createPracticalProfileState(NOW).mastery, firstSkillId, LATER);
  assert.equal(validateRootLearnerState(stateWithMastery(conceptTaught)), true, "L20 canonical concept-taught state must remain valid");

  const boundary = canonicalBoundaryMastery();
  assert.equal(validateRootLearnerState(stateWithMastery(boundary.mastery)), true, "L20 canonical boundary-ready state must remain valid");

  const previousCorrect = boundary.mastery.attempts.at(-1);
  assert.ok(previousCorrect?.correct, "boundary fixture must end on a correct canonical attempt");
  const retentionDecision = boundary.decisions.find((candidate) => (
    candidate.id !== previousCorrect.decisionId
      && ["decision", "changed", "mixed", "boundary"].includes(candidate.kind)
  ));
  assert.ok(retentionDecision, "boundary-ready skill must expose a non-identical retention decision");
  const retentionTierDays = RETENTION_INTERVAL_DAYS[0];
  const retentionAt = new Date(new Date(previousCorrect.answeredAt).getTime() + (retentionTierDays + 1) * 86_400_000);
  const retained = recordIntegratedDecision(boundary.mastery, {
    decisionId: retentionDecision.id,
    skillId: boundary.skillId,
    priority: 100 + retentionTierDays,
    reason: "RETENTION",
    whyAfterAnswer: "P1-002 canonical retention writer regression",
    retentionTierDays,
  }, {
    actionId: retentionDecision.correctActionId,
    reasonId: retentionDecision.correctReasonId,
    confidence: 70,
    now: retentionAt,
  });
  assert.deepEqual(retained.skills[boundary.skillId].retentionDaysPassed, [retentionTierDays]);
  assert.equal(retained.skills[boundary.skillId].delayedRetrievalPassed, true);
  assert.equal(validateRootLearnerState(stateWithMastery(retained, retentionAt)), true, "L20 canonical retention/delayed-retrieval state must remain valid");

  const transferred = markPracticalRealHandTransfer(
    retained,
    boundary.skillId,
    true,
    new Date(retentionAt.getTime() + 60_000),
  );
  assert.equal(transferred.skills[boundary.skillId].realHandTransferReviewed, true);
  assert.equal(validateRootLearnerState(stateWithMastery(transferred, new Date(retentionAt.getTime() + 60_000))), true, "L20 canonical real-hand-transfer state must remain valid");
});
