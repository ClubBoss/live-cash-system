# Live Cash System

Public source-of-truth for Live Cash OS, an adaptive No-Limit Hold'em live-cash learning system.

## Entry

Read `START_HERE.md`, `AGENTS.md`, `state/CURRENT_PROJECT_STATE.yaml`, `PROJECT_ATLAS.md`, then the app release authorities under `apps/live-cash-os/`.

Repository state overrides chat memory; exact commit/run/deploy identity comes from Git and GitHub Actions.

## Current product truth

- app: Live Cash OS `1.2.0`;
- primary learning route: Practical Mastery (`/mastery` and its learner routes);
- reliable root learner state: schema `2`;
- Practical Mastery profile: nested schema `3` in the same durable learner snapshot;
- legacy 11-module / 55-drill / 33-card surfaces remain supported tools rather than the ceiling of the learning architecture;
- source authority is fail-closed; `BL-11` remains `PARTIAL / POSITIVE_EV_SOURCE_ACCESS_REQUIRED`;
- empirical instrumentation is implemented, but `HUMAN_MASTERY_VALIDATED = FALSE` until genuine learner evidence exists;
- strategy, drill, RU, EN and final-composition human approvals remain pending;
- W10 empirical validation and W11 empirical/final acceptance remain incomplete.

## Canonical release target

`https://live-cash-os-mobile-test.blufferus.workers.dev/`

The canonical Workers release path deploys only an accepted exact `main` SHA and uses the isolated `TEST_DB` binding. Production `DB` must not be present in the generated Workers mirror configuration.

The former GPT-site URL is not release authority for this project.

## Release gate

Canonical source/browser gate:

`npm run test:release`

Merge and Workers publication require GREEN validation on the exact PR head, GREEN validation on the resulting exact `main`, exact-SHA deploy, and post-deploy smoke.

## Objective

`MINIMUM COMPLEXITY SUBJECT TO NO MATERIAL EV LOSS`

Machine checks may reject unsafe or inconsistent changes; they cannot manufacture poker-source authority, human approval, retention, field transfer, or learning effectiveness.
