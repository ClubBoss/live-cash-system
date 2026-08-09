# Live Cash System — Start Here

Status: `FINAL_RED_TEAM_CANDIDATE / INDEPENDENT_EVALUATION_PENDING / NO_MERGE_NO_DEPLOY`

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
- current `main` / Final Red-Team base: `787313276f3d7290a6144f965eeb54dce050509e`;
- bounded candidate branch: `repair/final-red-team-closure`;
- draft evaluator PR: `#28`;
- Final Red-Team implementation code-freeze: `07cea8f9b3109e93e8c2a8b81ac77820a772d4f1`;
- code-freeze canonical CI: run `31285270612` — `SUCCESS`;
- code-freeze automated counts: `178/178` unit/integration PASS; canonical Chromium/mobile E2E `128` PASS / `4` intentional skips;
- learner-facing review fingerprint after RC-8 refresh: `dc012812f07aeab120cc19b448c8d5414d83816b26ddc87fb208d50b01ac0f6e`;
- editorial state remains `TRANSITIONAL_REVIEW_REQUIRED`.

The exact final candidate SHA and its final run IDs are intentionally not hard-coded into an authority file that participates in that same commit. Doing so would create self-referential SHA churn. The PR head/Git ref plus the final evaluator handoff are the authority for the exact frozen SHA and evidence runs.

## Integrated scope

Gauntlet 1, Gauntlet 2 and Gauntlet 3 are integrated in `main` before this candidate. Final Red-Team Closure is a bounded post-Gauntlet repair only.

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

## Production boundary

Stable URL remains:

`https://live-cash-os.elmarsal.chatgpt.site/`

Historical production smoke evidence exists for earlier accepted source states. It is not evidence that this Final Red-Team candidate is deployed.

This closure must not publish, merge or claim exact deployed-SHA equality. Production acceptance requires a later explicitly authorized flow after evaluator `KEEP`.

## Active milestone

`FINAL_RED_TEAM_CLOSURE -> EXACT_FINAL_RELEASE_GATE -> ONE_TIME_CROSS_BROWSER_MATRIX -> INDEPENDENT_EVALUATOR`

After the exact final SHA is frozen:

1. run unchanged `npm run test:release` on that exact SHA;
2. run the six-project cross-browser matrix on the same exact SHA;
3. make no further code/docs/manifest changes;
4. hand the frozen candidate to the independent evaluator for `KEEP / REPAIR / REVERT`.

## Frozen constraints

Do not:

- call source-green production-green;
- synthesize human approvals;
- claim W10 or W11 complete;
- infer mastery from completion, Diagnostic routing or one reviewed hand;
- grant retention from immediate repetition;
- reset learner progress globally;
- change the stable URL;
- merge or deploy before evaluator approval.

## Verdict

`REPO_STATE_OVERRIDES_CHAT_MEMORY`

`FINAL_RED_TEAM_CANDIDATE_NOT_YET_MERGED`

`HUMAN_REVIEW_PENDING`

`W10_NOT_COMPLETED / W11_NOT_COMPLETED`

`NO_PRODUCTION_CLAIM_FOR_THIS_CANDIDATE`
