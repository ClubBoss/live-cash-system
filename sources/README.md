# Sources

This directory stores text-based, source-faithful records derived from course material the user is authorised to access.

## Course paths

- `smash-live-cash/`
- `carrot-grade-1/`
- `carrot-grade-2/`
- `carrot-grade-3/`
- `cash-injection/`
- `from-the-ground-up/`
- `external/`

A course directory is created when its first transcript is admitted.

## File naming

```text
<course-id>_<module-id>_<lesson-id>_<slug>.md
```

Example:

```text
SLC_M00_L00_intro.md
```

## Source rules

- Preserve the Gemini transcript as received after source QA corrections.
- Do not insert downstream analysis into a source file.
- Preserve uncertainties and timestamps.
- Keep strategically relevant visual notes adjacent to the transcript timestamp.
- Do not commit original course video or audio.
- Register every source in `source-registry.md`.
