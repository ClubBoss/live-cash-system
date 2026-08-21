# A3 — Preflop Decision Engine — 10/10 DoD V1

Status: `ACTIVE`

## Mission

Turn the preflop skill inventory into a practical live-cash decision engine rather than a chart chapter.

## 10/10 definition

A3 is 10/10 only if:

1. P0/P1 preflop families cover RFI, limp/overlimp/iso, IP calling, BB calling, SB vs opens, 3-bet construction, facing 3-bets, 4-bet fundamentals, squeezing, and live/depth/rake adjustments.
2. Every family has enough independent corpus to support the intended evidence ladder; for normal full-training families the target is at least 2 recognition, 3 direct, 2 changed/mixed, and 1 boundary stimulus unless the family target is intentionally lower.
3. No family is trained through exact visual chart cells that lack verified authority.
4. Solver/chart evidence may shape the pattern, but learner memory targets are causal heuristics plus boundaries.
5. Position, open size, rake, depth, players behind, fold equity and called branch are represented as changed variables.
6. Squeeze is not taught as `dead money = raise`; called/4-bet branches matter.
7. SB is not treated as a discounted BB.
8. BB decisions compare call EV with fold EV and account for closing action.
9. Facing 3-bets uses the source's ballpark model as a baseline, never an exact universal defence law.
10. 4-bet bluffing requires real folds; value 4-bets must be consistent with the assumed 5-bet response.
11. Limped-pot strategy remains table-specific; no universal isolation chart is invented.
12. Every high-EV family has at least one trigger-bound Practical Rule or equivalent memory hook.
13. Anti-guessing: distractors are plausible misconceptions, not absurd options or answer-length leaks.
14. RU/EN meaning is aligned.
15. Remaining gaps after gauntlet are visual-chart verification, source-blocked exact boundaries, or lower-EV polish.

## Source ceiling

Use source-backed mechanisms from FTGU E02–E06 and E15–E18, plus admitted Smash/internal squeeze/live-adjustment authorities. Exact chart cells, exact solver mixes and universal percentages remain outside learner truth unless separately verified.

## Closure rule

Continue repair passes while any P0/P1 family cannot honestly reach its intended evidence stage or while an obvious high-EV changed variable is absent.

Executable validation remains pending while local execution is unavailable. GitHub Actions are not a development gate for this program.
