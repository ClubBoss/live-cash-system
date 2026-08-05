# CP-G3-L01 — Mixing: Facing Bets

Status: `AUDIO_COMPLETE / SOLVER_VISUALS_PENDING / MAPPED`

## Source identity

- source family: Carrot Poker School;
- grade: 3;
- lecture: 1;
- source title stated in audio: `Mixing`;
- source file: `Lecture 01.mp4`;
- transcript package: `transcripts_mlx_large_v3(20260805-215511).zip`;
- package SHA-256: `56a05d55cb573c4f01ad9b337f9e9534db638e78fae0d6ec95cf6d21eeb51f82`;
- duration: `49:23.14`;
- transcript engine: `mlx-whisper`;
- model: `large-v3`;
- language: English;
- translation: false.

## Source role

Grade 3 begins by teaching when and how to mix between actions while facing a bet.

The central distinction is:

```text
PURE ACTION
versus
OPTIONAL / NEAR-INDIFFERENT ACTIONS
```

Randomisation is legitimate only after identifying that multiple actions have sufficiently similar EV. It must not be used to perform an inferior action some percentage of the time.

## Source-faithful mechanism

### 1. Mixing eligibility

The lecture defines mixing as alternating between actions at frequencies when their expected values are close enough that neither is clearly superior.

Mixing is presented as more relevant in higher-visibility environments where opponents can observe frequencies, HUD statistics or repeated live tendencies.

### 2. Facing-bet action space

The main action set is:

```text
CALL ↔ RAISE ↔ FOLD
```

The learner is asked to identify:

- pure calls;
- pure raises;
- pure folds;
- call/raise indifference;
- call/fold indifference;
- rare three-way or near-three-way mixes.

The source repeatedly distinguishes hand class from realised EV. Suits, redraw quality, future river branches, showdown value and opponent continuation ranges can move similar-looking combinations across different action thresholds.

### 3. Turn raising

The lecture rejects a narrow model in which turn raises contain only obvious strong value and flush draws.

The source includes broader categories such as:

- high-equity low-showdown-value hands;
- selected vulnerable or volatile made hands;
- draws with different future contamination risk;
- occasional hybrid raises;
- value hands selected by full-tree EV rather than current hand label.

The exact combinations, frequencies and EV gaps remain solver-visual dependent.

### 4. River repolarisation and interference

After a prior call, a later raise repolarises the range.

The lecture introduces an `interference` idea for river bluff-raise selection:

- block the opponent's bet/call value region;
- avoid blocking hands expected to bet/fold;
- preserve enough value raises to support the bluff frequency;
- do not assume the bottom of range is automatically the best bluff raise.

On relatively blank runouts the source often prefers pair-based candidates that interfere with value while retaining innocuous side cards. On wetter runouts straight or flush blockers may become more important.

This is a source theorem label, not required product terminology.

### 5. River response grades

Facing a river bet, the source separates:

- value beaters;
- bluff catchers;
- frail hands that lose to some bluffs as well as all value.

Bluff-catcher quality depends on blocking value and unblocking bluffs. Frail hands should not be rescued by an RNG roll.

### 6. RNG guardrail

The strongest pedagogical warning is the `mixing pitfall`:

```text
UNCERTAIN WHETHER ACTION IS OPTIONAL
≠
PERMISSION TO RANDOMISE INTO A POSSIBLE BLUNDER
```

When uncertain whether a hand is a mix or a pure action, the source recommends taking the plausible pure action until the node is studied.

## Timestamp map

```text
00:04  Mixing definition and visibility
01:32  Call / raise / fold indifference framework
11:58  Turn-raising composition
24:39  River repolarisation and interference
30:06  River bluff-catcher grades
37:04  Mixing pitfall and RNG guardrail
47:28  Homework and error logging
```

## Pedagogical process

The homework asks the learner to compare their pre-solver action with a solver result and record separately:

- whether the action was a harmless mix deviation;
- whether it created a material EV loss;
- which repeated in-game reasoning error caused the miss.

This supports action/reason/confidence scoring rather than solver-action imitation.

## Visual dependencies

The following are not admitted from audio alone:

- exact board cards and suits;
- exact ranges and solver matrices;
- exact raise sizes;
- exact mixed frequencies;
- exact EV differences;
- exact combination ordering.

Visual review is required only if one of these exact claims can change a final boundary, original answer key or admitted rule.

## Cross-source routing

Primary module effects:

- `LCM-05` — call/raise/fold response shape;
- `LCM-06` — turn raising and repolarisation;
- `LCM-09` — river bluff-catching and interference;
- `LCM-11` — pure-versus-mix diagnostic and error logging.

Likely candidate relations:

- `H-W02-004` — bet shape and response shape;
- `H-W02-005` — active raises with selected volatile hands;
- `H-W02-009` — river audit;
- `H-W03-011` — blocker/interference ordering;
- `H-R05-002` — active branches inside passive strategies.

Exam routing:

- primary: `G3-Q01`;
- secondary support: `G3-Q04`, `G3-Q05`, `G3-Q07`.

## Source-purity boundary

This record preserves the source mechanism but does not copy its solver examples into the learner product.

## Verdict

`CP_G3_L01_CANONICALLY_INGESTED`

`MIX_ONLY_AFTER_PURE_ACTION_GATE`

`RNG_IS_NOT_PERMISSION_TO_BLUNDER`

`NO_NEW_CORE_CANDIDATE_REQUIRED`
