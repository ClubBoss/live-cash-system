import assert from "node:assert/strict";
import test from "node:test";

import { practicalDecisionById } from "../content/practical-mastery/index.ts";
import {
  PRACTICAL_4BP_OBJECTIVE_SEMANTIC_REVISION,
  PRACTICAL_A7_RU_REASON_SEMANTIC_REVISION,
  compactPracticalAttemptHistory,
  markPracticalConceptTaught,
  practicalRepairQueue,
  recordPracticalDecision,
} from "../lib/practical-mastery-core.ts";
import {
  PRACTICAL_PROFILE_FIELD,
  normalizePracticalProfileState,
  practicalProfileSafeSuccessor,
  validatePracticalProfileState,
} from "../lib/practical-profile-contract.ts";
import { createPracticalProfileState } from "../lib/practical-profile-state.ts";

const OLD_CONTENT_VERSION = "2026.08-practical-mastery-v3";
const SKILL_ID = "4BP-03";
const IDS = Array.from({ length: 8 }, (_, index) => `PM-4BP-03-A7-${101 + index}`);
const NOW = new Date("2026-09-01T00:00:00.000Z");

function correctInput(decisionId, minute) {
  const decision = practicalDecisionById.get(decisionId);
  assert.ok(decision);
  return { decisionId, actionId: decision.correctActionId, reasonId: decision.correctReasonId, confidence: 80, now: new Date(NOW.getTime() + minute * 60_000) };
}

function asPreviousSchema4(profile) {
  profile.mastery.schemaVersion = 4;
  profile.mastery.attemptArchive.version = 1;
  delete profile.mastery.attemptArchive.provenanceDigest;
  return profile;
}

function preRevisionProfile({ compacted = false } = {}) {
  let profile = createPracticalProfileState(NOW);
  profile.mastery = markPracticalConceptTaught(profile.mastery, SKILL_ID, NOW);
  for (let round = 0; round < (compacted ? 20 : 1); round += 1) {
    for (let index = 0; index < IDS.length; index += 1) {
      profile.mastery = recordPracticalDecision(profile.mastery, correctInput(IDS[index], round * IDS.length + index + 1));
      profile.mastery.attempts.at(-1).semanticRevision = PRACTICAL_A7_RU_REASON_SEMANTIC_REVISION;
    }
  }
  profile.mastery.contentVersion = OLD_CONTENT_VERSION;
  if (compacted) profile.mastery = compactPracticalAttemptHistory(profile.mastery, true);
  return asPreviousSchema4(profile);
}

function assertReconciled(profile) {
  const progress = profile.mastery.skills[SKILL_ID];
  assert.equal(progress.evidenceStage, "CONCEPT_TAUGHT");
  assert.deepEqual(progress.successfulDecisionIds, []);
  assert.equal(progress.recognitionCorrect, 0);
  assert.equal(progress.directDecisionCorrect, 0);
  assert.equal(progress.changedCorrect, 0);
  assert.equal(progress.boundaryCorrect, 0);
  assert.equal(progress.lastIncorrectDecisionId, null);
  assert.equal(progress.delayedRetrievalPassed, false);
  assert.equal(progress.realHandTransferReviewed, false);
}

test("pre-#254 tail-only 4BP mastery is reconciled without deleting raw history or touching unrelated skills", () => {
  const old = preRevisionProfile();
  assert.equal(old.mastery.skills[SKILL_ID].evidenceStage, "BOUNDARY_TESTED");
  const rawAttempts = structuredClone(old.mastery.attempts);
  const unrelatedBefore = structuredClone(old.mastery.skills["FND-01"]);
  const normalized = normalizePracticalProfileState(old);
  assert.ok(normalized);
  assertReconciled(normalized.state);
  assert.deepEqual(normalized.state.mastery.attempts, rawAttempts);
  assert.deepEqual(normalized.state.mastery.skills["FND-01"], unrelatedBefore);
  assert.equal(validatePracticalProfileState(normalized.state), true);
});

test("compacted archive+tail receives the same bounded semantic reconciliation and preserves physical history", () => {
  const old = preRevisionProfile({ compacted: true });
  assert.ok(old.mastery.attemptArchive.count > 0);
  const tail = structuredClone(old.mastery.attempts);
  const normalized = normalizePracticalProfileState(old);
  assert.ok(normalized);
  assertReconciled(normalized.state);
  assert.equal(normalized.state.mastery.attemptArchive.count, 0);
  assert.deepEqual(normalized.state.mastery.attemptArchive.latestByDecision, {});
  assert.deepEqual(normalized.state.mastery.attempts, tail);
  assert.equal(validatePracticalProfileState(normalized.state), true);
});

test("new V3 attempts rebuild the complete 4BP ladder after reconciliation", () => {
  const normalized = normalizePracticalProfileState(preRevisionProfile());
  assert.ok(normalized);
  let mastery = normalized.state.mastery;
  for (let index = 0; index < IDS.length; index += 1) mastery = recordPracticalDecision(mastery, correctInput(IDS[index], 100 + index));
  assert.equal(mastery.skills[SKILL_ID].evidenceStage, "BOUNDARY_TESTED");
  assert.deepEqual(new Set(mastery.skills[SKILL_ID].successfulDecisionIds), new Set(IDS));
  assert.ok(mastery.attempts.slice(-8).every((attempt) => attempt.semanticRevision === PRACTICAL_4BP_OBJECTIVE_SEMANTIC_REVISION));
});

test("old wrong evidence is historical only while a new V3 wrong becomes a current mistake", () => {
  let profile = preRevisionProfile();
  const decision = practicalDecisionById.get(IDS[0]);
  const wrongReason = decision.reasonOptions.find((option) => option.id !== decision.correctReasonId);
  profile.mastery = recordPracticalDecision(profile.mastery, { decisionId: decision.id, actionId: decision.correctActionId, reasonId: wrongReason.id, confidence: 90, now: new Date("2026-09-02T00:00:00.000Z") });
  profile.mastery.attempts.at(-1).semanticRevision = PRACTICAL_A7_RU_REASON_SEMANTIC_REVISION;
  profile.mastery.contentVersion = OLD_CONTENT_VERSION;
  const normalized = normalizePracticalProfileState(profile);
  assert.ok(normalized);
  assert.deepEqual(practicalRepairQueue(normalized.state.mastery), []);
  const current = recordPracticalDecision(normalized.state.mastery, { decisionId: decision.id, actionId: decision.correctActionId, reasonId: wrongReason.id, confidence: 90, now: new Date("2026-09-03T00:00:00.000Z") });
  assert.deepEqual(practicalRepairQueue(current), [SKILL_ID]);
});

test("CAS compares the semantic-reconciled base, so migration is not mistaken for history loss", () => {
  const old = preRevisionProfile();
  const normalized = normalizePracticalProfileState(old);
  assert.ok(normalized);
  const baseState = { [PRACTICAL_PROFILE_FIELD]: old };
  const candidateState = { [PRACTICAL_PROFILE_FIELD]: normalized.state };
  assert.equal(practicalProfileSafeSuccessor(candidateState, baseState), true);
});
