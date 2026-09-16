import type { PracticalDecision } from "../content/practical-mastery";

const TEMPLATE_SCENARIO_MARKERS = ["A8", "A9", "A10", "B1", "B3", "B4"] as const;

function normalizeCue(value: string): string {
  return value
    .toLocaleLowerCase("en-US")
    .normalize("NFKC")
    .replace(/[\p{P}\p{S}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function practicalStimulusFamilyId(decision: PracticalDecision): string {
  return `${decision.skillId}::${normalizeCue(decision.cueEn || decision.cueRu)}`;
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
  const match = decision.id.match(new RegExp(`^(.*-(?:${markerPattern}))-\\d+$`));
  return match?.[1] ?? practicalStimulusFamilyId(decision);
}

/**
 * Evidence identity is deliberately broader than visible-stimulus identity.
 * Paraphrased siblings from one generated scenario may still be useful practice,
 * but they must not independently satisfy mastery or delayed-retention gates.
 */
export function practicalEvidenceFamilyId(decision: PracticalDecision): string {
  return practicalScenarioFamilyId(decision);
}
