# Range Layer

Status: `ACTIVE / PREFLOP_DIRECTIONAL_ANCHORS_V0_1`

This layer contains independently derived range assumptions, machine-readable libraries, validation and compressed learner-facing anchors. Proprietary source charts remain private comparison evidence and are not copied into product-facing outputs.

## Active structure

```text
ranges/assumptions/
  BATUMI_LIVE_PREFLOP_ASSUMPTIONS_v1.md

ranges/independent/
  PREFLOP_ANCHOR_LIBRARY_v0_1.json

ranges/validation/
  PREFLOP_ANCHOR_VALIDATION_REPORT_v0_1.md

ranges/anchors/
  LIVE_CASH_PREFLOP_ANCHORS_v0_1.md
```

## Current range state

```text
five preflop anchor cards active
RFI/core-flex families active
squeeze answer key active
polar target-fold answer key active
solver calibration pending
room-specific field calibration pending
final range admission pending
```

## Required metadata

Every range artifact must state:

- game format and player count;
- effective stack;
- rake/cap state;
- ante or straddle state;
- action and sizing assumptions;
- derivation method;
- version/date;
- intended use;
- validation and field status.

## Admission path

```text
explicit assumptions
-> independent derivation
-> combinatorial and changed-node validation
-> source-purity comparison
-> compressed anchor
-> direct drills and misuse checks
-> field/solver calibration where material
-> Playbook admission
```

## Current use boundary

Approved:

- directional table use;
- compact drills;
- changed-node diagnosis;
- learner retrieval.

Not approved:

- exact equilibrium claims;
- universal Batumi charts;
- copied source matrices;
- fixed mixed frequencies;
- final admitted rule IDs.

## Next range work

Do not expand into broad chart production. Perform targeted solver calibration only when an edge band can materially change a high-frequency decision, direct answer key or final admission.

See:

- `governance/REPOSITORY_INFORMATION_ARCHITECTURE_v1.md`;
- `governance/POST_SOURCE_FREEZE_AND_MUTATION_POLICY_v2.md`;
- `reports/PREFLOP_ARCHITECTURE_WAVE_TERMINAL_REPORT_v1.md`.
