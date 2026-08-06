# Multiway Action-Order and Delayed-Aggression Drill Pack v0.1

Date: 2026-08-06  
Status: `ACTIVE_ORIGINAL_DIRECT_DRILLS / H-R04-007_ANSWER_KEY_ACTIVE`

## Purpose

Create direct original drills for:

- `H-W03-007` shared defence;
- `H-W03-008` multiway bluff support;
- `H-W03-009` fast-play when aggression will not arrive;
- `H-W03-010` nut ownership from preflop combos;
- `H-R04-007` delayed aggression after a suppressed flop action.

No source hand, board, solver grid or exact frequency is reproduced.

## Scoring dimensions

1. `ROLE` — opening, middle, closing, reopener or survivor;
2. `OWNERSHIP` — OPAL audit;
3. `PLAYER_BEHIND` — collision and raising rights;
4. `ACTION_FILTER` — what prior actions removed;
5. `HAND_JOB` — value, robust call, supported bluff, protection or reject;
6. `DELAYED_BRANCH` — which flop action was suppressed;
7. `CONFIDENCE` — calibrated to evidence.

A correct action with a heads-up reason is not mastery.

# Factory A — Action order and shared defence

## A1 — Middle top pair

```text
100bb, three-way single-raised pot
EP checks
BTN bets 25% on Q-8-4 rainbow
Hero BB holds Q9s
EP remains behind with an uncapped check range
```

Answer: `CALL OR FOLD BOUNDARY; DO NOT AUTO-RAISE`.

Required reason:

- Hero is sandwiched;
- EP can contain sets, strong Qx and check-raises;
- Q9 has limited backup equity;
- small size widens combined defence but does not grant Hero heads-up raise breadth.

Wrong reason: `Top pair is too strong to fold, so raise for protection.`

## A2 — Same hand, closing action

```text
Same board and size
EP checks, BB calls, Hero BTN holds Q9s and closes action against the bet source changed to CO
```

Question: should defence be wider or tighter than A1?

Answer: `WIDER`.

Reason:

- no unseen range remains behind for the current action;
- earlier call gives information;
- Hero still rebuilds the bettor/caller ranges and does not blindly raise.

## A3 — Strong draw in the middle

```text
120bb
HJ bets 40% on J-7-5 two-tone
Hero CO holds T9s with flush draw and open-ended potential
BTN cold caller remains behind
```

Answer: `CALL CORE / RAISE SELECTIVELY`.

Reason:

- hand has strong backup equity;
- BTN can still wake up with sets, two pair or stronger draws;
- collision suppresses the raise relative to heads-up;
- raise requires a defined value region and response plan.

## A4 — Closing strong draw

```text
Same ranges and board
HJ bets, CO calls, Hero BTN holds T9s with the same draw
```

Answer: `RAISE ELIGIBILITY INCREASES`.

Reason:

- Hero closes action;
- CO call filters toward medium strength/draws;
- strong draw plus removal can support a polar raise;
- exact frequency remains unneeded.

# Factory B — OPAL ownership and aggression permission

## B1 — Tight opener owns offsuit nuts

```text
Three-way pot: HJ raiser, SB caller, BB caller
Flop A-K-T rainbow
```

Question: who has the strongest claim to nut and premium density?

Answer: `HJ`.

Required OPAL reasoning:

- HJ retains full QJ offsuit density more often than capped callers;
- HJ owns AA/KK/TT/AK at high weight;
- blind callers have broader weak mass;
- SB remains sandwiched despite board interaction.

## B2 — Blind owns low board

```text
Three-way pot: CO raiser, BTN caller, BB defender
Flop 7-6-3 rainbow
```

Answer: `BB gains the strongest low-card/nut interaction; CO initiative alone does not authorise range betting.`

Required reason:

- BB has more 54, 76, 63, 77/66/33-type coverage;
- BTN position can create stabs after checks;
- CO must account for both ranges.

## B3 — Live overcall correction

```text
A loose SB is known to flat QJo and suited broadways instead of 3-betting.
Flop K-T-9 two-tone in a three-way pot.
```

Question: may Hero simply delete QJ from SB because a theoretical chart would?

Answer: `NO`.

Reason:

- observed preflop behaviour modifies combo ownership;
- theory is a prior, not a licence to remove live combos;
- action order still constrains SB as the middle actor.

## B4 — Initiative entitlement trap

```text
EP raises, CO and BB call
Flop 5-4-2 two-tone
EP holds AA
```

Answer: `STRONG HAND, BUT NO AUTOMATIC BET`.

Reason:

- BB/CO own more two pair, sets, straights and strong draws;
- EP faces two ranges;
- AA may bet, check-call or protect a checking range depending on size and action order;
- initiative does not settle ownership.

# Factory C — Multiway bluff support

## C1 — Pair plus draw

```text
Three-way pot
Flop T-6-3 two-tone
Hero closes action with 65s: pair plus flush draw
small merged bet and one call
```

Answer: `STRONG RAISE CANDIDATE / CALL ALSO VIABLE`.

Reason:

- immediate equity;
- improvement to trips/two pair/flush;
- protection against overcards;
- survives when only one opponent folds.

## C2 — Random air import

```text
Same node
Hero closes action with K2o, no backdoor flush and poor straight potential
```

Answer: `REJECT BLUFF RAISE`.

Reason:

- little equity;
- weak removal;
- no future job;
- clearing one player still leaves a strong range.

## C3 — Tiny-bet exploit candidate

```text
Four-way pot on A-A-6 rainbow
Hero has KQ with backdoor straight potential
all three opponents have repeatedly overfolded tiny bets and almost never raised
```

Answer: `CONDITIONAL TINY STAB`.

Required qualifiers:

- exploit depends on both overfold and under-raise;
- minimum effective price is preferred;
- backup high-card/backdoor equity makes KQ better than arbitrary air;
- confidence remains field-dependent.

## C4 — Call-call barrel selector

```text
Flop Q-9-4 two-tone
Hero bets, two players call
Turn 2 offsuit
Hero chooses between missed broadway air that blocks folds and a low pocket pair that blocks sets while unblocking high-card folds
```

Answer: `PREFER THE HAND THAT TARGETS THE FILTERED CALL-CALL RANGE`.

Reason:

- both calls removed much air;
- barrel selection is about surviving folds/continues, not visible draw status;
- a low pair can be a better removal bluff than obvious broadway air.

# Factory D — Field clear and delayed aggression

## D1 — Suppressed flop raise becomes turn lead

```text
100bb
Three-way pot: CO raiser, BTN caller, Hero BB
Flop Q-7-3 rainbow
CO checks, BTN bets 20%, Hero calls, CO folds
Turn 5 offsuit
Hero holds 76s
```

Answer: `TURN LEAD ELIGIBLE AS DELAYED RANGE EXPRESSION`.

Required reason:

- CO's uncapped range suppressed BB's flop check-raise;
- CO has now folded;
- Hero retains pair plus improvement/protection value;
- BTN's tiny stab contains high-card and thin-value mass;
- turn does not obviously repair BTN;
- lead is not justified merely because `5 helps BB`.

## D2 — No field clear

```text
Same flop action
CO calls instead of folding
Turn 5 offsuit
```

Answer: `DO NOT IMPORT D1 LEAD AUTOMATICALLY`.

Reason:

- the uncapped range remains;
- collision persists;
- delayed aggression gate is not open.

## D3 — Turn repairs the bettor

```text
CO folded after the flop call
Turn is A
Hero considers the same lead
```

Answer: `RECALCULATE; OFTEN REDUCE OR REMOVE THE LEAD`.

Reason:

- the turn may strengthen BTN's stab/call range;
- field clear alone is insufficient;
- ownership must be recomputed.

## D4 — Heads-up probe versus multiway delayed lead

```text
Spot 1: heads-up PFR checks back flop, BB leads turn.
Spot 2: three-way, IP stabs, BB calls, opener folds, BB leads turn.
```

Question: are these the same mechanism?

Answer: `RELATED BUT DISTINCT`.

Reason:

- heads-up probe follows a check-back cap;
- multiway delayed lead follows suppressed aggression plus field clear;
- both require action filtering and turn ownership, but their ancestry differs.

## D5 — Value moves forward

```text
Three-way pot
Hero has a set as the middle actor
closing player has shown repeated flop check-backs and almost no raises
```

Answer: `FAST-PLAY MORE VALUE`.

Reason:

- the planned future aggressor is absent;
- slow-play would be erroneous if no one builds the pot;
- exact magnitude requires field evidence.

## D6 — Preserve the trap

```text
Same hand and node
closing player is highly aggressive and attacks checks with wide stabs and raises
```

Answer: `PROTECTED CHECK/CALL OR CHECK-RAISE GAINS VALUE`.

Reason:

- credible future aggression exists;
- strong hand protects the passive branch;
- the adjustment is opponent-specific, not a universal slow-play rule.

## D7 — Reopener after bet-call

```text
Three-way pot
PFR checks
BTN bets small
BB calls
PFR holds vulnerable two pair
```

Answer: `LINEAR VALUE/PROTECTION CHECK-RAISE ELIGIBLE`.

Reason:

- PFR now sees BTN's wide bet and BB's capped call;
- two pair benefits from denial and pot growth;
- bluff volume must follow the value region;
- this reopener branch is not available to the sandwiched BB in the same way.

## D8 — Delayed bluff without support

```text
Field clears on flop
turn is neutral
Hero has total air that blocks the opponent's likely folds and has no river plan
```

Answer: `CHECK / REJECT DELAYED BLUFF`.

Reason:

- delayed aggression is not permission to attack every neutral turn;
- candidate fails removal, equity and future-job tests.

# Changed-variant protocol

After every correct answer, change one variable only:

- middle ↔ closing action;
- capped ↔ uncapped player behind;
- tiny ↔ large bet;
- passive ↔ aggressive closing player;
- field clears ↔ player remains;
- neutral turn ↔ range-restoring turn;
- robust hand ↔ fragile one-pair hand;
- three-way ↔ four-way;
- equal stacks ↔ short side stack.

Learner must name the exact gate that changed.

# Mastery gate

Provisional mastery requires:

- correct role on `8/10` changed variants;
- correct action and reason on `8/10`;
- no heads-up MDF language in sandwiched spots;
- no initiative-only ownership claim;
- no random-air multiway bluff;
- correct distinction between probe and delayed multiway lead;
- correct fast-play/protect switch across opponent profiles;
- confidence within one grade of performance.

## Coverage effect

```text
H-R04-007: DIRECT ANSWER KEY ACTIVE
Direct candidate drill coverage: 33/34
Remaining answer-key gap: H-W01-006
```

## Verdict

`MULTIWAY_ACTION_ORDER_DRILL_PACK_ACTIVE`

`H_R04_007_DIRECT_GAP_CLOSED`

`EXACT_SOLVER_FREQUENCIES_NOT_REQUIRED_FOR_DIRECTIONAL_MASTERY`
