# Local Whisper Pipeline

## Purpose

Run high-quality batch speech-to-text locally before source verification. Whisper output is a mechanical extraction layer, not the source of strategic truth.

The canonical flow is:

```text
Original audio/video
  -> local faster-whisper batch output
  -> visual and poker QA against the original video
  -> canonical source record
  -> lesson analysis
  -> Playbook admission decision
```

## Why faster-whisper

The project uses `faster-whisper` because it supports:

- segment timestamps;
- word-level timestamps;
- batch processing with one model load;
- voice-activity filtering;
- CPU execution;
- local processing without uploading course media to a third party.

## macOS setup

Use Python 3.11 for the most predictable package compatibility.

```bash
brew install python@3.11
cd /path/to/live-cash-system
python3.11 -m venv .venv-whisper
source .venv-whisper/bin/activate
python -m pip install --upgrade pip
python -m pip install -r requirements-whisper.txt
```

The first transcription run downloads the selected model. Keep the machine online until that download finishes.

## First test: Intro

```bash
python scripts/transcribe_course.py \
  "/path/to/Intro.mp4" \
  --output-dir transcription-output \
  --model large-v3 \
  --device cpu \
  --compute-type int8 \
  --course "Smash Live Cash" \
  --module "0-Intro" \
  --instructor "Nick Petrangelo"
```

Expected output directory:

```text
transcription-output/
└── Intro/
    ├── Intro.raw.md
    ├── Intro.segments.json
    ├── Intro.srt
    └── Intro.timestamped.txt
```

## Batch the full audio folder

```bash
python scripts/transcribe_course.py \
  "/path/to/course-audio-folder" \
  --output-dir transcription-output/smash-live-cash \
  --model large-v3 \
  --device cpu \
  --compute-type int8 \
  --course "Smash Live Cash" \
  --instructor "Nick Petrangelo"
```

The model loads once and all supported files below the input directory are processed recursively.

## Model choice

### `large-v3`

Use for the canonical first pass when accuracy matters most. This is the recommended default for poker terminology, names, numbers, and long-form instruction.

### `turbo`

Use for a faster preliminary pass:

```bash
--model turbo
```

A fast draft must still be checked against the original media before source admission.

## NVIDIA GPU option

On a machine with a supported NVIDIA CUDA setup:

```bash
--device cuda --compute-type float16
```

The default CPU configuration remains:

```bash
--device cpu --compute-type int8
```

## Outputs and status

### `.segments.json`

Primary machine-readable evidence:

- segment start and end;
- word start and end;
- word probability where available;
- language probability;
- model and engine metadata.

### `.timestamped.txt`

Compact transcript for fast review and comparison.

### `.srt`

Useful for checking the transcript while watching the original video.

### `.raw.md`

Readable draft for ingestion into the Live Cash System.

Every generated file remains `RAW_MACHINE_TRANSCRIPT`. It must not be copied into canonical `sources/` unchanged.

## Poker-specific QA requirements

Whisper can misrecognize or normalize strategically important details. Verify against the video:

- cards and suits;
- positions;
- stack depths;
- bet and raise sizes;
- pot sizes;
- frequencies and EV values;
- player and venue names;
- abbreviations such as BTN, BB, SPR, MDF, GTO;
- references such as “these hands” or “this range” that depend on the screen.

Audio alone cannot verify charts, solver matrices, selected nodes, or visual contradictions.

## Recommended operating mode

1. Run the entire audio folder locally through `large-v3`.
2. Keep the generated JSON, SRT, TXT, and raw Markdown outside Git.
3. Send the raw output for a lesson together with its original video.
4. Perform visual and poker QA.
5. Commit only the final `SOURCE_VERIFIED` Markdown record and downstream analysis.

## Re-running files

Existing complete output sets are skipped. Use `--force` to overwrite them:

```bash
python scripts/transcribe_course.py "/path/to/file.mp4" --force
```

## Failure handling

The batch continues after an individual file fails and exits with a non-zero status if any failures occurred. Review terminal lines beginning with `FAILED` and rerun those files separately.
