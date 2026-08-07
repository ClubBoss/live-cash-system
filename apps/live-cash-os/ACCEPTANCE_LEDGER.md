# Live Cash OS — Acceptance Ledger

Status: `W1_W5_INTEGRATION_CANDIDATE_MATERIALIZED / TECHNICAL_RELEASE_GATE_PENDING / HUMAN_REVIEW_PENDING / PRODUCTION_NOT_CHANGED`

This ledger records the exact W1-W5 reconciliation candidate. It separates implementation closure, automated rejection gates, human approval, first-use comprehension evidence and production truth. A materialized candidate is not an accepted release until the exact source passes its required gates.

## Integration identity

- integration branch: `integration/w1-w5-reconciliation`
- integration base: W3 repaired head `a73dd43a2b6cf460023c67429522c9cadddabab8`
- W3 already contains repaired W2 governance ancestry
- FINAL W4R input: `9b5b5a997663bd381857f1e06a2edeadd7b20c1a`
- W1 input: `fcb2e7b73c7459b8d7b15d7ab80866baa5f69b16`
- W5 audit/evidence input: `d13a350e960cb887847d16cc0418e0d38003c53e`
- baseline main: `26b1dec72822a706f82cf485042c18e166397bdd`
- `main` is not merged or modified by this reconciliation
- Wave 6 is not started

## Wave 1 truth

Current verdict:

`WAVE_1_IMPLEMENTATION_ACCEPTED / COMPREHENSION_EVIDENCE_PENDING`

The combined candidate retains the focused first-use E2E, walkthrough protocol, evidence template, production smoke and acceptance-truth regression from W1. FINAL W4R closes the former implementation-language blocker relevant to Wave 1, but this does not create fresh human RU/EN approval.

Strict `WAVE_1_ACCEPTED` remains blocked until genuine fresh-context evidence exists:

- at least 3 eligible walkthroughs;
- at least 90% diagnostic purpose/optionality comprehension;
- at least 90% Learn/Review/Real Hands navigation comprehension;
- the remaining Master Plan first-use thresholds.

## Wave 2 governance truth

Wave 2 governance lifecycle is authoritative in the combined candidate:

- deterministic checks are rejection-only;
- candidate and release approval are separate states/gates;
- strategy and drill repairs may advance to `REVIEW_PENDING` without becoming approved;
- old approval evidence is invalidated after material mutation;
- human evidence is required to restore strategy gold, drill approval or locale approval;
- locale approval binds to the exact final-composition digest.

Current governance state:

- manifest: `TRANSITIONAL_REVIEW_REQUIRED`
- strategy: `CURRICULUM_STRATEGY_REVIEW_PENDING`
- drills: `DRILLS_REVIEW_PENDING`
- strategy approval: `null`
- drill approval: `null`
- human locale approvals: none
- final composition: `REVIEW_PENDING`
- current composition digest: `7b44741c3032d0c3f084f60aab5513a40445e32394c36954496ba83e53127b0a`
- approved digest: `null`

## Wave 3 strategy and final-composition truth

The repaired W3 source/strategy implementation remains authoritative for LCM-02, LCM-03 and LCM-06. It is not overwritten by stale W4R strategy-gold governance claims.

Pending human poker review remains required for:

- repaired LCM-02 claims;
- repaired LCM-03 claims;
- repaired LCM-06 claims;
- all 15 final-composition W3 drills;
- affected runtime distractor semantics.

The final canonical RU/EN composition is materialized through the locale pipeline. The candidate regression locks:

- no unsupported approximately-60bb boundary in `pre-05`;
- no unsupported exact stack depth in `agg-01`;
- canonical W3 RU identity for `agg-01`, `agg-02`, `agg-04`;
- canonical turn-filter identity for EN `agg-04`;
- OOP large-raise/value gate for `agg-05`;
- exactly 15 stable W3 drill IDs across locales;
- ID-based one-best-answer integrity.

These are candidate facts, not human poker approval.

## FINAL W4R language/runtime truth

FINAL W4R is authoritative for the learner-facing runtime, locale pipeline, direct React localisation, language implementation, W4R runtime/editorial rejection rules and current `Wave5PracticeLayer` composition.

The active reconciliation item is only:

- `W4R-SEM-01`: the EN aggression worked example no longer asserts unsupported exact `200bb`; no replacement exact depth was introduced.

During exact integration inspection, `wave4r-poker-native.ts` was found to be transitively reactivated by FINAL W4R `applyWave5PracticeCopy()`, despite not being directly imported by `locale-pipeline.ts`. The combined candidate removes that compatibility call from `wave5-practice-copy.ts`. The compatibility file may remain present, but it is inert in the canonical locale path and therefore cannot overwrite repaired W3 RU semantics.

No W3 `W4R_SEM-02/03/04` copy repair was restored.

Fresh human RU and EN review of the exact integrated composition remains required. Automated language/runtime checks cannot create approval.

## Wave 5 disposition

Current integrated disposition:

`WAVE_5_IMPLEMENTATION_CLOSED_WITH_ACCEPTED_P2_DEBT`

The W5 branch contributes audit/handoff evidence only. It does not reintroduce its superseded temporary runtime architecture. FINAL W4R owns the current `Wave5PracticeLayer`.

Preserved mechanics include:

- one-best-answer / assumption / legal-sequence / numeric integrity coverage;
- ID-safe option shuffle;
- three-module mixed-practice unlock;
- pre-decision topic concealment;
- prediction-first labs;
- valid-input and material-change gates;
- changed-node continuation;
- flashcards and mixed practice;
- stable learner history/IDs.

Accepted P2 compatibility debt may remain until a later justified refactor:

- localStorage read;
- event listeners/polling;
- querySelector contract;
- dataset/ARIA/button mutation;
- CSS lab overlay;
- programmatic Core click;
- split mixed-unlock ownership.

The integration must not restore MutationObserver state inference, textContent localisation, duplicate composition or superseded compatibility behavior.

## Technical gate boundary

The current candidate has not yet earned a current full-release result merely because its source is materialized. Historical test counts remain historical only.

Required current execution:

- targeted governance lifecycle tests;
- W3 strategy/final-composition tests;
- W4R language/runtime tests;
- W5 practice tests;
- W1 first-use/acceptance tests;
- canonical `npm run test:release` from the exact checkout;
- candidate governance gate, expected GREEN in `REVIEW_PENDING`;
- `npm run check:approval`, expected RED while human approvals/final release approval are pending.

An expected approval-gate RED is correct governance behavior and must not be bypassed.

## Production boundary

No integration commit is claimed deployed. No production publish, D1 reset, learner-state reset, URL change or Wave 6 work is performed here.

Authenticated production smoke, exact deployed SHA and later release truth remain external to this W1-W5 candidate until an owner-authorised release stage.

## Governing rule

`REVIEW_PENDING` is a legal candidate state and never an approval state. Automated checks may reject invalid work but cannot create poker-content, drill, RU/EN, first-use comprehension, production-authenticated or empirical-learning approval.
