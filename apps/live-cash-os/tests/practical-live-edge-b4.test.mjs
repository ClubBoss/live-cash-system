import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const corpus=await readFile(path.join(root,"content/practical-mastery/decisions-live-edge-b4.ts"),"utf8");
const index=await readFile(path.join(root,"content/practical-mastery/index.ts"),"utf8");

test("B4 propagates live context into canonical skill IDs",()=>{
 for(const skill of ["PF-01","PF-02","PF-04","PF-06","PF-07","BL-03","OOP-02","3BP-05","TURN-02","RIV-01","RIV-03"]) assert.match(corpus,new RegExp(`skillId:"${skill}"`));
 assert.match(index,/liveEdgeB4Decisions/);
});

test("B4 covers live variables rather than a generic live-player stereotype",()=>{
 for(const token of ["effective_depth","players_behind","limper_count","open_size","threebet_size","rake","future_leverage","spr","river_size","evidence_confidence"]) assert.match(corpus,new RegExp(token));
 assert.doesNotMatch(corpus,/all live players|live players always/i);
});

test("B4 shared family contains recognition decision changed and boundary evidence",()=>{
 const ladder=corpus.slice(corpus.indexOf("const rows"),corpus.indexOf("return rows.map"));
 for(const kind of ["recognition","decision","changed","boundary"]) assert.match(ladder,new RegExp(`kind:"${kind}"`));
});

test("B4 does not fabricate exact population frequency",()=>{
 assert.match(corpus,/no exact population frequency/);
 assert.doesNotMatch(corpus,/correct.*\b(?:37|42|50|63|71|82)%/i);
});
