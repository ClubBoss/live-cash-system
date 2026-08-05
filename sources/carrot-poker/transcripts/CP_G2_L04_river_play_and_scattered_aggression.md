# Source Metadata

Course: Carrot Poker School  
Grade: 2  
Lecture: 04  
Descriptive title: River Play and Scattered Aggression  
Instructor: Peter Clarke  
Original filename: `Lecture 04.mp4`  
Source duration from transcript: `60:42.84`  
Transcription engine: `mlx-whisper`  
Model: `large-v3`  
Language: English  
Translation: disabled  
Source ID: `CP-G2-L04`  
Source status: `AUDIO_COMPLETE / SOLVER_VISUALS_PENDING`

# Source-Faithful Record

## [00:00] Two common scattered-aggression river nodes

The lecture studies lines where aggression is interrupted:

- river probe after the opponent c-bets flop and checks turn;
- bet-check-bet after Hero bets flop, checks turn and receives another river opportunity.

The source treats these as different ancestry states. The ranges arriving at the river are shaped by who declined aggression and when.

## [10:00] Frequency and magnitude must be multiplied

A recurring error is to prefer a line that succeeds more often while ignoring how much EV is gained when it succeeds. The lecture uses a non-poker analogy to show that lower-frequency, higher-magnitude outcomes can dominate higher-frequency, smaller outcomes.

This becomes a river sizing warning: a small bet is not superior merely because more hands call.

## [20:00] Targeting one hand class can become tunnel vision

The source rejects explanations such as “I can get called by X” when they do not compare the full betting branch with check.

A target is strategically meaningful only if:

- it represents enough combinations;
- the chosen size extracts sufficient value;
- the rest of the opponent’s range is accounted for;
- check EV is explicitly compared;
- raises and future responses are realistically weighted.

## [26:00] River Greed Theorem

The source’s “River Greed Theorem” states that a hand arriving with massive river equity usually earns more by maximising investment magnitude than by using a small size to maximise call frequency.

The boundary is the opponent’s reinvestment behaviour. If the opponent will raise often enough against a smaller bet, the smaller size can still build the pot. Against a condensed range that rarely raises, the nutted region must generally choose the larger investment itself.

## [35:00] Value blockers can change the preferred size

A strong hand that blocks the opponent’s natural calls may shift toward a size that relies more on bluff-raises or a different continuing class. The source does not treat this as generic “induce” logic; the raise frequency and range polarity must actually support the line.

## [50:00] Bet-check-bet ranges are often less favourable than expected

After Hero bets flop and checks turn, Hero may arrive at the river with a weakened or condensed range. The opponent’s turn check can partially cap them, but not always enough to make the node highly favourable.

Therefore:

- river probes and bet-check-bets cannot share one automatic bluff rule;
- low-showdown-value hands may be mandatory bluffs in one branch and clear checks in another;
- bluff tiers and value sizes must be rebuilt from the actual line.

# Explicit Instructor Mechanisms

- Scattered aggression creates distinct river ancestry states.
- Frequency and magnitude are separate EV components.
- A hand-class target is insufficient without full-range and check-EV comparison.
- Massive equity against a condensed range usually prefers larger investment.
- Bet-check-bet nodes are often neutral or unfavourable and require selective bluffing.
- Blockers can shift size only after realistic call and raise ranges are established.

# Cross-Source Hooks

- `STRONGLY CONFIRMS H-W01-009` and `H-R05-001`: river ranges reflect every prior action.
- `STRONGLY CONFIRMS H-W02-003`: large size follows value architecture and low opponent reinvestment.
- `STRONGLY CONFIRMS H-W02-009`: river audit begins with value, line and size exclusions.
- `CONFIRMS H-W03-005`: bluff availability depends on the interrupted line.
- Primary modules: `LCM-04`, `LCM-06`, `LCM-09`.
- Primary slots: 5, 9, 15.

# Uncertainties Requiring Visual Review

- exact probe and bet-check-bet boards;
- exact call and raise frequencies;
- exact equity and EV magnitude examples;
- exact blocker-to-sizing mixes.

# Source Verdict

`CP_G2_L04_AUDIO_COMPLETE`

`SCATTERED_AGGRESSION_AND_MAGNITUDE_FREQUENCY_MODEL_ACCEPTED`
