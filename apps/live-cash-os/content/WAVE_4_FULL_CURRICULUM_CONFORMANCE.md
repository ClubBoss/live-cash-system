# Wave 4 Full Curriculum — Conformance Review

Review date: `2026-08-07`  
Reviewer: `GPT-5.6 Thinking`  
Scope: `LCM-04 / filtering`, `LCM-05 / shape`, `LCM-07 / ancestry`, `LCM-08 / multiway`, `LCM-09 / river`, `LCM-10 / evidence`, `LCM-11 / transfer`

## Final decision

`MODULE_GOLD / TECHNICAL_GATE_GREEN / WAVE_4_ACCEPTED`

Accepted implementation SHA: `5a6af4ed4f8d8e5e985950c71cbc6c6ba40efe86`  
Full release run: `31164756544`  
Validation job: `92822910319`

The exact accepted implementation passed the canonical `npm run test:release` gate from a clean GitHub Actions checkout:

- TypeScript: PASS;
- ESLint: PASS;
- editorial integrity/source locks: PASS — `11 bilingual gold modules approved; 0 pending`;
- production build: PASS;
- unit/integration: `55/55 PASS`;
- Playwright: `21 passed / 1 intentionally skipped` across desktop and mobile projects;
- browser evidence upload: skipped because the browser suite did not fail.

No production publish, D1 mutation, learner-state reset, URL change, or schema migration was performed as part of Wave 4.

The admission is deliberately mechanism-scoped. Exact solver grids, proprietary chart cells, exact mixed frequencies, visual-only board details, exact EV outputs, exact multiway MDF, and unvalidated Batumi population magnitudes remain excluded.

---

## LCM-04 — Rebuild the range after every action

Primary support:

- `FTGU_E07_selective_vs_unselective_cbetting.md`;
- `CP_G3_L04_raising_and_beyond.md`;
- `CP_G3_L07_triple_barreling.md`;
- `CINJ_E10_exploitative_folding_in_filtered_underbluffed_nodes.md`.

Four admitted claims: `content/claims/lcm-04.claims.json`.

Decision: `MODULE_GOLD` for source range → action → survivors, protected checks, call filtering, and branch-specific exploit reset. The module rejects automatic `check = capped`, blocker-first analysis, and carrying a prior-street exploit unchanged through a continuing action.

Stable drills `fil-01`–`fil-05` and cards `fil-card-*` are preserved.

## LCM-05 — Bet size and response shape

Primary support:

- `FTGU_E07_selective_vs_unselective_cbetting.md`;
- `FTGU_E08_call_only_strategies_vs_cbets.md`;
- `FTGU_E09_polarised_flop_raising.md`;
- `FTGU_E10_merged_flop_raising.md`;
- `CP_G2_L02_bet_sizing_and_value_tiers.md`;
- `CP_G2_L07_facing_bets_and_range_thresholds.md`;
- `CP_G3_L01_mixing_facing_bets.md`;
- `CP_G3_L02_mixing_continued_bet_check.md`.

Four admitted claims: `content/claims/lcm-05.claims.json`.

Decision: `MODULE_GOLD` for value-driven sizing, frequency/size separation, range-wide versus selective response shape, thin value/equity-denial gates, and protected calling ranges. Exact size menus, solver mixes and combo thresholds remain excluded.

Stable drills `sha-01`–`sha-05` and cards `sha-card-*` are preserved.

## LCM-07 — Range ancestry

Primary support:

- `SLC_M03_L24_preflop_adjustments_vs_locked_3bet_ranges_part_1.md`;
- `SLC_M03_L25_preflop_adjustments_vs_locked_3bet_ranges_part_2.md`;
- `SLC_M03_L26_preflop_adjustments_vs_locked_3bet_ranges_part_3.md`;
- `CP_G3_L03_common_blocker_effects.md`;
- `CP_G3_L07_triple_barreling.md`;
- `CP_G3_L08_protected_checking_ranges.md`;
- `CP_G3_L09_defending_3bet_pots_oop.md`.

Four admitted claims: `content/claims/lcm-07.claims.json`.

Decision: `MODULE_GOLD` for preflop-to-postflop range ancestry, inherited bluff supply, blocker ordering, and action-specific opponent models. No fixed A5s/98s prescription or visual-dependent 4-bet boundary is admitted.

Stable drills `anc-01`–`anc-05` and cards `anc-card-*` are preserved.

## LCM-08 — Multiway action order and shared defence

Primary support:

- `SLC_M04_L36_multiway_sandwich_and_triton_hand_analysis.md`;
- `SLC_M04_L39_low_connected_flops_multiway.md`;
- `SLC_M04_L40_multiway_flop_mechanics_kt9ss_part_1.md`;
- `SLC_M04_L41_multiway_flop_mechanics_kt9ss_part_2.md`.

Four admitted claims: `content/claims/lcm-08.claims.json`.

Decision: `MODULE_GOLD` for sandwich pressure, closing-action value, shared defence, and source-range ownership. It explicitly rejects both `play multiway like heads-up` and `multiway = always passive`. Exact multiway MDF and fixed solver frequencies remain excluded.

Stable drills `mul-01`–`mul-05` and cards `mul-card-*` are preserved.

## LCM-09 — River value, bluffs and blockers

Primary support:

- `CP_G2_L04_river_play_and_scattered_aggression.md`;
- `CP_G2_L08_bluff_catching_system.md`;
- `CP_G3_L03_common_blocker_effects.md`;
- `CP_G3_L05_calling_bets.md`;
- `SLC_M02_L20_bluff_catchers_big_money.md`;
- `CINJ_E05_origin_range_width_and_bluff_density.md`;
- `CINJ_E10_exploitative_folding_in_filtered_underbluffed_nodes.md`.

Four admitted claims: `content/claims/lcm-09.claims.json`.

Decision: `MODULE_GOLD` for the river audit:

```text
ORIGIN RANGE
→ ACTION FILTERS
→ VALUE
→ NATURAL BLUFFS
→ SIZE
→ BLOCKER FUNCTIONS
→ BRANCH EVIDENCE
```

The module distinguishes value beaters, bluff catchers and frail hands, and teaches that a blocker can worsen a call by removing the natural bluff region. Exact population underbluff magnitude remains field-gated.

Stable drills `riv-01`–`riv-05` and cards `riv-card-*` are preserved.

## LCM-10 — Reads and evidence discipline

Primary authorities:

- `CP_G2_L08_bluff_catching_system.md`;
- `CP_G3_L05_calling_bets.md`;
- `CINJ_E05_origin_range_width_and_bluff_density.md`;
- `CINJ_E10_exploitative_folding_in_filtered_underbluffed_nodes.md`;
- `governance/CROSS_SOURCE_VALIDATION_AND_ADMISSION_FRAMEWORK_v0_1.md`.

Four admitted claims: `content/claims/lcm-10.claims.json`.

Decision: `MODULE_GOLD` for branch-specific evidence discipline. One showdown establishes possibility, not stable frequency; reads remain tied to position/action/size/branch; external population priors do not become proven Batumi magnitudes without local evidence.

The final Russian editorial layer removes raw internal status vocabulary from learner-facing copy while preserving the approved English meaning.

Stable drills `evi-01`–`evi-05` and cards `evi-card-*` are preserved.

## LCM-11 — From correct now to table transfer

Primary authorities:

- `apps/live-cash-os/lib/model-core.ts`;
- `governance/CROSS_SOURCE_VALIDATION_AND_ADMISSION_FRAMEWORK_v0_1.md`.

Four admitted product-contract claims: `content/claims/lcm-11.claims.json`.

Decision: `MODULE_GOLD` for explaining the current Live Cash OS evidence contract:

- content completion is exposure, not mastery;
- variant transfer requires an explicit materially changed assessment;
- retention requires a due delayed review;
- raw real-hand notes do not create field validation;
- several reviewed field supports plus transfer and retention are required by the current product model.

These are product integrity rules, not claims that the present numeric thresholds are universal learning-science truths. Wave 10 may recalibrate thresholds without collapsing the distinct evidence dimensions.

Stable drills `tra-01`–`tra-05` and cards `tra-card-*` are preserved.

---

## RU / EN editorial decision

- RU: `APPROVED` for all seven Wave 4 modules.
- EN: `APPROVED` for all seven Wave 4 modules.
- English Wave 4 gold contains no Cyrillic fallback.
- Russian final LCM-10/11 output rejects raw system vocabulary such as `learner state`, `transfer probe`, `PENDING_REVIEW`, `FIELD_VALIDATED`, and related implementation labels.
- Stable semantic identities are shared across locales.

## Drill, card and lab boundary

Accepted for Wave 4 module-gold scope:

- 35 Wave 4 drills with stable IDs and stated assumptions;
- 21 Wave 4 flashcards with stable IDs;
- seven compare labs retained;
- action/reason option IDs and misconception IDs preserved;
- proprietary source examples and visual solver grids are not copied into learner-facing content.

Not claimed complete here, because it belongs to Wave 5:

- larger variant matrices;
- mixed-practice topic concealment;
- prediction-before-reveal lab behavior;
- full ambiguity/hidden-assumption audit;
- expanded honest-uncertainty and boundary coverage;
- corpus-wide flashcard/practice quality closure.

## Learner-state integrity

Wave 4 preserves:

- all module IDs;
- all drill IDs;
- all action/reason option IDs;
- misconception IDs;
- all flashcard IDs;
- prerequisite structure;
- learner-state schema and model-core semantics.

No migration or global learner-state reset is required.

## Final verdict

`WAVE_4_FULL_CURRICULUM_GOLD_ACCEPTED`

This verdict applies to repository curriculum truth at implementation SHA `5a6af4ed4f8d8e5e985950c71cbc6c6ba40efe86`. It does not claim that this Wave 4 source has been deployed to production, and it does not close Wave 5 practice-quality or Wave 10 empirical-learning gates.
