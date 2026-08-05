# Carrot Poker - Source Intake and Gap Ledger

Status: `ACTIVE / GRADES_1_TO_3_COMPLETE / CONTINUITY_AUDIT_READY`

Last updated: 2026-08-06

## Received

### Grade 1

- `CP-G1-L01` through `CP-G1-L10`;
- `CP-G1-EXAM`;
- `CP-G1-EXAM-FB`.

No known Grade 1 continuity gap.

### Grade 2

- `CP-G2-L01` through `CP-G2-L10`;
- `CP-G2-EXAM`;
- `CP-G2-EXAM-FB`.

No known Grade 2 continuity gap.

### Grade 3

- `CP-G3-L01` through `CP-G3-L10`;
- `CP-G3-EXAM`;
- `CP-G3-EXAM-FB`.

No known Grade 3 lecture or answer-key continuity gap.

## Grade 3 Batch 05

Input:

```text
Lecture 10.txt
Lecture 10.timestamped.txt
Lecture 10.srt
Lecture 10.vtt
Lecture 10.segments.json
```

Manifest SHA-256:

`3d47884cc298e7b5732d3de77d302161c2121612c3196a13c694f0b10979f684`

Technical result:

```text
duration:             56:32.28
segments:             769
plain words:          12,638
word records:         12,766
mean confidence:      0.96120
below 0.50:           191 / 1.496%
maximum gap:          1.24s
overlaps:             0
repeated 12-grams:    0
missing tail:         no
```

All five formats agree. No full rerun is required.

Authority:

`analysis/module-audits/CARROT_G3_BATCH_05_QA_v1.md`

## Current Grade 3 continuity

```text
Lectures received:       L01-L10
Final Exam PDF:          received and audited
Exam Feedback:           received and mapped
Answer-key continuity:   complete
Lecture continuity:      complete
```

Lecture 10 identifies itself as the final Grade 3 lecture and ends with explicit course closure.

## Current exam routing

- `G3-Q01` through `G3-Q10` - matching primary lecture plus Feedback.

## Original learner delta

Four new source-independent assessment families were created for Lecture 10.

Current Carrot family count:

```text
Grade 1:          24
Grade 2:          20
Grade 3 L01-L02:   6
Grade 3 L03-L04:   7
Grade 3 L05-L07:   7
Grade 3 L08-L09:   6
Grade 3 L10:       4
Total:            74
```

## Strategic gaps still open

- squeeze purification;
- exact deep OOP protected-call boundaries;
- polar preflop target folds and call branch;
- players-behind compression;
- independent live-rake preflop anchors;
- multiway shared defence;
- multiway bluff construction;
- multiway delayed aggression;
- exact depth/SPR/straddle overlays;
- target-live population calibration.

The four direct candidate drill gaps remain `30/34` covered.

Lecture 10 supplies low-SPR four-bet-pot postflop support. It does not close exact preflop, deep OOP or multiway gaps.

## Claim-driven visual dependencies

- exact boards and suits;
- exact solver frequencies and EV values;
- exact mixed-strategy cells;
- exact size menus and numeric thresholds;
- exact source-example SPR;
- exact preflop range matrices;
- exact jam frequencies;
- exact population magnitudes.

Visual review remains claim-driven only.

## Unknown-supplement audit status

The known Carrot Grade 1-3 lecture, exam and feedback sequence is complete.

Possible unknown worksheets, charts or supplements remain an audit question rather than an assumed gap.

## Next bounded transaction

```text
cross-corpus completeness and defect audit
-> inventory expected source artifacts
-> verify duplicates and continuity
-> inspect material ASR and visual dependencies
-> request targeted reruns only where repair EV is material
-> rerank candidates by system-wide Max-EV
```

## Ledger verdict

`CARROT_GRADES_1_TO_3_RECEIVED_AND_MAPPED`

`GRADE_3_LECTURE_AND_ANSWER_KEY_CONTINUITY_COMPLETE`

`NO_FULL_RERUN_REQUIRED`

`TARGETED_VISUAL_REVIEW_REMAINS`

`CROSS_CORPUS_AUDIT_READY`
