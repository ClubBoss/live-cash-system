# Wave 2 Governance Enforcement Repair — 2026-08-07

Branch: `repair/w2-governance-enforcement`
Baseline `origin/main`: `26b1dec72822a706f82cf485042c18e166397bdd`
Baseline CI: `Live Cash OS CI` run `31175320582` — `success`
Scope: Wave 2 governance only. No learner-facing copy, T1 copy, learning route, `LiveCashApp/Core`, or `Wave5PracticeLayer` changes.

## Independent read-only audit

| Area | Baseline verdict | Finding |
|---|---|---|
| Source authority | PARTIAL | Canonical registries and prose rules existed, but open source gaps were not mechanically bound to the claim set. |
| Claim schema | PARTIAL | LOW/UNRESOLVED and OPEN_QUESTION constraints existed, but only a subset of claim files was covered by regression tests and no release admission validator applied the contract to the whole claim corpus. |
| Confidence model | PARTIAL | Definitions were sound; corpus-wide transition enforcement was missing. |
| Assumptions / exceptions | PASS / PARTIAL | Required by schema and present in reviewed claims; source-gap materiality was not represented separately. |
| RU/EN glossary | PASS as constitution | The glossary already rejected hybrid architecture/research jargon. The failure was admission enforcement, not the glossary itself. |
| Module gold checklist | PASS as policy / FAIL as enforcement | Human review was described, but manifest `APPROVED` did not require structured human evidence. |
| Approval transitions | FAIL | `FULLY_ACCEPTED` could coexist with a top-level `LANGUAGE_REPAIR_REQUIRED` truth. |
| Human-only approval | FAIL | Locale approvals named a model reviewer and had no human attestation/fingerprint contract. |
| Provenance | PARTIAL | Claim source refs existed; known source-gap dependency coverage was not machine-readable. |
| Editorial checks | PARTIAL | Strong rejection scans existed, but the script also required `FULLY_ACCEPTED`/`APPROVED`, turning a rejection gate into an acceptance-truth enforcer. |
| Acceptance truth | FAIL | `ACCEPTANCE_LEDGER.md` truthfully reopened language review while `editorial-manifest.json` still claimed all 11 RU/EN locales `APPROVED`. |

## Root cause

The Wave 2 constitution was substantially correct, but its acceptance states were not evidence-bearing types. A deterministic file could say `APPROVED` without proving who approved it, against which exact corpus, or whether a later source/copy change invalidated that review. Source-gap blocking was also prose-only. This allowed later waves to satisfy the technical gate while carrying learner-facing machine/research language.

## Governance repairs

1. Added a rejection-only `check:governance` release gate.
2. Added a machine-readable source-gap dependency registry synchronized to the canonical Carrot source-gap ledger.
3. Required every current claim ID to receive an explicit source-gap dependency review.
4. Enforced `LOW` / `UNRESOLVED` cannot be `ADMITTED` or `FIELD_VALIDATED` across the full claim corpus.
5. Enforced `OPEN_QUESTION` cannot become learner prescription.
6. Enforced unresolved `MATERIAL_BLOCKING` dependencies must remain `BLOCKED_SOURCE_GAP` or rejected; scoped non-blocking use requires an explicit rationale.
7. Repaired editorial acceptance truth: strategy gold remains separate, while bilingual language status is explicitly `TRANSITIONAL_LANGUAGE_REVIEW_REQUIRED` with W4R as owner.
8. Removed model-generated locale approval truth. Current `human_approvals` is intentionally empty rather than fabricated.
9. Defined human-only locale approval evidence: reviewer kind `HUMAN`, reviewer identity, review date, and exact corpus fingerprint.
10. Bound approval validity to locked claim/copy blobs. Any locked claim/copy change changes the fingerprint and invalidates prior approval evidence.
11. Kept the existing W4R language-specific scanner as the single language enforcement owner; Wave 2 adds no competing phrase list or copy mutation.
12. Added regression tests proving the forbidden transitions fail.

## Exact W4R contract

W4R owns learner-facing language repair and language-specific enforcement. Wave 2 does **not** edit learner copy or create a parallel scanner.

For each locale that W4R wants to move from `REVIEW_REQUIRED` to `APPROVED`, W4R must:

1. finish the learner-facing copy repair under the existing W4R language gate;
2. run the technical rejection gates successfully;
3. obtain an independent human review of the complete affected learner-facing locale in context;
4. record `human_approvals["<module>.<locale>"]` with:
   - `reviewer_kind: "HUMAN"`;
   - non-empty reviewer identity;
   - ISO review date;
   - `corpus_fingerprint` exactly matching the fingerprint produced from the current manifest `source_blobs`;
5. change that locale status to `APPROVED` only in the same reviewed change;
6. leave the top-level manifest `TRANSITIONAL_LANGUAGE_REVIEW_REQUIRED` while any locale is still `REVIEW_REQUIRED` or while `ACCEPTANCE_LEDGER.md` still contains `LANGUAGE_REPAIR_REQUIRED`;
7. move to `FULLY_ACCEPTED` only after every required RU/EN locale has current human evidence **and** the upper acceptance ledger has removed the repair state through an explicit reviewed acceptance transition.

A model review, CI pass, script output, generated manifest, or previous approval against a different corpus fingerprint is insufficient.

## Regression contract

The governance suite covers:

- LOW + ADMITTED -> reject;
- UNRESOLVED + ADMITTED -> reject;
- OPEN_QUESTION + ADMITTED -> reject;
- unresolved material source gap + admitted dependent claim -> reject;
- non-blocking scoped gap without rationale -> reject;
- `FULLY_ACCEPTED` while upper ledger says `LANGUAGE_REPAIR_REQUIRED` -> reject;
- `APPROVED` without human evidence -> reject;
- automated/model reviewer as approval evidence -> reject;
- stale corpus fingerprint after approved claim/copy change -> reject;
- governance/editorial scripts writing approval truth -> reject.

## Acceptance boundary

Wave 2 can close governance enforcement without claiming that language repair itself is complete. Current truthful target verdict:

`GOVERNANCE_ACCEPTED / ENFORCEMENT_REPAIR_PENDING`

`ENFORCEMENT_REPAIR_PENDING` refers only to W4R-owned learner-facing language repair and human RU/EN approval evidence. It is not permission for Wave 2 to edit copy, T1, learning route, `LiveCashApp/Core`, or Wave 5 practice content.

Wave 3 is not started by this repair branch.
