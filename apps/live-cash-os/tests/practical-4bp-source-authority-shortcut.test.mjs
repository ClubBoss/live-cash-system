import test from "node:test";
import assert from "node:assert/strict";
import { practicalDecisions } from "../content/practical-mastery/index.ts";
import { PRACTICAL_4BP_OBJECTIVE_SEMANTIC_REVISION } from "../lib/practical-mastery-core.ts";

const IDS = new Set(Array.from({ length: 4 }, (_, skill) => Array.from({ length: 8 }, (_, i) => `PM-4BP-0${skill + 1}-A7-${101 + i}`)).flat());
const decisions = practicalDecisions.filter((d) => IDS.has(d.id));
const authority = /\b(?:CP-G3-L10|L10|the source|source (?:supports|allows|preserves|gate)|according to the source)\b|(?:по|согласно) источнику|источник (?:поддерживает|разрешает|сохраняет|разделяет)/iu;
const recallFraming = /what (?:does|did) (?:the )?source|which .* (?:does )?(?:the )?source|как .*источник|что .*источник/iu;
const mechanism = /SPR|range|board|hand|family|value|vulnerab|hybrid|check|jam|reopen|stack|branch|size|geometry|compression|protection|EV|диапаз|доск|рук|семейств|велью|уязв|гибрид|чек|пуш|стек|ветк|размер|геометр|сжат|защит|агресс|влож|ответ|SPR/iu;

test("32 rewritten 4BP tasks have no pre-answer source-authority answer key", () => {
  assert.equal(decisions.length, 32);
  for (const d of decisions) {
    const correct = d.reasonOptions.find((r) => r.id === d.correctReasonId);
    assert.ok(correct, d.id);
    assert.doesNotMatch(correct.textEn, authority, `${d.id} EN correct reason`);
    assert.doesNotMatch(correct.textRu, authority, `${d.id} RU correct reason`);
    assert.doesNotMatch(d.questionEn, recallFraming, `${d.id} EN question`);
    assert.doesNotMatch(d.questionRu, recallFraming, `${d.id} RU question`);
    assert.match(`${d.questionEn} ${correct.textEn}`, mechanism, `${d.id} EN mechanism`);
    assert.match(`${d.questionRu} ${correct.textRu}`, mechanism, `${d.id} RU mechanism`);
    assert.ok(d.sourceRefs?.includes("CP-G3-L10"), `${d.id} sourceRefs`);
  }
});

test("authority markers are not balanced into distractors and wrong reasons remain substantive misconceptions", () => {
  for (const d of decisions) for (const r of d.reasonOptions.filter((r) => r.id !== d.correctReasonId)) {
    assert.doesNotMatch(r.textEn, authority, `${d.id}/${r.id} EN distractor`);
    assert.doesNotMatch(r.textRu, authority, `${d.id}/${r.id} RU distractor`);
    assert.ok(r.textEn.trim().split(/\s+/u).length >= 4, `${d.id}/${r.id} EN too thin`);
    assert.ok(r.textRu.trim().split(/\s+/u).length >= 3, `${d.id}/${r.id} RU too thin`);
  }
});

test("RU/EN option topology and scoring identities stay paired", () => {
  for (const d of decisions) {
    assert.equal(d.actionOptions.filter((o) => o.textEn && o.textRu).length, d.actionOptions.length, `${d.id} actions`);
    assert.equal(d.reasonOptions.filter((o) => o.textEn && o.textRu).length, d.reasonOptions.length, `${d.id} reasons`);
    assert.ok(d.actionOptions.some((o) => o.id === d.correctActionId), d.id);
    assert.ok(d.reasonOptions.some((o) => o.id === d.correctReasonId), d.id);
  }
});

test("source-cue copy repair does not change the semantic-generation contract", () => {
  assert.equal(PRACTICAL_4BP_OBJECTIVE_SEMANTIC_REVISION, "4BP_OBJECTIVE_SPECIFIC_V3");
});
