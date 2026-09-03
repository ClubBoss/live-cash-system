import assert from "node:assert/strict";
import test from "node:test";
import { practicalAnchors, practicalDecisions, practicalRules } from "../content/practical-mastery/index.ts";

const cyrillic = /[А-Яа-яЁё]/u;
const demonstrated = /\b(?:marginal\s+hand|assumptions?|viable|future\s+action)\b/iu;
const sourceLike = /\b(?:evidence|source|supported|learner|authoring|governance|fingerprint|decisionId|skillId)\b/iu;
const englishGlue = /\b(?:the|a|an|and|or|with|without|against|from|to|of|if|will|have|has|is|are|does|not|than|when|where|while|because|but|by|for|into|after|before|same|more|less|only|can|must|should|be|becomes|remain|remains|changes|change|increases|decreases)\b/iu;
const knownMalformed = /\brelevante\b/iu;
const unexpectedLatinProse = /\b[A-Za-z][A-Za-z-]{2,}\b/u;
const acceptedPokerTerms = [
  /\bHero\b/giu,
  /\bBB\b/giu,
  /\bSB\b/giu,
  /\bBTN\b/giu,
  /\bCO\b/giu,
  /\bHJ\b/giu,
  /\bEP\b/giu,
  /\bIP\b/giu,
  /\bOOP\b/giu,
  /\bEV\b/giu,
  /\bSPR\b/giu,
  /\bPFR\b/giu,
  /\bc-bet\b/giu,
  /A(?:-|\u2011|\u2013)high/giu,
];
const practicalRuleRuFields = ["triggerRu", "defaultRu", "whyRu", "amplifiersRu", "reversalsRu", "transferCueRu"];

function decisionAnchorRows() {
  const rows = [];
  const add = (id, field, text) => {
    if (typeof text === "string") rows.push({ id, field, text });
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

function practicalRuleRows() {
  const rows = [];
  const add = (id, field, text) => {
    if (typeof text === "string") rows.push({ id, field, text });
  };
  for (const rule of practicalRules) {
    add(rule.id, "triggerRu", rule.triggerRu);
    add(rule.id, "defaultRu", rule.defaultRu);
    add(rule.id, "whyRu", rule.whyRu);
    for (const [index, text] of rule.amplifiersRu.entries()) add(rule.id, `amplifiersRu:${index}`, text);
    for (const [index, text] of rule.reversalsRu.entries()) add(rule.id, `reversalsRu:${index}`, text);
    add(rule.id, "transferCueRu", rule.transferCueRu);
  }
  return rows;
}

function stripAcceptedPokerTerms(text) {
  return acceptedPokerTerms.reduce((value, term) => value.replace(term, ""), text);
}

function legacyDefects(rows) {
  return rows.filter(({ text }) => {
    const governedText = stripAcceptedPokerTerms(text);
    return cyrillic.test(text) && (demonstrated.test(governedText) || sourceLike.test(governedText) || englishGlue.test(governedText));
  });
}

function practicalRuleDefects(rows) {
  return rows.filter(({ text }) => {
    const governedText = stripAcceptedPokerTerms(text);
    return (
      knownMalformed.test(governedText) ||
      demonstrated.test(governedText) ||
      sourceLike.test(governedText) ||
      englishGlue.test(governedText) ||
      unexpectedLatinProse.test(governedText)
    );
  });
}

test("V7 post-blind governed RU decision/anchor malformed-hybrid class remains closed", () => {
  const rows = decisionAnchorRows();
  const failures = legacyDefects(rows);
  const cyrillicRows = rows.filter(({ text }) => cyrillic.test(text)).length;
  assert.equal(rows.length, 7813, "Reachable RU decision/anchor denominator changed; re-census the governed class deliberately");
  assert.deepEqual(failures, [], `V7 RU naturalness class regressed:\n${failures.map((row) => `${row.id}:${row.field}: ${row.text}`).join("\n")}`);
  console.log(`V7_POSTBLIND_RU_NATURALNESS rows=${rows.length} cyrillicRows=${cyrillicRows} defects=${failures.length}`);
});

test("EDU-P2-01 governs the complete PracticalRule RU publication projection", () => {
  const rows = practicalRuleRows();
  const failures = practicalRuleDefects(rows);
  assert.equal(practicalRules.length, 11, "PracticalRule census changed; re-census the governed RU publication class deliberately");
  assert.equal(practicalRules.length * practicalRuleRuFields.length, 66, "PracticalRule RU field-family census changed");
  assert.equal(rows.length, 96, "PracticalRule RU learner-string census changed; re-census arrays deliberately");
  assert.deepEqual(failures, [], `PracticalRule RU publication class regressed:\n${failures.map((row) => `${row.id}:${row.field}: ${row.text}`).join("\n")}`);
  console.log(`EDU_P2_01_PRACTICAL_RULES rules=${practicalRules.length} fields=66 rows=${rows.length} defects=${failures.length}`);
});

test("V7 demonstrated Blind Beta examples are absent while poker-native terminology remains available", () => {
  const text = decisionAnchorRows().map((row) => row.text).join("\n");
  for (const forbidden of [/marginal hand/iu, /assumptions?/iu, /\bviable\b/iu, /future action/iu]) {
    assert.doesNotMatch(text, forbidden);
  }
  for (const pokerNative of [/\bBB\b/u, /\bBTN\b/u, /\bEV\b/u, /\bSPR\b/u, /3-бет/iu]) {
    assert.match(text, pokerNative, `Poker-native term disappeared: ${pokerNative}`);
  }
});
