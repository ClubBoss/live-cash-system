# Live Cash OS

Русскоязычная персональная система обучения live cash poker. Приложение объединяет teaching layer, changed-node drills, skill-specific repair, delayed retrieval, flashcards, cold diagnostic T1 и reviewed field notes.

## Production identity

- Stable URL: `https://live-cash-os.elmarsal.chatgpt.site/`
- Source directory: `apps/live-cash-os`
- Hosting project: `appgprj_6a74674839c88191877199e34e21fc2c`
- Cloud binding: D1 `DB`
- App version: `1.0.0`
- Learner-state schema: `2`
- Content version: `2026.08-wave6`

The stable URL must not change between releases. Source changes become public only after the release branch passes all gates and is merged to `main`.

## Learning contract

Every normal module follows the same ten-stage contract:

1. one cold check;
2. plain-language theory;
3. three compact heuristics;
4. decision tree;
5. worked example;
6. numerical or contrastive lab;
7. changed-node decisions;
8. explain-back;
9. table card and glossary;
10. delayed review scheduling.

Content completion is separate from evidence state. No single correct answer creates mastery.

Module state vocabulary:

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

## Architecture

```text
app/                       route shell, metadata and API
components/                learner-facing application UI
content/types.ts           curriculum contracts
content/modules.ts         admitted LCM-01–LCM-11 content
content/diagnostic.ts      frozen T1 prompts
lib/model.ts               learner state, evidence, router and scheduler
db/                        D1 storage
public/                     PWA manifest, service worker and brand assets
tests/                     kernel, content and SSR gates
e2e/                       desktop/mobile browser flows
```

Do not put curriculum, scoring or scheduler logic back into `app/page.tsx`.

## Persistence and privacy

Anonymous visitors use localStorage. Signed-in visitors can also sync the same schema-valid learner state to D1. The application displays the current sync mode and provides:

- progress export;
- progress import;
- local reset;
- cloud-state deletion.

Raw field notes and free-text diagnostic responses are user learning data. They are never treated as mastery by storage alone.

## Diagnostic handoff

T1 is optional personalization, not a mandatory first-use wall.

```text
raw learner responses
→ expert A–E/U evaluation
→ canonical diagnostic scorer
→ evaluated result
→ import of at most two priority repair families
```

Raw schema:

`learning/diagnostics/DIAGNOSTIC_RAW_RESPONSE_SCHEMA_v0_1.json`

Canonical evaluated schema:

`learning/diagnostics/DIAGNOSTIC_RESPONSE_SCHEMA_v0_1.json`

Scorer:

`scripts/score_learner_diagnostic.py`

The client does not keyword-score strategic free text and does not expose T1 answer keys.

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
npm run test:unit
npm run build
npm run test:e2e
```

`npm test` executes typecheck, lint, unit tests and production build. Browser tests use Playwright across desktop and mobile fixtures.

## Release governance

- `RELEASE_STATUS.md` contains current truth and owner decisions.
- `ACCEPTANCE_LEDGER.md` lists controlling defects.
- `.openai/hosting.json` is the hosting authority.
- GitHub Actions runs the release gate for changes under this app.
- An `accepted` label is forbidden until automated gates and the live-site smoke test pass.

After the six-wave platform DoD, router thresholds and review intervals must not be tuned further without real learner, delayed-recall and field evidence.
