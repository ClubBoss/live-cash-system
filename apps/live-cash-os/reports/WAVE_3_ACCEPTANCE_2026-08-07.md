# Wave 3 Acceptance — Priority Live-Cash Modules

**Date:** 2026-08-07  
**Accepted code SHA:** `a364406196ebac485e2565eb84fb513e6567332e`  
**GitHub Actions run:** `31154078759`  
**Job:** `92789681545`

## Verdict

`WAVE_3_ACCEPTED`

Wave 3 promotes three priority modules to scoped bilingual gold:

- `LCM-02 / preflop`;
- `LCM-03 / blinds`;
- `LCM-06 / aggression in 3-bet pots`.

LCM-01 remains the previously revalidated gold module. LCM-04, LCM-05 and LCM-07–LCM-11 remain `PENDING` and are not implied to be reviewed merely because they exist in runtime.

## Product effect

The trainer now has four reviewed bilingual gold modules covering the highest-priority live-cash mechanics currently in scope:

1. effective stack and pot geometry;
2. compact preflop call / 3-bet / fold construction;
3. SB versus BB price, action-order and realisation logic;
4. postflop aggression and defence in 3-bet pots.

The reconstruction deliberately favours transferable decision trees over memorising large chart libraries.

## Wave 3 content delivered

### LCM-02

- baseline range shape before deviation;
- call quality as an independent branch;
- players-behind and squeeze exposure;
- linear versus polar 3-betting;
- source-backed squeeze purification;
- directional shorter-versus-deeper-stack adjustment.

Excluded from gold:

- exact mixed-frequency chart cells;
- exact squeeze-size tables;
- universal A5s or suited-connector prescriptions;
- exact 100/200/400bb combo boundaries.

### LCM-03

- BB price from the posted blind;
- closing-action value;
- SB squeeze exposure;
- raw versus realised equity;
- blind-source range identity on identical boards;
- field-read updates without erasing positional structure.

Excluded from gold:

- exact blind defence charts;
- fixed call/3-bet frequencies;
- rake-insensitive universal thresholds.

### LCM-06

- preflop 3-bet range shape → postflop compensation;
- over-wide 3-bet plus uncompensated c-betting;
- high-frequency small betting on suitable dry boards;
- selective betting on coordinated middling boards;
- turn reconstruction after flop bet/call filtering;
- OOP top-end value gate before raise/jam construction.

Excluded from gold:

- exact solver board matrices;
- exact c-bet percentages or sizes;
- exact EV values;
- exact top-end tier boundaries;
- exact low-SPR jam combos.

## Evidence and provenance

Created and admitted:

- `content/claims/lcm-02.claims.json` — 4 claims;
- `content/claims/lcm-03.claims.json` — 4 claims;
- `content/claims/lcm-06.claims.json` — 4 claims.

Total Wave 3 strategic claims: `12`.

Each claim preserves source references, assumptions, exceptions, game/depth scope, confidence and admission status. Low or unresolved evidence cannot be promoted through the claim schema.

## Learner-facing practice

Rebuilt without changing stable IDs:

- `15` drills;
- `9` flashcards;
- RU and EN theory, heuristics, decision trees, examples, labs and table cards.

Stable identities preserved:

- module IDs;
- drill IDs;
- action/reason option IDs;
- misconception IDs;
- card IDs;
- prerequisites;
- learner-state semantics.

No migration and no global learner-state reset were required.

## RU / EN editorial result

`PASS` for LCM-02, LCM-03 and LCM-06.

The Russian copy removes primary learner-facing hybrid architecture language such as `Value squeeze core`, `Players-behind gate`, `node signature`, `jobless bluff` and similar internal terminology.

The English copy is independently natural and contains no Cyrillic learner-facing fallback inside the approved modules.

The editorial manifest now approves RU+EN only for:

- LCM-01;
- LCM-02;
- LCM-03;
- LCM-06.

All seven remaining modules stay `PENDING`.

## Runtime regression caught before acceptance

Wave 3 initially introduced a DOM-observer regression while trying to hide the generic pending-English banner on newly approved modules.

Failed browser run `31153052675` produced:

```text
NotFoundError: Failed to execute 'removeChild' on 'Node'
```

Root cause:

- a structural `MutationObserver` watched the full React subtree;
- the same callback directly mutated learner text during React reconciliation;
- this raced React-owned DOM updates.

The accepted architecture separates responsibilities:

- attribute observer: locale/navigation changes and text localisation;
- structural observer: safe `data-editorial-gold` marker updates only;
- no learner-text mutation from structural React changes.

The previously passing LCM-01 decision-review/reload E2E paths pass again in the accepted run.

## Technical gate

Current-head full release gate on `a364406196ebac485e2565eb84fb513e6567332e`:

- TypeScript: `PASS`;
- ESLint: `PASS`;
- editorial integrity: `PASS`;
- production build: `PASS`;
- unit/integration: `PASS`;
- desktop/mobile Playwright: `PASS`.

Failure-evidence upload was skipped because E2E passed.

## Operational integrity

Wave 3 did not:

- deploy production;
- mutate production D1;
- change the stable production URL;
- reset learner state;
- change stable content IDs;
- admit exact chart or solver claims unsupported by the reviewed source package.

Authenticated production DOM smoke remains an explicit Wave 0 / Wave 11 external blocker and is not silently counted as passed here.

## Next curriculum boundary

Gold:

```text
LCM-01
LCM-02
LCM-03
LCM-06
```

Pending:

```text
LCM-04
LCM-05
LCM-07
LCM-08
LCM-09
LCM-10
LCM-11
```

Next reconstruction wave should begin with LCM-04, LCM-05 and LCM-07 because they form the next connected mechanism chain: action/texture filtering → sizing/range shape → branch-specific range ancestry.
