# Live Cash System — Adaptive Course Architecture v1

Status: `ACTIVE / SOURCE-EXTENSIBLE / LEARNER-ADAPTIVE`

## Purpose

Define the stable course architecture that turns source evidence into an adaptive and interactive learning system without rebuilding the curriculum whenever a new course is ingested.

The architecture separates:

1. source evidence;
2. strategic candidates;
3. teachable modules;
4. learner state;
5. runtime session selection;
6. field evidence;
7. final Playbook admission.

New sources may strengthen, simplify, narrow, split or challenge an existing mechanism. They do not automatically create a parallel curriculum.

## Stable object identifiers

The following IDs are immutable:

- source IDs, for example `SLC-M03-L27` and `FTGU-E10`;
- heuristic candidate IDs, for example `H-W03-001`;
- misconception IDs, for example `MC-019`;
- drill IDs;
- course-module IDs;
- learner-state dimension IDs.

A source correction or new course changes evidence attached to these objects. It does not silently replace their identity.

## Stable course layers

```text
source evidence
→ candidate mechanisms
→ consolidated course modules
→ adaptive runtime
→ learner state
→ field transfer
→ admission/revision
```

### Source evidence

Source-faithful and course-specific. No curriculum logic belongs here.

### Candidate mechanisms

Cross-source strategic claims with explicit confidence, assumptions and relation types.

### Consolidated course modules

Original learning objects. A module may teach one candidate or compress several related candidates.

### Adaptive runtime

Chooses the next learning action from learner state, dependencies, upcoming live needs and available evidence.

### Learner state

Stores what the learner recognises, explains, executes, retains and transfers.

### Field transfer

Real hands and session observations test whether a mechanism survives live pressure.

## Course-module contract

Every module must contain:

```text
module_id
name
purpose
prerequisites
candidate_ids
misconception_ids
trigger
compact cue
explanation
boundaries and counterexamples
diagnostic prompts
drill pool
mastery gate
retention gate
field-transfer cue
environment-sensitive branches
source-evidence links
version
status
```

The module is the stable educational unit. Source lessons are evidence, not the navigation system.

## Module classes

### Foundation

Prerequisite concepts such as effective stack, price, range, equity realisation and node identity.

### Decision mechanism

High-frequency reasoning used directly at the table.

### Exception or boundary

Prevents an otherwise useful rule from becoming overgeneralised.

### Opponent overlay

Branch-specific adjustment supported by evidence. Never replaces the baseline globally.

### Environment overlay

Rake, stack, straddle, open-size, multiway and pool adjustments.

### Field-repair module

Generated from recurring real-hand errors or confidence-calibration failures.

## Adaptivity principles

1. Diagnose before assigning sequence.
2. Teach the smallest missing prerequisite.
3. Require prediction before feedback.
4. Score action and reasoning separately.
5. Treat correct action for the wrong reason as incomplete mastery.
6. Use immediate variants for structural errors.
7. Use delayed variants for retention.
8. Increase complexity only after node recognition is stable.
9. Return to baseline when exploit evidence is insufficient.
10. Prefer a few robust anchors over broad chart memorisation.

## Runtime priority function

The next module or drill is selected by a weighted combination of:

```text
structural severity
+ prerequisite centrality
+ observed error frequency
+ confidence miscalibration
+ decay since last correct retrieval
+ relevance to upcoming game
+ field-loss potential
- recent repetition load
```

Exact weights may evolve without changing the course architecture.

## New-source integration rule

A newly ingested source can affect the course only through one of these relations:

- `CONFIRMS`
- `SIMPLIFIES`
- `EXTENDS`
- `CONTEXT_SPLIT`
- `CONFLICTS`
- `ORTHOGONAL`
- `INSUFFICIENT`

Permitted downstream effects:

- stronger or weaker confidence;
- improved explanation;
- added counterexample;
- narrower trigger;
- new environment branch;
- new drill variant;
- candidate consolidation;
- candidate revision or rejection.

Not permitted by default:

- duplicating the curriculum by source author;
- resetting learner progress;
- moving all existing files;
- replacing an established module without migration evidence;
- copying proprietary examples or charts into product material.

## Progress-preservation rule

When a candidate or module changes:

- `WORDING_ONLY`: learner state is preserved;
- `SIMPLIFIED`: learner state is preserved, with one confirmation drill;
- `EXTENDED`: existing mastery is preserved for the old scope; new branch begins as untested;
- `CONTEXT_SPLIT`: mastery is split by context and the new branch is tested;
- `REVISED`: affected mastery becomes provisional and receives a repair drill;
- `REJECTED`: dependent modules are remapped through an explicit migration record.

A new course must not erase valid progress on unchanged mechanisms.

## Interaction modes

The same module may surface as:

- diagnostic question;
- short explanation;
- forced prediction;
- multiple-choice contrast;
- hand reconstruction;
- decision-tree completion;
- timed table cue;
- confidence calibration;
- immediate counterexample;
- delayed spaced retest;
- live-session observation mission;
- post-session repair.

Content is modular; interaction is runtime-selected.

## Mastery model

A module is not mastered merely because one answer was correct.

Minimum mastery evidence:

1. correct node recognition;
2. correct action family;
3. correct reasoning;
4. appropriate confidence;
5. success on a changed variant;
6. delayed retrieval;
7. no systematic misuse in adjacent nodes.

Field validation is a later and separate state.

## What may wait for Carrot

- final consolidation from 34 candidates to approximately 14–18 core heuristics;
- final wording of contested or source-sensitive modules;
- population and exploit confidence;
- exact multiway scope;
- deep-stack and short-stack boundaries;
- final preflop anchor configurations;
- candidate admission.

## What should be built before Carrot

- stable module schema;
- learner-state schema;
- adaptive runtime;
- source-delta integration contract;
- progress-preserving version rules;
- course navigation independent of source order.

## Verdict

`ADAPTIVE_COURSE_ARCHITECTURE_V1_ACTIVE`

`NEW_SOURCES_EXTEND_EVIDENCE_WITHOUT_REBUILDING_THE_CURRICULUM`
