import type { PracticalDecision } from "../content/practical-mastery";
import { practicalDecisionFeedbackCopy } from "../content/practical-mastery/practical-decision-feedback-copy";

type Locale = "ru" | "en";

function text(option: { textRu: string; textEn: string } | undefined, locale: Locale): string {
  if (!option) return locale === "ru" ? "Недоступно" : "Unavailable";
  return locale === "ru" ? option.textRu : option.textEn;
}

export default function PracticalDecisionFeedback({ decision, locale, correct }: { decision: PracticalDecision; locale: Locale; correct: boolean }) {
  const correctAction = decision.actionOptions.find((option) => option.id === decision.correctActionId);
  const correctReason = decision.reasonOptions.find((option) => option.id === decision.correctReasonId);
  const feedback = practicalDecisionFeedbackCopy(decision);
  const mechanism = locale === "ru" ? feedback.mechanismRu : feedback.mechanismEn;
  const boundary = locale === "ru" ? feedback.boundaryRu : feedback.boundaryEn;

  return <>
    {!correct ? <div className="today-card" style={{ marginTop: 12 }} data-practical-correct-answer>
      <p><b>{locale === "ru" ? "Правильное действие:" : "Correct action:"}</b> {text(correctAction, locale)}</p>
      <p><b>{locale === "ru" ? "Правильная причина:" : "Correct reason:"}</b> {text(correctReason, locale)}</p>
    </div> : null}
    <p data-practical-feedback-mechanism>{mechanism}</p>
    {boundary ? <p data-practical-feedback-boundary style={{ opacity: 0.86 }}>{boundary}</p> : null}
  </>;
}
