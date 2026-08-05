# Live Cash System — Pre-Source Direct Drill Shells v0.1

Status: `SCENARIO_FACTORIES_READY / FINAL_KEYS_SOURCE_GATED`

## Purpose

Prepare original drill structures for mechanisms with missing or indirect direct coverage.

These are not learner-ready final drills. Each shell defines:

- the reasoning step to test;
- node variables;
- misleading contrasts;
- target misconceptions;
- required source-question closure;
- what can be finalised without exact charts.

No proprietary source hand or solver frequency is reproduced.

## Release vocabulary

- `SHELL_READY`: scenario architecture is safe.
- `DIRECTION_READY`: robust directional answer can be taught.
- `KEY_PENDING`: final boundary or answer key awaits remaining evidence.
- `ANCHOR_PENDING`: exact action family depends on independent ranges.
- `FIELD_PENDING`: exploit magnitude requires observations.

---

# DS-01 — Squeeze candidate purification

Mapped candidate: `H-W01-002`  
Primary module: `LCM-02`  
Target misconceptions: `MC-003`, `MC-004`

## Test objective

Distinguish:

- expanding an existing plausible squeeze candidate;
- preserving a protected flat;
- inventing a random bluff because the table appears weak.

## Scenario variables

```yaml
hero_position:
open_position:
caller_position:
effective_stack:
open_size:
caller_range_shape:
players_behind:
hand_family:
blocker_profile:
flat_realisation:
```

## Contrast set

1. same hand, 100bb versus 250bb;
2. same hand, no aggressive players behind versus active squeezer behind;
3. blocker-rich offsuit candidate versus attractive-looking but dominated random hand;
4. wide opener plus weak caller versus tight opener plus strong caller.

## Required source questions

- `SQ-PF-01`;
- `SQ-RNG-01`.

## Release state

`SHELL_READY / KEY_PENDING / ANCHOR_PENDING`

---

# DS-02 — Deep OOP protected call versus discomfort raise

Mapped candidates: `H-W01-006`, `H-R04-010`  
Primary modules: `LCM-03`, `LCM-05`  
Target misconception: `MC-008`

## Test objective

Determine whether Hero raises because the range benefits or because future OOP decisions feel uncomfortable.

## Scenario variables

```yaml
pot_type:
positions:
effective_stack_band:
board_dynamism:
villain_bet_size_shape:
hero_hand_resilience:
hero_blockers_to_folds:
turn_distribution:
raise_value_threshold:
```

## Contrast set

1. 100bb versus 250bb;
2. static versus dynamic board;
3. small/wide versus large/polar bet;
4. resilient overpair/draw versus vulnerable one-pair hand;
5. raise that blocks folds versus raise that unblocks folds.

## Required source questions

- `SQ-DEP-02`;
- `SQ-SRP-05`.

## Robust direction already available

Do not raise solely to avoid future decisions. Preserve strong calls when range protection and future resilience matter.

## Release state

`SHELL_READY / DIRECTION_READY / KEY_PENDING`

---

# DS-03 — Polar preflop target-fold selection

Mapped candidate: `H-W01-008`  
Primary module: `LCM-02`  
Target misconceptions: `MC-003`, `MC-004`

## Test objective

Identify whether a polar bluff:

- blocks stronger continues;
- targets dominating offsuit opens;
- retains acceptable fallback properties;
- is inappropriate because a profitable call branch exists.

## Scenario variables

```yaml
position_pair:
open_range_shape:
hero_call_branch_quality:
hero_blockers:
domination_target:
rake:
effective_stack:
players_behind:
```

## Contrast set

1. hand with profitable call versus hand with poor call but useful blockers;
2. blocker removes folds versus blocker removes continues;
3. tight early open versus wide late open;
4. shallow versus deep stack.

## Required source questions

- `SQ-PF-03`;
- `SQ-RNG-01`.

## Release state

`SHELL_READY / KEY_PENDING / ANCHOR_PENDING`

---

# DS-04 — Turn lead from flop range composition

Mapped candidates: `H-W02-006`, `H-R04-007`  
Primary modules: `LCM-04`, `LCM-06`, `LCM-08`  
Target misconception: `MC-014`

## Test objective

Separate:

- turn card that merely looks favourable;
- turn card that changes ownership after a specific flop betting/checking branch;
- delayed aggression created by hands suppressed on the flop.

## Scenario variables

```yaml
pot_type:
heads_up_or_multiway:
flop_board_family:
flop_bet_size_shape:
flop_check_or_call_filter:
turn_card_family:
which_value_was_spent:
which_draws_were_preserved:
position_order:
```

## Contrast set

1. same turn card after small range bet versus large selective bet;
2. same turn after flop check-back versus bet-call;
3. heads-up versus sandwiched multiway;
4. card helps nominal BB range but not surviving BB range.

## Required source questions

- `SQ-SRP-04`;
- `SQ-MW-04`.

## Robust direction already available

Lead decisions follow the range created by the flop branch, not the turn card label alone.

## Release state

`SHELL_READY / DIRECTION_READY / KEY_PENDING`

---

# DS-05 — Value-heavy bet and speculative-float removal

Mapped candidate: `H-W02-008`  
Primary module: `LCM-10`  
Secondary modules: `LCM-05`, `LCM-09`  
Target misconception: `MC-016`

## Test objective

Test whether Hero first asks how much air exists behind the bet before defending a theoretically plausible backdoor float.

## Scenario variables

```yaml
opponent_branch_evidence:
bet_size:
board_family:
preflop_range_shape:
observed_value_density:
observed_bluff_families:
hero_backdoor_quality:
future_position:
```

## Contrast set

1. same size from range-wide player versus value-heavy branch;
2. same backdoor with high versus low future realisation;
3. one observation versus repeated branch evidence;
4. theoretical baseline versus evidenced exploit.

## Required source questions

- `SQ-EXP-02`;
- `SQ-RIV-02`.

## Robust direction already available

Do not preserve speculative floats when the relevant betting branch lacks enough air. Population confidence remains gated.

## Release state

`SHELL_READY / DIRECTION_READY / FIELD_PENDING`

---

# DS-06 — Suppressed flop aggression reappearing later

Mapped candidate: `H-R04-007`  
Primary module: `LCM-08`  
Secondary modules: `LCM-04`, `LCM-06`  
Target misconceptions: `MC-006`, `MC-014`, `MC-024`

## Test objective

Recognise that a player who could not or should not raise/stab on the flop may retain strong or aggressive hands that appear as turn leads or delayed bets.

## Scenario variables

```yaml
players:
flop_action_order:
sandwich_position:
closing_player:
flop_bettor_range:
flop_suppressed_hand_classes:
turn_card:
turn_action_order:
```

## Contrast set

1. sandwiched caller versus closing caller;
2. passive flop due to collision risk versus genuinely capped flop branch;
3. turn card that activates preserved draws versus blank;
4. heads-up delayed aggression versus multiway suppressed aggression.

## Required source questions

- `SQ-MW-04`;
- `SQ-SRP-04`.

## Release state

`SHELL_READY / KEY_PENDING`

---

# DS-07 — Protected passive branch construction

Mapped candidates: `H-R04-010`, `H-R05-002`, `H-W01-006`  
Primary module: `LCM-05`  
Target misconceptions: `MC-008`, `MC-029`

## Test objective

Decide which resilient hands must remain in calls/check-backs and which hands supply polar or merged raises so that the passive branch is not capped.

## Scenario variables

```yaml
position:
effective_stack:
bet_size_shape:
board_urgency:
hand_resilience:
protection_need:
blockers_to_folds:
future_street_coverage:
```

## Contrast set

1. strong low-urgency top pair versus vulnerable middle pair;
2. high-SPR dynamic board versus low-SPR static board;
3. small/wide bet versus large/polar bet;
4. protected call branch versus raise-only defence.

## Required source questions

- `SQ-DEP-02`;
- `SQ-SRP-03`;
- `SQ-SRP-05`.

## Robust direction already available

A passive branch needs resilient calls and appropriate raises. Do not move all strong hands into aggression.

## Release state

`SHELL_READY / DIRECTION_READY / KEY_PENDING`

---

# DS-08 — Timed ownership recalculation

Mapped candidate: `H-R05-001`  
Primary module: `LCM-04`  
Target misconceptions: `MC-007`, `MC-018`, `MC-022`

## Test objective

Within a short time limit, state how ownership changes after an action filter.

## Interaction form

Show:

1. preflop range summary;
2. flop board and action;
3. turn card;
4. ask for only four outputs:

```text
what folded?
what raised/spent?
what remained?
who owns the new card now?
```

## Scenario variables

```yaml
pot_type:
preflop_shape:
flop_size_shape:
flop_response:
turn_card:
position:
```

## Contrast set

- same turn after bet-call versus check-check;
- same flop against BB versus SB;
- same card in SRP versus 3-bet pot;
- range-wide flop bet versus selective flop bet.

## Required source questions

- `SQ-SRP-02` is already mechanism-closed;
- `SQ-3B-04` may improve advanced variants.

## Release state

`SHELL_READY / DIRECTION_READY`

This shell can be converted into learner-ready drills before remaining source completion because it does not require exact frequencies.

---

# DS-09 — Live tell as weighted evidence

Mapped candidate: `H-R04-008`  
Primary modules: `LCM-10`, `LCM-11`  
Target misconceptions: `MC-015`, `MC-030`

## Test objective

Distinguish:

- observation;
- range update;
- confidence grade;
- action change;
- falsifier.

## Scenario variables

```yaml
physical_or_timing_observation:
prior_sample:
action_branch:
showdown_confirmation:
contradictory_evidence:
pot_importance:
```

## Contrast set

1. one tell without showdown versus repeated tell with showdown;
2. tell observed in small bet versus assumed in overbet branch;
3. live tell aligned with range evidence versus contradicting range evidence;
4. recent observation versus stale observation after adaptation.

## Required source questions

- `SQ-EXP-01`;
- `SQ-EXP-04`.

## Robust direction already available

A tell is a weighted data point, not a complete range conclusion. Evidence remains branch-specific and falsifiable.

## Release state

`SHELL_READY / DIRECTION_READY / FIELD_VARIANTS_PENDING`

## Conversion workflow after source arrival

For each shell:

1. map new evidence to its question IDs;
2. decide whether the answer key changes or only explanation improves;
3. add one positive case;
4. add one misleading adjacent case;
5. add one boundary/counterexample;
6. define confidence expectation;
7. create immediate and delayed variants;
8. assign immutable final drill IDs;
9. update module readiness.

## Shell-pack verdict

`NINE_DIRECT_DRILL_FACTORIES_PREBUILT`

`FUTURE_SOURCE_COMPLETION_REQUIRES_BOUNDARY_FILLING_NOT DRILL DESIGN FROM ZERO`
