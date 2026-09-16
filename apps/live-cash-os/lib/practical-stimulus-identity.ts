import type { PracticalDecision } from "../content/practical-mastery";

const TEMPLATE_SCENARIO_MARKERS = ["A8", "A9", "A10", "B1", "B3", "B4"] as const;
const LEADING_TEMPLATE_SCENARIO_MARKERS = ["B3", "B4"] as const;

const SEMANTIC_STIMULUS_ALIAS_BY_DECISION_ID = new Map<string, string>([
  ["PM-RIV-03-A8-103", "RIV-03::river-bluff-catch-default"],
  ["PM-B3-RIV03-101", "RIV-03::river-bluff-catch-default"],
  ["PM-B3-RIV03-102", "RIV-03::river-bluff-catch-default"],
  ["PM-RIV-03-A8-106", "RIV-03::line-removes-natural-bluffs"],
  ["PM-B3-RIV03-103", "RIV-03::line-removes-natural-bluffs"],
  ["PM-INT-01-001", "INT-01::bb-small-btn-open-mechanism"],
  ["PM-INT-01-A11-101", "INT-01::bb-small-btn-open-mechanism"],
]);

function normalizeCue(value: string): string {
  return value
    .toLocaleLowerCase("en-US")
    .normalize("NFKC")
    .replace(/[\p{P}\p{S}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function practicalStimulusFamilyId(decision: PracticalDecision): string {
  return SEMANTIC_STIMULUS_ALIAS_BY_DECISION_ID.get(decision.id)
    ?? `${decision.skillId}::${normalizeCue(decision.cueEn || decision.cueRu)}`;
}

export function practicalStimulusFamilyIdForDecisionId(
  decisionId: string,
  decisionById: ReadonlyMap<string, PracticalDecision>,
): string | null {
  const decision = decisionById.get(decisionId);
  return decision ? practicalStimulusFamilyId(decision) : null;
}

export function practicalScenarioFamilyId(decision: PracticalDecision): string {
  const markerPattern = TEMPLATE_SCENARIO_MARKERS.join("|");
  const suffixMarkerMatch = decision.id.match(new RegExp(`^(.*-(?:${markerPattern}))-\\d+import type { PracticalDecision } from "../content/practical-mastery";

const TEMPLATE_SCENARIO_MARKERS = ["A8", "A9", "A10", "B1", "B3", "B4"] as const;
const LEADING_TEMPLATE_SCENARIO_MARKERS = ["B3", "B4"] as const;

const SEMANTIC_STIMULUS_ALIAS_BY_DECISION_ID = new Map<string, string>([
  ["PM-RIV-03-A8-103", "RIV-03::river-bluff-catch-default"],
  ["PM-B3-RIV03-101", "RIV-03::river-bluff-catch-default"],
  ["PM-B3-RIV03-102", "RIV-03::river-bluff-catch-default"],
  ["PM-RIV-03-A8-106", "RIV-03::line-removes-natural-bluffs"],
  ["PM-B3-RIV03-103", "RIV-03::line-removes-natural-bluffs"],
  ["PM-INT-01-001", "INT-01::bb-small-btn-open-mechanism"],
  ["PM-INT-01-A11-101", "INT-01::bb-small-btn-open-mechanism"],
]);

function normalizeCue(value: string): string {
  return value
    .toLocaleLowerCase("en-US")
    .normalize("NFKC")
    .replace(/[\p{P}\p{S}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function practicalStimulusFamilyId(decision: PracticalDecision): string {
  return SEMANTIC_STIMULUS_ALIAS_BY_DECISION_ID.get(decision.id)
    ?? `${decision.skillId}::${normalizeCue(decision.cueEn || decision.cueRu)}`;
}

export function practicalStimulusFamilyIdForDecisionId(
  decisionId: string,
  decisionById: ReadonlyMap<string, PracticalDecision>,
): string | null {
  const decision = decisionById.get(decisionId);
  return decision ? practicalStimulusFamilyId(decision) : null;
}

));
  if (suffixMarkerMatch) return suffixMarkerMatch[1];

  const leadingMarkerPattern = LEADING_TEMPLATE_SCENARIO_MARKERS.join("|");
  const leadingMarkerMatch = decision.id.match(new RegExp(`^(PM-(?:${leadingMarkerPattern})-.+)-\\d+import type { PracticalDecision } from "../content/practical-mastery";

const TEMPLATE_SCENARIO_MARKERS = ["A8", "A9", "A10", "B1", "B3", "B4"] as const;
const LEADING_TEMPLATE_SCENARIO_MARKERS = ["B3", "B4"] as const;

const SEMANTIC_STIMULUS_ALIAS_BY_DECISION_ID = new Map<string, string>([
  ["PM-RIV-03-A8-103", "RIV-03::river-bluff-catch-default"],
  ["PM-B3-RIV03-101", "RIV-03::river-bluff-catch-default"],
  ["PM-B3-RIV03-102", "RIV-03::river-bluff-catch-default"],
  ["PM-RIV-03-A8-106", "RIV-03::line-removes-natural-bluffs"],
  ["PM-B3-RIV03-103", "RIV-03::line-removes-natural-bluffs"],
  ["PM-INT-01-001", "INT-01::bb-small-btn-open-mechanism"],
  ["PM-INT-01-A11-101", "INT-01::bb-small-btn-open-mechanism"],
]);

function normalizeCue(value: string): string {
  return value
    .toLocaleLowerCase("en-US")
    .normalize("NFKC")
    .replace(/[\p{P}\p{S}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function practicalStimulusFamilyId(decision: PracticalDecision): string {
  return SEMANTIC_STIMULUS_ALIAS_BY_DECISION_ID.get(decision.id)
    ?? `${decision.skillId}::${normalizeCue(decision.cueEn || decision.cueRu)}`;
}

export function practicalStimulusFamilyIdForDecisionId(
  decisionId: string,
  decisionById: ReadonlyMap<string, PracticalDecision>,
): string | null {
  const decision = decisionById.get(decisionId);
  return decision ? practicalStimulusFamilyId(decision) : null;
}

));
  if (leadingMarkerMatch) return leadingMarkerMatch[1];

  return practicalStimulusFamilyId(decision);
}

/**
 * One evidence item is one semantic learner-facing stimulus. Exact/near-exact
 * cue siblings collapse here, while scenario diversity is enforced separately.
 */
export function practicalEvidenceFamilyId(decision: PracticalDecision): string {
  return practicalStimulusFamilyId(decision);
}

/**
 * Scenario-diversity identity prevents one generated scenario family from
 * satisfying an entire mastery or delayed-retention gate by itself.
 */
export function practicalEvidenceScenarioId(decision: PracticalDecision): string {
  return practicalScenarioFamilyId(decision);
}
