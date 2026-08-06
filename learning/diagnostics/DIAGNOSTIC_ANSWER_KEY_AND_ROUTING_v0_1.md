# Live Cash System — Diagnostic Answer Key and Routing v0.1

Status: `EVALUATOR_AUTHORITY / HIDDEN_DURING_ACTIVE_TRANCHE`

## Response classes

`learning/ADAPTIVE_LEARNER_STATE_SCHEMA_v0_1.md` controls persisted classes:

- `A`: correct action and correct reasoning;
- `B`: wrong action with partly correct mechanism;
- `C`: correct action for the wrong reason;
- `D`: wrong action and wrong mechanism;
- `E`: baseline action acceptable but exploit confidence unjustified;
- `U`: explicit unknown/baseline where evidence is insufficient.

The conflicting historical letter meanings in `DRILL_AND_SPACED_REPETITION_SYSTEM_v0_1.md` are not used for diagnostic persistence.

## T1 keys

### `LD-001`

- 280 ordinary BB, 140 straddle units;
- use straddle units and expected SPR first;
- route errors to `MC-002`; candidates `H-W01-003`, `H-W01-001`.

### `LD-002`

- 90bb versus A, 300bb versus B;
- one number cannot describe all pairwise/side-pot branches;
- `MC-001`; `H-W01-001`.

### `LD-003`

- SB cold-call is normally more condensed;
- do not reuse the BB plan automatically;
- reconstruct source range first;
- `MC-005`; `H-W01-004`, `H-W01-007`.

### `LD-004`

- dominated offsuit big cards lose first versus concentrated value;
- suited/nut routes may realise cleaner, but exact action remains contextual;
- `MC-019`; `H-W03-002`.

### `LD-005`

- test whether the wider preflop range compensates by checking more;
- without compensation, excess air reaches the c-bet branch and OOP continues wider/ more actively on suitable boards;
- not automatic raise-only;
- `MC-020`, `MC-021`; `H-W03-003`, `H-W03-004`.

### `LD-006`

- T6s has more directional raise incentive than KTs;
- protection need and unblocking high-card folds matter;
- KTs more often protects calls and dominates future paired kickers;
- `MC-012`, `MC-013`; `H-W02-004`, `H-W02-005`, `H-R05-002`.

### `LD-007`

- the thin/protection raise branch contracts sharply versus a large selective/polar bet;
- T6s is not an automatic raise;
- response becomes more call/fold-oriented;
- `MC-012`, `MC-008`, `MC-013`; `H-W02-004`, `H-W02-005`, `H-W01-006`.

### `LD-008`

- TT is not an automatic discomfort raise;
- strong/robust hands must materially protect check-call;
- large selective sizing contracts thin raises;
- raise requires value, denial, equity or branch-protection work;
- `MC-008`; `H-W01-006`, `H-R04-010`.

### `LD-009`

- defence is shared and Hero is sandwiched;
- BB remains behind with an uncapped continuing range;
- gate: player behind plus real nut ownership;
- calls contract and raise threshold rises relative to HU;
- `MC-024`, `MC-027`; `H-W03-007`, `H-W03-010`.

### `LD-010`

- reconstruct source range and surviving value/bluffs;
- apply size exclusions and line ancestry before blocker quality;
- use `UNKNOWN / BASELINE` if bluff supply cannot be justified;
- `MC-022`, `MC-028`, `MC-015`; `H-W03-011`, `H-W02-009`, `H-R04-008`.

## T2 keys

| Item | Required mechanism | Misconceptions |
|---|---|---|
| `LD-011` | small near-range bet requires wider/possibly merged defence; large polar bet compresses it | `MC-012`, `MC-023` |
| `LD-012` | flop call filters and strengthens the range; rebuild turn ownership | `MC-007` |
| `LD-013` | weakest value hand and intended size precede bluffs | `MC-009` |
| `LD-014` | reject/check a no-equity, fold-blocking, jobless barrel | `MC-010` |
| `LD-015` | scary card may repair caller and destroy polarization | `MC-011`, `MC-014` |
| `LD-016` | multiway bluff needs backup equity, removal and collision tolerance | `MC-025` |
| `LD-017` | field clear creates a new node where suppressed aggression may reappear | `MC-014` |
| `LD-018` | absent expected aggression reduces slow-play incentive; magnitude remains field-gated | `MC-026` |
| `LD-019` | one river bluff proves nothing direct about a flop-overbet branch | `MC-015`, `MC-030` |
| `LD-020` | correct action/wrong reason is class `C` and requires changed-node repair | `MC-017` |

## Scoring discipline

- accept equivalent mechanism wording;
- never require exact combo frequencies;
- score action and reasoning separately;
- map only misconceptions evidenced by stated reasoning;
- low-confidence correct is uncertainty, not strategic failure;
- one item cannot confirm a leak or mastery.

## Routing after T1

1. evaluate all ten before teaching;
2. choose at most two highest-priority structural families;
3. issue one minimally changed repair per family;
4. release only the T2 items needed to disambiguate;
5. preserve untouched modules as `UNMEASURED`;
6. generate the first evidence-personalised micro-cycle.

## Verdict

`DIAGNOSTIC_EVALUATOR_KEY_ACTIVE`
