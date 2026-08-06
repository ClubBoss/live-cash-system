# Live Cash OS v1.1 — PR #3 selective port ledger

Status: `ACTIVE / REPLACEMENT_BRANCH / PR3_REFERENCE_ONLY`

Baseline:

- cleaned `main`: `6e4f6fc6d8d0f960433b7b762d5482f317ae7348`;
- replacement branch: `agent/live-cash-os-v1-1-rebuild`;
- reference PR: `#3` at `023aebcb36694b785ccbb2dac4569aab6fc1950e`;
- accepted v1.0 tree remains identical to `90ad4bac0053ee08d8739c42f10246866599d368`;
- stable Site URL, project and D1 binding remain untouched.

## Decision policy

PR #3 is not a merge candidate. Every change is classified as `KEEP`, `REWRITE` or `DISCARD`. Product source must be a coherent checkout-buildable snapshot; no one-time patch or workflow may generate required runtime files.

## KEEP — selective direct port after dependency review

- `learning/diagnostics/DIAGNOSTIC_RAW_RESPONSE_SCHEMA_v0_2.json`: retain as a new version; keep v0.1 immutable.
- `learning/diagnostics/DIAGNOSTIC_RESPONSE_SCHEMA_v0_2.json`: retain as a new version after exact scorer-output parity review.
- `apps/live-cash-os/lib/diagnostic-import.ts`: retain the strict parser approach; align all constants with the final v0.2 authorities.
- explicit transfer-probe tests: retain the invariant that repair/review/mixed mode alone cannot create `variant_transfer` evidence.
- T1 start-context and per-response-locale tests: retain.
- `i18n-extract`, `i18n-sync`, `i18n-check`: retain only as stable long-term tools after removing hidden materialisation dependencies.
- `i18n-apply-review-manifest`: retain the source-locked explicit-approval model.
- production smoke additions: retain only after direct RU/EN runtime exists.

## REWRITE — direction valid, implementation not admissible as-is

### `apps/live-cash-os/lib/model.ts`

Port only bounded integrity changes:

- `LocaleCode`, `MeasurementContext`, explicit `TransferProbe`;
- frozen T1 context at start;
- invalidation to `MIXED_EXPOSURE_INVALID_FOR_BASELINE` when learning begins during a cold run;
- per-response locale;
- explicit transfer evidence.

Do not port as-is:

- the duplicate evaluated-import contract using schema `0.1` while the branch introduces `score-0.2`;
- the broad learner-state merge rewrite. `max(exposures)` / `max(successes)` is not an event-safe merge and can lose independent evidence while implying conflict safety;
- learner-facing translation keys embedded in the domain model without a completed direct locale runtime.

For v1.1 either preserve and honestly document deterministic LWW, or implement an explicit event-identity merge contract with tests. Do not claim field-level conflict safety without proof.

### `scripts/score_learner_diagnostic.py`

Retain schema hardening, run identity, measurement context, locale and canonical misconception validation. Rewrite final validation so:

- T1 output is accepted only for exactly ten canonical T1 item IDs;
- `rerank_ready` cannot become true for an incomplete T1;
- timestamp format is validated, not merely non-empty;
- raw, evaluated and score schemas use one explicit version chain;
- v0.1 files remain versioned authorities rather than being silently replaced.

### SSOT documents

Rewrite `START_HERE.md`, `state/CURRENT_PROJECT_STATE.yaml`, app README, release status and acceptance ledger only after the direct runtime and schema authorities are coherent. They currently describe the accepted v1.0 milestone and must not claim v1.1 completion early.

### i18n catalogues and review manifest

- LCM-01 may be marked reviewed only against a non-null exact source hash after contextual RU/EN review.
- LCM-02–LCM-11 remain `DRAFT` / `REVIEW_REQUIRED` until reviewed.
- deterministic checks prove parity and token preservation, not editorial approval.

## DISCARD — do not port into the replacement branch

- `.github/workflows/live-cash-os-bilingual-materialize.yml`;
- any scheduled or one-time materialisation workflow;
- `scripts/apply-bilingual-runtime.mjs`;
- `scripts/postprocess-bilingual-runtime.mjs`;
- `scripts/prepare-bilingual-version.mjs`;
- `scripts/add-learning-route.mjs` after its output is integrated directly;
- `scripts/naturalize-source-russian.mjs` after reviewed copy is integrated;
- one-time string-replacement, quality-fix and migration scripts after useful output is manually reviewed;
- intermediate/empty locale catalogues;
- any CI path that uses `ALLOW_DRAFT_I18N=1` for a production release;
- PR #3 commit history and orchestration commits.

## Sequential implementation order

1. Integrity kernel: T1 v0.2 authority, explicit transfer probes, migration compatibility and tests.
2. Direct locale runtime: one semantic graph, visible RU/EN control, separate locale storage, dynamic document language, active-session preservation.
3. Editorial layer: LCM-01 gold RU/EN; LCM-02–LCM-11 honest review status.
4. Clean checkout gates: typecheck, lint, i18n, unit/content, build, desktop/mobile E2E.
5. SSOT and release evidence.
6. Replacement PR; PR #3 remains draft until replacement acceptance.
7. Same-project deployment and owner-authenticated live smoke.

## Current verdict

`MAIN_CLEAN / ACCEPTED_V1_TREE_PRESERVED`

`REPLACEMENT_BRANCH_CREATED`

`PR3_SELECTIVE_PORT_AUDIT_STARTED`

`V1_1_NOT_ACCEPTED`
