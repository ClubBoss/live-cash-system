# Live Cash OS

Live Cash OS is a Russian-first adaptive live-cash poker trainer with English support. Practical Mastery is the primary learning route; the legacy Diagnostic, 11-module / 55-drill curriculum, Cards, Review and Real Hands remain supported complementary surfaces.

## Release identity

- App version: `1.2.0`
- Canonical release URL: `https://live-cash-os-mobile-test.blufferus.workers.dev/`
- Source directory: `apps/live-cash-os`
- Root learner-state schema: `2`
- Practical Mastery nested profile schema: `3`
- Primary learning route: Practical Mastery
- Canonical browser/source release gate: `npm run test:release`

The former GPT-site deployment and `.openai/hosting.json` are not current release authority. Exact accepted source, CI and deployment identity come from Git and GitHub Actions.

## Practical Mastery contract

The current primary route implements:

- prediction -> mechanism -> decision learning;
- recognition/direct/changed/boundary evidence separation;
- topic-hidden integrated practice;
- causal repair and adaptive guided -> reduced -> hidden scaffolding;
- delayed non-identical `1/3/7` retention where eligible;
- perceptual/table-state transfer;
- reviewed real-hand application;
- performance telemetry that remains measurement rather than automatic mastery evidence.

Completion is not mastery. Diagnostic routing, immediate repetition, SELF hand review and telemetry do not manufacture independent transfer, retention or field-validation evidence.

## Source authority

Poker strategy is fail-closed against admitted source authority. Supporting/reference sources do not become strategy-answer authority.

One explicit Practical source ceiling remains:

`BL-11 = PARTIAL / POSITIVE_EV_SOURCE_ACCESS_REQUIRED`

Dedicated SB-vs-BB 3-bet-pot scored frequencies/branches must not be invented without inspectable solver/course authority.

## Architecture

```text
app/                       route shell, metadata and API
components/                learner-facing application UI
content/                    governed curriculum and Practical Mastery content
lib/                        learner state, persistence, evidence, routing and scheduling
db/                         durable cloud-state implementation
public/                     PWA manifest, service worker and assets
tests/                      type/content/governance/state/integration gates
e2e/                        desktop, mobile and cross-browser release flows
w10/                        later empirical validation workflow
```

Do not move curriculum, scoring, mastery, scheduler or persistence policy into route-shell presentation code.

## Persistence and recovery

The learner uses one reliable snapshot rather than a shadow Practical store:

- local state is available before cloud completion;
- root schema `2` contains the additive Practical profile schema `3`;
- import/export preserves Practical state;
- older snapshots require explicit replacement confirmation where applicable;
- divergent local/cloud ancestry fails closed rather than silently choosing a winner;
- lost-ack recovery preserves prior durable Practical evidence unless monotonic ancestry is established;
- API traffic remains outside PWA caching.

## Release and deployment gates

Canonical gate:

```bash
npm run test:release
```

It covers static validation plus the retained browser/E2E release suites. GitHub Actions additionally verifies required PR visual evidence when the changed scope is learner-facing.

Publication requires:

1. exact final PR head GREEN;
2. merge of that exact accepted head to current `main` without unreviewed drift;
3. exact resulting `main` GREEN;
4. exact-SHA Cloudflare Workers deploy;
5. generated Workers configuration containing exactly the isolated `TEST_DB` binding and no production `DB` binding;
6. post-deploy smoke against the canonical Workers URL.

The main-branch workflow deploys only after `validate` succeeds. `LIVE_CASH_TEST_D1_DATABASE_ID` supplies the isolated test database; the deployment gate rejects a generated `DB` production binding.

## Governance boundary

Current content governance remains deliberately review-pending:

- strategy: `CURRICULUM_STRATEGY_REVIEW_PENDING`;
- drills: `DRILLS_REVIEW_PENDING`;
- RU human approval: pending;
- EN human approval: pending;
- final composition: `REVIEW_PENDING`;
- `HUMAN_MASTERY_VALIDATED = FALSE`;
- W10 empirical validation: `NOT_COMPLETED`;
- W11 empirical/final acceptance: `NOT_COMPLETED`.

Machine checks, source locks, synthetic audits, CI and deployment smoke are rejection/engineering evidence only. They cannot create human poker approval or empirical learning-effectiveness proof.

## Release authorities

Read these before changing release truth:

- `../../START_HERE.md`
- `../../state/CURRENT_PROJECT_STATE.yaml`
- `../../PROJECT_ATLAS.md`
- `RELEASE_STATUS.md`
- `ACCEPTANCE_LEDGER.md`
- `.github/workflows/live-cash-os-ci.yml` at repository root for the executable release/deploy path.

After this owner-authorized engineering release, broad product/curriculum changes remain feature-frozen unless new real-use evidence or a separately verified material correctness, learning-integrity, continuity, safety, source or UX defect justifies reopening them.
