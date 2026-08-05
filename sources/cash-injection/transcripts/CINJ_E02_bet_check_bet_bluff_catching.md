# Source Metadata

Course: Cash Injection  
Episode: 2  
Official lesson title: not stated in the supplied audio  
Descriptive label: Bluff-Catching the Bet-Check-Bet Line  
Instructor: not identified by name in the supplied audio  
Original filename: `Episode 02.mp4`  
Source duration from transcript: `24:47.20`  
Transcription engine: `mlx-whisper`  
Model: `large-v3`  
Language: English  
Translation: disabled  
Source ID: `CINJ-E02`  
Source status: `AUDIO_COMPLETE / NEEDS_VISUAL_REVIEW / POOL_HYPOTHESIS_REQUIRES_VALIDATION`

# Editorial Note

The audio is continuous and technically complete. The lesson uses solver output, personal hands and references to mass data. Exact boards, suits, sizes, frequencies and solver cells remain visual-dependent.

The instructor makes strong claims that the studied line is broadly overbluffed. The range-ancestry mechanism is accepted; the population magnitude remains hypothesis-gated.

# Source-Faithful Record

## [00:06] Episode trigger

The lesson studies the line:

```text
Villain c-bets flop
→ checks turn
→ bets river after Hero checks
```

The instructor calls this intermittent or “scattered” aggression and presents it as one of the most common bluff-catching nodes in cash games.

## [01:40] Why the branch may become bluff-heavy

The analysis starts from the range path rather than the river card alone.

The flop c-bet can begin very wide. When the aggressor checks the turn:

- some strong value that would normally continue is removed from the later betting branch;
- many medium-strength hands and missed overcards remain;
- the river can offer a large number of apparent bluff candidates;
- thin value may be difficult to find on some runouts.

The instructor argues that humans often choose too many of the available missed hands as river bluffs relative to the value hands that survive the same path.

## [03:00] Value-region audit

The lesson compares the river betting range with the hands that can credibly value-bet after checking the turn.

The key question is not whether the bettor can name some value hands, but whether the branch contains enough value combinations relative to all the missed hands that arrived through the flop-bet/turn-check path.

The instructor repeatedly distinguishes:

- absolute hand strength;
- whether the hand beats bluffs;
- whether the line itself supplies enough value.

## [06:40] Turn underaggression versus river overaggression

A central explanation is that humans may fail to bluff enough in lower-EV or less intuitive turn spots, then compensate incorrectly by bluffing too many of the hands that reach the river after checking.

This creates a branch split:

- turn betting can be too restrained;
- the later bet-check-bet river branch can still be too bluff-heavy.

The lesson therefore rejects a global label such as “this player underbluffs” when different streets and branches may contain opposite errors.

## [08:50] Bluff-catcher selection

The instructor recommends calling very widely with hands that beat the available bluffs when the branch is believed to be severely overbluffed.

Blockers and exact hand ranking are treated as secondary once the estimated bluff density is far above the break-even threshold. The audio includes very aggressive language about calling every bluff-catcher in the demonstrated node.

Project interpretation limits this to a hypothesis-conditioned branch rather than a universal rule.

## [12:00] Range ancestry and source position

The lesson notes that the plausibility of overbluffing depends on how many weak combinations entered the line in the first place.

Wide opening ranges and high-frequency flop c-bets produce more potential river bluffs. Tighter origin ranges or runouts that naturally preserve more value reduce the exploit.

## [17:00] Solver and human selection differences

The solver is described as selective about which missed hands continue bluffing. Humans may instead choose bluffs using simpler narratives such as:

- “I cannot win at showdown”;
- “the river is scary”;
- “I represented strength on the flop”;
- “the opponent looks capped.”

The instructor argues that this less disciplined selection creates too many river bluffs in the target branch.

## [22:00] Practical recommendation

The practical advice is to identify the exact bet-check-bet line, reconstruct its value and missed-hand supply, and defend more aggressively than solver-inspired intuition may suggest when the branch is evidenced as overbluffed.

The recommendation is strongest against wide ranges and weaker opponents. Exact numerical claims and “call every bluff-catcher” language remain population-dependent.

# Explicit Instructor Mechanisms

- River bluff density depends on the path that produced the betting range.
- A wide flop c-bet followed by a turn check can preserve many missed hands while removing some strong value.
- A player may underbluff one branch and overbluff another.
- Bluff-catching should compare credible value with all missed hands that can reach the node.
- When bluff frequency is grossly excessive, blocker differences matter less than range-level imbalance.
- Wide origin ranges increase the potential bluff supply of the bet-check-bet line.

# Project Interpretation Boundaries

Accepted as mechanism:

- reconstruct value and bluffs through the actual bet-check-bet path;
- distinguish branch-specific overaggression from global player labels;
- treat origin-range width and turn filtering as inputs to river bluff supply;
- use blockers only after the line-created value/bluff regions are established.

Retained only as pool hypotheses:

- the line is broadly and massively overbluffed across relevant pools;
- every bluff-catcher should call against an unknown;
- the branch wins more than half the time in the target live environment;
- online mass-data tendencies transfer directly to Batumi.

# Cross-Source Hooks

- `STRONGLY CONFIRMS H-W02-009`: river defence begins with value, size and line-created bluff supply.
- `STRONGLY CONFIRMS H-W03-005`: bluff supply is created by prior streets.
- `CONFIRMS H-W03-011`: blocker value is downstream of ancestry.
- `EXTENDS H-W03-004`: different branches of one player may contain opposite errors.
- `CONFIRMS H-W02-007`: exploit the exact bet-check-bet branch, not a personality label.
- `SUPPORTS LCM-09`: river ancestry audit.
- `SUPPORTS LCM-10`: evidence-gated overbluff overlay.

# Uncertainties Requiring Visual Review

- exact boards, cards and suits;
- exact bet sizes and pot odds;
- exact solver value/bluff frequencies;
- exact mass-data filters and sample definition;
- exact blocker effects in displayed matrices;
- whether every example shares the same preflop configuration.

# Source Verdict

`CINJ_E02_AUDIO_COMPLETE`

`BET_CHECK_BET_ANCESTRY_MECHANISM_ACCEPTED`

`OVERBLUFF_MAGNITUDE_FIELD_VALIDATION_PENDING`
