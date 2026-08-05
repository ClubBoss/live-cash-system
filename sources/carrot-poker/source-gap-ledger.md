# Carrot Poker — Source Intake and Gap Ledger

Status: `ACTIVE / GRADES_1_AND_2_COMPLETE / GRADE_3_PENDING`

Last updated: 2026-08-06

## Received

### Grade 1

- `CP-G1-L01` through `CP-G1-L10`;
- `CP-G1-EXAM`;
- `CP-G1-EXAM-FB`.

Grade 1 has no known lecture, exam-question or answer-key continuity gap.

### Grade 2

- `CP-G2-L01` through `CP-G2-L10`;
- `CP-G2-EXAM` — Final Exam PDF;
- `CP-G2-EXAM-FB` — Final Exam Feedback.

Grade 2 has no known lecture, exam-question or answer-key continuity gap.

## Grade 2 Final Exam

- pages: `12`;
- competency questions: `10`;
- PDF SHA-256: `49f5337fb5807698b412d35ed0c72355c3901bfaca7c01c72a580af9d61a3fd5`;
- visual audit complete;
- exact source spots remain reference-only.

Authority:

`sources/carrot-poker/artifacts/CP_G2_FINAL_EXAM_SOURCE_AUDIT_v1.md`

## Grade 2 Exam Feedback

- archive: `Grade_2_Exam_Feedback_transcripts.zip`;
- SHA-256: `d69c728eaf41122f5b6e202fbaa83042a1831d925796c091ae5fe5d3eca00e5c`;
- five required transcript formats present;
- duration: `57:36`;
- segments: `760`;
- word records: `13,177`;
- mean confidence: `0.96346`;
- all ten answer sections present;
- no loop, overlap or missing tail;
- no full rerun required.

Authorities:

- `sources/carrot-poker/transcripts/CP_G2_EXAM_FEEDBACK.md`;
- `analysis/module-audits/CARROT_G2_EXAM_FEEDBACK_QA_v1.md`;
- `synthesis/CARROT_G2_EXAM_FEEDBACK_CROSS_SOURCE_DELTA_v1.md`;
- `learning/assessments/CARROT_G2_EXAM_FEEDBACK_ORIGINAL_REPAIR_MAP_v0_1.md`.

## Duplicate package result

The archive supplied with the Grade 2 exam PDF:

- `transcripts_mlx_large_v3(20260805-191223).zip`;
- SHA-256: `58cae6b4bab467901203406d7261026ffee89b19b4f667f9479257cc6599575b`.

It exactly matched the already accepted Grade 2 lecture-corpus archive and was not re-ingested.

## Closed Grade 2 tasks

- ten canonical lecture records;
- lecture technical QA and cross-source mapping;
- twenty original lecture-derived assessment families;
- Final Exam visual audit;
- ten-question competency map;
- exam-to-original-assessment crosswalk;
- original exam runtime protocol;
- Exam Feedback technical QA;
- ten-section answer-key mapping;
- original misconception repair map;
- Grade 2 source-continuity closure.

No Grade 2 transcript or PDF rerun is open.

## Claim-driven visual dependencies

Across Grades 1–2:

- exact PioSolver cards, frequencies and EV values;
- exact range graphs and hand matrices;
- precise bet sizes and pot geometry;
- exact mixed-strategy cells;
- exact value/bluff tier boundaries;
- exact low-dry 3-bet-pot plan implementation;
- exact postflop raise thresholds.

Visual review remains claim-driven only. It is required only when an exact visual can change a final rule, boundary, independent anchor or original answer key.

## Strategic gaps not closed by Grades 1–2

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

- Grade 3 lectures, exam, feedback and supplements;
- possible unknown Grade 1–2 worksheets, charts or supplements.

Unknown supplements do not reopen completed lecture/exam/feedback continuity unless they contain a materially distinct source artifact.

## Source-purity boundaries

- exact source examples remain reference-only;
- new packages must be deduplicated against all accepted Grade 1–2 sources;
- solver-screen values are not reconstructed from audio guesses;
- source theorem names are evidence labels, not required product terminology;
- population claims remain field-gated;
- exam questions and solutions are not copied into learner-facing assessments;
- Grade completion does not imply candidate admission or final Playbook completion.

## Next package transaction

```text
Grade 3 package
→ inventory and duplicate check
→ technical / visual QA
→ immutable source IDs
→ canonical records
→ Carrot evidence rows
→ targeted question/module/drill delta
→ handover update
```

## Ledger verdict

`CARROT_GRADE_1_COMPLETE`

`CARROT_GRADE_2_COMPLETE`

`GRADE_2_LECTURES_EXAM_AND_FEEDBACK_MAPPED`

`GRADE_3_PENDING`

`INCREMENTAL_INGESTION_READY`
