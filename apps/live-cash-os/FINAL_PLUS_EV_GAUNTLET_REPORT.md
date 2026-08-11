# Final +EV Gauntlet

Status: technical candidate green; final release acceptance remains subject to exact-main validation plus existing human and empirical gates.

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
- Canonical exact-head release gate passed before this truth-only documentation update; the final branch head must pass the same gate again before merge.
- Source locks remain rejection-only governance.
- Strategy/drill/RU/EN/final-composition human approvals remain pending and cannot be created by deterministic CI.
- Wave 10 empirical acceptance remains separate from implementation evidence.
- Merge requires exact-head GREEN; final technical closure requires exact-main GREEN and its test-mirror deployment.
