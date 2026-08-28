import assert from "node:assert/strict";
import test from "node:test";
import { practicalDecisionById } from "../content/practical-mastery/index.ts";
import { sanitizeLearnerPresentationText } from "../lib/learner-presentation-firewall.ts";

// BBG-03: Quick Start Step 1 (PM-FND-01-001, PM-FND-01-101) and the immediately
// following same-topic item (PM-FND-01-102) demonstrated malformed
// English-in-Russian hybrid grammar: raw English compounds standing in for
// Russian phrasing ("price-only EV", "break-even threshold", "profitable",
// "runouts", "majority equity", bare "position"), some of it colliding with
// the learner-presentation firewall's evidence-ID substitution. This closes
// that demonstrated, commonly-reachable class without rewriting the corpus.

const forbiddenHybrid = /\bprice-only\b|\bbreak-even threshold\b|\bprofitable\b|\brunouts?\b|\bmajority equity\b|\bfrom\s+position\b|только\s+от\s+position\b/iu;

function decisionRuStrings(id) {
  const decision = practicalDecisionById.get(id);
  assert.ok(decision, `missing governed decision ${id}`);
  return [
    decision.cueRu,
    decision.questionRu,
    decision.explanationRu,
    ...decision.actionOptions.map((option) => option.textRu),
    ...decision.reasonOptions.map((option) => option.textRu),
  ].filter((value) => typeof value === "string");
}

test("BBG-03 closes the demonstrated Quick Start Step 1 malformed RU/EN hybrid class", () => {
  for (const id of ["PM-FND-01-001", "PM-FND-01-101", "PM-FND-01-102"]) {
    const strings = decisionRuStrings(id);
    for (const text of strings) {
      assert.doesNotMatch(text, forbiddenHybrid, `${id}: still contains demonstrated hybrid-grammar defect: "${text}"`);
    }
  }
});

test("BBG-03 fix preserves decision identity, correct answers and scoring for the repaired items", () => {
  const expected = {
    "PM-FND-01-101": { correctActionId: "a", correctReasonId: "r1" },
    "PM-FND-01-102": { correctActionId: "a", correctReasonId: "r1" },
  };
  for (const [id, { correctActionId, correctReasonId }] of Object.entries(expected)) {
    const decision = practicalDecisionById.get(id);
    assert.equal(decision.correctActionId, correctActionId);
    assert.equal(decision.correctReasonId, correctReasonId);
    assert.equal(decision.actionOptions.map((o) => o.id).sort().join(","), "a,b,c");
    assert.equal(decision.reasonOptions.map((o) => o.id).sort().join(","), "r1,r2,r3");
  }
  const misconceptions = practicalDecisionById.get("PM-FND-01-102").reasonOptions.find((o) => o.id === "r3");
  assert.equal(misconceptions.misconception, "POSITION_ONLY", "wrong-option misconception tag must survive the wording fix");
});

test("BBG-03 fixed strings still render naturally after the learner-presentation firewall (RU and EN)", () => {
  const explanation101 = practicalDecisionById.get("PM-FND-01-101").explanationRu;
  const sanitizedRu = sanitizeLearnerPresentationText(explanation101, "ru");
  assert.match(sanitizedRu, /^Проверенные данные вводят pot odds как порог безубыточности/u, sanitizedRu);
  assert.doesNotMatch(sanitizedRu, forbiddenHybrid);

  const explanation102 = practicalDecisionById.get("PM-FND-01-102").explanationRu;
  const sanitizedRu102 = sanitizeLearnerPresentationText(explanation102, "ru");
  assert.match(sanitizedRu102, /^Проверенные данные показывают/u, sanitizedRu102);
});
