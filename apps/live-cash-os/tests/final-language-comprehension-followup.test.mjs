import assert from "node:assert/strict";
import test from "node:test";

import {
  practicalDecisions,
  practicalSkillFamilies,
} from "../content/practical-mastery/index.ts";
import { practicalSelectedDecisionFeedback } from "../lib/practical-selected-decision-feedback.ts";
import { practicalPostQuickStartTeachingAssetForSkill } from "../lib/practical-post-quick-start-learning.ts";

const byId = new Map(practicalDecisions.map((decision) => [decision.id, decision]));

function decision(id) {
  const item = byId.get(id);
  assert.ok(item, `${id}: decision missing`);
  return item;
}

function correctAction(item) {
  return item.actionOptions.find((option) => option.id === item.correctActionId);
}

function correctReason(item) {
  return item.reasonOptions.find((option) => option.id === item.correctReasonId);
}

function learnerStrings(item) {
  return [
    item.cueRu, item.cueEn, item.questionRu, item.questionEn,
    item.explanationRu, item.explanationEn,
    ...item.actionOptions.flatMap((option) => [option.textRu, option.textEn]),
    ...item.reasonOptions.flatMap((option) => [option.textRu, option.textEn]),
  ];
}

test("FND-06 RU localization is keyed by option id and feedback reports the same correct meaning", () => {
  const expected = {
    "PM-FND-06-101": { aRu: /80bb/u, aEn: /80bb/u, bRu: /^200bb$/u, bEn: /^200bb$/u },
    "PM-FND-06-102": { aRu: /^3$/u, aEn: /^3$/u, bRu: /^30$/u, bEn: /^30$/u },
    "PM-FND-06-103": { aRu: /SPR≈1/u, aEn: /SPR≈1/u, bRu: /SPR≈8/u, bEn: /SPR≈8/u },
    "PM-FND-06-104": { aRu: /^Нет/u, aEn: /^No/u, bRu: /^Да/u, bEn: /^Yes/u },
  };

  for (const [id, contract] of Object.entries(expected)) {
    const item = decision(id);
    assert.equal(item.correctActionId, "a", `${id}: correct action id changed`);
    const a = item.actionOptions.find((option) => option.id === "a");
    const b = item.actionOptions.find((option) => option.id === "b");
    assert.ok(a && b, `${id}: stable option ids missing`);
    assert.match(a.textRu, contract.aRu, `${id}: RU correct meaning drifted`);
    assert.match(a.textEn, contract.aEn, `${id}: EN correct meaning drifted`);
    assert.match(b.textRu, contract.bRu, `${id}: RU wrong option b drifted`);
    assert.match(b.textEn, contract.bEn, `${id}: EN wrong option b drifted`);

    const feedbackRu = practicalSelectedDecisionFeedback(
      item, "ru", b.id, item.correctReasonId, false,
    );
    const feedbackEn = practicalSelectedDecisionFeedback(
      item, "en", b.id, item.correctReasonId, false,
    );
    assert.equal(feedbackRu.action?.selectedText, b.textRu, `${id}: RU feedback selected text`);
    assert.equal(feedbackRu.action?.correctText, a.textRu, `${id}: RU feedback correct text`);
    assert.equal(feedbackEn.action?.selectedText, b.textEn, `${id}: EN feedback selected text`);
    assert.equal(feedbackEn.action?.correctText, a.textEn, `${id}: EN feedback correct text`);
  }
});

const a9Families = ["MW-01", "MW-02", "MW-03", "MW-04", "DEEP-01", "DEEP-03", "DEEP-04"];
const a9Suffixes = ["102", "104", "105", "107"];
const a9MechanismNuclei = {
  "MW-01": { ru: /позади|зажат|сквиз|оверколл/iu, en: /behind|sandwich|squeeze|overcall/iu },
  "MW-02": { ru: /одн.{0,5}пар|сильн|натсов|мультивей/iu, en: /one-pair|strong|nutted|multiway/iu },
  "MW-03": { ru: /блеф|фолд|диапазон|сопротивлен/iu, en: /bluff|fold|range|resistance/iu },
  "MW-04": { ru: /лимп|изоляц|колл|позици/iu, en: /limp|isolation|called|position/iu },
  "DEEP-01": { ru: /глуб|стек|рычаг|имплайд/iu, en: /deep|stack|leverage|implied/iu },
  "DEEP-03": { ru: /страддл|глубин|порядок действ|позици/iu, en: /straddle|depth|action order|position/iu },
  "DEEP-04": { ru: /глуб|3-бет|сквиз|доминир|имплайд/iu, en: /deep|3-bet|squeeze|domination|implied/iu },
};

test("A9 material rows name an exact intervention and give a causal directional reason", () => {
  const generic = /Меняется одна структурная переменная|Напрашивается соблазнительный шаблонный ход|Сайзинг или объём вложенных фишек|Число или сила соперников/iu;
  for (const skill of a9Families) {
    const reasons = [];
    const nucleus = a9MechanismNuclei[skill];
    assert.ok(nucleus, `${skill}: missing A9 mechanism guard`);
    for (const suffix of a9Suffixes) {
      const item = decision(`PM-${skill}-A9-${suffix}`);
      const action = correctAction(item);
      const reason = correctReason(item);
      assert.ok(action && reason);
      assert.doesNotMatch(item.cueRu, generic, `${item.id}: generic RU intervention survived`);
      assert.doesNotMatch(item.cueEn, /one structural variable changes|a shortcut looks tempting|sizing\/investment changes|number\/strength of opponents/iu, `${item.id}: generic EN intervention survived`);
      assert.match(reason.textRu, nucleus.ru, `${item.id}: RU reason lost the skill mechanism`);
      assert.match(reason.textEn, nucleus.en, `${item.id}: EN reason lost the skill mechanism`);
      assert.ok(reason.textRu.length >= 70, `${item.id}: RU reason is too compressed to carry intervention -> mechanism -> consequence`);
      assert.ok(reason.textEn.length >= 70, `${item.id}: EN reason is too compressed to carry intervention -> mechanism -> consequence`);
      reasons.push(`${reason.textRu} || ${reason.textEn}`);
    }
    assert.equal(new Set(reasons).size, 4, `${skill}: four material A9 rows collapsed to one family reason`);
  }
});

test("A10 repeated evidence and changed behavior drive an explicit exploit direction", () => {
  const ids = [
    "PM-EXP-01-A10-105", "PM-EXP-01-A10-106",
    "PM-EXP-02-A10-105", "PM-EXP-02-A10-106",
    "PM-EXP-03-A10-105", "PM-EXP-03-A10-106",
    "PM-EXP-04-A10-105", "PM-EXP-04-A10-106",
    "PM-EXP-05-A10-105", "PM-EXP-05-A10-106",
  ];
  for (const id of ids) {
    const item = decision(id);
    const action = correctAction(item);
    const reason = correctReason(item);
    assert.ok(action && reason);
    assert.match(item.cueRu, /повтор|противореч|фолд|колл|линия|сайзинг|блеф/iu, `${id}: exact evidence variable missing`);
    assert.match(action.textRu, /усил|ослаб|развер|тоньше|сохраня|увелич|сократ|расшир|коллировать реже|атаковать|вернуться/iu, `${id}: exploit direction missing`);
    assert.match(reason.textRu, /уверен|диапазон|блеф|фолд|сайзинг|линия|узел/iu, `${id}: mechanism missing`);
    assert.match(reason.textEn, /confidence|range|bluff|fold|size|line|node|branch/iu, `${id}: EN mechanism missing`);
  }
});

test("W4 distractors no longer carry a global wrong-only authorial fingerprint", () => {
  const rows = practicalDecisions.filter((item) => (
    /^PM-W4-(?:BOARD|RUNOUT|HAND|REL)-01-10[1-8]$/u.test(item.id)
    && item.learnerEligibility !== "INTERNAL_ONLY"
  ));
  assert.equal(rows.length, 31);
  const oldRu = /Этого достаточно для полной классификации|пришедшие диапазоны не меняют вывод/iu;
  const oldEn = /That is sufficient for the full classification|arriving ranges do not change the conclusion/iu;
  const wrongActionTexts = [];
  for (const item of rows) {
    for (const option of item.actionOptions) {
      if (option.id === item.correctActionId) continue;
      assert.doesNotMatch(option.textRu, oldRu, `${item.id}/${option.id}: old RU fingerprint survived`);
      assert.doesNotMatch(option.textEn, oldEn, `${item.id}/${option.id}: old EN fingerprint survived`);
      wrongActionTexts.push(`${option.textRu} || ${option.textEn}`);
    }
  }
  const counts = new Map();
  for (const text of wrongActionTexts) counts.set(text, (counts.get(text) ?? 0) + 1);
  assert.ok(Math.max(...counts.values()) < 31, "one wrong-only W4 action fingerprint still spans the full family");
});

test("the eight audited RU core decisions contain no nonstandard English teaching vocabulary", () => {
  const ids = [
    "PM-MW-02-001", "PM-W4-HAND-001", "PM-IP-03-001", "PM-W4-BOARD-01-106",
    "PM-W4-RUNOUT-01-107", "PM-W4-REL-01-103", "PM-W4-REL-01-104", "PM-W4-REL-01-106",
  ];
  const forbidden = /\b(?:One-pair|sequence|relative|classification|continuing|rebuild|become|selective|betting|broad|unselective|automatic|urgency|Higher|Lower)\b/iu;
  for (const id of ids) {
    const item = decision(id);
    const ru = [
      item.cueRu, item.questionRu, item.explanationRu,
      ...item.actionOptions.map((option) => option.textRu),
      ...item.reasonOptions.map((option) => option.textRu),
    ].join("\n");
    assert.doesNotMatch(ru, forbidden, `${id}: nonstandard English remains in RU learner copy`);
  }
});

test("language-eliminable RU distractors are natural RU and retain distinct option ids", () => {
  const ids = ["PM-OOP-02-001", "PM-IP-02-001", "PM-EXP-04-001"];
  for (const id of ids) {
    const item = decision(id);
    for (const option of [...item.actionOptions, ...item.reasonOptions]) {
      if (option.id === item.correctActionId || option.id === item.correctReasonId) continue;
      assert.match(option.textRu, /[А-Яа-яЁё]/u, `${id}/${option.id}: RU distractor remains fully English`);
    }
  }
  const oop = decision("PM-OOP-02-001");
  const b = oop.actionOptions.find((option) => option.id === "b");
  const c = oop.actionOptions.find((option) => option.id === "c");
  assert.ok(b && c);
  assert.notEqual(b.textRu, c.textRu);
  assert.equal(b.misconception, "CALL_ONLY_EQUALS_CALL_ALL");
  assert.equal(c.misconception, "CALL_ONLY_EQUALS_CALL_ALL");
});

test("learner-facing decisions and rendered teaching assets expose no internal source ids", () => {
  const sourceId = /\b(?:FTGU|SLC|LCM|CINJ|CP)-[A-Z0-9-]+(?:\/E\d+)*\b/u;
  for (const item of practicalDecisions) {
    for (const value of learnerStrings(item)) {
      assert.doesNotMatch(value, sourceId, `${item.id}: learner decision source id leak`);
    }
  }
  for (const skill of practicalSkillFamilies) {
    const asset = practicalPostQuickStartTeachingAssetForSkill(skill.id);
    if (!asset) continue;
    const values = [];
    if (asset.kind === "ANCHOR") {
      values.push(asset.anchor.promptRu, asset.anchor.promptEn, asset.anchor.answerRu, asset.anchor.answerEn, asset.anchor.rationaleRu, asset.anchor.rationaleEn);
    } else if (asset.kind === "SOURCE_BOUND") {
      values.push(asset.teaching.situationRu, asset.teaching.situationEn, asset.teaching.mechanismRu, asset.teaching.mechanismEn, asset.teaching.exampleRu, asset.teaching.exampleEn, asset.teaching.boundaryRu, asset.teaching.boundaryEn);
    } else {
      values.push(asset.rule.defaultRu, asset.rule.defaultEn, asset.rule.whyRu, asset.rule.whyEn, asset.rule.transferCueRu, asset.rule.transferCueEn, ...asset.rule.reversalsRu, ...asset.rule.reversalsEn);
    }
    for (const value of values) assert.doesNotMatch(value, sourceId, `${skill.id}: rendered teaching source id leak`);
  }
});

test("bounded RU grammar residues stay closed", () => {
  const bad = /Board ярлык cannot изменяется ownership|правильный базовая линия|хоть одна стратегический узел|много будущий stack|ставит маленько слишком широкий range/iu;
  for (const item of practicalDecisions) {
    const ru = [
      item.cueRu, item.questionRu, item.explanationRu,
      ...item.actionOptions.map((option) => option.textRu),
      ...item.reasonOptions.map((option) => option.textRu),
    ].join("\n");
    assert.doesNotMatch(ru, bad, `${item.id}: bounded grammar residue returned`);
  }
  const teaching = practicalPostQuickStartTeachingAssetForSkill("3BP-03");
  assert.equal(teaching?.kind, "SOURCE_BOUND");
  assert.doesNotMatch(teaching.teaching.exampleRu, bad);
});
