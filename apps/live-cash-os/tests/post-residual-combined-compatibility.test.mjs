import assert from "node:assert/strict";
import test from "node:test";

import { practicalDecisionById } from "../content/practical-mastery/index.ts";
import {
  PRACTICAL_A7_RU_REASON_SEMANTIC_REVISION,
  compactPracticalAttemptHistory,
  markPracticalConceptTaught,
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
const FOUR_BP_IDS = Array.from({ length: 8 }, (_, index) => `PM-4BP-03-A7-${101 + index}`);
const TURN_IDS = [
  "PM-TURN-03-A8-102", "PM-B3-TURN03-101", "PM-TURN-03-001", "PM-TURN-03-A8-105",
  "PM-B3-TURN03-102", "PM-TURN-03-A8-107", "PM-B3-TURN03-103", "PM-TURN-03-A8-108",
];
function correctInput(decisionId, minute) {
  const decision = practicalDecisionById.get(decisionId);
  assert.ok(decision, decisionId);
  return {
    decisionId,
    actionId: decision.correctActionId,
    reasonId: decision.correctReasonId,
    confidence: 80,
    now: new Date(Date.UTC(2026, 8, 1, 0, minute)),
  };
}

function preBothProfile({ compacted = false } = {}) {
  let profile = createPracticalProfileState(new Date("2026-09-01T00:00:00.000Z"));
  profile.mastery = markPracticalConceptTaught(profile.mastery, "4BP-03");
  profile.mastery = markPracticalConceptTaught(profile.mastery, "TURN-03");
  FOUR_BP_IDS.forEach((id, index) => {
    profile.mastery = recordPracticalDecision(profile.mastery, correctInput(id, index + 1));
    profile.mastery.attempts.at(-1).semanticRevision = PRACTICAL_A7_RU_REASON_SEMANTIC_REVISION;
  });
  TURN_IDS.forEach((id, index) => {
    profile.mastery = recordPracticalDecision(profile.mastery, correctInput(id, index + 20));
  });
  profile.mastery.contentVersion = OLD_CONTENT_VERSION;
  profile.mastery.skills["4BP-03"].evidenceStage = "BOUNDARY_TESTED";
  profile.mastery.skills["TURN-03"].evidenceStage = "BOUNDARY_TESTED";
  if (compacted) {
    for (let index = 0; index < 130; index += 1) {
      profile.mastery = recordPracticalDecision(profile.mastery, correctInput(FOUR_BP_IDS[0], 100 + index));
      profile.mastery.attempts.at(-1).semanticRevision = PRACTICAL_A7_RU_REASON_SEMANTIC_REVISION;
      profile.mastery = recordPracticalDecision(profile.mastery, correctInput(TURN_IDS[0], 300 + index));
    }
    profile.mastery.contentVersion = OLD_CONTENT_VERSION;
    profile.mastery.skills["4BP-03"].evidenceStage = "BOUNDARY_TESTED";
    profile.mastery.skills["TURN-03"].evidenceStage = "BOUNDARY_TESTED";
    profile.mastery = compactPracticalAttemptHistory(profile.mastery, true);
  }
  return profile;
}

function assertCombinedReconciliation(profile, rawAttemptCount) {
  const normalized = normalizePracticalProfileState(profile);
  assert.ok(normalized);
  assert.equal(normalized.state.mastery.skills["4BP-03"].evidenceStage, "CONCEPT_TAUGHT");
  assert.deepEqual(normalized.state.mastery.skills["4BP-03"].successfulDecisionIds, []);
  assert.equal(normalized.state.mastery.skills["TURN-03"].evidenceStage, "CONCEPT_TAUGHT");
  assert.equal(normalized.state.mastery.attemptArchive.count + normalized.state.mastery.attempts.length, rawAttemptCount);
  assert.equal(validatePracticalProfileState(normalized.state), true);
  const base = { [PRACTICAL_PROFILE_FIELD]: profile };
  const candidate = { [PRACTICAL_PROFILE_FIELD]: normalized.state };
  assert.equal(practicalProfileSafeSuccessor(candidate, base), true);
}

test("combined pre-4BP-V3 and pre-A8 profile reconciles both compatibility seams", () => {
  const profile = preBothProfile();
  const rawAttemptCount = profile.mastery.attemptArchive.count + profile.mastery.attempts.length;
  assertCombinedReconciliation(profile, rawAttemptCount);
});

test("combined compatibility reconciliation survives archive compaction", () => {
  const profile = preBothProfile({ compacted: true });
  const rawAttemptCount = profile.mastery.attemptArchive.count + profile.mastery.attempts.length;
  assert.ok(profile.mastery.attemptArchive.count > 0);
  assertCombinedReconciliation(profile, rawAttemptCount);
});
