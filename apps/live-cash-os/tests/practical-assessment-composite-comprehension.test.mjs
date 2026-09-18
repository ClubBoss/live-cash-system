import assert from "node:assert/strict";
import test from "node:test";

import { practicalDecisions } from "../content/practical-mastery/index.ts";
import {
  practicalAssessmentExactReasonRepairs,
  practicalAssessmentReasonRepairGroups,
} from "../lib/practical-assessment-length-presentation.ts";
import { practicalPresentedDecisionOptions } from "../lib/practical-option-presentation.ts";

const COMPOSITE_ACTION_IDS = [
  "PM-FND-04-B1-101","PM-FND-04-B1-102","PM-FND-04-B1-103","PM-FND-04-B1-104",
  "PM-FND-04-B1-105","PM-FND-04-B1-106","PM-FND-04-B1-107","PM-FND-04-B1-108",
  "PM-W4-DRAW-B1-101","PM-W4-DRAW-B1-102","PM-W4-DRAW-B1-103","PM-W4-DRAW-B1-104",
  "PM-W4-DRAW-B1-105","PM-W4-DRAW-B1-106","PM-W4-DRAW-B1-107","PM-W4-DRAW-B1-108",
  "PM-DEEP-02-B1-101","PM-DEEP-02-B1-102","PM-DEEP-02-B1-103","PM-DEEP-02-B1-104",
  "PM-DEEP-02-B1-105","PM-DEEP-02-B1-106","PM-DEEP-02-B1-107","PM-DEEP-02-B1-108",
  "PM-EXP-06-B1-101","PM-EXP-06-B1-102","PM-EXP-06-B1-103","PM-EXP-06-B1-104",
  "PM-MW-05-B1-101","PM-MW-05-B1-102","PM-MW-05-B1-103","PM-MW-05-B1-104",
];

const COMPOSITE_REASON_LABELS = new Set([
  "COMPOSITE_FND04_B1",
  "COMPOSITE_W4_DRAW_B1",
  "COMPOSITE_DEEP02_B1",
  "COMPOSITE_EXP06_B1",
  "COMPOSITE_MW05_B1",
]);
const compositeReasonGroups = practicalAssessmentReasonRepairGroups.filter((group) => (
  COMPOSITE_REASON_LABELS.has(group.label)
));
const COMPOSITE_REASON_IDS = [
  ...compositeReasonGroups.flatMap((group) => group.decisionIds),
  ...Object.keys(practicalAssessmentExactReasonRepairs),
];

const BANNED_RU_CODE_SWITCH = /\b(?:clean|dirty|range|default|tree|strong|action|context|depth|nuts|multiway|value|bluff|thresholds|targets|game|seat|origin|label|flat|viable|pressure|raw|closing)\b/giu;
const TELEGRAPHIC_MARKERS = /[+×]|\//u;

function decisionById(id) {
  const decision = practicalDecisions.find((candidate) => candidate.id === id);
  assert.ok(decision, `${id}: decision missing`);
  return decision;
}

function canonicalCorrect(decision, stage) {
  const options = stage === "action" ? decision.actionOptions : decision.reasonOptions;
  const correctId = stage === "action" ? decision.correctActionId : decision.correctReasonId;
  const option = options.find((candidate) => candidate.id === correctId);
  assert.ok(option, `${decision.id}/${stage}: canonical correct option missing`);
  return option;
}

function presentedCorrect(decision, stage) {
  const correctId = stage === "action" ? decision.correctActionId : decision.correctReasonId;
  const option = practicalPresentedDecisionOptions(decision, stage, 0)
    .find((candidate) => candidate.id === correctId);
  assert.ok(option, `${decision.id}/${stage}: presented correct option missing`);
  return option;
}

function wordCount(text) {
  return text.trim().split(/\s+/u).filter(Boolean).length;
}

function assertNaturalRu(id, stage, baseline, candidate) {
  assert.notEqual(candidate, baseline, `${id}/${stage}: RU presentation unexpectedly equals starting-main surface`);
  assert.match(candidate, /[.!?]$/u, `${id}/${stage}: RU answer must read as a complete learner-facing sentence`);
  assert.ok(wordCount(candidate) >= 5, `${id}/${stage}: RU answer is still too fragmentary`);
  assert.equal(BANNED_RU_CODE_SWITCH.test(candidate), false, `${id}/${stage}: unnecessary English code-switch remains in RU`);
  BANNED_RU_CODE_SWITCH.lastIndex = 0;
  assert.equal(TELEGRAPHIC_MARKERS.test(candidate), false, `${id}/${stage}: telegraphic operator-style wording remains in RU`);

  const baselineSwitches = (baseline.match(BANNED_RU_CODE_SWITCH) ?? []).length;
  BANNED_RU_CODE_SWITCH.lastIndex = 0;
  const candidateSwitches = (candidate.match(BANNED_RU_CODE_SWITCH) ?? []).length;
  BANNED_RU_CODE_SWITCH.lastIndex = 0;
  assert.ok(candidateSwitches <= baselineSwitches, `${id}/${stage}: RU code-switch burden is worse than starting main`);
}

function assertWrongOptionsUnchanged(decision, stage) {
  const canonical = stage === "action" ? decision.actionOptions : decision.reasonOptions;
  const correctId = stage === "action" ? decision.correctActionId : decision.correctReasonId;
  const presented = practicalPresentedDecisionOptions(decision, stage, 0);
  for (const wrong of canonical.filter((option) => option.id !== correctId)) {
    const shown = presented.find((option) => option.id === wrong.id);
    assert.ok(shown, `${decision.id}/${stage}/${wrong.id}: distractor missing`);
    assert.deepEqual(
      { textRu: shown.textRu, textEn: shown.textEn, misconception: shown.misconception },
      { textRu: wrong.textRu, textEn: wrong.textEn, misconception: wrong.misconception },
      `${decision.id}/${stage}/${wrong.id}: distractor or misconception mutated`,
    );
  }
}

const reasonGroupNuclei = {
  COMPOSITE_FND04_B1: /^(?=.*грязн)(?=.*аут)(?=.*(?:лучш|эквити))/iu,
  COMPOSITE_W4_DRAW_B1: /^(?=.*грязн)(?=.*аут)(?=.*(?:пересеч|пересек))(?=.*фолд-эквити)/iu,
  COMPOSITE_DEEP02_B1: /^(?=.*глубок)(?=.*без позиции)(?=.*реал)(?=.*эквити)(?=.*имплайд)/iu,
  COMPOSITE_EXP06_B1: /^(?=.*EV)(?=.*мест)(?=.*размер стек)/iu,
  COMPOSITE_MW05_B1: /^(?=.*мультивей)(?=.*диапазон)(?=.*блеф)(?=.*вэлью)/iu,
};

const exactReasonNuclei = {
  "PM-BL-01-001": /^(?=.*EP)(?=.*сильн)(?=.*(?:domination|доминац))(?=.*(?:overpair|оверпар))/iu,
  "PM-BL-01-101": /^(?=.*диапазон[а-я]* EP)(?=.*топ-пар)(?=.*оверпар)/iu,
  "PM-BL-01-102": /^(?=.*защит.*BB)(?=.*цен)(?=.*исходн.*диапазон)(?=.*реализ)/iu,
  "PM-BL-01-104": /^(?=.*домин)(?=.*давлен)(?=.*эквити)/iu,
  "PM-BL-01-105": /^(?=.*реальн.*сил)(?=.*исходн.*диапазон)(?=.*позици)/iu,
  "PM-BL-01-107": /^(?=.*цен)(?=.*исходн.*диапазон)(?=.*реализац)/iu,
  "PM-BL-05-001": /^(?=.*риск.*сквиз)(?=.*игрок.*позади)/iu,
  "PM-BL-05-101": /^(?=.*риск.*сквиз)(?=.*колл)(?=.*позицион)/iu,
  "PM-BL-05-102": /^(?=.*риск.*сквиз)(?=.*штраф)(?=.*колл)/iu,
  "PM-BL-05-106": /^(?=.*структурн.*штраф)(?=.*сквиз)/iu,
  "PM-BL-05-107": /^(?=.*3-бет)(?=.*фолд)(?=.*(?:запрет|запрещ))/iu,
  "PM-BL-05-108": /^(?=.*сильн.*диапазон)(?=.*(?:фолд-эквити|фолдит.*3-бет))/iu,
  "PM-PF-08-001": /^(?=.*4-бет)(?=.*фолд)(?=.*вэлью)/iu,
  "PM-PF-08-101": /^(?=.*средн)(?=.*EV)(?=.*колл)(?=.*4-бет)(?=.*фолд)/iu,
  "PM-PF-08-102": /^(?=.*SPR)(?=.*позици)(?=.*преимущ)/iu,
  "PM-PF-08-103": /^(?=.*4-бет)(?=.*вэлью)(?=.*5-бет)(?=.*продолж)/iu,
  "PM-PF-08-104": /^(?=.*фолд)(?=.*4-бет)(?=.*EV)/iu,
};

function a(id, baselineRu, candidateRu = baselineRu) {
  return { id, baselineRu, candidateRu };
}

const actionReviews = [
  a("PM-FND-04-B1-101", /^(?=.*аут)(?=.*чист)(?=.*грязн)(?=.*диапазон)/iu),
  a("PM-FND-04-B1-102", /^(?=.*Нет)(?=.*пересчит)(?=.*ветк)/iu),
  a("PM-FND-04-B1-103", /^(?=.*чист)(?=.*грязн)(?=.*дисконт)/iu),
  a("PM-FND-04-B1-104", /^(?=.*диапазон)(?=.*цен)(?=.*контекст)/iu),
  a("PM-FND-04-B1-105", /^(?=.*реализац)(?=.*ответ)(?=.*сильн)(?=.*диапазон)/iu),
  a("PM-FND-04-B1-106", /^(?=.*пересоб)(?=.*ветк)(?=.*вывод)(?=.*перенос)/iu),
  a("PM-FND-04-B1-107", /^(?=.*прибыл)(?=.*EV)/iu),
  a("PM-FND-04-B1-108", /^(?=.*правил)(?=.*(?:универсал|предпосыл|услов))/iu),

  a("PM-W4-DRAW-B1-101", /^(?=.*дро)(?=.*аут)(?=.*нат)(?=.*шоудаун)/iu),
  a("PM-W4-DRAW-B1-102", /^(?=.*Нет)(?=.*пересчит)(?=.*ветк)/iu),
  a("PM-W4-DRAW-B1-103", /^(?=.*дро)(?=.*качеств)(?=.*(?:назван|ярлык))/iu),
  a("PM-W4-DRAW-B1-104", /^(?=.*диапазон)(?=.*цен)(?=.*контекст)/iu),
  a("PM-W4-DRAW-B1-105", /^(?=.*реализац)(?=.*ответ)(?=.*сильн)(?=.*диапазон)/iu),
  a("PM-W4-DRAW-B1-106", /^(?=.*пересоб)(?=.*ветк)(?=.*вывод)(?=.*перенос)/iu),
  a("PM-W4-DRAW-B1-107", /^(?=.*прибыл)(?=.*EV)/iu),
  a("PM-W4-DRAW-B1-108", /^(?=.*правил)(?=.*(?:универсал|одинаково|предпосыл|услов))/iu),

  a("PM-DEEP-02-B1-101", /^(?=.*(?:глубин|300bb))(?=.*позици)(?=.*реализац)(?=.*имплайд)(?=.*100bb)/iu),
  a("PM-DEEP-02-B1-102", /^(?=.*Нет)(?=.*пересчит)(?=.*ветк)/iu),
  a("PM-DEEP-02-B1-103", /^(?=.*3-бет)(?=.*колл)(?=.*пар)(?=.*позици)(?=.*нат)/iu),
  a("PM-DEEP-02-B1-104", /^(?=.*диапазон)(?=.*цен)(?=.*контекст)/iu),
  a("PM-DEEP-02-B1-105", /^(?=.*реализац)(?=.*ответ)(?=.*сильн)(?=.*диапазон)/iu),
  a("PM-DEEP-02-B1-106", /^(?=.*пересоб)(?=.*ветк)(?=.*вывод)(?=.*перенос)/iu),
  a("PM-DEEP-02-B1-107", /^(?=.*прибыл)(?=.*EV)/iu),
  a("PM-DEEP-02-B1-108", /^(?=.*правил)(?=.*(?:предпосыл|услов))/iu),

  a("PM-EXP-06-B1-101", /^(?=.*(?:качеств|активност))(?=.*соперник)(?=.*сильн)(?=.*(?:позици|мест))/iu),
  a("PM-EXP-06-B1-102", /^(?=.*Нет)(?=.*(?:пересчит|оцени))/iu),
  a("PM-EXP-06-B1-103", /^(?=.*прибыльн)(?=.*сильн)(?=.*наблюд)/iu),
  a(
    "PM-EXP-06-B1-104",
    /^(?=.*диапазон)(?=.*цен)(?=.*контекст)/iu,
    /^(?=.*соперник)(?=.*позици)(?=.*динамик)/iu,
  ),

  a("PM-MW-05-B1-101", /^(?=.*вэлью)(?=.*блеф)(?=.*слаб)(?=.*правдоподоб)/iu),
  a(
    "PM-MW-05-B1-102",
    /^(?=.*Нет)(?=.*пересчит)(?=.*ветк)/iu,
    /^(?=.*Нет)(?=.*пересчит)(?=.*диапазон)/iu,
  ),
  a("PM-MW-05-B1-103", /^(?=.*вэлью)(?=.*блеф)(?=.*цен)(?=.*блокер)(?=.*диапазон)/iu),
  a("PM-MW-05-B1-104", /^(?=.*диапазон)(?=.*цен)(?=.*контекст)/iu),
];

test("composite wording repair owns the reviewed learner-facing action/reason manifest", () => {
  assert.equal(new Set(COMPOSITE_ACTION_IDS).size, 32);
  assert.equal(compositeReasonGroups.length, 5);
  assert.equal(new Set(COMPOSITE_REASON_IDS).size, 77);

  const surfaces = [
    ...COMPOSITE_ACTION_IDS.map((id) => `${id}/action`),
    ...COMPOSITE_REASON_IDS.map((id) => `${id}/reason`),
  ];
  assert.equal(new Set(surfaces).size, 109);
});

test("all reviewed candidate surfaces are natural RU and never mutate distractors or identity", () => {
  const surfaces = [
    ...COMPOSITE_ACTION_IDS.map((id) => ({ id, stage: "action" })),
    ...COMPOSITE_REASON_IDS.map((id) => ({ id, stage: "reason" })),
  ];

  for (const { id, stage } of surfaces) {
    const decision = decisionById(id);
    const baseline = canonicalCorrect(decision, stage);
    const candidate = presentedCorrect(decision, stage);

    assert.ok(decision.sourceRefs.length > 0, `${id}/${stage}: sourceRefs missing`);
    assert.equal(candidate.id, baseline.id, `${id}/${stage}: correct option identity changed`);
    assertNaturalRu(id, stage, baseline.textRu.trim(), candidate.textRu.trim());
    assertWrongOptionsUnchanged(decision, stage);

    if (candidate.textEn.trim() !== baseline.textEn.trim()) {
      assert.match(candidate.textEn.trim(), /[.!?]$/u, `${id}/${stage}: changed EN answer is fragmentary`);
      assert.ok(wordCount(candidate.textEn) >= 6, `${id}/${stage}: changed EN answer is too compressed`);
    }
  }
});

test("candidate preserves the starting-main causal nucleus on every changed reason surface", () => {
  for (const group of compositeReasonGroups) {
    const nucleus = reasonGroupNuclei[group.label];
    assert.ok(nucleus, `${group.label}: causal review missing`);
    for (const id of group.decisionIds) {
      const decision = decisionById(id);
      const baseline = canonicalCorrect(decision, "reason").textRu.trim();
      const candidate = presentedCorrect(decision, "reason").textRu.trim();
      assert.match(baseline, nucleus, `${id}: starting-main reason nucleus unexpectedly drifted`);
      assert.match(candidate, nucleus, `${id}: candidate lost reason causal nucleus`);
    }
  }

  for (const [id, repair] of Object.entries(practicalAssessmentExactReasonRepairs)) {
    const decision = decisionById(id);
    const canonical = canonicalCorrect(decision, "reason").textRu.trim();
    const candidate = presentedCorrect(decision, "reason").textRu.trim();
    assert.equal(canonical, repair.canonical.textRu.trim(), `${id}: reviewed canonical reason drifted`);
    assert.equal(candidate, repair.presented.textRu.trim(), `${id}: reviewed presented reason drifted`);
    const nucleus = exactReasonNuclei[id];
    if (nucleus) assert.match(candidate, nucleus, `${id}: candidate lost reviewed causal nucleus`);
  }
});

test("candidate preserves or strengthens the starting-main action mechanism on all 32 action surfaces", () => {
  assert.equal(actionReviews.length, 32);
  for (const review of actionReviews) {
    const decision = decisionById(review.id);
    const baseline = `${decision.questionRu} ${canonicalCorrect(decision, "action").textRu}`;
    const candidate = `${decision.questionRu} ${presentedCorrect(decision, "action").textRu}`;
    assert.match(baseline, review.baselineRu, `${review.id}: starting-main action review basis drifted`);
    assert.match(candidate, review.candidateRu, `${review.id}: candidate action lost reviewed mechanism`);
    assert.equal(
      presentedCorrect(decision, "action").textEn,
      canonicalCorrect(decision, "action").textEn,
      `${review.id}: EN action must remain the starting-main learner wording`,
    );
  }
});
