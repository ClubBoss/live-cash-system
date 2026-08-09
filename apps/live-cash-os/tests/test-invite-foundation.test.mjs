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
  const [viteConfig, stateRoute, db, gate, page] = await Promise.all([
    readFile(new URL("../vite.config.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/state/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../db/index.ts", import.meta.url), "utf8"),
    readFile(new URL("../components/TestInviteGate.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(viteConfig, /binding:\s*"TEST_DB"/);
  assert.match(viteConfig, /TEST_INVITE_MODE:\s*"true"/);
  assert.match(viteConfig, /__LIVE_CASH_TEST_INVITE_MODE__/);
  assert.doesNotMatch(viteConfig, /testMirrorWorkerConfig[\s\S]*binding:\s*d1/);
  assert.match(stateRoute, /eq\(testInvites\.codeHash, profile\.codeHash\)/);
  assert.match(stateRoute, /isTestInviteMode\(\)[\s\S]*ensureTestMirrorSchema\(\)[\s\S]*activeTestInvite/);
  assert.match(db, /TEST_DB\?: D1Database/);
  assert.match(db, /bindings\.TEST_DB \?\? bindings\.DB/);
  assert.match(gate, /if \(!enabled\) return <>\{children\}<\/>/);
  assert.match(gate, /headers: \{ \[PROFILE_HEADER\]: code \}/);
  assert.match(gate, /До подтверждения доступ к обучению и локальному прогрессу закрыт/);
  assert.match(page, /return <TestInviteGate>/);
  assert.match(page, /<Gauntlet4LearningIntegrityLayer \/>/);
  assert.match(page, /<\/TestInviteGate>/);
});

test("isolated TEST_DB bootstrap is idempotent, hash-only and production-safe", async () => {
  const [db, seed, workflow, smoke] = await Promise.all([
    readFile(new URL("../db/index.ts", import.meta.url), "utf8"),
    readFile(new URL("../test-invites/migrations/0002_test_invite_seed.sql", import.meta.url), "utf8"),
    readFile(new URL("../../../.github/workflows/live-cash-os-ci.yml", import.meta.url), "utf8"),
    readFile(new URL("../scripts/production-smoke.mjs", import.meta.url), "utf8"),
  ]);
  assert.match(db, /export async function ensureTestMirrorSchema/);
  assert.match(db, /const database = runtimeBindings\(\)\.TEST_DB/);
  assert.match(db, /if \(!database\) return/);
  assert.match(db, /CREATE TABLE IF NOT EXISTS learner_states/);
  assert.match(db, /CREATE TABLE IF NOT EXISTS test_invites/);
  assert.match(db, /INSERT OR IGNORE INTO test_invites/);
  assert.doesNotMatch(db, /LCO-TEST-/);

  const seedHashes = [...seed.matchAll(/'([a-f0-9]{64})'/g)].map((match) => match[1]);
  for (const hash of seedHashes) assert.match(db, new RegExp(hash));
  assert.equal(seedHashes.length, 5);

  assert.doesNotMatch(workflow, /wrangler d1 execute/);
  assert.match(workflow, /TEST_DB bootstrap\/invite lookup expected 401/);
  assert.match(workflow, /LIVE_CASH_TEST_SMOKE_CODE/);
  assert.match(workflow, /Issued test invite expected 200/);
  assert.match(workflow, /x-live-cash-profile-code: LCO-AAAAAAAAAAAAAAAAAAAA/);
  assert.match(workflow, /d1\[0\]\?\.binding !== "TEST_DB"/);
  assert.match(workflow, /binding === "DB"/);
  assert.match(smoke, /Вход для тестирования/);
  assert.match(smoke, /Test invite gate exposed primary navigation before a code was accepted/);
  assert.match(smoke, /live-cash-os:portable-profile-code/);
});
