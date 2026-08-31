import assert from "node:assert/strict";
import test from "node:test";
import { integratedA11ExpansionDecisions } from "../content/practical-mastery/decisions-integrated-a11-expansion.ts";
import { integratedMasteryDecisions } from "../content/practical-mastery/decisions-w14.ts";
import {
  applyIntegratedA11W14RuPublication,
  integratedA11W14RuPublicationOwnedIds,
} from "../content/practical-mastery/practical-ru-systemic-integrated-a11-w14-publication.ts";

const EXPECTED_IDS = Object.freeze([
  "PM-INT-01-A11-101", "PM-INT-01-A11-102", "PM-INT-01-A11-103", "PM-INT-01-A11-104", "PM-INT-01-A11-105", "PM-INT-01-A11-106", "PM-INT-01-A11-107", "PM-INT-01-A11-108", "PM-INT-01-001",
  "PM-INT-02-A11-101", "PM-INT-02-A11-102", "PM-INT-02-A11-103", "PM-INT-02-A11-104", "PM-INT-02-A11-105", "PM-INT-02-A11-106", "PM-INT-02-A11-107", "PM-INT-02-A11-108", "PM-INT-02-001",
  "PM-INT-03-A11-101", "PM-INT-03-A11-102", "PM-INT-03-A11-103", "PM-INT-03-A11-104", "PM-INT-03-A11-105", "PM-INT-03-A11-106", "PM-INT-03-A11-107", "PM-INT-03-A11-108", "PM-INT-03-001",
  "PM-INT-04-A11-101", "PM-INT-04-A11-102", "PM-INT-04-A11-103", "PM-INT-04-A11-104", "PM-INT-04-A11-105", "PM-INT-04-A11-106", "PM-INT-04-A11-107", "PM-INT-04-A11-108", "PM-INT-04-001",
  "PM-INT-05-A11-101", "PM-INT-05-A11-102", "PM-INT-05-A11-103", "PM-INT-05-A11-104", "PM-INT-05-A11-105", "PM-INT-05-A11-106", "PM-INT-05-A11-107", "PM-INT-05-A11-108", "PM-INT-05-001",
]);
const EXPECTED_SET = new Set(EXPECTED_IDS);
const RAW = [...integratedA11ExpansionDecisions, ...integratedMasteryDecisions].filter((decision) => EXPECTED_SET.has(decision.id));
const RAW_BEFORE = structuredClone(RAW);
const PUBLISHED = RAW.map(applyIntegratedA11W14RuPublication);
const BY_ID = new Map(PUBLISHED.map((decision) => [decision.id, decision]));
const ACTIVE_FIELDS_PER_DECISION = 9;
const ALLOWED_LATIN = new Set(["EV", "IP", "OOP", "SPR", "BB", "SB", "BTN", "CO", "HJ", "UTG", "EP"]);

function ruStrings(decision) {
  return [decision.cueRu, decision.questionRu, decision.explanationRu, ...decision.actionOptions.map((option) => option.textRu), ...decision.reasonOptions.map((option) => option.textRu)];
}

function machineSnapshot(decision) {
  return {
    id: decision.id,
    skillId: decision.skillId,
    kind: decision.kind,
    sourceRefs: decision.sourceRefs,
    assumptions: decision.assumptions,
    changedVariables: decision.changedVariables,
    correctActionId: decision.correctActionId,
    correctReasonId: decision.correctReasonId,
    targetSeconds: decision.targetSeconds,
    cueEn: decision.cueEn,
    questionEn: decision.questionEn,
    explanationEn: decision.explanationEn,
    actionOptions: decision.actionOptions.map(({ id, textEn, misconception }) => ({ id, textEn, misconception })),
    reasonOptions: decision.reasonOptions.map(({ id, textEn, misconception }) => ({ id, textEn, misconception })),
  };
}

// Bounded to the source-reference/skill-routing code shapes demonstrated in the
// owned 45-decision corpus (e.g. "FTGU-E05", "LCM-08", "SLC-M02-L21", "CP-G3-L09",
// "W4-BOARD-01", "OOP-01", and the shared-prefix shorthand "FTGU-E05/E06"). RU
// publication legitimately drops these citation/routing codes from learner-facing
// copy (see assertNoSourceId), so their embedded digits are not genuine
// learner-visible poker quantities and must not be compared as numeric semantics.
const CITATION_CODE = /\b(?:FTGU|LCM|SLC|CP|PM|PF|BL|RIV|FND|TURN|W4|MW|DEEP|EXP|OOP|3BP|4BP)-[A-Z0-9-]+(?:\/[A-Z0-9-]+)*\b/giu;

function numericTokens(text) {
  return String(text)
    .replace(CITATION_CODE, " ")
    .replace(/\b[345](?:BP|[ -]?bet)\b/giu, " ")
    .replace(/[345]-?бет/giu, " ")
    .match(/\d+(?:[.,]\d+)?/gu)?.map((token) => token.replace(",", ".")) ?? [];
}

function assertNumericPair(en, ru, label) {
  assert.deepEqual(numericTokens(ru), numericTokens(en), `${label}: numeric semantics changed`);
}

function assertNoOrdinaryEnglish(text, label) {
  for (const token of text.match(/[A-Za-z]+/g) ?? []) {
    assert.ok(ALLOWED_LATIN.has(token), `${label}: ordinary-English residual "${token}" in "${text}"`);
  }
}

function assertNoSourceId(text, label) {
  assert.doesNotMatch(text, /\b(?:FTGU|LCM|SLC|CP|PM|PF|BL|RIV|FND|TURN|W4|MW|DEEP|EXP|3BP|4BP)-[A-Z0-9-]+\b/giu, `${label}: learner-visible source/skill ID residual`);
}

test("A11/W14 ownership is frozen at 45 decisions, 0 anchors and 405 active RU fields", () => {
  assert.equal(integratedA11ExpansionDecisions.length, 40, "current A11 expansion authority count drifted");
  assert.equal(integratedMasteryDecisions.length, 5, "current W14 native authority count drifted");
  assert.equal(RAW.length, 45);
  assert.deepEqual(RAW.map((decision) => decision.id).sort(), [...EXPECTED_IDS].sort());
  assert.deepEqual([...integratedA11W14RuPublicationOwnedIds].sort(), [...EXPECTED_IDS].sort());
  assert.equal(EXPECTED_IDS.filter((id) => id.includes("ANCHOR")).length, 0, "OWNED_ANCHORS must remain zero");
  assert.equal(RAW.length * ACTIVE_FIELDS_PER_DECISION, 405);
  assert.equal(EXPECTED_IDS.filter((id) => !integratedA11W14RuPublicationOwnedIds.includes(id)).length, 0, "UNCLASSIFIED must be zero");
  assert.equal(integratedA11W14RuPublicationOwnedIds.filter((id) => !EXPECTED_SET.has(id)).length, 0, "REVIEW must be zero");
});

test("projection changes only learner-facing RU copy and preserves machine/scoring/EN identity", () => {
  for (let index = 0; index < RAW.length; index += 1) {
    const raw = RAW[index];
    const published = PUBLISHED[index];
    assert.deepEqual(machineSnapshot(published), machineSnapshot(raw), `${raw.id}: machine identity changed`);
    assert.deepEqual(published.actionOptions.map((option) => option.id), raw.actionOptions.map((option) => option.id));
    assert.deepEqual(published.reasonOptions.map((option) => option.id), raw.reasonOptions.map((option) => option.id));
  }
  assert.deepEqual(RAW, RAW_BEFORE, "raw authority inputs were mutated");
});

test("projection is deterministic, idempotent and unmapped-pass-through", () => {
  for (const published of PUBLISHED) {
    assert.deepEqual(applyIntegratedA11W14RuPublication(published), published, `${published.id}: projection is not idempotent`);
  }
  for (const id of ["PM-A7-SENTINEL", "PM-A8-SENTINEL", "PM-A9-SENTINEL", "PM-A10-SENTINEL", "PM-B1-SENTINEL", "PM-B3-SENTINEL", "PM-B4-SENTINEL", "PM-PERCEPTUAL-SENTINEL", "PM-EXECUTABLE-SENTINEL"]) {
    const sentinel = { ...RAW[0], id };
    assert.equal(applyIntegratedA11W14RuPublication(sentinel), sentinel, `${id}: ownership leakage`);
  }
});

test("all 405 learner-facing RU fields are mapped, natural-script clean and source-ID clean", () => {
  let activeFields = 0;
  for (const decision of PUBLISHED) {
    const fields = ruStrings(decision);
    assert.equal(fields.length, ACTIVE_FIELDS_PER_DECISION, `${decision.id}: field count drift`);
    for (const text of fields) {
      assert.equal(typeof text, "string");
      assert.ok(text.trim().length > 0, `${decision.id}: empty RU field`);
      assertNoOrdinaryEnglish(text, decision.id);
      assertNoSourceId(text, decision.id);
      activeFields += 1;
    }
  }
  assert.equal(activeFields, 405);
});

test("numericTokens firewall: genuine quantities survive, source-citation digits do not", () => {
  assert.deepEqual(numericTokens("100bb"), ["100"]);
  assert.deepEqual(numericTokens("33%"), ["33"]);
  assert.deepEqual(numericTokens("2.5"), ["2.5"]);
  assert.deepEqual(numericTokens("1.5bb"), ["1.5"]);
  assert.deepEqual(numericTokens("3-bet to 12bb"), ["12"]);
  assert.deepEqual(numericTokens("open to 2.5x with 40bb effective"), ["2.5", "40"]);

  assert.deepEqual(numericTokens("FTGU-E05"), []);
  assert.deepEqual(numericTokens("FTGU-E05/E06 show why BB and SB do not share one defense identity."), []);
  assert.deepEqual(numericTokens("LCM-08"), []);
  assert.deepEqual(numericTokens("SLC-M02-L21"), []);
  assert.deepEqual(numericTokens("CP-G3-L09"), []);
  assert.deepEqual(numericTokens("W4-BOARD-01 + OOP-01"), []);
  assert.deepEqual(numericTokens("PF-04 + BL-04"), []);

  assert.deepEqual(numericTokens("FTGU-E05/E06 river call at 33% pot with 12bb behind"), ["33", "12"]);
});

test("genuine learner-visible numeric semantics survive RU publication", () => {
  for (let index = 0; index < RAW.length; index += 1) {
    const raw = RAW[index];
    const published = PUBLISHED[index];
    assertNumericPair(raw.cueEn, published.cueRu, `${raw.id}:cue`);
    assertNumericPair(raw.questionEn, published.questionRu, `${raw.id}:question`);
    assertNumericPair(raw.explanationEn, published.explanationRu, `${raw.id}:explanation`);
    for (const option of raw.actionOptions) {
      assertNumericPair(option.textEn, published.actionOptions.find((candidate) => candidate.id === option.id).textRu, `${raw.id}:action:${option.id}`);
    }
    for (const option of raw.reasonOptions) {
      assertNumericPair(option.textEn, published.reasonOptions.find((candidate) => candidate.id === option.id).textRu, `${raw.id}:reason:${option.id}`);
    }
  }
});

test("INT-01 preserves topic-hidden mechanism selection", () => {
  const native = BY_ID.get("PM-INT-01-001");
  const hidden = BY_ID.get("PM-INT-01-A11-108");
  assert.match(native.explanationRu, /тема скрыта/u);
  assert.match(native.reasonOptions.find((option) => option.id === "r1").textRu, /игровой ситуации/u);
  assert.match(hidden.actionOptions.find((option) => option.id === "good").textRu, /^Нет/u);
  assert.match(hidden.explanationRu, /распознать.*механизм.*покерной ситуации/u);
});

test("INT-02 preserves material changed-node transfer and rejects wording-only action changes", () => {
  const native = BY_ID.get("PM-INT-02-001");
  const wordingOnly = BY_ID.get("PM-INT-02-A11-108");
  assert.deepEqual(native.changedVariables, ["position", "closing_action", "players_behind"]);
  assert.match(native.explanationRu, /позиция.*закрытие торговли.*игрок позади/u);
  assert.match(wordingOnly.actionOptions.find((option) => option.id === "good").textRu, /^Нет/u);
  assert.match(wordingOnly.explanationRu, /формулировка сама по себе не создаёт новый покерный узел/u);
});

test("river price sets the threshold but never creates bluff supply", () => {
  for (const id of ["PM-INT-01-A11-105", "PM-INT-03-A11-104", "PM-INT-05-A11-104"]) {
    const text = ruStrings(BY_ID.get(id)).join(" ");
    assert.match(text, /Цена задаёт|Пот-оддсы задают/u, `${id}: price-threshold proposition missing`);
    assert.match(text, /не создаёт блефы/u, `${id}: bluff-supply firewall missing`);
    assert.doesNotMatch(text, /(?:цена|пот-оддсы) созда(?:ёт|ют) блефы/iu);
  }
});

test("INT-03 preserves causal mistake-family repair", () => {
  const native = BY_ID.get("PM-INT-03-001");
  assert.match(native.explanationRu, /устойчивую причинную ошибку/u);
  assert.match(native.reasonOptions.find((option) => option.id === "r1").textRu, /повторяющемуся механизму ошибки/u);
  assert.doesNotMatch(native.explanationRu, /последн(?:ий|его) урок/u);
});

test("INT-04 preserves delayed non-identical retrieval and transfer", () => {
  const native = BY_ID.get("PM-INT-04-001");
  const exactRepeat = BY_ID.get("PM-INT-04-A11-105");
  assert.match(native.explanationRu, /Отсроченная неидентичная проверка/u);
  assert.match(native.reasonOptions.find((option) => option.id === "r1").textRu, /заново построить/u);
  assert.match(exactRepeat.actionOptions.find((option) => option.id === "good").textRu, /^Нет/u);
  assert.match(exactRepeat.explanationRu, /не доказывает.*перенос/u);
});

test("INT-05 preserves causal real-hand routing and rejects loss-size-to-tilt routing", () => {
  const native = BY_ID.get("PM-INT-05-001");
  const largeLoss = BY_ID.get("PM-INT-05-A11-108");
  assert.match(native.explanationRu, /по механизму решения, а не по размеру проигрыша/u);
  assert.match(largeLoss.actionOptions.find((option) => option.id === "good").textRu, /^Нет/u);
  assert.match(largeLoss.explanationRu, /большой проигрыш сам по себе не доказывает ни тильт, ни стратегическую ошибку/u);
});
