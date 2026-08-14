# Live Cash OS — bounded human review tranche v1

Status: **PENDING HUMAN REVIEW**

This packet prepares the remaining human-only review work. Machine checks, AI review, CI and the W10 compiler must not change these rows to approved.

## Scope

Review the highest-exposure learner surfaces first. Expand to the full corpus only if this tranche finds a material pattern or when W11 requires full approval.

1. Today: recommendation, reason, time/mode framing, locked/disabled explanations.
2. First lesson experience: prediction → mechanism → action → explain-back → transfer check → summary.
3. Review/repair: `Why now?`, bounded batch semantics, failed retrieval → repair → later retention.
4. Diagnostic: all 10 cold prompts/options, post-completion feedback and routing language.
5. Explain-back: reference self-check and independent changed/boundary verification.
6. Real Hands: capture completeness, result separation, reviewer authority and repair routing.
7. Data & Recovery: export/import, profile continuity, reset/conflict/error wording.
8. Mobile portrait and RU/EN parity on the surfaces above.

## Review dimensions

For every sampled surface, adjudicate independently:

- **Poker truth** — decision/mechanism/assumptions are strategically correct within stated scope.
- **Comprehension** — a learner can understand the prompt and intended mechanism without hidden context.
- **RU** — natural, precise Russian; terminology consistent and non-misleading.
- **EN** — natural, precise English; not a literal or degraded translation.
- **Composition** — hierarchy, amount of information and sequencing support the intended learner action.

Allowed status per dimension:

- `PENDING`
- `APPROVED`
- `CHANGES_REQUIRED`
- `INSUFFICIENT_CONTEXT`

## Evidence table

| Surface | Poker truth | Comprehension | RU | EN | Composition | Reviewer / date | Notes / finding ID |
|---|---|---|---|---|---|---|---|
| Today | PENDING | PENDING | PENDING | PENDING | PENDING | — | — |
| First lesson flow | PENDING | PENDING | PENDING | PENDING | PENDING | — | — |
| Review / repair | PENDING | PENDING | PENDING | PENDING | PENDING | — | — |
| Diagnostic 10/10 | PENDING | PENDING | PENDING | PENDING | PENDING | — | — |
| Explain-back / transfer check | PENDING | PENDING | PENDING | PENDING | PENDING | — | — |
| Real Hands | PENDING | PENDING | PENDING | PENDING | PENDING | — | — |
| Data & Recovery / errors | PENDING | PENDING | PENDING | PENDING | PENDING | — | — |
| Mobile portrait parity | PENDING | PENDING | PENDING | PENDING | PENDING | — | — |

## Finding rule

Record a product change only when a finding is:

- P0/P1 on first occurrence; or
- repeated across sessions/reviewers; or
- a clear correctness/learning-integrity defect.

Do not open a broad polish wave for isolated preference-level copy or visual taste.

## Closure rule

This tranche is complete only when a real human reviewer has filled reviewer/date and status cells. AI can preflight consistency and surface likely review targets, but AI output is not human approval and cannot satisfy `human_strategy_approval`, `human_ru_approval`, `human_en_approval`, final composition approval, or W10 empirical acceptance.
