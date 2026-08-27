import {
  practicalAnchors,
  practicalRules,
  practicalSkillById,
  type PracticalAnchor,
  type PracticalRule,
} from "../content/practical-mastery";
import { practicalSourceGapBySkillId } from "../content/practical-mastery/source-gaps";
import { isIntegratedFocusAdmissible } from "./practical-adaptive-session";
import { firstJourneyProgress } from "./practical-first-journey";
import {
  isPracticalBridgeSkill,
  markPracticalConceptTaught,
  practicalPrerequisitesMet,
  practicalSkillCorpusCanReach,
  recommendNextPracticalSkill,
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
  if (isPracticalBridgeSkill(skillId)) return false;

  const sourceGap = practicalSourceGapBySkillId.get(skillId);
  if (sourceGap?.status === "SOURCE_BLOCKED" || sourceGap?.status === "PARTIAL") return false;
  if (!practicalSkillCorpusCanReach(skillId, "DECISION_TRAINED")) return false;
  if (!practicalPrerequisitesMet(state, skillId)) return false;
  return practicalPostQuickStartTeachingAssetForSkill(skillId) !== null;
}

export function resolvePostQuickStartLearningTarget(
  state: PracticalMasteryState,
  requestedSkillId: string | null = null,
): PracticalPostQuickStartLearningTarget {
  if (!firstJourneyProgress(state).completed) {
    return { kind: "BLOCKED", skillId: requestedSkillId, reason: "QUICK_START_INCOMPLETE" };
  }

  const recommendation = requestedSkillId ? null : recommendNextPracticalSkill(state);
  const skillId = requestedSkillId ?? recommendation?.skillId ?? null;
  if (!skillId) return { kind: "BLOCKED", skillId: null, reason: "NO_RECOMMENDATION" };

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
