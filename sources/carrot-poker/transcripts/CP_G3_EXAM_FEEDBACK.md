# CP-G3-EXAM-FB — Grade 3 Final Exam Feedback

Status: `AUDIO_COMPLETE / ANSWER_KEY_MAPPED / SOLVER_VISUALS_PENDING`

## Source identity

- source family: Carrot Poker School;
- grade: 3;
- source artifact: Final Exam Feedback;
- source file: `Grade 3 - Exam Feedback.mp4`;
- transcript package: `transcripts_mlx_large_v3(20260805-221934).zip`;
- package SHA-256: `e957e3b8a699ed43378099cffbc8e5b874ca97283a7935984c1ae924b5dd4d70`;
- duration: `58:08.84`;
- transcript engine: `mlx-whisper`;
- model: `large-v3`;
- language: English;
- translation: false;
- related exam artifact: `CP-G3-EXAM`.

## Source role

This recording supplies source answer-key continuity for all ten Grade 3 exam questions.

It does not complete Grade 3 lecture continuity. Lecture 4 explicitly announces Lecture 5, and later lectures remain pending.

## Answer-key map

### Question 1 — turn call versus raise

The source treats similar draws and made hands as different action candidates because full-tree EV differs.

Key distinctions:

- some hands mix call and raise because both actions are near-indifferent;
- hybrid raises require enough combined value, denial, improvement and future-fold-equity benefit;
- positive bluff-catching blockers do not automatically justify reopening the action with a raise;
- the threshold for raising is higher than the threshold for calling.

### Question 2 — river mixing and size ceilings

The source links river bluffing and value sizing to:

- action filtering;
- world favourability;
- the remaining value regions;
- opponent nut retention;
- the investment ceiling of the value hand.

It argues that unusual wide-range nodes can support thin large value bets that population may miss.

An extreme size is rejected when no value region can profitably use it against the opponent's resulting continue range.

### Question 3 — blocker-specific turn bluff selection

The source explains combo differences through the opponent's next response:

- blocking common folds reduces bluff EV;
- blocking missed backdoor regions can be especially harmful;
- unblocking those folds can make an otherwise similar combo a better bet;
- a weak hand is not automatically a bluff if its blockers cause Villain to continue too often.

### Question 4 — five-part check-raise range and turn migration

The source reiterates five flop raise classes:

1. thick value;
2. thin value;
3. high-EV bluffs;
4. hybrids;
5. low-EV bluffs.

After the raise is called, each class must be reassessed on the turn. Unfavourable turns can demote hybrids and thin value into checks or weak bluffs, while favourable turns can promote draws and made hands.

### Question 5 — river bluff-catching and live-pool correction

The source generally prioritises unblocking bluffs on non-flush river textures because bluff regions can be more homogeneous than value regions.

It warns that a theoretically indifferent call can become a large practical error when the target pool underbluffs the branch.

A cited population claim about triple-broadway boards is source-specific and remains field-gated in this repository.

### Question 6 — very large river probe

The source explains broad bluff mixing as an equilibrium protection device: concentrating bluffs in one blocker class would let the opponent over-adjust calls.

The very large size is driven by a value region whose investment ceiling exceeds smaller sizes. Intermediate sizes disappear when no distinct value tier needs them.

Exploitatively, the source distinguishes equilibrium size necessity from pool behaviour; an equilibrium blunder is not automatically a practical blunder in every pool.

### Question 7 — river overbet and showdown-value scarcity

On a highly favourable river, hands previously considered give-ups can become profitable bluffs because the range has abundant value and elevated fold equity.

The checking range may contain very little medium showdown value. The source stresses runout-dependent reclassification rather than fixed hand labels.

### Question 8 — protected checks and high check-raise frequency

The source explains that checking a strong hand does not end value extraction when Villain bets frequently and Hero can check-raise.

High check-raise frequency follows:

- protected strong checks;
- a relatively merged opposing stab range;
- strong value and draw regions in Hero's check range;
- the need to reach the value investment ceiling after a checked flop.

The overbet size is value-led, not chosen because it looks aggressive.

### Question 9 — texture-dependent defence in 3-bet pots

The source gives three directional classes:

- boards highly favourable for the caller can produce extremely low fold frequencies versus a small range bet;
- boards without a credible value raise region can have no raising;
- more neutral textures produce fold equity near the pot-odds norm.

Turn hybrid raises are most available when vulnerable showdown value combines with a meaningful redraw at low SPR.

### Question 10 — low-SPR 4-bet-pot turn strategy

The source allows OOP thin value/denial bets that are not favourites when called because checking does not close the action and may realise equity poorly.

It explains minimal IP raising through low SPR and limited benefit from reopening against a sufficiently strong/polar betting range.

Different overpairs can diverge because blockers change:

- opponent calls;
- opponent check-backs;
- opponent bluffs;
- the value of slow-playing.

## Grade 3 exam operating synthesis

```text
NODE AND ACTION HISTORY
→ CURRENT RANGE SHAPE
→ PURE / MIX GATE
→ WORLD FAVOURABILITY
→ VALUE REGION AND INVESTMENT CEILING
→ CALL / BET / RAISE THRESHOLD
→ FUTURE CLASS MIGRATION
→ BLOCKER / INTERFERENCE FUNCTIONS
→ EQUILIBRIUM ANSWER
→ POOL-SPECIFIC OVERRIDE ONLY WITH EVIDENCE
```

## Misconceptions explicitly repaired

- uncertainty means a mix exists;
- a good blocker makes a raise automatically good;
- trash should always bluff;
- a flop hand class remains fixed on the turn;
- solver output alone justifies a live-pool call;
- large size is chosen by bluff desire rather than value ceiling;
- checking strong value loses the chance to earn money;
- range disadvantage alone forbids raising;
- a value bet must be ahead when called in every OOP node;
- similar absolute hand classes should use the same action.

## Visual dependencies

The audio does not independently admit:

- exact cards and suits where transcription may be uncertain;
- exact solver matrices;
- exact mixed frequencies;
- exact EV gaps;
- exact bet and raise sizes;
- exact pool statistics.

The Grade 3 exam PDF is available for question geometry. Solver screens remain claim-driven visual dependencies.

## Cross-source routing

Primary modules:

- `LCM-04` — filtering and class migration;
- `LCM-05` — response thresholds;
- `LCM-06` — sizing, raising and future jobs;
- `LCM-07` — 3-bet/4-bet-pot strategy;
- `LCM-09` — river bluff-catching and interference;
- `LCM-10` — theory-to-pool override;
- `LCM-11` — answer-key and misconception repair.

All `G3-Q01` through `G3-Q10` now have source answer-key support.

## Source-purity boundary

Exact source questions, boards, answers and solver outputs remain reference-only. Product-facing repairs use original changed variants.

## Verdict

`CP_G3_EXAM_FEEDBACK_CANONICALLY_INGESTED`

`ALL_TEN_GRADE_3_EXAM_ANSWER_SECTIONS_PRESENT`

`GRADE_3_ANSWER_KEY_CONTINUITY_COMPLETE`

`GRADE_3_LECTURE_CONTINUITY_REMAINS_PARTIAL`
