# CP-G3-L07 — Triple Barreling

Status: `AUDIO_COMPLETE / SOLVER_VISUALS_PENDING / MAPPED`

## Source identity

- source family: Carrot Poker School;
- grade: 3;
- lecture: 7;
- source title stated in audio: `Triple Barreling`;
- source file: `Lecture 07.mp4`;
- transcript package: `transcripts_mlx_large_v3 2(1).zip`;
- package SHA-256: `bf46ac4ba2f0cffc6d5fa5763e9569cd4b9e7795b457203a0b244bc92820053d`;
- duration: `39:11.66`;
- transcript engine: `mlx-whisper`;
- model: `large-v3`;
- language: English;
- translation: false.

## Source role

Lecture 7 turns river bluffing into a comparison between bet EV and check EV after a heavily filtered multi-street line.

The source uses three bluffing-EV classes:

```text
POSITIVE  → mandatory / winning bluff
NEUTRAL   → optional / near-break-even bluff
NEGATIVE  → losing bluff / give-up
```

## Source-faithful mechanism

### 1. Triple-barrel range state

A triple-barrel node normally contains:

- a highly polarised aggressor range;
- a strongly condensed caller range;
- severe action filtering from preflop through the river;
- a low-SPR or near-all-in final branch in many examples.

Exact sizing need not be perfectly geometric. The important requirement is a coherent multi-street investment plan rather than mechanical equal-ratio sizing.

### 2. Bluffing EV rather than showdown value alone

The source defines bluffing EV as the difference between betting and checking.

A hand with some showdown value can still be a mandatory bluff when betting clearly dominates checking. A hand with almost no showdown value can still be a losing bluff if it blocks folds, unblocks calls or wins often enough by checking.

### 3. Positive and negative blocker functions

The lecture evaluates river bluff candidates through two source labels:

- positive removal effects that make calls less available;
- negative removal effects that remove folds or preserve calls.

These labels are nested into the broader blocker-function vector established in Lecture 3.

### 4. Immediate past and immediate future

The present river decision is explained through:

```text
PRIOR ACTION FILTERS
→ CURRENT VALUE / AIR SUPPLY
→ OPPONENT CALL / FOLD REGION
→ BET EV VERSUS CHECK EV
```

The source repeatedly warns against remembering a single combo without describing why the rule applies to that line and range state.

### 5. Theory-to-opponent translation

Solver outputs are treated as a baseline. The learner must ask whether a competent human or a weaker live opponent reaches the same river with the same folding and calling regions.

The source recommends changing the heuristic when real opponents filter differently rather than copying the equilibrium combo list.

### 6. Runout favourability and selectivity

On unfavourable or “wet blanket” runouts, bluffing can become extremely selective because the caller reaches the river with more natural strong hands while many of the aggressor's bluffs block folds.

This is not a universal ban on bluffing wet runouts. The conclusion depends on the preflop and postflop range construction.

## Pedagogical process

The homework asks the learner to identify winning, break-even and losing triple-barrel bluffs, describe the blocker and range reasons in words, and build a transferable conditional rule rather than memorise an exact hand.

## Timestamp map

```text
00:05  Triple-barrel and bluffing-EV framework
00:30  Polar aggressor versus condensed caller
04:30  River value and bluff tiers
08:20  Positive/negative removal effects
15:00  Immediate past and future branch logic
21:30  Building transferable heuristics
25:00  Alternative range constructions
33:00  Wet-blanket runouts and bluff selectivity
37:55  Homework and Lecture 8 transition
```

## Visual dependencies

The following remain visual-dependent:

- exact boards, cards and suits;
- exact preflop ranges;
- exact bet sizes and SPR;
- exact solver EV differences;
- exact mixed frequencies;
- exact combination ordering.

## Cross-source routing

Primary module effects:

- `LCM-04` — full-line filtering;
- `LCM-06` — multi-street bluff jobs;
- `LCM-07` — 3-bet-pot ancestry and low-SPR river planning;
- `LCM-09` — bet EV versus check EV and blocker ordering;
- `LCM-10` — opponent-specific deviation;
- `LCM-11` — semantic heuristic construction.

Likely candidate relations:

- `H-W01-009` — line ancestry;
- `H-W02-002` — bluff action versus check EV;
- `H-W02-006` — filtered street composition;
- `H-W02-009` — river audit;
- `H-W03-005` — inherited bluff supply;
- `H-W03-011` — blocker functions as final selectors.

Exam routing:

- primary: `G3-Q07`;
- secondary: `G3-Q03`, `G3-Q05`, `G3-Q06`.

## Continuity

Lecture 7 explicitly announces Lecture 8 and states that several lectures remain before course completion and the Grade 3 exam.

Therefore Grade 3 lecture continuity remains partial.

## Source-purity boundary

This record preserves the source mechanism while excluding proprietary boards, combo lists and solver outputs from learner-facing material.

## Verdict

`CP_G3_L07_CANONICALLY_INGESTED`

`TRIPLE_BARREL_DECISION_IS_BET_EV_MINUS_CHECK_EV`

`COMBO_MEMORY_MUST_BECOME_LINE_SPECIFIC_HEURISTIC`

`GRADE_3_LECTURE_08_PLUS_PENDING`
