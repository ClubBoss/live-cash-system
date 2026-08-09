import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  deriveDiagnosticContinuation,
  deriveLessonSkillTruth,
  deriveLessonStep,
  deriveSessionSaveState,
  localSaveAcknowledged,
} from "../lib/session-clarity.ts";

test("session clarity helper stays pure and owns no learner-facing copy", async () => {
  const source = await readFile(new URL("../lib/session-clarity.ts", import.meta.url), "utf8");
  assert.doesNotMatch(source, /runtimeCopy/);
  assert.doesNotMatch(source, /[А-Яа-яЁё]/);
  assert.doesNotMatch(source, /Saved|Saving|Lesson|Skill|Diagnostic/);
});

test("lesson completion and repair-required skill remain separate state truths", () => {
  assert.deepEqual(deriveLessonSkillTruth(true, "REPAIR_REQUIRED"), {
    contentCompleted: true,
    skillState: "REPAIR_REQUIRED",
    explainRepair: true,
  });
  assert.deepEqual(deriveLessonSkillTruth(true, "INTRODUCED"), {
    contentCompleted: true,
    skillState: "INTRODUCED",
    explainRepair: false,
  });
  assert.deepEqual(deriveLessonSkillTruth(false, "REPAIR_REQUIRED"), {
    contentCompleted: false,
    skillState: "REPAIR_REQUIRED",
    explainRepair: false,
  });
});

test("lesson step derivation uses the actual zero-based lesson step", () => {
  assert.deepEqual(deriveLessonStep(0), { step: 1, total: 10 });
  assert.deepEqual(deriveLessonStep(4), { step: 5, total: 10 });
  assert.deepEqual(deriveLessonStep(9), { step: 10, total: 10 });
});

test("session save state requires acknowledgement of the current learner mutation", () => {
  const current = "2026-08-10T01:00:02.000Z";
  const staleAck = "2026-08-10T01:00:01.000Z";
  const currentAck = "2026-08-10T01:00:02.100Z";

  assert.equal(localSaveAcknowledged(current, staleAck), false);
  assert.equal(localSaveAcknowledged(current, currentAck), true);
  assert.equal(deriveSessionSaveState("synced", null, current, staleAck), "saving");
  assert.equal(deriveSessionSaveState("local", null, current, currentAck), "saved_local");
  assert.equal(deriveSessionSaveState("synced", null, current, currentAck), "saved");
  assert.equal(deriveSessionSaveState("syncing", null, current, currentAck), "saved_syncing");
  assert.equal(deriveSessionSaveState("offline", null, current, staleAck), "saving");
  assert.equal(deriveSessionSaveState("offline", null, current, currentAck), "offline_saved_local");
  assert.equal(deriveSessionSaveState("conflict", "STATE_CONFLICT", current, currentAck), "sync_needed");
  assert.equal(deriveSessionSaveState("error", "UPDATE_REQUIRED", current, currentAck), "attention");
  assert.equal(deriveSessionSaveState("error", "LOCAL_WRITE_FAILED", current, currentAck), "failed");
});

test("in-progress Diagnostic exposes saved count and next question without changing status", () => {
  assert.deepEqual(deriveDiagnosticContinuation("IN_PROGRESS", 3), {
    savedResponses: 3,
    nextQuestion: 4,
  });
  assert.equal(deriveDiagnosticContinuation("AWAITING_REVIEW", 10), null);
});
