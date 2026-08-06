# Live Cash taxonomy scopes v1

Status: `ACTIVE_SCOPE_BOUNDARY`

## Canonical diagnostic taxonomy

`learning/MISCONCEPTION_TAXONOMY_v0_1.md` is the semantic authority for evaluated T1 evidence.

- Namespace: `MC-001` through `MC-030`.
- Meanings are fixed by the taxonomy table.
- Only reviewed external evaluation may attach these IDs to a T1 response.
- `diagnostic-import.ts` and `score_learner_diagnostic.py` must reject every ID outside this set.

## Runtime distractor tags

The current 55-drill corpus also contains `MC-nnn` strings on wrong options. These were authored as local option-to-repair tags before the diagnostic taxonomy was frozen. They are not automatically equivalent to the canonical T1 meaning, even when the number is between 001 and 030.

Therefore:

1. Runtime tags may guide a local repair family only.
2. Runtime tags must never be exported as canonical T1 evidence.
3. No numeric or name-based automatic mapping is allowed.
4. A future migration may rename them to `RMC-nnn`, but only after each option is semantically reviewed against the canonical taxonomy.
5. Until that migration, gates validate format and isolation rather than pretending semantic equivalence.

## Release rule

A release fails if:

- T1 accepts an ID outside canonical `MC-001..MC-030`;
- a runtime distractor tag is copied into diagnostic score output;
- a script rewrites or normalizes runtime tags into canonical IDs without an explicit reviewed mapping.

This boundary preserves current learner repair behavior while preventing false diagnostic evidence.
