import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const route = await readFile(new URL("../app/api/state/route.ts", import.meta.url), "utf8");
const hook = await readFile(new URL("../lib/use-learner-state-sync.ts", import.meta.url), "utf8");

test("state API uses an opaque conditional token instead of learner timestamps for CAS", () => {
  assert.match(route, /function cloudToken\(\)/);
  assert.match(route, /crypto\.randomUUID\(\)/);
  assert.match(route, /baseCloudToken/);
  assert.match(route, /eq\(learnerStates\.updatedAt, record\.cloudToken\)/);
  assert.doesNotMatch(route, /existingTime\s*=\s*Date\.parse/);
  assert.doesNotMatch(route, /incomingTime\s*=\s*Date\.parse/);
});

test("concurrent first writes and updates are conditional rather than blind upserts", () => {
  assert.match(route, /onConflictDoNothing\(\{ target: learnerStates\.userId \}\)/);
  assert.match(route, /if \(\(inserted\.meta\?\.changes \?\? 0\) !== 1\) return conflictFromLatest/);
  assert.match(route, /if \(\(updated\.meta\?\.changes \?\? 0\) !== 1\) return conflictFromLatest/);
});

test("cloud deletion is represented by a durable tombstone and stale POST receives 410", () => {
  assert.match(route, /cloud-deleted-v1/);
  assert.match(route, /if \(!resumeCloudSync\)/);
  assert.match(route, /CLOUD_STATE_DELETED/);
  assert.match(route, /}, 410\)/);
  assert.match(hook, /cloudDisabled\.current = true/);
  assert.match(hook, /resumeCloudSync: true/);
});

test("API responses carry runtime identity and malformed cloud state is not overwritten", () => {
  assert.match(route, /runtime: CURRENT_RUNTIME/);
  assert.match(route, /CLOUD_STATE_UNREADABLE/);
  assert.match(route, /Existing cloud state cannot be read safely; refusing to overwrite it/);
  assert.match(hook, /runtimeCompatible\(payload\.runtime\)/);
  assert.match(hook, /UPDATE_REQUIRED/);
});

test("client persists conflict and recovery snapshots locally", () => {
  assert.match(hook, /live-cash-os:recovery-backup/);
  assert.match(hook, /live-cash-os:pre-import-backup/);
  assert.match(hook, /live-cash-os:sync-conflict/);
  assert.match(hook, /rememberConflict/);
});
