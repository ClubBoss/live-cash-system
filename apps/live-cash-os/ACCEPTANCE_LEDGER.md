# Live Cash OS — Acceptance Ledger

Status: `PLATFORM_ACCEPTED / CURRICULUM_STRATEGY_GOLD / WAVE_4R_ACCEPTED / WAVE_5_PRACTICE_ACCEPTED / AUTHENTICATED_PRODUCTION_SMOKE_PENDING`

This ledger separates platform, strategic curriculum, learner-facing language/editorial truth, practice quality, production evidence and empirical learning evidence. Automated checks may reject invalid work but do not create human poker-content or bilingual editorial approval.

## Accepted platform scope

- learner-state integrity kernel;
- schema-2 migration at local and D1 boundaries;
- stable learner, module, drill, action/reason option, misconception, card and diagnostic identities across RU/EN;
- resumable active sessions and persisted locale;
- optional T1 diagnostic handoff;
- canonical content/evidence semantics;
- skill-specific repair and delayed-review architecture;
- separation of completion, working evidence, retention, variant transfer and field validation;
- local/cloud state controls;
- production build and desktop/mobile Playwright gates;
- one permanent branch (`main`), one CI workflow, one canonical release command.

## Strategic curriculum scope

All eleven current modules remain strategically admitted in their reviewed mechanism boundaries. Wave 4R did not reopen strategy without evidence of a strategic defect and did not change claim files, module/drill/card identities, answer identities, learner schema or mastery transitions.

Exact visual-only solver outputs, chart cells/frequencies, exact multiway MDF and unvalidated Batumi population magnitudes remain outside admitted scope.

## Wave 4R language truth accepted

Fresh baseline:

- GREEN `main`: `26b1dec72822a706f82cf485042c18e166397bdd`;
- baseline CI run: `31175320582`;
- repair branch: `repair/w4r-language-truth`;
- no merge to `main`;
- no production deploy;
- no Wave 6 work.

Human re-review confirmed that some earlier Wave 4R repairs were already present at fresh HEAD and were not redone. Remaining confirmed defects were repaired in learner-facing language/runtime only.

Accepted repair candidate evidence:

- code SHA: `4da3d57d01cc7abedb3cb17a48a37ae7bd973053`;
- CI run: `31180900856`;
- validation job: `92873731809`;
- TypeScript: PASS;
- ESLint: PASS;
- editorial/source-lock/runtime-language gates: PASS;
- build: PASS;
- unit/integration: `64/64 PASS`;
- Playwright: `36 passed / 1 intentionally skipped` across desktop and mobile.

Wave 4R closes:

- natural poker-native RU/EN T1 with stable `LD-001`…`LD-010` identities;
- no competing semantic EN `moduleHeadings` override;
- no false `EN REVIEW REQUIRED` fallback on approved modules;
- human RU/EN 0→100 route rendered directly in React;
- direct localization of mode/drill/card/T1/field statuses and lab/field labels;
- high-risk EN module cleanup for LCM-02/05/06/07/09/10 while retaining strategic meaning;
- prior natural LCM-11 Wave 4R copy revalidated rather than gratuitously rewritten;
- removal of the post-render locale `MutationObserver`/`textContent` overlay;
- removal of `MutationObserver`/`textContent` state inference from the Wave 5 compatibility layer;
- canonical pre-render locale pipeline with one final language authority;
- expanded editorial and runtime gates over final learner-facing output;
- RU→EN→RU selected-decision/state identity regression coverage;
- English Cyrillic/jargon/fallback contradiction checks;
- Wave 5 prediction-first lab and mixed-practice behavior preserved.

The manual language verdict is recorded separately as `language_truth: WAVE_4R_ACCEPTED`; the deterministic gate only verifies that accepted truth has not regressed.

Full audit ledger:

`reports/WAVE_4R_LANGUAGE_TRUTH_REPAIR_LEDGER_2026-08-07.md`

## Wave 5 practice quality accepted

Accepted implementation SHA before Wave 4R:

`e54ae03627398eff09c10b87971c15d5858b3ceb`

Wave 4R preserves its accepted behavior, including three-topic mixed-practice unlock, pre-answer topic concealment, session option shuffle, prediction-before-interaction labs, material-change/invalid-input lab gates, changed-node/boundary practice and stable learner-facing identities.

## Pending product / evidence scope

Later waves still own:

- Wave 6 repair/retention/personalization routing closure;
- complete T1 end-to-end evaluation workflow beyond language truth;
- field-hand transfer workflow;
- premium visual/mobile/accessibility closure;
- failure recovery, privacy, performance and observability;
- real delayed recall, misconception repair effectiveness, confidence calibration and field-transfer evidence.

Wave 6 has **not** been started by this repair branch.

## Production evidence boundary

- Stable URL: `https://live-cash-os.elmarsal.chatgpt.site/`
- Hosting project: `appgprj_6a74674839c88191877199e34e21fc2c`
- D1 binding: `DB`
- Current Wave 4R repository branch is **not claimed deployed**.
- Exact deployed Git SHA is not exposed to available automation and is not invented.
- Authenticated production DOM smoke remains externally blocked.
- No production D1 reset, learner-state reset, URL change or migration action was performed in Wave 4R.

## Remaining P2 / external debt

- `Wave5PracticeLayer` remains a separate compatibility component. It no longer uses `MutationObserver` or `textContent`; folding the already-accepted prediction-first/mixed-practice behavior into Core is deferred because it is not required for language truth and would add regression risk in this wave.
- authenticated production DOM smoke remains external;
- package/release-version and release-tag truth remain Wave 0 debt;
- empirical learning evidence remains future-wave work.

## Severity ledger after Wave 4R

### P0

None known in accepted repository platform/strategy/language/practice scope.

### P1

None known in the Wave 4R learner-facing language/localization scope after the accepted release gate.

### P2

Only the diminishing-return/external items listed above.

## Governing rule

Automated checks may reject invalid work but cannot create poker-content, RU/EN editorial, accessibility, production-authenticated or empirical-learning approval by themselves. Wave 4R acceptance above is the explicit human review verdict after the technical gates passed.
