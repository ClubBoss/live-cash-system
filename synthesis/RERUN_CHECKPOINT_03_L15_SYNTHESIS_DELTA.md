# Rerun Checkpoint 03 — L15 Synthesis Delta

Status: `CANDIDATE_DELTA_CREATED / CENTRAL_REGISTRY_CONSOLIDATION_PENDING`

Source:

- `SLC-M02-L15 Finding Hard Continues After Defending Your Big Blind` — audio complete after targeted rerun.

## New candidate mechanisms

### H-R03-001 — Hard continues preserve future bluff inventory

Domain: flop defence / range construction  
Tag: `GENERAL_CORE`  
Tier: CORE  
Confidence: high mechanism  
Suggested status: `DRILL_READY`

A weak flop call should not be judged only by immediate showdown value. Some uncomfortable backdoor and high-card calls are required because they supply future improvements, protected realization and unpaired river bluffs.

Cue:

`What future job does this weak call perform?`

### H-R03-002 — Confirm both missing bluff sources before overfolding rivers

Domain: exploitative bluff-catching  
Tag: `GENERAL_CORE / POOL_HYPOTHESIS`  
Tier: SUPPORTING  
Confidence: high structure  
Suggested status: `DRILL_READY`

A major river overfold requires more than observing tight flop calls. Confirm that the opponent both:

1. omitted low-showdown-value early continues;
2. failed to replace them by converting pairs or other showdown hands into bluffs.

Cue:

`Which bluffs were lost, and what replaced them?`

### H-R03-003 — Read frequency deltas relative to their base

Domain: solver interpretation / study method  
Tag: `GENERAL_CORE`  
Tier: SUPPORTING  
Confidence: high  
Suggested status: `DRILL_READY`

Small percentage-point changes can be large proportional strategy shifts. Compare the new frequency with its starting base before judging importance.

Cue:

`How large is the change relative to where it started?`

## Existing candidates strengthened

### H-W01-008 — Polar preflop bluffs target dominating offsuit opens

L15 confirms that the same offsuit-pip logic informs postflop barrel and check-raise candidate selection.

### H-W03-005 — Bluff supply must be seeded before the river

The lesson directly shows weak flop calls becoming the unpaired river bluff inventory.

### H-W02-007 — Node-lock the branch, not the personality label

The useful opponent model is specific: misses weak flop calls and refuses to bluff low pairs on the river.

### H-W02-008 — Versus value-heavy bets, remove speculative floats first

The lesson supports tighter river defence only after the missing bluff ancestry and absent replacement bluffs are established.

## Playbook impact

No immediate increase in the compact final rule count is necessary.

Likely consolidation:

- `H-R03-001` nests under range ancestry and bluff supply;
- `H-R03-002` becomes the falsifier gate for bluff-deficient opponent profiles;
- `H-R03-003` belongs in the solver-study and diagnostic layer.

## Drill impact

Add three original drill families:

1. future-job classification for weak flop continues;
2. two-stage proof of river bluff deficiency;
3. proportional interpretation of frequency changes.

## Source-state delta

- `SGL-0056`: closed.
- `SLC-M02-L15`: `AUDIO_COMPLETE / NEEDS_VISUAL_REVIEW`.
- exact board cards, solver weights and hand-level frequencies remain blocked.

## Verdict

`RERUN_CHECKPOINT_03_SYNTHESIS_DELTA_ACCEPTED`