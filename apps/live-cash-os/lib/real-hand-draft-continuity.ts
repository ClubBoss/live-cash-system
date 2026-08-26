"use client";

import { MODULE_IDS, type LearnerState, type ModuleId } from "./model-core";
import type { PracticalFieldBindingInput } from "./practical-field-transfer";
import {
  REAL_HAND_DRAFT_KEY,
  clearUiStorage,
  readProfileScopedUiValue,
  writeProfileScopedUiValue,
} from "./ui-session-storage";
import {
  explainBackRecords,
  type FieldHandInput,
  type FieldReviewerKind,
  type StructuredFieldNote,
} from "./wave7";

export const REAL_HAND_DRAFT_TTL_MS = 30 * 24 * 60 * 60 * 1_000;
export const REAL_HAND_DRAFT_WORKSPACE_VERSION = 2;
const MAX_DRAFT_TEXT = 5_000;
const MAX_DRAFT_IDENTITIES = 100;

const DRAFT_STRING_FIELDS = [
  "stakes",
  "heroPosition",
  "villainPositions",
  "effectiveStacks",
  "straddle",
  "actionSequence",
  "board",
  "sizings",
  "cue",
  "action",
  "reason",
  "populationRead",
] as const satisfies readonly (keyof FieldHandInput)[];

const SIGNAL_BOOLEAN_KEYS = [
  "blindIssue",
  "openSizeIssue",
  "boardOwnershipIssue",
  "automaticCbetIssue",
  "probeIssue",
  "bluffCatchIssue",
  "multiwayThresholdIssue",
  "straddleGeometryIssue",
  "evidenceGeneralizationIssue",
] as const;

export type RealHandPostCaptureDrafts = {
  resultByNoteId: Record<string, string>;
  showdownByNoteId: Record<string, string>;
  reviewNoteByNoteId: Record<string, string>;
  reviewerKindByNoteId: Record<string, FieldReviewerKind>;
  practicalBindingByNoteId: Record<string, PracticalFieldBindingInput>;
  explainReviewByRecordId: Record<string, string>;
};

export type RealHandDraftWorkspace = {
  version: typeof REAL_HAND_DRAFT_WORKSPACE_VERSION;
  capture: FieldHandInput;
  postCapture: RealHandPostCaptureDrafts;
};

export type PendingRealHandDraftMutation =
  | {
      kind: "RESULT";
      identity: string;
      revision: number;
      updatedAt: string;
      previousLocalSaveAt: string | null;
      result: string;
      showdown: string;
    }
  | {
      kind: "REVIEW";
      identity: string;
      revision: number;
      updatedAt: string;
      previousLocalSaveAt: string | null;
      reviewerKind: FieldReviewerKind;
      reviewerNote: string;
      reviewedAt: string;
    }
  | {
      kind: "EXPLAIN_REVIEW";
      identity: string;
      revision: number;
      updatedAt: string;
      previousLocalSaveAt: string | null;
      status: "REVIEWED_OK" | "REVIEWED_REPAIR" | "INSUFFICIENT";
      reviewerNote: string;
      reviewedAt: string;
    };

export function emptyRealHandCapture(): FieldHandInput {
  return {
    moduleId: "" as ModuleId,
    stakes: "",
    heroPosition: "",
    villainPositions: "",
    effectiveStacks: "",
    straddle: "",
    actionSequence: "",
    board: "",
    sizings: "",
    cue: "",
    action: "",
    reason: "",
    confidence: 65,
    populationRead: "",
    populationReadConfidence: 50,
  };
}

export function emptyRealHandPostCaptureDrafts(): RealHandPostCaptureDrafts {
  return {
    resultByNoteId: {},
    showdownByNoteId: {},
    reviewNoteByNoteId: {},
    reviewerKindByNoteId: {},
    practicalBindingByNoteId: {},
    explainReviewByRecordId: {},
  };
}

export function emptyRealHandDraftWorkspace(): RealHandDraftWorkspace {
  return {
    version: REAL_HAND_DRAFT_WORKSPACE_VERSION,
    capture: emptyRealHandCapture(),
    postCapture: emptyRealHandPostCaptureDrafts(),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function boundedText(value: unknown): string | null {
  return typeof value === "string" && value.length <= MAX_DRAFT_TEXT ? value : null;
}

function boundedIdentity(value: string): boolean {
  return value.length > 0 && value.length <= 240;
}

function validPercent(value: unknown): number | null {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= 100 ? value : null;
}

function parseCapture(value: unknown): FieldHandInput | null {
  if (!isRecord(value)) return null;
  const moduleId = boundedText(value.moduleId);
  if (moduleId === null || (moduleId !== "" && !MODULE_IDS.includes(moduleId as ModuleId))) return null;
  const strings = Object.fromEntries(DRAFT_STRING_FIELDS.map((key) => [key, boundedText(value[key])])) as Record<(typeof DRAFT_STRING_FIELDS)[number], string | null>;
  if (DRAFT_STRING_FIELDS.some((key) => strings[key] === null)) return null;
  const confidence = validPercent(value.confidence);
  const populationReadConfidence = validPercent(value.populationReadConfidence);
  if (confidence === null || populationReadConfidence === null) return null;
  return {
    moduleId: moduleId as ModuleId,
    stakes: strings.stakes!,
    heroPosition: strings.heroPosition!,
    villainPositions: strings.villainPositions!,
    effectiveStacks: strings.effectiveStacks!,
    straddle: strings.straddle!,
    actionSequence: strings.actionSequence!,
    board: strings.board!,
    sizings: strings.sizings!,
    cue: strings.cue!,
    action: strings.action!,
    reason: strings.reason!,
    confidence,
    populationRead: strings.populationRead!,
    populationReadConfidence,
  };
}

function parseTextMap(value: unknown): Record<string, string> | null {
  if (!isRecord(value) || Object.keys(value).length > MAX_DRAFT_IDENTITIES) return null;
  const result: Record<string, string> = {};
  for (const [identity, raw] of Object.entries(value)) {
    const text = boundedText(raw);
    if (!boundedIdentity(identity) || text === null) return null;
    result[identity] = text;
  }
  return result;
}

function parseReviewerMap(value: unknown): Record<string, FieldReviewerKind> | null {
  if (!isRecord(value) || Object.keys(value).length > MAX_DRAFT_IDENTITIES) return null;
  const result: Record<string, FieldReviewerKind> = {};
  for (const [identity, raw] of Object.entries(value)) {
    if (!boundedIdentity(identity) || (raw !== "SELF" && raw !== "HUMAN" && raw !== "HUMAN_ASSISTED")) return null;
    result[identity] = raw;
  }
  return result;
}

function parseSignals(value: unknown): PracticalFieldBindingInput["signals"] | null {
  if (!isRecord(value)) return null;
  const allowed = new Set(["street", "potType", "role", ...SIGNAL_BOOLEAN_KEYS]);
  if (Object.keys(value).some((key) => !allowed.has(key))) return null;
  if (value.street !== undefined && !["preflop", "flop", "turn", "river"].includes(String(value.street))) return null;
  if (value.potType !== undefined && !["srp", "3bp", "4bp", "multiway"].includes(String(value.potType))) return null;
  if (value.role !== undefined && !["aggressor_ip", "aggressor_oop", "caller_ip", "caller_oop"].includes(String(value.role))) return null;
  for (const key of SIGNAL_BOOLEAN_KEYS) if (value[key] !== undefined && typeof value[key] !== "boolean") return null;
  return { ...value } as PracticalFieldBindingInput["signals"];
}

function parseBindingInput(value: unknown): PracticalFieldBindingInput | null {
  if (!isRecord(value) || Object.keys(value).some((key) => !["practicalSkillId", "signals", "decisionId"].includes(key))) return null;
  const practicalSkillId = value.practicalSkillId === undefined ? undefined : boundedText(value.practicalSkillId);
  const decisionId = value.decisionId === undefined ? undefined : boundedText(value.decisionId);
  const signals = parseSignals(value.signals);
  if (practicalSkillId === null || decisionId === null || signals === null) return null;
  return {
    ...(practicalSkillId ? { practicalSkillId } : {}),
    signals,
    ...(decisionId ? { decisionId } : {}),
  };
}

function parseBindingMap(value: unknown): Record<string, PracticalFieldBindingInput> | null {
  if (!isRecord(value) || Object.keys(value).length > MAX_DRAFT_IDENTITIES) return null;
  const result: Record<string, PracticalFieldBindingInput> = {};
  for (const [identity, raw] of Object.entries(value)) {
    const input = parseBindingInput(raw);
    if (!boundedIdentity(identity) || !input) return null;
    result[identity] = input;
  }
  return result;
}

function parsePostCapture(value: unknown): RealHandPostCaptureDrafts | null {
  if (!isRecord(value)) return null;
  const allowed = new Set([
    "resultByNoteId",
    "showdownByNoteId",
    "reviewNoteByNoteId",
    "reviewerKindByNoteId",
    "practicalBindingByNoteId",
    "explainReviewByRecordId",
  ]);
  if (Object.keys(value).some((key) => !allowed.has(key))) return null;
  const resultByNoteId = parseTextMap(value.resultByNoteId);
  const showdownByNoteId = parseTextMap(value.showdownByNoteId);
  const reviewNoteByNoteId = parseTextMap(value.reviewNoteByNoteId);
  const reviewerKindByNoteId = parseReviewerMap(value.reviewerKindByNoteId);
  const practicalBindingByNoteId = parseBindingMap(value.practicalBindingByNoteId);
  const explainReviewByRecordId = parseTextMap(value.explainReviewByRecordId);
  if (!resultByNoteId || !showdownByNoteId || !reviewNoteByNoteId || !reviewerKindByNoteId || !practicalBindingByNoteId || !explainReviewByRecordId) return null;
  return { resultByNoteId, showdownByNoteId, reviewNoteByNoteId, reviewerKindByNoteId, practicalBindingByNoteId, explainReviewByRecordId };
}

export function parseRealHandDraftWorkspace(value: unknown): RealHandDraftWorkspace | null {
  if (isRecord(value) && value.version === REAL_HAND_DRAFT_WORKSPACE_VERSION) {
    if (Object.keys(value).some((key) => !["version", "capture", "postCapture"].includes(key))) return null;
    const capture = parseCapture(value.capture);
    const postCapture = parsePostCapture(value.postCapture);
    return capture && postCapture ? { version: REAL_HAND_DRAFT_WORKSPACE_VERSION, capture, postCapture } : null;
  }
  const legacyCapture = parseCapture(value);
  return legacyCapture ? { version: REAL_HAND_DRAFT_WORKSPACE_VERSION, capture: legacyCapture, postCapture: emptyRealHandPostCaptureDrafts() } : null;
}

function filterMap<T>(source: Record<string, T>, allowed: Set<string>): Record<string, T> {
  return Object.fromEntries(Object.entries(source).filter(([identity]) => allowed.has(identity)));
}

export function sanitizeRealHandDraftWorkspace(workspace: RealHandDraftWorkspace, state: LearnerState): RealHandDraftWorkspace {
  const notes = state.fieldNotes as StructuredFieldNote[];
  const resultDraftIds = new Set(notes.filter((note) => Boolean(note.decisionLockedAt) && !note.result).map((note) => note.id));
  const reviewDraftIds = new Set(notes.filter((note) => note.status === "PENDING_REVIEW").map((note) => note.id));
  const explainDraftIds = new Set(explainBackRecords(state).filter((record) => record.status === "PENDING_REVIEW").map((record) => record.id));
  return {
    version: REAL_HAND_DRAFT_WORKSPACE_VERSION,
    capture: workspace.capture,
    postCapture: {
      resultByNoteId: filterMap(workspace.postCapture.resultByNoteId, resultDraftIds),
      showdownByNoteId: filterMap(workspace.postCapture.showdownByNoteId, resultDraftIds),
      reviewNoteByNoteId: filterMap(workspace.postCapture.reviewNoteByNoteId, reviewDraftIds),
      reviewerKindByNoteId: filterMap(workspace.postCapture.reviewerKindByNoteId, reviewDraftIds),
      practicalBindingByNoteId: filterMap(workspace.postCapture.practicalBindingByNoteId, reviewDraftIds),
      explainReviewByRecordId: filterMap(workspace.postCapture.explainReviewByRecordId, explainDraftIds),
    },
  };
}

function hasCaptureContent(hand: FieldHandInput): boolean {
  return String(hand.moduleId).trim() !== ""
    || DRAFT_STRING_FIELDS.some((key) => String(hand[key] ?? "").trim() !== "")
    || hand.confidence !== 65
    || (hand.populationReadConfidence ?? 50) !== 50;
}

function hasPostCaptureContent(post: RealHandPostCaptureDrafts): boolean {
  return Object.values(post).some((map) => Object.keys(map).length > 0);
}

export function persistRealHandDraftWorkspace(workspace: RealHandDraftWorkspace): boolean {
  if (!hasCaptureContent(workspace.capture) && !hasPostCaptureContent(workspace.postCapture)) {
    clearUiStorage(REAL_HAND_DRAFT_KEY);
    return true;
  }
  return writeProfileScopedUiValue(REAL_HAND_DRAFT_KEY, workspace);
}

export function readRealHandDraftWorkspace(state: LearnerState): RealHandDraftWorkspace {
  const restored = readProfileScopedUiValue(REAL_HAND_DRAFT_KEY, REAL_HAND_DRAFT_TTL_MS, parseRealHandDraftWorkspace);
  if (!restored) return emptyRealHandDraftWorkspace();
  const sanitized = sanitizeRealHandDraftWorkspace(restored, state);
  if (JSON.stringify(sanitized) !== JSON.stringify(restored)) persistRealHandDraftWorkspace(sanitized);
  return sanitized;
}

export function patchRealHandCapture(workspace: RealHandDraftWorkspace, patch: Partial<FieldHandInput>): RealHandDraftWorkspace {
  return { ...workspace, capture: { ...workspace.capture, ...patch } };
}

export function patchRealHandPostCaptureText(
  workspace: RealHandDraftWorkspace,
  field: "resultByNoteId" | "showdownByNoteId" | "reviewNoteByNoteId" | "explainReviewByRecordId",
  identity: string,
  value: string,
): RealHandDraftWorkspace {
  return {
    ...workspace,
    postCapture: {
      ...workspace.postCapture,
      [field]: { ...workspace.postCapture[field], [identity]: value },
    },
  };
}

export function patchRealHandReviewerKind(workspace: RealHandDraftWorkspace, noteId: string, reviewerKind: FieldReviewerKind): RealHandDraftWorkspace {
  return {
    ...workspace,
    postCapture: {
      ...workspace.postCapture,
      reviewerKindByNoteId: { ...workspace.postCapture.reviewerKindByNoteId, [noteId]: reviewerKind },
    },
  };
}

export function patchRealHandBindingInput(workspace: RealHandDraftWorkspace, noteId: string, input: PracticalFieldBindingInput): RealHandDraftWorkspace {
  return {
    ...workspace,
    postCapture: {
      ...workspace.postCapture,
      practicalBindingByNoteId: { ...workspace.postCapture.practicalBindingByNoteId, [noteId]: input },
    },
  };
}

function withoutIdentity<T>(source: Record<string, T>, identity: string): Record<string, T> {
  const next = { ...source };
  delete next[identity];
  return next;
}

export function clearRealHandCapture(workspace: RealHandDraftWorkspace): RealHandDraftWorkspace {
  return { ...workspace, capture: emptyRealHandCapture() };
}

export function clearAcknowledgedRealHandPostCaptureDraft(workspace: RealHandDraftWorkspace, pending: PendingRealHandDraftMutation): RealHandDraftWorkspace {
  const post = workspace.postCapture;
  if (pending.kind === "RESULT") {
    return {
      ...workspace,
      postCapture: {
        ...post,
        resultByNoteId: withoutIdentity(post.resultByNoteId, pending.identity),
        showdownByNoteId: withoutIdentity(post.showdownByNoteId, pending.identity),
      },
    };
  }
  if (pending.kind === "REVIEW") {
    return {
      ...workspace,
      postCapture: {
        ...post,
        reviewNoteByNoteId: withoutIdentity(post.reviewNoteByNoteId, pending.identity),
        reviewerKindByNoteId: withoutIdentity(post.reviewerKindByNoteId, pending.identity),
        practicalBindingByNoteId: withoutIdentity(post.practicalBindingByNoteId, pending.identity),
      },
    };
  }
  return {
    ...workspace,
    postCapture: {
      ...post,
      explainReviewByRecordId: withoutIdentity(post.explainReviewByRecordId, pending.identity),
    },
  };
}

function durabilityAdvanced(pending: PendingRealHandDraftMutation, lastLocalSaveAt: string | null): boolean {
  if (!lastLocalSaveAt || lastLocalSaveAt === pending.previousLocalSaveAt) return false;
  const acknowledgement = Date.parse(lastLocalSaveAt);
  const target = Date.parse(pending.updatedAt);
  return Number.isFinite(acknowledgement) && Number.isFinite(target) && acknowledgement >= target;
}

export function isRealHandDraftMutationAcknowledged(
  state: LearnerState,
  pending: PendingRealHandDraftMutation,
  lastLocalSaveAt: string | null,
): boolean {
  if (!durabilityAdvanced(pending, lastLocalSaveAt) || state.revision < pending.revision) return false;
  if (pending.kind === "RESULT") {
    const note = (state.fieldNotes as StructuredFieldNote[]).find((row) => row.id === pending.identity);
    return Boolean(note && note.result === pending.result.trim() && (note.showdown ?? "") === pending.showdown.trim());
  }
  if (pending.kind === "REVIEW") {
    const note = (state.fieldNotes as StructuredFieldNote[]).find((row) => row.id === pending.identity);
    return Boolean(note
      && note.reviewedAt === pending.reviewedAt
      && note.reviewerKind === pending.reviewerKind
      && note.evaluatorNote === pending.reviewerNote.trim());
  }
  const record = explainBackRecords(state).find((row) => row.id === pending.identity);
  return Boolean(record
    && record.reviewedAt === pending.reviewedAt
    && record.status === pending.status
    && record.reviewerNote === pending.reviewerNote.trim());
}
