# Live Cash System — Project Atlas

Status: `ACTIVE / FEATURE_FREEZE / REAL_USE_VALIDATION / W10_EMPIRICAL_VALIDATION_NEXT`

## Fast navigation

| Need | Open |
|---|---|
| bootstrap / authority | `START_HERE.md` |
| machine state | `state/CURRENT_PROJECT_STATE.yaml` |
| governing 10/10 plan | `LIVE_CASH_OS_10_OF_10_MASTER_WAVE_PLAN_2026-08-07.md` |
| W10 evidence workflow | `apps/live-cash-os/w10/README.md` |
| bounded human review packet | `apps/live-cash-os/w10/HUMAN_REVIEW_TRANCHE_v1.md` |
| Diagnostic content | `apps/live-cash-os/content/diagnostic.ts` |
| Diagnostic feedback/routing | `apps/live-cash-os/lib/diagnostic-feedback.ts` |
| learner state model | `apps/live-cash-os/lib/model-core.ts` |
| scheduler / queues | `apps/live-cash-os/lib/scheduler.ts` |
| runtime repair registry | `apps/live-cash-os/lib/runtime-repair-registry.ts` |
| PR visual evidence | `apps/live-cash-os/e2e/pr-visual-evidence.spec.mjs` |

## Current product inventory

```text
app version: 1.2.0
state schema: 2
11 learning modules
55 governed drills
33 cards
10 structured Diagnostic/T1 items
9 learner evidence dimensions
feature freeze: ON
W10 empirical validation: NOT_COMPLETED
W11 release acceptance: NOT_COMPLETED
human strategy review: PENDING
human RU review: PENDING
human EN review: PENDING
final composition review: PENDING
```

Do not infer measured learner performance from repository inventory. Real-use evidence must come from the learner progress export plus explicit W10 observations.

## Measurement architecture

```text
cold structured Diagnostic
→ deterministic post-completion feedback / routing
→ lesson prediction + mechanism
→ action + reason decisions
→ repair on observed errors
→ changed / boundary transfer checks
→ delayed retrieval
→ reviewed field hands
→ W10 empirical evidence summary
→ human W10 adjudication
```

Free-text explain-back remains useful recall evidence for the learner, but the runtime does not pretend to automatically understand or grade that text. Explain-back self-check creates no skill evidence by itself; independent changed/boundary decisions do.

## Current path

```text
REAL_USE_VALIDATION
→ collect >=14-day W10 evidence
→ W10_EMPIRICAL_VALIDATION
→ evidence-backed repair only if repeated/high-severity findings justify it
→ W11_RELEASE_ACCEPTANCE
```

The repository is no longer in `T1_EXECUTION_NEXT`. Structured Diagnostic and its feedback loop are already implemented on current main.

## Feature-freeze boundary

Further learner-facing product work requires one of:

1. real-use/W10 evidence showing a repeated material problem;
2. a separately verified P0/P1 correctness, learning-integrity, continuity, safety or UX defect.

Do not reopen curriculum, scheduler policy, mastery thresholds, strategy truth, visual redesign or broad architecture from preference-level findings.

## Environment boundary

- Exact `origin/main` and exact-main CI must be re-resolved before repository work; do not trust an embedded SHA.
- The automated deployment target is the isolated Cloudflare **test mirror** with dedicated `TEST_DB` only.
- Production DB/deployment is not authorized by this Atlas.

## Acceptance boundary

Machine tooling may produce `READY_FOR_HUMAN_W10_REVIEW`; it may not create:

- `W10_COMPLETE`;
- human strategy approval;
- human RU approval;
- human EN approval;
- final composition approval;
- empirical field-valid truth without required reviewed field evidence.

## Verdict

`IMPLEMENTATION_COMPLETE_FOR_REAL_USE_VALIDATION`

`W10_EVIDENCE_COLLECTION_NEXT`

`FEATURE_FREEZE_UNLESS_EVIDENCE_JUSTIFIES_CHANGE`
