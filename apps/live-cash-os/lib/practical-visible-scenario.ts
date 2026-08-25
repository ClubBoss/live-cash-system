import {
  allPracticalTableStates,
  practicalDecisionById,
  type PracticalTableState,
} from "../content/practical-mastery";

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
  ["PM-B3-PF01-103", "PM-B3-PF01-101"],
  ["PM-B3-PF04-103", "PM-B3-PF04-101"],
  ["PM-B3-PF06-103", "PM-B3-PF06-101"],
  ["PM-B3-PF07-103", "PM-B3-PF07-101"],
  ["PM-B3-OOP02-103", "PM-B3-OOP02-101"],
  ["PM-B3-IP01-103", "PM-B3-IP01-101"],
  ["PM-B3-TURN02-103", "PM-B3-TURN02-101"],
  ["PM-B3-TURN03-103", "PM-B3-TURN03-101"],
  ["PM-B3-RIV01-103", "PM-B3-RIV01-101"],
  ["PM-B3-MW02-103", "PM-B3-MW02-101"],
  ["PM-B3-DEEP01-103", "PM-B3-DEEP01-101"],
]);

function tableByDecisionId(
  decisionId: string,
  tables: readonly PracticalTableState[] = allPracticalTableStates,
): PracticalTableState | null {
  return tables.find((table) => table.decisionId === decisionId) ?? null;
}

function explicitBaselineOverride(
  decisionId: string,
  current: PracticalTableState,
  baseline: PracticalTableState,
): PracticalTableState {
  if (decisionId !== "PM-PERC-BL04-2") return baseline;
  return {
    ...current,
    decisionId: `${decisionId}:before`,
    potBb: 3.5,
    actions: ["CO opens 2.5bb"],
    revealCueRu:
      "До изменения CO открывал 2.5bb; остальные decision-relevant факты остаются теми же.",
    revealCueEn:
      "Before the change, CO opened 2.5bb; the other decision-relevant facts stay the same.",
  };
}

export type PracticalVisibleComparison = {
  before: PracticalTableState;
  current: PracticalTableState;
  changedVariables: string[];
};

export type PracticalVisibleChangeCoverageAudit = {
  auditedDecisionIds: string[];
  unsupportedDecisionIds: string[];
};

export function authoritativeComparisonBaselineDecisionId(
  decisionId: string,
): string | null {
  return comparisonBaselineByDecisionId.get(decisionId) ?? null;
}

export function visibleComparisonForDecision(
  decisionId: string,
  tables: readonly PracticalTableState[] = allPracticalTableStates,
): PracticalVisibleComparison | null {
  const decision = practicalDecisionById.get(decisionId);
  if (decision?.kind !== "changed" || !decision.changedVariables?.length) return null;
  const current = tableByDecisionId(decisionId, tables);
  const baselineId = authoritativeComparisonBaselineDecisionId(decisionId);
  const baseline = baselineId ? tableByDecisionId(baselineId, tables) : null;
  if (!current || !baseline) return null;
  return {
    before: explicitBaselineOverride(decisionId, current, baseline),
    current,
    changedVariables: [...decision.changedVariables],
  };
}

export function decisionHasAuthoritativeVisibleChange(
  decisionId: string,
  tables: readonly PracticalTableState[] = allPracticalTableStates,
): boolean {
  const decision = practicalDecisionById.get(decisionId);
  if (decision?.kind !== "changed" || !decision.changedVariables?.length) return false;
  const table = tableByDecisionId(decisionId, tables);
  return table ? Boolean(visibleComparisonForDecision(decisionId, tables)) : true;
}

export function auditTableBackedVisibleChangeCoverage(
  decisionIds: readonly string[],
  tables: readonly PracticalTableState[] = allPracticalTableStates,
): PracticalVisibleChangeCoverageAudit {
  const auditedDecisionIds = decisionIds.filter((decisionId) => {
    const decision = practicalDecisionById.get(decisionId);
    return Boolean(
      tableByDecisionId(decisionId, tables) &&
        decision?.kind === "changed" &&
        decision.changedVariables?.length,
    );
  });
  return {
    auditedDecisionIds,
    unsupportedDecisionIds: auditedDecisionIds.filter(
      (decisionId) => !decisionHasAuthoritativeVisibleChange(decisionId, tables),
    ),
  };
}
