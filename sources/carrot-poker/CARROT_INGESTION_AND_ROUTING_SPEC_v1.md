# Carrot Poker — Ingestion and Routing Specification v1

Status: `ACTIVE_PRE-INGESTION_SPEC`

## Purpose

Define how Grades 1–3 enter the existing Live Cash System without creating three parallel curricula or requiring later global redistribution.

## Step 1 — Package inventory

For every received archive or folder record:

```yaml
package_id:
grade_claimed:
archive_name:
sha256:
file_count:
lesson_count_estimate:
supplemental_files:
possible_duplicates:
transcript_formats:
source_media_present:
```

Do not assign final lesson IDs until the internal hierarchy is understood.

## Step 2 — Stable source IDs

Preferred prefixes:

- `CP-G1-*`;
- `CP-G2-*`;
- `CP-G3-*`.

Use the smallest stable source unit:

- module/lesson when both are explicit;
- lesson sequence when only order is explicit;
- descriptive slug only when no stable numbering exists.

Examples are illustrative only:

```text
CP-G1-M02-L04
CP-G2-L17
CP-G3-river-overbets
```

Once registered, an ID remains stable even if title wording is cleaned.

## Step 3 — Canonical source record

Every canonical record contains:

```text
source metadata
source status
editorial note
continuous source-faithful record
explicit instructor mechanisms
instructor assumptions and hedging
visual dependencies
local ASR uncertainty
possible cross-source hooks
```

Do not include final system conclusions inside the source record.

## Step 4 — Evidence classification

Each extracted claim is classified as one of:

- `MECHANISM`;
- `BOUNDARY`;
- `CONTEXT_BRANCH`;
- `POOL_HYPOTHESIS`;
- `PEDAGOGICAL_SIMPLIFICATION`;
- `EXACT_RANGE_OR_FREQUENCY`;
- `VISUAL_DEPENDENT`;
- `INSUFFICIENT`.

## Step 5 — Question routing

Before candidate mapping, assign relevant IDs from:

`synthesis/REMAINING_SOURCE_QUESTION_MATRIX_v1.md`

Examples of likely routing families:

- depth/preflop: `SQ-DEP-*`, `SQ-PF-*`;
- SRP and blinds: `SQ-SRP-*`;
- aggression: `SQ-AGG-*`;
- 3-bet pots: `SQ-3B-*`;
- multiway: `SQ-MW-*`;
- river: `SQ-RIV-*`;
- exploit/evidence: `SQ-EXP-*`;
- learning/ranges: `SQ-LRN-*`, `SQ-RNG-*`.

A lesson with no matching open question can still be valuable, but must be tested against existing candidates before creating anything new.

## Step 6 — Candidate/module matching

Use:

`synthesis/CANDIDATE_TO_MODULE_VALIDATION_WORKBENCH_v0_1.md`

For every mechanism record:

```yaml
candidate_ids: []
module_ids: []
relation:
assumptions:
changes_scope:
changes_boundary:
changes_confidence:
changes_drills:
learner_progress_effect:
```

## Step 7 — Conflict discipline

Before `CONFLICTS`, compare:

- rake;
- depth and SPR;
- positions;
- player count;
- action sizes;
- preflop ranges;
- baseline versus exploit;
- online versus live environment;
- pedagogical simplification versus exact solver output.

Possible resolutions:

- `CONFIRMS`;
- `SIMPLIFIES`;
- `EXTENDS`;
- `CONTEXT_SPLIT`;
- `GRANULARITY_DIFFERENCE`;
- `VISUAL_PENDING`;
- `REAL_CONFLICT`.

## Step 8 — Original product output

Permitted downstream outputs:

- original compact explanation;
- original contrastive drill;
- boundary or counterexample;
- adaptive module branch;
- opponent/environment hypothesis;
- independent range-work requirement.

Not permitted:

- copied charts;
- copied proprietary examples;
- author-specific chapter route;
- silent replacement of Smash/FTGU evidence;
- exact range claims without assumptions and validation.

## Grade-level processing

Grades 1–3 are processed incrementally.

A grade does not need to be fully complete before accepted lessons are mapped, provided:

- package QA is clear;
- duplicate handling is explicit;
- partial coverage is stated;
- no final source-family completion claim is made.

At grade completion, issue one grade-level synthesis delta. At all-three completion, issue one Carrot corpus completion audit.

## Mutation budget

Each batch should normally produce:

- canonical source records;
- one QA;
- registry/ledger update;
- question-matrix delta;
- affected candidate/module rows;
- targeted drills or boundaries;
- readiness update.

It should not produce a global architecture rewrite.

## Verdict

`CARROT_GRADES_1_TO_3_HAVE_A_STABLE_INGESTION_AND_ROUTING_CONTRACT`

`FUTURE_CARROT_WORK_CAN_BEGIN_WITH INVENTORY RATHER THAN ARCHITECTURE DESIGN`
