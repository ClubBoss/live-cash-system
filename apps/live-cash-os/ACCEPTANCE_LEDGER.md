# Live Cash OS — Acceptance Ledger

Status: `W1_W9_IMPLEMENTATION_CLOSED / EXACT_MAIN_RELEASE_GATE_GREEN / HUMAN_CONTENT_LANGUAGE_REVIEW_PENDING / PRE_LEARNING_CLOSURE_IN_PROGRESS`

This ledger records current W1–W9 repository truth. It separates implementation closure, automated rejection gates, human poker/language approval, empirical usability evidence, production identity, and the later W10/W11 acceptance process.

## Current implementation identity

- product implementation baseline: `ad29871fe923357049231ec6621d4784de8bfd1c`
- baseline message: `Final W1–W9 learner-facing recovery polish`
- exact-baseline CI run: `31220140534`
- exact-baseline release result: `SUCCESS`
- release command: `npm run test:release`
- exact-baseline automated evidence: `136/136` unit/integration PASS; `85` browser E2E PASS; `3` intentional target skips
- this pre-learning closure branch is truth/evidence reconciliation only unless a separately reviewed defect requires code change

Waves 6, 7, 8 and 9 are implemented in the canonical main lineage. Older statements that main was unmodified, Wave 6 had not started, or the repository was only a W1–W5 integration candidate are superseded.

## Governing acceptance boundary

Automated checks are rejection tools, not approval writers. A GREEN candidate gate does not create human poker, drill, RU/EN, usability, production-deployment, or empirical-learning approval.

Current governance remains intentionally review-pending:

- manifest: `TRANSITIONAL_REVIEW_REQUIRED`
- strategy: `CURRICULUM_STRATEGY_REVIEW_PENDING`
- drills: `DRILLS_REVIEW_PENDING`
- strategy approval: `null`
- drill approval: `null`
- human locale approvals: none
- final composition: `REVIEW_PENDING`

`REVIEW_PENDING` is a legal implementation-candidate state and never an approval state.

## Wave 1

Current verdict:

`WAVE_1_IMPLEMENTATION_ACCEPTED / COMPREHENSION_EVIDENCE_PENDING`

The first-use flow, optional diagnostic explanation, direct lesson route and bilingual navigation are implemented and covered by browser regression tests. Formal fresh-context comprehension evidence remains deferred to genuine use rather than fabricated pre-release evidence.

Strict Wave 1 human evidence remains open:

- at least 3 eligible fresh-context walkthroughs;
- the Master Plan comprehension thresholds for diagnostic purpose/optionality and main navigation;
- observed first-lesson entry behavior.

## Waves 2–4R — content, strategy and language governance

The repaired content/governance pipeline remains authoritative. Stable learner IDs and the canonical source-backed curriculum must not be changed merely to simplify architecture.

Pending human poker review remains required for the repaired W3 priority material, including the repaired claims in LCM-02, LCM-03 and LCM-06 and the final-composition W3 drills. Automated claim, source-lock and one-best-answer checks do not substitute for poker-expert review.

Fresh human RU and EN review of the exact final learner-facing composition also remains required. This review must include learner-facing surfaces added during W6–W9, not only the earlier W1–W5 curriculum copy.

No stale strategy/drill/locale approval may be restored automatically after semantic or composition changes.

## Wave 5

Current disposition:

`WAVE_5_IMPLEMENTATION_CLOSED_WITH_ACCEPTED_P2_DEBT`

Preserved mechanics include one-best-answer integrity, ID-safe shuffle, three-topic mixed practice, topic concealment, prediction-first labs, changed-node/boundary practice, flashcards and stable learner history.

Accepted P2 compatibility debt remains non-blocking for pre-learning use, including DOM compatibility ownership and split mixed-practice unlock ownership. This debt must not trigger a purity refactor unless it creates a demonstrated learner-facing or integrity defect.

## Wave 6

Current disposition:

`W6_IMPLEMENTATION_CLOSED`

Implemented behavior includes bounded 5/15/30-minute planning, warm-up/post-session modes, deterministic scheduling, due/repair priority, unfinished-session resume, bounded return after absence, one-new-mechanism protection and routing from reviewed diagnostic priorities without fabricating learning evidence.

Immediate successful repair remains distinct from delayed retention evidence.

## Wave 7

Current disposition:

`W7_IMPLEMENTATION_CLOSED / HUMAN_USABILITY_EVIDENCE_PENDING`

Implemented behavior includes explain-back persistence, reviewed explain-back repair routing, structured real-hand capture, result separation, field-review lifecycle, progress/evidence surfaces and protection against false field validation.

A raw hand or one reviewed hand cannot create `FIELD_VALIDATED`; the evidence contract requires multiple independent supports plus retention/variant evidence.

Formal timing/comprehension evidence for diagnostic, explain-back, hand capture and progress-map usability remains appropriate for real-use/W10 collection.

## Wave 8

Current disposition:

`W8_CRITICAL_UX_ACCESSIBILITY_IMPLEMENTATION_CLOSED / STRICT_MANUAL_EVIDENCE_PENDING`

Automated coverage includes mobile viewport sanity, no document-level horizontal overflow on key surfaces, 44px primary targets, explain-back naming, focus transfer, progressbar semantics, visible keyboard focus and reduced-motion behavior.

A separate cross-browser Playwright configuration exists for Chromium, Firefox, WebKit desktop, iPhone/WebKit, Android/Chromium and iPad/WebKit. The canonical main release workflow currently runs the standard Chromium desktop/mobile suite only, so strict cross-browser/manual accessibility acceptance remains evidence-pending rather than falsely claimed.

Open strict-evidence items may include real-device/browser confirmation, 200% zoom, end-to-end keyboard walkthroughs, contrast/automated accessibility audit and screen-reader semantics where not otherwise demonstrated.

## Wave 9

Current disposition:

`W9_RELIABILITY_IMPLEMENTATION_CLOSED / PERFORMANCE_AND_PRODUCTION_EVIDENCE_PENDING`

Implemented reliability coverage includes local/offline continuity, safe schema handling and import, explicit sync conflicts, conditional cloud writes, durable deletion tombstones, fresh-device restore, version skew handling, D1/API failure behavior, recovery copies, safe diagnostics, privacy explanation and service-worker cache/version safeguards.

No silent learner-state loss is an acceptance invariant.

Strict W9 performance measurement and final production/release evidence remain separate from the reliability implementation. Do not add enterprise observability or broad performance infrastructure without demonstrated need.

## Current pre-learning blockers

The remaining blockers before declaring `W1_W9_PRE_LEARNING_READY` are intentionally narrow:

1. human poker revalidation of the repaired priority strategy/drills;
2. final exact-composition RU/EN human review, including W6–W9 learner-facing copy;
3. current production-candidate smoke/identity check after the final closure SHA is materialized.

Cross-browser/manual accessibility evidence may be collected during this closure pass when cheap, but absence of formal certification alone must not expand into a new product-development wave unless it reveals a real P0/P1 defect.

## Empirical evidence boundary

W1/W7 human usability evidence and learning-effect evidence must come from real use. They are not to be fabricated to make the ledger look complete.

W10 starts on the final pre-learning candidate and collects genuine repeated-session, delayed-recall, misconception, return-after-break and real-hand evidence. W11 remains the later formal acceptance/release identity stage.

## Production boundary

The stable production URL remains `https://live-cash-os.elmarsal.chatgpt.site/`.

A successful repository CI run does not prove that this exact source is deployed. Exact deployed identity and a fresh-state production smoke remain required before the final pre-learning-ready claim.

## Governing rule

`CONTENT PRESERVATION > architecture cleanliness`.

No closure work may delete or semantically compress admitted poker content, churn stable learner IDs, change correct-answer identity, lose provenance, remove RU/EN coverage, make canonical material unreachable, or turn compatibility copy into a new semantic authority without explicit reviewed justification.
