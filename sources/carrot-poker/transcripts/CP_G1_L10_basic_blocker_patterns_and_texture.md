# Source Metadata

Course: Carrot Poker School  
Grade: 1  
Lecture: 10  
Descriptive title: Basic Blocker Patterns and Texture  
Instructor: Peter Clarke  
Original filename: `Lecture 10.mp4`  
Source duration from transcript: `46:14.06`  
Transcription engine: `mlx-whisper`  
Model: `large-v3`  
Language: English  
Translation: disabled  
Source ID: `CP-G1-L10`  
Source status: `AUDIO_COMPLETE / SOLVER_VISUALS_PENDING`

# Source-Faithful Record

## [00:04] Blockers are a late-stage factor

The lecture introduces basic blocker patterns but immediately limits their role. Blockers usually move a close decision by a relatively small amount; they rarely justify an action by themselves.

The instructor places blocker work at the end of Grade 1 because the learner should first understand:

- full-tree EV;
- value, bluff and check categories;
- range shape;
- texture;
- action sequence;
- opponent and environment effects.

## [02:28] Blocker limitation rule

The explicit rule is:

> Never make a decision based solely or primarily on blockers.

A blocker may break a tie after the action family is already plausible. It must not convert a medium-strength hand into a large bet merely because one card appears attractive.

The source notes that exploitative conditions can easily dominate the relatively small theoretical difference between favourable and unfavourable blockers.

## [03:47] Insufficient reason trap

The lecture names a general reasoning error: selecting an action from one appealing reason while ignoring the other important EV factors.

Examples include:

- calling an extreme overbet only because Hero blocks two value combinations;
- bluffing because Hero holds a flush blocker while the hand has substantial check EV;
- declining a profitable bluff in a strongly favourable range world because the blocker is imperfect.

The blocker lesson is therefore also a misconception-repair lesson.

## [08:40] Five blocker-effect families

The lecture organises the practical material into five families:

1. turn flush-draw removal as the aggressor;
2. giving up relevant busted flush draws on the river;
3. flop raises using backdoor-flush and dead-suit effects;
4. flush blockers on completed-flush rivers;
5. blockers to the value range when bluff-raising the river.

## [09:12] Turn flush-draw removal

When bluffing the turn, Hero's preferred immediate result is usually a fold.

All else equal, a candidate bluff improves when it removes combinations that would call or raise. On many turns, relevant flush draws are high-EV continues and frequent raises. Holding one of their cards can therefore:

- reduce calls;
- reduce raises;
- increase immediate fold equity;
- make the betting strategy harder to counter.

The instructor repeatedly warns that this cannot override the hand's check EV or showdown value. A high-showdown-value hand may remain a pure check even with a theoretically useful blocker.

## [16:27] Busted-flush-draw blockers on the river

After a missed flush draw reaches the river, its strategic role can reverse.

In a neutral or unfavourable triple-barrel world, the opponent's busted draws often make up a large part of the folding range. Hero generally prefers to unblock those folds. A bluff that blocks the relevant missed draws can lose EV.

The effect depends on:

- the action sequence;
- which draws bet or checked earlier;
- the preflop ranges;
- the final board;
- whether Hero's range is favourable or unfavourable.

In a very favourable river-probe world, range asymmetry may make every no-showdown-value hand profitable to bluff even when its blocker is not ideal. Range advantage and fold equity remain the larger factors.

## [27:40] Backdoor flush draws and dead suits when raising flops

For a flop bluff-raise, the desired response is normally a fold.

On rainbow and two-tone boards, Hero can improve fold equity by:

- blocking backdoor-flush combinations that would continue;
- unblocking dead-suit combinations that cannot make a flush and are more likely to fold.

For a thin value-raise, the preferred response changes to a call. The pattern may therefore reverse: Hero may want to unblock weaker backdoor continues and block dead suits.

The source does not extend this simplistically to front-door flush draws. A front-door draw can have enough equity and implied odds that Hero would still prefer it to fold even when Hero currently has a pair.

## [34:40] Flush blockers on completed-flush rivers

When the flush completes, a relevant flush card can improve both:

- a bluff;
- a thin value bet.

It can reduce the opponent's flush combinations and sometimes remove bluff-catchers that prefer calling with the relevant suit.

The effect becomes more important as:

- the runout becomes more connected;
- the chosen size becomes larger;
- a greater share of the opponent's continuing range contains flushes or flush blockers.

For bluff-catching, a higher flush blocker is not automatically superior. It may remove both value and bluffs; a lower card can sometimes block value while leaving more bluffs available.

## [38:20] Blocking value when bluff-raising the river

A river bluff-raise against a polar betting range needs to fold more than the opponent's air. If Hero only wished to beat bluffs, Hero could call with a bluff-catcher.

Therefore a bluff-raise should usually block parts of the opponent's value range, such as:

- sets;
- two pair;
- strong top-pair or queen-x regions in the demonstrated node.

Low pairs may sometimes become bluffs because they remove value combinations. In this specialised node, showdown-value ordering may matter less because all non-calling hands have effectively equivalent showdown value.

The lecture rejects the generic rule “bluff the bottom of your range.” Bluff selection follows the response Hero needs and the range Hero must fold.

## [42:20] Closing caution and Grade 1 completion

The instructor closes by stating that blocker effects are complex but comparatively small. They should be learned as an additional layer after the more important Grade 1 concepts.

The learner is instructed to complete the exam before watching the feedback video. The source explicitly favours active recall and thought-process diagnosis over spoon-feeding.

# Explicit Instructor Mechanisms

- Blockers are secondary selectors, not primary action generators.
- One attractive reason is insufficient when other EV factors are ignored.
- For bluffs, remove likely continues and unblock likely folds.
- Blocker value changes with street, action sequence, range origin and texture.
- A missed-draw blocker can reverse from useful on the turn to harmful on the river.
- Bluff-raise and value-raise blocker goals can point in opposite directions.
- Completed-flush blockers affect bluffs, thin value and bluff-catches differently.
- River bluff-raises against polar ranges should block value, not merely air.
- Exploit conditions and major range asymmetries can dominate blocker differences.
- Prediction before feedback is part of the intended learning process.

# Cross-Source Hooks

- `STRONGLY CONFIRMS H-W03-011`: blocker quality is valid only after candidate and range qualification.
- `STRONGLY CONFIRMS H-W03-005`: bluff selection depends on the air and value inherited from prior actions.
- `STRONGLY CONFIRMS H-W01-009`: blocker interpretation is action-sequence and origin-range dependent.
- `CONFIRMS H-W02-002`: bluff candidates are chosen by check EV, fold target and future range state.
- `CONFIRMS H-W02-009`: river decisions require value, bluff, check and size reconstruction before blockers.
- `CONFIRMS H-R05-001`: recalculate the current range after every filter.
- `SIMPLIFIES LCM-09`: blockers become the final selector after value, texture and ancestry.
- `EXTENDS LCM-11`: insufficient-reason and spoon-feeding errors become explicit assessment targets.

# Uncertainties Requiring Visual Review

- exact boards, positions and action sequences in solver examples;
- exact EV and frequency differences between blocker variants;
- exact suit-specific mixed-strategy cells;
- the source's approximate four-to-five-percent blocker-effect estimate outside the demonstrated research context;
- exact bet and raise sizes.

# Source Verdict

`CP_G1_L10_AUDIO_COMPLETE`

`BLOCKER_LIMITATION_AND_SEQUENCE_DEPENDENCE_ACCEPTED`

`GRADE_1_LECTURE_CONTINUITY_COMPLETE`
