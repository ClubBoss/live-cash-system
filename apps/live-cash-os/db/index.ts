import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

type LiveCashBindings = {
  DB?: D1Database;
  TEST_DB?: D1Database;
};

const TEST_MIRROR_SCHEMA = `
CREATE TABLE IF NOT EXISTS learner_states (
  user_id TEXT PRIMARY KEY NOT NULL,
  state_json TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS test_invites (
  id INTEGER PRIMARY KEY,
  label TEXT NOT NULL UNIQUE,
  code_hash TEXT NOT NULL UNIQUE,
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
  created_at TEXT NOT NULL,
  first_used_at TEXT,
  last_used_at TEXT
);
CREATE INDEX IF NOT EXISTS test_invites_active_code_hash
  ON test_invites (active, code_hash);
INSERT OR IGNORE INTO test_invites (label, code_hash, active, created_at) VALUES
  ('tester-01', 'd991e45dbb28427f1f0bbfb44facb3dd641b101030fef6c81436899a4f1832d8', 1, '2026-08-09T14:20:06.757Z'),
  ('tester-02', '955ffb45882da5f68a7d77e63484828a041fb740205bb404f435b5d2cc705131', 1, '2026-08-09T14:20:06.757Z'),
  ('tester-03', 'c56162ec26ca9bb54bb596486ab3621b428acae6d6acc59b4b1b66f8990ec7bc', 1, '2026-08-09T14:20:06.757Z'),
  ('tester-04', '2d95a5abda195742d06628927462d938e979cfea19064a8087345f8ca053a1d8', 1, '2026-08-09T14:20:06.757Z'),
  ('tester-05', 'e185d35475cc42443b42d20c15924d518b9f781eff40f16a97caab60740a35ff', 1, '2026-08-09T14:20:06.757Z');
`;

let testMirrorSchemaReady: Promise<void> | null = null;

function runtimeBindings(): LiveCashBindings {
  return env as unknown as LiveCashBindings;
}

/**
 * Initialise only the isolated test-mirror database through its Worker binding.
 * The statements are idempotent and INSERT OR IGNORE preserves invite
 * revocation (`active = 0`). Production exposes only `DB`, so this is a no-op
 * on the stable site and cannot create test tables there.
 */
export async function ensureTestMirrorSchema(): Promise<void> {
  const database = runtimeBindings().TEST_DB;
  if (!database) return;
  if (!testMirrorSchemaReady) {
    testMirrorSchemaReady = database.exec(TEST_MIRROR_SCHEMA)
      .then(() => undefined)
      .catch((error) => {
        testMirrorSchemaReady = null;
        throw error;
      });
  }
  await testMirrorSchemaReady;
}

export function getDb() {
  const bindings = runtimeBindings();
  // Sites continues to use the production `DB` binding. The Workers test
  // mirror receives only `TEST_DB`, which points at its separate test D1.
  const database = bindings.TEST_DB ?? bindings.DB;
  if (!database) {
    throw new Error(
      "Cloudflare D1 binding is unavailable. Set the Sites `DB` binding or the test-mirror `TEST_DB` binding before using cloud storage."
    );
  }

  return drizzle(database, { schema });
}
