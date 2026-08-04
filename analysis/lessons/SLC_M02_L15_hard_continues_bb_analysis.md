# SLC-M02-L15 — Finding Hard Continues After Defending Your Big Blind

Status: `ANALYZED / AUDIO_COMPLETE / VISUAL_EXACTNESS_PENDING`

## Core thesis

A structurally correct big-blind defence must retain some uncomfortable high-card and backdoor flop calls. Their value is not limited to immediate equity: they seed future value realization and bluff supply.

If an opponent omits those weak calls and later also refuses to convert pairs into bluffs, the river betting range becomes far more value-heavy than equilibrium.

## Main mechanisms

### 1. Hard continues are portfolio assets

A weak individual hand can be a mandatory continue because the range needs:

- future improvements;
- protected check-check lines;
- unpaired river bluffs;
- enough low-showdown-value material to support value bets.

This is a range-level requirement rather than a claim that every weak backdoor call is profitable in every environment.

### 2. Bluff selection should preserve the target folds

Low-card barrel candidates can outperform middling hands when they:

- avoid blocking the wide opener's weak offsuit c-bets;
- avoid blocking the defender's middling calls that later fold;
- remove selected low two-pair or slow-play regions;
- retain limited backup improvement.

The lesson directly connects this postflop mechanism to the preflop offsuit-pip framework recovered in `SLC-M01-L01`.

### 3. River bluff ancestry begins on the flop

The equilibrium river bluff range is populated by queen-high, jack-high and ten-high hands that survived the flop and remained unpaired.

If those hands fold on the flop, the range must recruit replacement bluffs from low pairs and other showdown hands. Copying the equilibrium river betting frequency without this ancestry is incoherent.

### 4. Bluff deficiency can require two linked population errors

A tight flop call does not by itself prove a value-heavy river range. The decisive population model is:

1. weak floats are omitted on the flop;
2. low pairs and similar showdown hands are not converted into river bluffs.

Only after both branches are specified should Hero make large bluff-catching adjustments.

### 5. Evaluate strategy changes proportionally

Solver-frequency deltas can look numerically small while representing large relative shifts. A reduction from roughly 7.5 to roughly 4.3 is strategically large relative to its starting value.

This is primarily a study and interpretation rule, not a table-frequency prescription.

## Candidate heuristics

### H-R03-001 — Hard continues preserve future bluff inventory

**Domain:** flop defence / range construction  
**Tag:** `GENERAL_CORE`  
**Tier:** CORE  
**Confidence:** high mechanism  
**Suggested status:** `DRILL_READY`

Do not judge a weak flop call only by immediate showdown value. Ask whether the range needs that class to improve, realise through passive turns or arrive as an unpaired river bluff.

**Cue:** `What future job does this weak call perform?`

**Boundary:** exact candidate hands depend on board, bet size and range composition.

### H-R03-002 — Confirm both missing bluff sources before overfolding rivers

**Domain:** exploitative bluff-catching  
**Tag:** `GENERAL_CORE / POOL_HYPOTHESIS`  
**Tier:** SUPPORTING  
**Confidence:** high structure, environment-sensitive conclusion  
**Suggested status:** `DRILL_READY`

Before applying a major river overfold, verify both:

- early low-showdown-value bluffs are missing;
- stronger showdown hands are not being converted into replacement bluffs.

**Cue:** `Which bluffs were lost, and what replaced them?`

### H-R03-003 — Read frequency deltas relative to their base

**Domain:** study method / solver interpretation  
**Tag:** `GENERAL_CORE`  
**Tier:** SUPPORTING  
**Confidence:** high  
**Suggested status:** `DRILL_READY`

Compare changes proportionally, not only by percentage points.

**Cue:** `How large is this change relative to where it started?`

## Existing candidates strengthened

### H-W01-008 — Polar preflop bluffs target dominating offsuit opens

L15 shows the same offsuit-pip logic carrying into postflop barrel and check-raise construction.

### H-W03-005 — Bluff supply must be seeded before the river

The lesson gives a direct single-raised-pot example: weak flop calls become the unpaired river bluff inventory.

### H-W02-008 — Versus value-heavy bets, remove speculative floats first

The node-lock supports tighter river defence only after the opponent's missing bluff classes are explicitly modelled.

### H-W02-007 — Node-lock the branch, not the personality label

The useful model is not `passive player`. It is `misses weak flop calls and does not bluff low pairs on the river`.

## Playbook impact

The final compact rule count need not increase by three.

Likely consolidation:

- `H-R03-001` nests under range ancestry / bluff supply;
- `H-R03-002` becomes the falsifier requirement for bluff-deficient opponent profiles;
- `H-R03-003` belongs in the study and diagnostic layer rather than the table-facing Playbook.

## Drill prototypes

### Drill A — Future-job classification

Given a flop range and ten weak candidates, identify whether each hand supplies:

- turn improvement;
- protected realization;
- river bluff inventory;
- no sufficient future job.

### Drill B — Bluff-deficiency proof

For each river range, state:

1. which flop air reached the node;
2. which pair classes can be converted into bluffs;
3. whether a large exploitative fold is justified.

### Drill C — Relative change

Convert percentage-point changes into relative increases or reductions and state whether the strategic effect is minor, moderate or major.

## Source and IP boundary

Commercial or Sharky-ready material should use:

- original scenarios;
- independent board and range constructions;
- no copied solver grids;
- no copied exact frequencies;
- original wording and drills.

## Verdict

`SLC_M02_L15_ANALYSIS_COMPLETE`

The audio gap is closed. Cross-source validation and visual exactness remain pending.