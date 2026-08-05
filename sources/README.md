# Sources

Canonical source-family routing is defined in `governance/REPOSITORY_INFORMATION_ARCHITECTURE_v1.md`.

Active families:

- `smash-live-cash/`
- `ftgu/`
- `cash-injection/`

Planned families:

- `carrot-poker/`
- `external/`

Use immutable source IDs and keep each family’s registry, records and QA inside its own directory. Cross-source comparison belongs in `synthesis/`.

Current Cash Injection coverage:

- `CINJ-E01` canonically ingested;
- Episodes 2–10 pending;
- population claims remain hypothesis-gated until independent or field validation.
