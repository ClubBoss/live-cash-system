-- Test mirror only. Never apply this migration to the production D1 database.
-- Invite codes are never stored in plaintext: `code_hash` is SHA-256 of the
-- normalized LCO-TEST-* code. Learner progress remains in `learner_states`,
-- keyed by the existing portable-profile hash.

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
