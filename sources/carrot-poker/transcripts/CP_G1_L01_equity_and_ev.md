# Source Metadata

Course: Carrot Poker School  
Grade: 1  
Lecture: 1  
Title: Equity and EV  
Instructor: Peter Clarke  
Original filename: `Lecture 01.mp4`  
Source duration from transcript: `66:30.98`  
Transcription engine: `mlx-whisper`  
Model: `large-v3`  
Language: English  
Translation: disabled  
Source ID: `CP-G1-L01`  
Source status: `AUDIO_COMPLETE / LOCAL_ASR_CLEANUP_REQUIRED / SOLVER_VISUALS_NOT_SUPPLIED`

# Editorial Note

The audio is continuous from the course introduction through the homework feedback and outro. No catastrophic loop, duplicated segment or missing tail was detected.

The lesson relies on slides and PioSolver outputs for exact cards, percentages and EV values. The spoken mechanisms are clear, but exact visual claims remain source-dependent unless independently reproduced in the supplied Grade 1 exam artifact.

# Source-Faithful Record

## [00:00] Course method

Peter introduces Grade 1 as an academic, exercise-driven course. Students are asked to pause, predict and write answers before feedback. The intended learning unit is not passive viewing but explicit reasoning followed by correction.

## [01:00] Equity

Equity is defined as hypothetical pot share if the remaining hand goes to showdown. It is important but incomplete because:

- hands often fold before showdown;
- equity does not include future investments;
- equity does not capture fold equity;
- equity does not capture position or realisation;
- equity cannot by itself compare betting with checking.

A low-equity bet can be mandatory, so low current equity does not prohibit bluffing.

## [06:20] Expected value

EV is defined as the average monetary outcome of an action across the complete game tree.

Important limits:

- the objective is the highest-EV action, not merely any action with positive EV;
- a theoretical strategy does not use intentional negative-EV “loss leaders”;
- folding is the zero-EV reference from the current decision point;
- sunk money from earlier streets does not justify a new losing investment;
- skill edge and opponent mistakes can change practical EV, but they do not replace equity as a major input.

## [10:15] EV may exceed the current pot

A hand can have more than 100% of the current pot in EV because it can win the existing pot plus future money from stacks.

A strong overpair in a three-bet pot is used to show high equity converting into still higher EV through future value. A medium pocket pair is used to show the opposite: reasonable equity can convert poorly into EV when future pressure forces folds or prevents value realisation.

## [18:00] Unrealisable equity

A single-raised-pot example shows that a hand may have enough raw equity to satisfy a simple pot-odds threshold and still be a fold because:

- it is out of position;
- the opposing range is strong;
- future aggression is likely;
- pair-draw outs are not sufficiently clean;
- the hand cannot realise its hypothetical pot share.

The lesson treats realisation as the conversion rate from equity into EV.

## [25:00] End-of-action versus open-action protocol

An end-of-action spot occurs when call or fold will finish the hand, typically on the river or versus an all-in with no further players.

For end-of-action calls:

```text
required equity = call / final pot after calling
```

At this point equity is the source of EV because no future action, implied odds or realisation remains.

Open-action spots require a broader protocol:

- implied odds;
- position;
- future fold equity;
- realisation;
- later value opportunities;
- risk of folding the best hand later.

A hand may therefore call with less raw equity than a simple end-of-action formula suggests, or fold with more.

## [30:00] EV as a tree

A poker hand is framed as a tree of possible branches. The player should prioritise branches by:

- frequency;
- magnitude.

One painful or memorable runout should not dominate a decision when it is only a small twig of the tree.

## [38:00] Mixed action and indifference

A flop example with a medium-strength made hand is used to compare betting and checking.

The lesson stresses:

- a mixed solver frequency does not mean one action is better;
- indifference can hide a complex balance of pros and cons;
- betting gains value and denial in some branches;
- checking preserves bluffs, dominated hands and pot control in other branches;
- “I am targeting one hand class” is an incomplete analysis.

## [47:00] Tunnel-vision pitfall

The following thought patterns are criticised because they inspect only one branch:

- betting only to protect against a visible draw;
- betting only to get value from one hand class;
- betting because the hand has an absolute label such as “top pair”;
- betting to avoid a difficult river decision.

The corrective method is to compare the strongest available branches of both betting and checking.

## [54:00] Positive EV can still be a large error

A worked EV-tree example shows that a bluff can be profitable relative to folding but still be a serious mistake when checking earns substantially more.

This reinforces:

```text
best action comparison > plus-EV classification
```

## [57:20] Mandatory OOP bluff through urgency

An out-of-position turn-draw example shows why some bluffs become mandatory:

- the hand has no showdown value;
- it has meaningful nut potential;
- checking realises poorly out of position;
- calling a later bet may be inferior or unavailable;
- betting now may be the only efficient way to realise equity and fold equity.

The reason is not that betting is intrinsically spectacular, but that checking is too weak.

## [60:00] Summary and homework

The summary repeats:

- equity is hypothetical showdown pot share;
- EV includes all monetary branches;
- position, implied odds, fold equity and realisation separate EV from equity;
- open-action and end-of-action protocols differ;
- betting/checking must be compared as complete trees;
- out-of-position frail draws may require immediate aggression.

Homework asks the student to grade several common thought processes. The feedback rejects protection-only, one-hand-class and discomfort-avoidance reasoning as tunnel vision.

# Explicit Instructor Mechanisms

- Maximise EV, not equity, win frequency or merely positive EV.
- EV can exceed 100% of the current pot.
- Equity can convert poorly into EV because of position and realisation.
- Use the exact end-of-action formula only when future action is finished.
- Treat open-action decisions as multi-branch trees.
- Compare betting and checking rather than evaluating one action in isolation.
- Avoid absolute hand labels and one-branch “targeting”.
- Some low-equity bluffs are mandatory because checking is worse, especially OOP.

# Cross-Source Hooks

- `SIMPLIFIES LCM-03`: position changes equity realisation and future betting control.
- `SIMPLIFIES LCM-04`: actions should be evaluated as branches of a complete tree.
- `CONFIRMS H-W02-001`: the action must be justified by EV, not by hand label or one target class.
- `EXTENDS H-W02-002`: future-street jobs include realisation and urgency, not only river blockers.
- `CONFIRMS H-W02-009`: end-of-action bluff-catching is a pot-odds/equity problem after range reconstruction.
- `CONFIRMS H-R04-010`: checking can preserve profitable future branches rather than “give up value”.
- `SUPPORTS MC-008`, `MC-009`, `MC-017`, `MC-029`: discomfort raising, bluff-first construction, relative-strength river logic and frequency mimicry.

# Uncertainties Requiring Review

- exact cards and suits in solver screenshots;
- exact EV and equity values beyond the core examples;
- exact frequencies and permitted bet sizes;
- local ASR variants of PioSolver, villain, Carrot Poker School and card names.

# Source Verdict

`CP_G1_L01_AUDIO_COMPLETE`

`FOUNDATIONAL_EV_REALISATION_AND_TREE_PROTOCOL_ACCEPTED`
