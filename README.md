# Live Cash System

Private source-of-truth for building a compact, executable No-Limit Hold'em live-cash learning and decision system from independent source corpora, cross-source synthesis, original drills and real-session evidence.

## Product objective

Build a general live-cash core that converts complex poker theory into a small number of reliable heuristics, decision algorithms, anchor ranges, opponent models and trained responses.

Specific games—casino $1/$3, deep $2/$5, private games, short-stack tables or straddled lineups—are deployment profiles layered on top of the general core.

## Architecture authority

Repository structure and routing rules are defined in:

`governance/REPOSITORY_INFORMATION_ARCHITECTURE_v1.md`

The layout is designed so additional Carrot Poker, Cash Injection, original range work and field evidence can be added incrementally without moving existing corpora.

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

## Stable repository layers

- `sources/` — source-family records, registries, audits and bounded gaps.
- `analysis/` — lesson analysis, QA, contradiction and evidence review.
- `synthesis/` — same-source and cross-source candidate mechanisms.
- `ranges/` — independently derived assumptions, validation and anchors.
- `playbook/` — compact executable rules and table-facing algorithms.
- `learning/` — misconceptions, diagnostics, drills and spaced repetition.
- `profiles/` — opponent models and environment overlays.
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

Planned next source family for theory, exploit structure and cross-validation. Grades 1–3 should live inside one `sources/carrot-poker/` family.

### Cash Injection

Planned source family for exploit hypotheses and practical node adjustments.

## Current system state

- heuristic candidates: 34;
- intended consolidated target: approximately 14–18 core rules;
- admitted final rules: 0 pending Carrot/Cash Injection, drill and field validation;
- provisional compact Playbook: created;
- opponent-model schema and initial profiles: created;
- misconception taxonomy: 30 diagnostic errors;
- drill and spaced-repetition architecture: created;
- initial diagnostic and original drill pack: created;
- general learning route: created;
- session-review and field-evidence loop: created;
- environment-profile template: created;
- Smash/FTGU cross-source evidence matrix: complete at candidate level;
- original range layer: reserved; no source chart has been promoted to an anchor.

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

1. Ingest Carrot Poker and Cash Injection through the same source-family contract.
2. Consolidate overlapping Smash/FTGU candidates without losing assumptions.
3. Build independently validated preflop anchor configurations.
4. Test DRILL_READY mechanisms with original variants and delayed retests.
5. Begin structured session evidence collection.
6. Use targeted visual review only when an exact claim can change a rule, anchor or drill.

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

## Active core artifacts

- `playbook/GENERAL_LIVE_CASH_PLAYBOOK_PROVISIONAL_v0_1.md`
- `synthesis/CROSS_SOURCE_EVIDENCE_MATRIX_v0_1.md`
- `sources/smash-live-cash/source-gap-ledger.md`
- `sources/ftgu/source-registry.md`
- `analysis/module-audits/FTGU_CANONICAL_CORPUS_COMPLETION_QA_v1.md`
- `learning/GENERAL_LIVE_CASH_LEARNING_ROUTE_v0_1.md`
- `learning/INITIAL_DIAGNOSTIC_v0_1.md`
- `learning/drills/INITIAL_ORIGINAL_DRILL_PACK_v0_1.md`
- `governance/REPOSITORY_INFORMATION_ARCHITECTURE_v1.md`

The provisional Playbook is usable as a reasoning map but is not yet a final commercial or memorisation-ready strategy product.
