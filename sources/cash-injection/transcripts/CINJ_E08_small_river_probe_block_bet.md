# Source Metadata

Course: Cash Injection  
Episode: 8  
Official lesson title: not stated in the supplied audio  
Descriptive label: Small River Probe and Block-Bet Exploit  
Instructor: not identified by name in the supplied audio  
Original filename: `Episode 08.mp4`  
Source duration from transcript: `22:53.12`  
Transcription engine: `mlx-whisper`  
Model: `large-v3`  
Language: English  
Translation: disabled  
Source ID: `CINJ-E08`  
Source status: `AUDIO_COMPLETE / NEEDS_VISUAL_REVIEW / POOL_HYPOTHESIS_REQUIRES_VALIDATION`

# Editorial Note

The lesson uses “block bet” as a descriptive label for a small out-of-position river bet, not as a mystical action that prevents the opponent from betting. Exact hands, sizes, solver outputs and population magnitude remain visual- or field-dependent.

# Source-Faithful Record

## [00:06] Episode trigger

The studied action is a small out-of-position river probe, generally below one-third pot, after a prior line in which the in-position player bet an earlier street and then checked back.

The instructor distinguishes this from the vague idea of “betting to stop a bigger bet.” The action must be justified by range and hand function.

## [01:30] Range advantage after bet-check

When the in-position player bets and later checks, some strong value and natural barrels are removed from the river branch. The out-of-position caller can retain hands that improve or remain strong.

On suitable runouts, this can create a river range advantage or at least enough value density to support a small probe.

## [02:40] Why the small size matters

A small bet gives the opponent a very good price and should therefore receive wide calls.

The instructor argues that humans often fail to defend enough:

- ace-high and king-high;
- weak pairs;
- bluff-catchers that feel unattractive;
- hands that are mathematically required to continue because of the price.

If the same folds occur against a smaller size, the bettor risks less and exploits a larger elasticity error.

## [04:40] Thin value and bluff range

The small probe can combine:

- thin value that cannot support a large polar size;
- low-showdown bluffs that need little fold equity;
- hands that benefit from being called by a wide weak range;
- selected hands whose removal improves the fold region.

The range is more merged than a large polar river bet.

## [07:00] Human bet-check construction

The source claims that many players range-bet or bet too widely on the flop, then fail to continue enough appropriate turn barrels. Their check-back range reaches the river with excessive weak high-card and marginal material.

That branch can be vulnerable to a small probe, particularly when the river improves the out-of-position range.

## [09:00] Mandatory-bluff language and range ownership

Several examples are described as very high-frequency or mandatory bluffs because:

- Hero has little showdown value;
- the river favours Hero's surviving range;
- the opponent's check-back branch contains many folds;
- the small size needs limited fold equity.

Project interpretation retains the inputs but does not import exact mandatory frequencies without visual and environment validation.

## [13:00] Size comparison

The instructor compares the small probe with larger sizes. A larger bet may make folds theoretically correct and therefore reduce the opponent's error.

The small size can be more exploitative when the opponent folds the same weak hands regardless of price.

## [16:00] Facing a raise

A small river probe may occasionally induce an aggressive raise. The instructor treats this as a possible bonus branch, not the primary reason for betting.

The original decision must still be profitable through value, thin value or bluff EV before considering the raise response.

## [20:00] Unfiltered and capped branches

The lesson connects the small river probe to an opponent range that is broad, weak and partially unfiltered after checking. The exact success of the play depends on:

- the prior bet/check line;
- the river card;
- the opponent's remaining value;
- the price offered;
- whether the opponent actually overfolds.

# Explicit Instructor Mechanisms

- Small river bets support a merged range of thin value and low-cost bluffs.
- A better price theoretically requires wider defence.
- Inelastic folds can make a smaller bet more profitable than a larger one.
- The previous bet-check line may cap or weaken the opponent's river range.
- Range advantage and showdown value determine whether the small probe is value, bluff or check.
- Inducing a raise is secondary to the primary EV of the bet.

# Project Interpretation Boundaries

Accepted as mechanism:

- construct the small probe from range advantage, thin value and low fold-equity requirements;
- compare response elasticity across sizes;
- derive river range shape from the prior bet-check branch;
- separate primary bet EV from an optional induce branch;
- keep large polar bets and small merged probes conceptually distinct.

Retained only as pool hypotheses:

- players broadly overfold ace-high, king-high and weak pairs to small river probes;
- the source's very high bluff frequencies apply to unknown live players;
- bet-check ranges are universally weak enough to attack;
- small river bets are broadly under-raised or misplayed in Batumi.

# Cross-Source Hooks

- `CONFIRMS H-W02-001`: define thin value and range function before bluffs.
- `EXTENDS H-W02-003`: sizing expresses merged versus polar range shape.
- `STRONGLY EXTENDS H-W03-006`: small sizes can expose defence elasticity failure.
- `CONFIRMS H-W02-009`: prior size and line exclude parts of value before river action.
- `CONFIRMS H-W03-005`: the bet-check path determines river bluff/fold supply.
- `CONFIRMS H-W02-007`: exploit the exact river probe response branch.
- `SUPPORTS LCM-06`, `LCM-09` and `LCM-10`.

# Uncertainties Requiring Visual Review

- exact boards, cards, positions and pot sizes;
- exact probe sizes in each example;
- exact range advantage and solver EV;
- exact call/fold/raise frequencies;
- exact blocker and thin-value hand classes;
- exact node-lock assumptions.

# Source Verdict

`CINJ_E08_AUDIO_COMPLETE`

`SMALL_RIVER_PROBE_MECHANISM_ACCEPTED`

`POOL_OVERFOLD_AND_RAISE_RESPONSE_FIELD_VALIDATION_PENDING`
