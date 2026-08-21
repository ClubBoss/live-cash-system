export type PracticalSourceGapStatus = "SUPPORTED" | "PARTIAL" | "SOURCE_BLOCKED";

export type PracticalSourceGap = {
  skillId: string;
  status: PracticalSourceGapStatus;
  reason: string;
  nextEvidenceNeeded: string;
};

export const practicalSourceGaps: PracticalSourceGap[] = [
  {
    skillId: "BL-11",
    status: "PARTIAL",
    reason: "B1 located public evidence that dedicated SB-vs-BB 3-bet-pot cash solutions/drills exist and retained strong general blind/3BP mechanisms, but no sufficiently inspectable free source was found that can honestly supply a dedicated BvB 3BP answer-key tree. Product pages proving a solution exists are not themselves strategy authority.",
    nextEvidenceNeeded: "POSITIVE_EV_SOURCE_ACCESS_REQUIRED: review an inspectable SB-vs-BB 3BP solver/source package (or owner-provided course material) before admitting dedicated scored BvB 3BP frequencies/hand branches. Until then, route BvB 3BP learners through generic 3BP role mechanics plus BvB range identity without claiming a distinct solved tree.",
  },
];

export const practicalSourceGapBySkillId = new Map(practicalSourceGaps.map((gap) => [gap.skillId, gap]));
