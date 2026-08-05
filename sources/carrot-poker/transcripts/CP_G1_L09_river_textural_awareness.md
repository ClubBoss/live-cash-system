# Source Metadata

Course: Carrot Poker School  
Grade: 1  
Lecture: 09  
Descriptive title: River Textural Awareness and Range Geography  
Instructor: Peter Clarke  
Original filename: `Lecture 09.mp4`  
Source duration from transcript: `54:47.60`  
Transcription engine: `mlx-whisper`  
Model: `large-v3`  
Language: English  
Translation: disabled  
Source ID: `CP-G1-L09`  
Source status: `AUDIO_COMPLETE / SOLVER_VISUALS_PENDING`

# Source-Faithful Record

## [00:00] Absolute labels are not hand strength

Labels such as top pair, straight or jack-high flush do not determine strategic strength. Relative strength depends on:

- board texture;
- action sequence;
- both surviving ranges;
- position;
- bet size.

A flush can be strong on a three-flush board after passive action and weak on a four-flush board after heavy filtering.

## [08:00] Still lake, choppy sea and tsunami

The lecture replaces the usual dry/wet labels with overall connectivity categories:

- **still lake** — difficult for ranges to connect; small absolute improvements can be strategically large;
- **choppy sea** — average connectivity; normal relative-strength thresholds;
- **tsunami** — extreme connectivity; one-pair and sometimes two-pair hands lose substantial relative value.

The category concerns how easy the board is for the actual ranges to hit, not merely whether suits match or ranks are close.

## [17:00] Texture moves thresholds

Still-lake boards commonly cause players to underrate hands and miss:

- thin value;
- bluff-catches;
- checks with showdown value.

Tsunami boards cause players to overrate absolute hand labels and continue or value-bet too widely.

## [25:00] Range geography

Range geography means locating the borders between strategic regions. Four reference points are described.

Bottom-up:

1. first hand too strong to bluff;
2. first hand strong enough to value bet.

Top-down:

3. first hand too weak to value bet;
4. first hand weak enough to bluff.

These thresholds are estimates, not attempts to reproduce an exact solver cell.

## [34:00] Medium region has two borders

The checking region sits between the value and bluff regions. It has:

- a value-side border;
- a bluff-side border.

Hands near those borders are close decisions and make useful assessment candidates.

## [40:00] Line and texture interact

A river card may appear good for the aggressor but actually help the caller more or less depending on which combinations bet earlier and which remained in check/call.

The player must reconstruct:

- which strong hands would already have bet;
- which draws and air remain;
- which value hands are capped or absent;
- how texture changes the surviving range.

## [48:00] Position changes thin-value thresholds

Out of position, checking does not close the action. Therefore a thinner value bet may be acceptable because check EV can be worse.

In position, checking secures showdown and can raise the threshold for thin value.

# Explicit Instructor Mechanisms

- Board texture changes relative hand strength and range thresholds.
- Connectivity must be judged against actual ranges.
- Still-lake, choppy-sea and tsunami worlds shift value/bluff borders.
- Range geography locates value, check and bluff thresholds.
- The check region has two independent borders.
- Prior actions determine whether a river card actually helps a range.
- Position changes the value of checking and therefore the value threshold.

# Cross-Source Hooks

- `STRONGLY CONFIRMS H-W02-009`: river decisions begin with value and range reconstruction.
- `STRONGLY CONFIRMS H-W03-005` and `H-W03-011`: bluff supply and blockers depend on ancestry.
- `CONFIRMS H-R05-001`: current ownership must be recalculated after filtering.
- `SIMPLIFIES LCM-09`: four threshold landmarks create an executable river audit.
- `SUPPORTS LCM-04` and `LCM-09`.

# Uncertainties Requiring Visual Review

- exact river boards and action sequences;
- exact solver pot-share and threshold values;
- exact hands named at each border;
- exact bet and raise sizes.

# Source Verdict

`CP_G1_L09_AUDIO_COMPLETE`

`RIVER_TEXTURE_AND_RANGE_GEOGRAPHY_MODEL_ACCEPTED`
