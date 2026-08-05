# Carrot Grade 1 Batch 03 — Terminal Report v1

Date: 2026-08-05  
Status: `BATCH_COMPLETE / GRADE_1_PARTIAL`

## Input

- archive: `transcripts_mlx_large_v3(8).zip`;
- SHA-256: `f7520f9f712564bb4c77c482962758701727a023f97c39c08cba7eae53913b6d`.

## Inventory

The archive contains:

- Lectures 01–09;
- Grade 1 Final Exam Feedback.

Duplicate result:

- Lectures 01–04 are byte-identical to the previously accepted package in all five formats;
- Exam Feedback is byte-identical to the previously accepted package in all five formats.

New delta:

- `CP-G1-L05` — Facing Bets and Calling;
- `CP-G1-L06` — Range and Nut Advantage for Flop C-Betting;
- `CP-G1-L07` — Turn Barrel Opportunities;
- `CP-G1-L08` — Float Betting the Flop;
- `CP-G1-L09` — River Textural Awareness and Range Geography.

## Technical result

All five new lectures:

- contain the complete five-format bundle;
- have continuous timestamps;
- contain no catastrophic loops or missing tails;
- terminate coherently;
- match JSON segment text after normalisation;
- require no full rerun.

Lecture 09 repeats some threshold-exercise phrasing intentionally; this is not transcript duplication.

## Strategic result

The new material adds one coherent chain:

```text
CALL PRICE + FUTURE TREE
→ FLOP RANGE / NUT ADVANTAGE
→ TURN FILTERING AND FAVOURABILITY
→ FLOAT-BET RANGE CONSTRUCTION
→ RIVER TEXTURE AND RANGE GEOGRAPHY
```

Strongest contributions:

- required pot share versus required equity;
- position, realisability, implied odds and future fold equity;
- range advantage primarily for frequency;
- nut advantage primarily for sizing;
- frequency-control-sizing fallacy;
- turn favourability as EV rather than equity;
- protected checks and float-bet linearisation;
- polar versus semi-polar betting;
- still-lake, choppy-sea and tsunami textures;
- four river range-geography landmarks.

## Candidate effect

```text
candidate count before: 34
candidate count after:  34
new general-core candidates: 0
```

The batch strengthens existing depth, filtering, aggression, protected-passive and river-audit mechanisms.

## Learning effect

Created:

`learning/assessments/CARROT_G1_L05_L09_ORIGINAL_ASSESSMENT_EXTENSION_v0_1.md`

New original assessment families:

1. required pot share versus equity;
2. position/realisability contrast;
3. frequency and size as independent outputs;
4. range advantage versus nut advantage;
5. filtered turn favourability;
6. float-bet linearisation;
7. texture class and relative strength;
8. four range-geography thresholds.

Total Grade 1 original assessment families:

```text
10 exam-derived families
+ 8 L05–L09 families
= 18
```

Exact source boards, hands, wording and solver outputs remain reference-only.

## Coverage boundary

Grade 1 received:

- Lectures 01–09;
- Final Exam PDF;
- Exam Feedback.

Pending:

- Lecture 10;
- any missing Grade 1 supplements;
- Grades 2–3.

Exam Feedback does not replace Lecture 10.

## Unchanged gates

Still open:

- squeeze purification;
- deep OOP depth-specific boundaries;
- polar preflop target folds;
- exact preflop anchors;
- multiway shared defence;
- multiway bluff construction;
- multiway delayed aggression;
- final 14–18-rule compression;
- final admission.

Direct drill coverage remains 30/34; the four source-gated drill gaps are unchanged.

## Updated authorities

- `sources/carrot-poker/source-registry.md`;
- `sources/carrot-poker/source-gap-ledger.md`;
- `analysis/module-audits/CARROT_G1_BATCH_03_QA_v1.md`;
- `synthesis/CARROT_EVIDENCE_MATRIX_v0_1.md`;
- `synthesis/CARROT_G1_BATCH_03_CROSS_SOURCE_DELTA_v1.md`;
- `learning/assessments/CARROT_G1_L05_L09_ORIGINAL_ASSESSMENT_EXTENSION_v0_1.md`;
- source, synthesis, learning and root indexes.

## Terminal verdict

`CARROT_G1_BATCH_03_COMPLETE`

`LECTURES_01_TO_09_CANONICALLY_INGESTED`

`GRADE_1_L10_PENDING`

`NO_RERUN_REQUIRED`

`NO_NEW_CORE_CANDIDATE`

`EIGHT_NEW_ORIGINAL_ASSESSMENT_FAMILIES`

`INCREMENTAL_GRADE_1_INGESTION_READY`
