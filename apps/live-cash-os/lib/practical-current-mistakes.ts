import {
  isOrdinaryLearnerDecision,
  practicalDecisionById,
} from "../content/practical-mastery";
import { isIntegrationDerivedSkill } from "../content/practical-mastery/integration-derived";
import {
  isPracticalBridgeSkill,
  isSemanticallyValidPracticalAttempt,
  latestAttemptsByDecision,
  type PracticalAttempt,
  type PracticalMasteryState,
} from "./practical-mastery-core";

export const PRACTICAL_HIGH_CONFIDENCE_WRONG = 75;

export type PracticalMisconceptionEvidenceFamily = Readonly<{
  skillId: string;
  misconceptionId: string;
  unresolvedDecisionIds: readonly string[];
  evidenceCount: number;
  highConfidenceEvidenceCount: number;
  latestAnsweredAt: string;
  representativeDecisionId: string;
}>;

export type CurrentPracticalMistake = PracticalMisconceptionEvidenceFamily &
  Readonly<{ presentationEvidenceScore: number }>;

function compareCanonicalId(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

export function selectedWrongPracticalMisconceptionIds(
  attempt: PracticalAttempt,
): readonly string[] {
  if (!isSemanticallyValidPracticalAttempt(attempt)) return [];
  const decision = practicalDecisionById.get(attempt.decisionId)!;
  if (!isOrdinaryLearnerDecision(decision)) return [];
  if (isIntegrationDerivedSkill(attempt.skillId) || isPracticalBridgeSkill(attempt.skillId)) return [];

  const selectedAction = decision.actionOptions.find((option) => option.id === attempt.actionId)!;
  const selectedReason = decision.reasonOptions.find((option) => option.id === attempt.reasonId)!;

  const misconceptionIds = new Set<string>();
  if (attempt.actionId !== decision.correctActionId && selectedAction.misconception) {
    misconceptionIds.add(selectedAction.misconception);
  }
  if (attempt.reasonId !== decision.correctReasonId && selectedReason.misconception) {
    misconceptionIds.add(selectedReason.misconception);
  }

  return [...misconceptionIds].sort(compareCanonicalId);
}

// Unsorted (skillId, misconceptionId) evidence families — the single canonical
// authority both the Current Mistakes presentation surface (below) and the
// repair scheduler (practical-mastery-core.ts) build on. The scheduler must
// re-derive its own urgency ranking from this unsorted data; it must never
// read currentPracticalMistakes()'s presentation-sorted array or its order.
export function practicalMisconceptionEvidenceFamilies(
  state: PracticalMasteryState,
): readonly PracticalMisconceptionEvidenceFamily[] {
  const grouped = new Map<string, {
    skillId: string;
    misconceptionId: string;
    contributors: Map<string, PracticalAttempt>;
  }>();

  for (const attempt of latestAttemptsByDecision(state).values()) {
    if (attempt.correct) continue;

    for (const misconceptionId of selectedWrongPracticalMisconceptionIds(attempt)) {
      const composite = JSON.stringify([attempt.skillId, misconceptionId]);
      const current = grouped.get(composite) ?? {
        skillId: attempt.skillId,
        misconceptionId,
        contributors: new Map<string, PracticalAttempt>(),
      };
      current.contributors.set(attempt.decisionId, attempt);
      grouped.set(composite, current);
    }
  }

  return [...grouped.values()].map((family) => {
    const contributors = [...family.contributors.values()]
      .sort((left, right) => compareCanonicalId(left.decisionId, right.decisionId));
    const unresolvedDecisionIds = contributors.map((attempt) => attempt.decisionId);
    const evidenceCount = contributors.length;
    const highConfidenceEvidenceCount = contributors
      .filter((attempt) => attempt.confidence >= PRACTICAL_HIGH_CONFIDENCE_WRONG).length;
    const latestAnsweredAt = contributors.reduce(
      (latest, attempt) => attempt.answeredAt > latest ? attempt.answeredAt : latest,
      "",
    );

    return {
      skillId: family.skillId,
      misconceptionId: family.misconceptionId,
      unresolvedDecisionIds,
      evidenceCount,
      highConfidenceEvidenceCount,
      latestAnsweredAt,
      representativeDecisionId: unresolvedDecisionIds[0] ?? "",
    } satisfies PracticalMisconceptionEvidenceFamily;
  });
}

export function currentPracticalMistakes(
  state: PracticalMasteryState,
): readonly CurrentPracticalMistake[] {
  return practicalMisconceptionEvidenceFamilies(state)
    .map((family) => ({
      ...family,
      presentationEvidenceScore: family.evidenceCount + 2 * family.highConfidenceEvidenceCount,
    } satisfies CurrentPracticalMistake))
    .sort((left, right) =>
      right.presentationEvidenceScore - left.presentationEvidenceScore
      || compareCanonicalId(left.skillId, right.skillId)
      || compareCanonicalId(left.misconceptionId, right.misconceptionId));
}
