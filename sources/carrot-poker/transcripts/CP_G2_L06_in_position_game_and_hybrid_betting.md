# Source Metadata

Course: Carrot Poker School  
Grade: 2  
Lecture: 06  
Descriptive title: The In-Position Game and Hybrid Betting  
Instructor: Peter Clarke  
Original filename: `Lecture 06.mp4`  
Source duration from transcript: `59:42.48`  
Transcription engine: `mlx-whisper`  
Model: `large-v3`  
Language: English  
Translation: disabled  
Source ID: `CP-G2-L06`  
Source status: `AUDIO_COMPLETE / SOLVER_VISUALS_PENDING`

# Source-Faithful Record

## [00:00] IP against a condensed range

The lecture contrasts the in-position game with the previous OOP class. When Hero has position against a condensed range, larger investments become attractive because:

- the opponent contains many medium-strength hands;
- Hero’s range is more polarised;
- checking closes the action and therefore has higher baseline EV;
- betting must clear a higher opportunity-cost threshold.

## [10:00] Read the threshold before copying solver frequencies

The source recommends extracting useful rules from a strategy grid rather than memorising mixes. The first question is where the value threshold for a size lies. Hands just above and below that threshold reveal what the investment is trying to accomplish.

The source warns that a mixed solver frequency does not mean the solver “prefers” one line. Similar EVs can generate mixing without one line being strategically dominant.

## [15:00] The betting sink

The lecture describes three principal betting aims:

- value;
- bluffing through fold equity;
- denial or protection.

Value and bluffing can create very large gains when successful. Denial usually adds a smaller gain because Hero already owns much of the pot with a made hand. Therefore denial can support a bet but is rarely sufficient as the sole reason.

## [25:00] Hybrid bets

Some hands do not fit a pure value-or-bluff label. A hybrid bet may combine:

- partial value against worse continues;
- fold equity against hands with meaningful equity;
- future improvement to strong value;
- denial;
- blockers and future bluff opportunities.

The source warns against turning “hybrid” into an excuse for every unclear bet. The full EV tree still decides whether bet beats check.

## [38:00] Strong hands can still check IP

A strong but non-nutted hand may check when:

- checking secures showdown;
- it blocks too much of the opponent’s calling range;
- the available size would isolate against stronger hands;
- the range requires protection;
- future streets preserve value.

This is not generic slow-play advice; the blocker and response structure must support it.

## [49:00] Counterintuitive turn cards

A card that looks harmless by absolute texture may substantially worsen Hero’s range if it improves the opponent’s condensed landing range. Conversely, a visually dramatic card can favour Hero’s range because of preflop and flop filtering.

The lecture again separates range favourability, which affects frequency, from relative polarisation, which affects size.

# Explicit Instructor Mechanisms

- IP check has high opportunity value because it closes action.
- Threshold hands explain the purpose of a size better than raw mixed frequencies.
- Value, bluff and denial are the principal betting aims.
- Denial is usually a secondary gain, not a complete betting reason.
- Hybrid bets combine multiple smaller reasons but still require full-tree EV support.
- Turn cards must be judged against landing ranges rather than visual appearance.

# Cross-Source Hooks

- `STRONGLY CONFIRMS H-W02-001`, `H-W02-002` and `H-W02-003`: value threshold, bluff purpose and size architecture are separate steps.
- `STRONGLY EXTENDS H-R04-010`: strong IP hands may protect checking ranges.
- `CONFIRMS H-W02-006`: turn action follows filtered flop composition.
- `SUPPORTS H-W01-005` and `H-R05-001`: ownership is recomputed after each action and card.
- Primary modules: `LCM-04`, `LCM-05`, `LCM-06`.
- Primary slots: 5, 6, 8, 9, 10.

# Uncertainties Requiring Visual Review

- exact threshold hands and solver grids;
- exact overbet and medium-size frequencies;
- exact hybrid-hand examples;
- exact turn cards and range-equity values.

# Source Verdict

`CP_G2_L06_AUDIO_COMPLETE`

`IP_THRESHOLD_AND_HYBRID_BETTING_MODEL_ACCEPTED`
