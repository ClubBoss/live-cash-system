import { practicalDecisionById, practicalDecisions } from "../content/practical-mastery";
import { classifyPracticalAdaptiveNeed, decisionMatchesAdaptiveNeed, type PracticalPerformanceSample } from "./practical-adaptive-repair";
import { buildIntegratedSession, supportedIntegratedSkillIds, type IntegratedSessionItem } from "./practical-integrated-session";
import type { PracticalMasteryState } from "./practical-mastery-core";

export function buildAdaptiveIntegratedSession(state:PracticalMasteryState,now=new Date(),size=8,performance:PracticalPerformanceSample[]=[]):IntegratedSessionItem[]{
  const base=buildIntegratedSession(state,now,size);
  const used=new Set<string>();
  const adaptive:IntegratedSessionItem[]=[];
  const needs=supportedIntegratedSkillIds(state)
    .map((skillId)=>classifyPracticalAdaptiveNeed(state,skillId,performance))
    .filter((need)=>need.need!=="NONE")
    .sort((a,b)=>b.priority-a.priority||a.skillId.localeCompare(b.skillId));

  for(const need of needs){
    if(adaptive.length>=Math.ceil(size/2)) break;
    const latest=[...state.attempts].reverse().find((attempt)=>attempt.skillId===need.skillId)??null;
    const pool=practicalDecisions.filter((decision)=>decision.skillId===need.skillId&&decisionMatchesAdaptiveNeed(decision,need)&&decision.id!==latest?.decisionId);
    const perceptualIds=new Set((awaitlessTableDecisionIds()).filter((id)=>practicalDecisionById.get(id)?.skillId===need.skillId));
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

function awaitlessTableDecisionIds():string[]{
  // Kept local to avoid browser/runtime state and preserve deterministic scheduler tests.
  return [
    "PM-PERC-FND06-1","PM-PERC-FND06-2","PM-PERC-BL03-1","PM-PERC-BL03-2","PM-PERC-BL04-1","PM-PERC-BL04-2",
    "PM-PERC-BOARD-1","PM-PERC-BOARD-2","PM-PERC-RUNOUT-1","PM-PERC-RUNOUT-2","PM-PERC-3BP05-1","PM-PERC-3BP05-2",
    "PM-PERC-MW01-1","PM-PERC-MW01-2","PM-PERC-DEEP03-1","PM-PERC-DEEP03-2","PM-PERC-RIV03-1","PM-PERC-RIV03-2","PM-PERC-EXP01-1","PM-PERC-EXP01-2",
    "PM-B3-PF01-101","PM-B3-PF01-103","PM-B3-PF04-101","PM-B3-PF04-103","PM-B3-PF06-101","PM-B3-PF06-103","PM-B3-PF07-101","PM-B3-PF07-103",
    "PM-B3-OOP02-101","PM-B3-OOP02-103","PM-B3-IP01-101","PM-B3-IP01-103","PM-B3-TURN02-101","PM-B3-TURN02-103","PM-B3-TURN03-101","PM-B3-TURN03-103",
    "PM-B3-RIV01-101","PM-B3-RIV01-103","PM-B3-MW02-101","PM-B3-MW02-103","PM-B3-DEEP01-101","PM-B3-DEEP01-103",
  ];
}
