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

type SelectedMisconceptionFeedback = {
  mechanismRu: string;
  mechanismEn: string;
  boundaryRu: string;
  boundaryEn: string;
};

function optionText(option: PracticalDecisionOption | undefined, locale: Locale): string {
  if (!option) return locale === "ru" ? "Недоступно" : "Unavailable";
  return locale === "ru" ? option.textRu : option.textEn;
}

function selectedMisconceptionFeedback(
  decision: PracticalDecision,
  selectedAction: PracticalDecisionOption | undefined,
  selectedReason: PracticalDecisionOption | undefined,
  correct: boolean,
): SelectedMisconceptionFeedback | null {
  if (correct) return null;

  const selectedMisconceptions = new Set(
    [selectedAction?.misconception, selectedReason?.misconception]
      .filter((misconception): misconception is string => Boolean(misconception)),
  );

  if (
    decision.id === "PM-BL-03-103"
    && (selectedMisconceptions.has("ANY_TWO") || selectedMisconceptions.has("RANGE_ABSOLUTE"))
  ) {
    return {
      mechanismRu: "Широкий опен BTN не делает любой колл с BB прибыльным. Уже поставленный BB снижает дополнительную цену колла, но эта скидка не бесконечна: цену всё равно нужно сравнивать с equity, которое рука реально сможет реализовать.",
      mechanismEn: "A wide BTN open does not make every BB call profitable. The already-posted BB lowers the incremental call price, but that discount is not infinite: compare the price with the equity the hand can actually realize.",
      boundaryRu: "На краю диапазона доминация, рейк и остальной контекст всё ещё могут опустить руку ниже границы защиты даже против широкого диапазона открытия.",
      boundaryEn: "At the fringe, domination, rake, and the rest of the context can still push a hand below the defense boundary even against a wide opening range.",
    };
  }

  if (
    decision.id === "PM-BL-05-105"
    && (selectedMisconceptions.has("FILTERING_IGNORED") || selectedMisconceptions.has("FILTERING_BACKWARDS"))
  ) {
    return {
      mechanismRu: "После того как соперник продолжает против 3-бета, ветка уже отфильтрована. Диапазон колла или другого продолжения — не исходное распределение опен-рейза: обычно это более сильная, отобранная часть диапазона.",
      mechanismEn: "Once Villain continues versus the 3-bet, that branch is filtered. The calling or otherwise continuing range is not the original opening distribution; it is normally a stronger, more selected subset.",
      boundaryRu: "EV 3-бета нужно оценивать против фактической ветки продолжения, а не против неотфильтрованного диапазона открытия. Сам по себе плохой колл всё ещё не делает 3-бет прибыльным.",
      boundaryEn: "Evaluate the 3-bet against the actual continuing branch, not the unfiltered opening range. A bad flat alone still does not make the 3-bet profitable.",
    };
  }

  return null;
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
  const genericFeedback = practicalDecisionFeedbackCopy(decision);
  const feedback = selectedMisconceptionFeedback(decision, selectedAction, selectedReason, correct) ?? genericFeedback;

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
