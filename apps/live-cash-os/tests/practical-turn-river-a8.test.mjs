import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const corpus=await readFile(path.join(root,"content/practical-mastery/decisions-turn-river-a8-expansion.ts"),"utf8");
const memory=await readFile(path.join(root,"content/practical-mastery/turn-river-a8-memory.ts"),"utf8");
const dod=await readFile(path.join(root,"../../analysis/TURN_RIVER_ENGINE_A8_DOD_V1.md"),"utf8");

test("A8 covers five canonical turn and five canonical river families",()=>{
  for(const skill of ["TURN-01","TURN-02","TURN-03","TURN-04","TURN-05","RIV-01","RIV-02","RIV-03","RIV-04","RIV-05"]) assert.match(corpus,new RegExp(`skillId:\\"${skill}\\"`));
});

test("A8 uses a full evidence ladder and rotates answer positions",()=>{
  for(const kind of ["recognition","decision","changed","boundary"]) assert.match(corpus,new RegExp(`kind:\\"${kind}\\"`));
  assert.match(corpus,/i%3/);
  assert.match(corpus,/correctActionId:"good"/);
  assert.match(corpus,/correctReasonId:"goodR"/);
});

test("later-street legacy SRP identities are bridges rather than duplicate mastery targets",()=>{
  for(const legacy of ["OOP-06","OOP-07","IP-03","IP-04","IP-05","IP-06"]) assert.match(corpus,new RegExp(`\\"${legacy}\\"`));
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
  assert.doesNotMatch(corpus,/correct.*\b(?:37|63|71|82)%/i);
});
