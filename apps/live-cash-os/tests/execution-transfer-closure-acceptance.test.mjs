import assert from "node:assert/strict";
import test from "node:test";
import {
  executionTransferClosureDecisions,
  executionTransferClosureAnchors,
} from "../content/practical-mastery/decisions-execution-transfer-closure.ts";

function correctPosition(options, id) {
  return options.findIndex((option) => option.id === id);
}

function counts(values) {
  return [0, 1, 2].map((position) => values.filter((value) => value === position).length);
}

test("execution transfer closure has no mechanical correct-answer position leak", () => {
  assert.equal(executionTransferClosureDecisions.length, 24);
  const actionPositions = executionTransferClosureDecisions.map((decision) => correctPosition(decision.actionOptions, decision.correctActionId));
  const reasonPositions = executionTransferClosureDecisions.map((decision) => correctPosition(decision.reasonOptions, decision.correctReasonId));

  assert.ok(actionPositions.every((position) => position >= 0));
  assert.ok(reasonPositions.every((position) => position >= 0));
  for (const count of counts(actionPositions)) assert.ok(count >= 5, "each action display position must carry at least five correct answers");
  for (const count of counts(reasonPositions)) assert.ok(count >= 5, "each reason display position must carry at least five correct answers");
  assert.ok(executionTransferClosureDecisions.some((_, index) => actionPositions[index] !== reasonPositions[index]), "action and reason correct positions must not be mechanically coupled");
  assert.ok(new Set(actionPositions.map((position, index) => `${position}:${reasonPositions[index]}`)).size >= 6, "correct action/reason position pairs must be materially varied");
});

test("every decision has exactly three action and three reason options with a resolvable correct id", () => {
  for (const decision of executionTransferClosureDecisions) {
    assert.equal(decision.actionOptions.length, 3, `${decision.id}: expected 3 action options`);
    assert.equal(decision.reasonOptions.length, 3, `${decision.id}: expected 3 reason options`);
    assert.ok(decision.actionOptions.some((option) => option.id === decision.correctActionId), `${decision.id}: correctActionId must resolve`);
    assert.ok(decision.reasonOptions.some((option) => option.id === decision.correctReasonId), `${decision.id}: correctReasonId must resolve`);
  }
});

test("decision ids are unique and skillIds only extend already-admitted skill families", () => {
  const ids = executionTransferClosureDecisions.map((decision) => decision.id);
  assert.equal(new Set(ids).size, ids.length, "duplicate decision id");
  const admittedSkillIds = new Set(["BL-06", "BL-09", "BL-10", "DEEP-03", "TURN-01", "TURN-02", "W4-BOARD-01", "W4-REL-01"]);
  for (const decision of executionTransferClosureDecisions) {
    assert.ok(admittedSkillIds.has(decision.skillId), `${decision.id}: unexpected skillId ${decision.skillId}`);
  }
});

test("kind changed decisions carry non-empty changedVariables", () => {
  for (const decision of executionTransferClosureDecisions.filter((d) => d.kind === "changed")) {
    assert.ok(Array.isArray(decision.changedVariables) && decision.changedVariables.length > 0, `${decision.id}: changed decision needs changedVariables`);
  }
});

test("equal-blind section (BL-06/BL-09/BL-10/DEEP-03) rejects standard open/fold transfer and standard BB-defense transfer", () => {
  const equalBlind = executionTransferClosureDecisions.filter((d) => ["BL-06", "BL-09", "BL-10", "DEEP-03"].includes(d.skillId));
  assert.equal(equalBlind.length, 7);
  const visible = equalBlind.flatMap((decision) => [
    decision.cueRu, decision.cueEn, decision.questionRu, decision.questionEn, decision.explanationRu, decision.explanationEn,
    ...decision.actionOptions.flatMap((option) => [option.textRu, option.textEn]),
    ...decision.reasonOptions.flatMap((option) => [option.textRu, option.textEn]),
  ]).join("\n");
  assert.match(visible, /бесплатно чекнуть|free check/i);
  assert.match(visible, /straddle/i);
});

test("board-family and turn-class anti-shortcut invariants are asserted, not just labeled", () => {
  const boardChanged = executionTransferClosureDecisions.filter((d) => d.skillId === "W4-BOARD-01" && d.kind === "changed");
  assert.equal(boardChanged.length, 3);
  const boardVisible = boardChanged.flatMap((d) => [d.explanationRu, d.explanationEn]).join("\n");
  assert.match(boardVisible, /BOARD FAMILY.*ACTION|board family.*(equal|action)/i);

  const turnChanged = executionTransferClosureDecisions.filter((d) => d.skillId === "TURN-01" && d.kind === "changed");
  assert.equal(turnChanged.length, 1);
  assert.match(turnChanged[0].explanationEn, /TURN CLASS/i);
});

test("hand-role bridge (W4-REL-01) never equates hand label with relative role", () => {
  const handRole = executionTransferClosureDecisions.filter((d) => d.skillId === "W4-REL-01");
  assert.equal(handRole.length, 4);
  const visible = handRole.flatMap((decision) => [decision.explanationRu, decision.explanationEn]).join("\n");
  assert.match(visible, /ROLE|роль/i);
});

test("execution transfer closure RU copy excludes confirmed broken hybrids", () => {
  const ru = executionTransferClosureDecisions.flatMap((decision) => [
    ...decision.assumptions,
    decision.cueRu,
    decision.questionRu,
    decision.explanationRu,
    ...decision.actionOptions.map((option) => option.textRu),
    ...decision.reasonOptions.map((option) => option.textRu),
  ]).join("\n");

  for (const forbidden of [
    /distribution stack/i,
    /fancy aggression/i,
    /Profile opponent/i,
    /Branch-specific/i,
    /repair-турн/i,
    /remaining stack/i,
    /strategic reason/i,
    /value target/i,
    /hand role/i,
  ]) assert.doesNotMatch(ru, forbidden);
});

test("the cross-module compression card exists exactly once and warns classification never determines action", () => {
  assert.equal(executionTransferClosureAnchors.length, 1);
  const [card] = executionTransferClosureAnchors;
  assert.equal(card.skillId, "W4-REL-01");
  assert.match(card.answerRu, /не определяет действие/);
  assert.match(card.answerEn, /does not determine the action/);
  assert.match(`${card.answerRu} ${card.answerEn}`, /mainly informs|в основном подсказывает/i);
});

// FPA1-001: the boundary item must describe a genuine blind-vs-blind chop
// (hand terminates by prior agreement before any street is played), never a
// played check-down to showdown. A "true chop" and a "played check-down" are
// different phenomena and must not be conflated in this item.
test("FPA1-001: the chop item describes termination before a strategic branch, not a played check-down", () => {
  const chop = executionTransferClosureDecisions.find((d) => d.id === "PM-BL-06-ETC-103");
  assert.ok(chop, "PM-BL-06-ETC-103 must exist");
  assert.equal(chop.skillId, "BL-06");
  assert.equal(chop.kind, "boundary");

  const visible = [
    chop.cueRu, chop.cueEn, chop.explanationRu, chop.explanationEn,
    ...chop.actionOptions.flatMap((o) => [o.textRu, o.textEn]),
    ...chop.reasonOptions.flatMap((o) => [o.textRu, o.textEn]),
  ].join("\n");

  // Must name the chop mechanism and that it precedes the flop.
  assert.match(visible, /chop/i);
  assert.match(visible, /до флопа|before the flop/i);

  // Must NOT describe a played check-down / showdown split — that is a
  // different phenomenon (a real strategic branch was played, just checked).
  for (const playedCheckdownPhrase of [
    /чекнули банк без единой ставки/i,
    /checked the pot down/i,
    /банк просто раздели/i,
    /pot was simply split/i,
  ]) {
    assert.doesNotMatch(visible, playedCheckdownPhrase, `chop item must not describe a played check-down: ${playedCheckdownPhrase}`);
  }

  // The correct action/reason must state the hand ends before any strategic
  // node — not merely "no bet was made" (which is compatible with a played
  // check-down and would fail to distinguish the two phenomena).
  const correctAction = chop.actionOptions.find((o) => o.id === chop.correctActionId);
  const correctReason = chop.reasonOptions.find((o) => o.id === chop.correctReasonId);
  assert.match(`${correctAction.textRu} ${correctAction.textEn}`, /прежде чем.*(сыгран|played)|before.*(played|actually played)/i);
  assert.match(`${correctReason.textRu} ${correctReason.textEn}`, /под реальным давлением|under real pressure/i);
});

// FPA1-002: the specific hybrid classes found by Fresh Pass #1 (raw English
// nouns stitched into Russian sentences) cannot trivially recur in this file.
test("FPA1-002: RU naturalness firewall covers the newly observed hybrid classes", () => {
  const ru = executionTransferClosureDecisions.flatMap((decision) => [
    decision.cueRu,
    decision.questionRu,
    decision.explanationRu,
    ...decision.actionOptions.map((option) => option.textRu),
    ...decision.reasonOptions.map((option) => option.textRu),
  ]).concat(executionTransferClosureAnchors.flatMap((a) => [a.promptRu, a.answerRu, a.rationaleRu]))
    .join("\n");

  for (const forbidden of [
    /\bancestry\b/i,
    /\bvoluntary raiser\b/i,
    /opponent-evidence/i,
    /Branch-специфичн\w*/i,
    /\bBvB\b/,
    /forced unit/i,
    /\bboost\b/i,
    /\bPAIR\b(?!ED)/,
    /DRAW COMPLETE/i,
    /классификация REPAIR/i,
    /evidence-дисциплина/i,
  ]) assert.doesNotMatch(ru, forbidden, `RU text must not contain the hybrid: ${forbidden}`);
});

// FPA1-003: the confirmed cartoonish distractors (absurd category errors that
// a learner could reject on tone alone, without reasoning about range/
// ownership/history/job) must not recur verbatim. This is a lexical
// tripwire only — it cannot prove plausibility, which was verified by manual
// semantic audit of all 24 decisions (see repair PR description).
test("FPA1-003: confirmed cartoonish distractor phrases do not recur", () => {
  const allOptionsText = executionTransferClosureDecisions
    .flatMap((d) => [...d.actionOptions, ...d.reasonOptions])
    .flatMap((o) => [o.textRu, o.textEn])
    .join("\n");

  for (const cartoonish of [
    /three different suits by themselves make the board low/i,
    /три разные масти сами по себе делают доску низкой/i,
    /having a king automatically makes the board connected/i,
    /наличие короля автоматически делает доску связанной/i,
    /any nine automatically means a check/i,
    /любая карта девятки автоматически означает чек/i,
    /is fixed on the flop and is never revisited/i,
    /фиксируется на флопе и не пересматривается/i,
    /any turn raise always means the nuts regardless of the opponent's history/i,
    /любой терн-рейз всегда означает натсы независимо от истории соперника/i,
  ]) assert.doesNotMatch(allOptionsText, cartoonish, `cartoonish distractor must not recur: ${cartoonish}`);
});

// FPA1R-001: PM-W4-BOARD-01-ETC-103 teaches that the strategic delta between
// the two nodes comes from pot type, arriving-range composition, AND
// aggressor position (node A: BTN aggressor IP; node B: aggressor OOP in a
// deep 3-bet pot). changedVariables previously omitted aggressor_position,
// making the machine-readable metadata causally incomplete relative to what
// the correct action/reason/explanation actually teach.
test("FPA1R-001: PM-W4-BOARD-01-ETC-103 declares aggressor_position as a changed variable", () => {
  const decision = executionTransferClosureDecisions.find((d) => d.id === "PM-W4-BOARD-01-ETC-103");
  assert.ok(decision, "PM-W4-BOARD-01-ETC-103 must exist");
  assert.equal(decision.kind, "changed");
  assert.deepEqual(
    [...decision.changedVariables].sort(),
    ["aggressor_position", "arriving_ranges", "pot_type"],
    "PM-W4-BOARD-01-ETC-103 must declare pot_type, arriving_ranges, and aggressor_position",
  );
});
