# Carrot Grade 1 Lecture 10 — Original Assessment Extension v0.1

Status: `ACTIVE / ORIGINAL / SOURCE-SPOT-INDEPENDENT`

## Purpose

Convert the stable blocker-ordering mechanisms from `CP-G1-L10` into original interactive assessment families without copying the source's boards, hands, wording or solver outputs.

## Source-purity boundary

Do not reuse:

- exact source boards;
- exact hands or suits;
- exact solver cells;
- exact EV or frequency values;
- the source's visual analogies or exam wording.

The following are original competency families derived from the mechanisms only.

## Assessment family 1 — Blocker limitation gate

### Skill

Decide whether blocker reasoning is allowed to influence the action yet.

### Prompt structure

Provide:

- range state;
- hand category;
- check/call/bet EV direction;
- one apparently attractive blocker.

Ask the learner to choose:

- blocker can select between close candidates;
- blocker is premature because the action category is not viable;
- blocker is irrelevant because exploit evidence dominates.

### Correct reasoning gate

The learner must first establish that the candidate action is plausible from range, EV and target-response logic.

### Misuse target

`BLOCKER_FIRST_ACTION_GENERATION`

## Assessment family 2 — Turn-to-river blocker reversal

### Skill

Recognise that the same suit card can change function after a draw misses.

### Prompt structure

Use one original two-tone flop and turn sequence. Compare two hands:

- one blocks the opponent's likely continuing draw on the turn;
- one unblocks it.

Then move to a blank river where the draw becomes part of the folding range.

Ask for the preferred candidate on each street and the reason for the reversal.

### Correct reasoning gate

```text
turn bluff
→ block likely continues

missed-draw river bluff
→ unblock likely folds
```

### Misuse target

`STATIC_BLOCKER_VALUE_ACROSS_STREETS`

## Assessment family 3 — Neutral versus favourable bluff world

### Skill

Separate minor blocker quality from major range asymmetry.

### Prompt structure

Present the same two blocker variants in:

1. a neutral triple-barrel world;
2. a highly favourable river-probe world.

Ask whether both, one or neither should bluff.

### Correct reasoning gate

- neutral world: blocker differences may separate a profitable and losing bluff;
- highly favourable world: all no-showdown-value hands may bluff despite imperfect blockers.

### Misuse target

`BLOCKER_OVERRIDES_RANGE_ASYMMETRY`

## Assessment family 4 — Dead-suit flop raise direction

### Skill

Select bluff-raise and thin-value-raise blockers from the desired opponent response.

### Prompt structure

Use an original rainbow or two-tone flop with:

- a dead suit;
- one or more backdoor-flush suits;
- one bluff-raise candidate;
- one thin-value-raise candidate.

Ask which suit configuration is preferred for each action.

### Correct reasoning gate

```text
bluff-raise wants folds
→ block backdoor continues
→ unblock dead-suit folds

thin value wants calls
→ may unblock weaker backdoor continues
→ may block dead-suit folds
```

Front-door draws must be treated separately because of their equity and implied odds.

### Misuse target

`SAME_BLOCKER_RULE_FOR_VALUE_AND_BLUFF`

## Assessment family 5 — Completed-flush river three-way comparison

### Skill

Distinguish blocker effects for:

- bluffing;
- thin value;
- bluff-catching.

### Prompt structure

Use one original completed-flush river and compare relevant high and low suit cards.

Ask:

1. which blocker helps a large bluff;
2. which blocker helps a thin value bet;
3. why the best bluff-catcher blocker may differ.

### Correct reasoning gate

- bluff and thin value benefit from removing flushes and some preferred calls;
- bluff-catching must compare value removed with bluffs removed;
- highest suit card is not automatically the best bluff-catcher blocker.

### Misuse target

`HIGHER_FLUSH_BLOCKER_ALWAYS_BETTER`

## Assessment family 6 — River bluff-raise value blockers

### Skill

Construct a bluff-raise against a polar river betting range.

### Prompt structure

Provide an original node where Hero cannot profitably call with any candidate bluff hand. Offer candidates that:

- block sets/two pair;
- block only the opponent's bluffs;
- are merely the bottom of Hero's range;
- contain low showdown value but useful value blockers.

Ask for the best bluff-raise and the rejected alternatives.

### Correct reasoning gate

A river bluff-raise must generate folds from parts of the value range, not merely air. Bottom-of-range status alone is not a reason.

### Misuse target

`BLUFF_RAISE_BOTTOM_OF_RANGE_FALLACY`

## Runtime integration

These families should be selected only after prerequisite stability in:

- `LCM-04` filtering and ownership;
- `LCM-06` value/bluff/check categories;
- `LCM-09` river audit.

Recommended interaction order:

```text
prediction
→ action family
→ range and response target
→ blocker comparison
→ confidence
→ changed-street or changed-range variant
```

## Scoring dimensions

Score separately:

- action family;
- target response;
- range reconstruction;
- blocker direction;
- recognition of major versus minor factors;
- confidence calibration;
- transfer across changed street or action sequence.

## Coverage effect

```text
prior Grade 1 original assessment families: 18
new Lecture 10 families:                   6
total Grade 1 original assessment families: 24
```

Candidate direct-drill coverage remains `30/34`. These are assessment variants for already represented mechanisms, not closure of the four source-gated drill gaps.

## Verdict

`SIX_ORIGINAL_BLOCKER_ORDERING_ASSESSMENT_FAMILIES_CREATED`

`SOURCE_EXAMPLES_REMAIN_REFERENCE_ONLY`

`GRADE_1_ORIGINAL_ASSESSMENT_TOTAL_24`
