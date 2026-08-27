export const integrationDerivedSkillIds = [
  "INT-01",
  "INT-02",
  "INT-03",
  "INT-04",
  "INT-05",
] as const;

const integrationDerivedSkillIdSet = new Set<string>(integrationDerivedSkillIds);

export function isIntegrationDerivedSkill(skillId: string): boolean {
  return integrationDerivedSkillIdSet.has(skillId);
}
