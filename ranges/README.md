# Range Layer

Status: `RESERVED / ORIGINAL_RANGE_WORK_PENDING`

This layer is reserved for independently derived and validated range work. Source charts stay in their source-family audit records and are not copied here automatically.

## Planned structure

```text
ranges/assumptions/
ranges/independent/
ranges/validation/
ranges/anchors/
```

## Required metadata for every range artifact

- game format and player count;
- effective stack;
- rake and cap;
- ante or straddle state;
- action and sizing assumptions;
- derivation method;
- version and date;
- intended use: exact range, compressed anchor or environment overlay.

## Admission path

```text
source references and hypotheses
→ explicit assumptions
→ independent derivation
→ validation
→ compressed anchor
→ drill and misuse check
→ Playbook use
```

A course chart can inform a hypothesis or comparison, but it cannot become an admitted Live Cash System anchor without independent validation.

See `governance/REPOSITORY_INFORMATION_ARCHITECTURE_v1.md`.
