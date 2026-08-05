# General Live Cash — Adaptive Course Runtime v0.1

Status: `ACTIVE_RUNTIME_SPEC / CONTENT-MODULAR`

## Purpose

Define how the course chooses the next interaction, teaches one mechanism, diagnoses errors and preserves progress as new evidence arrives.

The runtime is independent of source order. Smash, FTGU, Carrot and Cash Injection contribute evidence; they do not define the learner's navigation.

## Runtime loop

```text
READ LEARNER STATE
→ IDENTIFY HIGHEST-VALUE GAP
→ CHECK PREREQUISITES
→ SELECT INTERACTION MODE
→ REQUIRE PREDICTION
→ CAPTURE ACTION + REASON + CONFIDENCE
→ CLASSIFY RESPONSE
→ GIVE MINIMAL FEEDBACK
→ ASSIGN VARIANT OR ADVANCE
→ SCHEDULE RETEST
→ UPDATE FIELD CUE
```

## Session types

### Diagnostic session

Purpose: locate structural gaps without teaching during the test.

Output:

- fragile modules;
- confidence errors;
- prerequisite failures;
- likely starting route.

### Teaching session

One new mechanism only.

Structure:

1. node recognition;
2. compact explanation;
3. positive example;
4. boundary/counterexample;
5. prediction;
6. feedback;
7. near-transfer drill.

### Repair session

Triggered by a misconception, not by course chapter.

Structure:

1. restate the learner's wrong model;
2. contrast it with the correct trigger;
3. test a minimally changed node;
4. test an adjacent misleading node;
5. schedule delayed retrieval.

### Retrieval session

No re-teaching before answer. Tests retained access under time pressure.

### Field-preparation session

Selects only:

- two table cues;
- one fragile mechanism;
- one environment hypothesis to observe;
- one prohibited overgeneralisation.

### Post-session review

Transforms real hands into:

- node signatures;
- candidate/misconception mappings;
- evidence grades;
- repair drills;
- environment updates.

## Next-item selection

Priority score should combine:

```text
prerequisite centrality
× structural error severity
× recurrence
× confidence mismatch
× live relevance
× decay
× expected EV impact
```

Then subtract:

```text
recent repetition
+ cognitive overload
+ unverified exact-detail dependence
```

A module blocked by an exact chart should not prevent teaching its robust mechanism.

## Interaction selection

Use the weakest dimension:

| Weak dimension | Preferred interaction |
|---|---|
| Node recognition | classify pot/positions/depth/branch |
| Explanation | why/why-not contrast |
| Action selection | forced choice with reasoning |
| Boundary control | counterexample or context switch |
| Speed | timed table cue |
| Confidence | answer plus confidence and evidence grade |
| Transfer | changed position/size/depth variant |
| Retention | delayed cold retrieval |
| Field transfer | hand reconstruction or observation mission |

## Feedback policy

Feedback must be:

- immediate for structural misconceptions;
- minimal before the learner commits to reasoning;
- specific to the failed step;
- explicit about whether the error was action, reasoning, confidence or context;
- followed by a changed variant.

Do not reward a correct action produced by a structurally wrong rule.

## Difficulty progression

### Level 0 — Recognition

Identify node, depth, players and branch.

### Level 1 — Direction

Choose check/bet/call/raise/fold family without exact frequency.

### Level 2 — Mechanism

Explain range shape, filtering, ownership or combo job.

### Level 3 — Boundary

Recognise exceptions and false analogies.

### Level 4 — Compression

Use a short table cue under time pressure.

### Level 5 — Transfer

Apply after position, size, board, depth or opponent branch changes.

### Level 6 — Field evidence

Recognise, reconstruct and review a real hand without result orientation.

A learner may advance by module rather than globally.

## Course navigation

The default dependency graph is stable:

```text
NODE + DEPTH
→ PREFLOP RANGE SHAPE
→ ACTION FILTERING
→ BET/RESPONSE SHAPE
→ MULTI-STREET PLAN
→ 3-BET POT ANCESTRY
→ MULTIWAY
→ RIVER AUDIT
→ OPPONENT OVERLAYS
→ ENVIRONMENT DEPLOYMENT
→ FIELD TRANSFER
```

This is a dependency graph, not a mandatory linear playlist.

An experienced learner can skip mastered nodes after diagnostic evidence. A later failure can reopen only the prerequisite branch involved.

## Source-delta behaviour

When Carrot or another source arrives:

- evidence matrix changes first;
- candidate confidence/wording changes second;
- module explanation, boundary or drill pool changes only if warranted;
- learner progress is migrated according to the adaptive architecture;
- course order remains stable unless a real prerequisite defect is found.

Examples:

- Carrot confirms a rule: add evidence and perhaps a better explanation; no reset.
- Carrot adds a deep-stack exception: add a depth branch; existing 100bb mastery remains.
- Carrot conflicts because rake differs: create an environment split; do not average.
- Carrot shows a candidate is misleading: revise the affected module and schedule repair only for learners exposed to that scope.

## Minimum viable interactive session

A 15–20 minute session should contain:

1. one cold retrieval;
2. one new or repaired mechanism;
3. two contrasting decisions;
4. one confidence check;
5. one delayed item scheduled;
6. one table cue.

## Runtime outputs

After every session:

```yaml
modules_updated: []
misconceptions_active: []
confidence_flags: []
retention_queue: []
next_best_module:
field_cues: []
environment_observation:
```

## Current build boundary

Ready now:

- diagnostic logic;
- reasoning/action separation;
- module-level progression;
- misconception-linked drills;
- spaced-repetition rules;
- source-delta compatibility.

Wait for Carrot before finalising:

- final 14–18-rule module map;
- final exploit confidence;
- exact range anchors;
- deep/short-stack boundaries;
- final admission status.

## Verdict

`ADAPTIVE_COURSE_RUNTIME_V0_1_ACTIVE`

`COURSE_NAVIGATION_IS_LEARNER-DRIVEN_AND_SOURCE-INDEPENDENT`
