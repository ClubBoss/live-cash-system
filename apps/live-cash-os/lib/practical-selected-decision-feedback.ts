import { practicalDecisionFeedbackCopy } from "../content/practical-mastery/practical-decision-feedback-copy";
import type { PracticalDecision, PracticalDecisionOption } from "../content/practical-mastery/types";

export type PracticalSelectedFeedbackDimension = {
  selectedText: string;
  correctText: string;
};

export type PracticalSelectedDecisionFeedback = {
  action: PracticalSelectedFeedbackDimension | null;
  reason: PracticalSelectedFeedbackDimension | null;
  mechanism: string;
  boundary: string | null;
};

type Locale = "ru" | "en";

function optionText(option: PracticalDecisionOption | undefined, locale: Locale): string {
  if (!option) return locale === "ru" ? "Недоступно" : "Unavailable";
  return locale === "ru" ? option.textRu : option.textEn;
}

export function practicalSelectedDecisionFeedback(
  decision: PracticalDecision,
  locale: Locale,
  selectedActionId: string,
  selectedReasonId: string,
  correct: boolean,
): PracticalSelectedDecisionFeedback {
  const selectedAction = decision.actionOptions.find((option) => option.id === selectedActionId);
  const selectedReason = decision.reasonOptions.find((option) => option.id === selectedReasonId);
  const correctAction = decision.actionOptions.find((option) => option.id === decision.correctActionId);
  const correctReason = decision.reasonOptions.find((option) => option.id === decision.correctReasonId);
  const feedback = practicalDecisionFeedbackCopy(decision);

  return {
    action: !correct && selectedActionId !== decision.correctActionId
      ? { selectedText: optionText(selectedAction, locale), correctText: optionText(correctAction, locale) }
      : null,
    reason: !correct && selectedReasonId !== decision.correctReasonId
      ? { selectedText: optionText(selectedReason, locale), correctText: optionText(correctReason, locale) }
      : null,
    mechanism: locale === "ru" ? feedback.mechanismRu : feedback.mechanismEn,
    boundary: (locale === "ru" ? feedback.boundaryRu : feedback.boundaryEn) ?? null,
  };
}
