# Carrot Grade 1 Batch 04 — Cross-Source Delta v1

Status: `GRADE_1_COMPLETE / LECTURE_10_MAPPED / NO_NEW_CORE_CANDIDATE`

## Source

- `CP-G1-L10` — Basic Blocker Patterns and Texture.

## Primary contribution

Lecture 10 does not add a new standalone strategy mechanism. It adds a disciplined ordering rule for using blockers:

```text
ACTION CATEGORY
→ RANGE AND TEXTURE
→ CHECK / CALL / BET / RAISE EV
→ TARGET RESPONSE
→ BLOCKER AS FINAL SELECTOR
→ EXPLOIT EVIDENCE
```

The source's strongest reusable contribution is the **blocker limitation rule**:

> Never make a decision based solely or primarily on blockers.

This nests blocker reasoning under existing EV-tree, range-ancestry and river-audit mechanisms.

## Misconception contribution

Lecture 10 names the **insufficient reason trap**:

```text
one appealing factor
→ premature action selection
→ ignored major EV factors
```

Blockers are one common trigger, but the error is general. The source also reinforces:

- range asymmetry dominates minor blocker differences;
- exploit evidence can dominate equilibrium blocker selection;
- a hand with useful blockers may still have higher check EV;
- a bad blocker does not cancel an otherwise mandatory bluff in a highly favourable range world.

No new misconception ID is required unless learner data later shows that the existing one-factor and blocker-order errors behave independently.

## Five blocker-effect families

### 1. Turn flush-draw removal

For a bluff, Hero generally wants to block likely calls and raises and unblock folds. Relevant flush-draw cards can reduce the opponent's high-EV continues.

### 2. Busted-flush-draw blockers on the river

After the draw misses, the same card can become undesirable because it blocks the opponent's folding air. The effect depends on the action sequence and current range state.

### 3. Backdoor-flush and dead-suit effects in flop raises

For a bluff-raise, block backdoor continues and unblock dead-suit folds. For thin value, the desired response changes and the blocker pattern may reverse.

### 4. Flush blockers on completed-flush rivers

Relevant flush cards can improve both bluffs and thin value by removing flushes and some preferred bluff-catchers. Bluff-catching effects are more ambiguous because one card may remove value and bluffs simultaneously.

### 5. Blocking value when bluff-raising the river

Against a polar betting range, a bluff-raise must often fold parts of the value region, not merely air. Therefore value blockers can dominate generic bottom-of-range selection.

## Candidate relations

| Candidate | Relation | Effect |
|---|---|---|
| `H-W01-009` | STRONGLY CONFIRMS | blocker value depends on origin, action sequence and current range |
| `H-W02-002` | CONFIRMS | bluff selection follows check EV and desired response before blockers |
| `H-W02-009` | STRONGLY CONFIRMS | river value/bluff/check and size audit precedes blocker use |
| `H-W03-005` | STRONGLY CONFIRMS | bluff supply is inherited from prior streets |
| `H-W03-011` | STRONGLY SIMPLIFIES | blockers are the final selector after candidate qualification |
| `H-R05-001` | CONFIRMS | every action filter changes blocker meaning |
| `H-R04-008` | EXTENDS | an observation or theoretical reason is evidence, not a complete conclusion |

## Module relations

| Module | Lecture 10 effect |
|---|---|
| `LCM-04` | blocker meaning is tied to filtering and current ownership |
| `LCM-05` | desired response determines which combinations Hero wants to block |
| `LCM-06` | blocker selection is subordinate to value/bluff category and check EV |
| `LCM-09` | blocker ordering becomes explicit and learner-facing |
| `LCM-10` | exploit evidence can override small equilibrium blocker differences |
| `LCM-11` | insufficient-reason and blocker-first errors become assessment targets |

## Cross-source alignment

### FTGU

Confirms the existing rule that blockers are evaluated after range and bluff/value construction. Lecture 10 supplies stronger pedagogy and misuse prevention.

### Smash Live Cash

Confirms that blocker meaning depends on the line-created range, earlier bluff supply and the opponent's actual continuing regions.

### Cash Injection

Strongly aligns with branch-specific evidence and baseline-return logic. A population overfold or underbluff can be strategically larger than a small equilibrium blocker difference.

## Apparent tension resolved

### “Use blockers” versus “do not decide from blockers”

Not a contradiction.

- Blockers can select between otherwise viable candidates.
- They should not create the action category when range, EV and target response point elsewhere.

Resolution: `ORDER_OF_OPERATIONS`.

### Busted flush blocker good on turn but bad on river

Not a contradiction.

- On the turn it may remove calls and raises.
- After the draw misses, it may remove folds.

Resolution: `STREET_AND_ACTION_SEQUENCE_CONTEXT_SPLIT`.

### Bottom-of-range bluffing versus value-blocker river raises

Not a contradiction.

- In ordinary bluffing nodes, showdown value can determine the cost of checking.
- Against a polar river range where no candidate can call profitably, blocker quality can dominate showdown-value ordering.

Resolution: `NODE_SPECIFIC_SELECTION_RULE`.

## Candidate-count effect

```text
candidate count before: 34
candidate count after:  34
new core candidates:      0
```

No existing candidate is admitted by this source alone.

## Remaining strategic gates

Lecture 10 closes Grade 1 source continuity but does not close:

- preflop and squeeze boundaries;
- deep OOP thresholds;
- exact anchors;
- multiway construction;
- target-live population calibration;
- final rule compression;
- field validation.

## Delta verdict

`CARROT_G1_LECTURE_10_MAPPED`

`BLOCKER_LIMITATION_RULE_ACCEPTED_AS_ORDERING_BOUNDARY`

`INSUFFICIENT_REASON_TRAP_ABSORBED_AS_MISUSE_REPAIR`

`GRADE_1_SOURCE_CONTINUITY_COMPLETE`

`NO_NEW_CORE_CANDIDATE`
