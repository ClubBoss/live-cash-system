# Source Metadata

Course: Carrot Poker School  
Grade: 1  
Source: Final Exam Feedback  
Instructor: Peter Clarke  
Original filename: `Grade 1 - Exam Feedback.mp4`  
Source duration from transcript: `74:23.30`  
Transcription engine: `mlx-whisper`  
Model: `large-v3`  
Language: English  
Translation: disabled  
Source ID: `CP-G1-EXAM-FB`  
Source status: `AUDIO_COMPLETE / EXAM_PDF_AVAILABLE / SOLVER_OUTPUTS_NEED_VISUAL_REVIEW`

# Editorial Note

The audio provides feedback for all ten questions in the supplied 13-page Grade 1 Final Exam PDF. The transcript is continuous and loop-free.

The exam PDF fixes the visible positions, boards, suits and candidate hands. The feedback video additionally uses pre-solved PioSolver screens that were not supplied separately. Therefore exact solver frequencies, EV values and range matrices remain visual-dependent even where the spoken directional answer is clear.

This feedback is a Grade 1 recap and assessment source. It does not replace the missing source continuity of Lectures 02–10.

# Question-by-Question Source Record

## Question 1 — EV as a percentage of the pot

The student estimates EV for four BU hands in a turn barrel opportunity.

Core feedback:

- EV is not capped at 100% of the current pot.
- Very strong value can approach or exceed the pot through future value.
- Draws may retain meaningful EV through position, implied odds, pair outs and straight/flush improvement.
- Fold equity is not “free”; the bettor risks money when called.
- A hand with showdown value can derive much of its EV from checking rather than betting.

Assessment target:

`equity versus EV → position and implied odds → action comparison`.

## Question 2 — Value-bet thresholds

The student labels hands as mandatory, optional or prohibited value bets for a 75% pot turn size.

Core feedback:

- medium-strength hands can be too weak to reopen the action;
- a high-equity hand is not automatically the most mandatory value bet;
- blocker effects on worse calls matter;
- strong sets have urgent pot-growth requirements;
- the value region must be defined relative to size and the opponent's continuing range.

Assessment target:

`relative hand strength → value threshold → size → blockers to calls → urgency`.

## Question 3 — Mandatory, optional and prohibited bluffs

The student classifies river bluff candidates after flop bet/call and turn check-through.

Core feedback:

- first establish whether the world is favourable for the bettor's range;
- very favourable nodes can make even some showdown-value hands mandatory bluffs;
- good-looking blockers are not a sufficient reason to bluff;
- hands with substantial check EV must not be converted into bluffs merely because they block something.

Assessment target:

`range favourability → check EV → bluff threshold → blocker only afterward`.

## Question 4 — Polarised versus condensed ranges

After SB bets small on the flop and overbets the turn, the exam asks about the river range matchup.

Core feedback:

- repeated large betting polarises SB;
- repeated calling condenses BB;
- BB can have more equity while SB has the nut advantage;
- range disadvantage does not imply “never bluff”;
- BB cannot defend only two-pair-plus; selected one-pair bluff-catchers remain necessary;
- absolute hand class is inferior to value/bluff/blocker reconstruction.

Assessment target:

`range shape → equity versus nut prevalence → bluff selectivity → bluff-catching`.

## Question 5 — Calling a draw in an open-action spot

The exam asks whether a draw call is profitable, how position changes EV, how two hands differ in realisability and how open-action protocol differs from end-of-action protocol.

Core feedback:

- a call may be better than folding but still inferior to raising;
- a positive-EV action can still be a strategic error;
- position improves both missed-draw bluffing and made-draw value opportunities;
- pair draws and minimal showdown value contribute to call EV;
- medium pairs can fold the best hand and gain little future value;
- end-of-action equity formulas do not replace open-action EV analysis.

Assessment target:

`action ranking → realisability → position → open/end protocol`.

## Question 6 — Flop frequency and single-size simplification

The student chooses rough global bet frequency and one size on four flop textures.

Core feedback:

- range advantage primarily governs frequency;
- nut advantage and opponent range shape primarily govern size;
- a highly favourable paired board can be bet very frequently but small when the defender is polarised;
- a more merged defender supports larger, more polar betting;
- monotone and ace-high boards require attention to range shape rather than visible “protection” stories;
- frequency and sizing must be chosen before fitting an exact hand into the range.

Assessment target:

`range advantage → frequency; nut advantage/range shape → size`.

## Question 7 — Favourable, neutral and unfavourable worlds

The student classifies turn barrel environments by EV favourability and names the lowest-equity permitted bluff.

Core feedback:

- favourability is range EV, not hand equity;
- favourable worlds require less selective bluff candidates;
- neutral or unfavourable worlds require better equity, blockers or future prospects;
- a low-equity bluff is not a loss leader when betting is actually higher EV than checking;
- arbitrary rules such as “must have a flush draw” are rejected;
- the selected bluff depends on the folding and raising regions, not a universal hand class.

Assessment target:

`world favourability → bluff selectivity → candidate floor`.

## Question 8 — Semi-polarised versus fully polarised float betting

The student selects strategy shape and B33/B75 in single-raised and three-bet pots.

Core feedback:

- a merged in-position range uses smaller bets;
- a polar/nutted value region can use large bets at low frequency;
- protected OOP checking ranges limit indiscriminate float betting;
- range advantage drives frequency while nut advantage drives size;
- some textures permit simplification, but the construction must remain coherent.

Assessment target:

`range shape → semi-polar/polar strategy → frequency and size`.

## Question 9 — River range geography

For two river nodes the student identifies:

- weakest B33 value bet;
- highest-showdown-value bluff;
- a pure check in the middle.

Core feedback:

- passive action can upgrade thin-value thresholds because both ranges weaken;
- a favourable node can permit some showdown-value bluffs;
- the middle of the range must remain checked;
- value, bluff and check thresholds are node-specific and depend on preflop configuration and prior filtering.

Assessment target:

`value threshold → bluff threshold → protected medium check region`.

## Question 10 — Blocker ranking

The student ranks candidate bluffs by betting frequency.

Core feedback:

- first remove hands with too much showdown value to qualify as bluffs;
- then compare which cards block calls/value and which block folds/missed draws;
- a visually prominent flush blocker can be negative when it removes the opponent's folding range;
- blocker direction depends on the exact line and target region;
- human population tendencies may shift exact ordering, but the line-created range remains the reference.

Assessment target:

`qualify bluff candidate → reconstruct folds/calls → evaluate blockers`.

# Course-Level Grade 1 Model Evidenced by the Exam

```text
NODE
→ RANGE FAVOURABILITY
→ RANGE / NUT ADVANTAGE
→ ACTION SHAPE AND SIZE
→ VALUE OR BLUFF THRESHOLD
→ CHECK EV
→ BLOCKERS
→ OPEN- OR END-OF-ACTION PROTOCOL
```

# Cross-Source Hooks

- `STRONGLY SIMPLIFIES H-W02-001`: define the value threshold before bluff selection.
- `CONFIRMS H-W02-003`: large sizing follows polar/nut-advantaged range shape.
- `CONFIRMS H-W02-004`: size and opponent range shape determine response breadth.
- `CONFIRMS H-W02-009`: river defence requires value, size and blocker analysis.
- `CONFIRMS H-W03-005`: bluff supply and filtering determine later aggression.
- `CONFIRMS H-W03-011`: blocker value is line-dependent.
- `CONFIRMS H-R04-010` and `H-R05-002`: medium and resilient hands must preserve checking/calling branches.
- `SIMPLIFIES LCM-06`: frequency and sizing are range decisions before hand selection.
- `SIMPLIFIES LCM-09`: value threshold, bluff threshold and medium check region form river range geography.
- `SUPPORTS SQ-LRN-01` and `SQ-LRN-03`: the exam supplies alternative explanations and counterexamples.

# Project Interpretation Boundaries

Accepted:

- the strategic mechanisms and ordering of reasoning;
- the exam's competency structure;
- the directional answer categories;
- the distinction between equity, EV, range advantage, nut advantage and blocker roles.

Not imported directly:

- exact proprietary exam spots as product questions;
- exact solver frequencies or EV values;
- exact ranges or chart cells;
- population claims about low-stakes players;
- the feedback as a substitute for missing Grade 1 lecture records.

# Source Verdict

`CP_G1_EXAM_FEEDBACK_AUDIO_COMPLETE`

`GRADE_1_COMPETENCY_STRUCTURE_ACCEPTED`

`LECTURES_02_TO_10_SOURCE_CONTINUITY_STILL_PENDING`
