#!/usr/bin/env python3
"""Batch-transcribe poker course audio/video with faster-whisper.

Outputs per source:
- .segments.json: machine-readable segment and word timestamps
- .timestamped.txt: readable timestamped transcript
- .srt: subtitle file
- .raw.md: Markdown draft for downstream source verification

All outputs are machine-generated and must remain RAW until checked against the
original media, especially for cards, suits, positions, sizings, and solver data.
"""

from __future__ import annotations

import argparse
import json
import sys
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Iterable, Sequence

try:
    from faster_whisper import WhisperModel
except ImportError as exc:  # pragma: no cover - user-facing dependency guard
    raise SystemExit(
        "faster-whisper is not installed. Run: "
        "python -m pip install -r requirements-whisper.txt"
    ) from exc

SUPPORTED_EXTENSIONS = {
    ".aac",
    ".flac",
    ".m4a",
    ".mka",
    ".mkv",
    ".mp3",
    ".mp4",
    ".ogg",
    ".opus",
    ".wav",
    ".webm",
}

POKER_CONTEXT = (
    "No-Limit Hold'em live cash poker course. Preserve poker terminology and "
    "notation. Common terms include: Nick Petrangelo, Nicky P, UTG, HJ, CO, "
    "BTN, SB, BB, limp, open, call, fold, three-bet, four-bet, check, bet, "
    "raise, jam, effective stack, big blinds, deep stack, rake, ante, straddle, "
    "single-raised pot, three-bet pot, multiway pot, range advantage, nut "
    "advantage, solver, frequency, expected value, bankroll management, "
    "shot taking, rebuy, re-entry, Foxwoods, Mohegan Sun, Turning Stone, "
    "Triton, GGPoker, EPT. Do not translate the English speech."
)


@dataclass(frozen=True)
class WordRecord:
    start: float | None
    end: float | None
    word: str
    probability: float | None


@dataclass(frozen=True)
class SegmentRecord:
    id: int
    start: float
    end: float
    text: str
    avg_logprob: float | None
    no_speech_prob: float | None
    words: list[WordRecord]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Transcribe one poker course media file or a whole directory."
    )
    parser.add_argument("input", type=Path, help="Media file or directory")
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=Path("transcription-output"),
        help="Output root (default: transcription-output)",
    )
    parser.add_argument(
        "--model",
        default="large-v3",
        help="Whisper model name or local CTranslate2 model path",
    )
    parser.add_argument(
        "--device",
        choices=("cpu", "cuda", "auto"),
        default="cpu",
        help="Inference device (default: cpu)",
    )
    parser.add_argument(
        "--compute-type",
        default="int8",
        help="CTranslate2 compute type (CPU default: int8; CUDA commonly float16)",
    )
    parser.add_argument("--language", default="en", help="Source language")
    parser.add_argument("--beam-size", type=int, default=5)
    parser.add_argument(
        "--course",
        default="[NOT PROVIDED]",
        help="Course metadata written to raw Markdown",
    )
    parser.add_argument(
        "--module",
        default="[NOT PROVIDED]",
        help="Module metadata written to raw Markdown",
    )
    parser.add_argument(
        "--instructor",
        default="[NOT PROVIDED]",
        help="Instructor metadata written to raw Markdown",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Overwrite existing outputs",
    )
    return parser.parse_args()


def discover_media(path: Path) -> list[Path]:
    if not path.exists():
        raise FileNotFoundError(f"Input does not exist: {path}")
    if path.is_file():
        if path.suffix.lower() not in SUPPORTED_EXTENSIONS:
            raise ValueError(f"Unsupported media extension: {path.suffix}")
        return [path]
    return sorted(
        candidate
        for candidate in path.rglob("*")
        if candidate.is_file() and candidate.suffix.lower() in SUPPORTED_EXTENSIONS
    )


def timestamp(seconds: float, *, srt: bool = False) -> str:
    milliseconds = max(0, round(seconds * 1000))
    hours, remainder = divmod(milliseconds, 3_600_000)
    minutes, remainder = divmod(remainder, 60_000)
    secs, millis = divmod(remainder, 1000)
    separator = "," if srt else "."
    return f"{hours:02d}:{minutes:02d}:{secs:02d}{separator}{millis:03d}"


def short_timestamp(seconds: float) -> str:
    total_seconds = max(0, int(seconds))
    hours, remainder = divmod(total_seconds, 3600)
    minutes, secs = divmod(remainder, 60)
    if hours:
        return f"{hours:02d}:{minutes:02d}:{secs:02d}"
    return f"{minutes:02d}:{secs:02d}"


def normalized_stem(path: Path) -> str:
    return "_".join(path.stem.strip().replace("-", " ").split())


def collect_segments(raw_segments: Iterable[object]) -> list[SegmentRecord]:
    records: list[SegmentRecord] = []
    for segment in raw_segments:
        words = [
            WordRecord(
                start=getattr(word, "start", None),
                end=getattr(word, "end", None),
                word=getattr(word, "word", ""),
                probability=getattr(word, "probability", None),
            )
            for word in (getattr(segment, "words", None) or [])
        ]
        records.append(
            SegmentRecord(
                id=int(getattr(segment, "id", len(records))),
                start=float(segment.start),
                end=float(segment.end),
                text=str(segment.text).strip(),
                avg_logprob=getattr(segment, "avg_logprob", None),
                no_speech_prob=getattr(segment, "no_speech_prob", None),
                words=words,
            )
        )
    return records


def write_json(
    path: Path,
    *,
    source: Path,
    model_name: str,
    language: str,
    language_probability: float | None,
    duration: float | None,
    records: Sequence[SegmentRecord],
) -> None:
    payload = {
        "source_file": source.name,
        "source_path": str(source),
        "engine": "faster-whisper",
        "model": model_name,
        "language": language,
        "language_probability": language_probability,
        "duration_seconds": duration,
        "status": "RAW_MACHINE_TRANSCRIPT",
        "segments": [asdict(record) for record in records],
    }
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def write_timestamped_text(path: Path, records: Sequence[SegmentRecord]) -> None:
    lines = [
        f"[{short_timestamp(record.start)} --> {short_timestamp(record.end)}] "
        f"{record.text}"
        for record in records
    ]
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def write_srt(path: Path, records: Sequence[SegmentRecord]) -> None:
    blocks = []
    for index, record in enumerate(records, start=1):
        blocks.append(
            f"{index}\n"
            f"{timestamp(record.start, srt=True)} --> {timestamp(record.end, srt=True)}\n"
            f"{record.text}\n"
        )
    path.write_text("\n".join(blocks), encoding="utf-8")


def write_raw_markdown(
    path: Path,
    *,
    source: Path,
    course: str,
    module: str,
    instructor: str,
    model_name: str,
    language: str,
    duration: float | None,
    records: Sequence[SegmentRecord],
) -> None:
    duration_text = short_timestamp(duration) if duration is not None else "[NOT PROVIDED]"
    lines = [
        "# Raw Machine Transcript",
        "",
        f"Course: {course}  ",
        f"Module: {module}  ",
        f"Lesson: {source.stem}  ",
        f"Instructor: {instructor}  ",
        f"Original filename: {source.name}  ",
        f"Source duration: {duration_text}  ",
        f"Primary language: {language}  ",
        "Transcription engine: faster-whisper  ",
        f"Transcription model: {model_name}  ",
        "Source status: RAW_MACHINE_TRANSCRIPT",
        "",
        "> This file is not source-verified. Cards, suits, positions, sizings,",
        "> frequencies, names, and visual references require review against the",
        "> original video before admission to `sources/` or the Playbook.",
        "",
        "# Timestamped Transcript",
        "",
    ]
    for record in records:
        lines.extend(
            [
                f"## [{short_timestamp(record.start)}] Segment {record.id + 1}",
                "",
                record.text,
                "",
            ]
        )
    path.write_text("\n".join(lines).rstrip() + "\n", encoding="utf-8")


def transcribe_one(
    model: WhisperModel,
    source: Path,
    output_root: Path,
    args: argparse.Namespace,
) -> None:
    output_dir = output_root / normalized_stem(source)
    output_dir.mkdir(parents=True, exist_ok=True)
    stem = normalized_stem(source)
    outputs = {
        "json": output_dir / f"{stem}.segments.json",
        "text": output_dir / f"{stem}.timestamped.txt",
        "srt": output_dir / f"{stem}.srt",
        "markdown": output_dir / f"{stem}.raw.md",
    }
    if not args.force and all(path.exists() for path in outputs.values()):
        print(f"SKIP {source}: outputs already exist", file=sys.stderr)
        return

    print(f"TRANSCRIBE {source}", file=sys.stderr)
    segments, info = model.transcribe(
        str(source),
        language=args.language,
        beam_size=args.beam_size,
        word_timestamps=True,
        vad_filter=True,
        vad_parameters={"min_silence_duration_ms": 500},
        initial_prompt=POKER_CONTEXT,
        condition_on_previous_text=True,
        temperature=0.0,
    )
    records = collect_segments(segments)
    if not records:
        raise RuntimeError(f"No speech segments produced for {source}")

    detected_language = getattr(info, "language", args.language)
    language_probability = getattr(info, "language_probability", None)
    duration = getattr(info, "duration", None)

    write_json(
        outputs["json"],
        source=source,
        model_name=args.model,
        language=detected_language,
        language_probability=language_probability,
        duration=duration,
        records=records,
    )
    write_timestamped_text(outputs["text"], records)
    write_srt(outputs["srt"], records)
    write_raw_markdown(
        outputs["markdown"],
        source=source,
        course=args.course,
        module=args.module,
        instructor=args.instructor,
        model_name=args.model,
        language=detected_language,
        duration=duration,
        records=records,
    )
    print(f"DONE {source} -> {output_dir}", file=sys.stderr)


def main() -> int:
    args = parse_args()
    try:
        media_files = discover_media(args.input)
    except (FileNotFoundError, ValueError) as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 2

    if not media_files:
        print("ERROR: no supported media files found", file=sys.stderr)
        return 2

    args.output_dir.mkdir(parents=True, exist_ok=True)
    print(
        f"Loading model={args.model} device={args.device} "
        f"compute_type={args.compute_type}",
        file=sys.stderr,
    )
    model = WhisperModel(
        args.model,
        device=args.device,
        compute_type=args.compute_type,
    )

    failures = 0
    for source in media_files:
        try:
            transcribe_one(model, source, args.output_dir, args)
        except Exception as exc:  # noqa: BLE001 - continue batch and report failures
            failures += 1
            print(f"FAILED {source}: {exc}", file=sys.stderr)

    if failures:
        print(f"Completed with {failures} failure(s)", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
