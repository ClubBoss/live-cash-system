import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { practicalDecisions } from "../content/practical-mastery/index.ts";
import { classifyPracticalAdaptiveNeed } from "../lib/practical-adaptive-repair.ts";
import {
  practicalSelfReportedConfidence,
} from "../lib/practical-confidence.ts";
import {
  PRACTICAL_HIGH_CONFIDENCE_WRONG,
  practicalMisconceptionEvidenceFamilies,
} from "../lib/practical-current-mistakes.ts";
import {
  createPracticalMasteryState,
  isSemanticallyValidPracticalAttempt,
  markPracticalConceptTaught,
  recordPracticalDecision,
} from "../lib/practical-mastery-core.ts";
import {
  createPracticalPerformanceEvent,
  isSemanticallyValidPracticalPerformanceEvent,
  summarizePracticalPerformance,
} from "../lib/practical-performance-telemetry.ts";
import { recommendedPracticalScaffold } from "../lib/practical-scaffold-fading.ts";
import { practicalSkillProgressTransparency } from "../lib/practical-skill-transparency.ts";

function decisionWithWrongMisconception() {
  const decision = practicalDecisions.find((candidate) =>
    candidate.actionOptions.some((option) => option.id !== candidate.correctActionId && option.misconception)
    || candidate.reasonOptions.some((option) => option.id !== candidate.correctReasonId && option.misconception));
  assert.ok(decision, "expected a canonical decision with a tagged wrong option");
  return decision;
}

function wrongInput(decision) {
  const wrongAction = decision.actionOptions.find((option) => option.id !== decision.correctActionId && option.misconception)
    ?? decision.actionOptions.find((option) => option.id !== decision.correctActionId);
  const wrongReason = decision.reasonOptions.find((option) => option.id !== decision.correctReasonId && option.misconception)
    ?? decision.reasonOptions.find((option) => option.id !== decision.correctReasonId);
  assert.ok(wrongAction || wrongReason, "decision must expose a wrong choice");
  return {
    actionId: wrongAction?.id ?? decision.correctActionId,
    reasonId: wrongReason?.id ?? decision.correctReasonId,
  };
}

function wrongState(provenance) {
  const decision = decisionWithWrongMisconception();
  let state = createPracticalMasteryState(new Date("2026-09-16T00:00:00Z"));
  state = markPracticalConceptTaught(state, decision.skillId, new Date("2026-09-16T00:00:01Z"));
  const wrong = wrongInput(decision);
  state = recordPracticalDecision(state, {
    decisionId: decision.id,
    ...wrong,
    confidence: 99,
    ...(provenance ? { confidenceProvenance: provenance } : {}),
    now: new Date("2026-09-16T00:01:00Z"),
  });
  return { state, decision, wrong };
}

test("LC-AUD-024 NOT_CAPTURED confidence stays persisted but is not learner self-report", () => {
  const { state } = wrongState("NOT_CAPTURED");
  const attempt = state.attempts.at(-1);
  assert.ok(attempt);
  assert.equal(attempt.confidence, 99);
  assert.equal(attempt.confidenceProvenance, "NOT_CAPTURED");
  assert.equal(practicalSelfReportedConfidence(attempt), null);
  assert.equal(isSemanticallyValidPracticalAttempt(attempt), true);

  const families = practicalMisconceptionEvidenceFamilies(state);
  assert.ok(families.length > 0);
  assert.equal(families.reduce((sum, family) => sum + family.highConfidenceEvidenceCount, 0), 0);
  assert.ok(PRACTICAL_HIGH_CONFIDENCE_WRONG <= 99);
});

test("LC-AUD-024 only SELF_REPORT can create high-confidence repair/scaffold urgency", () => {
  const notCaptured = wrongState("NOT_CAPTURED");
  const selfReport = wrongState("SELF_REPORT");

  const lowTrustNeed = classifyPracticalAdaptiveNeed(notCaptured.state, notCaptured.decision.skillId);
  const selfReportNeed = classifyPracticalAdaptiveNeed(selfReport.state, selfReport.decision.skillId);
  assert.equal(selfReportNeed.priority - lowTrustNeed.priority, 12);
  assert.equal(recommendedPracticalScaffold(notCaptured.state, notCaptured.decision.skillId), "reduced");
  assert.equal(recommendedPracticalScaffold(selfReport.state, selfReport.decision.skillId), "guided");

  const highFamilies = practicalMisconceptionEvidenceFamilies(selfReport.state);
  assert.ok(highFamilies.some((family) => family.highConfidenceEvidenceCount > 0));
});

test("LC-AUD-024 learner-facing latest confidence skips synthetic and legacy-unknown rows", () => {
  const notCaptured = wrongState("NOT_CAPTURED");
  const skillId = notCaptured.decision.skillId;
  assert.equal(
    practicalSkillProgressTransparency(notCaptured.state, skillId, "RECOGNITION_TRAINED").latestConfidence,
    null,
  );

  const legacyUnknown = wrongState(null);
  const legacyAttempt = legacyUnknown.state.attempts.at(-1);
  assert.ok(legacyAttempt);
  assert.equal(legacyAttempt.confidenceProvenance, undefined);
  assert.equal(isSemanticallyValidPracticalAttempt(legacyAttempt), true);
  assert.equal(
    practicalSkillProgressTransparency(legacyUnknown.state, skillId, "RECOGNITION_TRAINED").latestConfidence,
    null,
  );

  const decision = notCaptured.decision;
  const wrong = wrongInput(decision);
  const withSelfReport = recordPracticalDecision(notCaptured.state, {
    decisionId: decision.id,
    ...wrong,
    confidence: 82,
    confidenceProvenance: "SELF_REPORT",
    now: new Date("2026-09-16T00:02:00Z"),
  });
  assert.equal(
    practicalSkillProgressTransparency(withSelfReport, skillId, "RECOGNITION_TRAINED").latestConfidence,
    82,
  );
});

test("LC-AUD-024 calibration uses only explicitly self-reported confidence", () => {
  const decision = decisionWithWrongMisconception();
  const wrong = wrongInput(decision);
  const synthetic = createPracticalPerformanceEvent({
    decisionId: decision.id,
    ...wrong,
    confidence: 65,
    confidenceProvenance: "NOT_CAPTURED",
    startedAt: new Date("2026-09-16T00:00:00Z"),
    answeredAt: new Date("2026-09-16T00:00:05Z"),
    mode: "PERCEPTUAL_TABLE",
  });
  const selfReport = createPracticalPerformanceEvent({
    decisionId: decision.id,
    actionId: decision.correctActionId,
    reasonId: decision.correctReasonId,
    confidence: 80,
    confidenceProvenance: "SELF_REPORT",
    startedAt: new Date("2026-09-16T00:01:00Z"),
    answeredAt: new Date("2026-09-16T00:01:05Z"),
    mode: "TEXT_MIXED",
  });
  assert.equal(isSemanticallyValidPracticalPerformanceEvent(synthetic), true);
  assert.equal(summarizePracticalPerformance([synthetic]).meanCalibrationError, null);
  assert.equal(summarizePracticalPerformance([synthetic, selfReport]).meanCalibrationError, 20);

  const legacy = structuredClone(selfReport);
  delete legacy.confidenceProvenance;
  assert.equal(isSemanticallyValidPracticalPerformanceEvent(legacy), true);
  assert.equal(summarizePracticalPerformance([legacy]).meanCalibrationError, null);
});

test("LC-AUD-024 learner flows declare confidence provenance at the writer boundary", async () => {
  const [quickStart, perceptual, integrated, integratedWriter] = await Promise.all([
    readFile(new URL("../components/PracticalFirstJourneyExperience.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/PracticalPerceptualExperience.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/PracticalIntegratedSessionExperience.tsx", import.meta.url), "utf8"),
    readFile(new URL("../lib/practical-integrated-session.ts", import.meta.url), "utf8"),
  ]);

  assert.match(quickStart, /confidence: 65, confidenceProvenance: "NOT_CAPTURED"/);
  assert.match(perceptual, /confidence: 65, confidenceProvenance: "NOT_CAPTURED"/);
  assert.match(integrated, /confidenceProvenance: "SELF_REPORT"/);
  assert.match(integratedWriter, /confidenceProvenance: "SELF_REPORT"/);
});
