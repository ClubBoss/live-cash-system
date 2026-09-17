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

type TestMirrorInvite = { label: string; codeHash: string; createdAt: string };

function testMirrorInvitesFromSecret(): TestMirrorInvite[] {
  const encoded = (env as unknown as { LIVE_CASH_TEST_INVITE_BUNDLE?: string }).LIVE_CASH_TEST_INVITE_BUNDLE?.trim();
  if (!encoded) throw new Error("Test mirror invite bundle is unavailable");
  const parsed = JSON.parse(encoded) as { invites?: TestMirrorInvite[] };
  const invites = parsed.invites ?? [];
  if (invites.length < 1 || invites.some((invite) => !/^tester-[0-9]{2}$/.test(invite.label) || !/^[a-f0-9]{64}$/.test(invite.codeHash))) {
    throw new Error("Test mirror invite bundle is invalid");
  }
  return invites;
}

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

  // GitHub/Cloudflare secret material supplies only hashes to runtime; plaintext
  // bearer codes never enter the repository or bootstrap response/logs.
  for (const { label, codeHash, createdAt } of testMirrorInvitesFromSecret()) {
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
