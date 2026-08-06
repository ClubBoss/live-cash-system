# Live Cash System - Remaining Evidence Question Matrix v1.4

Status: `ACTIVE_ROUTING_SSOT / PREFLOP_ANCHOR_WAVE_COMPLETE / POST_SOURCE_EVIDENCE_PHASE`

Supersedes `REMAINING_SOURCE_QUESTION_MATRIX_v1_3.md` while preserving all 38 question IDs.

## Status vocabulary

- `MECHANISM_CLOSED`
- `PARTIAL`
- `BOUNDARY_PENDING`
- `ANCHOR_ACTIVE`
- `ANCHOR_PENDING`
- `VISUAL_PENDING`
- `DRILL_READY`
- `DRILL_PENDING`
- `LEARNER_PENDING`
- `FIELD_PENDING`
- `CONTINUOUS`
- `NOT_REQUIRED`

## A. Depth, SPR and preflop architecture

| Question | Current state | Binding next evidence | Affected slots |
|---|---|---|---|
| `SQ-DEP-01` depth bands | `PARTIAL / STRUCTURAL_BANDS_ACTIVE / BOUNDARY_PENDING` | exact line-specific tests across 40-60/80-120/150-250/300-400bb | 1 |
| `SQ-DEP-02` deep OOP protected calls | `MECHANISM_CLOSED / BOUNDARY_PENDING / VISUAL_PENDING / DRILL_PENDING` | exact deep OOP geometry and independent response tests | 6 |
| `SQ-DEP-03` straddle sizing objectives | `PARTIAL / DENOMINATOR_RULE_ACTIVE / FIELD_PENDING` | room sizing and straddled-game validation | 2 |
| `SQ-PF-01` squeeze purification | `MECHANISM_CLOSED / ANCHOR_ACTIVE / DRILL_READY` | exact mixes, rake/depth calibration and learner misuse data | 3 |
| `SQ-PF-02` dominated high cards versus value-heavy 3-bets | `MECHANISM_CLOSED / FOLD_FIRST_HIERARCHY_ACTIVE / ANCHOR_PENDING` | exact continue ranges by position/depth/rake | 11 |
| `SQ-PF-03` polar bluff target folds and call branch | `MECHANISM_CLOSED / ANCHOR_ACTIVE / DRILL_READY` | exact response mixes and target-game fold/5-bet evidence | 3 |
| `SQ-PF-04` players-behind compression | `MECHANISM_CLOSED / OVERLAY_ACTIVE / LEARNER_PENDING` | latency and changed-node misuse testing | 3, 4 |

## B. Blinds, filtering and single-raised pots

| Question | Current state | Binding next evidence | Affected slots |
|---|---|---|---|
| `SQ-SRP-01` minimum blind/cold-caller distinctions | `MECHANISM_CLOSED / ANCHOR_ACTIVE / ROOM_CALIBRATION_PENDING` | exact room sizes/rake and learner retrieval | 4 |
| `SQ-SRP-02` update after flop exploit continues | `MECHANISM_CLOSED` | learner speed and changed-node testing only | 5 |
| `SQ-SRP-03` medium-strength raises versus small/wide bets | `MECHANISM_CLOSED / LEARNER_PENDING` | misuse testing and selected depth/board contrasts | 7 |
| `SQ-SRP-04` turn lead from flop composition | `MECHANISM_CLOSED / MULTIWAY_BOUNDARY_PENDING` | multiway action-order integration | 10 |
| `SQ-SRP-05` protected passive architecture | `MECHANISM_CLOSED / DEPTH_BOUNDARY_PENDING` | deep OOP boundary and minimum resistance tests | 6, 7 |

## C. Bet shape, aggression and future streets

| Question | Current state | Binding next evidence | Affected slots |
|---|---|---|---|
| `SQ-AGG-01` value-first table algorithm | `MECHANISM_CLOSED / COMPRESSION_PENDING` | learner retrieval and final cue optimisation | 8 |
| `SQ-AGG-02` bluff-job taxonomy | `MECHANISM_CLOSED / CONTEXT_SPLIT / LEARNER_PENDING` | immediate exploit EV versus future-job misuse testing | 8, 15 |
| `SQ-AGG-03` polarization-preserving overbets | `MECHANISM_CLOSED / BOUNDARY_PENDING / VISUAL_PENDING` | exact size exceptions only where admission depends on them | 9 |
| `SQ-AGG-04` small-size defence elasticity | `MECHANISM_CLOSED / FIELD_PENDING / LEARNER_PENDING` | target-live response and diagnostic errors | 7, 16 |

## D. 3-bet and 4-bet ancestry

| Question | Current state | Binding next evidence | Affected slots |
|---|---|---|---|
| `SQ-3B-01` compact preflop-shape branches | `MECHANISM_CLOSED / ANCHOR_ACTIVE / EXACT_MATRIX_PENDING` | independent solver calibration and learner retrieval | 11 |
| `SQ-3B-02` compensation for over-wide ranges | `MECHANISM_CLOSED / BOUNDARY_PENDING / LEARNER_PENDING` | depth/position exceptions and misuse testing | 12 |
| `SQ-3B-03` strong bet branch versus weak check/raise branch | `MECHANISM_CLOSED / FIELD_PENDING` | target-game branch frequency and falsifiers | 12, 16 |
| `SQ-3B-04` later bluff supply from preflop families | `MECHANISM_CLOSED / ANCHOR_ACTIVE / LEARNER_PENDING` | ancestry counting speed and exact family calibration | 11, 15 |

## E. Multiway structure

| Question | Current state | Binding next evidence | Affected slots |
|---|---|---|---|
| `SQ-MW-01` shared defence by action order | `PARTIAL / BOUNDARY_PENDING / VISUAL_PENDING` | exact action-order examples and independent abstractions | 13 |
| `SQ-MW-02` minimum equity/removal for bluffs | `PARTIAL / BOUNDARY_PENDING / VISUAL_PENDING` | original bluff hierarchy and counterexamples | 13 |
| `SQ-MW-03` nut ownership from preflop combos | `PARTIAL / ANCHOR_PENDING / VISUAL_PENDING` | multiway source-range compression and original anchors | 13 |
| `SQ-MW-04` suppressed aggression reappearing later | `PARTIAL / BOUNDARY_PENDING / DRILL_PENDING / VISUAL_PENDING` | sandwich/delayed-aggression answer key | 10, 13 |
| `SQ-MW-05` fast-play when aggression will not arrive | `PARTIAL / FIELD_PENDING / BOUNDARY_PENDING` | passive target-game evidence and action-order scope | 14 |

## F. River audit and blockers

| Question | Current state | Binding next evidence | Affected slots |
|---|---|---|---|
| `SQ-RIV-01` size exclusions before bluff-catching | `MECHANISM_CLOSED / FIELD_PENDING` | target-live size and underbluff calibration | 15 |
| `SQ-RIV-02` airless versus air-rich ancestry | `MECHANISM_CLOSED / FIELD_PENDING / LEARNER_PENDING` | branch evidence and reconstruction speed | 15, 16 |
| `SQ-RIV-03` blockers only after ancestry | `MECHANISM_CLOSED / COMPRESSION_PENDING` | final selector wording and misuse repair | 15 |

## G. Opponent modelling and field evidence

| Question | Current state | Binding next evidence | Affected slots |
|---|---|---|---|
| `SQ-EXP-01` evidence grade before exploit | `MECHANISM_CLOSED / FIELD_PENDING / LEARNER_PENDING` | real observation use and confidence calibration | 16 |
| `SQ-EXP-02` remove floats versus value-heavy bets | `MECHANISM_CLOSED / FIELD_PENDING` | local air-poor branch evidence | 16 |
| `SQ-EXP-03` passive-pool fast-play | `PARTIAL / FIELD_PENDING` | Batumi action and showdown evidence | 14, 16 |
| `SQ-EXP-04` live tells as weighted evidence | `MECHANISM_CLOSED / FIELD_PENDING / LEARNER_PENDING` | tell reliability and falsifiers | 16 |
| `SQ-EXP-05` overfold/under-three-bet versus small raises | `MECHANISM_CLOSED / FIELD_PENDING` | local response elasticity | 7, 16 |

## H. Learning and range construction

| Question | Current state | Binding next evidence |
|---|---|---|
| `SQ-LRN-01` simpler explanation | `CONTINUOUS` | learner latency, retention and transfer |
| `SQ-LRN-02` genuinely new misconception | `CONTINUOUS` | diagnostic and field error data |
| `SQ-LRN-03` missing counterexample/boundary | `CONTINUOUS` | drill failures, hand reviews and field evidence |
| `SQ-RNG-01` original live preflop anchors | `ANCHOR_ACTIVE_DIRECTIONAL / SOLVER_AND_FIELD_CALIBRATION_PENDING` | exact room assumptions, independent solver comparison and field repair |
| `SQ-RNG-02` exact visuals necessary for a decision | `VISUAL_PENDING / CLAIM_DRIVEN` | only a material disputed claim |

## Preflop-wave closure effect

### Closed at directional mechanism/drill level

- squeeze candidate purification;
- polar 4-bet target-fold logic;
- core/flex/reject-first range architecture;
- open-size, depth, rake, players-behind and straddle overlays;
- compact RFI/source-range anchors;
- original direct drills for `H-W01-002` and `H-W01-008`.

### Not closed exactly

- equilibrium mixes;
- room-specific 1/3 and 2/5 rake-adjusted matrices;
- exhaustive 200bb/400bb charts;
- target-player 3-bet/fold/5-bet frequencies;
- deep OOP protected-call boundaries;
- multiway action-order architecture.

## Coverage summary

```text
38 evidence-question IDs preserved
preflop directional anchor system active
squeeze direct drill ready
polar-target direct drill ready
direct candidate drill coverage 32/34
remaining direct gaps 2
```

## Priority authority

`synthesis/MAX_EV_CANDIDATE_PRIORITY_RANKING_v0_2.md`

## Matrix verdict

`REMAINING_EVIDENCE_QUESTION_MATRIX_V1_4_ACTIVE`

`PREFLOP_DIRECTIONAL_ARCHITECTURE_ACTIVE`

`SQ_PF_01_AND_SQ_PF_03_DRILL_READY`

`MULTIWAY_IS_NEXT_CLOSURE_LANE`
