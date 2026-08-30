import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";
import { practicalDecisionById } from "../content/practical-mastery";

const ids = ["01", "02", "03", "06"].flatMap((skill) =>
  Array.from({ length: 7 }, (_, index) => `PM-FND-${skill}-${101 + index}`),
);

function projection(decision) {
  return {
    id: decision.id,
    cueRu: decision.cueRu,
    questionRu: decision.questionRu,
    explanationRu: decision.explanationRu,
    actionOptions: decision.actionOptions.map((option) => [option.id, option.textRu, option.misconception ?? null]),
    reasonOptions: decision.reasonOptions.map((option) => [option.id, option.textRu, option.misconception ?? null]),
    correctActionId: decision.correctActionId,
    correctReasonId: decision.correctReasonId,
    sourceRefs: decision.sourceRefs,
  };
}

test("Foundation expansion publishes 28 complete natural RU decision projections", () => {
  const decisions = ids.map((id) => practicalDecisionById.get(id));
  assert.equal(decisions.length, 28);
  decisions.forEach((decision, index) => assert.ok(decision, `missing ${ids[index]}`));

  const learnerText = decisions.flatMap((decision) => [
    decision.cueRu,
    decision.questionRu,
    decision.explanationRu,
    ...decision.actionOptions.map((option) => option.textRu),
    ...decision.reasonOptions.map((option) => option.textRu),
  ]).join("\n");
  const proseWithoutApprovedNotation = learnerText.replace(
    /(?:FTGU-E\d+|LCM-\d+)|\b(?:Hero|EV|IP|OOP|SPR|BB)\b|(?<=\d)bb\b/gu,
    "",
  );
  assert.doesNotMatch(proseWithoutApprovedNotation, /[A-Za-z]/u);
  assert.doesNotMatch(learnerText, /\b(?:equity|pot odds|implied odds|call|fold|hand|range|stack|tree|future|price|depth|position|villain)\b/iu);
});

test("Foundation expansion exact RU copy and strategy identities remain locked together", () => {
  const decisions = ids.map((id) => practicalDecisionById.get(id));
  const digest = createHash("sha256")
    .update(JSON.stringify(decisions.map(projection)))
    .digest("hex");
  assert.equal(digest, "03c553e21f56dcfb7cc30cc622d750ff7147b2bedc9dc8ed57905fcf24e80d0c");
});
