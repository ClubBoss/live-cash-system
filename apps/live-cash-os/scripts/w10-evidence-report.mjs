import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { buildW10EvidenceReport, validateW10ObservationLedger } from "../lib/w10-evidence.ts";
import { validateLearnerState } from "../lib/model-core.ts";

function usage() {
  console.error("Usage: npm run w10:report -- <live-cash-progress.json> <w10-observations.json> [output-dir]");
}

function metricLine(label, metric) {
  if (!metric || typeof metric !== "object") return `- ${label}: —`;
  const value = metric.value === null || metric.value === undefined ? metric.status : `${metric.value}${metric.unit === "percent" ? "%" : metric.unit === "seconds" ? "s" : ""}`;
  const threshold = metric.threshold ? ` · threshold ${metric.threshold}` : "";
  const pass = metric.pass === true ? " · PASS" : metric.pass === false ? " · FAIL" : metric.pass === null ? " · PENDING_MINIMUMS" : "";
  return `- ${label}: ${value} · n=${metric.n}${threshold}${pass}`;
}

function markdown(report) {
  const coverage = Object.entries(report.studyCoverage)
    .map(([key, gate]) => `- ${key}: ${String(gate.value)} · ${gate.requirement} · ${gate.pass ? "PASS" : "PENDING"}${gate.note ? ` · ${gate.note}` : ""}`)
    .join("\n");
  const repeatedErrors = report.repair.repeatedRuntimeErrorPaths.length
    ? report.repair.repeatedRuntimeErrorPaths.map((item) => `- ${item.errorKey}: ${item.count}`).join("\n")
    : "- none yet";
  const recurringP1 = report.friction.recurringP1.length
    ? report.friction.recurringP1.map((item) => `- ${item.repeatKey}: ${item.count}`).join("\n")
    : "- none";

  return `# Live Cash OS — W10 Evidence Summary\n\nGenerated: ${report.generatedAt}\n\nStatus: **${report.acceptanceBoundary.status}**\n\n> ${report.acceptanceBoundary.statement}\n\n## Study coverage\n\n${coverage}\n\n## Decision quality\n\n${metricLine("Cold accuracy", report.decisionQuality.coldAccuracy)}\n${metricLine("Changed-node accuracy, all observed", report.decisionQuality.changedNodeAccuracyAllObserved)}\n${metricLine("Changed-node accuracy, priority/post-instruction", report.decisionQuality.changedNodeAccuracyPriorityPostInstruction)}\n${metricLine("Boundary accuracy, priority/post-instruction", report.decisionQuality.boundaryAccuracyPriorityPostInstruction)}\n${metricLine("Mixed accuracy", report.decisionQuality.mixedAccuracy)}\n\n## Retention\n\n${metricLine("Delayed accuracy", report.retention.delayedAccuracy)}\n${metricLine("Average response time", report.retention.averageResponseSeconds)}\n${metricLine("Average confidence", report.retention.averageConfidence)}\n- delayed review days: ${report.retention.delayedReviewDays}\n- repeat failures: ${report.retention.repeatFailures}\n\n## Calibration\n\n${metricLine("Mean absolute confidence error", report.calibration.meanAbsoluteConfidenceError)}\n- high-confidence misses: ${report.calibration.highConfidenceMisses}\n- trend decision: ${report.calibration.trendDecision}\n\n## Repair\n\n${metricLine("Repair accuracy", report.repair.repairAccuracy)}\n\nRepeated registered runtime error paths:\n${repeatedErrors}\n\n- new-node success after repair: ${report.repair.newNodeSuccessAfterRepair.status}\n- delayed success after repair: ${report.repair.delayedSuccessAfterRepair.status}\n\n## Field transfer\n\n- recorded hands: ${report.fieldTransfer.recordedHands}\n- reviewed hands: ${report.fieldTransfer.reviewedHands}\n- supporting reviewed hands: ${report.fieldTransfer.supportingReviewedHands}\n${metricLine("Cue-before-action rate", report.fieldTransfer.cueBeforeActionRate)}\n\n## Product use\n\n${metricLine("Completed session duration", report.productUse.completedSessionDuration)}\n${metricLine("Started intended action without navigation confusion", report.productUse.intendedActionWithoutNavigationConfusion)}\n${metricLine("Navigation confusion rate", report.productUse.navigationConfusionRate)}\n${metricLine("Queue overload rate", report.productUse.queueOverloadRate)}\n${metricLine("Desire to return", report.productUse.desireToReturn)}\n${metricLine("Before-play usefulness", report.productUse.beforePlayUsefulness)}\n- abandoned sessions: ${report.productUse.abandonedSessions}\n\n## Friction\n\n- total observed: ${report.friction.totalObserved}\n- unresolved: ${report.friction.unresolvedCount}\n- unresolved P0: ${report.friction.unresolvedP0Count}\n\nRecurring unresolved P1:\n${recurringP1}\n\n## Human judgment still required\n\n${report.acceptanceBoundary.humanJudgmentStillRequired.map((item) => `- ${item}`).join("\n")}\n\n## Privacy\n\nThe generated summary excludes raw Diagnostic reasoning, raw explain-back text, raw real-hand text, free-text friction notes, and user identifiers.\n`;
}

const [progressPath, observationsPath, outputArg] = process.argv.slice(2);
if (!progressPath || !observationsPath) {
  usage();
  process.exit(2);
}

const progressRaw = JSON.parse(await readFile(path.resolve(progressPath), "utf8"));
if (!validateLearnerState(progressRaw)) {
  throw new Error("Progress export is not a valid current schema-v2 LearnerState. Import/migrate it through the app first; the W10 compiler will not silently normalize evidence.");
}
const observationsRaw = JSON.parse(await readFile(path.resolve(observationsPath), "utf8"));
const observations = validateW10ObservationLedger(observationsRaw);
const report = buildW10EvidenceReport(progressRaw, observations);
const outputDir = path.resolve(outputArg ?? "w10-report");
await mkdir(outputDir, { recursive: true });
await writeFile(path.join(outputDir, "w10-evidence.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
await writeFile(path.join(outputDir, "w10-evidence.md"), markdown(report), "utf8");
console.log(`${report.acceptanceBoundary.status}: wrote ${path.join(outputDir, "w10-evidence.json")} and w10-evidence.md`);
