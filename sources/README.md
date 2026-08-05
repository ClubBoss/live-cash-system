# Sources

Canonical source-family routing is defined in `governance/REPOSITORY_INFORMATION_ARCHITECTURE_v1.md`.

## Active families

- `smash-live-cash/` — canonical corpus complete; claim-driven visuals only;
- `ftgu/` — 30/30 canonical and mapped; charts reference-only;
- `cash-injection/` — 10/10 canonical and mapped; field-gated hypotheses;
- `carrot-poker/` — Grade 1 Lectures 01–04 plus exam/feedback ingested; Grade 1 partial; Grades 2–3 pending.

## Family contract

Each family keeps its own registry, gap ledger, canonical records, QA and supplemental artifacts. Cross-source comparison belongs in `synthesis/`; learner navigation belongs in `learning/`.

Use immutable source IDs. Do not create author-specific learner routes.

## Current Carrot state

Received:

- `CP-G1-L01` through `CP-G1-L04`;
- `CP-G1-EXAM`;
- `CP-G1-EXAM-FB`.

Pending:

- Grade 1 Lectures 05–10;
- Grades 2–3.

Boundaries:

- duplicate bundles are ignored after byte-level verification;
- exam and feedback do not replace missing lectures;
- exact exam/solver spots remain reference-only;
- no new core candidate was created.

Authorities:

- `carrot-poker/source-registry.md`;
- `carrot-poker/source-gap-ledger.md`;
- `../analysis/module-audits/CARROT_G1_BATCH_02_QA_v1.md`;
- `../synthesis/CARROT_EVIDENCE_MATRIX_v0_1.md`;
- `../synthesis/CARROT_G1_BATCH_02_CROSS_SOURCE_DELTA_v1.md`.

## Verdict

`SMASH_FTGU_CASH_INJECTION_BULK_SOURCE_WORK_COMPLETE`

`CARROT_GRADE_1_INCREMENTAL_INGESTION_ACTIVE`

`GRADE_1_L01_TO_L04_MAPPED / L05_TO_L10_PENDING`
