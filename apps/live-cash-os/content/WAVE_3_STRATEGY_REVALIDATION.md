# Wave 3 Strategy Revalidation

Date: 2026-08-07
Branch: `audit/w3-strategy-revalidation`
Baseline: `26b1dec72822a706f82cf485042c18e166397bdd`
Baseline CI: `31175320582` (`success`)
Scope: LCM-02 preflop, LCM-03 blinds, LCM-06 aggression / 3-bet pots

This report revalidates only strategic truth. It does not perform final RU/EN language editing and does not start Wave 4.

## Verdict

`WAVE_3_STRATEGY_REPAIR_REQUIRED`

The underlying strategic mechanisms are mostly source-supported, but current `STRATEGY_GOLD` cannot be retained for the current runtime for three reasons:

1. Late Wave4R copy mutations create P1 semantic mismatches in final LCM-06 drills after the Wave 3 gold layer has already run.
2. Several claim/drill depth fields state exact or semi-exact stack scopes that the cited source package does not currently support without visual review.
3. Runtime wrong-option `misconceptionId` tags were retained while option semantics were rewritten. The repository explicitly says these tags are local repair tags, not canonical T1 meanings, and provides no reviewed semantic registry proving that the current tag still matches the rewritten error.

A direct strategic repair was not admitted in this audit because `scripts/editorial-check.mjs` hash-locks the relevant claims and locale/copy files through `content/i18n/editorial-manifest.json`, while this Wave 3 assignment explicitly forbids editing the editorial manifest. Bypassing that approval boundary with a new post-overlay mutation would make repository truth less reliable, not more reliable.

## Claim-by-claim ledger

| Claim | Status | Type / confidence | Source meaning vs project interpretation | Scope audit |
|---|---|---|---|---|
| LCM-02-CL-001 | PASS | SIMPLIFICATION / HIGH | Source supports charts as baseline range shapes plus position/depth/open-size/rake/players-behind adjustments. Project interpretation stays directional and does not reproduce exact cells. | Position, sizing, rake and straddle sensitivity are explicit. No unsupported frequency. |
| LCM-02-CL-002 | PASS | BASELINE / HIGH | FTGU supports evaluating call, 3-bet and fold as separate branches; a bad call does not create a good bluff 3-bet. | SB/squeeze relevance and rake caveat are explicit. No universal initiative rule. |
| LCM-02-CL-003 | PASS | EXPLOIT / HIGH | Smash explicitly supports increasing use of existing mixed squeeze candidates against over-wide entry rather than inventing arbitrary bluffs. | Exception correctly shifts toward linear value when opponents continue too much. Exact candidate weights remain excluded. |
| LCM-02-CL-004 | FAIL-P1 | HEURISTIC / MEDIUM | Directional depth shift is supported: deeper -> more protected flats/playability; shallower -> more direct aggression. | Registry says `Roughly 60-100bb`, but direct source evidence explicitly compares 100/200/400bb and says exact thresholds are visual-dependent. Metadata overstates the source boundary. |
| LCM-03-CL-001 | PASS | BASELINE / HIGH | BB posted price and frequent closing action support wider calls versus folding the blind. | Open size, rake, domination and realization exceptions are explicit. |
| LCM-03-CL-002 | PASS | BASELINE / HIGH | SB passive calls are structurally more expensive because of worse price, OOP realization and live BB squeeze exposure. | Correctly treats 3-bet-or-fold as a useful default, not a universal law. |
| LCM-03-CL-003 | FAIL-P1 | BASELINE / HIGH | Source directly supports different postflop plans versus SB and BB because their source ranges differ. | Source package gives HJ-vs-BB/SB examples at 200bb; registry asserts 100bb and `200bb and deeper` without direct visual confirmation. Mechanism is valid; exact depth scope is overstated. |
| LCM-03-CL-004 | PASS | HEURISTIC / HIGH | Source supports equity realization rather than raw equity alone as the relevant blind-defence object. | Position, domination, squeeze exposure and rake are named; low-SPR exception is bounded. |
| LCM-06-CL-001 | FAIL-P1 | EXPLOIT / HIGH | Source strongly supports the compensation mechanism: an over-wide preflop 3-bet range must check more postflop, otherwise the betting branch becomes over-bluffed. | Current source record explicitly marks exact stack depth as visual-dependent, while registry asserts `150-200bb` / deep. Strategic mechanism passes; exact depth metadata does not. |
| LCM-06-CL-002 | PASS | HEURISTIC / HIGH | FTGU supports frequent small betting on dry high-card/paired boards when premium-range advantage survives, and more selective play on coordinated middling boards. | Exact sizes/frequencies are explicitly excluded. No directional idea is presented as a universal solver rule. |
| LCM-06-CL-003 | PASS | BASELINE / HIGH | FTGU explicitly says a flop range/high-frequency bet cannot be copied automatically to the turn after the defender calls and filters weak hands. | Turn-card exception is present; no exact frequency claim. |
| LCM-06-CL-004 | PASS | BASELINE / HIGH | Carrot supports requiring credible top-end value before building a large OOP raise/jam branch; denial is secondary support, not the foundation. | Exact combo selection and tier/SPR boundaries remain excluded. |

Claim result: 9 PASS, 3 FAIL-P1.

## Drill-by-drill ledger

| Drill | Status | One-best-answer / assumptions / action order / boundary audit |
|---|---|---|
| pre-01 | PASS | 100bb, CO 3bb open, BTN call, Hero SB TT, competent BB behind. Value/isolation squeeze is framed as the first baseline candidate, not a universal TT rule. Action order and player-behind risk are explicit. |
| pre-02 | PASS | 200bb HJ open + CO call, BTN suited lower call-region hand, passive blinds. Viable call is correctly preserved before inventing a squeeze. Depth, position and players behind materially drive the answer. |
| pre-03 | PASS | 100bb, stronger early source range, larger-than-standard open, call, dominated offsuit broadway. Fold follows from domination/realization rather than hand-label dogma. |
| pre-04 | PASS | Wide late open + wide call, Hero SB, passive BB, hand already a mixed polar 3-bet candidate. Exploit correctly purifies an existing candidate rather than adding arbitrary suited bluffs. |
| pre-05 | FAIL-P1 | Directional answer is correct, but the assumption `roughly 60bb vs 200bb` introduces a 60bb anchor not source-locked by the cited evidence. Direct source comparison is 100/200/400bb and exact boundaries are visual-dependent. |
| bli-01 | PASS-WITH-INFERENCE | Project scenario uses CO 3bb / dry A-high rather than the source's direct 200bb HJ / 7-6-6 and K-K-J examples. The answer does not claim a board-specific frequency; it asks only whether the same c-bet plan can be copied before reconstructing SB/BB source ranges. That mechanism is directly supported. |
| bli-02 | PASS | BB explicitly closes action after open+call. It compares call EV versus fold and 3-bet before auto-squeezing. This directly covers BB closing action and call/3-bet/fold comparison. |
| bli-03 | PASS | Hero SB considers a passive call while BB remains behind. Squeeze exposure is explicit and is the material changed variable. |
| bli-04 | PASS | Deep/OOP/raw-equity context tests equity realization rather than superficial preflop hand appeal. No hidden exact threshold is claimed. |
| bli-05 | PASS | Requires several relevant observations before updating an SB prior. The answer widens the source range while preserving price/action-order structure; it does not turn a read into a universal label. |
| agg-01 | FAIL-P1 | Wave 3 semantics are source-aligned, but final RU Wave4R changes option semantics while EN retains a different stable-ID meaning. Final cross-locale semantic identity is broken. Additionally Wave 3 assumptions state 200bb although the current cited L25 evidence marks exact stack depth visual-dependent. |
| agg-02 | FAIL-P1 | Final RU Wave4R changes assumptions/cue/question to a compensated-wide-3-bet scenario but leaves the old normal-strong-range actions/reasons/explanation. The question and marked correct branch no longer describe the same node. |
| agg-03 | PASS | Coordinated middling flop materially changes the board-ownership node from the dry/paired high-frequency case. Selective bet/check is the single best directional answer; `always check` remains an invalid universalization. |
| agg-04 | FAIL-P1 | Final RU Wave4R changes question/actions to the OOP large-raise/jam gate but leaves turn-filter assumptions/cue/reasons/explanation. EN changes the question while leaving turn-filter actions/reasons/explanation. Both locales therefore fail semantic one-best-answer integrity in the final runtime. |
| agg-05 | PASS | OOP defender, low SPR, almost no top-end value. Correctly tests the real boundary: denial cannot create a large raise/jam branch without credible value. |

Drill result: 10 PASS, 1 PASS-WITH-INFERENCE, 4 FAIL-P1.

### Misconception mapping audit

Status: `UNRESOLVED_STRATEGIC_METADATA` for the Wave 3 priority drill corpus.

`learning/TAXONOMY_SCOPE_v1.md` states that runtime `MC-nnn` strings are local option-to-repair tags, are not automatically equivalent to canonical T1 meanings, and require semantic review before any migration. Wave 3/Wave4R copy layers rewrite distractor text while retaining the old option IDs and runtime tags. No authoritative reviewed runtime-tag dictionary exists in repository truth that proves each retained tag still names the rewritten error.

This is not a canonical T1 taxonomy defect and current repair routing selects by `variantGroup`, not by these tags. It is nevertheless a failed Wave 3 drill-review criterion because `misconceptionId matches the actual error` cannot be honestly marked PASS.

## Numerical and action-tree audit

- No explicit pot-size or SPR arithmetic exists in the 15 priority drills. Result: N/A; no arithmetic error found.
- `pre-01`: 100bb and 3bb open are explicit scenario inputs; no exact output frequency is claimed.
- `pre-02`: 200bb is directly consistent with the source squeeze lesson's 200bb examples.
- `pre-03`: 100bb is a stated scenario; no exact chart boundary is claimed.
- `pre-04`: 100bb is a stated scenario; exploit remains candidate-based, not frequency-based.
- `pre-05`: `roughly 60bb` is not source-locked in the current evidence package -> FAIL-P1 provenance/numeric scope.
- `bli-01`: CO 3bb/A-high is a project-created mechanism scenario; it does not claim a board-specific solver frequency. Direct source example is 200bb HJ vs SB/BB, including 7-6-6 and K-K-J.
- `agg-01`: 200bb is not established by the current L25 source record; exact stack depth is explicitly visual-dependent -> FAIL-P1 provenance/numeric scope.
- No learner drill introduces an unsupported exact solver percentage.
- No exact 3-bet, squeeze or c-bet size table is introduced.
- Rake and straddle sensitivity are represented at claim/module scope; no drill pretends to know an exact rake/straddle threshold.
- BB and SB action order is legal in the audited nodes: BB closing action is stated where required; SB nodes preserve the still-to-act BB squeeze risk.

## Required focus recheck

| Focus | Result | Notes |
|---|---|---|
| SB vs BB | PASS | Source-range identity, price and action order are correctly separated. |
| BB closing action | PASS | Explicit in `bli-02`; call is compared with fold and 3-bet before aggression. |
| SB squeeze exposure | PASS | Explicit in `bli-03`; passive call is not treated as guaranteed flop access. |
| Call / 3-bet / fold comparison | PASS | LCM-02 and `bli-02` preserve independent branch evaluation; initiative alone is not enough. |
| Wide 3-bet range compensation postflop | SOURCE PASS / RUNTIME FAIL | Source mechanism is strong; final `agg-01/agg-02` overlay integrity prevents gold acceptance. |
| OOP aggression in 3-bet pots | SOURCE PASS / FINAL DRILL PARTIAL FAIL | `agg-05` correctly enforces top-end value before denial; final `agg-04` is semantically corrupted by partial overlay mutation. |

## Source conflicts

No unresolved direct contradiction was found among the audited mechanisms.

- Deep protected flats versus SB 3-bet-or-fold: conditional, not contradictory. Position/action order and player-behind risk distinguish the nodes.
- Polar squeeze exploit versus linear 3-betting: conditional on fold equity and Villain continuation width.
- Frequent small betting by a normal premium-dense 3-bet range versus increased checking by an over-wide 3-bet range: conditional on preflop range composition.
- Equity denial versus OOP top-end value: denial is secondary to a credible value foundation, not an alternative rule.

## Unresolved source gaps

1. Smash preflop chart cells, mixed frequencies and exact squeeze/4-bet sizes remain visual-dependent.
2. LCM-06 L25/L26 exact stack depth, board cards, sizes and frequencies remain visual-dependent.
3. FTGU E28/E29 exact board groups, bet sizes and frequencies remain visual-dependent.
4. Carrot OOP exact top-end combo boundaries, raise sizes and SPR thresholds remain visual-dependent.
5. Exact rake thresholds that turn marginal blind calls into folds are not source-locked.

These are valid exclusions, not permission to infer exact values.

## Governance blocker to strategic repair

The current release gate computes Git blob hashes for source-locked files listed in `content/i18n/editorial-manifest.json`. The locked set includes the three Wave 3 claim registries plus the Wave 3/Wave4R/Wave5 locale/copy files that currently produce the final priority-module runtime.

The Wave 3 assignment forbids editing the editorial manifest. Therefore a direct repair to the locked claim/drill files would intentionally fail `check:editorial`, while a new unmanifested post-overlay repair would bypass the human/editorial approval boundary. Neither is a valid closure path under the current scope.

Required follow-up is a coordinated strategic repair plus governance-approved manifest re-lock by the owner of Wave 2/editorial admission truth. Until then, previous `MODULE_GOLD` / `STRATEGY_GOLD` language for LCM-02/03/06 is superseded by this revalidation verdict for current main.

## LANGUAGE_HANDOFF

No language changes were made. These items are style/editorial handoff only and are not the cause of the strategic verdict.

RU candidates for W4R review after strategy repair:
- mixed terms such as `fold equity`, `playability`, `high-card`, `range-bet`, `OOP`, `solver-frequency`, `c-bet plan`, `open+call`, `EV call`;
- phrases equivalent to `undercompensated c-bet frequency` and `premium-range advantage` should be checked for natural poker Russian after the semantic node is fixed.

EN candidates for W4R review after strategy repair:
- `undercompensated c-bet frequency`;
- `premium-range advantage`;
- `range-bet licence`.

Do not resolve these by changing strategic meaning.

## Evidence and tests

Baseline evidence:
- source SHA: `26b1dec72822a706f82cf485042c18e166397bdd`;
- GitHub Actions run: `31175320582` -> `success`;
- canonical release command in repository: `npm run test:release`.

Reviewed regression surfaces:
- `tests/wave3-priority-gold.test.mjs` validates the isolated Wave 3 layer but does not validate final post-Wave4R semantic alignment;
- `tests/wave5-practice-quality.test.mjs` validates final pipeline structure but does not prove semantic question/action/reason alignment;
- `tests/taxonomy-scope.test.mjs` correctly isolates canonical T1 taxonomy from runtime distractor tags but does not prove local tag semantics;
- `scripts/editorial-check.mjs` enforces the manifest source lock and is the reason a legal repair requires coordinated manifest re-approval.

No product code, learner-facing copy, runtime localization, editorial manifest, diagnostic, LiveCashApp or LiveCashAppCore is changed by this audit branch. No merge to `main` is performed.
