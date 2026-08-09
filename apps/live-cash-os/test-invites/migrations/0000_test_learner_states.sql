-- Test mirror only. Never apply this migration to the production D1 database.
-- This is intentionally the same stable learner-state shape used by the app;
-- it contains no production data and creates no cross-database connection.

CREATE TABLE IF NOT EXISTS learner_states (
  user_id TEXT PRIMARY KEY NOT NULL,
  state_json TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
