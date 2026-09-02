import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import ts from "typescript";
import { fileURLToPath } from "node:url";
import {
  practicalAnchors,
  practicalDecisions,
  practicalReferenceBaselines,
  practicalRules,
  practicalSkillFamilies,
  practicalStudyLoop,
  sessionPerformanceChecks,
} from "../content/practical-mastery/index.ts";
import { practicalSourceGaps } from "../content/practical-mastery/source-gaps.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const developerJargon = [
  /\btrainable\b/iu,
  /\bevidence(?:-stage)?\b/iu,
  /\bretention\b/iu,
  /\bscheduler\b/iu,
  /\bsource[- ]backed\b/iu,
  /\bsource routing\b/iu,
  /\bcontent build\b/iu,
  /\bscored(?: stimulus| decision| rep)?s?\b/iu,
  /\bstimulus\b/iu,
  /\brepair cue\b/iu,
  /\brepair rule\b/iu,
  /\bstudy artifact\b/iu,
  /\bgrading authority\b/iu,
  /\bfocus[- ]cue\b/iu,
  /\bdecision state\b/iu,
  /\bchanged-node\b/iu,
  /\btopic-hidden\b/iu,
  /\bfake completion\b/iu,
  /\bbaseline shape\b/iu,
  /\bvisual claim\b/iu,
  /\brouting inventory\b/iu,
  /\bexact visual\b/iu,
];

function failuresFor(strings, label) {
  const failures = [];
  for (const text of strings.filter(Boolean)) {
    for (const pattern of developerJargon) if (pattern.test(text)) failures.push(`${label}: ${pattern} :: ${text}`);
  }
  return failures;
}

function componentTextLiterals(source, fileName) {
  const parsed = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const values = [];
  const visit = (node) => {
    if (ts.isJsxElement(node) && node.openingElement.tagName.getText(parsed) === "style") return;
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node) || ts.isJsxText(node)) values.push(node.text);
    else if (ts.isTemplateExpression(node)) {
      values.push(node.head.text);
      for (const span of node.templateSpans) values.push(span.literal.text);
    }
    ts.forEachChild(node, visit);
  };
  visit(parsed);
  return values;
}

function practicalDecisionRuStrings() {
  return practicalDecisions.flatMap((decision) => [
    decision.cueRu,
    decision.questionRu,
    decision.explanationRu,
    ...decision.actionOptions.map((option) => option.textRu),
    ...decision.reasonOptions.map((option) => option.textRu),
  ]);
}

function practicalAnchorRuStrings() {
  return practicalAnchors.flatMap((anchor) => [anchor.titleRu, anchor.bodyRu, anchor.promptRu, anchor.answerRu, anchor.rationaleRu]);
}

function practicalRuleRuStrings() {
  return practicalRules.flatMap((rule) => [rule.triggerRu, rule.defaultRu, rule.whyRu, ...rule.amplifiersRu, ...rule.reversalsRu, rule.transferCueRu]);
}

test("new Practical Mastery decision and teaching corpus keeps natural RU without product-internal jargon", () => {
  const failures = [
    ...failuresFor(practicalDecisionRuStrings(), "decision"),
    ...failuresFor(practicalAnchorRuStrings(), "anchor"),
    ...failuresFor(practicalRuleRuStrings(), "memory-rule"),
  ];
  assert.deepEqual(failures, [], `Practical learner corpus contains developer jargon:\n${failures.join("\n")}`);
});

test("Study Loop, Reference and source-gap RU copy stay learner-facing", () => {
  const study = practicalStudyLoop.flatMap((step) => [step.titleRu, step.instructionRu, step.evidenceRuleRu]);
  const checks = sessionPerformanceChecks.flatMap((check) => [check.promptRu, check.responseRu]);
  const references = practicalReferenceBaselines.flatMap((item) => [item.titleRu, item.triggerRu, item.baselineRu, item.deltaRu, item.boundaryRu]);
  const gaps = practicalSourceGaps.flatMap((gap) => [gap.reasonRu, gap.nextEvidenceNeededRu]);
  const failures = [
    ...failuresFor(study, "study"),
    ...failuresFor(checks, "session-check"),
    ...failuresFor(references, "reference"),
    ...failuresFor(gaps, "source-gap"),
  ];
  assert.deepEqual(failures, [], `Practical supporting RU copy contains developer jargon:\n${failures.join("\n")}`);
});

test("mastery surfaces do not leak developer jargon into mixed RU literals", async () => {
  const componentDir = path.join(root, "components");
  const names = (await readdir(componentDir)).filter((name) => /Practical.*\.tsx$/.test(name));
  const failures = [];
  for (const name of names) {
    const source = await readFile(path.join(componentDir, name), "utf8");
    const ruStrings = componentTextLiterals(source, name).filter((text) => /[А-Яа-яЁё]/u.test(text));
    failures.push(...failuresFor(ruStrings, name));
  }
  assert.deepEqual(failures, [], `Practical UI contains developer jargon in RU copy:\n${failures.join("\n")}`);
});

test("poker-native vocabulary remains allowed instead of being mechanically translated away", () => {
  const corpus = practicalDecisionRuStrings().join("\n");
  for (const token of ["3-bet", "SPR", "squeeze", "river"]) {
    assert.match(corpus, new RegExp(token, "iu"), `${token} should remain available where it is natural poker vocabulary`);
  }
});

test("flop texture skill keeps natural RU copy and unchanged EN meaning", () => {
  const skill = practicalSkillFamilies.find((candidate) => candidate.id === "W4-BOARD-01");
  assert.ok(skill);
  assert.equal(skill.titleRu, "Классы текстур флопа");
  assert.equal(skill.objectiveRu, "Быстро классифицировать основные текстуры флопа.");
  assert.equal(skill.titleEn, "Flop board classes");
  assert.equal(skill.objectiveEn, "Quickly classify the main flop textures.");
  assert.doesNotMatch(`${skill.titleRu}\n${skill.objectiveRu}`, /Flop board classes|flop textures/u);
});
