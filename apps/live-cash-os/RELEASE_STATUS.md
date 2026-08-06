# Live Cash OS — Release Status

## Current production

Status: `ACCEPTED / MAIN_MERGED / LIVE_SMOKE_GREEN`

- Stable live URL: `https://live-cash-os.elmarsal.chatgpt.site/`
- Deploy source: `apps/live-cash-os`
- Accepted six-wave source SHA: `ba927405642a7aa7238c06db4348ef5b02921fdf`
- Release-truth main SHA: `90ad4bac0053ee08d8739c42f10246866599d368`
- Pull request: `#2` — squash merged
- Pre-merge CI run: `31115462552` — green
- Post-merge main CI run: `31115738775` — green
- Deployed GitHub source SHA: `a22cd0b676730e4eaea2169c36f979c7192b6413`
- Current live app: `1.0.0`
- Learner-state schema: `2`
- Stable content graph: `2026.08-wave6`
- Existing Site version: `24`
- D1 binding: `DB`

The accepted production site remains valid while the bilingual release is developed on a separate branch.

## Bilingual release candidate

Status: `1.1.0 / IN_PROGRESS / NOT_DEPLOYED`

Branch:

`agent/live-cash-os-bilingual-copy-pass`

Scope:

1. reconcile the stale acceptance ledger with current production truth;
2. replace mixed computer-style Russian copy with natural poker-language Russian;
3. add an independently usable English version;
4. provide a persistent `RU / EN` control;
5. preserve one semantic graph, one answer key and one learner state;
6. detect missing and stale translations automatically;
7. keep machine-generated copy in `DRAFT` until reviewed;
8. verify locale switching, reload persistence, session continuity and mobile layouts;
9. publish only after repository CI and authenticated RU/EN live smoke pass.

The release candidate must not change the stable URL, hosting project, D1 binding or learner-state schema.

## Locale architecture

```text
canonical content and stable IDs
→ extracted source catalogue
→ RU / EN translation memories
→ locale runtime
→ one learner state
```

Translation entries carry the exact source snapshot. If tomorrow's source text changes, the old translation is marked stale rather than reused silently. The sync command drafts only changed strings; the release gate rejects `DRAFT`, missing, orphaned and stale entries.

## Completed six-wave scope

1. Truth reset, version separation and acceptance ledger.
2. Canonical response classes, nine dimensions and per-module evidence.
3. Ten-stage teaching layer with LCM-01 as the gold module.
4. Skill-specific repair, delayed review, cards, session resume and field-note review.
5. T1 raw/evaluated handoff and revision-safe local/D1 state.
6. Structured LCM-01–LCM-11 corpus, release CI, desktop/mobile E2E and PWA shell.

## Owner decisions

1. Russian and English are complete learner-facing modes, not two copies of the application.
2. Standard poker vocabulary may remain in its conventional form when translation would reduce clarity.
3. Language choice is presentation state and cannot reset or distort poker evidence.
4. T1 is optional; it is a cold baseline only before the first learning exposure.
5. Content completion, working evidence, retention and field validation remain separate.
6. No single correct answer creates mastery.
7. The stable live URL and D1 data must remain unchanged.
8. Machine translation may create drafts but cannot publish without the locale gate.
9. `LCM-01` remains the gold accepted teaching module.
10. `LCM-02–LCM-11` remain validation-pending until the repeat content audit and real use.

## Next release gate

The production status changes only after all of the following are true:

- translation memories are complete, current and `REVIEWED`;
- Russian copy has no banned software-style learner jargon;
- English copy contains no Russian fallback;
- IDs and answer keys are identical across locales;
- typecheck, lint, unit/content/i18n tests and production build pass;
- desktop and mobile E2E pass in both languages;
- the existing Site project is republished;
- authenticated live smoke passes in RU and EN.
