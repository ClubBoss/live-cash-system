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
| Cash Injection | 10/10 complete and mapped; ten pool hypotheses field-gated |
| Carrot Poker Grade 1 | complete: Lectures 01–10, Final Exam and Feedback |
| Carrot Poker Grade 2 | Lectures 01–10 complete; Final Exam and Feedback pending |
| Carrot Poker Grade 3 | pending |

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
Carrot assessments total:           44
admitted final rules:                0
intended final core:               14–18
```

Candidate count did not increase after FTGU, Cash Injection or Carrot Grades 1–2 lectures.

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

## Stable learner modules

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

## Main retrieval scaffolds

### Preflop

`PRICE → RANGE → PLAYERS BEHIND → REALISATION → LINE`

### Range ancestry

`ORIGIN RANGE → ACTION FILTER → CURRENT VALUE/AIR → SIZE REQUIREMENT → BRANCH EVIDENCE`

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
ACTION FILTER
→ RANGE SHAPE
→ WORLD FAVOURABILITY
→ BET FREQUENCY
→ RELATIVE POLARISATION
→ SIZE / RAISE BREADTH
→ HAND TIER
→ RESPONSE THRESHOLD
→ ANCESTRY / EXPLOIT EVIDENCE
```

### River

`VALUE → SIZE EXCLUSIONS → BLUFF ANCESTRY → ROBUSTNESS → BLOCKERS → EVIDENCE`

## Current Carrot effect

Grades 1–2 now provide a mature postflop pedagogical and assessment system covering:

- full-tree EV and action filtering;
- value, bluff, call and raise thresholds;
- frequency versus sizing;
- polarising versus condensing actions;
- value and bluff tiers;
- protected IP/OOP branches;
- robust versus frail continuations;
- range geography facing bets;
- bluff-catching ancestry;
- 3-bet-pot flop planning;
- postflop raising;
- blocker ordering;
- 44 original assessment families.

They do not close:

- squeeze purification;
- exact deep OOP boundaries;
- polar preflop target folds;
- independent preflop anchors;
- multiway structure;
- exact depth/straddle overlays;
- Grade 2 exam/feedback;
- Grade 3.

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

`CARROT_GRADE_1_COMPLETE`

`CARROT_GRADE_2_LECTURE_CORPUS_COMPLETE`

`GRADE_2_EXAM_AND_FEEDBACK_PENDING`

`GRADE_3_PENDING`

`REPO_BASED_NEW_CHAT_HANDOVER_ACTIVE`

`NO_GLOBAL_RESTRUCTURE_EXPECTED`
