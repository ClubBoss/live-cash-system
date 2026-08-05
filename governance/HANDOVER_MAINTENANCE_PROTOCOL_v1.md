# Live Cash System — Handover Maintenance Protocol v1

Status: `ACTIVE / CONTINUITY_SSOT`

## Purpose

Keep future chats and agents aligned with the accepted repository state without requiring manual narrative handovers or full-repository rescans.

The handover system has four active parts:

1. `START_HERE.md` — human-readable bootstrap and current mission;
2. `AGENTS.md` — operating contract and scope rules;
3. `state/CURRENT_PROJECT_STATE.yaml` — compact machine-readable snapshot;
4. `PROJECT_ATLAS.md` — stable map of layers and authority routing.

The repository is the source of truth. Chat memory is optional context only.

## Update triggers

Update the handover state after a material checkpoint such as:

- a source-family course or grade becomes complete;
- a new batch changes received coverage materially;
- a candidate or question changes status;
- a drill gap closes;
- the stable module graph or authority routing changes;
- final consolidation begins;
- original range anchors become active;
- learner testing or field testing begins;
- an admission, rejection or material revision occurs.

Do not update the atlas or bootstrap for trivial wording edits or purely historical report additions.

## File responsibilities

### `START_HERE.md`

Update when the headline operational truth changes:

- active milestone;
- source-family coverage;
- major counts;
- current open gates;
- latest integrated checkpoint;
- minimum authority read order.

Keep it concise enough to read first, but complete enough to prevent a restart.

### `AGENTS.md`

Update only when operating rules change:

- source-purity contract;
- mutation budget;
- return contract;
- progress-preservation rule;
- tool or authority routing.

Do not use it as a rolling status log.

### `state/CURRENT_PROJECT_STATE.yaml`

Update after every material checkpoint.

At minimum refresh:

- `updated_at`;
- source coverage;
- system counts;
- candidate status counts when changed;
- active milestone;
- open gates;
- latest checkpoint report and commit;
- terminal handover flags.

This file must remain parseable YAML and should avoid prose that cannot be classified.

### `PROJECT_ATLAS.md`

Update only when the durable map changes:

- top-level layers;
- source-family lifecycle state;
- stable authority order;
- module graph;
- finalisation path;
- major coverage summary.

Routine lesson ingestion should not trigger a full atlas rewrite.

### Root `README.md`

Update only when the headline project state changes. It should point new chats to `START_HERE.md` and should not duplicate every handover detail.

## Checkpoint update sequence

After completing a batch:

```text
1. canonical source records
2. source registry and gap ledger
3. batch QA and cross-source delta
4. affected evidence/question/candidate/module authorities
5. original drill or assessment delta, if justified
6. terminal checkpoint report
7. CURRENT_PROJECT_STATE.yaml
8. START_HERE.md if headline state changed
9. PROJECT_ATLAS.md only if durable routing changed
10. README.md if public headline changed
```

The terminal report documents the checkpoint. The registry and current-state file control current coverage.

## Staleness detection

A new chat should treat the handover as stale when any of these disagree:

- `START_HERE.md` source coverage;
- source-family registry coverage;
- `CURRENT_PROJECT_STATE.yaml` coverage;
- latest terminal report;
- root `README.md` headline state.

Resolution order:

1. inspect live `main`;
2. trust canonical source records and source registry;
3. inspect the newest relevant terminal report;
4. repair the current-state and bootstrap files;
5. do not infer completion from a recap or exam artifact.

## Current-state invariants

The following must stay mutually consistent:

- source counts;
- candidate count;
- candidate status counts;
- direct-drill coverage;
- assessment-family count;
- active milestone;
- open source continuity;
- latest checkpoint report;
- frozen/deferred scope.

## New-chat handover prompt

The user should be able to start a new chat with only:

```text
Open the private repository ClubBoss/live-cash-system.
Read START_HERE.md and follow AGENTS.md.
Verify the live main branch and continue from the active milestone.
```

No manual history recap should be necessary unless the repository is unavailable.

## Required initial agent capsule

Before continuing work, the new chat should state:

- repository and live branch verified;
- current checkpoint;
- active milestone;
- frozen identities;
- exact open source continuity;
- next bounded action;
- whether any authority drift was found.

The capsule should be brief and operational.

## No-history-rewrite rule

Do not replace historical reports to make them appear current.

Instead:

- preserve accepted checkpoint reports;
- update current registries and current-state files;
- mark superseded mutable authorities explicitly;
- add migration records only for real structural changes.

## Handover quality gate

The handover is healthy only when a new chat can answer, from the bootstrap cone alone:

1. What is the final product?
2. Who is the target learner and environment?
3. Which sources are complete and incomplete?
4. What are the stable IDs and architecture?
5. What is still deferred?
6. What is the active milestone?
7. Which files are authoritative?
8. What should not be rebuilt or copied?
9. What is the next bounded action?
10. What must be updated after the action?

## Protocol verdict

`REPO_BASED_HANDOVER_ACTIVE`

`NEW_CHAT_BOOTSTRAP_REQUIRES_NO_MANUAL_PROJECT_RECAP`

`UPDATE_CURRENT_STATE_AFTER_MATERIAL_CHECKPOINTS`
