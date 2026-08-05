# CP-G3-L09 — Defending in 3-Bet Pots Out of Position

Status: `AUDIO_COMPLETE / SOLVER_VISUALS_PENDING / MAPPED`

## Source identity

- source family: Carrot Poker School;
- grade: 3;
- lecture: 9;
- source title stated in audio: `Defending in 3-Bet Pots Out of Position`;
- source file: `Lecture 09.mp4`;
- transcript package: `Archive(3).zip`;
- package SHA-256: `b9a2a664ca0ae8696b771fd82bc1c5f51eadb573495a6eac96c25e00ff040137`;
- duration: `51:05.02`;
- transcript engine: `mlx-whisper`;
- model: `large-v3`;
- language: English;
- translation: false.

## Source role

The lecture develops an out-of-position 3-bet-pot defence framework using cutoff open-call versus button 3-bet as its recurring model.

It separates three linked tasks:

```text
CALL / FOLD THRESHOLD
→ TEXTURE-DEPENDENT RANGE RESPONSE
→ RAISE OR TURN-JAM CONSTRUCTION
```

## Source-faithful mechanism

### 1. Winning, breakeven and losing calls

Facing a flop c-bet, hands are classified by call EV rather than visual category alone:

- winning calls;
- approximately breakeven calls;
- losing calls.

The source explicitly brackets raising during the first exercise so that call/fold geography can be learned independently.

### 2. Identical-class hand rule

Hands from apparently different visual families can have similar call EV.

For example, a pocket pair and two overcards with suitable redraw or pair-draw quality may occupy the same response class. Conversely, hands that look similar can separate sharply because of:

- backdoor flush potential;
- immediacy of the draw;
- how live the pair draws are against the 3-bettor's overpair region;
- domination risk;
- future equity realisation out of position.

The practical rule is to compare future winning routes, not card-shape aesthetics.

### 3. Immediacy and live pair draws

At lower SPR, flimsy backdoor routes lose value because there is less future stack depth and fewer opportunities to realise them.

Unpaired continues are favoured when they contain:

- larger live overcards;
- immediate straight or flush equity;
- stronger redraws;
- less domination against the value-heavy region.

A visually attractive hand can still be a losing defend when its improvement cards frequently make second-best pairs.

### 4. Texture and range mismatch

The lecture compares responses to a repeated small range bet across several textures.

The response depends on:

- how the caller's preflop range intersects the board;
- how the 3-bettor's overpair and high-card regions interact;
- expected fold frequency;
- availability of tier-one or nutted hands;
- relative polarisation;
- OOP realisation cost.

A small bet does not imply one universal defence frequency. Some boards force substantial overfolding because the preflop range mismatch survives onto the flop.

### 5. Raising gate

The source's simplified raising gate is:

```text
DOES THE OOP RANGE CONTAIN TIER-ONE HANDS?
→ YES: A COHERENT RAISE RANGE CAN BE BUILT
→ NO: RAISING MAY DISAPPEAR ENTIRELY
```

A range can have an overall EV disadvantage and still raise if it contains enough top-end holdings. Conversely, a range can defend frequently but raise little when it lacks credible tier-one value.

The exact source tier boundaries and frequencies remain visual-dependent.

### 6. Raise classes

The lecture reuses and extends the Grade 3 raise classes:

- thick value;
- thin value;
- high-EV bluffs;
- hybrids;
- low-EV bluffs.

Hybrid raising is presented with a strong warning: the hand must obtain meaningful value, denial or bluffing benefit. Relabelling a mediocre hand as a hybrid can create a large error.

### 7. Low-SPR turn jams

After OOP c-bet-call branches in 3-bet pots, turn SPR is often low enough that jams become a natural raising size.

The repolarised jam range is built from:

```text
THICK VALUE
+ HIGH-EV BLUFFS
+ SELECTED HYBRIDS
```

Denial can strengthen value and bluff candidates, but it does not justify jamming the absolute middle of the range.

The source also notes that very strong, low-vulnerability value may slow-play more often than hands that benefit greatly from fold equity.

## Timestamp map

```text
00:05  OOP 3-bet-pot scope and call-EV exercise
01:24  Identical-class hand rule
09:37  Unpaired continues, live pair draws and immediacy
13:35  Visual-processing errors and texture awareness
14:39  Range-bet texture-response exercise
24:48  Relative polarisation and raise-frequency conclusions
31:57  Tier-one holding gate for OOP raising
34:04  Five raise classes in 3-bet pots
42:59  Low-SPR turn-jam architecture
50:22  Homework and transition to final Lecture 10
```

## Pedagogical process

The learner predicts call quality, defence frequency, raise availability and turn-jam composition before opening the solver. The source prefers class-level reasoning over memorising exact mixed frequencies.

## Visual dependencies

The following remain unadmitted from audio alone:

- exact boards, cards and suits;
- exact preflop range matrices;
- exact c-bet and raise sizes;
- exact fold, call and raise frequencies;
- exact EV values;
- exact SPR values for particular source examples.

The audio supports the mechanism and ordering. Visual review is required only for exact claims that can change a final boundary, anchor or original answer key.

## Cross-source routing

Primary module effects:

- `LCM-03` — OOP realisation and defend quality;
- `LCM-04` — texture and action filtering;
- `LCM-05` — call/fold/raise range geography;
- `LCM-06` — raise classes and denial;
- `LCM-07` — 3-bet-pot ancestry and low-SPR turn jams;
- `LCM-11` — prediction-before-solver assessments.

Likely candidate relations:

- `H-W03-001` — begin with preflop action, positions and SPR;
- `H-W03-003` — preflop range shape requires postflop compensation;
- `H-W02-004` — bet shape and thresholds determine response;
- `H-W02-005` — selected volatile made hands enter active branches;
- `H-W03-006` — small bets can require wide defence and active raising;
- `H-R05-002` — active branches inside otherwise passive strategies.

Exam routing:

- primary: `G3-Q09`;
- secondary: `G3-Q08`, `G3-Q10`.

This lecture does not supply preflop squeeze construction or independently validated exact anchors.

## Source-purity boundary

The record preserves the source mechanism without reproducing source boards, solver matrices, exact combinations or exam wording.

## Verdict

`CP_G3_L09_CANONICALLY_INGESTED`

`OOP_3BET_DEFENCE_REQUIRES_CALL_GEOGRAPHY_TEXTURE_AND_TOP_END_GATE`

`DENIAL_STRENGTHENS_VALID_JAM_CANDIDATES_BUT_DOES_NOT_AUTHORISE_MEDIAN_JAMS`

`NO_NEW_CORE_CANDIDATE_REQUIRED`
