# Smash Live Cash — Normalized Preflop Chart Index

Status: `STRUCTURE_COMPLETE / 980_SCENARIOS_INDEXED / STRATEGY_NOT_YET_EXTRACTED`

This index normalizes the rake and no-rake Excel mastersheets into scenario dimensions. It is an inventory and routing layer, not a set of ranges to memorize and not yet a Playbook authority.

## Canonical dimensions

Every scenario is identified by:

```text
rake model
× family
× stack depth
× ante state
× acting position
× prior positions/action history
```

Canonical key format:

```text
VARIANT|FAMILY|STACK|ANTE|ACTOR|PRIOR_POSITIONS
```

Example:

```text
RAKE|SQUEEZE_2_CALLERS|100BB|ANTE|SB|HJ+CO+BTN
```

## Verified coverage

Both Excel books contain the same complete scenario topology: **490 strategic range images per variant**, **980 total**.

| Family | Stack | Per ante state | Per variant | Both variants | Excel coverage |
|---|---:|---:|---:|---:|---|
| Facing squeeze | 100bb | 35 | 70 | 140 | Complete |
| Facing squeeze | 200bb | 35 | 70 | 140 | Complete |
| Facing squeeze | 400bb | 35 | 70 | 140 | Complete |
| Facing squeeze | 100str | 46 | 92 | 184 | Complete |
| Squeeze versus two callers | 100bb | 22 | 44 | 88 | Complete |
| Squeeze versus two callers | 200bb | 22 | 44 | 88 | Complete |
| Squeeze versus two callers | 400bb | 22 | 44 | 88 | Complete |
| Squeeze versus two callers | 100str | 28 | 56 | 112 | Complete |
| **Total** |  |  | **490** | **980** | **Complete** |

Each stack/family branch is split into `ANTE` and `NO_ANTE`. Rake and no-rake are separate variants and may not be silently merged.

## Workbook architecture

The two workbooks each contain eight visible sheets:

1. `VS SQZ 100bb`
2. `VS SQZ 200bb`
3. `VS SQZ 400bb`
4. `VS SQZ STR`
5. `SQZ 2callers 100bb`
6. `SQZ 2callers 200bb`
7. `SQZ 2callers 400bb`
8. `SQZ 2callers STR`

The books are static visual mastersheets rather than computational models:

- no hidden sheets;
- no defined names;
- no strategic formulas;
- range matrices are embedded as image-backed cell notes/comments;
- visible cell labels define positions, prior action, stack and ante context;
- legends define the action-color mapping and available sizing categories.

## Legend sizing families

These are source legend categories, not yet recommended defaults.

| Family | Stack | Displayed action categories |
|---|---:|---|
| Facing squeeze | 100bb | All in; 2x, 2.3x, 2.5x 4-bet; Call |
| Facing squeeze | 200bb | All in; 2.3x, 2.5–2.6x, 2.75x, 3.2x, 4x 4-bet; Call |
| Facing squeeze | 400bb | All in; 2.3x, 2.4–2.5x, 3x, 4–4.2x, 5.4x 4-bet; Call |
| Facing squeeze | 100str | All in; 2.3–2.4x, 3x 4-bet; Call |
| Squeeze versus two callers | 100bb | All in; 6x, 6.5x, 7x, 8x, 9.5x, 10x squeeze; Call |
| Squeeze versus two callers | 200bb | All in; 7–7.5x, 8.5x, 10x squeeze; 1.8–1.9x 5-bet; Call |
| Squeeze versus two callers | 400bb | All in; 7.5x, 8.5x, 9x, 10x squeeze; 3x 5-bet; Call |
| Squeeze versus two callers | 100str | All in; 6.5–7x, 7.1–7.5x squeeze; Call |

## Reconciled asset anomalies

### Rake image missing from the standalone image archive

The standalone image archive omits:

```text
RAKE|SQUEEZE_2_CALLERS|100BB|ANTE|SB|HJ+CO+BTN
```

The scenario is present and readable in the rake Excel book:

- sheet: `SQZ 2callers 100bb`
- cell: `D18`
- embedded media: `image351.jpeg`
- dimensions: `1631 × 753`
- SHA-256: `384f7ae2c3092d783911027073a6fc8a8ab077634c6763dc43f3872732f471ac`

Therefore the course asset set is complete when the Excel book is included; only the standalone export folder is incomplete.

### No-rake image mislabeled in the standalone image archive

In `SQZ 2callers STRADDLE No Ante`, file `2. SB vs EP+MP+BTN.png` is mislabeled. Pixel-level visual reconciliation shows it matches the workbook scenario:

```text
NO_RAKE|SQUEEZE_2_CALLERS|100STR|NO_ANTE|SB|EP+HJ+BTN
```

Workbook location:

- sheet: `SQZ 2callers STR`
- cell: `A8`
- embedded media: `image481.jpeg`

The standalone folder therefore has two files named `SB vs EP+MP+BTN`; the second is the `EP+HJ+BTN` scenario.

## Course linkage

Primary:

- `SLC-M01-L02` — Preflop squeezing

Supporting:

- `SLC-M01-L01` — Preflop 101
- `SLC-M01-L03` — Preflop adjustments
- `SLC-M03-L24` to `SLC-M03-L26` — adjustments versus locked 3-bet ranges, pending transcript/video confirmation

## Extraction rule

Do not turn this 980-scenario inventory into 980 memorization requirements. After the relevant transcripts are verified, extract:

1. stable range shapes;
2. boundary-hand families;
3. rake/no-rake deltas;
4. depth deltas;
5. ante and straddle deltas;
6. a small set of executable anchor ranges and decision rules.
