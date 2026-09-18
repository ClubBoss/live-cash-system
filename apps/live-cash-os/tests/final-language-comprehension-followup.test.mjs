import assert from "node:assert/strict";
import test from "node:test";

import {
  allPracticalTableStates,
  isOrdinaryLearnerDecision,
  practicalDecisions,
  practicalSkillFamilies,
} from "../content/practical-mastery/index.ts";
import { practicalSelectedDecisionFeedback } from "../lib/practical-selected-decision-feedback.ts";
import { practicalAssessmentLengthPresentedOptions } from "../lib/practical-assessment-length-presentation.ts";
import { practicalPostQuickStartTeachingAssetForSkill } from "../lib/practical-post-quick-start-learning.ts";
import { practicalConcepts } from "../content/practical-mastery/novice-concepts.ts";
import { firstJourneySteps } from "../content/practical-mastery/first-journey.ts";

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

const RU_POKER_LATIN_ALLOWLIST = new Set([
  "SB", "BB", "BTN", "CO", "UTG", "HJ", "MP", "EP", "IP", "OOP",
  "EV", "SPR", "PFR", "RFI", "VPIP", "GTO", "ICM", "MDF", "SRP", "3BP", "4BP", "HU",
  "Hero", "Villain", "c-bet", "3-bet", "4-bet", "bb", "all-in",
  "heads-up", "multiway", "monotone", "rainbow", "bluff-catcher", "overbet", "probe",
  "limp", "limper", "limpers", "overlimp", "iso", "straddle", "squeeze",
  "blocker", "blockers", "redraw", "redraws", "runout", "runouts", "showdown",
  "overfold", "underfold", "underbluff", "overbluff", "click-back",
  "pot-odds", "implied-odds", "reverse-implied-odds", "stack-off",
  "thin-value", "value-heavy", "small-bet", "high-card",
  "equity", "range", "value", "bluff", "pot", "flop", "turn", "river", "draw",
  "capped", "uncapped", "chop",
].map((token) => token.toLowerCase()));

const RU_ORDINARY_ENGLISH_FORBIDDEN = new RegExp([
  "\\bmandatory\\b", "\\beffective\\b", "\\btree\\b",
  "\\bcharts?\\b", "\\bheuristics?\\b",
  "\\bworse\\b", "\\bcall(?:s|ed|ing)?\\b",
  "\\bsize(?:s|d|ing)?\\b", "\\bsizing\\b",
  "\\bclean\\b", "\\bnut\\s+potential\\b", "\\bdomination\\b",
  "\\bstakes?\\b", "\\baggressive\\b", "\\bpassive\\b",
  "\\bhand\\s+classes\\b", "\\bfuture\\b", "\\bbranch(?:es)?\\b",
  "\\bfringe\\b", "\\bnode-specific\\b",
  "\\bbluff\\s+supply\\b", "\\bworse\\s+calls\\b",
  "\\bleverage\\b", "\\bstructural\\b", "\\bstrategy\\b",
  "\\bplausible\\b", "\\bvisual\\b", "\\bmechanical\\b",
  "\\bassumed\\b", "\\bgain\\b", "\\bsource-supported\\b",
  "\\battainable\\b", "\\bhourly\\b", "\\bexact\\b",
  "\\bplayer\\s+type\\b", "\\bline/size\\b",
  "\\bsmall-size\\b", "\\bsecond-best\\b",
].join("|"), "iu");

const RU_CARD_NOTATION = /^(?:[2-9TJQKA]{1,2}|[2-9TJQKA](?:-[2-9TJQKA])+)$/iu;
const RU_LATIN_TOKEN = /(?:\d+[A-Za-z]+|\d+-[A-Za-z]+(?:-[A-Za-z]+)*|[A-Za-z]+(?:-[A-Za-z]+)*)/gu;

function assertNaturalRuSurface(value, label, census) {
  if (typeof value !== "string" || value.length === 0) return;
  census.count += 1;
  const match = value.match(RU_ORDINARY_ENGLISH_FORBIDDEN);
  assert.equal(match, null, `${label}: ordinary/developer English "${match?.[0] ?? ""}" remains outside the poker allowlist: ${value}`);

  const cardStripped = value
    .replace(/\b[2-9TJQKA][2-9TJQKA](?:s|o)?\b/giu, " ")
    .replace(/[2-9TJQKA][♠♥♦♣]/gu, " ");
  const unknown = [];
  for (const raw of cardStripped.match(RU_LATIN_TOKEN) ?? []) {
    if (raw.length === 1 || RU_CARD_NOTATION.test(raw)) continue;
    let token = raw.toLowerCase();
    if (/^\d+bb$/u.test(token)) token = "bb";
    if (RU_POKER_LATIN_ALLOWLIST.has(token)) continue;
    unknown.push(raw);
  }
  assert.deepEqual([...new Set(unknown)], [], `${label}: Latin token outside explicit poker allowlist: ${[...new Set(unknown)].join(", ")} :: ${value}`);
}

test("machine-wide RU learner-facing runtime rejects ordinary English outside the explicit poker allowlist", () => {
  for (const token of RU_POKER_LATIN_ALLOWLIST) {
    assert.doesNotMatch(token, RU_ORDINARY_ENGLISH_FORBIDDEN, `allowlist must not hide ordinary English: ${token}`);
  }

  const census = { count: 0 };
  const ordinary = practicalDecisions.filter(isOrdinaryLearnerDecision);
  assert.equal(ordinary.length, 870);

  for (const item of ordinary) {
    assertNaturalRuSurface(item.cueRu, `${item.id}/cueRu`, census);
    assertNaturalRuSurface(item.questionRu, `${item.id}/questionRu`, census);
    assertNaturalRuSurface(item.explanationRu, `${item.id}/explanationRu`, census);
    const actions = practicalAssessmentLengthPresentedOptions(item, "action", item.actionOptions);
    const reasons = practicalAssessmentLengthPresentedOptions(item, "reason", item.reasonOptions);
    for (const option of actions) assertNaturalRuSurface(option.textRu, `${item.id}/action/${option.id}`, census);
    for (const option of reasons) assertNaturalRuSurface(option.textRu, `${item.id}/reason/${option.id}`, census);

    for (const action of actions) {
      for (const reason of reasons) {
        const correct = action.id === item.correctActionId && reason.id === item.correctReasonId;
        const feedback = practicalSelectedDecisionFeedback(item, "ru", action.id, reason.id, correct);
        assertNaturalRuSurface(feedback.mechanism, `${item.id}/feedback/${action.id}/${reason.id}/mechanism`, census);
        assertNaturalRuSurface(feedback.boundary, `${item.id}/feedback/${action.id}/${reason.id}/boundary`, census);
        assertNaturalRuSurface(feedback.action?.selectedText, `${item.id}/feedback/${action.id}/${reason.id}/action.selected`, census);
        assertNaturalRuSurface(feedback.action?.correctText, `${item.id}/feedback/${action.id}/${reason.id}/action.correct`, census);
        assertNaturalRuSurface(feedback.reason?.selectedText, `${item.id}/feedback/${action.id}/${reason.id}/reason.selected`, census);
        assertNaturalRuSurface(feedback.reason?.correctText, `${item.id}/feedback/${action.id}/${reason.id}/reason.correct`, census);
      }
    }
  }

  for (const state of allPracticalTableStates) {
    assertNaturalRuSurface(state.revealCueRu, `${state.decisionId}/table/reveal`, census);
    for (const [index, value] of (state.actionsRu ?? state.actions).entries()) {
      assertNaturalRuSurface(value, `${state.decisionId}/table/action/${index}`, census);
    }
    for (const [index, value] of (state.irrelevantCuesRu ?? state.irrelevantCues ?? []).entries()) {
      assertNaturalRuSurface(value, `${state.decisionId}/table/irrelevant/${index}`, census);
    }
  }

  for (const skill of practicalSkillFamilies) {
    const asset = practicalPostQuickStartTeachingAssetForSkill(skill.id);
    if (!asset) continue;
    if (asset.kind === "ANCHOR") {
      for (const field of ["promptRu", "answerRu", "rationaleRu"]) {
        assertNaturalRuSurface(asset.anchor[field], `${skill.id}/teaching/${field}`, census);
      }
    } else if (asset.kind === "SOURCE_BOUND") {
      for (const field of ["situationRu", "mechanismRu", "exampleRu", "boundaryRu"]) {
        assertNaturalRuSurface(asset.teaching[field], `${skill.id}/teaching/${field}`, census);
      }
    } else {
      for (const field of ["defaultRu", "whyRu", "transferCueRu"]) {
        assertNaturalRuSurface(asset.rule[field], `${skill.id}/teaching/${field}`, census);
      }
      for (const [index, value] of (asset.rule.reversalsRu ?? []).entries()) {
        assertNaturalRuSurface(value, `${skill.id}/teaching/reversal/${index}`, census);
      }
    }
  }

  for (const concept of practicalConcepts) {
    for (const [field, value] of Object.entries(concept)) {
      if (field.endsWith("Ru") && typeof value === "string") {
        assertNaturalRuSurface(value, `${concept.id}/concept/${field}`, census);
      }
    }
  }

  for (const [index, step] of firstJourneySteps.entries()) {
    for (const [field, value] of Object.entries(step)) {
      if (field.endsWith("Ru") && typeof value === "string") {
        assertNaturalRuSurface(value, `firstJourney/${index}/${field}`, census);
      }
    }
  }

  assert.equal(census.count, 37869, "RU learner-facing runtime surface census drifted");
});

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

  for (const family of ["BOARD", "RUNOUT", "HAND", "REL"]) {
    const familyRows = rows.filter((item) => item.id.startsWith(`PM-W4-${family}-01-`));
    for (const locale of ["textRu", "textEn"]) {
      const actionC = familyRows.map((item) => item.actionOptions.find((option) => option.id === "c")?.[locale]);
      const reason2 = familyRows.map((item) => item.reasonOptions.find((option) => option.id === "r2")?.[locale]);
      const reason3 = familyRows.map((item) => item.reasonOptions.find((option) => option.id === "r3")?.[locale]);
      assert.ok(actionC.every(Boolean), `${family}/${locale}: action c missing`);
      assert.ok(reason2.every(Boolean), `${family}/${locale}: reason r2 missing`);
      assert.ok(reason3.every(Boolean), `${family}/${locale}: reason r3 missing`);
      assert.equal(new Set(actionC).size, familyRows.length, `${family}/${locale}: action c still reuses a family-local wrong-only template`);
      assert.equal(new Set(reason2).size, familyRows.length, `${family}/${locale}: reason r2 still reuses a family-local wrong-only template`);
      assert.equal(new Set(reason3).size, familyRows.length, `${family}/${locale}: reason r3 still reuses a family-local wrong-only template`);
    }
  }
});

test("all W4 RU action and reason options reject ordinary English syntax outside poker jargon", () => {
  const ordinaryEnglish = /\b(?:nothing|always|means|one|class|owns|itself|matter|removed|must|reassessed|callers?|strong\s+hands?|raises?|range\s+advantage)\b/iu;
  for (const item of practicalDecisions.filter((decision) => decision.skillId.startsWith("W4-"))) {
    for (const option of [...item.actionOptions, ...item.reasonOptions]) {
      assert.doesNotMatch(
        option.textRu,
        ordinaryEnglish,
        `${item.id}/${option.id}: ordinary English syntax remains in RU W4 option`,
      );
    }
  }
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
  assert.equal(c.misconception, "STRONG_HAND_RAISE_AUTOPILOT");
  assert.notEqual(b.misconception, c.misconception);
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

test("scored correct reasons contain mechanism, not a correct-only source-authority marker", () => {
  const affected = [
    "PM-EXP-01-A10-101", "PM-EXP-01-A10-102", "PM-EXP-01-A10-103",
    "PM-EXP-01-A10-104", "PM-EXP-01-A10-107", "PM-EXP-01-A10-108",
    "PM-B3-EXP01-101", "PM-B3-EXP01-102", "PM-B3-EXP01-103", "PM-B3-EXP01-104",
  ];
  const sourceAuthorityMarker = /\bsource materials?\b/iu;
  const reasons = [];
  for (const id of affected) {
    const item = decision(id);
    const reason = correctReason(item);
    assert.ok(reason, `${id}: correct reason missing`);
    assert.doesNotMatch(reason.textEn, sourceAuthorityMarker, `${id}: source-authority marker survived in scored reason`);
    assert.match(reason.textEn, /evidence|observation|confidence|branch|baseline|hypothesis/iu, `${id}: evidence mechanism missing`);
    assert.match(reason.textEn, /deviation|exploit|baseline|scope|branch|global/iu, `${id}: exploit consequence missing`);
    reasons.push(reason.textEn);
  }
  assert.equal(new Set(reasons).size, affected.length, "affected correct reasons collapsed to a new repeated authorial template");

  for (const item of practicalDecisions) {
    for (const option of item.reasonOptions) {
      assert.doesNotMatch(option.textEn, sourceAuthorityMarker, `${item.id}/${option.id}: scored EN reason exposes a source-authority cue`);
    }
  }
});

test("bounded RU presentation layer no longer reintroduces developer-register shorthand", () => {
  const ids = [
    "PM-B4-3BP05-101", "PM-B4-3BP05-102", "PM-B4-3BP05-103", "PM-B4-3BP05-104",
    "PM-B4-BL03-101", "PM-B4-BL03-102", "PM-B4-BL03-103", "PM-B4-BL03-104",
    "PM-BL-06-B1-101", "PM-BL-06-B1-102", "PM-BL-06-B1-103",
  ];
  const forbidden = /\b(?:future branches|low-SPR|auto-commit|fringe|big size|opening mix)\b/iu;
  for (const id of ids) {
    const item = decision(id);
    const reasons = practicalAssessmentLengthPresentedOptions(item, "reason", item.reasonOptions);
    const ru = reasons.map((option) => option.textRu).join("\n");
    assert.doesNotMatch(ru, forbidden, `${id}: bounded RU presentation shorthand remains`);
  }
});

test("B4-RIV01 presented correct reasons use natural RU without hybrid register", () => {
  const ids = ["PM-B4-RIV01-101", "PM-B4-RIV01-102", "PM-B4-RIV01-103", "PM-B4-RIV01-104"];
  const forbidden = /\b(?:Value|size|worse|calls|station)\b/iu;
  for (const id of ids) {
    const item = decision(id);
    const reasons = practicalAssessmentLengthPresentedOptions(item, "reason", item.reasonOptions);
    const correct = reasons.find((option) => option.id === item.correctReasonId);
    assert.ok(correct, `${id}: presented correct reason missing`);
    assert.doesNotMatch(correct.textRu, forbidden, `${id}: hybrid B4-RIV01 reason survived`);
    assert.match(correct.textRu, /вэлью-бета|слабых рук|станция/iu, `${id}: value-call mechanism weakened`);
  }
});

test("the 26 bounded teaching RU surfaces contain no previously enumerated hybrid register", () => {
  const fields = {
    "FND-06": ["mechanismRu"],
    "W4-DRAW-01": ["mechanismRu"],
    "OOP-04": ["mechanismRu"],
    "OOP-05": ["exampleRu"],
    "3BP-04": ["mechanismRu"],
    "4BP-02": ["mechanismRu"],
    "TURN-01": ["mechanismRu", "boundaryRu"],
    "TURN-04": ["mechanismRu", "exampleRu", "boundaryRu"],
    "TURN-05": ["situationRu", "mechanismRu"],
    "RIV-01": ["mechanismRu", "boundaryRu"],
    "MW-04": ["mechanismRu", "exampleRu", "boundaryRu"],
    "MW-05": ["mechanismRu"],
    "DEEP-01": ["situationRu", "mechanismRu", "boundaryRu"],
    "DEEP-04": ["situationRu", "exampleRu"],
    "EXP-02": ["situationRu", "mechanismRu"],
  };
  const forbidden = /\b(?:effective stack|future tree|forced unit|clean outs|nut potential|overlap|domination|showdown value|continues|backdoors|call-all|automatic overfold|sizing|medium-strength|winning routes|top-end|coherent|range relation|hand class|board\/runout|jam\/reopen|surviving ranges|runout|ownership|blank\/scare\/completing|Turn lead|deny free cards|retained range|flop call|high-card-heavy|lead branch|range interaction|exact hand|range-level shift|medium-strength showdown hand|worse continues|uncapped|River value|value tiers|worse calls|likely-best|value region|investment ceiling|transfer|fold equity|frequent strength|players behind|sticky limpers|Suited\/connected|small-pair hand|heads-up pot|multiway branch|continuing regions|bluff supply|HU threshold|future leverage|reverse-implied exposure|deep|nutted|marginal branches|preflop hand family|future stack|second-best pair branches|branch-specific|value sizing|Exploit value|continuing range|deviation|evidence|station)\b/iu;
  let checked = 0;
  for (const [skillId, names] of Object.entries(fields)) {
    const asset = practicalPostQuickStartTeachingAssetForSkill(skillId);
    assert.equal(asset?.kind, "SOURCE_BOUND", `${skillId}: expected source-bound teaching asset`);
    for (const name of names) {
      const value = asset.teaching[name];
      assert.equal(typeof value, "string", `${skillId}/${name}: teaching field missing`);
      assert.doesNotMatch(value, forbidden, `${skillId}/${name}: bounded hybrid register survived`);
      checked += 1;
    }
  }
  assert.equal(checked, 26);
});

test("source-id sanitizer preserves natural teaching grammar and casing", () => {
  for (const skillId of ["FND-03", "FND-07", "PF-03", "PF-07", "PF-08"]) {
    const asset = practicalPostQuickStartTeachingAssetForSkill(skillId);
    assert.equal(asset?.kind, "ANCHOR", `${skillId}: expected anchor teaching asset`);
    assert.match(asset.anchor.rationaleRu, /^[А-ЯЁ]/u, `${skillId}: RU rationale must start with uppercase Cyrillic`);
    assert.doesNotMatch(asset.anchor.rationaleRu, /^материал(?=\s|[,.:;!?])/u, `${skillId}: lowercase sanitizer artifact survived`);
  }
  const relative = practicalPostQuickStartTeachingAssetForSkill("W4-REL-01");
  assert.equal(relative?.kind, "ANCHOR");
  assert.doesNotMatch(relative.anchor.rationaleEn, /\bSource material build decisions\b/u);
  assert.match(relative.anchor.rationaleEn, /\bSource material builds decisions\b/u);
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
