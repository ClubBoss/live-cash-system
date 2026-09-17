import assert from "node:assert/strict";
import test from "node:test";

import {
  PRACTICAL_EVIDENCE_AUTHORITY_BY_DECISION_ID,
} from "../content/practical-mastery/evidence-authority.ts";
import {
  practicalDecisionById,
  practicalDecisions,
} from "../content/practical-mastery/index.ts";
import { emptyLearnerState } from "../lib/model-core.ts";
import { practicalProgressCountingSkills } from "../lib/practical-learner-skill-set.ts";
import {
  compactPracticalAttemptHistory,
  createPracticalMasteryState,
  deriveEvidenceStage,
  markPracticalConceptTaught,
  practicalScenarioEvidenceRequirements,
  practicalSkillCorpusCanReach,
  practicalSkillCorpusStats,
  recordPracticalDecision,
} from "../lib/practical-mastery-core.ts";
import {
  practicalAttemptArchiveProvenanceDigest,
} from "../lib/practical-mastery-core.ts";import {
  practicalProfileSafeSuccessor,
  validatePracticalProfileState,
} from "../lib/practical-profile-contract.ts";
import {
  createPracticalProfileState,
  withPracticalProfile,
} from "../lib/practical-profile-state.ts";
import {
  effectivePracticalScaffold,
  recommendedPracticalScaffold,
} from "../lib/practical-scaffold-fading.ts";
import {
  isSafeSuccessor,
  normalizeCurrentLearnerState,
  prepareLearnerStateImport,
  validateRootLearnerState,
} from "../lib/reliability.ts";

const SKILL = "TURN-02";
const RECOGNITION = ["PM-TURN-02-A8-101", "PM-B3-TURN02-101"];
const SAME_DIRECT = ["PM-TURN-02-A8-103", "PM-TURN-02-A8-104", "PM-TURN-02-A8-205"];
const OTHER_DIRECT = "PM-B3-TURN02-102";
const SAME_TRANSFER = ["PM-TURN-02-A8-106", "PM-TURN-02-A8-207"];
const OTHER_TRANSFER = "PM-B3-TURN02-103";
const BOUNDARY = "PM-TURN-02-A8-108";function answerCorrect(state, decisionId, second) {
  const decision = practicalDecisionById.get(decisionId);
  assert.ok(decision, `missing canonical decision ${decisionId}`);
  return recordPracticalDecision(state, {
    decisionId,
    actionId: decision.correctActionId,
    reasonId: decision.correctReasonId,
    confidence: 80,
    now: new Date(Date.UTC(2026, 8, 18, 0, 0, second)),
  });
}

function recognitionReadyState() {
  let state = markPracticalConceptTaught(
    createPracticalMasteryState(new Date("2026-09-18T00:00:00Z")),
    SKILL,
    new Date("2026-09-18T00:00:01Z"),
  );
  state = answerCorrect(state, RECOGNITION[0], 2);
  state = answerCorrect(state, RECOGNITION[1], 3);
  assert.equal(state.skills[SKILL].evidenceStage, "RECOGNITION_TRAINED");
  return state;
}

function directReadyState() {
  let state = recognitionReadyState();
  for (let index = 0; index < SAME_DIRECT.length; index += 1) {
    state = answerCorrect(state, SAME_DIRECT[index], 4 + index);
  }
  state = answerCorrect(state, OTHER_DIRECT, 7);
  assert.equal(state.skills[SKILL].evidenceStage, "DECISION_TRAINED");
  return state;
}test("direct mastery blocks three physical prompts from one semantic scenario", () => {
  let state = recognitionReadyState();
  for (let index = 0; index < SAME_DIRECT.length; index += 1) {
    state = answerCorrect(state, SAME_DIRECT[index], 10 + index);
  }
  assert.equal(state.skills[SKILL].directDecisionCorrect, 3);
  assert.equal(deriveEvidenceStage(state.skills[SKILL]), "RECOGNITION_TRAINED");
});

test("an independent direct semantic scenario legitimately advances mastery", () => {
  let state = recognitionReadyState();
  SAME_DIRECT.forEach((id, index) => { state = answerCorrect(state, id, 20 + index); });
  state = answerCorrect(state, OTHER_DIRECT, 24);
  assert.equal(deriveEvidenceStage(state.skills[SKILL]), "DECISION_TRAINED");
});

test("transfer mastery blocks two physical prompts from one semantic scenario", () => {
  let state = directReadyState();
  state = answerCorrect(state, SAME_TRANSFER[0], 30);
  state = answerCorrect(state, SAME_TRANSFER[1], 31);
  assert.equal(state.skills[SKILL].changedCorrect, 2);
  assert.equal(deriveEvidenceStage(state.skills[SKILL]), "DECISION_TRAINED");
});

test("an independent transfer semantic scenario legitimately advances mastery", () => {
  let state = directReadyState();
  state = answerCorrect(state, SAME_TRANSFER[0], 40);
  state = answerCorrect(state, SAME_TRANSFER[1], 41);
  state = answerCorrect(state, OTHER_TRANSFER, 42);
  assert.equal(deriveEvidenceStage(state.skills[SKILL]), "CHANGED_NODE_TRANSFER");
});test("corpus-wide current semantic authority is complete and reachable", () => {
  const requirements = practicalScenarioEvidenceRequirements();
  assert.deepEqual(requirements, {
    recognitionScenarios: 2,
    directDecisionScenarios: 2,
    transferScenarios: 2,
  });
  for (const decision of practicalDecisionById.values()) {
    assert.ok(
      PRACTICAL_EVIDENCE_AUTHORITY_BY_DECISION_ID[decision.id],
      `missing explicit authority for ${decision.id}`,
    );
  }
  const skills = practicalProgressCountingSkills();
  assert.equal(skills.length, 71);
  for (const skill of skills) {
    const stats = practicalSkillCorpusStats(skill.id);
    assert.ok(stats.recognitionScenarios >= 2, `${skill.id}: recognition stranded`);
    assert.ok(stats.directScenarios >= 2, `${skill.id}: direct stranded`);
    assert.ok(stats.transferScenarios >= 2, `${skill.id}: transfer stranded`);
    assert.equal(practicalSkillCorpusCanReach(skill.id, "DECISION_TRAINED"), true);
    assert.equal(practicalSkillCorpusCanReach(skill.id, "CHANGED_NODE_TRANSFER"), true);
  }
});

test("scaffold cannot become hidden from one transfer scenario but can fade with independent scenarios", () => {
  let state = recognitionReadyState();
  state = answerCorrect(state, SAME_TRANSFER[0], 50);
  state = answerCorrect(state, SAME_TRANSFER[1], 51);
  state = answerCorrect(state, BOUNDARY, 52);
  assert.equal(recommendedPracticalScaffold(state, SKILL), "reduced");
  assert.equal(effectivePracticalScaffold(state, SKILL, "hidden"), "reduced");
  state = answerCorrect(state, OTHER_TRANSFER, 53);
  assert.equal(recommendedPracticalScaffold(state, SKILL), "hidden");
  assert.equal(effectivePracticalScaffold(state, SKILL, "hidden"), "hidden");
});function compactedSingleStimulusRoot() {
  let profile = createPracticalProfileState(new Date("2026-09-18T01:00:00Z"));
  profile.mastery = markPracticalConceptTaught(
    profile.mastery,
    SKILL,
    new Date("2026-09-18T01:00:01Z"),
  );
  const decision = practicalDecisionById.get(RECOGNITION[0]);
  assert.ok(decision);
  for (let index = 0; index < 257; index += 1) {
    profile.mastery = recordPracticalDecision(profile.mastery, {
      decisionId: decision.id,
      actionId: decision.correctActionId,
      reasonId: decision.correctReasonId,
      confidence: 80,
      now: new Date(Date.UTC(2026, 8, 18, 1, 1, index)),
    });
  }
  assert.equal(profile.mastery.attemptArchive.count, 129);
  assert.equal(profile.mastery.attempts.length, 128);
  assert.equal(profile.mastery.skills[SKILL].evidenceStage, "CONCEPT_TAUGHT");
  return withPracticalProfile(
    emptyLearnerState(),
    profile,
    new Date("2026-09-18T02:00:00Z"),
  );
}

function canonicalArchivedAttempt(decisionId, ordinal) {
  const decision = practicalDecisionById.get(decisionId);
  assert.ok(decision);
  const answeredAt = new Date(Date.UTC(2026, 8, 18, 0, 0, ordinal)).toISOString();
  return {
    attempt: {
      id: `forged-summary:${decisionId}:${ordinal}`,
      decisionId,
      skillId: decision.skillId,
      actionId: decision.correctActionId,
      reasonId: decision.correctReasonId,
      confidence: 80,
      confidenceProvenance: "NOT_CAPTURED",
      correct: true,
      answeredAt,
    },
    ordinal,
  };
}function forgeArchivedMasterySummary(root) {
  const forged = structuredClone(root);
  const mastery = forged._practicalProfile.mastery;
  const archive = mastery.attemptArchive;
  const successful = [
    RECOGNITION[0], RECOGNITION[1],
    SAME_DIRECT[0], SAME_DIRECT[1], OTHER_DIRECT,
    SAME_TRANSFER[0], OTHER_TRANSFER, BOUNDARY,
  ];
  const ordinals = successful.map((_, index) => 122 + index);
  archive.attemptCountByDecision = Object.fromEntries(
    successful.map((id, index) => [id, index === 0 ? 122 : 1]),
  );
  archive.latestByDecision = Object.fromEntries(
    successful.map((id, index) => [id, canonicalArchivedAttempt(id, ordinals[index])]),
  );
  archive.latestCorrectOrdinalByDecision = Object.fromEntries(
    successful.map((id, index) => [id, ordinals[index]]),
  );
  const recentAttempts = successful.map((decisionId) => {
    const ref = archive.latestByDecision[decisionId];
    return {
      decisionId,
      correct: true,
      confidence: 80,
      confidenceProvenance: "NOT_CAPTURED",
      answeredAt: ref.attempt.answeredAt,
      ordinal: ref.ordinal,
    };
  });
  archive.bySkill[SKILL] = {
    attempts: 129,
    correct: 129,
    recognitionCorrect: 123,
    directDecisionCorrect: 3,
    changedCorrect: 2,
    boundaryCorrect: 1,
    mixedCorrect: 0,
    successfulDecisionIds: [...successful],
    lastAttemptAt: recentAttempts.at(-1).answeredAt,
    lastIncorrectDecisionId: null,
    lastCorrect: {
      decisionId: BOUNDARY,
      answeredAt: recentAttempts.at(-1).answeredAt,
      ordinal: recentAttempts.at(-1).ordinal,
    },
    recentAttempts,
  };  const progress = mastery.skills[SKILL];
  progress.attempts = 257;
  progress.correct = 257;
  progress.recognitionCorrect = 251;
  progress.directDecisionCorrect = 3;
  progress.changedCorrect = 2;
  progress.boundaryCorrect = 1;
  progress.mixedCorrect = 0;
  progress.successfulDecisionIds = [...successful];
  progress.lastIncorrectDecisionId = null;
  progress.lastAttemptAt = mastery.attempts.at(-1).answeredAt;
  progress.evidenceStage = deriveEvidenceStage(progress);
  assert.equal(progress.evidenceStage, "BOUNDARY_TESTED");
  return forged;
}

function asPreviousSchema4(root) {
  const previous = structuredClone(root);
  previous._practicalProfile.mastery.schemaVersion = 4;
  previous._practicalProfile.mastery.attemptArchive.version = 1;
  delete previous._practicalProfile.mastery.attemptArchive.provenanceDigest;
  return previous;
}

test("legitimate 257-attempt compaction remains valid and bounded", () => {
  const root = compactedSingleStimulusRoot();
  const mastery = root._practicalProfile.mastery;
  assert.equal(validateRootLearnerState(root), true);
  assert.equal(validatePracticalProfileState(root._practicalProfile), true);
  assert.equal(mastery.attemptArchive.count + mastery.attempts.length, 257);
  assert.ok(mastery.attempts.length <= 256);
  assert.ok(new TextEncoder().encode(JSON.stringify(root)).byteLength < 250_000);
});test("forged compact summary with unchanged provenance commitment fails closed", () => {
  const legitimate = compactedSingleStimulusRoot();
  const rawTail = JSON.stringify(legitimate._practicalProfile.mastery.attempts);
  const originalDigest = legitimate._practicalProfile.mastery.attemptArchive.digest;
  const originalProvenance = legitimate._practicalProfile.mastery.attemptArchive.provenanceDigest;
  const forged = forgeArchivedMasterySummary(legitimate);

  assert.equal(forged._practicalProfile.mastery.attemptArchive.digest, originalDigest);
  assert.equal(forged._practicalProfile.mastery.attemptArchive.provenanceDigest, originalProvenance);
  assert.equal(JSON.stringify(forged._practicalProfile.mastery.attempts), rawTail);
  assert.notEqual(
    practicalAttemptArchiveProvenanceDigest(forged._practicalProfile.mastery.attemptArchive),
    originalProvenance,
  );
  assert.equal(validatePracticalProfileState(forged._practicalProfile), false);
  assert.equal(validateRootLearnerState(forged), false);
});

test("forged archived success IDs counters and stage cannot manufacture BOUNDARY_TESTED through import or cloud normalization", () => {
  const legitimate = compactedSingleStimulusRoot();
  const forged = forgeArchivedMasterySummary(legitimate);
  assert.equal(forged._practicalProfile.mastery.skills[SKILL].evidenceStage, "BOUNDARY_TESTED");

  const prepared = prepareLearnerStateImport(JSON.stringify(forged), emptyLearnerState());
  assert.equal(prepared.ok, false);
  assert.equal(prepared.reason, "invalid_state");
  assert.equal(normalizeCurrentLearnerState(forged), null);
});

test("forged summary cannot become a safe successor or resurrect evidence", () => {
  const legitimate = compactedSingleStimulusRoot();
  const forged = forgeArchivedMasterySummary(legitimate);
  assert.equal(practicalProfileSafeSuccessor(forged, legitimate), false);
  assert.equal(isSafeSuccessor(forged, legitimate), false);
});test("pre-repair valid schema-v4 compacted profile follows tail-proven downgrade without raw-tail loss", () => {
  const current = compactedSingleStimulusRoot();
  const previous = asPreviousSchema4(current);
  const tailBefore = JSON.stringify(previous._practicalProfile.mastery.attempts);
  const unrelatedBefore = JSON.stringify(previous._practicalProfile.mastery.skills["RIV-01"]);

  const normalized = normalizeCurrentLearnerState(previous);
  assert.ok(normalized);
  assert.equal(normalized.practicalProfileReconciled, true);
  assert.equal(validateRootLearnerState(normalized.state), true);
  assert.equal(JSON.stringify(normalized.state._practicalProfile.mastery.attempts), tailBefore);
  assert.equal(normalized.state._practicalProfile.mastery.attemptArchive.count, 0);
  assert.deepEqual(normalized.state._practicalProfile.mastery.skills[SKILL].successfulDecisionIds, [RECOGNITION[0]]);
  assert.equal(normalized.state._practicalProfile.mastery.skills[SKILL].evidenceStage, "CONCEPT_TAUGHT");
  assert.equal(JSON.stringify(normalized.state._practicalProfile.mastery.skills["RIV-01"]), unrelatedBefore);
  assert.equal(normalized.state._practicalProfile.mastery.schemaVersion, 5);
  assert.equal(normalized.state._practicalProfile.mastery.attemptArchive.version, 2);
});

test("repeated compaction stays deterministic after provenance commitment", () => {
  const root = compactedSingleStimulusRoot();
  const mastery = root._practicalProfile.mastery;
  const once = compactPracticalAttemptHistory(mastery, true);
  const twice = compactPracticalAttemptHistory(once, true);
  assert.equal(JSON.stringify(twice), JSON.stringify(once));
  assert.equal(
    once.attemptArchive.provenanceDigest,
    practicalAttemptArchiveProvenanceDigest(once.attemptArchive),
  );
});

test("authority registry is ASCII-only and covers the current learner corpus without cue fallback", () => {
  const serialized = JSON.stringify(PRACTICAL_EVIDENCE_AUTHORITY_BY_DECISION_ID);
  assert.equal([...serialized].some((character) => character.codePointAt(0) > 127), false);
  for (const decision of practicalDecisions) {
    const authority = PRACTICAL_EVIDENCE_AUTHORITY_BY_DECISION_ID[decision.id];
    assert.ok(authority);
    assert.ok(authority.evidenceFamilyId.length > 0);
    assert.ok(authority.scenarioId.length > 0);
  }
});
test("forged schema-v4 compact summary cannot survive tail-proven migration", () => {
  const forgedV4 = asPreviousSchema4(forgeArchivedMasterySummary(compactedSingleStimulusRoot()));
  const tailBefore = JSON.stringify(forgedV4._practicalProfile.mastery.attempts);
  assert.equal(forgedV4._practicalProfile.mastery.skills[SKILL].evidenceStage, "BOUNDARY_TESTED");

  const prepared = prepareLearnerStateImport(JSON.stringify(forgedV4), emptyLearnerState());
  assert.equal(prepared.ok, true);
  assert.equal(prepared.migrated, true);
  const importedMastery = prepared.state._practicalProfile.mastery;
  assert.equal(importedMastery.skills[SKILL].evidenceStage, "CONCEPT_TAUGHT");
  assert.deepEqual(importedMastery.skills[SKILL].successfulDecisionIds, [RECOGNITION[0]]);
  assert.equal(importedMastery.attemptArchive.count, 0);
  assert.equal(JSON.stringify(importedMastery.attempts), tailBefore);

  const normalized = normalizeCurrentLearnerState(forgedV4);
  assert.ok(normalized);
  assert.equal(normalized.state._practicalProfile.mastery.skills[SKILL].evidenceStage, "CONCEPT_TAUGHT");
  assert.equal(normalized.state._practicalProfile.mastery.attemptArchive.count, 0);
});

test("legitimate non-compacted schema-v4 migration keeps fully provable tail evidence", () => {
  let profile = createPracticalProfileState(new Date("2026-09-18T05:00:00Z"));
  profile.mastery = markPracticalConceptTaught(
    profile.mastery,
    SKILL,
    new Date("2026-09-18T05:00:01Z"),
  );
  profile.mastery = answerCorrect(profile.mastery, RECOGNITION[0], 10);
  profile.mastery = answerCorrect(profile.mastery, RECOGNITION[1], 11);
  const root = withPracticalProfile(emptyLearnerState(), profile, new Date("2026-09-18T05:01:00Z"));
  const previous = asPreviousSchema4(root);
  const tailBefore = JSON.stringify(previous._practicalProfile.mastery.attempts);
  assert.equal(previous._practicalProfile.mastery.attemptArchive.count, 0);

  const normalized = normalizeCurrentLearnerState(previous);
  assert.ok(normalized);
  assert.equal(normalized.state._practicalProfile.mastery.schemaVersion, 5);
  assert.equal(normalized.state._practicalProfile.mastery.attemptArchive.version, 2);
  assert.equal(normalized.state._practicalProfile.mastery.attemptArchive.count, 0);
  assert.equal(JSON.stringify(normalized.state._practicalProfile.mastery.attempts), tailBefore);
  assert.equal(normalized.state._practicalProfile.mastery.skills[SKILL].evidenceStage, "RECOGNITION_TRAINED");
});

test("schema-v4 compact downgrade is idempotent and safe-successor compatible", () => {
  const previous = asPreviousSchema4(compactedSingleStimulusRoot());
  const once = normalizeCurrentLearnerState(previous);
  assert.ok(once);
  const twice = normalizeCurrentLearnerState(once.state);
  assert.ok(twice);
  assert.equal(JSON.stringify(twice.state), JSON.stringify(once.state));
  assert.equal(practicalProfileSafeSuccessor(once.state, previous), true);
  const forged = normalizeCurrentLearnerState(asPreviousSchema4(forgeArchivedMasterySummary(compactedSingleStimulusRoot())));
  assert.ok(forged);
  assert.equal(JSON.stringify(forged.state), JSON.stringify(once.state));
  assert.equal(isSafeSuccessor(forged.state, once.state), true);
});

test("current schema-v5 compact profiles remain byte-stable under normalization", () => {
  const current = compactedSingleStimulusRoot();
  const normalized = normalizeCurrentLearnerState(current);
  assert.ok(normalized);
  assert.equal(normalized.practicalProfileReconciled, false);
  assert.equal(JSON.stringify(normalized.state), JSON.stringify(current));
  assert.equal(normalized.state._practicalProfile.mastery.attemptArchive.count, 129);
});
