export type PracticalSourceGapStatus = "SUPPORTED" | "PARTIAL" | "SOURCE_BLOCKED";

export type PracticalSourceGap = {
  skillId: string;
  status: PracticalSourceGapStatus;
  reason: string;
  nextEvidenceNeeded: string;
};

export const practicalSourceGaps: PracticalSourceGap[] = [
  {
    skillId: "FND-04",
    status: "SOURCE_BLOCKED",
    reason: "The ingested corpus supports equity/EV and draws broadly, but the current source audit did not find an explicit, sufficiently scoped clean-vs-dirty-outs authority. The external Concepts checklist is an audit checklist, not a poker answer-key authority.",
    nextEvidenceNeeded: "Admit an explicit source lesson or reviewed reference that defines clean, dirty, dominated and dead outs with practical examples.",
  },
  {
    skillId: "BL-06",
    status: "SOURCE_BLOCKED",
    reason: "SLC-M02-L05 is a postflop comparison of ranges arriving from BB versus SB calls; it does not independently establish an SB first-in raise/limp/fold tree.",
    nextEvidenceNeeded: "Admit a source-backed SB first-in strategy framework with stack/rake assumptions before creating scored raise/limp/fold answer keys.",
  },
  {
    skillId: "BL-07",
    status: "PARTIAL",
    reason: "The corpus supports BB price/closing-action defence and blind range identity, but the current audit has not established a dedicated BB-vs-SB-open preflop tree with bounded assumptions.",
    nextEvidenceNeeded: "Admit a blind-vs-blind preflop source or solver-derived reviewed framework for BB versus SB open sizes.",
  },
  {
    skillId: "BL-08",
    status: "SOURCE_BLOCKED",
    reason: "No current canonical source found in the repository explicitly establishes BB check/raise strategy versus an SB limp.",
    nextEvidenceNeeded: "Admit an explicit SB-limp / BB-response source before scored strategy decisions are produced.",
  },
  {
    skillId: "BL-09",
    status: "SOURCE_BLOCKED",
    reason: "The continuation tree after BB aggression versus SB first-in depends on the missing SB-first-in and BB-response authorities.",
    nextEvidenceNeeded: "Resolve BL-06 through BL-08 first, then construct the continuation branch.",
  },
];

export const practicalSourceGapBySkillId = new Map(practicalSourceGaps.map((gap) => [gap.skillId, gap]));
