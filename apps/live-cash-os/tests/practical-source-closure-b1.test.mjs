import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const corpus=await readFile(path.join(root,"content/practical-mastery/decisions-source-closure-b1.ts"),"utf8");
const authority=await readFile(path.join(root,"content/practical-mastery/source-authority.ts"),"utf8");
const gaps=await readFile(path.join(root,"content/practical-mastery/source-gaps.ts"),"utf8");

test("B1 admits reviewed public source authority for every cheaply closeable residual family",()=>{
  for(const ref of [
    "EXT-PC-OUTS-2026","EXT-PC-OUTS-GUIDE-2023","EXT-GTOW-SB-SRP-2024",
    "EXT-UP-BVB-CALLER-2019","EXT-UP-BVB-LIMP-2019","EXT-GTOW-BVB-LIMP-CALLED-2024",
    "EXT-GTOW-DEEP-300-2025","EXT-GTOW-DEEP-SOLUTIONS-300","EXT-UP-SET-MINING-300-2025",
    "EXT-PS-MULTIWAY-2026","EXT-PS-RIVER-2025","EXT-PC-GAMESEL-2025","EXT-CP-SEATSEL-2014"
  ]) assert.match(authority,new RegExp(ref));
});

test("newly supported B1 families use the shared full evidence ladder",()=>{
  for(const skill of ["FND-04","BL-06","BL-07","BL-08","BL-09","W4-DRAW-01","DEEP-02","MW-05","EXP-06"]){
    assert.match(corpus,new RegExp(`skillId:"${skill}"`),`${skill} family config`);
  }
  const ladder=corpus.slice(corpus.indexOf("const rows"),corpus.indexOf("return rows.map"));
  assert.equal((ladder.match(/kind:"recognition"/g)??[]).length,2);
  assert.equal((ladder.match(/kind:"decision"/g)??[]).length,3);
  assert.equal((ladder.match(/kind:"changed"/g)??[]).length,2);
  assert.equal((ladder.match(/kind:"boundary"/g)??[]).length,1);
});

test("BL-11 remains the only explicit source ceiling and is not falsely closed",()=>{
  assert.match(gaps,/skillId: "BL-11"/);
  assert.match(gaps,/status: "PARTIAL"/);
  assert.match(gaps,/POSITIVE_EV_SOURCE_ACCESS_REQUIRED/);
  for(const old of ["FND-04","BL-06","BL-07","BL-08","BL-09","W4-DRAW-01","DEEP-02","MW-05","EXP-06"]){
    assert.doesNotMatch(gaps,new RegExp(`skillId: "${old}"`));
  }
});

test("B1 decisions remain directional and do not import exact visual chart cells",()=>{
  assert.doesNotMatch(corpus,/correct.*(?:37|40|45|63|71|82)%/i);
  assert.match(corpus,/no copied exact chart cell/i);
});
