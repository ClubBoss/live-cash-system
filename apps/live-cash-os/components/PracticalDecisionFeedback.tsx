import type { PracticalDecision } from "../content/practical-mastery";

type Locale = "ru" | "en";

function text(option: { textRu: string; textEn: string } | undefined, locale: Locale): string {
  if (!option) return locale === "ru" ? "Недоступно" : "Unavailable";
  return locale === "ru" ? option.textRu : option.textEn;
}

export default function PracticalDecisionFeedback({ decision, locale, correct }: { decision: PracticalDecision; locale: Locale; correct: boolean }) {
  const correctAction = decision.actionOptions.find((option) => option.id === decision.correctActionId);
  const correctReason = decision.reasonOptions.find((option) => option.id === decision.correctReasonId);
  return <>
    {!correct ? <div className="today-card" style={{ marginTop: 12 }} data-practical-correct-answer>
      <p><b>{locale === "ru" ? "Правильное действие:" : "Correct action:"}</b> {text(correctAction, locale)}</p>
      <p><b>{locale === "ru" ? "Правильная причина:" : "Correct reason:"}</b> {text(correctReason, locale)}</p>
    </div> : null}
    <p>{locale === "ru" ? decision.explanationRu : decision.explanationEn}</p>
  </>;
}
