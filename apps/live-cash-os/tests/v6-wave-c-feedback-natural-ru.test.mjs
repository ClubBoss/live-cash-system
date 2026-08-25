import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { practicalDecisionById, practicalDecisions } from "../content/practical-mastery/index.ts";
import { variationB3Decisions } from "../content/practical-mastery/decisions-variation-b3.ts";
import { practicalDecisionFeedbackCopy } from "../content/practical-mastery/practical-decision-feedback-copy.ts";
import { practicalRuCorpusPublicationOverrides } from "../content/practical-mastery/practical-ru-corpus-publication.ts";
import { applyPracticalRuFinalPolish } from "../content/practical-mastery/practical-ru-final-polish.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const representativeIds = ["PM-BL-01-106", "PM-OOP-01-106", "PM-TURN-02-A8-106", "PM-RIV-01-A8-106"];
const B3_MACHINE_FINGERPRINT = "5cbcd796aab6023999c44a1c64737268eff679e067b01da6d993c63e18af6870";

const unnaturalRuPatterns = [
  /небольшой открытие/giu,
  /преимущество диапазона сконцентрирован(?![А-Яа-яЁё])/giu,
  /концентрированный преимущество/giu,
  /расширение диапазон(?![А-Яа-яЁё])/giu,
  /визуальный упрощённое правило/giu,
  /обычного холодный коллер/giu,
  /часть коллы/giu,
  /лишение эквити equity BB/giu,
  /с избыточный фолд/giu,
  /больший стек-к-банк отношение/giu,
  /реализаци(?:и|ю) одномастный коннекторы/giu,
  /позиция рейзер(?![А-Яа-яЁё])/giu,
  /(?:больше|меньше)\s+[А-Яа-яЁё-]+ых\s+сохранившиеся\s+комбинации/giu,
  /избирательный\s+доски\s+требуют/giu,
  /убира(?:ют|ет)\s+[А-Яа-яЁё-]*ые\s+кандидаты(?![А-Яа-яЁё])/giu,
  /конкретными\s+ран-ауты(?![А-Яа-яЁё])/giu,
];

const verifierMorphologyFamilies = [
  { id: "position-raiser", pattern: /позиция рейзер(?![А-Яа-яЁё])/iu },
  { id: "weak-surviving-combos", pattern: /(?:больше|меньше)\s+[А-Яа-яЁё-]+ых\s+сохранившиеся\s+комбинации/iu },
  { id: "selective-boards", pattern: /избирательный\s+доски\s+требуют/iu },
  { id: "weak-candidates-case", pattern: /убира(?:ют|ет)\s+[А-Яа-яЁё-]*ые\s+кандидаты(?![А-Яа-яЁё])/iu },
  { id: "specific-runouts-case", pattern: /конкретными\s+ран-ауты(?![А-Яа-яЁё])/iu },
];

function machineProjection(decision) {
  return {
    id: decision.id,
    skillId: decision.skillId,
    kind: decision.kind,
    sourceRefs: decision.sourceRefs,
    assumptions: decision.assumptions,
    actionIds: decision.actionOptions.map((option) => option.id),
    reasonIds: decision.reasonOptions.map((option) => option.id),
    actionMisconceptions: decision.actionOptions.map((option) => option.misconception ?? null),
    reasonMisconceptions: decision.reasonOptions.map((option) => option.misconception ?? null),
    correctActionId: decision.correctActionId,
    correctReasonId: decision.correctReasonId,
    targetSeconds: decision.targetSeconds,
    changedVariables: decision.changedVariables ?? null,
  };
}

function b3MachineProjection(decision) {
  return {
    id: decision.id,
    skillId: decision.skillId,
    kind: decision.kind,
    sourceRefs: decision.sourceRefs,
    actionIds: decision.actionOptions.map((option) => option.id),
    reasonIds: decision.reasonOptions.map((option) => option.id),
    actionMisconceptions: decision.actionOptions.map((option) => option.misconception ?? null),
    reasonMisconceptions: decision.reasonOptions.map((option) => option.misconception ?? null),
    correctActionId: decision.correctActionId,
    correctReasonId: decision.correctReasonId,
    targetSeconds: decision.targetSeconds,
    changedVariables: decision.changedVariables ?? null,
  };
}

function fingerprint(decisions, projection = machineProjection) {
  return createHash("sha256").update(JSON.stringify(decisions.map(projection))).digest("hex");
}

function scoredRuFields(decision) {
  return [
    decision.cueRu,
    decision.questionRu,
    decision.explanationRu,
    ...decision.actionOptions.map((option) => option.textRu),
    ...decision.reasonOptions.map((option) => option.textRu),
  ];
}

function normalizedTeachingText(text) {
  return text.toLocaleLowerCase("ru-RU").replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

function nearEcho(left, right) {
  const a = normalizedTeachingText(left);
  const b = normalizedTeachingText(right);
  if (!a || !b) return false;
  if (a === b || a.includes(b) || b.includes(a)) return true;
  const aTokens = new Set(a.split(" ").filter((token) => token.length >= 3));
  const bTokens = new Set(b.split(" ").filter((token) => token.length >= 3));
  if (!aTokens.size || !bTokens.size) return false;
  let shared = 0;
  for (const token of aTokens) if (bTokens.has(token)) shared += 1;
  return shared / Math.min(aTokens.size, bTokens.size) >= 0.82;
}

function correctReasonText(decision, locale) {
  const reason = decision.reasonOptions.find((option) => option.id === decision.correctReasonId);
  assert.ok(reason, `${decision.id} must resolve its correct reason`);
  return locale === "ru" ? reason.textRu : reason.textEn;
}

test("representative feedback adds mechanism plus boundary without echoing the scored reason", () => {
  for (const id of representativeIds) {
    const decision = practicalDecisionById.get(id);
    assert.ok(decision, `${id} must resolve in runtime content`);
    const feedback = practicalDecisionFeedbackCopy(decision);
    const correctReason = decision.reasonOptions.find((option) => option.id === decision.correctReasonId);
    assert.equal(feedback.curated, true, `${id} should use the compact V6 feedback contract`);
    assert.match(feedback.mechanismRu, /^Ключевой сигнал/u);
    assert.match(feedback.mechanismEn, /^Key signal/u);
    assert.ok(feedback.boundaryRu?.trim(), `${id} needs a useful RU boundary`);
    assert.ok(feedback.boundaryEn?.trim(), `${id} needs a useful EN boundary`);
    assert.notEqual(feedback.mechanismRu.trim(), correctReason?.textRu.trim(), `${id} RU feedback must not be a pure reason echo`);
    assert.notEqual(feedback.mechanismEn.trim(), correctReason?.textEn.trim(), `${id} EN feedback must not be a pure reason echo`);
  }
});

test("B3 feedback echo census closes all 80 decisions in RU and EN", () => {
  assert.equal(variationB3Decisions.length, 80, "B3 governed class must remain exactly 80 decisions");

  let exactBeforeRu = 0;
  let exactBeforeEn = 0;
  let nearBeforeRu = 0;
  let nearBeforeEn = 0;
  let nearAfterRu = 0;
  let nearAfterEn = 0;

  for (const rawDecision of variationB3Decisions) {
    const rawReasonRu = correctReasonText(rawDecision, "ru");
    const rawReasonEn = correctReasonText(rawDecision, "en");
    if (normalizedTeachingText(rawDecision.explanationRu) === normalizedTeachingText(rawReasonRu)) exactBeforeRu += 1;
    if (normalizedTeachingText(rawDecision.explanationEn) === normalizedTeachingText(rawReasonEn)) exactBeforeEn += 1;
    if (nearEcho(rawDecision.explanationRu, rawReasonRu)) nearBeforeRu += 1;
    if (nearEcho(rawDecision.explanationEn, rawReasonEn)) nearBeforeEn += 1;

    const runtimeDecision = practicalDecisionById.get(rawDecision.id);
    assert.ok(runtimeDecision, `${rawDecision.id} must resolve in runtime content`);
    const feedback = practicalDecisionFeedbackCopy(runtimeDecision);
    assert.equal(feedback.curated, true, `${rawDecision.id} must use the governed B3 feedback composition`);
    assert.ok(feedback.boundaryRu?.trim(), `${rawDecision.id} must add a RU boundary`);
    assert.ok(feedback.boundaryEn?.trim(), `${rawDecision.id} must add an EN boundary`);
    if (nearEcho(feedback.mechanismRu, correctReasonText(runtimeDecision, "ru"))) nearAfterRu += 1;
    if (nearEcho(feedback.mechanismEn, correctReasonText(runtimeDecision, "en"))) nearAfterEn += 1;
  }

  assert.equal(exactBeforeRu, 80);
  assert.equal(exactBeforeEn, 80);
  assert.equal(nearBeforeRu, 80);
  assert.equal(nearBeforeEn, 80);
  assert.equal(nearAfterRu, 0, "B3 RU feedback must add teaching value beyond the scored reason");
  assert.equal(nearAfterEn, 0, "B3 EN feedback must add teaching value beyond the scored reason");
  console.log(`V6_WAVE_C_B3_ECHO decisions=80 exact_before_ru=${exactBeforeRu} exact_before_en=${exactBeforeEn} near_before_ru=${nearBeforeRu} near_before_en=${nearBeforeEn} near_after_ru=${nearAfterRu} near_after_en=${nearAfterEn}`);
});

test("B3 scoring and machine identity remain unchanged while feedback presentation changes", () => {
  assert.equal(fingerprint(variationB3Decisions, b3MachineProjection), B3_MACHINE_FINGERPRINT);
  const before = fingerprint(variationB3Decisions, b3MachineProjection);
  for (const decision of variationB3Decisions) {
    const runtimeDecision = practicalDecisionById.get(decision.id);
    assert.ok(runtimeDecision);
    practicalDecisionFeedbackCopy(runtimeDecision);
  }
  const after = fingerprint(variationB3Decisions, b3MachineProjection);
  assert.equal(after, before);
  console.log(`V6_WAVE_C_B3_MACHINE_FINGERPRINT=${after}`);
});

test("feedback lookup is presentation-only and leaves representative machine identity unchanged", () => {
  const decisions = representativeIds.map((id) => practicalDecisionById.get(id)).filter(Boolean);
  assert.equal(decisions.length, representativeIds.length);
  const before = fingerprint(decisions);
  for (const decision of decisions) practicalDecisionFeedbackCopy(decision);
  const after = fingerprint(decisions);
  assert.equal(after, before);
  console.log(`V6_WAVE_C_FEEDBACK_MACHINE_FINGERPRINT=${after}`);
});

test("wrong-answer feedback keeps the explicit corrective answer before deeper teaching copy", async () => {
  const component = await readFile(path.join(root, "components/PracticalDecisionFeedback.tsx"), "utf8");
  assert.match(component, /!correct/);
  assert.match(component, /data-practical-correct-answer/);
  assert.match(component, /Правильное действие:/u);
  assert.match(component, /Правильная причина:/u);
  assert.match(component, /data-practical-feedback-mechanism/);
  assert.match(component, /data-practical-feedback-boundary/);
});

test("bounded Russian agreement/case pattern family is absent across the runtime Practical corpus", () => {
  const failures = [];
  for (const decision of practicalDecisions) {
    for (const text of scoredRuFields(decision)) {
      for (const pattern of unnaturalRuPatterns) {
        pattern.lastIndex = 0;
        if (pattern.test(text)) failures.push(`${decision.id}: ${text}`);
      }
    }
  }
  assert.deepEqual(failures, [], `Practical RU publication corpus still contains repaired agreement/case artifacts:\n${failures.join("\n")}`);
});

test("verifier RU morphology family has a raw publication census and zero runtime survivors", () => {
  const rawPublication = [...practicalRuCorpusPublicationOverrides.values()];
  const runtimeRu = practicalDecisions.flatMap(scoredRuFields);
  const before = {};
  const after = {};

  for (const family of verifierMorphologyFamilies) {
    before[family.id] = rawPublication.filter((text) => family.pattern.test(text)).length;
    after[family.id] = runtimeRu.filter((text) => family.pattern.test(text)).length;
    assert.ok(before[family.id] >= 1, `${family.id} must remain represented in the raw pre-polish publication census`);
    assert.equal(after[family.id], 0, `${family.id} must have zero learner-facing runtime survivors`);
  }

  const beforeTotal = Object.values(before).reduce((sum, count) => sum + count, 0);
  const afterTotal = Object.values(after).reduce((sum, count) => sum + count, 0);
  assert.ok(beforeTotal >= verifierMorphologyFamilies.length);
  assert.equal(afterTotal, 0);
  console.log(`V6_WAVE_C_RU_MORPHOLOGY before_total=${beforeTotal} after_total=${afterTotal} before=${JSON.stringify(before)} after=${JSON.stringify(after)}`);
});

test("RU final polish fixes same-template siblings idempotently without changing scoring or machine fields", () => {
  const malformed = {
    id: "TEST-RU-NATURALNESS",
    skillId: "BL-01",
    kind: "decision",
    sourceRefs: ["FTGU-E05"],
    assumptions: ["presentation-only fixture"],
    cueRu: "Небольшой открытие; через день меняются позиция рейзер и сайзинг.",
    cueEn: "Small open; one day later the raiser position and size change.",
    questionRu: "Почему Избирательный доски требуют пересчёта?",
    questionEn: "Why do selective boards require recomputation?",
    actionOptions: [
      { id: "good", textRu: "Больше слабых сохранившиеся комбинации", textEn: "More weak surviving combinations" },
      { id: "bad", textRu: "Концентрированный преимущество диапазона.", textEn: "Concentrated range advantage.", misconception: "FIXTURE" },
    ],
    reasonOptions: [
      { id: "why", textRu: "Избирательные узлы убирают слабые кандидаты на давление.", textEn: "Selective nodes remove weak pressure candidates." },
      { id: "badR", textRu: "Играть как обычного холодный коллер.", textEn: "Play like an ordinary cold caller.", misconception: "FIXTURE" },
    ],
    correctActionId: "good",
    correctReasonId: "why",
    explanationRu: "Лид создаётся конкретными ран-ауты; не бороться с избыточный фолд и не путать реализацию одномастный коннекторы.",
    explanationEn: "The lead is created by specific runouts; do not overreact to overfolding or confuse suited-connector realization.",
    targetSeconds: 20,
    changedVariables: ["opening_range"],
  };
  const before = createHash("sha256").update(JSON.stringify(machineProjection(malformed))).digest("hex");
  const polished = applyPracticalRuFinalPolish(malformed);
  const repolished = applyPracticalRuFinalPolish(polished);
  const after = createHash("sha256").update(JSON.stringify(machineProjection(polished))).digest("hex");
  const afterTwice = createHash("sha256").update(JSON.stringify(machineProjection(repolished))).digest("hex");
  assert.equal(after, before);
  assert.equal(afterTwice, before);
  assert.deepEqual(scoredRuFields(repolished), scoredRuFields(polished), "publication polish must be idempotent on learner RU fields");
  const ru = scoredRuFields(polished).join("\n");
  for (const pattern of unnaturalRuPatterns) {
    pattern.lastIndex = 0;
    assert.doesNotMatch(ru, pattern);
  }
  assert.match(ru, /небольшое открытие/iu);
  assert.match(ru, /позиция рейзера/iu);
  assert.match(ru, /избирательные доски требуют/iu);
  assert.match(ru, /больше слабых сохранившихся комбинаций/iu);
  assert.match(ru, /убирают слабых кандидатов/iu);
  assert.match(ru, /конкретными ран-аутами/iu);
  assert.match(ru, /реализацию одномастных коннекторов/iu);
});
