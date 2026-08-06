# Batumi Live Preflop Assumptions v1

Date: 2026-08-06  
Status: `ACTIVE_SPECIFICATION / FIELD_CALIBRATION_REQUIRED`

## Purpose

Define explicit target-game assumptions before any independent preflop anchor is treated as executable. This file separates public room evidence, design assumptions and unknown field variables.

## Public target-game evidence

Current public information does not support one universal Batumi structure.

- PokerDiscover currently lists NLH `1/3`, `5/5`, `5/10` and higher games in Batumi; the `1/3` listing shows a `$150` minimum buy-in.
- Casino Iveria's official poker-room page lists NLH/PLO `5/5`, `$300` minimum, `$2000` maximum and `4%` rake.
- Current public listings for other rooms show examples of `5%` rake with caps such as `$60` or `$100`.
- BR Poker Club displays nine-seat tables with variable occupancy, confirming that a nominal full-ring room may play short-handed at a given moment.

These observations justify an assumptions grid, not one claimed exact Batumi baseline.

## Target user environment

- primary stakes: `1/3` and `2/5` equivalents;
- nominal table: `8-9 handed`;
- common effective depth: `100-200bb`;
- possible short stacks: `40-80bb`;
- occasional depth: `300-400bb`;
- possible live straddle;
- frequent limps, larger opens and multiway pots are expected possibilities, not assumed universal facts.

## Baseline design node

The independent anchor library uses this reference node:

```text
8-9 handed
no ante
100bb effective
EP/HJ/CO open 3bb
BTN open 2.5bb
SB open 3.5bb
high-capped-live sensitivity
straddle off
```

This is a comparison reference. It is not a claim that every Batumi room uses these sizes.

## Rake tiers

### `R0_LOW_OR_TIME`

- low percentage/cap or time collection;
- marginal IP and BB calls retain more value;
- suited and connected flex bands survive more often.

### `R1_MODERATE_4PCT_CAPPED`

- reference moderate live structure;
- use the baseline core and context-sensitive flex bands;
- confirm no-flop-no-drop and cap before treating it as exact.

### `R2_HIGH_5PCT_OR_UNCERTAIN_CAP`

- conservative target assumption for marginal calls;
- remove dominated offsuit calls and weakest suited gappers first;
- prefer fold or value-led raise over low-realisation flats;
- never widen merely because the nominal pot is large.

## Open-size grid

| Open | Anchor response |
|---:|---|
| `2.5x` | add one flex band in position and BB |
| `3x` | reference node |
| `4x` | remove one flex band; dominated offsuit leaves first |
| `5x+` | continue mainly core; speculative calls require explicit depth and implied-odds justification |

## Effective-depth grid

| Depth | Structural adjustment |
|---:|---|
| `40-60bb` | linearise 3-bet/4-bet, reduce speculative flats and small-pair implied-odds calls |
| `80-120bb` | baseline architecture |
| `150-250bb` | add IP suited/pair calls, preserve protected flats, reduce OOP automatic stack-offs |
| `300-400bb` | prioritise nut potential and position; strongly penalise dominated offsuit and OOP one-pair commitment |

Exact hand-by-hand thresholds remain solver and field calibration questions.

## Straddle rule

Always translate the game into straddle units before using a depth anchor.

```text
$600 stack in 1/3 with a live $6 straddle
= 100 straddles effective
not 200 ordinary big blinds
```

Open sizes, 3-bets, squeezes and SPR expectations must use the same denominator.

## Player-count remap

The ranges are labelled by functional position, not seat name alone.

- When the table becomes short-handed, remap to the number of players still to act.
- A six-handed UTG is not the same source range as a nine-handed UTG.
- Do not use the EP anchor merely because the room prints `UTG` on the seat display.

## Players-behind overlay

- passive players behind: retain protected calls and realisation hands;
- aggressive squeezer behind: remove weakest flats first;
- multiple sticky callers: increase value density and sizing, not random suited-hand volume;
- short stack behind: account for squeeze/jam risk before entering a speculative call.

## Field verification card

Before the first full session, record:

1. blind and straddle structure;
2. table seats and actual players dealt in;
3. standard open size by position;
4. standard 3-bet and squeeze size;
5. rake percentage, cap, rounding and no-flop-no-drop rule;
6. minimum/maximum buy-in;
7. frequency of limped, heads-up and multiway pots;
8. whether players defend price-elastically;
9. whether cold calls attract frequent squeezes;
10. whether the game uses time collection or promotional drops.

Until these are known, use conservative flex-band discipline rather than manufacturing precision.

## Non-assumptions

This specification does not claim:

- that public listings are complete;
- that `2/5` is always spread publicly;
- that all Batumi rooms use the same rake;
- that every table is nine-handed in practice;
- that source-course charts are current or transferable;
- that the current anchors are equilibrium-exact.

## Verdict

`TARGET_GAME_ASSUMPTION_GRID_ACTIVE`

`ROOM_SPECIFIC_RAKE_AND_SIZE_FIELD_CHECK_REQUIRED`

`INDEPENDENT_ANCHOR_DERIVATION_AUTHORISED`
