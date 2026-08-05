# Source Metadata

Course: Carrot Poker School  
Grade: 1  
Lecture: 06  
Descriptive title: Range and Nut Advantage for Flop C-Betting  
Instructor: Peter Clarke  
Original filename: `Lecture 06.mp4`  
Source duration from transcript: `59:07.08`  
Transcription engine: `mlx-whisper`  
Model: `large-v3`  
Language: English  
Translation: disabled  
Source ID: `CP-G1-L06`  
Source status: `AUDIO_COMPLETE / SOLVER_VISUALS_PENDING`

# Editorial Note

The lesson teaches a simplified one-size-per-texture c-bet system. Exact boards, frequencies and solver outputs remain visual-dependent.

# Source-Faithful Record

## [00:00] Two independent outputs

A flop c-bet strategy has two global outputs:

- betting frequency;
- bet size when betting.

The lecture argues that one practical size per texture is sufficient at this level. Frequency and sizing should not be mechanically tied together.

## [05:00] Range thinking does not replace hand thinking

Range analysis provides context for choosing the best action with each hand. It does not require sacrificing a hand's EV for an abstract range objective. There are no intentional loss leaders in equilibrium strategy.

## [12:00] Range advantage primarily informs frequency

Range advantage describes how well one full range performs against another. A large equity or distribution advantage supports more frequent betting, subject to position and the opponent's range shape.

Small numerical range advantages may not justify much betting, particularly when:

- the bettor is out of position;
- the opponent is polarised;
- the board supports the defender's strong region;
- checking preserves a robust range.

## [22:00] Nut advantage primarily informs sizing

Nut advantage concerns who owns more of the strongest hands and how concentrated those hands are.

A strong nut advantage allows the value region to seek a larger investment ceiling. A neutralised nut advantage supports a smaller size even when one player retains a general range advantage.

## [29:00] Frequency-control-sizing fallacy

The instructor explicitly rejects:

`bet rarely → therefore bet big`

Frequency and size are separate outputs with separate causal inputs.

Big and infrequent strategies are common because poor overall range performance and concentrated nutted value often coexist, not because low frequency itself causes a large size.

## [36:00] Texture and simplified c-bet families

The lesson applies the framework to several flop families:

- large range advantage plus neutralised nut advantage → high-frequency small bet;
- meaningful nut advantage without large range advantage → lower-frequency large bet;
- weak range and weak nut position → heavy check or range check;
- monotone or paired textures often neutralise or redistribute nut advantage;
- low connected boards can strongly favour the big blind.

## [50:00] Protect checks on hostile boards

On boards that strongly favour the defender, the preflop raiser should not bet only strong hands and leave a weak checking range. Strong overpairs and sets may check because:

- the opponent can invest later;
- the checking range needs protection;
- immediate betting is not required to realise value.

# Explicit Instructor Mechanisms

- Range advantage and nut advantage are distinct.
- Range advantage mainly informs global frequency.
- Nut advantage mainly informs investment ceiling and sizing.
- Frequency and sizing are independent decisions.
- Range thinking contextualises hand EV; it does not override it.
- Hostile textures may require range checking, including strong hands.
- One practical size per texture can preserve the core strategy.

# Cross-Source Hooks

- `STRONGLY CONFIRMS H-W02-003`: large sizing requires value-region support and surviving polarisation.
- `STRONGLY CONFIRMS H-W02-004`: response and strategy shape follow bet frequency and size separately.
- `EXTENDS H-W03-003`: wide or weak range states require postflop compensation.
- `CONFIRMS H-R04-010` and `H-R05-002`: protected checks include strong hands.
- `SUPPORTS LCM-05` and `LCM-06`.

# Uncertainties Requiring Visual Review

- exact flop cards and position pairs;
- exact range equities and nut-prevalence values;
- exact recommended frequencies;
- exact solver size mixes.

# Source Verdict

`CP_G1_L06_AUDIO_COMPLETE`

`RANGE_FREQUENCY_AND_NUT_SIZING_SEPARATION_ACCEPTED`
