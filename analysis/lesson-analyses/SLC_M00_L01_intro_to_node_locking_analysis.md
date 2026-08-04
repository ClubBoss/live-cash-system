# Lesson Analysis

## Source identity

- Course: Smash Live Cash
- Module: 0-Intro
- Lesson: Intro to Node Locking
- Transcript path: `sources/smash-live-cash/transcripts/SLC_M00_L01_intro_to_node_locking.md`
- Source status: NEEDS_VISUAL_REVIEW
- Analysis status: ANALYZED

## 1. Source-faithful summary

Nick Petrangelo introduces node locking as the core method used throughout the course: first establish an equilibrium baseline, then modify the solver so the opponent plays according to a specific observed tendency, re-solve, and use the resulting best response. He demonstrates the method on a BTN-versus-BB postflop line where adding extra Ax turn and river bluffs materially changes the defender's bluff-catching strategy. He also warns that a solver will compensate for forced mistakes unless the remaining strategy and earlier streets are locked carefully.

## 2. Core concepts

1. Equilibrium is a reference point, not the intended final live-cash strategy.
2. Node locking converts an opponent read into a formal model that can be re-solved.
3. The exploit depends on the exact deviation assumed, not on a generic label such as “aggressive player.”
4. A relatively small composition error can cause a large response change at a later node.
5. Locking only one action without locking the surrounding strategy can create artificial solver compensation.
6. Multi-street deviations should be introduced from the earliest street where the opponent departs from baseline.
7. The resulting best response may be highly exploitable in theory, but that is acceptable until the opponent counter-adjusts.

## 3. Assumptions and game conditions

- Format: heads-up postflop node inside a cash/MTT solver tree
- Positions: BTN vs BB
- Effective stack: [UNCLEAR: spoken 75bb parameter]
- Board: King-Queen-Four / Jack / brick river; suits unverified
- Opponent model: loose, aggressive player who overuses Ax as turn and river bluffs
- Baseline requirement: equilibrium strategy must be inspected first
- Visual dependency: exact sizings, frequencies, EVs, suits, and range cells remain unverified

## 4. Strategic classification

- Fundamental mechanism: opponent strategy errors change the best response
- Solver baseline: equilibrium BTN-vs-BB line
- Simplification: baseline → assumption → lock → re-solve → response
- Population tendency: wide-range aggressive players may lose track of bluff combinations
- Exploitative deviation: defend bluff-catchers substantially wider against a validated Ax over-bluff
- Instructor preference: maximise EV against the current opponent rather than preserve balance by default

## 5. Relevance to current leak map

- BB defence: direct methodological relevance; the example is BB defending against BTN
- SB vs BB: indirect; the same modelling method applies
- OOP vs 3-bets: indirect but high; node locking can test over-c-betting and over-barrelling
- Deep-stack discipline: high methodological relevance because later-street composition errors become costly
- Multiway: limited because the demonstrated solver workflow is heads-up
- River decisions: direct; the example shows how bluff composition changes bluff-catcher EV

## 6. Cross-source comparison

- Reinforces: the project plan to learn stable mechanisms rather than memorize equilibrium outputs
- Expected Carrot contribution: clearer theoretical explanation of bluff composition, indifference, and blocker quality
- Expected From the Ground Up contribution: simpler baseline bluff-catching and range-construction framework
- Conflicts with: none identified yet
- Missing evidence: exact visual solution and validation of the assumed Ax frequencies

## 7. Compression candidates

### Candidate A — Exploit study loop

`Baseline → specific read → lock from first deviation → lock the rest → re-solve → execute the best response.`

### Candidate B — Compensation warning

`A node lock is not trustworthy if the solver is allowed to remove other bluffs or add value to repair the forced mistake.`

### Candidate C — Bluff-catcher sensitivity

`A small excess of natural-looking bluffs can move bluff-catchers from indifferent or losing calls to clear calls.`

These are study-system candidates, not yet standalone in-game rules.

## 8. Playbook admission decision

- Decision: CANDIDATE
- Destination: study methodology / opponent modelling
- Rationale: the workflow is directly stated and does not depend on the missing exact visual frequencies
- Confidence: high for the method; medium for the demonstrated hand-level details
- Required validation: visual review before admitting exact combo or EV claims

## 9. Training conversion

Create a five-step node-lock review drill:

1. State the equilibrium baseline.
2. Describe one concrete opponent deviation in combinations or action frequency.
3. Identify the first street where the deviation occurs.
4. State what must remain locked to prevent solver compensation.
5. Predict the direction of the best-response change before viewing the re-solve.

## 10. Sharky candidates

- Interactive lesson: `Baseline or exploit?`
- Diagnostic drill: identify an invalid node lock that lets the solver compensate elsewhere
- Scenario drill: decide whether an observed over-bluff is large enough to widen bluff-catching
