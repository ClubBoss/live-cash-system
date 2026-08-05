# Carrot Poker Source Registry

Status: `ACTIVE / GRADES_1_AND_2_COMPLETE / GRADE_3_L01_L07_EXAM_AND_FEEDBACK_RECEIVED / L08_PLUS_PENDING`

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
| `CP-G3-L05` | Calling Bets | `sources/carrot-poker/transcripts/CP_G3_L05_calling_bets.md` | AUDIO_COMPLETE / VISUALS_PENDING | MAPPED |
| `CP-G3-L06` | Extreme Bet Sizing | `sources/carrot-poker/transcripts/CP_G3_L06_extreme_bet_sizing.md` | AUDIO_COMPLETE / VISUALS_PENDING | MAPPED |
| `CP-G3-L07` | Triple Barreling | `sources/carrot-poker/transcripts/CP_G3_L07_triple_barreling.md` | AUDIO_COMPLETE / VISUALS_PENDING | MAPPED |
| `CP-G3-EXAM` | Final Exam PDF | `sources/carrot-poker/artifacts/CP_G3_FINAL_EXAM_SOURCE_AUDIT_v1.md` | VISUAL_ARTIFACT_ACCEPTED | ASSESSMENT_MAPPED |
| `CP-G3-EXAM-FB` | Final Exam Feedback | `sources/carrot-poker/transcripts/CP_G3_EXAM_FEEDBACK.md` | AUDIO_COMPLETE / VISUALS_PENDING | ANSWER_KEY_MAPPED |
| — | Lecture 08 onward | — | NOT_RECEIVED | NOT_MAPPED |

Current Grade 3 continuity:

```text
Lectures received:       L01–L07
Later lectures:          pending; L07 explicitly announces L08
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
- exact duplicates: Lectures 01–02;
- new: Lectures 03–04 and Exam Feedback.

### Batch 03

- archive: `transcripts_mlx_large_v3 2(1).zip`;
- SHA-256: `bf46ac4ba2f0cffc6d5fa5763e9569cd4b9e7795b457203a0b244bc92820053d`;
- exact duplicates: Lectures 01–04 and Exam Feedback;
- new: Lectures 05–07.

## Grade 3 exam routing

Authority:

`synthesis/CARROT_G3_EXAM_PRELIMINARY_COMPETENCY_MAP_v0_1.md`

All `G3-Q01` through `G3-Q10` have source answer-key support.

Primary lecture matches currently available:

- `G3-Q01` → L01;
- `G3-Q02` → L02;
- `G3-Q03` → L03;
- `G3-Q04` → L04;
- `G3-Q05` → L05;
- `G3-Q06` → L06;
- `G3-Q07` → L07.

Rows `G3-Q08` through `G3-Q10` still await matching later lecture continuity.

## Active Grade 3 authorities

- Batch 03 QA: `analysis/module-audits/CARROT_G3_BATCH_03_QA_v1.md`;
- Batch 03 delta: `synthesis/CARROT_G3_BATCH_03_CROSS_SOURCE_DELTA_v1.md`;
- current evidence matrix: `synthesis/CARROT_EVIDENCE_MATRIX_v0_3.md`;
- L05–L07 assessments: `learning/assessments/CARROT_G3_L05_L07_ORIGINAL_ASSESSMENT_BLUEPRINT_v0_1.md`;
- latest report: `reports/CARROT_G3_BATCH_03_TERMINAL_REPORT_v1.md`.

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

`GRADE_3_L01_TO_L07_CANONICALLY_INGESTED`

`GRADE_3_EXAM_AND_FEEDBACK_MAPPED`

`GRADE_3_ANSWER_KEY_CONTINUITY_COMPLETE`

`GRADE_3_L08_PLUS_PENDING`
