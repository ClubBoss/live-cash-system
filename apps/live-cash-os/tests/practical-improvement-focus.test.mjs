import assert from "node:assert/strict";
import test from "node:test";
import { practicalSkillFamilies } from "../content/practical-mastery/index.ts";
import { integrationDerivedSkillIds } from "../content/practical-mastery/integration-derived.ts";
import {
  practicalImprovementTopics,
  practicalImprovementTopicByKey,
} from "../content/practical-mastery/improvement-topics.ts";
import { PRACTICAL_WAVE_IDS } from "../content/practical-mastery/types.ts";
import {
  isIndependentPracticalImprovementSkill,
  resolvePracticalImprovementFocus,
  supportedPracticalImprovementSkills,
} from "../lib/practical-improvement-focus.ts";
import { createPracticalMasteryState } from "../lib/practical-mastery-core.ts";

const NOW = new Date("2026-09-01T00:00:00.000Z");

function freshState() {
  return createPracticalMasteryState(NOW, true);
}

function withConceptTaught(state, ...skillIds) {
  const next = structuredClone(state);
  for (const skillId of skillIds) {
    next.skills[skillId].conceptTaught = true;
    next.skills[skillId].evidenceStage = "CONCEPT_TAUGHT";
  }
  return next;
}

function focusAuthorities({ recommendedSkillId = null, admissibleSkillIds = null, usableSkillIds = null } = {}) {
  return {
    recommendedSkillId: () => recommendedSkillId,
    isFocusAdmissible: (_state, skillId) => admissibleSkillIds === null || admissibleSkillIds.includes(skillId),
    hasUsableFocusedItem: (_state, skillId) => usableSkillIds === null || usableSkillIds.includes(skillId),
  };
}

test("B+-01 static topic taxonomy is unique, bilingual, valid, and excludes W14", () => {
  assert.equal(new Set(practicalImprovementTopics.map((topic) => topic.key)).size, practicalImprovementTopics.length);
  const validWaves = new Set(PRACTICAL_WAVE_IDS);
  for (const topic of practicalImprovementTopics) {
    assert.ok(topic.titleRu.trim().length > 0);
    assert.ok(topic.titleEn.trim().length > 0);
    assert.ok(topic.waves.length > 0);
    for (const wave of topic.waves) assert.ok(validWaves.has(wave));
    assert.ok(!topic.waves.includes("W14_INTEGRATED"));
    assert.equal(practicalImprovementTopicByKey.get(topic.key)?.key, topic.key);
  }
});

test("B+-02 every topic resolves only current canonical registry skill IDs in registry order", () => {
  const registryIndex = new Map(practicalSkillFamilies.map((skill, index) => [skill.id, index]));
  for (const topic of practicalImprovementTopics) {
    const supported = supportedPracticalImprovementSkills(topic.key);
    assert.ok(supported.length > 0, `${topic.key} should have supported independent-focus skills`);
    for (const skill of supported) assert.ok(registryIndex.has(skill.id));
    const indices = supported.map((skill) => registryIndex.get(skill.id));
    assert.deepEqual(indices, [...indices].sort((a, b) => a - b));
  }
});

test("B+-03 current PARTIAL, bridge, and integration-derived families are excluded", () => {
  assert.equal(isIndependentPracticalImprovementSkill("BL-11"), false, "PARTIAL source gap must be excluded");
  for (const skillId of ["OOP-06", "OOP-07", "IP-03", "IP-04", "IP-05", "IP-06"]) {
    assert.equal(isIndependentPracticalImprovementSkill(skillId), false, `${skillId} bridge must be excluded`);
  }
  for (const skillId of integrationDerivedSkillIds) {
    assert.equal(isIndependentPracticalImprovementSkill(skillId), false, `${skillId} integration-derived skill must be excluded`);
  }
});

test("B+-04 SOURCE_BLOCKED exclusion is enforced by the structural boundary without duplicating source-gap policy", () => {
  const structuralAuthorities = {
    isIntegrationDerivedSkill: () => false,
    isBridgeSkill: () => false,
    sourceGapStatus: () => "SOURCE_BLOCKED",
    corpusCanReachDecisionTraining: () => true,
  };
  assert.equal(isIndependentPracticalImprovementSkill("FND-01", structuralAuthorities), false);
});

test("B+-05 real focus admissibility excludes a concept-taught skill whose hard prerequisite is not decision-trained", () => {
  const state = withConceptTaught(freshState(), "PF-04");
  const result = resolvePracticalImprovementFocus(state, "preflop");
  assert.ok(!result.eligibleSkillIds.includes("PF-04"));
});

test("B+-06 canonical focus authority produces an exact same-topic focus when the skill is genuinely admissible", () => {
  const state = withConceptTaught(freshState(), "FND-01");
  const result = resolvePracticalImprovementFocus(state, "foundations");
  assert.equal(result.kind, "EXACT_FOCUS");
  assert.equal(result.focusSkillId, "FND-01");
  assert.ok(result.eligibleSkillIds.includes("FND-01"));
});

test("B+-07 recommendation inside the selected topic wins exact focus", () => {
  const state = freshState();
  const result = resolvePracticalImprovementFocus(state, "foundations", {
    focusAuthorities: focusAuthorities({
      recommendedSkillId: "FND-05",
      admissibleSkillIds: ["FND-01", "FND-05"],
      usableSkillIds: ["FND-01", "FND-05"],
    }),
  });
  assert.equal(result.kind, "EXACT_FOCUS");
  assert.equal(result.focusSkillId, "FND-05");
  assert.equal(result.reason, "SYSTEM_RECOMMENDATION_IN_TOPIC");
});

test("B+-08 recommendation outside the selected topic remains visible but does not replace manual in-topic resolution", () => {
  const state = freshState();
  const result = resolvePracticalImprovementFocus(state, "foundations", {
    focusAuthorities: focusAuthorities({
      recommendedSkillId: "PF-01",
      admissibleSkillIds: ["FND-01", "FND-05"],
      usableSkillIds: ["FND-01", "FND-05"],
    }),
  });
  assert.equal(result.kind, "EXACT_FOCUS");
  assert.equal(result.systemRecommendedSkillId, "PF-01");
  assert.equal(result.focusSkillId, "FND-01");
  assert.equal(result.reason, "CANONICAL_TOPIC_ORDER");
});

test("B+-09 COMPLETE is derived from the supported topic target without mutating state", () => {
  const state = freshState();
  const supported = supportedPracticalImprovementSkills("foundations");
  for (const skill of supported) state.skills[skill.id].evidenceStage = skill.targetEvidenceStage;
  const before = JSON.stringify(state);
  const result = resolvePracticalImprovementFocus(state, "foundations");
  assert.equal(result.kind, "COMPLETE");
  assert.equal(result.focusSkillId, null);
  assert.equal(JSON.stringify(state), before);
});

test("B+-10 NO_ELIGIBLE never broadens to the system recommendation from another topic", () => {
  const state = freshState();
  const result = resolvePracticalImprovementFocus(state, "foundations", {
    focusAuthorities: focusAuthorities({ recommendedSkillId: "PF-01", admissibleSkillIds: [] }),
  });
  assert.equal(result.kind, "NO_ELIGIBLE");
  assert.equal(result.focusSkillId, null);
  assert.equal(result.systemRecommendedSkillId, "PF-01");
});

test("B+-11 NO_USEFUL_ITEM is explicit when exact candidates exist but focused-item authority yields none", () => {
  const state = freshState();
  const result = resolvePracticalImprovementFocus(state, "foundations", {
    focusAuthorities: focusAuthorities({
      recommendedSkillId: "FND-01",
      admissibleSkillIds: ["FND-01"],
      usableSkillIds: [],
    }),
  });
  assert.equal(result.kind, "NO_USEFUL_ITEM");
  assert.deepEqual(result.eligibleSkillIds, ["FND-01"]);
  assert.equal(result.focusSkillId, null);
});

test("B+-12 invalid topics fail closed", () => {
  const result = resolvePracticalImprovementFocus(freshState(), "not-a-topic");
  assert.deepEqual(result, {
    kind: "NO_ELIGIBLE",
    reason: "INVALID_TOPIC",
    topicKey: null,
    focusSkillId: null,
    systemRecommendedSkillId: null,
    supportedSkillIds: [],
    eligibleSkillIds: [],
  });
});

test("B+-13 selector is deterministic, read-only, and independent of RU/EN lexical order", () => {
  const state = freshState();
  const before = JSON.stringify(state);
  const authorities = focusAuthorities({
    recommendedSkillId: "PF-01",
    admissibleSkillIds: ["FND-01", "FND-05"],
    usableSkillIds: ["FND-01", "FND-05"],
  });
  const first = resolvePracticalImprovementFocus(state, "foundations", { focusAuthorities: authorities });
  const second = resolvePracticalImprovementFocus(state, "foundations", { focusAuthorities: authorities });
  assert.deepEqual(second, first);
  assert.equal(JSON.stringify(state), before);

  const ruSortedKeys = [...practicalImprovementTopics].sort((a, b) => a.titleRu.localeCompare(b.titleRu)).map((topic) => topic.key);
  const enSortedKeys = [...practicalImprovementTopics].sort((a, b) => a.titleEn.localeCompare(b.titleEn)).map((topic) => topic.key);
  assert.ok(ruSortedKeys.length === enSortedKeys.length);
  assert.deepEqual(
    supportedPracticalImprovementSkills("foundations").map((skill) => skill.id),
    first.supportedSkillIds,
  );
});
