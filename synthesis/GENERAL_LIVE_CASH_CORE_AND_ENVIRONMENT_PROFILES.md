# General Live Cash Core and Environment Profiles

Status: `ARCHITECTURE_DECISION`

## Decision

The canonical learning system is not Batumi-specific. It is a general live-cash decision system.

Batumi is the first real deployment and validation environment, not the source of the core rules.

## Layer 1 — General live-cash core

The core contains mechanisms expected to transfer across cardrooms and private games:

- effective-stack classification;
- preflop architecture by depth;
- squeeze and over-call logic;
- blind-range identity;
- single-raised-pot decision trees;
- 3-bet-pot range construction;
- multiway shared defence and sandwich effects;
- sizing-to-range-shape inference;
- value thresholds, bluff supply and blocker logic;
- opponent-model and node-specific exploits;
- session review, drills and spaced repetition.

A core heuristic must not depend on one city's player pool, rake structure or common open size.

## Layer 2 — Environment profile

Each actual game is described by variables rather than geography alone:

- stakes and currency;
- rake, cap or time charge;
- effective-stack distribution;
- frequency and size of straddles;
- number of players;
- open and isolation sizes;
- limp and over-call frequency;
- multiway frequency;
- 3-bet and 4-bet frequency;
- pool under-bluff / over-bluff tendencies by node;
- player turnover and table-selection conditions;
- private-game or casino constraints.

## Layer 3 — Deployment overlays

Examples:

- `Batumi live cash profile`;
- `Baku private-game profile`;
- `$1/$3 casino profile`;
- `$2/$5 deep-stack profile`;
- `short-stack / high-rake profile`;
- `straddled loose-passive profile`.

An overlay may change priorities, frequencies, examples and exploit weighting. It may not rewrite the general mechanism without evidence.

## Admission rule

Every candidate should be tagged as one of:

- `GENERAL_CORE`;
- `ENVIRONMENT_SENSITIVE`;
- `POOL_HYPOTHESIS`;
- `DEPLOYMENT_ONLY`.

Examples:

- `Effective stack sets preflop architecture` → `GENERAL_CORE`.
- `Open size should preserve useful SPR in straddled pots` → `GENERAL_CORE / ENVIRONMENT_SENSITIVE`.
- `A specific pool under-defends 25% flop bets` → `POOL_HYPOTHESIS` until measured.
- `Expected Batumi stack mix` → `DEPLOYMENT_ONLY`.

## Product implication

The commercial product should be positioned as a live-cash learning and decision system, not a Batumi preparation pack.

Batumi can become:

- the first user case;
- the first field-validation dataset;
- a launch-specific environment pack;
- evidence for iteration.

It should not limit the addressable market or define the curriculum taxonomy.

## Repository implication

- `synthesis/` contains general mechanisms.
- future `profiles/` contains environment-specific assumptions and calibration.
- source records remain source-faithful and geography-neutral unless the source itself describes a pool.
- drills use generic live-cash scenarios first, then optional environment variants.

## Verdict

`GENERAL_LIVE_CASH_CORE_WITH_ENVIRONMENT_OVERLAYS_ADOPTED`