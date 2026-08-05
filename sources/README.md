# Sources

Canonical source-family routing is defined in `governance/REPOSITORY_INFORMATION_ARCHITECTURE_v1.md`.

## Active families

- `smash-live-cash/` — canonical corpus complete; claim-driven visuals only;
- `ftgu/` — 30/30 canonical and mapped; claim-driven visuals only;
- `cash-injection/` — 10/10 canonical and mapped; claim-driven visuals and field validation only;
- `carrot-poker/` — Grade 1 initial batch ingested; Grade 1 remains partial; Grades 2–3 pending.

## Family contract

Each family keeps its own:

- source registry;
- gap/intake ledger;
- canonical source records;
- source-family QA;
- visuals and supplemental artifacts when supplied.

Cross-source comparison belongs in `synthesis/`. Learner navigation belongs in `learning/`.

Use immutable source IDs. Do not create author-specific learner routes.

## Carrot state

Received:

- `CP-G1-L01` — Equity and EV;
- `CP-G1-EXAM` — Grade 1 Final Exam PDF;
- `CP-G1-EXAM-FB` — Grade 1 Exam Feedback.

Current boundaries:

- Grade 1 Lectures 02–10 remain pending;
- exam and feedback do not replace missing lectures;
- exact exam spots are reference-only;
- exact solver screens remain claim-driven visual dependencies;
- no new core candidate was created.

Authorities:

- `carrot-poker/source-registry.md`;
- `carrot-poker/source-gap-ledger.md`;
- `../analysis/module-audits/CARROT_G1_INITIAL_BATCH_01_QA_v1.md`;
- `../synthesis/CARROT_EVIDENCE_MATRIX_v0_1.md`;
- `../synthesis/CARROT_G1_INITIAL_BATCH_01_CROSS_SOURCE_DELTA_v1.md`.

## Source verdict

`SMASH_FTGU_CASH_INJECTION_BULK_SOURCE_WORK_COMPLETE`

`CARROT_GRADE_1_INCREMENTAL_INGESTION_ACTIVE`

`GRADE_1_PARTIAL / GRADES_2_AND_3_PENDING`
