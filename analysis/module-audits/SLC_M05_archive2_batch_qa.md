# Smash Live Cash — Archive(2) Transcript Batch QA

Status: `BATCH_INDEXED / DUPLICATES_NONE / CLEANUP_PENDING`

## Evidence package

- Uploaded archive: `Archive(2).zip`
- Archive size: 2,493,935 bytes
- Archive SHA-256: `7d3d08e95faebb2d23615196ed8a9f0cac07e1885f86fb79dc1ff9c8fd121059`
- Processing date: 2026-08-04
- Transcription engine: whisper.cpp large-v3
- Language: English forced
- Included formats per lesson: segments JSON, SRT, timestamped TXT, plain TXT, VTT

## Duplicate check

No lesson in this archive duplicates the already processed Module 0 sources. The archive contains nine unique Module 5 lessons: 43, 44, 45, 46, 48, 49, 50, 51, and 53. Missing lessons 42, 47, 52, 54, and 55 remain transcript-pending.

## Coverage and QA

| Source ID | Lesson | Whisper coverage | Segments | Status | QA note |
|---|---|---:|---:|---|---|
| `SLC-M05-L43` | Advanced Postflop Strategy Building Part 1 | 00:00:00,000–00:37:54,640 | 389 | `RAW_MACHINE_TRANSCRIPT` | Local loop at 03:23 and 07:52–07:59; otherwise complete. |
| `SLC-M05-L44` | Advanced Postflop Strategy Building Part 2 | 00:00:00,000–00:38:32,660 | 930 | `NEEDS_RETRANSCRIPTION` | Catastrophic loop from 26:12 through 38:32; tail unusable and must be retranscribed. |
| `SLC-M05-L45` | Advanced Postflop Strategy Building Part 3 | 00:00:00,000–00:29:49,880 | 416 | `RAW_MACHINE_TRANSCRIPT` | Complete timeline; ordinary low-confidence poker terms require cleanup. |
| `SLC-M05-L46` | 88 Check-Raise on 7-6-6 | 00:00:00,000–00:10:26,160 | 110 | `RAW_MACHINE_TRANSCRIPT` | Complete timeline; hand details and solver outputs need visual review. |
| `SLC-M05-L48` | Q4 Bluff Review | 00:00:00,000–00:21:17,780 | 225 | `RAW_MACHINE_TRANSCRIPT` | Complete timeline; minor repeated wording near 20:54. |
| `SLC-M05-L49` | Squeezing with QQ | 00:00:00,000–00:27:21,220 | 276 | `RAW_MACHINE_TRANSCRIPT` | Complete timeline; isolated low-confidence phrase near 05:28. |
| `SLC-M05-L50` | 4-Betting A-5s | 00:00:00,000–00:26:54,340 | 268 | `RAW_MACHINE_TRANSCRIPT` | Complete timeline; brief hallucinated loop at 14:41–14:43. |
| `SLC-M05-L51` | 3-Betting KT in CO vs MP Open | 00:00:00,000–00:28:22,580 | 679 | `RAW_MACHINE_TRANSCRIPT` | Complete timeline; duplicated phrase around 19:09–19:26 and repeated ending. |
| `SLC-M05-L53` | Check-Raising Exercise w Nick | 00:00:00,140–00:42:32,700 | 880 | `RAW_WITH_AUDIO_GAP` | Complete endpoint; hallucinated loop creates an unrecovered gap at 21:07–21:50. |

## Admission decision

- Lessons 43, 45, 46, 48, 49, 50, and 51 are suitable for conservative cleanup into canonical audio-layer transcripts.
- Lesson 53 is usable around a clearly marked 43-second audio-transcription gap; it must not be called fully audio-verified until that interval is recovered.
- Lesson 44 is not suitable for canonical completion: Whisper repeats one sentence from 26:12 to the 38:32 endpoint. A new transcription pass is required for the final 12 minutes 20 seconds.
- No exact solver frequencies, ranges, board suits, or screen-selected actions are admitted from these audio-only files without visual confirmation.

## Batch-level learning relevance

This batch is strategically high-value for the eventual compressed learning system. It covers:

1. building c-bet strategy from global reports rather than memorizing individual boards;
2. translating range and equity structure into sizing and checking decisions;
3. deep-stack overbet and turn-lead mechanics;
4. practical reviews of check-raises, squeezes, 4-bets, and multi-street bluffs;
5. a dedicated BTN-vs-BB check-raise drill that can later become an executable heuristic set.

These are candidate inputs only. Final heuristics require source cleanup, cross-source comparison, and visual verification where exact matrix information matters.
