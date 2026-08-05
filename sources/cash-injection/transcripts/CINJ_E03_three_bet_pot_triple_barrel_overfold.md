# Source Metadata

Course: Cash Injection  
Episode: 3  
Official lesson title: not stated in the supplied audio  
Descriptive label: Triple-Barrel Exploits in 3-Bet Pots  
Instructor: not identified by name in the supplied audio  
Original filename: `Episode 03.mp4`  
Source duration from transcript: `19:40.26`  
Transcription engine: `mlx-whisper`  
Model: `large-v3`  
Language: English  
Translation: disabled  
Source ID: `CINJ-E03`  
Source status: `AUDIO_COMPLETE / NEEDS_VISUAL_REVIEW / POOL_HYPOTHESIS_REQUIRES_VALIDATION`

# Editorial Note

The lesson combines a personal hand, solver baselines, node locks and broad pool claims. Exact cards, suits, frequencies, EV and sizing remain visual-dependent. The strategic direction is retained; the magnitude of population overfolding is not admitted as a live default.

# Source-Faithful Record

## [00:06] Episode trigger

The episode studies bluffing through flop, turn and river in 3-bet pots, especially when the preflop ranges are wide and the defender is expected to overfold later streets.

A small-blind-versus-button example is used to introduce the spot.

## [00:40] Flop and turn range shape

The instructor notes that some boards support a larger flop size rather than an automatic small c-bet. The later bluffing opportunity is then analysed through:

- the preflop 3-bet range;
- the defender's call range;
- the flop size;
- the turn size;
- which one-pair and high-card combinations survive.

A smaller turn size is described as leaving the defender with a wider river range than a large polar turn bet would.

## [03:40] Population overfold claim

The instructor references filtered mass data and claims that both regular and recreational archetypes overfold rivers in the studied 3-bet-pot configurations, with the exploit especially pronounced in late-position wide-range confrontations.

The underlying dataset and filter definitions are not supplied in the package, so this remains a source claim rather than independently verified evidence.

## [05:00] Why wide ranges matter

The defender's preflop range contains many offsuit broadways, ace-highs, weak pairs and suited hands. After calling flop and turn, some of these remain marginal bluff-catchers on the river.

The lesson argues that humans release too many of these combinations relative to the price, particularly after a third barrel.

## [08:10] Node-lock construction

The instructor increases folds among marginal bluff-catchers while preserving calls with the strongest top pairs and better hands. The lock is intentionally directional and is used to inspect how river bluff EV changes.

This shows that hands which are mixed or losing bluffs in baseline output can become profitable if the assumed overfold is real.

## [11:10] Runout sensitivity

Several river cards are compared. The lesson emphasises that the exploit is not identical on every river:

- some cards improve or strengthen the defender's range;
- some remove natural folds;
- some complete obvious draws and alter bluff credibility;
- drier or less disruptive rivers may provide cleaner pressure.

The source nevertheless argues that overfolding remains substantial across many runouts.

## [15:00] Bluff candidates and range ancestry

Busted draws and low-showdown hands are examined as river bluffs. The instructor focuses more on surplus fold equity than on reproducing exact solver mixing.

The practical recommendation is to arrive at the river with enough bluff candidates and follow through when the node is believed to be overfolded.

## [18:20] Visibility and adaptation

The instructor limits the recommendation by discussing visibility. In anonymous or large pools, repeated exploitation may attract less adaptation. Against opponents who know the player or adjust quickly, the exploit should be monitored and reduced.

# Explicit Instructor Mechanisms

- Preflop range width and street sizing determine which bluff-catchers reach the river.
- A smaller turn bet can preserve a wider, more vulnerable river range.
- Excess river folds can make baseline-mixed or losing bluffs profitable.
- Runout and surviving hand classes still matter; “triple barrel everything” is not a literal universal rule.
- Adaptation and visibility affect how aggressively a population exploit can be repeated.

# Project Interpretation Boundaries

Accepted as mechanism:

- carry 3-bet preflop shape through later streets;
- evaluate bluff EV from the defender's actual surviving range and price;
- preserve a river plan when selecting turn bluffs;
- treat runout and sizing as context selectors;
- monitor adaptation.

Retained only as pool hypotheses:

- regulars and recreational players broadly overfold these river nodes;
- many busted draws can be profitably jammed across most textures;
- the demonstrated node-lock magnitude applies to target live games.

# Cross-Source Hooks

- `CONFIRMS H-W03-001`: the 3-bet-pot tree begins with preflop shape.
- `STRONGLY CONFIRMS H-W03-005`: river bluff supply must be seeded earlier.
- `EXTENDS H-W02-002`: turn sizing and hand selection should preserve a river job.
- `CONFIRMS H-W01-009`: current river frequency depends on prior reach.
- `CONFIRMS H-W02-007`: exploit belongs to the exact triple-barrel branch.
- `SUPPORTS LCM-07`, `LCM-09` and `LCM-10`.

# Uncertainties Requiring Visual Review

- exact preflop ranges and board cards;
- exact flop/turn/river sizes;
- exact mass-data filters;
- exact node-lock folds and calls;
- exact EV changes for individual bluff candidates;
- exact runout comparisons.

# Source Verdict

`CINJ_E03_AUDIO_COMPLETE`

`THREE_BET_ANCESTRY_AND_TRIPLE_BARREL_MECHANISM_ACCEPTED`

`RIVER_OVERFOLD_MAGNITUDE_FIELD_VALIDATION_PENDING`
