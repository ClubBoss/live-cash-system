# Live Cash System — Project Atlas

Status: `ACTIVE / HUMAN_AND_AGENT_NAVIGATION_MAP`

This file explains where each kind of truth lives and how the pieces connect. It is a navigation layer, not a substitute for the underlying authorities.

## Fast navigation

| Need | Open first |
|---|---|
| New chat or new agent | `START_HERE.md`, then `AGENTS.md` |
| Current machine-readable state | `state/CURRENT_PROJECT_STATE.yaml` |
| Repository structure | `governance/REPOSITORY_INFORMATION_ARCHITECTURE_v1.md` |
| Adaptive course model | `governance/ADAPTIVE_COURSE_ARCHITECTURE_v1.md` |
| Frozen versus mutable scope | `governance/PRE_FINALIZATION_FREEZE_AND_MUTATION_POLICY_v1.md` |
| Current source coverage | source-family `source-registry.md` |
| Missing source continuity | source-family `source-gap-ledger.md` |
| Cross-source relations | `synthesis/*EVIDENCE_MATRIX*` |
| Unresolved questions | `synthesis/REMAINING_SOURCE_QUESTION_MATRIX_v1_1.md` |
| Candidate statuses | `synthesis/HEURISTIC_CANDIDATE_REGISTRY_v0_2.md` |
| Candidate ownership and drill coverage | `synthesis/CANDIDATE_TO_MODULE_VALIDATION_WORKBENCH_v0_2.md` |
| Provisional final grouping | `synthesis/PROVISIONAL_FINAL_RULE_SLOT_ARCHITECTURE_v0_2.md` |
| Adaptive learning state | `learning/README.md` and active manifests |
| Latest integrated milestone | latest file under `reports/` plus `START_HERE.md` |

## Whole-system map

```text
                         EXTERNAL SOURCE PACKAGES
                                  │
                                  ▼
┌────────────────────────────────────────────────────────────────────┐
│ sources/                                                           │
│ source-faithful records, registries, gap ledgers, visual audits   │
└────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌────────────────────────────────────────────────────────────────────┐
│ analysis/                                                          │
│ technical QA, lesson audits, contradiction and recovery work      │
└────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌────────────────────────────────────────────────────────────────────┐
│ synthesis/                                                         │
│ relations → questions → candidates → slots                        │
└────────────────────────────────────────────────────────────────────┘
                   │                              │
                   ▼                              ▼
┌─────────────────────────────┐     ┌───────────────────────────────┐
│ ranges/                     │     │ learning/                     │
│ original assumptions,      │     │ modules, learner state,       │
│ validation and anchors     │     │ diagnostics, drills, tests    │
└─────────────────────────────┘     └───────────────────────────────┘
                   │                              │
                   └──────────────┬───────────────┘
                                  ▼
┌────────────────────────────────────────────────────────────────────┐
│ profiles/ + fieldwork/ + hands/                                   │
│ opponent/environment overlays, observations and real-hand repair  │
└────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌────────────────────────────────────────────────────────────────────┐
│ playbook/                                                          │
│ compact provisional and eventually admitted execution rules       │
└────────────────────────────────────────────────────────────────────┘
```

## Source-family atlas

### Smash Live Cash

Path: `sources/smash-live-cash/`

State:

- canonical source corpus complete;
- no open audio or lesson-level cleanup backlog;
- claim-driven visual checks only;
- primary advanced evidence for depth, multiway, 3-bet pots and range composition.

### From the Ground Up

Path: `sources/ftgu/`

State:

- `30/30` episodes complete;
- foundational sequencing and pedagogical compression mapped;
- supplied hand charts are private reference only;
- no broad rerun or rewatch required.

### Cash Injection

Path: `sources/cash-injection/`

State:

- `10/10` episodes complete;
- exploit and range-ancestry pass complete;
- ten pool hypotheses remain field-gated;
- main accepted scaffold:

```text
ORIGIN RANGE WIDTH
→ FILTER DENSITY
→ SURVIVING AIR / VALUE
→ SIZE ELASTICITY
→ BRANCH-SPECIFIC RESPONSE
→ EVIDENCE / FALSIFIER
```

### Carrot Poker

Path: `sources/carrot-poker/`

State:

- one unified corpus for Grades 1–3;
- Grade 1 Lectures `01–09` ingested;
- Grade 1 Final Exam and Exam Feedback stored separately;
- Lecture `10` pending;
- Grades 2–3 pending;
- active purpose: close/refine boundaries, pedagogy, preflop/depth/multiway gaps and assessment design.

## Current strategic inventory

```text
34 heuristic candidates
→ 9 consolidation lanes
→ 16 provisional final-rule slots
→ expected final core of approximately 14–18 rules
```

Current statuses:

- `27` DRILL_READY;
- `7` VALIDATION_PENDING;
- `0` ADMITTED.

Direct original drill coverage:

- `30/34` candidates;
- four source-gated gaps:
  - squeeze purification;
  - deep OOP protected calls;
  - polar preflop target folds;
  - multiway delayed aggression.

## Adaptive learning atlas

Stable modules:

| ID | Purpose |
|---|---|
| `LCM-01` | Node and effective depth |
| `LCM-02` | Preflop range architecture |
| `LCM-03` | Blind identity and realisation |
| `LCM-04` | Action filtering and ownership |
| `LCM-05` | Bet shape and response shape |
| `LCM-06` | Aggression and future jobs |
| `LCM-07` | 3-bet-pot ancestry |
| `LCM-08` | Multiway structure |
| `LCM-09` | River audit |
| `LCM-10` | Opponent and environment overlays |
| `LCM-11` | Field transfer and repair |

Learner-state dimensions include:

- node recognition;
- mechanism explanation;
- action selection;
- boundary knowledge;
- speed;
- confidence calibration;
- transfer to changed variants;
- delayed retention;
- field application.

A correct action with an incorrect reason is not mastery.

## Current retrieval scaffolds

### Preflop

```text
PRICE → RANGE → PLAYERS BEHIND → REALISATION → LINE
```

### Postflop

```text
RANGE ADVANTAGE → URGENCY → BET SHAPE → RESPONSE SHAPE
```

### Range ancestry

```text
ORIGIN RANGE
→ ACTION FILTERS
→ CURRENT VALUE / AIR
→ SIZE REQUIREMENT
→ BRANCH EVIDENCE
```

### Carrot Grade 1 through Lecture 09

```text
FULL TREE EV
→ CALL / VALUE / BLUFF THRESHOLDS
→ RANGE AND NUT ADVANTAGE
→ FREQUENCY AND SIZE
→ FILTERED TURN FAVOURABILITY
→ POLAR / SEMI-POLAR CONSTRUCTION
→ RIVER TEXTURE AND RANGE GEOGRAPHY
```

### River audit

```text
VALUE
→ SIZE EXCLUSIONS
→ BLUFF ANCESTRY
→ BLOCKERS
→ EVIDENCE
```

## Product-facing purity boundary

Private research records may describe proprietary source material. Product-facing outputs must use:

- original wording;
- original examples;
- original drills and assessments;
- independently derived or licensed ranges;
- explicit assumptions;
- no copied course charts, screenshots or exam spots;
- no author-specific sequence masquerading as the product curriculum.

## Current active path

```text
Carrot Grade 1 Lecture 10
→ Carrot Grades 2–3
→ close/context-split remaining questions
→ finalise four drill factories
→ consolidate candidates
→ build independent anchors
→ learner testing
→ field testing
→ admission
```

## Historical versus active documents

Use explicit status headers.

- `ACTIVE`, `CURRENT`, `SSOT` or `AUTHORITY` files control current work.
- old versioned files remain historical snapshots unless an active index points to them.
- terminal reports prove checkpoint completion but do not override newer registries.
- the provisional Playbook is a reasoning snapshot until final admission.

## Atlas maintenance

Update this atlas only when one of these changes:

- stable repository architecture;
- active authority routing;
- source-family lifecycle state;
- module graph;
- finalisation path;
- major coverage counts.

Routine lesson ingestion should normally update `CURRENT_PROJECT_STATE.yaml` and source authorities, not rewrite this atlas.

## Atlas verdict

`ONE_REPOSITORY / ONE_ADAPTIVE_CURRICULUM`

`SOURCE_FAMILIES_REMAIN_INDEPENDENT AT EVIDENCE LAYER`

`NEW_CHATS_CAN_NAVIGATE WITHOUT FULL_REPO_RESCAN`
