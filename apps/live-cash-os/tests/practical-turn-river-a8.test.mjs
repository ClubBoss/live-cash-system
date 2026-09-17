import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { turnRiverA8ExpansionDecisions, laterStreetLegacySkillBridges } from "../content/practical-mastery/decisions-turn-river-a8-expansion.ts";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const memory=await readFile(path.join(root,"content/practical-mastery/turn-river-a8-memory.ts"),"utf8");
const dod=await readFile(path.join(root,"../../analysis/TURN_RIVER_ENGINE_A8_DOD_V1.md"),"utf8");
const skills=["TURN-01","TURN-02","TURN-03","TURN-04","TURN-05","RIV-01","RIV-02","RIV-03","RIV-04","RIV-05"];

test("A8 covers five canonical turn and five canonical river families",()=>{
  assert.equal(turnRiverA8ExpansionDecisions.length,80);
  for(const skill of skills) assert.equal(turnRiverA8ExpansionDecisions.filter((d)=>d.skillId===skill).length,8);
});

test("A8 uses a full evidence ladder and rotates authored answer positions",()=>{
  for(const skill of skills){
    const rows=turnRiverA8ExpansionDecisions.filter((d)=>d.skillId===skill);
    assert.deepEqual(rows.map((d)=>d.kind),["recognition","recognition","decision","decision","decision","changed","changed","boundary"]);
    assert.deepEqual(rows.slice(0,3).map((d)=>d.actionOptions.findIndex((o)=>o.id===d.correctActionId)),[0,1,2]);
    assert.ok(rows.every((d)=>d.correctActionId==="good"&&d.correctReasonId==="goodR"));
  }
});

test("later-street legacy SRP identities are bridges rather than duplicate mastery targets",()=>{
  for(const legacy of ["OOP-06","OOP-07","IP-03","IP-04","IP-05","IP-06"]) assert.ok(legacy in laterStreetLegacySkillBridges);
  assert.match(dod,/must not force the learner to prove the same concept twice/i);
});

test("later-street memory rejects slogans without ancestry",()=>{
  assert.match(memory,/ANCESTRY-FIRST/);
  assert.match(memory,/Good price does not manufacture bluffs/);
  assert.match(memory,/Missed draw is not automatically a bluff/);
  assert.match(dod,/Every turn decision identifies the prior flop branch/i);
});

test("A8 does not admit unreviewed exact frequencies",()=>{
  assert.match(dod,/Exact solver frequencies are not invented/);
  for(const d of turnRiverA8ExpansionDecisions) assert.doesNotMatch(`${d.explanationEn} ${d.actionOptions.map((o)=>o.textEn).join(" ")}`,/\b(?:37|63|71|82)%/i);
});
