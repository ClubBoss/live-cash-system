# Carrot Poker — Source Intake and Gap Ledger

Status: `ACTIVE / GRADE_1_PARTIAL / LECTURES_01_TO_04_INGESTED`

Last updated: 2026-08-05

## Received

### Grade 1 lectures

- `CP-G1-L01` — Equity and EV;
- `CP-G1-L02` — Value Betting;
- `CP-G1-L03` — Bluffing;
- `CP-G1-L04` — Polarisation and Relative Hand Strength.

### Grade 1 supplemental artifacts

- `CP-G1-EXAM` — Final Exam PDF;
- `CP-G1-EXAM-FB` — Final Exam Feedback.

## Duplicate handling

In Batch 02:

- Lecture 01 repeated byte-identically in all five formats;
- Exam Feedback repeated byte-identically in all five formats.

The repeated bundles were not re-ingested.

## Pending Grade 1 source continuity

The feedback refers to lectures through Lecture 10.

Not yet received:

- Grade 1 Lectures 05–10;
- any associated lecture-specific worksheets, charts or homework files not yet supplied.

Grade 1 remains partial. The exam and feedback do not replace the missing lectures.

## Pending source sets

- remaining Grade 1 lectures and supplements;
- Grade 2;
- Grade 3.

## Closed technical tasks

### Batch 01

- L01 and Exam Feedback transcript QA;
- exam PDF visual audit;
- immutable source IDs;
- initial cross-source mapping;
- original assessment blueprint.

### Batch 02

- package inventory and checksum;
- duplicate verification;
- five-format verification for L02–L04;
- timestamp, loop and tail QA;
- canonical records for L02–L04;
- cross-source mapping.

No transcript rerun is open.

## Claim-driven visual dependencies

### Lectures 01–04 and Exam Feedback

- exact PioSolver cards, frequencies and EV values;
- exact range graphs and hand matrices;
- precise bet sizes and pot geometry;
- exact mixed-strategy cells.

### Final Exam PDF

The 13-page PDF is available and visually audited. No additional retrieval is needed for the source question slides.

## Current strategic gaps not closed by Grade 1 L01–L04

- exact depth bands;
- deep OOP protected-call boundaries;
- squeeze purification;
- polar preflop target folds;
- multiway shared defence and bluff construction;
- multiway delayed aggression;
- independently derived preflop anchors.

## Source-purity boundaries

- exam feedback may summarise later Grade 1 concepts but does not replace lecture continuity;
- exact exam and lecture examples remain reference-only;
- new packages must be deduplicated against L01–L04 and Exam Feedback;
- solver-screen values are not reconstructed from audio guesses.

## Next package transaction

```text
inventory
→ duplicate check
→ technical QA
→ immutable IDs
→ canonical records
→ Carrot evidence rows
→ targeted question/module/assessment delta
```

## Ledger verdict

`CARROT_G1_BATCH_02_COMPLETE`

`GRADE_1_LECTURES_05_TO_10_PENDING`

`GRADES_2_AND_3_PENDING`

`INCREMENTAL_INGESTION_READY`
