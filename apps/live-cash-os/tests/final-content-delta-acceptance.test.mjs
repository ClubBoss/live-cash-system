import assert from "node:assert/strict";
import test from "node:test";
import { finalContentDeltaDecisions } from "../content/practical-mastery/decisions-final-content-delta.ts";

function correctPosition(options, id) {
  return options.findIndex((option) => option.id === id);
}

function counts(values) {
  return [0, 1, 2].map((position) => values.filter((value) => value === position).length);
}

test("final content delta has no mechanical correct-answer position leak", () => {
  assert.equal(finalContentDeltaDecisions.length, 17);
  const actionPositions = finalContentDeltaDecisions.map((decision) => correctPosition(decision.actionOptions, decision.correctActionId));
  const reasonPositions = finalContentDeltaDecisions.map((decision) => correctPosition(decision.reasonOptions, decision.correctReasonId));

  assert.ok(actionPositions.every((position) => position >= 0));
  assert.ok(reasonPositions.every((position) => position >= 0));
  for (const count of counts(actionPositions)) assert.ok(count >= 4, "each action display position must carry at least four correct answers");
  for (const count of counts(reasonPositions)) assert.ok(count >= 4, "each reason display position must carry at least four correct answers");
  assert.ok(finalContentDeltaDecisions.some((_, index) => actionPositions[index] !== reasonPositions[index]), "action and reason correct positions must not be mechanically coupled");
  assert.ok(new Set(actionPositions.map((position, index) => `${position}:${reasonPositions[index]}`)).size >= 6, "correct action/reason position pairs must be materially varied");
});

test("FND-06 final geometry teaches equal pot fractions, not equal absolute stack split", () => {
  const geometry = finalContentDeltaDecisions.filter((decision) => decision.skillId === "FND-06");
  assert.equal(geometry.length, 6);
  const visible = geometry.flatMap((decision) => [
    decision.cueRu,
    decision.cueEn,
    decision.questionRu,
    decision.questionEn,
    decision.explanationRu,
    decision.explanationEn,
    ...decision.actionOptions.flatMap((option) => [option.textRu, option.textEn]),
    ...decision.reasonOptions.flatMap((option) => [option.textRu, option.textEn]),
  ]).join("\n");
  assert.doesNotMatch(visible, /remaining stack roughly evenly|распределить.*остат.*примерно поровну/i);
  assert.match(visible, /SPR=2x\+2x²/);
  assert.match(visible, /0[,.]618/);
  assert.match(visible, /SPR=4[^\n]*x=1|SPR=4, x=1/);
});

test("final content delta RU copy excludes confirmed broken hybrids", () => {
  const ru = finalContentDeltaDecisions.flatMap((decision) => [
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
