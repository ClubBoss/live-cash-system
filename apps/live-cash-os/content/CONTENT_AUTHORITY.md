# Live Cash OS — Content Authority

Status: `WAVE_4_FULL_CURRICULUM_ADMISSION_IN_PROGRESS`

This is the application-level admission contract for learner-facing poker content. It complements, rather than replaces, the repository-wide framework in `governance/CROSS_SOURCE_VALIDATION_AND_ADMISSION_FRAMEWORK_v0_1.md` and the immutable source-family registries under `sources/`.

## 1. Canonical source authorities

| Family | Canonical registry | Primary role | Current boundary |
|---|---|---|---|
| Smash Live Cash | `sources/source-registry.md` and `sources/smash-live-cash/` | advanced live-cash mechanisms, deep stacks, node-specific exploits, 3-bet and multiway examples | corpus processed; visual-dependent claims remain gated by their source QA status |
| Carrot Poker | `sources/carrot-poker/source-registry.md` and `sources/carrot-poker/source-gap-ledger.md` | mechanism explanation, theory progression, range construction, exam feedback | Grades 1–3, exams and feedback received and mapped; exact visual/solver claims remain claim-gated |
| Cash Injection | `sources/cash-injection/` | population hypotheses and practical exploit candidates | processed corpus; population direction can support scoped hypotheses but magnitude remains field-gated |
| From the Ground Up | `sources/ftgu/source-registry.md` | foundations, executable defaults, prerequisite and teachability checks | 30/30 episodes processed; charts and exact visual boundaries are reference-only |
| Independent analysis | `analysis/`, `synthesis/`, and module ledgers | reconcile assumptions, compress mechanisms, create original examples and drills | inference must be labeled and cannot impersonate a source claim |
| Product evidence model | `apps/live-cash-os/lib/model-core.ts` | authoritative semantics for Live Cash OS completion, transfer, retention and reviewed field evidence | product contract only; current numeric thresholds are not represented as universal learning-science truths |
| Field evidence | reviewed learner hand records | prioritise cues, calibrate population priors and test table transfer | does not prove universal theory and cannot silently rewrite source claims |

A registry entry marked incomplete, visually dependent, transcription-uncertain or pending blocks any claim that depends on the missing information from reaching `MODULE_GOLD`.

## 2. Claim contract

Every strategic teaching claim admitted into an approved module must have a claim record conforming to `content/claims/claim.schema.json`.

A claim record must identify:

- stable claim ID and module ID;
- learner-facing claim;
- exact internal source references;
- project interpretation, written independently;
- claim type;
- confidence;
- assumptions and exceptions;
- target games and depth scope;
- unresolved conflicts or missing evidence;
- current admission status.

### Claim types

- `BASELINE` — default under stated assumptions;
- `HEURISTIC` — compressed directional rule with explicit boundary;
- `EXPLOIT` — adjustment to a defined population or opponent model;
- `SIMPLIFICATION` — executable strategy that removes complexity and states the trade-off;
- `OPEN_QUESTION` — unresolved or insufficiently supported point; never taught as a recommendation.

### Confidence levels

- `HIGH` — directly supported and assumption-normalised across adequate sources or independent verification;
- `MEDIUM` — supported but materially context-dependent or awaiting one non-critical corroboration;
- `LOW` — useful research candidate, not eligible for learner-facing prescription;
- `UNRESOLVED` — conflict or source gap blocks admission.

## 3. Required strategic scope

Before a recommendation can be taught, its record and learner-facing task must state every material variable:

- positions and players left to act;
- heads-up or multiway;
- effective stack and the unit used to express it;
- open, 3-bet, 4-bet or postflop sizing where relevant;
- rake, ante, straddle or game-structure sensitivity where material;
- baseline or exploit model;
- known population/read assumptions;
- exceptions that can reverse the recommendation.

A broad phrase such as “live players overfold” is never sufficient by itself. The branch, sample relevance, compensation behaviour and confidence must be specified.

## 4. Source reconciliation

Use the relationship classes and conflict workflow in the cross-source framework. In particular:

- different stack depths are scoped branches, not automatic contradictions;
- equilibrium and live-population advice are baseline and exploit layers, not interchangeable rules;
- a simplified strategy must state removed complexity, likely cost and failure conditions;
- unresolved same-node contradictions block promotion;
- transcript uncertainty is not silently repaired from general poker knowledge;
- population magnitude is not inferred for Batumi merely because an external source reports a directional pool tendency.

## 5. Originality and source purity

Learner-facing content must be original compression:

- no transcript passages or close paraphrases;
- no proprietary charts, screenshots or exported ranges;
- no course-specific hand sequence required for understanding;
- original examples and drills;
- source references remain internal provenance, not republished course material.

## 6. Editorial and language authority

All approved learner-facing text must conform to `content/POKER_GLOSSARY_RU_EN.md`.

Russian copy must be natural poker Russian, not a word-for-word translation or mixed architecture jargon. English copy must be independently natural and preserve the same strategic meaning. Stable semantic IDs remain shared across locales.

Deterministic scripts may reject stale hashes, missing metadata, prohibited terminology, invalid status transitions, and locale/ID regressions. They may never create poker, RU, EN, accessibility or empirical approval.

## 7. Module admission states

- `SOURCE_MAPPED`
- `STRATEGY_REVIEWED`
- `NUMERIC_REVIEWED`
- `RU_APPROVED`
- `EN_APPROVED`
- `DRILLS_APPROVED`
- `LAB_APPROVED`
- `CARDS_APPROVED`
- `MODULE_GOLD`
- `BLOCKED_SOURCE_GAP`
- `REJECTED_OR_SUPERSEDED`

`MODULE_GOLD` requires every applicable gate in `content/MODULE_GOLD_CHECKLIST.md`. It cannot be inferred merely because a runtime module exists or tests pass.

## 8. Current admission boundary

Already accepted:

- LCM-01: `MODULE_GOLD_REVALIDATED` for effective-stack and pot-geometry scope; exact depth/SPR/straddle thresholds remain excluded.
- LCM-02: `MODULE_GOLD` for source-backed call/3-bet/fold branch construction; exact chart cells, mixed frequencies and squeeze-size tables remain excluded.
- LCM-03: `MODULE_GOLD` for BB price/closing action, SB squeeze exposure, equity realisation and blind-source identity; exact blind charts remain excluded.
- LCM-06: `MODULE_GOLD` for 3-bet-pot range compensation, board ownership, turn filtering and the OOP top-end raising gate; exact solver boards, sizes, frequencies and EVs remain excluded.

Wave 4 reviewed candidate scope:

- LCM-04: source/action/survivor filtering, protected checks and branch-specific exploit reset — `STRATEGY_REVIEWED / RU_APPROVED / EN_APPROVED / TECHNICAL_GATE_PENDING`.
- LCM-05: value-driven sizing, range-wide versus selective response shape and protected calls — `STRATEGY_REVIEWED / RU_APPROVED / EN_APPROVED / TECHNICAL_GATE_PENDING`.
- LCM-07: branch ancestry, inherited bluff supply, blocker ordering and action-specific opponent models — `STRATEGY_REVIEWED / RU_APPROVED / EN_APPROVED / TECHNICAL_GATE_PENDING`.
- LCM-08: sandwich pressure, closing action, shared defence and multiway range ownership — `STRATEGY_REVIEWED / RU_APPROVED / EN_APPROVED / TECHNICAL_GATE_PENDING`.
- LCM-09: river origin/filter/value/bluff/size/blocker/evidence audit — `STRATEGY_REVIEWED / RU_APPROVED / EN_APPROVED / TECHNICAL_GATE_PENDING`.
- LCM-10: branch-specific evidence discipline, one-observation boundary and field-gated population magnitude — `STRATEGY_REVIEWED / RU_APPROVED / EN_APPROVED / TECHNICAL_GATE_PENDING`.
- LCM-11: current Live Cash OS exposure/transfer/retention/field-evidence contract — `STRATEGY_REVIEWED / RU_APPROVED / EN_APPROVED / TECHNICAL_GATE_PENDING`.

Four admitted claims for each Wave 4 module are stored in `content/claims/lcm-04.claims.json`, `lcm-05.claims.json`, `lcm-07.claims.json` through `lcm-11.claims.json`.

Final Wave 4 `MODULE_GOLD` decisions remain blocked until the exact candidate head passes the canonical full release gate.

## 9. Current global limitations

Source-family completion does not close every exact strategic boundary. Still explicitly excluded or field-gated are:

- exact 100/150/200/300–400bb chart overlays where source visuals are required;
- exact squeeze and 4-bet combo frequencies;
- exact board-specific solver frequencies and EVs;
- exact multiway MDF and fixed sizing matrices;
- exact Batumi population overbluff/underbluff magnitudes;
- empirical proof that the current scheduling and mastery thresholds improve long-term learning.

These belong to later claim-driven visual review, field calibration and Wave 10 empirical validation rather than being silently filled from model knowledge.

## 10. Change rule

Any edit to an approved strategic claim, answer, explanation, table card or glossary term invalidates the affected approval until the relevant human review and source lock are renewed. Cosmetic layout changes do not automatically invalidate strategic approval but must preserve meaning and accessibility.
