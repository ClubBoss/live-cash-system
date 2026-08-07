# Wave 5 Integration Debt - Temporary Practice Host Architecture

Date: 2026-08-07
Branch: `repair/w5-practice-closure`
Green base: `26b1dec72822a706f82cf485042c18e166397bdd`

## Decision

`DO_NOT_REFACTOR_CORE_IN_PARALLEL_WITH_WAVE_4R`

`POST_W4R_NORMAL_REACT_CONTRACT_REQUIRED`

The current `Wave5PracticeLayer.tsx` behavior is green and preserves practice semantics, but it is a temporary integration bridge rather than a final component contract. No large Core refactor is performed in this branch because Wave 4R owns overlapping learner-facing/runtime localisation surfaces.

The closure action is therefore an exact post-W4R integration plan, not an opportunistic parallel rewrite.

## Current bridge inventory

### 1. Direct learner-state storage read

`Wave5PracticeLayer` reads `live-cash-os:learner-state` directly from `localStorage` to infer:

- active module ID;
- completed-module count.

Fragility:

- duplicates state interpretation outside the Core React tree;
- bypasses the normal migration/model contract;
- `storage` events do not fire in the same document that performs the write;
- the layer therefore relies indirectly on DOM mutations to notice many same-page state changes.

Target state: Core passes explicit state-derived props. The practice component should not parse persisted learner state.

### 2. Broad DOM observation

The layer installs:

- one subtree `MutationObserver` on `document.documentElement`;
- one attribute `MutationObserver` for `lang`;
- one `storage` listener.

Fragility:

- reacts to unrelated render mutations;
- synchronization is post-render and asynchronous;
- correctness depends on current DOM churn rather than the owning React state transition;
- selector or copy changes can silently stop the bridge from recognizing state.

Target state: normal React props/state. No observer is required for practice flow state.

### 3. DOM and copy-based mode detection

The bridge depends on selectors/copy such as:

- `main .session`;
- `.session-head > div > span`;
- `MIXED` / `SMESHANNAYA PRAKTIKA` semantics encoded in visible header copy;
- `.eyebrow` text to recognize lab stage;
- `.decision-card`;
- `button.secondary.wide`;
- `main .session > button.primary`.

Fragility:

- presentation text becomes an API;
- harmless markup/copy changes can change behavior;
- language changes and architecture changes are coupled;
- tests can remain green at the data/model layer while the post-render bridge breaks.

Target state: explicit `session.mode`, lesson step, locale, module ID, and completion count passed through component contracts.

### 4. Post-render mutation of Core controls

The layer directly:

- disables/enables the mixed-practice button;
- sets/removes `title`;
- sets/removes `data-wave5-mixed`;
- sets/removes `role`, `aria-label`, and `aria-hidden`.

There is a concrete split-brain contract today:

- Core `Learn` enables mixed practice after two completed modules;
- Wave 5 post-render code tightens it to three.

Current browser behavior is correct because the layer wins after render, but the owning contract is inconsistent.

Target state: Core owns the `>=3 completed modules` admission rule natively. Mixed-decision identity concealment is rendered natively from `session.mode === "mixed"`.

### 5. Dual lab rendering and global hiding

Core renders its original lesson lab. `Wave5PracticeLayer` detects that stage, sets a root HTML dataset flag, hides the Core lab body with injected global CSS, and renders a separate prediction-first lab gate.

Fragility:

- two UI implementations exist for one logical stage;
- one remains mounted while visually hidden;
- behavior depends on a root-level CSS side channel;
- future CSS/accessibility changes can expose or focus the wrong implementation;
- normal ownership of lesson-stage progression is obscured.

Target state: one prediction-first practice-lab component rendered directly by the lesson stage.

### 6. Programmatic click bridge

After the Wave 5 lab finishes, `nextCoreLabStep()` queries `main .session > button.primary` and calls `.click()` to advance the hidden Core lab.

Fragility:

- control identity is positional rather than semantic;
- a new primary button can become the click target;
- progression depends on hidden UI still being mounted;
- event flow is harder to reason about and test.

Target state: explicit `onComplete` callback from practice lab to the owning lesson session.

## What should move into the normal Core contract

After Wave 4R is integrated and `main` is GREEN, move these responsibilities into the normal React/Core contract with small commits:

1. Mixed-practice admission: `completedModules >= 3`.
2. Mixed-practice topic concealment: derive directly from `session.mode === "mixed"` in `Decision`/`PracticeSession`.
3. Lesson stage 5 lab composition: render the prediction-first practice lab directly.
4. Explicit progression callback: `onComplete={() => setStep(6, 1)}` or equivalent stable Core transition.
5. Explicit inputs to the practice component: locale, module, mode/step where required; no DOM introspection or persisted-state parsing.
6. Mixed selection stays in Core or a pure practice helper because it constructs the active session from canonical learner state.

## What should remain a separate practice component

These are cohesive practice UI/mechanics and do not need to be absorbed into a monolithic Core file:

- `PredictionStep`;
- `SprInteraction`;
- `CompareInteraction`;
- a thin `PracticeLab`/`PredictionFirstLab` composition that selects SPR vs compare and exposes `onComplete`.

The component should receive data and callbacks only. It should not own learner-state persistence, locale discovery, route discovery, or DOM mutation.

## Exact post-W4R migration sequence

1. Start from the then-current GREEN `origin/main`; do not replay this plan against an obsolete Core snapshot.
2. Extract the existing prediction/SPR/compare code into a pure practice component without behavior changes.
3. Change the Core mixed button admission rule from two completed modules to three.
4. Render mixed decision concealment natively from session mode; preserve stable drill IDs and scoring.
5. Replace the original Core lesson-lab body with the prediction-first component and pass an explicit lesson-stage callback.
6. Remove `Wave5PracticeLayer` dependencies on `localStorage`, `MutationObserver`, DOM selectors, DOM mutation, root dataset flags, injected hiding CSS, and programmatic `.click()`.
7. Keep learner-state schema, drill IDs, card IDs, module IDs, interaction records, scoring, and mixed selection semantics unchanged.
8. Add/retain targeted tests for:
   - mixed locked at two and unlocked at three;
   - topic identity hidden before mixed decision;
   - option shuffle remains ID-safe and not fixed to source position;
   - repeated mixed sessions are not a permanently fixed set;
   - prediction first;
   - invalid SPR input;
   - material change required;
   - both compare sides required;
   - boundary visible before completion;
   - keyboard progression through practice controls.
9. Run `npm run test:release` from the exact integration head.
10. Only after a green release gate may the temporary bridge be deleted and Wave 5 architecture be promoted to final acceptance.

## Rollback / stop conditions

Stop the integration and keep the temporary green bridge if any proposed change:

- changes drill/card/module stable IDs;
- changes scoring semantics;
- changes learner-state schema or resets history;
- changes mixed-selection semantics without evidence;
- weakens prediction/material-change/boundary gates;
- conflicts with newly accepted Wave 4R locale/runtime contracts;
- fails any current desktop/mobile practice E2E;
- requires a broad unrelated Core rewrite.

## Severity and closure status

Current learner-facing practice behavior is verified green on desktop and mobile. Therefore this is not classified as a current broken-practice P0/P1.

It is material integration debt because the bridge has several independent failure surfaces and prevents a truthful claim that Wave 5 is fully closed architecturally.

Closure status:

`PRACTICE_MECHANICS_ACCEPTED / INTEGRATION_DEBT_REMAINS`
