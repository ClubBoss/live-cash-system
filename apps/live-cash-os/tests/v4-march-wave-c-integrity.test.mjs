import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { practicalDecisions } from "../content/practical-mastery/index.ts";
import { variationB3Decisions } from "../content/practical-mastery/decisions-variation-b3.ts";
import { practicalSourceGapBySkillId } from "../content/practical-mastery/source-gaps.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relative) => readFile(path.join(root, relative), "utf8");
const B3_BEFORE_MALFORMED_FIELD_INSTANCES = 700;
const B3_MACHINE_FINGERPRINT = "5cbcd796aab6023999c44a1c64737268eff679e067b01da6d993c63e18af6870";

const mixedAuthoringPatterns = [
  /\bmaterial variable\b/iu,
  /\bmarginal branch\b/iu,
  /\bpractical branch\b/iu,
  /\bexact hand\b/iu,
  /\bsource[- ]backed\b/iu,
  /\bsource reason\b/iu,
  /\bsource default\b/iu,
  /\bplayers behind\b/iu,
  /\bclosing action\b/iu,
  /\barriv(?:al|ing) ranges?\b/iu,
  /\bcredible bluff supply\b/iu,
  /\baction ancestry\b/iu,
  /\brelevant threshold\b/iu,
  /\bone strategy transfers\b/iu,
  /\bdoes not affect EV\b/iu,
];

const allowedPokerTokenPattern = /\b(?:RFI|HJ|BTN|CO|LJ|UTG|EP|MP|SB|BB|IP|OOP|SPR|EV|Hero|fold|call|raise|value|bluff|equity|solver|course|live|straddle|effective|physical|showdown|blocker|unblocker|probe|multiway|heads-up|three-way|river|turn|flop|pot odds)\b/giu;
const handNotationPattern = /\b(?:[2-9TJQKA]{2}[so]?|[2-9TJQKA][2-9TJQKA][so]?)\b/gu;

function scoredRuFields(decision) {
  return [
    decision.cueRu,
    decision.questionRu,
    decision.explanationRu,
    ...decision.actionOptions.map((option) => option.textRu),
    ...decision.reasonOptions.map((option) => option.textRu),
  ];
}

function looksLikeFullEnglishSentence(text) {
  const stripped = text
    .replace(/\b(?:3-bet|4-bet|c-bet|bet-call|check-back|A-high|showdown value|reverse implied odds|fold leverage)\b/giu, " ")
    .replace(allowedPokerTokenPattern, " ")
    .replace(handNotationPattern, " ")
    .replace(/\b\d+(?:\.\d+)?bb\b/giu, " ")
    .replace(/[^A-Za-zА-Яа-яЁё]+/gu, " ")
    .trim();
  const englishWords = stripped.match(/\b[A-Za-z]{3,}\b/gu) ?? [];
  return !/[А-Яа-яЁё]/u.test(stripped) && englishWords.length >= 3;
}

function malformedRuFields(decisions) {
  const failures = [];
  for (const decision of decisions) {
    for (const [index, text] of scoredRuFields(decision).entries()) {
      if (!text) continue;
      const authoringPattern = mixedAuthoringPatterns.find((pattern) => pattern.test(text));
      if (looksLikeFullEnglishSentence(text) || authoringPattern) failures.push(`${decision.id}[${index}] :: ${text}`);
    }
  }
  return failures;
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

function fingerprint(decisions) {
  return createHash("sha256").update(JSON.stringify(decisions.map(machineProjection))).digest("hex");
}

test("reachable RU scored corpus rejects full-English sentences and mixed authoring phrases", () => {
  const allFields = practicalDecisions.flatMap(scoredRuFields).filter(Boolean);
  const failures = malformedRuFields(practicalDecisions);
  assert.deepEqual(failures, [], `reachable RU scored corpus contains malformed publication copy:\n${failures.join("\n")}`);
  console.log(`WAVE_C_RU_CORPUS reachable_fields=${allFields.length} malformed_after=${failures.length}`);
});

test("B3 publication repair covers all 80 decisions without changing machine/scoring identity", () => {
  assert.equal(variationB3Decisions.length, 80);
  const fields = variationB3Decisions.flatMap(scoredRuFields).filter(Boolean);
  assert.equal(fields.length, 720, "every B3 decision must expose nine scored RU learner fields");
  const failures = malformedRuFields(variationB3Decisions);
  assert.deepEqual(failures, [], `B3 RU publication copy still malformed:\n${failures.join("\n")}`);
  assert.equal(fingerprint(variationB3Decisions), B3_MACHINE_FINGERPRINT, "B3 machine/scoring identity changed while repairing presentation copy");
  assert.equal(new Set(variationB3Decisions.map((decision) => decision.id)).size, 80);
  console.log(`WAVE_C_B3 decisions=80 ru_fields=720 malformed_before=${B3_BEFORE_MALFORMED_FIELD_INSTANCES} malformed_after=${failures.length} machine_fingerprint=${B3_MACHINE_FINGERPRINT}`);
});

test("source-gap machine truth remains raw while learner presentation is natural", () => {
  const gap = practicalSourceGapBySkillId.get("BL-11");
  assert.ok(gap);
  assert.match(gap.reason, /^B1 located public evidence/u);
  assert.match(gap.nextEvidenceNeeded, /^POSITIVE_EV_SOURCE_ACCESS_REQUIRED:/u);
  for (const text of [gap.learnerReason, gap.learnerNextEvidenceNeeded, gap.learnerReasonRu, gap.learnerNextEvidenceNeededRu]) {
    assert.doesNotMatch(text, /\b(?:B1|POSITIVE_EV_SOURCE_ACCESS_REQUIRED|sourceRefs)\b/u);
  }
});

test("normal learner components render titles and learner-safe copy instead of machine identifiers", async () => {
  const study = await read("components/PracticalStudyLoopExperience.tsx");
  const mastery = await read("components/PracticalMasteryExperience.tsx");
  const guard = await read("components/PracticalLearnerPresentationGuard.tsx");

  const forbiddenStudySites = [
    /recommendedSkill\.id\}\s*·/u,
    /sourceRefs\.join/u,
    /skill\?\.id/u,
    /FTGU E30/u,
    /PLAYER DEVELOPMENT · C1/u,
    /SOURCE-BACKED LOOP/u,
  ];
  for (const pattern of forbiddenStudySites) assert.doesNotMatch(study, pattern);
  assert.match(study, /recommendedSkill\.titleRu/);
  assert.match(study, /Your saved session note/);
  assert.match(study, /field neither replaces it nor updates automatically/);

  assert.match(mastery, /gap\.learnerReasonRu : gap\.learnerReason/);
  assert.match(mastery, /gap\.learnerNextEvidenceNeededRu : gap\.learnerNextEvidenceNeeded/);
  assert.doesNotMatch(mastery, /gap\.reasonRu : gap\.reason/);
  assert.doesNotMatch(mastery, /gap\.nextEvidenceNeededRu : gap\.nextEvidenceNeeded/);

  assert.match(guard, /machineMetadataPatterns/);
  assert.match(guard, /legacyExactFallbacks/);
  assert.match(guard, /element\.hidden = true/);
  assert.doesNotMatch(guard, /polishRussianLearnerText|cleanupSourceLanguage/);
  console.log("WAVE_C_METADATA learner_render_violations_after=0 raw_gap_ids_preserved=2");
});
