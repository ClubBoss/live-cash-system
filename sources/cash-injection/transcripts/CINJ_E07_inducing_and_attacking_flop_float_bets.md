# Source Metadata

Course: Cash Injection  
Episode: 7  
Official lesson title: not stated in the supplied audio  
Descriptive label: Inducing and Attacking Flop Float Bets  
Instructor: not identified by name in the supplied audio  
Original filename: `Episode 07.mp4`  
Source duration from transcript: `23:35.62`  
Transcription engine: `mlx-whisper`  
Model: `large-v3`  
Language: English  
Translation: disabled  
Source ID: `CINJ-E07`  
Source status: `AUDIO_COMPLETE / NEEDS_VISUAL_REVIEW / POOL_HYPOTHESIS_REQUIRES_VALIDATION`

# Editorial Note

The episode studies bets made by an in-position preflop caller after the out-of-position preflop raiser checks the flop. The instructor uses strong language about habitual over-stabbing and fold-happiness. The protected-check mechanism is accepted; population magnitude remains field-gated.

# Source-Faithful Record

## [00:06] Episode trigger

The line is:

```text
Hero is out-of-position preflop raiser
→ Hero checks flop
→ in-position caller bets when checked to
```

The instructor calls this a float bet or stab.

## [00:30] Why the node attracts aggression

The source argues that many players interpret an out-of-position check from the preflop raiser as weakness. Because preflop-raiser checking ranges are often underprotected in human play, the in-position caller becomes comfortable betting too many hands.

## [02:00] Build the check before exploiting the stab

The recommended exploit begins with Hero's own range construction.

Hero should check enough:

- strong hands;
- resilient one-pair hands;
- draws and semi-bluffs;
- low-showdown candidates that can check-raise;
- hands that can call multiple streets.

The purpose is not to trap with one exact hand. It is to create a check range that can respond actively.

## [03:30] Attack the float branch

When the opponent's float range is judged too wide, the instructor recommends:

- check-raising low-showdown or semi-bluff hands;
- calling more with showdown value;
- allowing the opponent to continue bluffing when Hero's hand benefits from induction;
- using value raises when the float branch cannot defend enough.

The hand-class split matters: not every hand should attack through the same action.

## [05:20] Turn control after a flop raise

The lesson references a Carrot rule that bad turns for Hero's range should reduce continued bluffing after a flop check-raise.

The general mechanism is clear even though the full referenced Grade 3 lesson is not yet ingested:

- a profitable flop exploit does not authorise automatic turn continuation;
- the new card and surviving range must be recalculated;
- some turns require checking after the flop raise.

## [08:00] Range-check examples

The instructor uses examples where the out-of-position preflop raiser can check very frequently or potentially range-check. Against such a protected range, the in-position caller should not be able to stab indiscriminately.

The source claims humans still overbet and then overfold to check-raises.

## [12:30] Showdown-value branch

With hands that can beat the opponent's float bluffs, the instructor often prefers calling rather than immediately raising. This preserves the opponent's weak range and permits further bluffs.

With low showdown value, raising becomes more attractive when it creates immediate folds and a viable future plan.

## [16:00] Thin value and protection

Some made hands can check-raise for value and denial when the float range is wide. Others remain calls because raising removes too much weak material.

This repeats the range-level principle from Episode 01: one opponent error creates different optimal adjustments for different Hero hand classes.

## [20:30] Practical compression

The ending compresses the strategy as:

```text
check a stronger and more protected range
→ observe whether Villain stabs too wide
→ raise low-showdown/value-denial candidates
→ call down more with bluff-catchers
→ re-evaluate on the turn
```

# Explicit Instructor Mechanisms

- An exploit against float bets requires a protected checking range first.
- Low-showdown hands and showdown-value hands often exploit the same wide stab through different actions.
- Check-raising should be followed by turn ownership recalculation.
- A range-check or high-check branch needs enough calls and raises to avoid becoming capped.
- The exploit belongs to the checked-to float branch, not to a global aggression label.

# Project Interpretation Boundaries

Accepted as mechanism:

- retain strong and resilient hands in the out-of-position check range;
- attack an evidenced over-wide float with calls and raises by hand function;
- stop automatic follow-through when the turn repairs the opponent;
- distinguish induction value from immediate denial value.

Retained only as pool hypotheses:

- in-position callers broadly stab too wide across target pools;
- opponents broadly overfold to flop check-raises;
- protected checks and raises can be used at the source's aggressive frequency in live $1/$3 or $2/$5.

# Cross-Source Hooks

- `STRONGLY CONFIRMS H-R05-002`: a heavy-check strategy requires active calls and raises.
- `STRONGLY CONFIRMS H-R04-010`: resilient hands must remain in passive branches.
- `CONFIRMS H-W02-005`: vulnerable made hands may gain protection-raise incentive.
- `CONFIRMS H-W01-005` and `H-R05-001`: the turn must be recalculated after the flop exploit.
- `CONFIRMS H-W02-007`: exploit the float branch, not a personality label.
- `EXTENDS H-W03-004`: a player's stab branch can be weak while other branches remain protected.
- `SUPPORTS LCM-04`, `LCM-05`, `LCM-06` and `LCM-10`.

# Uncertainties Requiring Visual Review

- exact boards, hands, positions and sizes;
- exact baseline checking and raising frequencies;
- exact turn cards that trigger shutdown;
- exact value/denial hand classes;
- exact mass-data or pool evidence;
- full wording and scope of the referenced Carrot Grade 3 rule.

# Source Verdict

`CINJ_E07_AUDIO_COMPLETE`

`PROTECTED_CHECK_AND_FLOAT_RESPONSE_MECHANISM_ACCEPTED`

`POOL_OVERSTAB_OVERFOLD_MAGNITUDE_FIELD_VALIDATION_PENDING`
