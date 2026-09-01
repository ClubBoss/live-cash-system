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
  markPracticalConceptTaught,
  recordPracticalDecision,
} from "../lib/practical-mastery-core.ts";
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
