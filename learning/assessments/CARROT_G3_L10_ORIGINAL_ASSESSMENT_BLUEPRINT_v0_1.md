# Carrot Grade 3 Lecture 10 - Original Assessment Blueprint v0.1

Status: `ACTIVE / SOURCE-INDEPENDENT / FOUR_FAMILIES`

## Purpose

Convert durable four-bet-pot mechanisms into original assessments without copying source boards, hands, sizes, frequencies, solver grids or exam wording.

## Design rules

- use independently generated positions and ranges;
- require prediction before feedback;
- score action and reason separately;
- test range relation before hand placement;
- avoid exact source percentages and size labels;
- distinguish a mechanism from a universal rule;
- preserve uncertainty where visual or configuration evidence is missing.

## Family 1 - Four-bet-pot flop compression gate

### Skill

Choose between a small range bet, selective strategy and range check from range advantage plus relative polarisation.

### Prompt structure

Provide two independently derived four-bet ranges and three novel flop families. Ask the learner to state:

1. which range owns the high-weight value region;
2. which range is more polarised;
3. whether the board lies near the caller's danger-zone ranks;
4. whether a small range bet or range check is the safer simplification;
5. what evidence would be needed before using an exact size.

### Pass condition

The learner does not classify the flop from wet/dry appearance alone and does not universalise a one-size strategy.

## Family 2 - Turn size and jam-exposure audit

### Skill

Choose a smaller or larger turn barrel by opponent range shape and future jam incentives.

### Prompt structure

Give two low-SPR turn nodes after a small flop bet:

- one where Villain is polar;
- one where Villain has many medium-equity draws and pair-plus-draws.

Ask the learner to compare:

- target indifferent region;
- value of a larger size;
- probability and cost of facing a jam;
- Hero hands harmed by losing equity realisation;
- whether checking dominates for the median region.

### Pass condition

The learner uses a larger size to pressure a merged continue region, not merely to create a neat geometric stack-off.

### Repair target

`GEOMETRIC_SIZE_IS_AUTOMATICALLY_BEST`.

## Family 3 - Hybrid barrel versus protected check

### Skill

Build a low-SPR turn strategy containing value, hybrids, bluffs, a checking median and protected strong checks.

### Prompt structure

Give a novel four-bet-pot range and ask the learner to place hand classes into:

- high-frequency value bet;
- slow-played value;
- hybrid bet;
- high-EV bluff;
- checking median;
- give-up.

For every hybrid, require three separate statements:

- better hands that fold;
- worse hands that call;
- equity denied.

Then require enough check-calls and check-jams to prevent automatic pressure.

### Pass condition

The learner does not use denial as permission to bet the entire medium region and does not leave the checking range capped.

## Family 4 - Caller defence and reopen suppression

### Skill

Defend in position against a small four-bet-pot flop bet and decide whether raising adds value.

### Prompt structure

Present:

- an unfavourable board with no credible value-raise region;
- a neutral board against a selective small bet;
- a caller-favourable board against a range bet.

Ask the learner to choose fold, call or raise by class and explain:

- pot price;
- position;
- future fold equity;
- value-raise support;
- cost of reopening at low SPR;
- whether low board, wetness and SPR create a later jam instead.

### Pass condition

The learner can defend very wide without inventing a flop raise range and can identify when later jamming is more coherent than immediate reopening.

## Runtime placement

```text
Family 1
-> changed range pair
-> Family 2
-> changed turn card
-> Family 3
-> protected-check repair
-> Family 4
-> changed opponent and bet composition
-> delayed retest
```

## Scoring dimensions

- preflop ancestry;
- range advantage;
- relative polarisation;
- size-to-indifference reasoning;
- jam-exposure awareness;
- hybrid-EV decomposition;
- checking-range protection;
- response threshold;
- confidence calibration.

## Count effect

```text
Grade 1 families:          24
Grade 2 families:          20
Grade 3 L01-L02 families:   6
Grade 3 L03-L04 families:   7
Grade 3 L05-L07 families:   7
Grade 3 L08-L09 families:   6
Grade 3 L10 families:       4
Total Carrot families:     74
```

Feedback repair paths remain separate.

## Source-purity statement

These families use original scenarios and wording. They do not reproduce source boards, exact hands, solver percentages, EV values, exact size menus or exam questions.

## Verdict

`FOUR_NON_DUPLICATIVE_L10_FAMILIES_READY`

`FOUR_BET_POT_RANGE_RELATION_SIZE_AND_DEFENCE_ASSESSABLE`

`TOTAL_CARROT_ASSESSMENT_FAMILIES_74`
