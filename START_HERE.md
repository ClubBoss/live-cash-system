# Live Cash System — Start Here

Status: `GAUNTLET_4_INTEGRATED / HUMAN_CONTENT_LANGUAGE_REVIEW_PENDING / TEST_MIRROR_AUTHORIZED`

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
- Final Red-Team closure is historical and integrated into `main`.
- Gauntlet 4 is integrated in `main` as `221f32e479bb0f1e921033a43a1c032be49380ca`.
- The exact current `main` identity and its CI run are sourced from immutable Git history and GitHub Actions, not this file.
- editorial state remains `TRANSITIONAL_REVIEW_REQUIRED`.

The exact current `main` SHA and run IDs are not hard-coded here because they change with accepted repository work. Git and GitHub Actions are the authority for those identities.

## Integrated scope

Gauntlets 1–4 and the Final Red-Team closure are integrated in `main`.

The closure preserves:

- poker curriculum and correct-answer identities;
- drill/card IDs and source provenance;
- hard prerequisites and scheduler policy except the demonstrated review-ID integrity repair;
- learner-state schema version `2`;
- mastery semantics and `FIELD_VALIDATED` contract;
- `1/3/7` retention policy;
- Table Burst policy;
- stable production URL.

RC-1 fails closed on stale explicit review/repair IDs. RC-2 adds deep structural validation for runtime-used schema-v2 persisted structures without a schema bump. RC-3 removes learner-facing internal state-machine vocabulary while preserving internal enums and evidence semantics.

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

Production deployment remains separately authorized and must not be inferred from CI. An owner-authorized Cloudflare Workers test mirror may deploy accepted `main` only after `npm run test:release` is green; it must use neither the production URL nor the production D1 database.

## Active milestone

`GAUNTLET_4_INTEGRATED -> HUMAN_CONTENT_LANGUAGE_REVIEW -> W10_EMPIRICAL_VALIDATION -> W11_RELEASE_ACCEPTANCE`

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
