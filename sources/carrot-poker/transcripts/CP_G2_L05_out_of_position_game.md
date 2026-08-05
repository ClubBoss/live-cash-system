# Source Metadata

Course: Carrot Poker School  
Grade: 2  
Lecture: 05  
Descriptive title: The Out-of-Position Game  
Instructor: Peter Clarke  
Original filename: `Lecture 05.mp4`  
Source duration from transcript: `53:41.38`  
Transcription engine: `mlx-whisper`  
Model: `large-v3`  
Language: English  
Translation: disabled  
Source ID: `CP-G2-L05`  
Source status: `AUDIO_COMPLETE / SOLVER_VISUALS_PENDING`

# Source-Faithful Record

## [00:00] OOP is a different game because checking does not close action

The lecture treats the out-of-position game as structurally distinct. OOP ranges can use more checking, trapping and small betting because:

- checking passes the decision to the opponent;
- strong hands can still build the pot through check-raises or later streets;
- the opponent’s air can create EV after Hero checks;
- urgency changes when Hero faces a check versus a bet.

The source rejects the idea that strong hands must always bet immediately.

## [10:00] Value comes from the opponent’s full range

Fast-playing solely to cooler second-best hands ignores the rest of the tree. A strong hand may gain more from checking when the opponent’s weak region will bluff or bet thinly.

The relevant comparison is not “can worse call?” but:

- bet EV against all responses;
- check-call or check-raise EV;
- the opponent’s betting frequency;
- future card and sizing geometry;
- the value of keeping air in the range.

## [20:00] Condensed opponents and the investment ceiling

When the opponent has checked back and condensed, a nutted OOP range may need to choose a very large river size because the opponent is unlikely to raise enough to build the pot.

The source distinguishes anomaly hands whose blockers change the preferred size from nearby value hands.

## [30:00] Three slow-play categories

The lecture separates:

- theoretical slow-play: check is supported at equilibrium;
- exploitative slow-play: theory may prefer betting, but a specific opponent tendency makes checking higher EV;
- erroneous slow-play: betting is superior and no credible exploit justifies the check.

This prevents “trapping” from becoming a blanket excuse for missed value.

## [40:00] Robustness and frailness

A robust hand can beat bluffs without improving and can invest without relying heavily on future bluffing. A frail hand may lose even when the opponent is bluffing and may need improvement or later aggression to realise its equity.

The distinction affects:

- call versus raise;
- slow-play versus fast-play;
- the cost of future bluffing;
- how much protection is actually valuable;
- which hands belong in passive branches.

## [48:00] OOP river polarisation after filtering

After Hero check-calls a large bet and the opponent later checks, Hero’s range may be substantially stronger and more polarised than the opponent’s. Very large river bets can then be justified by relative range shape rather than by absolute hand labels.

# Explicit Instructor Mechanisms

- OOP checking retains future aggressive options and can extract from air.
- Slow-play must be classified as theoretical, exploitative or erroneous.
- Robust hands can preserve passive branches; frail hands may need more urgent action.
- Condensed opponents often require Hero to choose the investment size directly.
- Blockers can make otherwise similar value hands choose different lines.
- Relative polarisation, not fear of reopening, governs large OOP river investments.

# Cross-Source Hooks

- `STRONGLY EXTENDS H-W01-006`: resilient OOP calls and slow-plays are protected; exact deep-stack boundary remains open.
- `STRONGLY CONFIRMS H-R04-010` and `H-R05-002`: passive branches require strong and robust hands.
- `CONFIRMS H-W02-003`: condensed opponents support large value-driven sizes.
- `SUPPORTS H-W02-005`: frail or vulnerable hands can prefer more active lines.
- Primary modules: `LCM-03`, `LCM-05`, `LCM-06`.
- Primary slots: 6, 7, 9.

# Uncertainties Requiring Visual Review

- exact delayed-c-bet and river boards;
- exact slow-play frequencies;
- exact blocker examples and size mixes;
- exact equity thresholds separating robust and frail hands.

# Source Verdict

`CP_G2_L05_AUDIO_COMPLETE`

`OOP_SLOWPLAY_AND_ROBUSTNESS_MODEL_ACCEPTED`

`DEEP_STACK_BOUNDARY_REMAINS_OPEN`
