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
Source status: RAW
```

Unknown values must be marked `[NOT PROVIDED]`, never guessed.

## Fail-closed acceptance gate

A transcript is invalid and must not be returned as complete unless every rule below passes.

1. The first line is exactly `# Source Metadata`.
2. The document contains exactly one `# Detailed Transcript` heading.
3. The first transcript section begins with `## [00:00]` or the verified first spoken timestamp.
4. Every transcript section heading matches `## [MM:SS] Descriptive title`.
5. No transcript section is untimestamped.
6. No continuous transcript interval exceeds 120 seconds without another verified timestamp marker.
7. Every new hand example and every strategically relevant visual change has its own timestamp.
8. The document ends with the four required Extracted Poker Objects subsections.
9. No inferred analysis, advice, critique, or course summary is present.
10. Unclear cards, suits, positions, actions, sizes, frequencies, EV values, or solver settings are marked rather than guessed.

If any gate fails, silently repair the output against the original media before returning it. Never return a knowingly non-compliant transcript. Do not claim completion until the validation gate passes.

## Mandatory extraction rules

1. Preserve hedging and uncertainty such as `I think`, `maybe`, `kind of`, `usually`, and `to a certain extent`.
2. Preserve stack depths, positions, actions, board cards, suits, sizes, frequencies, pot sizes, rake, and solver values exactly.
3. Verify timestamps from the original media timeline. Never estimate them from transcript length.
4. Add `[MM:SS]` timestamps at every topic change, hand example, important visual change, and at least every 60-120 seconds.
5. Analyse the visual track when video is available.
6. Record only poker-relevant visual information.
7. Never guess an unclear card, suit, position, size, frequency, EV value, solver setting, or action.
8. Use `[UNCLEAR: ...]`, `[VISUAL REQUIRED]`, `[AUDIO CUT]`, `[INSTRUCTOR CORRECTION]`, or `[SCREENSHOT RECOMMENDED]` where appropriate.
9. Keep instructor statements separate from downstream analysis.
10. Do not add course reviews, strategic criticism, heuristics, drills, summaries, or comparisons with other sources.
11. Begin directly with `# Source Metadata`; omit conversational acknowledgements.
12. Remove only meaningless fillers. Do not paraphrase, compress, reorganize, merge examples, or improve the instructor's wording.

## Known terminology

Course-specific names and aliases must come from the task metadata. Do not transfer an instructor dictionary from one course to another.

For Smash Live Cash only:

- Instructor: Nick Petrangelo
- Nickname: Nicky P
- Forbidden misspelling: Nicki P

Use standard notation only where clearly supported by the source:

- Positions: UTG, HJ, CO, BTN, SB, BB
- Actions: limp, open, call, fold, 3-bet, 4-bet, check, bet, raise, jam
- Stack depth: 100bb, 200bb
- Hands: AsKh, Ah5h, QQ, A5s, KQo
- Boards: Ks 8h 3d / 2c / Jh

## Visual extraction rules

For talking-head footage with no poker-relevant visual information:

```text
[VISUAL NOTE]
- Screen type: Talking head
- Strategically relevant visual information: None
```

For charts, matrices, solver screens, or hand histories, record when visible:

- node or situation;
- positions;
- effective stack;
- preflop action;
- board;
- available and selected sizings;
- displayed range shape;
- clear pure actions;
- important mixed or boundary hands;
- readable frequencies and EV values;
- discrepancy between speech and screen;
- whether a screenshot is recommended.

Do not write vague notes such as `a chart is shown`.

## Required output structure

```text
# Source Metadata

Course:
Module:
Lesson:
Instructor:
Original filename:
Source duration:
Source type:
Primary language:
Visual information available:
Transcription model:
Processing date:
Source status: RAW

# Detailed Transcript

## [00:00] Descriptive Section Heading

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

If a subsection has no entries, write exactly `None in this source.`

## Explicit-statement rule

Include only claims the instructor directly states. Do not convert anecdotes into universal rules and do not strengthen the instructor's certainty.

## Internal validation pass

Before returning the answer, perform this internal check and repair any failure:

- Count all topic headings. Confirm every one begins with `## [MM:SS]`.
- Confirm the first timestamp is present.
- Confirm the maximum gap between timestamps is no more than 120 seconds.
- Confirm all timestamps are read from the original media.
- Confirm no required top-level heading is missing.
- Confirm no extra analytical section exists.
- Confirm all examples were transcribed rather than compressed.
- Confirm numbers and relevant visual ranges were preserved.
- Confirm assumptions and exceptions were retained.
- Confirm unclear details were not guessed.
- Confirm separate hands were not merged.

This validation is mandatory and must happen before output. Do not print the checklist.

## Incomplete-output rule

If the transcript does not fit, stop after a complete sentence and output:

```text
[TRANSCRIPT INCOMPLETE]
Resume from source timestamp: MM:SS
Last completed topic:
Next expected topic:
```

Do not compress the remainder.