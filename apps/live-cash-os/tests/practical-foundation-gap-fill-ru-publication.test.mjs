import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";
import { practicalDecisionById } from "../content/practical-mastery";

const ids = ["PM-FND-03-001", "PM-FND-06-001", "PM-FND-07-001"];

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

test("Foundation gap-fill publishes three complete natural RU decision projections", () => {
  const decisions = ids.map((id) => practicalDecisionById.get(id));
  decisions.forEach((decision, index) => assert.ok(decision, `missing ${ids[index]}`));
  const learnerText = decisions.flatMap((decision) => [
    decision.cueRu,
    decision.questionRu,
    decision.explanationRu,
    ...decision.actionOptions.map((option) => option.textRu),
    ...decision.reasonOptions.map((option) => option.textRu),
  ]).join("\n");
  const proseWithoutApprovedNotation = learnerText.replace(
    /(?:FTGU-E\d+|LCM-\d+)|\b(?:Hero|EV|SPR)\b/gu,
    "",
  );
  assert.doesNotMatch(proseWithoutApprovedNotation, /[A-Za-z]/u);
});

test("Foundation gap-fill exact RU copy and strategy identities remain locked together", () => {
  const decisions = ids.map((id) => practicalDecisionById.get(id));
  const digest = createHash("sha256")
    .update(JSON.stringify(decisions.map(projection)))
    .digest("hex");
  assert.equal(digest, "5882ab5f80268aa4ffa6b6f7e26027dc9d66ca1c8b569cb2f23d68cf77f09270");
});
