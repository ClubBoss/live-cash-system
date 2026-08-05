# Source Metadata

Course: Carrot Poker School  
Grade: 1  
Lecture: 03  
Title: Bluffing  
Instructor: Peter Clarke  
Original filename: `Lecture 03.mp4`  
Source duration from transcript: `60:54.88`  
Transcription engine: `mlx-whisper`  
Model: `large-v3`  
Language: English  
Translation: disabled  
Source ID: `CP-G1-L03`  
Source status: `AUDIO_COMPLETE / SOLVER_VISUALS_PENDING`

# Editorial Note

The audio is complete and loop-free. Exact cards, boards, frequencies, EV values and solver outputs remain visual-dependent. The spoken strategic framework is coherent despite local ASR noise.

# Source-Faithful Record

## [00:05] Three bluff categories

A possible bluff is classified as:

- mandatory: bluffing has higher EV than checking;
- optional: bluffing and checking are close enough that both can belong in the strategy;
- prohibited: checking has higher EV than bluffing.

The source warns that a bet can be profitable relative to folding and still be a mistake relative to checking.

## [02:00] What is being folded

The lesson separates:

- fold frequency: how often Villain folds;
- average equity folded: how much equity Villain's folding hands had;
- bluffing: making better or materially live hands fold;
- denial: making worse but live hands surrender equity;
- value: receiving calls from worse.

These functions can coexist, but they should not be confused.

## [14:30] The two main selectors

The bluff category is driven primarily by:

1. Hero's showdown value if checking;
2. the favourability of Hero's range against Villain's range.

Low showdown value lowers the opportunity cost of bluffing. High showdown value raises the EV hurdle because checking already captures a meaningful share of the pot.

A favourable range world can create enough fold equity that even very low-equity hands must bluff. An unfavourable world can make checking superior even when the bet itself wins money.

## [23:00] Favourable, neutral and unfavourable worlds

The source treats favourability as a range-EV concept rather than a hand-equity label.

Relevant inputs include:

- preflop configuration;
- action history;
- range and nut advantage;
- position;
- runout;
- how much air and value survive;
- whether the opponent is expected to defend above or below the price requirement.

Neutral worlds do not grant automatic profit to every bluff. Highly unfavourable worlds require much more selective bluffing.

## [31:00] Optional bluffs and street timing

Some hands can bluff now or retain a future bluff option.

Examples discussed include:

- flop c-bets;
- delayed c-bets;
- double barrels;
- turn probes;
- river bluffs after earlier checks.

The reason an action is optional is not that the hand is comfortable to play. It is that bluff and check have comparable EV inside the full tree.

## [45:00] The comfort-blanket fallacy

The source rejects selecting bluffs merely because a draw or higher-equity hand feels safer.

A draw can have high checking EV and therefore less need to bluff. Air can have almost no checking EV and therefore be a higher-priority bluff in a favourable world.

The correct comparison is:

```text
EV(bluff) versus EV(check)
```

not:

```text
Which candidate feels less frightening to bet?
```

## [50:00] Mandatory bluffs

Mandatory bluffs arise most often on the river, where checking air captures nearly none of the pot while range advantage creates excess folds.

They can also occur before the river in unusually favourable nodes.

The source emphasises that mandatory does not imply one universal size. It means some reasonable bluff is superior to checking.

## [57:00] Review exercises

The closing questions classify hands as:

- cannot bluff;
- can bluff;
- must bluff.

The learner is expected to explain:

- checking EV;
- range favourability;
- useful fold equity;
- position;
- action history;
- whether the hand preserves a later bluff option.

Exact source examples remain visual-dependent.

# Explicit Instructor Mechanisms

- A profitable bluff can still be inferior to checking.
- Showdown value is an opportunity cost of bluffing.
- Range favourability determines how selective bluff candidates must be.
- Fold frequency and average equity folded are different concepts.
- Draws are not automatically better bluffs than air.
- Optional bluffing is an EV relationship, not emotional permission.
- Mandatory bluffing occurs when checking leaves too much EV unrealised.
- Select bluff candidates only after establishing the range world and action tree.

# Cross-Source Hooks

- `STRONGLY SIMPLIFIES H-W02-002`: a bluff needs a role in the current and future tree, not merely low hand strength.
- `CONFIRMS H-W02-003`: large/polar aggression requires a favourable range and value structure.
- `CONFIRMS H-W03-005`: later bluff supply depends on hands preserved through earlier streets.
- `CONFIRMS H-W02-009`: river decisions begin with value/bluff ancestry and check EV.
- `EXTENDS H-R04-010`: draws and medium-strength hands can protect checking branches.
- `SUPPORTS LCM-04`, `LCM-06`, `LCM-09` and `LCM-11`.

# Project Interpretation Boundaries

Accepted:

- mandatory/optional/prohibited as comparative EV labels;
- showdown value as bluff opportunity cost;
- range favourability before hand selection;
- comfort-blanket fallacy as a misconception target;
- distinction between fold frequency and equity denied.

Not accepted as exact project rules:

- source-specific break-even frequencies without reconstructing size;
- exact solver bluff candidates;
- universal claims that one node type is always favourable;
- exact frequency of mandatory or optional bluffs.

# Uncertainties Requiring Visual Review

- exact boards, cards and suits;
- exact solver EV comparisons;
- precise bet sizes and frequencies;
- exact range matrices;
- local ASR corruption of some hand labels.

# Source Verdict

`CP_G1_L03_AUDIO_COMPLETE`

`BLUFF_SELECTION_FRAMEWORK_ACCEPTED / EXACT_OUTPUTS_VISUAL_PENDING`
