export type PracticalIntegratedSessionPresentationState =
  | "RECOVERY"
  | "FOCUS_UNAVAILABLE"
  | "GENERIC_EMPTY"
  | "FOCUSED_EMPTY"
  | "COMPLETE"
  | "ACTIVE";

export function classifyPracticalIntegratedSessionState(input: {
  workspaceRecovery: boolean;
  requestedFocus: string | null;
  focusAdmissible: boolean;
  itemCount: number;
  index: number;
}): PracticalIntegratedSessionPresentationState {
  if (input.workspaceRecovery) return "RECOVERY";
  if (input.requestedFocus && !input.focusAdmissible) return "FOCUS_UNAVAILABLE";
  if (input.itemCount === 0) return input.requestedFocus ? "FOCUSED_EMPTY" : "GENERIC_EMPTY";
  if (input.index >= input.itemCount) return "COMPLETE";
  return "ACTIVE";
}
