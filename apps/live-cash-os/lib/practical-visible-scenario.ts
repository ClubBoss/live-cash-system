import { allPracticalTableStates, practicalDecisionById, type PracticalTableState } from "../content/practical-mastery";

const comparisonBaselineByDecisionId = new Map<string, string>([
  ["PM-PERC-FND06-2", "PM-PERC-FND06-1"],
  ["PM-PERC-BL03-2", "PM-PERC-BL03-1"],
  ["PM-PERC-BL04-2", "PM-PERC-BL04-1"],
  ["PM-PERC-BOARD-2", "PM-PERC-BOARD-1"],
  ["PM-PERC-RUNOUT-2", "PM-PERC-RUNOUT-1"],
  ["PM-PERC-3BP05-2", "PM-PERC-3BP05-1"],
  ["PM-PERC-MW01-2", "PM-PERC-MW01-1"],
  ["PM-PERC-DEEP03-2", "PM-PERC-DEEP03-1"],
  ["PM-PERC-RIV03-2", "PM-PERC-RIV03-1"],
  ["PM-PERC-EXP01-2", "PM-PERC-EXP01-1"],
]);

function tableByDecisionId(decisionId: string): PracticalTableState | null {
  return allPracticalTableStates.find((table) => table.decisionId === decisionId) ?? null;
}

function explicitBaselineOverride(decisionId: string, current: PracticalTableState, baseline: PracticalTableState): PracticalTableState {
  if (decisionId !== "PM-PERC-BL04-2") return baseline;
  return {
    ...current,
    decisionId: `${decisionId}:before`,
    potBb: 3.5,
    actions: ["CO opens 2.5bb"],
    revealCueRu: "До изменения CO открывал 2.5bb; остальные decision-relevant факты остаются теми же.",
    revealCueEn: "Before the change, CO opened 2.5bb; the other decision-relevant facts stay the same.",
  };
}

export type PracticalVisibleComparison = {
  before: PracticalTableState;
  current: PracticalTableState;
  changedVariables: string[];
};

export function visibleComparisonForDecision(decisionId: string): PracticalVisibleComparison | null {
  const decision = practicalDecisionById.get(decisionId);
  if (decision?.kind !== "changed" || !decision.changedVariables?.length) return null;
  const current = tableByDecisionId(decisionId);
  const baselineId = comparisonBaselineByDecisionId.get(decisionId);
  const baseline = baselineId ? tableByDecisionId(baselineId) : null;
  if (!current || !baseline) return null;
  return {
    before: explicitBaselineOverride(decisionId, current, baseline),
    current,
    changedVariables: [...decision.changedVariables],
  };
}

export function decisionHasAuthoritativeVisibleChange(decisionId: string): boolean {
  const decision = practicalDecisionById.get(decisionId);
  if (decision?.kind !== "changed" || !decision.changedVariables?.length) return false;
  const table = tableByDecisionId(decisionId);
  return table ? Boolean(visibleComparisonForDecision(decisionId)) : true;
}
