# Live Cash OS

Персональная система обучения live cash poker с двумя самостоятельными языковыми версиями: русской и английской. Приложение объединяет понятное объяснение, практику на изменённых ситуациях, точечный разбор ошибок, повторение через время, карточки, диагностику T1 и проверку реальных рук.

## Production identity

- Stable URL: `https://live-cash-os.elmarsal.chatgpt.site/`
- Source directory: `apps/live-cash-os`
- Hosting project: `appgprj_6a74674839c88191877199e34e21fc2c`
- Cloud binding: D1 `DB`
- Current accepted live app: `1.0.0`
- Bilingual release candidate: `1.1.0`
- Learner-state schema: `2`
- Stable content graph: `2026.08-wave6`

The stable URL, hosting project, D1 binding and learner-state schema must not change between these releases.

## Language model

The product does not maintain two copies of poker logic.

```text
one semantic content graph
→ stable module / drill / option / card IDs
→ Russian and English keyed copy layers
→ one learner state and one answer key
```

- The selected locale is stored separately under `live-cash-os:locale`.
- Switching `RU / EN` never resets progress, changes answer IDs or creates a second learner profile.
- `content/i18n/source.ru.json` is extracted deterministically from the canonical graph.
- `content/i18n/ru.json` and `content/i18n/en.json` are translation memories.
- Every translation stores the exact source string from which it was produced.
- A changed source string automatically becomes stale instead of silently reusing an old translation.
- Machine-assisted entries remain `DRAFT` until an explicit poker-language review accepts them.
- Deterministic checks can reject bad copy but cannot grant `REVIEWED` status.
- English T1 and Russian T1 are independently written but preserve the same ten diagnostic IDs.

Future workflow:

```bash
npm run i18n:extract       # refresh stable keys after content changes
npm run i18n:source-check  # fail if the extracted catalogue is stale
npm run i18n:sync          # preserve reviewed copy and draft only changed strings
npm run i18n:check         # fail on missing, stale, draft or mismatched locale copy
```

## Learning contract

Every normal module follows the same ten-stage contract:

1. one decision before the explanation;
2. plain-language theory;
3. three compact heuristics;
4. decision order;
5. worked example;
6. numerical or contrastive lab;
7. changed-situation decisions;
8. explain-back;
9. table card and glossary;
10. delayed review scheduling.

Content completion is separate from evidence state. No single correct answer creates mastery.

### Visible route from 0 to 100%

The home screen shows the complete evidence cycle for one module:

```text
0%   start
10%  baseline
20%  understand the mechanism
35%  worked example and lab
50%  changed-node transfer
65%  targeted repair
80%  delayed retrieval
90%  real-hand capture
100% reviewed field validation
```

This is not an overall poker-mastery percentage. A module reaches the end only through changed-node, delayed and reviewed field evidence.

Module states:

- `UNEXPOSED`
- `INTRODUCED`
- `FRAGILE`
- `WORKING`
- `RETAINED`
- `FIELD_TEST_PENDING`
- `FIELD_VALIDATED`
- `REPAIR_REQUIRED`

Nine dimensions are stored separately:

- node recognition;
- mechanism explanation;
- action selection;
- boundary control;
- speed;
- confidence calibration;
- variant transfer;
- retention;
- field transfer.

Variant transfer is awarded only to an explicit changed-node probe carrying variant distance and changed variables. The name of a mode such as `repair` or `review` is not sufficient.

## Architecture

```text
app/                           route shell, metadata and API
components/                    learner-facing application UI
content/types.ts               locale-neutral curriculum contracts
content/modules.ts             canonical LCM-01–LCM-11 graph and stable IDs
content/quality.ts             content acceptance status by module
content/diagnostic.ts          diagnostic authority
content/i18n/ui.ts             reviewed RU/EN interface copy
content/i18n/diagnostic.ts     reviewed RU/EN T1 copy
content/i18n/route.ts          reviewed RU/EN learner route
content/i18n/runtime.ts        keyed locale application with safe development fallback
content/i18n/source.ru.json    extracted source catalogue
content/i18n/ru.json           Russian translation memory
content/i18n/en.json           English translation memory
lib/model.ts                   learner state, evidence, router and scheduler
lib/diagnostic-import.ts       strict score-0.2 import validation and routing
db/                            D1 storage
public/                        PWA manifest, service worker and assets
scripts/i18n-*.mjs             extraction, draft sync and release validation
tests/                         kernel, content, locale and SSR gates
e2e/                           desktop/mobile bilingual browser flows
```

Do not duplicate curriculum, answer keys, scoring or scheduler logic by locale.

## Persistence and privacy

Anonymous visitors use localStorage. Signed-in visitors can also sync the same schema-valid learner state to D1. The application displays the current save mode and provides:

- progress export;
- progress import;
- local reset;
- cloud-state deletion.

Local and cloud copies are merged by entity IDs and monotonic evidence fields rather than replacing the entire state solely by timestamp. This reduces independent-device data loss, while revision conflict responses remain visible.

Language preference is presentation state, not poker evidence. Raw field notes and free-text diagnostic responses are user learning data and never create mastery by storage alone.

## Diagnostic handoff

T1 is optional personalization, not a mandatory first-use wall.

```text
raw learner responses v0.2
→ expert A–E/U evaluation v0.2
→ canonical scorer 0.2
→ score-0.2 result
→ strict import of at most two priority repair modules
```

- Measurement context is fixed when T1 starts.
- Before learning exposure: `COLD_BASELINE`.
- After learning begins: `POST_LEARNING_DIAGNOSTIC`.
- If learning begins during a cold run: `MIXED_EXPOSURE_INVALID_FOR_BASELINE`.
- The raw record stores `locale_at_start` and the locale of every response.
- The evaluated record and scorer output preserve the same context and provenance.
- Import requires the correct learner, all ten T1 IDs, scorer version, context and valid module/misconception rows.
- The client does not keyword-score strategic free text or expose answer keys.

Authorities:

- `learning/diagnostics/DIAGNOSTIC_RAW_RESPONSE_SCHEMA_v0_2.json`
- `learning/diagnostics/DIAGNOSTIC_RESPONSE_SCHEMA_v0_2.json`
- `learning/diagnostics/DIAGNOSTIC_ITEM_MANIFEST_v0_1.json`
- `scripts/score_learner_diagnostic.py`

The v0.1 schemas remain available only for historical records.

## Local development

Prerequisite: Node.js `>=22.13.0`.

```bash
npm install
npm run dev
```

## Release gates

```bash
npm run typecheck
npm run lint
npm run i18n:source-check
npm run i18n:check
npm run build
npm run test:unit
npm run test:e2e
```

`npm test` executes typecheck, lint, accepted bilingual copy integrity, production build and unit tests. Browser gates verify:

- RU/EN switching and document language;
- locale persistence;
- session continuity;
- feedback recovery without duplicate evidence;
- fixed T1 context;
- the visible 0→100 module route;
- desktop/mobile layouts and horizontal overflow.

## Release governance

- `RELEASE_STATUS.md` contains current production truth.
- `ACCEPTANCE_LEDGER.md` contains closed defects and current release-candidate gates.
- `.openai/hosting.json` is the hosting authority.
- `content/quality.ts` is the module-level content-quality authority.
- Runtime delivery status must not be confused with final strategic admission.
- An accepted release is forbidden until repository CI and authenticated live smoke are green in both locales.

After the bilingual DoD, copy and routing thresholds must be calibrated with real learner, delayed-recall and field evidence rather than further platform-only tuning.
