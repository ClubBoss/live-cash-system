# Synthesis Wave 03 — 3-Bet Pots and Multiway Decision Candidates

Status: `CANDIDATE_LAYER_COMPLETE`

Purpose: compress recovered Smash Live Cash mechanisms for 3-bet pots and multiway pots into general live-cash decision candidates without inventing exact combo charts, frequencies, sizes or solver outputs.

## Admission discipline

- `SOURCE-SUPPORTED` means the mechanism is explicit in a recovered source record.
- `SYSTEM INFERENCE` means a practical compression across several source-supported mechanisms; it is not represented as instructor wording.
- Exact combo boundaries, frequency mixes, suits and solver sizes remain blocked where sources are marked `NEEDS_VISUAL_REVIEW`.
- Lessons with open reruns contribute only through their recovered intervals.
- No candidate becomes `ADMITTED` until cross-checked against Carrot Poker / From the Ground Up and converted into a tested drill.

## Source base used in this wave

| Source ID | Relevant mechanism | Current reliability |
|---|---|---|
| `SLC-M03-L24` | Value-heavy blind 3-bet range; dominated broadways lose value; low suited hands retain playability | Complete audio; exact charts visual-dependent |
| `SLC-M03-L26` | Over-wide preflop range followed by insufficient flop compensation | Complete audio; exact board/frequencies visual-dependent |
| `SLC-M03-L28` | Tight overpair-heavy c-bet branch versus weak check-back branch | Complete audio; exact solve visual-dependent |
| `SLC-M03-L29` | Bluff supply must enter preflop and bet flop to support later streets | Complete audio; exact runout mixes visual-dependent |
| `SLC-M03-L30` | Bluff-deficient opponent allows large later-street folds | Complete audio; exact node locks visual-dependent |
| `SLC-M03-L35` | Small c-bets can create harder defence than large bets; deep does not automatically mean large sizing | Complete audio; exact board/frequencies visual-dependent |
| `SLC-M04-L36` | Shared defence, sandwich constraint, closing-action advantage | Complete audio; exact ranges visual-dependent |
| `SLC-M04-L37` | Population under-check-raising reduces slow-play value; blocker must survive line history | Complete audio; exact hand/runout visual-dependent |
| `SLC-M04-L39` | Nut ownership on low connected boards; optional leads; population-dependent aggression | Complete audio; exact lead mixes visual-dependent |
| `SLC-M04-L40` | Offsuit nut ownership, preflop omissions and sandwich identity determine multiway aggression | Complete audio; exact weights visual-dependent |
| `SLC-M04-L41` | Fast-play value when closing player under-raises; barrels selected against call-call range | Complete audio; exact sizes visual-dependent |

# Candidate heuristics

## H-W03-001 — A 3-bet-pot range begins preflop and keeps its shape postflop

**Tag:** `GENERAL_CORE`  
**Status:** `SOURCE-SUPPORTED / PROVISIONAL`  
**Confidence:** high

### Trigger

Before defending or attacking a 3-bet pot.

### Default

Reconstruct the aggressor's preflop range before using a generic postflop label.

Ask:

1. Which low suited connectors and one-gappers actually entered the 3-bet range?
2. Which pocket pairs were 3-bet rather than called?
3. How much offsuit high-card value is present?
4. Did the player arrive with a polar range, a linear range or a value-heavy truncated range?

Carry that structure through the flop, turn and river.

### Why

`SLC-M03-L24`, `L29` and `L30` show that missing low suited bluffs preflop changes the entire future bluff supply. `SLC-M03-L28` shows how an undiversified range creates branch-specific weaknesses.

### Main exception

A player can deviate again postflop. Preflop shape is the starting prior, not a guarantee that every branch is played consistently.

### Table cue

`Which bluff families entered this pot before the flop?`

### Drill

For ten opponent 3-bet profiles, list:

- value concentration;
- low suited bluff supply;
- pocket-pair coverage;
- expected postflop vulnerability.

---

## H-W03-002 — Against a value-heavy 3-bet, dominated big cards lose first

**Tag:** `GENERAL_CORE / ENVIRONMENT_SENSITIVE`  
**Status:** `SOURCE-SUPPORTED / PROVISIONAL`  
**Confidence:** high on direction

### Trigger

Facing a blind or positional 3-bet from a player believed to have too few bluffs.

### Default

Tighten primarily by removing dominated Ax, KQ/AQ-type high-card continues and marginal suited broadways before automatically removing all pocket pairs and the best low suited connectors.

The principle is not that low suited hands are always calls. It is that domination damages the high-card region more severely when Villain's range is concentrated in premium cards.

### Why

`SLC-M03-L24` explicitly shows dominated broadways and many Ax losing substantial value against a value-heavy range, while pocket pairs and selected low suited connectors retain relatively more value.

### Main exception

Rake, stack depth, sizing and position can make speculative calls unprofitable. Exact hand boundaries remain blocked by visual chart review and the `Preflop 101` rerun.

### Table cue

`Am I calling because the hand looks strong, or because it performs against this range?`

### Drill

Rank four hand families against three opponent 3-bet profiles:

- dominated offsuit broadways;
- suited broadways;
- pocket pairs;
- low suited connectors.

Explain the change through domination and implied-odds structure.

---

## H-W03-003 — A wide preflop range must compensate by checking more postflop

**Tag:** `GENERAL_CORE`  
**Status:** `SOURCE-SUPPORTED / PROVISIONAL`  
**Confidence:** high

### Trigger

Opponent 3-bets too wide and then c-bets in a familiar or automatic manner.

### Default

Continue wider than against a well-constructed or value-heavy range because the opponent reaches the flop with too much weak material.

Expect one of two common failures:

1. excessive flop betting followed by turn give-up;
2. excessive flop betting followed by continued over-bluffing.

Do not assume which failure occurs without evidence; defend the flop more robustly and update on the turn.

### Why

`SLC-M03-L26` shows that players with over-wide preflop ranges often fail to make the compensating high-frequency flop checks required by their weak range.

### Main exception

A technically strong player may widen preflop and compensate correctly. The exploit is directed at the combination of wide entry plus normal/over-aggressive postflop execution.

### Table cue

`Did this range actually earn the right to bet this often?`

### Drill

Given wide, baseline and value-heavy preflop ranges, predict:

- required flop check frequency direction;
- Hero continuation direction;
- likely turn branch to observe.

---

## H-W03-004 — Split the opponent by branch: respect the bet, attack the check

**Tag:** `GENERAL_CORE`  
**Status:** `SOURCE-SUPPORTED / PROVISIONAL`  
**Confidence:** high

### Trigger

Tight or medium-strength 3-bettor on a low/dynamic flop who tends to bet overpairs and check high cards.

### Default

- Versus the flop c-bet branch: defend tightly because the range is overpair-heavy and bluff-poor.
- After check-back: attack suitable turns because the remaining range contains too many unpaired high cards and too little protected overpair value.

Do not average these branches into one vague `tight player` strategy.

### Why

`SLC-M03-L28` explicitly demonstrates a strong flop-bet branch and weak check-back branch created by overplaying overpairs.

### Main exception

If the player also slowplays overpairs or traps frequently, the check-back branch is less capped. This requires showdown or action evidence.

### Table cue

`Which strong hands did this player spend on the flop?`

### Drill

Show one opponent profile across two branches:

- flop bet;
- flop check-back.

Learner must choose opposite adjustment directions and explain the range split.

---

## H-W03-005 — Bluff supply must be seeded before the river

**Tag:** `GENERAL_CORE`  
**Status:** `SOURCE-SUPPORTED / PROVISIONAL`  
**Confidence:** high

### Trigger

Constructing a multi-street barrel or deciding whether to bluff-catch a later street.

### Default

Before assigning river bluffs, verify which hands:

1. entered preflop;
2. bet the flop;
3. continued the turn;
4. still have low showdown value at the river.

A theoretically attractive blocker is irrelevant if the underlying bluff family never entered the branch.

### Why

`SLC-M03-L29` shows low suited connectors and apparently irrelevant low hands supplying future bluffs. `SLC-M03-L30` shows that removing those hands permits much tighter turn and river defence.

### Main exception

Some players manufacture unnatural bluffs from medium-strength hands. This is a separate over-bluff hypothesis and must be supported by evidence.

### Table cue

`Name the actual bluffs that survived all previous actions.`

### Drill

For five river nodes, trace each proposed bluff backward through preflop, flop and turn. Reject candidates that could not realistically reach the node.

---

## H-W03-006 — Small bets can be harder to defend than large bets

**Tag:** `GENERAL_CORE / ENVIRONMENT_SENSITIVE`  
**Status:** `SOURCE-SUPPORTED / PROVISIONAL`  
**Confidence:** high on mechanism

### Trigger

Choosing a c-bet size on a low-equity or polar board against a population that under-defends small bets.

### Default

Recognize that a large bet often guides the defender toward obvious strong continues, while a small bet may require uncomfortable calls and linear raises with high cards, medium pairs and backdoors.

When those responses are missing, a small bet can outperform despite deep stacks or a theoretically polar baseline.

### Why

`SLC-M03-L35` explicitly states that large bets can simplify defence and that excessive small c-betting should be met by wider calls and linear check-raises—responses many live players fail to find.

### Main exception

Do not range-bet small against players who identify and punish it through wide calls and raises. Deep stacks also increase the cost of using a transparent unprotected size.

### Table cue

`Which size creates the harder human defence, not merely the scarier pot?`

### Drill

For ten boards, compare the defender's required response versus:

- small/wide bet;
- large/polar bet.

Identify which hand classes become difficult continues.

---

## H-W03-007 — Multiway defence is shared

**Tag:** `GENERAL_CORE`  
**Status:** `SOURCE-SUPPORTED / PROVISIONAL`  
**Confidence:** high

### Trigger

Facing a bet with one or more players still active behind or beside Hero.

### Default

Do not defend as though Hero alone must prevent the bettor from profiting.

Tighten calls and raises when:

- a strong range remains behind;
- Hero is sandwiched;
- later players can overcall or raise;
- Hero lacks backup equity or nutted improvement paths.

The player closing action can defend more freely because no unseen range remains behind.

### Why

`SLC-M04-L36` identifies shared defence and sandwich pressure as central multiway mechanics. `SLC-M04-L40` distinguishes the constrained SB from the closing-action BB.

### Main exception

If players behind are extremely capped, weak or nearly certain to fold, the practical burden shifts closer to heads-up. That is an environment-specific adjustment.

### Table cue

`Who still has permission to wake up behind me?`

### Drill

Present identical hand/board/bet spots in three positions:

- heads-up;
- sandwiched multiway;
- closing action multiway.

Learner ranks defence width and explains why.

---

## H-W03-008 — Multiway bluffs need backup equity and removal

**Tag:** `GENERAL_CORE`  
**Status:** `SOURCE-SUPPORTED / PROVISIONAL`  
**Confidence:** high

### Trigger

Considering a multiway stab, check-raise or barrel.

### Default

Prefer hands with at least two of:

- immediate equity;
- nutted improvement path;
- blocker to strong continues;
- ability to unblock folds;
- credible continuation across later streets.

Random low-equity `savage air` that can be necessary heads-up is usually unnecessary multiway because more ranges must be cleared.

### Why

`SLC-M04-L36` explicitly tightens multiway bluffs toward equity plus removal. `SLC-M04-L41` selects later barrels against the actual call-call range.

### Main exception

A tiny bet against multiple extremely price-insensitive folders may create a special exploit. The central `SLC-M04-L38` material remains rerun-blocked, so this exception is not yet admitted.

### Table cue

`What happens when the first player folds but the second continues?`

### Drill

Sort 20 multiway bluff candidates into:

- strong candidate;
- marginal candidate;
- heads-up only;
- reject.

Require explicit backup equity and blocker reasoning.

---

## H-W03-009 — Fast-play value when the expected aggression will not arrive

**Tag:** `GENERAL_CORE / POOL_HYPOTHESIS`  
**Status:** `SOURCE-SUPPORTED / PROVISIONAL`  
**Confidence:** high on direction

### Trigger

A solver slowplay relies on a player behind check-raising, stabbing or barreling at meaningful frequency, but the actual table is passive.

### Default

Move more strong value into direct bets and raises. Do not wait for a check-raise, delayed stab or multiway barrel that the population rarely supplies.

### Why

`SLC-M04-L37`, `L39` and `L41` repeatedly show that population under-aggression reduces the EV of equilibrium slowplays.

### Main exception

Against highly aggressive or squeeze-prone opponents, protected traps regain value. This must be profile-specific rather than a permanent fast-play rule.

### Table cue

`Who is supposed to put the next bet in—and will they actually do it?`

### Drill

For eight strong hands, compare strategy versus:

- passive closing player;
- balanced aggressor;
- over-aggressive player.

State which future action the slowplay depends on.

---

## H-W03-010 — Multiway nut ownership depends on preflop combo ownership

**Tag:** `GENERAL_CORE`  
**Status:** `SOURCE-SUPPORTED / PROVISIONAL`  
**Confidence:** high

### Trigger

Before assigning the multiway flop aggressor.

### Default

Compare:

1. who owns the relevant offsuit nut combinations;
2. which premium hands were removed by 3-bets or squeezes;
3. which player has the widest low-card coverage;
4. who is sandwiched;
5. who closes action.

Preflop initiative alone does not determine aggression. On some low boards the blind owns the nuts; on high connected boards a tight opener may retain unique offsuit nut density.

### Why

`SLC-M04-L39` gives BB the structural advantage on 6-5-4. `SLC-M04-L40` gives HJ strong aggression on K-T-9 because HJ retains unique offsuit QJ and premium density.

### Main exception

Loose live cold calls may retain hands that theory removes. Adjust combo ownership using observed preflop behaviour rather than blindly importing a chart.

### Table cue

`Who owns the offsuit nuts, and who is trapped between ranges?`

### Drill

For ten multiway flops, identify:

- nut owner;
- range owner;
- sandwich player;
- closing player;
- likely first aggressor.

---

## H-W03-011 — A blocker is only useful inside the range created by the line

**Tag:** `GENERAL_CORE`  
**Status:** `SOURCE-SUPPORTED / PROVISIONAL`  
**Confidence:** high

### Trigger

Considering a late-street bluff because Hero holds a visible blocker.

### Default

Evaluate the blocker against:

- the value hands that actually reached the node;
- the bluffs removed by the same card;
- the preceding passive or aggressive actions;
- multiway range contraction;
- the opponent's actual call range.

Do not bluff merely because a card blocks the nuts in the abstract.

### Why

`SLC-M04-L37` shows a river blocker temptation that did not survive the actual multiway line. `SLC-M04-L41` selects barrels by removal against the call-call range.

### Main exception

An opponent may overfold mechanically to a credible nut blocker. This remains a pool hypothesis and still requires a coherent line.

### Table cue

`What value does this card remove—and what bluffs does it also remove?`

### Drill

For twelve river hands, score each blocker as:

- improves bluff;
- neutral;
- dirty blocker;
- blocks too many folds/bluffs.

Require reconstruction of the prior line.

# Compact 3-bet-pot decision algorithm — v0.1

**Status:** `SYSTEM INFERENCE / PROVISIONAL`

1. Effective stack and positions.
2. Preflop range shape: polar, linear, value-heavy or over-wide.
3. Bluff supply: low suited hands, pairs and broadways actually present.
4. Flop branch: wide bet, polar bet, protected check or weak check.
5. Compensation test: did the player adjust postflop to the preflop deviation?
6. Hero response: dominated-region removal, wider continue, tight defence or branch attack.
7. Future bluff trace: which hands can reach turn and river as bluffs?
8. Size sensitivity: which size creates the harder defence?

Table compression:

`PREFLOP SHAPE → BLUFF SUPPLY → FLOP BRANCH → COMPENSATION → FUTURE BLUFFS`

# Compact multiway decision algorithm — v0.1

**Status:** `SYSTEM INFERENCE / PROVISIONAL`

1. Number of players and pairwise effective stacks.
2. Nut-combo ownership by range.
3. Identify sandwich and closing-action players.
4. Assign shared-defence burden.
5. Predict missing population aggression.
6. Choose action family: check, small leverage bet, direct value, equity/removal bluff or protected call.
7. Verify backup equity and collision risk.
8. Rebuild the range after each call before barreling.

Table compression:

`NUT OWNER → SANDWICH → SHARED DEFENCE → EXPECTED AGGRESSION → BACKUP EQUITY`

# Drill prototypes

## D-W03-A — 3-Bet range-shape diagnosis

Given a preflop history and limited showdown evidence, classify Villain as:

- baseline polar;
- value-heavy truncated;
- over-wide;
- linear;
- unknown.

State one preflop and one postflop consequence.

## D-W03-B — Bluff-supply audit

At a river node, list every plausible bluff family and trace it backward. No call decision is allowed until the trace is complete.

## D-W03-C — Branch split

Use one tight player's flop bet and flop check-back branches. Learner must produce different turn plans and name which overpairs/high cards each branch contains.

## D-W03-D — Sandwich rotation

Rotate Hero among opener, middle caller and closing blind on the same multiway board. Require defence-width and aggression changes.

## D-W03-E — Slowplay dependency

For each value hand, name the future opponent action required to justify checking. Then remove that action from the population model and rebuild the line.

## D-W03-F — Blocker audit

Evaluate blockers only after listing the opponent's value, bluff and fold regions generated by the full line.

# Open requirements and blocked claims

1. `SLC-M03-L25` rerun is required before fully integrating Part 2 of the locked 3-bet-range series.
2. `SLC-M03-L27` rerun is required before admitting the missing OOP c-bet exploit demonstration.
3. `SLC-M04-L38` rerun is required before admitting exact small-bet price-inelasticity mechanisms multiway.
4. `SLC-M06-L58` remains blocked and is not used in this wave.
5. Exact preflop hand boundaries remain blocked by the `SLC-M01-L01` rerun and visual chart review.
6. Multiway small-bet frequencies and exact lead/check-raise boundaries remain visual-dependent.
7. Population passivity and under-defence must be represented as hypotheses until measured in an environment profile.

## Wave verdict

`SYNTHESIS_WAVE_03_CANDIDATE_LAYER_COMPLETE`
