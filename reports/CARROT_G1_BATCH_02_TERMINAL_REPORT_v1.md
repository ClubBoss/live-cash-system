# Carrot Grade 1 Batch 02 — Terminal Report v1

Date: 2026-08-05  
Status: `BATCH_COMPLETE / GRADE_1_PARTIAL`

## Input

- archive: `transcripts_mlx_large_v3(7).zip`;
- SHA-256: `c4aed76cd6beb0317bcab87083e43bdf265b478caf6409a391d2050e18169bd4`.

## Inventory

The archive contains:

- Lecture 01;
- Lecture 02;
- Lecture 03;
- Lecture 04;
- Grade 1 Final Exam Feedback.

Duplicate result:

- Lecture 01: byte-identical to the prior accepted package in all five formats;
- Exam Feedback: byte-identical to the prior accepted package in all five formats.

New delta:

- `CP-G1-L02` — Value Betting;
- `CP-G1-L03` — Bluffing;
- `CP-G1-L04` — Polarisation and Relative Hand Strength.

## Technical result

All three new lectures:

- contain the complete five-format bundle;
- have continuous timestamps;
- contain no catastrophic loops or repeated 12-word blocks;
- terminate coherently;
- match JSON segment text after normalisation;
- require no full rerun.

## Strategic result

The batch adds one coherent pedagogical chain:

```text
FULL TREE EV
→ VALUE OR BLUFF CATEGORY
→ URGENCY / CHECK EV
→ RANGE FAVOURABILITY
→ POLAR / CONDENSED SHAPE
→ SIZE AND HAND SELECTION
```

Strongest contributions:

- mandatory / optional / prohibited value and bluff;
- urgency and landing/finishing equity;
- denial as secondary;
- showdown value as bluff opportunity cost;
- favourable/neutral/unfavourable range worlds;
- polarisation and condensation as graded;
- relative hand strength from range filtering;
- value-driven overbet architecture;
- range advantage versus nut advantage;
- protected checking ranges.

## Candidate effect

```text
candidate count before: 34
candidate count after:  34
new general-core candidates: 0
```

The batch strengthens existing filtering, aggression, protected-passive and river-audit candidates.

## Learning effect

Strengthened learner-facing selectors:

- classify value and bluffs as mandatory / optional / prohibited;
- compare bet EV with check EV;
- separate fold frequency from equity denied;
- detect denial tunnel vision;
- detect the comfort-blanket bluff fallacy;
- reconstruct polar versus condensed ranges;
- choose fast-play versus slow-play from range shape;
- distinguish range advantage from nut advantage.

Direct drill coverage remains 30/34. The four open direct-drill gaps are unchanged.

## Coverage boundary

Grade 1 received:

- Lectures 01–04;
- Final Exam PDF;
- Exam Feedback.

Pending:

- Lectures 05–10;
- any missing Grade 1 supplements;
- Grades 2–3.

The exam and feedback do not replace missing lectures.

## Updated authorities

- `sources/carrot-poker/source-registry.md`;
- `sources/carrot-poker/source-gap-ledger.md`;
- `analysis/module-audits/CARROT_G1_BATCH_02_QA_v1.md`;
- `synthesis/CARROT_EVIDENCE_MATRIX_v0_1.md`;
- `synthesis/CARROT_G1_BATCH_02_CROSS_SOURCE_DELTA_v1.md`;
- active source, synthesis, learning and root indexes.

## Terminal verdict

`CARROT_G1_BATCH_02_COMPLETE`

`LECTURES_01_TO_04_CANONICALLY_INGESTED`

`GRADE_1_L05_TO_L10_PENDING`

`NO_RERUN_REQUIRED`

`NO_NEW_CORE_CANDIDATE`

`INCREMENTAL_GRADE_1_INGESTION_READY`
