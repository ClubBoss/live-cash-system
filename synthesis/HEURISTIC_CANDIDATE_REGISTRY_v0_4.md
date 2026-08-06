# General Live Cash - Heuristic Candidate Registry v0.4

Status: `ACTIVE_CANDIDATE_REGISTRY / ALL_CATALOGUED_SOURCE_FAMILIES_COMPLETE / POST_SOURCE_GATES_ACTIVE`

Supersedes `HEURISTIC_CANDIDATE_REGISTRY_v0_3.md` as the current candidate-status authority.

Candidate IDs, primary module ownership and status counts are preserved. This version removes stale future-Carrot routing and distinguishes source support from independent validation, learner validation and field validation.

## Status vocabulary

- `VALIDATION_PENDING`
- `DRILL_READY`
- `FIELD_TEST_PENDING`
- `ADMITTED`
- `REVISED`
- `REJECTED`
- `BLOCKED`

## Residual gate vocabulary

- `ANCHOR` - independently derived range or threshold required;
- `BOUNDARY` - exact depth, size, position or context split required;
- `VISUAL` - exact source screen or source geometry can change the answer;
- `DRILL` - stable original answer key or contrastive drill missing;
- `LEARNER` - error probability or misuse pattern not measured;
- `FIELD` - target-game frequency or exploit magnitude not validated;
- `COMPRESSION` - final wording or merge/split decision only;
- `NONE_CORE` - core mechanism stable; examples or overlays remain.

## Unified registry

| ID | Compact mechanism | Module | Slot | Status | Current residual gate |
|---|---|---|---:|---|---|
| `H-W01-001` | Effective stack sets preflop architecture | `LCM-01` | 1 | VALIDATION_PENDING | `ANCHOR / BOUNDARY`: original depth bands and line-specific thresholds |
| `H-W01-002` | Expand squeezes by purifying existing candidates | `LCM-02` | 3 | VALIDATION_PENDING | `ANCHOR / DRILL / VISUAL`: original squeeze families and flat branch |
| `H-W01-003` | Straddle changes denominator and SPR | `LCM-01` | 2 | DRILL_READY | `BOUNDARY / FIELD`: straddle sizing and environment overlay |
| `H-W01-004` | Identify blind/source range before board | `LCM-03` | 4 | DRILL_READY | `ANCHOR`: compact original source-range anchors |
| `H-W01-005` | Update range after an exploited street continues | `LCM-04` | 5 | DRILL_READY | `NONE_CORE`: changed examples and timed retrieval only |
| `H-W01-006` | Deep OOP: protect resilient calls before raising | `LCM-03` | 6 | VALIDATION_PENDING | `BOUNDARY / VISUAL / DRILL`: exact deep OOP response boundary |
| `H-W01-007` | Read high-weight offsuit and pair mass first | `LCM-04` | 4 | DRILL_READY | `ANCHOR / COMPRESSION`: fast original range-mass examples |
| `H-W01-008` | Polar preflop bluffs target dominating folds | `LCM-02` | 3 | DRILL_READY | `ANCHOR / DRILL / VISUAL`: target-fold and call-branch answer key |
| `H-W01-009` | Current frequency depends on origin and prior reach | `LCM-04` | 5 | DRILL_READY | `ANCHOR / COMPRESSION`: players-behind and mixed-reach examples |
| `H-W02-001` | Value threshold before bluff volume | `LCM-06` | 8 | DRILL_READY | `COMPRESSION / LEARNER`: final cue and misuse test |
| `H-W02-002` | Every turn bluff needs a future job | `LCM-06` | 8 | DRILL_READY | `COMPRESSION / LEARNER`: distinguish immediate EV from future job |
| `H-W02-003` | Large size only when polarization survives | `LCM-06` | 9 | DRILL_READY | `BOUNDARY / VISUAL`: exact size exceptions only if final rule needs them |
| `H-W02-004` | Bet shape determines raise breadth | `LCM-05` | 7 | DRILL_READY | `NONE_CORE`: board/depth variants and learner testing |
| `H-W02-005` | Vulnerable made hands may raise more | `LCM-05` | 7 | DRILL_READY | `BOUNDARY / LEARNER`: protection versus low-urgency value split |
| `H-W02-006` | Turn lead/probe follows flop range composition | `LCM-06` | 10 | DRILL_READY | `BOUNDARY`: multiway scope and delayed-aggression integration |
| `H-W02-007` | Exploit the exact branch, not the personality | `LCM-10` | 16 | DRILL_READY | `FIELD / LEARNER`: evidence grade and confidence decay |
| `H-W02-008` | Remove speculative continues versus air-poor value-heavy bets | `LCM-10` | 16 | VALIDATION_PENDING | `FIELD`: target-live magnitude and branch falsifiers |
| `H-W02-009` | River bluff-catch begins with value, size and ancestry | `LCM-09` | 15 | VALIDATION_PENDING | `FIELD / LEARNER`: local underbluff calibration and misuse testing |
| `H-W03-001` | A 3-bet/4-bet-pot range begins preflop and persists | `LCM-07` | 11 | DRILL_READY | `ANCHOR`: compact original preflop families |
| `H-W03-002` | Dominated big cards lose first versus value-heavy 3-bets | `LCM-07` | 11 | VALIDATION_PENDING | `ANCHOR / BOUNDARY`: live-rake and depth-specific continue ranges |
| `H-W03-003` | Wide preflop ranges require postflop compensation | `LCM-07` | 12 | DRILL_READY | `BOUNDARY / LEARNER`: position/depth exceptions and misuse test |
| `H-W03-004` | Split strong and weak action branches | `LCM-10` | 12 | DRILL_READY | `FIELD`: protected-branch frequency and falsifier |
| `H-W03-005` | Bluff supply must be seeded before river | `LCM-09` | 15 | DRILL_READY | `COMPRESSION / LEARNER`: ancestry counting without overcomplexity |
| `H-W03-006` | Small sizes can be harder to defend | `LCM-05` | 7 | DRILL_READY | `FIELD / LEARNER`: live response elasticity and overfold diagnosis |
| `H-W03-007` | Multiway defence is shared | `LCM-08` | 13 | DRILL_READY | `BOUNDARY / VISUAL`: action-order and player-count scope |
| `H-W03-008` | Multiway bluffs need backup equity/removal | `LCM-08` | 13 | DRILL_READY | `BOUNDARY / VISUAL`: original candidate hierarchy |
| `H-W03-009` | Fast-play value when aggression will not arrive | `LCM-08` | 14 | VALIDATION_PENDING | `FIELD / BOUNDARY`: passive-pool and action-order scope |
| `H-W03-010` | Multiway nut ownership follows preflop combos | `LCM-08` | 13 | DRILL_READY | `ANCHOR / VISUAL`: high-weight multiway range compression |
| `H-W03-011` | Blockers matter only inside line-created ranges | `LCM-09` | 15 | DRILL_READY | `COMPRESSION / LEARNER`: final selector ordering |
| `H-R04-007` | Suppressed flop aggression can reappear later | `LCM-08` | 10 | DRILL_READY | `BOUNDARY / VISUAL / DRILL`: multiway/sandwich delayed-aggression scope |
| `H-R04-008` | A live tell is evidence, not a conclusion | `LCM-10` | 16 | DRILL_READY | `FIELD / LEARNER`: evidence weighting and examples |
| `H-R04-010` | Preserve resilient hands in passive branches | `LCM-05` | 6 | DRILL_READY | `BOUNDARY`: deep OOP split shared with `H-W01-006` |
| `H-R05-001` | Recalculate ownership after every range filter | `LCM-04` | 5 | DRILL_READY | `NONE_CORE`: timed retrieval and compression only |
| `H-R05-002` | Heavy-check strategies need active calls and raises | `LCM-05` | 6, 7 | DRILL_READY | `BOUNDARY / LEARNER`: minimum protected-passive architecture |

## Source-completion effect

All catalogued source families are complete. Therefore no row is allowed to use `future Carrot`, `remaining course` or equivalent as a material gate.

Residual work routes to:

```text
independent range work
+ material targeted visual review
+ original drill answer-key construction
+ learner diagnostics
+ target-game field evidence
+ final compression
```

## Direct drill coverage

```text
direct original drill: 30
answer-key/evidence-gated direct drill gap: 4
indirect-only: 0
```

The four remaining gaps are:

- `H-W01-002` - squeeze purification;
- `H-W01-006` - exact deep OOP protected-call boundary;
- `H-W01-008` - polar preflop target folds and call branch;
- `H-R04-007` - multiway delayed aggression.

They are no longer labelled `Carrot-gated` or generically `source-gated`.

## Status counts

- total: `34`;
- `DRILL_READY`: `27`;
- `VALIDATION_PENDING`: `7`;
- `FIELD_TEST_PENDING`: `0`;
- `ADMITTED`: `0`.

No status promotion is justified by source completion alone.

## Priority authority

Candidate order in this registry is identity order, not teaching priority.

Current neutral-prior ranking authority:

`synthesis/MAX_EV_CANDIDATE_PRIORITY_RANKING_v0_1.md`

Priority must be updated after learner diagnostics because `current_error_probability` is not yet directly measured for all candidates.

## Final consolidation policy

The 34 candidates remain routed through 16 provisional synthesis containers and nine lanes. The containers may merge, split or disappear.

Final selection uses:

`MINIMUM COMPLEXITY SUBJECT TO NO MATERIAL EV LOSS`

There is no desired numerical final-rule count.

## Registry verdict

`UNIFIED_CANDIDATE_REGISTRY_V0_4_ACTIVE`

`ALL_CATALOGUED_SOURCE_FAMILIES_COMPLETE`

`34_CANDIDATES_PRESERVED`

`30_OF_34_HAVE_DIRECT_ORIGINAL_DRILLS`

`RESIDUAL_GATES_ARE_POST_SOURCE_EVIDENCE_GATES`

`NO_ADMISSION_PROMOTION`
