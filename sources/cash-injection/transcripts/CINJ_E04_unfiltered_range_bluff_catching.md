# Source Metadata

Course: Cash Injection  
Episode: 4  
Official lesson title: not stated in the supplied audio  
Descriptive label: Bluff-Catching Against Unfiltered Ranges  
Instructor: not identified by name in the supplied audio  
Original filename: `Episode 04.mp4`  
Source duration from transcript: `21:53.22`  
Transcription engine: `mlx-whisper`  
Model: `large-v3`  
Language: English  
Translation: disabled  
Source ID: `CINJ-E04`  
Source status: `AUDIO_COMPLETE / NEEDS_VISUAL_REVIEW / POOL_HYPOTHESIS_REQUIRES_VALIDATION`

# Editorial Note

The lesson introduces “unfiltered range” as a practical concept and then makes aggressive population recommendations. The concept is retained; claims that players broadly overbluff these nodes remain hypothesis-gated.

# Source-Faithful Record

## [00:06] Definition

A range is described as filtered when it has voluntarily invested through a bet, call or raise and thereby removed part of its weakest region.

An unfiltered range reaches a later street after an action such as checking through, so many weak combinations remain present.

## [00:45] Starting-range caveat

The instructor explicitly limits the term: an unfiltered range is strategically useful as a concept only when the starting range was reasonably wide.

A very tight preflop range can remain strong even when it reaches a street without further filtering.

## [02:30] Aggression from unfiltered ranges

When a wide range reaches the turn without filtering and then bets, the instructor argues that humans frequently select too many weak hands for aggression.

The source attributes this to the sheer number of air and marginal combinations available and to the intuitive appeal of betting after the opponent showed weakness.

## [04:30] Bluff-catching consequence

The practical recommendation is to continue more widely with bluff-catchers against normal or smaller sizes when:

- the starting range was wide;
- few strong value hands were added by the runout;
- the aggressor reached the node without earlier filtering;
- many natural air combinations remain;
- the line is not four-to-a-straight, four-to-a-flush or otherwise heavily value-concentrated.

## [06:30] Blockers are downstream

The lesson reviews blocker differences but repeatedly treats them as secondary to the much larger range-composition question.

The central order is:

```text
starting range width
→ filtering history
→ value and air supply
→ size
→ blockers
```

## [10:00] Ambitious calls and limits

Several examples include calls that the instructor admits may be too loose in exact equilibrium terms. The point is not that every displayed bluff-catcher is certainly profitable, but that human aggression from unfiltered ranges may be materially bluff-heavier than solver baselines suggest.

The instructor distinguishes clear bluff-catchers from hands that fail to beat enough of the actual bluff region.

## [15:00] Mass-data and hand-class selection

The source references mass-data patterns and argues that humans reach these nodes with more offsuit and weak combinations than solver output may imply, then choose too many of them as bets.

No dataset is included, so the direction is preserved as a hypothesis rather than a verified population fact.

## [18:00] Practical recommendation

The instructor advocates resisting fear of later-street bets from wide unfiltered ranges and making more ambitious calls when the line, size and runout preserve large air supply.

The lesson does not authorise ignoring value concentration, starting-range strength or extreme sizing.

# Explicit Instructor Mechanisms

- Filtering history determines how much weak range can reach a node.
- “Unfiltered” matters only relative to the width and strength of the starting range.
- Wide unfiltered ranges contain many more potential bluff combinations.
- Blockers should be evaluated after realistic value and air regions are established.
- Smaller or normal sizes against air-rich branches can justify wider bluff-catching.

# Project Interpretation Boundaries

Accepted as mechanism:

- track whether a range voluntarily filtered before later aggression;
- condition the concept on starting-range width;
- reconstruct air supply before using blockers;
- distinguish air-rich unfiltered branches from highly filtered value-heavy branches.

Retained only as pool hypotheses:

- regulars and recreational players broadly overbet unfiltered ranges;
- very ambitious calls are profitable against unknown target players;
- mass-data magnitude transfers directly to live cash.

# Cross-Source Hooks

- `STRONGLY CONFIRMS H-W01-009`: current-node range depends on prior reach and filtering.
- `STRONGLY CONFIRMS H-R05-001`: ownership and density must be recalculated after actions.
- `STRONGLY CONFIRMS H-W03-005`: bluff supply is line-created.
- `CONFIRMS H-W03-011`: blocker value follows ancestry.
- `CONFIRMS H-W02-009`: river defence begins with value/bluff reconstruction.
- `CONFIRMS H-W02-007`: exploit the unfiltered branch, not the player globally.
- `SUPPORTS LCM-04`, `LCM-09` and `LCM-10`.

# Uncertainties Requiring Visual Review

- exact boards, positions and sizes;
- exact mass-data filters;
- exact solver call/fold frequencies;
- exact bluff and value cells;
- exact blocker rankings;
- whether each example shares the same degree of starting-range width.

# Source Verdict

`CINJ_E04_AUDIO_COMPLETE`

`FILTERED_VERSUS_UNFILTERED_MECHANISM_ACCEPTED`

`UNFILTERED_BRANCH_OVERBLUFF_MAGNITUDE_FIELD_VALIDATION_PENDING`
