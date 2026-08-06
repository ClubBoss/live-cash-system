# Live Cash OS — Release Status

Status: `V1.1_REPOSITORY_GREEN / PRODUCTION_V1.0_UNCHANGED`

## Repository

- Default branch: `main`
- Current main SHA: `0d9e220a47c1655ec544b2e8430358be63be316f`
- Live Cash OS 1.1 merge commit: `812c186cf454cf5056aee63926613234f9c331ec`
- Source PR: `#7` — merged
- Validated PR head: `5a6899183f65639cd5b597b4cb5d7d20affdf02a`
- Pre-merge CI: `31132310933` — green
- Post-merge CI: `31132611138` — green
- Simplified main CI: `31132752457` — green
- Canonical release command: `npm run test:release`
- Automation: one `main` CI workflow

The validated release gate includes TypeScript, ESLint, editorial integrity, production build, 30 unit/integration tests and desktop/mobile Playwright coverage.

## Product scope admitted in v1.1 repository

- integrity and learner-state kernel;
- schema-2 migration at local and D1 boundaries;
- stable learner, drill and card identities across locales;
- persisted locale and active session;
- evidence-backed 0→100 skill route in Russian and English;
- fully curated bilingual LCM-01;
- LCM-02–LCM-11 remain explicitly pending poker-aware RU/EN editorial review;
- deterministic editorial source locks and integrity checks.

## Production boundary

- Stable URL: `https://live-cash-os.elmarsal.chatgpt.site/`
- Hosting project: `appgprj_6a74674839c88191877199e34e21fc2c`
- D1 binding: `DB`
- Last confirmed deployed source remains the accepted v1.0 source `a22cd0b676730e4eaea2169c36f979c7192b6413`.
- Merging to GitHub does not itself prove that the ChatGPT Site was republished.
- Live Cash OS 1.1 has not been claimed as deployed in this release record.
- No production D1 reset, learner-state reset, URL change or migration action was performed during the repository merge.

## Next production action

Republish `apps/live-cash-os` from current `main` to the existing hosting project, preserving the `DB` binding and stable URL. Then run the retained `npm run smoke:production` script and record the exact deployed source and evidence here.

## Content truth boundary

- `LCM-01` is the gold accepted bilingual teaching module.
- `LCM-02–LCM-11` remain `PENDING` and are not admitted as final strategic copy.
- Content completion, working evidence, retention, variant transfer and field validation remain separate states.

## Current verdict

`REPOSITORY_ACCEPTED / PRODUCTION_RELEASE_PENDING`
