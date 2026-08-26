import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { variationB3Decisions } from "../content/practical-mastery/decisions-variation-b3.ts";
import { practicalDecisionFeedbackCopy } from "../content/practical-mastery/practical-decision-feedback-copy.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const EXPECTED_B3_MACHINE_FINGERPRINT = "972715ee618c11b34f9db422b8feff715a2c37c0f1055ecda5741b8ec70e3c3c";

function familyKey(id) {
  return id.replace(/-\d+$/, "");
}

function correctActionText(decision, locale) {
  const option = decision.actionOptions.find((entry) => entry.id === decision.correctActionId);
  assert.ok(option, `${decision.id}: missing correct action option`);
  return locale === "ru" ? option.textRu : option.textEn;
}

function directDecisionFor(decision) {
  return variationB3Decisions.find(
    (candidate) => candidate.kind === "decision" && familyKey(candidate.id) === familyKey(decision.id),
  );
}

function missingCausalChain(decision, locale) {
  const direct = directDecisionFor(decision);
  if (!direct) return true;
  const copy = practicalDecisionFeedbackCopy(decision);
  const mechanism = locale === "ru" ? copy.mechanismRu : copy.mechanismEn;
  const cue = locale === "ru" ? decision.cueRu : decision.cueEn;
  const explanation = locale === "ru" ? decision.explanationRu : decision.explanationEn;
  const direction = correctActionText(direct, locale);
  return !mechanism.includes(cue)
    || !mechanism.includes(direction)
    || !mechanism.includes(explanation);
}

const changed = variationB3Decisions.filter(
  (decision) => decision.kind === "changed" && (decision.changedVariables?.length ?? 0) > 0,
);

test("all 40 governed B3 changed-variable decisions publish change -> direction -> causal why in RU and EN", () => {
  assert.equal(changed.length, 40, "governed B3 changed-node census drifted");
  assert.equal(new Set(changed.map((decision) => familyKey(decision.id))).size, 20, "expected two changed nodes in each of 20 B3 families");

  for (const locale of ["ru", "en"]) {
    const residual = changed.filter((decision) => missingCausalChain(decision, locale));
    assert.deepEqual(
      residual.map((decision) => decision.id),
      [],
      `${locale}: every changed node must include its concrete change, family direction, and causal explanation`,
    );
  }
});

test("B3 decision corpus machine fingerprint is byte-for-byte semantically unchanged", () => {
  const actual = createHash("sha256").update(JSON.stringify(variationB3Decisions)).digest("hex");
  assert.equal(actual, EXPECTED_B3_MACHINE_FINGERPRINT);
});

test("generated changed-node feedback remains scoped to governed B3 metadata", () => {
  const representative = changed.find((decision) => decision.id === "PM-B3-PF01-103");
  assert.ok(representative);
  const copy = practicalDecisionFeedbackCopy(representative);
  assert.match(copy.mechanismEn, /^What changed:/);
  assert.match(copy.mechanismEn, /Strategic consequence:/);
  assert.match(copy.mechanismEn, /Why the action changes or stays:/);
  assert.match(copy.mechanismRu, /^Что изменилось:/);
  assert.match(copy.mechanismRu, /Стратегическое следствие:/);
  assert.match(copy.mechanismRu, /Почему действие меняется или сохраняется:/);

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
