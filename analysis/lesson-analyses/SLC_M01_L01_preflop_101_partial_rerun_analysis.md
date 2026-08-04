# SLC-M01-L01 — Preflop 101 Partial Rerun Analysis

Status: `PARTIAL_RERUN_ANALYZED / FINAL_TAIL_OPEN`

## Scope

This analysis uses only the independently verified rerun interval `00:00–46:29`.

It does not infer the missing `46:29–50:32` conclusion and does not use exact chart cells that were not included in the evidence package.

# Source-supported mechanisms

## 1. Charts are baseline shapes, not scripts

The master sheet provides a stable equilibrium reference across game structures and depths. It is deliberately not replaced with subjective `loose` or `tight` charts.

The practical workflow is:

`baseline shape → actual players behind → explicit deviation`.

This directly supports the project's branch-specific opponent model and argues against replacing charts with unstructured intuition.

## 2. Preflop errors are often small, frequent and emotionally invisible

Nick distinguishes catastrophic preflop errors from the more common leak of slightly over-opening, over-calling or over-defending. These mistakes often end in an uneventful check-fold and therefore receive little attention, while their cumulative cost can be significant.

System implication:

- review frequency-weighted leaks, not only large pots;
- include low-salience preflop decisions in session review;
- do not use `I have a postflop edge` as an unbounded justification for entering pots.

## 3. Range reading begins with proportional composition

The most important starting question is not whether one rare suited combo exists. It is which offsuit combinations and pocket pairs dominate the range by combination count and action frequency.

System compression:

`Offsuit region + pair region first; suited detail second.`

This is a strong candidate for a general live-cash table cue because it improves board ownership, c-bet interpretation and blocker reasoning without requiring exact chart recall.

## 4. The offsuit-pip heuristic identifies natural polar bluff candidates

When facing an opener, identify the weakest offsuit rank region opened consistently. Good polar 3-bet candidates often sit at or below that rank and:

- fold out dominating offsuit hands;
- avoid blocking the intended folds;
- preserve suited playability as depth increases.

The same ancestry can identify postflop check-raise bluffs by targeting the opener's weakest c-bets.

This is more executable than memorising every mixed preflop cell, but exact position boundaries remain chart-dependent.

## 5. Hand frequency inside a node must be adjusted for reach

A hand can be a frequent action after a 4-bet while being a rare combination in the total strategy because it entered the 3-bet branch only at low weight.

This is a central anti-chart-reading error:

`Node frequency ≠ total range frequency.`

It transfers directly to later postflop nodes and should become part of blocker and bluff-density training.

## 6. Rake, ante and straddle are structural inputs

The source supports three distinct mechanisms:

- rake tightens participation and pushes strategy more aggressive;
- ante increases the price incentive to participate and requires wider/protected ranges;
- straddle changes the effective depth unit and relevant blind structure.

These are not minor environment notes. They change which baseline chart family applies.

## 7. No-ante blind-versus-blind population may over-limp

Nick expects ordinary opponents to iso and defend less aggressively than equilibrium after a limp. In that environment, moving more of the small blind's no-ante first-in range into a direct raise can outperform excessive limping.

This must remain tagged `ENVIRONMENT_SENSITIVE / POOL_HYPOTHESIS`, because it depends on actual iso and defence behaviour.

## 8. Players behind determine whether early-position flats survive

A theoretically tight early-position flatting range is built under pressure from multiple players behind. If a live table does not squeeze enough, more flats can become viable. If the table squeezes aggressively, the reference tightness is more relevant.

This reinforces pairwise range analysis and the need to model the entire remaining action, not only opener versus Hero.

# Candidate additions

## H-W01-007 — Read high-weight range composition before rare suited detail

**Tag:** `GENERAL_CORE`  
**Tier:** CORE  
**Confidence:** high mechanism  
**Proposed status:** `DRILL_READY`

### Trigger

Before interpreting board ownership, blockers or a postflop action.

### Default

First identify:

1. major offsuit combinations;
2. pocket-pair region;
3. premium hands removed by earlier actions;
4. then smaller suited regions.

### Cue

`What makes up most of this range?`

### Exception

In very tight or highly polar nodes, a small suited region can become proportionally important. The rule is a starting order, not permission to ignore suited hands.

## H-W01-008 — Polar preflop bluffs should target dominating offsuit opens

**Tag:** `GENERAL_CORE`  
**Tier:** SUPPORTING  
**Confidence:** medium-high  
**Proposed status:** `DRILL_READY`

### Trigger

Selecting a non-value 3-bet or squeeze candidate without exact chart recall.

### Default

Prefer candidates that:

- sit below the opener's consistent offsuit region;
- fold out hands that dominate Hero;
- do not block those folds;
- retain suitable playability for the effective depth.

### Cue

`What better offsuit hands does this bluff fold?`

### Exception

This does not reconstruct an exact range. Position, rake, size, stack depth and players behind still determine whether the candidate enters at all.

## H-W01-009 — Interpret later-node frequency through hand reach

**Tag:** `GENERAL_CORE`  
**Tier:** SUPPORTING  
**Confidence:** high mechanism  
**Proposed status:** `DRILL_READY`

### Trigger

Reading a solver chart, analysing bluff density or counting combinations after several actions.

### Default

Multiply the apparent frequency at the current node by the probability that the hand reached the node through earlier mixed actions.

### Cue

`How often did this hand arrive here?`

### Exception

When previous actions are pure, current-node frequency and total reach align more closely.

# Impact on existing candidates

## H-W01-001 — Effective stack sets preflop architecture

Strengthened. The rerun explicitly confirms separate 100bb, 200bb and 400bb references and live tables containing several effective depths at once.

The exact anchor ranges remain blocked by missing visuals and the final lesson tail.

## H-W01-002 — Expand squeezes through existing candidates

Strengthened. The rerun adds the importance of players behind, squeeze exposure and increasing squeeze sizes with depth.

## H-W01-003 — Straddle changes the denominator

Strengthened. The source explicitly describes nominal 200bb stacks becoming approximately 100 straddles and separates straddle blind roles.

## H-W01-004 — Identify source range before reading board

Strongly strengthened by the proportional offsuit/pair framework.

# Misconceptions exposed

1. `CHART_AS_SCRIPT` — copying equilibrium without opponent or game adjustment.
2. `SOFT_GAME_BLANK_CHEQUE` — using postflop edge to justify any loose entry.
3. `RARE_COMBO_FIXATION` — focusing on a rare suited hand before the dominant offsuit/pair region.
4. `NODE_FREQUENCY_AS_TOTAL_FREQUENCY` — ignoring reach from previous mixed actions.
5. `ANTE_NO_ANTE_COLLAPSE` — using the same blind strategy in structurally different games.
6. `STRADDLE_AS_NORMAL_BLIND` — failing to translate stack and blind roles.
7. `IGNORE_PLAYERS_BEHIND` — evaluating a flat without squeeze exposure.

# Drill candidates

## Drill A — Range composition first

Given a preflop action sequence and a simplified range list, identify the three highest-weight hand families before discussing the board.

## Drill B — Offsuit-pip candidate test

For a stated opener range and effective stack, rank four possible 3-bet bluffs by:

- dominated hands folded;
- fold blockers;
- suited playability;
- depth suitability.

## Drill C — Reach correction

Show a hand that 3-bets 10% preflop and five-bet bluffs 80% after facing a 4-bet. Ask whether the hand is a large or small part of the overall five-bet range and require explicit reach reasoning.

## Drill D — Structural game switch

Use the same seats and stacks across:

- no ante;
- ante;
- straddle.

The learner must state what changes before choosing hands.

# Blocked scope

- final lesson conclusion after `46:29`;
- exact chart boundaries;
- exact hand weights and colours;
- exact universal opening, 3-bet or squeeze sizes;
- one unclear local hand phrase;
- one ambiguous machine sentence in the ante comparison.

# Verdict

`PRE_FLOP_101_CORE_MECHANISMS_RECOVERED`

`FINAL_TAIL_AND_VISUAL_ANCHORS_STILL_REQUIRED`
