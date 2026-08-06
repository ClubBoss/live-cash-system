# Preflop Anchor Validation Report v0.1

Date: 2026-08-06  
Status: `ACCEPTED_FOR_DIRECTIONAL_USE / SOLVER_AND_FIELD_CALIBRATION_PENDING`

## Scope

Validate the independent preflop anchor library for:

- explicit assumptions;
- notation integrity;
- combinatorial sanity;
- positional expansion;
- changed-node behaviour;
- source-purity;
- stable answer keys for squeeze purification and polar target-fold drills.

Artifacts:

- `ranges/assumptions/BATUMI_LIVE_PREFLOP_ASSUMPTIONS_v1.md`;
- `ranges/independent/PREFLOP_ANCHOR_LIBRARY_v0_1.json`;
- `ranges/anchors/LIVE_CASH_PREFLOP_ANCHORS_v0_1.md`.

## Derivation order

The range families were constructed from independent design objectives before comparison with source charts:

1. position and players remaining;
2. rake and open-size sensitivity;
3. realisation and domination;
4. players-behind pressure;
5. effective depth and straddle denominator;
6. value region before bluff candidates;
7. protected call branch before squeeze/4-bet expansion.

Source charts were used only after construction as private topology and shape comparisons.

## RFI combinatorial QA

| Position | Hand classes | Combos | Percent |
|---|---:|---:|---:|
| EP | 35 | 194 | 14.63% |
| HJ | 46 | 266 | 20.06% |
| CO | 60 | 362 | 27.30% |
| BTN | 90 | 602 | 45.40% |
| SB | 85 | 542 | 40.87% |

Checks:

- all notation tokens parse;
- no impossible same-rank suited/offsuit hand is generated;
- combo weights use 6 pair, 4 suited and 12 offsuit combinations;
- EP is a subset of HJ;
- HJ is a subset of CO;
- CO is a subset of BTN;
- SB is independently shaped and is not forced to be a BTN copy.

Result: `PASS`.

## Source comparison

### FTGU private reference

The FTGU chart audit records printed percentages of `13 / 18 / 31 / 45 / 39.5` and combo-derived cell percentages of approximately `13.73 / 18.25 / 32.13 / 46.91 / 39.06` for UTG/HJ/CO/BU/SB.

The independent anchor percentages differ materially in several positions:

- EP and HJ are slightly wider;
- CO and BTN are tighter;
- SB is slightly wider;
- assumptions are explicitly 8-9 handed live-sensitive rather than silently inheriting the FTGU chart context.

This non-identity is evidence that the source chart was not copied. The FTGU chart remains reference-only because its printed percentages and cell totals do not fully reconcile and its rake/open-size assumptions are incomplete.

### Smash source topology

The Smash index contains `980` squeeze/facing-squeeze scenarios across:

- rake/no-rake;
- 100/200/400bb;
- ante/no-ante;
- straddled states;
- acting positions and prior callers.

The independent system does not reproduce those matrices. It captures the same required dimensions as overlays and uses five memory cards rather than 980 memorisation targets.

Result: `TOPOLOGY PASS / CONTENT NOT COPIED`.

## Changed-node tests

### Open size: 3x -> 4x

Expected:

- remove weakest offsuit calls first;
- remove bottom suited gappers next;
- keep value 3-bets;
- do not replace every removed call with a bluff.

Library behaviour: `PASS`.

### Depth: 100bb -> 200bb

Expected:

- more IP calls with pairs and suited hands;
- stronger protected flat branch;
- fewer automatic OOP stack-offs;
- more nut-potential weighting.

Library behaviour: `PASS`.

### Depth: 100bb -> 50bb

Expected:

- more linear 3-bet/4-bet architecture;
- lower speculative-call value;
- reduced set-mining and low-connector appeal.

Library behaviour: `PASS`.

### Passive -> aggressive player behind

Expected:

- weakest flats leave first;
- only genuine top flex candidates move to 3-bet;
- no random bluff creation.

Library behaviour: `PASS`.

### No straddle -> live straddle

Expected:

- all stacks and raises converted to straddle units;
- nominal big-blind depth not reused.

Library behaviour: `PASS`.

## Squeeze answer-key stability

The direct answer key is considered stable at the family level when:

1. value core is defined by opener zone;
2. bluff candidates block strong continues or target better folds;
3. call-worthy realisation hands are preserved;
4. players-behind and depth are explicit;
5. random offsuit inventions are rejected.

This threshold is met.

`H-W01-002` may move to `DRILL_READY`, while exact equilibrium mixes remain pending.

## Polar target-fold answer-key stability

The direct answer key is considered stable when the learner must identify:

- a better-hand fold target;
- the opponent continue/5-bet region;
- blocker direction;
- call-branch realisation;
- whether the candidate blocks folds or continues.

This threshold is met for original contrastive drills.

`H-W01-008` direct-drill gap closes. The candidate remains non-admitted and exact frequency remains pending.

## Remaining limitations

- no independent equilibrium preflop solver run was available in this wave;
- room-specific 1/3 and 2/5 rake, cap and no-flop-no-drop are not confirmed;
- 200bb and 400bb overlays are structural, not exhaustive hand matrices;
- population 3-bet and fold-to-4-bet frequencies are field-gated;
- exact mixed-frequency boundary hands are intentionally omitted;
- multiway cold-call and delayed-aggression architecture remains the next build lane.

## Admission boundary

The library is approved for:

- directional table use;
- compact learning anchors;
- direct squeeze and polar-target drills;
- diagnostic changed variants;
- private comparison and future solver calibration.

It is not approved as:

- exact GTO output;
- universal room chart;
- final admitted rule set;
- evidence of Batumi population tendencies.

## Verdict

`PREFLOP_ANCHOR_LIBRARY_V0_1_VALIDATED_DIRECTIONALLY`

`SOURCE_PURITY_PASS`

`COMBINATORIAL_QA_PASS`

`H_W01_002_DIRECT_ANSWER_KEY_READY`

`H_W01_008_DIRECT_ANSWER_KEY_READY`

`SOLVER_AND_FIELD_CALIBRATION_REMAIN`
