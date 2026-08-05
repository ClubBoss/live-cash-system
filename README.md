# Live Cash System

Private source-of-truth for building a compact, executable and adaptive No-Limit Hold'em live-cash learning system from independent source corpora, cross-source synthesis, original drills and real-session evidence.

## Product objective

Build a general live-cash core that converts complex poker theory into a small number of reliable heuristics, decision algorithms, anchor ranges, opponent models and trained responses.

Specific games—casino $1/$3, deep $2/$5, private games, short-stack tables or straddled lineups—are deployment profiles layered on top of the general core.

## Architecture authorities

Repository structure:

`governance/REPOSITORY_INFORMATION_ARCHITECTURE_v1.md`

Adaptive course and progress preservation:

`governance/ADAPTIVE_COURSE_ARCHITECTURE_v1.md`

Pre-finalisation freeze and mutation rules:

`governance/PRE_FINALIZATION_FREEZE_AND_MUTATION_POLICY_v1.md`

New-source delta behaviour:

`synthesis/NEW_SOURCE_DELTA_INTEGRATION_PROTOCOL_v1.md`

Remaining-source routing:

`synthesis/REMAINING_SOURCE_QUESTION_MATRIX_v1.md`

The layout allows remaining Cash Injection, Carrot Poker, original range work and field evidence to be added incrementally without moving existing corpora or rebuilding the learner journey.

## Operating principles

1. Sources remain source-faithful and independent.
2. Analysis is separate from source extraction.
3. Cross-source relations are explicit rather than silently blended.
4. The final product is one executable system, not parallel course summaries.
5. General live-cash mechanisms precede local environment overlays.
6. Simplifications retain assumptions, boundaries and failure modes.
7. Correct actions for wrong reasons still trigger learning repair.
8. Evidence can confirm, narrow, split, revise or reject a candidate.
9. Product-facing language, examples, drills and ranges are original.
10. Learner progress is tracked by mechanism, reasoning, retention and field transfer—not by watched lessons.
11. New sources extend evidence and branches before creating new modules.
12. Population claims remain hypotheses until independent or field evidence validates their scope.
13. Exact charts and frequencies live outside the heuristic count and require explicit assumptions.
14. Future batches close explicit question IDs rather than recreating global synthesis.

## Stable repository layers

- `sources/` — source-family records, registries, audits and bounded gaps.
- `analysis/` — lesson analysis, QA, contradiction and system audits.
- `synthesis/` — candidate mechanisms, evidence matrices, open questions and consolidation workbenches.
- `ranges/` — independently derived assumptions, validation and anchors.
- `playbook/` — compact executable rules and table-facing algorithms.
- `learning/` — adaptive route, learner state, runtime, readiness, misconceptions, diagnostics and drills.
- `profiles/` — opponent models, pool hypotheses and environment overlays.
- `fieldwork/` — session evidence and deployment feedback.
- `hands/` — raw and reviewed hand records.
- `governance/` — admission, conflict, IP, architecture and freeze rules.
- `sharky/` — source-pure transfer candidates for Sharky.
- `templates/` — reusable ingestion and review schemas.
- `operations/` — bounded recovery and processing instructions.
- `reports/` — milestone and terminal-state reports.

## Admission pipeline

```text
incoming source package
→ package QA and checksum
→ canonical source-family record
→ route to open question IDs
→ candidate relation
→ adaptive module delta
→ original drill/boundary/overlay delta
→ learner testing
→ provisional Playbook
→ field evidence
→ admission, revision or rejection
```

## Current source state

### Smash Live Cash

- all catalogued lessons have canonical source records;
- targeted Whisper reruns and direct-media checks are complete;
- no audio or lesson-level cleanup blockers remain;
- only claim-driven visual review remains for exact cards, sizes, frequencies, EV and chart boundaries;
- synthesis Waves 01–03 and rerun deltas are complete at candidate level.

### From the Ground Up

- all 30 episodes have canonical source-faithful records;
- all 30 episodes are mapped into the cross-source evidence system;
- no full-lesson audio rerun or ingestion blocker remains;
- exact source visuals remain claim-driven only;
- the hand-chart PDF remains reference-only and has not been promoted into the original anchor layer.

### Cash Injection

- Episode 1 is canonically ingested and mapped;
- Episodes 2–10 remain pending;
- Episode 1 adds small-range-bet elasticity and merged-raise evidence;
- its population overfold/under-three-bet claim is stored as `CI-PH-001`, not as a general default;
- original adaptive drills and a field observation mission are active.

### Carrot Poker

- one unified source family for Grades 1–3 is scaffolded;
- registry, intake ledger and routing specification are ready;
- exact lesson IDs will be assigned after package inventory;
- no Carrot source material has yet been canonically ingested.

## Current system state

- heuristic candidates: 34;
- stable adaptive modules: 11;
- misconception classes: 30;
- intended consolidated target: approximately 14–18 core rules;
- admitted final rules: 0 pending remaining sources, drills and field validation;
- all 34 candidates have stable module ownership;
- all remaining strategic dependencies have explicit source-question IDs;
- all 11 modules have dimensional readiness status;
- candidate consolidation has nine precomputed lanes;
- direct-drill gaps are explicitly queued;
- adaptive learner-state and runtime specifications are active;
- progress-preserving source integration is active;
- original range layer is reserved; no source chart has been promoted to an anchor.

## Adaptive course model

Stable module graph:

```text
NODE + DEPTH
→ PREFLOP RANGE SHAPE
→ BLIND IDENTITY + REALISATION
→ ACTION FILTERING + OWNERSHIP
→ BET SHAPE + RESPONSE SHAPE
→ AGGRESSION + FUTURE JOBS
→ 3-BET POT ANCESTRY
→ MULTIWAY
→ RIVER AUDIT
→ OPPONENT / ENVIRONMENT OVERLAYS
→ FIELD TRANSFER
```

This is a dependency graph, not a fixed playlist. The runtime chooses the next interaction from learner state, prerequisite centrality, misconception severity, confidence error, retention decay and relevance to the upcoming game.

New sources may confirm, simplify, extend or split a module. Valid learner progress is preserved unless the actual mechanism is revised.

## Compression scaffolds

### Preflop

`PRICE → RANGE → PLAYERS BEHIND → REALISATION → LINE`

### Postflop

`RANGE ADVANTAGE → URGENCY → BET SHAPE → RESPONSE SHAPE`

### Range accounting

`SOURCE RANGE → ACTION FILTER → CURRENT OWNERSHIP → COMBO JOB`

### River

`VALUE → SIZE EXCLUSIONS → BLUFF ANCESTRY → HERO BLOCKERS → EVIDENCE`

These structures organise candidates; they do not automatically increase the final rule count.

## Precomputed completion interfaces

### Remaining-source questions

`synthesis/REMAINING_SOURCE_QUESTION_MATRIX_v1.md`

Defines the exact questions future Cash Injection and Carrot material should close, refine or context-split.

### Candidate-to-module workbench

`synthesis/CANDIDATE_TO_MODULE_VALIDATION_WORKBENCH_v0_1.md`

Defines module ownership, drill coverage, consolidation roles and targeted mutation for all 34 candidates.

### Module readiness

`learning/ADAPTIVE_MODULE_READINESS_MANIFEST_v0_1.md`

Separates mechanism, explanation, boundaries, drills, anchors, overlays and field readiness for all 11 modules.

### Batch routing

`templates/SOURCE_BATCH_DELTA_ROUTING_TEMPLATE_v1.md`

Ensures every future batch is processed as a bounded evidence transaction.

## Current priority sequence

1. Ingest remaining Cash Injection episodes through the existing family contract.
2. Inventory and ingest Carrot Grades 1–3 through the unified scaffold.
3. Route every extracted mechanism to question/candidate/module IDs.
4. Update only affected readiness dimensions and drill gaps.
5. Close consolidation lanes after source questions settle.
6. Build independently validated preflop anchors.
7. Run learner diagnostic and adaptive drills.
8. Begin structured session evidence collection.
9. Promote only after misuse-resistant drills and field gates.

## Active core artifacts

### Governance

- `governance/REPOSITORY_INFORMATION_ARCHITECTURE_v1.md`
- `governance/ADAPTIVE_COURSE_ARCHITECTURE_v1.md`
- `governance/PRE_FINALIZATION_FREEZE_AND_MUTATION_POLICY_v1.md`

### Synthesis

- `synthesis/README.md`
- `synthesis/NEW_SOURCE_DELTA_INTEGRATION_PROTOCOL_v1.md`
- `synthesis/REMAINING_SOURCE_QUESTION_MATRIX_v1.md`
- `synthesis/CANDIDATE_TO_MODULE_VALIDATION_WORKBENCH_v0_1.md`
- `synthesis/CROSS_SOURCE_EVIDENCE_MATRIX_v0_1.md`
- `synthesis/CASH_INJECTION_EVIDENCE_MATRIX_v0_1.md`
- `synthesis/HEURISTIC_CANDIDATE_REGISTRY_v0_1.md`

### Learning

- `learning/README.md`
- `learning/GENERAL_LIVE_CASH_ADAPTIVE_ROUTE_v0_2.md`
- `learning/ADAPTIVE_LEARNER_STATE_SCHEMA_v0_1.md`
- `learning/ADAPTIVE_COURSE_RUNTIME_v0_1.md`
- `learning/ADAPTIVE_MODULE_READINESS_MANIFEST_v0_1.md`
- `learning/MISCONCEPTION_TAXONOMY_v0_1.md`
- `learning/INITIAL_DIAGNOSTIC_v0_1.md`
- `learning/drills/INITIAL_ORIGINAL_DRILL_PACK_v0_1.md`
- `learning/drills/CASH_INJECTION_E01_ORIGINAL_DELTA_DRILLS_v0_1.md`

### Sources and intake

- `sources/smash-live-cash/source-gap-ledger.md`
- `sources/ftgu/source-registry.md`
- `sources/cash-injection/source-registry.md`
- `sources/carrot-poker/CARROT_INGESTION_AND_ROUTING_SPEC_v1.md`
- `templates/SOURCE_BATCH_DELTA_ROUTING_TEMPLATE_v1.md`

### Audits and profiles

- `analysis/system-audits/PRE_CARROT_AND_REMAINING_INJECTION_SYSTEM_AUDIT_v1.md`
- `analysis/module-audits/FTGU_CANONICAL_CORPUS_COMPLETION_QA_v1.md`
- `analysis/module-audits/CASH_INJECTION_INITIAL_BATCH_01_QA_v1.md`
- `profiles/CASH_INJECTION_POOL_HYPOTHESES_v0_1.md`

The provisional Playbook remains a reasoning snapshot. The adaptive architecture and completion workbenches are active authorities; final module wording, exact anchors and admission decisions remain source- and field-gated.
