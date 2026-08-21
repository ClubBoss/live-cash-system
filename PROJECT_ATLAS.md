# Live Cash System — Project Atlas

Status: `ACTIVE / PRACTICAL_MASTERY_RELEASE_CANDIDATE / FEATURE_FREEZE_AFTER_AUTHORIZED_RELEASE / REAL_USE_VALIDATION / W10_EMPIRICAL_VALIDATION_FUTURE`

## Fast navigation

| Need | Open |
|---|---|
| bootstrap / authority | `START_HERE.md` |
| machine state | `state/CURRENT_PROJECT_STATE.yaml` |
| release status | `apps/live-cash-os/RELEASE_STATUS.md` |
| acceptance boundary | `apps/live-cash-os/ACCEPTANCE_LEDGER.md` |
| Practical Mastery program | `analysis/PRACTICAL_MASTERY_PROGRAM_V1.md` |
| Practical source authority | `apps/live-cash-os/content/practical-mastery/source-authority.ts` |
| Practical source gaps | `apps/live-cash-os/content/practical-mastery/source-gaps.ts` |
| Practical learner state | `apps/live-cash-os/lib/practical-profile-contract.ts` |
| W10 evidence workflow | `apps/live-cash-os/w10/README.md` |
| bounded human review packet | `apps/live-cash-os/w10/HUMAN_REVIEW_TRANCHE_v1.md` |
| Diagnostic content | `apps/live-cash-os/content/diagnostic.ts` |
| learner state model | `apps/live-cash-os/lib/model-core.ts` |
| scheduler / queues | `apps/live-cash-os/lib/scheduler.ts` |
| PR visual evidence | `apps/live-cash-os/e2e/pr-visual-evidence.spec.mjs` |

## Current product inventory

```text
app version: 1.2.0
root learner-state schema: 2
Practical Mastery nested schema: 3
primary learning route: Practical Mastery
Practical program topology: W0-W14 + integrated/adaptive/perceptual engines
legacy support layer: 11 modules / 55 governed drills / 33 cards
Diagnostic: 10 structured T1 items
source residuals: BL-11 PARTIAL only in the Practical source-gap ledger
empirical instrumentation: IMPLEMENTED
human mastery validated: FALSE
feature freeze after authorized release: ON
W10 empirical validation: NOT_COMPLETED
W11 empirical/final acceptance: NOT_COMPLETED
human strategy review: PENDING
human RU review: PENDING
human EN review: PENDING
final composition review: PENDING
```

Inventory does not imply measured learner performance. Real-use evidence must come from genuine learner state/telemetry plus explicit W10 observations and required human review.

## Current learning architecture

```text
Practical First Journey: predict -> mechanism -> decision
-> recognition/direct/changed/boundary evidence
-> topic-hidden integrated practice
-> causal repair + adaptive scaffolding
-> non-identical delayed 1/3/7 retrieval
-> perceptual/table-state transfer
-> reviewed real-hand application
-> performance telemetry
-> later W10 empirical evidence summary
-> human W10 adjudication
```

The legacy Diagnostic/module/Card/Review/Hands surfaces remain complementary. They do not create a second Practical mastery store.

## Authority boundaries

- `CANONICAL_SOURCE` and admitted source aliases may support strategy answer keys within their declared scope.
- `SUPPORTING_SOURCE` and `REFERENCE_SOURCE` may support pedagogy/reference but do not gain strategy-answer authority.
- `BL-11` remains `PARTIAL / POSITIVE_EV_SOURCE_ACCESS_REQUIRED`; dedicated BvB 3BP scored frequencies/branches require an inspectable solver or owner-provided course source.
- machine tests cannot create human approval or human mastery validation.

## Reliability and recovery

```text
reliable root schema 2 snapshot
+ nested Practical profile schema 3
+ local-first persistence
+ revision / opaque cloud-token contract
+ monotonic ancestry checks for lost acknowledgements
+ fail-closed divergent history
+ explicit import confirmation when older snapshots would replace newer Practical state
```

## Release path

Canonical release target:

`https://live-cash-os-mobile-test.blufferus.workers.dev/`

The accepted exact `main` SHA is deployed through the existing Cloudflare Workers workflow. Generated release configuration must contain isolated `TEST_DB` only and must not contain production `DB`. Post-deploy smoke must verify the deployed Git SHA and learner-critical flows.

The former GPT-site URL is not release authority.

## Current path

The owner-authorized Practical Mastery release can close engineering/release work after exact-head, exact-main and deployed-green gates. Empirical learning validation remains subsequent:

`REAL_USE_VALIDATION -> W10_EMPIRICAL_VALIDATION -> evidence-backed bounded repairs only if justified -> W11 empirical/final acceptance`

## Feature-freeze boundary

After this authorized release, further learner-facing product work requires one of:

1. genuine real-use/W10 evidence showing a repeated material problem;
2. a separately verified correctness, learning-integrity, continuity, safety, source or UX defect with positive net EV.

Do not reopen broad curriculum, scheduler policy, mastery thresholds, strategy truth, visual redesign or architecture from preference-level findings.

## Acceptance boundary

Machine tooling may prove engineering/release readiness; it may not create:

- human strategy approval;
- human drill approval;
- human RU approval;
- human EN approval;
- final composition approval;
- `HUMAN_MASTERY_VALIDATED = TRUE`;
- W10 completion without genuine empirical evidence.

## Verdict

`PRACTICAL_MASTERY_ENGINEERING_RELEASE_CANDIDATE`

`EMPIRICAL_INSTRUMENTATION_IMPLEMENTED`

`HUMAN_MASTERY_VALIDATED_FALSE`

`W10_EVIDENCE_COLLECTION_FUTURE`
