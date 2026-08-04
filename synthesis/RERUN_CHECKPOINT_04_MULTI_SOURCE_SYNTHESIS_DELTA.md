# Rerun Checkpoint 04 — Multi-Source Synthesis Delta

Status: `CANDIDATE_DELTA_CREATED / CENTRAL_REGISTRY_CONSOLIDATION_PENDING`

Accepted source deltas:

- `SLC-M02-L12 Playing Turns vs Capped Ranges` — audio complete;
- `SLC-M03-L25 Preflop Adjustments vs Locked 3-Bet Ranges Part 2` — recovered through 24:47.75; nominal tail still open;
- `SLC-M03-L27 Exploiting OOP C-Bet Strategies in 3-Bet Pots` — audio complete;
- `SLC-M04-L38 Using Small Bet Sizes to Force Over-Folds` — audio complete;
- `SLC-M05-L42 Coaching Brad Owen Intro` — audio verified;
- `SLC-M05-L44 Advanced Postflop Strategy Building Part 2` — targeted tail complete;
- `SLC-M06-L58 Ginge Takes Savage Check-Raise Line` — audio complete.

# New and Strengthened Candidate Mechanisms

## H-R04-001 — Card class selects the turn architecture

Domain: turn strategy / sizing  
Tag: `GENERAL_CORE`  
Tier: CORE  
Confidence: high mechanism  
Suggested status: `DRILL_READY`

Do not apply one turn size across the deck.

- low neutral bricks preserve polarization and support the largest bets;
- middling interaction cards move overpairs toward medium sizes and make large bets blocker-oriented;
- wet high cards and high flush completers support wider, smaller, more linear betting;
- low flush completers can retain more medium betting because range ownership differs.

Cue:

`What class of turn is this: brick, middling, or range-compressing?`

Primary source: `SLC-M02-L12`.

## H-R04-002 — A preflop exploit must stop or compensate after resistance

Domain: preflop-to-flop range construction  
Tag: `GENERAL_CORE`  
Tier: CORE  
Confidence: high mechanism  
Suggested status: `DRILL_READY`

If a player 3-bets too wide because the opponent supposedly overfolds, the exploit has already been attempted. Once called, the surviving IP range is stronger and OOP's range contains excess low-equity material.

The wide 3-bettor must check more postflop. Retaining normal c-bet frequency creates a second, contradictory exploit and an over-bluffed range.

Cue:

`Did the first exploit already fail?`

Primary source: `SLC-M03-L25`.

## H-R04-003 — The same preflop profile can require opposite postflop responses

Domain: 3-bet pots / opponent modelling  
Tag: `GENERAL_CORE / ENVIRONMENT_SENSITIVE`  
Tier: CORE  
Confidence: high structure  
Suggested status: `DRILL_READY`

A value-heavy 3-bettor theoretically crushes dominated high cards, but may under-barrel and allow position to over-realise. A broadly over-wide 3-bettor may be easy to call preflop, but becomes especially exploitable if they continue c-betting as though their range remained strong.

Model both:

1. preflop composition;
2. postflop follow-through.

Cue:

`What did they enter with, and how do they carry it forward?`

Primary source: `SLC-M03-L25`.

## H-R04-004 — Heavy-combo relocation matters more than total frequency

Domain: branch modelling / solver interpretation  
Tag: `GENERAL_CORE`  
Tier: CORE  
Confidence: high  
Suggested status: `DRILL_READY`

A five-percentage-point change can transform a node when it moves high-weight combinations such as AK/AQ from bet into check. Read which hands moved, not only how much the aggregate frequency changed.

Cue:

`Which high-weight combos caused the delta?`

Primary source: `SLC-M03-L27`.

## H-R04-005 — Swap thin value for bluffs when required bluff-catchers overfold

Domain: river exploit  
Tag: `GENERAL_CORE / POOL_HYPOTHESIS`  
Tier: SUPPORTING  
Confidence: high direction  
Suggested status: `DRILL_READY`

A solver may value bet weak pairs because OOP must call many ace-high hands. If the real opponent folds those bluff-catchers:

- remove the thinnest value;
- increase bluffs targeting the high-card mass;
- retain the profitable earlier-street pressure.

Cue:

`Will the hands that justify my thin value actually call?`

Primary source: `SLC-M03-L27`.

## H-R04-006 — Tiny multiway bets need both fold and raise assumptions

Domain: multiway small betting  
Tag: `GENERAL_CORE / POOL_HYPOTHESIS`  
Tier: CORE  
Confidence: high mechanism  
Suggested status: `DRILL_READY`

A tiny bet overperforms when opponents:

1. fold too much despite the price; and
2. fail to build the required raise range.

Prefer exploit extensions with backup equity because the pot is still multiway and a raise remains possible.

Cue:

`Who overfolds, and who is supposed to raise?`

Primary source: `SLC-M04-L38`.

## H-R04-007 — Suppressed flop aggression can reappear as a turn lead

Domain: multiway / delayed aggression  
Tag: `GENERAL_CORE`  
Tier: SUPPORTING  
Confidence: high mechanism  
Suggested status: `DRILL_READY`

An uncapped player behind can suppress BB's heads-up-style flop check-raise range. After that player folds, part of the missing value and bluff shape can appear in a turn-leading range.

Cue:

`Which flop action was blocked by the player behind?`

Primary source: `SLC-M04-L38`.

## H-R04-008 — A live tell is a data point, not a range conclusion

Domain: live reads  
Tag: `GENERAL_CORE / FIELD_EVIDENCE`  
Tier: CORE  
Confidence: high methodology  
Suggested status: `DRILL_READY`

A fast or comfortable action may identify a natural hand class, but it should be stored and tested against future behaviour. One timing tell does not justify rewriting the range.

Cue:

`What future observation would confirm this read?`

Primary source: `SLC-M06-L58`.

## H-R04-009 — Audit strange river lines backward

Domain: river decision / line ancestry  
Tag: `GENERAL_CORE`  
Tier: CORE  
Confidence: high mechanism  
Suggested status: `DRILL_READY`

When facing an unusual river raise:

1. reconstruct the turn value region;
2. identify the available bluffs after that turn line;
3. inspect which value bets Hero's hand blocks;
4. node-lock the opponent's full range, not the one revealed combo.

Cue:

`What had to reach this river before the raise existed?`

Primary source: `SLC-M06-L58`.

## H-R04-010 — Preserve turn-resilient hands in the IP check-back range

Domain: flop strategy / protected checks  
Tag: `GENERAL_CORE`  
Tier: CORE  
Confidence: high mechanism  
Suggested status: `DRILL_READY`

Do not automatically c-bet every hand with obvious barrel potential. Some low connected hands should check because they can improve, call turn overbets and protect the check-back branch. Bet more often with hands that otherwise face mandatory turn folds.

Cue:

`Which hands can survive heat after I check?`

Primary source: `SLC-M05-L44` recovered tail.

## H-R04-011 — No-equity turn barrels seed river bluff inventory

Domain: multi-street bluff construction  
Tag: `GENERAL_CORE`  
Tier: CORE  
Confidence: high mechanism  
Suggested status: `DRILL_READY`

If the turn range contains only obvious equity-driven bluffs, many completed-draw and blank rivers arrive with no credible bluff candidates. Selected low-equity barrels are required because they target current folds and preserve future no-blocker river bluffs.

Cue:

`If this river arrives, which turn hands can still bluff?`

Primary source: `SLC-M05-L44` recovered tail.

## H-R04-012 — Technical baselines should preserve live intuition

Domain: learning method / live execution  
Tag: `GENERAL_CORE / LEARNING_SYSTEM`  
Tier: SUPPORTING  
Confidence: high methodology  
Suggested status: `DRILL_READY`

The goal is neither ungrounded feel nor rigid solver imitation. Build a baseline, then incorporate opponent tendencies, mood, timing, image and history while keeping the deviation falsifiable.

Cue:

`What baseline am I deviating from, and what evidence justifies it?`

Primary source: `SLC-M05-L42`.

# Existing Candidates Strengthened

## H-W02-001 — Value threshold first, bluff volume second

`SLC-M02-L12` adds card-class-specific value thresholds and shows why one average turn frequency is misleading.

## H-W02-002 — Every turn bluff needs a job in the river tree

`SLC-M05-L44` directly shows that missing difficult turn barrels empties later bluff branches.

## H-W02-007 — Node-lock the sizing branch, not the personality label

`SLC-M03-L25`, `SLC-M03-L27` and `SLC-M06-L58` all distinguish global player labels from the exact branch error.

## H-W03-003 — A wide preflop range must compensate by checking more postflop

`SLC-M03-L25` gives direct source support and the double-exploit failure mode.

## H-W03-005 — Bluff supply must be seeded before the river

`SLC-M05-L44` adds a concrete front-door-draw-completing river example.

## H-W03-007 — Multiway defence is shared

`SLC-M04-L38` adds the stronger structural point that an uncapped player behind suppresses the bluff-raise branch.

## H-W03-011 — A blocker is useful only inside the range created by the line

`SLC-M05-L44` and `SLC-M06-L58` provide direct river examples of missed-draw and value-blocker ancestry.

# Consolidation Guidance

The central registry should not simply add twelve final rules. Likely consolidation:

- `H-R04-001` nests under the existing turn ownership and sizing algorithm;
- `H-R04-002`, `003` and `004` combine into one preflop-to-postflop compensation rule;
- `H-R04-005` becomes a branch modifier under opponent modelling;
- `H-R04-006` and `007` strengthen the multiway algorithm;
- `H-R04-008` belongs in the evidence-grade and opponent-profile system;
- `H-R04-009`, `010` and `011` strengthen range ancestry and bluff supply;
- `H-R04-012` belongs in the learning and field-execution layer rather than the table-rule count.

# Drill Impact

Add original drill families for:

1. low/middle/wet turn-class sizing;
2. preflop exploit compensation after a call;
3. high-weight-combo branch relocation;
4. thin-value versus overbluff swap;
5. multiway tiny-bet raise audit;
6. delayed turn lead after a suppressed flop raise;
7. tell confirmation and falsifier selection;
8. backward river-line reconstruction;
9. protected check-back construction;
10. future river bluff inventory.

# Source-State Delta

Closed:

- `SGL-0003`;
- `SGL-0005`;
- `SGL-0020`;
- `SGL-0032`;
- `SGL-0038`;
- `SGL-0046A`;
- `SGL-0046B`.

Still narrowly open:

- `SGL-0018` — original-video interval `24:47.75–25:12`.

# Verdict

`RERUN_CHECKPOINT_04_SYNTHESIS_DELTA_ACCEPTED`
