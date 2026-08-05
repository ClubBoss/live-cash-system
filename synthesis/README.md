# Synthesis System Index

Status: `ACTIVE_AUTHORITY_INDEX / CASH_INJECTION_COMPLETE / CARROT_PRECONSOLIDATION_READY`

## Active authorities

### Strategic inventory

- `HEURISTIC_CANDIDATE_REGISTRY_v0_2.md` — current 34-candidate inventory and promotion states.
- `CANDIDATE_TO_MODULE_VALIDATION_WORKBENCH_v0_2.md` — current module ownership, direct-drill coverage and Carrot mutation limits.
- `PROVISIONAL_FINAL_RULE_SLOT_ARCHITECTURE_v0_2.md` — current non-final 16-slot consolidation scaffold.

Historical v0.1 versions remain snapshots and are no longer current authorities.

### Cross-source evidence

- `CROSS_SOURCE_EVIDENCE_MATRIX_v0_1.md` — completed Smash/FTGU relations.
- `CASH_INJECTION_EVIDENCE_MATRIX_v0_1.md` — completed Cash Injection 10/10 relations.
- `CASH_INJECTION_COMPLETE_COURSE_DELTA_v1.md` — course-level filter-density and branch-elasticity synthesis.

### Remaining validation

- `REMAINING_SOURCE_QUESTION_MATRIX_v1_1.md` — current question status after Cash Injection completion.

Historical v1 remains the pre-Injection question snapshot.

### Integration governance

- `NEW_SOURCE_DELTA_INTEGRATION_PROTOCOL_v1.md` — relation and mutation rules.
- `../governance/PRE_FINALIZATION_FREEZE_AND_MUTATION_POLICY_v1.md` — frozen identities and finalisation gates.
- `../templates/SOURCE_BATCH_DELTA_ROUTING_TEMPLATE_v1.md` — per-batch transaction template.

## Authority order

1. canonical source record controls what a source said;
2. source-specific evidence matrix controls relation and hypothesis class;
3. question matrix v1.1 controls unresolved validation state;
4. candidate registry v0.2 controls candidate status;
5. workbench v0.2 controls module ownership and drill coverage;
6. slot architecture v0.2 controls provisional final grouping;
7. adaptive readiness manifest v0.2 controls learner-facing readiness;
8. provisional Playbook remains a historical reasoning snapshot.

The 16 slots are not stable learner IDs and do not override candidate or module identities.

## Incoming Carrot routing

```text
canonical Carrot record
→ question IDs in v1.1
→ candidate relation
→ affected slot
→ module boundary/explanation/drill delta
→ readiness update
```

For questions already `MECHANISM_CLOSED`, Carrot may simplify, add boundaries, context-split or reveal a real conflict. It should not duplicate the mechanism as a new candidate.

## Current coverage

- Smash: canonical and candidate pass complete;
- FTGU: 30/30 complete and mapped;
- Cash Injection: 10/10 complete and mapped;
- Carrot Grades 1–3: scaffold ready, material pending;
- candidate count: 34;
- stable adaptive modules: 11;
- validation question IDs: 38;
- provisional final slots: 16;
- direct candidate drill coverage: 30/34;
- source-gated direct drill gaps: 4;
- final admitted count: 0;
- intended final core: approximately 14–18.

## Index verdict

`SMASH_FTGU_CASH_INJECTION_SYNTHESIS_ROUTED`

`CARROT_SHOULD_UPDATE_TARGETED_BOUNDARIES_NOT_TRIGGER_GLOBAL_REBUILD`
