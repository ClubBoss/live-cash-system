# CP-G3-L04 — Raising and Beyond

Status: `AUDIO_COMPLETE / SOLVER_VISUALS_PENDING / MAPPED`

## Source identity

- source family: Carrot Poker School;
- grade: 3;
- lecture: 4;
- source title stated in audio: `Raising and Beyond`;
- source file: `Lecture 04.mp4`;
- transcript package: `transcripts_mlx_large_v3(20260805-221934).zip`;
- package SHA-256: `e957e3b8a699ed43378099cffbc8e5b874ca97283a7935984c1ae924b5dd4d70`;
- duration: `59:08.80`;
- transcript engine: `mlx-whisper`;
- model: `large-v3`;
- language: English;
- translation: false.

## Source role

This lecture builds a flop check-raise range and then follows that range into the turn after the raise is called.

The central process is:

```text
FLOP RAISE CANDIDATE CLASS
→ OPPONENT CALL FILTER
→ TURN RANGE RE-EVALUATION
→ HAND-CLASS MIGRATION
→ TURN FREQUENCY AND SIZE TOOLKIT
```

It is not enough to know that a hand may raise the flop. The learner must know what job that hand has after the call and how the whole raising range changes on the turn.

## Source-faithful mechanism

### 1. Five eligible flop check-raise classes

The source defines five constituent regions:

1. thick value;
2. thin value;
3. high-EV bluffs;
4. hybrid raises;
5. low-EV bluffs.

These are eligibility classes, not mandatory-action labels.

### 2. Thick value

Very strong hands retain high equity after the range-narrowing effect of raise and call. They usually tolerate large pot growth and have a high investment ceiling.

### 3. Thin value

Hands such as strong top pair or selected overpairs may still be ahead when called but have a lower investment ceiling. They often mix between call and raise.

Including thin value expands the supported bluff volume and prevents an opponent from profitably using overly broad small c-bets.

### 4. High-EV bluffs

Strong draws and high-nut-potential hands benefit from both immediate fold equity and large future payoff branches. They usually remain mixed rather than becoming automatic raises.

### 5. Hybrid raises

Hybrid raises combine several sources of EV:

- value against worse continues;
- denial against better or high-equity hands;
- redraw or improvement potential;
- sometimes future fold equity.

The source links them to vulnerable made hands with meaningful redraws, especially against merged betting ranges.

### 6. Low-EV bluffs

Weaker draws, backdoors and low-showdown-value hands are needed to complete a healthy raising range and force sufficiently wide defence.

They are the most sensitive to board, blocker and future-tree quality.

### 7. Opponent call as a filter

Once the flop raise is called, the opponent's range strengthens and the raiser's five classes do not retain their original labels automatically.

A hand can move from:

- bluff to value;
- thin value to check;
- hybrid to pure value or give-up;
- high-EV bluff to made hand;
- low-EV bluff to continued bluff or abandoned branch.

This turn `class migration` is one of the main teaching points.

### 8. Turn toolkit after the called raise

The turn strategy is derived from:

- current range equity;
- nut advantage and relative polarisation;
- the opponent's filtered call range;
- remaining investment ceilings;
- hand-class migration;
- runout-specific urgency.

The output is a practical turn betting frequency and size toolkit, not an automatic continuation of the flop raise.

## Timestamp map

```text
00:04  Lecture scope
00:34  Five-part check-raise range
00:58  Thick value
02:50  Thin value
05:28  High-EV bluffs
08:00  Hybrid raises
09:26  Low-EV bluffs
14:00  Flop construction examples
28:00  Opponent call as a filter
34:00  Turn class migration
47:00  Turn range advantage, polarisation and toolkit
57:20  Homework and Lecture 5 transition
```

## Homework process

For two original study nodes, the learner is asked to:

1. identify one example from each flop class;
2. state the class each hand occupies after the raise is called;
3. evaluate the two turn ranges;
4. derive the turn frequency and size toolkit;
5. record one hand-class insight that changed previous intuition.

## Visual dependencies

Not admitted from audio alone:

- exact board cards and suits;
- exact solver matrices;
- exact raise and turn sizes;
- exact frequencies and EV;
- exact hand assignments to classes.

## Cross-source routing

Primary module effects:

- `LCM-04` — action filtering and class migration;
- `LCM-05` — response and raise shape;
- `LCM-06` — five-part aggression construction and future jobs;
- `LCM-11` — range-construction assessment.

Secondary effects:

- `LCM-03` — realisation and vulnerable made hands;
- `LCM-07` — transferable raise/call filtering logic for 3-bet pots.

Likely candidate relations:

- `H-W01-005` — actions filter range ownership;
- `H-W02-001` — value structure determines aggression capacity;
- `H-W02-002` — bluff jobs and future branches;
- `H-W02-004` — bet shape determines raise breadth;
- `H-W02-005` — active raises with vulnerable made hands;
- `H-R05-001` — recalculate after every action;
- `H-R05-002` — passive strategies require active raising branches.

Exam routing:

- primary: `G3-Q04`;
- strong secondary: `G3-Q08`, `G3-Q09`;
- secondary: `G3-Q01`, `G3-Q03`.

## Source-purity boundary

The five-class mechanism may inform original learning structures, but source boards, hands, frequencies and homework spots are not copied.

## Continuity note

The closing audio explicitly announces Lecture 5. Grade 3 lecture continuity is therefore not complete after Lecture 4.

## Verdict

`CP_G3_L04_CANONICALLY_INGESTED`

`FLOP_RAISE_CLASS_MUST_BE_RECALCULATED_AFTER_CALL`

`FIVE_CLASSES_ARE_CANDIDATE_REGIONS_NOT_PURE_ACTION_LABELS`

`GRADE_3_LATER_LECTURES_REMAIN_PENDING`
