import type { PracticalDecision } from "../content/practical-mastery";
import { practicalSelectedDecisionFeedback } from "../lib/practical-selected-decision-feedback";

type Locale = "ru" | "en";

export default function PracticalDecisionFeedback({
  decision,
  locale,
  correct,
  selectedActionId,
  selectedReasonId,
}: {
  decision: PracticalDecision;
  locale: Locale;
  correct: boolean;
  selectedActionId: string;
  selectedReasonId: string;
}) {
  const feedback = practicalSelectedDecisionFeedback(decision, locale, selectedActionId, selectedReasonId, correct);
  const hasDiagnosis = Boolean(feedback.action || feedback.reason);

  return <>
    {!correct ? <div className="today-card" style={{ marginTop: 12 }} data-practical-correct-answer data-practical-selected-diagnosis>
      {feedback.action ? <>
        <p data-practical-selected-action><b>{locale === "ru" ? "Твой выбор:" : "Your choice:"}</b> {feedback.action.selectedText}</p>
        <p><b>{locale === "ru" ? "Правильное действие:" : "Correct action:"}</b> {feedback.action.correctText}</p>
      </> : null}
      {feedback.reason ? <>
        <p data-practical-selected-reason><b>{locale === "ru" ? "Твоя причина:" : "Your reason:"}</b> {feedback.reason.selectedText}</p>
        <p><b>{locale === "ru" ? "Правильная причина:" : "Correct reason:"}</b> {feedback.reason.correctText}</p>
      </> : null}
      <p data-practical-feedback-mechanism>
        {hasDiagnosis ? <b>{locale === "ru" ? "На что смотреть в следующий раз:" : "What to notice next time:"}</b> : null}
        {hasDiagnosis ? " " : null}{feedback.mechanism}
      </p>
    </div> : <p data-practical-feedback-mechanism>{feedback.mechanism}</p>}
    {feedback.boundary ? <p data-practical-feedback-boundary style={{ opacity: 0.86 }}>{feedback.boundary}</p> : null}
  </>;
}
