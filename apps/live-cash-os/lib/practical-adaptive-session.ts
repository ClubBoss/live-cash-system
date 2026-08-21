import { allPracticalTableStates, practicalDecisions } from "../content/practical-mastery";
import { classifyPracticalAdaptiveNeed, decisionMatchesAdaptiveNeed, type PracticalPerformanceSample } from "./practical-adaptive-repair";
import { buildIntegratedSession, supportedIntegratedSkillIds, type IntegratedSessionItem } from "./practical-integrated-session";
import type { PracticalMasteryState } from "./practical-mastery-core";

export function buildAdaptiveIntegratedSession(state:PracticalMasteryState,now=new Date(),size=8,performance:PracticalPerformanceSample[]=[]):IntegratedSessionItem[]{
  const base=buildIntegratedSession(state,now,size);
  const used=new Set<string>();
  const adaptive:IntegratedSessionItem[]=[];
  const perceptualIds=new Set(allPracticalTableStates.map((table)=>table.decisionId));
  const needs=supportedIntegratedSkillIds(state)
    .map((skillId)=>classifyPracticalAdaptiveNeed(state,skillId,performance))
    .filter((need)=>need.need!=="NONE")
    .sort((a,b)=>b.priority-a.priority||a.skillId.localeCompare(b.skillId));

  for(const need of needs){
    if(adaptive.length>=Math.ceil(size/2)) break;
    const latest=[...state.attempts].reverse().find((attempt)=>attempt.skillId===need.skillId)??null;
    const pool=practicalDecisions.filter((decision)=>decision.skillId===need.skillId&&decisionMatchesAdaptiveNeed(decision,need)&&decision.id!==latest?.decisionId);
    const decision=(need.preferPerceptual?pool.find((candidate)=>perceptualIds.has(candidate.id)):undefined)??pool[0];
    if(!decision||used.has(decision.id)) continue;
    const reason:IntegratedSessionItem["reason"]=need.need==="RECOGNITION"||need.need==="AUTOMATICITY"?"RECOGNITION":need.need==="TRANSFER"||need.need==="BOUNDARY"?"TRANSFER":need.need==="UNDEREXPOSED"?"REINFORCE":"REPAIR";
    adaptive.push({decisionId:decision.id,skillId:decision.skillId,priority:150+need.priority,reason,whyAfterAnswer:`${need.need}: ${need.reason}`,retentionTierDays:null});
    used.add(decision.id);
  }

  for(const item of base){
    if(adaptive.length>=size) break;
    if(used.has(item.decisionId)) continue;
    adaptive.push(item); used.add(item.decisionId);
  }
  return adaptive.slice(0,size);
}
