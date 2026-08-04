# Rerun Checkpoint 03 — L15 Hard Continues QA

Date: 2026-08-04  
Status: `CHECKPOINT_ACCEPTED / SGL-0056_CLOSED`

## Package

- Uploaded archive: `reruns(2).zip`
- Archive size: 645,963 bytes
- SHA-256: `0e8a638e0f123541fb9b7ecc3b5f162575af008229221d313dc7be1fb632404b`
- Engine: faster-whisper
- Model: large-v3
- Language: English forced
- Translation: disabled

The archive contains the previously accepted `SLC-M01-L01` and `SLC-M02-L14` outputs plus one new lesson package:

`SLC-M02-L15 — Finding Hard Continues After Defending Your Big Blind`.

Previously accepted files were treated as duplicates and were not re-integrated.

# SGL-0056 — SLC-M02-L15

## Received chunks

1. Requested `07:55–14:30`; context recovered approximately `07:25–14:58.77`.
2. Requested `14:00–20:30`; context recovered approximately `13:30–20:59.46`.
3. Requested `20:00–25:44`; context recovered approximately `19:30–25:43.19`.
4. Recovery for part 3: requested `20:00–24:00`; context recovered approximately `19:30–24:29.59`.

All required output formats were supplied:

- `segments.json`;
- SRT;
- VTT;
- timestamped TXT;
- plain TXT.

## Supplied technical validation

| Part | Requested interval | Actual final timestamp | Supplied status | Loop marker | Empty/marker segments |
|---|---:|---:|---|---:|---:|
| 1 | `07:55–14:30` | `14:58.77` | `PASS` | none | 0 |
| 2 | `14:00–20:30` | `20:59.46` | `PASS` | none | 0 |
| 3 | `20:00–25:44` | `25:43.19` | `COVERAGE_SHORT` | none | 0 |
| 3.R1 | `20:00–24:00` | `24:29.59` | `PASS` | none | 0 |

The final main chunk ends 0.81 seconds before the nominal media duration.

## Independent overlap reconciliation

The supplied status labels were not accepted automatically. Adjacent chunks were compared after normalising case, punctuation and segmentation.

| Comparison | Token-sequence agreement |
|---|---:|
| Part 1 → Part 2 | 96.5% |
| Part 2 → Part 3 | 89.3% |
| Part 3 → Recovery 1 | 99.2% |

The lower Part 2 → Part 3 score is caused mainly by sentence segmentation and a few ordinary ASR substitutions. The strategic sequence, speaker continuity and action branch remain the same.

Verdict: `OVERLAP_CONTINUITY_PASS`.

## Terminal coverage review

The final main chunk ends with a complete conclusion:

- the weak flop continue is mandatory against a wide, high-frequency c-bet range;
- more passive opponents may allow Hero to realise more equity than equilibrium;
- Hero may also generate extra river fold equity after reaching the river unpaired.

No sentence is cut off and no new speech begins after the last recovered phrase. The missing 0.81 seconds are treated as trailing non-speech.

Verdict: `TERMINAL_SPEECH_COMPLETE`.

## Semantic continuity recovered

The rerun restores the missing central and final lesson:

- why low-showdown-value flop calls supply future bluffs;
- why low-card barrels can outperform middling-card barrels;
- how the opener's offsuit region informs blocker and bluff selection;
- why omitting weak flop calls forces a range to bluff stronger showdown hands later;
- why many live players fail both steps and become river value-heavy;
- how bluff-catcher defence changes after this node lock;
- why frequency changes should be evaluated proportionally;
- why the hard continues may perform better against passive live opponents than against equilibrium.

## Residual ASR and visual risks

The package is accepted at the mechanism level, but not for exact chart reconstruction.

Remaining limitations:

- exact flop and runout cards and suits require video;
- exact hand weights and mixed frequencies require solver screens;
- ordinary ASR forms such as `ace-ex`, `3x` and merged position labels were normalised only when unambiguous;
- one early high-card/backdoor phrase is too unclear for combo-level use;
- spoken river percentages are retained only as an illustration of the direction and proportional scale of the node-lock change.

## Admission decision

Accepted:

- complete audio continuity;
- lesson-level mechanisms;
- source-faithful canonical record;
- candidate-level synthesis and original drills.

Not accepted:

- exact chart cells;
- exact combination boundaries;
- exact solver frequencies or EV;
- universal pool assumptions.

## Verdict

`SGL-0056 — CLOSED / AUDIO_COMPLETE / VISUAL_REVIEW_REMAINS`

The agent should continue with the same chunk size, overlap and recovery policy.