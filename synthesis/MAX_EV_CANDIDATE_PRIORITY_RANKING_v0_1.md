# Live Cash System - Max-EV Candidate Priority Ranking v0.1

Status: `ACTIVE_NEUTRAL_PRIOR / POST_SOURCE / DIAGNOSTIC_UPDATE_REQUIRED`

## Purpose

Rank all 34 heuristic candidates without treating:

- source order;
- course coverage;
- subjective discomfort;
- provisional slot order;
- or a desired final rule count

as automatic priority.

## Max-EV function

```text
spot frequency
x average error cost
x current error probability
x transfer value
x learnability per unit time
x evidence confidence
```

## Important uncertainty

`current error probability` is not yet directly measured for every candidate. Therefore this version uses a neutral learner-error prior, informed only by known broad profile context. It is an ordering hypothesis, not a claimed quantitative EV calculation.

After diagnostics, a candidate can move materially. A personally weak mechanism may rise if the measured error rate is high; a familiar mechanism may fall even when its general poker value is large.

## Two priority types

### Deployment priority

What should be taught and retrieved first from mechanisms already stable enough to use?

### Closure priority

What project work has the highest expected value for closing currently missing anchors, boundaries, drills or field overlays?

These are not identical. A mechanism can be high-value to play but require little new repository work, or be high-value to build while not yet table-ready.

## Deployment bands

### Band A - High immediate transfer

Frequent, broadly transferable and strongly supported. Teach early under the neutral prior.

| Candidate | Mechanism | Why it ranks high |
|---|---|---|
| `H-R05-001` | Recalculate ownership after every range filter | applies across nearly every postflop tree and prevents downstream range hallucination |
| `H-W01-005` | Update range after an exploited street continues | same high-frequency filter discipline with explicit exploit continuation |
| `H-W01-001` | Effective stack sets preflop architecture | affects every hand and changes risk, realisation and commitment |
| `H-W01-004` | Identify blind/source range before board | board interpretation is unreliable without range source |
| `H-W01-009` | Current frequency depends on origin and prior reach | supplies the denominator for calls, bluffs and value density |
| `H-W02-001` | Value threshold before bluff volume | prevents aggression construction from starting with attractive bluff combos |
| `H-W02-004` | Bet shape determines raise breadth | frequent response decision with strong transfer across SRP and 3-bet pots |
| `H-W03-001` | 3-bet/4-bet range begins preflop and persists | large-pot decisions inherit preflop ancestry and SPR |
| `H-W02-007` | Exploit the exact branch, not the personality | prevents broad player labels from creating uncontrolled deviations |
| `H-R05-002` | Heavy-check strategies need active calls and raises | protects passive strategies from automatic pressure |

Band A contains likely consolidation overlap. High priority does not mean ten final rules.

### Band B - High value with one layer of context

Strong mechanisms that need more context, calculation or field calibration than Band A.

| Candidate | Mechanism | Main modifier |
|---|---|---|
| `H-W01-003` | Straddle changes denominator and SPR | environment frequency and sizing |
| `H-W01-007` | Read high-weight offsuit and pair mass first | requires compact source-range anchors |
| `H-W02-002` | Every turn bluff needs a future job | immediate exploit EV can create exceptions |
| `H-W02-005` | Vulnerable made hands may raise more | urgency and opponent bet shape |
| `H-W02-006` | Turn lead/probe follows flop range composition | branch and multiway scope |
| `H-W02-008` | Remove speculative continues versus air-poor bets | target-live underbluff evidence controls magnitude |
| `H-W02-009` | River bluff-catch begins with value, size and ancestry | lower frequency than flop decisions but high error cost |
| `H-W03-002` | Dominated big cards lose first versus value-heavy 3-bets | exact live-rake anchors still missing |
| `H-W03-003` | Wide preflop ranges require postflop compensation | position and depth change the form of compensation |
| `H-W03-004` | Split strong and weak action branches | exploit magnitude is field-gated |
| `H-W03-005` | Bluff supply must be seeded before river | high transfer but slower table execution |
| `H-W03-006` | Small sizes can be harder to defend | population overfold is an overlay, not the theory baseline |
| `H-W03-011` | Blockers matter only inside line-created ranges | final selector after higher-priority ancestry work |
| `H-R04-010` | Preserve resilient hands in passive branches | exact deep OOP boundary remains open |

### Band C - Build or validate before broad deployment

Potentially high-EV, especially in live cash, but evidence confidence, answer-key stability or frequency is lower.

| Candidate | Mechanism | Binding reason |
|---|---|---|
| `H-W01-002` | Expand squeezes by purifying candidates | exact original families and flat branch not ready |
| `H-W01-006` | Deep OOP protect resilient calls before raising | exact depth boundary and direct drill missing |
| `H-W01-008` | Polar preflop bluffs target dominating folds | target-fold/call branch and anchor work pending |
| `H-W02-003` | Large size only when polarization survives | narrower occurrence and exact size boundaries can be visual-dependent |
| `H-W03-007` | Multiway defence is shared | action-order scope needs stabilisation |
| `H-W03-008` | Multiway bluffs need backup equity/removal | candidate hierarchy and counterexamples incomplete |
| `H-W03-009` | Fast-play value when aggression will not arrive | depends heavily on opponent and action order |
| `H-W03-010` | Multiway nut ownership follows preflop combos | multiway anchors and compression pending |
| `H-R04-007` | Suppressed flop aggression can reappear later | delayed-aggression answer key is not yet stable |
| `H-R04-008` | A live tell is evidence, not a conclusion | important governance, but direct chip EV depends on observation quality |

Band C is not low importance. Several are high build priorities precisely because live frequency is meaningful and current evidence is incomplete.

## Closure-work priority

### Closure P0 - Independent preflop architecture

Highest expected project value because preflop occurs every hand and determines all later ranges.

Primary candidates:

- `H-W01-001`;
- `H-W01-002`;
- `H-W01-004`;
- `H-W01-008`;
- `H-W01-009`;
- `H-W03-001`;
- `H-W03-002`.

Required output:

```text
explicit assumptions
-> independent solver/range derivation
-> compressed anchor families
-> players-behind and squeeze branches
-> changed-node validation
-> table-facing cues
```

Do not import source charts as final anchors.

### Closure P1 - Multiway architecture

Live cash contains materially more multiway play than most online six-max theory paths.

Primary candidates:

- `H-W03-007`;
- `H-W03-008`;
- `H-W03-009`;
- `H-W03-010`;
- `H-R04-007`.

Required output:

- action-order map;
- shared-defence boundary;
- nut-ownership compression;
- minimum bluff support;
- delayed-aggression drill;
- passive-table fast-play overlay.

### Closure P2 - Depth and straddle overlays

Primary candidates:

- `H-W01-001`;
- `H-W01-003`;
- `H-W01-006`;
- `H-R04-010`.

Required output:

- pairwise effective-depth bands;
- straddle denominator translation;
- OOP realisation and protected-call boundaries;
- short/deep context splits.

### Closure P3 - Field calibration

Primary candidates:

- `H-W02-007`;
- `H-W02-008`;
- `H-W02-009`;
- `H-W03-004`;
- `H-W03-006`;
- `H-W03-009`;
- `H-R04-008`.

Required output:

- target branch observation counts;
- showdown and response evidence;
- evidence grades;
- falsifiers;
- adaptation and confidence decay.

### Closure P4 - Learner-error calibration and compression

Run diagnostics across all candidates, then:

- update `current_error_probability`;
- measure action/reason latency;
- identify misconception clusters;
- merge only mechanisms retrieved by the same cue without material EV loss;
- split only when one cue causes unsafe context transfer.

## High-confidence consolidation hypotheses

These are hypotheses, not final merge decisions:

1. `H-R05-001` and `H-W01-005` likely share one filtering/ownership rule with an exploit-continuation branch.
2. `H-W01-004`, `H-W01-007` and part of `H-W01-009` may compress into a range-source and high-weight-mass sequence.
3. `H-W02-001`, `H-W02-002` and `H-W02-003` may share a value-first aggression tree while retaining size-specific branches.
4. `H-W02-004`, `H-W02-005`, `H-W03-006` and `H-R05-002` may form one bet-shape/protected-response tree.
5. `H-W03-005`, `H-W03-011` and part of `H-W02-009` may form one river ancestry audit.
6. Multiway candidates should not be merged until action-order retrieval is tested.

## Priority-update rule

After any diagnostic or field batch:

```text
new evidence
-> update error probability or field frequency
-> rerank affected candidates only
-> preserve IDs and learner progress
-> do not rewrite unrelated tiers
```

## Ranking verdict

`MAX_EV_NEUTRAL_PRIOR_V0_1_ACTIVE`

`DEPLOYMENT_PRIORITY_SEPARATED_FROM_CLOSURE_PRIORITY`

`PREFLOP_ARCHITECTURE_IS_HIGHEST_VALUE_BUILD_LANE`

`MULTIWAY_IS_SECOND_HIGH_VALUE_BUILD_LANE`

`PERSONAL_DISCOMFORT_IS_NOT_AN_AUTOMATIC_OVERRIDE`

`DIAGNOSTICS_MUST_UPDATE_ERROR_PROBABILITY`
