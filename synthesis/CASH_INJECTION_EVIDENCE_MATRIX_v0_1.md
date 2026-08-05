# Cash Injection Evidence Matrix v0.1

Status: `ACTIVE / 1_OF_10_EPISODES_MAPPED`

## Purpose

Track exploit and population-sensitive evidence from Cash Injection without forcing the general Smash/FTGU matrix to be rewritten after every incremental episode.

This matrix is an adjunct to:

- `synthesis/CROSS_SOURCE_EVIDENCE_MATRIX_v0_1.md`;
- `synthesis/HEURISTIC_CANDIDATE_REGISTRY_v0_1.md`;
- `profiles/CASH_INJECTION_POOL_HYPOTHESES_v0_1.md`.

## Evidence classes

- `MECHANISM`: range, size or hand-class relationship that can generalise with preserved assumptions;
- `POOL_HYPOTHESIS`: population tendency stated or modelled by the source;
- `ENVIRONMENT_PENDING`: may be useful but is not validated for the target live games;
- `VISUAL_DEPENDENT`: exact cards, sizes, frequencies or EV require source screen review.

## Candidate matrix

| Candidate ID | Compact mechanism | Cash Injection relation | Evidence class | Current effect |
|---|---|---|---|---|
| `H-W02-004` | Flop size determines top-pair/medium-strength raise breadth | `STRONGLY CONFIRMS` via `CINJ-E01` | MECHANISM | Small range-wide bets support broader merged raises. |
| `H-W02-005` | Vulnerable low-kicker or medium-strength hands may raise more | `CONFIRMS` via `CINJ-E01` | MECHANISM | Protection/denial can help vulnerable hands more than strong low-urgency hands. |
| `H-W02-007` | Node-lock the branch, not the personality label | `STRONGLY CONFIRMS` via `CINJ-E01` | MECHANISM | The exploit attaches to small range-bet response, not the player globally. |
| `H-W03-006` | Small bets can be harder to defend | `STRONGLY EXTENDS` via `CINJ-E01` | MECHANISM + POOL_HYPOTHESIS | Smaller raises require wider defence; inelastic overfold may amplify EV. |
| `H-R05-002` | Passive/check branches need active raise defence | `EXTENDS` via `CINJ-E01` | MECHANISM | Defence versus range bet may require merged protection raises. |

## Pool-hypothesis matrix

| Hypothesis ID | Source | Claim | General-core status | Field status |
|---|---|---|---|---|
| `CI-PH-001` | `CINJ-E01` | Regulars overfold and under-three-bet versus small flop raises after small range betting | NOT ADMITTED | FIELD_EVIDENCE_PENDING |

## Module mapping

| Module | Episode 01 delta |
|---|---|
| `LCM-05` | Add small range-bet → merged/small-raise response branch. |
| `LCM-10` | Add evidence grades, falsifiers and confidence decay for `CI-PH-001`. |
| `LCM-11` | Add field observation mission for small c-bet defence elasticity. |

## New candidate gate

Episode 01 creates no new candidate.

Potentially novel language is nested under existing objects:

- elasticity failure → `H-W03-006`;
- hand-specific winners/losers inside one exploit → `H-W02-004` / `H-W02-005`;
- smaller exploit raise → `LCM-05` branch;
- population overfold → `CI-PH-001` overlay.

## Coverage

- mapped: `CINJ-E01`;
- pending: `CINJ-E02` through `CINJ-E10`.

## Verdict

`CASH_INJECTION_EVIDENCE_MATRIX_ACTIVE`

`ONE_EPISODE_MAPPED / NO_RULE_COUNT_INCREASE`
