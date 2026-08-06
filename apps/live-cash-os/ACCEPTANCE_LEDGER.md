# Live Cash OS acceptance ledger

Status: `ACCEPTED_LIVE / BILINGUAL_COPY_WAVE_IN_PROGRESS`

Production authority:

- stable URL: `https://live-cash-os.elmarsal.chatgpt.site/`;
- accepted live source: `a22cd0b676730e4eaea2169c36f979c7192b6413`;
- release-truth main: `90ad4bac0053ee08d8739c42f10246866599d368`;
- app `1.0.0`, learner-state schema `2`, content `2026.08-wave6`;
- D1 binding: `DB`.

## Closed platform defects

- [x] Teaching layer exists and LCM-01 is the accepted gold module.
- [x] Repair and delayed review are skill-specific.
- [x] Content completion is separate from evidence, retention and field validation.
- [x] Canonical B/C semantics match diagnostic authority.
- [x] Nine learner dimensions are stored separately per module.
- [x] T1 is optional and distinguishes cold baseline from post-learning diagnostic.
- [x] Raw T1 handoff is separated from evaluated scorer input.
- [x] Distractors are item-specific and mapped to misconception IDs.
- [x] Flashcards use due dates, intervals, repetitions and lapses.
- [x] Raw field notes do not grant field transfer before review.
- [x] Local/cloud state uses schema validation and revision conflict checks.
- [x] Active sessions resume.
- [x] Desktop/mobile E2E, build, typecheck, lint and content tests are green.
- [x] Stable live URL published and owner-authenticated smoke passed.

## Open product-quality work

### P0 for the current bilingual wave

- [ ] Replace mixed Russian/English computer-style copy with natural poker-language Russian.
- [ ] Provide a complete independent English learner-facing version.
- [ ] Add a persistent `RU / EN` language control without resetting learner state.
- [ ] Keep all IDs, answer keys, evidence mappings and progression identical across locales.
- [ ] Add locale parity and stale-translation gates.
- [ ] Preserve the stable URL and D1 state through publication.

### Validation pending after the bilingual wave

- [ ] Repeat content-level acceptance for LCM-02–LCM-11.
- [ ] Collect first real learner session on LCM-01.
- [ ] Collect delayed-recall evidence.
- [ ] Collect reviewed field-hand evidence.
- [ ] Run T1 only with an explicit `COLD_BASELINE` or `POST_LEARNING_DIAGNOSTIC` context.

## Translation governance

The product must not maintain two copies of runtime logic or strategic data.

- Stable semantic IDs and poker metadata are locale-neutral.
- Russian is the current source locale for accepted learner copy.
- English is a keyed translation pack applied to the same content graph.
- Each translated entry stores the exact source text it was translated from.
- CI fails on missing, orphaned or stale translations.
- Missing translations may fall back visibly during development, but never in an accepted production release.
- Machine-generated drafts are `DRAFT` until a poker-language review accepts them.

The release is accepted for the published Russian-first v1.0 runtime. The bilingual copy wave is a new release candidate and does not invalidate that production acceptance until it replaces the live version.
