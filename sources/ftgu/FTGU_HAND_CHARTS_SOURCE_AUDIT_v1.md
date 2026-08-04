# FTGU Hand Charts — Source Audit v1

Date: 2026-08-05  
Status: `REFERENCE_ONLY / NOT_ADMITTED_AS_EXACT_ANCHOR_RANGES`

## Source

- File: `FromTheGroundUp-Hand_Charts-converted-edited.pdf`
- SHA-256: `4899b3db0387b405eab8d5a4b9697dd73b50fc71a458921ca14cd11f270767f3`
- Pages: 6
- Document metadata creation date: 2019-02-22
- Author shown on cover: Peter Clarke
- Visible third-party watermark: `cheapcourses.eu`

## Visual contents

Page 1 is the cover. Pages 2-6 contain binary red/grey first-in hand charts:

| Page | Position | Printed percentage | Red hand classes | Red card combinations | Combo-weighted percentage |
|---:|---|---:|---:|---:|---:|
| 2 | UTG | 13% | 33 | 182 | 13.73% |
| 3 | HJ | 18% | 42 | 242 | 18.25% |
| 4 | CO | 31% | 68 | 426 | 32.13% |
| 5 | BU | 45% | 91 | 622 | 46.91% |
| 6 | SB | 39.5% | 77 | 518 | 39.06% |

The combo-weighted calculation uses 6 combinations for pairs, 4 for suited hands and 12 for offsuit hands.

## Important discrepancy

The printed percentages do not exactly equal the binary red-cell combo totals. The difference is small for HJ and SB but reaches roughly 1-2 percentage points for CO and BU.

Possible explanations include:

- rounded pedagogical labels;
- mixed-frequency boundaries converted into binary cells;
- editing during conversion;
- a chart version mismatch.

The PDF contains no legend that resolves this. Therefore the printed percentages and red cells must not be treated as one exact mathematical range without further source context.

## Missing assumptions

The PDF does not state on the chart pages:

- opening size;
- stack depth;
- rake structure;
- ante/no-ante state;
- whether boundary hands are pure or mixed;
- date/version of the strategic ranges.

Episode 1 frames the course around six-max cash and says 100 big blinds are assumed unless otherwise stated, but that course-level statement does not prove every chart uses the same rake and opening-size assumptions.

## Source-purity and product use

The PDF is suitable as a private reference source only.

Do not:

- copy the proprietary chart images into the product;
- reproduce the exact range tables as original Live Cash System content;
- use the visible percentages as exact admitted frequencies;
- represent the file as a current live-cash chart without rake and environment validation.

Permitted internal use:

- compare range shape across positions;
- identify candidate anchor families;
- cross-check FTGU transcript references;
- flag boundaries for later original solver work or independent range construction.

## Initial strategic reading

The charts show a clear position-sensitive expansion:

- early position is weighted toward suited aces, strong broadways, pairs and a small connected-suited region;
- HJ adds all pairs and selected suited connectors/gappers plus ATo and KJo;
- CO expands suited kings, offsuit broadways and connected suited/offsuit classes;
- BU becomes substantially wider, including offsuit aces and additional suited low-card structures;
- SB is wide but materially different from BU rather than a simple copy.

This supports the general mechanism that position and the number of players remaining shape the opening range. It does not yet establish live-rake-adjusted anchor ranges.

## Verdict

`FTGU_HAND_CHARTS_ACCEPTED_AS_REFERENCE_ONLY`

`EXACT_RANGE_ADMISSION_BLOCKED_BY_ASSUMPTIONS_AND_PERCENTAGE_MISMATCH`
