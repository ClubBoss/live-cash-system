import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  learnerAccessibilityAttributeLeakClasses,
  sanitizeLearnerAccessibilityAttribute,
} from "../lib/learner-accessibility-attribute-firewall.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ATTRIBUTES = ["aria-label", "aria-description", "title", "alt"];

const fixtures = {
  ru: {
    "aria-label": "Разбор field-1787715078123-a1b2c3d",
    "aria-description": "Решение PM-B3-PF01-103 · explain-1787715078123-z9y8x7w",
    title: "HUMAN_ASSISTED review-1787715078123-k4m5n6p",
    alt: "LCM-01 explain-1787715078123-r2s3t4u",
  },
  en: {
    "aria-label": "Review field-1787715078123-a1b2c3d",
    "aria-description": "Decision PM-B3-PF01-103 · explain-1787715078123-z9y8x7w",
    title: "HUMAN_ASSISTED review-1787715078123-k4m5n6p",
    alt: "LCM-01 explain-1787715078123-r2s3t4u",
  },
};

for (const locale of ["ru", "en"]) {
  test(`${locale}: all learner accessibility attributes remove opaque IDs and existing presentation leak classes`, () => {
    for (const attribute of ATTRIBUTES) {
      const before = fixtures[locale][attribute];
      assert.ok(learnerAccessibilityAttributeLeakClasses(before).length > 0, `${attribute}: fixture must exercise a real leak class`);
      const after = sanitizeLearnerAccessibilityAttribute(before, locale);
      assert.deepEqual(learnerAccessibilityAttributeLeakClasses(after), [], `${attribute}: ${after}`);
      assert.ok(after.trim().length > 0, `${attribute}: learner-readable semantics must remain`);
      assert.doesNotMatch(after, /(?:explain|field|review)-\d{10,}-[a-z0-9]{5,}/iu);
    }
  });
}

test("Real Hands keeps opaque record IDs as machine keys while the learner guard owns all four assistive attributes", async () => {
  const wave7 = await readFile(path.join(root, "components/Wave7Experience.tsx"), "utf8");
  const guard = await readFile(path.join(root, "components/PracticalLearnerPresentationGuard.tsx"), "utf8");
  const support = await readFile(path.join(root, "components/SupportingToolsApp.tsx"), "utf8");

  const rawIdBearingAriaLabels = [...wave7.matchAll(/aria-label=\{`[^`]*\$\{(?:record|note)\.id\}[^`]*`\}/gu)];
  assert.equal(rawIdBearingAriaLabels.length, 3, "baseline Real Hands census should exercise all three opaque-ID aria-label seams");

  assert.match(wave7, /\[record\.id\]/);
  assert.match(wave7, /\[note\.id\]/);
  assert.match(wave7, /key=\{record\.id\}/);
  assert.match(wave7, /key=\{note\.id\}/);

  for (const attribute of ATTRIBUTES) {
    assert.match(guard, new RegExp(`"${attribute.replace("-", "\\-")}"`));
  }
  assert.match(guard, /sanitizeLearnerAccessibilityAttribute/);
  assert.match(guard, /attributes:\s*true/);
  assert.match(guard, /attributeFilter:\s*\[\.\.\.learnerAccessibilityAttributes\]/);

  assert.match(support, /tab !== "data" \? <PracticalLearnerPresentationGuard \/>/);
  assert.match(support, /tab === "data" && <DataSafetyPanel/);
});
