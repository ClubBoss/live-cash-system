# Live Cash System

Private source-of-truth for a compact, adaptive and executable No-Limit Hold'em live-cash learning system.

## New chat or agent entry point

Read in this order:

1. [`START_HERE.md`](START_HERE.md);
2. [`AGENTS.md`](AGENTS.md);
3. [`state/CURRENT_PROJECT_STATE.yaml`](state/CURRENT_PROJECT_STATE.yaml);
4. [`PROJECT_ATLAS.md`](PROJECT_ATLAS.md).

Repository state overrides chat memory. Continue from the accepted checkpoint rather than restarting project diagnosis.

## Objective

Convert independent sources into:

- approximately 14–18 robust table-facing rules;
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
| Cash Injection | 10/10 complete and mapped; ten pool hypotheses field-gated |
| Carrot Poker Grade 1 | complete: Lectures 01–10, Final Exam and Feedback |
| Carrot Poker Grade 2 | complete: Lectures 01–10, Final Exam and Feedback |
| Carrot Poker Grade 3 | Lectures 01–02 and Final Exam received; later lectures and Feedback pending |

## Current system state

```text
heuristic candidates:              34
stable adaptive modules:           11
misconception classes:             30
remaining-source question IDs:     38
provisional final-rule slots:       16
candidates with direct drills:      30
source-gated direct drill gaps:      4

Carrot Grade 1 assessments:         24
Carrot Grade 2 assessments:         20
Carrot Grade 3 Batch 01:              6
Carrot assessments total:           50

Grade 2 exam runtime modes:           1
Grade 2 feedback repair paths:       10
Grade 3 exam competency rows:        10
admitted final rules:                 0
intended final core:               14–18
```

Candidate count and direct-drill coverage remain unchanged after Grade 3 Batch 01.

## Architecture

```text
source package
→ QA and canonical record
→ source-specific evidence matrix
→ question IDs
→ candidate relation
→ slot/module delta
→ original drill / assessment / boundary / overlay
→ learner testing
→ field evidence
→ admission, revision or rejection
```

## Main retrieval scaffolds

### Preflop

`PRICE → RANGE → PLAYERS BEHIND → REALISATION → LINE`

### Carrot Grade 1

```text
FULL TREE EV
→ VALUE / BLUFF / CALL THRESHOLDS
→ RANGE AND NUT ADVANTAGE
→ FREQUENCY AND SIZE
→ FILTERED TURN FAVOURABILITY
→ RANGE GEOGRAPHY
→ BLOCKER AS FINAL SELECTOR
```

### Carrot Grade 2

```text
ACTION HISTORY
→ RANGE FILTERING
→ WORLD FAVOURABILITY
→ FREQUENCY
→ RELATIVE POLARISATION
→ SIZE / RAISE BREADTH
→ HAND TIER / RESPONSE THRESHOLD
→ CHECK EV / FINISHING EQUITY
→ BLOCKERS
→ FIELD EVIDENCE
```

### Carrot Grade 3 Batch 01

```text
PURE-ACTION GATE
→ NEAR-INDIFFERENT ACTIONS
→ PRACTICAL ACTION / SIZE TOOLKIT
→ RANDOMISE ONLY INSIDE VALID MIXES
→ LOG EV LOSS AND REASONING ERROR
```

### River

`VALUE → SIZE EXCLUSIONS → BLUFF ANCESTRY → ROBUSTNESS → INTERFERENCE → BLOCKERS → EVIDENCE`

## Grade 3 current contribution

Lecture 1 adds:

- pure versus optional actions;
- call/raise/fold indifference thresholds;
- turn-raise composition;
- river repolarisation and interference;
- RNG misuse guardrails.

Lecture 2 adds:

- check/bet mixing;
- one-size simplification;
- practical size toolkits;
- five frequency buckets;
- value-led river bluff allocation.

Exam routing:

```text
G3-Q01 — direct L01 support
G3-Q02 — direct L02 support
G3-Q03–Q07 — partial support
G3-Q08–Q10 — question-only
```

No final Grade 3 answer key exists yet.

## Still open

- Grade 3 Lecture 03 onward;
- Grade 3 Exam Feedback;
- squeeze purification;
- exact deep OOP boundaries;
- polar preflop target folds;
- independent preflop anchors;
- multiway structure;
- exact depth/straddle overlays;
- target-live population calibration.

## Deferred

- final 14–18-rule compression;
- final rule wording and IDs;
- exact preflop anchors;
- exact depth thresholds;
- target-live population frequencies;
- final exploit confidence;
- final mastery thresholds;
- `ADMITTED` status.

## Verdict

`SMASH_COMPLETE`

`FTGU_30_OF_30_COMPLETE`

`CASH_INJECTION_10_OF_10_COMPLETE`

`CARROT_GRADES_1_AND_2_COMPLETE`

`GRADE_3_L01_L02_AND_FINAL_EXAM_RECEIVED`

`GRADE_3_LATER_LECTURES_AND_FEEDBACK_PENDING`

`REPO_BASED_NEW_CHAT_HANDOVER_ACTIVE`

`NO_GLOBAL_RESTRUCTURE_EXPECTED`
