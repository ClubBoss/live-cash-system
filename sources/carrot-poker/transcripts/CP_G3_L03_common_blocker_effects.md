# CP-G3-L03 — Common Blocker Effects

Status: `AUDIO_COMPLETE / SOLVER_VISUALS_PENDING / MAPPED`

## Source identity

- source family: Carrot Poker School;
- grade: 3;
- lecture: 3;
- source title stated in audio: `Common Blocker Effects`;
- source file: `Lecture 03.mp4`;
- transcript package: `transcripts_mlx_large_v3(20260805-221934).zip`;
- package SHA-256: `e957e3b8a699ed43378099cffbc8e5b874ca97283a7935984c1ae924b5dd4d70`;
- duration: `46:53.00`;
- transcript engine: `mlx-whisper`;
- model: `large-v3`;
- language: English;
- translation: false.

## Source role

This lecture extends the earlier blocker material from a final-selector warning into a functional blocker model.

The central order remains:

```text
WORLD / RANGE STATE
→ ACTION CANDIDACY
→ BLOCKER FUNCTIONS
→ COMBO SELECTION
```

Blockers do not override a large range disadvantage, a clearly pure action or a strong exploitative read. They select among otherwise plausible investments.

## Source-faithful mechanism

### 1. Four blocker-function pairs

For bluffing, a combo may:

- block calls — positive;
- unblock folds — positive;
- block folds — negative;
- unblock calls — negative.

For calling, a combo may:

- block value — positive;
- unblock bluffs — positive;
- block bluffs — negative;
- unblock value — negative.

The lecture treats these as functions of the opponent's actual continuing and folding ranges, not as generic card-removal slogans.

### 2. World favourability controls selectivity

In favourable worlds Hero can bluff or continue with a broader range of blocker profiles.

In unfavourable worlds Hero must become more selective and prefer combinations whose blocker functions are strongly positive.

The source therefore rejects a context-free ranking such as `nut blocker is always best`.

### 3. Unblocking folds as the main practical focus

On many non-flush river textures, the lecture argues that unblocking the opponent's folding region is often more useful than trying to block a heterogeneous one-pair calling region.

The reason is structural:

- value calls may be spread across many kickers;
- folding regions may share ranks or suits, such as missed draws or ace-high;
- blocking one common fold cluster can damage fold equity more than blocking one narrow call cluster helps it.

This is a source emphasis, not a universal theorem. Flush-completing boards or concentrated value regions can make blocking value more important.

### 4. Blue Deck / Orange Deck toy game

The source introduces a synthetic game separating:

- Hero's hand-ranking card;
- Hero's blocker card affecting Villain's range.

Its purpose is to isolate removal effects before returning to No-Limit Hold'em.

The toy game is source pedagogy and is not copied into the product-facing curriculum.

### 5. X-factor and Y-factor

The lecture uses two abstract dimensions:

- `X factor` — how much of Villain's calling range Hero blocks;
- `Y factor` — how much of Villain's folding range Hero blocks.

Holding X approximately constant, lower Y is better for bluffing because Villain retains more folds.

The source proposes qualitative classes such as:

- strongly unblocks folds;
- average;
- strongly blocks folds.

The exact labels are source-specific and need not become final product terminology.

### 6. Favourable versus unfavourable bluff worlds

When Hero's range is highly favourable, average blocker profiles can still bluff profitably.

When Hero's range is unfavourable, the same combo may need exceptionally good blocker functions to cross the bluff threshold.

This connects blocker selection to Grade 2 world-favourability and bluff-tier logic rather than treating blockers as an independent mechanism.

## Timestamp map

```text
00:04  Lecture scope and blocker functions
01:55  Positive and negative functions for bluffing and calling
04:58  Why unblocking folds is often neglected
08:18  Blue Deck / Orange Deck toy game
15:40  X-factor and Y-factor comparison
27:00  Favourable and unfavourable worlds
39:00  Hold'em applications and homework
```

## Homework process

The learner is asked to:

1. classify node favourability;
2. classify the hand's tendency to unblock or block folds;
3. choose bluff, mix or check;
4. compare against solver output;
5. record inaccuracies in the reasoning chain.

## Visual dependencies

Not admitted from audio alone:

- exact boards and suits;
- exact opponent ranges;
- exact solver frequencies and EV;
- exact X/Y numerical quantities;
- exact combo order.

## Cross-source routing

Primary module effects:

- `LCM-04` — range composition and removal effects;
- `LCM-06` — bluff candidate selection;
- `LCM-09` — river blocker and bluff-catching audit;
- `LCM-11` — blocker-function diagnostics.

Likely candidate relations:

- `H-W02-002` — bluff selection after check-EV and world state;
- `H-W02-009` — river audit;
- `H-W03-005` — bluff supply and ancestry;
- `H-W03-011` — blockers as final selectors;
- `H-R05-001` — recalculate current range state before blocker work.

Exam routing:

- primary: `G3-Q03`;
- strong secondary: `G3-Q05`, `G3-Q06`, `G3-Q07`;
- secondary: `G3-Q10`.

## Source-purity boundary

The source toy game, exact examples and solver outputs remain private reference material. Product-facing assessments use original structures.

## Verdict

`CP_G3_L03_CANONICALLY_INGESTED`

`BLOCKER_FUNCTIONS_FOLLOW_WORLD_AND_ACTION_CLASS`

`UNBLOCKING_FOLDS_IS_A_CONTEXTUAL_SELECTION_TOOL`

`NO_NEW_CORE_CANDIDATE_REQUIRED`
