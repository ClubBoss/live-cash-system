# General Live Cash — New Source Delta Integration Protocol v1

Status: `ACTIVE / NO-GLOBAL-REBUILD DEFAULT`

## Purpose

Define how Carrot Poker, Cash Injection and future sources modify the system without recreating the curriculum, resetting learner progress or duplicating modules by author.

## Default principle

A new source contributes evidence to existing strategic objects before any new object is created.

```text
new source lesson
→ source-faithful record
→ extracted mechanism
→ candidate match search
→ relation classification
→ downstream delta
```

Do not start from `create a new course chapter`.

## Relation classification

Every source-supported mechanism receives one primary relation:

- `CONFIRMS`: materially independent support for the same mechanism;
- `SIMPLIFIES`: improves teaching or compression without changing scope;
- `EXTENDS`: adds a new branch, depth, position or application;
- `CONTEXT_SPLIT`: apparently different advice is correct under different assumptions;
- `CONFLICTS`: the same assumptions lead to incompatible recommendations;
- `ORTHOGONAL`: useful but outside current candidate scope;
- `INSUFFICIENT`: too vague or incomplete to change the system.

## Candidate matching order

Before creating a new candidate, test whether the mechanism is:

1. identical to an existing candidate;
2. a boundary or exception to an existing candidate;
3. an environment overlay;
4. an opponent-profile branch;
5. a prerequisite explanation;
6. a drill or interaction improvement;
7. a true independent mechanism.

A new candidate is created only after the first six possibilities are rejected explicitly.

## Downstream impact table

| Relation | Evidence matrix | Candidate registry | Course module | Learner progress |
|---|---|---|---|---|
| CONFIRMS | add support | confidence may rise | optional explanation/drill improvement | preserve |
| SIMPLIFIES | add relation | wording may compress | replace explanation, retain scope | preserve + light confirmation |
| EXTENDS | add new scope | add branch/dependency | append branch/variant | preserve old scope; new branch untested |
| CONTEXT_SPLIT | document assumptions | split scope | add context selector | preserve matching context; test new context |
| CONFLICTS | open conflict record | freeze promotion | no silent curriculum change | preserve, mark affected scope provisional |
| ORTHOGONAL | record separately | new object only if useful | optional new module | unaffected |
| INSUFFICIENT | record limitation | no change | no change | unaffected |

## Conflict-resolution order

Before declaring a real conflict compare:

1. game format and player count;
2. rake and cap;
3. stack depth and SPR;
4. ante/straddle state;
5. positions and action order;
6. opening and raise sizes;
7. exact preflop ranges;
8. baseline versus exploit intent;
9. population assumptions;
10. solver precision versus pedagogical simplification.

Only identical assumptions with incompatible recommendations produce `REAL_CONFLICT`.

Other resolutions:

- `CONTEXT_SPLIT`
- `WORDING_ONLY`
- `GRANULARITY_DIFFERENCE`
- `OUTDATED_ASSUMPTION`
- `OPEN_VISUAL_DEPENDENCY`

## Course mutation budget

For each incoming batch, prefer the smallest valid mutation:

1. evidence-only update;
2. explanation or counterexample update;
3. new drill variant;
4. new context branch;
5. candidate consolidation;
6. new candidate;
7. module migration;
8. architecture change.

Levels 7–8 require explicit evidence that the current structure blocks correctness or learning. Aesthetic preference is insufficient.

## Batch transaction

Each source batch should produce at most:

- canonical source records;
- one batch QA;
- one source-family registry update;
- one cross-source delta;
- targeted evidence-matrix updates;
- selective candidate/module changes.

Unrelated course modules and learner records remain untouched.

## Carrot-specific intake expectations

Carrot should primarily be used to test:

- blind play and OOP structure;
- preflop candidate boundaries;
- exploit construction;
- multiway scope;
- deep-stack and short-stack context;
- protected passive branches;
- population claims;
- simpler explanations and drills.

It should not be imported as a second linear curriculum.

## Cash Injection-specific intake expectations

Cash Injection should primarily inform:

- exploit hypotheses;
- population-sensitive branches;
- practical deviations;
- evidence thresholds;
- field observation missions;
- falsifiers and confidence decay.

Population claims remain hypotheses until environment and field evidence support them.

## Admission protection

No candidate becomes `ADMITTED` solely because several courses repeat it.

Admission still requires:

- compact executable wording;
- preserved boundaries;
- original drills;
- successful counterexamples;
- no duplication with another admitted rule;
- IP/source purity;
- acceptable field misuse risk.

## Migration record

Any actual module replacement must document:

```yaml
old_module_id:
new_module_id:
reason:
affected_candidates: []
affected_learner_dimensions: []
progress_preserved:
retest_required:
source_evidence: []
```

## Verdict

`NEW_SOURCE_DELTA_INTEGRATION_PROTOCOL_V1_ACTIVE`

`DEFAULT_BEHAVIOUR_IS_INCREMENTAL_EVIDENCE_UPDATE_NOT_CURRICULUM_REBUILD`
