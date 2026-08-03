# Transcription Protocol

## Objective

Create a high-fidelity source record that preserves poker reasoning, examples, numbers, actions, and relevant visual information without adding downstream strategic analysis.

## Required metadata

```text
Course:
Module:
Lesson:
Instructor:
Original filename:
Source duration:
Source type: audio / video
Primary language:
Visual information available: yes / no
Transcription model:
Processing date:
```

Unknown values must be marked `[NOT PROVIDED]`, never guessed.

## Mandatory extraction rules

1. Preserve hedging and uncertainty such as `I think`, `maybe`, `kind of`, `usually`, and `to a certain extent`.
2. Preserve stack depths, positions, actions, board cards, suits, sizes, frequencies, pot sizes, rake, and solver values exactly.
3. Add `[MM:SS]` timestamps at every topic change, hand example, important visual change, and at least every 60-120 seconds.
4. Analyse the visual track when video is available.
5. Record only poker-relevant visual information.
6. Never guess an unclear card, suit, position, size, frequency, or action.
7. Use `[UNCLEAR: ...]`, `[VISUAL REQUIRED]`, `[AUDIO CUT]`, or `[SCREENSHOT RECOMMENDED]` where appropriate.
8. Keep instructor statements separate from downstream analysis.
9. Do not add course reviews, strategic criticism, heuristics, drills, summaries, or comparisons with other sources.
10. Begin directly with `# Source Metadata`; omit conversational acknowledgements.

## Known terminology

For Smash Live Cash:

- Instructor: Nick Petrangelo
- Nickname: Nicky P

Use standard notation where the source supports it:

- Positions: UTG, HJ, CO, BTN, SB, BB
- Actions: limp, open, call, fold, 3-bet, 4-bet, check, bet, raise, jam
- Stack depth: 100bb, 200bb
- Hands: AsKh, Ah5h, QQ, A5s, KQo
- Boards: Ks 8h 3d / 2c / Jh

## Required output structure

```text
# Source Metadata

# Detailed Transcript

## [MM:SS] Descriptive Section Heading

Faithful transcript...

[VISUAL NOTE]
- Screen type:
- Relevant poker information:
- Highlighted action or range:
- Discrepancy between speech and screen:

# Extracted Poker Objects

## Hand Examples

## Charts and Solver Screens

## Explicit Statements by the Instructor

## Uncertainties Requiring Review
```

## Explicit-statement rule

Include only claims the instructor directly states. Do not convert anecdotes into universal rules and do not strengthen the instructor's certainty.

## Completeness control

Before finishing, verify that:

- examples were transcribed rather than compressed;
- numbers were preserved;
- relevant visual ranges were captured;
- assumptions and exceptions were retained;
- unclear details were not guessed;
- separate hands were not merged.

If the transcript does not fit, stop after a complete sentence and record the exact resume timestamp. Do not compress the remainder.
