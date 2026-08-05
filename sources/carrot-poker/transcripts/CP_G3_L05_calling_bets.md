# CP-G3-L05 — Calling Bets

Status: `AUDIO_COMPLETE / SOLVER_VISUALS_PENDING / MAPPED`

## Source identity

- source family: Carrot Poker School;
- grade: 3;
- lecture: 5;
- source title stated in audio: `Calling Bets`;
- source file: `Lecture 05.mp4`;
- transcript package: `transcripts_mlx_large_v3 2(1).zip`;
- package SHA-256: `bf46ac4ba2f0cffc6d5fa5763e9569cd4b9e7795b457203a0b244bc92820053d`;
- duration: `62:36.04`;
- transcript engine: `mlx-whisper`;
- model: `large-v3`;
- language: English;
- translation: false.

## Source role

Lecture 5 extends the Grade 2 bluff-catching system into a practical call-quality and exploit-adjustment framework.

The central classification is:

```text
VALUE BEATER
→ BLUFF CATCHER
→ FRAIL HAND
```

The action is then evaluated as a winning, near-indifferent or losing call for the actual size and line.

## Source-faithful mechanism

### 1. Call-quality classes

- `value beater`: beats all bluffs and also some value, or can chop against part of value;
- `bluff catcher`: beats the bluff region but not the value region;
- `frail hand`: loses to at least some bluffs as well as all value.

The same nominal hand can move between classes as the bet size, street, range construction and runout change.

### 2. Size-sensitive response thresholds

Larger bets compress the profitable calling region and can change which hands qualify as value beaters or viable bluff catchers.

The source does not treat a hand label as sufficient. It repeatedly compares:

- the opposing value region;
- bluff supply;
- blocker effects;
- redraw and future-street value;
- the size being faced.

### 3. Call, raise or fold are distinct tests

A hand can be:

- losing as a call but viable as a bluff raise;
- winning as a call but inferior as a raise;
- too frail for either branch.

Therefore a solver raise must not be translated into “this is a strong bluff catcher.” The raise threshold is a separate and generally higher bar than the call threshold.

### 4. Counterintuitive defence

The lecture studies spots where apparently weak hands can defend because their blockers interact well with the actual value/bluff split, while superficially stronger hands can lose because they block bluffs or fail against some bluff region.

Exact combinations and solver frequencies remain visual-dependent.

### 5. Theory-to-pool correction

The source explicitly asks whether a real population supplies the theoretical bluffs and whether the learner should reject a solver call or raise.

Population conclusions are not universalised. The learner must:

```text
RECONSTRUCT THE LINE
→ IDENTIFY NATURAL BLUFF SUPPLY
→ COMPARE WITH OBSERVED POOL
→ ADJUST CALL / RAISE / FOLD
→ WRITE A MEMORABLE CONDITIONAL HEURISTIC
```

## Pedagogical process

The homework asks the learner to classify hands inside the bluff-catching system, decide call/raise/fold, inspect why the solver chooses a river value raise or bluff raise, and then decide whether the same branch is credible against real opponents.

## Timestamp map

```text
00:05  Calling Bets and bluff-catching review
00:27  Value beaters, bluff catchers and frail hands
03:00  Bet-size effects on call quality
10:00  Tiering and practical examples
21:40  Call-versus-raise separation
35:00  Counterintuitive defence
44:50  Population underbluff and exploit deviation
54:25  Homework classification and heuristic building
```

## Visual dependencies

The following remain unadmitted without the source screen:

- exact cards and suits;
- exact size menus;
- exact EV differences;
- exact mixed frequencies;
- exact value/bluff combination counts;
- exact pool samples or population magnitude.

## Cross-source routing

Primary module effects:

- `LCM-05` — call/raise/fold thresholds;
- `LCM-09` — bluff-catching and river response grades;
- `LCM-10` — theory-to-pool deviation;
- `LCM-11` — classification and conditional heuristic repair.

Likely candidate relations:

- `H-W01-006` — protected calls, mechanism strengthened but exact deep boundary open;
- `H-W02-007` — branch-specific exploit response;
- `H-W02-008` — remove marginal bluff-catches against air-poor lines;
- `H-W02-009` — river audit;
- `H-R04-008` — theory and blockers do not complete the exploit conclusion.

Exam routing:

- primary: `G3-Q05`;
- secondary: `G3-Q01`, `G3-Q07`.

## Source-purity boundary

This record preserves the source mechanism but does not copy its boards, hands, solver outputs or population estimates into the learner product.

## Verdict

`CP_G3_L05_CANONICALLY_INGESTED`

`CALL_QUALITY_IS_SIZE_LINE_AND_RANGE_DEPENDENT`

`CALL_AND_RAISE_THRESHOLDS_MUST_BE_SEPARATED`

`POPULATION_OVERRIDE_REMAINS_EVIDENCE_GATED`
