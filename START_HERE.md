# Live Cash System — Start Here

Status: `POST_INTEGRATION_INTEGRITY_HARDENED / HUMAN_CONTENT_LANGUAGE_REVIEW_PENDING / TEST_MIRROR_AUTHORIZED`

## Bootstrap

Repository truth overrides chat memory.

Read in this order:

1. `START_HERE.md`;
2. `AGENTS.md`;
3. `state/CURRENT_PROJECT_STATE.yaml`;
4. `apps/live-cash-os/RELEASE_STATUS.md`;
5. `apps/live-cash-os/ACCEPTANCE_LEDGER.md`;
6. only the authorities required for the active task.

## Current repository truth

- repository: `ClubBoss/live-cash-system`;
- Final Red-Team and Gauntlets 1–4 are historical integrated implementation work;
- post-integration integrity hardening covers verified Cards, Review, Before Play, Real Hands, recovery, browser-gate and release-path gaps;
- the exact current `main` identity and its CI run are sourced from immutable Git history and GitHub Actions, not this file;
- editorial state remains `TRANSITIONAL_REVIEW_REQUIRED`.

The exact current `main` SHA and run IDs are not hard-coded here because they change with accepted repository work. Git and GitHub Actions are the authority for those identities.

## Preserved product truth

The current closure preserves:

- poker curriculum and correct-answer identities;
- drill/card IDs and source provenance;
- hard prerequisites;
- learner-state schema version `2`;
- mastery semantics and `FIELD_VALIDATED` threshold;
- `1/3/7` retention policy;
- diagnostic scoring semantics;
- stable production URL.

Before Play changes only to honor its already-declared separate warm-up contract. The fast-series mechanism/evidence semantics are unchanged; RU learner-facing naming is simplified.

## Post-integration integrity truth

The closure additionally enforces:

- Cards use completed-topic material and bounded snapshots;
- Review returns to its updated queue after each item;
- a saved learning session is not overwritten by Before Play;
- Real Hands require an explicit linked topic;
- SELF hand review remains non-evidentiary and open to a later genuine human/human-assisted review;
- conflict recovery shows local/cloud version facts before selection;
- canonical browser evidence keeps full Chromium/mobile coverage and adds focused Firefox/WebKit learner-flow checks;
- release smoke verifies immutable Git build identity.

## Test-mirror boundary

The authorized Workers test mirror is isolated from production storage. It binds a dedicated D1 database only as `TEST_DB`; production `DB` must not appear in mirror configuration. Test schema initialization is idempotent through that isolated binding and deployed smoke verifies the test storage path. Test-mirror evidence is not stable-production evidence.

## Acceptance and human-review truth

Automated checks may reject invalid candidates but cannot create human approval.

Current governance remains:

- strategy: `CURRICULUM_STRATEGY_REVIEW_PENDING`;
- drills: `DRILLS_REVIEW_PENDING`;
- RU human approval: pending;
- EN human approval: pending;
- final learner-facing composition: `REVIEW_PENDING`;
- W10 empirical validation: not completed;
- W11 final integration/release acceptance: not completed.

No strategy, drill, RU or EN approval is inferred from model review or CI.

## Deployment boundary

Stable URL remains:

`https://live-cash-os.elmarsal.chatgpt.site/`

Historical production smoke evidence is not proof that the current `main` is deployed there.

Production deployment remains separately authorized and must not be inferred from CI. The owner-authorized test mirror may deploy accepted `main` after the release gate; it must use neither the production URL nor the production D1 database.

## Active milestone

`POST_INTEGRATION_INTEGRITY_HARDENING -> HUMAN_CONTENT_LANGUAGE_REVIEW -> W10_EMPIRICAL_VALIDATION -> W11_RELEASE_ACCEPTANCE`

## Frozen constraints

Do not:

- call source-green production-green;
- synthesize human approvals;
- claim W10 or W11 complete;
- infer mastery from completion, Diagnostic routing or one reviewed hand;
- grant retention from immediate repetition;
- reset learner progress globally;
- change the stable URL;
- deploy the production site without separate authorization.

## Verdict

`REPO_STATE_OVERRIDES_CHAT_MEMORY`

`HUMAN_REVIEW_PENDING`

`W10_NOT_COMPLETED / W11_NOT_COMPLETED`

`NO_PRODUCTION_DEPLOYMENT_CLAIM`
