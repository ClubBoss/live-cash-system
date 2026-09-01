import {
  allPracticalTableStates,
  isOrdinaryLearnerDecision,
  practicalDecisionById,
  practicalSkillById,
} from "../content/practical-mastery";
import type { PracticalMasteryState } from "./practical-mastery-core";

export function focusedPracticalTableStates(
  state: PracticalMasteryState,
  focusSkillId: string,
) {
  if (!practicalSkillById.has(focusSkillId)) return [];
  if (!state.skills[focusSkillId]?.conceptTaught) return [];

  return allPracticalTableStates.filter((table) => {
    const decision = practicalDecisionById.get(table.decisionId);
    return Boolean(
      decision
      && decision.skillId === focusSkillId
      && isOrdinaryLearnerDecision(decision),
    );
  });
}

export function hasFocusedPracticalTableState(
  state: PracticalMasteryState,
  focusSkillId: string,
): boolean {
  return focusedPracticalTableStates(state, focusSkillId).length > 0;
}
