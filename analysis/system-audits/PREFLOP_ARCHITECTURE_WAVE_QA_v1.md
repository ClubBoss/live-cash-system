# Preflop Architecture Wave QA v1

Date: 2026-08-06  
Status: `ACCEPTED / FULL_DIRECTIONAL_WAVE_COMPLETE`

## Scope

Complete the independent preflop architecture wave end-to-end rather than stopping at assumptions.

Wave steps:

1. target-game evidence and assumptions;
2. minimum memory architecture;
3. independent range construction;
4. combinatorial and changed-node QA;
5. private source comparison;
6. squeeze and polar-target direct answer keys;
7. candidate/question/module updates;
8. handover and next-lane routing.

## Artifacts

- `ranges/assumptions/BATUMI_LIVE_PREFLOP_ASSUMPTIONS_v1.md`;
- `ranges/independent/PREFLOP_ANCHOR_LIBRARY_v0_1.json`;
- `ranges/anchors/LIVE_CASH_PREFLOP_ANCHORS_v0_1.md`;
- `ranges/validation/PREFLOP_ANCHOR_VALIDATION_REPORT_v0_1.md`;
- `learning/drills/PREFLOP_SQUEEZE_AND_POLAR_TARGET_DRILL_PACK_v0_1.md`.

## Assumption QA

Public evidence establishes that Batumi games vary by room and time:

- NLH 1/3, 5/5 and higher are publicly listed;
- official Iveria information gives 5/5, $300-$2000 and 4% rake;
- other current listings show 5% with different caps;
- nominal nine-seat tables can run short-handed.

Therefore the wave correctly uses:

- a reference node;
- rake tiers;
- open-size grid;
- depth bands;
- players-behind overlay;
- straddle translation;
- first-session field verification.

No unsupported single `Batumi rake` was invented.

Result: `PASS`.

## Architecture QA

The system compresses preflop into five table-facing cards:

1. unopened pot;
2. limped pot and isolation;
3. facing an open;
4. facing a 3-bet;
5. squeeze and polar selection.

This is sufficient to route the highest-value preflop decisions without importing hundreds of source charts.

Result: `PASS`.

## Range QA

RFI totals:

```text
EP   194 combos  14.63%
HJ   266 combos  20.06%
CO   362 combos  27.30%
BTN  602 combos  45.40%
SB   542 combos  40.87%
```

Checks:

- valid notation;
- correct pair/suited/offsuit combo weights;
- EP subset of HJ;
- HJ subset of CO;
- CO subset of BTN;
- SB independently shaped;
- no duplicate or impossible class;
- core/flex/reject-first separation explicit.

Result: `PASS`.

## Source-purity QA

### FTGU

The final percentages differ from both FTGU printed percentages and combo-derived red cells. FTGU remains private reference only because exact assumptions and percentage/cell reconciliation are incomplete.

### Smash

The Smash preflop index contains 980 squeeze/facing-squeeze scenarios. The new system copies neither cells nor matrices. It uses the source only to confirm that rake, depth, ante, straddle, position and prior action must remain distinct dimensions.

Result: `PRODUCT-FACING PURITY PASS`.

## Changed-node QA

Passed transformations:

- 2.5x/3x to 4x/5x open;
- 100bb to 50bb;
- 100bb to 200bb/400bb;
- passive to aggressive player behind;
- no straddle to live straddle;
- early to late opener;
- tight to wide 3-bettor.

The library removes calls before inventing bluffs and preserves value density.

Result: `PASS`.

## Drill QA

Original direct factories created for:

- squeeze purification;
- polar target folds and call branch.

Each factory includes:

- clear and flex cases;
- attractive wrong answers;
- changed variants;
- separate action/reason/confidence scoring;
- value-range-first and call-branch requirements.

Effect:

```text
H-W01-002 -> direct drill active and DRILL_READY
H-W01-008 -> direct drill gap closed
coverage 30/34 -> 32/34
remaining gaps -> H-W01-006, H-R04-007
```

Result: `PASS`.

## Candidate and readiness QA

- candidate count remains 34;
- only H-W01-002 changes status;
- DRILL_READY becomes 28;
- VALIDATION_PENDING becomes 6;
- admitted remains 0;
- no exact range or population overclaim;
- LCM-02 becomes ready directionally, not exact-solver complete.

Result: `PASS`.

## Known limitations

- exact equilibrium solver calibration was not available;
- exact 1/3 and 2/5 room rake remains field-dependent;
- 200bb/400bb hand matrices are not exhaustive;
- field frequencies are unknown;
- deep OOP and multiway direct answer keys remain open.

These limitations do not invalidate the directional anchor and drill wave.

## Stop decision

Do not spend the next wave polishing exact preflop edge cells broadly. The next higher-EV unresolved lane is multiway action order and delayed aggression. Exact preflop solver work should be targeted only when it can change a frequent decision, a direct drill or final admission.

## QA verdict

`PREFLOP_ARCHITECTURE_FULL_DIRECTIONAL_WAVE_ACCEPTED`

`ASSUMPTIONS_RANGE_DRILLS_AND_ROUTING_COMPLETE`

`DIRECT_COVERAGE_32_OF_34`

`MULTIWAY_NEXT`
