import { isSemanticallyValidPracticalAttempt, type PracticalMasteryState } from "./practical-mastery-core";

export const PRACTICAL_EXACT_REPEAT_WINDOW = 8;

export function recentSuccessfulDecisionIds(
  state: PracticalMasteryState,
  windowSize = PRACTICAL_EXACT_REPEAT_WINDOW,
): Set<string> {
  if (windowSize <= 0 || state.attempts.length === 0) return new Set();

  const latestByDecision = new Map<string, (typeof state.attempts)[number]>();
  for (const attempt of state.attempts) latestByDecision.set(attempt.decisionId, attempt);

  return new Set(
    state.attempts
      .slice(-windowSize)
      .filter((attempt) => attempt.correct
        && isSemanticallyValidPracticalAttempt(attempt)
        && latestByDecision.get(attempt.decisionId)?.id === attempt.id)
      .map((attempt) => attempt.decisionId),
  );
}

// Every decision seen in the last `windowSize` attempts, correct or not. Used to
// keep an exact prompt from reappearing in the immediately adjacent round: a
// wrong answer must not trigger an instant exact repeat any more than a correct
// one does. Consumers keep a no-avoid fallback so a repair is never lost when a
// skill has no non-recent alternative.
export function recentlyAttemptedDecisionIds(
  state: PracticalMasteryState,
  windowSize = PRACTICAL_EXACT_REPEAT_WINDOW,
): Set<string> {
  if (windowSize <= 0 || state.attempts.length === 0) return new Set();
  return new Set(
    state.attempts
      .slice(-windowSize)
      .filter(isSemanticallyValidPracticalAttempt)
      .map((attempt) => attempt.decisionId),
  );
}
