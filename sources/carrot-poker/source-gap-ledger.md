# Carrot Poker — Source Intake and Gap Ledger

Status: `ACTIVE / GRADE_1_COMPLETE / GRADE_2_LECTURE_CORPUS_COMPLETE / GRADE_2_EXAM_PENDING / GRADE_3_PENDING`

Last updated: 2026-08-05

## Received

### Grade 1

- `CP-G1-L01` through `CP-G1-L10`;
- `CP-G1-EXAM`;
- `CP-G1-EXAM-FB`.

Grade 1 has no known lecture or assessment continuity gap.

### Grade 2

- `CP-G2-L01` — Polarising and Condensing;
- `CP-G2-L02` — Bet Sizing and Value Tiers;
- `CP-G2-L03` — Fold Equity and Bluff Tiers;
- `CP-G2-L04` — River Play and Scattered Aggression;
- `CP-G2-L05` — The Out-of-Position Game;
- `CP-G2-L06` — The In-Position Game and Hybrid Betting;
- `CP-G2-L07` — Facing Bets and Range Thresholds;
- `CP-G2-L08` — The Bluff-Catching System;
- `CP-G2-L09` — Flop Strategy in 3-Bet Pots;
- `CP-G2-L10` — Postflop Raising.

Lecture 10 explicitly describes itself as the final lecture before the Grade 2 exam.

Not received:

- Grade 2 Final Exam PDF;
- Grade 2 Exam Feedback;
- any Grade 2 worksheets, charts or supplements not yet supplied.

Grade 2 lecture continuity is complete. Grade 2 assessment continuity remains partial.

## Grade 2 package QA

Input:

- `transcripts_mlx_large_v3(10).zip`;
- SHA-256: `58cae6b4bab467901203406d7261026ffee89b19b4f667f9479257cc6599575b`.

Inventory:

- `101` archive entries;
- `50` substantive transcript files;
- `51` macOS metadata entries;
- ten complete five-format lecture bundles.

Duplicate result:

- `0/50` substantive files match the same-named Grade 1 files;
- all ten Grade 2 lectures are new;
- no Grade 1 source was replaced.

Technical result:

- no full rerun required;
- no catastrophic loops;
- no missing tails;
- no material segment overlaps;
- claim-driven visual review only.

Authority:

`analysis/module-audits/CARROT_G2_LECTURE_CORPUS_QA_v1.md`

## Closed Grade 2 lecture tasks

- package inventory and checksum;
- Grade identification;
- five-format verification;
- timestamp, gap, overlap, loop and tail QA;
- canonical records `CP-G2-L01` through `CP-G2-L10`;
- cross-source mapping;
- twenty original assessment families;
- question, candidate and readiness pass.

No transcript rerun is open.

## Claim-driven visual dependencies

Across Grades 1–2:

- exact PioSolver cards, frequencies and EV values;
- exact range graphs and hand matrices;
- precise bet sizes and pot geometry;
- exact mixed-strategy cells;
- exact value/bluff tier boundaries;
- exact low-dry 3-bet-pot plan implementation;
- exact postflop raise thresholds.

Visual review remains required only when it can change:

- a final heuristic;
- an original assessment answer;
- a context split or size boundary;
- a genuine source conflict;
- an independent anchor.

## Current strategic gaps not closed by Grades 1–2

- exact effective-depth bands;
- exact deep OOP protected-call boundaries;
- squeeze purification;
- polar preflop target folds and call branch;
- players-behind compression;
- independent live-rake preflop anchors;
- multiway shared defence;
- multiway bluff construction;
- multiway delayed aggression;
- straddle overlays;
- target-live population calibration.

## Pending source sets

- Grade 2 Final Exam;
- Grade 2 Exam Feedback;
- possible Grade 2 supplements;
- Grade 3 lectures, exam, feedback and supplements;
- possible unknown Grade 1 supplements.

## Source-purity boundaries

- exact source examples remain reference-only;
- new packages must be deduplicated against all Grade 1 and Grade 2 sources;
- solver-screen values are not reconstructed from audio guesses;
- source theorem names are evidence labels, not required product terminology;
- population claims remain field-gated;
- lecture-corpus completion does not imply Grade completion, candidate admission or Playbook completion.

## Next package transaction

Preferred next intake:

```text
Grade 2 Exam / Feedback or Grade 3 package
→ inventory and duplicate check
→ technical or visual QA
→ immutable source IDs
→ canonical records
→ Carrot evidence rows
→ targeted question/module/assessment delta
→ handover update
```

## Ledger verdict

`CARROT_GRADE_1_COMPLETE`

`CARROT_GRADE_2_LECTURES_01_TO_10_COMPLETE`

`GRADE_2_EXAM_AND_FEEDBACK_PENDING`

`GRADE_3_PENDING`

`INCREMENTAL_INGESTION_READY`
