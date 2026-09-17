import type { PracticalDecision, PracticalDecisionOption } from "../content/practical-mastery/types";
import { practicalAssessmentLengthPresentedOptions } from "./practical-assessment-length-presentation";

export type PracticalOptionStage = "action" | "reason";

function stableHash(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/**
 * Learner-visible option order must not expose authored source position as a
 * reusable answer cue. The order is deterministic for one presentation so a
 * reload/draft restore does not move controls, then rotates on the next
 * independent presentation of the same decision.
 *
 * IDs and source arrays remain unchanged; scoring continues to use option IDs.
 */
export function practicalPresentedOptions(
  options: readonly PracticalDecisionOption[],
  decisionId: string,
  stage: PracticalOptionStage,
  presentationOrdinal: number,
): PracticalDecisionOption[] {
  if (options.length <= 1) return [...options];
  const ordinal = Math.max(0, Math.floor(presentationOrdinal));
  const baseOffset = stableHash(`${decisionId}::${stage}`) % options.length;
  const offset = (baseOffset + ordinal) % options.length;
  return [...options.slice(offset), ...options.slice(0, offset)];
}

export function practicalPresentedDecisionOptions(
  decision: PracticalDecision,
  stage: PracticalOptionStage,
  presentationOrdinal: number,
): PracticalDecisionOption[] {
  const sourceOptions = stage === "action" ? decision.actionOptions : decision.reasonOptions;
  const learnerOptions = practicalAssessmentLengthPresentedOptions(decision, stage, sourceOptions);
  return practicalPresentedOptions(learnerOptions, decision.id, stage, presentationOrdinal);
}
