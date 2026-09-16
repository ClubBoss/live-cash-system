import { practicalSkillFamilies, type PracticalSkillFamily } from "../content/practical-mastery";
import { isIntegrationDerivedSkill } from "../content/practical-mastery/integration-derived";
import {
  isPracticalBridgeSkill,
  practicalSkillCorpusCanReach,
} from "./practical-mastery-core";

/**
 * Primary learner skills are the semantic targets shown on the ordinary Skill Map.
 * Integration-derived identities belong to mixed-session composition, while legacy
 * bridge identities only preserve ancestry/source continuity and are not mastery
 * targets of their own.
 */
export function isPrimaryPracticalLearnerSkill(skillId: string): boolean {
  return !isIntegrationDerivedSkill(skillId) && !isPracticalBridgeSkill(skillId);
}

export function primaryPracticalLearnerSkills(): PracticalSkillFamily[] {
  return practicalSkillFamilies.filter((skill) => isPrimaryPracticalLearnerSkill(skill.id));
}

/**
 * Percentage denominators must include only skills that can actually reach the
 * stage represented by the percentage. Partial/source-ceiling skills remain
 * visible on the map as honest limitations, but cannot make 100% impossible.
 */
export function practicalProgressCountingSkills(): PracticalSkillFamily[] {
  return primaryPracticalLearnerSkills().filter((skill) => practicalSkillCorpusCanReach(skill.id, "DECISION_TRAINED"));
}
