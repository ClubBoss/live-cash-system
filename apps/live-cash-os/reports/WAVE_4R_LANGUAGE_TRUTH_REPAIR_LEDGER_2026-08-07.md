# Wave 4R — Language Truth Repair Ledger

**Date:** 2026-08-07  
**Fresh GREEN base:** `26b1dec72822a706f82cf485042c18e166397bdd`  
**Base CI:** run `31175320582`  
**Repair branch:** `repair/w4r-language-truth`  
**Accepted code candidate:** `4da3d57d01cc7abedb3cb17a48a37ae7bd973053`  
**Accepted code CI:** run `31180900856`, job `92873731809`  
**Truth:** `CURRICULUM_STRATEGY_GOLD / WAVE_4R_ACCEPTED`

No merge to `main`, production deploy, learner-state reset/migration or Wave 6 work was performed.

## 1. Fresh-HEAD revalidation of the nine known defect classes

| # | Audit result at fresh HEAD | Wave 4R action |
|---|---|---|
| 1. RU T1 hybrid machine language | **ALREADY REPAIRED** in `content/diagnostic.ts`; all ten RU items were already materially natural and stable | Revalidated; did not rewrite gratuitously. Added regression coverage for IDs and banned jargon. |
| 2. Competing EN `moduleHeadings` | **PARTIALLY PRESENT AS ARCHITECTURAL RISK** | Converted `moduleHeadings` into an empty compatibility export. Final semantic copy now comes through the canonical locale pipeline and final language pass. |
| 3. APPROVED EN vs `EN REVIEW REQUIRED` | **CONFIRMED** as stale fallback/review truth risk | Removed approved-locale pending/fallback rendering; gate rejects contradictory review-required text. |
| 4. EN 0→100 evidence/state-machine jargon | Route data itself was already substantially human, but composition and regression protection were incomplete | Route now renders directly in React through `LearningRoute`; RU/EN internal-jargon checks and browser assertions added. |
| 5. Learner UI hardcodes/raw enums | **CONFIRMED** | Replaced raw session/drill/card/T1/field statuses and generic labels with direct locale helpers. |
| 6. Gold RU/EN research/architecture prose | **CONFIRMED**, especially EN T1 and high-risk modules | Natural EN T1 plus final language-only pass for LCM-02/05/06/07/09/10; LCM-11 existing poker-native repair revalidated. |
| 7. Editorial gate too narrow | **CONFIRMED** | Expanded `editorial-check.mjs` and added `wave4r-runtime-check.mjs`; browser coverage now checks rendered output, locale identity and Wave 5 behavior. |
| 8. Post-render DOM localisation / temporary overlays | **CONFIRMED** | Removed Wave 4R locale `MutationObserver`/`textContent` overlay entirely. Wave5 compatibility layer no longer uses `MutationObserver` or `textContent` state inference. |
| 9. Manifest/acceptance truth contradictions | **CONFIRMED** | Manifest now scopes `FULLY_ACCEPTED` to curriculum bilingual module approval and separately records `curriculum_truth` and `language_truth`; acceptance/release ledgers synchronized after explicit human review. |

## 2. Full learner-facing string inventory

The final rendered paths were reviewed, not only individual source files.

### Diagnostic / T1

Reviewed:

- intro/purpose/optional wording;
- all RU `LD-001`…`LD-010` titles/prompts;
- all EN `LD-001`…`LD-010` titles/prompts;
- answer/reason/confidence labels;
- raw-response boundary;
- reviewed-result import text;
- diagnostic status labels;
- cold/post-learning/mixed-exposure instructions;
- first-item timer semantics and locale-at-start behavior.

Result: stable IDs preserved; no known P1 hybrid/research language remains in learner-facing T1.

### 0→100 route

Reviewed all nine stages in RU and EN plus the route boundary explanation.

Result: no learner-facing evidence-gate/state-machine language such as `probe`, `retention`, `field validation`, `learner-state` or `state machine` remains on the route.

### Shell / navigation / Today / empty states

Reviewed:

- primary navigation;
- Today promise and next-action explanation;
- T1 entry card;
- pre-session card entry;
- progress explanation;
- Learn/Review/Cards/Map/Hands headings;
- empty review/card states;
- save/sync/local/offline labels;
- import/reset errors visible to learners.

Result: learner actions are described as learner actions rather than architecture operations.

### Module corpus

For LCM-01…LCM-11 reviewed final locale output across:

- title;
- short title;
- description;
- plain goal;
- table cue;
- theory;
- heuristics;
- decision tree;
- worked example;
- counterexample/boundary;
- drill assumptions;
- cues;
- questions;
- action options;
- reason options;
- explanations;
- table card;
- glossary;
- flashcards;
- lab copy.

High-risk EN focus was applied to LCM-02/05/06/07/11 as required. LCM-09/10 received additional direct-language cleanup because the same defect class appeared there. LCM-11 already had a substantial poker-native Wave 4R layer on fresh HEAD and was revalidated rather than rewritten without need.

### Review / cards / field / status surfaces

Reviewed direct rendering of:

- lesson/practice/repair/review/mixed session mode;
- drill type;
- card type;
- recall mode;
- decision review;
- ResponseClass summary;
- field-note review status;
- T1 review status;
- `Cue / Action / Reason` equivalents;
- lab `Pot / Stack / Bet / call` equivalents.

Result: raw implementation enums are no longer the learner-facing copy source.

## 3. High-risk before → after examples

| Before | After | Reason |
|---|---|---|
| EN T1 `Straddle denominator` | `Depth with a straddle` | Same stack-depth concept, normal poker English. |
| EN T1 `Pairwise multiway depth` | `Effective stacks in a multiway pot` | Removes research naming while preserving opponent-specific effective-stack meaning. |
| EN T1 `compensation test` | Direct question about whether the wider 3-bettor checks more weak hands postflop | Teaches the actual decision rather than an internal test name. |
| EN T1 `directional raise incentive` / `MDF burden` | Direct value/protection and multiway action-order questions | Preserves mechanism without pseudo-formal labels. |
| LCM-05 `Bet size and response shape` | `How bet size changes your response` | Human learner title. |
| LCM-07 `Range ancestry` | `Trace the range through the hand` | Same source-range filtering mechanism, poker-native phrasing. |
| Raw `ACTIVE RECALL` | RU `ВСПОМНИ БЕЗ ПОДСКАЗКИ` / EN `RECALL WITHOUT HINTS` | Learner instruction instead of internal mode label. |
| Raw `PENDING_REVIEW` | RU `ждёт разбора` / EN `awaiting review` | Human status. |
| RU screen showing `Pot / Stack / Bet / call` | `Банк / Стек / Ставка / колл` | Locale parity. |
| Raw `Cue / Action / Reason` in RU | `Что заметил / Как сыграл / Почему` | Natural hand-review language. |
| Approved EN plus stale `EN REVIEW REQUIRED` path | Approved EN with no review-required fallback | Manifest/UI truth agreement. |
| Locale `MutationObserver` + `textContent` rewriting after React render | `applyLocaleData(locale)` before render + direct React locale helpers | Eliminates reconciliation/localisation hack. |

## 4. Canonical language/runtime architecture

Final locale application order is explicit in `content/i18n/locale-pipeline.ts`:

1. geometry gold locale;
2. Wave 3 priority gold locale;
3. Wave 4 curriculum gold locale;
4. Wave 4 final editorial locale;
5. existing Wave 5 practice copy / earlier Wave4R native layer;
6. Wave 4R final language-only pass.

The last layer is language-only. It does not change strategic claim files, semantic IDs, correct answer IDs, state schema or mastery rules.

`moduleHeadings` remains only as an empty compatibility export and cannot override the canonical final module copy.

## 5. State / identity / strategy safety

Wave 4R changed no files under strategic claims or learner-state model logic.

Preserved:

- module IDs;
- drill IDs;
- action/reason option IDs;
- card IDs;
- diagnostic IDs `LD-001`…`LD-010`;
- state schema;
- existing learner history;
- correct-answer identities;
- module prerequisites;
- review/mastery/field-validation transitions.

The only adjacent functional fix was T1 measurement truth: the first-item timer now starts when the learner presses `Start`, not while reading the diagnostic landing screen.

## 6. Wave 5 non-regression

Wave 5 behavior remains separately owned and accepted.

Verified after Wave 4R:

- mixed practice remains locked until three completed topics;
- topic identity remains concealed before a mixed decision;
- prediction-before-interaction lab gate remains present;
- a material variable must change;
- invalid lab input cannot continue;
- boundary feedback remains present;
- the flow continues to the changed-node stage;
- option/card semantic identities remain unchanged.

One duplicate lab gate found during Wave 4R was traced to composing `Wave5PracticeLayer` twice (`app/page.tsx` plus the temporary wrapper). The wrapper duplicate was removed; the accepted layer is composed once.

## 7. Editorial / runtime gate expansion

`check:editorial` now runs:

- `scripts/editorial-check.mjs`;
- `scripts/wave4r-runtime-check.mjs`.

The gates reject:

- stale source-locks;
- missing bilingual module coverage;
- changed T1 IDs;
- Cyrillic in EN T1/runtime/gold scopes;
- known T1/research jargon;
- route state-machine jargon;
- stale/competing `moduleHeadings` semantic copy;
- `EN REVIEW REQUIRED` contradictions;
- rendered raw session/drill/card/field/T1 labels;
- Wave 4R `MutationObserver`/`textContent` locale reconciliation;
- `MutationObserver`/`textContent` state inference in the Wave 5 compatibility layer;
- missing browser coverage for RU→EN→RU identity, T1 naturalness, final EN headings and raw-status suppression.

The gate does **not** write approval. Human approval is represented separately by `language_truth: WAVE_4R_ACCEPTED` after review.

## 8. Test evidence

Accepted code candidate `4da3d57d01cc7abedb3cb17a48a37ae7bd973053`:

- workflow run `31180900856`;
- validation job `92873731809`;
- `npm run typecheck`: PASS;
- `npm run lint`: PASS;
- `npm run check:editorial`: PASS;
- Wave 4R runtime gate: PASS;
- `npm run build`: PASS;
- unit/integration: `64/64 PASS`;
- Playwright: `36 passed / 1 intentionally skipped`;
- desktop: PASS;
- mobile: PASS;
- RU→EN→RU active decision identity: PASS;
- no Cyrillic EN T1/rendered session checks: PASS;
- no stale approved-EN review banner: PASS;
- Wave 5 practice regression: PASS.

A prior red run was intentionally not accepted. Its Playwright evidence exposed three issues: two stale selectors and one real duplicate Wave 5 composition. Those were repaired before the accepted run.

## 9. Exact changed files in accepted code candidate

Relative to fresh base `26b1dec72822a706f82cf485042c18e166397bdd`:

- `.github/workflows/live-cash-os-ci.yml` — temporary branch-only validation trigger; must be restored to base before handoff;
- `apps/live-cash-os/components/LiveCashApp.tsx`;
- `apps/live-cash-os/components/LiveCashAppCore.tsx`;
- `apps/live-cash-os/components/LearningRoute.tsx` (new);
- `apps/live-cash-os/components/Wave5PracticeLayer.tsx`;
- `apps/live-cash-os/content/i18n/editorial-manifest.json`;
- `apps/live-cash-os/content/i18n/learner-ui.ts` (new);
- `apps/live-cash-os/content/i18n/locale-pipeline.ts` (new);
- `apps/live-cash-os/content/i18n/runtime.ts`;
- `apps/live-cash-os/content/i18n/wave4r-final-language.ts` (new);
- `apps/live-cash-os/e2e/live-cash.spec.mjs`;
- `apps/live-cash-os/e2e/wave5-practice.spec.mjs`;
- `apps/live-cash-os/package.json`;
- `apps/live-cash-os/scripts/editorial-check.mjs`;
- `apps/live-cash-os/scripts/wave4r-runtime-check.mjs` (new).

Acceptance/release/report files are updated after the accepted code gate and are documentation-only follow-up commits.

## 10. Intentionally retained poker terms

The following are retained where they are the most natural table language and already part of the approved glossary/context:

- `3-bet`;
- `4-bet`;
- `c-bet`;
- `range`;
- `blocker`;
- `squeeze`;
- `SPR`;
- `straddle`;
- `OOP` where context makes it standard and clear;
- `value`, `bluff`, `polar`, `linear` when directly describing poker range construction.

These are poker terms, not architecture/research leakage.

## 11. Remaining P2 only

One diminishing-return architecture item remains:

`Wave5PracticeLayer` is still a separate compatibility component and still uses narrow DOM selection/attributes to preserve already-accepted prediction-first lab and mixed-practice concealment behavior. It no longer uses `MutationObserver` or `textContent`, does not localize by rewriting React text, and passes the Wave 5 browser contract. Full integration into Core is deferred because it is not needed to close language truth and would materially raise regression risk inside Wave 4R.

External/non-4R debt remains unchanged: authenticated production smoke, exact deployed SHA, release-version/tag synchronization and empirical learning validation.

## 12. Verdict

`WAVE_4R_ACCEPTED`

Wave 6 was not started.
