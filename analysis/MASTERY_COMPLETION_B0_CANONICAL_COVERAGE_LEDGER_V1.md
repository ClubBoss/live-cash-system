# B0 — Canonical Coverage Ledger V1

Status: `B0_PASS_1 / ADVERSARIAL_REVIEW_REQUIRED`

Baseline: `program/practical-mastery-expansion@f68d375457a7fd9fa7f85934c88ae59f82e4937a`

## Baseline delta

Legacy practical-fluency finding: the 11-module / 55-drill product had strong mechanism coverage but insufficient repeated execution across positions, hand families, board classes, sizes, depths and changed nodes.

Current Practical Mastery graph: 86 skill families across foundation, preflop, blinds, recognition, SRP, 3BP, 4BP/low-SPR, turn, river, multiway, deep/straddle, exploit and integrated transfer.

The remaining problem is no longer broad curriculum absence. It is bounded source ceilings, uneven depth, perceptual/table-state transfer, and empirical proof.

## Original target-scope reconciliation

| Target area | Current treatment | Breadth | Practice depth | Residual disposition |
|---|---|---:|---:|---|
| 1/3 and 2/5 live NLHE | CORE_TRAINED | strong | strong | retain; B7 empirical calibration |
| 100–200bb | CORE_TRAINED | strong | strong | retain |
| 300–400bb selected nodes | ADVANCED_CONTEXTUAL | partial | partial | B1 positive-EV source closure |
| Mandatory/common straddles | CORE_TRAINED | strong | good | B3/B4 table-state variants |
| BB defence | CORE_TRAINED | strong | strong except BL-03 transfer under-depth finding | B3 repair + perceptual reps |
| SB vs opens | CORE_TRAINED | strong | strong | B2/B3 perceptual/variation |
| SB first-in / BvB preflop | SOURCE_BLOCKED / PARTIAL | weak | fail-closed | B1 top acquisition target |
| BvB SRP | ADVANCED_CONTEXTUAL | good mechanism | limited compared with HU | B1/B3 positive-net-EV expansion if authority permits |
| BvB 3BP | PARTIAL | partial | partial | B1 source review |
| OOP SRP | CORE_TRAINED | strong | strong | B2 visual transfer |
| IP SRP | CORE_TRAINED | strong | strong | B2 visual transfer |
| OOP 3BP | CORE_TRAINED | strong | strong | B2/B3 role/table-state transfer |
| IP 3BP / caller roles | CORE_TRAINED | strong | strong | B2/B3 transfer |
| 4BP / low SPR | CORE_TRAINED | strong | strong | B3 add selected hand/depth variation only when positive EV |
| Board/runout recognition | CORE_TRAINED | strong semantic | strong text / medium perceptual | B2 highest-EV modality upgrade |
| Made-hand relative strength | CORE_TRAINED | strong | strong text | B2 combo/table-state transfer |
| Draw-family taxonomy | PARTIAL | partial | capped | B1 source review |
| Clean/dirty/dominated/dead outs | SOURCE_BLOCKED | missing scored tree | none | B1 source acquisition |
| Pot odds / required equity | CORE_TRAINED | strong | strong | B5 fading/automaticity |
| Equity realization | CORE_TRAINED | strong | strong | retain |
| Implied/reverse implied odds | CORE_TRAINED | strong | strong | B3 deep/live variants |
| Effective stack / SPR | CORE_TRAINED | strong | strong text | B2 table-state recognition + B5 habit fading |
| Combo counting / removal / blockers | CORE_TRAINED | strong | good | B2 visual card-state reps; B3 river integration |
| Bet sizing families | SUPPORTING_CONCEPT across multiple skills | strong | good | no standalone chapter; contextual practice only |
| Turn card classes | CORE_TRAINED | strong | strong | B2 ancestry visualisation |
| Turn barrels / probes / leads | CORE_TRAINED | strong | strong | B3 selective variant scaling |
| River value | CORE_TRAINED | strong | strong | B3 selected live/pool variation |
| River bluff selection | CORE_TRAINED | strong | strong | B3 blocker/unblocker visual reps |
| River bluff catching | CORE_TRAINED | strong | strong | B3 source-scoped pool variants |
| Multiway relative position | CORE_TRAINED | strong | good | B2 table-state visual reps |
| Multiway value/bluff thresholds | CORE_TRAINED | strong | good | B3 variation |
| Multiway river | PARTIAL | partial | capped | B1 source review |
| Limp / overlimp / isolation | CORE_TRAINED | strong | strong | B4 live table variants |
| Live population evidence | CORE_TRAINED | strong | strong | B6 adaptive/real-hand integration |
| Exploit value/bluff/call/sizing | CORE_TRAINED | strong | strong | B6 adaptive repair |
| Table/seat/game selection | SOURCE_BLOCKED | concept only | none | B1 source acquisition if positive net EV |
| Real-hand transfer | CORE SYSTEM CAPABILITY | architecture strong | empirical proof pending | B6/B7 |
| Mental game/session performance | not part of current practical-strategy graph | limited | limited | B0 adversarial net-EV review; admit only positive-EV bounded items |

## Canonical source ceilings entering B1

| Skill | Current status | Benefit | Acquisition / implementation cost | Risk | Net-EV disposition |
|---|---|---|---|---|---|
| FND-04 clean/dirty outs | SOURCE_BLOCKED | medium-high foundational | low-medium | low | `B1_CLOSE` |
| BL-06 SB first-in | SOURCE_BLOCKED | high frequency / high transfer | medium | medium | `B1_CLOSE` |
| BL-07 BB vs SB open | PARTIAL | high frequency | medium | medium | `B1_CLOSE` |
| BL-08 BB vs SB limp | SOURCE_BLOCKED | high live frequency | medium | medium | `B1_CLOSE` |
| BL-09 continuation after BvB aggression | SOURCE_BLOCKED | medium-high | medium-high | medium | `B1_CLOSE_IF_AUTHORITY_COHERENT` |
| BL-11 BvB 3BP | PARTIAL | medium | medium | medium | `B1_CLOSE_IF_POSITIVE_AFTER_REVIEW` |
| W4-DRAW-01 full draw taxonomy | PARTIAL | medium | low-medium | low | `B1_CLOSE` |
| MW-05 multiway river | PARTIAL | medium | medium | medium | `B1_CLOSE_IF_POSITIVE_AFTER_REVIEW` |
| DEEP-02 300bb+ | SOURCE_BLOCKED | high for selected live environments | medium-high | medium | `B1_CLOSE` |
| EXP-06 table/seat/game selection | SOURCE_BLOCKED | positive hourly-EV relevance | low-medium | low | `B1_CLOSE_IF_SOURCE_AVAILABLE` |

Priority controls order only. B1 eligibility is all positive-net-EV gaps.

## Course-material treatment policy

Course/source material does **not** require one-to-one lessons. Material is merged when multiple lessons teach the same causal mechanism and split when one source lesson contains distinct table-executable skills.

- Exact solver/chart cells: `REFERENCE_ONLY` unless explicitly reviewed and needed for a practical boundary.
- Robust solver-derived patterns: may become `CORE_TRAINED` heuristic after assumptions, stability and boundary review.
- Rare exact frequencies with high assumption sensitivity: `REFERENCE_ONLY`.
- Mechanism explanations that improve decisions but do not create a distinct decision node: `SUPPORTING_CONCEPT`.
- Strategically valid but very rare / costly edge cases: candidate `LOW_EV_EXCLUDED` only after explicit net-EV review.

## B0 adversarial findings

1. Minimum evidence density is not the same as proportional depth. High-frequency skills may need more than the 2/3/2/1 floor.
2. Semantic/text transfer is materially ahead of perceptual/table-state transfer.
3. The current graph has explicit source gaps rather than silently treating broad module presence as coverage.
4. `BL-03` was found by executable audit to be under its intended transfer floor and must be repaired before final closure.
5. A future visual/table-state engine should reuse the same skill IDs and evidence semantics rather than create a parallel curriculum.
6. Mental-game/session-performance material needs a bounded net-EV review rather than automatic exclusion or automatic curriculum expansion.

## B0 provisional verdict

`SEMANTIC_BREADTH = STRONG`

`CORE_DECISION_DEPTH = STRONG_BUT_UNEVEN`

`SOURCE_GAPS = BOUNDED_AND_ACTIONABLE`

`PERCEPTUAL_TRANSFER = MATERIAL_NEXT_GAP`

`EMPIRICAL_MASTERY = NOT_YET_PROVEN`
