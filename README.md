# Live Cash System

Private source-of-truth for building a compact, executable and adaptive No-Limit Hold'em live-cash learning system from independent source corpora, cross-source synthesis, original drills and real-session evidence.

## Product objective

Build a general live-cash core that converts complex poker theory into a small number of reliable heuristics, decision algorithms, anchor ranges, opponent models and trained responses.

Specific games—casino $1/$3, deep $2/$5, private games, short-stack tables or straddled lineups—are deployment profiles layered on top of the general core.

## Architecture authority

Repository structure and routing:

`governance/REPOSITORY_INFORMATION_ARCHITECTURE_v1.md`

Adaptive course and progress-preservation rules:

`governance/ADAPTIVE_COURSE_ARCHITECTURE_v1.md`

New-source delta behaviour:

`synthesis/NEW_SOURCE_DELTA_INTEGRATION_PROTOCOL_v1.md`

The layout allows Carrot Poker, Cash Injection, original range work and field evidence to be added incrementally without moving existing corpora or rebuilding the learner journey.

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

## Stable repository layers

- `sources/` — source-family records, registries, audits and bounded gaps.
- `analysis/` — lesson analysis, QA, contradiction and evidence review.
- `synthesis/` — same-source and cross-source candidate mechanisms.
- `ranges/` — independently derived assumptions, validation and anchors.
- `playbook/` — compact executable rules and table-facing algorithms.
- `learning/` — adaptive route, learner state, runtime, misconceptions, diagnostics and drills.
- `profiles/` — opponent models, pool hypotheses and environment overlays.
- `fieldwork/` — session evidence and deployment feedback.
- `hands/` — raw and reviewed hand records.
- `governance/` — admission, conflict, IP and architecture rules.
- `sharky/` — source-pure transfer candidates for Sharky.
- `templates/` — reusable ingestion and review schemas.
- `operations/` — bounded recovery and processing instructions.
- `reports/` — milestone and terminal-state reports.

## Admission pipeline

```text
incoming source package
→ package QA and checksum
→ canonical source-family record
→ lesson/module analysis
→ same-source mechanism candidate
→ cross-source relation
→ consolidated heuristic
→ original drill and misconception mapping
→ adaptive learner testing
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

### Carrot Poker

Planned next source family for theory, exploit structure and cross-validation. Grades 1–3 belong inside one `sources/carrot-poker/` family and will map into existing candidates and modules before any new curriculum object is created.

### Cash Injection

- Episode 1 is canonically ingested and mapped;
- Episodes 2–10 remain pending;
- the first episode adds small-range-bet elasticity and merged-raise evidence;
- its population overfold/under-three-bet claim is stored as `CI-PH-001`, not as a general default;
- original adaptive drills and a field observation mission are active.

## Current system state

- heuristic candidates: 34;
- intended consolidated target: approximately 14–18 core rules;
- admitted final rules: 0 pending Carrot, remaining Cash Injection, drill and field validation;
- provisional compact Playbook: created as a reasoning snapshot;
- stable adaptive module graph: created;
- adaptive learner-state schema: created;
- adaptive interactive runtime: created;
- progress-preserving new-source integration protocol: created;
- opponent-model schema and initial profiles: created;
- Cash Injection pool-hypothesis register: active;
- misconception taxonomy: 30 diagnostic errors;
- initial diagnostic and original drill packs: created;
- session-review and field-evidence loop: created;
- environment-profile template: created;
- Smash/FTGU cross-source evidence matrix: complete at candidate level;
- Cash Injection evidence matrix: active at 1 of 10 episodes;
- original range layer: reserved; no source chart has been promoted to an anchor.

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

## Compression scaffolds strengthened by FTGU

### Preflop

`PRICE → RANGE → PLAYERS BEHIND → REALISATION → LINE`

### Postflop

`RANGE ADVANTAGE → URGENCY → BET SHAPE → RESPONSE SHAPE`

These structures organise existing candidates; they do not increase the final rule count.

## Current provisional decision algorithms

### Single-raised pots

`NODE → SIZE SHAPE → RANGE FILTER → CARD OWNERSHIP → COMBO JOB → RIVER PLAN`

### 3-bet pots

`PREFLOP SHAPE → BLUFF SUPPLY → FLOP BRANCH → COMPENSATION → FUTURE BLUFFS`

### Multiway pots

`NUT OWNER → SANDWICH → SHARED DEFENCE → EXPECTED AGGRESSION → BACKUP EQUITY`

### River bluff-catching

`VALUE → SIZE EXCLUSIONS → BLUFF ANCESTRY → HERO BLOCKERS → EVIDENCE`

## Current priority nodes

1. Ingest remaining Cash Injection episodes and Carrot Poker through the incremental source protocol.
2. Map new evidence into the stable adaptive module graph.
3. Consolidate overlapping candidates without losing assumptions.
4. Build independently validated preflop anchor configurations.
5. Expand original drill variants and calibrate adaptive thresholds.
6. Begin structured session evidence collection.
7. Use targeted visual review only when an exact claim can change a rule, anchor or drill.

## Status vocabulary

### Source state

- `RECEIVED`
- `AUDIO_COMPLETE`
- `NEEDS_REVIEW`
- `NEEDS_VISUAL_REVIEW`
- `SOURCE_VERIFIED`
- `REFERENCE_ONLY`
- `REJECTED`

### Analysis state

- `NOT_STARTED`
- `PARTIAL`
- `ANALYZED`
- `SYNTHESIZED`

### Candidate and product state

- `CANDIDATE`
- `VALIDATION_PENDING`
- `DRILL_READY`
- `FIELD_TEST_PENDING`
- `ADMITTED`
- `FIELD_VALIDATED`
- `REVISED`
- `REJECTED`
- `BLOCKED`

### Learner state

- `UNEXPOSED`
- `DIAGNOSED_GAP`
- `INTRODUCED`
- `FRAGILE`
- `WORKING`
- `RETAINED`
- `FIELD_TEST_PENDING`
- `FIELD_VALIDATED`
- `REPAIR_REQUIRED`
- `SCOPE_SPLIT`

## Active core artifacts

- `governance/REPOSITORY_INFORMATION_ARCHITECTURE_v1.md`
- `governance/ADAPTIVE_COURSE_ARCHITECTURE_v1.md`
- `synthesis/NEW_SOURCE_DELTA_INTEGRATION_PROTOCOL_v1.md`
- `synthesis/CROSS_SOURCE_EVIDENCE_MATRIX_v0_1.md`
- `synthesis/CASH_INJECTION_EVIDENCE_MATRIX_v0_1.md`
- `synthesis/HEURISTIC_CANDIDATE_REGISTRY_v0_1.md`
- `profiles/CASH_INJECTION_POOL_HYPOTHESES_v0_1.md`
- `learning/GENERAL_LIVE_CASH_ADAPTIVE_ROUTE_v0_2.md`
- `learning/ADAPTIVE_LEARNER_STATE_SCHEMA_v0_1.md`
- `learning/ADAPTIVE_COURSE_RUNTIME_v0_1.md`
- `learning/INITIAL_DIAGNOSTIC_v0_1.md`
- `learning/drills/INITIAL_ORIGINAL_DRILL_PACK_v0_1.md`
- `learning/drills/CASH_INJECTION_E01_ORIGINAL_DELTA_DRILLS_v0_1.md`
- `playbook/GENERAL_LIVE_CASH_PLAYBOOK_PROVISIONAL_v0_1.md`
- `sources/smash-live-cash/source-gap-ledger.md`
- `sources/ftgu/source-registry.md`
- `sources/cash-injection/source-registry.md`
- `analysis/module-audits/FTGU_CANONICAL_CORPUS_COMPLETION_QA_v1.md`
- `analysis/module-audits/CASH_INJECTION_INITIAL_BATCH_01_QA_v1.md`

The provisional Playbook remains a reasoning snapshot. The adaptive architecture is active now; final module content, exact anchors and admission decisions wait for remaining source and field validation.
