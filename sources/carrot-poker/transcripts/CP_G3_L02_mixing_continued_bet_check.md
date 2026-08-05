# CP-G3-L02 — Mixing Continued: Bet / Check and Size Toolkit

Status: `AUDIO_COMPLETE / SOLVER_VISUALS_PENDING / MAPPED`

## Source identity

- source family: Carrot Poker School;
- grade: 3;
- lecture: 2;
- source title stated in audio: `Mixing Continued`;
- source file: `Lecture 02.mp4`;
- transcript package: `transcripts_mlx_large_v3(20260805-215511).zip`;
- package SHA-256: `56a05d55cb573c4f01ad9b337f9e9534db638e78fae0d6ec95cf6d21eeb51f82`;
- duration: `41:06.02`;
- transcript engine: `mlx-whisper`;
- model: `large-v3`;
- language: English;
- translation: false.

## Source role

Lecture 2 moves from mixing while facing a bet to mixing between checking and betting, including selection of a practical size toolkit.

The central operating order is:

```text
RANGE NEEDS
→ VALUE REGIONS
→ SIZE TOOLKIT
→ PURE / MIXED ACTION CLASS
→ RNG ONLY INSIDE VALID MIXES
```

## Source-faithful mechanism

### 1. One-size simplification on earlier streets

For many in-position turn nodes, the lecture recommends simplifying to:

```text
CHECK + ONE BET SIZE
```

The source does not claim that every solver output is naturally single-sized. Instead, it proposes testing whether a reduced toolkit retains almost all strategic EV while improving execution.

### 2. Size toolkit

A `toolkit` is the set of sizes that the player actually permits in a node.

The source selects sizes from the needs of the value region rather than from a desire to randomise among all solver outputs.

Inputs include:

- relative polarisation;
- opponent range shape;
- current and future streets;
- investment ceiling of the value region;
- whether shared strong hands remain in the opponent's range;
- whether an overbet would contract the opponent too aggressively.

### 3. Subtree simplification test

The lecture describes using a solver subtree to freeze the landing ranges and compare reduced size configurations.

The purpose is to test:

- whether one practical size preserves most EV;
- whether the removed size is strategically redundant;
- whether simplification changes which hands bet or check.

Exact solver EV values and size outputs remain visual-dependent.

### 4. Five frequency buckets

Inside a single-size strategy, the source groups hands into five practical action-frequency buckets:

1. pure check;
2. bet infrequently;
3. bet sometimes;
4. bet frequently;
5. pure bet.

The source discourages invented precision such as memorising arbitrary exact percentages. The buckets are execution aids, not claims that every hand has one universal frequency.

### 5. Pure-versus-mix discipline

A hand that clearly gains EV by betting should not be checked because of an RNG roll. A hand that clearly gains EV by checking should not be bet for balance.

Randomisation is reserved for hands that genuinely belong between pure-action regions and when no exploitative reason justifies choosing one action exclusively.

### 6. River bucketing and multiple sizes

The river may require more than one size because distinct value regions have different investment ceilings.

The source uses a value-first process:

```text
IDENTIFY VALUE TIERS
→ ASSIGN SIZES
→ DETERMINE BLUFF CAPACITY OF EACH SIZE
→ PLACE BLUFFS INTO SUPPORTED SIZE REGIONS
```

Bluffs follow value; they do not independently determine the size architecture.

The source also notes:

- small sizes may exist frequently for value but allow a stricter bluff-to-value ratio;
- a rare value size may still support few bluffs despite more favourable pot odds;
- a common overbet value region can support a larger share of the bluff inventory;
- very large sizes may require stronger removal properties than moderate sizes;
- exact bluff distribution across sizes is approximated for human execution rather than copied mechanically.

### 7. Texture and range-state reclassification

The same absolute hand class can move between value, check and bluff regions when texture changes.

The learner is asked to re-bucket hands after different runouts rather than carry a fixed label such as `one pair`, `ace high` or `draw` across nodes.

## Timestamp map

```text
00:04  Mixing Continued: bet/check and toolkit
00:24  In-position one-size simplification
06:00  Solver subtree and EV-retention test
14:45  Five frequency buckets
22:01  River bucketing and multiple sizes
39:50  Homework and changed-texture reclassification
```

## Pedagogical process

The homework asks the learner to:

- make a pre-solver bucket and size decision;
- define how the RNG maps to the chosen buckets;
- compare against a solver result;
- identify which range-state assumption was wrong;
- write a reusable conclusion rather than memorising one combination.

## Visual dependencies

The following require visual confirmation before exact use:

- exact boards and suits;
- exact available sizes;
- exact value tiers by combination;
- exact solver EV loss from simplification;
- exact mixed frequencies;
- exact multi-size bluff allocation.

## Cross-source routing

Primary module effects:

- `LCM-04` — range-state and texture reclassification;
- `LCM-05` — frequency/size separation and toolkit selection;
- `LCM-06` — value-first size architecture and bluff allocation;
- `LCM-09` — river bucketing;
- `LCM-11` — human-executable frequency classes and changed variants.

Likely candidate relations:

- `H-W01-005` — actions and runouts filter range shape;
- `H-W02-001` — value tier determines size and bluff capacity;
- `H-W02-002` — bluffing depends on check EV and node favourability;
- `H-W02-003` — large size follows value architecture;
- `H-R05-001` — recalculate ownership before sizing;
- `H-R04-010` — protect checking ranges.

Exam routing:

- primary: `G3-Q02`;
- secondary support: `G3-Q03`, `G3-Q06`, `G3-Q07`.

## Source-purity boundary

No source board, exact hand, solver grid or mixed frequency is promoted into the product-facing course.

## Verdict

`CP_G3_L02_CANONICALLY_INGESTED`

`VALUE_REGIONS_DEFINE_THE_SIZE_TOOLKIT`

`FREQUENCY_BUCKETS_REPLACE_FAKE_PRECISION`

`NO_NEW_CORE_CANDIDATE_REQUIRED`
