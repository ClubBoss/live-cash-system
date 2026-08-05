# Cash Injection Episode 01 — Original Delta Drills v0.1

Status: `MANUAL_TEST_READY / POOL_HYPOTHESIS_GUARDED`

Purpose: train the mechanism from `CINJ-E01` without reproducing the source hands, charts or exact solver frequencies.

## Drill CI1 — Trigger before exploit

Single-raised pot, 100bb effective. BTN bets one-third pot on a low dry flop against BB. You have no prior observations on BTN.

Question:

Should BB immediately use an extreme check-raise frequency because small bets are often range bets?

### Answer key

No.

First classify:

- is the bet plausibly range-wide or selective;
- what range each player brought to the flop;
- whether the board supports an active BB raise branch;
- whether there is evidence of overfolding or under-three-betting.

Use baseline with robust candidates until branch evidence exists.

Mapped modules: `LCM-04`, `LCM-05`, `LCM-10`.

Mapped misconceptions: global player label, unjustified exploit certainty, size-only inference.

---

## Drill CI2 — Raise-size elasticity

BTN bets 33% pot. BB is choosing between a conventional large check-raise and a smaller check-raise. Assume BTN folds the same hands to both sizes instead of defending wider versus the smaller raise.

Question:

Which raise may gain more exploit EV, and why?

### Answer key

The smaller raise can gain more exploit EV because:

- it risks less;
- it gives BTN a better price;
- therefore BTN should defend wider;
- if BTN fails to adjust, the same folds represent a larger elasticity error.

This does not make the smaller raise universally best. Board, depth, value region and future pot geometry still matter.

Mapped candidates: `H-W03-006`, `H-W02-004`.

---

## Drill CI3 — Same error, different hand effects

Villain overfolds versus flop check-raises.

Compare:

- Hand A: vulnerable middle pair that benefits strongly when overcards fold;
- Hand B: strong top pair that dominates many worse hands and needs little protection.

Question:

Must both hands increase their raising frequency equally?

### Answer key

No.

Hand A may gain substantial raise EV through protection, denial and thin value. Hand B may prefer calling because extra fold equity removes worse hands that could continue or bluff later.

A range-level exploit has hand-specific winners and losers.

Mapped candidates: `H-W02-004`, `H-W02-005`.

---

## Drill CI4 — Position narrows magnitude

Two players use the same one-third-pot flop size:

- Player A opened BTN with a wide range;
- Player B opened UTG with a much tighter range.

Both are suspected of overfolding versus small raises.

Question:

Should BB apply the same expansion against both?

### Answer key

No.

The BTN range contains more weak material and generally offers more surplus fold equity. UTG starts stronger, so the exploit should be narrower even when the response error exists.

Mapped modules: `LCM-02`, `LCM-04`, `LCM-05`, `LCM-10`.

---

## Drill CI5 — Falsifier

You have raised a player's small flop bets three times. The player has now:

- called with weak pairs and ace-high;
- used one flop three-bet;
- reduced small c-bet frequency on similar boards.

Question:

What should happen to exploit confidence?

### Answer key

It should fall.

These observations falsify the assumption of persistent overfolding and absent aggression. Return toward baseline and reassess the new betting branch.

Mapped module: `LCM-10`.

---

## Timed table cue

Within five seconds answer:

```text
Small and wide?
What must defend?
What evidence says they do not?
Which of my hands actually benefits?
```

## Field observation mission

Do not attempt to prove the exploit by raising randomly.

For one session, observe:

- who uses one-third-pot bets frequently;
- which positions and board families;
- whether weak pairs and ace-highs continue;
- whether flop three-bets exist;
- whether defence changes after repeated pressure.

## Drill-pack verdict

`CINJ_E01_DELTA_DRILLS_READY`

`EXTREME_EXPLOIT_FREQUENCY_NOT_AUTHORISED_WITHOUT_EVIDENCE`
