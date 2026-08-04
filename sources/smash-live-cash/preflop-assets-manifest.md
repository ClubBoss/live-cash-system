# Smash Live Cash — Preflop Asset Manifest

Status: `ASSET_RECEIVED / STRUCTURE_COMPLETE / STRATEGY_NOT_YET_EXTRACTED`

This manifest records the interactive chart package, standalone chart exports, and Excel mastersheets received on 2026-08-04. The asset topology is now reconciled. No range or strategic claim is admitted into the Playbook merely because it appears in these files.

## Archive A — Interactive Mastersheet Package

- Uploaded name: `Charts(1).zip`
- Size: 31,974,257 bytes
- SHA-256: `56e5de5c585d0056bd4290af582a985c94f8b85bfacda43556b090a44c5fc64d`
- Clean files after ignoring macOS metadata: 1,973
- Main variants: `Rake` and `No Rake`
- Substantive strategy pages: one index plus ten chart pages per variant
- Embedded contexts include raise first in, blind-versus-blind and limp/iso, versus open, versus 3-bet, squeeze, stack-depth, straddle, ante and no-ante branches.

### Packaging findings

- Most CSS, scripts and repeated images are support assets rather than separate strategic records.
- The 375 packaged images collapse to 19 unique hashes and are primarily interface/branding assets.
- Strategic matrix data is carried by the saved HTML pages.
- A stale Pot-Limit Omaha template sentence is web-template contamination; the package is Smash Live Cash NLHE material.

## Archive B — Mastersheet Extension Images v4

- Uploaded name: `UPSWING POKER Smash Live Cash Mastersheet Extension Images v4(1).zip`
- Size: 338,344,804 bytes
- SHA-256: `8804620d937e46592d60e09e0c13d24f113ef3a9ba386a1621017d860a6c79ca`
- Files: 996 total, including one course cover and 16 family legends
- Standalone strategic scenario images: 979 after filename reconciliation
- Formats: 901 PNG, 95 JPG
- Exact duplicate binary images: 0
- Main variants: `Rake` and `No Rake`

The standalone export is almost complete but contains one omitted rake scenario and one misleading no-rake filename. Both are resolved by Archive C.

## Archive C — Preflop Extension Excel Sheets v2

- Uploaded name: `UPSWING POKER Smash Live Cash Preflop Extension Excel Sheets v2(1).zip`
- Size: 445,563,657 bytes
- SHA-256: `bd867b48e7500244fef06aca8d31b8162effa362feedeb02148684aa28880a16`
- Contents:
  - `Mastersheet Cash Extension RAKE.xlsx`
  - `Mastersheet Cash Extension NO RAKE.xlsx`
  - `Smash Live Cash on Upswing Poker.png`

### Rake workbook

- Size: 267,972,746 bytes
- SHA-256: `e712d4ca71d7c198144333ffb2a5f443ae236401d02432ff0a0a255dde2099e1`
- Visible sheets: 8
- Embedded strategic scenarios: 490

### No-rake workbook

- Size: 253,274,442 bytes
- SHA-256: `752d55d9561d5474006803015a3ea53f85875ce4d0b31b64d5aae964a0eea1ea`
- Visible sheets: 8
- Embedded strategic scenarios: 490

### Workbook architecture

The books are static visual mastersheets, not formula-driven range models:

- no hidden sheets;
- no defined names;
- no strategic formulas;
- range matrices are stored as image-backed cell notes/comments;
- visible cells carry stack, ante, position and prior-action labels;
- legends carry action colors and sizing categories.

The workbooks establish complete structural coverage of **980 scenarios**: 490 rake plus 490 no-rake.

## Normalized coverage

| Family | Stack | Per ante state | Per variant | Both variants | Status |
|---|---:|---:|---:|---:|---|
| Versus squeeze | 100bb | 35 | 70 | 140 | Complete |
| Versus squeeze | 200bb | 35 | 70 | 140 | Complete |
| Versus squeeze | 400bb | 35 | 70 | 140 | Complete |
| Versus squeeze | 100str | 46 | 92 | 184 | Complete |
| Squeeze versus two callers | 100bb | 22 | 44 | 88 | Complete in Excel |
| Squeeze versus two callers | 200bb | 22 | 44 | 88 | Complete |
| Squeeze versus two callers | 400bb | 22 | 44 | 88 | Complete |
| Squeeze versus two callers | 100str | 28 | 56 | 112 | Complete |
| **Total** |  |  | **490** | **980** | **Complete** |

## Reconciled anomalies

### Standalone rake export omission

The standalone image archive omits:

```text
RAKE|SQUEEZE_2_CALLERS|100BB|ANTE|SB|HJ+CO+BTN
```

The scenario exists in the rake workbook:

- sheet: `SQZ 2callers 100bb`
- cell: `D18`
- embedded media: `image351.jpeg`
- dimensions: `1631 × 753`
- SHA-256: `384f7ae2c3092d783911027073a6fc8a8ab077634c6763dc43f3872732f471ac`

The combined asset set is therefore complete; only the standalone export folder is incomplete.

### Standalone no-rake filename error

Within `SQZ 2callers STRADDLE No Ante`, file `2. SB vs EP+MP+BTN.png` is mislabeled. Visual reconciliation with the workbook establishes that it represents:

```text
NO_RAKE|SQUEEZE_2_CALLERS|100STR|NO_ANTE|SB|EP+HJ+BTN
```

Workbook location: sheet `SQZ 2callers STR`, cell `A8`, media `image481.jpeg`.

## Visual and assumption QA

- Rake and no-rake ranges visibly differ and must remain separate assumptions.
- Ante/no-ante, stack depth, straddle state, positions and action history are independent dimensions.
- The legend sizing families also change with depth and pot type.
- Representative images contain multiple action panels, mixed-frequency cells and boundary hands.
- The chart inventory must be compressed into patterns and deltas, not memorized image by image.

## Course mapping

Primary lesson linkage:

- `SLC-M01-L02` — Preflop squeezing

Supporting linkage:

- `SLC-M01-L01` — Preflop 101
- `SLC-M01-L03` — Preflop adjustments
- `SLC-M03-L24` to `SLC-M03-L26` — preflop adjustments versus locked 3-bet ranges, subject to transcript and video confirmation

## Admission rules

1. Preserve rake/no-rake, ante/no-ante, stack depth, straddle state, positions and action history as separate dimensions.
2. Do not treat the 980 scenarios as 980 memorization requirements.
3. Extract range shapes, boundary hands and stable deltas only after reconciling charts with lesson transcripts and relevant video.
4. Any chart-derived Playbook rule must state its conditions and source family.
5. Original copyrighted archives remain external media; Git stores manifests, normalized structure and derived knowledge rather than the full asset library.

## Next step

After Gemini transcripts arrive, process `Preflop 101`, `Preflop squeezing`, and `Preflop adjustments` first. Use the chart index to connect each verbal principle to the relevant scenario family, then admit only a compact set of anchor ranges and executable deltas.
