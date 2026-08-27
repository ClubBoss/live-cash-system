import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relative) => readFile(path.join(root, relative), "utf8");

const perception = await read("components/PracticalPerceptualExperience.tsx");
const integrated = await read("components/PracticalIntegratedSessionExperience.tsx");
const feedback = await read("components/PracticalDecisionFeedback.tsx");
const selectedFeedback = await read("lib/practical-selected-decision-feedback.ts");
const feedbackCopy = await read("content/practical-mastery/practical-decision-feedback-copy.ts");
const reference = await read("components/PracticalReferenceExperience.tsx");
const mastery = await read("components/PracticalMasteryExperience.tsx");
const journey = await read("components/PracticalFirstJourneyExperience.tsx");
const nextLink = await read("components/PracticalNextLearningLink.tsx");
const adaptive = await read("lib/practical-adaptive-session.ts");
const core = await read("lib/practical-mastery-core.ts");
const stateIntegrity = await read("tests/practical-mastery-state-integrity.test.mjs");

test("perception freezes submitted table identity until explicit next", () => {
  assert.match(perception, /submittedDecisionId/);
  assert.match(perception, /allPracticalTableStates\.find\(\(candidate\) => candidate\.decisionId === submittedDecisionId\)/);
  assert.match(perception, /setSubmittedDecisionId\(decision\.id\)/);
  assert.match(perception, /const firstUnattempted = eligible\.findIndex/);
  assert.match(perception, /setSubmittedDecisionId\(null\)/);

  const record = perception.indexOf("recordPracticalDecision(state");
  const persist = perception.indexOf("setMasteryWithPerformance(nextState, event)");
  const freeze = perception.indexOf("setSubmittedDecisionId(decision.id)");
  const reveal = perception.indexOf("setRevealed(true)");
  assert.ok(record >= 0 && persist > record && freeze > persist && reveal > freeze, "A must be recorded and persisted before its reveal identity is frozen");
});

test("integrated perceptual decisions always render the canonical table state before scoring", () => {
  assert.match(integrated, /allPracticalTableStates\.find/);
  assert.match(integrated, /<PracticalTableStateStimulus state=\{tableState\}/);
  assert.match(integrated, /mode: tableState \? "PERCEPTUAL_TABLE" : "TEXT_MIXED"/);
  assert.ok(integrated.indexOf("<PracticalTableStateStimulus") < integrated.indexOf("decision.questionRu"), "table stimulus must precede the scored question");
});

test("incorrect practical feedback names canonical action and reason without changing scoring", () => {
  assert.match(selectedFeedback, /decision\.correctActionId/);
  assert.match(selectedFeedback, /decision\.correctReasonId/);
  assert.match(feedback, /Правильное действие:/);
  assert.match(feedback, /Правильная причина:/);
  assert.match(feedback, /Correct action:/);
  assert.match(feedback, /Correct reason:/);
  assert.match(selectedFeedback, /practicalDecisionFeedbackCopy\(decision\)/);
  assert.match(feedback, /data-practical-feedback-mechanism/);
  assert.match(feedbackCopy, /mechanismRu: decision\.explanationRu/);
  assert.match(feedbackCopy, /mechanismEn: decision\.explanationEn/);
  for (const source of [perception, integrated, journey]) assert.match(source, /<PracticalDecisionFeedback/);
});

test("Practical learner copy maps internal status language and keeps EN objectives distinct from titles", () => {
  assert.match(mastery, /function evidenceLabel/);
  assert.match(mastery, /mechanism introduced/);
  assert.match(mastery, /recalled after a delay/);
  assert.doesNotMatch(mastery, /stage\.toLowerCase/);
  assert.doesNotMatch(mastery, /syncStatus/);
  assert.doesNotMatch(mastery, /skill\.objectiveRu\s*:\s*skill\.titleEn/);
  assert.doesNotMatch(journey, /skill\.objectiveRu\s*:\s*skill\.titleEn/);
  assert.match(mastery, /Use \$\{skill\.titleEn\} reliably in independent decisions and changed conditions/);
});

test("Reference renders human epistemic labels while provenance keys remain internal", () => {
  for (const human of ["Форма диапазона подтверждена", "Точные частоты ещё не проверены", "Range shape reviewed", "Exact frequencies not yet verified"]) assert.match(reference, new RegExp(human));
  const withoutReactKeys = reference.replace(/key=\{item\.id\}/g, "");
  assert.doesNotMatch(withoutReactKeys, /item\.id/);
  assert.doesNotMatch(reference, /\{item\.status\}/);
  assert.doesNotMatch(reference, /item\.sourceRefs/);
  assert.doesNotMatch(reference, />\s*C2\s*</);
  assert.doesNotMatch(reference, /repository|registry/i);
});

test("named Skill Map recommendation enters the canonical scheduler with validated focus while generic Learn stays generic", () => {
  assert.match(nextLink, /focusSkillId\?: string/);
  assert.match(nextLink, /\/mastery\/session\?focus=/);
  assert.match(nextLink, /href="\/mastery\/journey"/);
  assert.match(nextLink, /isIntegratedFocusAdmissible/);
  assert.match(nextLink, /usePracticalProfileState/);
  assert.doesNotMatch(nextLink, /recommendNextPracticalSkill/);
  assert.match(nextLink, /aria-disabled="true"/);
  assert.match(mastery, /<PracticalNextLearningLink className="primary" focusSkillId=\{recommendedSkill\.id\} \/>/);
  assert.match(adaptive, /requestedIntegratedFocusItem/);
  assert.match(adaptive, /supportedIntegratedSkillIds\(state\)\.includes\(skillId\)/);
  assert.match(adaptive, /buildIntegratedSession/);
  assert.match(integrated, /URLSearchParams\(window\.location\.search\)\.get\("focus"\)/);
});

test("same-item repeat grinding still cannot inflate distinct evidence", () => {
  assert.match(core, /new Set\(skillState\.distinctRecognitionIds\)/);
  assert.match(core, /new Set\(skillState\.distinctTransferIds\)/);
  assert.match(core, /nextRecognition\.add\(decision\.id\)/);
  assert.match(core, /nextTransfer\.add\(decision\.id\)/);
  assert.match(stateIntegrity, /repeat-grinding one decision cannot inflate distinct evidence/);
});
