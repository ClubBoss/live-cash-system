# Live Cash System

Private source-of-truth for a compact, adaptive and executable No-Limit Hold'em live-cash learning system.

## Objective

Convert independent sources into:

- 14–18 robust table-facing rules;
- original adaptive drills and assessments;
- independently derived preflop anchors;
- opponent/environment overlays;
- field-tested live execution.

Source courses provide evidence. They do not become parallel curricula.

## Current source state

| Source family | Status |
|---|---|
| Smash Live Cash | canonical corpus complete; claim-driven visuals only |
| From the Ground Up | 30/30 complete and mapped; charts reference-only |
| Cash Injection | 10/10 complete and mapped; ten hypotheses field-gated |
| Carrot Poker Grade 1 | Lectures 01–04 plus Final Exam and Feedback ingested; L05–L10 pending |
| Carrot Poker Grades 2–3 | pending |

## Current system state

```text
heuristic candidates:             34
stable adaptive modules:          11
misconception classes:            30
remaining-source question IDs:    38
provisional final-rule slots:      16
candidates with direct drills:     30
Carrot-gated direct drill gaps:     4
Carrot G1 assessment families:     10
admitted final rules:               0
intended final core:              14–18
```

Candidate count did not increase after FTGU, Cash Injection or Carrot Grade 1 L01–L04.

## Architecture

```text
source package
→ QA and canonical record
→ source-specific evidence matrix
→ question IDs
→ candidate relation
→ provisional slot/module delta
→ original drill / assessment / boundary / overlay
→ learner testing
→ field evidence
→ admission, revision or rejection
```

## Stable modules

`LCM-01` node/depth; `LCM-02` preflop; `LCM-03` blinds/realisation; `LCM-04` filtering/ownership; `LCM-05` bet/response shape; `LCM-06` aggression; `LCM-07` 3-bet ancestry; `LCM-08` multiway; `LCM-09` river audit; `LCM-10` overlays; `LCM-11` field repair.

## Active authorities

### Synthesis

- `synthesis/HEURISTIC_CANDIDATE_REGISTRY_v0_2.md`;
- `synthesis/CANDIDATE_TO_MODULE_VALIDATION_WORKBENCH_v0_2.md`;
- `synthesis/PROVISIONAL_FINAL_RULE_SLOT_ARCHITECTURE_v0_2.md`;
- `synthesis/REMAINING_SOURCE_QUESTION_MATRIX_v1_1.md`;
- `synthesis/CARROT_EVIDENCE_MATRIX_v0_1.md`.

### Learning

- `learning/GENERAL_LIVE_CASH_ADAPTIVE_ROUTE_v0_2.md`;
- `learning/ADAPTIVE_LEARNER_STATE_SCHEMA_v0_1.md`;
- `learning/ADAPTIVE_COURSE_RUNTIME_v0_1.md`;
- `learning/ADAPTIVE_MODULE_READINESS_MANIFEST_v0_2.md`;
- `learning/assessments/CARROT_G1_EXAM_ORIGINAL_ASSESSMENT_BLUEPRINT_v0_1.md`.

## Retrieval scaffolds

### Preflop

```text
PRICE → RANGE → PLAYERS BEHIND → REALISATION → LINE
```

### Range ancestry

```text
ORIGIN RANGE → ACTION FILTERS → SURVIVING AIR/VALUE → SIZE → BRANCH EVIDENCE
```

### Grade 1 decision protocol

```text
FULL TREE EV
→ MANDATORY / OPTIONAL / PROHIBITED
→ URGENCY / CHECK EV
→ RANGE FAVOURABILITY
→ POLAR / CONDENSED SHAPE
→ SIZE AND CANDIDATE
```

### River

```text
VALUE → SIZE EXCLUSIONS → BLUFF ANCESTRY → BLOCKERS → EVIDENCE
```

## Carrot Grade 1 effect through Lecture 04

Added or strengthened:

- full-tree EV and realisation;
- value and bluff categories;
- urgency and denial;
- favourable/neutral/unfavourable range worlds;
- polarisation and condensation;
- relative hand strength from action history;
- value-driven overbets;
- protected checking ranges;
- assessment and misconception design.

Still open:

- Grade 1 L05–L10;
- squeeze purification;
- deep OOP boundaries;
- polar preflop target folds;
- exact anchors;
- multiway structure;
- Grades 2–3.

## Deferred

- final 14–18-rule compression;
- final rule IDs and wording;
- exact preflop anchors and depth thresholds;
- target-live population frequencies;
- final mastery thresholds;
- `ADMITTED` status.

## Verdict

`SMASH_COMPLETE`

`FTGU_30_OF_30_COMPLETE`

`CASH_INJECTION_10_OF_10_COMPLETE`

`CARROT_GRADE_1_L01_TO_L04_INGESTED`

`NO_GLOBAL_RESTRUCTURE_EXPECTED`
