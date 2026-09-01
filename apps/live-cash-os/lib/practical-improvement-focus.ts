import { practicalSkillFamilies, type PracticalSkillFamily } from "../content/practical-mastery";
import { isIntegrationDerivedSkill } from "../content/practical-mastery/integration-derived";
import {
  isPracticalImprovementTopicKey,
  practicalImprovementTopicByKey,
  type PracticalImprovementTopic,
  type PracticalImprovementTopicKey,
} from "../content/practical-mastery/improvement-topics";
import { practicalSourceGapBySkillId, type PracticalSourceGapStatus } from "../content/practical-mastery/source-gaps";
import { isIntegratedFocusAdmissible, requestedIntegratedFocusItem } from "./practical-adaptive-session";
import {
  isPracticalBridgeSkill,
  practicalSkillCorpusCanReach,
  recommendNextPracticalSkill,
  stageAtLeast,
  type PracticalMasteryState,
} from "./practical-mastery-core";

export type PracticalImprovementResolutionKind = "COMPLETE" | "NO_ELIGIBLE" | "NO_USEFUL_ITEM" | "EXACT_FOCUS";

export type PracticalImprovementResolutionReason =
  | "INVALID_TOPIC"
  | "TOPIC_COMPLETE"
  | "NO_CURRENTLY_ADMISSIBLE_FOCUS"
  | "NO_USABLE_FOCUSED_ITEM"
  | "SYSTEM_RECOMMENDATION_IN_TOPIC"
  | "CANONICAL_TOPIC_ORDER";

export type PracticalImprovementResolution = {
  kind: PracticalImprovementResolutionKind;
  reason: PracticalImprovementResolutionReason;
  topicKey: PracticalImprovementTopicKey | null;
  focusSkillId: string | null;
  systemRecommendedSkillId: string | null;
  supportedSkillIds: string[];
  eligibleSkillIds: string[];
};

export type PracticalImprovementStructuralAuthorities = {
  isIntegrationDerivedSkill: (skillId: string) => boolean;
  isBridgeSkill: (skillId: string) => boolean;
  sourceGapStatus: (skillId: string) => PracticalSourceGapStatus | null;
  corpusCanReachDecisionTraining: (skillId: string) => boolean;
};

export type PracticalImprovementFocusAuthorities = {
  recommendedSkillId: (state: PracticalMasteryState) => string | null;
  isFocusAdmissible: (state: PracticalMasteryState, skillId: string) => boolean;
  hasUsableFocusedItem: (state: PracticalMasteryState, skillId: string) => boolean;
};

const canonicalStructuralAuthorities: PracticalImprovementStructuralAuthorities = {
  isIntegrationDerivedSkill,
  isBridgeSkill: isPracticalBridgeSkill,
  sourceGapStatus: (skillId) => practicalSourceGapBySkillId.get(skillId)?.status ?? null,
  corpusCanReachDecisionTraining: (skillId) => practicalSkillCorpusCanReach(skillId, "DECISION_TRAINED"),
};

const canonicalFocusAuthorities: PracticalImprovementFocusAuthorities = {
  recommendedSkillId: (state) => recommendNextPracticalSkill(state)?.skillId ?? null,
  isFocusAdmissible: isIntegratedFocusAdmissible,
  hasUsableFocusedItem: (state, skillId) => requestedIntegratedFocusItem(state, skillId) !== null,
};

export function isIndependentPracticalImprovementSkill(
  skillId: string,
  authorities: PracticalImprovementStructuralAuthorities = canonicalStructuralAuthorities,
): boolean {
  if (authorities.isIntegrationDerivedSkill(skillId)) return false;
  if (authorities.isBridgeSkill(skillId)) return false;
  const gapStatus = authorities.sourceGapStatus(skillId);
  if (gapStatus === "PARTIAL" || gapStatus === "SOURCE_BLOCKED") return false;
  return authorities.corpusCanReachDecisionTraining(skillId);
}

function topicSkillsInCanonicalRegistryOrder(topic: PracticalImprovementTopic): PracticalSkillFamily[] {
  const waveSet = new Set(topic.waves);
  return practicalSkillFamilies.filter((skill) => waveSet.has(skill.wave));
}

export function supportedPracticalImprovementSkills(
  topicKey: PracticalImprovementTopicKey,
  authorities: PracticalImprovementStructuralAuthorities = canonicalStructuralAuthorities,
): PracticalSkillFamily[] {
  const topic = practicalImprovementTopicByKey.get(topicKey);
  if (!topic) return [];
  return topicSkillsInCanonicalRegistryOrder(topic).filter((skill) => isIndependentPracticalImprovementSkill(skill.id, authorities));
}

function topicTargetIsComplete(state: PracticalMasteryState, skills: readonly PracticalSkillFamily[]): boolean {
  return skills.length > 0 && skills.every((skill) => {
    const progress = state.skills[skill.id];
    return Boolean(progress && stageAtLeast(progress.evidenceStage, skill.targetEvidenceStage));
  });
}

export function resolvePracticalImprovementFocus(
  state: PracticalMasteryState,
  topicKey: string,
  options: {
    structuralAuthorities?: PracticalImprovementStructuralAuthorities;
    focusAuthorities?: PracticalImprovementFocusAuthorities;
  } = {},
): PracticalImprovementResolution {
  if (!isPracticalImprovementTopicKey(topicKey)) {
    return {
      kind: "NO_ELIGIBLE",
      reason: "INVALID_TOPIC",
      topicKey: null,
      focusSkillId: null,
      systemRecommendedSkillId: null,
      supportedSkillIds: [],
      eligibleSkillIds: [],
    };
  }

  const structuralAuthorities = options.structuralAuthorities ?? canonicalStructuralAuthorities;
  const focusAuthorities = options.focusAuthorities ?? canonicalFocusAuthorities;
  const supportedSkills = supportedPracticalImprovementSkills(topicKey, structuralAuthorities);
  const supportedSkillIds = supportedSkills.map((skill) => skill.id);
  const systemRecommendedSkillId = focusAuthorities.recommendedSkillId(state);

  if (topicTargetIsComplete(state, supportedSkills)) {
    return {
      kind: "COMPLETE",
      reason: "TOPIC_COMPLETE",
      topicKey,
      focusSkillId: null,
      systemRecommendedSkillId,
      supportedSkillIds,
      eligibleSkillIds: [],
    };
  }

  const eligibleSkillIds = supportedSkillIds.filter((skillId) => focusAuthorities.isFocusAdmissible(state, skillId));
  if (!eligibleSkillIds.length) {
    return {
      kind: "NO_ELIGIBLE",
      reason: "NO_CURRENTLY_ADMISSIBLE_FOCUS",
      topicKey,
      focusSkillId: null,
      systemRecommendedSkillId,
      supportedSkillIds,
      eligibleSkillIds,
    };
  }

  const orderedCandidateSkillIds = systemRecommendedSkillId && eligibleSkillIds.includes(systemRecommendedSkillId)
    ? [systemRecommendedSkillId, ...eligibleSkillIds.filter((skillId) => skillId !== systemRecommendedSkillId)]
    : eligibleSkillIds;

  const focusSkillId = orderedCandidateSkillIds.find((skillId) => focusAuthorities.hasUsableFocusedItem(state, skillId)) ?? null;
  if (!focusSkillId) {
    return {
      kind: "NO_USEFUL_ITEM",
      reason: "NO_USABLE_FOCUSED_ITEM",
      topicKey,
      focusSkillId: null,
      systemRecommendedSkillId,
      supportedSkillIds,
      eligibleSkillIds,
    };
  }

  return {
    kind: "EXACT_FOCUS",
    reason: focusSkillId === systemRecommendedSkillId ? "SYSTEM_RECOMMENDATION_IN_TOPIC" : "CANONICAL_TOPIC_ORDER",
    topicKey,
    focusSkillId,
    systemRecommendedSkillId,
    supportedSkillIds,
    eligibleSkillIds,
  };
}
