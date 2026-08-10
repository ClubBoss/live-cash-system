-- Test mirror only. Never apply this migration to the production D1 database.
-- These are SHA-256 hashes of the owner-held invite codes. `INSERT OR
-- IGNORE` keeps revocation (`active = 0`) durable across later deployments.

INSERT OR IGNORE INTO test_invites (label, code_hash, active, created_at) VALUES
  ('tester-01', 'd991e45dbb28427f1f0bbfb44facb3dd641b101030fef6c81436899a4f1832d8', 1, '2026-08-09T14:20:06.757Z'),
  ('tester-02', '955ffb45882da5f68a7d77e63484828a041fb740205bb404f435b5d2cc705131', 1, '2026-08-09T14:20:06.757Z'),
  ('tester-03', 'c56162ec26ca9bb54bb596486ab3621b428acae6d6acc59b4b1b66f8990ec7bc', 1, '2026-08-09T14:20:06.757Z'),
  ('tester-04', '2d95a5abda195742d06628927462d938e979cfea19064a8087345f8ca053a1d8', 1, '2026-08-09T14:20:06.757Z'),
  ('tester-05', 'e185d35475cc42443b42d20c15924d518b9f781eff40f16a97caab60740a35ff', 1, '2026-08-09T14:20:06.757Z'),
  ('tester-06', 'da2c59c3848c72fb11e121ab13b1696965a25bb4f86537d25d4dc76226dbf5e5', 1, '2026-08-10T11:42:00.000Z');
