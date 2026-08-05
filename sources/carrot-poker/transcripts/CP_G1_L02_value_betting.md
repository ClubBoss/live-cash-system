# Source Metadata

Course: Carrot Poker School  
Grade: 1  
Lecture: 02  
Title: Value Betting  
Instructor: Peter Clarke  
Original filename: `Lecture 02.mp4`  
Source duration from transcript: `63:34.50`  
Transcription engine: `mlx-whisper`  
Model: `large-v3`  
Language: English  
Translation: disabled  
Source ID: `CP-G1-L02`  
Source status: `AUDIO_COMPLETE / SOLVER_VISUALS_PENDING`

# Editorial Note

The audio is continuous and technically complete. The lesson relies on solver screens, exact hands, boards, equity estimates, frequencies and EV outputs. The mechanisms below are stable from the spoken explanation; exact examples remain visual-dependent.

Local ASR errors affect some card names and product names but do not interrupt the lesson structure.

# Source-Faithful Record

## [00:05] Three value-bet categories

The lesson classifies a possible value bet as:

- mandatory: betting has higher EV than checking;
- optional: betting and checking are close enough that both can belong in the strategy;
- prohibited: checking has higher EV than betting, even if worse hands can sometimes call.

Optional value bets matter structurally. Betting all of them can produce an excessively strong betting range and an exposed, weak checking range.

## [02:50] Urgency

Urgency is how strongly the hand needs to invest now rather than delay.

Urgency rises when:

- few streets remain;
- Hero is out of position and checking gives Villain the next betting opportunity;
- Villain is unlikely to raise enough later;
- the pot still requires substantial growth for the value region.

Urgency can be lower when:

- substantial future action remains;
- the pot is already large relative to stacks;
- checking preserves a credible chance to earn future bets;
- the opponent is likely to supply aggression.

The source treats urgency as a graded variable rather than a yes/no label.

## [05:30] Landing equity and finishing equity

The lesson distinguishes the equity with which a hand arrives at a decision from its equity after a bet is called and from the full future-tree EV.

A value bet requires enough strength against the continuing range, not merely high raw equity against the opponent's starting range.

Earlier streets can support thinner-looking value bets when future improvement and implied-odds branches add EV. On the river, where no future cards remain, finishing equity against the call range matters more directly.

## [12:30] Denial is secondary

Protection is renamed `denial` and treated as a secondary reason for betting.

Making live hands fold can improve a value bet, but denial alone does not establish that betting is better than checking. The source repeatedly warns against overvaluing the emotional appeal of protecting a made hand.

A correct comparison includes:

- value received from worse continues;
- loss against stronger continues;
- useful equity denied from folds;
- future value after checking;
- future bluffs induced by checking;
- action-killing runouts.

## [18:00] Position and action protocol

Position changes both realisation and urgency.

Out of position, a small value bet or block bet may be attractive because checking opens the action for Villain and can expose Hero to a larger bet. In position, making a thin small bet reopens action and can destroy the value of checking behind.

The source does not convert this into a fixed sizing rule; position changes the EV comparison.

## [24:00] Protecting the checking range

Strong and medium-strength hands must remain in check when betting is merely optional.

This prevents:

- an over-concentrated value range;
- automatic pressure against every check;
- excessive fold equity for the opponent;
- predictable separation between strong bets and weak checks.

The lesson explicitly rejects the idea that every hand capable of getting called by worse should always bet.

## [35:00] Hand and range interaction

Value-bet quality is hand-specific and range-specific.

The source distinguishes:

- strong urgent value that should bet;
- optional value that can protect check;
- medium hands that look attractive against one target class but lose in the whole-tree comparison;
- value-plus-denial hands whose folds have meaningful equity;
- hands whose apparent protection benefit is too small to overcome the value of checking.

## [50:00] Review exercises

The closing examples ask the learner to:

1. estimate equity and future EV;
2. identify Villain's continuing range;
3. compare bet and check across the full tree;
4. classify the hand as mandatory, optional or prohibited;
5. explain whether denial meaningfully changes the result.

Exact boards, hands and solver outputs remain visual-dependent.

# Explicit Instructor Mechanisms

- Compare betting against checking; do not ask only whether worse hands can call.
- Use urgency and strength against the continuing range to classify value bets.
- Preserve optional value in check to protect the passive branch.
- Treat denial as a secondary EV contribution, not a self-sufficient reason.
- Position, remaining streets, stack-to-pot geometry and expected future aggression change urgency.
- Earlier-street value can benefit from future improvement and implied odds; river value is more directly constrained by the call range.
- Judge the full action tree rather than one emotionally salient branch.

# Cross-Source Hooks

- `STRONGLY SIMPLIFIES H-W02-001`: value threshold is selected before sizing and bluff volume.
- `EXTENDS H-W01-006`: depth, position and future aggression alter the need to preserve resilient passive lines.
- `CONFIRMS H-R04-010`: optional value hands protect checking ranges.
- `CONFIRMS H-R05-002`: a checking strategy remains active because it contains strong hands and future responses.
- `SIMPLIFIES H-R05-001`: compare complete bet/check trees rather than one visible branch.
- `SUPPORTS LCM-03`, `LCM-05` and `LCM-06`.

# Project Interpretation Boundaries

Accepted:

- urgency is graded and depends on future action;
- value categories are comparative EV labels;
- optional value protects checking ranges;
- denial is secondary;
- position changes the value of reopening action.

Not accepted as exact project thresholds:

- any displayed equity percentage;
- any exact solver mixing frequency;
- any exact sizing from an unseen screen;
- a universal river or turn equity cutoff.

# Uncertainties Requiring Visual Review

- exact boards, hands and suits;
- exact bet sizes and pot geometry;
- solver frequencies and EV outputs;
- exact numerical equity examples;
- whether some mixed actions are pedagogically rounded in speech.

# Source Verdict

`CP_G1_L02_AUDIO_COMPLETE`

`VALUE_BETTING_MECHANISM_ACCEPTED / EXACT_OUTPUTS_VISUAL_PENDING`
