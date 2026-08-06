# Live Cash System - Cross-Corpus Completeness and Defect Audit v1

Date: 2026-08-06  
Status: `ACCEPTED / CATALOGUED_CORPORA_COMPLETE / ACTIVE_ROUTING_DEFECTS_REPAIRED`

## Scope

This audit is the first system-wide source and authority review after completion of:

- Smash Live Cash;
- From the Ground Up Episodes 01-30;
- Cash Injection Episodes 01-10;
- Carrot Poker Grades 1-3, including lectures, final exams and feedback.

The audit answers four different questions without collapsing them:

1. Are all catalogued source artifacts present and canonically represented?
2. Do existing QA records show a material transcript defect requiring rerun?
3. Which exact visual claims remain capable of changing strategy, drills or anchors?
4. Do active synthesis authorities reflect the completed source state?

## Audit limitation

The repository contains canonical records, registries, manifests and QA reports, not every raw audio/video package. Technical findings therefore rely on accepted package QA and manifest evidence. This audit does not pretend to re-run checks against unavailable raw bytes.

`CATALOGUED CORPUS COMPLETE` means the course sequence and artifacts known to the repository are present. It does not prove that no publisher-side worksheet, chart or supplement ever existed outside the supplied corpus.

## Source-family inventory

| Source family | Catalogued core | Continuity evidence | Current verdict |
|---|---|---|---|
| Smash Live Cash | 66 audio lessons across Modules 0-7 plus preflop asset manifests | media manifest, source registry, gap ledger, cleanup QA | COMPLETE / claim-driven visuals only |
| FTGU | Episodes 01-30 plus hand-chart audit | source registry and three-batch completion QA | COMPLETE / charts reference-only |
| Cash Injection | Episodes 01-10 | course states ten episodes; complete-corpus QA | COMPLETE / population magnitude field-gated |
| Carrot Grade 1 | Lectures 01-10, Exam, Feedback | registry and exam/feedback routing | COMPLETE |
| Carrot Grade 2 | Lectures 01-10, Exam, Feedback | registry and exam/feedback routing | COMPLETE |
| Carrot Grade 3 | Lectures 01-10, Exam, Feedback | Batch 01-05 QA and G3-Q01-Q10 routing | COMPLETE |

## Package and transcript integrity

### Smash

Accepted QA records establish:

- all 66 catalogued audio lessons are represented;
- former rerun and tail issues are closed;
- no lesson remains raw, not started or blocked on audio recovery;
- exact cards, suits, matrices, sizes, frequencies and EV remain visual-dependent when material.

The media manifest contains historical per-file statuses such as `TRANSCRIPT_PENDING`. Those are acquisition-era fields and are superseded by the current source registry and gap ledger. Rewriting the manifest would destroy historical provenance and is not required.

### FTGU

Accepted QA records establish:

- all 30 episodes were received in five transcript formats;
- duplicate artifacts were byte-confirmed;
- no catastrophic Whisper loop or missing episode remains;
- the hand-chart PDF cannot be admitted as an exact anchor because assumptions are missing and printed percentages do not exactly match binary cell totals.

### Cash Injection

Accepted QA records establish:

- all ten episodes contain the preferred five formats;
- no repeated 12-word shingle, duplicated segment or missing tail remains;
- Episode 01 duplication was byte-confirmed;
- exact solver and mass-data claims remain visual-dependent;
- all ten population claims remain hypotheses for Batumi rather than local defaults.

### Carrot

Accepted QA and registries establish:

- Grades 1-3 each contain Lectures 01-10, Exam and Feedback;
- Grade 3 Batch duplicates were identified before ingestion;
- Lecture 10 has 769 aligned segments across all five formats, no overlap, no repeated 12-gram and a logical ending;
- all G3-Q01-Q10 have primary lecture and Feedback support;
- exact source examples remain visual-dependent.

## Technical rerun verdict

No full-lesson or full-course rerun is justified.

```text
FULL RERUN QUEUE: EMPTY
TARGETED AUDIO RERUN QUEUE: EMPTY UNTIL A MATERIAL CLAIM FAILS REVIEW
VISUAL REVIEW QUEUE: CLAIM DRIVEN
```

A targeted rerun or source-video inspection is permitted only when it can change:

- an independent anchor assumption;
- a high-EV boundary;
- an original drill answer;
- a contradiction decision;
- a final rule scope;
- an admission verdict.

## Material visual-dependency queue

### Priority V1 - Preflop architecture and anchors

Relevant internal evidence:

- Smash preflop assets and 980-scenario normalized index;
- Smash preflop/squeeze/3-bet/4-bet lessons;
- FTGU chart audit and preflop episodes.

Purpose:

- recover source assumptions and candidate families;
- compare range shape;
- define independent solver work.

Boundary:

Source charts remain private reference. Final anchors must be independently derived with explicit rake, stack, size, ante/straddle and player-count assumptions.

### Priority V2 - Deep OOP protected-call boundary

Review exact visual/source geometry only if needed to close `H-W01-006`:

- effective stack and SPR;
- positions and preflop action;
- board and suits;
- size menu;
- exact call-versus-raise comparison.

Mechanism support is already strong. The open issue is a usable depth boundary, not whether protected passive ranges exist.

### Priority V3 - Multiway action order and delayed aggression

Review exact source examples only where they can stabilise drills for:

- `H-W03-007` shared defence;
- `H-W03-008` backup equity/removal;
- `H-W03-010` nut ownership;
- `H-R04-007` delayed aggression.

The key dependencies are players behind, action order, range ownership and later-street branch availability.

### Priority V4 - Exact size and low-SPR claims

Carrot Grade 3 Lecture 10 and related solver screens require visual review only if a final drill or boundary uses an exact size, frequency, SPR or board class. The mechanism-level four-bet framework is already admitted as evidence.

### Deferred visual claims

Cash Injection mass-data filters and exact population magnitudes are not an immediate visual-review priority. Even perfect source recovery would not establish Batumi transfer. Field evidence remains the binding gate.

## Active-authority defects found

### D1 - Stale candidate registry routing

Severity: `HIGH`.

`HEURISTIC_CANDIDATE_REGISTRY_v0_3.md` still describes Grade 3 as pending and routes open gates back to Carrot. This can cause duplicate source work and false expectations.

Repair:

- supersede with `HEURISTIC_CANDIDATE_REGISTRY_v0_4.md`;
- preserve all 34 IDs and status counts;
- route residual gates to independent anchors, targeted visuals, learner tests or field evidence.

### D2 - Stale remaining-question matrix

Severity: `HIGH`.

`REMAINING_SOURCE_QUESTION_MATRIX_v1_2.md` still treats Grade 3 as future preferred evidence.

Repair:

- supersede with `REMAINING_SOURCE_QUESTION_MATRIX_v1_3.md`;
- preserve all 38 IDs;
- distinguish mechanism closure from boundary, anchor, visual, learner and field gates.

### D3 - Stale validation workbench

Severity: `HIGH`.

`CANDIDATE_TO_MODULE_VALIDATION_WORKBENCH_v0_2.md` still permits future Carrot mutation and describes four drill factories as Carrot-gated.

Repair:

- supersede with `CANDIDATE_TO_MODULE_VALIDATION_WORKBENCH_v0_3.md`;
- reclassify them as evidence-gated after source completion.

### D4 - Fixed-count language in active slot architecture

Severity: `HIGH`.

`PROVISIONAL_FINAL_RULE_SLOT_ARCHITECTURE_v0_2.md` retains an expected final count of 14-18 and assigns future merge/split decisions to Carrot.

Repair:

- supersede with v0.3;
- retain 16 slots only as editable working containers;
- apply `MINIMUM COMPLEXITY SUBJECT TO NO MATERIAL EV LOSS`.

### D5 - Stale synthesis index and cross-source status

Severity: `HIGH`.

`synthesis/README.md` and `CROSS_SOURCE_EVIDENCE_MATRIX_v0_1.md` still present Lecture 10 or Carrot as pending.

Repair:

- update the synthesis index;
- create a current cross-source evidence index that points to the complete source-specific matrices rather than duplicating them.

### D6 - Stale course evaluation

Severity: `MEDIUM`.

`CURRENT_SOURCE_COURSE_EVALUATION_v4.md` excludes Grade 3 and therefore understates Carrot's advanced postflop role.

Repair:

- supersede with v5;
- retain scores as project-relative estimates, not universal rankings.

### D7 - Smash registry path ambiguity

Severity: `MEDIUM / NAVIGATION ONLY`.

The Smash registry lives at `sources/source-registry.md`, while other families use `sources/<family>/source-registry.md`.

Repair decision:

- preserve the existing canonical path to avoid breaking references;
- document the exception in the active cross-source index and atlas;
- do not duplicate or rename the registry during this milestone.

### D8 - Historical stale files

Severity: `CONTROLLED`.

Historical QA, ingestion specs, provisional Playbook snapshots and old manifests contain statuses that were true when written.

Decision:

- do not rewrite historical artifacts;
- ensure active authorities explicitly supersede them;
- a historical stale phrase is not an active defect unless current navigation points to it.

## Strategic completeness after source closure

Source ingestion is complete, but strategic closure is not.

Remaining material gates:

- independent live-rake preflop anchors;
- squeeze purification;
- polar preflop target folds and call branch;
- players-behind compression;
- exact depth/SPR/straddle overlays;
- exact deep OOP protected-call boundary;
- multiway shared defence, bluff construction and delayed aggression;
- target-live population calibration;
- learner error-probability measurement;
- field transfer;
- final admission.

These are evidence-production tasks, not missing-course tasks.

## Candidate and rule-count effect

```text
heuristic candidates: 34 unchanged
DRILL_READY: 27 unchanged
VALIDATION_PENDING: 7 unchanged
ADMITTED: 0 unchanged
direct original drills: 30/34 unchanged
provisional synthesis slots: 16 unchanged and non-binding
final rule count: emergent / not fixed
```

No candidate is promoted merely because the catalogue is complete.

## Audit verdict

`KNOWN_CATALOGUED_SOURCE_CORPORA_COMPLETE`

`NO_OPEN_FULL_RERUN`

`NO_UNRESOLVED_PACKAGE_LEVEL_DEFECT_FOUND`

`EXACT_VISUAL_REVIEW_REMAINS_MATERIAL_AND_CLAIM_DRIVEN`

`ACTIVE_SYNTHESIS_ROUTING_REQUIRED_REPAIR`

`SOURCE_COMPLETION_DOES_NOT_EQUAL_STRATEGIC_ADMISSION`

`NEXT_PHASE_POST_SOURCE_EVIDENCE_CLOSURE`
