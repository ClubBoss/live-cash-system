# Live Cash OS — Release Status

Status: `REPOSITORY_PLATFORM_ACCEPTED / CURRICULUM_STRATEGY_REVIEW_PENDING / WAVE_5_PRACTICE_ACCEPTED / LANGUAGE_REPAIR_REQUIRED / PRODUCTION_UPDATE_NOT_PERFORMED`

## Repository

- Default and only permanent branch: `main`
- Canonical release command: `npm run test:release`
- Automation: one `main` CI workflow plus manual `workflow_dispatch`
- Wave 3 strategy-repair branch: `repair/w3-strategy-closure`
- Wave 3 strategy-repair base: `74bf73f15a539d692af53253cfaf06755693e727`
- FINAL W4R handoff used for read-only reconciliation: `9b5b5a997663bd381857f1e06a2edeadd7b20c1a`
- Wave 5 accepted implementation SHA: `e54ae03627398eff09c10b87971c15d5858b3ceb`
- Wave 5 release run: `31171850884`
- Validation job: `92845201804`

## Repository scope accepted

Platform integrity remains accepted.

The scoped Wave 3 implementation repair removes the three independently confirmed claim-provenance defects and unsupported exact depth precision from the affected Wave 3 source drills/examples. This implementation is **not** an automatic return to strategy gold: LCM-02, LCM-03 and LCM-06 remain `CURRICULUM_STRATEGY_REVIEW_PENDING`, and changed preflop/aggression drill content remains `DRILLS_REVIEW_PENDING` until human poker/drill review.

Unaffected strategic curriculum evidence remains historical/current within its reviewed boundaries. Exact unsupported solver/chart/population claims remain outside admitted scope.

Wave 5 decision-practice mechanics remain accepted independently of the pending W3 semantic review.

## Language/editorial and final-composition boundary

The FINAL W4R handoff exists on its own branch and is not merged into this W3 repair branch.

Current truthful status on this branch:

`CURRICULUM_STRATEGY_REVIEW_PENDING / DRILLS_REVIEW_PENDING / LANGUAGE_REPAIR_REQUIRED / FINAL_COMPOSITION_STALE`

The W3 branch does not edit W4R-owned files. Read-only final-composition inspection against `9b5b5a997663bd381857f1e06a2edeadd7b20c1a` identified materialized priority-module semantics that require integration-time reconciliation before final composition can be reviewed and approved. No hidden post-W4R overlay is introduced here.

No Wave 6 work is allowed before W3 human review and W4R/final-composition reconciliation are complete.

## Candidate gate boundary

The repaired W2 governance lifecycle intentionally permits stale hashes only on explicitly declared repair/review source paths while the candidate is in `REVIEW_PENDING`. Old strategy, drill and locale approvals remain invalidated.

`check:governance` / candidate `check:editorial` may pass in this state. Full approval gates must remain non-approved until:

- strategy human review restores `CURRICULUM_STRATEGY_GOLD`;
- drill human review restores `DRILLS_APPROVED`;
- FINAL W4R composition is reconciled and re-materialized;
- source locks/fingerprints are refreshed against that reviewed corpus;
- required RU/EN human approval evidence is current.

## Production boundary

- Stable URL: `https://live-cash-os.elmarsal.chatgpt.site/`
- Hosting project: `appgprj_6a74674839c88191877199e34e21fc2c`
- D1 binding: `DB`
- The owner reported publishing a post-PR #7 Site version on `2026-08-07`.
- Current Wave 3/W4R repair candidates are **not claimed deployed**.
- Exact production Git SHA is not exposed to available automation and is not invented.
- Unauthenticated automation reaches the ChatGPT sign-in boundary; authenticated application DOM smoke remains externally blocked.
- No production D1 reset, learner-state reset, URL change or migration action was performed during this Wave 3 repair.

## Remaining Wave 0 release-truth debt

- authenticated production DOM smoke;
- exact deployed SHA;
- package/release-version synchronization;
- release tag/GitHub Release identity if still absent.

## Verdict

`W3_IMPLEMENTATION_REPAIRED_REVIEW_PENDING / W4R_INTEGRATION_RECONCILIATION_PENDING / PRODUCTION_UPDATE_NOT_PERFORMED`

Wave 6 is intentionally not started.
