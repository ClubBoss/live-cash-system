# Wave 3 Priority Modules — Conformance Review

Review date: `2026-08-07`  
Reviewer: `GPT-5.6 Thinking`  
Scope: `LCM-02 / preflop`, `LCM-03 / blinds`, `LCM-06 / aggression`

## Final decision

`LCM-02_MODULE_GOLD / LCM-03_MODULE_GOLD / LCM-06_MODULE_GOLD`

Accepted source SHA: `a364406196ebac485e2565eb84fb513e6567332e`  
GitHub Actions run: `31154078759`  
Job: `92789681545`  
Technical gate: `PASS`

The gold decision is scoped to the mechanism claims and exclusions documented below. It does not promote exact chart cells, mixed frequencies, solver boards or unverified population frequencies.

## Why these three modules were prioritised

They map directly to the current live-cash pain points:

- preflop branch selection without memorising a large chart library;
- SB versus BB defence and closing-action logic;
- deep and OOP 3-bet-pot aggression/defence against ranges that are tighter or wider than baseline.

The reconstruction intentionally removes exact hand-cell prescriptions when the available source package does not support them without visual review.

---

# LCM-02 — Preflop structure for live cash

## Source map

Primary sources:

- `SLC_M01_L01_preflop_101.md`;
- `SLC_M01_L02_preflop_squeezing.md`;
- `SLC_M01_L03_preflop_adjustments.md`;
- `FTGU_E06_sb_3bet_or_fold_strategies.md`;
- `FTGU_E15_polar_vs_linear_3betting.md`.

Four admitted mechanism claims are stored in `content/claims/lcm-02.claims.json`.

## Strategic review

PASS for the admitted scope.

The module teaches:

1. baseline chart shape before deviation;
2. call quality as an independent branch;
3. players-behind and squeeze exposure;
4. linear versus polar 3-betting by fold equity and call-range viability;
5. source-backed squeeze purification rather than arbitrary bluff expansion;
6. the directional depth shift from protected/deep calls toward more direct shorter-stack aggression.

### Important exclusions

- no exact mixed-frequency chart cell is taught;
- no fixed A5s or suited-connector prescription is admitted merely from the hand name;
- exact squeeze sizes and 100/200/400bb combo boundaries remain visual-dependent;
- rake, sizing and opponent continuation remain explicit branch variables.

## Drill review

PASS.

Five stable drills remain under IDs `pre-01` through `pre-05`.

The old hybrid or potentially over-specific framing was replaced by fully stated branch conditions. The correct answer is based on a source-supported mechanism rather than a chart-memory signal.

## RU editorial review

PASS.

Removed or avoided learner-facing constructions such as:

- `Value squeeze core`;
- `realisation/implied odds` hybrids;
- unexplained `fold targets`;
- chart-cell language that sounds universal.

## EN editorial review

PASS.

English is independently natural and preserves the same assumptions, exclusions and uncertainty.

## Decision

`MODULE_GOLD` for branch-construction scope.

---

# LCM-03 — Blind source and range identity

## Source map

Primary sources:

- `FTGU_E05_calling_out_of_the_big_blind.md`;
- `FTGU_E06_sb_3bet_or_fold_strategies.md`;
- `SLC_M02_L05_big_blind_vs_small_blind.md`.

Four admitted mechanism claims are stored in `content/claims/lcm-03.claims.json`.

## Strategic review

PASS for the admitted scope.

The module distinguishes:

- BB price from the already posted blind;
- BB closing-action value;
- SB squeeze exposure and positional cost;
- raw equity from realised equity;
- source-range identity on identical flops;
- field updates from repeated observation without erasing structural position effects.

The learner is not told that `SB never calls` or that `BB always defends wide`. Both are explicitly scoped by size, rake, opener range, player behind and execution quality.

## Drill review

PASS.

Five stable drills remain under IDs `bli-01` through `bli-05`.

The tasks test action order, price, realisation and source range rather than memorised chart cells.

## RU editorial review

PASS.

`Closing action` is translated as `закрыть торговлю`; `equity realisation` is explained as `реализация эквити`; internal `source range` and `players-behind gate` language was removed from primary copy.

## EN editorial review

PASS.

No Cyrillic fallback is part of the reviewed module copy.

## Decision

`MODULE_GOLD` for blind-source and realisation scope.

---

# LCM-06 — Aggression and defence in 3-bet pots

## Source map

Primary sources:

- `SLC_M03_L25_preflop_adjustments_vs_locked_3bet_ranges_part_2.md`;
- `SLC_M03_L26_preflop_adjustments_vs_locked_3bet_ranges_part_3.md`;
- `FTGU_E28_high_frequency_betting_3bet_pots.md`;
- `FTGU_E29_selective_strategies_3bet_pots.md`;
- `CP_G3_L09_defending_3bet_pots_oop.md`.

Four admitted mechanism claims are stored in `content/claims/lcm-06.claims.json`.

## Strategic review

PASS for the admitted scope.

The module is explicitly about the connection:

```text
PREFLOP 3-BET RANGE SHAPE
→ FLOP OWNERSHIP
→ BET FREQUENCY / SIZE
→ CALL FILTER
→ TURN REBUILD
→ OOP RAISE VALUE GATE
```

It teaches:

- why an over-wide 3-bet range must check more;
- why preserving a stronger range's c-bet frequency can create an over-bluffed branch;
- why dry high-card/paired boards can support frequent small betting from a normal premium-dense range;
- why coordinated middling boards require more selective betting;
- why a flop range bet does not transfer automatically to the turn after a call;
- why OOP raising needs credible top-end value before denial or bluff candidates are added.

### Important exclusions

- exact board matrices;
- exact c-bet percentages;
- exact bet sizes;
- exact solver EVs;
- exact top-end tier boundaries;
- exact low-SPR jam combos.

All remain claim-driven visual-review items.

## Drill review

PASS.

Five stable drills remain under IDs `agg-01` through `agg-05`.

The previous broad `aggression with a job` framing was narrowed to the 3-bet-pot mechanisms most relevant to current live-cash transfer.

## RU editorial review

PASS.

The primary copy no longer relies on `jobless bluff`, `node`, `gate`, `arrival range`, or other architecture jargon to explain the decision.

## EN editorial review

PASS.

The English copy preserves the compensation, filtering and OOP top-end-value boundaries without claiming exact solver outputs.

## Decision

`MODULE_GOLD` for 3-bet-pot aggression/defence mechanism scope.

---

# Identity and state integrity

PASS.

The reconstruction preserves:

- module IDs: `preflop`, `blinds`, `aggression`;
- all existing drill IDs;
- all action/reason option IDs;
- all misconception IDs;
- all flashcard IDs;
- prerequisite structure;
- learner-state semantics.

No migration or global learner-state reset is required.

## Regression coverage

`tests/wave3-priority-gold.test.mjs` verifies:

- RU → EN → RU locale switching preserves all stable IDs;
- English learner-facing gold contains no Cyrillic copy;
- Russian gold rejects the old hybrid terminology;
- LCM-02 does not reintroduce unsupported fixed chart-cell claims;
- LCM-03 preserves BB closing-action versus SB squeeze-exposure logic;
- LCM-06 connects preflop range width to postflop aggression and OOP raise construction;
- all three claim ledgers satisfy the claim-schema boundary.

The editorial gate requires:

- 15 Wave 3 drill IDs;
- 9 Wave 3 card IDs;
- manifest approval only for LCM-01/02/03/06;
- all remaining modules to stay `PENDING`.

## Runtime editorial-status boundary

PASS after runtime repair.

An initial Wave 3 implementation observed the full React subtree and called direct text-localisation mutations during React reconciliation. Browser evidence from failed run `31153052675` showed:

```text
NotFoundError: Failed to execute 'removeChild' on 'Node'
```

This was not accepted or hidden. The final implementation separates responsibilities:

- `attributeObserver` reacts only to `lang` / `aria-current` changes and may apply locale copy;
- `structureObserver` reacts to structural/text replacement only by applying safe `data-editorial-gold` markers;
- it never performs learner-text mutation;
- approved LCM-01/02/03/06 surfaces hide the generic pending-English banner;
- pending modules retain the fallback notice.

The original LCM-01 feedback/reload E2E paths pass again in the accepted run.

## Technical verification

Current-head release gate: PASS.

- Source SHA: `a364406196ebac485e2565eb84fb513e6567332e`
- GitHub Actions run: `31154078759`
- Job: `92789681545`
- TypeScript: PASS
- ESLint: PASS
- Editorial integrity: PASS
- Production build: PASS
- Unit/integration: PASS
- Desktop/mobile Playwright: PASS
- Failure evidence upload: skipped because E2E passed

## Final admission

```text
LCM-02 source mapped: PASS
LCM-02 strategy reviewed: PASS
LCM-02 RU approved: PASS
LCM-02 EN approved: PASS
LCM-02 drills approved: PASS
LCM-02 identity/state integrity: PASS
LCM-02 technical gate: PASS
LCM-02 decision: MODULE_GOLD

LCM-03 source mapped: PASS
LCM-03 strategy reviewed: PASS
LCM-03 RU approved: PASS
LCM-03 EN approved: PASS
LCM-03 drills approved: PASS
LCM-03 identity/state integrity: PASS
LCM-03 technical gate: PASS
LCM-03 decision: MODULE_GOLD

LCM-06 source mapped: PASS
LCM-06 strategy reviewed: PASS
LCM-06 RU approved: PASS
LCM-06 EN approved: PASS
LCM-06 drills approved: PASS
LCM-06 identity/state integrity: PASS
LCM-06 technical gate: PASS
LCM-06 decision: MODULE_GOLD
```

Any subsequent strategic or learner-facing content change invalidates the affected approval until the relevant source lock and review are renewed.
