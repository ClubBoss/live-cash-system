import { allPracticalTableStates, practicalDecisionById, practicalRepDepthTargetForSkill, type PracticalDecision } from "../content/practical-mastery";
import type { PracticalMasteryState } from "./practical-mastery-core";

export type PracticalRepairNeed = "RECOGNITION" | "MECHANISM" | "TRANSFER" | "BOUNDARY" | "AUTOMATICITY" | "UNDEREXPOSED" | "NONE";
export type PracticalPerformanceSample = { decisionId:string; responseMs:number; correct:boolean };
export type PracticalAdaptiveNeed = { skillId:string; need:PracticalRepairNeed; priority:number; preferredKinds:PracticalDecision["kind"][]; preferPerceptual:boolean; reason:string };

function latestSkillAttempt(state:PracticalMasteryState,skillId:string){return [...state.attempts].reverse().find((attempt)=>attempt.skillId===skillId)??null;}
function successfulIds(state:PracticalMasteryState,skillId:string,kinds:PracticalDecision["kind"][]){return new Set(state.attempts.filter((attempt)=>attempt.skillId===skillId&&attempt.correct).filter((attempt)=>{const d=practicalDecisionById.get(attempt.decisionId);return d?kinds.includes(d.kind):false;}).map((attempt)=>attempt.decisionId)).size;}
function perceptualAvailable(skillId:string){return allPracticalTableStates.some((table)=>practicalDecisionById.get(table.decisionId)?.skillId===skillId);}

export function classifyPracticalAdaptiveNeed(state:PracticalMasteryState,skillId:string,performance:PracticalPerformanceSample[]=[]):PracticalAdaptiveNeed{
  const progress=state.skills[skillId];
  if(!progress?.conceptTaught) return {skillId,need:"NONE",priority:0,preferredKinds:[],preferPerceptual:false,reason:"Concept not exposed; learning route owns first teaching."};
  const latest=latestSkillAttempt(state,skillId);
  if(latest&&!latest.correct){
    const decision=practicalDecisionById.get(latest.decisionId);
    const confidenceBonus=latest.confidence>=75?20:8;
    const actionCorrect=decision?latest.actionId===decision.correctActionId:false;
    const reasonCorrect=decision?latest.reasonId===decision.correctReasonId:false;
    if(decision?.kind==="recognition") return {skillId,need:"RECOGNITION",priority:110+confidenceBonus,preferredKinds:["recognition","changed"],preferPerceptual:perceptualAvailable(skillId),reason:"Latest recognition miss: repair cue extraction before adding complexity."};
    if(decision?.kind==="changed"||decision?.kind==="mixed") return {skillId,need:"TRANSFER",priority:108+confidenceBonus,preferredKinds:["changed","mixed","recognition"],preferPerceptual:perceptualAvailable(skillId),reason:"Latest changed-node/mixed miss: repair transfer on a non-identical stimulus."};
    if(decision?.kind==="boundary") return {skillId,need:"BOUNDARY",priority:106+confidenceBonus,preferredKinds:["boundary","changed"],preferPerceptual:false,reason:"Latest boundary miss: repair overgeneralization explicitly."};
    if(actionCorrect&&!reasonCorrect) return {skillId,need:"MECHANISM",priority:112+confidenceBonus,preferredKinds:["decision","recognition","boundary"],preferPerceptual:false,reason:"Action was right but reason was wrong: repair causal mechanism, not action repetition."};
    return {skillId,need:"MECHANISM",priority:100+confidenceBonus,preferredKinds:["decision","recognition","changed"],preferPerceptual:false,reason:"Direct decision miss: rebuild the mechanism and then re-test."};
  }

  const lastPerformance=[...performance].reverse().find((sample)=>practicalDecisionById.get(sample.decisionId)?.skillId===skillId);
  if(lastPerformance?.correct){
    const decision=practicalDecisionById.get(lastPerformance.decisionId);
    if(decision&&lastPerformance.responseMs>decision.targetSeconds*1500){
      return {skillId,need:"AUTOMATICITY",priority:72,preferredKinds:["recognition","changed","mixed"],preferPerceptual:perceptualAvailable(skillId),reason:"Correct but materially slow: preserve accuracy while reducing cue/decision latency."};
    }
  }

  const target=practicalRepDepthTargetForSkill(skillId);
  if(target.tier==="INTENSIVE"){
    const recognition=successfulIds(state,skillId,["recognition"]); const direct=successfulIds(state,skillId,["decision"]); const transfer=successfulIds(state,skillId,["changed","mixed"]); const boundary=successfulIds(state,skillId,["boundary"]);
    const deficit=Math.max(0,target.targetRecognition-recognition)+Math.max(0,target.targetDirect-direct)+Math.max(0,target.targetTransfer-transfer)+Math.max(0,target.targetBoundary-boundary);
    if(deficit>0) return {skillId,need:"UNDEREXPOSED",priority:45+Math.min(20,deficit*2),preferredKinds:transfer<target.targetTransfer?["changed","mixed","recognition"]:["recognition","decision","changed","boundary"],preferPerceptual:perceptualAvailable(skillId),reason:`Intensive family remains under its EV-weighted depth target by ${deficit} distinct evidence slots.`};
  }
  return {skillId,need:"NONE",priority:0,preferredKinds:[],preferPerceptual:false,reason:"No causal repair need detected."};
}

export function adaptiveNeedBonus(state:PracticalMasteryState,skillId:string):number{return classifyPracticalAdaptiveNeed(state,skillId).priority;}

export function decisionMatchesAdaptiveNeed(decision:PracticalDecision,need:PracticalAdaptiveNeed):boolean{
  if(!need.preferredKinds.length) return true;
  return need.preferredKinds.includes(decision.kind);
}
