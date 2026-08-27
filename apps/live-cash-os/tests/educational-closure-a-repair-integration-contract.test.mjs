import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  practicalDecisions,
  practicalSkillFamilies,
} from "../content/practical-mastery/index.ts";
import {
  integrationDerivedSkillIds,
  isIntegrationDerivedSkill,
} from "../content/practical-mastery/integration-derived.ts";
import { firstJourneySteps } from "../content/practical-mastery/first-journey.ts";
import { isIntegratedFocusAdmissible } from "../lib/practical-adaptive-session.ts";
import {
  buildIntegratedSession,
  RETENTION_INTERVAL_DAYS,
  supportedIntegratedSkillIds,
} from "../lib/practical-integrated-session.ts";
import {
  createPracticalMasteryState,
  nextPracticalDecision,
  PRACTICAL_MASTERY_STATE_SCHEMA_VERSION,
  practicalEvidenceRequirements,
  practicalRepairQueue,
  recommendNextPracticalSkill,
  recordPracticalDecision,
  trainablePracticalSkills,
  markPracticalConceptTaught,
} from "../lib/practical-mastery-core.ts";
import { recommendFirstJourneyStep } from "../lib/practical-first-journey.ts";
import {
  isPostQuickStartTeachingAdmissible,
  resolvePostQuickStartLearningTarget,
} from "../lib/practical-post-quick-start-learning.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const skillMapSource = await readFile(path.join(root, "components/PracticalMasteryExperience.tsx"), "utf8");

const QUICK_START_SKILLS = [
  "FND-01",
  "FND-02",
  "PF-01",
  "PF-04",
  "W4-BOARD-01",
  "IP-01",
  "BL-04",
  "W4-RUNOUT-01",
];

function correctDecision(state, decision, now) {
  return recordPracticalDecision(state, {
    decisionId: decision.id,
    actionId: decision.correctActionId,
    reasonId: decision.correctReasonId,
    confidence: 65,
    now,
  });
}

function completeQuickStart(state, clockStart = Date.parse("2026-08-27T00:00:00.000Z")) {
  let next = state;
  for (const [index, expectedSkillId] of QUICK_START_SKILLS.entries()) {
    const recommendation = recommendFirstJourneyStep(next);
    assert.ok(recommendation, `Quick Start step ${index + 1} must be reachable`);
    assert.equal(recommendation.skillId, expectedSkillId);
    next = markPracticalConceptTaught(next, expectedSkillId, new Date(clockStart + index * 10_000));
    const recognition = practicalDecisions.filter(
      (decision) => decision.skillId === expectedSkillId && decision.kind === "recognition",
    );
    assert.ok(recognition.length >= 2, `${expectedSkillId} must retain two recognition stimuli`);
    for (const [decisionIndex, decision] of recognition.slice(0, 2).entries()) {
      next = correctDecision(next, decision, new Date(clockStart + index * 10_000 + 1000 + decisionIndex));
    }
  }
  return next;
}

function advanceToUnseenTeaching(state) {
  let next = state;
  for (let guard = 0; guard < 200; guard += 1) {
    const target = resolvePostQuickStartLearningTarget(next);
    if (target.kind === "TEACH") return { state: next, target };
    assert.equal(target.kind, "PRACTICE", `expected practice while advancing, got ${target.kind}`);
    const decision = nextPracticalDecision(next, target.skillId);
    assert.ok(decision, `${target.skillId} must expose a decision while advancing`);
    next = correctDecision(next, decision, new Date(Date.parse("2026-08-28T00:00:00.000Z") + guard * 1000));
  }
  throw new Error("Post-QS route did not reach an unseen teaching target within 200 transitions");
}

function wrongActionId(decision) {
  return decision.actionOptions.find((option) => option.id !== decision.correctActionId)?.id ?? null;
}

function recordWrong(state, decision, confidence, now) {
  const actionId = wrongActionId(decision);
  assert.ok(actionId, `${decision.id} must expose a wrong action`);
  return recordPracticalDecision(state, {
    decisionId: decision.id,
    actionId,
    reasonId: decision.correctReasonId,
    confidence,
    now,
  });
}

function allOrdinaryPrerequisitesSatisfiedState() {
  const state = createPracticalMasteryState(new Date("2026-08-27T00:00:00.000Z"));
  for (const progress of Object.values(state.skills)) {
    progress.conceptTaught = true;
    progress.conceptTaughtAt = "2026-08-27T00:00:00.000Z";
    progress.evidenceStage = "DECISION_TRAINED";
  }
  return state;
}

test("A1: one ordinary unresolved wrong owns the primary recommendation before an unseen capability", () => {
  assert.equal(firstJourneySteps.length, 8);
  assert.deepEqual(firstJourneySteps.map((step) => step.skillId), QUICK_START_SKILLS);

  const quickStartState = completeQuickStart(createPracticalMasteryState(new Date("2026-08-27T00:00:00.000Z")));
  const { state: baseline, target } = advanceToUnseenTeaching(quickStartState);
  assert.equal(target.kind, "TEACH");
  const normalRecommendation = recommendNextPracticalSkill(baseline);
  assert.equal(normalRecommendation?.skillId, target.skillId, "no-repair route must preserve normal post-QS teaching");
  assert.equal(baseline.skills[target.skillId].conceptTaught, false);
  assert.equal(baseline.skills[target.skillId].attempts, 0, "unseen skill must not be scored before teaching");
  assert.equal(baseline.skills[target.skillId].evidenceStage, "SOURCE_SUPPORTED");

  const repairSkillId = "FND-01";
  const repairDecision = practicalDecisions.find(
    (decision) => decision.skillId === repairSkillId && decision.kind === "decision",
  );
  assert.ok(repairDecision, `${repairSkillId} must expose a direct decision repair fixture`);

  const ordinaryWrong = recordWrong(
    baseline,
    repairDecision,
    55,
    new Date("2026-08-30T00:00:00.000Z"),
  );
  assert.deepEqual(practicalRepairQueue(ordinaryWrong)[0], repairSkillId);
  assert.equal(recommendNextPracticalSkill(ordinaryWrong)?.skillId, repairSkillId);
  const ordinaryIntegrated = buildIntegratedSession(ordinaryWrong, new Date("2026-08-30T00:01:00.000Z"));
  assert.ok(
    ordinaryIntegrated.some((item) => item.reason === "REPAIR" && item.skillId === repairSkillId),
    "integrated scheduler must carry the same unresolved repair authority",
  );

  const highConfidenceWrong = recordWrong(
    baseline,
    repairDecision,
    95,
    new Date("2026-08-30T00:02:00.000Z"),
  );
  assert.equal(recommendNextPracticalSkill(highConfidenceWrong)?.skillId, repairSkillId);
  const highConfidenceIntegrated = buildIntegratedSession(highConfidenceWrong, new Date("2026-08-30T00:03:00.000Z"));
  assert.ok(highConfidenceIntegrated.some((item) => item.reason === "REPAIR" && item.skillId === repairSkillId));

  const resolved = correctDecision(
    ordinaryWrong,
    repairDecision,
    new Date("2026-08-30T00:04:00.000Z"),
  );
  assert.equal(practicalRepairQueue(resolved).includes(repairSkillId), false);
  assert.equal(recommendNextPracticalSkill(resolved)?.skillId, target.skillId);
  assert.equal(resolved.skills[repairSkillId].delayedRetrievalPassed, false, "immediate correction must not become delayed retrieval");
});

test("A2: W14 INT nodes are explicit derived capabilities, not ordinary learner skills", () => {
  assert.deepEqual([...integrationDerivedSkillIds], ["INT-01", "INT-02", "INT-03", "INT-04", "INT-05"]);
  assert.deepEqual(
    practicalSkillFamilies.filter((skill) => isIntegrationDerivedSkill(skill.id)).map((skill) => skill.id),
    [...integrationDerivedSkillIds],
  );
  assert.equal(isIntegrationDerivedSkill("PF-01"), false);

  const blank = createPracticalMasteryState(new Date("2026-08-27T00:00:00.000Z"));
  for (const skillId of integrationDerivedSkillIds) {
    assert.ok(blank.skills[skillId], `${skillId} historical state slot must remain available`);
    assert.ok(practicalDecisions.some((decision) => decision.skillId === skillId), `${skillId} decision corpus must remain available internally`);
  }
  assert.equal(PRACTICAL_MASTERY_STATE_SCHEMA_VERSION, 3);

  const saturated = allOrdinaryPrerequisitesSatisfiedState();
  const trainableIds = new Set(trainablePracticalSkills(saturated).map((skill) => skill.id));
  const integratedIds = new Set(supportedIntegratedSkillIds(saturated));
  for (const skillId of integrationDerivedSkillIds) {
    assert.equal(trainableIds.has(skillId), false, `${skillId} must not be an ordinary trainable skill`);
    assert.equal(integratedIds.has(skillId), false, `${skillId} must not become focused integrated practice`);
    assert.equal(isIntegratedFocusAdmissible(saturated, skillId), false);
  }
  assert.ok(integratedIds.has("FND-01"), "ordinary W1-W13 integrated practice must remain available");

  const teachingFixture = structuredClone(saturated);
  teachingFixture.skills["INT-01"].conceptTaught = false;
  teachingFixture.skills["INT-01"].conceptTaughtAt = null;
  teachingFixture.skills["INT-01"].evidenceStage = "SOURCE_SUPPORTED";
  assert.equal(isPostQuickStartTeachingAdmissible(teachingFixture, "INT-01"), false);
  assert.deepEqual(resolvePostQuickStartLearningTarget(teachingFixture, "INT-01"), {
    kind: "BLOCKED",
    skillId: "INT-01",
    reason: "FOCUS_UNAVAILABLE",
  });
});

test("A2: Skill Map and ordinary counts exclude derived W14 while retention/mastery contracts stay unchanged", () => {
  assert.match(skillMapSource, /const learnerSkillFamilies = practicalSkillFamilies\.filter\(\(skill\) => !isIntegrationDerivedSkill\(skill\.id\)\);/);
  assert.match(skillMapSource, /const skillMapSkillIds = useMemo\(\(\) => learnerSkillFamilies\.map/);
  assert.match(skillMapSource, /for \(const item of learnerSkillFamilies\)/);
  assert.match(skillMapSource, /const trained = learnerSkillFamilies\.filter/);
  assert.match(skillMapSource, /const retained = learnerSkillFamilies\.filter/);
  assert.match(skillMapSource, /const field = learnerSkillFamilies\.filter/);

  assert.deepEqual([...RETENTION_INTERVAL_DAYS], [1, 3, 7]);
  assert.deepEqual(practicalEvidenceRequirements(), {
    recognitionStimuli: 2,
    directDecisionStimuli: 3,
    transferStimuli: 2,
    boundaryStimuli: 1,
  });
});
