# Test invite foundation

Status: `IMPLEMENTED / ISOLATED TEST D1 / RECOVERABLE PRIVATE-REPO CODES`

This folder provides a small closed test-mirror access layer without changing
the production site, production D1 database, learner-state schema, or curriculum.

## Current operating model

For the current closed testing phase, operational simplicity is preferred over
one-time-secret handling:

- plaintext bearer codes are intentionally stored in
  `tester-access.private.json` inside this private repository;
- TEST_DB and runtime source still use SHA-256 hashes for invite matching;
- the deploy smoke reads `tester-01` from the recoverable private file instead
  of depending on an unrecoverable GitHub Actions secret;
- production never receives `TEST_DB` or `TEST_INVITE_MODE` and does not expose
  the test bootstrap endpoint;
- learner progress remains separate from the access-code file.

Treat repository access as equivalent to access to the test mirror while this
model is active. Do not copy the access file into public issues, logs, artifacts,
or a public repository.

## Integration contract

1. The Cloudflare D1 database for `live-cash-os-mobile-test` remains separate
   from production and is bound only as `TEST_DB`.
2. `tester-access.private.json` is the recoverable source of truth for the five
   current plaintext test codes.
3. `db/index.ts` and the reviewable seed migration contain the matching hashes.
4. After a test-mirror deploy, `/api/test-invite-bootstrap` synchronises those
   hashes into TEST_DB. An existing label is rotated only when its hash changes.
5. `tester-06` is explicitly removed as part of the current rotation.
6. A later manual `active = 0` revocation stays durable while that label/hash is
   unchanged; a deliberate code rotation reactivates that label.
7. The deploy smoke must prove an unknown code returns `AUTH_REQUIRED` and the
   recoverable `tester-01` code returns `200`.
8. State compatibility, conflict handling, local backup and learner-evidence
   semantics remain unchanged.

## Rotating codes later

Generate a new batch locally with:

```sh
node scripts/generate-test-invite-codes.mjs --count=5
```

Then replace the five plaintext entries in `tester-access.private.json`, update
the corresponding hashes in `db/index.ts` and the reviewable seed migration,
and merge only after CI. The next exact-main test-mirror deploy performs the
rotation.

## Non-goals

- No production D1 database or production binding is changed by this flow.
- No application account system is introduced; these are simple bearer codes
  for a small closed test group.
- This model is intentionally less strict than one-time secret distribution and
  can be hardened later when wider external testing makes that worthwhile.
