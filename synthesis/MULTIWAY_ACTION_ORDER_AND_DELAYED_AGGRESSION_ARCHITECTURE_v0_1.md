# Multiway Action-Order and Delayed-Aggression Architecture v0.1

Date: 2026-08-06  
Status: `ACTIVE_DIRECTIONAL_ARCHITECTURE / NOT_EXACT_SOLVER_OUTPUT`

## Purpose

Create one compact multiway decision system for live cash without copying source solver trees or treating multiway as merely tighter heads-up poker.

## Core sequence

```text
1. SOURCE RANGES
2. NUT / PREMIUM OWNERSHIP
3. ACTION-ORDER ROLE
4. SHARED DEFENCE
5. PLAYER-BEHIND GATE
6. BET SIZE AND SHAPE
7. RESPONSE GEOGRAPHY
8. ACTION FILTER
9. FIELD-CLEAR TRANSITION
10. DELAYED RANGE EXPRESSION
11. CALL-CALL FILTER
12. FAST-PLAY / PROTECT DECISION
```

## 1. Source ranges

Before board interpretation, identify how each player entered:

- initial raiser;
- cold caller;
- blind defender;
- limper/overcaller;
- squeeze caller;
- straddled-pot participant.

Do not merge cold-caller, SB and BB ranges into one `caller` range. Their premium omissions, offsuit mass, suited coverage and action order differ.

Cue:

`How did each range arrive, and which strong hands were removed?`

## 2. Nut and premium ownership

Use the `OPAL` audit:

- `O` — offsuit nut combinations;
- `P` — premiums retained or removed preflop;
- `A` — action order and position;
- `L` — low-card/suited coverage.

Ownership is not determined by initiative.

Examples of directional outcomes:

- low connected boards often improve blind low-card coverage;
- high connected boards may favour a tight opener that uniquely owns offsuit nut straights and overpairs;
- loose live calls can restore combos removed by theoretical ranges, but this must come from observed preflop behaviour.

## 3. Action-order roles

### `R1 — Opening actor`

Usually the preflop raiser acting before one or more live ranges.

Properties:

- may retain range and premium advantage;
- carries collision risk from every player behind;
- often checks more than initiative intuition suggests;
- can regain high-information aggression after a bet and call.

### `R2 — Middle / sandwiched actor`

Faces a bet or decision with at least one live range behind.

Properties:

- highest collision risk;
- calls and raises require stronger resilience;
- cannot use heads-up raise breadth;
- top pair and draws without backup lose relative value;
- must ask who can wake up behind.

### `R3 — Closing actor`

Acts after earlier players and has no unseen active range behind for that action.

Properties:

- best information;
- greater freedom to call or raise;
- can supply part of the table's shared defence;
- often owns the widest practical bluff-raise branch;
- still must respect filtered ranges and bet shape.

### `R4 — Reopener`

An earlier actor who acts again after bet-call or bet-raise information.

Properties:

- receives maximum branch information;
- can use linear value/protection raises when the bettor is wide and caller is capped;
- bluff volume remains limited by collision and value shape;
- must rebuild both opponent ranges after their actions.

### `R5 — Survivor after field clear`

A player who reaches a heads-up turn or river after one participant folds.

Properties:

- does not inherit a standard heads-up range;
- carries a multiway-filtered range into the new node;
- may recover aggression that was suppressed by the former player behind;
- must account for the exact flop bet/call/check sequence.

## 4. Shared defence

Multiway defence is distributed across remaining ranges.

Do not ask:

`Must Hero personally defend enough to stop the bettor auto-profiting?`

Ask:

```text
Who remains behind?
What strong region can they continue or raise?
How much collision does Hero face?
Does Hero close action?
```

Directional defence order:

```text
HEADS-UP / CLOSING ACTION
> MULTIWAY CLOSING ACTION
> MIDDLE WITH CAPPED PLAYER BEHIND
> MIDDLE WITH UNCAPPED PLAYER BEHIND
```

This is an ordering, not an exact frequency claim.

### Burden-shift exceptions

Hero can defend closer to heads-up when the player behind is:

- nearly certain to fold;
- demonstrably capped and passive;
- all-in for a negligible side amount;
- no longer eligible to raise.

The exception must be explicit. Do not silently erase the player behind.

## 5. Player-behind gate

Before calling or raising as the middle actor, test:

1. Can the player behind contain nutted value?
2. Can they raise after Hero calls?
3. Does Hero's hand survive a call plus later aggression?
4. Does Hero block the strong region behind or merely the bettor?
5. Is Hero creating reverse implied odds by continuing dominated one-pair strength?

If the player behind is uncapped, remove first:

- marginal bluff-catchers;
- fragile top pairs;
- draws with poor nutted improvement;
- bluff raises without collision tolerance.

## 6. Bet size and shape

### Tiny / small bet

Can function as:

- cheap field-clearing bluff;
- thin value/protection;
- range-clearing pressure;
- condensed value stab;
- exploit against price-inelastic folds and under-raising.

Audit both:

`Who overfolds?` and `Who should raise but probably will not?`

Do not label every tiny bet weak.

### Medium bet

Useful as a simplification when it preserves the strategic purpose of a multi-size tree.

Requires:

- coherent value region;
- enough supported bluffs;
- response plan for middle and closing players.

### Large / polar bet

- narrows the continuing field;
- permits more folding and fewer merged raises;
- requires stronger value and bluff support;
- can be easier for humans to defend than a tiny bet if it creates obvious continues.

## 7. Response geography

### Calls

Prefer calls that retain:

- robust showdown value;
- nutted improvement paths;
- ability to withstand later action;
- useful blockers without blocking folds excessively.

### Raises

Raise breadth is jointly controlled by:

```text
BET RANGE SHAPE
+ HERO RELATIVE POLARISATION
+ PLAYER-BEHIND RISK
+ CLOSING-ACTION STATUS
```

Merged small bets can support thinner raises, but an uncapped player behind can still suppress the raise branch.

### Folds

Folding a reasonable heads-up continue can be correct when:

- Hero is sandwiched;
- the player behind owns strong combinations;
- the hand has poor backup equity;
- a call does not close action;
- reverse implied odds dominate the price.

## 8. Multiway bluff-support hierarchy

Rank candidates by strategic support, not visible prettiness.

### Tier A — strongest

- strong draw plus relevant removal;
- pair plus draw with value/protection potential;
- nutted improvement path and credible later barrels;
- hand that blocks strong continues while unblocking folds.

### Tier B — conditional

- overcards plus backdoors;
- gutter plus blocker;
- low pair or low card that targets a filtered call-call range;
- thin protection hand with future improvement.

### Tier C — exploit only

- low-equity air using a very small price against demonstrated overfold and under-raise;
- later-street removal bluff against a precisely filtered range.

### Reject

- random air imported from heads-up;
- hand that blocks folds and unblocks calls;
- hand whose first fold target still leaves a strong second range;
- bluff with no plan when only one opponent folds.

Cue:

`What happens when the first player folds but the second continues?`

## 9. Action filter and field-clear transition

Every action changes the node.

```text
FLOP BET
-> MIDDLE FOLD/CALL/RAISE
-> CLOSER FOLD/CALL/RAISE
-> REBUILD SURVIVING RANGES
```

When one player folds, do not load a generic heads-up strategy. The survivor ranges are shaped by:

- the original multiway ranges;
- who was sandwiched;
- bet size;
- which player folded;
- whether the remaining player called or raised;
- which aggression was previously suppressed.

## 10. Delayed range expression

A turn lead or raise is a valid delayed expression when:

1. a specific flop aggression branch was suppressed by a live player behind;
2. that player has now folded or lost raising rights;
3. Hero's surviving range still contains the value region for the delayed action;
4. suitable bluffs retain equity/removal or target the actual filtered range;
5. the turn card does not restore the opponent's capped or weak branch;
6. the size matches the new value/polarisation structure.

This is not the same as:

`The turn helps my range, so I lead.`

Cue:

`Which flop action was blocked, and why is it available now?`

## 11. Call-call filter

After two opponents call:

- both ranges lose much of their air;
- medium made hands and draws gain weight;
- the bettor's future bluffs must target the actual surviving folds;
- low-card or pair blockers can outperform obvious missed draws when they unblock weak bluff-catchers and block strong continues;
- random barrels based only on low showdown value are rejected.

Barrel audit:

```text
VALUE REGION
-> WHO CALLED WITH WHAT
-> WHICH FOLDS SURVIVE
-> WHICH CONTINUES ARE BLOCKED
-> FUTURE RIVER JOB
```

## 12. Fast-play versus protect

Ask:

`Who is expected to put the next bet in, and will that happen at this table?`

### Protect / slow-play more when

- closing player is aggressive;
- stab/raise/barrel frequency is credible;
- strong checks are needed to defend the passive branch;
- Hero's hand is robust across runouts;
- checking retains air and future aggression.

### Fast-play more when

- closing player under-raises;
- IP player checks back too much;
- population under-barrels neutral turns;
- the hand is vulnerable;
- free cards or multiway realisation are costly;
- waiting for aggression is likely erroneous slow-play.

Magnitude remains field-gated.

## Compact table algorithm

```text
WHO OWNS?
-> WHO ACTS MIDDLE / CLOSES?
-> WHO REMAINS BEHIND?
-> WHAT DOES SIZE REPRESENT?
-> CALL / RAISE / FOLD WITH COLLISION?
-> WHO SURVIVED?
-> WHAT AGGRESSION WAS SUPPRESSED?
-> DELAY IT, FAST-PLAY IT, OR KEEP PROTECTED?
```

## Validation boundary

Approved for:

- directional table use;
- original drills;
- action-order diagnosis;
- changed variants;
- field observation schema.

Not approved as:

- exact MDF or defence percentages;
- exact solver raise/lead frequencies;
- universal three-way/four-way size menu;
- Batumi population magnitude;
- final admitted rule set.

## Architecture verdict

`MULTIWAY_ACTION_ORDER_ARCHITECTURE_ACTIVE`

`SHARED_DEFENCE_AND_FIELD_CLEAR_TRANSITION_DIRECTIONALLY_CLOSED`

`H_R04_007_DIRECT_ANSWER_KEY_SUPPORTED`

`EXACT_FREQUENCIES_AND_FIELD_MAGNITUDES_PENDING`
