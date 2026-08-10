import { describe, expect, it } from "vitest";
import {
  selectIndependentDiagnosticDrillIds,
  selectLessonDrillIds,
} from "./retrieval-integrity";

const module = (
  id: string,
  drills: Array<{ id: string; kind: string; changedNode?: string }>,
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
        module("shallow", [
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

  it("prefers unseen changed-node variants and spreads diagnostic coverage", () => {
    const modules = [
      module("a", [
        { id: "a-core", kind: "core" },
        { id: "a-changed", kind: "changed", changedNode: "N-1" },
      ]),
      module("b", [
        { id: "b-core", kind: "core" },
        { id: "b-boundary", kind: "boundary" },
      ]),
      module("c", [
        { id: "c-core", kind: "core" },
        { id: "c-changed", kind: "changed", changedNode: "N-2" },
      ]),
    ];

    expect(selectIndependentDiagnosticDrillIds(modules, new Set(["a-changed"]), 3)).toEqual([
      "c-changed",
      "b-boundary",
      "a-core",
    ]);
  });

  it("does not replay seen material while enough unseen candidates exist", () => {
    const modules = [
      module("a", [
        { id: "a-core", kind: "core" },
        { id: "a-changed", kind: "changed", changedNode: "N-1" },
      ]),
      module("b", [
        { id: "b-core", kind: "core" },
        { id: "b-changed", kind: "changed", changedNode: "N-2" },
      ]),
    ];

    expect(selectIndependentDiagnosticDrillIds(modules, new Set(["a-changed"]), 2)).toEqual([
      "b-changed",
      "a-core",
    ]);
  });

  it("uses a deterministic replay fallback only when the unseen pool is exhausted", () => {
    const modules = [
      module("a", [{ id: "a-core", kind: "core" }]),
      module("b", [{ id: "b-boundary", kind: "boundary" }]),
    ];

    expect(
      selectIndependentDiagnosticDrillIds(modules, new Set(["a-core", "b-boundary"]), 2),
    ).toEqual(["b-boundary", "a-core"]);
  });
});
