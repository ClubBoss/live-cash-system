# Source Metadata

Course: Carrot Poker School  
Grade: 1  
Lecture: 08  
Descriptive title: Float Betting the Flop  
Instructor: Peter Clarke  
Original filename: `Lecture 08.mp4`  
Source duration from transcript: `01:04:29.26`  
Transcription engine: `mlx-whisper`  
Model: `large-v3`  
Language: English  
Translation: disabled  
Source ID: `CP-G1-L08`  
Source status: `AUDIO_COMPLETE / SOLVER_VISUALS_PENDING`

# Source-Faithful Record

## [00:00] Float-bet node

A float bet is defined as betting in position when the out-of-position preflop raiser checks to the preflop caller.

The lesson builds a general range-construction protocol rather than treating the node as an isolated trick.

## [07:00] Betting contracts and polarises the range

Unless the player bets the entire range, choosing bet over check contracts the range and creates at least some polarising effect.

The caller usually lacks the overwhelming range advantage needed for a pure range bet, so the strategy normally separates:

- strong value;
- selected thin/protection value;
- high-potential draws;
- low-showdown bluffs;
- medium hands retained in check.

## [15:00] Linearisation pitfalls

The lesson identifies a common error:

- refusing to bluff complete air because it looks weak;
- betting every pair because it looks strong and needs protection.

Together these errors create a linear betting range and an unprotected check.

On favourable boards, some bottom-of-range air must bluff. Medium pairs may check because their check EV is high and the opponent's checking range is theoretically protected.

## [25:00] Polar versus semi-polar strategy

A more polar strategy is appropriate when:

- value is concentrated;
- the opponent's continuing range is strong;
- denial adds little;
- medium-strength value does not crave immediate pot growth.

A semi-polar strategy is appropriate when:

- the bettor's range performs reasonably well;
- thin value can be called by worse;
- denial materially helps vulnerable hands;
- the board is messy enough that equity denial matters.

## [36:00] Opponent check does not prove weakness

The preflop raiser's checking range should contain:

- strong check-calls;
- check-raises;
- medium hands;
- give-ups.

Against an underprotected human checking range, wider betting may be a valid exploit, but it is not the baseline assumption.

## [44:00] Hand-class selectors

The lesson uses several selectors:

- value urgency;
- nut potential;
- showdown value of checking;
- equity denied by betting;
- blockers to the opponent's continuing range;
- board/range favourability;
- whether the opponent is polar or condensed.

## [55:00] Size and frequency remain separable

Some boards support semi-frequent large betting because value is nut-heavy while denial remains useful. Other boards support small polar or semi-polar bets. Monotone boards often neutralise nut advantage and can support smaller sizing.

# Explicit Instructor Mechanisms

- Float betting is a range-construction node, not merely opportunistic aggression.
- Betting contracts the range toward polarisation.
- Complete air can be a better bluff than medium showdown value.
- Betting every pair and checking every air is a linearisation error.
- Semi-polar betting includes thin value when denial matters.
- A preflop raiser's check should remain protected in baseline strategy.
- Exploiting weak checks requires evidence, not automatic assumption.

# Cross-Source Hooks

- `STRONGLY CONFIRMS H-R04-010` and `H-R05-002`: passive branches need protected value plus active responses.
- `CONFIRMS H-W02-001`, `H-W02-004` and `H-W02-005`: value threshold, bet shape and vulnerable-hand incentives.
- `EXTENDS H-W03-004`: separate strong and weak check branches.
- `SUPPORTS LCM-05`, `LCM-06` and `LCM-10`.

# Uncertainties Requiring Visual Review

- exact boards, hands and position pairs;
- exact solver bet frequencies;
- exact range and nut-advantage values;
- exact size recommendations for each example.

# Source Verdict

`CP_G1_L08_AUDIO_COMPLETE`

`FLOAT_BET_RANGE_CONSTRUCTION_PROTOCOL_ACCEPTED`
