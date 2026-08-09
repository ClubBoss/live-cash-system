# Test invite foundation

Status: `PREPARED / NOT_YET_INTEGRATED`

This folder prepares five invite-only test profiles without changing the
production site, production D1 database, learner-state schema, curriculum, or
current test-mirror deployment behavior.

## Existing safety mechanisms retained

- The current portable profile code is normalized and SHA-256 hashed before it
  becomes a learner-state identity.
- Cloud writes already use a revision plus opaque conditional token, so a stale
  device receives a conflict instead of silently overwriting newer progress.
- Existing state migration and local backups remain the source of truth for
  state compatibility and recovery.

## Integration contract

When parallel `main` work is settled, the follow-up implementation must:

1. Create a new Cloudflare D1 database exclusively for
   `live-cash-os-mobile-test`; never use the production D1 database or the
   production `DB` binding.
2. Apply `migrations/0001_test_invites.sql` only to that new database.
3. Generate exactly five codes locally with:

   ```sh
   node scripts/generate-test-invite-codes.mjs --count=5
   ```

   The generated SQL contains hashes only. The plaintext codes are handed to
   the owner privately and are never committed, added as workflow secrets, or
   printed by CI.
4. Add test-mirror-only configuration which binds the new database under a new
   name (for example `TEST_AUTH_DB`). Do not alter the production Sites config
   or its `DB` binding.
5. In test-invite mode, require an active `test_invites.code_hash` match before
   serving `/api/state`; update `first_used_at` and `last_used_at` without
   recording plaintext codes.
6. Keep deploys backward-compatible with stored learner state. A deploy may
   change client code, but must never reset `learner_states`, drop tables, or
   overwrite a state whose conditional token has changed.
7. Extend test smoke with a fresh invite and a same-code second-browser restore
   check. Verify that a stale second writer receives the existing conflict flow.

## Non-goals for this foundation

- No D1 database has been created or bound yet.
- No account, plaintext code, learner progress, or production resource exists
  as a result of this preparation.
- This is not passwordless email authentication; codes are bearer secrets for
  a small closed test group and can be deactivated through `active = 0`.
