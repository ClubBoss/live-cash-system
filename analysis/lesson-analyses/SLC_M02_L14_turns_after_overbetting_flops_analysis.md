# Lesson Analysis — SLC-M02-L14 Playing Turns After Overbetting Flops IP

Status: `ANALYZED / AUDIO_COMPLETE / VISUAL_VALIDATION_PENDING`

## Source reliability

The original transcript failed after approximately `11:37`. Targeted large-v3 reruns recovered continuous speech from `10:30` through the complete terminal sentence at `23:53.48`.

Accepted evidence:

- strategic mechanisms explicitly spoken in the recovered audio;
- relative relationships between turn classes, sizing and bluff construction;
- qualitative river size-splitting logic.

Not accepted without visual review:

- exact board cards and suits;
- exact solver frequencies and EV;
- exact hand weights in each size;
- exact boundaries between low, medium and high turn classes.

# Core lesson mechanisms

## 1. A flop overbet constrains later bluff ancestry

The turn and river range cannot be rebuilt from ordinary single-raised-pot defaults. A later bluff must be a hand that plausibly used the flop overbet.

This produces a defensive exploit as well: if an opponent is unlikely to overbet low-equity pocket pairs or irrelevant suited connectors on the flop, their turn and river line is materially more value-heavy than equilibrium.

### Compression

`Before defending the river, identify the actual flop-overbet bluffs that survived.`

## 2. River bluff quality depends on the selected value size

When the river strategy splits between a medium/pot size and a very large size, not every no-showdown hand belongs in the largest bucket.

- irrelevant low suited connectors may fit the smaller bluff size because they do not match the largest value region;
- broadway blockers can fit the largest size when they remove two-pair or straight calls and align with the nutted value region;
- strong value with poor call blockers may remain in the smaller value size.

### Compression

`Match each bluff to the value region of that exact size.`

## 3. Pairing the turn does not automatically end a bluff

On selected middling brick turns, a weak pair-plus-gutter or pair-plus-straight-draw hand can remain a high-pressure barrel. Its new showdown value does not automatically outweigh:

- folding out stronger one-pair hands;
- useful two-pair or straight blockers;
- the ability to continue on clean rivers.

### Failure mode

`I paired, therefore I should check and realise.`

The correct question is whether the hand's interaction makes it a stronger bluff candidate than a check candidate in the current range tree.

## 4. Bluff candidates shift with turn-card height

The lesson groups turns into broad low, medium and high classes. The bluff region moves because different parts of the flop-overbet range gain value or showdown interaction.

- when lower candidates connect, bluff supply shifts upward;
- when high cards connect, lower irrelevant candidates may remain available;
- broadways become more important on selected high branches;
- candidates that improved into value or useful showdown leave the bluff bucket.

### Compression

`Do not reuse one bluff list across the deck; shift the supply around the card that connected.`

## 5. Betting frequency and size usually move inversely

A turn that supports a wide betting range often uses a smaller dominant size. A highly polar branch with a narrow value region supports the large overbet.

### Compression

`Wider value region → smaller size. Narrower polar region → larger size.`

This is a directional mechanism, not a universal theorem. Exact exceptions depend on range advantage and board structure.

## 6. Tight starting ranges recruit stronger bluffs

In tight no-ante configurations, the aggressor may lack enough irrelevant suited hands. The range can therefore recruit:

- low pocket pairs;
- pair-plus-draw combinations;
- selected broadways;
- hands with removal against the call-call-fold region.

The mechanism explains why a solver sometimes bluffs hands that appear to have too much showdown value: the original preflop range did not contain enough natural air.

## 7. Blockers are measured against the actual call-call-fold range

The lesson repeatedly evaluates whether a hand blocks:

- calls the aggressor wants to preserve;
- value combinations represented by the selected size;
- natural folds on the river.

A top-pair bluff-catcher can perform poorly when its kicker removes the exact low suited or pair-based bluffs used by the aggressor.

# Candidate delta

## Candidate A — Match bluffs to the value region of each size

Tag: `GENERAL_CORE`  
Tier: CORE  
Confidence: high mechanism  
Suggested status: `DRILL_READY`

Cue:

`Which value bucket does this bluff belong beside?`

## Candidate B — Shift bluff supply with the turn-card class

Tag: `GENERAL_CORE`  
Tier: SUPPORTING  
Confidence: medium-high  
Suggested status: `DRILL_READY`

Cue:

`Which part of my bluff range just connected?`

## Candidate C — Wider betting range usually requires a smaller size

Tag: `GENERAL_CORE`  
Tier: SUPPORTING  
Confidence: high direction  
Suggested status: `DRILL_READY`

Cue:

`Is this branch wide or polar?`

# Drill proposals

## Drill 1 — River size bucket

Given one river tree with two bet sizes, classify candidate bluffs into:

- smaller-size bluff;
- largest-size bluff;
- give-up.

The learner must first state the value region assigned to each size.

## Drill 2 — Low/medium/high turn shift

Hold the flop action constant and show nine turns across low, medium and high classes. The learner identifies:

1. which prior bluffs became value or showdown;
2. which region must replace them;
3. whether the size becomes wider/smaller or narrower/larger.

## Drill 3 — Paired bluff candidate

Show weak hands that pair the turn. Require the learner to compare:

- showdown value gained;
- stronger hands folded;
- blockers obtained;
- river continuation paths.

# Cross-source questions

Carrot and FTGU should later test:

- whether the frequency-size inverse is taught with the same boundary conditions;
- how they construct multiple river-size bluff buckets;
- whether they recommend a simpler turn-class abstraction for practical play;
- how rake and depth alter recruitment of pocket-pair bluffs.

# Verdict

`SLC_M02_L14_ANALYZED_AFTER_RERUN`

The rerun materially strengthens the system's multi-street aggression framework. It does not justify exact chart prescriptions without visual review.