# Live Cash System — Start Here

Status: `ACTIVE / PRIMARY_NEW_CHAT_BOOTSTRAP`

This is the first file a new ChatGPT thread, coding agent or analyst should read.

## One-line bootstrap instruction

Use the live `main` branch of `ClubBoss/live-cash-system`. Read `START_HERE.md`, obey `AGENTS.md`, inspect `state/CURRENT_PROJECT_STATE.yaml`, and then open only the authority files required for the active milestone. Do not restart the project diagnosis or rebuild the repository taxonomy.

## Project mission

Build a compact, adaptive and interactive No-Limit Hold'em live-cash learning system for a strong MTT player moving into live cash.

Target environment:

- primary stakes: live `1/3` and `2/5`;
- common effective depth: `100–200bb`;
- occasional depth: `300–400bb`;
- possible straddles and shorter effective stacks;
- practical deployment target: Batumi live games.

Known learner priorities:

- SB versus BB;
- BB defence and range identity;
- deep-stack translation from MTT to cash;
- OOP decisions against frequent 3-bets;
- protected passive ranges;
- 3-bet-pot ancestry;
- multiway structure;
- river range reconstruction and bluff-catching.

Learning constraints:

- minimal chart memorisation;
- compact heuristics, decision trees and anchor ranges;
- short interactive sessions;
- prediction before feedback;
- action and reasoning scored separately;
- spaced repetition and changed variants;
- live field missions and post-session repair.

## Intended final system

The final product should contain:

- approximately `14–18` robust table-facing rules;
- original compact preflop anchors with explicit rake, depth and sizing assumptions;
- `11` stable adaptive learning modules;
- original diagnostics, drills and assessments;
- misconception-linked feedback;
- opponent and environment overlays;
- field evidence and confidence decay;
- a compact executable Playbook;
- no copied proprietary course charts, exam spots or author-specific curriculum.

Source courses provide evidence. They do not become separate learner routes.

## Current source truth

| Source family | Current state |
|---|---|
| Smash Live Cash | canonical corpus complete; only claim-driven visual checks may remain |
| From the Ground Up | `30/30` complete and mapped; supplied charts are reference-only |
| Cash Injection | `10/10` complete and mapped; `CI-PH-001` through `CI-PH-010` remain field-gated |
| Carrot Poker Grade 1 | Lectures `01–09`, Final Exam PDF and Exam Feedback ingested; Lecture `10` pending |
| Carrot Poker Grades 2–3 | pending |

The current Carrot registry is authoritative for exact received coverage:

`sources/carrot-poker/source-registry.md`

## Current system truth

```text
heuristic candidates:              34
stable adaptive modules:           11
misconception classes:             30
remaining-source question IDs:     38
provisional final-rule slots:       16
candidates with direct drills:      30
source-gated direct drill gaps:      4
Grade 1 original assessment families: 18
admitted final rules:                0
intended final core:               14–18
```

The candidate count has not increased after FTGU, Cash Injection or Carrot Grade 1 Lectures 01–09.

## Stable architecture

```text
source package
→ technical QA and immutable source record
→ source-specific evidence matrix
→ remaining-question IDs
→ candidate relation
→ provisional consolidation slot
→ adaptive module delta
→ original drill / assessment / boundary / overlay
→ learner testing
→ field evidence
→ admission, revision or rejection
```

Stable module IDs:

```text
LCM-01  NODE + EFFECTIVE DEPTH
LCM-02  PREFLOP RANGE ARCHITECTURE
LCM-03  BLIND IDENTITY + REALISATION
LCM-04  ACTION FILTERING + OWNERSHIP
LCM-05  BET SHAPE + RESPONSE SHAPE
LCM-06  AGGRESSION + FUTURE JOBS
LCM-07  3-BET-POT ANCESTRY
LCM-08  MULTIWAY STRUCTURE
LCM-09  RIVER AUDIT
LCM-10  OPPONENT / ENVIRONMENT OVERLAYS
LCM-11  FIELD TRANSFER + REPAIR
```

## Frozen identities and constraints

Do not casually rename or replace:

- source-family IDs and source IDs;
- `34` heuristic candidate IDs;
- `30` misconception IDs;
- module IDs `LCM-01` through `LCM-11`;
- existing original drill IDs;
- learner-state dimensions;
- relation vocabulary;
- `38` remaining-source question IDs.

Do not:

- create author-specific parallel curricula;
- copy proprietary charts, solver screenshots, exam questions or source sequencing into the product;
- treat exam feedback as a replacement for missing lectures;
- promote population claims to live defaults without field evidence;
- declare a candidate admitted because several courses agree;
- rebuild the repository structure for aesthetic reasons;
- erase learner progress when a source only simplifies or extends an existing mechanism;
- infer exact cards, sizes or frequencies from uncertain audio when the visual is absent.

## Active milestone

The active milestone is:

```text
complete Carrot Grade 1 Lecture 10
→ ingest Carrot Grades 2 and 3 incrementally
→ close or context-split remaining preflop, depth and multiway questions
→ finalise four source-gated drill factories
→ consolidate 34 candidates into approximately 14–18 final rules
→ build original anchors
→ run learner and field validation
→ admit, revise or reject
```

A normal new Carrot batch should change only:

- `sources/carrot-poker/` canonical records and registry/ledger;
- one bounded QA report;
- the Carrot evidence matrix;
- affected question/candidate/slot/module rows;
- justified original drills or assessments;
- readiness only when a state actually changes;
- the handover state files when the checkpoint materially changes.

It should not trigger a global Playbook rewrite.

## Current unresolved high-value gates

- Grade 1 Lecture 10;
- Carrot Grades 2 and 3;
- squeeze candidate purification;
- deep OOP protected-call boundaries;
- polar preflop target folds and profitable call branch;
- exact live-rake preflop anchors;
- multiway shared defence;
- multiway bluff construction;
- multiway delayed aggression;
- exact depth/SPR and straddle overlays;
- target-live population calibration;
- final rule compression and admission.

## Minimum reading order for a new chat

Read only this cone first:

1. `START_HERE.md`;
2. `AGENTS.md`;
3. `state/CURRENT_PROJECT_STATE.yaml`;
4. `PROJECT_ATLAS.md`;
5. the registry and latest terminal report for the source family currently being processed;
6. `synthesis/REMAINING_SOURCE_QUESTION_MATRIX_v1_1.md`;
7. `synthesis/HEURISTIC_CANDIDATE_REGISTRY_v0_2.md`;
8. `learning/README.md`.

Read broader source or archive material only when the active task requires it.

## Active authority order

1. Canonical source record controls what a source said.
2. Source-family registry controls received coverage.
3. Source-specific evidence matrix controls source relations.
4. Remaining-question matrix controls unresolved validation state.
5. Candidate registry controls candidate status.
6. Candidate-to-module workbench controls module ownership and drill coverage.
7. Provisional slot architecture controls non-final grouping.
8. Adaptive readiness controls learner-facing readiness.
9. The provisional Playbook is not the final authority.

## New-batch execution contract

For each uploaded batch:

```text
inventory
→ identify byte-identical duplicates
→ checksum and technical QA
→ assign immutable source IDs
→ create source-faithful records
→ update source registry and gap ledger
→ write one bounded cross-source delta
→ update only affected evidence/questions/modules
→ create original learner material only when the answer key is stable
→ update handover state if the project checkpoint changed
```

## Required terminal report

Every completed source batch should return:

- exact archive identity and checksum;
- duplicates versus new delta;
- source IDs created;
- QA verdict and rerun requirement;
- strongest strategic contribution;
- real conflicts or context splits;
- candidate-count effect;
- drill/assessment effect;
- exact remaining coverage;
- files and commits written;
- terminal verdict;
- one highest-EV next action.

## Latest integrated source checkpoint

`CARROT_G1_BATCH_03_COMPLETE`

- Grade 1 Lectures `01–09` canonically ingested;
- Final Exam PDF and Exam Feedback retained separately;
- Lecture `10` pending;
- `18` original Grade 1 assessment families;
- no rerun required;
- no new core candidate;
- no global restructure required.

Checkpoint report:

`reports/CARROT_G1_BATCH_03_TERMINAL_REPORT_v1.md`

## New-chat response capsule

After reading the bootstrap cone, a new chat should briefly state:

```text
repo and live branch checked
active source checkpoint understood
frozen identities understood
current open gates understood
next bounded action selected
no global restart planned
```

Then continue the work rather than producing a new broad diagnosis.

## Bootstrap verdict

`START_HERE_IS_THE_PRIMARY_NEW_CHAT_ENTRY_POINT`

`REPO_STATE_OVERRIDES_CHAT_MEMORY`

`CONTINUE_INCREMENTALLY / DO_NOT_RESTART`
