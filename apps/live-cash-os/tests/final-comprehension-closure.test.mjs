import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const expectedFinalCompositionDigest = "bfd8dd8569b6c07fdb782927deec996f0c209fd6d884938f37ce2ab089898403";

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
