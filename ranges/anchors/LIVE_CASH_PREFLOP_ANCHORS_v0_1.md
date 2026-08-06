# Live Cash Preflop Anchors v0.1

Date: 2026-08-06  
Status: `PROVISIONAL_EXECUTABLE / INDEPENDENT / NOT_SOLVER_ADMITTED`

## Use rule

This is a compact table-facing anchor system, not a set of exact mixed-frequency charts.

```text
CORE
-> use by default

FLEX
-> add or remove by price, rake, depth, players behind and opponent range

NO INVENTION
-> do not replace removed calls with random bluffs
```

Machine-readable authority:

`ranges/independent/PREFLOP_ANCHOR_LIBRARY_v0_1.json`

Assumptions authority:

`ranges/assumptions/BATUMI_LIVE_PREFLOP_ASSUMPTIONS_v1.md`

## Card A1 - Unopened pot

Reference node: 8-9 handed, no ante, 100bb, high-capped-live sensitivity.

| Position | Reference range | Combos | Percent |
|---|---|---:|---:|
| EP | `44+, A2s+, KTs+, QTs+, JTs, T9s, 98s, AJo+, KQo` | 194 | 14.63% |
| HJ | `22+, A2s+, K9s+, Q9s+, J9s+, T8s+, 98s, 87s, 76s, ATo+, KJo+, QJo` | 266 | 20.06% |
| CO | `22+, A2s+, K7s+, Q8s+, J8s+, T8s+, 97s+, 86s+, 75s+, 65s, 54s, A8o+, KTo+, QTo+, JTo` | 362 | 27.30% |
| BTN | `22+, A2s+, K2s+, Q5s+, J7s+, T7s+, 96s+, 85s+, 74s+, 64s+, 54s, 43s, A2o+, K7o+, Q8o+, J8o+, T9o, 98o` | 602 | 45.40% |
| SB | `22+, A2s+, K2s+, Q5s+, J7s+, T7s+, 96s+, 85s+, 74s+, 64s+, 54s, 43s, A2o+, K9o+, Q9o+, J9o+, T9o` | 542 | 40.87% |

Cue:

`How many players remain, and am I opening core or edge?`

Adjustment order:

1. actual players dealt in;
2. open size;
3. rake tier;
4. stack in current blind/straddle units;
5. players behind.

## Card A2 - Limped pot and isolation

Cue:

`Am I isolating for value/position, or just making a bigger multiway pot?`

### In position

Core:

`77+, A9s+, KTs+, QTs+, JTs, T9s, AJo+, KQo`

Flex:

`22-66, A2s-A8s, K9s, Q9s, J9s, T8s, 98s-65s, ATo, KJo, QJo`

Size anchor:

`4.5bb + 1bb per additional limper`

Add only `1-2bb` when calls are demonstrably inelastic. Do not keep inflating until only stronger hands call unless that is the objective.

### Out of position

Core:

`88+, ATs+, KQs, AQo+`

Flex:

`55-77, A5s-A2s, A9s, KTs+, QTs+, JTs, AJo, KQo`

Size anchor:

`5.5bb + 1bb per additional limper`

Remove first:

- dominated offsuit broadways;
- low disconnected offsuit hands;
- small suited hands at short effective depth.

## Card A3 - Facing an open

Cue:

`Price -> opener zone -> players behind -> position -> line.`

### BB versus EP 3x

3-bet core:

`QQ+, AK`

3-bet flex:

`JJ, AQs, A5s-A4s`

Call core:

`22-JJ, A2s-AQs, KTs+, QTs+, JTs, T9s, 98s, 87s`

Call flex:

`K9s, Q9s, J9s, 76s, 65s, AJo, KQo`

When rake or open size rises, remove `AJo/KQo` and the weakest suited flex hands first.

### BB versus CO 3x

3-bet core:

`JJ+, AQs+, AKo`

3-bet flex:

`TT, AJs, ATs, AQo, A5s-A2s, KQs, KTs, QTs, JTs`

Call core:

`22-TT, A2s-AQs, K8s+, Q9s+, J9s+, T8s+, 97s+, 86s+, 75s+, 65s, A9o-AQo, KTo-KQo, QTo+, JTo`

### BB versus BTN 2.5-3x

3-bet core:

`TT+, AQs+, AKo`

3-bet flex:

`88-99, A9s-AJs, AQo, A5s-A2s, K9s-KQs, Q9s-QJs, J9s-JTs, T9s`

Call core:

`22-99, A2s-AQs, K2s+, Q5s+, J7s+, T7s+, 96s+, 85s+, 74s+, 64s+, 54s, A2o-AJo, K7o-KQo, Q8o+, J8o+, T8o+, 98o`

Against 4x, remove weak offsuit kings/queens, bottom suited gappers and lowest offsuit connectors first.

### SB versus an open

Default:

`3-bet or fold`

Flat only when all are true:

- usually `150bb+`;
- BB is passive;
- open is small;
- squeeze risk is low;
- the hand realises materially better as a call than as a 3-bet.

Do not flat because 3-betting feels uncomfortable.

## Card A4 - Facing a 3-bet

Cue:

`Is the 3-bet range wide enough to contain real folds? Which hands realise as calls?`

### Tight early-position configuration

4-bet value core:

`KK+, AKs`

Flex:

`QQ, AKo`

IP call core:

`99-QQ, AQs, KQs`

`A5s-A4s` become bluff candidates only with evidence that the 3-bet range is wider than the value-heavy default.

### Late position versus blind

4-bet value:

`QQ+, AK`

First bluff candidates:

`A5s-A4s`

IP call core:

`77-JJ, A9s-AQs, KTs+, QTs+, JTs, T9s, 98s, AQo, KQo`

Call flex:

`22-66, A5s-A2s, K9s, Q9s, J9s, 87s-65s, AJo`

Fold dominated offsuit hands first:

`KJo, QJo, ATo` and lower equivalents.

### OOP versus IP 3-bet

- call less;
- 4-bet more linearly;
- retain calls that can continue across runouts;
- do not protect the call branch with hands that are already dominated and fragile.

100bb size anchor:

- IP: roughly `2.2-2.4x` the 3-bet;
- OOP: roughly `2.4-2.7x` the 3-bet.

These are geometry anchors, not room-validated exact sizes.

## Card A5 - Squeeze and polar bluff selection

Cue:

`Candidate or invention?`

### Squeeze sizing

```text
IP:
3x open + one open-size unit per caller

OOP:
4x open + one open-size unit per caller
```

At 200bb+ or versus very sticky calls, add `0.5-1` open-size unit. Do not use random fixed padding detached from the original open.

### Versus early open

Value core:

`QQ+, AK`

Flex:

`JJ, AQs, A5s-A4s`

Preserve calls IP/deep:

`22-JJ, AQs, KQs, QJs, JTs, T9s, 98s`

Reject:

`KJo, QJo, ATo` and disconnected offsuit bluffs.

### Versus late open

Value core:

`TT+, AQ+`

Flex:

`77-99, A9s-AJs, KQs, KJs, QJs, JTs, A5s-A2s`

Preserve calls IP/deep:

`22-99, A2s-AQs, K9s+, Q9s+, J9s+, T8s+, 98s-65s`

Do not squeeze a hand merely because it appears too weak to call.

### Polar 4-bet selector

First candidates:

`A5s-A4s`

Secondary:

`A3s-A2s` when the same blocker and fold-target logic remains.

Rare conditional candidates:

`KTs-K9s` only when the 3-bettor folds enough `KQ/KJ`-type hands and does not flat the 4-bet widely.

Usually not candidates:

- `98s/87s` when they realise well as calls;
- offsuit junk;
- hands dominated by the expected call branch;
- hands that block folds more than continues.

Required test:

`Which better hands fold, and what calls or 5-bets?`

If that answer is vague, do not manufacture the bluff.

## Universal overlays

### Open size

- `2.5x`: add one flex band in position and BB;
- `3x`: reference;
- `4x`: remove one flex band;
- `5x+`: continue mainly core.

### Depth

- `40-60bb`: linearise; reduce speculative flats;
- `80-120bb`: reference;
- `150-250bb`: add IP suited/pair calls and protected flats;
- `300-400bb`: prioritise nut potential and position; sharply reduce dominated OOP continues.

### Rake

Higher effective rake removes marginal calls before it removes strong value raises.

### Players behind

Aggressive players behind reduce flats. They do not automatically convert every removed flat into a bluff 3-bet.

### Straddle

Recalculate every stack and size in straddle units before selecting an anchor.

## Validation boundary

Ready for:

- table-facing directional use;
- original drills;
- changed-node diagnosis;
- private source comparison.

Not yet authorised as:

- exact equilibrium charts;
- universal Batumi ranges;
- fixed mixed frequencies;
- admitted final Playbook rules.

## Verdict

`FIVE_PREFLOP_ANCHOR_CARDS_ACTIVE`

`SQUEEZE_AND_POLAR_TARGET_ANSWER_KEYS_STABLE_DIRECTIONALLY`

`SOLVER_AND_FIELD_CALIBRATION_PENDING`
