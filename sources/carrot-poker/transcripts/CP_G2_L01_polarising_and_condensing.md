# Source Metadata

Course: Carrot Poker School  
Grade: 2  
Lecture: 01  
Descriptive title: Polarising and Condensing  
Instructor: Peter Clarke  
Original filename: `Lecture 01.mp4`  
Source duration from transcript: `76:07.32`  
Transcription engine: `mlx-whisper`  
Model: `large-v3`  
Language: English  
Translation: disabled  
Source ID: `CP-G2-L01`  
Source status: `AUDIO_COMPLETE / SOLVER_VISUALS_PENDING`

# Source-Faithful Record

## [00:00] Actions filter ranges in different directions

The lecture introduces polarising and condensing as gradable range effects rather than binary labels.

- aggressive actions tend to polarise by retaining stronger value and selected bluffs;
- calls and checks tend to condense by retaining more medium-strength hands;
- the exact effect depends on what the range could have done before the action;
- a check may weaken a range without fully capping it;
- a range may be more or less polarised than another without being perfectly polar.

The instructor repeatedly warns against absolute language such as “this range is capped” when the real point is a relative shift in the density of nuts, medium hands and air.

## [15:00] Range shape must be compared, not labelled in isolation

A range is strategically useful only relative to the opponent’s surviving range. The lecture separates:

- range equity;
- nut or polarisation advantage;
- positional advantage;
- EV after future actions.

The same action can produce different effects on different boards because the hands omitted from a bet, call or check are texture-dependent.

## [29:00] Pot-odds norm and world favourability

The “pot-odds norm” is presented as a neutral-world baseline for expected fold equity. Actual defence may move above or below that mathematical baseline because ranges are asymmetric.

A favourable world for the bettor usually contains some combination of:

- stronger range equity;
- more nutted hands;
- position;
- a more condensed opposing range;
- better future realisation.

The more favourable the world, the less selective the bettor can be with low-showdown-value hands. In an unfavourable world, bluff selection must become stricter.

## [40:00] Delayed c-bets after a condensed check-back range

The lecture uses delayed c-bet nodes to show that checking the flop does not end strategic aggression. After both players check, the in-position range may still retain enough equity and positional EV to bet many turns.

The exact turn card matters because it changes:

- which player improves more often;
- which nutted combinations are available;
- how condensed each range remains;
- how much fold equity the bettor can expect.

Blockers are treated as selectors only after the node’s overall favourability is established.

## [54:00] Relative polarisation governs investment size

The source introduces “Clarke’s theorem” as its own terminology for comparing range polarisation:

- when Hero’s range is much more polarised than Villain’s, larger investments and more raising become available;
- when Hero is more condensed, smaller investments and fewer raises are preferred;
- sizing follows the needs of the value range and the opponent’s likely reinvestment behaviour;
- frequency and size are related but not interchangeable outputs.

A large bet is not justified merely because Hero has range advantage. The relevant question is whether the value region can profitably support the investment against the opponent’s continuing range.

## [57:00] Double-barrel contrast

After a flop bet-call, ranges have filtered differently from a check-check line. The caller has condensed, while the bettor may or may not have polarised depending on flop frequency. Turn strategy must be rebuilt from those actual landing ranges rather than from preflop labels.

# Explicit Instructor Mechanisms

- Aggression usually polarises; passive actions usually condense.
- Polarisation is relative and gradable.
- World favourability alters expected fold equity around the pot-odds norm.
- Range equity mainly affects frequency; relative polarisation strongly affects size and raising.
- Delayed c-bets and double barrels must be solved from different filtered ranges.
- Blockers do not replace the prior range and EV analysis.

# Cross-Source Hooks

- `STRONGLY CONFIRMS H-W01-005`, `H-W01-009` and `H-R05-001`: actions change current range ownership.
- `STRONGLY CONFIRMS H-W02-003` and `H-W02-004`: investment size and raise breadth follow relative range shape.
- `SUPPORTS H-W02-002`: bluff selectivity changes with the future tree and world favourability.
- Primary modules: `LCM-04`, `LCM-05`, `LCM-06`.
- Primary slots: 5, 7, 8, 9.

# Uncertainties Requiring Visual Review

- exact boards and starting ranges;
- exact solver equity and EV values;
- exact bet frequencies and mixed cells;
- exact hand examples used to compare delayed c-bets and double barrels.

# Source Verdict

`CP_G2_L01_AUDIO_COMPLETE`

`RELATIVE_POLARISATION_AND_WORLD_FAVOURABILITY_MODEL_ACCEPTED`
