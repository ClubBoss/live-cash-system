import type { PracticalDecision } from "../content/practical-mastery";
import { PRACTICAL_EVIDENCE_AUTHORITY_BY_DECISION_ID } from "../content/practical-mastery/evidence-authority";

const TEMPLATE_SCENARIO_MARKERS = [
  "A8",
  "A9",
  "A10",
  "B1",
  "B3",
  "B4",
] as const;
const LEADING_TEMPLATE_SCENARIO_MARKERS = ["B3", "B4"] as const;

const LEGACY_SEMANTIC_STIMULUS_ALIAS_BY_DECISION_ID = new Map<string, string>([
  ["PM-RIV-03-A8-101", "RIV-03::river-bluff-catch-default"],
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

function currentAuthority(decision: PracticalDecision) {
  const authority = PRACTICAL_EVIDENCE_AUTHORITY_BY_DECISION_ID[decision.id];
  if (!authority)
    throw new Error(
      `Missing explicit Practical evidence authority: ${decision.id}`,
    );
  return authority;
}

export function practicalStimulusFamilyId(decision: PracticalDecision): string {
  return currentAuthority(decision).evidenceFamilyId;
}

export function practicalScenarioFamilyId(decision: PracticalDecision): string {
  return currentAuthority(decision).scenarioId;
}

export function practicalEvidenceFamilyId(decision: PracticalDecision): string {
  return currentAuthority(decision).evidenceFamilyId;
}

export function practicalEvidenceScenarioId(
  decision: PracticalDecision,
): string {
  return currentAuthority(decision).scenarioId;
}

export function practicalStimulusFamilyIdForDecisionId(
  decisionId: string,
  decisionById: ReadonlyMap<string, PracticalDecision>,
): string | null {
  const decision = decisionById.get(decisionId);
  return decision ? practicalStimulusFamilyId(decision) : null;
}

// Compatibility-only recreation of the pre-closure identity model. Persisted
// schema-v4 states may be validated against this authority only long enough to
// reconcile downward into the explicit current contract. Current mastery,
// scaffold, routing and novelty code must never call these helpers.
export function practicalLegacyEvidenceFamilyId(
  decision: PracticalDecision,
): string {
  const alias = LEGACY_SEMANTIC_STIMULUS_ALIAS_BY_DECISION_ID.get(decision.id);
  if (alias) return alias;
  if (/^PM-(?:TURN|RIV)-\d{2}-A8-/u.test(decision.id)) {
    return `semantic::${normalizeCue(decision.cueEn || decision.cueRu)}`;
  }
  return `${decision.skillId}::${normalizeCue(decision.cueEn || decision.cueRu)}`;
}

export function practicalLegacyEvidenceScenarioId(
  decision: PracticalDecision,
): string {
  const markerPattern = TEMPLATE_SCENARIO_MARKERS.join("|");
  const suffixMarkerMatch = decision.id.match(
    new RegExp(`^(.*-(?:${markerPattern}))-\\d+$`),
  );
  if (suffixMarkerMatch) return suffixMarkerMatch[1];

  const leadingMarkerPattern = LEADING_TEMPLATE_SCENARIO_MARKERS.join("|");
  const leadingMarkerMatch = decision.id.match(
    new RegExp(`^(PM-(?:${leadingMarkerPattern})-.+)-\\d+$`),
  );
  if (leadingMarkerMatch) return leadingMarkerMatch[1];

  return practicalLegacyEvidenceFamilyId(decision);
}
