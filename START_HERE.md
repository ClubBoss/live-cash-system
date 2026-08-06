# Live Cash System — Start Here

Status: `ACTIVE / LIVE_V1_ACCEPTED / BILINGUAL_V1_1_RELEASE_CANDIDATE`

## Bootstrap

Use live `main` of `ClubBoss/live-cash-system` for production truth. For the active bilingual wave, use branch:

`agent/live-cash-os-bilingual-copy-pass`

Read:

1. `START_HERE.md`;
2. `AGENTS.md`;
3. `state/CURRENT_PROJECT_STATE.yaml`;
4. `PROJECT_ATLAS.md`;
5. `apps/live-cash-os/README.md`;
6. `apps/live-cash-os/RELEASE_STATUS.md`;
7. `apps/live-cash-os/ACCEPTANCE_LEDGER.md`;
8. only authorities required for the active milestone.

Repository state overrides chat memory. Do not restart source ingestion or diagnosis.

## Mission

Build a compact adaptive live-cash system for `1/3` and `2/5`, primarily `100–200bb`, with controlled `300–400bb`, straddle and multiway branches.

`MINIMUM COMPLEXITY SUBJECT TO NO MATERIAL EV LOSS`

## Source and strategic truth

```text
catalogued source corpora: complete
heuristic candidates: 34
DRILL_READY: 29
VALIDATION_PENDING: 5
admitted final rules: 0
direct candidate drills: 34/34
misconception IDs: 30
learner-state dimensions: 9
```

Learner-runtime admission does **not** convert any candidate into an admitted final strategic rule.

## Accepted production

Stable URL:

`https://live-cash-os.elmarsal.chatgpt.site/`

Deploy source:

`apps/live-cash-os`

Production facts:

- app `1.0.0`;
- learner-state schema `2`;
- content graph `2026.08-wave6`;
- hosting project `appgprj_6a74674839c88191877199e34e21fc2c`;
- D1 binding `DB`;
- PR `#2` squash-merged;
- repository CI green before and after merge;
- owner-authenticated desktop/mobile live smoke green;
- `LCM-01` is the gold accepted teaching module;
- `LCM-02–LCM-11` remain content-validation pending.

The current accepted site remains valid while v1.1 is developed separately.

## Active bilingual release

Branch:

`agent/live-cash-os-bilingual-copy-pass`

Target app:

`1.1.0`

Required architecture:

```text
one canonical poker graph and stable IDs
→ extracted source catalogue
→ reviewed RU and EN copy layers
→ one runtime
→ one learner state
```

The language switch must:

- show a persistent `RU / EN` pill;
- change the whole learner-facing interface and curriculum copy;
- update the document language;
- survive reload;
- preserve the current lesson, answer IDs, review queue and evidence;
- never create a second learner profile.

Translation governance:

- source changes are extracted automatically;
- unchanged reviewed translations are preserved;
- changed or new strings become `DRAFT`;
- production rejects missing, orphaned, stale and draft entries;
- machine translation is a drafting aid, not publication authority;
- standard poker terms may remain conventional where literal translation would be worse.

## Diagnostic runtime

T1 is optional personalization, not a mandatory wall.

- Before learning exposure: `COLD_BASELINE`.
- After learning begins: `POST_LEARNING_DIAGNOSTIC`.
- RU and EN preserve the same ten diagnostic IDs.
- Locale is included in the raw handoff.
- Free text is never keyword-scored as strategy.

Active authorities:

- `learning/diagnostics/INITIAL_PERSONALISED_DIAGNOSTIC_BATTERY_v0_1.md`;
- `learning/diagnostics/DIAGNOSTIC_RUNTIME_AND_SCORING_v0_1.md`;
- `learning/diagnostics/DIAGNOSTIC_ITEM_MANIFEST_v0_1.json`;
- `learning/diagnostics/DIAGNOSTIC_RAW_RESPONSE_SCHEMA_v0_1.json`;
- `learning/diagnostics/DIAGNOSTIC_RESPONSE_SCHEMA_v0_1.json`;
- `scripts/score_learner_diagnostic.py`.

Current learner truth:

```text
T1 items: 10
responses recorded: 0
measured error probability: no
confirmed strategic leaks: 0
real delayed-recall evidence: 0
reviewed field evidence: 0
```

## Active milestone

`COMPLETE BILINGUAL COPY AND LOCALE RELEASE WAVE`

Required order:

1. keep accepted v1.0 live and untouched;
2. close stale SSOT contradictions;
3. materialize the single-graph locale runtime;
4. rewrite Russian UI in natural poker language;
5. complete the independent English version;
6. pass locale parity and stale-translation gates;
7. pass typecheck, lint, build, unit/content and RU/EN browser gates;
8. merge through a reviewed PR;
9. republish the existing Site project without changing URL or D1;
10. run authenticated desktop/mobile smoke in both languages;
11. only then update production truth to v1.1;
12. begin the first real learner session and repeat content audit.

## Frozen constraints

Do not:

- maintain two copies of poker logic or answer keys;
- publish machine-generated draft copy;
- let language switching reset learner state;
- call repo-green live-green;
- reveal T1 answer keys before completion;
- infer mastery from untested modules;
- treat content completion as mastery;
- grant retention from immediate repetition;
- grant field transfer from a raw note;
- reset learner progress globally;
- copy proprietary source hands or charts;
- turn directional bands into solver cutoffs;
- treat learner-runtime admission as final-rule admission;
- change the stable live URL, hosting project or D1 binding.

## Verdict

`REPO_STATE_OVERRIDES_CHAT_MEMORY`

`V1_0_ACCEPTED_LIVE`

`V1_1_BILINGUAL_RELEASE_CANDIDATE_IN_PROGRESS`

`NEXT = LOCALE PARITY → CI → PR → SAME-SITE DEPLOY → RU_EN_LIVE_SMOKE`
