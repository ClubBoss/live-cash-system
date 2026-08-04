# Source Metadata

Course: From the Ground Up  
Episode: 11  
Lesson: Introduction to Combos  
Instructor: Peter Clarke  
Original filename: `episode 11 introduction to combos.mp4`  
Source duration from transcript: `15:48.86`  
Transcription engine: `mlx-whisper`  
Model: `large-v3`  
Language: English  
Translation: disabled  
Source status: `AUDIO_COMPLETE / LOCAL_ASR_CLEANUP_REQUIRED / NEEDS_VISUAL_REVIEW`

# Detailed Source-Faithful Record

## [00:00] Combo as one exact holding

A hand class such as ace-queen offsuit is distinguished from one exact suit combination. The lesson gives the standard preflop counts:

- pocket pair: 6 combinations;
- suited hand: 4 combinations;
- offsuit hand: 12 combinations.

Board cards and held cards remove combinations after the flop.

## [04:20] Uses of combo counting

Combo awareness supports:

- range weighting;
- value-to-bluff construction;
- estimating how often a player reaches a node with value or air;
- EV and equity calculations;
- measuring range advantage relative to the starting number of combinations.

Peter stresses that the same absolute number of strong combos matters more inside a narrow starting range than inside a very wide one.

## [08:30] Detecting preflop imbalance

A deliberately aggressive blind-versus-blind example shows how a player who four-bets "any ace or king blocker" can create hundreds of bluff combinations against a much smaller value range. Combo counting reveals the scale of the imbalance and can justify a much wider five-bet response than hand-strength intuition alone would suggest.

The example is explicitly opponent-specific rather than a baseline recommendation.

## [12:00] River value-to-bluff audit

A synthetic turn-and-river example counts which draw combinations remain after the river card. When several apparent turn bluffs improve to pairs or flushes, only a few natural bluff combinations remain against many value combinations. The lesson uses that count to support a large river fold.

# Explicit Instructor Mechanisms

- Count exact combinations, not only named hand classes.
- Weight range advantage by the size of the starting range.
- Combo counts expose value-to-bluff imbalance.
- Recount after each board card and action because combinations disappear or change role.
- Use opponent-specific assumptions explicitly; do not present synthetic reads as universal facts.

# Cross-Source Hooks

- `SIMPLIFIES H-W01-009`: current node frequency depends on how many combinations reached it.
- `CONFIRMS H-W02-009`: audit actual value and bluff combinations before bluff-catching.
- `CONFIRMS H-R05-001`: board and action filtering change the surviving range.
- `FOUNDATION FOR H-W03-011`: blocker logic depends on the exact combinations present in the line.

# Uncertainties Requiring Review

- Exact suits and displayed ranges in the two worked examples.
- One closing episode-number phrase is clearly an ASR slip.
- Some precise example combo totals are approximate in the spoken explanation.
