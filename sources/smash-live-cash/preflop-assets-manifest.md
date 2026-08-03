# Smash Live Cash — Preflop Asset Manifest

Status: `ASSET_RECEIVED / STRUCTURE_VERIFIED / STRATEGY_NOT_YET_EXTRACTED`

This manifest records the two chart archives received on 2026-08-04. It proves file identity and structural coverage. It does not yet admit any range or strategic claim into the Playbook.

## Archive A — Interactive Mastersheet Package

- Uploaded name: `Charts(1).zip`
- Size: 31,974,257 bytes
- SHA-256: `56e5de5c585d0056bd4290af582a985c94f8b85bfacda43556b090a44c5fc64d`
- Clean files after ignoring macOS metadata: 1,973
- Main variants: `Rake` and `No Rake`
- Substantive strategy pages: one index plus ten chart pages per variant
- Embedded strategy contexts include:
  - raise first in;
  - blind-versus-blind and limp/iso situations;
  - versus open;
  - versus 3-bet;
  - squeeze after one caller at 100bb, 200bb, and 400bb;
  - straddled squeeze contexts;
  - ante and no-ante branches.

### Packaging findings

- Most CSS, script, and image files are repeated web-page support assets rather than distinct strategy records.
- The 375 packaged images collapse to only 19 unique image hashes and are primarily site interface/branding assets.
- The strategic matrix data is carried by the saved HTML package, not by those repeated support images.
- A stale template sentence mentions Pot-Limit Omaha. This is treated as web-template contamination, not as course or game metadata. The package itself is Smash Live Cash NLHE material.

## Archive B — Mastersheet Extension Images v4

- Uploaded name: `UPSWING POKER Smash Live Cash Mastersheet Extension Images v4(1).zip`
- Size: 338,344,804 bytes
- SHA-256: `8804620d937e46592d60e09e0c13d24f113ef3a9ba386a1621017d860a6c79ca`
- Strategy images: 996
- Formats: 901 PNG, 95 JPG
- Unique image hashes: 996
- Exact duplicate images: 0
- Main variants: `Rake` and `No Rake`

### Normalized coverage

| Family | No rake | Rake | Conditions |
|---|---:|---:|---|
| Versus squeeze, 100bb | 71 | 71 | Ante and no ante |
| Versus squeeze, 200bb | 71 | 71 | Ante and no ante |
| Versus squeeze, 400bb | 71 | 71 | Ante and no ante |
| Versus squeeze, straddle | 93 | 93 | Ante and no ante |
| Squeeze versus two callers, 100bb | 45 | 44 | Ante and no ante |
| Squeeze versus two callers, 200bb | 45 | 45 | Ante and no ante |
| Squeeze versus two callers, 400bb | 45 | 45 | Ante and no ante |
| Squeeze versus two callers, straddle | 57 | 57 | Ante and no ante |

### Confirmed missing scenario

The rake set is missing one image that exists in the no-rake set:

`SQZ 2callers 100bb / Ante / SB vs HJ+CO+BTN`

This remains an explicit coverage gap until the Excel mastersheet is checked. Do not infer or reconstruct the missing rake range from the no-rake chart.

### Visual QA

Representative images are readable and encode distinct action panels such as:

- `As Raiser` versus `As Caller` after facing a squeeze;
- squeeze versus two callers and the corresponding 4-bet response;
- different squeeze sizes at different stack depths;
- action mixtures represented by colored cells and split frequencies.

Rake and no-rake versions visibly differ and must remain separate assumptions. They may not be merged into a single default range without an explicit game-condition rule.

## Course mapping

Primary lesson linkage:

- `SLC-M01-L02` — Preflop squeezing

Supporting linkage:

- `SLC-M01-L01` — Preflop 101
- `SLC-M01-L03` — Preflop adjustments
- `SLC-M03-L24` to `SLC-M03-L26` — preflop adjustments versus locked 3-bet ranges, subject to transcript and video confirmation

## Admission rules

1. Preserve rake/no-rake, ante/no-ante, stack depth, straddle state, positions, and action history as separate dimensions.
2. Do not treat the 996 images as 996 items to memorize.
3. Extract range shapes, boundary hands, and stable deltas only after reconciling the images with the Excel mastersheet and lesson transcripts.
4. Any chart-derived Playbook rule must state its conditions and source asset family.
5. The original archives remain external media; Git stores this manifest and later normalized knowledge, not the full copyrighted asset library.

## Next reconciliation step

When the Excel archive arrives:

- inventory workbook and sheet structure;
- match sheet tabs to the image-family hierarchy;
- verify the one missing rake scenario;
- identify authoritative legends, color mappings, sizings, and any version notes;
- create a normalized chart index without yet converting it into memorization requirements.
