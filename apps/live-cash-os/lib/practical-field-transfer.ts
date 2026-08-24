import { practicalDecisionById, practicalSkillById } from "../content/practical-mastery";
import {
  routeRealHandToRepairs,
  type RealHandRepairSignals,
} from "./practical-integrated-session";
import {
  markPracticalRealHandTransfer,
  type PracticalMasteryState,
} from "./practical-mastery-core";

export type PracticalFieldReviewerKind = "HUMAN" | "HUMAN_ASSISTED";

export type PracticalFieldBinding = {
  fieldHandId: string;
  reviewerKind: PracticalFieldReviewerKind;
  practicalSkillId: string;
  signals: RealHandRepairSignals;
  decisionId?: string;
};

export type PracticalFieldBindingInput = {
  practicalSkillId?: string;
  signals: RealHandRepairSignals;
  decisionId?: string;
};

export type PracticalFieldTransferNote = {
  id: string;
  cueBeforeAction: boolean;
  decisionLockedAt?: string;
  status: string;
  reviewOutcome?: string;
  reviewerKind?: string;
  practicalBinding?: PracticalFieldBinding;
};

const SIGNAL_KEYS = [
  "street",
  "potType",
  "role",
  "blindIssue",
  "openSizeIssue",
  "boardOwnershipIssue",
  "automaticCbetIssue",
  "probeIssue",
  "bluffCatchIssue",
  "multiwayThresholdIssue",
  "straddleGeometryIssue",
  "evidenceGeneralizationIssue",
] as const satisfies readonly (keyof RealHandRepairSignals)[];

const BOOLEAN_SIGNAL_KEYS = [
  "blindIssue",
  "openSizeIssue",
  "boardOwnershipIssue",
  "automaticCbetIssue",
  "probeIssue",
  "bluffCatchIssue",
  "multiwayThresholdIssue",
  "straddleGeometryIssue",
  "evidenceGeneralizationIssue",
] as const satisfies readonly (keyof RealHandRepairSignals)[];

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeSignals(value: unknown): RealHandRepairSignals | null {
  if (!isRecord(value)) return null;
  if (Object.keys(value).some((key) => !SIGNAL_KEYS.includes(key as keyof RealHandRepairSignals))) return null;

  const street = value.street;
  if (street !== undefined && !["preflop", "flop", "turn", "river"].includes(String(street))) return null;
  const potType = value.potType;
  if (potType !== undefined && !["srp", "3bp", "4bp", "multiway"].includes(String(potType))) return null;
  const role = value.role;
  if (role !== undefined && !["aggressor_ip", "aggressor_oop", "caller_ip", "caller_oop"].includes(String(role))) return null;
  for (const key of BOOLEAN_SIGNAL_KEYS) {
    if (value[key] !== undefined && typeof value[key] !== "boolean") return null;
  }

  const normalized: RealHandRepairSignals = {};
  if (street !== undefined) normalized.street = street as NonNullable<RealHandRepairSignals["street"]>;
  if (potType !== undefined) normalized.potType = potType as NonNullable<RealHandRepairSignals["potType"]>;
  if (role !== undefined) normalized.role = role as NonNullable<RealHandRepairSignals["role"]>;
  for (const key of BOOLEAN_SIGNAL_KEYS) {
    if (value[key] === true) (normalized as Record<string, unknown>)[key] = true;
  }
  return normalized;
}

export function practicalFieldMechanismKey(signals: unknown): string | null {
  const normalized = normalizeSignals(signals);
  if (!normalized || routeRealHandToRepairs(normalized).length === 0) return null;
  return SIGNAL_KEYS
    .filter((key) => normalized[key] !== undefined)
    .map((key) => `${key}=${String(normalized[key])}`)
    .join("|");
}

export function resolvePracticalFieldBinding(
  fieldHandId: string,
  reviewerKind: string,
  input: PracticalFieldBindingInput | undefined,
): PracticalFieldBinding | null {
  if (!fieldHandId.trim()) return null;
  if (reviewerKind !== "HUMAN" && reviewerKind !== "HUMAN_ASSISTED") return null;
  if (!input) return null;

  const signals = normalizeSignals(input.signals);
  if (!signals) return null;
  const candidates = routeRealHandToRepairs(signals);
  if (candidates.length === 0) return null;

  const requestedSkillId = input.practicalSkillId?.trim() || "";
  const practicalSkillId = candidates.length === 1 ? candidates[0].skillId : requestedSkillId;
  if (!practicalSkillId || !candidates.some((candidate) => candidate.skillId === practicalSkillId)) return null;
  if (!practicalSkillById.has(practicalSkillId)) return null;
  if (requestedSkillId && requestedSkillId !== practicalSkillId) return null;

  const decisionId = input.decisionId?.trim() || undefined;
  if (decisionId) {
    const decision = practicalDecisionById.get(decisionId);
    if (!decision || decision.skillId !== practicalSkillId) return null;
  }

  return {
    fieldHandId,
    reviewerKind,
    practicalSkillId,
    signals,
    decisionId,
  };
}

export function validatePracticalFieldBinding(
  noteId: string,
  reviewerKind: string | undefined,
  binding: PracticalFieldBinding | undefined,
): PracticalFieldBinding | null {
  if (!binding || binding.fieldHandId !== noteId || binding.reviewerKind !== reviewerKind) return null;
  return resolvePracticalFieldBinding(noteId, binding.reviewerKind, {
    practicalSkillId: binding.practicalSkillId,
    signals: binding.signals,
    decisionId: binding.decisionId,
  });
}

export function practicalRepairFocusHref(note: PracticalFieldTransferNote): string | null {
  if (note.status !== "REVIEWED_REPAIR" || note.reviewOutcome !== "REPAIR_REQUIRED") return null;
  const binding = validatePracticalFieldBinding(note.id, note.reviewerKind, note.practicalBinding);
  return binding ? `/mastery/session?focus=${encodeURIComponent(binding.practicalSkillId)}` : null;
}

export function reconcilePracticalFieldTransfer(
  practicalState: PracticalMasteryState,
  fieldNotes: readonly PracticalFieldTransferNote[],
  now = new Date(),
): PracticalMasteryState {
  const supportingByMechanism = new Map<string, Set<string>>();

  for (const note of fieldNotes) {
    if (note.reviewOutcome !== "SUPPORTS_TRANSFER" || note.status !== "REVIEWED_VALID") continue;
    if ((note.reviewerKind !== "HUMAN" && note.reviewerKind !== "HUMAN_ASSISTED") || !note.decisionLockedAt || note.cueBeforeAction !== true) continue;
    const binding = validatePracticalFieldBinding(note.id, note.reviewerKind, note.practicalBinding);
    if (!binding) continue;
    const mechanism = practicalFieldMechanismKey(binding.signals);
    if (!mechanism) continue;
    const key = `${binding.practicalSkillId}::${mechanism}`;
    const noteIds = supportingByMechanism.get(key) ?? new Set<string>();
    noteIds.add(note.id);
    supportingByMechanism.set(key, noteIds);
  }

  let next = practicalState;
  for (const [key, noteIds] of supportingByMechanism) {
    if (noteIds.size < 2) continue;
    const skillId = key.slice(0, key.indexOf("::"));
    const progress = next.skills[skillId];
    if (!progress?.delayedRetrievalPassed || progress.realHandTransferReviewed) continue;
    next = markPracticalRealHandTransfer(next, skillId, true, now);
  }
  return next;
}
