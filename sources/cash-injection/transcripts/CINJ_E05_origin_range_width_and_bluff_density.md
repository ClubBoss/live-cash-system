# Source Metadata

Course: Cash Injection  
Episode: 5  
Official lesson title: not stated in the supplied audio  
Descriptive label: Origin-Range Width and Bluff Density  
Instructor: not identified by name in the supplied audio  
Original filename: `Episode 05.mp4`  
Source duration from transcript: `25:47.02`  
Transcription engine: `mlx-whisper`  
Model: `large-v3`  
Language: English  
Translation: disabled  
Source ID: `CINJ-E05`  
Source status: `AUDIO_COMPLETE / NEEDS_VISUAL_REVIEW / POOL_HYPOTHESIS_REQUIRES_VALIDATION`

# Editorial Note

The lesson uses “origin range” for the preflop range from which the later line begins. It references solver work and mass data, but the underlying data is not included. The range-width mechanism is accepted; population direction and magnitude remain conditional.

# Source-Faithful Record

## [00:06] Core claim

The instructor proposes the initial preflop position and range width as a major predictor of later bluff density.

Wide blind-versus-blind and late-position ranges contain many more offsuit and weak combinations than tight early-position ranges. Those extra combinations can survive into later streets and create a much larger potential bluff supply.

## [00:50] Origin range

“Origin range” is used to mean the starting range before later actions filter it.

The lesson argues that a river line cannot be evaluated solely from the final board or absolute hand strength. The analyst must ask how many combinations existed at origin and how many plausibly reached the current node.

## [03:30] Wide-range examples

Blind-versus-blind and late-position examples are presented as branches where humans may arrive with many offsuit air combinations, weak pairs and marginal draws.

The instructor references mass data and claims these configurations are frequently overbluffed, even when the line appears aggressive.

## [07:00] Combinatorial reason

The source emphasises that unpaired offsuit hands contribute twelve combinations, so wide preflop ranges can contain a very large amount of weak material.

If humans choose too many of those combinations for turn and river aggression, the branch becomes overbluffed quickly.

## [11:30] Bluff-catcher consequence

Against wide-origin ranges, the instructor recommends calling all hands that beat the relevant bluffs when the later line remains air-rich.

The recommendation is not based on one attractive blocker. It is based on the number of value and bluff combinations produced by the starting range and subsequent filtering.

## [15:30] Tight-origin comparison

The lesson contrasts wide configurations with tighter early-position ranges.

A tight origin range:

- begins with fewer offsuit air combinations;
- reaches later streets with greater value concentration;
- can have difficulty finding enough natural bluffs;
- makes ambitious bluff-catching less attractive.

## [19:30] Board and line constraints

The instructor adds that origin width is not sufficient by itself. Connected broadway textures, completed draws and prior sizing can reduce available air or increase value.

The origin range is therefore a prior, not a substitute for street-by-street filtering.

## [22:30] Solver versus exploit

The lesson rejects copying solver call frequencies without adjusting for how humans select bluffs in wide and tight ranges.

The practical proposal is directional:

```text
wide origin + air-rich path
→ more willingness to bluff-catch

tight origin + heavily filtered path
→ more willingness to fold
```

# Explicit Instructor Mechanisms

- Starting-range width sets the initial supply of possible bluffs.
- Offsuit combinations create much more air mass than intuitive hand lists suggest.
- Position is useful because it predicts range width, not because position itself magically creates bluffs.
- Later filtering and board texture can override or narrow the origin-range prior.
- Bluff-catching should use origin range plus path, not absolute hand strength alone.

# Project Interpretation Boundaries

Accepted as mechanism:

- use preflop origin range as the starting denominator for later bluff density;
- compare wide versus tight configurations through combination mass;
- preserve street-by-street filtering and board constraints;
- treat position as a proxy for range construction, not a universal label.

Retained only as pool hypotheses:

- wide-origin branches are broadly overbluffed across target pools;
- tight-origin branches are broadly underbluffed;
- all bluff-catchers should call or fold solely from origin width;
- referenced online mass-data patterns transfer directly to Batumi.

# Cross-Source Hooks

- `STRONGLY CONFIRMS H-W01-009`: current density must be interpreted through prior reach.
- `CONFIRMS H-W01-007`: high-weight offsuit and pair mass should be read before fringe suited detail.
- `STRONGLY CONFIRMS H-W03-005`: bluff supply begins before the river.
- `CONFIRMS H-W03-001`: preflop range shape persists through the tree.
- `CONFIRMS H-W02-009`: river defence requires range-origin and filtering audit.
- `CONFIRMS H-W02-007`: the exploit belongs to a configuration and line.
- `SUPPORTS LCM-02`, `LCM-04`, `LCM-09` and `LCM-10`.

# Uncertainties Requiring Visual Review

- exact positions, boards and line sizes;
- exact origin ranges shown;
- exact mass-data filters and sample size;
- exact solver frequencies and blocker effects;
- exact boundary between wide and tight configurations.

# Source Verdict

`CINJ_E05_AUDIO_COMPLETE`

`ORIGIN_RANGE_WIDTH_MECHANISM_ACCEPTED`

`WIDE_OVERBLUFF_TIGHT_UNDERBLUFF_MAGNITUDE_FIELD_VALIDATION_PENDING`
