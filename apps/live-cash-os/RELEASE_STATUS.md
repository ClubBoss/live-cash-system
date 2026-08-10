# Live Cash OS — Release Status

Status: `POST_TESTER_A_B_C_IMPLEMENTATION_COMPLETE / VERSION_1_2_0_CANDIDATE / FEATURE_FREEZE / HUMAN_CONTENT_LANGUAGE_REVIEW_PENDING / W10_PENDING`

## Current truth

Final Red-Team, Gauntlets 1–4 and Post-Tester Waves A/B/C are integrated implementation history. The `1.2.0` version in this branch is a release candidate only; it does not create human approval, W10 evidence, a Git tag, test-mirror deployment proof for this candidate, or stable-production publication.

Canonical source gate:

`npm run test:release`

Exact commit and run identities live in immutable Git/GitHub Actions history rather than this status file.

## v1.2.0 post-tester candidate

The candidate groups the accepted tester-driven delta without changing learning semantics:

- **A — Progress & Session Clarity:** lesson completion is separated from skill state; persistent step N/10; truthful local-save status; Today due-review clarity; saved Diagnostic continuation progress.
- **B — Continuity & Real-Hand Safety:** reload-safe Today/Review return; unfinished Real Hand local draft; zero learner evidence before lock; local-save acknowledgement before draft clear; profile isolation; display-only complete-record example.
- **C — Mobile & Test Access:** denser but complete mobile decision options with a 48px target floor; distinct invalid/offline/service-unavailable invite states; persisted RU/EN invite-gate locale.

Feature freeze is active. Further product changes require empirical real-use evidence, except independently verified P0/P1 defects. This is implementation-complete **for real-use validation**, not evidence that retention, mastery or field transfer have been empirically validated.

`v1.2.0` tag: **NOT CREATED** in the candidate branch.


## Post-integration integrity contract

The bounded closure addresses verified residue only:

- Cards expose only material from completed topics and use a fixed bounded snapshot;
- Review is item-by-item and returns to the updated Review queue after completion;
- Before Play is separate from a saved learning session;
- Real Hands require an explicit linked topic;
- SELF hand review remains non-evidentiary and can be followed by a later genuine human review of the same locked hand;
- local/cloud conflicts show side-by-side progress facts before a copy is chosen;
- learner-facing RU fast-series naming is simplified;
- smoke verifies the immutable Git build identity;
- the canonical browser gate keeps full Chromium/mobile coverage and adds focused Firefox/WebKit learner-flow coverage;
- root truth files participate in CI triggers;
- release-gate logs are retained for exact failure diagnosis.

## Test-mirror storage contract

The Workers test mirror uses one isolated D1 binding named `TEST_DB`. Production `DB` must not be present in the generated mirror configuration. Test schema initialization is idempotent through the already-bound test database before invite lookup, and deployed smoke verifies that the isolated state endpoint is operational. Test-mirror evidence is not stable-production evidence.

## Preservation boundary

This closure does not intentionally change poker curriculum, correct-answer identities, drill/card IDs, source provenance, hard prerequisites, learner-state schema version, mastery semantics, the `FIELD_VALIDATED` threshold, the `1/3/7` retention policy, diagnostic scoring semantics, or the stable production URL.

Scheduler behavior changes only where required to make Before Play honor its declared separate warm-up contract. The internal fast-series evidence semantics are unchanged; only learner-facing naming is simplified.

## Governance truth

The editorial manifest intentionally remains review-pending:

`TRANSITIONAL_REVIEW_REQUIRED / CURRICULUM_STRATEGY_REVIEW_PENDING / DRILLS_REVIEW_PENDING / FINAL_COMPOSITION_REVIEW_PENDING`

- strategy approval: `null`;
- drill approval: `null`;
- human RU approvals: none;
- human EN approvals: none;
- final composition approval: pending.

A source-lock fingerprint refresh is deterministic bookkeeping, not human approval.

## Human and empirical gates

Still open: human poker/strategy review, human drill review, final Russian review, final English review, W10 empirical validation, and W11 final integration/release acceptance.

W10 is not completed by this closure.

## Deployment truth

Stable URL remains:

`https://live-cash-os.elmarsal.chatgpt.site/`

Historical stable-production smoke proves only the source state against which it was recorded. Current test-mirror smoke may prove exact-main deployability, but it must not be presented as stable-production publication.
