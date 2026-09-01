import {
  isOrdinaryLearnerDecision,
  practicalDecisionById,
} from "../content/practical-mastery";
import { isIntegrationDerivedSkill } from "../content/practical-mastery/integration-derived";
import {
  isPracticalBridgeSkill,
  latestAttemptsByDecision,
  type PracticalAttempt,
  type PracticalMasteryState,
} from "./practical-mastery-core";

export const PRACTICAL_HIGH_CONFIDENCE_WRONG = 75;

export type CurrentPracticalMistake = Readonly<{
  skillId: string;
  misconceptionId: string;
  unresolvedDecisionIds: readonly string[];
  evidenceCount: number;
  highConfidenceEvidenceCount: number;
  presentationEvidenceScore: number;
  latestAnsweredAt: string;
  representativeDecisionId: string;
}>;

function compareCanonicalId(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

export function selectedWrongPracticalMisconceptionIds(
  attempt: PracticalAttempt,
): readonly string[] {
  const decision = practicalDecisionById.get(attempt.decisionId);
  if (!decision || !isOrdinaryLearnerDecision(decision)) return [];
  if (decision.skillId !== attempt.skillId) return [];
  if (isIntegrationDerivedSkill(attempt.skillId) || isPracticalBridgeSkill(attempt.skillId)) return [];

  const selectedAction = decision.actionOptions.find((option) => option.id === attempt.actionId);
  const selectedReason = decision.reasonOptions.find((option) => option.id === attempt.reasonId);
  if (!selectedAction || !selectedReason) return [];
  const derivedCorrect = attempt.actionId === decision.correctActionId && attempt.reasonId === decision.correctReasonId;
  if (attempt.correct !== derivedCorrect) return [];

  const misconceptionIds = new Set<string>();
  if (attempt.actionId !== decision.correctActionId && selectedAction.misconception) {
    misconceptionIds.add(selectedAction.misconception);
  }
  if (attempt.reasonId !== decision.correctReasonId && selectedReason.misconception) {
    misconceptionIds.add(selectedReason.misconception);
  }

  return [...misconceptionIds].sort(compareCanonicalId);
}

export function currentPracticalMistakes(
  state: PracticalMasteryState,
): readonly CurrentPracticalMistake[] {
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

  return [...grouped.values()]
    .map((family) => {
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
        presentationEvidenceScore: evidenceCount + 2 * highConfidenceEvidenceCount,
        latestAnsweredAt,
        representativeDecisionId: unresolvedDecisionIds[0] ?? "",
      } satisfies CurrentPracticalMistake;
    })
    .sort((left, right) =>
      right.presentationEvidenceScore - left.presentationEvidenceScore
      || compareCanonicalId(left.skillId, right.skillId)
      || compareCanonicalId(left.misconceptionId, right.misconceptionId));
}
