# Cash Injection — Pool Hypotheses v0.1

Status: `ACTIVE_HYPOTHESIS_REGISTER / NOT_FIELD_VALIDATED`

## Purpose

Store population-sensitive claims from Cash Injection without promoting them into the general Playbook or treating one author's node lock as proof of the target live environment.

# `CI-PH-001` — Small flop range-bet overfold / under-three-bet

## Claim

After using a small, range-wide flop c-bet, many regulars defend too narrowly against a small check-raise and do not use enough flop three-bets.

## Source evidence

- source: `CINJ-E01`;
- evidence class: instructor claim plus solver baseline and instructor-created node lock;
- direct external dataset in supplied source: none;
- live $1/$3 or $2/$5 evidence: none.

## Candidate trigger

The hypothesis is relevant only when most of the following are true:

- heads-up single-raised pot;
- Hero is defending from the big blind or comparable OOP range;
- in-position aggressor uses a small flop bet;
- the bet appears range-wide rather than selective and polar;
- board is one where the defender has legitimate raise candidates;
- opponent's starting range contains enough weak material;
- effective depth permits a non-all-in small raise.

## Exploit direction if evidenced

- increase check-raise frequency;
- prefer a relatively small raise when the opponent is inelastic;
- expand backdoor and low-showdown bluffs that unblock folds;
- raise more vulnerable middle-strength hands for value/protection;
- preserve stronger low-urgency hands in call when extra folds reduce value;
- continue to plan later streets rather than treating the flop raise as terminal.

## Required evidence grades

### Grade 0 — Unknown

No relevant observations.

Action:

- use baseline;
- observe without assuming.

### Grade 1 — Suggestive

One or two folds to small raises, or visible discomfort, without enough range information.

Action:

- no extreme frequency change;
- choose robust raise candidates first.

### Grade 2 — Branch evidence

Repeated small range bets followed by folds of weak pairs, ace-highs or backdoors; no observed flop three-bets.

Action:

- expand the raise branch moderately;
- retain clear hand-class discipline.

### Grade 3 — Strong branch evidence

Multiple relevant spots show inelastic defence, overfolding across hand classes and absent or severely underused three-bets.

Action:

- larger exploit expansion is permitted;
- continue monitoring for adaptation.

## Falsifiers

Reduce or remove the exploit when:

- the player c-bets selectively rather than range-wide;
- the player continues weak pairs, ace-highs and backdoors appropriately;
- the player uses frequent flop three-bets;
- the starting range is much tighter than assumed;
- the board gives the bettor a concentrated nut advantage;
- raise sizing or stack depth changes the required defence materially;
- the opponent adapts after seeing repeated raises.

## Context splits

- late-position wide range: hypothesis potentially stronger;
- early-position tight range: narrower exploit scope;
- online pool claim: cannot be imported directly into Batumi live cash;
- live pool: evidence should be collected by branch and player, not through one global pool label.

## Misuse risks

- raising every small c-bet automatically;
- confusing one-third-pot size with proof of a pure range bet;
- using the exploit on boards where Hero lacks raise support;
- overbluffing without future-street jobs;
- applying online node-lock magnitude to a live player without observations;
- turning a conditional small raise into a fixed 3x rule.

## Observation mission

During a session record only relevant nodes:

```yaml
villain_id_or_profile:
position_pair:
effective_stack:
board_family:
flop_bet_size:
range_wide_or_selective_estimate:
hero_raise_size:
villain_response:
showdown_information:
possible_falsifier:
confidence_after_hand:
```

## Status

`CI-PH-001 = FIELD_EVIDENCE_PENDING`
