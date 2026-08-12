import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  CONFLICT_BACKUP_KEY,
  IMPORT_BACKUP_KEY,
  LEARNER_STORAGE_KEY,
  RECOVERY_BACKUP_KEY,
  SYNC_META_KEY,
  profileStorageKey,
} from "../lib/profile-storage.ts";

const [gate, dataSafety, syncSource] = await Promise.all([
  readFile(new URL("../components/TestInviteGate.tsx", import.meta.url), "utf8"),
  readFile(new URL("../components/DataSafetyPanel.tsx", import.meta.url), "utf8"),
  readFile(new URL("../lib/use-learner-state-sync.ts", import.meta.url), "utf8"),
]);

const PROFILE_A = "LCO-TEST-AAAAAAAAAAAAAAAAAAAA";
const PROFILE_B = "LCO-TEST-BBBBBBBBBBBBBBBBBBBB";
const ACCOUNT_KEYS = [
  LEARNER_STORAGE_KEY,
  SYNC_META_KEY,
  RECOVERY_BACKUP_KEY,
  IMPORT_BACKUP_KEY,
  CONFLICT_BACKUP_KEY,
];

test("tester profiles use distinct local namespaces without putting the access code in storage keys", () => {
  for (const baseKey of ACCOUNT_KEYS) {
    const a = profileStorageKey(baseKey, PROFILE_A);
    const b = profileStorageKey(baseKey, PROFILE_B);
    assert.notEqual(a, b);
    assert.notEqual(a, baseKey);
    assert.notEqual(b, baseKey);
    assert.equal(a.includes(PROFILE_A), false);
    assert.equal(b.includes(PROFILE_B), false);
  }
});

test("all learner, sync and recovery persistence follows the active profile namespace", () => {
  for (const key of [
    "LEARNER_STORAGE_KEY",
    "SYNC_META_KEY",
    "RECOVERY_BACKUP_KEY",
    "IMPORT_BACKUP_KEY",
    "CONFLICT_BACKUP_KEY",
  ]) {
    assert.match(syncSource, new RegExp(`accountKey\\(${key}\\)`));
  }
  assert.match(syncSource, /profileStorageKey\(baseKey, portableProfileCode\.current\)/);
  assert.match(syncSource, /claimLegacyProfileStorage\(portableProfileCode\.current\)/);
  assert.match(syncSource, /PROFILE_STORAGE_MIGRATION_KEY/);
});

test("verified tester-code switching clears only legacy unscoped state, not another profile namespace", () => {
  assert.match(gate, /const PROFILE_LOCAL_STATE_KEYS = \[[\s\S]*LEARNER_STORAGE_KEY[\s\S]*SYNC_META_KEY[\s\S]*RECOVERY_BACKUP_KEY[\s\S]*IMPORT_BACKUP_KEY[\s\S]*CONFLICT_BACKUP_KEY[\s\S]*\] as const/);
  assert.match(gate, /for \(const key of PROFILE_LOCAL_STATE_KEYS\) localStorage\.removeItem\(key\)/);
  assert.doesNotMatch(gate, /profileStorageKey/);
  assert.doesNotMatch(gate, /:profile:/);

  const clearAt = gate.indexOf("clearPreviousProfileLocalState();");
  const profileWriteAt = gate.indexOf("localStorage.setItem(PORTABLE_PROFILE_KEY, code)");
  assert.ok(clearAt >= 0 && profileWriteAt > clearAt, "legacy ambiguous state must be cleared before a fresh tester code becomes active");
});

test("disconnecting a profile preserves a safe local-only continuation instead of deleting learner progress", () => {
  assert.match(syncSource, /const disconnectPortableProfile = useCallback\(\(\) => \{[\s\S]*safeSet\(LEARNER_STORAGE_KEY, serialized\)/);
  assert.match(syncSource, /safeSet\(SYNC_META_KEY, JSON\.stringify\(\{ \.\.\.EMPTY_SYNC_META, cloudDisabled: true \}\)\)/);
  assert.match(syncSource, /safeRemove\(PORTABLE_PROFILE_KEY\)/);
  assert.match(syncSource, /window\.location\.reload\(\)/);
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
