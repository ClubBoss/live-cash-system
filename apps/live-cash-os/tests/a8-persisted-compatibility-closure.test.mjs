import assert from "node:assert/strict";
import test from "node:test";
import { practicalDecisionById } from "../content/practical-mastery/index.ts";
import { currentPracticalMistakes } from "../lib/practical-current-mistakes.ts";
import { retentionTierDue } from "../lib/practical-integrated-session.ts";
import {
  compactPracticalAttemptHistory, createPracticalMasteryState, deriveEvidenceStage,
  isCurrentPracticalEvidenceAttempt, isSemanticallyValidPracticalAttempt,
  nextPracticalDecision, practicalLatestCorrectAttemptForSkill, practicalRepairQueue,
  recordPracticalDecision,
} from "../lib/practical-mastery-core.ts";

const OLD="PM-TURN-03-A8-105";
const NEW="PM-TURN-03-A8-205";
function attempt(id,correct,at="2026-09-01T00:00:00.000Z") {
  const d=practicalDecisionById.get(id); assert.ok(d);
  const action=correct?d.correctActionId:d.actionOptions.find(x=>x.id!==d.correctActionId).id;
  return {id:`fixture:${id}:${at}`,decisionId:id,skillId:d.skillId,actionId:action,reasonId:d.correctReasonId,confidence:80,confidenceProvenance:"NOT_CAPTURED",correct,answeredAt:at};
}
function boundaryState(){const s=createPracticalMasteryState(new Date("2026-09-01T00:00:00Z"));s.skills["TURN-03"].conceptTaught=true;s.skills["TURN-03"].evidenceStage="BOUNDARY_TESTED";return s;}

test("A8 INTERNAL_ONLY raw history stays valid but is never current evidence",()=>{
  for(const correct of [false,true]){const a=attempt(OLD,correct);assert.equal(isSemanticallyValidPracticalAttempt(a),true);assert.equal(isCurrentPracticalEvidenceAttempt(a),false);}
});

test("old INTERNAL_ONLY wrong cannot route repair, mistakes, or return from nextPracticalDecision",()=>{
  const s=boundaryState();s.attempts=[attempt(OLD,false)];
  assert.deepEqual(practicalRepairQueue(s),[]);assert.deepEqual(currentPracticalMistakes(s),[]);
  assert.notEqual(nextPracticalDecision(s,"TURN-03")?.id,OLD);
});

test("old INTERNAL_ONLY wrong does not block retention and old correct cannot anchor it",()=>{
  const wrong=boundaryState();wrong.attempts=[attempt(OLD,false)];
  assert.equal(retentionTierDue(wrong,"TURN-03",new Date("2026-09-10T00:00:00Z")),null,"no current correct anchor exists");
  const correct=boundaryState();correct.attempts=[attempt(OLD,true)];
  assert.equal(practicalLatestCorrectAttemptForSkill(correct,"TURN-03")?.valid,false);
  assert.equal(retentionTierDue(correct,"TURN-03",new Date("2026-09-10T00:00:00Z")),null);
});

test("archive-backed old INTERNAL_ONLY correct remains raw but cannot become retention anchor",()=>{
  const s=boundaryState();s.attempts=Array.from({length:129},(_,i)=>({...attempt(OLD,true,new Date(Date.UTC(2026,8,1,0,i)).toISOString()),id:`archive-old-${i}`}));const archived=compactPracticalAttemptHistory(s,true);
  assert.ok(archived.attemptArchive.latestCorrectOrdinalByDecision[OLD]);
  assert.equal(practicalLatestCorrectAttemptForSkill(archived,"TURN-03")?.valid,false);
  assert.equal(retentionTierDue(archived,"TURN-03",new Date("2026-09-10T00:00:00Z")),null);
});

test("new A8 replacement is legitimate current evidence and retention anchor",()=>{
  let s=boundaryState();const d=practicalDecisionById.get(NEW);assert.ok(d);
  s=recordPracticalDecision(s,{decisionId:NEW,actionId:d.correctActionId,reasonId:d.correctReasonId,confidence:80,now:new Date("2026-09-01T00:00:00Z")});
  s.skills["TURN-03"].evidenceStage="BOUNDARY_TESTED";
  assert.equal(practicalLatestCorrectAttemptForSkill(s,"TURN-03")?.valid,true);
  assert.equal(retentionTierDue(s,"TURN-03",new Date("2026-09-02T00:01:00Z")),1);
});

test("INTERNAL_ONLY successes provide neither stimulus nor scenario mastery credit",()=>{
  const s=createPracticalMasteryState();const p=s.skills["TURN-03"];p.conceptTaught=true;p.successfulDecisionIds=["PM-TURN-03-A8-102",OLD,"PM-TURN-03-A8-107"];
  assert.equal(deriveEvidenceStage(p),"CONCEPT_TAUGHT");
});

import { createPracticalProfileState } from "../lib/practical-profile-state.ts";
import { normalizePracticalProfileState, validatePracticalProfileState, practicalProfileSafeSuccessor } from "../lib/practical-profile-contract.ts";
import { markPracticalConceptTaught } from "../lib/practical-mastery-core.ts";

const BASE_TURN03=["PM-TURN-03-A8-102","PM-B3-TURN03-101","PM-TURN-03-001","PM-TURN-03-A8-105","PM-B3-TURN03-102","PM-TURN-03-A8-107","PM-B3-TURN03-103","PM-TURN-03-A8-108"];
function previousTurn03Profile(){
  let profile=createPracticalProfileState(new Date("2026-09-16T00:00:00Z"));
  profile.mastery=markPracticalConceptTaught(profile.mastery,"TURN-03",new Date("2026-09-16T00:00:01Z"));
  BASE_TURN03.forEach((id,i)=>{const d=practicalDecisionById.get(id);assert.ok(d,id);profile.mastery=recordPracticalDecision(profile.mastery,{decisionId:id,actionId:d.correctActionId,reasonId:d.correctReasonId,confidence:80,now:new Date(Date.UTC(2026,8,16,0,i+2))});});
  profile.mastery.skills["TURN-03"].evidenceStage="BOUNDARY_TESTED";
  return profile;
}

test("previous-valid schema-v4 A8 profile normalizes one-way without losing raw history or unrelated skills",()=>{
  const profile=previousTurn03Profile();
  assert.equal(validatePracticalProfileState(profile),false);
  const raw=JSON.stringify(profile.mastery.attempts);const unrelated=JSON.stringify(profile.mastery.skills["TURN-02"]);
  const normalized=normalizePracticalProfileState(profile);assert.ok(normalized);
  assert.equal(normalized.migratedFromSchema3,false);assert.equal(normalized.recognitionStageReconciled,true);
  assert.equal(normalized.state.mastery.skills["TURN-03"].evidenceStage,"CONCEPT_TAUGHT");
  assert.equal(JSON.stringify(normalized.state.mastery.attempts),raw);
  assert.equal(JSON.stringify(normalized.state.mastery.skills["TURN-02"]),unrelated);
  assert.equal(validatePracticalProfileState(normalized.state),true);
});
test("archive-backed old INTERNAL_ONLY wrong cannot create repair, mistakes, or learner routing",()=>{
  const s=boundaryState();s.attempts=Array.from({length:129},(_,i)=>({...attempt(OLD,false,new Date(Date.UTC(2026,8,1,0,i)).toISOString()),id:`archive-wrong-${i}`}));
  const archived=compactPracticalAttemptHistory(s,true);
  assert.deepEqual(practicalRepairQueue(archived),[]);assert.deepEqual(currentPracticalMistakes(archived),[]);
  assert.notEqual(nextPracticalDecision(archived,"TURN-03")?.id,OLD);
});

test("old INTERNAL_ONLY correct is not intervening repair evidence",()=>{
  const failed="PM-TURN-03-001";const s=boundaryState();
  s.attempts=[attempt(failed,false,"2026-09-01T00:00:00.000Z"),attempt(OLD,true,"2026-09-01T00:01:00.000Z")];
  assert.notEqual(nextPracticalDecision(s,"TURN-03")?.id,failed);
});
test("CAS safe-successor accepts only the bounded normalization without treating it as history loss",()=>{
  const previous=previousTurn03Profile();const normalized=normalizePracticalProfileState(previous);assert.ok(normalized);
  const base={_practicalProfile:previous};const candidate={_practicalProfile:normalized.state};
  assert.equal(practicalProfileSafeSuccessor(candidate,base),true);
  const malformed=structuredClone(candidate);malformed._practicalProfile.mastery.attempts=[];
  assert.equal(practicalProfileSafeSuccessor(malformed,base),false);
});
test("new A8 202/205/207 evidence rebuilds the current TURN-03 ladder",()=>{
  let s=markPracticalConceptTaught(createPracticalMasteryState(),"TURN-03");
  const ids=["PM-TURN-03-A8-202","PM-B3-TURN03-101","PM-TURN-03-001","PM-TURN-03-A8-205","PM-B3-TURN03-102","PM-TURN-03-A8-207","PM-B3-TURN03-103","PM-TURN-03-A8-108"];
  for(const id of ids){const d=practicalDecisionById.get(id);assert.ok(d);s=recordPracticalDecision(s,{decisionId:id,actionId:d.correctActionId,reasonId:d.correctReasonId,confidence:80});}
  assert.equal(s.skills["TURN-03"].evidenceStage,"BOUNDARY_TESTED");assert.equal(deriveEvidenceStage(s.skills["TURN-03"]),"BOUNDARY_TESTED");
  assert.deepEqual(s.skills["TURN-03"].successfulDecisionIds.sort(),ids.sort());
});
test("compacted previous-valid schema-v4 profile reconciles archive-backed A8 history without deleting it",()=>{
  const profile=previousTurn03Profile();const d=practicalDecisionById.get("PM-TURN-03-A8-102");assert.ok(d);
  for(let i=0;i<125;i++) profile.mastery=recordPracticalDecision(profile.mastery,{decisionId:d.id,actionId:d.correctActionId,reasonId:d.correctReasonId,confidence:80,now:new Date(Date.UTC(2026,8,16,2,i))});
  profile.mastery.skills["TURN-03"].evidenceStage="BOUNDARY_TESTED";profile.mastery=compactPracticalAttemptHistory(profile.mastery,true);
  assert.ok(profile.mastery.attemptArchive.attemptCountByDecision["PM-TURN-03-A8-102"]>0);
  const archiveBefore=JSON.stringify(profile.mastery.attemptArchive);
  const normalized=normalizePracticalProfileState(profile);assert.ok(normalized);
  assert.equal(normalized.state.mastery.skills["TURN-03"].evidenceStage,"CONCEPT_TAUGHT");
  assert.equal(JSON.stringify(normalized.state.mastery.attemptArchive),archiveBefore);
  assert.equal(validatePracticalProfileState(normalized.state),true);
});