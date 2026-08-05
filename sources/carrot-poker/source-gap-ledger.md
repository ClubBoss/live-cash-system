# Carrot Poker — Source Intake and Gap Ledger

Status: `MATERIAL_PENDING / INTAKE_READY`

## Planned source sets

- Grade 1;
- Grade 2;
- Grade 3.

## Open intake tasks

### Before ingestion

- receive package(s);
- inventory lessons and supplemental files;
- identify duplicate files across grades/packages;
- determine whether lesson titles and hierarchy are explicit;
- calculate package checksums;
- verify transcript formats and source durations;
- identify charts, worksheets and visual-only claims.

### During ingestion

- assign immutable source IDs;
- create canonical source-faithful records;
- preserve local ASR uncertainty;
- register exact visual dependencies;
- map extracted mechanisms to existing question/candidate/module IDs;
- create new candidates only after the candidate-creation gate.

### After each batch

- update source registry;
- update this ledger;
- issue one batch QA;
- issue one bounded cross-source delta;
- update only affected readiness rows;
- avoid global Playbook rewrite.

## Known unknowns

Not yet known:

- exact lesson count;
- actual filenames and hierarchy;
- whether Grades share duplicate lessons;
- instructor naming and course version;
- presence of charts or supplemental worksheets;
- transcript quality;
- which remaining-source questions the material addresses.

No assumptions should be converted into source facts before inventory.

## Ledger verdict

`CARROT_INTAKE_PIPELINE_READY`

`ALL_SOURCE_CONTENT_PENDING`
