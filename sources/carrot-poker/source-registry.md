# Carrot Poker Source Registry

Status: `ACTIVE / GRADES_1_AND_2_COMPLETE / GRADE_3_L01_L04_EXAM_AND_FEEDBACK_RECEIVED / LATER_G3_LECTURES_PENDING`

## Grade 1

Received and mapped:

- `CP-G1-L01` through `CP-G1-L10`;
- `CP-G1-EXAM`;
- `CP-G1-EXAM-FB`.

Lecture, exam-question and answer-key continuity: complete.

## Grade 2

Received and mapped:

- `CP-G2-L01` through `CP-G2-L10`;
- `CP-G2-EXAM`;
- `CP-G2-EXAM-FB`.

Lecture, exam-question and answer-key continuity: complete.

## Grade 3

| Source ID | Source lesson/artifact | Canonical path | QA status | Mapping state |
|---|---|---|---|---|
| `CP-G3-L01` | Mixing: Facing Bets | `sources/carrot-poker/transcripts/CP_G3_L01_mixing_facing_bets.md` | AUDIO_COMPLETE / VISUALS_PENDING | MAPPED |
| `CP-G3-L02` | Mixing Continued: Bet / Check and Size Toolkit | `sources/carrot-poker/transcripts/CP_G3_L02_mixing_continued_bet_check.md` | AUDIO_COMPLETE / VISUALS_PENDING | MAPPED |
| `CP-G3-L03` | Common Blocker Effects | `sources/carrot-poker/transcripts/CP_G3_L03_common_blocker_effects.md` | AUDIO_COMPLETE / VISUALS_PENDING | MAPPED |
| `CP-G3-L04` | Raising and Beyond | `sources/carrot-poker/transcripts/CP_G3_L04_raising_and_beyond.md` | AUDIO_COMPLETE / VISUALS_PENDING | MAPPED |
| `CP-G3-EXAM` | Final Exam PDF | `sources/carrot-poker/artifacts/CP_G3_FINAL_EXAM_SOURCE_AUDIT_v1.md` | VISUAL_ARTIFACT_ACCEPTED | ASSESSMENT_MAPPED |
| `CP-G3-EXAM-FB` | Final Exam Feedback | `sources/carrot-poker/transcripts/CP_G3_EXAM_FEEDBACK.md` | AUDIO_COMPLETE / VISUALS_PENDING | ANSWER_KEY_MAPPED |
| — | Lecture 05 onward | — | NOT_RECEIVED | NOT_MAPPED |

Current Grade 3 continuity:

```text
Lectures received:       L01–L04
Later lectures:          pending; L04 explicitly announces L05
Final Exam PDF:          received and audited
Final Exam Feedback:     received and mapped
Exam answer-key:         complete
Lecture continuity:      partial
```

## Grade 3 package history

### Batch 01

- archive: `transcripts_mlx_large_v3(20260805-215511).zip`;
- SHA-256: `56a05d55cb573c4f01ad9b337f9e9534db638e78fae0d6ec95cf6d21eeb51f82`;
- new: Lectures 01–02.

### Batch 02

- archive: `transcripts_mlx_large_v3(20260805-221934).zip`;
- SHA-256: `e957e3b8a699ed43378099cffbc8e5b874ca97283a7935984c1ae924b5dd4d70`;
- exact duplicates: Lectures 01–02 in all ten files;
- new: Lectures 03–04 and Grade 3 Exam Feedback.

## Grade 3 exam routing

Authority:

`synthesis/CARROT_G3_EXAM_PRELIMINARY_COMPETENCY_MAP_v0_1.md`

All `G3-Q01` through `G3-Q10` now have source answer-key support.

Primary lecture matches currently available:

- `G3-Q01` → L01;
- `G3-Q02` → L02;
- `G3-Q03` → L03;
- `G3-Q04` → L04.

Rows `G3-Q08` and `G3-Q10` still lack matching primary lecture continuity even though feedback supplies their answer keys.

## Active Grade 3 authorities

- exam audit: `sources/carrot-poker/artifacts/CP_G3_FINAL_EXAM_SOURCE_AUDIT_v1.md`;
- Batch 01 QA: `analysis/module-audits/CARROT_G3_BATCH_01_QA_v1.md`;
- Batch 02 QA: `analysis/module-audits/CARROT_G3_BATCH_02_QA_v1.md`;
- Batch 01 delta: `synthesis/CARROT_G3_BATCH_01_CROSS_SOURCE_DELTA_v1.md`;
- Batch 02 delta: `synthesis/CARROT_G3_BATCH_02_CROSS_SOURCE_DELTA_v1.md`;
- current evidence matrix: `synthesis/CARROT_EVIDENCE_MATRIX_v0_2.md`;
- L01–L02 assessments: `learning/assessments/CARROT_G3_L01_L02_ORIGINAL_ASSESSMENT_BLUEPRINT_v0_1.md`;
- L03–L04 assessments: `learning/assessments/CARROT_G3_L03_L04_ORIGINAL_ASSESSMENT_BLUEPRINT_v0_1.md`;
- feedback repairs: `learning/assessments/CARROT_G3_EXAM_FEEDBACK_ORIGINAL_REPAIR_MAP_v0_1.md`.

## Registry rules

1. Continue immutable `CP-G1-*`, `CP-G2-*` and `CP-G3-*` IDs.
2. Deduplicate repeated lectures before ingestion.
3. Keep lectures, exams, feedback, worksheets and charts distinct.
4. Preserve source order only inside the source family.
5. Route cross-source effects through the active Carrot evidence matrix.
6. Do not copy charts, solver matrices or exact exam spots into learner-facing material.
7. Feedback can close answer-key continuity without closing lecture continuity.
8. Partial lecture receipt does not imply Grade completion or final rule admission.

## Registry verdict

`CARROT_GRADES_1_AND_2_COMPLETE`

`GRADE_3_L01_TO_L04_CANONICALLY_INGESTED`

`GRADE_3_EXAM_AND_FEEDBACK_MAPPED`

`GRADE_3_ANSWER_KEY_CONTINUITY_COMPLETE`

`GRADE_3_LATER_LECTURES_PENDING`
