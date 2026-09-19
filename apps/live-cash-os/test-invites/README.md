# Test invite foundation

Status: `IMPLEMENTED / ISOLATED TEST D1 / SECRET-BACKED CREDENTIALS`

The test mirror is closed without committing recoverable bearer credentials. The public repository contains no plaintext invite source of truth.

## Security contract

- Plaintext tester codes live only in an external password/secret manager and are distributed out of band.
- GitHub Actions receives `LIVE_CASH_TEST_SMOKE_CODE` for the current smoke credential and `LIVE_CASH_REVOKED_TEST_INVITE_CODE` for a historical credential that must remain rejected.
- Runtime receives `LIVE_CASH_TEST_INVITE_BUNDLE`, a JSON secret containing only labels, SHA-256 hashes, and creation timestamps. `/api/test-invite-bootstrap` synchronises those hashes into the isolated `TEST_DB` and never returns credential material.
- Production receives neither `TEST_DB`, `TEST_INVITE_MODE`, nor the test invite bundle.
- Local files matching `test-invites/*.private.json` or `test-invites/*.secret.json` are ignored and must never be committed.

## Rotation contract

Generate a new batch locally with `node scripts/generate-test-invite-codes.mjs --count=5`. Store the plaintext output outside Git, update the hash-only `LIVE_CASH_TEST_INVITE_BUNDLE` secret, and update `LIVE_CASH_TEST_SMOKE_CODE` to one current code. Keep one previously exposed code in `LIVE_CASH_REVOKED_TEST_INVITE_CODE` only long enough for the deploy smoke to prove it returns `401`; then it may be removed after Master records the evidence.

Because this repository was public while earlier plaintext bearer codes were tracked, deleting the file from HEAD cannot erase historical exposure. Rotation/revocation is mandatory; history rewrite is optional defense-in-depth and is not required once all historical credentials are unusable.
