import type { PracticalMasteryState } from "./practical-mastery-core";

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
      .filter((attempt) => attempt.correct && latestByDecision.get(attempt.decisionId)?.id === attempt.id)
      .map((attempt) => attempt.decisionId),
  );
}
