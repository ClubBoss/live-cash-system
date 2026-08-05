# Source Metadata

Course: Carrot Poker School  
Grade: 2  
Lecture: 02  
Descriptive title: Bet Sizing and Value Tiers  
Instructor: Peter Clarke  
Original filename: `Lecture 02.mp4`  
Source duration from transcript: `62:10.88`  
Transcription engine: `mlx-whisper`  
Model: `large-v3`  
Language: English  
Translation: disabled  
Source ID: `CP-G2-L02`  
Source status: `AUDIO_COMPLETE / SOLVER_VISUALS_PENDING`

# Source-Faithful Record

## [00:00] Build a sizing toolkit before choosing a hand action

The lecture frames a betting toolkit as the finite list of sizes available in a node. The strategic task is not to use every size, but to know which value regions require which investments.

The source rejects hand-first sizing. The order is:

1. identify the node and landing ranges;
2. estimate the value region’s equity and investment ceiling;
3. choose the useful size menu;
4. place individual hands into that menu.

## [08:00] Value tiers

The lecture develops four made-hand tiers.

- Tier 1: very high-equity hands that can support the largest investments.
- Tier 2: strong value hands that commonly support a large but non-maximal size.
- Tier 3: thinner value or protection-sensitive hands that may prefer a small bet, especially OOP.
- Tier 4: hands not strong enough to value-bet the available size; they normally check unless selected as bluffs for another reason.

The equity bands are pedagogical approximations, not universal thresholds. Finishing equity after the opponent continues matters more than landing equity before the bet.

## [13:00] Delayed c-bet and block-bet opportunities

Delayed c-bet nodes often contain many medium-strength hands. OOP, checking keeps the action open, so a small bet may outperform check for Tier 3 hands by gaining thin value and denial.

IP, checking is more valuable because it closes the action. Therefore a tiny turn bet is less attractive, and the source often prefers a larger size-or-check simplification.

## [25:00] Two value regions can drive two sizes

The source presents strategies where:

- the strongest value region drives an overbet or very large size;
- a thinner, more vulnerable region drives a small size;
- the middle checks;
- bluffs are distributed around the value needs of each size.

A hand may be downgraded into a slower line when blockers or range protection make check attractive. It should not be upgraded into a larger size merely because the player wants more value.

## [40:00] Size follows the value range and relative polarisation

Large turn sizes are most appropriate when:

- the betting range contains a sufficiently strong value tier;
- the opponent’s range is condensed;
- the bettor is not relying on frequent raises from the opponent to build the pot;
- the continuing range remains wide enough for the selected value hands.

The lecture repeats that low betting frequency does not itself imply a large size.

## [49:00] Three-flush and blocker-sensitive value betting

On completed-flush turns, a very large bet may isolate the bettor against too many flushes and strong draws. A high flush can also be a poor value bet if it blocks too much of the opponent’s continuing range.

The source distinguishes:

- raw hand strength;
- the opponent’s continuing composition;
- the effect of blockers on calls and raises;
- the EV of checking and allowing future aggression.

# Explicit Instructor Mechanisms

- Construct the size toolkit from value needs before assigning bluffs.
- Compare landing equity with finishing equity.
- Small OOP bets can serve thin value and denial because check does not close action.
- IP checking is more valuable and can remove the need for tiny bets.
- The strongest value region controls the investment ceiling.
- Blockers can justify slow-playing a strong hand when they remove too many continues.

# Cross-Source Hooks

- `STRONGLY CONFIRMS H-W02-001`: value threshold precedes bluff volume.
- `STRONGLY CONFIRMS H-W02-003`: large size requires a value region that survives the opponent’s response.
- `EXTENDS H-R04-010` and `H-R05-002`: strong and medium hands protect checks and small-bet branches.
- `SUPPORTS H-W01-006`: OOP realisation and protected passive lines; exact deep-stack boundary remains open.
- Primary modules: `LCM-03`, `LCM-05`, `LCM-06`.
- Primary slots: 6, 8, 9.

# Uncertainties Requiring Visual Review

- exact equity bands used for tiers;
- exact size menus and frequencies;
- exact three-flush examples and blockers;
- exact solver EV differences between bet and check.

# Source Verdict

`CP_G2_L02_AUDIO_COMPLETE`

`VALUE_TIER_AND_SIZING_TOOLKIT_MODEL_ACCEPTED`
