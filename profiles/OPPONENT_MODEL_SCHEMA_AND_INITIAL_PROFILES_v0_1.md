# General Live Cash — Opponent Model Schema and Initial Profiles v0.1

Status: `PROFILE_ARCHITECTURE`

Purpose: convert informal live reads into branch-specific, falsifiable and confidence-calibrated opponent models.

## Core rule

A label such as `nit`, `whale`, `passive` or `aggressive` is not an actionable model.

An actionable model states:

- where the deviation occurs;
- which hand classes are added or missing;
- which action branch is affected;
- how strong the evidence is;
- what observation would falsify the read.

## Profile schema

```yaml
profile_id:
display_name:
scope:
  game_type:
  positions:
  effective_stack_band:
  player_count:
evidence:
  direct_showdowns: []
  revealed_actions: []
  repeated_non_showdown_patterns: []
  sample_quality:
  confidence:
preflop_model:
  opens:
  calls:
  three_bets:
  four_bets:
  squeezes:
  straddle_adjustments:
postflop_branches:
  flop_small_bet:
  flop_large_bet:
  flop_check:
  turn_after_bet_call:
  turn_after_check_back:
  river_large_bet:
  river_raise:
missing_hand_classes: []
excess_hand_classes: []
likely_compensation:
likely_failure_to_compensate:
hero_adjustments:
  baseline_shift:
  branch_exploits: []
  forbidden_overgeneralizations: []
falsifiers: []
confidence_decay_rule:
status:
```

## Evidence grades

### `E0 — No evidence`

Only population prior. No player-specific exploit.

### `E1 — Weak clue`

One sizing tendency or one non-showdown action. Use only small directional adjustment.

### `E2 — Repeated pattern`

Several consistent actions in the same branch. Moderate exploit permitted.

### `E3 — Revealed range evidence`

Multiple showdowns or exposed hands confirm composition. Strong branch-level adjustment permitted.

### `E4 — Stable longitudinal model`

Large repeated sample across sessions and stack depths. Profile can influence several connected branches.

## Confidence rules

- Confidence applies to a specific branch, not the whole player.
- One revealed bluff does not imply global over-bluffing.
- One slowplay does not erase an established value-fast-play tendency, but it reduces certainty.
- Old evidence decays when game format, stakes, stack depth or emotional state changes.
- Unknown branch returns to robust baseline.

# Initial profile candidates

## P-01 — Value-heavy 3-bettor

**Tag:** `POOL_HYPOTHESIS / PLAYER_SPECIFIC`  
**Primary sources:** `SLC-M03-L24`, `L30`

### Model

Preflop 3-bet range is concentrated in premium pairs and strong high cards, with too few suited connectors, suited one-gappers and low-frequency bluffs.

### Expected consequences

- dominated offsuit broadways and many Ax lose value;
- low suited bluff supply is absent on later streets;
- high-card and natural draw region dominates the postflop range;
- later scary-card aggression may be under-bluffed.

### Hero adjustments

- open wider only when under-3-betting is independently established;
- defend the actual 3-bet more tightly;
- remove dominated big cards first;
- demand proof of later-street bluff supply before bluff-catching.

### Forbidden shortcut

Do not assume the player is weak enough postflop to justify every negative preflop call.

### Falsifiers

- repeated suited low 3-bet bluffs;
- broad multi-street bluffing with those hands;
- balanced check and bet branches.

---

## P-02 — Over-wide 3-bettor, normal-frequency c-bettor

**Tag:** `PLAYER_SPECIFIC`  
**Primary source:** `SLC-M03-L26`

### Model

Player enters preflop with too much weak material but continues to c-bet as though the range were normally constructed.

### Expected consequences

- flop range contains excessive air;
- required equilibrium compensation would be more checking;
- player may either give up too often on turns or continue over-bluffing.

### Hero adjustments

- continue wider on flop;
- do not predetermine the turn response;
- observe whether the player's error becomes `bet-then-give-up` or `bet-and-overbarrel`.

### Falsifiers

- high flop check frequency with weak range;
- disciplined turn shutdown consistent with compensation.

---

## P-03 — Overpair fast-player with weak check-back branch

**Tag:** `PLAYER_SPECIFIC / POOL_HYPOTHESIS`  
**Primary source:** `SLC-M03-L28`

### Model

Tight range bets overpairs too frequently on low flops and checks back too many unpaired broadways/high cards.

### Expected consequences

- flop bet branch is strong and bluff-poor;
- flop check-back branch is weak and under-protected;
- turn leads after check-back gain value.

### Hero adjustments

- defend tightly versus flop bet;
- attack appropriate turns after check-back;
- fast-play value against weak turn response if light raises are missing.

### Falsifiers

- revealed overpair checks;
- high-card flop bluffs;
- strong turn raises after check-back.

---

## P-04 — Flop over-folder / under-check-raiser

**Tag:** `PLAYER_SPECIFIC / POOL_HYPOTHESIS`  
**Primary source:** `SLC-M02-L06`

### Model

Player reaches the flop reasonably but fails to continue weak pairs, ace-highs and backdoors and rarely finds required check-raises.

### Expected consequences

- small c-bets with thin value and air gain immediate EV;
- after a call, remaining range is stronger than the initial weak-defence label suggests.

### Hero adjustments

- increase flop betting frequency with baseline-approved candidates;
- reduce automatic turn continuation after the player calls;
- distinguish over-folding from over-calling.

### Falsifiers

- repeated weak-pair calls;
- creative check-raises;
- wide flop call followed by weak turn range.

---

## P-05 — Excessive small c-bettor

**Tag:** `PLAYER_SPECIFIC`  
**Primary source:** `SLC-M03-L35`

### Model

Player uses a small c-bet with too much of the range, especially on boards where baseline strategy is more polar or check-heavy.

### Expected consequences

- range contains too much air;
- correct defence includes high-card calls and linear raises;
- strong hands must remain in call range as protection.

### Hero adjustments

- widen calls with appropriate high cards/backdoors;
- use more linear check-raises;
- avoid folding merely because the pot is deep and the board looks strong for the aggressor.

### Falsifiers

- small size shown to be value-heavy;
- player responds well to wide raises;
- meaningful check frequency with weak hands.

---

## P-06 — Passive multiway participant

**Tag:** `PLAYER_SPECIFIC / ENVIRONMENT_SENSITIVE`  
**Primary sources:** `SLC-M04-L37`, `L39`, `L41`

### Model

Player under-stabs, under-check-raises and under-barrels in multiway pots.

### Expected consequences

- equilibrium slowplays lose value;
- direct value betting and leading improve;
- traps waiting for the closing player to build the pot under-realize.

### Hero adjustments

- fast-play more value;
- simplify optional mixed leads toward direct action when appropriate;
- do not import the same adjustment versus the aggressive players at the table.

### Falsifiers

- repeated multiway check-raises;
- aggressive delayed stabs;
- sustained later-street pressure.

---

## P-07 — Size-transparent value bettor

**Tag:** `PLAYER_SPECIFIC`  
**Primary mechanisms:** `H-W02-007`, `H-W03-004`

### Model

Large size contains strong value and obvious draws but omits merged medium-strength hands; small size carries weak protection or air.

### Expected consequences

- branch-specific range gaps create turn leads and different defence thresholds;
- paired cards matching the omitted medium-strength class can shift ownership sharply.

### Hero adjustments

- model small and large branches separately;
- defend tighter versus value-heavy large branch;
- attack turns that pair the missing medium-strength region.

### Falsifiers

- revealed merged hands in large size;
- traps and air distributed across sizes.

---

## P-08 — Aggressive blocker bluffer

**Tag:** `PLAYER_SPECIFIC / ADVANCED`  
**Primary source:** `SLC-M02-L20`

### Model

Player identifies capped-looking ranges and uses blockers for oversized river raises or re-raises.

### Expected consequences

- extremely large size may exclude some natural value classes;
- Hero's passive line may retain more strength than Villain assumes;
- strong bluff-catchers can increase in value.

### Hero adjustments

- count represented value before folding;
- identify which value would use a smaller size;
- verify credible blocker bluffs and Hero's removal.

### Forbidden shortcut

Do not convert this into general hero-calling versus large river bets.

### Falsifiers

- repeated under-bluffed oversized lines;
- revealed nuts concentrated in the exact size;
- no credible blocker candidates in range ancestry.

---

## P-09 — River under-bluffer

**Tag:** `POOL_HYPOTHESIS / PLAYER_SPECIFIC`  
**Primary sources:** `SLC-M03-L30` and branch-construction mechanisms

### Model

Player arrives at river without the low-equity hands required to support theoretical bluff frequency.

### Expected consequences

- apparently strong bluff-catchers can become folds;
- blockers are secondary to the absence of underlying bluff classes.

### Hero adjustments

- trace bluffs backward;
- fold more when natural bluff supply was missing earlier;
- avoid using population under-bluff prior when the actual player demonstrably carries creative air.

### Falsifiers

- revealed low-equity triple barrels;
- preflop and flop range contains the necessary bluff families.

---

## P-10 — Loose-passive preflop over-caller

**Tag:** `ENVIRONMENT_SENSITIVE / PLAYER_SPECIFIC`  
**Primary mechanisms:** squeeze and multiway modules

### Model

Player calls opens and squeezes too widely but 3-bets and raises too little.

### Expected consequences

- squeeze value increases;
- multiway ranges are wider but may retain unexpected offsuit nut combinations;
- postflop passivity can increase direct-value incentives.

### Hero adjustments

- purify existing squeeze candidates;
- value-bet directly;
- do not assume the wide range is automatically weak on every board;
- update combo ownership for loose offsuit calls.

### Falsifiers

- frequent limp-reraise or back-raise;
- hidden aggressive postflop branches;
- disciplined squeeze folds.

# Profile update protocol

After relevant evidence:

1. record the exact node;
2. record revealed or inferred hand class;
3. update only the affected branch;
4. raise or lower confidence by one level at most unless direct repeated showdown evidence is decisive;
5. list a falsifier;
6. preserve baseline elsewhere.

## Read note format

```text
Player alias:
Date/session:
Node:
Observed action:
Revealed hand or range clue:
Branch affected:
Previous confidence:
New confidence:
Hero adjustment:
Falsifier to watch:
```

## Product rule

The system should never display a confident global label without branch evidence. User-facing profiles should communicate:

- what is known;
- where it is known;
- how confident the model is;
- where baseline still applies.

## Profile verdict

`OPPONENT_MODEL_SCHEMA_AND_INITIAL_PROFILE_SET_CREATED`
