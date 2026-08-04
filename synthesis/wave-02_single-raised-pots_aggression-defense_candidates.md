# Synthesis Wave 02 — Single-Raised Pots: Aggression, Leads and Bluff-Catch Defence

Status: `CANDIDATE_LAYER_STARTED`

Purpose: compress recovered Smash Live Cash single-raised-pot mechanisms into Batumi-oriented decision candidates without inventing exact combo charts, frequencies or solver sizes.

## Admission discipline

- `SOURCE-SUPPORTED` means the mechanism is explicitly present in a recovered source record.
- `SYSTEM INFERENCE` means a practical table compression derived from several source-supported mechanisms; it is not represented as instructor wording.
- Exact hand boundaries, frequencies and size mixes remain blocked when a lesson is marked `NEEDS_VISUAL_REVIEW`.
- Claims touching a missing rerun interval are capped at the last recovered source-supported point.
- No candidate becomes `ADMITTED` until cross-checked against Carrot Poker / From the Ground Up and converted into a tested drill.

## Source base used in this wave

| Source ID | Relevant mechanism | Current reliability |
|---|---|---|
| `SLC-M02-L09` | Value-first turn construction; three bluff categories | Audio verified |
| `SLC-M02-L10` | Deep paired-turn overbets and river-aware bluff selection | Complete audio; exact combos visual-dependent |
| `SLC-M02-L12` | Neutral-turn overbets versus range-changing turns | Core recovered; two rerun intervals open |
| `SLC-M02-L13` | Flop overbet board families and study-tree sizing | Complete audio; exact rankings visual-dependent |
| `SLC-M02-L17` | Top-pair check-raises, sizing sensitivity and monotone exception | Complete audio; exact frequencies visual-dependent |
| `SLC-M02-L18` | Two turn-lead families derived from flop c-bet composition | Core recovered; one local rerun interval open |
| `SLC-M02-L19` | Node-locking a too-polar large c-bet and rebuilding turn leads | Complete audio; exact lock weights visual-dependent |
| `SLC-M02-L20` | Bluff-catchers versus over-bluffed oversized river nodes | Complete audio; exact action sizes visual-dependent |
| `SLC-M02-L23` | Replace player labels with explicit bet/check range models | Complete audio; exact lock weights visual-dependent |

# Candidate heuristics

## H-W02-001 — Value threshold first, bluff volume second

**Status:** `SOURCE-SUPPORTED / PROVISIONAL`  
**Confidence:** high

### Trigger

Before choosing a turn barrel size or constructing a multi-street bluff range.

### Default

1. Identify the weakest hand that can value-bet for the intended size.
2. Count how much value the range actually contains.
3. Add only enough bluffs to support that value and size.

Do not start from `I need to bluff this hand` and then search for a story.

### Why

`SLC-M02-L09` explicitly starts with value threshold and adds bluff volume afterward. `SLC-M02-L10` shows that at 200bb the one-pair value threshold is selective, so low-equity barrel volume must also be selective.

### Main exception

Against a documented extreme over-folder, exploitative bluff volume can exceed equilibrium. Candidate selection still matters; random air does not become good merely because the pool folds too much.

### Table cue

`What is my weakest value hand for this size?`

### Drill

For ten turn nodes, state:

- intended value region;
- intended size;
- whether the node has enough value to support a large bluff range.

No combo frequencies required.

---

## H-W02-002 — Every turn bluff needs a job in the river tree

**Status:** `SOURCE-SUPPORTED / PROVISIONAL`  
**Confidence:** high

### Trigger

Considering a turn barrel with a non-value hand.

### Default

Classify the candidate into one of three jobs:

1. **Equity-driven:** improves to strong value on natural rivers.
2. **Blocker/matcher-driven:** blocks the opponent's strongest calls or carries useful future suit/straight interaction.
3. **Savage air:** very low showdown value, unblocks folds and supplies bluffs on river classes where natural draws run out.

Reject hands that have no clear job and merely `look weak enough to bluff`.

### Why

`SLC-M02-L09` teaches the three-category framework. `SLC-M02-L10` shows why the chosen turn range must already contain the river bluffs needed on brick and suit-completing runouts.

### Main exception

A strong exploit read can change how often a valid candidate is used, but not its underlying structural job.

### Table cue

`Which rivers does this hand cover?`

### Drill

Give twelve turn hands and assign each to:

- equity;
- blocker/matcher;
- savage air;
- no valid barrel job.

Then name one value river and one bluff river for every accepted hand.

---

## H-W02-003 — Overbet only when the value shape and turn card preserve polarization

**Status:** `SOURCE-SUPPORTED / PROVISIONAL`  
**Confidence:** medium-high

### Trigger

Considering a flop or turn overbet in position.

### Default

Use a large size when:

- the range retains a meaningful nut or high-equity advantage;
- the opponent is capped or contains many medium-strength forced continues;
- the new card does not materially improve the opponent's draw-heavy range;
- the value threshold remains strong enough to support polarization.

Neutral low bricks after a polar flop line can be better overbet cards than visually dramatic high cards.

### Why

`SLC-M02-L13` identifies selected high-card and low-dry board families for flop overbets. The recovered core of `SLC-M02-L12` distinguishes low neutral turns from flush-, straight- and middling cards that change range ownership. `SLC-M02-L10` shows a paired low turn supporting a polar overbet tree at 200bb.

### Main exception

The final section of `SLC-M02-L12` remains incomplete. Exact card-by-card boundaries are blocked pending rerun and visual review.

### Table cue

`Did this turn preserve my polar advantage, or did it repair Villain's range?`

### Drill

For fifteen turn cards after the same flop action, classify:

- overbet candidate;
- smaller bet candidate;
- increased check candidate.

The explanation must be range-based, not `scary card` based.

---

## H-W02-004 — Bet size determines how wide top pair can check-raise

**Status:** `SOURCE-SUPPORTED / PROVISIONAL`  
**Confidence:** high on the shape

### Trigger

OOP faces a flop c-bet with top pair or second pair.

### Default

- Versus a small, wide c-bet: allow broader protection raises, selected vulnerable top pair and more semi-bluffs.
- Versus a large, polar c-bet: reduce raise frequency, narrow value and keep more top pair in call mode.
- On monotone boards: ordinary top pair generally stays outside the check-raise range; raises remain polar.

### Why

`SLC-M02-L17` repeatedly contrasts responses versus small and large c-bets and identifies monotone boards as a strong exception.

### Main exception

A player using a large size with a visibly weak merged range is not truly polar. The response must be based on the actual betting range, not the nominal size alone.

### Table cue

`How much weak betting range exists behind this size?`

### Drill

Use identical hands versus three opponent bet constructions:

- small and wide;
- large and polar;
- large but incorrectly merged.

Choose raise/call/fold and state what weak hands the raise targets.

---

## H-W02-005 — Vulnerable low-kicker top pair can be a better raise than strong top pair

**Status:** `SOURCE-SUPPORTED / PROVISIONAL`  
**Confidence:** high on the mechanism

### Trigger

Paired or dynamic flop, OOP, facing a wide c-bet.

### Default

Consider raising lower-kicker top pair more often when it:

- needs protection;
- benefits from denying overcards and backdoors;
- does not block the high-card bluffs you want to fold.

Stronger kickers can remain calls because they dominate more of the betting range and protect future streets.

### Why

`SLC-M02-L17` explicitly explains why low-kicker top pair can raise more on boards such as paired low textures.

### Main exception

If the c-bet range is already narrow and strong, the protection argument weakens and top pair returns toward bluff-catcher mode.

### Table cue

`Does my kicker block the hands I want to fold?`

### Drill

On five paired/dynamic boards, compare low-, medium- and high-kicker top pair. Rank them by raise incentive and explain protection plus unblocker effects.

---

## H-W02-006 — A turn lead is a response to the flop betting range, not merely the turn card

**Status:** `SOURCE-SUPPORTED / PROVISIONAL`  
**Confidence:** medium-high

### Trigger

OOP check-called the flop and the turn appears favorable.

### Default

First classify the flop bet:

### Family A — large and polar/high-card-heavy flop bet

On low, paired or straight-completing turns that miss the bettor's air, use a more polar lead with strong made hands and selected low-card/draw bluffs.

### Family B — small and wide flop bet

When second or bottom pair pairs, consider a small linear lead with trips, top pair, second pair and protection hands.

### Why

The recovered material in `SLC-M02-L18` explicitly contrasts these two lead mechanisms. `SLC-M02-L19` further shows that an incorrectly polar large flop size can create a much larger paired-turn lead range.

### Main exception

`SLC-M02-L18` has a local missing transition. Exact board-to-board frequencies are blocked pending rerun.

### Table cue

`What did Villain's flop size leave out of the turn range?`

### Drill

Given flop size, likely betting range and turn card, choose:

- no lead;
- small linear lead;
- polar large lead.

The answer must identify the missing hand class in Villain's range.

---

## H-W02-007 — Node-lock the sizing branch, not the player's personality label

**Status:** `SOURCE-SUPPORTED / PROVISIONAL`  
**Confidence:** high

### Trigger

Using an exploit read such as `passive`, `tight`, `whale`, `aggressive` or `value-heavy`.

### Default

Translate the label into an explicit branch error:

- Which hands are missing from the bet?
- Which hands are added too often?
- Which hands are checked instead?
- Which size contains or excludes medium-strength value?

Then adjust only the response to that branch before rewriting the rest of the strategy.

### Why

`SLC-M02-L23` states that qualitative labels are insufficient without actual range work. `SLC-M02-L19` models a concrete error—second-pair Qx missing from a large flop bet—and rebuilds the turn strategy from that fact.

### Main exception

When evidence is weak or based on one showdown, retain the robust baseline rather than applying an extreme node lock.

### Table cue

`What exact hand class does this read add or remove?`

### Drill

Convert ten player labels into one falsifiable range statement. Reject descriptions that cannot specify a bet/check difference.

---

## H-W02-008 — Versus value-heavy bets, remove speculative floats before strong bluff-catchers

**Status:** `SOURCE-SUPPORTED / PROVISIONAL`  
**Confidence:** high on the direction

### Trigger

Opponent's betting range lacks total air and is concentrated in top pair, strong draws and value.

### Default

- Reduce weak backdoor floats.
- Keep check-raises more polar.
- Do not defend merely because a hand has theoretical backdoor equity.

Conversely, versus excessive aggression, preserve strong hands in the check range, widen protected calls and raise more of the baseline-approved candidates.

### Why

`SLC-M02-L23` compares value-heavy, passive and overly aggressive betting models and shows the corresponding response changes.

### Main exception

The exploit depends on the actual range construction, not low observed frequency alone. A small sample can misclassify a balanced player as value-heavy.

### Table cue

`Where is the total air in this betting range?`

### Drill

For three explicit betting ranges, rank the EV change of:

- weak backdoor call;
- top-pair call;
- polar check-raise;
- protected slowplay.

---

## H-W02-009 — Before folding a deep bluff-catcher, count value and ask what the size excludes

**Status:** `SOURCE-SUPPORTED / PROVISIONAL`  
**Confidence:** medium-high

### Trigger

Facing a very large river raise or re-raise with a strong bluff-catcher in a deep pot.

### Default

Pause and answer:

1. Which value hands realistically reached this node?
2. Which natural value classes would choose a smaller size and are therefore partly excluded?
3. Which blocker bluffs are attractive to an aggressive opponent?
4. Does your hand block the narrow represented value region?
5. Did earlier passive actions preserve strong hands in your range, making you less capped than Villain assumes?

### Why

`SLC-M02-L20` shows a deep river node where an oversized re-raise can exclude natural flush/straight value and where realistic blocker bluffs make ace-high bluff-catchers profitable.

### Main exception

This is not permission to hero-call every oversized river bet. The source mechanism requires a narrow represented value range plus a credible over-bluff model.

### Table cue

`What value is left after accounting for this exact size?`

### Drill

For ten river spots, list value combos before listing bluffs. A call cannot be considered until the value region and size exclusions are stated.

# Compact SRP decision algorithm — v0.1

**Status:** `SYSTEM INFERENCE / PROVISIONAL`

Use this sequence before a non-standard aggressive or defensive decision:

1. **Node identity:** positions, effective stack, single-raised-pot branch.
2. **Flop size shape:** small/wide, large/polar, or incorrectly merged/polar.
3. **Range update:** what the bet and call removed from each range.
4. **Turn ownership:** did the card preserve polarization, repair the caller, or pair a hand class missing from the bettor?
5. **Action family:** check, normal bet, overbet, small linear lead, polar lead, protected call or polar raise.
6. **Combo job:** value, equity bluff, blocker/matcher, savage air or bluff-catcher.
7. **River plan:** which runouts create value, continued bluff or shutdown.
8. **Exploit evidence:** exact observed hand-class error, not a vague label.

Table compression:

`SIZE SHAPE → RANGE UPDATE → TURN OWNERSHIP → COMBO JOB → RIVER PLAN`

# Drill prototypes

## Drill D-W02-A — Size-shape recognition

Show 20 flop actions. The learner labels each bettor range:

- small/wide;
- large/polar;
- large/incorrectly value-heavy;
- unknown.

Then states one consequence for OOP calls, raises or future leads.

## Drill D-W02-B — Three-job barrel sorting

Sort 30 turn candidates into equity, blocker/matcher, savage air or reject. Require one planned river class per accepted candidate.

## Drill D-W02-C — Turn ownership cards

Use one flop and action line across the full turn deck. Classify cards into:

- preserve IP polarization;
- improve OOP materially;
- create OOP lead through a missing bettor hand class;
- ambiguous/visual-review-dependent.

## Drill D-W02-D — Bluff-catcher value count

For each river decision:

1. list represented value;
2. remove value classes inconsistent with size;
3. list credible blocker bluffs;
4. state hero blockers;
5. call or fold.

# Open requirements and blocked claims

1. `SLC-M02-L11` rerun is required before admitting the full river follow-through framework from Turn Barreling Part 3.
2. `SLC-M02-L12` reruns are required before admitting exact neutral-turn versus middling-turn boundaries.
3. `SLC-M02-L16` rerun is required before integrating the missing Part 1 conclusion into the top-pair check-raise framework.
4. `SLC-M02-L18` local rerun is required for the missing transition between lead families.
5. Exact sizes and frequency mixes remain visual-dependent across this wave.
6. The oversized river bluff-catcher mechanism must be cross-checked against pool-specific under-bluff evidence before becoming a live default.
7. None of these candidates is yet an exact chart or frequency prescription.

## Wave verdict

`SYNTHESIS_WAVE_02_CANDIDATE_LAYER_COMPLETE`

Next suitable synthesis wave: 3-bet pots, bluff-deficient ranges, multiway shared defence and small-bet price inelasticity.