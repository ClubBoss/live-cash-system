# Live Cash OS — Acceptance Ledger

Status: `W1_W9_IMPLEMENTATION_CLOSED / EXACT_MAIN_RELEASE_GATE_GREEN / CROSS_BROWSER_ENGINE_MATRIX_GREEN / LIVE_PRODUCTION_SMOKE_GREEN / HUMAN_CONTENT_LANGUAGE_REVIEW_PENDING`

This ledger records current pre-learning truth. Automated implementation, critical browser coverage and live learner smoke are green. Genuine human poker and final RU/EN approval remain intentionally open and cannot be created by scripts or model review.

## Current identity and evidence

- learner-runtime semantic baseline: `ad29871fe923357049231ec6621d4784de8bfd1c` — `Final W1–W9 learner-facing recovery polish`
- current main before this final truth-only reconciliation: `33206e8ec328fe9710ef0a0014481b68260695c2`
- exact-main CI: run `31223580163` — `SUCCESS`
- canonical release command: `npm run test:release`
- current release assertions: `136/136` unit/integration PASS; `85` browser E2E PASS; `3` intentional target skips
- locked human-review packet: `reports/PRE_LEARNING_HUMAN_REVIEW_PACKET_2026-08-08.md`
- canonical curriculum RU/EN composition digest: `7b44741c3032d0c3f084f60aab5513a40445e32394c36954496ba83e53127b0a`
- expanded W1–W9 review-corpus fingerprint: `c623a7669ed85e47e411b8b268dee682b2254b934a165330f74647b29dfa9b81`

Closure changes after the semantic W1–W9 product baseline are truth/source-lock/evidence work plus a one-line production-smoke matcher repair; they do not change learner-facing poker content, correct-answer identities, learner state, scheduler, API or storage semantics.

## Governing acceptance boundary

Current governance remains deliberately review-pending:

- manifest: `TRANSITIONAL_REVIEW_REQUIRED`
- strategy: `CURRICULUM_STRATEGY_REVIEW_PENDING`
- drills: `DRILLS_REVIEW_PENDING`
- strategy approval: `null`
- drill approval: `null`
- human locale approvals: none
- final composition: `REVIEW_PENDING`

Automated checks and model/source pre-review are rejection aids, not approval writers. `REVIEW_PENDING` is a valid candidate state and never means human approval.

## W1–W7 implementation truth

- W1: `WAVE_1_IMPLEMENTATION_ACCEPTED / COMPREHENSION_EVIDENCE_PENDING`; fresh-context comprehension evidence is deferred to genuine use/W10.
- W2/W3: governance and repaired priority strategy are implemented; human poker review remains pending for repaired LCM-02/03/06 claims and all 15 W3 drills.
- W4/W4R: canonical bilingual composition is implemented; exact final RU/EN human review remains pending.
- W5: `WAVE_5_IMPLEMENTATION_CLOSED_WITH_ACCEPTED_P2_DEBT`; compatibility/shim debt remains non-blocking absent a demonstrated learner/integrity defect.
- W6: `W6_IMPLEMENTATION_CLOSED`; bounded daily scheduling, repair/delayed-review priority, resume and long-absence handling are implemented without turning diagnostic routing into learning evidence.
- W7: `W7_IMPLEMENTATION_CLOSED / HUMAN_USABILITY_EVIDENCE_PENDING`; explain-back, structured real-hand capture/review and field-evidence protections are implemented. One hand cannot create `FIELD_VALIDATED`.

## Wave 8 evidence

Current disposition:

`W8_CRITICAL_UX_ACCESSIBILITY_IMPLEMENTATION_CLOSED / CROSS_BROWSER_ENGINE_MATRIX_GREEN / STRICT_REAL_DEVICE_A11Y_EVIDENCE_DEFERRED`

One-time closure run `31222664701` executed the existing critical W8 suite through `playwright.cross-browser.config.mjs`.

Result: **42/42 PASS** across:

- Chromium desktop;
- Firefox desktop;
- WebKit desktop;
- WebKit iPhone 390×844 emulation;
- Chromium Android/Pixel emulation;
- WebKit iPad/tablet emulation.

The suite covers the critical learner surfaces already implemented for mobile layout/overflow, 44px primary controls, long real-hand capture, explain-back accessible naming/focus transfer, progressbar semantics, visible focus and reduced motion.

This is browser-engine/emulation evidence, not a claim of physical-device Safari certification, screen-reader certification, complete 200% zoom audit or full formal accessibility conformance. Those strict evidence items are deferred unless real use reveals a blocking defect.

## Wave 9 and production evidence

Current disposition:

`W9_RELIABILITY_IMPLEMENTATION_CLOSED / LIVE_PRODUCTION_SMOKE_GREEN / STRICT_PERFORMANCE_EVIDENCE_DEFERRED`

Reliability implementation remains green for offline/local continuity, safe schema/import handling, explicit sync conflicts, conditional cloud writes, durable deletion tombstones, recovery copies, privacy/recovery UI and service-worker safety.

The first closure production-smoke run reported RED because the smoke script required the lesson button accessible name to equal exactly `Изучить`/`Study`. Captured live evidence showed the learner UI and eleven visible `Изучить` controls; the rendered accessible label includes the arrow suffix. This was a stale test selector rather than a product failure.

The matcher was repaired from exact equality to the same prefix semantics already used by canonical E2E. The identical repaired script blob then passed:

- full release gate on run `31223251425`;
- live production smoke on `https://live-cash-os.elmarsal.chatgpt.site/` — `LIVE_SMOKE_GREEN` on **attempt 1**.

The live UI exposes app version `1.1.0`, matching current source `APP_VERSION = "1.1.0"`. The hosting surface does not expose a trustworthy exact deployed Git SHA, so exact `deployedSha == acceptedSha` remains later W11/formal release-identity evidence rather than a fabricated claim.

Strict W9 performance-budget instrumentation remains deferred; no broad performance infrastructure is justified before real learner evidence.

## Human review corpus

The final human-review corpus is locked in the editorial manifest rather than pointing at the pre-repair W3 blobs. It includes current repaired W3 claims/drills plus principal W6–W9 learner-facing surfaces.

Model/source-assisted pre-review result recorded in the review packet:

`NO_NEW_P0_P1_STRATEGY_DEFECT_FOUND / NOT_HUMAN_APPROVAL`

No new unsupported depth threshold, correct-answer identity conflict or obvious high-severity poker defect was found in that pre-review. This lowers review risk but does not satisfy the human gate.

## Remaining pre-learning blocker

Only one blocker class remains before the formal repository truth can be advanced to `W1_W9_PRE_LEARNING_READY`:

1. **genuine human content/language review** — poker revalidation of repaired W3 priority claims/drills and final RU/EN review of the locked W1–W9 learner-facing corpus.

If human review returns `REPAIR_REQUIRED`, make only the exact bounded repair, refresh the affected locks/fingerprint and rerun the exact-head release/smoke evidence. If it returns genuine `PASS`, record that evidence and advance only the governance states it actually supports.

W1/W7 empirical usability thresholds and learning-effect evidence remain W10 real-use work, not synthetic pre-learning blockers.

## Production and stop boundary

The stable production URL is `https://live-cash-os.elmarsal.chatgpt.site/` and the current learner smoke is GREEN. Exact deployed Git SHA remains unverified and must not be invented.

Once genuine human poker/RU/EN gates are satisfied and the resulting exact main is GREEN, synthetic feature development stops and real training begins. W10 then collects repeated-session, delayed-recall, misconception, return-after-break and real-hand evidence; W11 remains the later formal release-identity acceptance stage.

## Governing rule

`CONTENT PRESERVATION > architecture cleanliness`.

No closure work may delete or semantically compress admitted poker content, churn stable learner IDs, change correct-answer identity, lose provenance, remove RU/EN coverage, make canonical material unreachable, or restore a superseded compatibility layer as semantic authority without explicit reviewed justification.
