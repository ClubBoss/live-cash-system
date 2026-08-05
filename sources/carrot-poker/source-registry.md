# Carrot Poker Source Registry

Status: `ACTIVE / GRADE_1_INITIAL_BATCH_01_INGESTED`

| Source ID | Grade | Source lesson/artifact | Canonical path | QA status | Cross-source state | Notes |
|---|---:|---|---|---|---|---|
| `CP-G1-L01` | 1 | Lecture 01 — Equity and EV | `sources/carrot-poker/transcripts/CP_G1_L01_equity_and_ev.md` | AUDIO_COMPLETE / VISUALS_PENDING | MAPPED | foundational EV, realisation and action-tree protocol |
| `CP-G1-EXAM` | 1 | Final Exam PDF | `sources/carrot-poker/artifacts/CP_G1_FINAL_EXAM_SOURCE_AUDIT_v1.md` | VISUAL_ARTIFACT_ACCEPTED | ASSESSMENT_MAPPED | 13 pages, 10 competency questions, reference-only |
| `CP-G1-EXAM-FB` | 1 | Final Exam Feedback | `sources/carrot-poker/transcripts/CP_G1_EXAM_FEEDBACK.md` | AUDIO_COMPLETE / SOLVER_VISUALS_PENDING | MAPPED | solutions and Grade 1 competency recap |
| — | 2 | material pending | — | NOT_RECEIVED | NOT_MAPPED | inventory first |
| — | 3 | material pending | — | NOT_RECEIVED | NOT_MAPPED | inventory first |

## Grade 1 coverage

Received:

- Lecture 01;
- Final Exam PDF;
- Final Exam Feedback.

The feedback refers to later Grade 1 lectures, including Lecture 10. The intervening lecture records have not yet been supplied, so Grade 1 is `PARTIAL`, not complete.

The exam and feedback are supplemental sources. They do not replace Lectures 02–10 in the canonical corpus.

## Batch authorities

- QA: `analysis/module-audits/CARROT_G1_INITIAL_BATCH_01_QA_v1.md`
- Evidence: `synthesis/CARROT_EVIDENCE_MATRIX_v0_1.md`
- Delta: `synthesis/CARROT_G1_INITIAL_BATCH_01_CROSS_SOURCE_DELTA_v1.md`
- Assessment blueprint: `learning/assessments/CARROT_G1_EXAM_ORIGINAL_ASSESSMENT_BLUEPRINT_v0_1.md`

## Registry rules

1. Continue assigning immutable `CP-G1-*`, `CP-G2-*`, and `CP-G3-*` IDs after inventory.
2. Detect duplicates across incremental packages before ingestion.
3. Keep exams, solutions, worksheets and charts distinct from lecture records.
4. Preserve source order only inside the source family.
5. Route cross-source effects through the Carrot evidence matrix.
6. Do not promote source charts or exact exam spots into product-facing anchors or assessments.

## Registry verdict

`CARROT_GRADE_1_INITIAL_BATCH_REGISTERED`

`GRADE_1_PARTIAL / GRADES_2_AND_3_PENDING`
