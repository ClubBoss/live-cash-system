# Live Cash System - Preflop Architecture Wave Terminal Report v1

Date: 2026-08-06  
Status: `PREFLOP_DIRECTIONAL_ARCHITECTURE_WAVE_ACCEPTED / MULTIWAY_NEXT`

## Milestone

Completed the full independent preflop architecture and anchor wave:

```text
target assumptions
-> minimum anchor architecture
-> independent ranges
-> validation
-> direct drills
-> candidate/question/module updates
-> next-lane routing
```

## Target assumptions

The system does not claim a single universal Batumi game structure.

Current public evidence supports variable:

- stakes;
- buy-ins;
- rake/caps;
- player counts;
- open sizes;
- straddled states.

The anchor system therefore uses explicit rake, size, depth, players-behind and straddle overlays plus a first-session verification card.

## Anchor architecture

Five memory cards are active:

1. unopened pot;
2. limped pot and isolation;
3. facing an open;
4. facing a 3-bet;
5. squeeze and polar selection.

The system uses `CORE / FLEX / REJECT-FIRST` rather than exact table RNG mixes.

## RFI reference ranges

```text
EP   14.63%
HJ   20.06%
CO   27.30%
BTN  45.40%
SB   40.87%
```

These are original provisional anchors under explicit assumptions, not copied source charts and not claimed equilibrium exact.

## Validation

Passed:

- notation and combo counts;
- positional monotonicity EP-HJ-CO-BTN;
- source-purity comparison;
- source-topology comparison;
- open-size changed nodes;
- 50/100/200/400bb structural transformations;
- players-behind transformation;
- straddle denominator transformation.

Pending:

- exact solver calibration;
- room-specific rake/open-size validation;
- target-game field validation.

## Direct drill effect

Created direct original factories for:

- `H-W01-002` squeeze purification;
- `H-W01-008` polar target folds and call branch.

Current coverage:

```text
direct candidate drills: 32/34
answer-key-gated gaps: 2
```

Remaining:

- `H-W01-006` deep OOP protected-call boundary;
- `H-R04-007` multiway delayed aggression.

## Candidate status effect

```text
heuristic candidates: 34
DRILL_READY: 28
VALIDATION_PENDING: 6
FIELD_TEST_PENDING: 0
ADMITTED: 0
```

Only `H-W01-002` is promoted from `VALIDATION_PENDING` to `DRILL_READY`.

`H-W01-008` was already `DRILL_READY`; only its direct answer-key gap closes.

## Readiness effect

- `LCM-02` becomes `READY directional`;
- `LCM-03` gains active blind/source anchors but deep OOP remains pending;
- `LCM-07` gains active compact preflop family anchors;
- `LCM-11` now routes 32 direct candidate drills.

No module becomes exact-solver or field complete.

## Files created

- `ranges/assumptions/BATUMI_LIVE_PREFLOP_ASSUMPTIONS_v1.md`;
- `ranges/independent/PREFLOP_ANCHOR_LIBRARY_v0_1.json`;
- `ranges/anchors/LIVE_CASH_PREFLOP_ANCHORS_v0_1.md`;
- `ranges/validation/PREFLOP_ANCHOR_VALIDATION_REPORT_v0_1.md`;
- `learning/drills/PREFLOP_SQUEEZE_AND_POLAR_TARGET_DRILL_PACK_v0_1.md`;
- `analysis/system-audits/PREFLOP_ARCHITECTURE_WAVE_QA_v1.md`;
- `synthesis/HEURISTIC_CANDIDATE_REGISTRY_v0_5.md`;
- `synthesis/REMAINING_SOURCE_QUESTION_MATRIX_v1_4.md`;
- `synthesis/CANDIDATE_TO_MODULE_VALIDATION_WORKBENCH_v0_4.md`;
- `synthesis/MAX_EV_CANDIDATE_PRIORITY_RANKING_v0_2.md`;
- `learning/ADAPTIVE_MODULE_READINESS_MANIFEST_v0_9.md`;
- this report.

## Exact limitations

The wave does not claim:

- exact GTO frequencies;
- exhaustive 980-scenario replacement;
- exact 200bb/400bb matrices;
- one universal Batumi rake;
- validated target-player fold-to-4-bet frequency;
- final admitted Playbook ranges.

## Next bounded milestone

`MULTIWAY ACTION-ORDER AND DELAYED-AGGRESSION CLOSURE`

Full-wave objectives:

1. define action-order roles;
2. map shared defence;
3. compress nut ownership by source ranges;
4. build minimum bluff-support hierarchy;
5. define delayed aggression and sandwich transitions;
6. activate `H-R04-007` direct answer key;
7. update multiway module readiness;
8. preserve field-gated fast-play magnitude.

## Terminal verdict

`PREFLOP_DIRECTIONAL_ARCHITECTURE_WAVE_ACCEPTED`

`FIVE_ANCHOR_CARDS_ACTIVE`

`DIRECT_DRILL_COVERAGE_32_OF_34`

`NO_FINAL_RANGE_ADMISSION`

`MULTIWAY_NEXT`
