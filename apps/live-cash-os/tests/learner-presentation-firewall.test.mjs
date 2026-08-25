import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  practicalAnchors,
  practicalDecisions,
  practicalReferenceBaselines,
  practicalSkillById,
} from "../content/practical-mastery/index.ts";
import { practicalSourceGaps } from "../content/practical-mastery/source-gaps.ts";
import {
  learnerPresentationLeakClasses,
  sanitizeLearnerPresentationText,
} from "../lib/learner-presentation-firewall.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const REQUIRED_CLASSES = [
  "SOURCE_OR_MODULE_ID",
  "SKILL_OR_DECISION_ID",
  "REVIEWER_ENUM",
  "CANONICAL_IMPLEMENTATION",
  "SOURCE_GOVERNANCE",
  "VALIDATION_PIPELINE",
  "CORPUS_METADATA",
];

const representativeLeaks = {
  en: [
    "FTGU-E02 and LCM-01 sourceRefs",
    "PF-01 and PM-B3-PF01-103",
    "HUMAN / HUMAN_ASSISTED",
    "canonical Practical skill and exact repair in Practical",
    "source-backed source mechanism from underlying material",
    "structured canonical binding and targeted visual extraction",
    "The 980 indexed scenarios are a routing inventory for the corpus.",
  ],
  ru: [
    "FTGU-E02 и LCM-01 sourceRefs",
    "PF-01 и PM-B3-PF01-103",
    "HUMAN / HUMAN_ASSISTED",
    "canonical Practical skill и canonical repair",
    "Источник подтверждает; исходные материалы; более подробный источник",
    "structured canonical binding и visual claim review",
    "980 проиндексированных сценариев — внутренний corpus.",
  ],
};

function canonicalLearnerStrings(locale) {
  const ru = locale === "ru";
  const values = [];
  for (const anchor of practicalAnchors) {
    values.push(
      ru ? anchor.promptRu : anchor.promptEn,
      ru ? anchor.answerRu : anchor.answerEn,
      ru ? anchor.rationaleRu : anchor.rationaleEn,
    );
  }
  for (const decision of practicalDecisions) {
    values.push(
      ru ? decision.cueRu : decision.cueEn,
      ru ? decision.questionRu : decision.questionEn,
      ru ? decision.explanationRu : decision.explanationEn,
      ...decision.assumptions,
      ...decision.actionOptions.map((option) => ru ? option.textRu : option.textEn),
      ...decision.reasonOptions.map((option) => ru ? option.textRu : option.textEn),
    );
  }
  for (const reference of practicalReferenceBaselines) {
    values.push(
      ru ? reference.titleRu : reference.titleEn,
      ru ? reference.triggerRu : reference.triggerEn,
      ru ? reference.baselineRu : reference.baselineEn,
      ru ? reference.deltaRu : reference.deltaEn,
      ru ? reference.boundaryRu : reference.boundaryEn,
    );
  }
  for (const gap of practicalSourceGaps) {
    values.push(
      ru ? gap.learnerReasonRu : gap.learnerReason,
      ru ? gap.learnerNextEvidenceNeededRu : gap.learnerNextEvidenceNeeded,
    );
  }
  return values.filter((value) => typeof value === "string" && value.trim());
}

for (const locale of ["ru", "en"]) {
  test(`${locale}: all seven V6 metadata leak classes are detected before and absent after learner sanitization`, () => {
    const beforeClasses = new Set(representativeLeaks[locale].flatMap(learnerPresentationLeakClasses));
    assert.deepEqual([...beforeClasses].sort(), [...REQUIRED_CLASSES].sort());

    const after = representativeLeaks[locale].map((value) => sanitizeLearnerPresentationText(value, locale));
    const afterClasses = new Set(after.flatMap(learnerPresentationLeakClasses));
    assert.deepEqual([...afterClasses], []);
  });

  test(`${locale}: canonical learner corpus has zero residual metadata classes after the presentation firewall`, () => {
    const values = canonicalLearnerStrings(locale);
    const riskyBefore = values.filter((value) => learnerPresentationLeakClasses(value).length > 0);
    assert.ok(riskyBefore.length > 0, "the audit must exercise real publication-risk content rather than only clean fixtures");

    const residual = values
      .map((value) => sanitizeLearnerPresentationText(value, locale))
      .filter((value) => learnerPresentationLeakClasses(value).length > 0);
    assert.deepEqual(residual, []);
  });
}

test("learner-safe replacements retain poker meaning and uncertainty instead of deleting the explanation", () => {
  const sourceExplanation = "CINJ-E05 extends FTGU-E22: the price sets the threshold while later filtering determines plausible bluff supply.";
  const safeExplanation = sanitizeLearnerPresentationText(sourceExplanation, "en");
  assert.equal(learnerPresentationLeakClasses(safeExplanation).length, 0);
  assert.match(safeExplanation, /price sets the threshold/i);
  assert.match(safeExplanation, /plausible bluff supply/i);

  const indexed = sanitizeLearnerPresentationText(
    "The 980 indexed scenarios are a routing inventory, not 980 memorization requirements; strategy images still require targeted visual extraction.",
    "en",
  );
  assert.equal(learnerPresentationLeakClasses(indexed).length, 0);
  assert.match(indexed, /positions, depth, rake, and caller count/i);
  assert.doesNotMatch(indexed, /980|indexed|inventory|visual extraction/i);

  const uncertainty = sanitizeLearnerPresentationText("Exact frequencies not yet verified", "en");
  assert.equal(uncertainty, "Exact frequencies are not established here yet");

  const pf01 = sanitizeLearnerPresentationText("PF-01", "en");
  assert.equal(pf01, practicalSkillById.get("PF-01").titleEn);

  for (const legitimate of [
    "3-bet pot",
    "4BP geometry",
    "BTN vs BB",
    "bluff supply",
    "SPR",
    "rake",
    "multiway",
    "solver",
  ]) {
    assert.deepEqual(learnerPresentationLeakClasses(legitimate), [], legitimate);
    assert.equal(sanitizeLearnerPresentationText(legitimate, "en"), legitimate);
  }
});

test("all normal learner and support routes are behind the firewall while Data & Recovery remains machine-readable", async () => {
  const masteryLayout = await readFile(path.join(root, "app/mastery/layout.tsx"), "utf8");
  const support = await readFile(path.join(root, "components/SupportingToolsApp.tsx"), "utf8");
  const guard = await readFile(path.join(root, "components/PracticalLearnerPresentationGuard.tsx"), "utf8");

  assert.match(masteryLayout, /<PracticalLearnerPresentationGuard\s*\/>/);
  assert.match(support, /tab !== "data" \? <PracticalLearnerPresentationGuard \/>/);
  assert.match(support, /tab === "data" && <DataSafetyPanel/);
  assert.match(guard, /NodeFilter\.SHOW_TEXT/);
  assert.match(guard, /sanitizeLearnerPresentationText/);
  assert.doesNotMatch(guard, /querySelectorAll<HTMLElement>\("p, small, span, b, h1, h2, h3, h4, li, summary"\)/);
});

test("internal authority and reviewer machinery remain intact outside learner presentation", async () => {
  const fieldTransfer = await readFile(path.join(root, "lib/practical-field-transfer.ts"), "utf8");
  const sourceGaps = await readFile(path.join(root, "content/practical-mastery/source-gaps.ts"), "utf8");

  assert.match(fieldTransfer, /PracticalFieldReviewerKind = "HUMAN" \| "HUMAN_ASSISTED"/);
  assert.match(fieldTransfer, /binding\.reviewerKind !== reviewerKind/);
  assert.match(fieldTransfer, /practicalSkillId/);
  assert.match(sourceGaps, /POSITIVE_EV_SOURCE_ACCESS_REQUIRED/);
  assert.match(sourceGaps, /learnerReason/);
});
