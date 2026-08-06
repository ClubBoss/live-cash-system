# Live Cash OS — Release Status

Status: `RELEASE_CANDIDATE / CLEAN_FINAL_CI_PENDING / NOT_YET_LIVE_ACCEPTED`

- Stable live URL: `https://live-cash-os.elmarsal.chatgpt.site/`
- Deploy source: `apps/live-cash-os`
- Baseline main SHA: `87c8faed8ef982cd1b6e16a2f12565611c4f9681`
- Active rebuild branch: `agent/live-cash-os-six-wave-rebuild`
- Pull request: `#2`
- App release target: `1.0.0`
- Learner-state schema target: `2`
- Content version target: `2026.08-wave6`

## Completed six-wave scope

1. Truth reset, version separation and acceptance ledger.
2. Canonical response classes, nine dimensions and per-module evidence.
3. Russian-first ten-stage teaching layer with LCM-01 as the gold module.
4. Skill-specific repair, delayed review, cards, session resume and field-note review.
5. T1 raw/evaluated handoff and revision-safe local/D1 state.
6. Structured LCM-01–LCM-11 corpus, release CI, desktop/mobile E2E and PWA shell.

## Final integrity closures

- Cloud sync is driven by learner-state changes, not by changes to the sync-status label.
- T1 exports `COLD_BASELINE` only before learning has begun; later runs are explicitly marked `POST_LEARNING_DIAGNOSTIC`.
- Successful repair removes the corresponding due repair item.
- One reviewed field note cannot by itself create `FIELD_VALIDATED` status.
- Duplicate final-patch insertions were removed and guarded by regression tests.
- Temporary one-time workflow files have been removed.

## Owner decisions

1. Russian is the primary learner-facing language. Standard English poker terms may appear in parentheses.
2. T1 is optional personalisation. Its result is a cold baseline only before the first learning exposure.
3. Content completion, working evidence, retention and field validation are separate states.
4. No single correct answer creates mastery.
5. Repair and delayed recall must target the same evidenced mechanism.
6. Variant transfer and field transfer remain separate dimensions.
7. The stable live URL must remain unchanged.
8. Existing local and D1 learner data must migrate without a global reset.
9. AI scoring is not admitted before the deterministic diagnostic handoff is closed.
10. Platform-only optimisation stops after the six-wave DoD; further tuning requires real learner and field evidence.

## Acceptance truth

The branch may merge only after this clean owner-triggered CI passes typecheck, lint, unit/content tests, production build and desktop/mobile browser gates.

`ACCEPTED` may be written only after merge, deployment and a smoke check against the stable live URL.
