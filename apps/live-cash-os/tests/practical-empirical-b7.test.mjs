import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const telemetry=await readFile(path.join(root,"lib/practical-performance-telemetry.ts"),"utf8");
const profile=await readFile(path.join(root,"lib/practical-profile-contract.ts"),"utf8");
const perceptual=await readFile(path.join(root,"components/PracticalPerceptualExperience.tsx"),"utf8");
const mixed=await readFile(path.join(root,"components/PracticalIntegratedSessionExperience.tsx"),"utf8");
const journey=await readFile(path.join(root,"components/PracticalFirstJourneyExperience.tsx"),"utf8");
const integrated=await readFile(path.join(root,"lib/practical-integrated-session.ts"),"utf8");
const dod=await readFile(path.join(root,"../../analysis/MASTERY_COMPLETION_B7_EMPIRICAL_GAUNTLET_DOD_V1.md"),"utf8");

test("B7 telemetry remains a separate evidence dimension without a competing storage truth",()=>{
 assert.doesNotMatch(telemetry,/practical-performance:v1/);
 assert.doesNotMatch(telemetry,/PracticalMasteryState/);
 assert.match(profile,/performance: PracticalPerformanceEvent\[\]/);
 assert.match(telemetry,/responseMs/);
 assert.match(telemetry,/actionCorrect/);
 assert.match(telemetry,/reasonCorrect/);
 assert.match(telemetry,/confidence/);
});

test("B7 metrics expose action reason combined latency hidden transfer boundary and calibration",()=>{
 for(const metric of ["actionAccuracy","reasonAccuracy","combinedAccuracy","medianResponseMs","hiddenCueAccuracy","transferAccuracy","boundaryAccuracy","perceptualAccuracy","medianPerceptualResponseMs","meanCalibrationError"]) assert.match(telemetry,new RegExp(metric));
});

test("perceptual and mixed practice record distinct stimulus modes",()=>{
 assert.match(perceptual,/PERCEPTUAL_TABLE/);
 assert.match(mixed,/TEXT_MIXED/);
 assert.match(perceptual,/createPracticalPerformanceEvent/);
 assert.match(mixed,/createPracticalPerformanceEvent/);
 assert.match(perceptual,/setMasteryWithPerformance/);
 assert.match(mixed,/setMasteryWithPerformance/);
});

test("blind novice flow teaches before scoring and still refuses unseen concept testing",()=>{
 assert.match(perceptual,/conceptTaught/);
 assert.match(perceptual,/First Journey/);
 assert.match(journey,/ГДЕ ЭТО НУЖНО|WHERE THIS MATTERS/);
 assert.match(journey,/Проверить на примере|Try an example/);
 assert.match(journey,/markPracticalConceptTaught/);
 assert.doesNotMatch(journey,/<textarea/);
});

test("retention still requires real spacing and non-identical retrieval",()=>{
 assert.match(integrated,/RETENTION_INTERVAL_DAYS = \[1, 3, 7\]/);
 assert.match(integrated,/requireNonIdenticalToLatest/);
 assert.match(integrated,/actualGap >= item\.retentionTierDays/);
});

test("B7 explicitly refuses fake human validation",()=>{
 assert.match(dod,/HUMAN_MASTERY_VALIDATED = FALSE/);
 assert.match(dod,/actual learner data/i);
});
