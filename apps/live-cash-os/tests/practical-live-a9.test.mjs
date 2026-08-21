import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const corpus=await readFile(path.join(root,"content/practical-mastery/decisions-live-a9-expansion.ts"),"utf8");
const memory=await readFile(path.join(root,"content/practical-mastery/live-a9-memory.ts"),"utf8");
const gaps=await readFile(path.join(root,"content/practical-mastery/source-gaps.ts"),"utf8");
const dod=await readFile(path.join(root,"../../analysis/LIVE_GEOMETRY_A9_DOD_V1.md"),"utf8");

test("A9 covers all source-supported multiway/deep/straddle families",()=>{
 for(const skill of ["MW-01","MW-02","MW-03","MW-04","DEEP-01","DEEP-03","DEEP-04"]) assert.match(corpus,new RegExp(`skillId:\\"${skill}\\"`));
});

test("A9 preserves unsupported source ceilings",()=>{
 assert.match(gaps,/skillId: "MW-05"[\s\S]*status: "PARTIAL"/);
 assert.match(gaps,/skillId: "DEEP-02"[\s\S]*status: "SOURCE_BLOCKED"/);
 assert.match(dod,/cannot be silently generalized into a 300bb\+ strategy family/i);
});

test("A9 uses multiway and depth variables instead of heads-up shortcuts",()=>{
 assert.match(memory,/WHO-STILL-ACTS/);
 assert.match(memory,/MORE-RANGES-HIGHER-BAR/);
 assert.match(memory,/STRADDLE-RESETS-GEOMETRY/);
 assert.match(corpus,/relative position|Relative position/i);
});

test("A9 generated families contain the complete evidence ladder with rotated answers",()=>{
 for(const kind of ["recognition","decision","changed","boundary"]) assert.match(corpus,new RegExp(`\\"${kind}\\"`));
 assert.match(corpus,/i%3/);
 assert.match(corpus,/correctActionId:"good"/);
 assert.match(corpus,/correctReasonId:"goodR"/);
});

test("A9 does not fabricate exact deep or chart frequencies",()=>{
 assert.doesNotMatch(corpus,/correct.*\b(?:37|63|71|82)%/i);
 assert.match(dod,/Exact solver\/chart frequencies are not invented/);
});
