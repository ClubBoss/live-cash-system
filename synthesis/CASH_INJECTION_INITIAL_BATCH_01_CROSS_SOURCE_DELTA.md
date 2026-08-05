# Cash Injection Initial Batch 01 — Cross-Source Delta

Status: `ONE_EPISODE_MAPPED / NO_AUTOMATIC_ADMISSION`

## Scope

New source evidence:

- `CINJ-E01` — small flop range-bet overfold exploit.

## Mechanism accepted

The episode supports the following branch-specific sequence:

```text
small range-wide flop bet
→ theoretically wide defence against raise
→ smaller raise increases required defence
→ population may fail to adjust elastically
→ raise branch can expand across bluffs, thin value and protection
```

The strongest contribution is not the population claim itself. It is the hand-class and sizing mechanism:

- a small wide bet contains enough weak material to support broader raises;
- reducing raise size allows a more merged response;
- extra fold equity can help vulnerable medium-strength hands more than strong low-urgency hands;
- a range-level exploit must still be assigned hand by hand.

## Candidate relations

| Candidate | Relation | Cash Injection effect |
|---|---|---|
| `H-W02-004` | `STRONGLY CONFIRMS` | Small wide bets support broader, more merged flop raises than large polar bets. |
| `H-W02-005` | `CONFIRMS` | Vulnerable middle-strength and pocket-pair hands can gain more from protection/denial than stronger top-pair hands. |
| `H-W02-007` | `STRONGLY CONFIRMS` | Exploit the exact range-bet response branch; do not label the whole opponent globally. |
| `H-W03-006` | `STRONGLY EXTENDS` | Small raises create a high defence burden; population inelasticity may amplify the exploit. |
| `H-R05-002` | `EXTENDS` | Defence against range betting may require an active merged raise branch, not only calls or polar raises. |

## Adaptive-module relations

### `LCM-05` — Bet shape and response shape

Adds a clear contrastive branch:

```text
small + range-wide bet
→ wider calls
→ more merged raises
→ smaller raise can increase defence burden
```

### `LCM-10` — Opponent and environment overlays

Adds one hypothesis template:

```text
claim: overfold + under-three-bet versus small flop raise
required evidence: exact branch observations
falsifier: correct wide defence or aggressive flop three-betting
fallback: baseline response
```

### `LCM-11` — Field transfer

Adds an observation mission rather than an immediate global exploit:

- identify players who use one-third-pot bets range-wide;
- record whether they defend weak pairs, ace-highs and backdoors;
- record whether they ever flop three-bet;
- separate late-position and early-position cases;
- increase confidence only after repeated branch-specific evidence.

## Population claim classification

The following is classified as `POOL_HYPOTHESIS`, not `GENERAL_CORE`:

`Many regulars overfold and under-three-bet versus small flop check-raises after range betting.`

Reason:

- the episode shows an instructor-created node lock;
- no independent database or live-pool sample is supplied in the transcript;
- the target games for this project differ from the likely online pool used in the demonstration;
- magnitude depends on position, board, starting range, raise size and opponent response.

## New-candidate decision

No new heuristic candidate is created.

The potentially new ideas are absorbed as extensions:

- `population elasticity failure` nests under `H-W03-006`;
- `range-level exploit has hand-specific winners and losers` nests under `H-W02-004`, `H-W02-005` and value-first aggression;
- `small raise as exploit amplifier` remains a branch inside `LCM-05`, not a universal sizing rule.

## Conflict findings

No conflict with Smash or FTGU is open.

The episode strongly agrees with FTGU Episode 10:

- small range-wide bets support merged raising;
- medium-strength raises can gain value and protection;
- the exploit belongs to the exact betting branch.

Cash Injection goes further by making a population overfold assumption and node-locking it. That difference is an exploit overlay, not a theoretical conflict.

## Verdict

`CASH_INJECTION_BATCH_01_CROSS_SOURCE_DELTA_ACCEPTED`

`NO_NEW_RULE_COUNT_INCREASE`

`ONE_POOL_HYPOTHESIS_OPEN_FOR_FIELD_VALIDATION`
