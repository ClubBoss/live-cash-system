# Carrot Grade 2 Final Exam Intake — Terminal Report v1

Date: 2026-08-05  
Status: `EXAM_ARTIFACT_COMPLETE / FEEDBACK_PENDING`

## Inputs

### Transcript archive

- file: `transcripts_mlx_large_v3(20260805-191223).zip`;
- SHA-256: `58cae6b4bab467901203406d7261026ffee89b19b4f667f9479257cc6599575b`.

This SHA-256 exactly matches the already accepted Grade 2 lecture-corpus archive.

Result:

- no new transcript material;
- no repeated canonical ingestion;
- no lecture replacement;
- no transcript rerun.

### Final Exam PDF

- file: `Grade 2 - Exam.pdf`;
- source ID: `CP-G2-EXAM`;
- pages: `12`;
- PDF SHA-256: `49f5337fb5807698b412d35ed0c72355c3901bfaca7c01c72a580af9d61a3fd5`.

## Visual QA

All pages were rendered and inspected.

```text
page 1: cover
page 2: guidance
pages 3–12: ten exam questions
```

Cards, suits, action histories and solver-input panels are visually readable. Parsed text is not used as authority for exact suits or action geometry.

No PDF repair or OCR rerun is required.

## Exam competencies

The ten questions test:

1. turn-dependent frequency and sizing;
2. turn probe construction and negative-EV betting;
3. mandatory betting and pot-odds norm adjustment;
4. value tiers and size selection;
5. OOP slow-play and bluff selection;
6. urgency, Tier 3 hands and positive check EV;
7. robustness/frailness thresholds;
8. triple-barrel bluff-catching and bluff-raising;
9. 3-bet-pot flop frequency and sizing;
10. postflop raising and mixed actions.

## Assessment effect

The exam validates the existing Grade 2 twenty-family original assessment blueprint.

Created:

- source audit: `sources/carrot-poker/artifacts/CP_G2_FINAL_EXAM_SOURCE_AUDIT_v1.md`;
- coverage crosswalk: `synthesis/CARROT_G2_EXAM_ASSESSMENT_COVERAGE_DELTA_v1.md`;
- original runtime protocol: `learning/assessments/CARROT_G2_EXAM_ORIGINAL_RUNTIME_PROTOCOL_v0_1.md`.

No new assessment family was required.

```text
Grade 1 original families: 24
Grade 2 original families: 20
Total Carrot original families: 44
```

## Strategic effect

No new strategic mechanism, candidate, slot or module is required.

```text
candidate count:       34
DRILL_READY:           27
VALIDATION_PENDING:     7
ADMITTED:                0
direct drill coverage: 30/34
```

The exam strengthens confidence that Grade 2's learner-facing coverage matches the source's intended competency profile.

## Source-purity result

The exam remains private and reference-only.

The product will not copy:

- exact boards;
- exact hands;
- exact suits;
- solver menus;
- source wording;
- page design.

## Remaining Grade 2 continuity

Received:

- Lectures 01–10;
- Final Exam PDF.

Pending:

- Exam Feedback;
- unknown supplements, if any.

Grade 2 lecture and question continuity are complete. Grade 2 source answer-key continuity remains partial.

## Highest-EV next action

Accept either:

1. Grade 2 Exam Feedback;
2. Grade 3 package.

Do not finalise exact anchors, multiway guidance or Playbook admission yet.

## Terminal verdict

`GRADE_2_FINAL_EXAM_RECEIVED_AND_AUDITED`

`GRADE_2_LECTURES_AND_EXAM_QUESTIONS_COMPLETE`

`GRADE_2_EXAM_FEEDBACK_PENDING`

`TRANSCRIPT_ARCHIVE_WAS_EXACT_DUPLICATE`

`NO_RERUN_REQUIRED`

`NO_NEW_CORE_CANDIDATE`

`NO_ASSESSMENT_COUNT_INCREASE`

`GRADE_2_EXAM_MODE_READY`
