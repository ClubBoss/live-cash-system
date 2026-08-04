# General Live Cash — Environment Profile Template v0.1

Status: `DEPLOYMENT_TEMPLATE`

Purpose: calibrate the general live-cash core to a specific game without turning local assumptions into universal rules.

## Profile identity

```yaml
profile_id:
display_name:
location_or_network:
game_format:
stakes:
currency:
observation_period:
source_of_information:
confidence:
status:
```

## Structural game variables

```yaml
rake:
  model: percentage | cap | time_charge | unknown
  percentage:
  cap:
  time_charge:
  confidence:
ante:
straddle:
  available:
  mandatory_or_optional:
  typical_size:
  frequency:
  restraddle_frequency:
  confidence:
seating:
  typical_players_dealt:
  table_changes:
```

## Stack distribution

```yaml
stack_bands:
  under_40bb:
  40_to_70bb:
  70_to_125bb:
  125_to_200bb:
  over_200bb:
median_effective_stack:
short_stack_rebuy_behavior:
deep_stack_frequency:
confidence:
```

Record pairwise effective stacks from actual decisions rather than only starting-stack snapshots.

## Preflop environment

```yaml
typical_open_sizes_by_position:
limp_frequency:
limp_call_frequency:
overcall_frequency:
isolation_sizes:
three_bet_frequency:
four_bet_frequency:
squeeze_frequency:
blind_defence_shape:
straddle_adjustments:
```

For each claim include:

- observation count;
- independent players;
- contradictory evidence;
- confidence grade.

## Postflop environment by node

### Single-raised pots

```yaml
flop_small_bet_response:
flop_large_bet_response:
check_raise_frequency:
turn_double_barrel_response:
turn_lead_frequency:
river_large_bet_response:
```

### 3-bet pots

```yaml
preflop_range_shape:
flop_cbet_frequency:
small_bet_defence:
large_bet_defence:
turn_barrel_frequency:
river_bluff_supply:
```

### Multiway pots

```yaml
initial_opener_aggression:
closing_player_stab_frequency:
check_raise_frequency:
small_bet_price_elasticity:
slowplay_frequency:
later_street_barrel_frequency:
```

## Population hypotheses

Use the format:

```text
Hypothesis ID:
Node:
Claim:
Supporting observations:
Contradictory observations:
Confidence: E0–E4
Likely adjustment:
Maximum permitted adjustment:
Falsifier:
Status: ACTIVE / WEAKENED / REJECTED / CONFIRMED_FOR_PROFILE
```

## Player-type distribution

Estimate only after repeated observation:

- loose-passive over-callers;
- value-heavy 3-bettors;
- over-wide aggressive 3-bettors;
- passive multiway players;
- strong regulars;
- short-stack specialists;
- recreational deep-stack players;
- aggressive blocker-bluffers.

Do not use player-type percentages as facts without a documented sample.

## Table-selection variables

```yaml
peak_days_times:
player_turnover:
waiting_list:
private_game_access:
seat_change_rules:
buy_in_limits:
reentry_behavior:
security_or_cash_handling_constraints:
```

These affect deployment and game selection, not poker theory.

## Core-to-overlay mapping

For each admitted heuristic:

```text
Heuristic ID:
General default:
Environment evidence:
Adjustment direction:
Adjustment strength:
Confidence:
Do-not-overgeneralize warning:
```

## Priority calculation

Study or exploit priority:

`OCCURRENCE × EV LEVERAGE × CURRENT UNCERTAINTY × ENVIRONMENT DEVIATION`

Use qualitative grades until reliable data exists.

## Example of correct separation

### General core

`Multiway defence is shared.`

### Environment observation

`Closing players in this game rarely check-raise multiway.`

### Overlay

`Fast-play strong value more often when the specific passive players close action.`

The environment observation does not rewrite the general rule.

## Profile review cadence

Review when:

- game format changes;
- stakes change;
- rake changes;
- major player pool changes;
- straddle culture changes;
- enough contradictory evidence accumulates;
- field results reveal systematic misuse.

## Profile verdict format

`ENVIRONMENT_PROFILE_ACTIVE — <PROFILE_ID> — CONFIDENCE <E0-E4>`

or:

`ENVIRONMENT_PROFILE_INSUFFICIENT_EVIDENCE`
