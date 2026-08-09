# Final Polish & Release Integrity Closure

Scope: bounded post-Gauntlet cleanup only.

Included:

- align production smoke with the current `Diagnostic` navigation contract;
- stamp deployed test-mirror builds with the exact Git SHA and verify it in smoke;
- make the main-branch test-mirror path re-runnable via `workflow_dispatch`;
- preserve smoke evidence as an Actions artifact;
- replace stale 90-second warm-up wording with the actual `up to 2 minutes` contract;
- unify learner-facing Diagnostic terminology in RU/EN;
- keep curriculum, answer identities, IDs, prerequisites, scheduler/mastery/retention/field-validation semantics unchanged.

Explicitly not included:

- compatibility-layer rewrite without new real-use evidence;
- speculative navigation redesign;
- new learning features or scheduler logic;
- fake human strategy/drill/RU/EN approvals;
- W10 or W11 closure.

Release rule: merge only after branch release gate is GREEN; then require exact-main GREEN including the deployed test-mirror smoke path.
