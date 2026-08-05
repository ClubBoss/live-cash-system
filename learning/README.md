# Learning System Index

Status: `ADAPTIVE_RUNTIME_ACTIVE`

## Authorities

- Adaptive module graph: `GENERAL_LIVE_CASH_ADAPTIVE_ROUTE_v0_2.md`
- Learner-state model: `ADAPTIVE_LEARNER_STATE_SCHEMA_v0_1.md`
- Session-selection and feedback runtime: `ADAPTIVE_COURSE_RUNTIME_v0_1.md`
- Initial diagnostic: `INITIAL_DIAGNOSTIC_v0_1.md`
- General original drill pack: `drills/INITIAL_ORIGINAL_DRILL_PACK_v0_1.md`
- Cash Injection Episode 01 delta drills: `drills/CASH_INJECTION_E01_ORIGINAL_DELTA_DRILLS_v0_1.md`

## Historical snapshot

`GENERAL_LIVE_CASH_LEARNING_ROUTE_v0_1.md` is retained as the first fixed-sequence curriculum snapshot. It is not the current navigation authority.

Its useful content should be migrated incrementally into adaptive modules; the learner should not be forced through its 20-session order when diagnostic evidence supports another route.

## Navigation rule

The learner moves by prerequisite and evidence state, not by source lesson order or a fixed playlist.

```text
diagnostic
→ highest-value gap
→ prerequisite check
→ one mechanism
→ contrastive drills
→ delayed retrieval
→ field cue
```

## Source-update rule

New sources update evidence, explanations, boundaries and drill variants inside the stable module graph. They do not create parallel author-specific learning routes.

Cash Injection exploit material must preserve three layers:

```text
general mechanism
→ pool hypothesis
→ environment/field validation
```

A source claim about population behaviour does not become a default exploit solely because it is accompanied by a node lock.

## Current build boundary

Active now:

- adaptive architecture;
- module graph;
- learner state;
- interactive runtime;
- diagnostic;
- misconception-linked drills;
- progress-preserving source updates;
- source-specific exploit drills with hypothesis guards.

Pending Carrot, remaining Cash Injection episodes and field validation:

- final 14–18-rule compression;
- final submodule boundaries;
- exact preflop anchors;
- population exploit confidence;
- final mastery thresholds;
- admitted Playbook.
