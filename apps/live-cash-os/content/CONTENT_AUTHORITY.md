# Live Cash OS — Content Authority

Status: `WAVE_2_GOVERNANCE_ENFORCED / CURRICULUM_STRATEGY_REVIEW_PENDING / LANGUAGE_REVIEW_REQUIRED`

This is the application-level admission contract for learner-facing poker content. It complements the repository-wide framework in `governance/CROSS_SOURCE_VALIDATION_AND_ADMISSION_FRAMEWORK_v0_1.md` and the immutable source-family registries under `sources/`.

## 1. Canonical source authorities

| Family | Canonical registry | Primary role | Current boundary |
|---|---|---|---|
| Smash Live Cash | `sources/source-registry.md` and `sources/smash-live-cash/` | advanced live-cash mechanisms, deep stacks, node-specific exploits, 3-bet and multiway examples | corpus processed; visual-dependent claims remain gated by source QA status |
| Carrot Poker | `sources/carrot-poker/source-registry.md` and `sources/carrot-poker/source-gap-ledger.md` | mechanism explanation, theory progression, range construction, exam feedback | Grades 1–3, exams and feedback mapped; exact visual/solver claims remain claim-gated |
| Cash Injection | `sources/cash-injection/` | population hypotheses and practical exploit candidates | directional population mechanisms may support scoped hypotheses; magnitude remains field-gated |
| From the Ground Up | `sources/ftgu/source-registry.md` | foundations, executable defaults, prerequisite and teachability checks | 30/30 episodes processed; charts and exact visual boundaries are reference-only |
| Independent analysis | `analysis/`, `synthesis/`, module ledgers | reconcile assumptions, compress mechanisms, create original drills | inference must be labeled and cannot impersonate a source claim |
| Product evidence model | `apps/live-cash-os/lib/model-core.ts` | authoritative product semantics for completion, transfer, retention and reviewed field evidence | product contract only; current numeric thresholds are not universal learning-science claims |
| Field evidence | reviewed learner hand records | prioritise cues, calibrate priors and test table transfer | does not prove universal theory and cannot silently rewrite source claims |

A registry entry marked incomplete, visually dependent, transcription-uncertain or pending blocks any claim that materially depends on the missing information from reaching learner admission. The machine-readable bridge is `content/claims/source-gap-dependencies.json`: every current claim must be explicitly source-gap reviewed, and any unresolved `MATERIAL_BLOCKING` dependency must keep the claim `BLOCKED_SOURCE_GAP` or rejected. A `NON_BLOCKING_SCOPED` dependency is allowed only with a written rationale that narrows the admitted claim below the missing evidence.

## 2. Claim contract

Every strategic teaching claim admitted into an approved module must conform to `content/claims/claim.schema.json` and identify:

- stable claim ID and module ID;
- learner-facing claim;
- exact internal source references;
- independent project interpretation;
- claim type and confidence;
- assumptions and exceptions;
- target games and depth scope;
- unresolved conflicts or missing evidence;
- current admission status.

Every current claim ID must also be present in `content/claims/source-gap-dependencies.json`. Adding a claim without a source-gap dependency review is a governance failure, even when the claim JSON itself is schema-valid.

Claim types remain `BASELINE`, `HEURISTIC`, `EXPLOIT`, `SIMPLIFICATION`, and `OPEN_QUESTION`. `LOW` and `UNRESOLVED` evidence cannot be `ADMITTED` or `FIELD_VALIDATED`. `OPEN_QUESTION` may remain research/candidate/blocked/rejected only and cannot become learner prescription.

## 3. Required strategic scope

Before a recommendation can be taught, its record and learner-facing task must state all material variables, including positions, players left to act, heads-up/multiway state, effective stack, relevant sizings, rake/ante/straddle sensitivity, baseline versus exploit model, known reads, and exceptions that can reverse the recommendation.

A broad phrase such as “live players overfold” is never sufficient by itself. The exact branch, evidence relevance and confidence must be specified.

## 4. Source reconciliation

- Different depths are scoped branches, not automatic contradictions.
- Equilibrium and population advice are baseline and exploit layers, not interchangeable rules.
- Simplification must state what complexity is removed and when the shortcut fails.
- Unresolved same-node contradictions block promotion.
- Transcript uncertainty is not silently repaired from generic model knowledge.
- Batumi population magnitude is not inferred merely because an external source reports a directional tendency.

## 5. Originality and source purity

Learner-facing content must remain original compression:

- no transcript passages or close paraphrases;
- no proprietary charts, screenshots or exported ranges;
- no course-specific hand sequence required for understanding;
- original examples and drills;
- source references remain internal provenance rather than republished course material.

## 6. Editorial, approval and source-lock authority

Approved learner-facing text conforms to `content/POKER_GLOSSARY_RU_EN.md`.

Russian copy must be natural poker Russian rather than word-for-word translation or architecture jargon. English copy must be independently natural and preserve the same strategic meaning. Stable semantic IDs are shared across locales, but stable identity does not prove unchanged semantics after a copy/overlay mutation.

Deterministic scripts may reject stale hashes, missing metadata, prohibited terminology, invalid status transitions and locale/ID regressions. They may never create poker, drill, RU, EN, accessibility, production or empirical approval.

Strategy, drill and locale approval are human-only repository facts. Current approval evidence must identify the human reviewer, review date and exact reviewed corpus fingerprint. Locale approval additionally binds to the exact current final learner-facing composition digest.

Git blob locks remain a stale-change detector, not an immutability rule. A P1 repair may legally change a locked source only after the affected approval dimension is explicitly moved to `*_REPAIR_REQUIRED` or `*_REVIEW_PENDING`. In those candidate states, stale hashes are allowed only for paths listed in `repair_source_paths` for that repair dimension. Unscoped stale mutations remain rejected.

Refreshing hashes does not preserve old approval. Any new corpus fingerprint invalidates old strategy/drill/locale evidence until the required human re-review is recorded. `FULLY_ACCEPTED` additionally requires the approved final-composition digest to equal the current final-composition digest.

While language truth remains open, `W4R` is the single owner of learner-facing language repair and language-specific enforcement. Wave 2 governance does not create a competing terminology scanner or edit learner copy.

## 7. Admission and repair lifecycle

Strategic curriculum lifecycle:

- `CURRICULUM_STRATEGY_GOLD`;
- `CURRICULUM_STRATEGY_REPAIR_REQUIRED`;
- `CURRICULUM_STRATEGY_REVIEW_PENDING`;
- back to `CURRICULUM_STRATEGY_GOLD` only after explicit human re-review against the current corpus.

Drill/content lifecycle:

- `DRILLS_APPROVED`;
- `DRILLS_REPAIR_REQUIRED`;
- `DRILLS_REVIEW_PENDING`;
- back to `DRILLS_APPROVED` only after explicit human re-review against the current corpus.

Locale lifecycle remains `REVIEW_REQUIRED -> APPROVED` with current human evidence. A discovered defect in previously approved locale copy reopens it to `REVIEW_REQUIRED`; old evidence is no longer active approval evidence.

The application-level manifest has two top states:

- `TRANSITIONAL_REVIEW_REQUIRED` — one or more strategy, drill, locale or final-composition dimensions are under repair/review;
- `FULLY_ACCEPTED` — strategy is gold, drills are approved, all required RU/EN locales are human-approved, source locks are current, the approved final-composition digest equals the current digest, and the upper acceptance ledger contains no contradictory repair state.

`REPAIR_REQUIRED` and `REVIEW_PENDING` are valid candidate-governance states. They are never full-release approval states.

The wider module admission vocabulary remains:

- `SOURCE_MAPPED`;
- `STRATEGY_REVIEWED`;
- `NUMERIC_REVIEWED`;
- `RU_APPROVED`;
- `EN_APPROVED`;
- `DRILLS_APPROVED`;
- `LAB_APPROVED`;
- `CARDS_APPROVED`;
- `MODULE_GOLD`;
- `BLOCKED_SOURCE_GAP`;
- `REJECTED_OR_SUPERSEDED`.

`MODULE_GOLD` requires applicable gates in `content/MODULE_GOLD_CHECKLIST.md`; runtime existence or automated tests alone cannot create the status.

## 8. Current admission boundary after Wave 3 implementation repair

The independent Wave 3 revalidation superseded the prior corpus-wide strategy-gold claim for the current priority-module runtime. The scoped source repair is now implemented on `repair/w3-strategy-closure`; the affected dimensions have advanced from repair-required to human review pending, not to gold/approved.

Current affected strategy scope:

- LCM-02 / preflop — `STRATEGY_REVIEW_PENDING` after unsupported exact depth scope was removed from the claim and `pre-05`;
- LCM-03 / blinds — `STRATEGY_REVIEW_PENDING` after the direct 200bb source example was separated from broader mechanism-level generalisation;
- LCM-06 / aggression — `STRATEGY_REVIEW_PENDING` after unsupported exact stack depth was removed from the wide-3bet compensation claim and Wave 3 source drill/example.

Current affected drill-content scope:

- LCM-02 / preflop — `DRILLS_REVIEW_PENDING`;
- LCM-06 / aggression — `DRILLS_REVIEW_PENDING`.

Unaffected strategic modules retain their reviewed mechanism boundaries as historical/current strategic gold until another review reopens them. This Wave 3 branch does not edit W4R-owned files or merge FINAL W4R.

Wave 3 revalidation evidence:

- branch `audit/w3-strategy-revalidation`;
- head `c30facc624ff208862a65083f96dc51a87601ee0`;
- verdict `WAVE_3_STRATEGY_REPAIR_REQUIRED`.

Wave 3 implementation-repair evidence boundary:

- branch `repair/w3-strategy-closure`;
- base `74bf73f15a539d692af53253cfaf06755693e727`;
- prior strategy/drill approvals remain invalidated;
- final composition remains stale until FINAL W4R semantic reconciliation and human poker/drill review.

Historical Wave 4 implementation evidence remains historical evidence only:

- accepted implementation SHA: `5a6af4ed4f8d8e5e985950c71cbc6c6ba40efe86`;
- full release run: `31164756544`;
- validation job: `92822910319`;
- unit/integration: `55/55 PASS`;
- Playwright: `21 passed / 1 intentionally skipped`.

Current language/editorial truth on this branch is still `LANGUAGE_REPAIR_REQUIRED`; FINAL W4R `9b5b5a997663bd381857f1e06a2edeadd7b20c1a` remains a later integration input. The final learner-facing composition digest is intentionally not re-locked before that reconciliation and the required human reviews.

## 9. Current global limitations

Still explicitly excluded or pending are:

- human strategy re-review for repaired LCM-02 / LCM-03 / LCM-06;
- human drill re-review for repaired preflop/aggression priority content;
- FINAL W4R semantic reconciliation and current final learner-facing composition digest;
- current corpus-wide human RU/EN approval after W4R integration;
- exact 100/150/200/300–400bb chart overlays where source visuals are required;
- exact squeeze and 4-bet combo frequencies;
- exact board-specific solver frequencies and EVs;
- exact multiway MDF and fixed sizing matrices;
- exact Batumi population overbluff/underbluff magnitudes;
- later routing, diagnostic/field lifecycle, accessibility, reliability, privacy, performance and empirical-learning waves;
- Wave 0 authenticated production DOM smoke and exact deployed SHA.

## 10. Production boundary

Repository governance truth does not claim that any repair branch is deployed. Production acceptance requires the separate release and authenticated-smoke evidence owned by later integration/release work.

## 11. Change, repair and re-lock rule

A locked-source mismatch has two meanings:

1. outside an explicit repair scope: governance failure;
2. inside an explicit `REPAIR_REQUIRED` / `REVIEW_PENDING` scope: legal candidate mutation that invalidates prior approval and must be re-reviewed before full acceptance.

The lawful transition is:

`APPROVED/GOLD -> REPAIR_REQUIRED -> candidate mutation -> REVIEW_PENDING -> human re-review -> re-lock current hashes/fingerprint -> APPROVED/GOLD`.

Final acceptance additionally requires materialising the final learner-facing composition, recording its current digest, completing the required human reviews, and setting the approved digest to that exact current value. A deterministic script may compute or reject technical evidence, but it must never write `APPROVED`, `RU_APPROVED`, `EN_APPROVED`, `DRILLS_APPROVED`, `MODULE_GOLD`, human reviewer evidence or an equivalent acceptance state.
