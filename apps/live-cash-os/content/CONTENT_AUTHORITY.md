# Live Cash OS — Content Authority

Status: `WAVE_2_GOVERNANCE_ENFORCED / CURRICULUM_STRATEGY_REVIEW_PENDING / DRILLS_REVIEW_PENDING / FINAL_COMPOSITION_REVIEW_PENDING`

This is the application-level admission contract for learner-facing poker content. It complements the repository-wide cross-source framework and immutable source-family registries under `sources/`.

## 1. Canonical authority hierarchy

Strategic source authority remains the admitted course/source corpus plus explicitly labelled project inference. Product evidence semantics remain owned by the learner-state model. Learner-facing language implementation is materialized through the canonical locale pipeline. No runtime layer may silently override reviewed strategic identity.

Canonical governance/source references are:

- `sources/source-registry.md` — repository-wide source registry;
- `sources/carrot-poker/source-registry.md` — admitted Carrot Poker source family;
- `sources/carrot-poker/source-gap-ledger.md` — Carrot Poker continuity/gap truth;
- `sources/ftgu/source-registry.md` — admitted FTGU source family;
- `content/claims/claim.schema.json` — strategic claim contract;
- `content/claims/source-gap-dependencies.json` — machine-readable dependency/gap registry;
- `content/MODULE_GOLD_CHECKLIST.md` — human module-admission checklist.

The exact W1-W5 candidate is built from:

- repaired W2 governance as inherited by W3;
- repaired W3 priority strategy and drills;
- FINAL W4R learner-facing runtime/language implementation;
- FINAL W4R current Wave5 practice composition;
- W1 first-use closure assets;
- W5 audit/handoff evidence only.

## 2. Claim and strategic admission contract

Every admitted strategic claim must continue to satisfy `content/claims/claim.schema.json` and the machine-readable source-gap dependency registry. Material unresolved source gaps block admission. LOW/UNRESOLVED evidence cannot be admitted, and an `OPEN_QUESTION` cannot become learner prescription.

Material variables remain explicit where they affect the recommendation: positions, players left to act, heads-up/multiway state, effective stack, sizings, rake/ante/straddle sensitivity, baseline versus exploit model, reads and exceptions.

A directional mechanism may not be upgraded into an unsupported exact threshold, chart cell, solver frequency or population magnitude.

## 3. Originality and source purity

Learner-facing material remains original compression. Proprietary transcript passages, charts, screenshots or source-specific hand sequences are not republished. Internal source references support provenance rather than becoming learner-facing reproduction.

## 4. Editorial and locale authority

`content/POKER_GLOSSARY_RU_EN.md` remains the terminology authority. Russian and English require independent natural-language review while preserving shared stable semantic IDs.

FINAL W4R remains the broad learner-facing language/runtime pass. The bounded novice-comprehension layer, final low-risk clarity layer, and diagnostic-integrity labels apply after it and may clarify terminology, arithmetic interpretation, or evaluator-facing labels, but they may not change strategic identities, correct-answer IDs or human approval truth.

The canonical locale pipeline order is:

1. `applyGeometryLocale`;
2. `applyWave3PriorityLocale`;
3. `applyWave4CurriculumLocale`;
4. `applyWave4FinalEditorialLocale`;
5. `applyWave5PracticeCopy`;
6. `applyWave4RFinalLanguage`;
7. `applyNoviceTerminologyCopy`;
8. `applyFinalPlusEvCopy`;
9. `applyDiagnosticIntegrityLabels`.

`applyWave4RFinalLanguage(locale)` applies its final broad language pass only for English. `applyNoviceTerminologyCopy(locale)` then performs bounded novice-comprehension wording in both locales. `applyFinalPlusEvCopy(locale)` performs only the final low-risk learner-language cleanup: plain-language glossary aliases and a clearer arithmetic interpretation of call price, without changing strategy or evidence semantics. `applyDiagnosticIntegrityLabels()` neutralizes learner-facing Diagnostic titles without changing stable `LD-*` identities. `wave4r-poker-native.ts` is not part of the active canonical pipeline, and the integrated `applyWave5PracticeCopy()` does not reactivate it transitively.

Therefore the compatibility file may remain present without becoming learner-facing authority.

## 5. Governance lifecycle

Deterministic checks are rejection-only and may not create approval.

Strategic lifecycle:

`CURRICULUM_STRATEGY_GOLD -> CURRICULUM_STRATEGY_REPAIR_REQUIRED -> CURRICULUM_STRATEGY_REVIEW_PENDING -> CURRICULUM_STRATEGY_GOLD`

The final transition requires explicit human poker review of the current corpus.

Drill lifecycle:

`DRILLS_APPROVED -> DRILLS_REPAIR_REQUIRED -> DRILLS_REVIEW_PENDING -> DRILLS_APPROVED`

The final transition requires explicit human drill review of the current corpus.

Locale lifecycle:

`REVIEW_REQUIRED -> APPROVED`

Locale approval is human-only and binds to the exact current final-composition digest.

Application top states remain:

- `TRANSITIONAL_REVIEW_REQUIRED` while any strategy, drill, locale or final-composition dimension is under review;
- `FULLY_ACCEPTED` only when all required human evidence is current and the approved final-composition digest equals the current digest.

`REVIEW_PENDING` is a valid candidate state and never a release/full-approval state.

## 6. Source locks and final composition

Git blob locks are stale-mutation detectors, not a mechanism for carrying old approval across changed content.

The integrated candidate is re-locked against its actual active source inventory. The current final-composition digest is:

`a1ffeb271cba5969dba5104fbfac71dc4d5f83f1b98573e3608f220623c4950a`

Current status:

- final composition: `REVIEW_PENDING`;
- approved composition digest: `null`;
- strategy approval: `null`;
- drill approval: `null`;
- RU/EN human approval evidence: none.

Refreshing current hashes or materializing the digest does not create approval.

## 7. Current repaired W3 authority

The current affected strategy scope remains:

- LCM-02 / preflop — `STRATEGY_REVIEW_PENDING`;
- LCM-03 / blinds — `STRATEGY_REVIEW_PENDING`;
- LCM-06 / aggression — `STRATEGY_REVIEW_PENDING`.

Affected drill-content scope remains:

- LCM-02 / preflop — `DRILLS_REVIEW_PENDING`;
- LCM-06 / aggression — `DRILLS_REVIEW_PENDING`.

The final composition must preserve the repaired W3 semantics rather than reintroduce compatibility overlays. Candidate regressions explicitly protect:

- `pre-05` from an unsupported approximately-60bb boundary;
- `agg-01` from unsupported exact stack-depth precision;
- RU `agg-01` as the W3 wide-range compensation/defence identity;
- RU `agg-02` as the normal strong-range/dry-board identity;
- RU and EN `agg-04` as the turn-filter identity;
- `agg-05` as the OOP large-raise/value gate;
- all 15 W3 drill identities across RU/EN.

These candidate protections do not substitute for human poker review.

## 8. Active W4R semantic reconciliation

Only one active learner-facing semantic defect required direct copy repair during integration:

`W4R-SEM-01` — the English aggression worked example asserted unsupported exact `200bb` depth. The exact depth was removed and no new exact depth was added.

Exact inspection also revealed that FINAL W4R `wave5-practice-copy.ts` transitively called the compatibility overlay even though `locale-pipeline.ts` did not. The integration removes that call so the compatibility file is genuinely inert. No RU `agg-01`, `agg-02` or `agg-04` wording is edited to accommodate dead compatibility semantics.

## 9. Wave 5 boundary

The current integrated disposition is:

`WAVE_5_IMPLEMENTATION_CLOSED_WITH_ACCEPTED_P2_DEBT`

The W5 audit branch contributes reports only. FINAL W4R owns the current practice layer. Superseded MutationObserver/textContent localisation or duplicate-composition behavior is not restored.

Accepted P2 compatibility debt is documented separately and does not create strategy, language, accessibility or empirical approval.

## 10. Human review required before approval

Human poker review must cover:

- three repaired W3 claim sets;
- all 15 final-composition W3 drills;
- affected runtime distractor semantics.

Separate human language review must cover:

- exact final RU composition;
- exact final EN composition.

Wave 1 first-use comprehension requires its own fresh-context empirical evidence and is not satisfied by editorial review.

## 11. Production / later-wave boundary

This content authority document does not claim deployment of the integration branch. Production publish/smoke, exact deployed SHA, later routing/retention, field transfer, accessibility, reliability/privacy/performance and empirical effectiveness remain outside this W1-W5 integration operation.

Wave 6 must not begin as part of this reconciliation.
