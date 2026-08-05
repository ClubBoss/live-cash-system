# Live Cash System — Provisional Final Rule Slot Architecture v0.1

Status: `PLANNING_SCAFFOLD / NOT_FINAL_RULES / NOT_STABLE_IDS`

## Purpose

Precompute a plausible 14–18-rule final architecture without prematurely freezing wording, scope or admission.

The slots below are containers for consolidation. They are not candidate replacements and are not learner-progress IDs.

Future sources should usually:

- strengthen a slot;
- narrow a slot;
- add a context branch;
- move a candidate between slots;
- prove that a slot should split or merge.

They should not force a fresh global grouping exercise.

## Slot vocabulary

- `STRUCTURALLY_STABLE`: strong chance the slot survives.
- `SOURCE_SENSITIVE`: core idea is useful but boundaries need remaining sources.
- `OVERLAY_BOUND`: likely separated from the general core.
- `MERGE_CANDIDATE`: may collapse into an adjacent slot.
- `SPLIT_CANDIDATE`: may become two rules if compression harms execution.

## Provisional 16-slot map

| Slot | Working function | Candidate inputs | Primary module | Current stability | Main open questions |
|---:|---|---|---|---|---|
| 1 | Identify exact node and pairwise effective depth | `H-W01-001`, structural part of `H-W01-003` | `LCM-01` | STRUCTURALLY_STABLE | `SQ-DEP-01` |
| 2 | Translate straddle/environment into SPR and sizing objectives | `H-W01-003` | `LCM-01`, `LCM-10` | OVERLAY_BOUND | `SQ-DEP-03` |
| 3 | Build preflop action from price, range, players behind and realisation | `H-W01-002`, `H-W01-008`, `H-W01-009` | `LCM-02` | SOURCE_SENSITIVE / SPLIT_CANDIDATE | `SQ-PF-01`, `SQ-PF-03`, `SQ-PF-04` |
| 4 | Identify source range before reading board texture | `H-W01-004`, `H-W01-007` | `LCM-03`, `LCM-04` | STRUCTURALLY_STABLE | `SQ-SRP-01` |
| 5 | Recalculate range and ownership after every action | `H-W01-005`, `H-W01-009`, `H-R05-001` | `LCM-04` | STRUCTURALLY_STABLE | `SQ-SRP-02`, `SQ-3B-04` |
| 6 | Protect resilient passive branches, especially deep OOP | `H-W01-006`, `H-R04-010`, `H-R05-002` | `LCM-03`, `LCM-05` | SOURCE_SENSITIVE | `SQ-DEP-02`, `SQ-SRP-05` |
| 7 | Read bet shape and choose response shape | `H-W02-004`, `H-W02-005`, `H-W03-006`, response part of `H-R05-002` | `LCM-05` | STRUCTURALLY_STRONG / BOUNDARY_PENDING | `SQ-SRP-03`, `SQ-AGG-04` |
| 8 | Construct aggression from value threshold, size and bluff jobs | `H-W02-001`, `H-W02-002` | `LCM-06` | STRUCTURALLY_STABLE | `SQ-AGG-01`, `SQ-AGG-02` |
| 9 | Use large sizing only when range/card shape preserves polarization | `H-W02-003` | `LCM-06` | SOURCE_SENSITIVE / MERGE_CANDIDATE | `SQ-AGG-03` |
| 10 | Derive turn leads/delayed aggression from prior range composition | `H-W02-006`, `H-R04-007` | `LCM-04`, `LCM-06`, `LCM-08` | SOURCE_SENSITIVE | `SQ-SRP-04`, `SQ-MW-04` |
| 11 | Carry 3-bet preflop shape through the postflop tree | `H-W03-001`, `H-W03-002`, `H-W03-005` | `LCM-07` | STRUCTURALLY_STABLE / ANCHOR_PENDING | `SQ-PF-02`, `SQ-3B-01`, `SQ-3B-04` |
| 12 | Test whether range deviations are compensated; split bet and check branches | `H-W03-003`, `H-W03-004` | `LCM-07`, `LCM-10` | STRUCTURALLY_STABLE | `SQ-3B-02`, `SQ-3B-03` |
| 13 | Multiway: nut owner, sandwich, shared defence and backup equity | `H-W03-007`, `H-W03-008`, `H-W03-010` | `LCM-08` | SOURCE_SENSITIVE / SPLIT_CANDIDATE | `SQ-MW-01`, `SQ-MW-02`, `SQ-MW-03` |
| 14 | Fast-play or delay value according to expected future aggression | `H-W03-009`, timing part of `H-R04-007` | `LCM-08`, `LCM-10` | OVERLAY_BOUND | `SQ-MW-05`, `SQ-EXP-03` |
| 15 | River audit: value, size exclusions, bluff ancestry and blockers | `H-W02-009`, `H-W03-005`, `H-W03-011` | `LCM-09` | STRUCTURALLY_STABLE | `SQ-RIV-01`, `SQ-RIV-02`, `SQ-RIV-03` |
| 16 | Exploit only the evidenced branch; grade evidence and preserve baseline | `H-W02-007`, `H-W02-008`, `H-W03-004`, `H-R04-008`, pool hypotheses | `LCM-10`, `LCM-11` | STRUCTURALLY_STABLE / OVERLAYS_PENDING | `SQ-EXP-01`–`SQ-EXP-05` |

## Slot sketches

These are retrieval skeletons, not final wording.

### Slot 1 — Node and depth

```text
Which exact opponents, denominator and SPR define this confrontation?
```

Must preserve:

- pairwise depth;
- multiway different depths;
- straddle translation.

Must not include:

- exact stack-off threshold before validation.

### Slot 2 — Environment translation

```text
What did rake, straddle, open size and stack distribution change?
```

Likely lives as an overlay rather than one of the main 14–18 core rules.

### Slot 3 — Preflop architecture

```text
Price → range purpose → players behind → realisation → action family.
```

Potential split:

- baseline action-family construction;
- exploit expansion through existing candidates.

Exact ranges remain outside this slot.

### Slot 4 — Source range first

```text
Who arrived here with which high-weight combinations?
```

Combines blind identity and fast range-mass reading.

### Slot 5 — Filtering and ownership

```text
What folded, raised, remained—and who owns the new card now?
```

Strong candidate for one of the central course rules.

### Slot 6 — Protected passive branches

```text
Does the range need this aggression, or does it need resilient calls?
```

Source-sensitive around depth, urgency and board dynamism.

### Slot 7 — Bet shape to response shape

```text
How much weak range exists behind this size, and what defence shape is required?
```

Internal selectors:

- small/wide → wider calls and merged raises;
- large/polar → tighter continues and polar raises;
- vulnerable versus low-urgency value;
- theoretical elasticity versus population failure.

### Slot 8 — Aggression construction

```text
Weakest value hand → size → bluff jobs → future streets.
```

Likely a central core rule.

### Slot 9 — Polarization preservation

```text
Did the card preserve my strongest value advantage or repair theirs?
```

May remain an advanced boundary under Slot 8 rather than a separate final rule.

### Slot 10 — Turn leads and delayed aggression

```text
What did the flop branch suppress or preserve that can act now?
```

May remain advanced if frequency of use is low.

### Slot 11 — 3-bet ancestry

```text
Which preflop families entered, and which later bluffs can therefore exist?
```

Exact defence anchors remain separate.

### Slot 12 — Compensation and branch split

```text
Did the deviating range compensate—and which branch contains the error?
```

Combines over-wide range checking requirements and strong-bet/weak-check exploitation.

### Slot 13 — Multiway structure

```text
Nut owner → sandwich → shared defence → backup equity.
```

May split into:

- structural defence;
- aggression candidate selection.

### Slot 14 — Expected aggression and value timing

```text
Who is supposed to bet next, and will they actually do it?
```

Likely opponent/environment overlay.

### Slot 15 — River audit

```text
Value → size exclusions → bluff ancestry → blockers → evidence.
```

Strong candidate for one stable final algorithm.

### Slot 16 — Evidence-gated exploit

```text
What exact branch error is evidenced, what would falsify it, and where is baseline?
```

Contains methodology; specific exploits remain overlays.

## Expected final count scenarios

### Compression scenario A — 14 core rules

Possible merges:

- Slot 2 into environment overlays outside core count;
- Slot 9 into Slot 8;
- Slot 10 into Slot 5 or an advanced branch;
- Slot 14 into opponent overlays outside core count;
- Slot 13 remains one rule.

### Compression scenario B — 16 core rules

Keep all current slots except environment-only Slot 2 may still live outside the core count.

### Compression scenario C — 18 rules

Likely splits:

- Slot 3 into baseline preflop architecture and exploit expansion;
- Slot 7 into size/response shape and protected passive branch;
- Slot 13 into multiway defence and multiway aggression.

## Source-arrival decision rules

When a new lesson arrives:

1. route it to question IDs;
2. update candidate evidence;
3. identify affected slot(s);
4. ask whether the slot changes in confidence, scope, boundary or internal step;
5. do not create a new slot unless the mechanism cannot be executed or diagnosed inside any existing slot;
6. record potential merge/split but defer final decision until relevant questions close.

## What remains intentionally unresolved

- whether Slot 6 is core or boundary;
- whether Slot 9 is separate;
- whether Slot 10 belongs in the initial route;
- whether Slot 13 must split;
- which preflop concepts become rules versus anchors;
- how many exploit overlays survive field calibration;
- exact cue wording;
- final rule IDs and admission.

## Architecture verdict

`PROVISIONAL_16_SLOT_FINAL_RULE_MAP_CREATED`

`REMAINING_SOURCES_CAN MODIFY TARGETED SLOTS WITHOUT REGROUPING ALL 34 CANDIDATES`

`FINAL RULE COUNT WORDING AND ADMISSION REMAIN DEFERRED`
