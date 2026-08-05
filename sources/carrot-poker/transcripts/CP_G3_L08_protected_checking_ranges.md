# CP-G3-L08 — Properly Protected Checking Ranges

Status: `AUDIO_COMPLETE / SOLVER_VISUALS_PENDING / MAPPED`

## Source identity

- source family: Carrot Poker School;
- grade: 3;
- lecture: 8;
- source title stated in audio: `Properly Protected Checking Ranges`;
- source file: `Lecture 08.mp4`;
- transcript package: `Archive(3).zip`;
- package SHA-256: `b9a2a664ca0ae8696b771fd82bc1c5f51eadb573495a6eac96c25e00ff040137`;
- duration: `53:24.04`;
- transcript engine: `mlx-whisper`;
- model: `large-v3`;
- language: English;
- translation: false.

## Source role

The lecture explains why a strategically healthy checking range must contain enough strong hands to withstand later aggression and create profitable check-call, check-raise and delayed-action branches.

Its central frame is a trade-off rather than a slogan:

```text
IMMEDIATE BETTING GAIN
versus
CHECK-BRANCH GAINS AND SACRIFICES
```

A checked strong hand can miss value against hands that would only call, but it can also induce bluffs, enable check-raises, protect future checks and improve equity realisation against stronger continuation regions.

## Source-faithful mechanism

### 1. Trade-off theorem

Checking a hand that is strong enough to bet sacrifices value in some branches and gains value in others.

Relevant gains include:

- inducing low-equity hands that would fold to a bet;
- building a larger pot through check-raise when the opponent bets;
- preserving equity against the top of the opponent's range;
- protecting later checks from automatic pressure;
- allowing the checking range to contain credible calls and raises.

Relevant sacrifices include:

- losing calls from medium-strength hands that check back;
- allowing free equity realisation;
- delaying value when the opponent is passive or capped;
- risking a stagnated pot.

The decision is full-tree EV, not regret after one branch checks through.

### 2. Protected ranges on both sides

A betting range requires enough bluffs or thin value to make its value region payable.

A checking range requires enough robust and high-EV hands that the opponent cannot profitably attack it without resistance.

The source warns against the common human construction:

```text
BETTING RANGE = TOO STRONG
CHECKING RANGE = TOO WEAK
```

This is especially damaging when later nodes allow probing, delayed c-betting or check-raising.

### 3. Node classes covered

The lecture applies protected checking to several recurring structures:

- flop in position in a 3-bet pot;
- flop out of position against a c-bet;
- turn checks after a flop bet-call branch;
- turn delayed c-betting;
- turn probing after a checked-through flop;
- second checks where immediate betting feels natural.

The same hand can be a mandatory bet against a passive, capped opponent and a valid or preferred check against an aggressive opponent who bets too frequently after checks.

### 4. Solver-to-pool translation

The source does not recommend copying solver check frequencies literally.

The practical process is:

```text
SOLVER CHECKING RANGE
→ EXPECTED OPPONENT DEVIATION
→ RESPONSE ON THE NEXT NODE
→ CONDITIONAL CHECKING-RANGE ADJUSTMENT
```

If the pool checks too weakly and overfolds later, the exploit may be to attack the weak check. If a strong opponent over-stabs perceived weakness, the exploit may be to strengthen the check range and punish the stab.

Population magnitude remains field-gated.

### 5. Bypassed-thought-process warning

A player who automatically bets a strong hand can bypass three required decisions:

- whether checking has comparable EV;
- how the opponent behaves after a check;
- whether the checking range needs protection on the next node.

The lecture repeatedly frames strong checks as deliberate range construction, not accidental slow-play.

## Timestamp map

```text
00:05  Protected checking ranges and trade-off theorem
02:38  Inducing low-equity bets and check-raise gains
11:43  Common under-protected nodes
16:02  Flop in-position 3-bet-pot application
23:40  Solver-to-pool deviation framework
31:16  Delayed-c-bet exploitation and counter-adjustment
40:33  Turn delayed-c-bet and probe structures
52:17  Homework: compare real-player checks with solver checks
```

## Pedagogical process

The homework asks the learner to choose a familiar real opponent, predict how that player's checking range differs from equilibrium, inspect the next node, and describe how the response should change.

This supports opponent-model and falsifier training rather than solver-frequency memorisation.

## Visual dependencies

The following remain unadmitted from audio alone:

- exact boards and suits;
- exact hand frequencies;
- exact solver matrices;
- exact bet and raise sizes;
- exact EV differences;
- exact population magnitudes.

Visual review is claim-driven only when one of these facts can change a final rule, boundary, anchor or original answer key.

## Cross-source routing

Primary module effects:

- `LCM-03` — protected passive ranges and realisation;
- `LCM-04` — action-filtered range strength;
- `LCM-06` — delayed aggression and check-raise branches;
- `LCM-07` — 3-bet-pot protected checks;
- `LCM-10` — solver-to-pool conditional override;
- `LCM-11` — opponent-model homework and changed-variant assessment.

Likely candidate relations:

- `H-W01-006` — protected-call architecture, without closing exact deep boundaries;
- `H-R04-010` — robust hands protect checks and calls;
- `H-R05-002` — passive strategies require active branches;
- `H-W02-006` — later action follows the filtered prior branch;
- `H-W02-007` — exploit the exact observed branch, field-gated.

Exam routing:

- primary: `G3-Q08`;
- secondary: `G3-Q04`, `G3-Q09`.

## Source-purity boundary

This record preserves the source mechanism but does not copy solver examples, exact hands, grids or exam wording into the learner product.

## Verdict

`CP_G3_L08_CANONICALLY_INGESTED`

`STRONG_CHECKS_ARE_BRANCH_INVESTMENTS_NOT_MISSED_VALUE`

`PROTECTION_REQUIRES_NEXT_NODE_RESISTANCE`

`NO_NEW_CORE_CANDIDATE_REQUIRED`
