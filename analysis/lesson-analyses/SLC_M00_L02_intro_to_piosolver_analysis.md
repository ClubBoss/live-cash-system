# Lesson Analysis

## Source identity

- Course: Smash Live Cash
- Module: 0-Intro
- Lesson: Intro to PioSolver
- Transcript path: `sources/smash-live-cash/transcripts/SLC_M00_L02_intro_to_piosolver.md`
- Source status: NEEDS_VISUAL_REVIEW
- Analysis status: ANALYZED

## 1. Source-faithful summary

Nick Petrangelo explains how PioSolver will be used throughout the course. Equilibrium provides a baseline for understanding range and board interactions, while the real objective is to locate profitable deviations against human opponents. He rejects memorizing a separate script for every board and instead advocates using a small number of representative examples to learn strategy shapes that can be extrapolated. He introduces the main interface tools: strategy matrices, hand-level frequencies, equity, EV, runout comparisons, Range Explorer, and aggregated spreadsheet reports.

## 2. Core concepts

1. Equilibrium is the baseline required to measure a deviation.
2. Solver outputs should be read as strategy shapes and range interactions, not rigid scripts.
3. Bet-size trees are abstractions for study; live execution can use sensible nearby sizings.
4. A small number of carefully chosen boards can teach mechanisms that transfer to many boards.
5. Aggregate frequencies provide a first-pass shape; hand-level hover data explains composition.
6. Equity and EV answer different questions because realization and position matter.
7. Range composition should be understood proportionally, not only by raw combination counts.
8. Runout comparisons and aggregate reports are orientation tools before node-level study.
9. Node locking is the next step after the equilibrium baseline.

## 3. Assumptions and game conditions

- Solver: PioSolver, heads-up postflop
- Multiway: handled with a different solver and not covered by this interface walkthrough
- Demonstration: BTN vs BB single-raised pot
- Numerical convention: outputs normalized so they can be translated into big blinds
- Sizing tree: multiple bet and raise sizes included as an abstraction
- Visual dependency: exact board, ranges, tree, colors, frequencies, and report columns require video review

## 4. Strategic classification

- Fundamental mechanism: range interaction and best-response analysis
- Solver baseline: equilibrium strategy
- Simplification: learn shapes, not 1,700 board scripts
- Population tendency: humans deviate through over-bluffing, under-bluffing, over-folding, and over-calling
- Exploitative deviation: identify where those errors turn bluff-catches or bluffs into high-EV plays
- Instructor preference: representative examples, broad reports, then detailed node inspection

## 5. Relevance to current leak map

- BB defence: direct, because the interface demonstration is BTN vs BB
- SB vs BB: methodological transfer
- OOP vs 3-bets: high transfer; strategy/equity/EV tools will be used in those lessons
- Deep-stack discipline: high; the instructor explicitly frames the method for deep live cash
- Multiway: limited; separate solver required
- River decisions: direct through range composition, bluff-catching, and Range Explorer
- Learning overload: extremely high relevance; the lesson explicitly rejects memorizing every board

## 6. Cross-source comparison

- Reinforces: the project's intended output of compact heuristics and transferable mechanisms
- Expected Carrot contribution: theory and vocabulary for why strategy shapes occur
- Expected From the Ground Up contribution: a simpler baseline sequence for less advanced nodes
- Conflicts with: none identified
- Missing evidence: original screens and exact solver settings

## 7. Compression candidates

### Candidate A — Shape over script

`Use the solver to learn why a range prefers an action class, not to memorize one matrix for one board.`

### Candidate B — Representative-board method

`Study a small set of boards deeply, then transfer the mechanism by identifying what changed in range advantage, nut advantage, and available draws.`

### Candidate C — Proportional range thinking

`Ask what percentage of the range is value, bluff, or a hand class—not only how many raw combinations exist.`

### Candidate D — Tool order

`Aggregate view → strategy shape → range composition → hand-level boundary → opponent deviation.`

### Candidate E — Sizing abstraction

`A solver size is a study bucket; live execution can use a nearby practical size if the strategic function is preserved.`

## 8. Playbook admission decision

- Decision: CANDIDATE
- Destination: learning system / decision-process foundation
- Rationale: these are explicitly taught study principles and align with the user's need for a memorable system
- Confidence: high for the learning method; medium for example-specific numbers
- Required validation: visual review only for exact example data, not for the high-level method

## 9. Training conversion

Create three recurring drills:

1. **Shape drill:** describe a solver output without naming exact frequencies.
2. **Proportion drill:** convert raw combinations into a percentage-of-range statement.
3. **Transfer drill:** after studying one board, name the feature that must change before the strategy should change.

## 10. Sharky candidates

- Interactive lesson: `Shape, not script`
- Range-composition visualizer using percentages rather than raw combos
- Board-transfer exercise with one changed card or range condition
- Tool-selection drill: Strategy vs Equity vs EV vs Range Explorer vs aggregated report
