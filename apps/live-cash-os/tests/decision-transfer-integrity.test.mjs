import assert from "node:assert/strict";
import test from "node:test";
import { moduleById } from "../content/modules.ts";
import { applyLocaleData } from "../content/i18n/locale-pipeline.ts";

const moduleIds = ["geometry", "preflop", "blinds", "filtering", "shape", "aggression", "ancestry", "multiway", "river", "evidence", "transfer"];

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

const originalIdentities = identitySnapshot();
const expectedDrillCount = originalIdentities.length;

function drill(moduleId, drillId) {
  const result = moduleById[moduleId].drills.find((item) => item.id === drillId);
  assert.ok(result, `Missing ${drillId}`);
  return result;
}

function optionText(drillItem, id) {
  return [...drillItem.actionOptions, ...drillItem.reasonOptions].find((option) => option.id === id)?.text ?? "";
}

function words(text) {
  return text.trim().split(/\s+/u).filter(Boolean).length;
}

function antiGuessingRisks(locale) {
  const tell = locale === "ru"
    ? /(?:\bвсегда\b|\bникогда\b|\bавтоматически\b|только\s+(?:из-за|потому))/iu
    : /(?:\bmerely\b|\bsolely\b|\balways\b|\bnever\b|\bautomatically\b|\bonly\s+because\b)/iu;
  const lexical = [];
  const length = [];

  for (const moduleId of moduleIds) {
    for (const item of moduleById[moduleId].drills) {
      for (const [kind, options, correctId] of [
        ["action", item.actionOptions, item.correctActionId],
        ["reason", item.reasonOptions, item.correctReasonId],
      ]) {
        const correct = options.find((option) => option.id === correctId);
        const wrong = options.filter((option) => option.id !== correctId);
        assert.ok(correct && wrong.length === 2, `${item.id}.${kind}: malformed options`);
        for (const option of wrong) {
          if (tell.test(option.text)) lexical.push(`${item.id}.${kind}:${option.text}`);
        }

        const correctWords = words(correct.text);
        const wrongWords = wrong.map((option) => words(option.text));
        const wrongAverage = (wrongWords[0] + wrongWords[1]) / 2;
        const wrongMax = Math.max(...wrongWords);
        const wrongMin = Math.min(...wrongWords);
        if (correctWords >= 10 && correctWords > wrongAverage * 1.75 && correctWords - wrongMax >= 4) {
          length.push(`${item.id}.${kind}: correct uniquely long=${correctWords}, wrong=${wrongWords.join("/")}`);
        }
        if (wrongMin >= 10 && wrongMin > correctWords * 2 && wrongMin - correctWords >= 8) {
          length.push(`${item.id}.${kind}: correct uniquely short=${correctWords}, wrong=${wrongWords.join("/")}`);
        }
      }
    }
  }
  return { lexical, length };
}

for (const locale of ["ru", "en"]) {
  test(`${locale}: concrete decision transfer survives the final locale pipeline`, () => {
    applyLocaleData(locale);
    assert.equal(moduleIds.reduce((sum, moduleId) => sum + moduleById[moduleId].drills.length, 0), expectedDrillCount);

    const pre02 = drill("preflop", "pre-02");
    const pre02Before = `${pre02.cue} ${pre02.assumptions.join(" ")} ${pre02.question}`;
    assert.match(pre02Before, /76s/u);
    assert.doesNotMatch(
      pre02Before,
      locale === "ru"
        ? /(?:нижнюю мастевую часть базового колл-региона|жизнеспособн\w*\s+(?:базов\w*\s+)?колл|базов\w*\s+колл)/iu
        : /(?:lower suited part of a baseline call region|viable\s+(?:baseline\s+)?call|baseline\s+call)/iu,
    );
    assert.match(pre02.question, locale === "ru" ? /семейств.*свойств/iu : /family.*traits/iu);
    assert.match(`${drill("preflop", "pre-03").cue} ${drill("preflop", "pre-03").assumptions.join(" ")}`, /KJo/u);
    assert.match(`${drill("preflop", "pre-04").cue} ${drill("preflop", "pre-04").assumptions.join(" ")}`, /A5s/u);
    assert.match(`${drill("blinds", "bli-01").cue} ${drill("blinds", "bli-01").assumptions.join(" ")}`, /A-7-2/iu);

    const shapeCopy = `${moduleById.shape.workedExample.situation} ${drill("shape", "sha-03").cue} ${drill("shape", "sha-04").cue}`;
    assert.match(shapeCopy, /T-5-5/iu);
    assert.match(shapeCopy, /T6s/u);
    assert.match(shapeCopy, /KTs/u);

    const ancestryCopy = `${moduleById.ancestry.workedExample.situation} ${drill("ancestry", "anc-01").cue} ${drill("ancestry", "anc-02").cue} ${drill("ancestry", "anc-03").cue}`;
    assert.match(ancestryCopy, /A5s/u);
    assert.match(ancestryCopy, /98s/u);

    const multiwayCopy = `${moduleById.multiway.workedExample.situation} ${drill("multiway", "mul-01").cue} ${drill("multiway", "mul-02").cue}`;
    assert.match(multiwayCopy, /KQ/u);
    assert.match(multiwayCopy, /K-9-7/iu);

    const scopeCopy = [
      moduleById.preflop.workedExample.situation,
      pre02.assumptions.join(" "),
      drill("preflop", "pre-03").assumptions.join(" "),
      drill("preflop", "pre-04").assumptions.join(" "),
      drill("ancestry", "anc-01").assumptions.join(" "),
      drill("ancestry", "anc-03").assumptions.join(" "),
    ].join(" ");
    assert.match(scopeCopy, locale === "ru" ? /не (?:утверждается|универсальн|новая точная|новую chart|задаёт)/iu : /not (?:a new|an? universal)|no exact chart frequency|no exact.*claimed/iu);
  });

  test(`${locale}: final runtime corpus has no obvious lexical or severe bidirectional length answer tells`, () => {
    applyLocaleData(locale);
    const risks = antiGuessingRisks(locale);
    assert.deepEqual(risks.lexical, [], `Lexical wrong-answer tells remain:\n${risks.lexical.join("\n")}`);
    assert.deepEqual(risks.length, [], `Severe answer-length tells remain:\n${risks.length.join("\n")}`);
  });

  test(`${locale}: wording repair preserves every scoring and misconception identity`, () => {
    applyLocaleData(locale);
    assert.deepEqual(identitySnapshot(), originalIdentities);
    for (const identity of originalIdentities) {
      const item = drill(identity.moduleId, identity.drillId);
      assert.ok(optionText(item, item.correctActionId));
      assert.ok(optionText(item, item.correctReasonId));
    }
  });
}
