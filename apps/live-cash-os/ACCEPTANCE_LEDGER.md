# Live Cash OS — Acceptance Ledger

Status: `FINAL_RED_TEAM_CANDIDATE / HUMAN_CONTENT_LANGUAGE_REVIEW_PENDING / INDEPENDENT_EVALUATOR_REQUIRED / NO_MERGE_NO_DEPLOY`

This ledger records the acceptance boundary for the post-Gauntlet Final Red-Team candidate. Automated implementation evidence may reject a bad candidate; it cannot create human strategy, drill, RU or EN approval.

## Candidate identity

- audited and current `main` base: `787313276f3d7290a6144f965eeb54dce050509e`;
- bounded branch: `repair/final-red-team-closure`;
- independent-evaluator surface: draft PR `#28`;
- Final Red-Team implementation code-freeze: `07cea8f9b3109e93e8c2a8b81ac77820a772d4f1`;
- code-freeze canonical release run: `31285270612` — `SUCCESS`;
- code-freeze counts: `178/178` unit/integration PASS; `128` canonical E2E PASS; `4` intentional skips; `0` E2E failures;
- canonical curriculum RU/EN composition digest: `7b44741c3032d0c3f084f60aab5513a40445e32394c36954496ba83e53127b0a`;
- final post-closure review-corpus fingerprint: `dc012812f07aeab120cc19b448c8d5414d83816b26ddc87fb208d50b01ac0f6e`.

The exact final candidate SHA is the Git/PR head after authority reconciliation and removal of all temporary write-enabled harnesses. The exact final release/cross-browser run IDs are recorded in GitHub Actions and the evaluator handoff rather than hard-coded into a commit that would mutate its own identity.

## Final Red-Team closure disposition

### RC-1 — fail-closed review identity

Implemented. An explicit stale retention/review ID cannot fall through to another due task. An explicit live ID affects only the named due task. The no-explicit-ID first-due fallback remains the documented compatibility behavior. Repair identity follows the same fail-closed boundary.

Regression evidence covers two due items, stale explicit ID, live explicit ID, no-ID fallback, module mismatch and queue/session race.

### RC-2 — deep schema-v2 persisted validation

Implemented without changing schema version. Runtime-used persisted structures now receive structural validation before use, including active sessions, review items, cards, field notes and known explain-back/structured Wave7 extensions.

Malformed current-schema import remains fail-closed. Cloud writes remain behind the shared validator. Supported historical/current schema-v2 state remains accepted. Existing conservative local-corruption recovery semantics remain intact.

### RC-3 — learner-facing internal jargon

Implemented as presentation-only repair. Raw reviewer/transfer/mastery state-machine vocabulary no longer needs to be exposed to learners on the repaired surfaces. Internal enum values, review authority, evidence semantics and `FIELD_VALIDATED` requirements are unchanged.

### RC-7 — repository truth

Current authority files are reconciled to this candidate. Historical production or earlier W1-W9 closure evidence is retained only as history and is not promoted into evidence that this candidate is deployed or human-approved.

### RC-8 — editorial review lock

Applied. The manifest remains `TRANSITIONAL_REVIEW_REQUIRED` and source-locks the post-closure learner-facing corpus under fingerprint `dc012812f07aeab120cc19b448c8d5414d83816b26ddc87fb208d50b01ac0f6e`.

## Preservation proof boundary

Final Red-Team Closure does not authorize or intentionally change:

- poker curriculum;
- correct-answer identities;
- drill/card IDs;
- source provenance;
- hard prerequisites;
- general scheduler routing policy;
- mastery semantics;
- `FIELD_VALIDATED` contract;
- `1/3/7` retention policy;
- Table Burst policy;
- learner-state schema version;
- stable production URL.

A demonstrated RC-1 identity-integrity bug is the only scheduler-adjacent behavior repaired.

## Governance and editorial truth

Current manifest truth is deliberately review-pending:

- manifest: `TRANSITIONAL_REVIEW_REQUIRED`;
- strategy: `CURRICULUM_STRATEGY_REVIEW_PENDING`;
- drills: `DRILLS_REVIEW_PENDING`;
- final composition: `REVIEW_PENDING`;
- strategy approval: `null`;
- drill approval: `null`;
- human RU approvals: none;
- human EN approvals: none.

No CI, model-assisted review, source-assisted review or fingerprint refresh is approval evidence.

## Exact-final automated evidence contract

Before the candidate is handed to the evaluator, the frozen Git/PR head must have both:

1. unchanged `npm run test:release` GREEN;
2. one-time existing six-project cross-browser matrix GREEN on the same SHA:
   - Chromium desktop;
   - Firefox desktop;
   - WebKit desktop;
   - iPhone/WebKit;
   - Android/Chromium;
   - iPad/WebKit.

After those runs, candidate source/docs/manifest must not change. Exact counts and run IDs belong to the immutable evaluator handoff/GitHub Actions evidence.

## Human and empirical gates still open

- genuine poker/strategy human review;
- genuine drill human review;
- final Russian human review;
- final English human review;
- W10 empirical validation from real learner use;
- W11 final integration/release acceptance.

W10 has not been empirically completed. W11 has not been completed. Those states must not be inferred from automated closure.

## Production boundary

Stable production URL: `https://live-cash-os.elmarsal.chatgpt.site/`.

Historical live smoke exists for earlier accepted source states. It does not prove this Final Red-Team candidate is deployed. No deployment is authorized in this task, and exact deployed Git SHA equality is not claimed.

If the independent evaluator later returns `KEEP`, deployment still requires separate authorization and the explicit sequence:

`exact accepted main -> publish existing ChatGPT Site -> live desktop/mobile smoke -> production truth update`

## Evaluator boundary

This work stops at a frozen candidate and evidence handoff. The independent evaluator decides `KEEP / REPAIR / REVERT`.

`CONTENT PRESERVATION > architecture cleanliness`

`NO MERGE / NO DEPLOY PERFORMED BY FINAL RED-TEAM CLOSURE`
