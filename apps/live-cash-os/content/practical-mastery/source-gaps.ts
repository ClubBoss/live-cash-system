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
  {
    skillId: "BL-11",
    status: "PARTIAL",
    reason: "The repository contains strong general 3-bet-pot material and blind range-identity material, but the current audit has not isolated a blind-vs-blind-specific 3-bet-pot postflop authority.",
    nextEvidenceNeeded: "Admit or review a source that explicitly covers blind-vs-blind 3-bet-pot postflop ranges before claiming a dedicated BvB 3BP answer-key tree.",
  },
  {
    skillId: "W4-DRAW-01",
    status: "PARTIAL",
    reason: "Current sources support draws, equity and raising heuristics, but the proposed full nut/weak/combo/pair+draw taxonomy is broader than the explicitly audited source authority.",
    nextEvidenceNeeded: "Review a source block that explicitly defines the intended draw-family taxonomy and domination boundaries before producing a complete scored family.",
  },
  {
    skillId: "DEEP-02",
    status: "SOURCE_BLOCKED",
    reason: "The strongest directly audited deep-stack source is a 200bb OOP SRP lesson. That does not independently support a distinct 300bb+ strategy family.",
    nextEvidenceNeeded: "Admit explicit 300bb+ source material or narrow this family to the deepest source-supported stack depth.",
  },
  {
    skillId: "MW-05",
    status: "PARTIAL",
    reason: "The multiway source block strongly supports flop/sandwich/value-threshold mechanics, but a distinct multiway-river strategy tree has not yet been source-isolated.",
    nextEvidenceNeeded: "Review the remaining multiway corpus/hand reviews for explicit river value/bluff thresholds before scoring this family.",
  },
  {
    skillId: "EXP-06",
    status: "SOURCE_BLOCKED",
    reason: "Table, seat and game selection are valid live-cash objectives, but the current registry route uses product objective authority rather than an admitted poker-strategy source.",
    nextEvidenceNeeded: "Admit a source-backed game/table/seat-selection framework before adding scored strategic answer keys.",
  },
];

export const practicalSourceGapBySkillId = new Map(practicalSourceGaps.map((gap) => [gap.skillId, gap]));
