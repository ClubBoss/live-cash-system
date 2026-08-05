# CP-G3-L10 - Four-Bet Pots

Status: `AUDIO_COMPLETE / SOLVER_VISUALS_PENDING / MAPPED`

## Source identity

- source family: Carrot Poker School;
- grade: 3;
- lecture: 10;
- source role stated in audio: final lecture of Grade 3 and final lecture of the school;
- source topic: four-bet pots;
- source file: `Lecture 10.mp4`;
- transcript intake: five-file direct upload set;
- manifest SHA-256: `3d47884cc298e7b5732d3de77d302161c2121612c3196a13c694f0b10979f684`;
- duration: `56:32.28`;
- transcript engine: `mlx-whisper`;
- model: `large-v3`;
- language: English;
- translation: false.

## Source role

The lecture completes Grade 3 lecture continuity and develops a low-SPR four-bet-pot framework from both sides of the pot:

```text
PREFLOP FOUR-BET ANCESTRY
-> FLOP RANGE RELATION
-> RANGE-BET OR RANGE-CHECK COMPRESSION
-> TURN SIZE / CHECK TOOLKIT
-> JAM-EXPOSURE AND REOPEN GATE
-> CALLER DEFENCE
-> LOW-SPR JAM DECISION
```

The recurring source model is an out-of-position four-bettor against an in-position caller. The source notes that four-bet pots are relatively rare and become more common against stronger or higher-stakes opponents.

## Source-faithful mechanism

### 1. Flop strategy compression

The source recommends simplifying many low-SPR four-bet-pot flops to:

```text
MOST FAVOURABLE / NEUTRAL / SOME SEMI-UNFAVOURABLE FLOPS
-> SMALL RANGE BET

VERY UNFAVOURABLE FLOPS
-> RANGE CHECK
```

The source commonly uses one-quarter pot as the small size and reports negligible EV loss in its own locked-tree experiments.

This is a source claim inside the studied configurations. It is not admitted here as a universal four-bet-pot rule or exact product-facing size.

### 2. Flop classification inputs

The source classifies flops through two linked variables:

- range advantage;
- relative polarisation.

Board rank structure determines which preflop region is preserved or promoted. Medium connected ranks can interact strongly with the caller's pocket-pair and suited region, while high-card and low-dry structures can preserve the four-bettor's overpair and Broadway density.

Monotone texture is not automatically bad for the four-bettor. The relevant question is how the suit structure changes the polarisation of both ranges, not whether the board merely looks wet.

Exact boards, suits, frequencies and EV values remain visual-dependent.

### 3. Turn size toolkit after a small flop range bet

Because the small flop bet filters little, both players can reach the turn with wide ranges.

The source uses two simplified turn sizes:

- a smaller barrel when the caller's range remains relatively polar and a larger size would overpay for indifference or induce damaging jams;
- a larger barrel when the caller's range is merged, equities run closer and a larger size is needed to reduce meaningful medium-equity regions toward indifference.

The important mechanism is not the source's exact numeric menu. It is:

```text
OPPONENT RANGE POLAR
-> SMALLER PRICE MAY BE ENOUGH

OPPONENT RANGE MERGED / MANY MEDIUM-EQUITY HANDS
-> LARGER PRICE MAY BE REQUIRED
```

### 4. Jam-exposure band

At low SPR, a turn bet can leave so little behind that the in-position player is strongly incentivised to jam.

This creates a dangerous band for medium-EV hands:

```text
BET TOO LARGE
-> VILLAIN JAM FREQUENCY RISES
-> HERO LOSES EQUITY REALISATION
-> CALL AND FOLD CAN BOTH BECOME PAINFUL
```

The source therefore treats future jam exposure as part of size selection rather than as an afterthought.

### 5. Turn range geography and hybrid bets

The source separates:

- mandatory or high-frequency value bets;
- slow-played value;
- high-EV bluffs;
- hybrids;
- checking median;
- give-ups.

Hybrid bets can earn EV from three sources:

- better hands folding;
- worse hands calling;
- equity denial.

A hand does not become a valid hybrid merely because all three outcomes are imaginable. The full-tree EV and blocker effects still control candidacy.

### 6. Protected checking at low SPR

Low SPR does not imply that all strong hands must bet immediately.

The source preserves strong hands, overpairs and draws in the checking range so that the in-position player cannot profitably attack every check. Stable top-end hands can slow-play more often, while vulnerable value can bet more often.

The operational gate is:

```text
CAN HERO CHECK-CALL OR CHECK-JAM CREDIBLY?
-> YES: IMMEDIATE BETTING IS LESS URGENT
-> NO: CHECKING RANGE MAY BE EXPOSED
```

### 7. Caller defence against small flop bets

As the in-position caller, the source recommends:

- calling wide against small bets;
- avoiding unnecessary flop raises on boards where the caller lacks a coherent value raise region;
- defending especially widely when the four-bettor is using a range bet on a neutral or caller-favourable board.

The source gives very low fold-frequency heuristics in selected examples. Those exact percentages are configuration- and visual-dependent and are not promoted as universal rules.

### 8. Low-SPR turn jams

The source identifies four variables that increase turn-jam frequency:

- lower board;
- wetter board;
- lower SPR;
- being out of position.

The first three can justify frequent jams even when the player is in position. Jamming can deny equity and avoid losing value through later checks, but it remains range- and texture-dependent.

## Timestamp map

```text
00:04  final-lecture confirmation and four-bet-pot scope
00:57  flop classification and one-size simplification
14:09  turn barrel toolkits
23:01  turn range-geography exercise
29:24  hybrid betting and rule-specificity calibration
41:27  caller defence against small flop bets
47:21  very wide in-position defence on favourable boards
49:43  range-bet defence and fold-suppression heuristic
52:54  low-SPR turn-jam factors
55:28  Grade 3 closure and exam transition
```

## Pedagogical process

The lecture repeatedly asks the learner to predict:

- whether a range should bet or check;
- which turn size fits the opponent's range shape;
- which hands belong to value, bluff, hybrid, median or give-up classes;
- whether checking remains protected;
- whether a caller should call, raise or fold;
- whether low-SPR jamming is urgent.

The source recommends extracting rules at an intermediate level of specificity: neither so broad that they are obvious nor so narrow that they apply only to one solver output.

## Visual dependencies

The following remain unadmitted from audio alone:

- exact boards, cards and suits;
- exact preflop range matrices;
- exact flop and turn frequencies;
- exact EV values;
- exact source SPR values;
- exact size menus and indifference thresholds;
- exact jam frequencies;
- exact solver-node outputs.

Obvious ASR substitutions such as `4-bit`, `SBR` and solver-name errors were normalised only in explanatory prose. No disputed card, size, frequency or EV value was silently repaired.

## Cross-source routing

Primary module effects:

- `LCM-04` - range ancestry, texture and filtering;
- `LCM-05` - response geography and wide small-bet defence;
- `LCM-06` - size selection, hybrid betting and protected checks;
- `LCM-07` - direct four-bet-pot and low-SPR ancestry support;
- `LCM-11` - prediction-first four-bet-pot assessment.

Likely candidate relations:

- `H-W01-001` - SPR and future tree govern architecture;
- `H-W01-009` - prior action determines current range meaning;
- `H-W02-001` - value region and investment ceiling govern size;
- `H-W02-004` - bet shape determines response thresholds;
- `H-W02-005` - selected vulnerable and hybrid hands enter active branches;
- `H-W02-006` - later action follows earlier filtering;
- `H-W03-001` - postflop plan begins with preflop action, position and SPR;
- `H-W03-003` - preflop range mismatch persists postflop;
- `H-W03-006` - small bets can demand extremely wide defence;
- `H-R04-010` - robust hands protect passive ranges;
- `H-R05-002` - passive ranges require credible active branches.

Exam routing:

- primary: `G3-Q10`;
- secondary: `G3-Q08`, `G3-Q09`.

This lecture does not supply independent preflop four-bet anchors, exact live-rake thresholds, multiway strategy or deep-stack overlays.

## Source-purity boundary

The record preserves the source mechanisms without reproducing source boards, solver matrices, exact combinations, exact percentages or exam wording.

## Verdict

`CP_G3_L10_CANONICALLY_INGESTED`

`GRADE_3_LECTURE_CONTINUITY_COMPLETE`

`G3_Q10_PRIMARY_LECTURE_SUPPORTED`

`FOUR_BET_POT_COMPRESSION_DEPENDS_ON_RANGE_RELATION_AND_LOW_SPR`

`NO_NEW_CORE_CANDIDATE_REQUIRED`
