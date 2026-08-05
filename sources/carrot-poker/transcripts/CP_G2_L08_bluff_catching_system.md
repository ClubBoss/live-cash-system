# Source Metadata

Course: Carrot Poker School  
Grade: 2  
Lecture: 08  
Descriptive title: The Bluff-Catching System  
Instructor: Peter Clarke  
Original filename: `Lecture 08.mp4`  
Source duration from transcript: `63:02.92`  
Transcription engine: `mlx-whisper`  
Model: `large-v3`  
Language: English  
Translation: disabled  
Source ID: `CP-G2-L08`  
Source status: `AUDIO_COMPLETE / SOLVER_VISUALS_PENDING`

# Source-Faithful Record

## [00:00] Bluff-catching begins with range origin

The lecture expands the previous class into a full turn-and-river bluff-catching system. The first question is not the blocker but whether the opponent’s line naturally contains enough bluffs.

The source highlights preflop origin:

- early-position ranges begin with fewer offsuit and marginal bluff candidates;
- late-position and blind ranges begin wider and preserve more natural air;
- repeated aggression from an early-position source may therefore underbluff more often in practice;
- the claim is presented as a population tendency, not an exceptionless law.

## [12:00] Origin range predicts natural bluff pressure

The lecture uses database-style reasoning to argue that humans often fail to manufacture enough bluffs in narrow-origin lines and may overbluff wider-origin lines where air arrives naturally.

This is an ancestry heuristic. The player must still account for:

- board texture;
- action filtering;
- bet size;
- opponent competence;
- whether natural misses actually remain.

## [20:00] Bluff-catcher grades

The source divides bluff catchers into rough grades based on how well they perform against the betting range.

- Grade A: strongest bluff catchers with favourable blockers or robust showdown properties.
- Grade B: ordinary bluff catchers with acceptable call EV.
- Grade C: marginal bluff catchers near the call/fold border.

Value beaters and frail hands remain separate categories. A hand can also continue because of redraws and future bluffing opportunities rather than current showdown strength alone.

## [25:00] Turn calls include future realisation

IP turn calls can benefit from:

- guaranteed river position;
- future bluff opportunities after a check;
- implied odds when improving;
- complete equity realisation;
- the ability to turn marginal hands into river bluffs.

Therefore direct pot-odds comparison is insufficient in open-action turn nodes.

## [38:00] River triple-barrel reconstruction

Against triple barrels, the lecture asks the learner to rebuild:

- value density;
- natural missed draws;
- origin range;
- prior filtering;
- size requirements;
- which hands reach river as bluffs.

The source rejects calling solely because Hero owns a “good blocker.” A blocker matters only inside a credible bluff/value construction.

## [50:00] Underbluffed, overbluffed or unclear

The closing exercise classifies different nodes as underbluffed, overbluffed or unclear by tracing the landing range. The point is to avoid global labels such as “this player bluffs too much.”

Theoretical bluff-catcher quality matters only after the branch’s bluff frequency is credible. When evidence indicates strong underbluffing, even Grade A bluff catchers can become folds.

# Explicit Instructor Mechanisms

- Bluff-catching starts with natural bluff supply and range origin.
- Early-position and heavily filtered lines require more scrutiny for underbluffing.
- Bluff catchers can be graded by robustness, blockers and threshold position.
- Turn calls include future realisation and future bluff EV.
- Triple-barrel calls require full ancestry reconstruction.
- Branch classification overrides global player labels.

# Cross-Source Hooks

- `STRONGLY CONFIRMS H-W02-007` and `H-W03-004`: exploit the exact branch and separate strong/weak action lines.
- `STRONGLY CONFIRMS H-W02-008` and `H-W02-009`: remove speculative calls against air-poor ranges and audit value, size and ancestry.
- `STRONGLY CONFIRMS H-W03-005` and `H-W03-011`: bluff supply and blockers are line-created.
- `EXTENDS H-W01-009`: origin position affects later air supply.
- Primary modules: `LCM-04`, `LCM-09`, `LCM-10`.
- Primary slots: 5, 15, 16.

# Uncertainties Requiring Visual or Field Review

- exact database frequencies and sample context;
- exact boards and bet sizes;
- exact Grade A/B/C hand examples;
- transferability of population direction to Batumi live games.

# Source Verdict

`CP_G2_L08_AUDIO_COMPLETE`

`BLUFF_CATCHING_ANCESTRY_SYSTEM_ACCEPTED`

`POPULATION_MAGNITUDE_REMAINS_FIELD_GATED`
