import { describe, expect, it } from "vitest";
import { diagnosticT1 } from "../diagnostic";
import { applyLocaleData } from "./locale-pipeline";
import { diagnosticEnglish } from "./runtime";

describe("diagnostic retrieval-integrity labels", () => {
  it("keeps pre-answer labels neutral in both locales without changing stable IDs", () => {
    const ids = diagnosticT1.map((item) => item.id);

    applyLocaleData("ru");
    expect(diagnosticT1.map((item) => item.title)).toEqual(
      ids.map((_, index) => `Диагностический спот ${index + 1}`),
    );

    applyLocaleData("en");
    expect(ids.map((id) => diagnosticEnglish[id].title)).toEqual(
      ids.map((_, index) => `Diagnostic spot ${index + 1}`),
    );
    expect(diagnosticT1.map((item) => item.id)).toEqual(ids);
  });
});
