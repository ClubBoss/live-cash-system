import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const policy=await readFile(path.join(root,"content/practical-mastery/rep-depth-policy.ts"),"utf8");
const variation=await readFile(path.join(root,"content/practical-mastery/decisions-variation-b3.ts"),"utf8");
const b2=await readFile(path.join(root,"content/practical-mastery/perceptual-table-states.ts"),"utf8");
const b3=await readFile(path.join(root,"content/practical-mastery/perceptual-table-states-b3.ts"),"utf8");
const blindBase=await readFile(path.join(root,"content/practical-mastery/decisions-blind-defence-expansion.ts"),"utf8");

const intensive=["PF-01","PF-04","PF-06","PF-07","BL-03","BL-04","W4-BOARD-01","W4-RUNOUT-01","OOP-02","IP-01","3BP-05","TURN-02","TURN-03","RIV-01","RIV-03","MW-01","MW-02","DEEP-01","DEEP-03","EXP-01"];

test("B3 makes depth proportional rather than changing the universal mastery floor",()=>{
  for(const skill of intensive) assert.match(policy,new RegExp(`\\"${skill}\\"`));
  assert.match(policy,/targetRecognition:3/);
  assert.match(policy,/targetDirect:4/);
  assert.match(policy,/targetTransfer:4/);
  assert.match(policy,/targetPerceptual:2/);
  assert.match(policy,/STANDARD/);
});

test("every intensive family receives explicit non-identical causal variation",()=>{
  for(const skill of intensive) assert.match(variation,new RegExp(`skillId:\\"${skill}\\"`),skill);
  const ladder=variation.slice(variation.indexOf("const rows"),variation.indexOf("return rows.map"));
  assert.equal((ladder.match(/kind:\"recognition\"/g)??[]).length,1);
  assert.equal((ladder.match(/kind:\"decision\"/g)??[]).length,1);
  assert.equal((ladder.match(/kind:\"changed\"/g)??[]).length,2);
  assert.match(variation,/changedVariables:r\.changed/);
});

test("every intensive family has at least two table-state perceptual reps across B2/B3",()=>{
  const tables=`${b2}\n${b3}`;
  const prefixBySkill={
    "PF-01":"PM-B3-PF01","PF-04":"PM-B3-PF04","PF-06":"PM-B3-PF06","PF-07":"PM-B3-PF07",
    "BL-03":"PM-PERC-BL03","BL-04":"PM-PERC-BL04","W4-BOARD-01":"PM-PERC-BOARD","W4-RUNOUT-01":"PM-PERC-RUNOUT",
    "OOP-02":"PM-B3-OOP02","IP-01":"PM-B3-IP01","3BP-05":"PM-PERC-3BP05","TURN-02":"PM-B3-TURN02",
    "TURN-03":"PM-B3-TURN03","RIV-01":"PM-B3-RIV01","RIV-03":"PM-PERC-RIV03","MW-01":"PM-PERC-MW01",
    "MW-02":"PM-B3-MW02","DEEP-01":"PM-B3-DEEP01","DEEP-03":"PM-PERC-DEEP03","EXP-01":"PM-PERC-EXP01"
  };
  for(const [skill,prefix] of Object.entries(prefixBySkill)){
    const matches=tables.match(new RegExp(`decisionId:\\"${prefix}[^\\"]*\\"`,"g"))??[];
    assert.ok(matches.length>=2,`${skill} perceptual reps`);
  }
});

test("BL-03 transfer under-depth is explicitly over-repaired, not merely documented",()=>{
  const corpus=`${blindBase}\n${variation}\n${b2}`;
  const changed=(corpus.match(/skillId:\"BL-03\"[\s\S]{0,900}?kind:\"changed\"/g)??[]).length;
  assert.ok(changed>=2 || (corpus.match(/PM-B3-BL03-10[34]/g)??[]).length>=2,"BL-03 has multiple transfer variants");
  assert.match(variation,/open_size/);
  assert.match(variation,/realisation/);
  assert.match(variation,/rake/);
});

test("B3 adds no invented exact-frequency memory target",()=>{
  assert.doesNotMatch(variation,/correct.*\b(?:37|42|50|63|71|82)%/i);
});
