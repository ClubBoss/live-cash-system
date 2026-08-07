# Wave 1 Acceptance — Product Comprehension and Information Architecture

**Date:** 2026-08-07  
**Final source SHA:** `96f5d62c9c2cd94965dfa41e93db224a6d0fc593`  
**Release gate:** GitHub Actions run `31137050150` — `PASS`

## Verdict

`WAVE_1_ACCEPTED_WITH_EMPIRICAL_COMPREHENSION_VALIDATION_DEFERRED_TO_WAVE_10`

Wave 1 is accepted for its repository, product-contract, bilingual editorial and automated UX scope. Claims about fresh-user comprehension rates are deliberately not made before real-user testing.

## Goals achieved

- Learner-facing navigation no longer uses `T1` as the unexplained primary label.
- The primary label is `Проверка` / `Check`.
- The home screen identifies the diagnostic as an optional starting decision check.
- Purpose, approximate duration, output, separate-review boundary and skip path are explicit.
- `T1` remains only as a secondary technical identity required by the state and export contracts.
- The first lesson remains immediately available without the diagnostic.
- Russian Today, Learn, Review, Cards, Map and Real Hands language was tightened and internal methodology terms were reduced.
- English shell copy was independently aligned rather than mechanically mirrored.
- Awkward or overclaiming phrases were repaired, including:
  - `тем уже закрепляются` → `тем в работе`;
  - `Разбор подтверждает решение` → `Разбор поддерживает решение`.
- Existing learner-state, timer, locale, reload and mixed-exposure semantics remain unchanged.

## Verification

### Automated product-contract checks

Playwright verifies:

- the starting check explains ten decisions, about fifteen minutes and optionality;
- the user can skip it and open the first lesson;
- RU and EN start screens communicate the same purpose;
- the diagnostic start locale remains frozen;
- per-answer locale remains correct;
- the first-item timer starts from the actual run start;
- beginning learning during a cold run invalidates baseline interpretation;
- active translated decisions survive locale switch and reload;
- mobile home and learn screens have no document-level horizontal overflow.

### Full technical gate

- TypeScript: PASS
- ESLint: PASS
- Editorial integrity: PASS
- Production build: PASS
- Unit/integration: PASS
- Desktop/mobile Playwright: PASS

Evidence: run `31137050150`, job `92738621986`.

## DoD assessment

| Wave 1 requirement | Status |
|---|---|
| Clear product purpose and next action | `PASS_PRODUCT_CONTRACT` |
| T1 purpose, duration, output and optionality | `PASS` |
| Human-readable navigation | `PASS` |
| Human-readable progress/integrity explanation | `PASS_CURRENT_SCOPE` |
| First lesson available without diagnostic | `PASS` |
| RU and EN shell approval | `PASS_CURRENT_SCOPE` |
| Desktop/mobile regression coverage | `PASS` |
| Fresh-context comprehension threshold with real users | `DEFERRED_WAVE_10` |
| Authenticated production DOM confirmation | `BLOCKED_EXTERNAL_WAVE_11` |

## Known remaining scope

- The complete diagnostic evaluation/import experience belongs to Wave 7.
- Full status-map comprehension belongs to Wave 7.
- Premium visual, mobile and accessibility polish belongs to Wave 8.
- Real first-use comprehension percentages belong to Wave 10.
- Authenticated production smoke remains externally blocked by the ChatGPT authentication boundary.

These items are not hidden and do not invalidate the Wave 1 product-contract acceptance.
