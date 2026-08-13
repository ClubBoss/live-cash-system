import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { moduleById } from "../content/modules.ts";
import { applyLocaleData } from "../content/i18n/locale-pipeline.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ledger = JSON.parse(await readFile(path.join(root, "content/audits/final-learning-integrity-review.json"), "utf8"));
const moduleIds = Object.keys(ledger.drills);
const parityRepairs = new Set(ledger.materialRepairs.optionParity);

function identitySnapshot() {
  return moduleIds.flatMap((moduleId) => moduleById[moduleId].drills.map((drill) => ({
    moduleId,
    drillId: drill.id,
    correctActionId: drill.correctActionId,
    correctReasonId: drill.correctReasonId,
    actionIds: drill.actionOptions.map((option) => option.id),
    reasonIds: drill.reasonOptions.map((option) => option.id),
    actionMisconceptions: drill.actionOptions.map((option) => option.misconceptionId ?? null),
    reasonMisconceptions: drill.reasonOptions.map((option) => option.misconceptionId ?? null),
  })));
}

const baselineIdentities = identitySnapshot();
const expectedDrillCount = baselineIdentities.length;

function getDrill(moduleId, drillId) {
  const result = moduleById[moduleId].drills.find((item) => item.id === drillId);
  assert.ok(result, `Missing ${moduleId}/${drillId}`);
  return result;
}

function preAnswerCopy(item) {
  return `${item.assumptions.join(" ")} ${item.cue} ${item.question}`;
}

function words(text) {
  return text.trim().split(/\s+/u).filter(Boolean).length;
}

function reasonParityRisks(locale) {
  const caricature = locale === "ru"
    ? /(?:\bвсегда\b|\bникогда\b|автоматически|только потому|само по себе гарантирует)/iu
    : /(?:\balways\b|\bnever\b|automatically|merely|solely|by itself guarantees)/iu;
  const risks = [];

  for (const moduleId of moduleIds) {
    for (const item of moduleById[moduleId].drills) {
      if (!parityRepairs.has(item.id)) continue;
      const correct = item.reasonOptions.find((option) => option.id === item.correctReasonId);
      const wrong = item.reasonOptions.filter((option) => option.id !== item.correctReasonId);
      assert.ok(correct, `${item.id}: missing correct reason`);
      assert.equal(wrong.length, 2, `${item.id}: expected two reason distractors`);

      const correctCount = words(correct.text);
      const wrongCounts = wrong.map((option) => words(option.text));
      const shortestWrong = Math.min(...wrongCounts);
      const longestWrong = Math.max(...wrongCounts);

      if (correctCount >= longestWrong * 1.8 && correctCount - longestWrong >= 8) {
        risks.push(`${item.id}: correct reason is uniquely much longer ${correctCount}/${wrongCounts.join("/")}`);
      }
      if (shortestWrong >= correctCount * 2 && shortestWrong - correctCount >= 8) {
        risks.push(`${item.id}: correct reason is uniquely much shorter ${correctCount}/${wrongCounts.join("/")}`);
      }

      for (const option of wrong) {
        if (words(option.text) < 7) risks.push(`${item.id}: repaired distractor is too shallow: ${option.text}`);
        if (caricature.test(option.text)) risks.push(`${item.id}: repaired distractor contains a caricature marker: ${option.text}`);
      }
    }
  }
  return risks;
}

function familyGlossaryEntry(locale, pattern) {
  const entry = moduleById.preflop.glossary.find((item) => pattern.test(item.term));
  assert.ok(entry, `${locale}: missing family glossary entry ${pattern}`);
  return entry;
}

test("review ledger covers the final runtime cross-product without pretending to be human approval", () => {
  const listedCount = Object.values(ledger.drills).reduce((sum, ids) => sum + ids.length, 0);
  assert.equal(listedCount, expectedDrillCount);
  assert.equal(listedCount * ledger.locales.length, expectedDrillCount * 2);
  assert.equal(ledger.status, "MACHINE_AGENT_REVIEW_ONLY");
  assert.equal(ledger.humanApproval, false);
  assert.deepEqual(ledger.locales, ["ru", "en"]);
  assert.deepEqual(ledger.dimensions, {
    actionParityReviewed: true,
    reasonParityReviewed: true,
    promptLeakageReviewed: true,
  });
  for (const [moduleId, drillIds] of Object.entries(ledger.drills)) {
    assert.deepEqual(moduleById[moduleId].drills.map((item) => item.id), drillIds);
  }
});

for (const locale of ["ru", "en"]) {
  test(`${locale}: final runtime has no repaired prompt-to-answer leakage`, () => {
    applyLocaleData(locale);
    assert.equal(moduleIds.reduce((sum, moduleId) => sum + moduleById[moduleId].drills.length, 0), expectedDrillCount);

    const pre02 = getDrill("preflop", "pre-02");
    const pre02Before = preAnswerCopy(pre02);
    assert.match(pre02Before, /76s/u);
    assert.doesNotMatch(
      pre02Before,
      locale === "ru"
        ? /(?:жизнеспособн\w*\s+(?:базов\w*\s+)?колл|базов\w*\s+колл|колл[- ]регион)/iu
        : /(?:viable\s+(?:baseline\s+)?call|baseline\s+call|call(?:ing)?\s+region)/iu,
    );
    assert.match(pre02.question, locale === "ru" ? /семейств.*свойств/iu : /family.*traits/iu);

    const anc01 = getDrill("ancestry", "anc-01");
    assert.doesNotMatch(
      preAnswerCopy(anc01),
      locale === "ru" ? /реальн\w*\s+фолд\w*|уже.*фолд/u : /real\s+folds|folding\s+branch/iu,
    );
    assert.match(anc01.question, locale === "ru" ? /подтвердить.*4-бет-блеф/iu : /established.*4-bet bluff/iu);

    const anc03 = getDrill("ancestry", "anc-03");
    assert.match(anc03.assumptions.join(" "), locale === "ru" ? /условию задачи/iu : /exercise premise/iu);
    assert.match(anc03.question, locale === "ru" ? /заданном условии.*сравнить/iu : /given the stated premise.*compared/iu);
    assert.doesNotMatch(anc03.question, locale === "ru" ? /должна ли 98s коллировать/iu : /should 98s call/iu);

    const pre04 = getDrill("preflop", "pre-04");
    assert.match(pre04.question, locale === "ru" ? /Условие задачи.*подстрой/iu : /exercise premise.*adjustment/iu);
  });

  test(`${locale}: LCM-02 explicitly teaches combo -> family/traits -> context -> decision`, () => {
    applyLocaleData(locale);
    const preflop = moduleById.preflop;
    const scaffold = [
      preflop.plainGoal,
      preflop.tableCue,
      ...preflop.theory,
      ...preflop.heuristics,
      ...preflop.decisionTree,
      ...preflop.tableCard,
      ...preflop.glossary.flatMap((item) => [item.term, item.meaning]),
    ].join(" ");

    for (const hand of ["TT", "76s", "98s", "A5s", "KTs", "KJo"]) assert.match(scaffold, new RegExp(hand.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "u"));
    assert.match(scaffold, locale === "ru" ? /карманн.*пара/iu : /pocket pair/iu);
    assert.match(scaffold, locale === "ru" ? /мастев.*связк/iu : /suited connector/iu);
    assert.match(scaffold, locale === "ru" ? /мастев.*туз.*колес/iu : /suited wheel ace/iu);
    assert.match(scaffold, locale === "ru" ? /мастев.*бродвей/iu : /suited Broadway/iu);
    assert.match(scaffold, locale === "ru" ? /разномастн.*бродвей/iu : /offsuit Broadway/iu);
    assert.match(preflop.tableCue, locale === "ru" ? /Рука.*семейств.*свойств.*контекст.*действие/iu : /Hand.*family.*traits.*context.*decision/iu);

    const connector = familyGlossaryEntry(locale, locale === "ru" ? /Мастевая связка/iu : /^Suited connector$/iu);
    assert.match(connector.meaning, /76s/u);
    assert.match(connector.meaning, /98s/u);
    assert.doesNotMatch(connector.meaning, locale === "ru" ? /(?:=\s*)?(?:колл|фолд|3-бет)/iu : /(?:=\s*)?(?:call|fold|3-bet)/iu);

    const pre02 = getDrill("preflop", "pre-02");
    assert.match(pre02.explanation, /76s/u);
    assert.match(pre02.explanation, /98s/u);
    assert.match(pre02.explanation, locale === "ru" ? /мастевая связка/iu : /suited connector/iu);
    assert.match(pre02.explanation, locale === "ru" ? /не выбирают действие/iu : /do not choose the action/iu);
  });

  test(`${locale}: same-hand and sibling-family transfer stay contextual rather than prescriptive`, () => {
    applyLocaleData(locale);
    const anc01 = getDrill("ancestry", "anc-01");
    const anc02 = getDrill("ancestry", "anc-02");
    const anc03 = getDrill("ancestry", "anc-03");
    assert.match(`${anc01.cue} ${anc01.assumptions.join(" ")}`, /A5s/u);
    assert.match(`${anc02.cue} ${anc02.assumptions.join(" ")}`, /A5s/u);
    assert.match(`${anc01.cue} ${anc01.assumptions.join(" ")}`, locale === "ru" ? /широк/iu : /wide/iu);
    assert.match(`${anc02.cue} ${anc02.assumptions.join(" ")}`, locale === "ru" ? /тайтов|почти без блеф/iu : /tight|almost.*bluff/iu);
    assert.match(anc02.explanation, locale === "ru" ? /Комбо не изменилось/iu : /combo is unchanged/iu);
    assert.match(anc02.explanation, locale === "ru" ? /не урок.*A5s.*блеф/iu : /not.*A5s.*bluff/iu);
    assert.match(anc03.explanation, /98s/u);
    assert.match(anc03.explanation, /76s/u);
    assert.match(anc03.explanation, locale === "ru" ? /мастевая связка/iu : /suited connector/iu);
  });

  test(`${locale}: repaired material distractors have no severe lexical or length parity regression`, () => {
    applyLocaleData(locale);
    assert.deepEqual(reasonParityRisks(locale), []);
  });

  test(`${locale}: final closure preserves every governed scoring and misconception identity`, () => {
    applyLocaleData(locale);
    assert.deepEqual(identitySnapshot(), baselineIdentities);
  });
}
