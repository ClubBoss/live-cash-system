# Source Metadata

Course: Carrot Poker School  
Grade: 2  
Lecture: 03  
Descriptive title: Fold Equity and Bluff Tiers  
Instructor: Peter Clarke  
Original filename: `Lecture 03.mp4`  
Source duration from transcript: `63:13.14`  
Transcription engine: `mlx-whisper`  
Model: `large-v3`  
Language: English  
Translation: disabled  
Source ID: `CP-G2-L03`  
Source status: `AUDIO_COMPLETE / SOLVER_VISUALS_PENDING`

# Source-Faithful Record

## [00:00] Fold equity is the currency of bluffing

The lecture links bluff quality to the amount of fold equity available in the node. The pot-odds norm is treated as the neutral-world benchmark, while actual fold equity moves with range asymmetry and world favourability.

The source rejects emotionally motivated defence such as calling merely to prevent the opponent from “running over” Hero. A theoretically profitable bluff can earn money; the defender is not required to make every opposing bluff lose.

## [18:00] River Blunder Theorem

The source’s “River Blunder Theorem” states that checking very low-showdown-value hands in a favourable river world can be a large EV mistake.

The trigger is not simply “Hero has air.” The node must first be favourable enough that betting has materially positive EV. On neutral and unfavourable nodes, bluff selection becomes progressively stricter.

The lecture emphasizes that showdown value is opportunity cost. A hand with some showdown value can still be a mandatory bluff when bet EV rises far above check EV.

## [28:00] Texture and action create natural bluff supply

The quantity of available air depends on:

- preflop origin range;
- which draws and overcards reached the river;
- prior bets and calls;
- board connectivity;
- which missed hands retain showdown value.

Dry run-outs with few natural misses may require unusual bluff candidates. Broad or draw-heavy run-outs may create too much natural air and require selective giving up.

## [42:00] Bluff tiers five through seven

The lecture expands the value-tier system into bluff tiers.

- Tier 5: preferred bluff candidates with favourable removal.
- Tier 6: neutral or approximately neutral removal.
- Tier 7: negative removal, commonly blocking folds or missed draws.

The tiers rank suitability for bluffing, not absolute hand strength. The same blocker can change tier across streets because the target response changes.

## [50:00] Blockers matter after the node is classified

In a favourable world, even imperfect bluff candidates can bet because fold equity is abundant. In an unfavourable world, only the strongest candidates may break even.

The source warns against choosing a bluff because it “looks like a draw.” The relevant questions are whether the hand blocks continues, unblocks folds and has better or worse check EV than alternatives.

# Explicit Instructor Mechanisms

- Fold equity is evaluated relative to a neutral pot-odds benchmark.
- World favourability determines how selective bluffing must be.
- Low-showdown-value river checks can be large mistakes in favourable nodes.
- Bluff supply is inherited from earlier streets and source ranges.
- Bluff tiers classify removal quality only after action category and node EV are established.
- Emotional anti-bullying logic is not a valid defence rule.

# Cross-Source Hooks

- `STRONGLY CONFIRMS H-W02-002`: a bluff’s job depends on current and future EV.
- `STRONGLY CONFIRMS H-W03-005`: river bluff supply must be seeded earlier.
- `STRONGLY CONFIRMS H-W03-011`: blockers are evaluated inside line-created ranges.
- `EXTENDS H-W02-009`: river decisions compare bet EV, check EV, ancestry and blockers.
- Primary modules: `LCM-06`, `LCM-09`.
- Primary slots: 8, 15.

# Uncertainties Requiring Visual Review

- exact boards and origin ranges;
- exact fold frequencies around the pot-odds norm;
- exact EV gains labelled as large blunders;
- exact tier assignments for named hands.

# Source Verdict

`CP_G2_L03_AUDIO_COMPLETE`

`WORLD_FAVOURABILITY_AND_BLUFF_TIER_MODEL_ACCEPTED`
