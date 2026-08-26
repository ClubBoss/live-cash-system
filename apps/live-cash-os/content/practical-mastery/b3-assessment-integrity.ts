import type { PracticalDecision, PracticalDecisionOption } from "./types";

function placeCorrectOption(
  options: PracticalDecisionOption[],
  correctId: string,
  slot: number,
): PracticalDecisionOption[] {
  const correct = options.find((option) => option.id === correctId);
  if (!correct || options.length !== 3 || slot < 0 || slot > 2) return options;
  const others = options.filter((option) => option.id !== correctId);
  return [...others.slice(0, slot), correct, ...others.slice(slot)];
}

export function balanceB3AssessmentOptions(decisions: PracticalDecision[]): PracticalDecision[] {
  const familyOrdinals = new Map<string, number>();
  const familyRungs = new Map<string, number>();

  return decisions.map((decision) => {
    let familyOrdinal = familyOrdinals.get(decision.skillId);
    if (familyOrdinal === undefined) {
      familyOrdinal = familyOrdinals.size;
      familyOrdinals.set(decision.skillId, familyOrdinal);
    }

    const rungIndex = familyRungs.get(decision.skillId) ?? 0;
    familyRungs.set(decision.skillId, rungIndex + 1);

    const actionSlot = (familyOrdinal + rungIndex) % 3;
    const reasonSlot = ((familyOrdinal * 2) + rungIndex + 1) % 3;

    return {
      ...decision,
      actionOptions: placeCorrectOption(decision.actionOptions, decision.correctActionId, actionSlot),
      reasonOptions: placeCorrectOption(decision.reasonOptions, decision.correctReasonId, reasonSlot),
    };
  });
}
