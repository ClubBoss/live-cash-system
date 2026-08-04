# SLC-M01-L01 Preflop 101 — Partial Targeted Rerun QA

Date: 2026-08-04  
Status: `PARTIAL_RERUN_ACCEPTED / 6_OF_7_CHUNKS_VERIFIED / ISSUE_REMAINS_OPEN`

## Package

- Uploaded archive: `reruns.zip`
- Archive size: approximately 284 KB
- SHA-256: `6dd4f8447b923cc166b7e028996a4206dde0e84ead3730e240692004fcc43fb2`
- Lesson: `SLC-M01-L01 — Preflop 101`
- Engine: faster-whisper
- Model: large-v3
- Language: English forced
- Translation: disabled

## Files received

Six rerun chunks were received. Each contains:

- `segments.json`;
- SRT;
- VTT;
- timestamped TXT;
- plain TXT.

A separate `validation.tsv` was included.

Received intervals:

1. `00:30–08:30`, with context extending approximately `00:00–09:00`;
2. `08:00–16:00`, with context extending approximately `07:30–16:30`;
3. `15:30–23:30`, with context extending approximately `15:00–24:00`;
4. `23:00–31:00`, with context extending approximately `22:38–31:30`;
5. `30:30–38:30`, with context extending approximately `30:00–39:00`;
6. `38:00–46:00`, with context extending approximately `37:30–46:29`.

Missing planned chunk:

7. `45:30–50:32`.

## Technical coverage

The supplied validation reports all six chunks as `PASS`:

| Part | Requested interval | Actual final timestamp | Loop marker |
|---|---:|---:|---|
| 1 | `00:30–08:30` | `08:59.940` | none |
| 2 | `08:00–16:00` | `16:29.810` | none |
| 3 | `15:30–23:30` | `23:59.890` | none |
| 4 | `23:00–31:00` | `31:29.900` | none |
| 5 | `30:30–38:30` | `38:59.660` | none |
| 6 | `38:00–46:00` | `46:29.430` | none |

No empty marker segments or exact repeated runs were reported.

## Independent overlap reconciliation

The automatic `PASS` labels were not accepted by themselves. Adjacent context windows were independently compared after case, punctuation and whitespace normalisation.

| Chunk pair | Approximate text agreement |
|---|---:|
| 1 → 2 | 95.9% |
| 2 → 3 | 97.0% |
| 3 → 4 | 95.3% |
| 4 → 5 | 93.2% |
| 5 → 6 | 96.5% |

The overlap passages preserve the same sequence of claims and do not show a change of speaker, missing strategic transition or hallucinated replacement topic.

Verdict: `OVERLAP_CONTINUITY_PASS`.

## Semantic quality assessment

The rerun successfully recovers a coherent lesson structure through `46:29`:

- baseline-versus-deviation chart philosophy;
- rake/no-rake and ante/no-ante range differences;
- hidden cumulative cost of slightly loose preflop play;
- proportional range reading through offsuit combinations and pocket pairs;
- the offsuit-pip heuristic for preflop and postflop bluff selection;
- navigation of RFI, BB defence, four-bet response, blind-versus-blind and squeeze charts;
- hand reach/weight through later nodes;
- straddle-unit translation;
- population adjustment for no-ante blind-versus-blind limping;
- early-position flatting and squeeze exposure.

The former catastrophic repeated phrase is absent.

## Residual transcript risks

The package is strong but not literally error-free.

### Terminology normalisation

The machine output sometimes renders:

- `ante` as `anti`;
- `PioSolver` as `PO solver`;
- poker hand names without reliable rank separators.

These were normalised only when the intended established term was unambiguous from repeated context.

### Strategically material ambiguities

1. Around `31:30–32:00`, one hand-class phrase is unclear in the machine output. It was excluded from exact combo conclusions.
2. Around `35:30–36:10`, one sentence appears to state the wrong direction for a displayed frequency. The following explanation clearly establishes that ante play permits wider participation and requires protected limps, but no exact frequency is accepted.
3. The chart itself was not supplied, so mixed weights, colours and exact boundaries remain visual-dependent.

## Admission decision

Accepted now:

- source continuity from `00:00` through `46:29`;
- lesson-level mechanisms that do not depend on exact chart cells;
- partial strategic analysis;
- use as evidence for general live-cash candidate heuristics.

Not accepted yet:

- closure of `SGL-0053`;
- the final `46:29–50:32` conclusion;
- exact preflop anchor ranges;
- exact mixed frequencies, sizing matrices or chart colours;
- claims based on the two ambiguous local phrases.

## Required continuation

Run and return the final chunk:

`SLC-M01-L01__rerun_45-30_50-32__part_7`

It should preserve at least 20–30 seconds of overlap with Part 6 and include all five output formats.

## Verdict

`SLC_M01_L01_PARTIAL_RERUN_HIGH_QUALITY_ACCEPTED`

`SGL-0053_REMAINS_OPEN_FOR_FINAL_TAIL`
