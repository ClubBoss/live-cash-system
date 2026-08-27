import assert from "node:assert/strict";
import test from "node:test";
import { practicalDecisions } from "../content/practical-mastery/index.ts";
import { practicalDecisionFeedbackCopy } from "../content/practical-mastery/practical-decision-feedback-copy.ts";
import { practicalSelectedDecisionFeedback } from "../lib/practical-selected-decision-feedback.ts";

function decisionById(id) {
  const decision = practicalDecisions.find((candidate) => candidate.id === id);
  assert.ok(decision, `missing decision ${id}`);
  return decision;
}

function optionByMisconception(options, misconception) {
  const option = options.find((candidate) => candidate.misconception === misconception);
  assert.ok(option, `missing misconception ${misconception}`);
  return option;
}

function correctAction(decision) {
  const option = decision.actionOptions.find((candidate) => candidate.id === decision.correctActionId);
  assert.ok(option, `missing correct action for ${decision.id}`);
  return option;
}

function correctReason(decision) {
  const option = decision.reasonOptions.find((candidate) => candidate.id === decision.correctReasonId);
  assert.ok(option, `missing correct reason for ${decision.id}`);
  return option;
}

function diagnose(decision, locale, actionId, reasonId) {
  return practicalSelectedDecisionFeedback(decision, locale, actionId, reasonId, false);
}

const blindDefense = decisionById("PM-BL-03-103");
const threeBet = decisionById("PM-BL-05-105");

test("PM-BL-03-103 ANY_TWO gets bounded any-two causal repair in RU and EN", () => {
  const anyTwo = optionByMisconception(blindDefense.actionOptions, "ANY_TWO");
  const reason = correctReason(blindDefense);
  const en = diagnose(blindDefense, "en", anyTwo.id, reason.id);
  const ru = diagnose(blindDefense, "ru", anyTwo.id, reason.id);

  assert.equal(en.action?.selectedText, anyTwo.textEn);
  assert.equal(ru.action?.selectedText, anyTwo.textRu);
  assert.match(en.mechanism, /discount is not infinite/i);
  assert.match(en.mechanism, /equity the hand can actually realize/i);
  assert.match(en.boundary ?? "", /domination, rake/i);
  assert.match(en.boundary ?? "", /defense boundary/i);
  assert.match(ru.mechanism, /скидка не бесконечна/i);
  assert.match(ru.mechanism, /equity, которое рука реально сможет реализовать/i);
  assert.match(ru.boundary ?? "", /доминация, рейк/i);
  assert.match(ru.boundary ?? "", /границы защиты/i);
});

test("PM-BL-03-103 RANGE_ABSOLUTE shares one coherent causal repair", () => {
  const action = correctAction(blindDefense);
  const rangeAbsolute = optionByMisconception(blindDefense.reasonOptions, "RANGE_ABSOLUTE");
  const anyTwo = optionByMisconception(blindDefense.actionOptions, "ANY_TWO");
  const reason = correctReason(blindDefense);
  const rangeFeedback = diagnose(blindDefense, "en", action.id, rangeAbsolute.id);
  const anyTwoFeedback = diagnose(blindDefense, "en", anyTwo.id, reason.id);
  const bothFeedback = diagnose(blindDefense, "en", anyTwo.id, rangeAbsolute.id);

  assert.equal(rangeFeedback.reason?.selectedText, rangeAbsolute.textEn);
  assert.equal(rangeFeedback.mechanism, anyTwoFeedback.mechanism);
  assert.equal(rangeFeedback.boundary, anyTwoFeedback.boundary);
  assert.equal(bothFeedback.mechanism, anyTwoFeedback.mechanism);
  assert.equal(bothFeedback.boundary, anyTwoFeedback.boundary);
});

test("PM-BL-03-103 normal overfold misconception keeps generic decision feedback", () => {
  const overfold = optionByMisconception(blindDefense.actionOptions, "SHOWDOWN_EQUITY_OVERFOLD");
  const reason = correctReason(blindDefense);
  const generic = practicalDecisionFeedbackCopy(blindDefense);
  const feedback = diagnose(blindDefense, "en", overfold.id, reason.id);

  assert.equal(feedback.action?.selectedText, overfold.textEn);
  assert.equal(feedback.mechanism, generic.mechanismEn);
  assert.equal(feedback.boundary, generic.boundaryEn ?? null);
});

test("PM-BL-05-105 FILTERING_IGNORED explains the filtered continuing branch", () => {
  const filteringIgnored = optionByMisconception(threeBet.actionOptions, "FILTERING_IGNORED");
  const reason = correctReason(threeBet);
  const en = diagnose(threeBet, "en", filteringIgnored.id, reason.id);
  const ru = diagnose(threeBet, "ru", filteringIgnored.id, reason.id);

  assert.equal(en.action?.selectedText, filteringIgnored.textEn);
  assert.equal(ru.action?.selectedText, filteringIgnored.textRu);
  assert.match(en.mechanism, /branch is filtered/i);
  assert.match(en.mechanism, /stronger, more selected subset/i);
  assert.match(en.boundary ?? "", /actual continuing branch/i);
  assert.match(en.boundary ?? "", /unfiltered opening range/i);
  assert.match(ru.mechanism, /ветка уже отфильтрована/i);
  assert.match(ru.mechanism, /более сильная, отобранная часть диапазона/i);
  assert.match(ru.boundary ?? "", /фактической ветки продолжения/i);
  assert.match(ru.boundary ?? "", /неотфильтрованного диапазона открытия/i);
});

test("PM-BL-05-105 FILTERING_BACKWARDS gets the same causal family repair", () => {
  const action = correctAction(threeBet);
  const filteringBackwards = optionByMisconception(threeBet.reasonOptions, "FILTERING_BACKWARDS");
  const filteringIgnored = optionByMisconception(threeBet.actionOptions, "FILTERING_IGNORED");
  const reason = correctReason(threeBet);
  const backwardsFeedback = diagnose(threeBet, "en", action.id, filteringBackwards.id);
  const ignoredFeedback = diagnose(threeBet, "en", filteringIgnored.id, reason.id);
  const bothFeedback = diagnose(threeBet, "en", filteringIgnored.id, filteringBackwards.id);

  assert.equal(backwardsFeedback.reason?.selectedText, filteringBackwards.textEn);
  assert.equal(backwardsFeedback.mechanism, ignoredFeedback.mechanism);
  assert.equal(backwardsFeedback.boundary, ignoredFeedback.boundary);
  assert.equal(bothFeedback.mechanism, ignoredFeedback.mechanism);
  assert.equal(bothFeedback.boundary, ignoredFeedback.boundary);
});

test("unrelated Practical decision keeps the generic feedback unchanged", () => {
  const unrelated = practicalDecisions.find((candidate) =>
    candidate.id !== "PM-BL-03-103"
    && candidate.id !== "PM-BL-05-105"
    && candidate.actionOptions.some((option) => option.id !== candidate.correctActionId),
  );
  assert.ok(unrelated, "fixture requires an unrelated decision with a wrong action");
  const wrongAction = unrelated.actionOptions.find((option) => option.id !== unrelated.correctActionId);
  const reason = correctReason(unrelated);
  assert.ok(wrongAction);
  const generic = practicalDecisionFeedbackCopy(unrelated);
  const feedback = diagnose(unrelated, "ru", wrongAction.id, reason.id);

  assert.equal(feedback.action?.selectedText, wrongAction.textRu);
  assert.equal(feedback.mechanism, generic.mechanismRu);
  assert.equal(feedback.boundary, generic.boundaryRu ?? null);
});
