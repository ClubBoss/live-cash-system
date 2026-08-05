# Live Cash System — Remaining Source Question Matrix v1.1

Status: `ACTIVE_ROUTING_SSOT / CASH_INJECTION_COMPLETE / CARROT_GRADES_1_TO_3_PENDING`

This file supersedes v1 for current question status while preserving all question IDs and closure definitions.

## Status vocabulary

- `OPEN`
- `PARTIAL`
- `MECHANISM_CLOSED`
- `CONTEXT_SPLIT`
- `BOUNDARY_PENDING`
- `ANCHOR_PENDING`
- `FIELD_PENDING`
- `VISUAL_PENDING`
- `NOT_REQUIRED`

## A. Depth, SPR and preflop architecture

| Question | Current state after Cash Injection | Remaining preferred evidence | Affected slots |
|---|---|---|---|
| `SQ-DEP-01` depth bands | PARTIAL | Carrot depth treatment | 1 |
| `SQ-DEP-02` deep OOP protected calls | OPEN | Carrot deep-OOP boundaries and counterexamples | 6 |
| `SQ-DEP-03` straddle sizing objectives | PARTIAL | Carrot if present; environment/field profile | 2 |
| `SQ-PF-01` squeeze purification | OPEN | Carrot preflop construction | 3 |
| `SQ-PF-02` dominated high cards versus value-heavy 3-bets | PARTIAL / ANCHOR_PENDING | Carrot plus independent ranges | 11 |
| `SQ-PF-03` polar bluff target folds and call branch | PARTIAL | Carrot polar/linear/mixed treatment | 3 |
| `SQ-PF-04` players-behind compression | PARTIAL / STRONG | Carrot cold-call and squeeze-risk treatment | 3, 4 |

## B. Blinds, filtering and single-raised pots

| Question | Current state after Cash Injection | Remaining preferred evidence | Affected slots |
|---|---|---|---|
| `SQ-SRP-01` minimum blind/cold-caller distinctions | PARTIAL / STRONG | Carrot simplification and original anchors | 4 |
| `SQ-SRP-02` update after flop exploit continues | MECHANISM_CLOSED | examples only unless conflict appears | 5 |
| `SQ-SRP-03` medium-strength raises versus small/wide bets | MECHANISM_CLOSED / BOUNDARY_PENDING | Carrot depth/board boundaries | 7 |
| `SQ-SRP-04` turn lead from flop composition | MECHANISM_CLOSED / MULTIWAY_SCOPE_PENDING | Carrot donk/probe and multiway material | 10 |
| `SQ-SRP-05` protected passive architecture | MECHANISM_CLOSED / DEPTH_BOUNDARY_PENDING | Carrot deep-OOP and protected-check treatment | 6, 7 |

## C. Bet shape, aggression and future streets

| Question | Current state after Cash Injection | Remaining preferred evidence | Affected slots |
|---|---|---|---|
| `SQ-AGG-01` value-first table algorithm | PARTIAL / STRONG | Carrot alternative compression and exceptions | 8 |
| `SQ-AGG-02` bluff-job taxonomy | PARTIAL / STRONG | Carrot multi-street construction | 8, 15 |
| `SQ-AGG-03` polarization-preserving overbets | PARTIAL / STRONG | Carrot sizing boundaries; claim-driven visuals | 9 |
| `SQ-AGG-04` small-size defence elasticity | MECHANISM_CLOSED / FIELD_PENDING | local response magnitude only | 7, 16 |

## D. 3-bet-pot ancestry and branch modelling

| Question | Current state after Cash Injection | Remaining preferred evidence | Affected slots |
|---|---|---|---|
| `SQ-3B-01` compact preflop-shape branches | PARTIAL / STRONG | Carrot 3-bet-pot pedagogy | 11 |
| `SQ-3B-02` compensation for over-wide ranges | PARTIAL / STRONG | Carrot postflop compensation | 12 |
| `SQ-3B-03` strong bet branch versus weak check/raise branch | MECHANISM_CLOSED / FIELD_PENDING | local frequency and protected-branch calibration | 12, 16 |
| `SQ-3B-04` later bluff supply from preflop families | MECHANISM_CLOSED / BOUNDARY_PENDING | Carrot simplification and anchor support | 11, 15 |

## E. Multiway structure

| Question | Current state after Cash Injection | Remaining preferred evidence | Affected slots |
|---|---|---|---|
| `SQ-MW-01` shared defence by action order | OPEN / SMASH_PRIMARY | Carrot multiway material | 13 |
| `SQ-MW-02` minimum equity/removal for bluffs | OPEN / SMASH_PRIMARY | Carrot multiway bluff construction | 13 |
| `SQ-MW-03` nut ownership from preflop combos | PARTIAL | Carrot plus independent anchors | 13 |
| `SQ-MW-04` suppressed aggression reappearing later | PARTIAL | Carrot multiway/sandwich evidence | 10, 13 |
| `SQ-MW-05` fast-play when aggression will not arrive | PARTIAL / FIELD_PENDING | Carrot exploit context plus live observations | 14 |

## F. River audit and blockers

| Question | Current state after Cash Injection | Remaining preferred evidence | Affected slots |
|---|---|---|---|
| `SQ-RIV-01` size exclusions before bluff-catching | MECHANISM_CLOSED / BOUNDARY_REFINEMENT_ONLY | Carrot examples or claim-driven visuals | 15 |
| `SQ-RIV-02` airless versus air-rich ancestry | MECHANISM_CLOSED / FIELD_PENDING | local population calibration | 15, 16 |
| `SQ-RIV-03` blocker only after ancestry | MECHANISM_CLOSED | simplification only | 15 |

## G. Opponent modelling and field evidence

| Question | Current state after Cash Injection | Remaining preferred evidence | Affected slots |
|---|---|---|---|
| `SQ-EXP-01` evidence grade before exploit | MECHANISM_CLOSED / FIELD_CALIBRATION_PENDING | learner and live data | 16 |
| `SQ-EXP-02` remove floats versus value-heavy bets | MECHANISM_CLOSED / FIELD_PENDING | local branch evidence | 16 |
| `SQ-EXP-03` passive-pool fast-play | PARTIAL / FIELD_PENDING | Carrot if present plus local evidence | 14, 16 |
| `SQ-EXP-04` live tells as weighted evidence | MECHANISM_CLOSED / FIELD_PENDING | field examples | 16 |
| `SQ-EXP-05` overfold/under-three-bet versus small raises | MECHANISM_CLOSED / FIELD_PENDING | Batumi observations | 7, 16 |

## H. Learning and ranges

| Question | Current state | Remaining preferred evidence |
|---|---|---|
| `SQ-LRN-01` simpler explanation | OPEN CONTINUOUSLY | every Carrot lesson and learner response |
| `SQ-LRN-02` genuinely new misconception | OPEN CONTINUOUSLY | Carrot and learner data |
| `SQ-LRN-03` missing counterexample/boundary | OPEN CONTINUOUSLY | Carrot and drill failures |
| `SQ-RNG-01` original live preflop anchors | ANCHOR_PENDING | Carrot comparison plus independent range work |
| `SQ-RNG-02` exact visuals necessary for a decision | VISUAL_PENDING / CLAIM_DRIVEN | only disputed exact claims |

## Cash Injection closure effect

Cash Injection closes the general mechanism for:

- filter density and origin-range ancestry;
- small-size response elasticity;
- branch-specific overfold/underbluff separation;
- protected check/check-back ranges;
- induced probe and float responses;
- blockers after credible value/bluff reconstruction;
- exploitative folding in air-poor filtered nodes.

It does not close:

- target live population magnitude;
- multiway scope;
- deep-OOP boundaries;
- squeeze construction;
- exact preflop anchors;
- exact depth and straddle thresholds.

## Carrot routing priority

Carrot Grades 1–3 should now prioritise questions still marked:

- `OPEN`;
- `PARTIAL`;
- `BOUNDARY_PENDING`;
- `ANCHOR_PENDING`.

For `MECHANISM_CLOSED` questions, Carrot may only:

- simplify;
- add a counterexample;
- create a context split;
- reveal a real conflict.

It should not duplicate the mechanism as a new candidate.

## Matrix verdict

`CASH_INJECTION_QUESTION_PASS_COMPLETE`

`CARROT_WORKLOAD_IS_BOUNDARY_MULTIWAY_PREFLOP_AND_DEPTH_FOCUSED`

`FIELD_PENDING_ITEMS_HAVE_DEFINED_OBSERVATION ROUTES`
