# Batumi Multiway Field Calibration Card v0.1

Date: 2026-08-06  
Status: `ACTIVE_OBSERVATION_SCHEMA / NO_POPULATION_DEFAULTS`

## Purpose

Measure the field-dependent branches that the source corpus cannot establish for the target game.

Do not record only memorable pots. Record opportunities, including checks and folds.

## Opportunity record

```text
Session/date:
Room/stakes:
Players dealt in:
Effective stacks / straddle units:
Preflop line:
Players to flop:
Hero role: opening / middle / closing / reopener / survivor
Board class:
Flop action and exact sizes:
Player-behind state: capped / uncapped / cannot raise / unknown
Field cleared?: yes/no; who folded?
Turn card class:
Delayed lead opportunity?: yes/no
Delayed lead observed?: yes/no
Expected aggressor:
Did expected aggression arrive?: yes/no
Showdown or revealed range evidence:
Confidence:
Falsifier:
```

## Branches to track

### 1. Tiny-bet elasticity

Track separately:

- middle fold/call/raise;
- closing-player fold/call/raise;
- whether the bettor paid more for the same folds later;
- whether tiny bets are value-heavy, air-heavy or mixed at showdown.

Do not infer weakness from size alone.

### 2. Closing-player aggression

Track:

- check-raise opportunities;
- actual value raises;
- actual bluff/semibluff raises;
- missed obvious aggression at showdown;
- whether strong hands routinely slow-play.

This evidence controls the fast-play/protect overlay.

### 3. Field-clear delayed aggression

Track nodes where:

- a player behind suppressed flop aggression;
- that player folded;
- BB or another survivor could lead turn;
- the turn was neutral, restoring or range-compressing;
- value and bluff candidates were shown.

### 4. Multiway barrels

After bet-call-call, record:

- turn barrel frequency;
- size;
- hand shown;
- whether low-card/removal hands appear;
- river follow-through;
- obvious give-ups.

### 5. Value arrival

For strong value, record:

- who was expected to bet next;
- whether they did;
- whether checking caused a lost street;
- whether fast-playing caused extreme folds;
- whether the table raised enough to justify traps.

## Evidence grades

- `E0` — assumption only;
- `E1` — one observed branch; anecdotal;
- `E2` — repeated branch from multiple players or sessions;
- `E3` — stable pattern with opportunity denominator and contrary examples tracked;
- `E4` — sufficiently stable to support a temporary room/profile overlay with explicit falsifier.

No exact count threshold is universal. Opportunity quality and independence matter more than raw sample size.

## Update rule

```text
NEW OBSERVATION
-> update exact branch only
-> preserve theoretical/directional baseline
-> state confidence and falsifier
-> decay confidence when room, stakes or lineup changes
```

## Prohibited conclusions

Do not promote:

- `Batumi players never raise multiway`;
- `tiny bets always work`;
- `turn leads are underbluffed`;
- `slow-play is always bad`;
- `one room equals the full field`.

## Verdict

`MULTIWAY_FIELD_SCHEMA_ACTIVE`

`FAST_PLAY_AND_TINY_BET_MAGNITUDES_REMAIN_FIELD_GATED`
