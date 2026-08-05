# Carrot Grade 3 Batch 04 — Terminal Report v1

Date: 2026-08-06  
Status: `LECTURES_08_TO_09_ACCEPTED / FINAL_LECTURE_10_PENDING`

## Input

- archive: `Archive(3).zip`;
- SHA-256: `b9a2a664ca0ae8696b771fd82bc1c5f51eadb573495a6eac96c25e00ff040137`;
- ZIP entries: `20`;
- substantive files: `10`;
- macOS metadata files: `10`.

## Inventory and delta

New sources:

- `CP-G3-L08` — Properly Protected Checking Ranges;
- `CP-G3-L09` — Defending in 3-Bet Pots Out of Position.

No earlier lecture, Exam or Feedback duplicate is present in this archive.

## Technical QA

| Source | Duration | Segments | Plain words | Word records | Mean confidence |
|---|---:|---:|---:|---:|---:|
| L08 | 53:24.04 | 718 | 12,264 | 12,278 | 0.96893 |
| L09 | 51:05.02 | 701 | 11,672 | 11,692 | 0.96005 |

For both sources:

- all five required formats present;
- plain text matches JSON segment text after normalisation;
- no timeline overlap;
- no consecutive duplicate segment;
- no repeated 12-word shingle;
- no missing tail;
- no catastrophic Whisper loop;
- no full rerun required.

## Lecture 08 contribution

Lecture 08 establishes a full-tree protected-check model:

```text
IMMEDIATE BETTING GAIN
versus
CHECK-BRANCH GAINS / SACRIFICES
→ NEXT-NODE RESISTANCE
→ OPPONENT-SPECIFIC ADJUSTMENT
```

Strong checks can:

- induce low-equity aggression;
- create check-raise value;
- save or realise equity against strong continuation;
- protect later checks from automatic pressure.

They can also lose immediate calls or allow free equity. The correct choice depends on full-tree EV and opponent behaviour, not one observed branch.

## Lecture 09 contribution

Lecture 09 establishes an OOP 3-bet-pot defence model:

```text
PREFLOP RANGE SHAPE
→ TEXTURE INTERSECTION
→ CALL / FOLD GEOGRAPHY
→ TIER-ONE VALUE AVAILABILITY
→ RAISE ELIGIBILITY
→ LOW-SPR TURN-JAM CONSTRUCTION
```

Its strongest contributions are:

- winning, breakeven and losing call classes;
- identical-class hand comparison;
- immediacy and live pair-draw quality;
- texture-dependent response to small range bets;
- tier-one value as a raise-range gate;
- thick-value, high-EV-bluff and selected-hybrid turn jams;
- denial as a modifier, not permission to jam the median range.

## Grade 3 exam routing

```text
G3-Q01 → L01 + Feedback
G3-Q02 → L02 + Feedback
G3-Q03 → L03 + Feedback
G3-Q04 → L04 + Feedback
G3-Q05 → L05 + Feedback
G3-Q06 → L06 + Feedback
G3-Q07 → L07 + Feedback
G3-Q08 → L08 + Feedback
G3-Q09 → L09 + Feedback
G3-Q10 → Feedback-supported; Lecture 10 pending
```

Nine of ten rows now have matching primary lecture support. All ten retain answer-key support.

## Grade 3 continuity

```text
Lectures received:      L01–L09
Lecture 10:             pending
Final Exam PDF:         received and audited
Exam Feedback:          received and mapped
Answer-key continuity:  complete
Lecture continuity:     partial
```

Lecture 09 explicitly announces Lecture 10 as the final lecture and says it will cover 4-bet-pot situations.

## Candidate and drill effect

```text
heuristic candidates:       34 unchanged
DRILL_READY:                 27 unchanged
VALIDATION_PENDING:           7 unchanged
ADMITTED:                      0 unchanged
direct candidate drills:     30/34 unchanged
```

No candidate was created, admitted, rejected or migrated.

## Learner-facing effect

Six new original assessment families were added:

- protected-check trade-off ledger;
- next-node protection sufficiency;
- solver-to-opponent checking delta;
- identical-class 3-bet-pot defends;
- tier-one raise eligibility gate;
- low-SPR turn-jam construction.

Count:

```text
Grade 1 assessment families: 24
Grade 2 assessment families: 20
Grade 3 L01–L02 families:      6
Grade 3 L03–L04 families:      7
Grade 3 L05–L07 families:      7
Grade 3 L08–L09 families:      6
Total Carrot families:        70
```

Feedback repair paths remain separate.

## Open source-sensitive gaps

- Grade 3 final Lecture 10;
- squeeze purification;
- exact deep OOP protected-call boundaries;
- polar preflop target folds;
- players-behind compression;
- independent live-rake preflop anchors;
- multiway shared defence and bluff construction;
- multiway delayed aggression;
- exact depth/SPR/straddle overlays;
- target-live population calibration.

Lecture 08 strengthens protected OOP reasoning but does not close the exact depth-specific direct-drill gap.

## Repository artifacts

Created:

- two canonical source records;
- Batch 04 technical QA;
- Batch 04 cross-source delta;
- Carrot evidence matrix v0.4;
- six-family L08–L09 assessment blueprint;
- this terminal report.

Updated:

- Grade 3 competency map;
- source registry and gap ledger;
- learning and handover authorities.

## Highest-EV next action

Receive and ingest Grade 3 Lecture 10. Attach it primarily to `G3-Q10`, compare it with the existing Feedback answer key, and determine whether Grade 3 lecture continuity can be closed.

Do not begin final rule admission solely because the Carrot lecture corpus becomes complete. Independent anchors, unresolved source gates, learner validation and field validation still remain.

## Terminal verdict

`CARROT_G3_BATCH_04_ACCEPTED`

`GRADE_3_L08_TO_L09_CANONICALLY_INGESTED`

`G3_Q01_TO_Q09_PRIMARY_LECTURE_SUPPORTED`

`GRADE_3_FINAL_LECTURE_10_PENDING`

`NO_RERUN_REQUIRED`

`NO_NEW_CORE_CANDIDATE`

`SEVENTY_TOTAL_CARROT_ASSESSMENT_FAMILIES`
