# Wave 4 Full Curriculum — Conformance Review

Review date: `2026-08-07`  
Reviewer: `GPT-5.6 Thinking`  
Scope: `LCM-04 / filtering`, `LCM-05 / shape`, `LCM-07 / ancestry`, `LCM-08 / multiway`, `LCM-09 / river`, `LCM-10 / evidence`, `LCM-11 / transfer`

## Current decision

`STRATEGY_REVIEWED / RU_APPROVED / EN_APPROVED / DRILLS_REBUILT / CLAIMS_ADMITTED / TECHNICAL_GATE_PENDING`

This document does **not** declare these seven modules `MODULE_GOLD` until the candidate head passes the full current-head `npm run test:release` gate.

The review is scoped to mechanism-level instruction. Exact solver grids, proprietary chart cells, exact mixed frequencies, visual-only board details, exact EV outputs and unvalidated Batumi population magnitudes remain excluded.

---

## LCM-04 — Rebuild the range after every action

Primary source support:

- `FTGU_E07_selective_vs_unselective_cbetting.md`;
- `CP_G3_L04_raising_and_beyond.md`;
- `CP_G3_L07_triple_barreling.md`;
- `CINJ_E10_exploitative_folding_in_filtered_underbluffed_nodes.md`.

Four admitted mechanism claims are stored in `content/claims/lcm-04.claims.json`.

Strategic review: **PASS for admitted scope.**

The module teaches source range → voluntary action → survivors, including protected checks, call filtering and the requirement to rebuild an exploit after the opponent chooses a continuing branch. It explicitly rejects automatic `check = capped`, blocker-first analysis and carrying a flop overfold exploit unchanged through a call.

Drills `fil-01` through `fil-05` and cards `fil-card-*` preserve their stable identities.

---

## LCM-05 — Bet size and response shape

Primary source support:

- `FTGU_E07_selective_vs_unselective_cbetting.md`;
- `FTGU_E08_call_only_strategies_vs_cbets.md`;
- `FTGU_E09_polarised_flop_raising.md`;
- `FTGU_E10_merged_flop_raising.md`;
- `CP_G2_L02_bet_sizing_and_value_tiers.md`;
- `CP_G2_L07_facing_bets_and_range_thresholds.md`;
- `CP_G3_L01_mixing_facing_bets.md`;
- `CP_G3_L02_mixing_continued_bet_check.md`.

Four admitted mechanism claims are stored in `content/claims/lcm-05.claims.json`.

Strategic review: **PASS for admitted scope.**

The module separates bet frequency from sizing, builds size from value needs, distinguishes range-wide/merged from selective/polar betting, and keeps strong robust hands in calls when the passive branch needs protection. Thin or protection raises require worse continues and/or meaningful equity denial; ease of play is not treated as sufficient theory.

Exact size menus, solver mixes and combo thresholds remain excluded.

Drills `sha-01` through `sha-05` and cards `sha-card-*` preserve their stable identities.

---

## LCM-07 — Range ancestry

Primary source support:

- `SLC_M03_L24_preflop_adjustments_vs_locked_3bet_ranges_part_1.md`;
- `SLC_M03_L25_preflop_adjustments_vs_locked_3bet_ranges_part_2.md`;
- `SLC_M03_L26_preflop_adjustments_vs_locked_3bet_ranges_part_3.md`;
- `CP_G3_L03_common_blocker_effects.md`;
- `CP_G3_L07_triple_barreling.md`;
- `CP_G3_L08_protected_checking_ranges.md`;
- `CP_G3_L09_defending_3bet_pots_oop.md`.

Four admitted mechanism claims are stored in `content/claims/lcm-07.claims.json`.

Strategic review: **PASS for admitted scope.**

The module makes preflop range composition persist through the tree. Missing preflop bluffs cannot magically reappear on later streets; over-wide ranges require postflop compensation; blockers follow ancestry; opponent reads are stored by action branch rather than as global player labels.

No fixed A5s/98s prescription or visual-dependent 4-bet boundary is admitted.

Drills `anc-01` through `anc-05` and cards `anc-card-*` preserve their stable identities.

---

## LCM-08 — Multiway action order and shared defence

Primary source support:

- `SLC_M04_L36_multiway_sandwich_and_triton_hand_analysis.md`;
- `SLC_M04_L39_low_connected_flops_multiway.md`;
- `SLC_M04_L40_multiway_flop_mechanics_kt9ss_part_1.md`;
- `SLC_M04_L41_multiway_flop_mechanics_kt9ss_part_2.md`.

Four admitted mechanism claims are stored in `content/claims/lcm-08.claims.json`.

Strategic review: **PASS for admitted scope.**

The module teaches shared defence, sandwich pressure, closing-action value and source-range ownership. It explicitly rejects both `play multiway like heads-up` and the opposite overcorrection `multiway = always passive`. Action order can create aggressive closing-player branches, while low connected boards can transfer top-end ownership away from the preflop raiser.

No exact multiway MDF, solver frequency or fixed c-bet size is admitted.

Drills `mul-01` through `mul-05` and cards `mul-card-*` preserve their stable identities.

---

## LCM-09 — River value, bluffs and blockers

Primary source support:

- `CP_G2_L04_river_play_and_scattered_aggression.md`;
- `CP_G2_L08_bluff_catching_system.md`;
- `CP_G3_L03_common_blocker_effects.md`;
- `CP_G3_L05_calling_bets.md`;
- `SLC_M02_L20_bluff_catchers_big_money.md`;
- `CINJ_E05_origin_range_width_and_bluff_density.md`;
- `CINJ_E10_exploitative_folding_in_filtered_underbluffed_nodes.md`.

Four admitted mechanism claims are stored in `content/claims/lcm-09.claims.json`.

Strategic review: **PASS for admitted scope.**

The learner-facing order is:

```text
ORIGIN RANGE
→ ACTION FILTERS
→ VALUE
→ NATURAL BLUFFS
→ SIZE
→ BLOCKER FUNCTIONS
→ BRANCH EVIDENCE
```

The module distinguishes value beaters, bluff catchers and frail hands, and explains why a nut-looking blocker can make a call worse when it removes the bluff region. Source-supported underbluff mechanisms can justify exploitative folds, but exact Batumi population magnitude remains field-gated.

Drills `riv-01` through `riv-05` and cards `riv-card-*` preserve their stable identities.

---

## LCM-10 — Reads and evidence discipline

Primary authorities:

- `CP_G2_L08_bluff_catching_system.md`;
- `CP_G3_L05_calling_bets.md`;
- `CINJ_E05_origin_range_width_and_bluff_density.md`;
- `CINJ_E10_exploitative_folding_in_filtered_underbluffed_nodes.md`;
- `governance/CROSS_SOURCE_VALIDATION_AND_ADMISSION_FRAMEWORK_v0_1.md`.

Four admitted mechanism claims are stored in `content/claims/lcm-10.claims.json`.

Strategic/epistemic review: **PASS for admitted scope.**

The module does not invent a statistical sample-size theorem. It uses a conservative evidence rule: one showdown establishes that a hand/line can exist, not its stable frequency; reads stay attached to position/action/size/branch; source population ideas are priors whose magnitude remains unvalidated for Batumi; field evidence may change exploit weighting without silently rewriting source truth.

Drills `evi-01` through `evi-05` and cards `evi-card-*` preserve their stable identities.

---

## LCM-11 — From correct now to table transfer

Primary authorities:

- `apps/live-cash-os/lib/model-core.ts`;
- `governance/CROSS_SOURCE_VALIDATION_AND_ADMISSION_FRAMEWORK_v0_1.md`.

Four admitted product-contract claims are stored in `content/claims/lcm-11.claims.json`.

Learning-governance review: **PASS for admitted scope.**

This module explains the current evidence semantics implemented by the product rather than pretending they are universal scientific mastery thresholds:

- content completion records exposure, not mastery;
- variant transfer requires an explicit changed-node probe with material changed variables;
- retention is recorded only on a due delayed review;
- raw real-hand notes do not create field evidence;
- current `FIELD_VALIDATED` requires reviewed field successes together with retention and variant-transfer evidence.

The exact numeric thresholds may be recalibrated after Wave 10 sustained-use evidence without collapsing these dimensions.

Drills `tra-01` through `tra-05` and cards `tra-card-*` preserve their stable identities.

---

# RU / EN editorial review

**RU: PASS for all seven modules.**

The new Russian copy was rewritten as natural learner-facing poker Russian rather than preserving the old mixed architecture language. Primary explanations now avoid phrases such as `Players-behind gate`, `node signature`, `jobless bluff`, `arrival range`, `credible bluff supply` and similar internal construction jargon.

**EN: PASS for all seven modules.**

English is independently natural, preserves the same assumptions and exclusions, and contains no Cyrillic fallback in the Wave 4 gold layer.

# Drill, card and lab review

**PASS for the current module-gold slice.**

- 35 stable Wave 4 drills are rewritten with stated assumptions;
- 21 stable Wave 4 flashcards are rewritten;
- each module retains a meaningful compare lab;
- old correct-action, reason-option and misconception IDs remain unchanged;
- exact source boards and proprietary examples are not copied into learner-facing text.

Broader Wave 5 requirements for larger variant matrices, option-order anti-memorisation, expanded boundary volume and prediction-before-reveal lab behavior remain a separate wave and are not claimed complete here.

# Identity and learner-state integrity

The Wave 4 implementation changes learner-facing copy only. It preserves:

- all seven module IDs;
- 35 drill IDs;
- all action and reason option IDs;
- misconception IDs;
- 21 flashcard IDs;
- prerequisite structure;
- learner-state schema and model-core semantics.

No migration or global learner-state reset is required.

`tests/wave4-full-curriculum-gold.test.mjs` is designed to verify RU → EN → RU identity stability, locale purity, the seven module mechanisms and all 28 Wave 4 claim records.

# Technical gate pending

Before final Wave 4 admission, the exact candidate head must pass:

- TypeScript;
- ESLint;
- editorial integrity and source locks;
- production build;
- unit/integration tests;
- desktop/mobile Playwright through `npm run test:release`.

## Current verdict

`WAVE_4_REVIEW_COMPLETE / TECHNICAL_GATE_PENDING`

No `MODULE_GOLD` decision for LCM-04/05/07/08/09/10/11 is recorded until that gate is green.
