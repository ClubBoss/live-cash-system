import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { variationB3Decisions } from "../content/practical-mastery/decisions-variation-b3.ts";
import {
  b3ChangedVariableCausalEffect,
  practicalDecisionFeedbackCopy,
} from "../content/practical-mastery/practical-decision-feedback-copy.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const EXPECTED_B3_MACHINE_FINGERPRINT = "5cbcd796aab6023999c44a1c64737268eff679e067b01da6d993c63e18af6870";
const EXPECTED_B3_FULL_CORPUS_FINGERPRINT = "972715ee618c11b34f9db422b8feff715a2c37c0f1055ecda5741b8ec70e3c3c";

function familyKey(id) {
  return id.replace(/-\d+$/, "");
}

function correctActionText(decision, locale) {
  const option = decision.actionOptions.find((entry) => entry.id === decision.correctActionId);
  assert.ok(option, `${decision.id}: missing correct action option`);
  return locale === "ru" ? option.textRu : option.textEn;
}

function correctReasonText(decision, locale) {
  const option = decision.reasonOptions.find((entry) => entry.id === decision.correctReasonId);
  assert.ok(option, `${decision.id}: missing correct reason option`);
  return locale === "ru" ? option.textRu : option.textEn;
}

function directDecisionFor(decision) {
  return variationB3Decisions.find(
    (candidate) => candidate.kind === "decision" && familyKey(candidate.id) === familyKey(decision.id),
  );
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

function missingCausalChain(decision, locale) {
  const direct = directDecisionFor(decision);
  if (!direct) return true;
  const copy = practicalDecisionFeedbackCopy(decision);
  const mechanism = locale === "ru" ? copy.mechanismRu : copy.mechanismEn;
  const cue = locale === "ru" ? decision.cueRu : decision.cueEn;
  const direction = correctActionText(direct, locale);
  const effects = [...new Set(decision.changedVariables.map((variable) => b3ChangedVariableCausalEffect(variable, locale)))];
  return !mechanism.includes(cue)
    || !mechanism.includes(direction)
    || effects.some((effect) => !effect || !mechanism.includes(effect))
    || nearEcho(mechanism, correctReasonText(decision, locale));
}

function machineProjection(decision) {
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

const changed = variationB3Decisions.filter(
  (decision) => decision.kind === "changed" && (decision.changedVariables?.length ?? 0) > 0,
);

test("all 40 governed B3 changed-variable decisions publish change -> direction -> variable-causal why in RU and EN", () => {
  assert.equal(changed.length, 40, "governed B3 changed-node census drifted");
  assert.equal(new Set(changed.map((decision) => familyKey(decision.id))).size, 20, "expected two changed nodes in each of 20 B3 families");

  for (const decision of changed) {
    for (const variable of decision.changedVariables) {
      assert.ok(b3ChangedVariableCausalEffect(variable, "ru"), `${decision.id}: unmapped RU changed variable ${variable}`);
      assert.ok(b3ChangedVariableCausalEffect(variable, "en"), `${decision.id}: unmapped EN changed variable ${variable}`);
    }
  }

  for (const locale of ["ru", "en"]) {
    const residual = changed.filter((decision) => missingCausalChain(decision, locale));
    assert.deepEqual(
      residual.map((decision) => decision.id),
      [],
      `${locale}: every changed node must include its concrete change, family direction, mapped causal effect, and no scored-reason echo`,
    );
  }
});

test("B3 machine and full-corpus fingerprints remain unchanged", () => {
  const machine = createHash("sha256")
    .update(JSON.stringify(variationB3Decisions.map(machineProjection)))
    .digest("hex");
  const full = createHash("sha256").update(JSON.stringify(variationB3Decisions)).digest("hex");
  assert.equal(machine, EXPECTED_B3_MACHINE_FINGERPRINT);
  assert.equal(full, EXPECTED_B3_FULL_CORPUS_FINGERPRINT);
});

test("generated changed-node feedback remains scoped to governed B3 metadata", () => {
  const representative = changed.find((decision) => decision.id === "PM-B3-PF01-103");
  assert.ok(representative);
  const copy = practicalDecisionFeedbackCopy(representative);
  assert.match(copy.mechanismEn, /^What changed:/);
  assert.match(copy.mechanismEn, /Strategic consequence:/);
  assert.match(copy.mechanismEn, /Why this changes or preserves the action:/);
  assert.match(copy.mechanismRu, /^Что изменилось:/);
  assert.match(copy.mechanismRu, /Стратегическое следствие:/);
  assert.match(copy.mechanismRu, /Почему это меняет или сохраняет действие:/);

  const recognition = variationB3Decisions.find((decision) => decision.id === "PM-B3-PF01-101");
  assert.ok(recognition);
  const recognitionCopy = practicalDecisionFeedbackCopy(recognition);
  assert.doesNotMatch(recognitionCopy.mechanismEn, /^What changed:/);
  assert.doesNotMatch(recognitionCopy.mechanismRu, /^Что изменилось:/);
});

test("wrong-answer correction contract remains present in PracticalDecisionFeedback", async () => {
  const source = await readFile(path.join(root, "components/PracticalDecisionFeedback.tsx"), "utf8");
  assert.match(source, /data-practical-correct-answer/);
  assert.match(source, /Correct action:/);
  assert.match(source, /Correct reason:/);
  assert.match(source, /Правильное действие:/);
  assert.match(source, /Правильная причина:/);
});
