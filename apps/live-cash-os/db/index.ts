import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

type LiveCashBindings = {
  DB?: D1Database;
  TEST_DB?: D1Database;
};

const TEST_MIRROR_DDL = [
  `CREATE TABLE IF NOT EXISTS learner_states (
    user_id TEXT PRIMARY KEY NOT NULL,
    state_json TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS test_invites (
    id INTEGER PRIMARY KEY,
    label TEXT NOT NULL UNIQUE,
    code_hash TEXT NOT NULL UNIQUE,
    active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
    created_at TEXT NOT NULL,
    first_used_at TEXT,
    last_used_at TEXT
  )`,
  `CREATE INDEX IF NOT EXISTS test_invites_active_code_hash
    ON test_invites (active, code_hash)`,
] as const;

const TEST_MIRROR_INVITES = [
  ["tester-01", "d991e45dbb28427f1f0bbfb44facb3dd641b101030fef6c81436899a4f1832d8", "2026-08-09T14:20:06.757Z"],
  ["tester-02", "955ffb45882da5f68a7d77e63484828a041fb740205bb404f435b5d2cc705131", "2026-08-09T14:20:06.757Z"],
  ["tester-03", "c56162ec26ca9bb54bb596486ab3621b428acae6d6acc59b4b1b66f8990ec7bc", "2026-08-09T14:20:06.757Z"],
  ["tester-04", "2d95a5abda195742d06628927462d938e979cfea19064a8087345f8ca053a1d8", "2026-08-09T14:20:06.757Z"],
  ["tester-05", "e185d35475cc42443b42d20c15924d518b9f781eff40f16a97caab60740a35ff", "2026-08-09T14:20:06.757Z"],
] as const;

const TEST_MIRROR_INVITE_INSERT = `
  INSERT OR IGNORE INTO test_invites (label, code_hash, active, created_at)
  VALUES (?, ?, 1, ?)
`;

let testMirrorSchemaReady: Promise<void> | null = null;

function runtimeBindings(): LiveCashBindings {
  return env as unknown as LiveCashBindings;
}

async function bootstrapTestMirrorSchema(database: D1Database): Promise<void> {
  // D1Database.exec treats raw newline-delimited SQL as an exec script. These
  // CREATE statements are intentionally multi-line, so run each one through
  // the prepared-statement API instead of letting exec split their lines.
  for (const statement of TEST_MIRROR_DDL) {
    await database.prepare(statement).run();
  }

  // Seed only hashes through bound parameters. INSERT OR IGNORE preserves an
  // operator's later revocation (`active = 0`) instead of reactivating a code.
  for (const [label, codeHash, createdAt] of TEST_MIRROR_INVITES) {
    await database.prepare(TEST_MIRROR_INVITE_INSERT).bind(label, codeHash, createdAt).run();
  }
}

/**
 * Initialise only the isolated test-mirror database through its Worker binding.
 * Production exposes only `DB`, so this is a no-op on the stable site and
 * cannot create test tables or invite rows there.
 */
export async function ensureTestMirrorSchema(): Promise<void> {
  const database = runtimeBindings().TEST_DB;
  if (!database) return;
  if (!testMirrorSchemaReady) {
    testMirrorSchemaReady = bootstrapTestMirrorSchema(database).catch((error) => {
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
