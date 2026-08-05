# Source Metadata

Course: Carrot Poker School  
Grade: 1  
Lecture: 05  
Descriptive title: Facing Bets and Calling  
Instructor: Peter Clarke  
Original filename: `Lecture 05.mp4`  
Source duration from transcript: `57:25.42`  
Transcription engine: `mlx-whisper`  
Model: `large-v3`  
Language: English  
Translation: disabled  
Source ID: `CP-G1-L05`  
Source status: `AUDIO_COMPLETE / SOLVER_VISUALS_PENDING`

# Editorial Note

The audio is continuous and technically complete. Exact cards, suits, pot sizes, solver EV values and displayed ranges remain visual-dependent. The strategic framework is clear from audio.

# Source-Faithful Record

## [00:00] Open-action calling is an EV problem

The lecture distinguishes open-action spots from end-of-action spots.

An open-action call does not end the hand. Future bets, folds, implied odds, future fold equity and equity-realisation problems remain possible. Therefore the relevant break-even object is required EV or required pot share, not required equity.

The required pot share is the fraction of the pot after calling that equals the call investment. If calling one unit makes the pot five units, the break-even pot share is 20%.

## [07:00] Equity is the starting ingredient, not the answer

Equity is the main input but does not by itself determine call EV. The player begins with an equity estimate and adjusts for:

- realisability;
- implied odds;
- future fold equity;
- position;
- future action and stack depth.

A hand may have less EV than equity when it is forced to fold later. A draw may have more EV than equity because it realises well, can win additional money when it improves and may bluff later.

## [15:00] Position is the overarching modifier

Position influences most non-equity factors:

- in-position hands realise equity more easily;
- in-position players control whether action closes on later streets;
- position increases future fold equity;
- position improves the ability to capture implied odds;
- out-of-position hands face more denial and difficult future decisions.

Position does not replace hand/range analysis, but it changes how much of raw equity becomes EV.

## [23:00] Realisability, implied odds and future fold equity

Good realisability belongs to hands that can continue on many future cards or actions, such as strong draws and pair-plus-draw hands.

Poor realisability belongs to hands that appear to have enough raw equity but often fold later, become dominated, or are counterfeited.

Implied odds and future fold equity can trade off against opponent type. A caller may gain more implied odds against a player who pays off but have less future fold equity. Against a player who gives up later, future fold equity rises but payoff potential may fall.

## [35:00] A practical open-action protocol

The lecture's practical order is:

1. calculate the price and required pot share;
2. estimate equity;
3. evaluate position;
4. adjust for realisability;
5. add implied-odds potential;
6. add future-fold-equity potential;
7. compare call EV with folding and any viable raise.

The instructor repeatedly warns against replacing this process with a direct pot-odds-versus-equity comparison before the river or outside all-in situations.

## [49:00] Draws and future branches

An eight-out turn draw may have higher EV-as-pot-share than raw equity because it can win more after improving. A call with insufficient immediate equity can still be profitable when:

- the draw is disguised or nutted;
- the caller is in position;
- the bettor may give up river;
- missed draws retain profitable bluff branches;
- improving cards generate implied odds.

# Explicit Instructor Mechanisms

- Required equity is the wrong primary metric in open-action spots.
- Required pot share is calculated from the pot after the call.
- Equity starts the estimate; realisability, implied odds and future fold equity modify it.
- Position governs much of the adjustment.
- Draw EV can exceed draw equity.
- A plus-EV call is not necessarily the best action if raising is better.

# Cross-Source Hooks

- `STRONGLY SIMPLIFIES H-W01-006`: protected OOP calls depend on realisability and future branches, though deep-stack boundaries remain open.
- `CONFIRMS H-W01-001`: remaining stack and action tree change current EV.
- `EXTENDS H-R05-001`: evaluate the current node through its full future tree.
- `SUPPORTS LCM-03`: position and realisation.
- `SUPPORTS LCM-11`: action-versus-reason assessment.

# Uncertainties Requiring Visual Review

- exact hand examples, boards and positions;
- exact pot-size arithmetic shown on slides;
- exact solver EV and equity values;
- exact range cells in homework examples.

# Source Verdict

`CP_G1_L05_AUDIO_COMPLETE`

`OPEN_ACTION_CALLING_PROTOCOL_ACCEPTED / EXACT_EXAMPLES_VISUAL_DEPENDENT`
