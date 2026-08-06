# Multiway Action-Order Wave QA v1

Date: 2026-08-06  
Status: `ACCEPTED / FULL_DIRECTIONAL_WAVE_COMPLETE`

## Scope

Audit the full multiway wave:

1. source-evidence continuity;
2. action-order roles;
3. shared-defence boundary;
4. nut-ownership compression;
5. multiway bluff support;
6. field-clear and delayed aggression;
7. fast-play/protect overlay;
8. original direct drills;
9. SSOT and readiness updates.

## Source-evidence QA

Primary Smash support:

- `SLC-M04-L36` through `L41`;
- `SLC-M05-L47`.

Cross-source support:

- `CP-G2-L05` OOP future-action and robustness;
- `CP-G2-L10` bet shape to raise breadth;
- `CP-G3-L04` call filtering and class migration;
- `CP-G3-L08` protected checking and aggression arrival;
- `FTGU-E20` prior-action turn probing;
- `FTGU-E27` protected range checking.

Checks:

- all directional mechanisms are directly supported or labelled system synthesis;
- exact frequencies, suits, sizes and combo matrices remain excluded;
- heads-up FTGU mechanisms are marked context splits rather than multiway proof;
- population magnitude remains field-gated.

Result: `PASS`.

## Role-map QA

Five roles are mutually useful:

- opening actor;
- middle/sandwiched actor;
- closing actor;
- reopener after new information;
- survivor after field clear.

Changed-position testing confirms that identical hands can require different defence/raise widths when moved from middle to closing action.

Result: `PASS`.

## Shared-defence QA

The architecture does not use a fabricated multiway MDF.

It correctly states directional burden:

```text
closing action
> middle with capped player behind
> middle with uncapped player behind
```

It also defines exceptions where the player behind is capped, unable to raise or effectively absent.

Result: `PASS`.

## Ownership QA

The OPAL audit preserves four distinct inputs:

- offsuit nuts;
- premiums retained/removed;
- action order;
- low-card/suited coverage.

It prevents:

- initiative entitlement;
- blind/cold-caller collapse;
- deletion of observed loose live combos;
- focus on rare suited edge instead of high-weight offsuit mass.

Result: `PASS`.

## Bluff-support QA

The hierarchy separates:

- equity/removal-rich candidates;
- conditional backdoor/gutter/low-card candidates;
- exploit-only low-equity air;
- rejected heads-up imports.

Every candidate must survive the question:

`What if only the first opponent folds?`

Result: `PASS`.

## Delayed-aggression QA

The gate requires:

1. identifiable suppressed flop aggression;
2. field clear or lost raising rights;
3. surviving value region;
4. supported bluffs;
5. turn ownership recheck;
6. coherent size.

This distinguishes:

- heads-up probe after check-back;
- multiway delayed lead after player-behind suppression;
- random turn-card-only aggression.

Result: `PASS`.

## Fast-play/protect QA

The method asks who is expected to supply future aggression and whether that behaviour is credible.

- passive closing player: move value forward;
- credible aggressor: retain protected checks/traps;
- magnitude: field-gated.

No global `live players are passive` rule is admitted.

Result: `PASS`.

## Drill QA

The original pack includes 20 changed-node questions across:

- middle versus closing action;
- ownership and initiative traps;
- bluff-support tiers;
- field-clear transitions;
- delayed value and bluff;
- call-call barrels;
- fast-play/protect opponent switches.

Release criteria require action, reason, role, filter and confidence.

Effect:

```text
H-R04-007 direct answer key: active
direct candidate coverage: 33/34
remaining gap: H-W01-006
```

Result: `PASS`.

## Candidate/readiness QA

- candidate count remains `34`;
- statuses remain `28 DRILL_READY / 6 VALIDATION_PENDING`;
- admitted remains `0`;
- direct coverage rises `32 -> 33`;
- `LCM-08` becomes ready directionally;
- no exact solver or field promotion.

Result: `PASS`.

## Visual-dependency decision

No targeted visual review is required to activate the directional `H-R04-007` drill because the mechanism is explicit in recovered audio and cross-source action-filter logic.

Visual review becomes mandatory only if a future output depends on:

- exact lead size;
- exact hand-frequency boundary;
- exact three-way/four-way scaling;
- exact EV difference.

Result: `NO CURRENT VISUAL BLOCKER`.

## Known limitations

- exact multiway defence frequencies absent;
- exact lead/check-raise matrices absent;
- unequal-stack and side-pot architecture not closed;
- Batumi aggression/elasticity unknown;
- learner error probability not measured;
- deep OOP direct gap remains.

## Stop decision

Do not spend the next wave recreating exact multiway solver grids. The higher-EV unresolved transaction is the deep OOP protected-call and depth/SPR boundary, which can close direct coverage to `34/34`.

## QA verdict

`MULTIWAY_ACTION_ORDER_FULL_DIRECTIONAL_WAVE_ACCEPTED`

`H_R04_007_DIRECT_ANSWER_KEY_ACCEPTED`

`LCM_08_READY_DIRECTIONALLY`

`DIRECT_COVERAGE_33_OF_34`

`DEEP_OOP_NEXT`
