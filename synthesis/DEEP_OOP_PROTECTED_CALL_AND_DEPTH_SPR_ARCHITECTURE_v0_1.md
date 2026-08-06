# Live Cash System — Deep OOP Protected-Call and Depth/SPR Architecture v0.1

Status: `ACTIVE_DIRECTIONAL_ARCHITECTURE / H-W01-006_DIRECT_KEY_SUPPORTED`

## Objective

Replace the false shortcut `deep means call more` with an executable process:

```text
NODE
→ POST-ACTION GEOMETRY
→ BET SHAPE
→ BOARD URGENCY
→ HAND RESILIENCE
→ RANGE TOP-END
→ FUTURE AGGRESSION
→ CALL / RAISE / FOLD
→ NEXT-STREET REBUILD
```

## 1. Geometry first

For pot `P`, effective stack behind `S`, and bet faced `B`:

```text
post-call pot = P + 2B
post-call stack = S - B
post-call SPR = (S - B) / (P + 2B)
```

For a raise to total `R`, if called:

```text
post-raise pot = P + 2R
post-raise stack = S - R
post-raise SPR = (S - R) / (P + 2R)
```

Execution bands:

- `C <=1.5`: compressed;
- `M >1.5 to 4`: middle;
- `E >4`: extended.

They are practical routing bands, not equilibrium borders.

## 2. R/V/F hand classes

### R — Robust

A robust hand has several of:

- beats the plausible bluff region now;
- survives many turn classes;
- retains clean redraws or a nutted improvement route;
- can call some future pressure;
- does not need immediate folds to realise value;
- protects weaker calls.

Default: preserve call/check branch unless a strong value or denial reason moves it.

### V — Volatile or vulnerable

A volatile hand:

- is often ahead now;
- loses substantial equity to common turns;
- benefits from folding live overcards or draws;
- may receive calls from worse against a merged bettor;
- becomes difficult to continue after calling.

Default: compare thin value plus denial against the stronger continuing range. Raise can be required in high-urgency nodes.

### F — Frail

A frail hand:

- can lose to part of the bluff region;
- has dominated or dirty improvements;
- lacks clean nut routes;
- cannot withstand future pressure;
- relies on opponent give-up.

Default: fold. A bluff raise is separate and requires range support, blockers, fold targets and a continuation plan.

## 3. Board urgency

### Static / low urgency

- few turns change nut ownership;
- strong made hands retain rank;
- bettor has credible future bluffs;
- denial value is limited.

Effect: robust calls gain; unnecessary raises can fold air and isolate against strength.

### Dynamic / high urgency

- many turns change equity or ownership;
- IP retains positional leverage;
- vulnerable hands face difficult future decisions;
- draws and pair-plus-draw regions are dense.

Effect: clean redraws and nut paths gain; vulnerable value can raise; frail one-pair calls lose.

## 4. Bet-shape gate

### Small and range-wide / merged

- call threshold moves down;
- thin value and protection raises can appear;
- selected middle-strength hands may raise;
- bluff raises target weak stabs with equity/backdoors.

### Large and selective / polar

- call region compresses;
- thin value raises mostly disappear;
- robust calls remain important;
- raises concentrate in top-end value and high-quality bluffs;
- discomfort is never enough.

## 5. Top-end raise gate

Before creating a raise branch, ask:

1. Does OOP own credible top-end value?
2. Does it remain strong when the bettor continues?
3. Can the range support bluffs or hybrids with future jobs?
4. Is the raise size coherent with the value region?
5. What happens versus call or re-raise?

If top-end support is absent, a wide raise branch may disappear even when Hero defends frequently.

## 6. Raise-job test

A raise must perform at least one real job and survive the continuing range.

### Valid jobs

- value versus continues;
- denial against meaningful live equity;
- equity plus fold pressure;
- branch protection.

### Rejected jobs

- “I do not want to face a turn.”
- “The pot is large.”
- “I probably have the best hand.”
- “We are deep, so I should take control.”

## 7. Protected-call test

Prefer call when:

- post-call SPR remains extended or middle;
- the hand is robust;
- denial urgency is manageable;
- the bettor retains air or thin bets worth preserving;
- Hero can continue on a meaningful set of turns;
- strong calls protect weaker calls;
- raising would fold weak hands and isolate against strength.

A protected call is not passive surrender. It is an investment in future range resistance.

## 8. Opponent future-action switch

### Credible aggressor

- preserve robust calls;
- allow air to continue;
- retain later call/raise branches;
- do not fast-play automatically.

### Passive or under-barrelling opponent

- move more value forward;
- reduce traps that depend on a missing bet;
- preserve the same candidate shape;
- do not invent random bluffs.

Magnitude remains field-gated.

## 9. 100 / 200 / 400bb overlay

### 100bb

A single-raised pot can remain extended; a 3-bet pot can be middle or compressed. Calculate the tree.

### 200bb

Extended SRP trees magnify position, runout volatility, future sizing errors, nut routes and the cost of capped calls. Protect robust calls, not all calls.

### 300–400bb

Extra stack increases the value of future nuts, clean redraws, position and credible multi-street plans. Straddles and large preflop pots can collapse the tree; recalculate in straddle units and post-action SPR.

## 10. Decision tree

```text
1. Calculate post-call SPR.
2. Classify C / M / E.
3. Read bet as range-wide/merged or selective/polar.
4. Classify board urgency.
5. Classify hand R / V / F.
6. Check OOP top-end support.
7. Audit future opponent aggression.
8. Choose:
   R + extended + future air → CALL often
   V + merged bet + denial/value → RAISE can expand
   F + weak routes → FOLD
   polar bet → RAISE narrows
   low SPR + immediate equity/top-end → JAM/RAISE can expand
9. Rebuild after the next action/card.
```

## 11. Candidate answer key

### `H-W01-006`

> Deep OOP, first protect the call branch with resilient hands. Raise only when the range owns sufficient top-end and the hand has a real value, denial, equity or branch-protection job. Use post-action SPR, board urgency and bet shape; never raise merely to escape future decisions.

This is directional. It does not claim exact hand frequencies or universal SPR cutoffs.

## Architecture verdict

`H_W01_006_DIRECTIONAL_ANSWER_KEY_ACTIVE`

`ROBUST_CALLS_BEFORE_DISCOMFORT_RAISES`

`POST_ACTION_SPR_AND_BET_SHAPE_CONTROL_RESPONSE_GEOGRAPHY`

`EXACT_COMBO_FREQUENCIES_REMAIN_GATED`
