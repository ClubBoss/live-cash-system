# Carrot Grade 3 Batch 04 — Cross-Source Delta v1

Status: `MAPPED / NO_NEW_CORE_CANDIDATE / LECTURE_10_PENDING`

## Sources

- `CP-G3-L08` — Properly Protected Checking Ranges;
- `CP-G3-L09` — Defending in 3-Bet Pots Out of Position.

## Executive result

Batch 04 strengthens existing protected-range and 3-bet-pot mechanisms. It does not introduce an independent general-core mechanism and does not close any of the four remaining direct-drill gaps.

```text
heuristic candidates: 34 unchanged
direct candidate drills: 30/34 unchanged
admitted rules: 0 unchanged
```

## Lecture 08 delta

### Mechanism

```text
IMMEDIATE BET EV
versus
CHECK-BRANCH GAINS / SACRIFICES
→ NEXT-NODE OPPONENT RESPONSE
→ RANGE-PROTECTION REQUIREMENT
→ CONDITIONAL CHECK OR BET
```

### Cross-source fit

Lecture 08 strongly confirms:

- Smash: protected passive ranges need active future branches;
- FTGU: range integrity matters more than one-hand regret;
- Grade 2: robust hands protect checks and calls;
- Cash Injection: exploit the exact branch rather than a generic pool label;
- Grade 3 Feedback Q8: strong checks can preserve value and enable check-raises.

### Boundary added

A theoretically valid strong check is not automatically the best live exploit. Against a passive opponent who rarely bets after checking, immediate betting can dominate. Against an aggressive opponent who over-stabs weak perceived checks, strengthening the checking range can gain EV.

Population magnitude remains field-gated.

## Lecture 09 delta

### Mechanism

```text
PREFLOP RANGE SHAPE
→ TEXTURE INTERSECTION
→ CALL / FOLD GEOGRAPHY
→ TIER-ONE VALUE AVAILABILITY
→ RAISE RANGE ELIGIBILITY
→ LOW-SPR TURN-JAM CONSTRUCTION
```

### Cross-source fit

Lecture 09 strongly confirms:

- Smash: 3-bet-pot postflop plans inherit preflop range shape and SPR;
- FTGU: price, range and realisation jointly determine defence;
- Grade 2: bet shape and relative polarisation govern response and raising;
- Grade 3 L04: raising uses value, bluff and hybrid classes;
- Grade 3 Feedback Q9: texture changes both defence and raise availability.

### Boundaries added

- A small range bet does not create a universal defence frequency.
- A range can be behind overall and still raise if it owns enough tier-one hands.
- A range can defend frequently but raise almost never if it lacks credible top-end value.
- Denial improves already-valid jam candidates; it does not justify jamming the median region.

## Candidate relations

| Candidate | Relation | Batch 04 effect |
|---|---|---|
| `H-W01-006` | EXTENDS | protected passive architecture stronger; exact deep OOP boundary still open |
| `H-W01-009` | CONFIRMS | prior action and range ancestry govern current response |
| `H-W02-004` | STRONGLY CONFIRMS | call/fold/raise geography follows bet shape and thresholds |
| `H-W02-005` | EXTENDS | selected vulnerable or hybrid hands can raise when full-tree EV supports it |
| `H-W02-006` | CONFIRMS | later action depends on filtered prior composition |
| `H-W02-007` | EXTENDS / FIELD_GATED | solver-to-pool override must target the exact checking branch |
| `H-W03-001` | STRONGLY CONFIRMS | 3-bet-pot strategy starts with preflop action, positions and SPR |
| `H-W03-003` | STRONGLY CONFIRMS | range mismatch persists postflop and changes defence |
| `H-W03-006` | STRONGLY CONFIRMS | small bets can require wide defence and active raising |
| `H-R04-010` | STRONGLY EXTENDS | robust hands protect checks and calls |
| `H-R05-002` | STRONGLY CONFIRMS | passive strategies require credible active branches |

No candidate is created, admitted, rejected or migrated.

## Module effects

| Module | Effect |
|---|---|
| `LCM-03` | protected checking and OOP realisation strengthened; exact deep boundary remains open |
| `LCM-04` | texture and branch filtering strengthened |
| `LCM-05` | call/fold/raise response geography strengthened |
| `LCM-06` | check-raise and low-SPR jam classes strengthened |
| `LCM-07` | direct lecture support added for protected 3-bet-pot checks and OOP 3-bet defence |
| `LCM-10` | opponent-specific solver-to-pool check strengthened |
| `LCM-11` | six original assessment families added |

No readiness-state promotion is required before Lecture 10 and later validation.

## Grade 3 exam routing

```text
G3-Q08 → CP-G3-L08 direct + Feedback
G3-Q09 → CP-G3-L09 direct + Feedback
G3-Q10 → Feedback-supported; Lecture 10 pending
```

Nine of ten exam rows now have matching primary lecture support.

## Remaining direct-drill gaps

Unchanged:

- `H-W01-002` — squeeze purification;
- `H-W01-006` — exact deep OOP protected-call boundary;
- `H-W01-008` — polar preflop target folds;
- `H-R04-007` — multiway delayed aggression.

Lecture 08 strengthens the mechanism behind `H-W01-006`, but it does not provide a defensible depth-specific answer key.

## Remaining source-value correction

After Batch 04, Grade 3 source value is concentrated in:

- final Lecture 10 and its 4-bet-pot/low-SPR boundaries;
- any later supplements;
- exact preflop, depth and multiway gaps not covered by Carrot;
- independent anchors and field validation.

## Verdict

`CARROT_G3_BATCH_04_MAPPED`

`G3_Q08_AND_Q09_PRIMARY_LECTURE_SUPPORTED`

`NO_NEW_CORE_CANDIDATE`

`DIRECT_DRILL_COVERAGE_REMAINS_30_OF_34`

`GRADE_3_LECTURE_10_PENDING`
