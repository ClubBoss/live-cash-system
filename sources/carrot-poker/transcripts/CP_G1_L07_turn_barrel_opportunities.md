# Source Metadata

Course: Carrot Poker School  
Grade: 1  
Lecture: 07  
Descriptive title: Turn Barrel Opportunities  
Instructor: Peter Clarke  
Original filename: `Lecture 07.mp4`  
Source duration from transcript: `56:52.84`  
Transcription engine: `mlx-whisper`  
Model: `large-v3`  
Language: English  
Translation: disabled  
Source ID: `CP-G1-L07`  
Source status: `AUDIO_COMPLETE / SOLVER_VISUALS_PENDING`

# Source-Faithful Record

## [00:00] Simplify to one in-position turn size

The lesson recommends choosing one practical turn barrel size before deciding which hands bet. The purpose is to reduce solver imitation and make value/bluff construction executable.

## [07:00] The turn node is created by filtering

The preflop ranges first interact with the flop. The flop bet and call then filter both ranges.

A key result is that the caller's range often gains raw equity after folding weak hands, while the bettor preserves more of the nut region and retains positional advantage. Therefore the turn bettor can be in a favourable EV world despite having slightly less range equity.

## [16:00] Favourability is EV, not equity

A favourable turn world may combine:

- strong nut advantage;
- position;
- useful card interaction with the bettor's surviving value;
- a capped or condensed calling range;
- pressure against hands that must continue uncomfortably.

The lecture explicitly warns against equating range equity with the right to bet.

## [24:00] Turn-card classes change the world

A turn card can be:

- above-average for the bettor;
- average or neutral;
- below-average or unfavourable.

The turn card must be evaluated against the ranges that reached the node, not against the original preflop ranges or the board in isolation.

## [32:00] Value threshold and urgency

In position, checking sends the hand directly to the river, so strong value can have high urgency. Some top pairs or better become mandatory bets while medium-strength hands remain protected checks.

## [39:00] Bluff threshold follows favourability

On favourable turns, low-equity hands may be allowed to bluff because the range environment supplies fold equity and nut pressure.

On neutral or unfavourable turns, the bluff threshold rises. Hands that block folds, unblock raises, retain showdown value or lack useful equity become checks.

## [46:00] Protected checks and range coherence

The instructor warns against betting all value and leaving an underprotected checking range. Some strong hands must remain in check, particularly when the opponent is expected to apply pressure.

A coherent strategy contains:

- mandatory value;
- optional value;
- optional bluffs;
- mandatory checks due to medium strength;
- protected strong checks.

# Explicit Instructor Mechanisms

- Flop action changes range equity and nut prevalence before the turn.
- Turn favourability is about EV, not raw equity.
- Position and nut advantage can outweigh a small equity disadvantage.
- Select one executable size, then build value and bluffs around it.
- Turn cards are judged relative to filtered ranges.
- Favourable worlds lower the bluff threshold.
- Medium-strength hands protect the checking range.

# Cross-Source Hooks

- `STRONGLY CONFIRMS H-W01-005` and `H-R05-001`: update ownership after flop filtering.
- `STRONGLY CONFIRMS H-W02-002`: a turn bluff requires a coherent future role, with immediate-EV exceptions bounded by response classes.
- `CONFIRMS H-W02-006`: turn action follows flop composition.
- `EXTENDS H-R04-010`: protected checks contain value and medium-strength hands.
- `SUPPORTS LCM-04`, `LCM-06` and `LCM-09`.

# Uncertainties Requiring Visual Review

- exact graph values for equity and nut prevalence;
- exact boards and turn cards;
- exact B75 frequencies and hand thresholds;
- exact solver mixing.

# Source Verdict

`CP_G1_L07_AUDIO_COMPLETE`

`FILTERED_RANGE_TURN_FAVOURABILITY_MODEL_ACCEPTED`
