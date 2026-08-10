-- Test mirror only. Never apply this migration to the production D1 database.
-- SHA-256 hashes mirror the recoverable plaintext test-only access file.
-- Runtime sync rotates an existing label only when its hash changes, so a later
-- manual active=0 revocation remains durable when the hash is unchanged.

INSERT OR REPLACE INTO test_invites (id, label, code_hash, active, created_at, first_used_at, last_used_at)
SELECT id, 'tester-01', '0a2844ad94684166327709ed86c50d8fbc43c79197f34108fcc29204b95da4c2', 1, '2026-08-10T11:42:00.000Z', NULL, NULL
FROM test_invites WHERE label = 'tester-01';
INSERT OR IGNORE INTO test_invites (label, code_hash, active, created_at) VALUES
  ('tester-01', '0a2844ad94684166327709ed86c50d8fbc43c79197f34108fcc29204b95da4c2', 1, '2026-08-10T11:42:00.000Z');

INSERT OR REPLACE INTO test_invites (id, label, code_hash, active, created_at, first_used_at, last_used_at)
SELECT id, 'tester-02', '0be9f311d0d0fe7f64b24c371ada4a36a35d338691f4b6102072b749079530cd', 1, '2026-08-10T11:42:00.000Z', NULL, NULL
FROM test_invites WHERE label = 'tester-02';
INSERT OR IGNORE INTO test_invites (label, code_hash, active, created_at) VALUES
  ('tester-02', '0be9f311d0d0fe7f64b24c371ada4a36a35d338691f4b6102072b749079530cd', 1, '2026-08-10T11:42:00.000Z');

INSERT OR REPLACE INTO test_invites (id, label, code_hash, active, created_at, first_used_at, last_used_at)
SELECT id, 'tester-03', '2c01618041506f785553954a13b025a28eaf50595ea8d2bfb97e1e09508d4f9f', 1, '2026-08-10T11:42:00.000Z', NULL, NULL
FROM test_invites WHERE label = 'tester-03';
INSERT OR IGNORE INTO test_invites (label, code_hash, active, created_at) VALUES
  ('tester-03', '2c01618041506f785553954a13b025a28eaf50595ea8d2bfb97e1e09508d4f9f', 1, '2026-08-10T11:42:00.000Z');

INSERT OR REPLACE INTO test_invites (id, label, code_hash, active, created_at, first_used_at, last_used_at)
SELECT id, 'tester-04', '1cc2ba418509a45144731135ac330337a801d07f673de10cc7f50751f215fa78', 1, '2026-08-10T11:42:00.000Z', NULL, NULL
FROM test_invites WHERE label = 'tester-04';
INSERT OR IGNORE INTO test_invites (label, code_hash, active, created_at) VALUES
  ('tester-04', '1cc2ba418509a45144731135ac330337a801d07f673de10cc7f50751f215fa78', 1, '2026-08-10T11:42:00.000Z');

INSERT OR REPLACE INTO test_invites (id, label, code_hash, active, created_at, first_used_at, last_used_at)
SELECT id, 'tester-05', 'bf07be0d255623fabd2a61a2820116d9e1738971cdb88bfea1269f0b9ba7e416', 1, '2026-08-10T11:42:00.000Z', NULL, NULL
FROM test_invites WHERE label = 'tester-05';
INSERT OR IGNORE INTO test_invites (label, code_hash, active, created_at) VALUES
  ('tester-05', 'bf07be0d255623fabd2a61a2820116d9e1738971cdb88bfea1269f0b9ba7e416', 1, '2026-08-10T11:42:00.000Z');

DELETE FROM test_invites WHERE label = 'tester-06';
