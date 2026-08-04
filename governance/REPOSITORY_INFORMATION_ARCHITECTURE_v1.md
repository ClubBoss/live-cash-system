# Live Cash System — Repository Information Architecture v1

Status: `ACTIVE / STRUCTURE_STABLE`

## Purpose

Define a durable repository structure that can absorb additional courses, charts, field evidence, drills and product work incrementally without later moving the entire corpus.

The architecture separates five different objects that must never collapse into one another:

1. what a source actually says;
2. what an analyst concludes from it;
3. what multiple sources jointly support;
4. what the player should execute;
5. what has been tested in drills or real sessions.

## Stable top-level layers

| Layer | Purpose | May contain source wording? | May contain final recommendations? |
|---|---|---:|---:|
| `sources/` | Source-faithful records, registries, source audits and bounded gaps | Yes, with provenance | No |
| `analysis/` | Lesson analysis, QA, contradictions and evidence review | Limited quotations/paraphrases with IDs | No admission claims |
| `synthesis/` | Cross-lesson and cross-source candidate mechanisms | Independent wording | Candidate only |
| `ranges/` | Independently derived range work, assumptions, validation and compressed anchors | No proprietary chart reproduction | Only after validation state is explicit |
| `playbook/` | Compact executable rules and decision algorithms | No copied source structure | Provisional or admitted rules |
| `learning/` | Diagnostics, misconception taxonomy, drills, sequencing and spaced repetition | No proprietary exercises | Yes, in original form |
| `profiles/` | Opponent and environment overlays | No source blending | Conditional adjustments only |
| `fieldwork/` | Session observations, evidence grades and deployment feedback | No | Evidence, not universal rules |
| `hands/` | Raw hand records and reviewed-node indexes | No | Hand-specific verdicts |
| `governance/` | Admission, IP purity, conflict resolution and repository rules | No | Process rules only |
| `sharky/` | Source-pure transfer candidates for Sharky | No proprietary material | Candidate transfer objects only |
| `templates/` | Reusable ingestion, analysis, drill and review schemas | No | No |
| `operations/` | Recovery, transcription and bounded execution instructions | No | No |
| `reports/` | Milestone and terminal-state reports | Summaries only | Status reports |

These layer names are stable. New source families or product modules are added inside them rather than creating parallel top-level systems.

## Source-family contract

Every course or source family lives under:

```text
sources/<source-family>/
```

Recommended contents:

```text
README.md                    optional source overview
source-registry.md           canonical inventory
source-gap-ledger.md         only when unresolved source issues exist
transcripts/                 canonical source-faithful lesson records
visuals/                     textual visual audits; no unlicensed copied media
artifacts/                   workbook/chart manifests or bounded derived metadata
```

Current families:

- `sources/smash-live-cash/`
- `sources/ftgu/`

Future families should follow the same pattern:

- `sources/carrot-poker/`
- `sources/cash-injection/`

Adding a source family must not require moving Smash or FTGU files.

## Stable source identifiers

Every lesson receives an immutable source ID.

Examples:

- `SLC-M03-L27`
- `FTGU-E10`

Rules:

1. IDs are never reused.
2. A corrected transcript keeps the same source ID.
3. File names may become more descriptive, but references use the immutable ID.
4. Cross-source matrices and candidate registries map by ID, not by title alone.
5. Duplicate packages update QA evidence; they do not create duplicate source IDs.

## File naming

Canonical lesson record:

```text
<SOURCE>_<MODULE_OR_EPISODE>_<lesson_slug>.md
```

Examples:

```text
SLC_M03_L27_exploiting_oop_cbet_strategies_in_3bet_pots.md
FTGU_E10_merged_flop_raising.md
```

Batch QA:

```text
<SOURCE>_<BATCH>_QA_v<N>.md
```

Cross-source delta:

```text
<SOURCE>_<BATCH>_CROSS_SOURCE_DELTA.md
```

Version suffixes belong on mutable synthesis, playbook and governance artifacts. Canonical source IDs remain stable.

## Evidence lifecycle

```text
external package
→ package QA and checksum
→ source registry entry
→ canonical source-faithful record
→ lesson/module analysis
→ same-source mechanism candidate
→ cross-source relation
→ consolidated heuristic
→ original drill and misuse check
→ provisional Playbook
→ field evidence
→ admission, revision or rejection
```

A later stage may cite an earlier stage but must not rewrite it silently.

## Status separation

### Source state

- `RECEIVED`
- `AUDIO_COMPLETE`
- `NEEDS_REVIEW`
- `NEEDS_VISUAL_REVIEW`
- `SOURCE_VERIFIED`
- `REFERENCE_ONLY`
- `REJECTED`

### Analysis state

- `NOT_STARTED`
- `PARTIAL`
- `ANALYZED`
- `SYNTHESIZED`

### Candidate/product state

- `CANDIDATE`
- `VALIDATION_PENDING`
- `DRILL_READY`
- `FIELD_TEST_PENDING`
- `ADMITTED`
- `FIELD_VALIDATED`
- `REVISED`
- `REJECTED`
- `BLOCKED`

Source completeness never automatically implies strategic admission.

## Cross-source rule

Sources remain independent at the evidence layer.

A relation between two sources is recorded as:

- `CONFIRMS`
- `SIMPLIFIES`
- `EXTENDS`
- `CONTEXT_SPLIT`
- `CONFLICTS`
- `ORTHOGONAL`
- `INSUFFICIENT`

A disagreement is not resolved by averaging. First compare:

- rake;
- stack depth;
- player count;
- positions;
- preflop ranges;
- size menu;
- baseline versus exploit;
- population assumptions;
- pedagogical versus exact-solver intent.

## Range architecture

Proprietary charts remain source references only. Original range work belongs under `ranges/` and must state:

- game format and player count;
- effective stack;
- rake and cap;
- ante/straddle state;
- open/raise sizing;
- solver or independent derivation method;
- version and date;
- intended use: exact, anchor, or environment overlay.

Recommended sublayers:

```text
ranges/assumptions/
ranges/independent/
ranges/validation/
ranges/anchors/
```

No source chart is promoted to `anchors/` merely because it appears in a paid course.

## Incremental ingestion transaction

Every incoming batch is treated as a bounded transaction:

1. identify new files and duplicates;
2. verify package integrity;
3. create or update source records;
4. update the source-family registry;
5. write one batch QA artifact;
6. write one cross-source delta when strategically relevant;
7. update the global evidence matrix;
8. leave unrelated layers untouched.

This prevents a new course from triggering a repository-wide rewrite.

## Mutation rules

Default action: add evidence without moving prior files.

An existing canonical source record may be replaced only for:

- verified rerun recovery;
- direct-media correction;
- conservative ASR cleanup;
- metadata correction.

The correction must preserve the source ID and record the evidence basis.

Large-scale renames or directory moves require:

- an explicit migration report;
- old-to-new path mapping;
- reference update audit;
- evidence that the current structure materially blocks work.

Aesthetic preference alone is not sufficient.

## Product and IP boundary

The repository may store private source-faithful research records. Commercial and Sharky-facing outputs must use:

- original wording;
- original examples and drills;
- independently derived or licensed ranges;
- explicit assumptions;
- no proprietary screenshots, chart images or copied course sequencing.

## Current architecture verdict

The current layout can absorb the remaining FTGU lessons, Carrot Poker, Cash Injection, original range work and field evidence without global restructuring.

Future work should be incremental updates to registries, matrices and downstream artifacts—not a new parallel repository taxonomy.

`REPOSITORY_INFORMATION_ARCHITECTURE_V1_ACTIVE`
