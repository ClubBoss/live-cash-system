import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  practicalAnchors,
  practicalDecisions,
  practicalRules,
  practicalSkillFamilies,
} from "../content/practical-mastery/index.ts";
import { firstJourneySteps } from "../content/practical-mastery/first-journey.ts";
import {
  practicalConceptIdsForTexts,
  practicalConcepts,
} from "../content/practical-mastery/novice-concepts.ts";
import { practicalSourceBoundTeachingAssets } from "../content/practical-mastery/post-quick-start-teaching-assets.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function corpus(locale) {
  const suffix = locale === "ru" ? "Ru" : "En";
  return [
    ...practicalSkillFamilies.flatMap((skill) => [skill[`title${suffix}`], skill[`objective${suffix}`]]),
    ...firstJourneySteps.flatMap((step) => [step[`title${suffix}`], step[`purpose${suffix}`], step[`tableUse${suffix}`]]),
    ...practicalRules.flatMap((rule) => [
      rule[`trigger${suffix}`],
      rule[`default${suffix}`],
      rule[`why${suffix}`],
      ...rule[`amplifiers${suffix}`],
      ...rule[`reversals${suffix}`],
      rule[`transferCue${suffix}`],
    ]),
    ...practicalAnchors.flatMap((anchor) => [
      anchor[`prompt${suffix}`],
      anchor[`answer${suffix}`],
      anchor[`rationale${suffix}`],
    ]),
    ...practicalSourceBoundTeachingAssets.flatMap((asset) => [
      asset[`situation${suffix}`],
      asset[`mechanism${suffix}`],
      asset[`example${suffix}`],
      asset[`boundary${suffix}`],
    ]),
    ...practicalDecisions.flatMap((decision) => [
      decision[`cue${suffix}`],
      decision[`question${suffix}`],
      decision[`explanation${suffix}`],
      ...decision.actionOptions.map((option) => option[`text${suffix}`]),
      ...decision.reasonOptions.map((option) => option[`text${suffix}`]),
    ]),
  ].filter((value) => typeof value === "string" && value.trim().length > 0);
}

const controlledVocabulary = [
  ["RANGE", /\branges?\b|диапазон/iu],
  ["EQUITY", /\bequity\b|эквити/iu],
  ["POT_ODDS", /pot odds|call price|цена колла|шансы банка/iu],
  ["EQUITY_REALISATION", /equity reali[sz]ation|reali[sz]able equity|реализац/iu],
  ["EV", /\bEV\b/u],
  ["POSITIONS", /\b(?:EP|HJ|CO|BTN|SB|BB|UTG)\b/u],
  ["IP_OOP", /\b(?:IP|OOP)\b/u],
  ["RFI_OPEN", /\bRFI\b|\bopens?\b|first-in|опен/iu],
  ["ACTION_ORDER", /players? behind|closing action|closes the action|игрок[^.]{0,20}позади|за спиной|закрыва[^.]{0,20}торгов/iu],
  ["RAKE", /\brake\b|рейк/iu],
  ["IMPLIED_ODDS", /implied[- ]odds|имплайд/iu],
  ["REVERSE_IMPLIED_ODDS", /reverse[- ]implied|обратн[^.]{0,10}implied/iu],
  ["DOMINATION", /\b(?:domination|dominated)\b|доминац/iu],
  ["BLOCKER", /blockers?|card removal|\bremoval\b|блокер/iu],
  ["COMBOS", /\bcombos?\b|комбо/iu],
  ["EFFECTIVE_STACK", /effective (?:stack|depth)|эффективн[^.]{0,12}стек/iu],
  ["SPR", /\bSPR\b|stack-to-pot ratio/iu],
  ["BOARD_TEXTURE", /board texture|текстур/iu],
  ["C_BET", /c-?bet|continuation bet|контбет/iu],
  ["RANGE_ADVANTAGE", /range advantage|board ownership|\bownership\b|преимущество диапазона/iu],
  ["NUT_ADVANTAGE", /nut advantage|nut strength|nut potential|\bnutted\b|натсов|\bнатс/iu],
  ["CAPPED_RANGE", /\bcapped\b|\buncapped\b|капнут|некапнут/iu],
  ["RANGE_SHAPE", /\blinear\b|\bpolar\b|\bmerged\b|линей|поляр|мердж/iu],
  ["FOLD_EQUITY", /fold equity|фолд-эквити/iu],
  ["SQUEEZE", /squeez|сквиз/iu],
  ["THREE_FOUR_BET", /\b3-?bet\b|\b4-?bet\b|3-бет|4-бет/iu],
  ["POT_TYPES", /\bSRP\b|\b3BP\b|\b4BP\b|single-raised pot|3-bet pot|4-bet pot|3-бет-пот|4-бет-пот/iu],
  ["RUNOUT", /\brunout\b|draw-completing|range-shifting|scare card|\bblank\b|\bбланк/iu],
  ["BARREL", /barrels?|баррел/iu],
  ["PROBE_LEAD", /\bprobe\b|turn probe|\blead\b|\bлид/iu],
  ["THIN_VALUE", /thin value|value target|тонк[^.]{0,12}вэлью/iu],
  ["SHOWDOWN", /showdown|шоудаун/iu],
  ["LEVERAGE", /leverage|леверидж/iu],
  ["STACK_OFF", /stack-off|commitment|overcommit|коммит/iu],
  ["OVERBET", /overbet|овербет/iu],
  ["BLUFF_CATCH", /bluff[- ]catch|блеф-кетч/iu],
  ["BLUFF_FREQUENCY", /underbluff|overbluff|андерблеф|оверблеф/iu],
  ["MULTIWAY", /multiway|мультивей/iu],
  ["HEADS_UP_BLINDS", /heads?-?up|\bHU\b|\bBvB\b|blind[- ]vs[- ]blind|блайнд против блайнда|хедз-?ап/iu],
  ["STRADDLE", /straddle|страддл/iu],
  ["ISO_OVERLIMP", /\bisolation\b|\bisolate\b|\boverlimp\b|изолейт|оверлимп/iu],
  ["DRAW_OUTS", /\bouts\b|\bdraws?\b|backdoor|\bдро\b|\bаут/iu],
  ["DEAD_MONEY", /dead money/iu],
  ["DECISION_BRANCH", /\bbranches?\b|future tree|decision tree|ветк|дерево решений/iu],
  ["HAND_FAMILY", /hand famil|suited connector|pocket pair|\bBroadway\b|семейств/iu],
  ["GAME_SELECTION", /game selection|seat selection|выбор стола|выбор места/iu],
];

test("practical concept authority has unique bilingual definitions", () => {
  assert.ok(practicalConcepts.length >= 35, `expected broad practical concept coverage, got ${practicalConcepts.length}`);
  assert.equal(new Set(practicalConcepts.map((concept) => concept.id)).size, practicalConcepts.length);
  for (const concept of practicalConcepts) {
    assert.ok(concept.labelRu.trim());
    assert.ok(concept.labelEn.trim());
    assert.ok(concept.meaningRu.trim().length >= 20, `${concept.id}: RU meaning is too thin`);
    assert.ok(concept.meaningEn.trim().length >= 20, `${concept.id}: EN meaning is too thin`);
    assert.ok(concept.aliasesRu.length > 0, `${concept.id}: no RU aliases`);
    assert.ok(concept.aliasesEn.length > 0, `${concept.id}: no EN aliases`);
  }
});

test("Quick Start 8/8 begins from plain-language titles before technical terminology", () => {
  assert.equal(firstJourneySteps.length, 8);
  for (const step of firstJourneySteps) {
    assert.deepEqual(
      practicalConceptIdsForTexts("ru", [step.titleRu]),
      [],
      `${step.skillId}: RU Quick Start title still starts with controlled jargon: ${step.titleRu}`,
    );
    assert.deepEqual(
      practicalConceptIdsForTexts("en", [step.titleEn]),
      [],
      `${step.skillId}: EN Quick Start title still starts with controlled jargon: ${step.titleEn}`,
    );
  }
});

for (const locale of ["ru", "en"]) {
  test(`all controlled ${locale.toUpperCase()} practical vocabulary is recognized by the concept authority`, () => {
    const failures = [];
    for (const text of corpus(locale)) {
      const ids = new Set(practicalConceptIdsForTexts(locale, [text]));
      for (const [expectedId, pattern] of controlledVocabulary) {
        if (pattern.test(text) && !ids.has(expectedId)) failures.push(`${expectedId} :: ${text}`);
      }
    }
    assert.deepEqual(failures, [], `uncovered controlled vocabulary:\n${failures.slice(0, 60).join("\n")}`);
  });
}

test("learner surfaces place the concept primer before practice and keep unknown non-scoring", async () => {
  const quickStart = await readFile(path.join(root, "components/PracticalFirstJourneyExperience.tsx"), "utf8");
  const postQuickStart = await readFile(path.join(root, "components/PracticalPostQuickStartTeaching.tsx"), "utf8");
  const primer = await readFile(path.join(root, "components/PracticalConceptPrimer.tsx"), "utf8");

  assert.ok(quickStart.indexOf("<PracticalConceptPrimer") < quickStart.indexOf("Проверить на примере"));
  assert.ok(postQuickStart.indexOf("<PracticalConceptPrimer") < postQuickStart.indexOf("Проверить на примере"));
  assert.match(quickStart, /Не знаю \/ пока не уверен/);
  assert.match(quickStart, /Ответ не записан и ошибкой не считается/);

  const unknownStart = quickStart.indexOf("Не знаю / пока не уверен");
  const unknownEnd = quickStart.indexOf("Ответить", unknownStart);
  const unknownSection = quickStart.slice(unknownStart, unknownEnd);
  assert.doesNotMatch(unknownSection, /recordPracticalDecision|setMasteryWithStudyWorkspace/);

  assert.match(primer, /practicalSkillById/);
  assert.match(primer, /\.\.\.teachingTexts/);
  assert.doesNotMatch(primer, /practicalDecisions/);
  assert.doesNotMatch(primer, /actionOptions|reasonOptions/);
  assert.match(primer, /Ничего из этого не нужно было знать заранее/);
  assert.match(primer, /термины текущего разбора/);
});
