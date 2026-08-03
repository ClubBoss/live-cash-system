# Live Cash System

Private source-of-truth for building a compact, executable No-Limit Hold'em live-cash strategy from multiple courses, hand reviews, drills, and real-session evidence.

## Primary objective

Prepare Elmar for deep-stacked live cash (initial target: Batumi 1/3 and 2/5) by converting broad source material into a small number of reliable heuristics, decision trees, anchor ranges, and trained responses.

## Operating principles

1. **Sources stay source-faithful.** Raw transcripts and visual notes are never silently rewritten.
2. **Analysis is separate from source extraction.** Every strategic conclusion keeps provenance and assumptions.
3. **One executable system.** Smash Live Cash, Carrot Poker, Cash Injection, From the Ground Up, external research, and session evidence feed one playbook rather than parallel competing strategies.
4. **Compression without hidden EV loss.** Simplifications must state their boundary conditions and known exceptions.
5. **Training over collection.** New material is admitted only when it improves a priority leak, decision process, or field exploit.
6. **Evidence can reverse conclusions.** Contradictions and field observations are logged explicitly.

## Repository layers

- `sources/` — immutable transcripts, visual notes, and source registry.
- `analysis/` — lesson analyses, concept atlas, evidence, coverage, and contradictions.
- `playbook/` — current executable strategy and session-facing rules.
- `training/` — leak map, competencies, drills, assessments, and repetition.
- `fieldwork/` — Batumi preparation, population observations, and session logs.
- `hands/` — raw and reviewed hands plus recurring-spot indexes.
- `sharky/` — concepts and training mechanics potentially useful for Sharky.
- `templates/` — canonical ingestion and analysis formats.
- `docs/` — governance and operating protocols.

## Current priority nodes

1. MTT-to-deep-cash transition.
2. Big-blind defence.
3. Small blind versus big blind.
4. Playing out of position against frequent 3-bets.
5. Deep-stack one-pair discipline and reverse implied odds.
6. Three-bet pots and multiway live pots.
7. Batumi population adaptation and session discipline.

## Admission pipeline

```text
Raw source
  -> source-faithful transcript
  -> lesson analysis
  -> concept comparison
  -> evidence and contradiction review
  -> compressed heuristic / decision tree
  -> playbook admission
  -> drill and spaced repetition
  -> live-session validation
```

## Status vocabulary

- `RAW` — received but not quality-checked.
- `SOURCE_VERIFIED` — transcript and visual extraction are usable.
- `ANALYZED` — lesson-level analysis completed.
- `SYNTHESIZED` — reconciled with other sources.
- `PLAYBOOK_ADMITTED` — executable rule accepted.
- `TRAINED` — demonstrated in recall and mixed drills.
- `FIELD_VALIDATED` — supported by live-session evidence.
- `DORMANT` — retained but not currently actionable.
- `REJECTED` — excluded with rationale preserved.

## Immediate next step

Ingest the first strategically substantive Smash Live Cash transcript using `templates/transcript-template.md`, then process it through `templates/lesson-analysis-template.md`.
