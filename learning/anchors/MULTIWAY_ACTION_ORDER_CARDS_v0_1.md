# Multiway Action-Order Cards v0.1

Date: 2026-08-06  
Status: `ACTIVE_DIRECTIONAL_MEMORY_SYSTEM`

## Use rule

Do not memorise isolated three-way charts. Retrieve five cards in order.

```text
M1 ROLE
-> M2 OWNERSHIP
-> M3 SHARED DEFENCE
-> M4 BLUFF SUPPORT
-> M5 FIELD CLEAR
```

## M1 — Role before hand strength

Ask:

`Am I opening actor, middle, closing, reopener or survivor after field clear?`

### Middle / sandwich

- highest collision risk;
- player behind can call or raise;
- tighten fragile calls and bluff raises;
- require backup equity and nutted paths.

### Closing action

- sees all prior actions;
- no unseen active range behind;
- can call and raise more freely;
- still respects filtered ranges and bet shape.

### Reopener

After bet-call, rebuild both ranges and use value/protection-led aggression.

Cue:

`Who still has permission to wake up?`

## M2 — OPAL ownership audit

```text
O — offsuit nuts
P — premiums retained/removed
A — action order
L — low-card/suited coverage
```

Do not award ownership to the preflop raiser automatically.

Common outcomes:

- low connected board: blind low-card coverage rises;
- high connected board: tight opener may own unique offsuit nuts and premiums;
- loose live caller may restore theoretical omissions, but only with evidence.

Cue:

`Who owns the common nuts, not merely the rare suited edge?`

## M3 — Shared defence and response shape

No individual player owes a heads-up MDF.

Directional width:

```text
closing action
> middle with capped player behind
> middle with uncapped player behind
```

Before calling or raising:

1. can the player behind be nutted?
2. can they raise?
3. does Hero survive later action?
4. does Hero's hand improve nuttedly?
5. what does bet size say about range shape?

Small/merged bet:

- wider combined defence;
- more calls;
- thinner raises may exist;
- player-behind risk can still suppress raises.

Large/polar bet:

- more folds;
- fewer merged raises;
- stronger robust calls and selective raises.

## M4 — Multiway bluff support

Preferred candidate has several of:

- immediate equity;
- nutted improvement;
- blocker to strong continues;
- unblocks folds;
- future-street job;
- survives when only one opponent folds.

Strong families:

- pair plus draw;
- strong draw plus removal;
- gutter/overcards with useful blockers;
- later low-card or pair removal versus a filtered call-call range.

Reject:

- random heads-up air;
- bluff that only clears the first player;
- hand that blocks folds;
- hand with no plan when raised or called twice.

Cue:

`What happens if the first player folds and the second continues?`

## M5 — Field clear and delayed aggression

When one player folds, do not switch to a generic heads-up chart.

Rebuild:

```text
WHO FOLDED
+ WHO BET/CALLED
+ WHAT WAS SUPPRESSED
+ TURN CARD EFFECT
+ NEW VALUE REGION
+ NEW BLUFF SUPPORT
```

Delayed lead/raise is valid when:

- a player behind suppressed the flop action;
- that player is gone or cannot raise;
- Hero still owns value for the action;
- bluffs target the filtered survivor range;
- the turn does not repair Villain;
- size matches the new range shape.

Fast-play value when the expected aggressor will not supply the bet. Protect checks when credible future aggression exists and the hand is robust.

Cue:

`Which flop action was blocked, and is it truly available now?`

## One-breath table script

```text
Role?
OPAL owner?
Who remains behind?
What does size represent?
Does my hand survive collision?
Who cleared?
What aggression was suppressed?
Lead, raise, call, protect or fold?
```

## Boundary

These cards are directional. They do not contain exact three-way frequencies, MDFs, lead percentages or universal population adjustments.

## Verdict

`FIVE_MULTIWAY_MEMORY_CARDS_ACTIVE`

`ACTION_ORDER_PRECEDES_HAND_LABEL`

`FIELD_CLEAR_REQUIRES_NODE_REBUILD`
