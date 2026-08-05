# Source Metadata

Course: Carrot Poker School  
Grade: 1  
Lecture: 04  
Title: Polarisation and Relative Hand Strength  
Instructor: Peter Clarke  
Original filename: `Lecture 04.mp4`  
Source duration from transcript: `65:05.78`  
Transcription engine: `mlx-whisper`  
Model: `large-v3`  
Language: English  
Translation: disabled  
Source ID: `CP-G1-L04`  
Source status: `AUDIO_COMPLETE / SOLVER_VISUALS_PENDING`

# Editorial Note

The audio is technically complete. The lesson uses extensive solver screens, range graphs and hand examples. Exact frequencies, matrices, cards and sizes remain visual-dependent; the spoken range-shape framework is stable.

# Source-Faithful Record

## [00:05] Relative hand strength

Absolute labels such as `top pair`, `flush` or `one pair` are insufficient.

Relative hand strength depends on:

- range filtering through prior actions;
- board texture and runout;
- positional and preflop configuration;
- bet and raise sizes;
- stack and pot geometry;
- the shape of both ranges.

The source identifies action history as especially important: the learner must ask how each range arrived at the current node.

## [04:30] Range filtering

Ranges contract selectively rather than randomly.

An action can increase the concentration of:

- strong hands;
- weak hands;
- medium-strength hands;
- draws;
- nutted combinations;
- air.

The strategic question is not only how narrow the range became, but which regions became more or less concentrated.

## [06:30] Polarisation and condensation

Polarisation is graded.

A more polar range moves toward:

- very strong value;
- bluffs and low-showdown hands;
- selected semi-bluffs with nut potential.

A condensed range moves toward the middle and contains more medium-strength hands.

Aggressive large investments generally polarise more. Calls and many checks generally condense more, but configuration, position and strategy can preserve strong checks.

## [12:00] Relative strength against a polar range

As Villain's range becomes more polar:

- medium-strength hands lose value as aggressive investments;
- bluff-catchers become more dependent on value/bluff composition;
- slow-playing and preserving calls can become more attractive;
- some apparently strong absolute hands no longer value bet;
- removal effects matter only after the polar range is reconstructed.

The source warns against counting only one attractive worse hand that may call.

## [22:00] Playing against condensed ranges

When Villain is condensed and likely to invest passively, Hero's value region must supply more of the betting.

The lesson connects condensed opposing ranges with:

- increased fast-play incentive;
- larger investment ceilings for strong value;
- larger sizes when Hero remains uncapped and Villain is capped;
- fewer reasons to wait for Villain to build the pot.

Bluffs follow the value architecture rather than creating the large size on their own.

## [26:30] Value drives overbet strategy

Classic overbet nodes arise when:

- Hero has a strong uncapped value region;
- Villain's range has been funnelled into a capped, condensed region;
- the value region wants a large amount invested by the river.

The source explicitly rejects the idea that overbets are chosen mainly because bluffs gain more fold equity. Value demand sets the investment ceiling; bluffs accompany that strategy.

## [36:00] Board texture and range shape

Different boards create different amounts of:

- air;
- medium-strength hands;
- nutted hands;
- draws;
- pair density.

A board with many complete misses can polarise a range more than a board where much of the range retains medium equity.

The board must be applied to the actual preflop and action-filtered range, not analysed in isolation.

## [45:00] Action sequence changes the same hand

The same absolute hand can:

- value bet against a condensed range;
- check against a polar range;
- call as a bluff-catcher;
- become too weak after a range-strengthening action;
- become stronger after the opponent caps or weakens a branch.

The lesson repeatedly compares whole-range shape before selecting the hand action.

## [52:00] Range advantage versus nut advantage

Range advantage and nut advantage are distinct.

A player can retain broad equity advantage while losing exclusive ownership of the strongest combinations, or hold the nut advantage without dominating average equity.

The distinction changes:

- overall frequency;
- size;
- candidate selectivity;
- whether a range can sustain overbets;
- how aggressively the opponent may respond.

## [58:00] Review exercises

The closing exercises ask the learner to:

1. reconstruct each range from preflop and prior actions;
2. identify whether each range polarised or condensed;
3. distinguish range advantage from nut advantage;
4. update relative hand strength;
5. choose fast-play, slow-play, bet, check, call or fold;
6. justify size through the value region.

Exact source boards and solver outputs remain visual-dependent.

# Explicit Instructor Mechanisms

- Relative hand strength depends on filtered ranges, texture and configuration.
- Polarisation and condensation are graded range-shape changes.
- Large aggressive actions generally polarise more than passive actions.
- Calls and checks can condense, but protected checks can retain strong hands.
- Against polar ranges, medium hands often prefer passive investment.
- Against condensed ranges, strong value must often fast-play.
- Overbet size is value-driven when Hero is uncapped and Villain capped.
- Range advantage and nut advantage are distinct.
- Board texture must filter actual ranges rather than replace preflop reasoning.

# Cross-Source Hooks

- `STRONGLY CONFIRMS H-W01-004`: identify source range before reading board.
- `STRONGLY CONFIRMS H-W01-005` and `H-R05-001`: recalculate after every action filter.
- `CONFIRMS H-W01-007` and `H-W01-009`: current range mass depends on origin and prior reach.
- `STRONGLY CONFIRMS H-W02-003`: large sizing follows preserved value polarisation.
- `EXTENDS H-R04-010` and `H-R05-002`: protected passive branches retain strong hands.
- `CONFIRMS H-W03-011`: blockers matter only after the relevant polar range is built.
- `SUPPORTS LCM-04`, `LCM-05`, `LCM-06` and `LCM-09`.

# Project Interpretation Boundaries

Accepted:

- relative hand strength is range- and action-dependent;
- polarisation is graded;
- overbets are driven by value architecture;
- condensed opponents increase fast-play incentives;
- range and nut advantage are distinct.

Not accepted as exact project rules:

- a universal mapping from one board family to one size;
- exact solver frequencies;
- exact overbet thresholds;
- the claim that every check or call always condenses;
- source-specific hand matrices without visual verification.

# Uncertainties Requiring Visual Review

- exact range graphs and solver matrices;
- exact board cards, suits and configurations;
- exact investment sizes;
- precise frequencies and EV values;
- local ASR errors in card names and labels.

# Source Verdict

`CP_G1_L04_AUDIO_COMPLETE`

`POLARISATION_AND_RELATIVE_STRENGTH_MECHANISM_ACCEPTED / EXACT_OUTPUTS_VISUAL_PENDING`
