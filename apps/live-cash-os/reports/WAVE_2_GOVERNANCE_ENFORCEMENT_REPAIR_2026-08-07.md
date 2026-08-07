# Wave 2 Governance Enforcement Repair — 2026-08-07

Branch: `repair/w2-governance-enforcement`
Baseline `origin/main`: `26b1dec72822a706f82cf485042c18e166397bdd`
Lifecycle-reconciliation old head: `c9be010589e790efd3875a35573d23c8e2b55357`
Baseline CI: `Live Cash OS CI` run `31175320582` — `success`
Scope: Wave 2 governance only. No learner-facing copy, T1 copy, learning route, `LiveCashApp/Core`, Wave 5 practice implementation, W3 claim/drill repair or W4R integration.

## Original Wave 2 enforcement repair

The first Wave 2 repair established:

- machine-readable source-gap dependencies;
- corpus-wide LOW/UNRESOLVED and OPEN_QUESTION rejection;
- human-only locale approval evidence;
- rejection-only automation;
- upper-ledger versus manifest truth checks;
- corpus-fingerprint invalidation of stale locale approval;
- `TRANSITIONAL_*` language review instead of fabricated bilingual approval.

That repair correctly prevented stale language approval, but its strategy model still hard-required `CURRICULUM_STRATEGY_GOLD` and its editorial source lock treated every locked mutation as invalid. The independent Wave 3 revalidation exposed the missing lifecycle state.

## Reconciliation trigger

Source truth:

- W3 branch: `audit/w3-strategy-revalidation`;
- W3 head: `c30facc624ff208862a65083f96dc51a87601ee0`;
- W3 verdict: `WAVE_3_STRATEGY_REPAIR_REQUIRED`;
- affected strategy modules: LCM-02 / LCM-03 / LCM-06;
- affected drill-semantic modules: LCM-02 / LCM-06;
- final W4R handoff head observed for integration context only: `9b5b5a997663bd381857f1e06a2edeadd7b20c1a`;
- W4R is not integrated by this branch.

## Root cause

The previous locking design conflated approval protection with content immutability:

- a locked source mutation made `editorial-check` RED even after a legitimate P1 was found;
- there was no representable strategy `REPAIR_REQUIRED` / `REVIEW_PENDING` state;
- drill semantic approval had no equivalent repair lifecycle;
- full acceptance had no explicit final learner-facing composition digest requirement.

The correct rule is that old approval is immutable evidence for the old reviewed version, while the content itself may be repaired. A legal repair must invalidate active approval before mutation, permit only explicitly scoped stale source locks during candidate work, and remain non-releasable until re-review and re-lock.

## Lifecycle reconciliation implemented

### Strategy

`CURRICULUM_STRATEGY_GOLD`
→ `CURRICULUM_STRATEGY_REPAIR_REQUIRED`
→ `CURRICULUM_STRATEGY_REVIEW_PENDING`
→ `CURRICULUM_STRATEGY_GOLD`

Current branch truth is `CURRICULUM_STRATEGY_REPAIR_REQUIRED`; active strategy approval evidence is `null`.

### Drill/content

`DRILLS_APPROVED`
→ `DRILLS_REPAIR_REQUIRED`
→ `DRILLS_REVIEW_PENDING`
→ `DRILLS_APPROVED`

Current branch truth is `DRILLS_REPAIR_REQUIRED`; active drill approval evidence is `null`.

### Top-level acceptance

- `TRANSITIONAL_REVIEW_REQUIRED` is the legal candidate state while any strategy, drill, locale or final-composition review is open.
- `FULLY_ACCEPTED` requires strategy gold, drill approval, all locale approvals, no contradictory upper-ledger repair state and a current approved final-composition digest.

## Candidate source-lock behavior

Git stale detection is retained.

During `REPAIR_REQUIRED` / `REVIEW_PENDING`, a changed source blob is accepted by the candidate gate only when its path is explicitly listed under the matching `repair_source_paths` group. Any other stale source lock remains a hard failure.

The current W3 repair allowance is intentionally narrow:

Strategy paths:

- `content/claims/lcm-02.claims.json`;
- `content/claims/lcm-03.claims.json`;
- `content/claims/lcm-06.claims.json`.

Drill path:

- `content/i18n/wave3-priority-gold.ts`.

No W4R language repair paths are admitted here.

## Approval invalidation rules

- strategy/drill repair or review state cannot retain active strategy/drill approval evidence;
- drill semantic repair forces affected RU/EN locale rows back to `REVIEW_REQUIRED`;
- a changed corpus fingerprint invalidates prior human evidence;
- refreshing `source_blobs` does not carry old approval forward;
- an open strategy/drill repair cannot retain a `CURRENT` approved final composition;
- `FULLY_ACCEPTED` rejects a stale or missing final learner-facing composition digest;
- reviewer kind other than `HUMAN` cannot satisfy an approval transition;
- deterministic scripts remain rejection-only and cannot write approval truth.

## Candidate gate versus full-approval gate

`npm run check:governance` and `npm run check:editorial` are candidate rejection gates. They may be GREEN in an honest repair state.

`npm run check:approval` is the explicit full-approval gate. It invokes governance and editorial checks in release mode and must remain RED while the current W3 strategy/drill repair, language review or final-composition review is unresolved.

`npm run test:release` remains the canonical technical candidate test suite; a technical GREEN result is not an approval transition.

## Regression evidence

Targeted local lifecycle suite after reconciliation:

- `node --test tests/governance-enforcement.test.mjs`;
- 14/14 PASS.

Covered regressions include:

- `GOLD -> REPAIR_REQUIRED` is legal;
- semantic/hash mutation invalidates old approval;
- scoped stale source lock passes candidate governance in repair state;
- unscoped stale source lock fails;
- release/full approval fails in `REPAIR_REQUIRED` and `REVIEW_PENDING`;
- automated reviewer evidence cannot promote `REVIEW_PENDING -> APPROVED`;
- hash refresh cannot carry old approval evidence forward;
- `FULLY_ACCEPTED` rejects stale final-composition digest;
- deterministic governance/editorial scripts cannot write approval truth.

## Validation boundary

The execution environment used for this reconciliation has GitHub connector access but no local repository checkout, no network DNS to clone GitHub, and no GitHub Actions workflow-dispatch capability. The repository workflow is `main`-only. Therefore the exact reconciliation head cannot obtain a branch CI run from this environment without changing the CI workflow, which is outside this repair scope.

`npm run test:release` was invoked against the local governance-only reconstruction. It stopped at `tsc --noEmit` because that reconstruction intentionally does not contain the repository `tsconfig.json` or application checkout. This is an environment/checkout limitation, not release evidence and not a code PASS/FAIL claim for the repository.

The branch must not be called full release-green until `npm run test:release` is executed on the exact reconciliation head by an environment with the repository checkout/dependencies or by an explicitly triggered CI run.

## Current acceptance boundary

This repair is intended only to unblock lawful W3 mutation without weakening approval protection. It does not repair W3 content, integrate W4R, create human approval, calculate the final resolved learner composition digest, or restore `MODULE_GOLD`.

Target state after this reconciliation: `GOVERNANCE_READY_FOR_W3_REPAIR`, subject to exact-head technical release validation evidence.
