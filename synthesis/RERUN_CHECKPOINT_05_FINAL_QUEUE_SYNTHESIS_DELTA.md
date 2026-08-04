# Rerun Checkpoint 05 — Final Queue Synthesis Delta

Status: `CANDIDATE_DELTA_CREATED / TARGETED_RERUN_SYNTHESIS_COMPLETE`

Accepted source deltas:

- `SLC-M02-L04 Postflop Intro` — audio complete;
- `SLC-M02-L11 Turn Barreling Strategies IP Part 3` — audio complete;
- `SLC-M02-L16 Check-Raise Top Pair Part 1` — audio complete;
- `SLC-M02-L18 Leading Turns After Calling` — local gap closed;
- `SLC-M02-L22 HJ vs BTN 50-Flop Report` — audio complete;
- `SLC-M05-L53 Check-Raising Exercise` — targeted interval complete;
- `SLC-M07-L63 How to Build Your Own Stuff` — targeted tail complete.

# New Candidate Mechanisms

## H-R05-001 — Recalculate ownership after every range-filtering action

Domain: range accounting / multi-street reasoning  
Tag: `GENERAL_CORE`  
Tier: CORE  
Confidence: high mechanism  
Suggested status: `DRILL_READY`

Range advantage at the start of the flop is not permanent. After bet-call, raise-call or a very large turn bet:

- both players lose different low-equity classes;
- high-weight combinations move between branches;
- the equity leader inside the surviving node can reverse;
- a nominally neutral card can become highly favourable to one player.

Cue:

`After this action, whose surviving range is actually stronger?`

Primary sources:

- `SLC-M02-L18` — large flop c-bet clears OOP's high-card dust while IP retains air;
- `SLC-M05-L53` — raise-call removes both players' dust and can make OOP the equity favourite on a brick;
- `SLC-M02-L11` — removing middle turn continues changes brick and flush-completing rivers in opposite directions.

## H-R05-002 — A heavy-check strategy needs an active raise defence

Domain: passive-branch protection / flop strategy  
Tag: `GENERAL_CORE`  
Tier: CORE  
Confidence: high mechanism  
Suggested status: `DRILL_READY`

Checking frequently is not a complete strategy. When OOP reaches a low-EV board with a heavy-check range, the branch must contain enough:

- thin linear value raises;
- robust top-pair raises;
- draws and backdoors;
- selected bottom-pair or medium-equity support.

Otherwise IP can stab too freely and realise equity without facing meaningful pressure.

Cue:

`What raises protect this heavy-check branch?`

Primary sources:

- `SLC-M02-L22` — low-EV cold-call boards and delayed c-bet/check-raise design;
- `SLC-M02-L16` — linear top-pair protection and suited backdoor support.

# Existing Candidates Strengthened

## H-W02-002 — Every turn bluff needs a job in the river tree

L11 adds a hard constraint: once the defender's weak turn continues are removed, brick-river bluff supply must contract even if the original equilibrium line bluffed heavily.

The same earlier turn construction can create a much stronger flush-completing river branch.

## H-W02-003 — Overbet only when card and value shape preserve polarization

L11 confirms that 200% turn and 300% river sizes should be treated as distinct strategic nodes. Replacing them with ordinary sizes can produce a different opponent response and different EV.

The exploit remains conditional on actual overfolding at the extreme-size node.

## H-W02-004 — Bet size determines how wide top pair can check-raise

L16 strengthens the specific mechanism:

- vulnerable low-kicker top pair raises for protection and unblocks high-card folds;
- strong kickers can call, dominate future paired kickers and allow the betting range to catch up;
- high-frequency nodes can use a linear rather than purely polar check-raise range.

## H-W02-006 — Turn lead responds to flop betting range, not only turn card

L18 closes the missing transition:

- after a large polar flop bet, a low brick can favour OOP because OOP's call range is pair-heavy and IP retains high-card air;
- after a wide small flop bet, paired low turns create broader small linear leads because both players retain more made hands.

## H-W02-007 — Node-lock the sizing branch, not the personality label

L11 demonstrates that the relevant lock is specific:

- which middle pairs continue versus 200% pot;
- which flush draws remain;
- which top-pair classes reach each river.

The correct river exploit cannot be inferred from a generic label such as `tight`.

## H-W03-011 — A blocker is useful only inside the range created by the line

L11 adds an explicit flush-draw example. A club blocker can be harmful when it removes the defender's missed nut-flush draws, but useful if the relevant lower flush-draw classes never reached the river.

## H-R04-010 — Preserve turn-resilient hands in passive branches

L22 and L16 expand the principle beyond IP check-backs. OOP's heavy-check branch must preserve hands capable of check-raising, calling future pressure and realising equity across multiple board classes.

# Learning-System Confirmation from L63

The recovered final course workflow independently supports the architecture already built in this repository.

Source-recommended loop:

1. build the spot/script;
2. predict the strategy before viewing output;
3. inspect the aggregate report;
4. identify unexpected board and hand classes;
5. play approximately 25–50 bot decisions;
6. save uncertain and incorrect decisions;
7. reopen the exact node and understand the error;
8. model realistic opponents and node-lock when useful;
9. repeat and build a persistent library.

Repository mapping:

- prediction → diagnostic answer/reasoning;
- report delta → misconception taxonomy;
- bot decisions → variant drills;
- saved errors → session-review queue;
- reopened node → targeted repair;
- repeat → spaced retest and mastery state.

This is evidence for the learning architecture, not a new table heuristic.

# Playbook Impact

No large increase in the final rule count is required.

Likely consolidation:

- `H-R05-001` joins range ancestry, reach and board ownership;
- `H-R05-002` joins protected passive branches and check-raise construction;
- L11 mechanisms nest under multi-street aggression and blocker logic;
- L16 and L18 sharpen existing top-pair and turn-lead rules.

# Drill Impact

Add four original drill families:

1. ownership recalculation after bet-call and raise-call filtering;
2. heavy-check branch construction with value, draws and backdoors;
3. brick versus flush-completing river strategy after removing weak turn continues;
4. low-kicker raise versus strong-kicker call classification.

# Remaining Dependencies

- exact cards, suits, sizes, frequencies and solver matrices remain visual-dependent;
- Carrot and FTGU cross-source comparison remains required before admission;
- `SGL-0018` original-media tail `24:47.75–25:12` remains open;
- first-cycle canonical ingestion/cleanup remains for several machine-complete lessons.

# Verdict

`RERUN_CHECKPOINT_05_SYNTHESIS_DELTA_ACCEPTED`

`TARGETED_RERUN_SYNTHESIS_COMPLETE_EXCEPT_SGL-0018_MEDIA_TAIL`
