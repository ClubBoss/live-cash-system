# Route Optimization Audit — 2026-08-08

Status: `ROUTE_OPTIMIZATION_PRE_W10 / ENGINEERING_ONLY / HUMAN_DELTA_REVIEW_PENDING`

Base candidate: `875294068dc9f9c5317d227514042b96259c3e74`

## Why this change exists

The admitted 11-module curriculum remains intact. The problem is narrower: the legacy `prerequisites` chain is almost fully linear, so it conflates three different concepts:

1. knowledge that is actually required before a module can be understood safely;
2. the recommended default teaching sequence;
3. personal/diagnostic priority used by Today routing.

The Master Plan requires valid prerequisites, coherent progression and owner-priority routing without skipping prerequisites. It also says scheduler/routing tuning should be evidence-backed and forbids opaque recommender logic. Therefore this closure changes eligibility only where the dependency is clearly structural; it does not tune priority weights, mastery thresholds, retention intervals or poker strategy.

## Invariants

- 11 modules remain in the same canonical recommended order.
- No module ID, drill ID, option ID, card ID, lab, correct-answer identity or source/provenance record changes.
- `STATE_SCHEMA_VERSION` remains 2.
- Existing learner progress, active sessions, review queue, cards, field notes and diagnostic history remain valid.
- Completion, repair, retention, variant transfer and field transfer stay distinct.
- One correct answer, one repair, one field hand or one showdown never creates mastery.
- Human poker/RU/EN approvals remain pending; no automation may manufacture them.
- W10 starts only after this route candidate is frozen. Once W10 begins, material routing changes require explicit evidence/restart discipline.

## Recommended default spine

The pedagogical default order remains unchanged:

1. `geometry` — effective depth / post-action SPR / straddle denominator
2. `preflop` — call / squeeze / fold architecture
3. `blinds` — SB vs BB identity and realisation
4. `filtering` — source range → action → survivors
5. `shape` — small-wide vs large-selective response shape
6. `aggression` — value-first aggression and future jobs
7. `ancestry` — 3-bet/4-bet branch ancestry
8. `multiway` — action order, sandwich, shared defence
9. `river` — value/bluff supply before blocker
10. `evidence` — branch-specific opponent/field evidence
11. `transfer` — changed node, delay, repair and field proof

This order is the default teaching spine, not a claim that every prior module is a hard prerequisite for every later module.

## Hard prerequisite audit

| Module | Legacy predecessor chain | Hard prerequisites after audit | Decision |
|---|---|---|---|
| geometry | none | none | unchanged |
| preflop | geometry | geometry | unchanged |
| blinds | preflop | preflop | unchanged |
| filtering | blinds | preflop | relax: blind identity is useful but not required for source/action/survivor reasoning |
| shape | filtering | filtering | unchanged |
| aggression | shape | shape | unchanged |
| ancestry | aggression | filtering | relax: branch ancestry requires source/filtering; aggression jobs are recommended prior knowledge, not a hard gate |
| multiway | ancestry | filtering | relax: action order/shared defence require geometry + ranges/filtering; full 3-bet ancestry is not universally required |
| river | multiway | ancestry | relax: river audit depends on surviving value/bluff ancestry; multiway mastery is not required for heads-up river nodes |
| evidence | river | preflop | relax: branch-specific evidence discipline can be understood and used long before advanced river mastery |
| transfer | evidence | geometry | relax: repair/delay/changed-node mechanics operate from the first learned mechanism; the full meta-lesson remains recommended last |

Transitive dependencies still preserve the real foundations. For example `filtering -> preflop -> geometry`; `river -> ancestry -> filtering -> preflop -> geometry`.

## Cross-cutting rules from day one

### Evidence hygiene

Real-hand capture already separates pre-result reasoning from outcome and field validation already requires multiple reviewed supporting hands plus retention and variant transfer. Learner-facing copy is tightened to state explicitly that one hand is an observation, not proof of a frequency or a global player type. LCM-10 remains a full consolidation lesson later in the route.

### Transfer / repair

The W6/W7 runtime already does the right thing from the first lesson: miss → new-node repair → later retrieval; immediate correction does not create retention. Active Learning Closure also tells the learner that a completed lesson is not delayed retention. LCM-11 therefore remains a later explanatory/meta lesson, while its learning mechanics operate from day one.

## Scheduler policy

- Keep existing owner-priority weights unchanged until W10 evidence exists.
- Keep existing due-review/repair/backlog/time-budget behavior unchanged.
- Default new-lesson tie-breaking follows the canonical 01→11 recommended spine.
- Diagnostic/personal priority may move a later module earlier only after its audited hard prerequisites are complete.
- No complex recommender, no hidden score model, no new learner-state schema.

## Human delta review scope

Human review is still required for:

- whether every relaxed prerequisite sounds pedagogically safe to a poker reviewer;
- the new RU/EN evidence-hygiene sentence;
- the new RU/EN locked-module notice;
- confirmation that LCM-10/11 remain coherent as later consolidation lessons.

This document is engineering/audit evidence only and is not human approval.
