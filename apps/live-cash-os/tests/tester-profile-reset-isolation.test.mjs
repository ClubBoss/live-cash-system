import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const [gate, dataSafety] = await Promise.all([
  readFile(new URL("../components/TestInviteGate.tsx", import.meta.url), "utf8"),
  readFile(new URL("../components/DataSafetyPanel.tsx", import.meta.url), "utf8"),
]);

test("switching a verified tester code clears prior profile-local learner snapshots", () => {
  for (const key of [
    "LEARNER_STORAGE_KEY",
    "SYNC_META_KEY",
    "RECOVERY_BACKUP_KEY",
    "IMPORT_BACKUP_KEY",
    "CONFLICT_BACKUP_KEY",
  ]) {
    assert.match(gate, new RegExp(`\\b${key}\\b`));
  }
  assert.match(gate, /const PROFILE_LOCAL_STATE_KEYS = \[[\s\S]*LEARNER_STORAGE_KEY[\s\S]*SYNC_META_KEY[\s\S]*RECOVERY_BACKUP_KEY[\s\S]*IMPORT_BACKUP_KEY[\s\S]*CONFLICT_BACKUP_KEY[\s\S]*\] as const/);
  assert.match(gate, /if \(previous !== code\) clearPreviousProfileLocalState\(\)/);
  assert.match(gate, /for \(const key of PROFILE_LOCAL_STATE_KEYS\) localStorage\.removeItem\(key\)/);

  const clearAt = gate.indexOf("clearPreviousProfileLocalState();");
  const profileWriteAt = gate.indexOf("localStorage.setItem(PORTABLE_PROFILE_KEY, code)");
  assert.ok(clearAt >= 0 && profileWriteAt > clearAt, "old learner state must be cleared before the new profile code becomes active");
  assert.doesNotMatch(gate, /localStorage\.removeItem\(PORTABLE_PROFILE_KEY\)/);
});

test("reloading the same tester code preserves its local learner snapshot", () => {
  assert.match(gate, /if \(previous !== code\) clearPreviousProfileLocalState\(\)/);
  assert.doesNotMatch(gate, /clearPreviousProfileLocalState\(\);\s*localStorage\.setItem\(PORTABLE_PROFILE_KEY, code\)/);
});

test("full progress reset is fail-closed and only clears local data after cloud deletion succeeds", () => {
  assert.match(dataSafety, /async function eraseAllProgress\(\)/);
  assert.match(dataSafety, /Стереть весь прогресс этого профиля и начать с нуля/);
  assert.match(dataSafety, /Erase all progress for this profile and start from zero/);
  assert.match(dataSafety, /if \(cloudMode === "cloud"\) \{[\s\S]*const deleted = await deleteCloud\(\);[\s\S]*if \(!deleted\) \{[\s\S]*return;[\s\S]*\}[\s\S]*\}/);
  assert.match(dataSafety, /const reset = await resetLocal\(\)/);

  const deleteAt = dataSafety.indexOf("const deleted = await deleteCloud();");
  const resetAt = dataSafety.indexOf("const reset = await resetLocal();");
  assert.ok(deleteAt >= 0 && resetAt > deleteAt, "cloud deletion must precede destructive local reset");
  assert.match(dataSafety, /window\.location\.reload\(\)/);
  assert.match(dataSafety, /Стереть весь прогресс/);
  assert.match(dataSafety, /удаляет данные только текущего профиля/);
});
