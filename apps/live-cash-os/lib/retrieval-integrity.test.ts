import { describe, expect, it } from "vitest";
import {
  applyLessonIntegrityOrdering,
  selectLessonDrillIds,
} from "./retrieval-integrity";

const module = (
  id: string,
  drills: Array<{ id: string; kind: string }>,
) => ({ id, drills });

describe("retrieval integrity selectors", () => {
  it("keeps the bounded lesson substitutions for leak-prone modules", () => {
    expect(
      selectLessonDrillIds(
        module("geometry", [
          { id: "geo-01", kind: "core" },
          { id: "geo-02", kind: "changed" },
          { id: "geo-04", kind: "boundary" },
          { id: "geo-05", kind: "changed" },
        ]),
      ),
    ).toEqual(["geo-01", "geo-05", "geo-02"]);

    expect(
      selectLessonDrillIds(
        module("blinds", [
          { id: "bli-01", kind: "core" },
          { id: "bli-02", kind: "changed" },
          { id: "bli-03", kind: "boundary" },
          { id: "bli-04", kind: "changed" },
        ]),
      ),
    ).toEqual(["bli-01", "bli-02", "bli-04"]);

    expect(
      selectLessonDrillIds(
        module("shape", [
          { id: "sha-01", kind: "core" },
          { id: "sha-02", kind: "changed" },
          { id: "sha-03", kind: "boundary" },
          { id: "sha-05", kind: "changed" },
        ]),
      ),
    ).toEqual(["sha-01", "sha-02", "sha-05"]);
  });

  it("preserves the default lesson selector outside bounded overrides", () => {
    expect(
      selectLessonDrillIds(
        module("other", [
          { id: "o-01", kind: "core" },
          { id: "o-02", kind: "changed" },
          { id: "o-03", kind: "boundary" },
          { id: "o-04", kind: "changed" },
        ]),
      ),
    ).toEqual(["o-01", "o-02", "o-03"]);
  });

  it("applies the override without changing drill identity or dropping reserves", () => {
    const modules = [
      module("geometry", [
        { id: "geo-01", kind: "core" },
        { id: "geo-02", kind: "changed" },
        { id: "geo-03", kind: "core" },
        { id: "geo-04", kind: "boundary" },
        { id: "geo-05", kind: "changed" },
      ]),
    ];

    applyLessonIntegrityOrdering(modules);

    expect(modules[0].drills.map((drill) => drill.id)).toEqual([
      "geo-01",
      "geo-05",
      "geo-02",
      "geo-03",
      "geo-04",
    ]);
    expect(modules[0].drills).toHaveLength(5);
  });

  it("is idempotent across repeated app initialization", () => {
    const modules = [
      module("shape", [
        { id: "sha-01", kind: "core" },
        { id: "sha-02", kind: "changed" },
        { id: "sha-03", kind: "boundary" },
        { id: "sha-04", kind: "boundary" },
        { id: "sha-05", kind: "changed" },
      ]),
    ];

    applyLessonIntegrityOrdering(modules);
    const once = modules[0].drills.map((drill) => drill.id);
    applyLessonIntegrityOrdering(modules);

    expect(modules[0].drills.map((drill) => drill.id)).toEqual(once);
  });
});
