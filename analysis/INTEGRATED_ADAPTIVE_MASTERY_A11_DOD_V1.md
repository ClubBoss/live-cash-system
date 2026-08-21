# A11 — Integrated Adaptive Mastery + Whole-System Gauntlet — 10/10 DoD V1

Status: `ACTIVE`

## Mission

Turn the completed skill-family corpus into one learner loop that selects the right mechanism without topic labels, repairs recurring mistakes, verifies delayed transfer and routes real hands back into training.

## 10/10 definition

1. `INT-01..05` each have multiple non-identical stimuli rather than one proof-of-concept item.
2. Integrated practice hides the topic before the learner commits an answer.
3. The selector can draw across preflop, blinds, recognition, SRP, 3BP/4BP, turn/river, multiway/deep and exploit families.
4. Source-blocked skills are never scheduled as scored mastery.
5. Legacy duplicate/bridge skills do not compete with their canonical mastery families.
6. Repeated errors create mistake-family repair priority, not only exact-card repetition.
7. A corrected item stops being an unresolved repair.
8. High-confidence wrong answers receive stronger repair priority.
9. Recent overexposure is penalized so one topic cannot monopolize practice indefinitely.
10. Changed/boundary/mixed stimuli are preferred after basic direct evidence to test transfer.
11. Delayed evidence requires a real time gap and a non-identical successful stimulus; immediate repeats cannot grant delayed retrieval.
12. The integrated session has an explicit bounded size and progress contract.
13. Real-hand routing classifies the decision mechanism, not win/loss result.
14. Real-hand routing may return multiple candidate skills with causal reasons rather than pretending certainty.
15. First Journey hands off to Integrated Session rather than dumping the learner into a chapter map.
16. Learner-facing `why now` exists without leaking the hidden topic before answer commitment.
17. Progress reset/version policy remains explicit; no old completion is silently treated as new mastery.
18. Existing source ceilings remain visible and fail-closed.
19. No poker answer key is changed by scheduler logic.
20. No exact solver/chart frequency is invented by integration.
21. Whole-system static gauntlet audits coverage, source gaps, route integrity, anti-guessing contracts and state semantics.
22. Final program status distinguishes `STATIC_CLOSED` from executable runtime validation.
23. Main/default-route cutover is not allowed until executable validation is actually run.
24. Production deploy remains separately authorized.

## Session policy

Default integrated session target: **8 scored decisions**.

Priority order:
1. unresolved high-confidence/recurring mistake family;
2. due delayed non-identical retrieval;
3. changed-node / boundary transfer in an underexposed high-EV family;
4. direct decision reinforcement;
5. recognition only when a family still lacks it.

The exact weights are inspectable product heuristics, not scientific claims.

## Final hard stops

At the end of A11, program closure may stop only for:
- executable/type/build failure;
- source-blocked strategy nodes already fail-closed;
- a newly discovered evidence-integrity regression;
- a real architecture conflict that cannot be safely repaired.

GitHub Actions are intentionally not a development gate in this program. Executable validation must be run later in an environment with repository execution access before main cutover.
