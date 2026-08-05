# Source Batch Delta Routing Template v1

Status: `ACTIVE_TEMPLATE`

Use this template after package QA and canonical source ingestion.

---

# Batch Metadata

```yaml
source_family:
batch_id:
received_date:
archive_name:
archive_sha256:
new_source_ids: []
duplicate_source_ids: []
missing_expected_items: []
qa_report:
```

# Technical Verdict

```yaml
format_complete:
loops_found:
large_gaps_found:
rerun_required:
visual_dependencies:
source_continuity:
```

# Mechanism Routing

For every extracted mechanism:

```yaml
mechanism_id_within_batch:
source_ids: []
source_summary:
evidence_class: MECHANISM | POOL_HYPOTHESIS | PEDAGOGY | VISUAL_DEPENDENT | INSUFFICIENT
matched_candidate_ids: []
matched_module_ids: []
matched_question_ids: []
relation: CONFIRMS | SIMPLIFIES | EXTENDS | CONTEXT_SPLIT | CONFLICTS | ORTHOGONAL | INSUFFICIENT
assumptions:
boundaries:
confidence_effect:
```

# Candidate Creation Check

Complete only when proposing a new candidate.

```yaml
not_confirmation_because:
not_simplification_because:
not_boundary_because:
not_context_branch_because:
not_opponent_overlay_because:
not_environment_overlay_because:
not_drill_improvement_because:
not_prerequisite_because:
new_candidate_justification:
```

# Question Matrix Delta

| Question ID | Previous state | Batch evidence | New state | Remaining blocker |
|---|---|---|---|---|
| | | | | |

# Module Delta

| Module ID | Change class | Exact mutation | Learner progress effect | Drill/retest effect |
|---|---|---|---|---|
| | EVIDENCE / EXPLANATION / BOUNDARY / DRILL / CONTEXT_BRANCH / REVISION | | PRESERVE / LIGHT_CONFIRMATION / NEW_SCOPE_UNTESTED / PROVISIONAL | |

# Pool-Hypothesis Delta

For every population claim:

```yaml
hypothesis_id:
claim:
source_evidence:
external_dataset_present:
target_live_evidence_present:
trigger:
falsifiers:
evidence_grade:
field_mission:
status:
```

# Drill Delta

```yaml
new_drill_ids: []
changed_drill_ids: []
missing_direct_coverage_closed: []
new_boundary_variants: []
exact_visual_dependency:
```

# Readiness Delta

| Module | Dimension changed | Previous | New | Evidence |
|---|---|---|---|---|
| | | | | |

# Mutation Budget Check

```yaml
unrelated_source_files_touched: false
unrelated_modules_touched: false
historical_snapshots_rewritten: false
architecture_changed: false
stable_ids_renamed: false
final_rule_admission_attempted: false
```

Any `true` value requires explicit justification.

# Batch Verdict

```text
BATCH_ACCEPTED / PARTIAL / BLOCKED / REJECTED
QUESTION_IDS_UPDATED
CANDIDATE_COUNT_CHANGE: +0 unless independently justified
GLOBAL_RESTRUCTURE: NO by default
```
