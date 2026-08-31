import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const expectedFinalCompositionDigest = "bb814bdf17a626ebfdfb756d2f63f8a9d80d0bed7cac4d9ad6fe024eaf9b96c9";

// The six late systemic RU publication modules admitted to the final governed
// frontier by GLOBAL_SYSTEMIC_RU closure: each is both a language-repair
// surface (still mutable while locale review is open) and a source_blobs
// participant (governed Git-blob fingerprint).
const lateLanguageRepairPublicationModules = [
  "content/practical-mastery/practical-ru-systemic-turn-river-publication.ts",
  "content/practical-mastery/practical-ru-systemic-a9-a10-publication.ts",
  "content/practical-mastery/practical-ru-systemic-integrated-a11-w14-publication.ts",
  "content/practical-mastery/practical-ru-systemic-b1-c0-publication.ts",
  "content/practical-mastery/practical-ru-systemic-b3-b4-publication.ts",
  "content/practical-mastery/practical-ru-systemic-perceptual-executable-publication.ts",
];

// The late raw decision/table-state authorities admitted to source_blobs
// alongside those six publication modules: they are governed fingerprint
// participants but are NOT language-repair owners themselves.
const lateRawAuthorities = [
  "content/practical-mastery/decisions-turn-river-a8-expansion.ts",
  "content/practical-mastery/decisions-live-a9-expansion.ts",
  "content/practical-mastery/decisions-exploit-a10-expansion.ts",
  "content/practical-mastery/decisions-integrated-a11-expansion.ts",
  "content/practical-mastery/decisions-w14.ts",
  "content/practical-mastery/decisions-source-closure-b1.ts",
  "content/practical-mastery/decisions-source-utilization-c0.ts",
  "content/practical-mastery/decisions-variation-b3.ts",
  "content/practical-mastery/decisions-live-edge-b4.ts",
  "content/practical-mastery/perceptual-table-states.ts",
  "content/practical-mastery/perceptual-table-states-b3.ts",
  "content/practical-mastery/decisions-executable-gate-repair.ts",
];

async function text(relativePath) {
  return readFile(path.join(root, relativePath), "utf8");
}

function gitBlobSha(buffer) {
  return createHash("sha1")
    .update(`blob ${buffer.byteLength}\0`)
    .update(buffer)
    .digest("hex");
}

test("final comprehension closure keeps first-use wording and governance truth aligned", async () => {
  const geometryLocale = await text("content/i18n/geometry-locale.ts");
  const scaffold = await text("content/i18n/novice-scaffold.ts");
  const finalPlusEv = await text("content/i18n/final-plus-ev.ts");
  const decisionTransfer = await text("content/i18n/decision-transfer-integrity.ts");
  const decisionBalance = await text("content/i18n/decision-option-balance.ts");
  const decisionComprehension = await text("content/i18n/decision-comprehension-closure.ts");
  const assist = await text("components/RealUseLessonAssist.tsx");
  const pipeline = await text("content/i18n/locale-pipeline.ts");
  const authority = await text("content/CONTENT_AUTHORITY.md");
  const manifest = JSON.parse(await text("content/i18n/editorial-manifest.json"));

  assert.match(geometryLocale, /стек до колла и размер ставки\/колла/u);
  assert.match(geometryLocale, /stack before the call, and the bet\/call size/u);
  assert.doesNotMatch(geometryLocale, /Укажи банк до ставки, оставшийся стек/u);

  assert.match(scaffold, /Шансы банка \/ цена колла/u);
  assert.match(scaffold, /Полный быстрый расчёт будет в следующей теме/u);
  assert.match(scaffold, /Pot odds \/ call price/u);
  assert.match(scaffold, /full quick calculation comes in the next topic/u);

  assert.match(finalPlusEv, /колл составляет четверть итогового банка/u);
  assert.match(finalPlusEv, /Устойчивая рука/u);
  assert.match(finalPlusEv, /Происхождение диапазона/u);
  assert.match(finalPlusEv, /Реальные блефы/u);
  assert.match(finalPlusEv, /Что опровергнет рид/u);
  assert.match(finalPlusEv, /applyFinalLanguagePolish/u);
  assert.match(finalPlusEv, /no corpus-wide search\/replace is allowed here/u);

  for (const concrete of ["76s", "KJo", "A5s", "98s", "T6s", "KTs", "KQ", "K-9-7", "A-7-2"]) {
    assert.match(decisionTransfer, new RegExp(concrete.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "u"), `Decision-transfer layer misses ${concrete}`);
  }
  assert.match(decisionTransfer, /softenAllDistractors/u);
  assert.match(decisionTransfer, /option\.id !== drill\.correctActionId/u);
  assert.match(decisionTransfer, /option\.id !== drill\.correctReasonId/u);
  assert.match(decisionBalance, /applyDecisionOptionBalance/u);
  assert.match(decisionBalance, /drill\.correctActionId/u);
  assert.match(decisionBalance, /drill\.correctReasonId/u);
  assert.match(decisionComprehension, /applyDecisionComprehensionClosure/u);
  assert.match(decisionComprehension, /Missing action option/u);
  assert.match(decisionComprehension, /Missing reason option/u);

  assert.doesNotMatch(assist, /graded-ситуация/u);
  assert.match(assist, /Следующая задача будет другой/u);

  const symbols = [
    "applyGeometryLocale",
    "applyWave3PriorityLocale",
    "applyWave4CurriculumLocale",
    "applyWave4FinalEditorialLocale",
    "applyWave5PracticeCopy",
    "applyWave4RFinalLanguage",
    "applyNoviceTerminologyCopy",
    "applyFinalPlusEvCopy",
    "applyDecisionTransferIntegrity",
    "applyDecisionOptionBalance",
    "applyFinalLearningIntegrityClosure",
    "applyStimulusGeneralisationMicro",
    "applyFinalLanguagePolish",
    "applyPokerNativeTerminologyRebalance",
    "applyDecisionComprehensionClosure",
  ];
  let previous = -1;
  for (const symbol of symbols) {
    const index = pipeline.lastIndexOf(`${symbol}(`);
    assert.ok(index > previous, `Locale pipeline order drifted at ${symbol}`);
    previous = index;
    assert.match(authority, new RegExp(symbol, "u"), `Content Authority omits ${symbol}`);
  }

  for (const [sourcePath, expectedSha] of Object.entries(manifest.source_blobs)) {
    const bytes = await readFile(path.join(root, sourcePath));
    assert.equal(gitBlobSha(bytes), expectedSha, `${sourcePath}: stale source lock`);
  }

  assert.equal(manifest.final_composition.current_digest, expectedFinalCompositionDigest);
  assert.equal(manifest.final_composition.review_corpus_fingerprint, expectedFinalCompositionDigest);
  assert.match(authority, new RegExp(expectedFinalCompositionDigest, "u"));
  assert.equal(manifest.final_composition.status, "REVIEW_PENDING");
  assert.equal(manifest.strategy_approval, null);
  assert.equal(manifest.drill_approval, null);
  assert.deepEqual(manifest.human_approvals, {});
});

test("GLOBAL_SYSTEMIC_RU closure admits exactly the six late publication modules as both language-repair and source_blobs participants", async () => {
  const manifest = JSON.parse(await text("content/i18n/editorial-manifest.json"));
  for (const modulePath of lateLanguageRepairPublicationModules) {
    assert.ok(
      manifest.repair_source_paths.language.includes(modulePath),
      `${modulePath}: expected in repair_source_paths.language`,
    );
    assert.ok(manifest.source_blobs[modulePath], `${modulePath}: expected in source_blobs`);
  }
});

test("GLOBAL_SYSTEMIC_RU closure admits the late raw authorities to source_blobs only, never as language-repair owners", async () => {
  const manifest = JSON.parse(await text("content/i18n/editorial-manifest.json"));
  for (const rawPath of lateRawAuthorities) {
    assert.ok(manifest.source_blobs[rawPath], `${rawPath}: expected in source_blobs`);
    assert.ok(
      !manifest.repair_source_paths.language.includes(rawPath),
      `${rawPath}: raw authority must not be a language-repair owner`,
    );
  }
});

test("terminal assessment-integrity repair remains the absolute last step in the final decision composition chain", async () => {
  const index = await text("content/practical-mastery/index.ts");
  assert.match(
    index,
    /\.map\(applyPracticalAssessmentIntegrityRepair\);/u,
    "applyPracticalAssessmentIntegrityRepair must be the terminal .map() call in practicalDecisions",
  );
  const b1 = index.indexOf("applyPracticalRuSystemicB1DecisionProjection");
  const c0 = index.lastIndexOf("applyPracticalRuSystemicC0DecisionProjection");
  const b3 = index.lastIndexOf("applyPracticalRuSystemicB3DecisionProjection");
  const b4 = index.lastIndexOf("applyPracticalRuSystemicB4DecisionProjection");
  const perceptual = index.lastIndexOf("applyPracticalRuPerceptualDecisionProjection");
  const gateRepair = index.lastIndexOf("applyPracticalRuExecutableGateRepairDecisionProjection");
  const terminal = index.lastIndexOf(".map(applyPracticalAssessmentIntegrityRepair);");
  for (const [label, position] of [
    ["B1", b1],
    ["C0", c0],
    ["B3", b3],
    ["B4", b4],
    ["Perceptual", perceptual],
    ["ExecutableGateRepair", gateRepair],
  ]) {
    assert.ok(position !== -1, `${label} projection missing from index.ts`);
  }
  assert.ok(b1 < c0, "B1 must precede C0");
  assert.ok(c0 < b3, "C0 must precede B3");
  assert.ok(b3 < b4, "B3 must precede B4");
  assert.ok(b4 < perceptual, "B4 must precede Perceptual");
  assert.ok(perceptual < gateRepair, "Perceptual must precede ExecutableGateRepair");
  assert.ok(gateRepair < terminal, "ExecutableGateRepair must precede the terminal assessment-integrity repair");
});

test("no stale A7-owned global final-composition frontier text remains", async () => {
  const authority = await text("content/CONTENT_AUTHORITY.md");
  assert.doesNotMatch(
    authority,
    /A7 3BP\/4BP owns (?:the current global|the current global\/final-composition) digest/u,
    "CONTENT_AUTHORITY.md must not claim A7 3BP/4BP owns the current global final-composition digest",
  );
  assert.doesNotMatch(authority, /b05df3f788305d7b46913231b9480da8cd9b578adfbcdb8dae99eb21b6090b2e/u);
  assert.match(authority, /Perceptual\/Executable-Gate-Repair owns the current global/u);
});
