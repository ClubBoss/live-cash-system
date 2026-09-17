import test from "node:test";
import assert from "node:assert/strict";
import { practicalDecisions } from "../content/practical-mastery/index.ts";
import { practicalSkillFamilies } from "../content/practical-mastery/registry.ts";

const SKILLS = ["4BP-01", "4BP-02", "4BP-03", "4BP-04"];
const corpus = practicalDecisions.filter((decision) => SKILLS.includes(decision.skillId));
const expectedFocus = {
  "4BP-01": /SPR|geometr|compress|sizing|branch/i,
  "4BP-02": /hand|family|value|vulnerab|hybrid|blocker/i,
  "4BP-03": /check|protected|passive/i,
  "4BP-04": /jam|reopen|invest|exposure/i,
};

function fullTask(decision, locale) {
  const suffix = locale === "ru" ? "Ru" : "En";
  return JSON.stringify([
    decision[`cue${suffix}`], decision[`question${suffix}`],
    ...decision.actionOptions.map((option) => option[`text${suffix}`]),
    ...decision.reasonOptions.map((option) => option[`text${suffix}`]),
    decision.correctActionId, decision.correctReasonId, decision[`explanation${suffix}`],
  ]);
}

for (const skillId of SKILLS) {
  test(`${skillId} keeps a reachable objective-specific evidence ladder`, () => {
    const decisions = corpus.filter((decision) => decision.skillId === skillId);
    assert.ok(decisions.length >= 8);
    assert.equal(decisions.filter((d) => d.kind === "recognition").length, 2);
    assert.ok(decisions.filter((d) => d.kind === "decision").length >= 3);
    assert.equal(decisions.filter((d) => d.kind === "changed").length, 2);
    assert.ok(decisions.filter((d) => d.kind === "boundary").length >= 1);
    const text = decisions.map((d) => `${d.cueEn} ${d.questionEn} ${d.explanationEn}`).join(" ");
    assert.match(text, expectedFocus[skillId]);
    assert.ok(practicalSkillFamilies.some((skill) => skill.id === skillId));
  });
}

test("4BP evidence cannot claim independence from skillId alone", () => {
  for (const locale of ["ru", "en"]) {
    const seen = new Map();
    for (const decision of corpus) {
      const key = fullTask(decision, locale);
      const previous = seen.get(key);
      assert.ok(!previous || previous.skillId === decision.skillId,
        `${locale}: ${previous?.id ?? "?"} duplicates ${decision.id} across skills`);
      seen.set(key, decision);
    }
  }
});

test("changed 4BP nodes declare causal variables and bilingual tasks stay complete", () => {
  for (const decision of corpus) {
    for (const field of ["cueRu", "cueEn", "questionRu", "questionEn", "explanationRu", "explanationEn"])
      assert.ok(decision[field]?.trim(), `${decision.id}.${field}`);
    assert.equal(new Set(decision.actionOptions.map((o) => o.id)).size, decision.actionOptions.length);
    assert.equal(new Set(decision.reasonOptions.map((o) => o.id)).size, decision.reasonOptions.length);
    assert.ok(decision.actionOptions.some((o) => o.id === decision.correctActionId));
    assert.ok(decision.reasonOptions.some((o) => o.id === decision.correctReasonId));
    if (decision.kind === "changed") assert.ok(decision.changedVariables?.length, decision.id);
  }
});
