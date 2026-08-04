# General Live Cash — Heuristic Candidate Registry v0.1

Status: `ACTIVE_CANDIDATE_REGISTRY`

Purpose: maintain one canonical index of compressed decision candidates before cross-course validation and Playbook admission.

## Status vocabulary

- `CANDIDATE`: source-supported mechanism has been compressed.
- `VALIDATION_PENDING`: candidate needs Carrot / FTGU comparison, rerun closure or visual verification.
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
| `H-W01-001` | Effective stack sets the preflop architecture | Preflop / depth | `GENERAL_CORE` | CORE | Medium-high | `VALIDATION_PENDING` | Preflop 101 rerun; Carrot/FTGU depth comparison |
| `H-W01-002` | Expand squeezes by purifying existing candidates | Preflop squeeze | `GENERAL_CORE` | CORE | High mechanism | `VALIDATION_PENDING` | Exact anchor ranges; cross-source comparison |
| `H-W01-003` | Straddle changes the denominator; preserve SPR | Straddle / depth | `GENERAL_CORE / ENVIRONMENT_SENSITIVE` | CORE | Medium-high | `DRILL_READY` | Exact sizing remains profile-dependent |
| `H-W01-004` | Identify the blind range before reading the board | SRP / blinds | `GENERAL_CORE` | CORE | High | `DRILL_READY` | Exact range weights visual-dependent |
| `H-W01-005` | After exploiting weak flop defence, update the turn range | SRP exploit | `GENERAL_CORE` | CORE | High | `DRILL_READY` | Cross-source validation |
| `H-W01-006` | Deep OOP on dynamic boards: protect the call range first | SRP / deep OOP | `GENERAL_CORE` | CORE | High | `VALIDATION_PENDING` | Cross-source deep-OOP comparison |
| `H-W02-001` | Value threshold first, bluff volume second | Turn/river aggression | `GENERAL_CORE` | CORE | High | `DRILL_READY` | Cross-source validation |
| `H-W02-002` | Every turn bluff needs a job in the river tree | Multi-street bluffing | `GENERAL_CORE` | CORE | High | `DRILL_READY` | Exact combo boundaries visual-dependent |
| `H-W02-003` | Overbet only when card and value shape preserve polarization | Overbets | `GENERAL_CORE` | SUPPORTING | Medium-high | `VALIDATION_PENDING` | L12 reruns; visual card boundaries |
| `H-W02-004` | Bet size determines how wide top pair can check-raise | Flop defence | `GENERAL_CORE` | CORE | High shape | `VALIDATION_PENDING` | L16 rerun; exact frequencies |
| `H-W02-005` | Vulnerable low-kicker top pair can be a better raise | Flop protection | `GENERAL_CORE` | SUPPORTING | High mechanism | `DRILL_READY` | Cross-source comparison |
| `H-W02-006` | Turn lead responds to flop betting range, not only turn card | Turn leads | `GENERAL_CORE` | ADVANCED | Medium-high | `VALIDATION_PENDING` | L18 rerun; exact board families |
| `H-W02-007` | Node-lock the sizing branch, not the personality label | Opponent modelling | `GENERAL_CORE` | CORE | High | `DRILL_READY` | None for mechanism; field calibration later |
| `H-W02-008` | Versus value-heavy bets, remove speculative floats first | Exploit defence | `GENERAL_CORE / POOL_HYPOTHESIS` | CORE | High direction | `VALIDATION_PENDING` | Cross-source/pool evidence |
| `H-W02-009` | Before folding a deep bluff-catcher, count value and size exclusions | River defence | `GENERAL_CORE / POOL_HYPOTHESIS` | ADVANCED | Medium-high | `VALIDATION_PENDING` | Pool under/over-bluff evidence |
| `H-W03-001` | A 3-bet-pot range begins preflop and keeps its shape postflop | 3-bet pots | `GENERAL_CORE` | CORE | High | `DRILL_READY` | Cross-source validation |
| `H-W03-002` | Against value-heavy 3-bets, dominated big cards lose first | Preflop vs 3-bet | `GENERAL_CORE / ENVIRONMENT_SENSITIVE` | CORE | High direction | `VALIDATION_PENDING` | Preflop charts, rake/depth overlays |
| `H-W03-003` | A wide preflop range must compensate by checking more postflop | 3-bet exploit | `GENERAL_CORE` | CORE | High | `DRILL_READY` | Cross-source validation |
| `H-W03-004` | Split opponent by branch: respect the bet, attack the check | Branch exploitation | `GENERAL_CORE` | CORE | High | `DRILL_READY` | Profile evidence in field use |
| `H-W03-005` | Bluff supply must be seeded before the river | Bluff-catching / barrels | `GENERAL_CORE` | CORE | High | `DRILL_READY` | Cross-source validation |
| `H-W03-006` | Small bets can be harder to defend than large bets | Sizing exploit | `GENERAL_CORE / ENVIRONMENT_SENSITIVE` | SUPPORTING | High mechanism | `VALIDATION_PENDING` | Pool response measurements |
| `H-W03-007` | Multiway defence is shared | Multiway | `GENERAL_CORE` | CORE | High | `DRILL_READY` | Cross-source validation |
| `H-W03-008` | Multiway bluffs need backup equity and removal | Multiway aggression | `GENERAL_CORE` | CORE | High | `DRILL_READY` | L38 small-bet exception blocked |
| `H-W03-009` | Fast-play value when expected aggression will not arrive | Population exploit | `GENERAL_CORE / POOL_HYPOTHESIS` | CORE | High direction | `VALIDATION_PENDING` | Environment profile evidence |
| `H-W03-010` | Multiway nut ownership depends on preflop combo ownership | Multiway / ranges | `GENERAL_CORE` | CORE | High | `DRILL_READY` | Exact range weights visual-dependent |
| `H-W03-011` | A blocker is useful only inside the range created by the line | River blocker logic | `GENERAL_CORE` | CORE | High | `DRILL_READY` | Cross-source validation |

## Consolidation candidates

The registry intentionally contains more candidates than the final Playbook target. The following groups may later collapse into one broader rule:

### Group A — Range construction through the tree

- `H-W03-001`
- `H-W03-005`
- `H-W03-011`

Potential admitted compression:

`Trace the range from preflop before trusting a blocker or bluff-catch.`

### Group B — Opponent branch modelling

- `H-W02-007`
- `H-W02-008`
- `H-W03-003`
- `H-W03-004`

Potential admitted compression:

`Model the exact hand-class error and respond to that branch.`

### Group C — Aggression construction

- `H-W02-001`
- `H-W02-002`
- `H-W02-003`

Potential admitted compression:

`Value threshold → size → bluff jobs → river plan.`

### Group D — Multiway structure

- `H-W03-007`
- `H-W03-008`
- `H-W03-010`

Potential admitted compression:

`Nut owner → sandwich → shared defence → backup equity.`

### Group E — Position and depth

- `H-W01-001`
- `H-W01-003`
- `H-W01-006`

Potential admitted compression:

`Translate effective depth into SPR and realization pressure before choosing aggression.`

## Current count

- Total candidates: 26
- CORE: 20
- SUPPORTING: 3
- ADVANCED: 2
- OVERLAY-only: 0; overlays are currently dual-tagged
- `DRILL_READY`: 14
- `VALIDATION_PENDING`: 12
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

1. the source mechanism is continuous and not rerun-blocked;
2. trigger and exception can be stated without exact missing charts;
3. the rule can be tested with an original scenario;
4. no source-specific wording or proprietary example is required.

A candidate may move to `FIELD_TEST_PENDING` when:

1. Carrot / FTGU comparison is complete;
2. conflicts are resolved or represented as context-sensitive branches;
3. a misconception-linked drill exists;
4. success criteria are defined.

A candidate may move to `ADMITTED` only when:

1. it improves decisions under time pressure;
2. it survives counterexamples;
3. it has a compact table cue;
4. it does not duplicate another admitted rule;
5. source and IP purity are documented;
6. field evidence does not reveal systematic misuse.

## Registry verdict

`UNIFIED_HEURISTIC_CANDIDATE_REGISTRY_CREATED`
