# Live Cash OS — Release Status

Status: `ACCEPTED / MAIN_MERGED / LIVE_SMOKE_GREEN`

- Stable live URL: `https://live-cash-os.elmarsal.chatgpt.site/`
- Deploy source: `apps/live-cash-os`
- Accepted six-wave source SHA: `ba927405642a7aa7238c06db4348ef5b02921fdf`
- Pull request: `#2` — squash merged
- Pre-merge CI run: `31115462552` — green
- Post-merge main CI run: `31115738775` — green
- App release target: `1.0.0`
- Learner-state schema: `2`
- Content version: `2026.08-wave6`
- Deployed GitHub source SHA: `a22cd0b676730e4eaea2169c36f979c7192b6413`
- Existing Site version: `24`

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
- Typecheck, lint, unit/content tests, production build and desktop/mobile browser gates pass on the accepted source.

## Live deployment evidence

The existing ChatGPT Site project was explicitly republished from the current `main` application tree. Owner-authenticated Chromium smoke then confirmed the stable URL with HTTP `200`, title `Live Cash OS`, the Russian runtime markers `Учись коротко`, `T1 — дополнительный cold diagnostic` and `LIVE CASH OS`, no old runtime markers, reachable CTAs, and `0px` horizontal overflow at `390×844`.

The earlier failed smoke run `31116142028` remains historical evidence that GitHub merge alone did not publish the Site; it is superseded by the successful manual production evidence above.

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

## Content truth boundary

- `LCM-01` is the gold accepted teaching module.
- `LCM-02–LCM-11` are migrated structured content and remain `VALIDATION_PENDING` for the planned repeat content audit.
- Learner-runtime admission does not admit final strategic rules.

## Final acceptance

`ACCEPTED / MAIN_MERGED / LIVE_SMOKE_GREEN`
