# Practical Mastery — Executable Gate Repair 1

Status: `BOUNDED_REPAIR_READY`

## Trigger

Exact program-head PR validation reached the real runner and failed at the first executable gate: `npm run typecheck`.

## Root cause

`decisions-recognition-expansion.ts` used a helper signature requiring separate `whyRu` and `whyEn`, while the authored recognition corpus consistently supplied one source-backed rationale and, for changed-node items, an optional `changedVariables` array in the next position. This produced TS2554 / TS2345 errors before any build or browser test ran.

## Repair

- Preserve every decision ID, source reference, correct action, correct reason, cue, question and changed-variable payload.
- Make the helper backward-compatible with:
  - one rationale;
  - one rationale + changed variables;
  - separate RU/EN rationale;
  - separate RU/EN rationale + changed variables.
- Do not alter poker strategy semantics.

## Actions efficiency repair

The CI workflow previously installed Chromium, Firefox and WebKit before discovering static TypeScript failures. Reordered validation to:

1. install dependencies;
2. run `npm test` (typecheck/lint/governance/editorial/build/unit) and persist the release log;
3. only on success install canonical browsers;
4. run E2E and Wave C, appending to the same release log.

PR visual-evidence upload remains fail-closed through the explicit verification step on successful validation, while early static failures no longer create a misleading second failure merely because screenshots were never produced.

## Validation truth

No GREEN claim on this repair branch. It must be merged into the program branch and proven by the next exact-head PR #87 validation run.
