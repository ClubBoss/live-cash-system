import { practicalDecisionById, practicalSkillById } from "../content/practical-mastery";
import type { IntegratedSessionItem } from "./practical-integrated-session";
import { isSemanticallyValidPracticalAttempt, type PracticalAttempt, type PracticalMasteryState } from "./practical-mastery-core";
import type {
  PracticalContinuityWorkspace,
  PracticalStudyWorkspace,
} from "./practical-profile-contract";

export type QuickStartContinuityRestore =
  | { status: "NONE" | "STALE" | "INVALID" }
  | { status: "VALID"; skillId: string; decisionId: string; attempt: PracticalAttempt };

export type QuickStartDraftRestore =
  | { status: "NONE" | "STALE" | "INVALID" }
  | {
    status: "VALID";
    skillId: string;
    decisionId: string;
    selectedActionId: string | null;
    selectedReasonId: string | null;
  };

export type IntegratedContinuityRestore =
  | { status: "NONE" | "STALE" | "INVALID" }
  | { status: "VALID"; items: IntegratedSessionItem[]; nextIndex: number; postAnswerAttempt: PracticalAttempt | null };

export type PerceptualContinuityRestore =
  | { status: "NONE" | "STALE" | "INVALID" }
  | { status: "VALID"; decisionId: string };

export type SkillMapContinuityRestore =
  | { status: "NONE" | "STALE" | "INVALID" }
  | { status: "VALID"; skillId: string };

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
    perceptual: null,
    skillMap: null,
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

export function withPerceptualCursor(
  workspace: PracticalStudyWorkspace,
  contentVersion: string,
  decisionId: string,
  now = new Date(),
): PracticalStudyWorkspace {
  if (!practicalDecisionById.has(decisionId)) return workspace;
  const continuity = nextContinuity(workspace, contentVersion);
  return withContinuity(workspace, {
    ...continuity,
    perceptual: {
      decisionId,
      updatedAt: now.toISOString(),
    },
  }, now);
}

export function restorePerceptualCursor(
  workspace: PracticalStudyWorkspace,
  mastery: PracticalMasteryState,
  eligibleDecisionIds: readonly string[],
): PerceptualContinuityRestore {
  const saved = workspace.continuity?.perceptual;
  if (!saved) return { status: "NONE" };
  if (workspace.continuity?.contentVersion !== mastery.contentVersion) return { status: "STALE" };
  if (!practicalDecisionById.has(saved.decisionId) || !eligibleDecisionIds.includes(saved.decisionId)) return { status: "INVALID" };
  return { status: "VALID", decisionId: saved.decisionId };
}

export function withSkillMapCursor(
  workspace: PracticalStudyWorkspace,
  contentVersion: string,
  skillId: string,
  now = new Date(),
): PracticalStudyWorkspace {
  if (!practicalSkillById.has(skillId)) return workspace;
  const continuity = nextContinuity(workspace, contentVersion);
  return withContinuity(workspace, {
    ...continuity,
    skillMap: {
      skillId,
      updatedAt: now.toISOString(),
    },
  }, now);
}

export function restoreSkillMapCursor(
  workspace: PracticalStudyWorkspace,
  mastery: PracticalMasteryState,
  eligibleSkillIds: readonly string[],
): SkillMapContinuityRestore {
  const saved = workspace.continuity?.skillMap;
  if (!saved) return { status: "NONE" };
  if (workspace.continuity?.contentVersion !== mastery.contentVersion) return { status: "STALE" };
  if (!practicalSkillById.has(saved.skillId) || !eligibleSkillIds.includes(saved.skillId)) return { status: "INVALID" };
  return { status: "VALID", skillId: saved.skillId };
}

export function withQuickStartDraft(
  workspace: PracticalStudyWorkspace,
  contentVersion: string,
  input: {
    skillId: string;
    decisionId: string;
    selectedActionId: string | null;
    selectedReasonId: string | null;
  },
  now = new Date(),
): PracticalStudyWorkspace {
  const decision = practicalDecisionById.get(input.decisionId);
  if (!decision || decision.skillId !== input.skillId || !practicalSkillById.has(input.skillId)) return workspace;
  if (input.selectedActionId !== null && !decision.actionOptions.some((option) => option.id === input.selectedActionId)) return workspace;
  if (input.selectedReasonId !== null && !decision.reasonOptions.some((option) => option.id === input.selectedReasonId)) return workspace;
  const continuity = nextContinuity(workspace, contentVersion);
  return withContinuity(workspace, {
    ...continuity,
    quickStart: {
      ...input,
      phase: "IN_PROGRESS",
      updatedAt: now.toISOString(),
    },
  }, now);
}

export function restoreQuickStartDraft(
  workspace: PracticalStudyWorkspace,
  mastery: PracticalMasteryState,
  expectedSkillId: string,
  expectedDecisionId: string,
): QuickStartDraftRestore {
  const saved = workspace.continuity?.quickStart;
  if (!saved || saved.phase !== "IN_PROGRESS") return { status: "NONE" };
  if (workspace.continuity?.contentVersion !== mastery.contentVersion) return { status: "STALE" };
  if (saved.skillId !== expectedSkillId || saved.decisionId !== expectedDecisionId) return { status: "INVALID" };
  const decision = practicalDecisionById.get(saved.decisionId);
  if (!decision || decision.skillId !== saved.skillId || !practicalSkillById.has(saved.skillId)) return { status: "INVALID" };
  if (saved.selectedActionId !== null && !decision.actionOptions.some((option) => option.id === saved.selectedActionId)) return { status: "INVALID" };
  if (saved.selectedReasonId !== null && !decision.reasonOptions.some((option) => option.id === saved.selectedReasonId)) return { status: "INVALID" };
  return {
    status: "VALID",
    skillId: saved.skillId,
    decisionId: saved.decisionId,
    selectedActionId: saved.selectedActionId,
    selectedReasonId: saved.selectedReasonId,
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
  if (!workspace.continuity?.quickStart || workspace.continuity.quickStart.phase !== "POST_ANSWER") return { status: "NONE" };
  if (workspace.continuity.contentVersion !== mastery.contentVersion) return { status: "STALE" };
  const saved = workspace.continuity.quickStart;
  const decision = practicalDecisionById.get(saved.decisionId);
  if (!decision || decision.skillId !== saved.skillId) return { status: "INVALID" };
  const attempt = mastery.attempts.find((candidate) => candidate.id === saved.attemptId);
  if (!attempt || attempt.decisionId !== saved.decisionId || attempt.skillId !== saved.skillId || !isSemanticallyValidPracticalAttempt(attempt)) return { status: "INVALID" };
  return { status: "VALID", skillId: saved.skillId, decisionId: saved.decisionId, attempt };
}

export function recordIntegratedRoundStartContinuity(
  workspace: PracticalStudyWorkspace,
  contentVersion: string,
  input: {
    focusSkillId: string | null;
    items: IntegratedSessionItem[];
  },
  now = new Date(),
): PracticalStudyWorkspace | null {
  if (input.items.length === 0 || input.items.length > 8) return null;

  const continuity = nextContinuity(workspace, contentVersion);
  return withContinuity(workspace, {
    ...continuity,
    integrated: {
      focusSkillId: input.focusSkillId,
      items: input.items.map((item) => ({ ...item })),
      nextIndex: 0,
      submittedAttemptIds: [],
      updatedAt: now.toISOString(),
    },
  }, now);
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
  const postAnswerPending = Boolean(sameRound && current!.submittedAttemptIds.length === current!.nextIndex + 1);
  if (postAnswerPending) return null;
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
      nextIndex: input.answeredIndex,
      submittedAttemptIds,
      updatedAt: now.toISOString(),
    },
  }, now);
}

export function advanceIntegratedContinuity(
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
  const current = continuityFor(workspace, contentVersion)?.integrated;
  if (!current || input.items.length === 0 || input.items.length > 8) return null;
  if (current.focusSkillId !== input.focusSkillId || current.nextIndex !== input.answeredIndex) return null;
  if (current.items.length !== input.items.length || !current.items.every((item, index) => item.decisionId === input.items[index]?.decisionId)) return null;
  if (current.submittedAttemptIds.length !== current.nextIndex + 1) return null;
  if (current.submittedAttemptIds.at(-1) !== input.attemptId) return null;

  const continuity = nextContinuity(workspace, contentVersion);
  return withContinuity(workspace, {
    ...continuity,
    integrated: {
      ...current,
      nextIndex: input.answeredIndex + 1,
      updatedAt: now.toISOString(),
    },
  }, now);
}

export type ActiveIntegratedRoundResume = {
  href: string;
  focusSkillId: string | null;
  nextIndex: number;
  itemCount: number;
};

// Canonical "is there an active, valid, incomplete round to resume?" query.
// Reuses restoreIntegratedRound (the single continuity authority) so the primary
// Continue affordances can give an in-progress round resume precedence over
// starting an unrelated new lesson, without introducing a second session store.
export function activeIntegratedRoundResume(
  workspace: PracticalStudyWorkspace,
  mastery: PracticalMasteryState,
): ActiveIntegratedRoundResume | null {
  const saved = workspace.continuity?.integrated;
  if (!saved) return null;
  const restore = restoreIntegratedRound(workspace, mastery, saved.focusSkillId);
  if (restore.status !== "VALID") return null;
  // A fully answered round (cursor past the last item, no pending feedback) is
  // finished and must not keep hijacking Continue.
  if (restore.nextIndex >= restore.items.length && !restore.postAnswerAttempt) return null;
  const href = saved.focusSkillId
    ? `/mastery/session?focus=${encodeURIComponent(saved.focusSkillId)}`
    : "/mastery/session";
  return { href, focusSkillId: saved.focusSkillId, nextIndex: restore.nextIndex, itemCount: restore.items.length };
}

// Shared helper for learning-entry CTAs that otherwise point at a fixed
// destination: an active, valid, incomplete round always outranks the fixed
// target so a sibling CTA cannot silently abandon it.
export function nextLearningHref(resume: ActiveIntegratedRoundResume | null, fallbackHref: string): string {
  return resume ? resume.href : fallbackHref;
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
  const postAnswerPending = saved.submittedAttemptIds.length === saved.nextIndex + 1;
  if (!postAnswerPending && saved.submittedAttemptIds.length !== saved.nextIndex) return { status: "INVALID" };
  if (saved.submittedAttemptIds.length > saved.items.length) return { status: "INVALID" };

  for (const [index, item] of saved.items.entries()) {
    const decision = practicalDecisionById.get(item.decisionId);
    if (!decision || decision.skillId !== item.skillId) return { status: "INVALID" };
    if (requestedFocus && item.skillId !== requestedFocus) return { status: "INVALID" };
    if (index >= saved.submittedAttemptIds.length) continue;
    const attemptId = saved.submittedAttemptIds[index];
    const attempt = mastery.attempts.find((candidate) => candidate.id === attemptId);
    if (!attempt || attempt.decisionId !== item.decisionId || attempt.skillId !== item.skillId || !isSemanticallyValidPracticalAttempt(attempt)) return { status: "INVALID" };
  }

  const postAnswerAttempt = postAnswerPending
    ? mastery.attempts.find((candidate) => candidate.id === saved.submittedAttemptIds[saved.nextIndex]) ?? null
    : null;
  if (postAnswerPending && (!postAnswerAttempt || !isSemanticallyValidPracticalAttempt(postAnswerAttempt))) return { status: "INVALID" };

  return {
    status: "VALID",
    items: saved.items.map((item) => ({ ...item })),
    nextIndex: saved.nextIndex,
    postAnswerAttempt,
  };
}
