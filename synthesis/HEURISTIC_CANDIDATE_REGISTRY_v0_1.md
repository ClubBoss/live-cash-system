# General Live Cash — Heuristic Candidate Registry v0.1

Status: `ACTIVE_CANDIDATE_REGISTRY / FTGU_COMPLETE / CASH_INJECTION_1_OF_10`

Purpose: maintain one canonical index of compressed decision candidates before remaining source validation and Playbook admission.

## Routing authorities

- open validation questions: `REMAINING_SOURCE_QUESTION_MATRIX_v1.md`;
- module ownership and consolidation: `CANDIDATE_TO_MODULE_VALIDATION_WORKBENCH_v0_1.md`;
- source relations: `CROSS_SOURCE_EVIDENCE_MATRIX_v0_1.md` and `CASH_INJECTION_EVIDENCE_MATRIX_v0_1.md`;
- learner-facing readiness: `../learning/ADAPTIVE_MODULE_READINESS_MANIFEST_v0_1.md`.

## Status vocabulary

- `CANDIDATE`: source-supported mechanism has been compressed.
- `VALIDATION_PENDING`: candidate still needs remaining source comparison, profile evidence or exact visual/anchor verification.
- `DRILL_READY`: mechanism is sufficiently clear to test through an original drill.
- `FIELD_TEST_PENDING`: drill passed internal review; live evidence required.
- `ADMITTED`: accepted into the compact Playbook.
- `REVISED`: admitted rule changed by new evidence.
- `REJECTED`: candidate failed validation or was redundant/misleading.
- `BLOCKED`: insufficient source continuity for the claimed scope.

## Candidate tiers

- `CORE`: expected to remain a compact high-frequency Playbook rule.
- `SUPPORTING`: important reasoning mechanism, likely nested under a core rule.
- `ADVANCED`: lower-frequency or high-complexity mechanism for later learning.
- `OVERLAY`: environment-, pool- or depth-sensitive adjustment.

## Unified registry

| ID | Candidate | Domain | Tag | Tier | Confidence | Current status | Primary dependencies |
|---|---|---|---|---|---|---|---|
| `H-W01-001` | Effective stack sets the preflop architecture | Preflop / depth | `GENERAL_CORE` | CORE | High mechanism | `VALIDATION_PENDING` | `SQ-DEP-01`; exact visual anchors; Carrot depth comparison; FTGU confirmed |
| `H-W01-002` | Expand squeezes by purifying existing candidates | Preflop squeeze | `GENERAL_CORE` | CORE | High mechanism | `VALIDATION_PENDING` | `SQ-PF-01`; exact anchor ranges; Carrot comparison |
| `H-W01-003` | Straddle changes the denominator; preserve SPR | Straddle / depth | `GENERAL_CORE / ENVIRONMENT_SENSITIVE` | CORE | High mechanism | `DRILL_READY` | `SQ-DEP-03`; exact sizing remains profile-dependent |
| `H-W01-004` | Identify the blind range before reading the board | SRP / blinds | `GENERAL_CORE` | CORE | High | `DRILL_READY` | `SQ-SRP-01`; exact range weights visual-dependent; FTGU confirmed |
| `H-W01-005` | After exploiting weak flop defence, update the turn range | SRP exploit | `GENERAL_CORE` | CORE | High | `DRILL_READY` | `SQ-SRP-02` mechanism closed; Carrot may simplify; FTGU confirmed |
| `H-W01-006` | Deep OOP on dynamic boards: protect the call range first | SRP / deep OOP | `GENERAL_CORE` | CORE | High | `VALIDATION_PENDING` | `SQ-DEP-02`, `SQ-SRP-05`; Carrot deep-OOP comparison; exact depth scope |
| `H-W01-007` | Read high-weight offsuit and pair composition before rare suited detail | Range reading | `GENERAL_CORE` | CORE | High mechanism | `DRILL_READY` | `SQ-SRP-01`; exact charts visual-dependent; FTGU extended |
| `H-W01-008` | Polar preflop bluffs should target dominating offsuit opens | Preflop bluff construction | `GENERAL_CORE` | SUPPORTING | Medium-high | `DRILL_READY` | `SQ-PF-03`; exact position boundaries visual-dependent; FTGU extended |
| `H-W01-009` | Interpret current-node frequency through prior hand reach | Range accounting | `GENERAL_CORE` | SUPPORTING | High mechanism | `DRILL_READY` | `SQ-PF-04`, `SQ-3B-01`; Carrot comparison; FTGU confirmed |
| `H-W02-001` | Value threshold first, bluff volume second | Turn/river aggression | `GENERAL_CORE` | CORE | High | `DRILL_READY` | `SQ-AGG-01`; Carrot comparison; FTGU strongly confirmed |
| `H-W02-002` | Every turn bluff needs a job in the river tree | Multi-street bluffing | `GENERAL_CORE` | CORE | High | `DRILL_READY` | `SQ-AGG-02`; exact combo boundaries visual-dependent; FTGU extended |
| `H-W02-003` | Overbet only when card and value shape preserve polarization | Overbets | `GENERAL_CORE` | SUPPORTING | High mechanism | `DRILL_READY` | `SQ-AGG-03`; exact card boundaries visual-dependent; FTGU confirmed |
| `H-W02-004` | Bet size determines how wide top pair can check-raise | Flop defence | `GENERAL_CORE` | CORE | High shape | `DRILL_READY` | `SQ-SRP-03`, `SQ-AGG-04`; FTGU extended; Cash Injection E01 strongly confirms broader merged response |
| `H-W02-005` | Vulnerable low-kicker top pair can be a better raise | Flop protection | `GENERAL_CORE` | SUPPORTING | High mechanism | `DRILL_READY` | `SQ-SRP-03`; Cash Injection E01 confirms protection/denial direction; Carrot boundary comparison still needed |
| `H-W02-006` | Turn lead responds to flop betting range, not only turn card | Turn leads | `GENERAL_CORE` | ADVANCED | High mechanism | `DRILL_READY` | `SQ-SRP-04`; exact board weights visual-dependent; FTGU confirmed |
| `H-W02-007` | Node-lock the sizing branch, not the personality label | Opponent modelling | `GENERAL_CORE` | CORE | High | `DRILL_READY` | `SQ-EXP-01`; field calibration later; FTGU and Cash Injection E01 strongly confirm branch specificity |
| `H-W02-008` | Versus value-heavy bets, remove speculative floats first | Exploit defence | `GENERAL_CORE / POOL_HYPOTHESIS` | CORE | High direction | `VALIDATION_PENDING` | `SQ-EXP-02`, `SQ-RIV-02`; remaining Cash Injection/Carrot and pool evidence; FTGU confirmed direction |
| `H-W02-009` | Before folding a deep bluff-catcher, count value and size exclusions | River defence | `GENERAL_CORE / POOL_HYPOTHESIS` | ADVANCED | Medium-high | `VALIDATION_PENDING` | `SQ-RIV-01`, `SQ-RIV-02`; pool under/over-bluff evidence; FTGU confirmed audit |
| `H-W03-001` | A 3-bet-pot range begins preflop and keeps its shape postflop | 3-bet pots | `GENERAL_CORE` | CORE | High | `DRILL_READY` | `SQ-3B-01`; Carrot comparison; FTGU confirmed |
| `H-W03-002` | Against value-heavy 3-bets, dominated big cards lose first | Preflop vs 3-bet | `GENERAL_CORE / ENVIRONMENT_SENSITIVE` | CORE | High direction | `VALIDATION_PENDING` | `SQ-PF-02`, `SQ-RNG-01`; independent charts, rake/depth overlays; FTGU confirmed direction |
| `H-W03-003` | A wide preflop range must compensate by checking more postflop | 3-bet exploit | `GENERAL_CORE` | CORE | High | `DRILL_READY` | `SQ-3B-02`; Carrot comparison; FTGU extended |
| `H-W03-004` | Split opponent by branch: respect the bet, attack the check | Branch exploitation | `GENERAL_CORE` | CORE | High | `DRILL_READY` | `SQ-3B-03`, `SQ-EXP-01`; profile evidence in field use; FTGU confirmed |
| `H-W03-005` | Bluff supply must be seeded before the river | Bluff-catching / barrels | `GENERAL_CORE` | CORE | High | `DRILL_READY` | `SQ-AGG-02`, `SQ-3B-04`, `SQ-RIV-02`; Carrot comparison; FTGU confirmed |
| `H-W03-006` | Small bets can be harder to defend than large bets | Sizing exploit | `GENERAL_CORE / ENVIRONMENT_SENSITIVE` | SUPPORTING | High mechanism | `DRILL_READY` | `SQ-AGG-04`, `SQ-EXP-05`; Cash Injection E01 strongly extends elasticity mechanism; pool calibration remains field-gated |
| `H-W03-007` | Multiway defence is shared | Multiway | `GENERAL_CORE` | CORE | High | `DRILL_READY` | `SQ-MW-01`; Carrot multiway validation; FTGU context split |
| `H-W03-008` | Multiway bluffs need backup equity and removal | Multiway aggression | `GENERAL_CORE` | CORE | High | `DRILL_READY` | `SQ-MW-02`; Carrot multiway validation |
| `H-W03-009` | Fast-play value when expected aggression will not arrive | Population exploit | `GENERAL_CORE / POOL_HYPOTHESIS` | CORE | High direction | `VALIDATION_PENDING` | `SQ-MW-05`, `SQ-EXP-03`; environment/remaining Injection evidence; FTGU extended timing logic |
| `H-W03-010` | Multiway nut ownership depends on preflop combo ownership | Multiway / ranges | `GENERAL_CORE` | CORE | High | `DRILL_READY` | `SQ-MW-03`, `SQ-RNG-01`; exact range weights visual-dependent; Carrot multiway validation |
| `H-W03-011` | A blocker is useful only inside the range created by the line | River blocker logic | `GENERAL_CORE` | CORE | High | `DRILL_READY` | `SQ-RIV-03` mechanism closed; Carrot may simplify; FTGU strongly confirmed |
| `H-R04-007` | Suppressed flop aggression can reappear as a turn lead | Multiway / delayed aggression | `GENERAL_CORE` | SUPPORTING | High mechanism | `DRILL_READY` | `SQ-SRP-04`, `SQ-MW-04`; exact hand classes visual-dependent; FTGU partial extension |
| `H-R04-008` | A live tell is a data point, not a range conclusion | Live reads / evidence | `GENERAL_CORE / FIELD_EVIDENCE` | CORE | High methodology | `DRILL_READY` | `SQ-EXP-01`, `SQ-EXP-04`; repeated field observations and falsifiers; FTGU evidence discipline confirms |
| `H-R04-010` | Preserve turn-resilient hands in the IP check-back range | Flop strategy / protected checks | `GENERAL_CORE` | CORE | High mechanism | `DRILL_READY` | `SQ-DEP-02`, `SQ-SRP-05`; exact combo weights visual-dependent; FTGU confirmed |
| `H-R05-001` | Recalculate ownership after every range-filtering action | Range accounting / multi-street | `GENERAL_CORE` | CORE | High mechanism | `DRILL_READY` | `SQ-SRP-02`, `SQ-3B-04`; exact range weights visual-dependent; FTGU strongly confirmed |
| `H-R05-002` | A heavy-check strategy needs an active raise defence | Passive-branch protection | `GENERAL_CORE` | CORE | High mechanism | `DRILL_READY` | `SQ-SRP-03`, `SQ-SRP-05`; FTGU extends with protected calls/polar/merged raises; Cash Injection E01 adds merged protection-raise evidence |

## Consolidation candidates

The registry intentionally contains more candidates than the final Playbook target.

Detailed module ownership and nine consolidation lanes are maintained in:

`CANDIDATE_TO_MODULE_VALIDATION_WORKBENCH_v0_1.md`

### Group A — Range construction through the tree

- `H-W01-007`
- `H-W01-009`
- `H-W03-001`
- `H-W03-005`
- `H-W03-011`
- `H-R05-001`

Potential admitted compression:

`Start with high-weight preflop composition, trace reach and filtering through every action, recalculate ownership, then trust blockers.`

### Group B — Opponent branch and evidence modelling

- `H-W02-007`
- `H-W02-008`
- `H-W03-003`
- `H-W03-004`
- `H-R04-008`

Potential admitted compression:

`Model the exact hand-class error, grade the evidence, and respond only to that branch.`

### Group C — Aggression construction

- `H-W01-008`
- `H-W02-001`
- `H-W02-002`
- `H-W02-003`

Potential admitted compression:

`Target the right folds → value threshold → size → bluff jobs → river plan.`

### Group D — Multiway structure

- `H-W03-007`
- `H-W03-008`
- `H-W03-010`
- `H-R04-007`

Potential admitted compression:

`Nut owner → sandwich → shared defence → suppressed action → backup equity.`

### Group E — Position and depth

- `H-W01-001`
- `H-W01-003`
- `H-W01-006`

Potential admitted compression:

`Translate effective depth into SPR and realization pressure before choosing aggression.`

### Group F — Protected passive branches

- `H-W01-006`
- `H-W01-005`
- `H-R04-010`
- `H-R05-002`

Potential admitted compression:

`Do not spend every resilient hand in the aggressive branch; preserve calls and raises that prevent passive branches from becoming capped.`

## FTGU completion effect

All 30 FTGU episodes are mapped.

FTGU did not increase the candidate count. Its primary contribution is stronger compression and clearer prerequisites:

- preflop: `PRICE → RANGE → PLAYERS BEHIND → REALISATION → LINE`;
- postflop: `RANGE ADVANTAGE → URGENCY → BET SHAPE → RESPONSE SHAPE`;
- river: combo, ancestry and blocker audit;
- learning: predict, explain, receive feedback, repair and retest.

No candidate moves to `ADMITTED` solely because FTGU confirmed it.

## Cash Injection Episode 01 effect

Cash Injection Episode 01 does not increase the candidate count.

It materially affects:

- `H-W02-004` — broader merged response versus small range-wide bets;
- `H-W02-005` — vulnerable medium-strength hands may gain more through protection/denial;
- `H-W02-007` — exploit must attach to the exact small-range-bet branch;
- `H-W03-006` — smaller raises create a larger required-defence elasticity test;
- `H-R05-002` — active defence may require merged protection raises.

Its population claim is stored separately as `CI-PH-001` and remains field-pending.

## Current count

- Total candidates: 34
- CORE: 26
- SUPPORTING: 6
- ADVANCED: 2
- OVERLAY-only: 0; overlays are currently dual-tagged
- `DRILL_READY`: 27
- `VALIDATION_PENDING`: 7
- `ADMITTED`: 0

## Target after consolidation

The final compact Playbook should likely contain:

- 14–18 admitted core heuristics;
- 4–7 supporting exceptions;
- 5–10 opponent-profile adjustments;
- separate environment overlays;
- exact anchor ranges outside the heuristic count.

## Promotion gate

A candidate may move from `CANDIDATE` to `DRILL_READY` when:

1. the source mechanism is continuous for the claimed scope;
2. trigger and exception can be stated without exact missing charts;
3. the rule can be tested with an original scenario;
4. no source-specific wording or proprietary example is required.

A candidate may move to `FIELD_TEST_PENDING` when:

1. remaining material source questions are complete or explicitly unnecessary for its scope;
2. conflicts are resolved or represented as context-sensitive branches;
3. a misconception-linked direct drill exists;
4. success criteria are defined.

A candidate may move to `ADMITTED` only when:

1. it improves decisions under time pressure;
2. it survives counterexamples;
3. it has a compact table cue;
4. it does not duplicate another admitted rule;
5. source and IP purity are documented;
6. field evidence does not reveal systematic misuse.

## Registry verdict

`UNIFIED_HEURISTIC_CANDIDATE_REGISTRY_CURRENT_THROUGH_CASH_INJECTION_EPISODE_01`

`REMAINING_INJECTION_CARROT_ANCHOR_AND_FIELD_GATES_REMAIN`
