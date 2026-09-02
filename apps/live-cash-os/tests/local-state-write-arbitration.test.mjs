import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { practicalDecisionById } from "../content/practical-mastery/index.ts";
import { emptyLearnerState } from "../lib/model-core.ts";
import { recordPracticalDecision } from "../lib/practical-mastery-core.ts";
import {
  createPracticalProfileState,
  withPracticalProfile,
} from "../lib/practical-profile-state.ts";
import { arbitrateLocalWrite, readLocalLearnerState, sameLearnerState } from "../lib/reliability.ts";

const NOW = new Date("2026-09-02T00:00:00.000Z");
const LATER = new Date("2026-09-02T00:01:00.000Z");
const LATEST = new Date("2026-09-02T00:02:00.000Z");

const DECISION_A = practicalDecisionById.get("PM-FND-01-001");
const DECISION_B = practicalDecisionById.get("PM-FND-01-101");
assert.ok(DECISION_A && DECISION_B, "fixture decisions PM-FND-01-001 / PM-FND-01-101 must exist");

function baseState() {
  return withPracticalProfile(emptyLearnerState(), createPracticalProfileState(NOW), NOW);
}

function withAttempt(state, decision, when) {
  const profile = state._practicalProfile;
  const mastery = recordPracticalDecision(profile.mastery, {
    decisionId: decision.id,
    actionId: decision.correctActionId,
    reasonId: decision.correctReasonId,
    confidence: 70,
    now: when,
  });
  return withPracticalProfile(state, { ...profile, mastery }, when);
}

function durableReadOf(state) {
  return readLocalLearnerState(JSON.stringify(state));
}

test("B1 first durable write of a legitimate successor is allowed", () => {
  const s0 = baseState();
  const s0PlusA = withAttempt(s0, DECISION_A, LATER);
  const decision = arbitrateLocalWrite(s0PlusA, durableReadOf(s0));
  assert.equal(decision.kind, "write");
});

test("B1b nothing durable yet (missing local storage) always allows the write", () => {
  const s0PlusA = withAttempt(baseState(), DECISION_A, LATER);
  const decision = arbitrateLocalWrite(s0PlusA, readLocalLearnerState(null));
  assert.equal(decision.kind, "write");
});

test("B2 writing back an identical state is idempotent", () => {
  const s0PlusA = withAttempt(baseState(), DECISION_A, LATER);
  const decision = arbitrateLocalWrite(s0PlusA, durableReadOf(s0PlusA));
  assert.equal(decision.kind, "write");
  assert.equal(sameLearnerState(s0PlusA, s0PlusA), true);
});

test("B3-B6 a stale tab's candidate must not silently overwrite another tab's already-durable attempt", () => {
  const s0 = baseState();

  // Tab A and Tab B both restore from the same S0 (B3).
  const tabACandidate = s0;
  const tabBCandidate = s0;
  assert.deepEqual(tabACandidate, tabBCandidate);

  // Tab A records attempt A and its write is accepted; durable becomes S0+A (B4).
  const s0PlusA = withAttempt(s0, DECISION_A, LATER);
  const tabADecision = arbitrateLocalWrite(s0PlusA, durableReadOf(s0));
  assert.equal(tabADecision.kind, "write");
  const durableAfterA = s0PlusA;

  // Tab B, still holding stale S0, independently records attempt B (B5).
  const s0PlusB = withAttempt(s0, DECISION_B, LATER);
  const tabBDecision = arbitrateLocalWrite(s0PlusB, durableReadOf(durableAfterA));
  assert.equal(tabBDecision.kind, "conflict", "Tab B's stale candidate must not be accepted as a safe successor");

  // Attempt A must still be present in the durable snapshot the caller is told to keep (B6).
  const durableAttemptDecisionIds = tabBDecision.durable._practicalProfile.mastery.attempts.map((a) => a.decisionId);
  assert.ok(durableAttemptDecisionIds.includes(DECISION_A.id), "attempt A must not be lost from the preserved durable state");
  assert.equal(sameLearnerState(tabBDecision.durable, durableAfterA), true, "the durable snapshot itself must be returned unmodified, never merged");
});

test("B7 a genuine safe successor built on top of the durable snapshot may persist", () => {
  const s0 = baseState();
  const s0PlusA = withAttempt(s0, DECISION_A, LATER);
  const s0PlusAPlusB = withAttempt(s0PlusA, DECISION_B, LATEST);

  const decision = arbitrateLocalWrite(s0PlusAPlusB, durableReadOf(s0PlusA));
  assert.equal(decision.kind, "write", "a real successor that preserves attempt A and adds attempt B must be allowed");
});

test("B8 an incompatible candidate is reported as a distinct conflict outcome, not silently coerced into a write", () => {
  const s0 = baseState();
  const s0PlusA = withAttempt(s0, DECISION_A, LATER);
  const s0PlusB = withAttempt(s0, DECISION_B, LATER);
  const decision = arbitrateLocalWrite(s0PlusB, durableReadOf(s0PlusA));
  assert.equal(decision.kind, "conflict");
  assert.ok("durable" in decision && !("kind" in decision && decision.kind === "write"));
});

test("B9 the arbitration guarantee does not depend on cloud/auth availability (pure local-vs-local comparison)", () => {
  // arbitrateLocalWrite takes only (candidate, durableRead) - no cloud token,
  // no auth flag - so a local-only/auth-unavailable learner gets exactly the
  // same protection as a cloud-connected one; there is no code path where
  // cloud state could relax or bypass this check.
  assert.equal(arbitrateLocalWrite.length, 2);
  const s0 = baseState();
  const s0PlusA = withAttempt(s0, DECISION_A, LATER);
  const s0PlusB = withAttempt(s0, DECISION_B, LATER);
  const decision = arbitrateLocalWrite(s0PlusB, durableReadOf(s0PlusA));
  assert.equal(decision.kind, "conflict");
});

test("B10 malformed durable local storage does not block an otherwise-valid write", () => {
  const corruptRead = readLocalLearnerState("{not valid json");
  assert.equal(corruptRead.kind, "corrupt");
  const candidate = withAttempt(baseState(), DECISION_A, LATER);
  const decision = arbitrateLocalWrite(candidate, corruptRead);
  assert.equal(decision.kind, "write", "nothing valid is durable yet, so the good candidate may be written");
});

test("B12 conflict resolution never merges ledgers, so PracticalAttempt identity can never be duplicated across reload/re-entry", () => {
  const s0 = baseState();
  const s0PlusA = withAttempt(s0, DECISION_A, LATER);
  const s0PlusB = withAttempt(s0, DECISION_B, LATER);
  const decision = arbitrateLocalWrite(s0PlusB, durableReadOf(s0PlusA));
  assert.equal(decision.kind, "conflict");

  const adoptedIds = decision.durable._practicalProfile.mastery.attempts.map((a) => a.id);
  const uniqueIds = new Set(adoptedIds);
  assert.equal(adoptedIds.length, uniqueIds.size, "the adopted durable snapshot must carry no duplicate attempt ids");
  assert.equal(adoptedIds.length, s0PlusA._practicalProfile.mastery.attempts.length, "adopting durable must not fabricate or merge in the rejected candidate's attempts");
});

test("B11 the production wiring arbitrates and writes against the same account-scoped storage key", async () => {
  // arbitrateLocalWrite itself is namespace-agnostic by design (B9); namespace
  // isolation is a property of how use-learner-state-sync.ts calls it. This
  // pins that the read-before-write arbitration and the actual persist call
  // both key off the same accountKey(LEARNER_STORAGE_KEY) expression, so the
  // guarantee always applies within, and never leaks across, a profile
  // namespace.
  const source = await readFile(new URL("../lib/use-learner-state-sync.ts", import.meta.url), "utf8");
  const effectStart = source.indexOf("const durableRead = readLocalLearnerState(safeGet(accountKey(LEARNER_STORAGE_KEY)));");
  const arbitrateCall = source.indexOf("arbitrateLocalWrite(state, durableRead)");
  const writeCall = source.indexOf("safeSet(accountKey(LEARNER_STORAGE_KEY), serialized)");
  assert.ok(effectStart !== -1, "durable read must key off accountKey(LEARNER_STORAGE_KEY)");
  assert.ok(arbitrateCall > effectStart, "arbitration must run against that same durable read");
  assert.ok(writeCall > arbitrateCall, "the actual local write must key off the same account-scoped storage key, after arbitration");
});

test("B13 ordinary evolving single-tab usage is never blocked", () => {
  const s0 = baseState();
  const s0PlusA = withAttempt(s0, DECISION_A, LATER);
  const step1 = arbitrateLocalWrite(s0PlusA, durableReadOf(s0));
  assert.equal(step1.kind, "write");

  const s0PlusAPlusB = withAttempt(s0PlusA, DECISION_B, LATEST);
  const step2 = arbitrateLocalWrite(s0PlusAPlusB, durableReadOf(s0PlusA));
  assert.equal(step2.kind, "write");
});
