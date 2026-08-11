# Final +EV Gauntlet

Status: technical closure complete on `main`; final 10/10 release acceptance remains subject only to the existing human/editorial and Wave 10 empirical gates.

## Scope admitted
- Replace residual novice-facing jargon in RU glossaries for LCM-05 / LCM-07 / LCM-09 / LCM-10 with plain poker language.
- Clarify that a 25% call price means the call is one quarter of the final pot.
- Preserve all strategic claims, correct-answer IDs, scheduler routing, mastery, retention, field-evidence semantics, and human approval truth.

## Scope rejected
- No new calculator/tool surface.
- No reset-flow redesign.
- No scheduler or diagnostic redesign.
- No curriculum expansion.
- No new mastery or evidence semantics.

## Gauntlet invariants
- Branch baseline: f097bf0da11c21995e4783a73f7bc0b70ab2416d.
- PR #63 was merged to `main` only after exact-head canonical CI passed.
- The merged exact-main functional SHA passed the canonical release gate and exact-main test-mirror deploy/smoke.
- Source locks remain rejection-only governance.
- Strategy/drill/RU/EN/final-composition human approvals cannot be created by deterministic CI.
- Wave 10 empirical acceptance remains separate from implementation evidence.
- No known P0/P1 implementation blocker remains in the bounded final +EV gauntlet scope.
