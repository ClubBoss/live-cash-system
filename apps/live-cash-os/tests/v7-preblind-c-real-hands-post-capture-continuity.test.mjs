import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  REAL_HAND_DRAFT_TTL_MS,
  REAL_HAND_DRAFT_WORKSPACE_VERSION,
  clearAcknowledgedRealHandPostCaptureDraft,
  emptyRealHandDraftWorkspace,
  isRealHandDraftMutationAcknowledged,
  parseRealHandDraftWorkspace,
  patchRealHandBindingInput,
  patchRealHandCapture,
  patchRealHandPostCaptureText,
  patchRealHandReviewerKind,
  persistRealHandDraftWorkspace,
  readRealHandDraftWorkspace,
  sanitizeRealHandDraftWorkspace,
} from "../lib/real-hand-draft-continuity.ts";
import { PORTABLE_PROFILE_KEY } from "../lib/profile-storage.ts";
import { REAL_HAND_DRAFT_KEY } from "../lib/ui-session-storage.ts";

class MemoryStorage {
  #map = new Map();
  getItem(key) { return this.#map.has(key) ? this.#map.get(key) : null; }
  setItem(key, value) { this.#map.set(String(key), String(value)); }
  removeItem(key) { this.#map.delete(key); }
  clear() { this.#map.clear(); }
}

const minimalState = (overrides = {}) => ({
  revision: 7,
  updatedAt: "2026-08-26T08:00:00.000Z",
  fieldNotes: [],
  explainBackRecords: [],
  ...overrides,
});

function populatedWorkspace() {
  let workspace = emptyRealHandDraftWorkspace();
  workspace = patchRealHandCapture(workspace, { moduleId: "LCM-01", stakes: "2/5" });
  workspace = patchRealHandPostCaptureText(workspace, "resultByNoteId", "field-1", "+$240");
  workspace = patchRealHandPostCaptureText(workspace, "showdownByNoteId", "field-1", "AhKh");
  workspace = patchRealHandPostCaptureText(workspace, "reviewNoteByNoteId", "field-1", "Check whether turn pressure was real.");
  workspace = patchRealHandReviewerKind(workspace, "field-1", "HUMAN");
  workspace = patchRealHandBindingInput(workspace, "field-1", {
    practicalSkillId: "BL-01",
    signals: { street: "preflop", blindIssue: true },
    decisionId: "PM-BL-01-101",
  });
  workspace = patchRealHandPostCaptureText(workspace, "explainReviewByRecordId", "explain-1", "The key signal was stack geometry.");
  return workspace;
}

test("V7 C workspace accepts legacy capture and rejects incompatible schema", () => {
  const legacy = emptyRealHandDraftWorkspace().capture;
  const migrated = parseRealHandDraftWorkspace({ ...legacy, moduleId: "LCM-01", stakes: "1/3" });
  assert.equal(migrated?.version, REAL_HAND_DRAFT_WORKSPACE_VERSION);
  assert.equal(migrated?.capture.stakes, "1/3");
  assert.deepEqual(migrated?.postCapture.resultByNoteId, {});

  const invalid = populatedWorkspace();
  invalid.postCapture.reviewerKindByNoteId["field-1"] = "ROBOT";
  assert.equal(parseRealHandDraftWorkspace(invalid), null);
});

test("V7 C semantic identities hydrate only while their canonical record remains compatible", () => {
  const workspace = populatedWorkspace();
  const state = minimalState({
    fieldNotes: [
      { id: "field-1", decisionLockedAt: "2026-08-26T07:00:00.000Z", status: "PENDING_REVIEW" },
      { id: "field-done", decisionLockedAt: "2026-08-26T06:00:00.000Z", result: "+1", status: "REVIEWED_VALID" },
    ],
    explainBackRecords: [
      { id: "explain-1", status: "PENDING_REVIEW" },
      { id: "explain-done", status: "REVIEWED_OK" },
    ],
  });
  const polluted = {
    ...workspace,
    postCapture: {
      ...workspace.postCapture,
      resultByNoteId: { ...workspace.postCapture.resultByNoteId, "field-done": "stale" },
      reviewNoteByNoteId: { ...workspace.postCapture.reviewNoteByNoteId, "field-done": "stale" },
      explainReviewByRecordId: { ...workspace.postCapture.explainReviewByRecordId, "explain-done": "stale" },
    },
  };
  const sanitized = sanitizeRealHandDraftWorkspace(polluted, state);
  assert.equal(sanitized.postCapture.resultByNoteId["field-1"], "+$240");
  assert.equal(sanitized.postCapture.reviewNoteByNoteId["field-1"], "Check whether turn pressure was real.");
  assert.equal(sanitized.postCapture.explainReviewByRecordId["explain-1"], "The key signal was stack geometry.");
  assert.equal(sanitized.postCapture.resultByNoteId["field-done"], undefined);
  assert.equal(sanitized.postCapture.reviewNoteByNoteId["field-done"], undefined);
  assert.equal(sanitized.postCapture.explainReviewByRecordId["explain-done"], undefined);
});

test("V7 C profile mismatch and TTL expiry fail closed through the existing Real Hand draft key", () => {
  const original = globalThis.localStorage;
  const storage = new MemoryStorage();
  globalThis.localStorage = storage;
  try {
    storage.setItem(PORTABLE_PROFILE_KEY, "LCO-AAAAAAAAAAAAAAAAAAAA");
    assert.equal(persistRealHandDraftWorkspace(populatedWorkspace()), true);
    assert.ok(storage.getItem(REAL_HAND_DRAFT_KEY));

    storage.setItem(PORTABLE_PROFILE_KEY, "LCO-BBBBBBBBBBBBBBBBBBBB");
    const isolated = readRealHandDraftWorkspace(minimalState());
    assert.equal(isolated.capture.stakes, "");
    assert.deepEqual(isolated.postCapture.resultByNoteId, {});
    assert.equal(storage.getItem(REAL_HAND_DRAFT_KEY), null);

    storage.setItem(PORTABLE_PROFILE_KEY, "LCO-AAAAAAAAAAAAAAAAAAAA");
    assert.equal(persistRealHandDraftWorkspace(populatedWorkspace()), true);
    const envelope = JSON.parse(storage.getItem(REAL_HAND_DRAFT_KEY));
    envelope.updatedAt = Date.now() - REAL_HAND_DRAFT_TTL_MS - 1;
    storage.setItem(REAL_HAND_DRAFT_KEY, JSON.stringify(envelope));
    const expired = readRealHandDraftWorkspace(minimalState());
    assert.equal(expired.capture.stakes, "");
    assert.deepEqual(expired.postCapture.reviewNoteByNoteId, {});
    assert.equal(storage.getItem(REAL_HAND_DRAFT_KEY), null);
  } finally {
    if (original === undefined) delete globalThis.localStorage;
    else globalThis.localStorage = original;
  }
});

test("V7 C draft edits are evidence-free and selective cleanup waits for durable canonical acknowledgement", () => {
  const stateBefore = minimalState({
    fieldNotes: [{ id: "field-1", decisionLockedAt: "2026-08-26T07:00:00.000Z", status: "PENDING_REVIEW" }],
    explainBackRecords: [{ id: "explain-1", status: "PENDING_REVIEW" }],
    interactions: [{ id: "existing-evidence" }],
    reviewQueue: [{ id: "existing-review" }],
  });
  const stateSnapshot = structuredClone(stateBefore);
  const workspace = populatedWorkspace();
  assert.deepEqual(stateBefore, stateSnapshot, "draft composition must not mutate canonical learner/evidence state");

  const resultPending = {
    kind: "RESULT",
    identity: "field-1",
    revision: 8,
    updatedAt: "2026-08-26T08:01:00.000Z",
    previousLocalSaveAt: "2026-08-26T08:00:00.000Z",
    result: "+$240",
    showdown: "AhKh",
  };
  const resultState = minimalState({
    revision: 8,
    updatedAt: "2026-08-26T08:01:00.000Z",
    fieldNotes: [{ id: "field-1", decisionLockedAt: "2026-08-26T07:00:00.000Z", status: "PENDING_REVIEW", result: "+$240", showdown: "AhKh" }],
  });
  assert.equal(isRealHandDraftMutationAcknowledged(resultState, resultPending, "2026-08-26T08:00:00.000Z"), false);
  assert.equal(isRealHandDraftMutationAcknowledged(resultState, resultPending, null), false);
  assert.equal(isRealHandDraftMutationAcknowledged(resultState, resultPending, "2026-08-26T08:01:01.000Z"), true);
  const afterResult = clearAcknowledgedRealHandPostCaptureDraft(workspace, resultPending);
  assert.equal(afterResult.postCapture.resultByNoteId["field-1"], undefined);
  assert.equal(afterResult.postCapture.showdownByNoteId["field-1"], undefined);
  assert.ok(afterResult.postCapture.reviewNoteByNoteId["field-1"]);
  assert.ok(afterResult.postCapture.explainReviewByRecordId["explain-1"]);

  const reviewPending = {
    kind: "REVIEW",
    identity: "field-1",
    revision: 9,
    updatedAt: "2026-08-26T08:02:00.000Z",
    previousLocalSaveAt: "2026-08-26T08:01:01.000Z",
    reviewerKind: "HUMAN",
    reviewerNote: "Check whether turn pressure was real.",
    reviewedAt: "2026-08-26T08:02:00.000Z",
  };
  const reviewState = minimalState({
    revision: 9,
    updatedAt: "2026-08-26T08:02:00.000Z",
    fieldNotes: [{ id: "field-1", status: "REVIEWED_VALID", reviewerKind: "HUMAN", evaluatorNote: reviewPending.reviewerNote, reviewedAt: reviewPending.reviewedAt }],
  });
  assert.equal(isRealHandDraftMutationAcknowledged(reviewState, reviewPending, "2026-08-26T08:02:01.000Z"), true);
  const afterReview = clearAcknowledgedRealHandPostCaptureDraft(workspace, reviewPending);
  assert.equal(afterReview.postCapture.reviewNoteByNoteId["field-1"], undefined);
  assert.equal(afterReview.postCapture.reviewerKindByNoteId["field-1"], undefined);
  assert.equal(afterReview.postCapture.practicalBindingByNoteId["field-1"], undefined);
});

test("V7 C authority stays on the existing profile-scoped key and contains no evidence mutation API", () => {
  const continuity = readFileSync(new URL("../lib/real-hand-draft-continuity.ts", import.meta.url), "utf8");
  const uiStorage = readFileSync(new URL("../lib/ui-session-storage.ts", import.meta.url), "utf8");
  assert.match(continuity, /REAL_HAND_DRAFT_KEY/);
  assert.match(continuity, /readProfileScopedUiValue/);
  assert.match(continuity, /writeProfileScopedUiValue/);
  assert.doesNotMatch(continuity, /localStorage\.(?:setItem|getItem|removeItem)/);
  assert.doesNotMatch(continuity, /recordPracticalDecision|markPracticalRealHandTransfer|reviewFieldHand\(|addFieldResult\(|reviewExplainBack\(/);
  assert.match(uiStorage, /profileMarker/);
  assert.match(uiStorage, /parsed\.profileMarker !== currentUiProfileMarker\(\)/);
  assert.equal(REAL_HAND_DRAFT_KEY, "live-cash-os:real-hand-draft:v1");
});
