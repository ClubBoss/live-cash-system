# Carrot Grade 3 Final Exam Intake — Terminal Report v1

Date: 2026-08-06  
Status: `EXAM_ARTIFACT_ACCEPTED / LECTURES_AND_FEEDBACK_PENDING`

## Input

- file: `Grade 3 - Exam.pdf`;
- source ID: `CP-G3-EXAM`;
- PDF SHA-256: `3a7c09366de76b0a9055d3391f695ef5c26b13a842fedcc6384316486cd03250`;
- pages: `12`;
- substantive questions: `10`.

## Visual QA

All pages were rendered and inspected.

```text
page 1: source cover
page 2: Grade 3 Exam cover
pages 3–12: Questions 1–10
```

Cards, suits, positions, action histories and sizing labels are readable. No clipping, corruption or missing page was found.

Parsed text is not authoritative for exact suits or action geometry. No OCR or PDF repair is required.

## Competency profile

The exam visibly assesses:

1. turn call-versus-raise selection;
2. mixed betting and sizing ceilings;
3. combo- and suit-specific bluff selection;
4. five-part check-raise range construction and turn reclassification;
5. river bluff-catching and bluff unblocking;
6. very large turn overbet architecture;
7. river overbet and showdown-value geography;
8. protected checks and high check-raise frequency in a 3-bet pot;
9. texture-dependent defence and raising in a 3-bet pot;
10. low-SPR turn strategy in a 4-bet pot.

## Scope correction

The actual Grade 3 exam is heavily weighted toward advanced postflop strategy:

- check-raising;
- overbets;
- combo-level bluff selection;
- river bluff-catching;
- 3-bet-pot and 4-bet-pot play.

Therefore the prior working expectation that Grade 3 would primarily close preflop, exact-depth and multiway gaps is no longer reliable.

The lecture corpus may still contain those topics, but the exam artifact alone does not show them.

## Strategic effect

At exam-intake stage:

```text
heuristic candidates:       34 unchanged
DRILL_READY:                 27 unchanged
VALIDATION_PENDING:           7 unchanged
ADMITTED:                      0 unchanged
direct drill coverage:       30/34 unchanged
Carrot assessment families:  44 unchanged
```

No source answer key is available yet, so the exam does not justify:

- exact action keys;
- exact frequencies or EV gaps;
- new candidate IDs;
- readiness promotion;
- final drill release;
- final rule admission.

## Repository artifacts created

- source audit: `sources/carrot-poker/artifacts/CP_G3_FINAL_EXAM_SOURCE_AUDIT_v1.md`;
- preliminary competency map: `synthesis/CARROT_G3_EXAM_PRELIMINARY_COMPETENCY_MAP_v0_1.md`;
- terminal report: `reports/CARROT_G3_EXAM_INTAKE_TERMINAL_REPORT_v1.md`.

## Source continuity

Received:

- Grade 3 Final Exam PDF.

Pending:

- Grade 3 lecture transcripts;
- Grade 3 Exam Feedback transcript;
- possible worksheets, charts or supplements.

Grade 3 is not complete.

## Highest-EV next action

Ingest the Grade 3 lecture transcripts, then map each lecture to the ten precomputed competency rows.

After the lecture pass, ingest Exam Feedback and build the answer-key and repair crosswalk.

## Terminal verdict

`CP_G3_EXAM_VISUALLY_ACCEPTED`

`GRADE_3_EXAM_QUESTIONS_RECEIVED`

`GRADE_3_LECTURES_AND_FEEDBACK_PENDING`

`ADVANCED_POSTFLOP_EMPHASIS_VISIBLE`

`NO_PDF_REPAIR_REQUIRED`

`NO_NEW_CORE_CANDIDATE`

`NO_ASSESSMENT_COUNT_INCREASE`

`GRADE_3_INCREMENTAL_LECTURE_INGESTION_READY`
