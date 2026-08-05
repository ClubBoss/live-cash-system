# Carrot Grade 1 Batch 03 — Cross-Source Delta v1

Status: `LECTURES_05_TO_09_MAPPED / NO_NEW_CORE_CANDIDATE`

## Batch contribution

Lectures 05–09 complete the main Grade 1 postflop decision chain:

```text
CALL PRICE + FUTURE TREE
→ FLOP RANGE / NUT ADVANTAGE
→ TURN FILTERING AND FAVOURABILITY
→ FLOAT-BET RANGE CONSTRUCTION
→ RIVER TEXTURE AND RANGE GEOGRAPHY
```

The batch mainly improves executable protocols and boundary language. It does not create a parallel Carrot strategy and does not require new candidate IDs.

## Candidate relations

| Candidate | Carrot evidence | Relation | Effect |
|---|---|---|---|
| `H-W01-001` | L05 future tree and remaining action | CONFIRMS | stack/remaining streets modify current EV |
| `H-W01-005` | L07 filtered turn ranges | STRONGLY CONFIRMS | turn ownership must be recalculated after flop action |
| `H-W01-006` | L05 position/realisability; L08 protected checks | EXTENDS | deep boundary remains open, but call architecture is clearer |
| `H-W02-001` | L08 value threshold and check EV | CONFIRMS | value-first hand selection strengthened |
| `H-W02-002` | L07 turn bluff threshold and future branches | CONFIRMS / CONTEXT SPLIT | immediate EV does not remove need for response-class planning |
| `H-W02-003` | L06 nut advantage and investment ceiling | STRONGLY CONFIRMS | sizing is value-driven, not frequency-driven |
| `H-W02-004` | L06 frequency/size separation; L08 semi-polar betting | STRONGLY CONFIRMS | range shape and size are separate inputs |
| `H-W02-005` | L08 vulnerable thin value and denial | CONFIRMS | denial can move medium hands into bet |
| `H-W02-006` | L07 turn card and filtered flop composition | STRONGLY CONFIRMS | turn action follows the range that reached the node |
| `H-W02-009` | L09 range geography | STRONGLY SIMPLIFIES | four threshold landmarks improve river execution |
| `H-W03-003` | L06 hostile-board compensation | EXTENDS | weak range states check more, including strong hands |
| `H-W03-004` | L08 protected versus underprotected checks | CONFIRMS | branch strength must be inferred, not assumed |
| `H-W03-005` | L07/L09 bluff threshold after filtering | CONFIRMS | later bluff supply depends on earlier range state |
| `H-W03-011` | L09 relative strength and threshold order | CONFIRMS | blockers come after range/threshold reconstruction |
| `H-R04-010` | L06–L08 protected checks | STRONGLY CONFIRMS | passive branches preserve strong and medium hands |
| `H-R05-001` | L05 full future tree; L07/L09 filtering | STRONGLY CONFIRMS | recalculate ownership and action EV at each node |
| `H-R05-002` | L06/L08 active protected-check response | CONFIRMS | checking strategies require robust calls/raises |

## Module effect

| Module | Batch 03 delta |
|---|---|
| `LCM-03` | required pot share, realisability and position protocol |
| `LCM-04` | flop-to-turn filtering and range-geography thresholds |
| `LCM-05` | frequency and size as independent outputs; polar/semi-polar float construction |
| `LCM-06` | one-size turn barrel construction and favourability-based bluff threshold |
| `LCM-09` | texture classes plus four river threshold landmarks |
| `LCM-10` | baseline protected check versus evidenced weak-check exploit |
| `LCM-11` | classify reasoning errors: equity-only call, frequency-size coupling, linearisation and absolute-hand-label bias |

## Remaining-source question effect

- `SQ-DEP-02`: stronger call/realisability explanation; deep-stack boundary remains open.
- `SQ-SRP-02`: further confirmation; mechanism remains closed.
- `SQ-SRP-03`: board/denial boundaries strengthened.
- `SQ-SRP-04`: turn composition mechanism strengthened; multiway scope remains pending.
- `SQ-SRP-05`: protected passive architecture strongly strengthened; depth boundary remains.
- `SQ-AGG-01`: value/frequency/size protocol strengthened.
- `SQ-AGG-02`: turn bluff threshold strengthened.
- `SQ-AGG-03`: nut-advantage sizing boundary strongly strengthened.
- `SQ-RIV-01`: range-geography boundary model strongly strengthened.
- `SQ-RIV-03`: blocker ordering confirmed.
- `SQ-LRN-01`: strong simpler-explanation evidence.
- `SQ-LRN-03`: new counterexamples for common reasoning errors.

No squeeze, polar-preflop, exact-anchor or multiway question is closed.

## New misconception language

Useful learner-facing labels that may be mapped into existing misconception classes:

- required-equity-in-open-action error;
- frequency-control-sizing fallacy;
- range-advantage-equals-bet fallacy;
- linearisation pitfall;
- absolute-hand-label bias;
- texture-blind threshold error.

These are explanation aliases, not new misconception IDs by default.

## New-candidate decision

No new general-core candidate.

The main new phrases are nested under existing mechanisms:

- required pot share → `LCM-03`;
- range advantage for frequency / nut advantage for sizing → Slots 7 and 9;
- favourable turn world → filtering plus aggression;
- float-bet linearisation → protected passive branches;
- range geography → river audit.

## Coverage boundary

Grade 1 now has canonical Lectures 01–09 plus Final Exam and Exam Feedback.

Lecture 10 remains pending. The exam feedback does not replace it.

## Verdict

`CARROT_G1_BATCH_03_CROSS_SOURCE_DELTA_ACCEPTED`

`NO_CORE_CANDIDATE_COUNT_INCREASE`

`GRADE_1_L10_PENDING`
