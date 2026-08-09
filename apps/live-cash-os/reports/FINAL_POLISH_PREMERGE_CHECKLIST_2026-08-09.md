# Final Polish Pre-Merge Checklist

- [ ] Branch diff remains bounded to release integrity, shell copy and regression evidence.
- [ ] `npm run test:release` GREEN on branch.
- [ ] Existing G1-G4 regressions remain GREEN.
- [ ] No new human approval is fabricated.
- [ ] No curriculum/mastery/scheduler/state semantics changed.
- [ ] PR CI GREEN.
- [ ] Current main rechecked before merge.
- [ ] Merge only if branch is not stale.
- [ ] Exact-main CI GREEN after merge.
- [ ] Test-mirror deploy and smoke GREEN on exact-main SHA.
- [ ] Build marker equals exact deployed SHA.
- [ ] Authority status docs reconciled after successful integration.
