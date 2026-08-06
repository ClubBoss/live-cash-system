# Live Cash System — Start Here

Status: `ACTIVE / LIVE_CASH_OS_REPO_ACCEPTED / CHATGPT_SITE_DEPLOY_PENDING`

## Bootstrap

Use live `main` of `ClubBoss/live-cash-system`.

Read:

1. `START_HERE.md`;
2. `AGENTS.md`;
3. `state/CURRENT_PROJECT_STATE.yaml`;
4. `PROJECT_ATLAS.md`;
5. `apps/live-cash-os/README.md`;
6. `apps/live-cash-os/RELEASE_STATUS.md`;
7. only authorities required for the active milestone.

Repository state overrides chat memory. Do not restart source ingestion or diagnosis.

## Mission

Build a compact adaptive live-cash system for `1/3` and `2/5`, primarily `100–200bb`, with controlled `300–400bb`, straddle and multiway branches.

`MINIMUM COMPLEXITY SUBJECT TO NO MATERIAL EV LOSS`

## Source and strategic truth

```text
catalogued source corpora: complete
heuristic candidates: 34
DRILL_READY: 29
VALIDATION_PENDING: 5
admitted final rules: 0
direct candidate drills: 34/34
misconception IDs: 30
learner-state dimensions: 9
```

The application’s learner-runtime admission does **not** convert any candidate into an admitted final strategic rule.

## Live Cash OS

Stable URL:

`https://live-cash-os.elmarsal.chatgpt.site/`

Deploy source:

`apps/live-cash-os`

Accepted six-wave source SHA:

`ba927405642a7aa7238c06db4348ef5b02921fdf`

PR `#2` is squash-merged. Pre-merge and post-merge CI are green, including typecheck, lint, unit/content tests, production build and desktop/mobile browser gates.

**Deployment truth:** the stable ChatGPT Site has not updated automatically from GitHub `main`. Production smoke run `31116142028` reached the URL but did not find the new Russian runtime. Do not call the live URL accepted until the existing Site project is explicitly republished and the manual production smoke passes.

Runtime authorities:

- `apps/live-cash-os/README.md`;
- `apps/live-cash-os/RELEASE_STATUS.md`;
- `apps/live-cash-os/ACCEPTANCE_LEDGER.md`;
- `apps/live-cash-os/lib/model.ts`;
- `apps/live-cash-os/content/modules.ts`;
- `apps/live-cash-os/.openai/hosting.json`;
- `apps/live-cash-os/scripts/production-smoke.mjs`.

Current source runtime contract:

- Russian-first learner language;
- 11 structured modules;
- one cold check inside each lesson;
- theory, heuristics, decision tree, worked example and lab;
- changed-node practice and explain-back;
- skill-specific repair and delayed review;
- 33 scheduled flashcards;
- nine separate learner dimensions;
- reviewed field-note lifecycle;
- local state plus optional D1 sync;
- stable URL preserved.

Content truth:

- `LCM-01` is the gold accepted teaching module;
- `LCM-02–LCM-11` are migrated and remain `VALIDATION_PENDING` for the repeat content audit.

## Diagnostic runtime

T1 is optional personalization, not a mandatory wall.

It is a `COLD_BASELINE` only before any learning exposure. After learning begins, export must be labeled `POST_LEARNING_DIAGNOSTIC`.

Active authorities:

- `learning/diagnostics/INITIAL_PERSONALISED_DIAGNOSTIC_BATTERY_v0_1.md`;
- `learning/diagnostics/DIAGNOSTIC_RUNTIME_AND_SCORING_v0_1.md`;
- `learning/diagnostics/DIAGNOSTIC_ITEM_MANIFEST_v0_1.json`;
- `learning/diagnostics/DIAGNOSTIC_RAW_RESPONSE_SCHEMA_v0_1.json`;
- `learning/diagnostics/DIAGNOSTIC_RESPONSE_SCHEMA_v0_1.json`;
- `scripts/score_learner_diagnostic.py`.

Current truth:

```text
T1 items: 10
responses recorded: 0
measured error probability: no
confirmed strategic leaks: 0
```

## Active milestone

`REPUBLISH EXISTING CHATGPT SITE PROJECT FROM CURRENT MAIN`

Required order:

1. explicitly publish the existing Site project from current `main`;
2. preserve the same stable URL and learner-state migration;
3. manually run `Live Cash OS Production Smoke`;
4. require Russian desktop/mobile live smoke green;
5. then start the first real LCM-01 session;
6. collect delayed and field evidence;
7. run the requested repeat audit.

## Frozen constraints

Do not:

- call repo-green live-green;
- reveal T1 answer keys before completion;
- infer mastery from untested modules;
- treat content completion as mastery;
- grant retention from immediate repetition;
- grant field transfer from a raw note;
- reset learner progress globally;
- copy proprietary source hands or charts;
- turn directional bands into solver cutoffs;
- treat learner-runtime admission as final-rule admission;
- change the stable live URL.

## Verdict

`REPO_STATE_OVERRIDES_CHAT_MEMORY`

`SIX_WAVE_SOURCE_MERGED_AND_GREEN`

`LIVE_DEPLOYMENT_NOT_YET_GREEN`

`NEXT = REPUBLISH SITE THEN MANUAL SMOKE`
