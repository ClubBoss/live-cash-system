# Carrot Grade 1 Lectures 05–09 — Original Assessment Extension v0.1

Status: `ORIGINAL / SOURCE-INFORMED / NOT_SOURCE-COPIED`

## Purpose

Convert the reasoning architecture of Carrot Grade 1 Lectures 05–09 into original adaptive assessment families.

Do not reuse source boards, hole cards, answer ordering, slide wording or exact solver values.

## Assessment Family 1 — Required pot share versus required equity

### Skill

Distinguish an open-action call from an end-of-action calculation.

### Original prompt pattern

Give:

- current pot;
- bet size;
- one or two streets remaining;
- Hero position;
- draw/made-hand class.

Ask the learner to:

1. calculate required pot share after calling;
2. explain why raw equity is not the final answer;
3. name realisability, implied-odds and future-fold-equity adjustments;
4. compare call with fold and one plausible raise.

### Misconception targets

- required-equity-in-open-action error;
- pot-before-call denominator error;
- equity-equals-EV error.

## Assessment Family 2 — Position and realisability contrast

### Skill

Explain why the same raw equity can have different EV in and out of position.

### Original prompt pattern

Create two otherwise similar spots, one IP and one OOP.

Ask:

- which hand realises more equity;
- where implied odds are easier to capture;
- where future fold equity is more available;
- which branch creates more forced folds later.

### Scoring

Action and explanation are scored separately.

## Assessment Family 3 — Frequency and size are independent outputs

### Skill

Reject the frequency-control-sizing fallacy.

### Original prompt pattern

Provide four board/range descriptions and ask for:

- low/medium/high betting frequency;
- small/large single size;
- separate reason for each output.

Include at least one:

- high-frequency small-bet case;
- low-frequency small-bet case;
- medium-frequency large-bet case;
- range-check case.

### Misconception targets

- bet rarely therefore bet big;
- range advantage equals large sizing;
- nut advantage equals high frequency.

## Assessment Family 4 — Range advantage versus nut advantage

### Skill

Identify which range property drives frequency and which drives investment ceiling.

### Original prompt pattern

Describe two range pairs with:

- similar overall equity but different nut concentration;
- similar nut concentration but different total range equity.

Ask the learner to separate:

- global frequency;
- size;
- hand-selection consequences;
- checking-range protection.

## Assessment Family 5 — Filtered turn favourability

### Skill

Evaluate a turn card against ranges after flop action.

### Original prompt pattern

Give preflop positions, a flop, a small c-bet and call, then two candidate turn cards.

Ask:

1. what the flop bet/call removed;
2. who gained raw range equity;
3. who retained nut and positional advantage;
4. whether each turn is favourable, neutral or unfavourable in EV;
5. the lowest-quality bluff candidate allowed in each world.

### Misconception targets

- turn card judged from preflop ranges;
- equity leader automatically owns the bet;
- favourable means high equity.

## Assessment Family 6 — Float-bet linearisation

### Skill

Build a protected polar or semi-polar float-betting range.

### Original prompt pattern

After the OOP preflop raiser checks, present:

- strong value;
- thin vulnerable value;
- draw;
- complete air;
- medium showdown value.

Ask the learner to rank bet frequency and explain:

- why some air must bluff;
- why some pairs check;
- whether denial supports semi-polar betting;
- how a protected opponent check changes the baseline.

### Misconception targets

- only bluff draws;
- bet every pair for protection;
- check from preflop raiser proves weakness.

## Assessment Family 7 — Texture class and relative strength

### Skill

Classify board connectivity for the actual ranges.

### Original prompt pattern

Provide three river runouts:

- still-lake type;
- choppy-sea type;
- tsunami type.

Use the same absolute hand label in each.

Ask:

- how relative strength changes;
- how value/bluff thresholds move;
- which board creates the largest absolute-hand-label trap.

### Misconception targets

- dry/wet label without range context;
- top pair or flush treated as fixed strength;
- texture ignored after line filtering.

## Assessment Family 8 — Four range-geography thresholds

### Skill

Locate the borders among bluff, check and value regions.

### Original prompt pattern

Supply an ordered set of six to eight hands from weak to strong on one river node.

Ask the learner to identify:

1. first hand too strong to bluff;
2. first hand strong enough to value bet;
3. first hand too weak to value bet when scanning downward;
4. first hand weak enough to bluff when scanning downward.

Then change one river card or position and ask which borders move.

### Scoring

Award separately for:

- correct ordering;
- correct threshold placement;
- explanation from texture and ancestry;
- confidence calibration.

## Runtime Integration

These families should be sampled based on module state:

- `LCM-03`: Families 1–2;
- `LCM-04`: Family 5;
- `LCM-05`: Families 3–4 and 6;
- `LCM-06`: Families 3 and 5;
- `LCM-09`: Families 7–8;
- `LCM-11`: delayed variants of all families.

## Release Boundary

These assessments may be used for mechanism diagnosis now.

Do not use them to claim mastery of:

- exact deep-stack thresholds;
- exact preflop anchors;
- multiway defence;
- source solver frequencies;
- target-live population tendencies.

## Verdict

`CARROT_G1_L05_TO_L09_ORIGINAL_ASSESSMENT_EXTENSION_READY`

`SOURCE_EXAMPLES_NOT_COPIED`
