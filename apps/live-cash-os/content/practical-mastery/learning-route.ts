import { practicalSkillFamilies } from "./registry";
import type { PracticalEvidenceStage, PracticalSkillFamily } from "./types";

export type PracticalDependencyKind = "HARD" | "SOFT" | "REINFORCING";

export type PracticalLearningDependency = {
  fromSkillId: string;
  toSkillId: string;
  kind: PracticalDependencyKind;
  reason: string;
};

export type PracticalRouteSignals = {
  liveFrequency: 1 | 2 | 3 | 4 | 5;
  mistakeCost: 1 | 2 | 3 | 4 | 5;
  transferLeverage: 1 | 2 | 3 | 4 | 5;
  motivationValue: 1 | 2 | 3 | 4 | 5;
  cognitiveLoad: 1 | 2 | 3 | 4 | 5;
};

export type PracticalRouteCandidate = {
  skillId: string;
  score: number;
  whyNow: string;
};

// The old registry prerequisite field was authored before route optimization.
// Preserve it as useful preparation, but do not silently promote the old topic
// sequence into a hard lock.
const legacyDeclaredDependencies: PracticalLearningDependency[] = practicalSkillFamilies.flatMap((skill) =>
  skill.prerequisiteSkillIds.map((fromSkillId) => ({
    fromSkillId,
    toSkillId: skill.id,
    kind: "SOFT" as const,
    reason: "Legacy-declared preparation. Useful for comprehension, but not a canonical hard learner-order lock after A0.",
  })),
);

// HARD is intentionally sparse. Add only when the target cannot be meaningfully
// taught/scored without the prior capability.
const curatedHardDependencies: PracticalLearningDependency[] = [
  { fromSkillId: "FND-01", toSkillId: "FND-02", kind: "HARD", reason: "Equity-realisation training assumes the learner can distinguish price/equity from a binary win-rate shortcut." },
  { fromSkillId: "FND-01", toSkillId: "PF-04", kind: "HARD", reason: "BB call quality cannot be scored coherently without price / required-equity intuition." },
  { fromSkillId: "W4-BOARD-01", toSkillId: "IP-01", kind: "HARD", reason: "C-bet selection requires basic board/range interaction recognition." },
  { fromSkillId: "W4-BOARD-01", toSkillId: "OOP-01", kind: "HARD", reason: "OOP range-check selection requires basic board/range interaction recognition." },
];

const softAndReinforcingDependencies: PracticalLearningDependency[] = [
  { fromSkillId: "PF-01", toSkillId: "W4-BOARD-01", kind: "SOFT", reason: "Seeing position/range origin first makes board ownership easier, but full RFI mastery is not required." },
  { fromSkillId: "PF-04", toSkillId: "W4-BOARD-01", kind: "SOFT", reason: "BB range identity improves board-class interpretation without needing complete blind mastery." },
  { fromSkillId: "FND-02", toSkillId: "PF-04", kind: "SOFT", reason: "Realisation improves BB judgement but should not prevent early price-driven BB exposure." },
  { fromSkillId: "IP-01", toSkillId: "PF-06", kind: "REINFORCING", reason: "Early postflop range-shape exposure makes polar/linear preflop construction more concrete." },
  { fromSkillId: "PF-06", toSkillId: "IP-01", kind: "REINFORCING", reason: "Preflop range construction later sharpens why the flop range has its observed shape." },
  { fromSkillId: "PF-04", toSkillId: "BL-04", kind: "REINFORCING", reason: "Open-size sensitivity reinforces the original BB price model through a changed node." },
  { fromSkillId: "W4-BOARD-01", toSkillId: "W4-RUNOUT-01", kind: "REINFORCING", reason: "Runout classification revisits board ownership as ranges and nut regions change." },
];

function dependencyKey(dependency: PracticalLearningDependency): string {
  return `${dependency.fromSkillId}>${dependency.toSkillId}>${dependency.kind}`;
}

export const practicalLearningDependencies: PracticalLearningDependency[] = [
  ...new Map(
    [...legacyDeclaredDependencies, ...curatedHardDependencies, ...softAndReinforcingDependencies]
      .map((dependency) => [dependencyKey(dependency), dependency] as const),
  ).values(),
];

const defaultSignalsByWave: Record<PracticalSkillFamily["wave"], PracticalRouteSignals> = {
  W1_FOUNDATION: { liveFrequency: 5, mistakeCost: 4, transferLeverage: 5, motivationValue: 3, cognitiveLoad: 2 },
  W2_PREFLOP: { liveFrequency: 5, mistakeCost: 5, transferLeverage: 5, motivationValue: 5, cognitiveLoad: 3 },
  W3_BLINDS: { liveFrequency: 5, mistakeCost: 5, transferLeverage: 5, motivationValue: 5, cognitiveLoad: 3 },
  W4_RECOGNITION: { liveFrequency: 5, mistakeCost: 4, transferLeverage: 5, motivationValue: 5, cognitiveLoad: 2 },
  W5_SRP_OOP: { liveFrequency: 5, mistakeCost: 5, transferLeverage: 5, motivationValue: 5, cognitiveLoad: 4 },
  W6_SRP_IP: { liveFrequency: 5, mistakeCost: 4, transferLeverage: 5, motivationValue: 5, cognitiveLoad: 3 },
  W7_3BET: { liveFrequency: 4, mistakeCost: 5, transferLeverage: 5, motivationValue: 5, cognitiveLoad: 4 },
  W8_4BET_LOW_SPR: { liveFrequency: 2, mistakeCost: 5, transferLeverage: 3, motivationValue: 4, cognitiveLoad: 4 },
  W9_TURN: { liveFrequency: 5, mistakeCost: 5, transferLeverage: 5, motivationValue: 5, cognitiveLoad: 4 },
  W10_RIVER: { liveFrequency: 4, mistakeCost: 5, transferLeverage: 5, motivationValue: 5, cognitiveLoad: 5 },
  W11_MULTIWAY_LIMP: { liveFrequency: 5, mistakeCost: 5, transferLeverage: 5, motivationValue: 5, cognitiveLoad: 4 },
  W12_DEEP_STRADDLE: { liveFrequency: 4, mistakeCost: 5, transferLeverage: 5, motivationValue: 5, cognitiveLoad: 5 },
  W13_EXPLOIT_LIVE: { liveFrequency: 5, mistakeCost: 5, transferLeverage: 5, motivationValue: 5, cognitiveLoad: 5 },
  W14_INTEGRATED: { liveFrequency: 5, mistakeCost: 5, transferLeverage: 5, motivationValue: 5, cognitiveLoad: 5 },
};

export function routeSignalsForSkill(skill: PracticalSkillFamily): PracticalRouteSignals {
  const base = defaultSignalsByWave[skill.wave];
  const priorityBonus = skill.livePriority === "P0" ? 1 : skill.livePriority === "P1" ? 0 : -1;
  return {
    ...base,
    liveFrequency: Math.max(1, Math.min(5, base.liveFrequency + priorityBonus)) as PracticalRouteSignals["liveFrequency"],
    mistakeCost: Math.max(1, Math.min(5, base.mistakeCost + priorityBonus)) as PracticalRouteSignals["mistakeCost"],
  };
}

const stageRank: Record<PracticalEvidenceStage, number> = {
  SOURCE_SUPPORTED: 0,
  CONCEPT_TAUGHT: 1,
  RECOGNITION_TRAINED: 2,
  DECISION_TRAINED: 3,
  CHANGED_NODE_TRANSFER: 4,
  BOUNDARY_TESTED: 5,
  DELAYED_RETRIEVAL: 6,
  REAL_HAND_TRANSFER: 7,
};

export function learningRouteScore(input: {
  skill: PracticalSkillFamily;
  currentStage: PracticalEvidenceStage;
  repairUrgency?: 0 | 1 | 2 | 3;
  recentExposurePenalty?: 0 | 1 | 2 | 3;
}): number {
  const signals = routeSignalsForSkill(input.skill);
  const evidenceGap = Math.max(0, stageRank[input.skill.targetEvidenceStage] - stageRank[input.currentStage]);
  const repairUrgency = input.repairUrgency ?? 0;
  const recentPenalty = input.recentExposurePenalty ?? 0;

  return (
    signals.liveFrequency * 4 +
    signals.mistakeCost * 4 +
    signals.transferLeverage * 3 +
    signals.motivationValue * 2 +
    evidenceGap * 3 +
    repairUrgency * 5 -
    signals.cognitiveLoad * 2 -
    recentPenalty * 4
  );
}

export function hardDependenciesFor(skillId: string): PracticalLearningDependency[] {
  return practicalLearningDependencies.filter((dependency) => dependency.toSkillId === skillId && dependency.kind === "HARD");
}

export function softDependenciesFor(skillId: string): PracticalLearningDependency[] {
  return practicalLearningDependencies.filter((dependency) => dependency.toSkillId === skillId && dependency.kind === "SOFT");
}

export function reinforcingDependenciesFor(skillId: string): PracticalLearningDependency[] {
  return practicalLearningDependencies.filter((dependency) => dependency.toSkillId === skillId && dependency.kind === "REINFORCING");
}

export const canonicalFirstJourneySkillIds = [
  "FND-01",
  "FND-02",
  "PF-01",
  "PF-04",
  "W4-BOARD-01",
  "IP-01",
  "BL-04",
  "W4-RUNOUT-01",
] as const;

export function firstJourneyOrder(skillId: string): number {
  return canonicalFirstJourneySkillIds.indexOf(skillId as (typeof canonicalFirstJourneySkillIds)[number]);
}

export function whyNowForSkill(skill: PracticalSkillFamily, stage: PracticalEvidenceStage, repairUrgency = 0): string {
  const signals = routeSignalsForSkill(skill);
  if (repairUrgency > 0) return `Repair now: repeated evidence gap in ${skill.id} outweighs nominal topic order.`;
  const journeyIndex = firstJourneyOrder(skill.id);
  if (journeyIndex >= 0) return `First journey step ${journeyIndex + 1}: connect a high-value concept to a concrete table decision early.`;
  if (stage === "SOURCE_SUPPORTED") return `High-value next capability: live frequency ${signals.liveFrequency}/5, transfer leverage ${signals.transferLeverage}/5.`;
  return `Advance ${skill.id}: current evidence is ${stage}; target is ${skill.targetEvidenceStage}.`;
}
