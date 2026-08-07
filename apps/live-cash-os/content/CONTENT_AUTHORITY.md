# Live Cash OS — Content Authority

Status: `WAVE_2_GOVERNANCE_ENFORCED / CURRICULUM_STRATEGY_GOLD / LANGUAGE_REVIEW_REQUIRED`

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

## 6. Editorial and language authority

Approved learner-facing text conforms to `content/POKER_GLOSSARY_RU_EN.md`.

Russian copy must be natural poker Russian rather than word-for-word translation or architecture jargon. English copy must be independently natural and preserve the same strategic meaning. Stable semantic IDs are shared across locales.

Deterministic scripts may reject stale hashes, missing metadata, prohibited terminology, invalid status transitions and locale/ID regressions. They may never create poker, RU, EN, accessibility, production or empirical approval.

`RU_APPROVED` and `EN_APPROVED` are human-only states. Each `APPROVED` locale in `content/i18n/editorial-manifest.json` requires explicit evidence with `reviewer_kind: HUMAN`, reviewer identity, review date and the exact current corpus fingerprint. Model review, automated checks, successful CI or a generated manifest cannot satisfy this evidence contract.

The corpus fingerprint is derived from the manifest's locked claim and learner-copy blobs. If any locked approved claim/copy blob changes, the old approval evidence becomes stale and release governance rejects it until the relevant human review is renewed. The lock intentionally errs on the conservative side: a shared corpus change may reopen more review than the smallest theoretical scope, but it may never preserve stale approval.

While the upper acceptance ledger contains `LANGUAGE_REPAIR_REQUIRED`, `W4R` is the single owner of learner-facing language repair and language-specific enforcement. Wave 2 governance must not create a competing terminology scanner or edit learner copy.

## 7. Module admission states

- `SOURCE_MAPPED`
- `STRATEGY_REVIEWED`
- `NUMERIC_REVIEWED`
- `RU_APPROVED`
- `EN_APPROVED`
- `DRILLS_APPROVED`
- `LAB_APPROVED`
- `CARDS_APPROVED`
- `MODULE_GOLD`
- `BLOCKED_SOURCE_GAP`
- `REJECTED_OR_SUPERSEDED`

`MODULE_GOLD` requires applicable gates in `content/MODULE_GOLD_CHECKLIST.md`; runtime existence or automated tests alone cannot create the status.

Acceptance truth has two editorial-manifest states:

- `TRANSITIONAL_LANGUAGE_REVIEW_REQUIRED` — strategy truth may remain gold while one or more locale approvals are invalidated or pending;
- `FULLY_ACCEPTED` — all required locale approvals have current human evidence and the upper acceptance ledger has no contradictory repair state.

A lower manifest may never contradict the upper `ACCEPTANCE_LEDGER.md`. A transitional state is mandatory when the ledger explicitly reopens language truth.

## 8. Current admission boundary — 11/11 strategic curriculum gold, language review reopened

Strategically admitted modules:

- LCM-01: effective-stack and pot-geometry reasoning; exact strategic depth/SPR/straddle thresholds remain excluded.
- LCM-02: source-backed call/3-bet/fold branch construction; exact chart cells, mixed frequencies and squeeze-size tables remain excluded.
- LCM-03: BB price/closing action, SB squeeze exposure, equity realisation and blind-source identity; exact blind charts remain excluded.
- LCM-04: source/action/survivor filtering, protected checks and branch-specific exploit reset.
- LCM-05: value-driven sizing, range-wide versus selective response shape, thin raise gates and protected calls.
- LCM-06: 3-bet-pot range compensation, board ownership, turn filtering and OOP top-end raising gates; exact solver frequencies remain excluded.
- LCM-07: branch ancestry, inherited bluff supply, blocker ordering and action-specific opponent models.
- LCM-08: sandwich pressure, closing action, shared defence and multiway range ownership; exact multiway MDF remains excluded.
- LCM-09: river origin/filter/value/bluff/size/blocker/evidence audit; exact solver EV and population magnitude remain gated.
- LCM-10: branch-specific evidence discipline, one-observation boundary and field-gated population calibration.
- LCM-11: current Live Cash OS exposure/transfer/retention/reviewed-field evidence contract; current numeric thresholds are product rules rather than universal scientific claims.

Wave 4 strategic implementation evidence remains historical evidence, not current bilingual approval evidence:

- accepted implementation SHA: `5a6af4ed4f8d8e5e985950c71cbc6c6ba40efe86`;
- full release run: `31164756544`;
- validation job: `92822910319`;
- TypeScript, lint, editorial, build: PASS;
- unit/integration: `55/55 PASS`;
- Playwright: `21 passed / 1 intentionally skipped`.

Current language/editorial truth is `LANGUAGE_REPAIR_REQUIRED`; the active owner is W4R. No current RU/EN locale is represented as human-approved in the manifest until W4R records valid evidence.

See `content/WAVE_4_FULL_CURRICULUM_CONFORMANCE.md` for the historical reviewed Wave 4 strategic scope and exclusions, and `reports/WAVE_4R_LANGUAGE_TRUTH_REPAIR_LEDGER_2026-08-07.md` for current language repair truth.

## 9. Current global limitations

Repository curriculum strategy gold does not close later waves. Still explicitly excluded or pending are:

- current corpus-wide human RU/EN approval after W4R repair;
- exact 100/150/200/300–400bb chart overlays where source visuals are required;
- exact squeeze and 4-bet combo frequencies;
- exact board-specific solver frequencies and EVs;
- exact multiway MDF and fixed sizing matrices;
- exact Batumi population overbluff/underbluff magnitudes;
- Wave 5 corpus-wide drill ambiguity, variant-depth, mixed-practice concealment, lab prediction and flashcard quality closure;
- Wave 6 scheduling/routing validation;
- Wave 7 diagnostic/field lifecycle UX closure;
- Waves 8–9 accessibility, reliability, privacy and performance closure;
- Wave 10 empirical proof that the product improves long-term reasoning, recall and table transfer;
- Wave 0 authenticated production DOM smoke and exact deployed SHA.

## 10. Production boundary

Strategic `MODULE_GOLD` here is repository curriculum truth. Wave 4 was **not deployed by repository automation** and this document does not claim that production currently serves implementation SHA `5a6af4ed...`.

## 11. Change and transition rule

Any edit to a locked strategic claim, learner-facing answer, explanation, table card, glossary term or other locked learner-copy source changes the corpus fingerprint and invalidates existing locale approval evidence until the required human review is renewed. Cosmetic layout changes outside the locked corpus do not automatically invalidate strategic/editorial approval but must preserve meaning and accessibility.

Automated checks may only reject an invalid transition. They must never write `APPROVED`, `RU_APPROVED`, `EN_APPROVED`, `MODULE_GOLD`, human reviewer evidence or an equivalent acceptance state. Approval is a reviewed repository fact, not a build product.
