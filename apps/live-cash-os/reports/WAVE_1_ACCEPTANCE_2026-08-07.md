# Wave 1 Closure Audit - Product Comprehension and Information Architecture

Date: 2026-08-07
Audit base `origin/main`: `26b1dec72822a706f82cf485042c18e166397bdd`
Baseline CI: run `31175320582` - `PASS` on the exact audit-base SHA
Closure branch: `repair/w1-comprehension-closure`

## Verdict

`WAVE_1_IMPLEMENTATION_ACCEPTED / COMPREHENSION_EVIDENCE_PENDING`

This supersedes the earlier verdict `WAVE_1_ACCEPTED_WITH_EMPIRICAL_COMPREHENSION_VALIDATION_DEFERRED_TO_WAVE_10`.

The original Master Plan makes fresh-context comprehension evidence part of Wave 1 acceptance itself. That required evidence does not exist in repository truth and is not simulated here. Therefore strict `WAVE_1_ACCEPTED` is not currently supportable.

The implementation verdict is bounded to Wave-1-owned product/IA behavior on the audited green main. Current bilingual language truth remains governed by the Wave 4R ledger and is not re-approved by this report. The closure branch adds tests/evidence/truth artifacts but is not merged to main.

## Independent gap audit

Status vocabulary for this audit: `PASS`, `PARTIAL`, `FAIL`, `BLOCKED_EXTERNAL`.

| Original Wave 1 DoD / objective | Status | Evidence / boundary |
|---|---|---|
| Current main fetched before repair work | `PASS` | Audit base `26b1dec72822a706f82cf485042c18e166397bdd` |
| Current-main CI green before branch creation | `PASS` | Run `31175320582`, exact same SHA |
| Product purpose visible on first screen | `PASS` | Today exposes a compact learning promise, one recommended task and progress boundary |
| One obvious next action | `PASS` | Fresh Today exposes one primary Start action |
| Diagnostic has a human-facing primary name | `PASS` | `Starting decision check` / `Стартовая проверка мышления`; `T1` is secondary identity |
| Diagnostic purpose | `PASS` | Ten unprompted decisions used to guide later priorities after separate review |
| Diagnostic optionality | `PASS` | Copy explicitly says it can be skipped and lesson one can start immediately |
| Diagnostic duration | `PASS` | About 15 minutes is explicit |
| Diagnostic output/result | `PASS` | Responses are saved for separate review; reviewed result can prioritise up to two topics |
| Diagnostic skip path | `PASS` | Learning remains available without starting the diagnostic |
| Diagnostic evaluation boundary | `PASS` | UI separates raw responses from reviewed results and does not present the start check as automatic strategic scoring |
| Navigation: Today/Learn/Review/Cards/Map/Hands/Check | `PASS` | Seven primary destinations exist in both locales |
| Learner-facing progress/status labels | `PASS_W1_IMPLEMENTATION` | Core maps learner states to human labels instead of rendering raw enum values; broader language quality remains W4R-owned |
| Useful empty-state behavior | `PASS_CURRENT_W1_SURFACES` | Fresh Review explains that nothing is due and where future review work comes from |
| First lesson in <=2 intentional actions | `PASS` | Fresh Today Start opens the lesson directly; focused regression asserts this path |
| RU/EN semantic parity of primary IA | `PASS_W1_IMPLEMENTATION` | Same seven destinations and diagnostic/first-lesson paths; explicit final language approval remains W4R-owned |
| No learner-facing internal state/evidence terminology | `BLOCKED_EXTERNAL` | Wave 4R owns the final rendered-corpus terminology audit and explicit RU/EN re-review; this branch does not rewrite that copy |
| All primary shell RU/EN copy independently approved | `BLOCKED_EXTERNAL` | The current status ledger has not yet supplied a separate Wave 1 bilingual approval record that can replace human/editorial evidence |
| Desktop/mobile E2E for revised first-use flow | `PARTIAL` | Audited main release gate is green; focused Wave 1 desktop/mobile assertions are added on this branch, but the current CI workflow does not trigger for feature branches/PRs |
| Production smoke rejects superseded shell strings | `PASS_IMPLEMENTATION` | Retained smoke is updated on this branch to assert the current first-use shell, seven destinations, optional diagnostic and forbidden superseded markers |
| Authenticated production DOM confirmation | `BLOCKED_EXTERNAL` | Current repository truth says authenticated Site DOM smoke and exact deployed SHA are unavailable to automation |
| At least 3 fresh-context walkthroughs | `BLOCKED_EXTERNAL` | `BLOCKED_HUMAN_EVIDENCE`; no qualifying records exist |
| >=90% understand diagnostic purpose/optionality | `BLOCKED_EXTERNAL` | `BLOCKED_HUMAN_EVIDENCE`; cannot be inferred from copy or Playwright |
| >=90% locate Learn/Review/Real Hands | `BLOCKED_EXTERNAL` | `BLOCKED_HUMAN_EVIDENCE`; cannot be inferred from navigation presence |
| Old Wave 1 acceptance claim is truthful | `PASS_AFTER_THIS_REPORT` | Earlier acceptance-with-deferral claim is explicitly superseded |

## Automated closure added on this branch

Focused Playwright coverage: `e2e/wave1-first-use.spec.mjs`.

It checks only observable implementation contracts and deliberately does not claim comprehension percentages:

- RU first-use purpose/boundary surface;
- RU seven-destination primary IA;
- direct first-lesson path from fresh Today;
- EN parity for the same IA and first-lesson path;
- fresh Review empty state;
- RU map does not expose raw learner-state enum names;
- diagnostic purpose, duration, optionality, output, skip path and separate-review boundary;
- mobile primary action/navigation reachability and horizontal-overflow contract.

Acceptance-truth unit coverage: `tests/wave1-acceptance-truth.test.mjs`.

It rejects revival of the superseded standalone Wave 1 accepted-with-deferral verdict while the evidence template remains pending, and checks that the protocol retains the original minimum sample and 90% thresholds.

Existing release coverage on the audited main already verifies diagnostic timing/state semantics, locale persistence, active-decision persistence, cold-baseline invalidation after learning exposure, keyboard focus and mobile overflow.

## Validation boundary

The exact audited main is release-green. The repository's only Actions workflow is configured for `push` to `main` plus manual `workflow_dispatch`; it does not run for this feature branch or pull-request events. No Actions run therefore exists for the closure branch.

This audit does not alter that workflow, does not push to main, and does not invent an exact-head CI result. Local syntax checks were performed for the new MJS test files, but they are not a substitute for the canonical `npm run test:release` gate.

Before any later integration of this branch, the exact integration candidate must run the canonical release gate.

## Human evidence package

Added:

- `reports/WAVE_1_FIRST_USE_WALKTHROUGH_PROTOCOL_2026-08-07.md`;
- `reports/WAVE_1_FIRST_USE_EVIDENCE_TEMPLATE_2026-08-07.json`.

The protocol requires fresh context, no moderator leading, <=30 seconds before first-screen comprehension questions, all seven navigation tasks, exact first-lesson action count, diagnostic-purpose/optionality/duration/output/skip/evaluation questions, empty-state observations and terminology capture.

With only 3 eligible participants, the 90% thresholds require 3/3 passing. A larger sample is preferred.

## Unresolved evidence

### BLOCKED_HUMAN_EVIDENCE

No valid human result is recorded for:

- 3 or more fresh-context walkthroughs;
- >=90% diagnostic purpose/optionality comprehension;
- >=90% Learn/Review/Real Hands navigation comprehension;
- first-screen purpose comprehension after <=30 seconds.

These remain Wave 1 acceptance gates. They are not deferred away to Wave 10.

### BLOCKED_EXTERNAL - Wave 4R language truth

Wave 4R remains the owner of learner-facing language/corpus defects and explicit RU/EN approval. Wave 1 closure does not modify strategic module copy or claim that unresolved W4R language evidence has passed. Wave 1 findings relevant to that scope were appended to the Wave 4R ledger.

### BLOCKED_EXTERNAL - production DOM truth

Current repository status says current repository changes are not claimed deployed, exact deployed SHA is unavailable to automation, and authenticated production DOM smoke is externally blocked. Wave 1 does not invent production equivalence.

## Acceptance rule

`WAVE_1_ACCEPTED` may be recorded only after all of the following are true on the accepted source:

1. exact-source release gate is green;
2. Wave 4R-owned shell/language blockers relevant to Wave 1 are explicitly approved;
3. at least 3 eligible fresh-context walkthroughs are recorded;
4. diagnostic purpose/optionality comprehension is >=90%;
5. Learn/Review/Real Hands navigation comprehension is >=90%;
6. remaining first-use DoD observations pass;
7. production evidence required by the release process is truthful.

Until then, the closure verdict remains:

`WAVE_1_IMPLEMENTATION_ACCEPTED / COMPREHENSION_EVIDENCE_PENDING`
