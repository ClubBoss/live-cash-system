import assert from "node:assert/strict";
import test from "node:test";
import { practicalAnchors, practicalDecisions } from "../content/practical-mastery/index.ts";

const cyrillic = /[А-Яа-яЁё]/u;
const demonstrated = /\b(?:marginal\s+hand|assumptions?|viable|future\s+action)\b/iu;
const sourceLike = /\b(?:evidence|source|supported|learner|authoring|governance|fingerprint|decisionId|skillId)\b/iu;
const englishGlue = /\b(?:the|a|an|and|or|with|without|against|from|to|of|if|will|have|has|is|are|does|not|than|when|where|while|because|but|by|for|into|after|before|same|more|less|only|can|must|should|be|becomes|remain|remains|changes|change|increases|decreases)\b/iu;

function learnerRows() {
  const rows = [];
  const add = (id, field, text) => {
    if (typeof text === "string" && cyrillic.test(text)) rows.push({ id, field, text });
  };
  for (const decision of practicalDecisions) {
    add(decision.id, "cueRu", decision.cueRu);
    add(decision.id, "questionRu", decision.questionRu);
    add(decision.id, "explanationRu", decision.explanationRu);
    for (const option of decision.actionOptions ?? []) add(decision.id, `action:${option.id}`, option.textRu);
    for (const option of decision.reasonOptions ?? []) add(decision.id, `reason:${option.id}`, option.textRu);
  }
  for (const anchor of practicalAnchors) {
    for (const field of ["titleRu", "bodyRu", "promptRu", "answerRu", "rationaleRu"]) add(anchor.id, field, anchor[field]);
  }
  return rows;
}

function defects(rows) {
  return rows.filter(({ text }) => demonstrated.test(text) || sourceLike.test(text) || englishGlue.test(text));
}

test("V7 post-blind governed RU malformed/hybrid learner class has zero runtime survivors", () => {
  const rows = learnerRows();
  const failures = defects(rows);
  assert.equal(rows.length, 7274, "Reachable Cyrillic learner-row denominator changed; re-census the governed class deliberately");
  assert.deepEqual(failures, [], `V7 RU naturalness class regressed:\n${failures.map((row) => `${row.id}:${row.field}: ${row.text}`).join("\n")}`);
  console.log(`V7_POSTBLIND_RU_NATURALNESS rows=${rows.length} defects=${failures.length}`);
});

test("V7 demonstrated Blind Beta examples are absent while poker-native terminology remains available", () => {
  const text = learnerRows().map((row) => row.text).join("\n");
  for (const forbidden of [/marginal hand/iu, /assumptions?/iu, /\bviable\b/iu, /future action/iu]) {
    assert.doesNotMatch(text, forbidden);
  }
  for (const pokerNative of [/\bBB\b/u, /\bBTN\b/u, /\bEV\b/u, /\bSPR\b/u, /3-бет/iu]) {
    assert.match(text, pokerNative, `Poker-native term disappeared: ${pokerNative}`);
  }
});
