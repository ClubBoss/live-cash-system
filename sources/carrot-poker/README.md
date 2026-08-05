# Carrot Poker Source Family

Status: `PLANNED / INGESTION_SCAFFOLD_READY / NO_SOURCE_MATERIAL_RECEIVED`

## Scope

One source family for the three planned Carrot course sets:

- Grade 1;
- Grade 2;
- Grade 3.

Grades are modules inside one corpus, not three unrelated repositories or parallel learner curricula.

## Stable routing

```text
sources/carrot-poker/
├── README.md
├── source-registry.md
├── source-gap-ledger.md
├── CARROT_INGESTION_AND_ROUTING_SPEC_v1.md
├── transcripts/
├── visuals/
└── artifacts/
```

Directories become populated only when material arrives.

## Source ID policy

Do not assume the course's internal hierarchy before inventory.

After the first package is inspected, assign immutable IDs under one of these prefixes:

- `CP-G1-*`;
- `CP-G2-*`;
- `CP-G3-*`.

The suffix should reflect the smallest stable lesson identity available from the source package. Once assigned, an ID is not renamed merely because a title or filename is cleaned later.

## Integration rule

Carrot source lessons remain source-faithful records.

Extracted mechanisms are routed through:

- `synthesis/REMAINING_SOURCE_QUESTION_MATRIX_v1.md`;
- `synthesis/CANDIDATE_TO_MODULE_VALIDATION_WORKBENCH_v0_1.md`;
- `synthesis/NEW_SOURCE_DELTA_INTEGRATION_PROTOCOL_v1.md`;
- `templates/SOURCE_BATCH_DELTA_ROUTING_TEMPLATE_v1.md`.

Carrot must not create a parallel chapter order in the adaptive learner route.

## Expected high-value routing areas

These are routing priorities, not assumptions about course content:

- preflop and blind architecture;
- OOP realisation and protected passive branches;
- range and bet-shape explanations;
- 3-bet-pot ancestry;
- multiway structure;
- deep/short-stack context;
- exploit methodology;
- alternative explanations, boundaries and drills.

## Source-purity rule

- preserve instructor hedging and uncertainty;
- do not silently reconcile disagreement with Smash or FTGU;
- do not copy charts or proprietary examples into product-facing content;
- route exact chart use to the independent `ranges/` layer;
- mark visual-only claims explicitly.

## Current verdict

`CARROT_FAMILY_SCAFFOLD_READY`

`GRADE_1_2_3_MATERIAL_PENDING`
