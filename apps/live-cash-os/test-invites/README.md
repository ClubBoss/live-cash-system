# Test invite foundation

Status: `IMPLEMENTED / ISOLATED TEST D1 BOUND / RUNTIME BOOTSTRAP REQUIRED`

This folder prepares five invite-only test profiles without changing the
production site, production D1 database, learner-state schema, or curriculum.

## Existing safety mechanisms retained

- The current portable profile code is normalized and SHA-256 hashed before it
  becomes a learner-state identity.
- Cloud writes already use a revision plus opaque conditional token, so a stale
  device receives a conflict instead of silently overwriting newer progress.
- Existing state migration and local backups remain the source of truth for
  state compatibility and recovery.

## Integration contract

Before deployment, operations must:

1. Create a new Cloudflare D1 database exclusively for
   `live-cash-os-mobile-test`; never use the production D1 database or the
   production `DB` binding.
2. Set `LIVE_CASH_TEST_D1_DATABASE_ID` to that dedicated database ID as a
   repository secret. The test mirror binds it only as `TEST_DB`; do not alter
   the production Sites config or its `DB` binding.
3. Keep exactly five hash-only invite rows. The committed seed migration and the
   Worker bootstrap contain hashes only; plaintext invite codes are handed to
   the owner privately and are never committed, added as workflow secrets, or
   printed by CI.
4. The test mirror initialises its idempotent `learner_states` and
   `test_invites` schema through the already-bound `TEST_DB` Worker API before
   invite lookup. `INSERT OR IGNORE` preserves revocation (`active = 0`) across
   later deploys. The deploy credential therefore does not need D1-management
   mutation permission merely to apply schema SQL.
5. Keep the SQL files in `migrations/` as the explicit reviewable schema/seed
   source and emergency/manual provisioning reference. Do not run them against
   production.
6. In test-invite mode, require an active `test_invites.code_hash` match before
   serving `/api/state`; update `first_used_at` and `last_used_at` without
   recording plaintext codes.
7. Keep deploys backward-compatible with stored learner state. A deploy may
   change client code, but must never reset `learner_states`, drop tables, or
   overwrite a state whose conditional token has changed.
8. The deploy smoke must call `/api/state` with a non-invite profile-shaped code
   and receive `AUTH_REQUIRED` rather than a storage error. That proves runtime
   bootstrap and invite-table lookup work on the deployed isolated TEST_DB.
9. For owner validation, verify a real fresh invite and a same-code second-browser
   restore check. Verify that a stale second writer receives the existing
   conflict flow.

To generate a replacement set of five codes locally:

```sh
node scripts/generate-test-invite-codes.mjs --count=5
```

The generated SQL contains hashes only. If the seed set is intentionally
rotated, update the reviewable hash-only seed and runtime bootstrap together;
never commit plaintext codes.

## Non-goals for this foundation

- No production D1 database or production binding is created, changed, removed,
  or renamed by this flow.
- No plaintext invite code is written to D1 or GitHub Actions.
- This is not passwordless email authentication; codes are bearer secrets for a
  small closed test group and can be deactivated through `active = 0`.
