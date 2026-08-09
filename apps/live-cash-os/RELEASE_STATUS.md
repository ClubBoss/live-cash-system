# Live Cash OS — Release Status

Status: `FINAL_RED_TEAM_CANDIDATE / HUMAN_REVIEW_PENDING / INDEPENDENT_EVALUATOR_REQUIRED / NO_DEPLOY`

## Current candidate truth

- base `main`: `787313276f3d7290a6144f965eeb54dce050509e`;
- candidate branch: `repair/final-red-team-closure`;
- evaluator PR: draft `#28`;
- implementation code-freeze: `07cea8f9b3109e93e8c2a8b81ac77820a772d4f1`;
- implementation code-freeze CI: run `31285270612` — `SUCCESS`;
- canonical command: `npm run test:release`;
- code-freeze automated result: `178/178` unit/integration PASS; `128` canonical browser E2E PASS; `4` intentional target skips; `0` E2E failures;
- lint: `0` errors and the pre-existing React hook warning remains;
- final learner-facing review fingerprint: `dc012812f07aeab120cc19b448c8d5414d83816b26ddc87fb208d50b01ac0f6e`.

The exact final SHA is the Git/PR head after authority reconciliation and removal of the one-time write-enabled lock-refresh harness. It is not embedded in this file because doing so would mutate the SHA being recorded. Exact final run IDs/counts are immutable GitHub Actions plus evaluator-handoff evidence and do not require a post-freeze docs commit.

## Final Red-Team Closure implementation

RC-1, RC-2 and RC-3 are implemented and must not be reopened without a new demonstrated defect.

### RC-1 — explicit review identity

Explicit stale `sourceReviewId` fails closed instead of falling through to a neighbouring due item. Explicit live IDs affect only the named due item. The documented no-explicit-ID fallback remains available. Repair identity follows the same fail-closed category boundary.

### RC-2 — persisted schema-v2 validation

The existing schema-v2 validator structurally validates runtime-used persisted state, including active sessions, review items, cards, field notes and known Wave7 extensions. Malformed current-schema import/cloud input is rejected before runtime use. Local corruption recovery remains conservative. `STATE_SCHEMA_VERSION` is unchanged.

### RC-3 — learner-facing copy

Learner-facing raw reviewer/transfer/mastery state-machine vocabulary introduced by Gauntlet 3 is replaced with compact RU/EN learner language. Internal enum values and evidence contracts are unchanged.

## Preservation boundary

This candidate does not change:

- curriculum or correct-answer identities;
- drill/card IDs;
- source provenance;
- hard prerequisites;
- scheduler policy beyond the demonstrated identity-integrity bug fix;
- mastery semantics;
- `FIELD_VALIDATED` contract;
- `1/3/7` retention policy;
- Table Burst policy;
- learner-state schema version;
- stable production URL.

## RC-8 editorial lock truth

Editorial manifest remains intentionally:

`TRANSITIONAL_REVIEW_REQUIRED / CURRICULUM_STRATEGY_REVIEW_PENDING / DRILLS_REVIEW_PENDING / FINAL_COMPOSITION_REVIEW_PENDING`

- strategy approval: `null`;
- drill approval: `null`;
- human locale approvals: none;
- final composition status: `REVIEW_PENDING`;
- current curriculum composition digest: `7b44741c3032d0c3f084f60aab5513a40445e32394c36954496ba83e53127b0a`;
- post-closure source-lock fingerprint: `dc012812f07aeab120cc19b448c8d5414d83816b26ddc87fb208d50b01ac0f6e`.

CI/editorial tooling is rejection-only and cannot synthesize strategy, drill, Russian or English approval.

## Exact-final automated evidence contract

The frozen Git/PR head is evaluation-ready only if both evidence classes are green on that same SHA:

1. unchanged `npm run test:release`;
2. existing `playwright.cross-browser.config.mjs` critical matrix:
   Chromium desktop, Firefox desktop, WebKit desktop, iPhone/WebKit, Android/Chromium and iPad/WebKit.

The green implementation run on `07cea8f…` remains valid RC-1/2/3 evidence but is not a substitute for exact-final evidence after RC-7/RC-8 metadata reconciliation.

After exact-final evidence is collected, repository code/docs/manifest must not change before evaluator review. The final handoff records the exact frozen SHA, run IDs and counts.

## Human and empirical gates

Still pending unless genuine evidence is added in a later authorized step:

- human poker/strategy review;
- human drill review;
- final Russian review;
- final English review;
- W10 empirical validation from real learner sessions;
- W11 final integration/release acceptance.

No model/source pre-review or automated test can close those human/empirical gates.

## Production truth

Stable URL remains `https://live-cash-os.elmarsal.chatgpt.site/`.

Historical production smoke/deployment evidence applies to earlier accepted source states only. This Final Red-Team candidate has not been deployed in this task, and exact production SHA equality is not claimed.

Required later production sequence, only after evaluator `KEEP` and separate authorization:

`exact accepted main -> publish existing ChatGPT Site -> live desktop/mobile smoke -> production truth update`

## Stop condition

Once the same exact frozen SHA has green release and six-project browser evidence, make no further candidate mutations and hand PR `#28` to the independent evaluator for `KEEP / REPAIR / REVERT`.

`NO MERGE / NO DEPLOY IN FINAL RED-TEAM CLOSURE`
