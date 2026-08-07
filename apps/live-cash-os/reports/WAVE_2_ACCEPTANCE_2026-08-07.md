# Wave 2 Acceptance — Content Authority and Editorial Constitution

**Date:** 2026-08-07  
**Final source SHA:** `96f5d62c9c2cd94965dfa41e93db224a6d0fc593`  
**Governance commit:** `e00b5a81395e6dd5e815d49391cdbb0849fad190`  
**Release gate:** GitHub Actions run `31137050150` — `PASS`

## Verdict

`WAVE_2_ACCEPTED`

Wave 2 establishes one enforceable admission contract for strategic claims, bilingual copy and module-gold status without creating a parallel project-management system.

## Goals achieved

### Canonical source authority

- Existing source-family registries remain canonical.
- Application admission rules point to, rather than copy, those registries.
- Stale Carrot source truth was repaired: Grade 3 L01–L10, exam and feedback are received and mapped.
- Remaining Carrot limitations are represented as claim-specific strategic gaps rather than a nonexistent missing-Lecture-10 gap.

### Claim contract

A JSON Schema now requires:

- stable claim and module IDs;
- learner-facing claim;
- exact internal source references;
- independent project interpretation;
- claim type;
- confidence;
- assumptions and exceptions;
- game and depth scope;
- conflicts;
- admission status.

Schema constraints prevent:

- `LOW` or `UNRESOLVED` claims from becoming `ADMITTED` or `FIELD_VALIDATED`;
- `OPEN_QUESTION` records from becoming learner prescriptions.

### RU/EN terminology and style

The canonical glossary defines:

- effective stack versus effective depth;
- SPR;
- range;
- equity realisation;
- squeeze;
- blocker and equity denial;
- linear, polar, condensed and capped ranges;
- closing action and players behind;
- multiway, straddle and cold-call;
- repair, delayed review, retention and reviewed field evidence.

It explicitly rejects unexplained learner-facing hybrid constructions such as `Players-behind gate`, `Value squeeze core`, `node signature` and `credible bluff supply`.

### Module admission

`MODULE_GOLD_CHECKLIST.md` covers:

- source and claim integrity;
- strategic review;
- numerical/action-tree review;
- learning sequence;
- drills and misconceptions;
- RU and EN approval;
- labs and cards;
- stable identity and state;
- technical and visual gates.

No script may create `MODULE_GOLD` without an explicit poker-aware and bilingual review record.

### LCM-01 reference implementation

LCM-01 now has:

- four stable claim records;
- explicit scope and confidence;
- numerical audit;
- RU and EN conformance review;
- current-slice drill, lab and card review;
- corrected English distinction between `effective stack` and `effective depth`.

Exact depth/SPR/straddle strategic overlays remain explicitly open and are not silently admitted.

## Verification

New governance tests verify:

- canonical source routing and absence of the stale Carrot continuity claim;
- required claim fields and enums;
- LCM-01 claim safety;
- glossary coverage and prohibited-jargon policy;
- explicit human module-gold decision;
- 11-module manifest with only LCM-01 approved.

Full gate results:

- TypeScript: PASS
- ESLint: PASS
- Editorial integrity: PASS
- Production build: PASS
- Unit/integration: 35/35 PASS
- Desktop/mobile Playwright: PASS

Evidence: run `31137050150`, job `92738621986`.

## DoD assessment

| Wave 2 requirement | Status |
|---|---|
| Source registry authority | `PASS` |
| Claim provenance contract | `PASS` |
| Strategic confidence and type model | `PASS` |
| RU/EN glossary | `PASS` |
| Editorial style constitution | `PASS` |
| Module admission checklist | `PASS` |
| Human-only approval boundary | `PASS` |
| LCM-01 revalidated against constitution | `PASS` |
| LCM-02–LCM-11 remain pending | `PASS` |
| Automated governance regression tests | `PASS` |

## Current curriculum boundary

- LCM-01: `MODULE_GOLD_REVALIDATED`.
- LCM-02–LCM-11: structured candidates, still `PENDING` in RU and EN.
- Runtime existence does not equal strategic admission.
- The next admissible work is Wave 3 reconstruction of LCM-02, LCM-03 and LCM-06.
