# A0 — Learning Route Optimization — 10/10 DoD V1

Status: `ACTIVE`

## Mission

Replace topic-order learning with an explicit learning-route authority optimized for real live-cash skill acquisition.

The legacy 11 LCM sequence remains a concept/source spine only. It is not canonical learner order.

## 10/10 definition

A0 is 10/10 only if all of the following are true:

1. **Inventory/order separation** — skill identity is stable while learner order can change independently.
2. **Dependency semantics** — each dependency can be HARD, SOFT, or REINFORCING.
3. **Spiral route** — the route may leave a topic and revisit it later when downstream context increases transfer.
4. **EV inputs** — route priority explicitly considers live frequency, mistake cost, transfer leverage, cognitive load, motivation/time-to-value, and repair need.
5. **No legacy-order axiom** — no scheduler rule may infer priority from LCM numbering or W1→W14 numbering alone.
6. **Hard prerequisite restraint** — HARD is used only where absence of the prior capability would make the next node materially incomprehensible or unsafe to score.
7. **Soft prerequisite support** — useful-but-not-required preparation does not unnecessarily lock progress.
8. **Reinforcing dependency support** — later nodes may deliberately strengthen an earlier skill rather than waiting for full mastery first.
9. **Early table value** — the route reaches concrete preflop and flop decisions early enough that the product does not feel like a theory textbook.
10. **Interleaving** — prior skills return through changed-node and mixed retrieval rather than topic-completion blocks.
11. **Source integrity** — route changes do not alter poker answer keys or fabricate solver/chart precision.
12. **Evidence integrity** — route availability and mastery remain separate; exposure cannot count as demonstrated competence.
13. **Explainability** — the scheduler can produce a short `whyNow` reason for the recommended node.
14. **Adaptivity** — repair need can outrank nominal curriculum order without permanently trapping the learner.
15. **Diminishing-return closure** — remaining route uncertainties are either real-user evidence questions, source-blocked strategy questions, or lower-EV polish.

## Route model

### HARD
A capability without which the target node cannot be meaningfully learned or scored.

Example: pot-odds intuition before price-driven bluff-catching.

### SOFT
Preparation that improves comprehension but should not block exposure.

Example: full RFI fluency before seeing a first BTN-vs-BB flop.

### REINFORCING
A later node that makes an earlier model more concrete and improves retrieval of it.

Example: a 3-bet-pot flop can reinforce why preflop range shape matters.

## Ranking principle

The next node should maximize approximate learning EV, not chapter continuity.

Positive terms:
- live frequency;
- mistake cost;
- transfer leverage;
- motivation/time-to-value;
- repair urgency;
- readiness.

Negative terms:
- cognitive overload;
- unresolved source authority;
- excessive repetition;
- premature complexity.

No numeric score is treated as scientific truth; weights are product-routing heuristics and must remain inspectable.

## Canonical early journey shape

The first route should intentionally interleave:

`EV intuition → position/RFI → BB price/closing action → first board ownership → simple BTN-vs-BB flop → changed preflop node → mixed mini-gauntlet`

This is a route hypothesis to implement/test, not a permanent chapter list.

## Hard stops

Stop A0 only for:
- `ARCHITECTURE_DECISION_REQUIRED`: route semantics would require incompatible state/evidence models;
- `STRATEGY_UNRESOLVED`: route depends on an unsupported answer key;
- `REGRESSION_BLOCKER`: route implementation invalidates evidence integrity;
- `SCOPE_INVALIDATED`: current skill inventory proves materially wrong.

Executable tests are separately pending while local execution is unavailable. GitHub Actions are not a development acceptance requirement for this program.
