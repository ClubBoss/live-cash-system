# Multiway Source Evidence Map v0.1

Date: 2026-08-06  
Status: `ACTIVE / DIRECTIONAL_ARCHITECTURE_SUPPORTED / EXACT_FREQUENCIES_VISUAL_DEPENDENT`

## Purpose

Ground the multiway action-order wave in the completed source corpus while separating:

- explicit source mechanisms;
- cross-source confirmation;
- system synthesis;
- visual or field dependencies.

## Primary Smash evidence

| Source | Explicit mechanism | What it supports | What remains blocked |
|---|---|---|---|
| `SLC-M04-L36` | shared defence, sandwich constraint, closing-action freedom, linear re-open after bet-call | action-order roles; tighter middle defence; stronger reopener branch | exact sizes, suits, frequencies, combo boundaries |
| `SLC-M04-L37` | one-size simplification; missing closing-player raises reduces slow-play EV; blockers depend on line | simplified size menu; fast-play overlay; ancestry audit | exact size and hand frequencies |
| `SLC-M04-L38` | tiny-bet leverage; player-behind suppresses flop raises; missing flop shape can reappear as turn lead | small-price audit; field-clear transition; delayed aggression | exact board, size menu and lead frequencies |
| `SLC-M04-L39` | low connected board ownership; optional leads; sandwich before aggression | nut-ownership map; optional-lead gate | exact lead matrix and turn splits |
| `SLC-M04-L40` | offsuit nut density and preflop omissions determine aggressor; SB and BB differ by action order | combo ownership; opener/middle/closer separation | exact range weights and bet sizes |
| `SLC-M04-L41` | missing BB check-raises moves value forward; barrels selected versus call-call range | fast-play branch; filtered barrel selection | exact cards, sizes and combo weights |
| `SLC-M05-L47` | behavioural read cannot delete plausible value; multiway raise rapidly filters range | evidence discipline; action-filter severity | exact later street tree |

## Supporting Carrot evidence

### `CP-G2-L10` — Postflop Raising

Supports:

- more merged bets permit broader/thinner raises;
- polar large bets suppress raising and preserve calls;
- raise breadth depends on relative polarisation, not a generic aggression rule;
- value threshold must be defined before bluff-raise volume.

Multiway use:

The bet-size/shape gate remains active, but the player-behind constraint can suppress otherwise valid heads-up raises.

### `CP-G3-L04` — Raising and Beyond

Supports:

- raise candidates need defined value/bluff/hybrid jobs;
- a call filters the opponent and forces next-street class migration;
- a flop aggression decision cannot be copied mechanically onto the turn.

Multiway use:

After bet-call or call-call, rebuild the range before delayed raising or barreling.

### `CP-G3-L08` — Properly Protected Checking Ranges

Supports:

- strong checks are full-tree investments;
- a checking range requires credible calls and raises;
- passive branches lose value when the expected next aggressor is absent;
- solver check frequencies require opponent-specific translation.

Multiway use:

Slow-play and delayed aggression depend on which remaining player is expected to supply pressure.

### `CP-G2-L05` — Out-of-Position Game

Supports:

- checking does not close action;
- robust hands can protect passive branches;
- slow-play may be theoretical, exploitative or erroneous;
- fast-play depends on whether future aggression is credible.

## Supporting FTGU evidence

### `FTGU-E20` — Probing the Turn

Supports:

- a turn lead begins with the exact flop check-back/filter;
- the turn card may restore the checked range and cancel the probe;
- probing is not automatic;
- size follows value/protection/polarisation.

Context split:

FTGU is heads-up. It confirms the action-filter method, not the multiway field-clear mechanism itself.

### `FTGU-E27` — Range Checking as PFR

Supports:

- initiative does not guarantee board ownership;
- a heavy-check strategy must retain calls and raises;
- OOP range-check simplification is valid only when protected.

Context split:

Multiway adds shared defence and collision risk beyond the heads-up range-check structure.

## Cross-source synthesis

The supported multiway sequence is:

```text
PREFLOP RANGE SOURCES
-> NUT / PREMIUM OWNERSHIP
-> ACTION-ORDER ROLE
-> SHARED-DEFENCE BURDEN
-> PLAYER-BEHIND GATE
-> BET SIZE / SHAPE
-> CALL / RAISE GEOGRAPHY
-> ACTION FILTER
-> FIELD-CLEAR TRANSITION
-> DELAYED RANGE EXPRESSION
-> CALL-CALL BARREL FILTER
-> FAST-PLAY OR PROTECT
```

This sequence is a system synthesis. No source presents the exact learner-facing chain in this wording.

## Stable directional conclusions

1. The middle player carries the greatest collision risk.
2. The closing player receives the most information and has more response freedom.
3. One defender does not individually owe a heads-up minimum defence frequency.
4. A live uncapped range behind suppresses marginal calls and bluff raises.
5. Offsuit nut combos and premium omissions can outweigh nominal initiative.
6. Multiway bluffs require stronger future support than comparable heads-up bluffs.
7. After the field clears, previously suppressed aggression may reappear, but the new node must be rebuilt.
8. If the expected aggressor is absent in practice, value should move forward conditionally.
9. Barrels after two calls are selected against the filtered call-call range, not the original field.
10. Exact frequencies, sizes and combo boundaries remain visual/solver dependent.

## Open evidence boundaries

- exact per-position defence frequencies;
- exact small-bet size menu;
- exact flop check-raise and turn-lead combo weights;
- exact three-way versus four-way scaling;
- exact deep side-pot and unequal-stack boundaries;
- Batumi frequency of stabs, raises, barrels and under-aggression.

## Evidence verdict

`MULTIWAY_DIRECTIONAL_ARCHITECTURE_SUPPORTED`

`H_R04_007_DIRECT_ANSWER_KEY_CAN_BE_BUILT_WITHOUT_EXACT_FREQUENCIES`

`EXACT_SOLVER_AND_FIELD_MAGNITUDES_REMAIN_PENDING`
