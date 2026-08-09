import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readFile } from "node:fs/promises";
import test from "node:test";

const execFileAsync = promisify(execFile);
const appRoot = new URL("../", import.meta.url);

test("test invite migration stores only a hash and has no production target", async () => {
  const migration = await readFile(new URL("../test-invites/migrations/0001_test_invites.sql", import.meta.url), "utf8");
  assert.match(migration, /CREATE TABLE IF NOT EXISTS test_invites/);
  assert.match(migration, /code_hash TEXT NOT NULL UNIQUE/);
  assert.match(migration, /Never apply this migration to the production D1 database/);
  assert.doesNotMatch(migration, /INSERT INTO/);
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
