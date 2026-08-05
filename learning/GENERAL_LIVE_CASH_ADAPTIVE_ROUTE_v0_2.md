# General Live Cash — Adaptive Learning Route v0.2

Status: `ACTIVE_ADAPTIVE_ROUTE / FINAL_CONTENT_PENDING_CARROT`

## Purpose

Replace the fixed lesson sequence with a stable dependency graph that can adapt to learner evidence and absorb new sources without rebuilding the curriculum.

The route is organised by decision mechanisms, not by Smash, FTGU, Carrot or any author's lesson order.

## Stable module families

| Module ID | Module family | Core question | Main dependencies |
|---|---|---|---|
| `LCM-01` | Node and effective depth | What exact game tree am I in? | none |
| `LCM-02` | Preflop range architecture | Which ranges and action families enter? | LCM-01 |
| `LCM-03` | Blind identity and realisation | How do BB, SB and cold-call ranges differ? | LCM-01, LCM-02 |
| `LCM-04` | Action filtering and ownership | What did prior action remove, preserve or strengthen? | LCM-02, LCM-03 |
| `LCM-05` | Bet shape and response shape | Is this range check, selective split or range bet—and how should defence respond? | LCM-04 |
| `LCM-06` | Aggression and future jobs | What is value, what is the size, and what do bluffs do later? | LCM-04, LCM-05 |
| `LCM-07` | 3-bet-pot ancestry | Which preflop shape created this postflop branch? | LCM-02, LCM-04, LCM-05 |
| `LCM-08` | Multiway structure | Who owns nuts, who is sandwiched, and who shares defence? | LCM-01, LCM-02, LCM-04 |
| `LCM-09` | River value/bluff/blocker audit | What value and bluffs actually reached this node? | LCM-04, LCM-06 |
| `LCM-10` | Opponent and environment overlays | What branch error is evidenced, and what remains baseline? | LCM-01–LCM-09 as relevant |
| `LCM-11` | Field transfer and repair | Can the mechanism survive time pressure and real-hand noise? | any active module |

These IDs are stable. Internal submodules may evolve after Carrot without changing the top-level course map.

## Module details

### LCM-01 — Node and effective depth

Teach and test:

- pairwise effective stack;
- stack in big-blind or straddle units;
- expected SPR;
- heads-up versus multiway;
- sandwich versus closing action;
- relevant side-pot depths.

Primary failure modes:

- planning from Hero's full stack;
- ignoring straddle denominator;
- treating multiway as one uniform effective depth.

Table cue:

`What exact confrontation and depth am I playing?`

### LCM-02 — Preflop range architecture

Teach and test:

- open, call, 3-bet, 4-bet and squeeze families;
- position, rake, price and players behind;
- polar, linear and mixed ranges;
- domination versus implied odds;
- baseline candidates before exploit expansion.

Table cue:

`Price, range, players behind, realisation, line.`

Exact anchors plug into this module later; they do not define the module.

### LCM-03 — Blind identity and realisation

Teach and test:

- BB price and closing-action advantage;
- SB squeeze risk and capped cold-calls;
- SB versus BB distinction;
- cold-caller versus blind-caller range mass;
- OOP realisation pressure.

Table cue:

`Which blind—and what range actually arrived?`

### LCM-04 — Action filtering and ownership

Teach and test:

- range contraction after bets, calls, raises and checks;
- prior reach;
- spent versus preserved strong hands;
- card ownership after filtering;
- why flop exploit cannot be copied automatically to turn.

Table cue:

`What did the last action remove?`

### LCM-05 — Bet shape and response shape

Teach and test:

```text
RANGE CHECK ↔ SELECTIVE SPLIT ↔ RANGE BET
```

and defensive responses:

```text
CALL-ONLY / PROTECTED CALL
POLAR RAISE
MERGED RAISE
TIGHT FOLDING BRANCH
```

Inputs:

- range advantage;
- nut advantage;
- urgency;
- position;
- size;
- SPR;
- protected check composition.

Table cue:

`What range shape is this size expressing?`

### LCM-06 — Aggression and future jobs

Teach and test:

- value threshold before bluff count;
- size from value/range function;
- equity, blocker and low-showdown bluff jobs;
- value, bluff and shutdown rivers;
- capped-range pressure;
- protected passive branches.

Table cue:

`Value first. What is this hand's job next?`

### LCM-07 — 3-bet-pot ancestry

Teach and test:

- polar, linear, mixed, value-heavy and over-wide preflop shapes;
- missing preflop bluffs create missing river bluffs;
- dominated high-card defence;
- compensation through postflop checking;
- strong betting branch versus weak checking branch;
- range-bet flop does not imply range-bet turn.

Table cue:

`Which hands entered preflop, and what survived?`

### LCM-08 — Multiway structure

Teach and test:

- shared defence;
- sandwich pressure;
- closing action;
- preflop nut-combo ownership;
- expected versus actual aggression;
- backup equity and removal;
- fast-play value when aggression will not arrive.

Table cue:

`Who can still wake up behind me?`

### LCM-09 — River value/bluff/blocker audit

Teach and test:

```text
VALUE
→ SIZE EXCLUSIONS
→ BLUFF ANCESTRY
→ HERO BLOCKERS
→ EVIDENCE
```

Also:

- airless versus air-rich branches;
- blocker role changes for bluff, call and value;
- size-specific value exclusion;
- correct fold for wrong reason.

Table cue:

`What reached here, and what does my card really remove?`

### LCM-10 — Opponent and environment overlays

Teach and test:

- replacing labels with branch errors;
- evidence grades and falsifiers;
- confidence decay;
- value-heavy and over-wide preflop branches;
- underbluffed and overbluffed river nodes;
- rake, open size, limp rate, straddle and stack distribution;
- baseline preservation under uncertainty.

Table cue:

`What exact error is evidenced in this exact branch?`

### LCM-11 — Field transfer and repair

Before session:

- two table cues;
- one fragile mechanism;
- one observation mission;
- one prohibited overgeneralisation.

After session:

- reconstruct node;
- separate decision from result;
- classify misconception;
- create one targeted repair;
- schedule delayed variant.

Table cue:

`Record the uncertain node, not the whole story.`

## Adaptive entry logic

### New or structurally weak learner

Start at LCM-01 and progress through prerequisites.

### Strong MTT learner moving to cash

Diagnostic may permit early skipping of basic equity concepts while prioritising:

- LCM-01 depth translation;
- LCM-03 blind identity;
- LCM-04 filtering;
- LCM-07 3-bet ancestry;
- LCM-08 multiway;
- LCM-09 river audit.

### Upcoming live session

Temporarily reweight modules by environment:

- common stack band;
- rake/time charge;
- straddle frequency;
- open and limp sizes;
- likely multiway frequency;
- known personal weak nodes.

The general core remains unchanged.

## Adaptive session algorithm

```text
1. cold retrieval from retention queue
2. highest-value active gap
3. prerequisite check
4. one explanation or repair
5. two contrasting drills
6. confidence calibration
7. one delayed retest
8. one table cue
```

## New-source behaviour

Carrot or Cash Injection may:

- strengthen evidence inside a module;
- improve explanation;
- add a boundary or environment branch;
- add a drill variant;
- split a context;
- revise a candidate.

They should not create `Carrot chapters` parallel to these modules.

## Current content state

Ready for adaptive use at mechanism level:

- all 11 module families;
- initial diagnostic;
- misconception taxonomy;
- original drill pack;
- learner-state and runtime schemas;
- Smash and FTGU evidence mapping.

Wait for Carrot/Cash Injection before freezing:

- final submodule count;
- final 14–18 core heuristic compression;
- final exploit confidence;
- multiway and deep-stack boundaries;
- exact preflop anchors;
- final graduation thresholds.

## Verdict

`GENERAL_LIVE_CASH_ADAPTIVE_ROUTE_V0_2_ACTIVE`

`STABLE_MODULE_GRAPH / ADAPTIVE_ENTRY / NEW_SOURCES_APPEND_DELTAS`
