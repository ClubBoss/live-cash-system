# Practical Mastery — Wave 4 Board + Hand-Family Recognition Engine V1

Status: `W4_SPEC_COMPLETE / IMPLEMENTATION_PENDING`

## Objective

Build automatic recognition of board classes, runout changes and hand families so later strategy modules can test decisions without re-teaching basic classification every time.

## Board classes

A-high dry, K-high dry, Q-high dry, broadway-connected, low-connected, middling-connected, paired-high, paired-low, monotone, dynamic two-tone, static rainbow, three-low and selected high-low disconnected structures.

## Runout classes

Overcard, undercard/blank, flush-completing, straight-completing, board-pairing, nut-changing, range-shifting and brick river classes.

## Hand families

Overpair, top-pair strong kicker, top-pair weak kicker, second pair, underpair, two pair, set, straight/flush made hand, nut draw, weak draw, combo draw, pair+draw, ace-high showdown, bluff catcher, vulnerable made hand and air.

## Training loop

`see state -> classify board -> classify hand family -> identify what changed -> decide which strategic variable now matters`

Recognition must precede strategy feedback in early reps and disappear as an explicit cue in mixed reps.

## W4 DoD

- board taxonomy: PASS in spec
- hand-family taxonomy: PASS in spec
- runout change taxonomy: PASS in spec
- concrete-hand-to-family transfer requirement: PASS
- runtime recognition drills: PENDING

Verdict: `SPEC_PASS / RUNTIME_IMPLEMENTATION_PENDING`
