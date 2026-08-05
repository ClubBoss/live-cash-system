# Source Metadata

Course: Carrot Poker School  
Grade: 2  
Lecture: 09  
Descriptive title: Flop Strategy in 3-Bet Pots  
Instructor: Peter Clarke  
Original filename: `Lecture 09.mp4`  
Source duration from transcript: `50:55.78`  
Transcription engine: `mlx-whisper`  
Model: `large-v3`  
Language: English  
Translation: disabled  
Source ID: `CP-G2-L09`  
Source status: `AUDIO_COMPLETE / SOLVER_VISUALS_PENDING`

# Source-Faithful Record

## [00:00] Build flop strategy from inputs, not memorised boards

The lecture focuses on flop play in 3-bet pots and starts with the inputs that shape strategy:

- preflop action and positions;
- effective SPR;
- available bet sizes;
- range equity;
- nut or polarisation advantage;
- board interaction with the caller’s condensed or capped range.

The goal is a theoretically sound simplification rather than an extreme one-size or range-bet rule for every board.

## [10:00] Frequency and size come from different range properties

The source repeats a central distinction:

- world favourability and range equity mainly influence how often Hero bets;
- relative polarisation and nut advantage mainly influence how large Hero bets.

A more condensed 3-bettor range can still bet frequently for a small size. A strongly polarised range against a capped caller can justify a large size even if overall range equity is closer.

## [18:00] Classify boards by danger zones and value architecture

The lecture compares high-card, paired, low and connected boards. The useful question is not simply “good board for the 3-bettor?” but:

- how many caller-exclusive or caller-heavy strong hands exist;
- which broadway and overpair regions dominate;
- whether the caller can defend enough medium hands;
- whether Hero’s value region wants a small, large or mixed investment.

## [26:00] Low Dry Theorem and three-plan simplification

The source’s “Low Dry Theorem” presents a compact plan for low, dry 3-bet-pot flops. Depending on range and nut distribution, the strategy can often be simplified into a small number of plans such as:

- high-frequency small bet;
- polar large bet with protected checks;
- range check or check-heavy strategy with aggressive check-raises.

The exact plan depends on positions and preflop range shape.

## [30:00] OOP can simplify toward raise-or-fold in selected nodes

On some low boards, OOP calls realise poorly while the range contains enough polar equity to build a raise-or-fold response. The source treats this as a node-specific simplification, not a universal defence rule.

The opponent should adapt by checking back more if they know the simplification, which is why exploitability and practical obscurity matter.

## [40:00] Think in SPR, not buy-ins

The lecture explicitly warns against reasoning from monetary stack size or the number of buy-ins in the pot. The strategic quantity is stack-to-pot ratio.

Psychological discomfort with large pots can cause players to under-invest even when the current SPR and range structure support a large bet or raise.

## [46:00] Strategy before hand placement

The homework order is:

1. choose the range’s rough frequency;
2. choose the range’s size or size menu;
3. identify the value and bluff regions;
4. place Hero’s hand inside that strategy.

This is intended to prevent immediate hand-first solver mimicry.

# Explicit Instructor Mechanisms

- 3-bet-pot flop strategy begins with preflop range shape and SPR.
- Frequency follows world favourability; size follows relative polarisation.
- Low dry flops can often be simplified into a few coherent range plans.
- Selected OOP nodes may simplify toward raise-or-fold rather than weak calls.
- Monetary stack fear is irrelevant to the current strategic SPR.
- Range strategy is chosen before individual hand placement.

# Cross-Source Hooks

- `STRONGLY CONFIRMS H-W03-001`: 3-bet-pot range shape begins preflop and persists.
- `STRONGLY CONFIRMS H-W03-003`: wide or capped preflop ranges require postflop compensation.
- `CONFIRMS H-W02-003` and `H-W02-004`: frequency, sizing and response shape are separate outputs.
- `CONFIRMS H-R05-001`: current ownership must be recomputed from the exact line.
- `SUPPORTS H-W01-001`: SPR governs postflop architecture; exact depth bands remain open.
- Primary modules: `LCM-01`, `LCM-04`, `LCM-05`, `LCM-07`.
- Primary slots: 1, 5, 7, 11, 12.

# Uncertainties Requiring Visual Review

- exact preflop sizes and starting ranges;
- exact board-by-board frequencies and size menus;
- exact “three plans” implementation by position;
- exact raise-or-fold boards and combo composition;
- exact SPR thresholds.

# Source Verdict

`CP_G2_L09_AUDIO_COMPLETE`

`THREE_BET_POT_FLOP_INPUT_AND_SIMPLIFICATION_MODEL_ACCEPTED`

`EXACT_ANCHORS_AND_DEPTH_BANDS_REMAIN_PENDING`
