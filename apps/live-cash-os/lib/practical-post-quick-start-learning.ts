import {
  practicalAnchors,
  practicalRules,
  practicalSkillById,
  type PracticalAnchor,
  type PracticalRule,
} from "../content/practical-mastery";
import { isIntegrationDerivedSkill } from "../content/practical-mastery/integration-derived";
import { learningRouteScore } from "../content/practical-mastery/learning-route";
import { practicalSourceGapBySkillId } from "../content/practical-mastery/source-gaps";
import { isIntegratedFocusAdmissible } from "./practical-adaptive-session";
import { firstJourneyProgress } from "./practical-first-journey";
import {
  isPracticalBridgeSkill,
  markPracticalConceptTaught,
  nextPracticalDecision,
  practicalPrerequisitesMet,
  practicalSkillCorpusCanReach,
  recommendNextPracticalSkill,
  stageAtLeast,
  trainablePracticalSkills,
  type PracticalMasteryState,
} from "./practical-mastery-core";

export type PracticalPostQuickStartTeachingAsset =
  | { kind: "RULE"; rule: PracticalRule }
  | { kind: "ANCHOR"; anchor: PracticalAnchor };

export type PracticalPostQuickStartLearningTarget =
  | {
    kind: "TEACH";
    skillId: string;
    href: string;
    practiceHref: string;
    asset: PracticalPostQuickStartTeachingAsset;
  }
  | {
    kind: "PRACTICE";
    skillId: string;
    href: string;
  }
  | {
    kind: "BLOCKED";
    skillId: string | null;
    reason: "QUICK_START_INCOMPLETE" | "NO_RECOMMENDATION" | "FOCUS_UNAVAILABLE";
  };

export function practicalPostQuickStartTeachingAssetForSkill(
  skillId: string,
): PracticalPostQuickStartTeachingAsset | null {
  const rule = practicalRules.find(
    (candidate) => candidate.skillIds.includes(skillId) && candidate.sourceRefs.length > 0,
  );
  if (rule) return { kind: "RULE", rule };

  const anchor = practicalAnchors.find(
    (candidate) => candidate.skillId === skillId && candidate.kind === "recognition" && candidate.sourceRefs.length > 0,
  ) ?? practicalAnchors.find(
    (candidate) => candidate.skillId === skillId && candidate.sourceRefs.length > 0,
  );
  return anchor ? { kind: "ANCHOR", anchor } : null;
}

export function isPostQuickStartTeachingAdmissible(
  state: PracticalMasteryState,
  skillId: string,
): boolean {
  if (!firstJourneyProgress(state).completed) return false;
  const skill = practicalSkillById.get(skillId);
  const progress = state.skills[skillId];
  if (!skill || !progress || progress.conceptTaught || skill.sourceRefs.length === 0) return false;
  if (isIntegrationDerivedSkill(skillId) || isPracticalBridgeSkill(skillId)) return false;

  const sourceGap = practicalSourceGapBySkillId.get(skillId);
  if (sourceGap?.status === "SOURCE_BLOCKED" || sourceGap?.status === "PARTIAL") return false;
  if (!practicalSkillCorpusCanReach(skillId, "DECISION_TRAINED")) return false;
  if (!practicalPrerequisitesMet(state, skillId)) return false;
  return practicalPostQuickStartTeachingAssetForSkill(skillId) !== null;
}

function exactPostQuickStartTarget(
  state: PracticalMasteryState,
  skillId: string,
): PracticalPostQuickStartLearningTarget {
  if (isIntegratedFocusAdmissible(state, skillId)) {
    return {
      kind: "PRACTICE",
      skillId,
      href: `/mastery/session?focus=${encodeURIComponent(skillId)}`,
    };
  }

  if (isPostQuickStartTeachingAdmissible(state, skillId)) {
    const asset = practicalPostQuickStartTeachingAssetForSkill(skillId);
    if (!asset) return { kind: "BLOCKED", skillId, reason: "FOCUS_UNAVAILABLE" };
    return {
      kind: "TEACH",
      skillId,
      href: `/mastery/journey?focus=${encodeURIComponent(skillId)}`,
      practiceHref: `/mastery/session?focus=${encodeURIComponent(skillId)}`,
      asset,
    };
  }

  return { kind: "BLOCKED", skillId, reason: "FOCUS_UNAVAILABLE" };
}

function actionableFallbackSkillId(state: PracticalMasteryState): string | null {
  const ranked = trainablePracticalSkills(state)
    .map((skill) => ({
      skill,
      score: learningRouteScore({
        skill,
        currentStage: state.skills[skill.id]?.evidenceStage ?? "SOURCE_SUPPORTED",
      }),
    }))
    .sort((a, b) => b.score - a.score || a.skill.id.localeCompare(b.skill.id));

  const prerequisiteProgression = ranked.find(({ skill }) => {
    const progress = state.skills[skill.id];
    return Boolean(
      progress?.conceptTaught
      && !stageAtLeast(progress.evidenceStage, "DECISION_TRAINED")
      && isIntegratedFocusAdmissible(state, skill.id)
      && nextPracticalDecision(state, skill.id),
    );
  });
  if (prerequisiteProgression) return prerequisiteProgression.skill.id;

  const teachable = ranked.find(({ skill }) => isPostQuickStartTeachingAdmissible(state, skill.id));
  if (teachable) return teachable.skill.id;

  const supportedPractice = ranked.find(({ skill }) => (
    isIntegratedFocusAdmissible(state, skill.id) && Boolean(nextPracticalDecision(state, skill.id))
  ));
  return supportedPractice?.skill.id ?? null;
}

export function resolvePostQuickStartLearningTarget(
  state: PracticalMasteryState,
  requestedSkillId: string | null = null,
): PracticalPostQuickStartLearningTarget {
  if (!firstJourneyProgress(state).completed) {
    return { kind: "BLOCKED", skillId: requestedSkillId, reason: "QUICK_START_INCOMPLETE" };
  }

  if (requestedSkillId) return exactPostQuickStartTarget(state, requestedSkillId);

  const recommendation = recommendNextPracticalSkill(state);
  if (recommendation) {
    const recommendedTarget = exactPostQuickStartTarget(state, recommendation.skillId);
    if (recommendedTarget.kind !== "BLOCKED") return recommendedTarget;
  }

  const fallbackSkillId = actionableFallbackSkillId(state);
  if (fallbackSkillId) return exactPostQuickStartTarget(state, fallbackSkillId);

  return {
    kind: "BLOCKED",
    skillId: recommendation?.skillId ?? null,
    reason: recommendation ? "FOCUS_UNAVAILABLE" : "NO_RECOMMENDATION",
  };
}

export function beginPostQuickStartApplication(
  state: PracticalMasteryState,
  skillId: string,
  now = new Date(),
): PracticalMasteryState {
  if (!isPostQuickStartTeachingAdmissible(state, skillId)) {
    throw new Error(`Post-Quick-Start teaching is not admissible for ${skillId}`);
  }
  return markPracticalConceptTaught(state, skillId, now);
}
