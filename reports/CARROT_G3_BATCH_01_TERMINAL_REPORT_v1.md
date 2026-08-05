# Carrot Grade 3 Batch 01 — Terminal Report v1

Date: 2026-08-06  
Status: `LECTURES_01_TO_02_COMPLETE / LATER_LECTURES_AND_FEEDBACK_PENDING`

## Input

- archive: `transcripts_mlx_large_v3(20260805-215511).zip`;
- SHA-256: `56a05d55cb573c4f01ad9b337f9e9534db638e78fae0d6ec95cf6d21eeb51f82`.

## Inventory

The archive contains two complete five-format lecture bundles:

- Lecture 01;
- Lecture 02.

Each includes:

- `.txt`;
- `.timestamped.txt`;
- `.srt`;
- `.vtt`;
- `.segments.json`.

No Exam Feedback or unrelated lesson bundle is present.

## Technical result

### Lecture 01

```text
title:                     Mixing: Facing Bets
duration:                  49:23.14
segments:                  696
plain-text words:          11,400
word records:              11,409
mean confidence:           0.96561
below 0.50:                147 (1.288%)
maximum intersegment gap:  1.18s
overlaps:                  0
repeated 12-word shingles: 0
```

### Lecture 02

```text
title:                     Mixing Continued: Bet / Check and Size Toolkit
duration:                  41:06.02
segments:                  545
plain-text words:          9,530
word records:              9,548
mean confidence:           0.96325
below 0.50:                114 (1.194%)
maximum intersegment gap:  1.56s
overlaps:                  0
repeated 12-word shingles: 0
```

Both plain transcripts match concatenated JSON segment text after whitespace normalisation.

No loop, format gap, timeline overlap, mixed audio or missing tail was found.

No full rerun is required.

## Canonical source IDs

Created:

- `CP-G3-L01` — Mixing: Facing Bets;
- `CP-G3-L02` — Mixing Continued: Bet / Check and Size Toolkit.

Canonical paths:

- `sources/carrot-poker/transcripts/CP_G3_L01_mixing_facing_bets.md`;
- `sources/carrot-poker/transcripts/CP_G3_L02_mixing_continued_bet_check.md`.

## Strategic contribution

Batch 01 establishes the Grade 3 execution layer:

```text
PURE-ACTION GATE
→ IDENTIFY NEAR-INDIFFERENT ACTIONS
→ DEFINE PRACTICAL ACTION / SIZE TOOLKIT
→ RANDOMISE ONLY INSIDE VALID MIXES
→ LOG EV LOSS AND REASONING ERROR
```

### Lecture 01

Strongest contributions:

- mixing is valid only when actions are near-indifferent;
- uncertainty about a node is not evidence that a mix exists;
- call/raise/fold can be represented as ordered response thresholds;
- suits, redraws and future branches can move similar hand classes across thresholds;
- turn raises are broader than obvious thick value plus flush draws;
- river repolarisation should block bet/call value while unblocking bet/fold hands;
- value beaters, bluff catchers and frail hands must be separated;
- RNG must not be used to perform a possible blunder.

### Lecture 02

Strongest contributions:

- earlier-street in-position strategies can often be simplified to check plus one size;
- a size toolkit is selected from value-region needs and investment ceilings;
- solver subtrees can measure the EV cost of simplification;
- one-size strategies can use five human-executable frequency buckets;
- river nodes may require multiple sizes because value regions have different ceilings;
- bluff capacity follows value volume and pot odds;
- runouts require re-bucketing instead of fixed absolute hand labels.

## Grade 3 exam routing

```text
G3-Q01 — directly supported by CP-G3-L01
G3-Q02 — directly supported by CP-G3-L02
G3-Q03–Q07 — partial secondary support
G3-Q08–Q10 — question-only
```

No exact Grade 3 exam answer has been inferred.

## Candidate and module effect

```text
heuristic candidates:     34 unchanged
DRILL_READY:               27 unchanged
VALIDATION_PENDING:         7 unchanged
ADMITTED:                    0 unchanged
direct candidate drills:   30/34 unchanged
```

No candidate was created, admitted, rejected or migrated.

Primary modules strengthened:

- `LCM-04`;
- `LCM-05`;
- `LCM-06`;
- `LCM-09`;
- `LCM-11`.

No readiness-state promotion was necessary at this partial-grade checkpoint.

## Original assessment effect

Created six non-duplicative source-independent families:

1. mix eligibility gate;
2. three-action threshold map;
3. repolarisation interference;
4. RNG misuse repair;
5. practical size-toolkit compression;
6. frequency buckets and value-led bluff allocation.

Count:

```text
Grade 1:             24
Grade 2:             20
Grade 3 Batch 01:     6
Total Carrot:        50
```

Source boards, hands, frequencies, solver grids and exam wording were not copied.

## Source-sensitive gaps

Still open:

- Grade 3 Lecture 03 onward;
- Grade 3 Exam Feedback;
- squeeze purification;
- exact deep OOP protected-call boundaries;
- polar preflop target folds and call branch;
- players-behind compression;
- independent live-rake preflop anchors;
- multiway shared defence and bluff construction;
- multiway delayed aggression;
- exact depth/SPR/straddle overlays;
- target-live population calibration.

The first two Grade 3 lectures close none of the four remaining direct candidate-drill gaps.

## Repository artifacts

Created:

- two canonical source records;
- `analysis/module-audits/CARROT_G3_BATCH_01_QA_v1.md`;
- `synthesis/CARROT_G3_BATCH_01_CROSS_SOURCE_DELTA_v1.md`;
- `learning/assessments/CARROT_G3_L01_L02_ORIGINAL_ASSESSMENT_BLUEPRINT_v0_1.md`;
- this terminal report.

Updated:

- Grade 3 exam competency map;
- Carrot evidence matrix;
- source registry and gap ledger;
- source, synthesis and learning indexes;
- Carrot family index;
- repository handover state.

## Highest-EV next action

Ingest Grade 3 Lecture 03 onward incrementally and attach each lesson to the precomputed `G3-Q` rows.

After the lecture corpus, ingest Grade 3 Exam Feedback and build the exact answer-key and repair crosswalk.

Do not finalise exact anchors or admit the Playbook yet.

## Terminal verdict

`CARROT_G3_BATCH_01_ACCEPTED`

`GRADE_3_LECTURES_01_TO_02_CANONICALLY_INGESTED`

`NO_RERUN_REQUIRED`

`NO_NEW_CORE_CANDIDATE`

`SIX_ORIGINAL_ASSESSMENT_FAMILIES_ADDED`

`FIFTY_TOTAL_CARROT_ASSESSMENT_FAMILIES`

`GRADE_3_LATER_LECTURES_AND_FEEDBACK_PENDING`
