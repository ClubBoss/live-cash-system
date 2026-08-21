# Practical Mastery — Wave 2 Full Practical Preflop Tree V1

Status: `W2_SPEC_COMPLETE / IMPLEMENTATION_PENDING`

## Objective

Turn the preflop conceptual spine into a complete practical decision tree for live-cash NLHE. The learner must be able to execute common position-pair decisions, not merely explain the factors that matter.

## Skill families

### PF-01 RFI by position
UTG/HJ/CO/BTN/SB opening discipline, with stack/rake/live-size context treated as explicit assumptions.

### PF-02 Limp / overlimp / isolation
When facing one or multiple limpers: isolate, overlimp or fold based on hand class, position, players behind, stack depth and opponent elasticity.

### PF-03 Calling IP
Flat-call decisions in position, emphasizing domination, implied odds, players behind, squeeze exposure and rake.

### PF-04 Calling from BB
Price, closing action, realization and domination; distinguish position-pair and open-size changes.

### PF-05 SB versus opens
Cold-call exposure, 3-bet-or-fold structures where source-supported, squeeze risk and poor realization.

### PF-06 3-betting
Linear/polar/merged construction as context-dependent shapes; distinguish IP/OOP and opener position.

### PF-07 Facing 3-bets
Fold/call/4-bet decisions by position, range shape, sizing, stack depth and hand family.

### PF-08 4-bet fundamentals
Value/bluff candidates, blocker logic, size/stack consequences and call/jam exposure without copying proprietary charts.

### PF-09 Squeezing
Open + caller branches, dead money, position, caller quality, fold equity, squeeze size and call branch.

### PF-10 Live/depth/rake adjustments
Larger live opens, weak caller pools, straddles, 100/150/200bb+ and high-rake effects.

## Source locks

Primary already-ingested authority:

- FTGU-E02 Opening Ranges by Position
- FTGU-E03 When Someone Limps
- FTGU-E04 Calling an Open in Position
- FTGU-E05 Calling Out of the Big Blind
- FTGU-E06 Small Blind 3-Bet or Fold Strategies
- FTGU-E15 Polar vs Linear 3-Betting
- FTGU-E16 Mixed 3-Betting
- FTGU-E17 Facing 3-Bets
- FTGU-E18 Polar 4-Betting
- Smash Live Cash preflop and squeeze lessons
- existing LCM-02 claims and drills

Exact chart cells/frequencies remain reference-only unless separately admitted.

## Required practice topology

Each major family should include, where source support exists:

- at least two position pairs;
- multiple hand families rather than one memorable combo;
- at least two relevant sizing/depth contexts;
- changed-node transfer where one variable changes the preferred branch;
- plausible fold/call/raise distractors;
- explicit explanation of which variable caused the decision change.

## W2 DoD

- common RFI/facing-open/facing-3bet/squeeze branches mapped: PASS in spec
- live limp/isolation branch exists: PASS in spec
- BB and SB separated rather than treated as one blind family: PASS in spec
- exact chart copying avoided: PASS
- runtime practice families: PENDING
- mixed preflop retrieval: PENDING

Verdict: `SPEC_PASS / RUNTIME_IMPLEMENTATION_PENDING`
