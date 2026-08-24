import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const corpus=await readFile(path.join(root,"content/practical-mastery/perceptual-table-states.ts"),"utf8");
const ui=await readFile(path.join(root,"components/PracticalPerceptualExperience.tsx"),"utf8");
const tableStimulus=await readFile(path.join(root,"components/PracticalTableStateStimulus.tsx"),"utf8");
const page=await readFile(path.join(root,"app/mastery/perception/page.tsx"),"utf8");
const index=await readFile(path.join(root,"content/practical-mastery/index.ts"),"utf8");

test("B2 table-state corpus spans high-transfer poker families",()=>{
  for(const skill of ["FND-06","BL-03","BL-04","W4-BOARD-01","W4-RUNOUT-01","3BP-05","MW-01","DEEP-03","RIV-03","EXP-01"]) assert.match(corpus,new RegExp(`skillId:\\"${skill}\\"`));
});

test("B2 has guided, reduced and hidden-cue scaffolding",()=>{
  for(const level of ["guided","reduced","hidden"]) assert.match(corpus,new RegExp(`scaffold:\\"${level}\\"`));
});

test("perceptual reps are first-class PracticalDecisions on the reliable learner profile",()=>{
  assert.match(index,/perceptualPracticalDecisions/);
  assert.match(ui,/usePracticalProfileState/);
  assert.match(ui,/recordPracticalDecision/);
  assert.match(ui,/conceptTaught/);
});

test("topic is hidden before answer and skill/cue are revealed only after commitment",()=>{
  const revealBoundary=ui.indexOf("!revealed ? <button");
  assert.ok(revealBoundary>ui.indexOf("PERCEPTUAL PRACTICE"),"reveal branch must follow the concealed decision surface");
  const before=ui.slice(ui.indexOf("PERCEPTUAL PRACTICE"),revealBoundary);
  assert.doesNotMatch(before,/skill\.titleRu|skill\.titleEn/);
  assert.match(ui,/table\.revealCueRu/);
  assert.match(ui,/table\.revealCueEn/);
});

test("table state includes seats, stacks, actions and optional board/straddle metadata",()=>{
  for(const token of ["stackBb","actions","heroCards","board","straddle","potBb"]) assert.match(corpus,new RegExp(token));
  assert.match(ui,/PracticalTableStateStimulus/);
  assert.match(tableStimulus,/aria-label="poker table state"/);
  for(const token of ["state.seats","state.actions","state.heroCards","state.board","state.straddle","state.potBb"]) assert.match(tableStimulus,new RegExp(token.replace(".","\\.")));
});

test("perceptual route is isolated and does not replace default product route",()=>{
  assert.match(page,/PracticalPerceptualExperience/);
});
