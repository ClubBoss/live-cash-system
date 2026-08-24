import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const fading=await readFile(path.join(root,"lib/practical-scaffold-fading.ts"),"utf8");
const ui=await readFile(path.join(root,"components/PracticalPerceptualExperience.tsx"),"utf8");

test("B5 fading is evidence-driven and requires distinct recognition/transfer",()=>{
 assert.match(fading,/successfulDistinctByKind/);
 assert.match(fading,/recognition<2/);
 assert.match(fading,/transfer<2/);
 assert.match(fading,/boundary<1/);
 assert.match(fading,/return "hidden"/);
});

test("recent wrong restores support and high-confidence wrong restores guided mode",()=>{
 assert.match(fading,/latest&&!latest\.correct/);
 assert.match(fading,/latest\.confidence>=75/);
 assert.match(fading,/return "guided"/);
 assert.match(fading,/return "reduced"/);
});

test("unseen concepts cannot earn hidden cue through fading",()=>{
 assert.match(fading,/!progress\?\.conceptTaught/);
 assert.match(fading,/return "guided"/);
 assert.match(ui,/conceptTaught/);
});

test("perceptual UI uses evidence-derived scaffold and hidden mode reveals no skill before commitment",()=>{
 assert.match(ui,/effectivePracticalScaffold/);
 assert.match(ui,/practicalScaffoldCue/);
 const revealBoundary=ui.indexOf("!revealed ? <button");
 assert.ok(revealBoundary>ui.indexOf("PERCEPTUAL PRACTICE"),"feedback must remain after the committed-answer branch");
 const before=ui.slice(ui.indexOf("PERCEPTUAL PRACTICE"),revealBoundary);
 assert.doesNotMatch(before,/skill\.titleRu|skill\.titleEn/);
 assert.match(ui.slice(revealBoundary),/skill\.titleRu|skill\.titleEn/);
});

test("guided cue is a signal family, not a mandatory ordered checklist",()=>{
 assert.match(fading,/price, position, depth, action history, or ranges/);
 assert.doesNotMatch(fading,/first.*then.*then/i);
});
