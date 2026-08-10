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
  ["tester-01", "0a2844ad94684166327709ed86c50d8fbc43c79197f34108fcc29204b95da4c2", "2026-08-10T11:42:00.000Z"],
  ["tester-02", "0be9f311d0d0fe7f64b24c371ada4a36a35d338691f4b6102072b749079530cd", "2026-08-10T11:42:00.000Z"],
  ["tester-03", "2c01618041506f785553954a13b025a28eaf50595ea8d2bfb97e1e09508d4f9f", "2026-08-10T11:42:00.000Z"],
  ["tester-04", "1cc2ba418509a45144731135ac330337a801d07f673de10cc7f50751f215fa78", "2026-08-10T11:42:00.000Z"],
  ["tester-05", "bf07be0d255623fabd2a61a2820116d9e1738971cdb88bfea1269f0b9ba7e416", "2026-08-10T11:42:00.000Z"],
] as const;

const TEST_MIRROR_INVITE_UPSERT = `
  INSERT INTO test_invites (label, code_hash, active, created_at)
  VALUES (?, ?, 1, ?)
  ON CONFLICT(label) DO UPDATE SET
    code_hash = excluded.code_hash,
    active = 1,
    created_at = excluded.created_at,
    first_used_at = NULL,
    last_used_at = NULL
  WHERE test_invites.code_hash <> excluded.code_hash
`;

let testMirrorSchemaReady: Promise<void> | null = null;

function runtimeBindings(): LiveCashBindings {
  return env as unknown as LiveCashBindings;
}

async function bootstrapTestMirrorSchema(database: D1Database): Promise<void> {
  for (const statement of TEST_MIRROR_DDL) {
    await database.prepare(statement).run();
  }

  // The private repository access file is the recoverable test-only source of
  // truth. Source code and TEST_DB still store/compare only SHA-256 hashes.
  // A label rotates only when the hash changes; an unchanged manually revoked
  // row therefore remains revoked across later cold starts/deploys.
  for (const [label, codeHash, createdAt] of TEST_MIRROR_INVITES) {
    await database.prepare(TEST_MIRROR_INVITE_UPSERT).bind(label, codeHash, createdAt).run();
  }

  // tester-06 was an unshipped intermediate credential. Remove it explicitly.
  await database.prepare("DELETE FROM test_invites WHERE label = ?").bind("tester-06").run();
}

/**
 * Initialise/synchronise only the isolated test-mirror database through its
 * Worker binding. Production exposes only `DB`, so this is a no-op there.
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
