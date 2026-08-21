import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const repair=await readFile(path.join(root,"lib/practical-adaptive-repair.ts"),"utf8");
const session=await readFile(path.join(root,"lib/practical-adaptive-session.ts"),"utf8");
const ui=await readFile(path.join(root,"components/PracticalIntegratedSessionExperience.tsx"),"utf8");

test("B6 distinguishes causal repair modes",()=>{
 for(const need of ["RECOGNITION","MECHANISM","TRANSFER","BOUNDARY","AUTOMATICITY","UNDEREXPOSED"]) assert.match(repair,new RegExp(`\\"${need}\\"`));
 assert.match(repair,/actionCorrect&&!reasonCorrect/);
 assert.match(repair,/decision\?\.kind===\"recognition\"/);
 assert.match(repair,/decision\?\.kind===\"changed\"\|\|decision\?\.kind===\"mixed\"/);
 assert.match(repair,/decision\?\.kind===\"boundary\"/);
});

test("B6 preserves high-confidence wrong priority and supports latency automaticity",()=>{
 assert.match(repair,/latest\.confidence>=75/);
 assert.match(repair,/responseMs>decision\.targetSeconds\*1500/);
 assert.match(repair,/Correct but materially slow/);
});

test("B6 uses EV-weighted rep-depth target to detect underexposure",()=>{
 assert.match(repair,/practicalRepDepthTargetForSkill/);
 assert.match(repair,/target\.tier===\"INTENSIVE\"/);
 assert.match(repair,/deficit/);
});

test("adaptive session prefers non-identical causal repair and perceptual reps when useful",()=>{
 assert.match(session,/decision\.id!==latest\?\.decisionId/);
 assert.match(session,/allPracticalTableStates/);
 assert.match(session,/need\.preferPerceptual/);
 assert.match(session,/adaptive\.length>=Math\.ceil\(size\/2\)/);
});

test("learner-facing mixed session now uses adaptive builder",()=>{
 assert.match(ui,/buildAdaptiveIntegratedSession/);
 assert.doesNotMatch(ui,/setItems\(buildIntegratedSession/);
});
