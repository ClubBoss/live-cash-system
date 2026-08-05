# CP-G3-L06 — Extreme Bet Sizing

Status: `AUDIO_COMPLETE / SOLVER_VISUALS_PENDING / MAPPED`

## Source identity

- source family: Carrot Poker School;
- grade: 3;
- lecture: 6;
- source title stated in audio: `Extreme Bet Sizing`;
- source file: `Lecture 06.mp4`;
- transcript package: `transcripts_mlx_large_v3 2(1).zip`;
- package SHA-256: `bf46ac4ba2f0cffc6d5fa5763e9569cd4b9e7795b457203a0b244bc92820053d`;
- duration: `55:46.62`;
- transcript engine: `mlx-whisper`;
- model: `large-v3`;
- language: English;
- translation: false.

## Source role

Lecture 6 develops a human-executable model for unusually large and unusually small bet sizes.

The source separates two questions:

```text
WHICH VALUE REGION NEEDS THIS SIZE?
→ HOW OFTEN CAN BLUFFS USE IT?
```

Extreme sizing is not justified merely because a range is polar or because a solver displays the option.

## Source-faithful mechanism

### 1. Sledgehammer eligibility

The source uses `sledgehammering` for river bets far above the pot, approximately `200–500% pot` in the discussed examples.

The stated conditions include:

- a very high-equity value region;
- a value region not heavily blocking the opponent's calls;
- a condensed opponent range relative to Hero's strongest region;
- river placement, where future pot-building opportunities no longer exist;
- a credible bluff region that can support the size.

The exact numeric thresholds are source estimates and remain context-dependent.

### 2. Investment ceilings and value tiers

Different value regions have different maximum sensible investments.

The learner should first classify the value tier, then choose the size. Smaller or ordinary sizes can be technical errors when the strongest value region can profitably invest much more.

Conversely, a hand with positive value-bet EV does not automatically qualify for the largest size.

### 3. Responding to extreme bets

Facing a very large size creates narrow and sometimes counterintuitive calling thresholds. The source emphasises that blocker quality and value-beater status become more important as the calling range compresses.

The response must still begin from the actual value/bluff construction rather than from fear of the monetary amount.

### 4. Underbets and non-standard sidelines

The lecture also studies very small river bets, described as `feather` sizes in the source.

A small non-standard size can be strategically coherent when:

- the value region wants thin or broad extraction;
- the opponent's response is difficult to execute;
- the theoretical EV loss versus a standard size is negligible;
- the simplification remains understandable and repeatable.

Population exploitation from unfamiliarity is conditional and field-gated.

### 5. Value-led bluff allocation

For a multi-size river toolkit:

```text
VALUE-TIER ABUNDANCE
× POT-ODDS MODIFIER
→ ROUGH BLUFF ALLOCATION BY SIZE
```

The source presents this as a practical approximation, not a table-side exact calculation.

Larger sizes permit a higher bluff-to-value ratio, but their actual bluff frequency also depends on how much value naturally uses that size.

### 6. Human simplification

The learner is explicitly discouraged from reproducing microscopic solver mixing across many sizes and combinations.

The goal is:

- sensible value tiers;
- a small practical size toolkit;
- rough bluff allocation;
- no fake precision.

## Pedagogical process

The homework asks the learner to assign value tiers, choose appropriate frequencies and sizes, estimate rough bluff-to-value splits and pot-odds modifiers, and accept a useful approximation rather than chase exact solver reproduction.

## Timestamp map

```text
00:05  Extreme sizing overview
00:23  Sledgehammering and eligibility
07:55  River maximum-size argument
13:50  Reacting to extreme bets
28:15  Small non-standard sizes and sidelines
39:30  Value tiers and landing equity
46:30  Size abundance and pot-odds modifier
54:15  Human simplification homework
```

## Visual dependencies

The following remain visual-dependent:

- exact boards and suits;
- exact size menus and solver frequencies;
- exact EV losses between simplified and full trees;
- exact value-tier equity bands;
- exact bluff-to-value allocations;
- exact population responses.

## Cross-source routing

Primary module effects:

- `LCM-05` — bet-shape and response thresholds;
- `LCM-06` — value-led sizing and investment ceilings;
- `LCM-09` — river size exclusions and bluff capacity;
- `LCM-10` — optional exploit through unfamiliar sizes;
- `LCM-11` — practical toolkit compression.

Likely candidate relations:

- `H-W02-001` — value tier and investment ceiling;
- `H-W02-002` — bluff allocation after value structure;
- `H-W02-003` — large sizing follows value architecture;
- `H-W02-009` — river audit;
- `H-R05-001` — rebuild size toolkit from current ownership.

Exam routing:

- primary: `G3-Q06`;
- secondary: `G3-Q02`, `G3-Q07`.

## Source-purity boundary

Source size labels and solver examples remain private evidence. Learner-facing material must use independently generated nodes and directional answer keys unless exact independent anchors exist.

## Verdict

`CP_G3_L06_CANONICALLY_INGESTED`

`EXTREME_SIZE_REQUIRES_EXTREME_VALUE_ARCHITECTURE`

`VALUE_ABUNDANCE_PRECEDES_BLUFF_ALLOCATION`

`HUMAN_TOOLKIT_OVER_FAKE_SOLVER_PRECISION`
