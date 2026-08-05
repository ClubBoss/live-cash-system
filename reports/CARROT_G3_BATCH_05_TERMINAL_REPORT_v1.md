# Carrot Grade 3 Batch 05 - Terminal Report v1

Date: 2026-08-06
Status: `FINAL_LECTURE_10_ACCEPTED / GRADE_3_COMPLETE`

## Input

Direct five-file transcript set:

- `Lecture 10.txt`;
- `Lecture 10.timestamped.txt`;
- `Lecture 10.srt`;
- `Lecture 10.vtt`;
- `Lecture 10.segments.json`.

Manifest SHA-256:

`3d47884cc298e7b5732d3de77d302161c2121612c3196a13c694f0b10979f684`

## Inventory and delta

New source:

- `CP-G3-L10` - Four-Bet Pots.

No duplicate earlier lecture, exam or feedback material was included.

## Technical QA

| Source | Duration | Segments | Plain words | Word records | Mean confidence |
|---|---:|---:|---:|---:|---:|
| L10 | 56:32.28 | 769 | 12,638 | 12,766 | 0.96120 |

Checks passed:

- all five formats present;
- plain text matches JSON segment text after normalisation;
- SRT and VTT match JSON timing and segment text;
- timestamped word count matches JSON word records;
- no timeline overlap;
- no consecutive duplicate segment;
- no repeated 12-word shingle;
- no missing tail;
- logical ending present;
- no full rerun required.

## Lecture 10 contribution

Lecture 10 completes the four-bet-pot and low-SPR branch:

```text
FOUR-BET ANCESTRY
-> RANGE ADVANTAGE + RELATIVE POLARISATION
-> SMALL RANGE BET OR RANGE CHECK
-> TURN SIZE BY OPPONENT RANGE SHAPE
-> JAM-EXPOSURE / REOPEN GATE
-> PROTECTED CHECKING
-> CALLER DEFENCE
-> LOW-SPR JAM DECISION
```

Its strongest contributions are:

- flop strategy compression by range relation;
- range advantage separated from relative polarisation;
- turn size chosen by opponent mergedness and target indifference;
- explicit jam-exposure cost for medium-EV hands;
- hybrid-bet EV from better folds, worse calls and denial;
- protected checks at very low SPR;
- wide in-position defence against small bets;
- suppression of unnecessary reopening;
- low-board, wetness, SPR and position as jam variables.

## Grade 3 exam routing

```text
G3-Q01 -> L01 + Feedback
G3-Q02 -> L02 + Feedback
G3-Q03 -> L03 + Feedback
G3-Q04 -> L04 + Feedback
G3-Q05 -> L05 + Feedback
G3-Q06 -> L06 + Feedback
G3-Q07 -> L07 + Feedback
G3-Q08 -> L08 + Feedback
G3-Q09 -> L09 + Feedback
G3-Q10 -> L10 + Feedback
```

All ten Grade 3 exam rows now have matching primary lecture and answer-key support.

## Grade 3 continuity

```text
Lectures received:      L01-L10
Final Exam PDF:         received and audited
Exam Feedback:          received and mapped
Answer-key continuity:  complete
Lecture continuity:     complete
```

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

Four new original assessment families were added:

- four-bet-pot flop compression gate;
- turn size and jam-exposure audit;
- hybrid barrel versus protected check;
- caller defence and reopen suppression.

Count:

```text
Grade 1 assessment families: 24
Grade 2 assessment families: 20
Grade 3 L01-L02 families:      6
Grade 3 L03-L04 families:      7
Grade 3 L05-L07 families:      7
Grade 3 L08-L09 families:      6
Grade 3 L10 families:          4
Total Carrot families:        74
```

## Final-rule target correction

The numerical target `14-18` is removed.

The final rule set will be selected by:

`MINIMUM COMPLEXITY SUBJECT TO NO MATERIAL EV LOSS`

No merge or split may be made merely to reach a count. The 16 provisional slots remain editable working containers.

## Open high-value gates

- cross-corpus completeness and defect audit;
- claim-driven visual review where an exact claim can alter EV;
- squeeze purification;
- exact deep OOP protected-call boundaries;
- polar preflop target folds and call branch;
- players-behind compression;
- independent live-rake preflop anchors;
- multiway shared defence and bluff construction;
- multiway delayed aggression;
- exact depth/SPR/straddle overlays;
- target-live population calibration;
- Max-EV candidate reranking;
- learner and field validation;
- final admission.

Lecture 10 does not close preflop, exact-depth, multiway or population gates.

## Repository artifacts

Created:

- canonical `CP-G3-L10` source record;
- Batch 05 technical QA;
- Batch 05 cross-source delta;
- Carrot evidence matrix v0.5;
- four-family Lecture 10 assessment blueprint;
- adaptive readiness manifest v0.7;
- this terminal report.

Updated:

- source registry and gap ledger;
- Grade 3 competency map;
- learning index;
- bootstrap, state, atlas and root status authorities;
- agent contract for non-numeric final-rule optimisation.

## Highest-EV next action

Run a cross-corpus completeness and defect audit before final consolidation.

The audit must:

1. inventory every expected source family and artifact;
2. verify lecture, exam, feedback and supplement continuity;
3. check duplicates, missing tails, loops and suspicious ASR regions;
4. identify exact visual dependencies that can alter a high-EV boundary;
5. request targeted reruns only where the expected EV of repair is material;
6. rerank all candidates by system-wide Max-EV rather than personal discomfort or source order;
7. preserve unresolved gaps instead of fabricating closure.

## Terminal verdict

`CARROT_G3_BATCH_05_ACCEPTED`

`GRADE_3_L01_TO_L10_CANONICALLY_INGESTED`

`ALL_G3_Q01_TO_Q10_PRIMARY_LECTURE_SUPPORTED`

`GRADE_3_LECTURE_AND_ANSWER_KEY_CONTINUITY_COMPLETE`

`NO_FULL_RERUN_REQUIRED`

`TARGETED_VISUAL_REVIEW_REMAINS_CLAIM_DRIVEN`

`NO_NEW_CORE_CANDIDATE`

`SEVENTY_FOUR_TOTAL_CARROT_ASSESSMENT_FAMILIES`

`NEXT_MILESTONE_CROSS_CORPUS_AUDIT`
