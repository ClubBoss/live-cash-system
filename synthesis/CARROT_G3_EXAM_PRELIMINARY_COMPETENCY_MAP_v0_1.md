# Carrot Grade 3 Exam — Competency Map v0.1

Status: `EXAM_AND_FEEDBACK_MAPPED / LECTURES_01_TO_04_ATTACHED / LATER_LECTURES_PENDING`

## Purpose

Route the ten Grade 3 exam competencies to lecture and answer-key evidence while preserving the distinction between complete answer-key continuity and incomplete lecture continuity.

## Sources

- `CP-G3-EXAM` — Final Exam PDF;
- `CP-G3-L01` — Mixing: Facing Bets;
- `CP-G3-L02` — Mixing Continued: Bet / Check and Size Toolkit;
- `CP-G3-L03` — Common Blocker Effects;
- `CP-G3-L04` — Raising and Beyond;
- `CP-G3-EXAM-FB` — Final Exam Feedback.

## Competency rows

| Exam row | Visible competency family | Primary module | Lecture evidence | Answer-key state |
|---|---|---|---|---|
| `G3-Q01` | turn call/raise selection across draws and made hands | `LCM-05` | `CP-G3-L01` direct; L04 secondary | FEEDBACK_MAPPED |
| `G3-Q02` | mixed betting, thin large value and sizing ceiling | `LCM-06` | `CP-G3-L02` direct | FEEDBACK_MAPPED |
| `G3-Q03` | suit-specific bluff selection and hybrid betting | `LCM-06` | `CP-G3-L03` direct; L02/L04 secondary | FEEDBACK_MAPPED |
| `G3-Q04` | five-part check-raise range and turn class migration | `LCM-06` | `CP-G3-L04` direct | FEEDBACK_MAPPED |
| `G3-Q05` | river bluff-catching, bluff unblocking and solver-output coaching | `LCM-09` | L01/L03 secondary | FEEDBACK_MAPPED |
| `G3-Q06` | very large river/turn overbet architecture and size compression | `LCM-06` | L02/L03 secondary | FEEDBACK_MAPPED |
| `G3-Q07` | river overbet, showdown-value scarcity and missed aggression | `LCM-09` | L01–L03 secondary | FEEDBACK_MAPPED |
| `G3-Q08` | protected checks and high check-raise frequency in a 3-bet pot | `LCM-07` | L04 transferable secondary; matching later lecture pending | FEEDBACK_MAPPED |
| `G3-Q09` | texture-dependent 3-bet-pot defence and turn hybrid raise | `LCM-07` | L04 strong secondary | FEEDBACK_MAPPED |
| `G3-Q10` | low-SPR 4-bet-pot turn strategy and absent-raise logic | `LCM-07` | no matching lecture yet | FEEDBACK_MAPPED |

All ten rows now have source answer-key evidence. `G3-Q08` and `G3-Q10` still lack matching primary lecture continuity.

## Lecture routing

### Lecture 1

Primary: `G3-Q01`.

Secondary: `G3-Q04`, `G3-Q05`, `G3-Q07`.

Mechanisms:

- pure versus mixed action classification;
- call/raise/fold thresholds;
- turn-raise composition;
- river repolarisation and interference;
- RNG misuse repair.

### Lecture 2

Primary: `G3-Q02`.

Secondary: `G3-Q03`, `G3-Q06`, `G3-Q07`.

Mechanisms:

- check/bet mixing;
- practical size toolkits;
- one-size simplification;
- frequency buckets;
- value-led size and bluff allocation;
- runout re-bucketing.

### Lecture 3

Primary: `G3-Q03`.

Strong secondary: `G3-Q05`, `G3-Q06`, `G3-Q07`.

Mechanisms:

- blocker-function vector;
- world-favourability selectivity;
- unblocking folds;
- missed-backdoor interference;
- blocker ordering for bluffs and calls.

### Lecture 4

Primary: `G3-Q04`.

Strong secondary: `G3-Q08`, `G3-Q09`.

Secondary: `G3-Q01`, `G3-Q03`.

Mechanisms:

- five-part flop raise range;
- candidate versus mandatory raise;
- opponent call as a filter;
- turn class migration;
- turn toolkit after a called raise.

## Exam Feedback routing

`CP-G3-EXAM-FB` supplies answer-key support for `G3-Q01` through `G3-Q10`.

It validates:

- a higher raise threshold than call threshold;
- value-led size ceilings;
- blocker-specific bluff selection;
- turn class migration;
- theory-to-pool bluff-catching adjustment;
- equilibrium versus exploit size distinction;
- favourable-river showdown-value scarcity;
- protected checks and check-raise value capture;
- texture-dependent 3-bet-pot defence;
- OOP thin value/denial in low-SPR 4-bet pots.

Authority:

`sources/carrot-poker/transcripts/CP_G3_EXAM_FEEDBACK.md`

## Original learner layer

Lecture authorities:

- `learning/assessments/CARROT_G3_L01_L02_ORIGINAL_ASSESSMENT_BLUEPRINT_v0_1.md` — six families;
- `learning/assessments/CARROT_G3_L03_L04_ORIGINAL_ASSESSMENT_BLUEPRINT_v0_1.md` — seven families.

Feedback authority:

- `learning/assessments/CARROT_G3_EXAM_FEEDBACK_ORIGINAL_REPAIR_MAP_v0_1.md` — ten repair paths.

Count:

```text
Grade 1 families:        24
Grade 2 families:        20
Grade 3 lecture families:13
Total Carrot families:   57
Grade 3 feedback repairs:10
```

## Existing candidate lanes

Grade 3 Lectures 01–04 and Feedback refine:

- action filtering and ownership;
- bet shape and response shape;
- aggression and future jobs;
- 3-bet-pot ancestry;
- river audit;
- field-gated exploit overrides;
- adaptive assessment and misconception repair.

No new heuristic candidate is required.

## What remains unsupported

Later Grade 3 lectures remain pending. Lecture 4 explicitly announces Lecture 5.

Still not supplied by the received Grade 3 lecture set:

- direct preflop squeeze construction;
- exact preflop anchors;
- players-behind compression;
- multiway strategy;
- straddle-specific adjustments;
- exact 200–400bb thresholds.

Exact combinations, solver frequencies and EV remain visual-dependent.

## Count effect

```text
heuristic candidates: 34 unchanged
original Carrot assessment families: 50 → 57
source-gated direct drill gaps: 4 unchanged
admitted rules: 0 unchanged
```

## Future transaction

```text
next Grade 3 lecture
→ canonical record
→ attach to G3-Q row(s)
→ compare with existing feedback answer key
→ map boundary or counterexample
→ add original assessment only if non-duplicative
```

## Verdict

`ALL_G3_Q01_TO_Q10_HAVE_FEEDBACK_ANSWER_KEY_SUPPORT`

`G3_L01_TO_L04_LECTURE_ROUTING_ACTIVE`

`GRADE_3_LATER_LECTURES_PENDING`

`NO_NEW_CORE_CANDIDATE`
