# Rerun Checkpoint 05 — Final Targeted Queue QA

Date: 2026-08-05  
Status: `CHECKPOINT_ACCEPTED / SEVEN_ISSUES_CLOSED / ONE_PRIOR_MEDIA_TAIL_REMAINS`

## Package

- Uploaded archive: `reruns 2.zip`
- Archive size: 2,219,244 bytes
- SHA-256: `84b8704ca73c722d57c3c721a1a0e18625975d5f692a0bfa028a8a952aad0600`
- Engine: faster-whisper
- Model: large-v3
- Language: English forced
- Translation: disabled

The archive contains previously accepted outputs from checkpoints 01–04 plus seven new targeted results. Prior accepted files were treated as duplicates and were not re-integrated.

## New issue coverage

| Issue | Source | Requested interval | Actual recovered endpoint | Independent result |
|---|---|---:|---:|---|
| `SGL-0047` | `SLC-M02-L16` | `15:10–19:19` | `19:18.01` | CLOSED |
| `SGL-0052` | `SLC-M02-L22` | `18:35–26:05` | `26:05.00` | CLOSED |
| `SGL-0027` | `SLC-M07-L63` | `17:00–19:13` | `19:12.81` | CLOSED |
| `SGL-0014` | `SLC-M05-L53` | `20:40–22:15` | context through `22:44.91` | CLOSED |
| `SGL-0049` | `SLC-M02-L18` | `13:00–15:05` | context through `15:34.82` | CLOSED |
| `SGL-0054` | `SLC-M02-L04` | `05:40–08:17` | `08:15.72` | CLOSED |
| `SGL-0045` | `SLC-M02-L11` | `03:55–19:49` in three chunks | `19:48.64` | CLOSED |

# 1. SGL-0047 — Top-Pair Check-Raise Part 1

The main rerun covers the missing tail and two recoveries independently reproduce it.

- main versus recovery 1: 100% normalised token agreement;
- main versus terminal recovery: 97.4%;
- no loops or empty segments;
- the final speech completes the board summary and transitions to the next comparison.

The missing 0.99 seconds contain no additional strategic speech.

Verdict: `SGL-0047 — CLOSED / AUDIO_COMPLETE / VISUAL_REVIEW_REMAINS`.

# 2. SGL-0052 — HJ vs BTN 50-Flop Report

The rerun begins with context before the failed tail and reaches the exact nominal endpoint.

Recovered content includes:

- lowest-EV board study order;
- delayed c-bet and heavy-check strategy;
- linear thin-value check-raises against over-stabbing opponents;
- simple study-size selection;
- high- versus low-frequency IP stab board classes.

No loops, gaps or marker-only segments were found.

Verdict: `SGL-0052 — CLOSED / AUDIO_COMPLETE / VISUAL_REVIEW_REMAINS`.

# 3. SGL-0027 — Build Your Own Stuff

The main and recovery outputs are identical after normalisation. The final workflow is complete and closes with an instructional sign-off.

Recovered study loop:

`script → aggregate report → prediction → review → bot reps → save mistakes → browser analysis → node-lock → repeat`.

The final 0.19 seconds contain no additional speech.

Verdict: `SGL-0027 — CLOSED / TARGETED_TAIL_AUDIO_COMPLETE / EARLIER_CANONICAL_INGESTION_PENDING`.

# 4. SGL-0014 — Check-Raising Exercise

The requested exercise interval is fully covered with approximately 30 seconds of context on both sides. It recovers:

- no-ante versus ante range-width differences;
- reduced fold inventory against the tighter range;
- linear value emphasis;
- equity reordering after raise-call filters both ranges;
- later-street value-size splitting.

The file does not need to reach the lesson endpoint because the issue was a bounded internal interval.

Verdict: `SGL-0014 — CLOSED / TARGETED_INTERVAL_AUDIO_COMPLETE / EARLIER_CANONICAL_INGESTION_PENDING`.

# 5. SGL-0049 — Leading Turns After Calling

The rerun begins before the failed transition and continues beyond the already usable J-8-3 section. It establishes continuous context from the low-board large-bet example into the wide-small-bet example.

Recovered mechanism:

- a nominal brick can favour OOP when a large c-bet clears OOP's high-card dust while IP retains unpaired high cards;
- after a wide small c-bet, the same low/paired turn class creates a broader linear lead because both ranges retain more made hands.

Verdict: `SGL-0049 — CLOSED / AUDIO_COMPLETE / VISUAL_REVIEW_REMAINS`.

# 6. SGL-0054 — Postflop Intro

The main and recovery outputs are identical after normalisation. The final speech is a complete course-level conclusion.

The missing 1.28 seconds contain no additional speech.

Verdict: `SGL-0054 — CLOSED / AUDIO_COMPLETE / VISUAL_REVIEW_REMAINS`.

# 7. SGL-0045 — Turn Barreling IP Part 3

Three main chunks and two terminal recoveries were supplied.

Independent reconciliation:

- part 1 → part 2 overlap: 95.3%;
- part 2 → part 3 overlap: 96.0%;
- part 3 versus recovery 1: 100%;
- terminal recovery agreement: 98.6%.

No repeated loop or branch discontinuity remains. The final 0.36 seconds contain no additional strategic speech.

Recovered mechanisms include:

- tighter turn defence reduces brick-river bluff supply;
- the same node-lock can improve flush-completing rivers for IP;
- extreme sizes create a distinct live response node;
- missed flush-draw bluff quality depends on the defender's retained flush-draw classes;
- narrow value requires narrow bluffs;
- river bluff-catchers should block central value and unblock surviving bluffs.

Verdict: `SGL-0045 — CLOSED / AUDIO_COMPLETE / VISUAL_REVIEW_REMAINS`.

# Remaining Audio Residual

No new evidence in this package closes the earlier `SGL-0018` nominal tail:

- source: `SLC-M03-L25`;
- accepted speech: through `24:47.75`;
- nominal duration: `25:12`;
- remaining verification: original media `24:47.75–25:12`.

Repeated ASR agreement is insufficient for a 24.25-second nominal deficit. Direct video/audio inspection remains required.

# Package-Level Verdict

`RERUN_CHECKPOINT_05_ACCEPTED`

`SEVEN_NEW_ISSUES_CLOSED`

`TARGETED_RERUN_QUEUE_COMPLETE_EXCEPT_SGL-0018_MEDIA_TAIL`

The agent's large-v3 method is accepted for all received targeted intervals. Remaining work is no longer bulk rerunning: it consists of one direct-media tail check, conservative canonical ingestion/cleanup of first-cycle machine-complete lessons, and targeted visual review for exact claims.
