# Live Cash OS - Non-Human 10/10 Closure V3 Defect Ledger

Status: FROZEN / AUDIT-DERIVED / NON-AUTHORITATIVE

This file is an execution ledger derived from canonical runtime/repository truth.
It is not a curriculum, source, learner-state, mastery, persistence, or release SSOT.
Canonical authorities remain unchanged.

| ID | Area/Wave | Skill/Route | Defect | Severity | Evidence | Root cause | Repair family | Affected runtime surface | Source sensitivity | Evidence/mastery sensitivity | Regression test | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| RT-01 | W9/W11 release runtime fidelity | `/mastery/journey`, global `/api/state` | Local release E2E previously emitted `ERR_UNSUPPORTED_ESM_URL_SCHEME`; after moving to Workerd, a shared local dev runtime could later stop serving under parallel Playwright pressure. | P2 high-EV | Inherited run #879 proved the Node/`cloudflare:` mismatch. Exact-head run #902 on `40b67bd8bef5b8e9828b553518a538e7616087d7` passed the full release gate with one CI worker against the shared local Workerd: ordinary E2E 294 passed / 26 skipped, test-mirror/cross gate 30 passed / 6 skipped, mastery cross gate 6 passed / 18 skipped. Release artifact contained no unsupported-scheme, IoContext-destroyed, connection-reset/refused, unexpected-pageerror, unhandled-rejection, Worker-crash/exit, failed-fetch, or retry-masked-failure marker. | MIXED harness defect: Node-oriented serving was deterministically incompatible with `cloudflare:workers`; after runtime fidelity was restored, two Playwright workers shared one local Workerd+D1 singleton and generated request-IoContext/transport churn that could terminate the local dev server. Application D1 reads/writes were awaited and no state-loss evidence was found. | Reliability / release control-plane | Local release certification only | NONE: poker/source truth unchanged | NONE: state/mastery semantics unchanged | Generated-Worker runtime guard, fail-closed generated-config normalization, and CI serialization guard. | CLOSED |

## Final machine severity counts

- P0 found in this closure slice: 0; closed: 0; remaining: 0.
- P1 found in this closure slice: 0; closed: 0; remaining: 0.
- P2 found: 1 (RT-01); closed: 1; remaining machine-actionable: 0.
- P3: no bounded positive-EV closure item identified.

## Adversarial pass 1 - runtime / learner / release skeptic

Fresh read-only attack after RT-01 repair. Attacked first use, Practical Mastery journey, mobile ~390px, keyboard/focus, Chromium/Firefox/WebKit parity, local-first behavior, delayed GET/POST, offline/recovery, profile isolation, malformed/future state, cloud deletion, and release-artifact cleanliness.

Evidence: exact-head release run #902 plus direct inspection of its release artifact.

- New P0: 0.
- New P1: 0.
- New P2: 0.
- Result: PASS.

## Adversarial pass 2 - corpus / test-taker / evidence skeptic

Independent fresh read-only attack from canonical runtime/corpus truth rather than Pass 1 findings. Attacked prompt-to-answer leakage, lexical/length cues, answer-position rotation, caricature distractors, changed-node/boundary authenticity, combo -> family/traits -> contextual decision transfer, prerequisite/reachability integrity, RU/EN structural parity, source ceilings, BL-11, duplicate/shadow state, stale evidence, false mastery, delayed retention, field-transfer inflation, and malformed/future persistence.

Evidence: exact-head static gate in run #902 (433/433 tests), generated runtime corpus audit (86 skills, 74 anchors, 810 decisions, 884 stimuli, 0 source-blocked runtime skills, 1 partial-source skill, 0 review items, 0 error items, 0 invariant errors), plus targeted source/evidence regression assertions.

- New P0: 0.
- New P1: 0.
- New P2: 0.
- Result: PASS.

Two consecutive independent adversarial passes therefore produced zero new P0/P1.

## Residual truth ledger

| ID | Severity | Classification | Reason |
|---|---|---|---|
| BL-11 | P2 boundary | SOURCE_BLOCKED | Exact SB-vs-BB 3BP precision remains `PARTIAL`; no inspectable authoritative source was introduced, so the runtime correctly fails closed instead of inventing precision. |
| HUMAN-EDITORIAL | Outside non-human closure | HUMAN_ONLY | Strategy/drill/RU/EN human approvals are not synthesized by machine gates. |
| W10-EMPIRICAL | Outside non-human closure | HUMAN_ONLY | Genuine learner effectiveness/retention/field-transfer observations are not fabricated; synthetic gauntlets remain machine evidence only. |

## Diminishing-returns decision

No remaining bounded machine-actionable P0/P1 or positive-EV P2 was found. The only residuals require unavailable source authority or genuine human evidence; changing product semantics to manufacture those outcomes would violate source/evidence integrity.
