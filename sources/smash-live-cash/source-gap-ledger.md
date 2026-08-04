# Smash Live Cash — Source Gap & Reprocessing Ledger

Status: `SMASH_AUDIO_AND_CANONICAL_INGESTION_COMPLETE / TARGETED_VISUAL_REVIEW_OPEN`

Last updated: 2026-08-05

## Purpose

Canonical record of transcript reruns, cleanup tasks and visual dependencies. A gap blocks only the stated interval or exact visual claim.

## Targeted rerun and media verification status

`NONE OPEN`

All approved Whisper reruns and the final direct-media tail verification are complete.

## Canonical ingestion and cleanup status

`NONE OPEN AT LESSON LEVEL`

The former backlog is now converted into canonical source-faithful records:

- `SLC-M03-L31` through `SLC-M03-L34`;
- `SLC-M05-L43` through `SLC-M05-L55`;
- complete `SLC-M07-L63`.

Local ASR repetitions and low-confidence terms were handled conservatively. No missing cards, actions, frequencies, sizes or EV values were reconstructed.

Minor wording residuals documented in earlier QA reports remain non-blocking unless a later cross-source comparison depends on the exact phrase.

## Visual review backlog

Exact cards, suits, position labels, size values, combo weights, frequencies and EV remain visual-dependent for lessons marked `NEEDS_VISUAL_REVIEW` in `sources/source-registry.md`.

Visual review is now claim-driven rather than lesson-driven. A screen or video interval should be requested only when it can:

1. change a final heuristic;
2. establish an anchor range or sizing threshold;
3. resolve a conflict with Carrot or FTGU;
4. define an original drill correctly.

It is not necessary to capture every solver cell.

## Transcript package backlog

`NONE`

Every catalogued Smash lesson has an input package and a canonical repository record.

## Resolved source issues

All issues `SGL-R001` through `SGL-R005` and targeted issues `SGL-0003`, `0005`, `0014`, `0018`, `0020`, `0027`, `0032`, `0038`, `0045`, `0046A`, `0046B`, `0047`, `0049`, `0052`, `0053`, `0054`, `0055` and `0056` are closed.

The detailed evidence remains in the checkpoint QA reports and `analysis/module-audits/SGL_0018_DIRECT_MEDIA_TAIL_CLOSURE.md`.

## Retained source protocol

1. Preserve original outputs and separate reruns.
2. Use overlap and independent recovery for failed intervals.
3. Never infer cards, actions, sizes, frequencies or EV from expected strategy.
4. Mark visual-only dependencies explicitly.
5. Cross-source support can validate a heuristic but never rewrite a missing source passage.

## Remaining project dependencies

- targeted visual review for final exact claims;
- FTGU and Carrot canonical ingestion;
- cross-source validation;
- consolidation of heuristic candidates;
- original drill and field testing before admission.

## Ledger verdict

`SMASH_SOURCE_CORPUS_CANONICALLY_INGESTED`

`NO_OPEN_AUDIO_OR_LESSON_LEVEL_CLEANUP_BLOCKERS`