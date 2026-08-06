# General Live Cash - Heuristic Candidate Registry v0.6

Status: `ACTIVE_CANDIDATE_REGISTRY / MULTIWAY_DIRECTIONAL_WAVE_COMPLETE`

Supersedes `HEURISTIC_CANDIDATE_REGISTRY_v0_5.md`. Candidate IDs, module ownership and statuses remain stable except for residual-gate closure.

## Status vocabulary

- `VALIDATION_PENDING`
- `DRILL_READY`
- `FIELD_TEST_PENDING`
- `ADMITTED`

Residual gates: `ANCHOR`, `BOUNDARY`, `VISUAL`, `DRILL`, `LEARNER`, `FIELD`, `COMPRESSION`, `NONE_CORE`.

## Unified registry

| ID | Compact mechanism | Module | Status | Current residual gate |
|---|---|---|---|---|
| `H-W01-001` | Effective stack sets preflop architecture | `LCM-01` | VALIDATION_PENDING | `BOUNDARY / LEARNER` |
| `H-W01-002` | Expand squeezes by purifying candidates | `LCM-02` | DRILL_READY | `ANCHOR / LEARNER / FIELD` |
| `H-W01-003` | Straddle changes denominator and SPR | `LCM-01` | DRILL_READY | `BOUNDARY / FIELD` |
| `H-W01-004` | Identify blind/source range before board | `LCM-03` | DRILL_READY | `ANCHOR / LEARNER` |
| `H-W01-005` | Update range after an exploited street continues | `LCM-04` | DRILL_READY | `NONE_CORE` |
| `H-W01-006` | Deep OOP: protect resilient calls before raising | `LCM-03` | VALIDATION_PENDING | `BOUNDARY / VISUAL / DRILL / LEARNER` |
| `H-W01-007` | Read high-weight offsuit and pair mass first | `LCM-04` | DRILL_READY | `COMPRESSION / LEARNER` |
| `H-W01-008` | Polar preflop bluffs target dominating folds | `LCM-02` | DRILL_READY | `ANCHOR / LEARNER / FIELD` |
| `H-W01-009` | Current frequency depends on origin and prior reach | `LCM-04` | DRILL_READY | `ANCHOR / LEARNER` |
| `H-W02-001` | Value threshold before bluff volume | `LCM-06` | DRILL_READY | `COMPRESSION / LEARNER` |
| `H-W02-002` | Every turn bluff needs a future job | `LCM-06` | DRILL_READY | `COMPRESSION / LEARNER` |
| `H-W02-003` | Large size only when polarization survives | `LCM-06` | DRILL_READY | `BOUNDARY / VISUAL` |
| `H-W02-004` | Bet shape determines raise breadth | `LCM-05` | DRILL_READY | `NONE_CORE / LEARNER` |
| `H-W02-005` | Vulnerable made hands may raise more | `LCM-05` | DRILL_READY | `BOUNDARY / LEARNER` |
| `H-W02-006` | Turn lead/probe follows flop range composition | `LCM-06` | DRILL_READY | `LEARNER`: HU probe versus multiway delayed-expression distinction active |
| `H-W02-007` | Exploit the exact branch, not the personality | `LCM-10` | DRILL_READY | `FIELD / LEARNER` |
| `H-W02-008` | Remove speculative continues versus air-poor bets | `LCM-10` | VALIDATION_PENDING | `FIELD` |
| `H-W02-009` | River bluff-catch begins with value, size and ancestry | `LCM-09` | VALIDATION_PENDING | `FIELD / LEARNER` |
| `H-W03-001` | A 3-bet/4-bet-pot range begins preflop and persists | `LCM-07` | DRILL_READY | `ANCHOR / LEARNER` |
| `H-W03-002` | Dominated big cards lose first versus value-heavy 3-bets | `LCM-07` | VALIDATION_PENDING | `ANCHOR / BOUNDARY` |
| `H-W03-003` | Wide preflop ranges require postflop compensation | `LCM-07` | DRILL_READY | `BOUNDARY / LEARNER` |
| `H-W03-004` | Split strong and weak action branches | `LCM-10` | DRILL_READY | `FIELD` |
| `H-W03-005` | Bluff supply must be seeded before river | `LCM-09` | DRILL_READY | `COMPRESSION / LEARNER` |
| `H-W03-006` | Small sizes can be harder to defend | `LCM-05` | DRILL_READY | `FIELD / LEARNER` |
| `H-W03-007` | Multiway defence is shared | `LCM-08` | DRILL_READY | `LEARNER / VISUAL_EXACT`: directional action-order boundary active |
| `H-W03-008` | Multiway bluffs need backup equity/removal | `LCM-08` | DRILL_READY | `LEARNER / VISUAL_EXACT`: tier hierarchy active |
| `H-W03-009` | Fast-play value when aggression will not arrive | `LCM-08` | VALIDATION_PENDING | `FIELD / LEARNER`: method active, magnitude pending |
| `H-W03-010` | Multiway nut ownership follows preflop combos | `LCM-08` | DRILL_READY | `ANCHOR / LEARNER / VISUAL_EXACT`: OPAL audit active |
| `H-W03-011` | Blockers matter only inside line-created ranges | `LCM-09` | DRILL_READY | `COMPRESSION / LEARNER` |
| `H-R04-007` | Suppressed flop aggression can reappear later | `LCM-08` | DRILL_READY | `BOUNDARY / VISUAL_EXACT / LEARNER / FIELD`: direct answer key active |
| `H-R04-008` | A live tell is evidence, not a conclusion | `LCM-10` | DRILL_READY | `FIELD / LEARNER` |
| `H-R04-010` | Preserve resilient hands in passive branches | `LCM-05` | DRILL_READY | `BOUNDARY` |
| `H-R05-001` | Recalculate ownership after every range filter | `LCM-04` | DRILL_READY | `NONE_CORE` |
| `H-R05-002` | Heavy-check strategies need active calls and raises | `LCM-05` | DRILL_READY | `BOUNDARY / LEARNER` |

## Multiway-wave effect

Created:

- source evidence map;
- five-card multiway memory system;
- action-order and shared-defence decision architecture;
- OPAL nut-ownership audit;
- bluff-support tiers;
- field-clear and delayed-expression gate;
- original direct drill pack;
- target-live observation schema.

No exact solver frequency or population magnitude was promoted.

## Direct drill coverage

```text
DIRECT: 33
ANSWER_KEY_GATED: 1
INDIRECT_ONLY: 0
```

Only remaining direct gap:

- `H-W01-006` — exact deep OOP protected-call boundary.

`H-R04-007` remains `DRILL_READY`; this wave closes its missing direct answer key rather than changing status.

## Status counts

- total: `34`;
- `DRILL_READY`: `28`;
- `VALIDATION_PENDING`: `6`;
- `FIELD_TEST_PENDING`: `0`;
- `ADMITTED`: `0`.

## Next closure lane

`DEEP OOP PROTECTED-CALL AND EXACT DEPTH/SPR BOUNDARY`

This is the last direct-answer gap and the next highest-value bounded evidence task.

## Registry verdict

`HEURISTIC_CANDIDATE_REGISTRY_V0_6_ACTIVE`

`MULTIWAY_DIRECTIONAL_ARCHITECTURE_ACTIVE`

`DIRECT_DRILL_COVERAGE_33_OF_34`

`NO_STATUS_OR_ADMISSION_INFLATION`
