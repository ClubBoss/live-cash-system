# Carrot Grade 3 Batch 05 - Technical QA v1

Date: 2026-08-06
Status: `ACCEPTED / FINAL_LECTURE_10 / GRADE_3_LECTURE_CONTINUITY_COMPLETE`

## Package identity

The input arrived as a direct five-file set rather than a ZIP archive.

Manifest SHA-256:

`3d47884cc298e7b5732d3de77d302161c2121612c3196a13c694f0b10979f684`

File hashes:

| File | SHA-256 |
|---|---|
| `Lecture 10.segments.json` | `ea03e0daac7d19d2ac45755de2f21832329286b4ce3a880b665469098821cf8c` |
| `Lecture 10.srt` | `0c3da6ffdbfffb42fcaf8f851c1bde5bb54ec6dd9f6ff5ba0ab773203cf8333f` |
| `Lecture 10.timestamped.txt` | `65933dd3388a3b2572b961d02545548eb0ffad0107c8b60b1591043c58279551` |
| `Lecture 10.txt` | `f6c8f436fc9a5259b145bf0d123de58a9b1e263a031d7562b22328f3905aff69` |
| `Lecture 10.vtt` | `3b9bc3a3d6387659a508a7366ecf7a184c82fdc642735ef4411fbcff93c0e834` |

## Inventory

One complete transcript bundle is present:

- Lecture 10;
- `.txt`;
- `.timestamped.txt`;
- `.srt`;
- `.vtt`;
- `.segments.json`.

No earlier lecture, exam or feedback bundle is included.

## Technical metrics

| Source | Duration | Segments | Plain words | Word records | Mean confidence | Below 0.50 | Max gap | Overlaps |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Lecture 10 | 56:32.28 | 769 | 12,638 | 12,766 | 0.96120 | 191 / 1.496% | 1.24s | 0 |

Consistency checks:

- engine: `mlx-whisper`;
- model: `large-v3`;
- language: English;
- translation: false;
- plain transcript matches concatenated JSON segment text after whitespace normalisation;
- SRT has 769 entries and matches JSON timing and segment text;
- VTT has 769 entries and matches JSON timing and segment text;
- timestamped text has 12,766 word records, matching JSON word records;
- no timeline overlap;
- no consecutive duplicate segment;
- no repeated 12-word shingle;
- no missing tail;
- logical spoken ending is present.

## Continuity result

The recording begins by identifying itself as:

- the final lecture of Grade 3;
- the final grade of the school;
- a lecture on four-bet pots.

It ends with:

- Grade 3 revision guidance;
- exam transition;
- explicit course closure.

Therefore:

```text
Grade 3 lectures received: L01-L10
Final Exam PDF:            received and audited
Exam Feedback:             received and mapped
answer-key continuity:     complete
lecture continuity:        complete
```

## Repetition and ASR analysis

No repeated 12-word shingles were found.

Low-confidence records are sparse and locally distributed. No interval shows structural ASR collapse, looping or a missing tail.

Recurring lexical substitutions include obvious domain-form errors such as:

- `4-bit` for four-bet;
- `SBR` for SPR;
- solver-name variants;
- occasional position-name substitutions.

These do not disrupt the lecture-level mechanism. They do prevent automatic admission of exact visual claims.

## ASR and visual risk boundaries

The transcript is sufficient for mechanism-level ingestion.

Targeted source-video or solver-screen review remains required if an exact claim can change:

- a final rule or boundary;
- an original assessment answer;
- a preflop or postflop anchor;
- a contradiction decision;
- a size or SPR threshold;
- a board-family classification;
- an exact EV or frequency claim.

Exact cards, suits, boards, range matrices, solver frequencies, EV values, size menus and jam frequencies remain `VISUAL_PENDING`.

## Rerun decision

`NO_FULL_RERUN_REQUIRED`

No evidence supports re-transcribing the full lecture.

Use targeted reruns or visual review only for a material claim-driven dependency.

## QA verdict

`CARROT_G3_BATCH_05_ACCEPTED`

`FINAL_LECTURE_10_COMPLETE_IN_ALL_FIVE_FORMATS`

`NO_LOOP_OVERLAP_OR_MISSING_TAIL`

`GRADE_3_LECTURE_CONTINUITY_COMPLETE`

`NO_FULL_RERUN_REQUIRED`

`CLAIM_DRIVEN_VISUAL_REVIEW_REMAINS`
