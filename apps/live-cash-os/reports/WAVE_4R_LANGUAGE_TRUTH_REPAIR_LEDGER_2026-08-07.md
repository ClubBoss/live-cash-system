# Wave 4R — Language Truth Repair Ledger

**Opened:** 2026-08-07  
**Trigger audit base:** `1dc35d3af42f52a521d86609e9c9f34965f42abc`  
**Status:** `CURRICULUM_STRATEGY_GOLD / LANGUAGE_REPAIR_REQUIRED`

## Why Wave 4 is reopened

Wave 4's source-first strategic reconstruction remains accepted. An independent read-only audit demonstrated that the final learner-facing locale/runtime layer still contains system-level truth and language defects that the previous editorial gate did not detect.

The repair is not a strategic rollback. It is a localization, single-source-of-truth and poker-native language repair before any Wave 6 work.

## P1 repair scope

### 4R-01 — Russian T1 rewrite

Rewrite all ten learner-facing diagnostic items in natural Russian while preserving:

- diagnostic IDs `LD-001` through `LD-010`;
- ordering and target timing;
- underlying poker mechanism;
- export/import identity;
- cold/post-learning measurement semantics.

Remove unexplained hybrid research language such as `compensation-test`, `OOP defence`, `preflop air`, `near-range node`, `gate`, `bluff supply`, raw `MDF` framing and similar internal constructions. Standard poker terms may remain when they are the clearest table language.

### 4R-02 — One EN module source of truth

Remove the competing `moduleHeadings` overlay that can replace newer gold `title`, `shortTitle`, `plainGoal` or `tableCue` in `localizedModule()`.

Final RU and EN module identity must come from the reviewed gold locale content only.

### 4R-03 — Remove false EN editorial-pending UI

When all current modules are approved, learner UI must not show:

- `EN REVIEW REQUIRED`;
- `still under poker-aware editorial review`;
- stale source-lock approval warnings.

If a future module becomes pending, status must be driven by actual editorial metadata rather than unconditional locale logic.

### 4R-04 — Rewrite EN 0→100 route

Replace learner-facing internal/state-machine language such as:

- skill evidence;
- current model;
- admitted probe;
- explicit transfer probe;
- repair resolved;
- due retention passed;
- reviewed field hand;
- field validated;
- learner-state event.

The route should communicate the same meaning as the natural Russian route: start → understand → practise → apply under changed conditions → recall after delay → reviewed real-hand use.

### 4R-05 — Hardcoded learner UI localization

Inventory and localize all learner-facing hardcodes in normal React/locale flow, including current examples:

- `Pot`, `Stack`, `Bet / call`;
- `ACTIVE RECALL`;
- raw card kinds;
- `DECISION REVIEW · CLASS ...`;
- `Cue`, `Action`, `Reason`;
- raw field-review statuses;
- diagnostic `AWAITING_REVIEW / SCORED / ROUTED` labels;
- import/export errors and alerts.

Do not rely on post-render DOM text replacement as the primary localization architecture.

### 4R-06 — Full poker-native RU/EN corpus pass

Review final learner-facing strings after all overlays, not individual source layers.

Remove research/AI-style phrasing where a good live-cash coach would say the same mechanism more directly. Standard poker language such as `3-bet`, `c-bet`, `range`, `blocker`, `SPR`, `straddle`, `squeeze` may remain when useful.

Priority examples to eliminate or simplify include:

- направленная архитектура;
- нижняя мастевая часть базового колл-региона;
- существующий смешанный кандидат;
- очистка существующих миксов;
- недокомпенсированная c-bet-частота;
- селективное bet/check-разделение;
- range compensation;
- claim-driven visual review;
- OOP raise gate;
- arriving/source branch language where direct poker language is clearer;
- credible bluff candidates where concrete bluff supply can be named.

### 4R-07 — Editorial gate expansion

The gate must reject recurrence of the defect class, not only known phrases.

Required coverage:

- final T1 RU learner copy;
- EN internal/state-machine jargon;
- final 0→100 route;
- final module heading source-of-truth;
- stale `EN REVIEW REQUIRED` / fallback contradictions;
- hardcoded Core learner labels;
- final RU and EN curriculum output after all locale overlays;
- locale completeness for diagnostic, cards, field notes and primary lesson UI.

Automated checks remain rejection tools, not automatic editorial approval.

### 4R-08 — Consolidate temporary DOM overlays

Wave 5 introduced narrow DOM/CSS compatibility layers to avoid a large Core rewrite before language repair. Because 4R already owns Core/localization, migrate these behaviors into normal React/locale contracts where practical:

- mixed-practice generic pre-answer label;
- prediction-first lab rendering and validation;
- Wave 5 flashcard copy sync;
- hardcoded label localization;
- editorial-gold status handling.

Preserve all Wave 5 browser behavior and stable learner-state IDs.

## Full learner-facing inventory requirement

4R may not stop after repairing the examples above. Audit all of:

- `content/diagnostic.ts`;
- `content/i18n/learning-route.ts`;
- module heading/localization sources;
- final LCM-01–LCM-11 RU and EN output;
- `LiveCashAppCore.tsx` learner-facing labels and statuses;
- wrapper/post-processing localization;
- cards;
- review/repair screens;
- field hand screens;
- diagnostic result/import/export screens;
- labs;
- empty/error/success states visible before later visual/accessibility waves.

## Measurable DoD

Wave 4R is accepted only when:

1. T1 RU has zero known unexplained research/internal hybrid phrases and preserves all ten stable IDs.
2. There is one canonical source for approved EN module headings/goals/cues.
3. Zero learner-facing stale EN editorial-pending message appears for approved modules.
4. EN 0→100 route contains zero prohibited internal state-machine terminology.
5. RU primary flows contain zero known untranslated generic UI labels where a natural RU equivalent is required.
6. Final RU/EN module corpus passes poker-native manual review; no known P1 machine-style phrase remains.
7. Editorial regression tests cover diagnostic + route + Core hardcodes + final locale outputs.
8. RU↔EN switching preserves module/drill/action/reason/card/diagnostic identities and existing learner evidence.
9. Wave 5 mixed-practice and lab browser contracts remain green on desktop and mobile.
10. `npm run test:release` passes on the exact 4R head.
11. A manual language ledger records any intentionally retained English poker term and why it remains useful.

## Acceptance verdict rule

Until all DoD points pass, repository truth must remain:

`CURRICULUM_STRATEGY_GOLD / LANGUAGE_REPAIR_REQUIRED`

Only after explicit poker-aware RU and EN re-review may language status return to full bilingual acceptance.
