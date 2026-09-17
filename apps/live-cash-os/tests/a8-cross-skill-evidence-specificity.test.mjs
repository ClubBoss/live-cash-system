import assert from "node:assert/strict";
import test from "node:test";
import { practicalDecisions } from "../content/practical-mastery/index.ts";
import { turnRiverA8LegacySpecificityDecisions } from "../content/practical-mastery/decisions-turn-river-a8-expansion.ts";
import { practicalStimulusFamilyId } from "../lib/practical-stimulus-identity.ts";
import { createPracticalMasteryState, deriveEvidenceStage, practicalRepairQueue } from "../lib/practical-mastery-core.ts";

const skills=["TURN-01","TURN-02","TURN-03","TURN-04","TURN-05","RIV-01","RIV-02","RIV-03","RIV-04","RIV-05"];
const replacementSuffixes=[202,205,207];
const legacySuffixes=[102,105,107];
const expectedSource={
  "TURN-01":["FTGU-E21"],"TURN-02":["FTGU-E21","SLC-TURN-BARREL","CP-G3-L07"],"TURN-03":["FTGU-E20","CINJ-E06"],"TURN-04":["SLC-TURN-LEADS"],"TURN-05":["CP-G3-L02","FTGU-E21"],
  "RIV-01":["LCM-09","CP-G3-L02"],"RIV-02":["FTGU-E23","CP-G3-L03"],"RIV-03":["FTGU-E22","CINJ-E02","CINJ-E04"],"RIV-04":["CINJ-E08"],"RIV-05":["FTGU-E24","FTGU-E25","CINJ-E10"],
};
const changedTokens={
  "TURN-01":["nut ownership","runout"],"TURN-02":["bluff","continue"],"TURN-03":["probe","cap"],"TURN-04":["lead","ownership"],"TURN-05":["worse","showdown"],
  "RIV-01":["worse","size"],"RIV-02":["block","bluff"],"RIV-03":["bluff supply","price"],"RIV-04":["raise","block"],"RIV-05":["branch","evidence"],
};
function learner(id){const d=practicalDecisions.find((x)=>x.id===id); assert.ok(d,id); assert.notEqual(d.learnerEligibility,"INTERNAL_ONLY"); return d;}
function skeleton(d,locale="En") { return JSON.stringify([d[`question${locale}`],d.actionOptions.map((o)=>o[`text${locale}`]),d.correctActionId,d.reasonOptions.map((o)=>o[`text${locale}`]),d.correctReasonId]); }

test("A8 102/105/107 legacy skeletons are retained only as history-compatible internal rows",()=>{
  for(const skill of skills) for(const suffix of legacySuffixes){const d=turnRiverA8LegacySpecificityDecisions.find((x)=>x.id===`PM-${skill}-A8-${suffix}`); assert.ok(d); assert.equal(d.learnerEligibility,"INTERNAL_ONLY");}
});

test("A8 replacement evidence is skill-specific rather than one cross-skill answer skeleton",()=>{
  for(const suffix of replacementSuffixes){
    const rows=skills.map((skill)=>learner(`PM-${skill}-A8-${suffix}`));
    assert.equal(new Set(rows.map((d)=>skeleton(d))).size,10,`A8-${suffix} EN skeletons`);
    assert.equal(new Set(rows.map((d)=>skeleton(d,"Ru"))).size,10,`A8-${suffix} RU skeletons`);
  }
});

test("each repaired changed node names the skill variable in cue/question/correct rationale with RU/EN parity",()=>{
  for(const skill of skills){
    const d=learner(`PM-${skill}-A8-207`);
    const en=`${d.cueEn} ${d.questionEn} ${d.actionOptions.find((o)=>o.id===d.correctActionId)?.textEn} ${d.explanationEn}`.toLowerCase();
    const ru=`${d.cueRu} ${d.questionRu} ${d.actionOptions.find((o)=>o.id===d.correctActionId)?.textRu} ${d.explanationRu}`.toLowerCase();
    for(const token of changedTokens[skill]) assert.ok(en.includes(token),`${d.id} missing EN ${token}`);
    assert.ok(ru.length>80 && en.length>80,`${d.id} bilingual mechanism must be substantive`);
    assert.ok((d.changedVariables?.length??0)>=2,`${d.id} changedVariables`);
  }
});

test("changing only skillId cannot manufacture semantic stimulus independence",()=>{
  const base=learner("PM-TURN-03-A8-202");
  assert.equal(practicalStimulusFamilyId(base),practicalStimulusFamilyId({...base,id:"PM-TURN-04-A8-202",skillId:"TURN-04"}));
});

test("repaired options remain unambiguous and source-scoped",()=>{
  for(const skill of skills) for(const suffix of replacementSuffixes){
    const d=learner(`PM-${skill}-A8-${suffix}`);
    assert.deepEqual(d.sourceRefs,expectedSource[skill]);
    assert.equal(new Set(d.actionOptions.map((o)=>o.textEn)).size,d.actionOptions.length);
    assert.equal(new Set(d.actionOptions.map((o)=>o.textRu)).size,d.actionOptions.length);
    assert.equal(d.actionOptions.filter((o)=>o.id===d.correctActionId).length,1);
    assert.equal(d.reasonOptions.filter((o)=>o.id===d.correctReasonId).length,1);
    assert.match(d.assumptions.join(" "),/source-scoped/i);
  }
});

test("legacy correct A8 ids no longer satisfy current mastery evidence or repair routing",()=>{
  const state=createPracticalMasteryState(new Date("2026-09-17T00:00:00.000Z"),true);
  const progress=state.skills["TURN-03"]; progress.conceptTaught=true; progress.successfulDecisionIds=["PM-TURN-03-A8-102","PM-TURN-03-A8-105","PM-TURN-03-A8-107"];
  assert.equal(deriveEvidenceStage(progress),"CONCEPT_TAUGHT");
  const legacy=turnRiverA8LegacySpecificityDecisions.find((d)=>d.id==="PM-TURN-03-A8-102"); assert.ok(legacy);
  state.attempts=[{id:"legacy",decisionId:legacy.id,skillId:legacy.skillId,actionId:"b1",reasonId:"goodR",confidence:90,correct:false,answeredAt:"2026-09-01T00:00:00.000Z"}];
  assert.deepEqual(practicalRepairQueue(state),[]);
});
