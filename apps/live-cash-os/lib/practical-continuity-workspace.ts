import { practicalDecisionById } from "../content/practical-mastery";
import type { IntegratedSessionItem } from "./practical-integrated-session";
import type { PracticalAttempt, PracticalMasteryState } from "./practical-mastery-core";
import type {
  PracticalContinuityWorkspace,
  PracticalStudyWorkspace,
} from "./practical-profile-contract";

export type QuickStartContinuityRestore =
  | { status: "NONE" | "STALE" | "INVALID" }
  | { status: "VALID"; skillId: string; decisionId: string; attempt: PracticalAttempt };

export type IntegratedContinuityRestore =
  | { status: "NONE" | "STALE" | "INVALID" }
  | { status: "VALID"; items: IntegratedSessionItem[]; nextIndex: number };

function continuityFor(workspace: PracticalStudyWorkspace, contentVersion: string): PracticalContinuityWorkspace | null {
  const continuity = workspace.continuity;
  if (!continuity || continuity.version !== 1 || continuity.contentVersion !== contentVersion) return null;
  return continuity;
}

function nextContinuity(workspace: PracticalStudyWorkspace, contentVersion: string): PracticalContinuityWorkspace {
  const current = continuityFor(workspace, contentVersion);
  return current ?? {
    version: 1,
    contentVersion,
    quickStart: null,
    integrated: null,
  };
}

function withContinuity(
  workspace: PracticalStudyWorkspace,
  continuity: PracticalContinuityWorkspace,
  now: Date,
): PracticalStudyWorkspace {
  return {
    ...workspace,
    continuity,
    updatedAt: now.toISOString(),
  };
}

export function withQuickStartPostAnswer(
  workspace: PracticalStudyWorkspace,
  contentVersion: string,
  input: { skillId: string; decisionId: string; attemptId: string },
  now = new Date(),
): PracticalStudyWorkspace {
  const continuity = nextContinuity(workspace, contentVersion);
  return withContinuity(workspace, {
    ...continuity,
    quickStart: {
      ...input,
      phase: "POST_ANSWER",
      updatedAt: now.toISOString(),
    },
  }, now);
}

export function clearQuickStartContinuity(
  workspace: PracticalStudyWorkspace,
  contentVersion: string,
  now = new Date(),
): PracticalStudyWorkspace {
  const continuity = nextContinuity(workspace, contentVersion);
  if (!continuity.quickStart) return workspace;
  return withContinuity(workspace, { ...continuity, quickStart: null }, now);
}

export function restoreQuickStartPostAnswer(
  workspace: PracticalStudyWorkspace,
  mastery: PracticalMasteryState,
): QuickStartContinuityRestore {
  if (!workspace.continuity?.quickStart) return { status: "NONE" };
  if (workspace.continuity.contentVersion !== mastery.contentVersion) return { status: "STALE" };
  const saved = workspace.continuity.quickStart;
  const decision = practicalDecisionById.get(saved.decisionId);
  if (!decision || decision.skillId !== saved.skillId) return { status: "INVALID" };
  const attempt = mastery.attempts.find((candidate) => candidate.id === saved.attemptId);
  if (!attempt || attempt.decisionId !== saved.decisionId || attempt.skillId !== saved.skillId) return { status: "INVALID" };
  return { status: "VALID", skillId: saved.skillId, decisionId: saved.decisionId, attempt };
}

export function recordIntegratedAnswerContinuity(
  workspace: PracticalStudyWorkspace,
  contentVersion: string,
  input: {
    focusSkillId: string | null;
    items: IntegratedSessionItem[];
    answeredIndex: number;
    attemptId: string;
  },
  now = new Date(),
): PracticalStudyWorkspace | null {
  if (input.items.length === 0 || input.items.length > 8) return null;
  if (input.answeredIndex < 0 || input.answeredIndex >= input.items.length) return null;

  const current = continuityFor(workspace, contentVersion)?.integrated;
  const sameRound = Boolean(current
    && current.focusSkillId === input.focusSkillId
    && current.items.length === input.items.length
    && current.items.every((item, index) => item.decisionId === input.items[index]?.decisionId));
  let submittedAttemptIds = sameRound ? [...current!.submittedAttemptIds] : [];
  const expectedIndex = sameRound ? current!.nextIndex : 0;
  if (input.answeredIndex !== expectedIndex) {
    // A valid restored round always mounts at nextIndex, so a 0-index submit while
    // an older same-shape cursor exists can only come from the explicit fresh-round
    // recovery action. Replace that stale cursor atomically with the new Q1 answer.
    if (input.answeredIndex !== 0) return null;
    submittedAttemptIds = [];
  }
  submittedAttemptIds.push(input.attemptId);

  const continuity = nextContinuity(workspace, contentVersion);
  return withContinuity(workspace, {
    ...continuity,
    integrated: {
      focusSkillId: input.focusSkillId,
      items: input.items.map((item) => ({ ...item })),
      nextIndex: input.answeredIndex + 1,
      submittedAttemptIds,
      updatedAt: now.toISOString(),
    },
  }, now);
}

export function restoreIntegratedRound(
  workspace: PracticalStudyWorkspace,
  mastery: PracticalMasteryState,
  requestedFocus: string | null,
): IntegratedContinuityRestore {
  const saved = workspace.continuity?.integrated;
  if (!saved) return { status: "NONE" };
  if (workspace.continuity?.contentVersion !== mastery.contentVersion) return { status: "STALE" };
  if (saved.focusSkillId !== requestedFocus) return { status: "NONE" };
  if (saved.items.length === 0 || saved.items.length > 8 || saved.nextIndex > saved.items.length) return { status: "INVALID" };
  if (saved.submittedAttemptIds.length !== saved.nextIndex) return { status: "INVALID" };

  for (const [index, item] of saved.items.entries()) {
    const decision = practicalDecisionById.get(item.decisionId);
    if (!decision || decision.skillId !== item.skillId) return { status: "INVALID" };
    if (requestedFocus && item.skillId !== requestedFocus) return { status: "INVALID" };
    if (index >= saved.nextIndex) continue;
    const attemptId = saved.submittedAttemptIds[index];
    const attempt = mastery.attempts.find((candidate) => candidate.id === attemptId);
    if (!attempt || attempt.decisionId !== item.decisionId || attempt.skillId !== item.skillId) return { status: "INVALID" };
  }

  return {
    status: "VALID",
    items: saved.items.map((item) => ({ ...item })),
    nextIndex: saved.nextIndex,
  };
}
