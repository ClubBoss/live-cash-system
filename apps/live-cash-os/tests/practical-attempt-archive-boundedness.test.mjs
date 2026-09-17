import assert from "node:assert/strict";
import test from "node:test";

import { practicalDecisions, practicalDecisionById } from "../content/practical-mastery/index.ts";
import { emptyLearnerState } from "../lib/model-core.ts";
import {
  compactPracticalAttemptHistory,
  practicalAttemptHistoryContains,
  practicalDecisionAttemptCount,
  practicalLogicalAttemptCount,
  recordPracticalDecision,
} from "../lib/practical-mastery-core.ts";
import {
  PRACTICAL_PERFORMANCE_LIMIT,
  practicalProfileSafeSuccessor,
  validatePracticalProfileState,
} from "../lib/practical-profile-contract.ts";
import {
  createPracticalProfileState,
  practicalProfileFromLearnerState,
  withPracticalProfile,
} from "../lib/practical-profile-state.ts";
import { createPracticalPerformanceEvent } from "../lib/practical-performance-telemetry.ts";
import { isSafeSuccessor, normalizeCurrentLearnerState, validateRootLearnerState } from "../lib/reliability.ts";

const CLOUD_LIMIT_BYTES = 1_000_000;
const encoder = new TextEncoder();
const bytes = (value) => encoder.encode(JSON.stringify(value)).byteLength;

function correctInput(decision, index, provenance = "NOT_CAPTURED") {
  return {
    decisionId: decision.id,
    actionId: decision.correctActionId,
    reasonId: decision.correctReasonId,
    confidence: 65,
    confidenceProvenance: provenance,
    now: new Date(Date.UTC(2026, 0, 1, 0, 0, index)),
  };
}

function profileRoot(profile, at = "2026-09-16T00:00:00Z") {
  return withPracticalProfile(emptyLearnerState(), profile, new Date(at));
}

function performanceEvent(decision, index, provenance = "NOT_CAPTURED") {
  const answeredAt = new Date(Date.UTC(2026, 1, 1, 0, 0, index));
  return createPracticalPerformanceEvent({
    decisionId: decision.id,
    actionId: decision.correctActionId,
    reasonId: decision.correctReasonId,
    confidence: provenance === "SELF_REPORT" ? 82 : 65,
    confidenceProvenance: provenance,
    startedAt: new Date(answeredAt.getTime() - 5_000),
    answeredAt,
    mode: "PERCEPTUAL_TABLE",
    scaffold: "guided",
  });
}

test("LC-ADD-002 baseline-style unbounded attempt ledger crosses the 1 MB cloud ceiling", () => {
  const decision = practicalDecisionById.get("PM-FND-04-B1-101");
  assert.ok(decision);
  const profile = createPracticalProfileState(new Date("2026-01-01T00:00:00Z"));
  const mastery = structuredClone(profile.mastery);
  mastery.schemaVersion = 3;
  delete mastery.attemptArchive;
  mastery.attempts = [];
  for (let index = 0; index < 4_500; index += 1) {
    const answeredAt = new Date(Date.UTC(2026, 0, 1, 0, 0, index)).toISOString();
    mastery.attempts.push({
      id: `${decision.id}:${index + 2}:${answeredAt}`,
      decisionId: decision.id,
      skillId: decision.skillId,
      actionId: decision.correctActionId,
      reasonId: decision.correctReasonId,
      confidence: 65,
      correct: true,
      answeredAt,
    });
  }
  const progress = mastery.skills[decision.skillId];
  progress.attempts = mastery.attempts.length;
  progress.correct = mastery.attempts.length;
  progress.recognitionCorrect = mastery.attempts.length;
  progress.successfulDecisionIds = [decision.id];
  progress.lastAttemptAt = mastery.attempts.at(-1).answeredAt;
  mastery.revision = mastery.attempts.length;
  mastery.updatedAt = progress.lastAttemptAt;

  const root = emptyLearnerState();
  root._practicalProfile = { ...profile, mastery };
  assert.ok(bytes(root) > CLOUD_LIMIT_BYTES, "the historical unbounded shape must reproduce the cloud-size failure");
});

test("LC-ADD-002 20k canonical attempts stay bounded while preserving cumulative mastery truth", () => {
  const decision = practicalDecisionById.get("PM-FND-04-B1-101");
  assert.ok(decision);
  let profile = createPracticalProfileState(new Date("2026-01-01T00:00:00Z"));
  for (let index = 0; index < 20_000; index += 1) {
    profile.mastery = recordPracticalDecision(profile.mastery, correctInput(decision, index));
  }

  const root = profileRoot(profile);
  const progress = profile.mastery.skills[decision.skillId];
  assert.equal(practicalLogicalAttemptCount(profile.mastery), 20_000);
  assert.equal(practicalDecisionAttemptCount(profile.mastery, decision.id), 20_000);
  assert.equal(progress.attempts, 20_000);
  assert.equal(progress.correct, 20_000);
  assert.equal(progress.recognitionCorrect, 20_000);
  assert.deepEqual(progress.successfulDecisionIds, [decision.id]);
  assert.ok(profile.mastery.attemptArchive.count > 19_000);
  assert.ok(profile.mastery.attempts.length <= 256);
  assert.equal(validatePracticalProfileState(profile), true);
  assert.equal(validateRootLearnerState(root), true);
  assert.ok(bytes(root) < 250_000, `20k-attempt root unexpectedly large: ${bytes(root)} bytes`);
});

test("LC-ADD-002 broad corpus plus maximum telemetry window remains safely below cloud ceiling", () => {
  let profile = createPracticalProfileState(new Date("2026-01-01T00:00:00Z"));
  practicalDecisions.forEach((decision, index) => {
    profile.mastery = recordPracticalDecision(profile.mastery, correctInput(decision, index));
  });
  const telemetryDecision = practicalDecisions[0];
  assert.ok(telemetryDecision);
  profile.performance = Array.from({ length: PRACTICAL_PERFORMANCE_LIMIT }, (_, index) => performanceEvent(telemetryDecision, index));

  const root = profileRoot(profile);
  const serializedBytes = bytes(root);
  assert.equal(validatePracticalProfileState(profile), true);
  assert.equal(validateRootLearnerState(root), true);
  assert.ok(serializedBytes < 800_000, `stress root lost safety headroom: ${serializedBytes} bytes`);
  assert.ok(serializedBytes < CLOUD_LIMIT_BYTES);
});

test("LC-ADD-002 compaction is deterministic/idempotent and safe-successor ancestry survives the boundary", () => {
  const decision = practicalDecisionById.get("PM-FND-04-B1-101");
  assert.ok(decision);
  let profile = createPracticalProfileState(new Date("2026-01-01T00:00:00Z"));
  for (let index = 0; index < 256; index += 1) {
    profile.mastery = recordPracticalDecision(profile.mastery, correctInput(decision, index));
  }
  const baseRoot = profileRoot(profile, "2026-09-16T00:00:00Z");
  const baseProfile = practicalProfileFromLearnerState(baseRoot);
  const candidateMastery = recordPracticalDecision(baseProfile.mastery, correctInput(decision, 256));
  const candidateRoot = withPracticalProfile(
    baseRoot,
    { ...baseProfile, mastery: candidateMastery },
    new Date("2026-09-16T00:00:01Z"),
  );

  assert.ok(candidateMastery.attemptArchive.count > 0, "257th write should cross the compaction boundary");
  assert.equal(practicalAttemptHistoryContains(candidateMastery, baseProfile.mastery), true);
  assert.equal(practicalProfileSafeSuccessor(candidateRoot, baseRoot), true);
  assert.equal(isSafeSuccessor(candidateRoot, baseRoot), true);

  const once = compactPracticalAttemptHistory(candidateMastery, true);
  const twice = compactPracticalAttemptHistory(once, true);
  assert.equal(JSON.stringify(twice), JSON.stringify(once));

  const tampered = structuredClone(candidateRoot);
  tampered._practicalProfile.mastery.attemptArchive.digest = "0000000000000000";
  assert.equal(practicalProfileSafeSuccessor(tampered, baseRoot), false);
  assert.equal(isSafeSuccessor(tampered, baseRoot), false);
});

test("LC-ADD-002 schema-3 telemetry above the new window migrates deterministically and rolling telemetry remains a safe successor", () => {
  const decision = practicalDecisions[0];
  assert.ok(decision);
  const currentProfile = createPracticalProfileState(new Date("2026-01-01T00:00:00Z"));
  const currentRoot = profileRoot(currentProfile);
  const legacyRoot = structuredClone(currentRoot);
  legacyRoot._practicalProfile.mastery.schemaVersion = 3;
  delete legacyRoot._practicalProfile.mastery.attemptArchive;
  legacyRoot._practicalProfile.performance = Array.from({ length: 600 }, (_, index) => {
    const event = performanceEvent(decision, index);
    delete event.confidenceProvenance;
    return event;
  });

  const migrated = normalizeCurrentLearnerState(legacyRoot);
  assert.ok(migrated);
  assert.equal(migrated.practicalProfileReconciled, true);
  assert.equal(migrated.state._practicalProfile.performance.length, PRACTICAL_PERFORMANCE_LIMIT);
  assert.equal(migrated.state._practicalProfile.performance.at(-1).id, legacyRoot._practicalProfile.performance.at(-1).id);
  const migratedTwice = normalizeCurrentLearnerState(migrated.state);
  assert.ok(migratedTwice);
  assert.equal(JSON.stringify(migratedTwice.state), JSON.stringify(migrated.state));

  const base = migrated.state;
  const baseProfile = practicalProfileFromLearnerState(base);
  const appended = performanceEvent(decision, 601, "SELF_REPORT");
  const nextProfile = {
    ...baseProfile,
    performance: [...baseProfile.performance, appended].slice(-PRACTICAL_PERFORMANCE_LIMIT),
  };
  const candidate = withPracticalProfile(base, nextProfile, new Date("2026-09-16T00:00:02Z"));
  assert.equal(practicalProfileSafeSuccessor(candidate, base), true);
  assert.equal(isSafeSuccessor(candidate, base), true);
});


test("LC-ADD-002 full telemetry-window replacement is not accepted as ancestry", () => {
  const decision = practicalDecisions[0];
  assert.ok(decision);
  const profile = createPracticalProfileState(new Date("2026-01-01T00:00:00Z"));
  profile.performance = Array.from({ length: PRACTICAL_PERFORMANCE_LIMIT }, (_, index) => performanceEvent(decision, index));
  const base = profileRoot(profile);
  const replacementProfile = {
    ...profile,
    performance: Array.from({ length: PRACTICAL_PERFORMANCE_LIMIT }, (_, index) => performanceEvent(decision, 10_000 + index, "SELF_REPORT")),
  };
  const candidate = withPracticalProfile(base, replacementProfile, new Date("2026-09-16T00:00:03Z"));

  assert.equal(practicalProfileSafeSuccessor(candidate, base), false);
  assert.equal(isSafeSuccessor(candidate, base), false);
});
