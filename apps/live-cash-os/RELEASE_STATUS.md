# Live Cash OS — Release Status

Status: `GAUNTLET_4_INTEGRATED / RELEASE_INTEGRITY_HARDENING / HUMAN_CONTENT_LANGUAGE_REVIEW_PENDING / W10_PENDING`

## Current truth

Final Red-Team and Gauntlets 1–4 are integrated implementation history. The current bounded work is release-integrity hardening and final learner-shell cleanup; it does not create human approval or W10 evidence.

Canonical source gate:

`npm run test:release`

Exact commit and run identities live in immutable Git/GitHub Actions history rather than this self-referential status file.

## Release-integrity contract

The bounded closure addresses verified residue only:

- current Diagnostic navigation/copy must be the same contract exercised by deployed smoke;
- a test-mirror build must expose the exact Git SHA used to build it;
- smoke must verify that build identity rather than infer it from a version label;
- normal `main` push and an explicit main workflow dispatch must exercise the same test-mirror deploy/smoke path;
- smoke evidence must be retained for failure analysis;
- warm-up timing copy must match the actual bounded scheduler contract.

The mirror is intentionally storage-free and must not inherit production D1 bindings.

## Preservation boundary

This closure does not intentionally change:

- poker curriculum or correct-answer identities;
- drill/card IDs;
- source provenance;
- hard prerequisites;
- scheduler routing policy;
- mastery semantics;
- `FIELD_VALIDATED` contract;
- `1/3/7` retention policy;
- Table Burst policy;
- learner-state schema version;
- diagnostic scoring semantics;
- stable production URL.

## Governance truth

The editorial manifest intentionally remains review-pending:

`TRANSITIONAL_REVIEW_REQUIRED / CURRICULUM_STRATEGY_REVIEW_PENDING / DRILLS_REVIEW_PENDING / FINAL_COMPOSITION_REVIEW_PENDING`

- strategy approval: `null`;
- drill approval: `null`;
- human RU approvals: none;
- human EN approvals: none;
- final composition approval: pending.

A source-lock fingerprint refresh records changed learner-facing shell copy. It is deterministic bookkeeping, not human approval.

## Human and empirical gates

Still open unless genuine later evidence exists:

- human poker/strategy review;
- human drill review;
- final Russian review;
- final English review;
- W10 empirical validation from real learner sessions;
- W11 final integration/release acceptance.

W10 is not completed by this closure.

## Deployment truth

Stable URL remains:

`https://live-cash-os.elmarsal.chatgpt.site/`

The Cloudflare Workers test mirror is separate release evidence and is not stable production. Historical stable-production smoke proves only the source state against which it was recorded. A current mirror smoke may prove exact-main deployability, but it must not be presented as stable-production deployment.
