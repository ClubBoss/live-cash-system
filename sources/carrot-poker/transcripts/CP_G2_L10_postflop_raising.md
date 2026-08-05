# Source Metadata

Course: Carrot Poker School  
Grade: 2  
Lecture: 10  
Descriptive title: Postflop Raising  
Instructor: Peter Clarke  
Original filename: `Lecture 10.mp4`  
Source duration from transcript: `54:00.06`  
Transcription engine: `mlx-whisper`  
Model: `large-v3`  
Language: English  
Translation: disabled  
Source ID: `CP-G2-L10`  
Source status: `AUDIO_COMPLETE / SOLVER_VISUALS_PENDING`

# Source-Faithful Record

## [00:00] Raise more against merged betting ranges

The lecture studies postflop raising against:

- flop c-bets and range bets;
- turn double barrels;
- river bets, especially smaller sizes.

The primary starting rule is that a more merged opposing betting range supports more raising. Hero can raise thinner for value because Villain bets more medium hands and must defend more of them.

## [08:00] Raising is governed by relative polarisation, not global range favourability

A range can be globally weak and still contain a highly polar top region that wants to raise. Conversely, a favourable range does not automatically raise often when the opponent’s betting range is itself polarised.

The lecture separates:

- fold frequency, which reacts to world favourability and price;
- raise frequency, which reacts to relative polarisation and value density;
- call frequency, which retains robust medium-strength hands.

## [18:00] Value raises include future equity realisation

Hands with volatile equity can raise for value even when much of their current strength comes from rare but high-payoff branches. The source contrasts:

- flat, robust equity realisation;
- polarised equity realisation that produces trips, two pair, straights or other nutted outcomes;
- future value after improving;
- denial and fold equity against medium hands.

A raise should be evaluated over the full future tree rather than by current showdown equity alone.

## [28:00] Raise theorem as an extension of relative polarisation

The source formalises an extension of its earlier polarisation framework:

- when Villain’s betting range is merged and Hero’s continuing range is comparatively polar, raising can expand;
- when Villain bets a polar large size, Hero generally raises less and calls more with robust hands;
- the size and shape of the bet change both the value threshold and the bluff supply for raises.

The exact source label is less important than the mechanism: raise breadth follows the shape of the betting range.

## [32:00] Merged raises alter Villain’s optimal response

Adding vulnerable or medium-strength value raises weakens the average raising range but increases value density below the nutted region. Villain should respond with more calls and sometimes more re-raises because fold equity becomes more valuable.

The source notes that many humans simplify by almost never re-raising flop or turn raises. That population claim remains contextual rather than universal.

## [40:00] Turn raises against polar barrels

Against a large turn barrel, Villain’s range is usually more polar. Hero’s response should therefore contain:

- fewer raises;
- more robust calls;
- selective value raises;
- bluffs with sufficient equity and removal;
- folds from draws whose realisation and price are inadequate.

A turn card that appears to uncap Hero does not guarantee frequent raising if Villain’s betting range has also become highly polarised.

## [48:00] Raising small river bets

Small river bets can be raised more widely when they are merged and contain thin value. The raising range still requires:

- a credible thin-value threshold;
- bluffs tied to the value volume;
- blockers that remove calls or value three-bets;
- a plan for Villain’s re-raise branch;
- exploit evidence before using extreme frequencies.

# Explicit Instructor Mechanisms

- Merged betting ranges support wider and thinner raising.
- Raise frequency follows relative polarisation, not simply range advantage.
- Full-tree realisation can make volatile hands valid value raises.
- Polar large bets suppress raising and preserve more calls.
- Adding merged value raises changes the opponent’s call and re-raise incentives.
- Small river bets can support wider raises, but the branch must still be value-led.

# Cross-Source Hooks

- `STRONGLY CONFIRMS H-W02-004` and `H-W02-005`: bet shape controls raise breadth and vulnerable made hands can raise.
- `STRONGLY CONFIRMS H-W03-006`: small sizes can be harder to defend correctly.
- `STRONGLY EXTENDS H-R05-002`: active calls and raises protect response ranges.
- `CONFIRMS H-W02-001`: value threshold determines bluff-raise volume.
- `CONFIRMS H-W03-004`: split the bet/call, bet/fold and bet/re-raise branches.
- Primary modules: `LCM-05`, `LCM-06`, `LCM-10`.
- Primary slots: 7, 8, 12, 16.

# Uncertainties Requiring Visual or Field Review

- exact flop and turn raise frequencies;
- exact value and bluff-raise combos;
- exact river small-bet branches;
- population frequency of missing re-raises;
- exact size thresholds by board and SPR.

# Source Verdict

`CP_G2_L10_AUDIO_COMPLETE`

`BET_SHAPE_TO_RAISE_BREADTH_MODEL_ACCEPTED`

`EXTREME_POPULATION_ADJUSTMENTS_REMAIN_FIELD_GATED`
