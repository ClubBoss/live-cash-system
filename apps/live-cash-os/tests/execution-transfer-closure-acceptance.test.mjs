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
