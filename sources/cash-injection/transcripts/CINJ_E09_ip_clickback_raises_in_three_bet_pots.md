# Source Metadata

Course: Cash Injection  
Episode: 9  
Official lesson title: not stated in the supplied audio  
Descriptive label: In-Position Click-Back Raises in 3-Bet Pots  
Instructor: not identified by name in the supplied audio  
Original filename: `Episode 09.mp4`  
Source duration from transcript: `25:58.14`  
Transcription engine: `mlx-whisper`  
Model: `large-v3`  
Language: English  
Translation: disabled  
Source ID: `CINJ-E09`  
Source status: `AUDIO_COMPLETE / NEEDS_VISUAL_REVIEW / POOL_HYPOTHESIS_REQUIRES_VALIDATION`

# Editorial Note

The lesson studies small in-position flop raises after calling a preflop 3-bet. It combines solver baselines, personal hands and aggressive population claims. The response-shape mechanism is accepted; exact exploit frequencies and pool tendencies remain hypothesis-gated.

# Source-Faithful Record

## [00:06] Episode trigger

The core line is:

```text
Hero opens and calls a 3-bet in position
→ out-of-position 3-bettor c-bets flop
→ Hero raises small, usually around two to three times the bet
```

The instructor calls this “clicking it back.”

## [00:40] Why the node may be exploitable

The source argues that 3-bettors often c-bet too much and are much more familiar with facing calls than small raises.

A small raise creates a difficult response because the bettor receives a good price and theoretically must continue widely, including with hands that humans may find uncomfortable.

## [03:30] Baseline raising range

Solver output may use only a small raise frequency in some examples, often driven by a narrow set of value, denial and bluff candidates.

The instructor focuses on whether population folds and flop three-bets differ from that baseline rather than copying the equilibrium frequency.

## [06:00] Node lock and EV

The response is altered to represent:

- extra folds;
- fewer bluff three-bets;
- stronger value concentration when a three-bet occurs;
- imperfect defence of marginal overpairs, high cards and backdoors.

Under those assumptions, raising more hands gains EV.

## [10:00] Bluff selection

The lesson discusses raising low-showdown hands and backdoors that:

- can generate immediate folds;
- do not block the opponent's folding region;
- have some improvement or useful turn coverage;
- can comfortably fold to a value-heavy flop three-bet.

Exact suit preferences and matrix cells remain visual-dependent.

## [14:00] Range-level exploit and hand classes

The small raise is not only a bluffing action. The instructor adds:

- slow-played very strong hands;
- thin value and denial raises;
- medium-strength hands seeking protection or clarity;
- hands that gain from reducing the opponent's equity realisation.

A strong hand may still call when raising removes too much weaker material.

## [17:00] Transparency and future play

Some medium-strength raises are described as seeking “transparency”: they simplify later decisions by forcing the opponent to reveal a stronger response range.

Project interpretation treats this as thin value/protection plus response filtering, not as a separate reason that overrides EV or range construction.

## [20:00] Raise-fold branch

The instructor recommends being willing to fold many thin value, denial and bluff raises to a flop three-bet because that aggressive response is claimed to be underbluffed.

This creates a paired exploit:

```text
raise more versus overfolding c-bet branch
→ fold more versus value-heavy three-bet branch
```

The source repeatedly stresses that the two branches should not be averaged together.

## [23:30] Practical recommendation

The ending recommends frequent small raises against opponents believed to c-bet too much, overfold and rarely bluff three-bet.

The source also limits the play by position, board, SPR, starting range and adaptation, though the overall recommendation remains promotional and aggressive.

# Explicit Instructor Mechanisms

- A small in-position raise gives the c-bettor a good price and requires wide defence.
- Overfolding and missing bluff three-bets can justify expanding bluff, thin-value and denial raises.
- A raise can filter the opponent's range and change later decision quality.
- The value of raising differs by hand class; strong low-urgency hands may still call.
- The call/fold response to a flop three-bet should reflect the actual aggression branch, not the original c-bet branch.

# Project Interpretation Boundaries

Accepted as mechanism:

- infer flop response from preflop 3-bet shape and c-bet width;
- use small raises to exploit response elasticity when evidenced;
- build raises from bluff, value, denial and future-play functions;
- separate the overfolding c-bet branch from the potentially value-heavy three-bet branch;
- treat “transparency” as response filtering, not an independent EV-free objective.

Retained only as pool hypotheses:

- 3-bettors broadly c-bet too much and overfold to small IP raises;
- flop three-bets in this node are broadly underbluffed;
- extremely high click-back frequencies are appropriate for target live games;
- unfamiliarity alone guarantees profitability.

# Cross-Source Hooks

- `STRONGLY CONFIRMS H-W02-004`: small wide bets support broader raises.
- `CONFIRMS H-W02-005`: vulnerable made hands can gain denial-raise incentive.
- `STRONGLY EXTENDS H-W03-006`: small raises magnify defence-elasticity requirements.
- `STRONGLY CONFIRMS H-W03-004`: attack the c-bet branch and respect the stronger three-bet branch.
- `CONFIRMS H-W03-001`: preflop 3-bet shape controls postflop response.
- `CONFIRMS H-W02-007`: the exploit is node-specific.
- `EXTENDS H-R05-002`: active defence includes small merged in-position raises.
- `SUPPORTS LCM-05`, `LCM-07` and `LCM-10`.

# Uncertainties Requiring Visual Review

- exact preflop positions, ranges and effective stack;
- exact boards and suits;
- exact c-bet and raise sizes;
- exact solver raise/fold/three-bet frequencies;
- exact node-lock cells and EV gains;
- exact thin-value and denial hand classes.

# Source Verdict

`CINJ_E09_AUDIO_COMPLETE`

`IP_SMALL_RAISE_THREE_BET_POT_MECHANISM_ACCEPTED`

`POOL_OVERFOLD_AND_UNDER_THREE_BET_MAGNITUDE_FIELD_VALIDATION_PENDING`
