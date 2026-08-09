import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readFile } from "node:fs/promises";
import test from "node:test";

const execFileAsync = promisify(execFile);
const appRoot = new URL("../", import.meta.url);

test("test invite migrations are test-only and store only a hash", async () => {
  const [migration, learnerStates, seed] = await Promise.all([
    readFile(new URL("../test-invites/migrations/0001_test_invites.sql", import.meta.url), "utf8"),
    readFile(new URL("../test-invites/migrations/0000_test_learner_states.sql", import.meta.url), "utf8"),
    readFile(new URL("../test-invites/migrations/0002_test_invite_seed.sql", import.meta.url), "utf8"),
  ]);
  assert.match(migration, /CREATE TABLE IF NOT EXISTS test_invites/);
  assert.match(migration, /code_hash TEXT NOT NULL UNIQUE/);
  assert.match(migration, /Never apply this migration to the production D1 database/);
  assert.doesNotMatch(migration, /INSERT INTO/);
  assert.match(learnerStates, /CREATE TABLE IF NOT EXISTS learner_states/);
  assert.match(learnerStates, /Never apply this migration to the production D1 database/);
  assert.match(seed, /INSERT OR IGNORE INTO test_invites/);
  assert.match(seed, /Never apply this migration to the production D1 database/);
  assert.doesNotMatch(seed, /LCO-TEST-/);
});

test("invite generator emits the requested labels, opaque codes, and hash-only SQL", async () => {
  const { stdout } = await execFileAsync(process.execPath, ["scripts/generate-test-invite-codes.mjs", "--count=5"], {
    cwd: appRoot,
  });
  const generated = JSON.parse(stdout);
  assert.equal(generated.invites.length, 5);
  assert.deepEqual(generated.invites.map((invite) => invite.label), ["tester-01", "tester-02", "tester-03", "tester-04", "tester-05"]);
  for (const invite of generated.invites) {
    assert.match(invite.code, /^LCO-TEST-[A-Z0-9_-]{20,80}$/);
    assert.doesNotMatch(generated.sql, new RegExp(invite.code));
  }
  assert.match(generated.sql, /INSERT INTO test_invites/);
  assert.match(generated.sql, /code_hash/);
});

test("test mirror uses exactly the dedicated TEST_DB binding and invite gate", async () => {
  const [viteConfig, stateRoute, db] = await Promise.all([
    readFile(new URL("../vite.config.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/state/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../db/index.ts", import.meta.url), "utf8"),
  ]);
  assert.match(viteConfig, /binding:\s*"TEST_DB"/);
  assert.match(viteConfig, /TEST_INVITE_MODE:\s*"true"/);
  assert.doesNotMatch(viteConfig, /testMirrorWorkerConfig[\s\S]*binding:\s*d1/);
  assert.match(stateRoute, /eq\(testInvites\.codeHash, profile\.codeHash\)/);
  assert.match(stateRoute, /isTestInviteMode\(\)[\s\S]*activeTestInvite/);
  assert.match(db, /TEST_DB\?: D1Database/);
  assert.match(db, /bindings\.TEST_DB \?\? bindings\.DB/);
});
