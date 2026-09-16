import { allPracticalTableStates, isOrdinaryLearnerDecision, practicalDecisionById, practicalDecisions } from "../content/practical-mastery";
import { classifyPracticalAdaptiveNeed, decisionMatchesAdaptiveNeed, type PracticalPerformanceSample } from "./practical-adaptive-repair";
import { buildIntegratedSession, supportedIntegratedSkillIds, type IntegratedSessionItem } from "./practical-integrated-session";
import { isSemanticallyValidPracticalAttempt, type PracticalMasteryState } from "./practical-mastery-core";
import { recentlyAttemptedDecisionIds } from "./practical-repeat-window";
import { decisionHasAuthoritativeVisibleChange } from "./practical-visible-scenario";
import { practicalEvidenceFamilyId, practicalEvidenceScenarioId, practicalScenarioFamilyId, practicalStimulusFamilyId } from "./practical-stimulus-identity";

function normalizeTransferLabel(item: IntegratedSessionItem): IntegratedSessionItem {
  if (item.reason !== "TRANSFER" || decisionHasAuthoritativeVisibleChange(item.decisionId)) return item;
  return {
    ...item,
    reason: "REINFORCE",
    whyAfterAnswer: "REINFORCE: no authoritative learner-visible changed condition is represented for this item.",
  };
}

export function isIntegratedFocusAdmissible(state: PracticalMasteryState, skillId: string): boolean {
  return supportedIntegratedSkillIds(state).includes(skillId) && practicalDecisions.some((decision) => decision.skillId === skillId && isOrdinaryLearnerDecision(decision));
}

// Canonical per-skill multiplicity contract for this module, matched by
// validIntegratedContinuity's persisted continuity cap (practical-profile-contract.ts):
//   BASE_MAX_PER_SKILL = 2            (buildIntegratedSession's own push() cap)
//   GENERIC_ADAPTIVE_MAX_PER_SKILL = 3 (buildGenericAdaptiveSession composes up
//                                        to 1 adaptive-need item with up to 2 base
//                                        items for the same skill; this 3 is the
//                                        accepted shipped ceiling, not a defect)
//   Focused rounds may exceed two items for one skill, but they may not pad
//   the round with repeated learner-facing stimuli. One scenario family is
//   capped at two items; exact stimulus families are unique inside the round.
function buildGenericAdaptiveSession(state:PracticalMasteryState,now:Date,size:number,performance:PracticalPerformanceSample[]):IntegratedSessionItem[]{
  const base=buildIntegratedSession(state,now,size);
  const used=new Set<string>();
  const usedStimulusFamilies=new Set<string>();
  const usedEvidenceScenarios=new Set<string>();
  const recentlyAttempted=recentlyAttemptedDecisionIds(state);
  const recentlyAttemptedFamilies=new Set([...recentlyAttempted].flatMap((decisionId)=>{
    const decision=practicalDecisionById.get(decisionId);
    return decision?[practicalEvidenceFamilyId(decision)]:[];
  }));
  const adaptive:IntegratedSessionItem[]=[];
  const perceptualIds=new Set(allPracticalTableStates.map((table)=>table.decisionId));
  const needs=supportedIntegratedSkillIds(state)
    .map((skillId)=>classifyPracticalAdaptiveNeed(state,skillId,performance))
    .filter((need)=>need.need!=="NONE")
    .sort((a,b)=>b.priority-a.priority||a.skillId.localeCompare(b.skillId));

  for(const need of needs){
    if(adaptive.length>=Math.ceil(size/2)) break;
    const latestPhysical=[...state.attempts].reverse().find((attempt)=>attempt.skillId===need.skillId)??null;
    const latest=latestPhysical&&isSemanticallyValidPracticalAttempt(latestPhysical)?latestPhysical:null;
    const latestDecision=latest?practicalDecisionById.get(latest.decisionId)??null:null;
    const latestFamily=latestDecision?practicalEvidenceFamilyId(latestDecision):null;
    const pool=practicalDecisions.filter((decision)=>isOrdinaryLearnerDecision(decision)&&decision.skillId===need.skillId&&decisionMatchesAdaptiveNeed(decision,need)&&practicalEvidenceFamilyId(decision)!==latestFamily&&!recentlyAttemptedFamilies.has(practicalEvidenceFamilyId(decision)));
    const decision=(need.preferPerceptual?pool.find((candidate)=>perceptualIds.has(candidate.id)):undefined)??pool[0];
    if(!decision||used.has(decision.id)||usedStimulusFamilies.has(practicalStimulusFamilyId(decision))||usedEvidenceScenarios.has(practicalEvidenceScenarioId(decision))) continue;
    const transferLike=need.need==="TRANSFER"||need.need==="BOUNDARY";
    const reason:IntegratedSessionItem["reason"]=need.need==="RECOGNITION"||need.need==="AUTOMATICITY"?"RECOGNITION":transferLike&&decisionHasAuthoritativeVisibleChange(decision.id)?"TRANSFER":need.need==="UNDEREXPOSED"||transferLike?"REINFORCE":"REPAIR";
    adaptive.push(normalizeTransferLabel({decisionId:decision.id,skillId:decision.skillId,priority:150+need.priority,reason,whyAfterAnswer:`${need.need}: ${need.reason}`,retentionTierDays:null}));
    used.add(decision.id);
    usedStimulusFamilies.add(practicalStimulusFamilyId(decision));
    usedEvidenceScenarios.add(practicalEvidenceScenarioId(decision));
  }

  for(const item of base){
    if(adaptive.length>=size) break;
    if(used.has(item.decisionId)) continue;
    const decision=practicalDecisionById.get(item.decisionId);
    if(!decision||usedStimulusFamilies.has(practicalStimulusFamilyId(decision))||usedEvidenceScenarios.has(practicalEvidenceScenarioId(decision))) continue;
    adaptive.push(normalizeTransferLabel(item));
    used.add(item.decisionId);
    usedStimulusFamilies.add(practicalStimulusFamilyId(decision));
    usedEvidenceScenarios.add(practicalEvidenceScenarioId(decision));
  }

  return adaptive.slice(0,size);
}

function focusItemForDecision(decisionId:string,skillId:string,index:number):IntegratedSessionItem{
  const decision=practicalDecisionById.get(decisionId);
  const reason:IntegratedSessionItem["reason"]=decision?.kind==="recognition"?"RECOGNITION":decisionHasAuthoritativeVisibleChange(decisionId)?"TRANSFER":"REINFORCE";
  return normalizeTransferLabel({
    decisionId,
    skillId,
    priority:140-index,
    reason,
    whyAfterAnswer:"FOCUSED: authoritative same-skill practice selected by the canonical focus-admissibility contract.",
    retentionTierDays:null,
  });
}

function buildFocusedIntegratedSession(state:PracticalMasteryState,now:Date,size:number,performance:PracticalPerformanceSample[],skillId:string):IntegratedSessionItem[]{
  if(!isIntegratedFocusAdmissible(state,skillId)) return [];
  const seeded=buildGenericAdaptiveSession(state,now,size,performance).filter((item)=>item.skillId===skillId);
  const used=new Set<string>();
  const usedStimulusFamilies=new Set<string>();
  const scenarioUse=new Map<string,number>();
  const focused:IntegratedSessionItem[]=[];
  const tryPush=(item:IntegratedSessionItem)=>{
    if(focused.length>=size||used.has(item.decisionId)) return;
    const decision=practicalDecisionById.get(item.decisionId);
    if(!decision) return;
    const stimulusFamily=practicalStimulusFamilyId(decision);
    const scenarioFamily=practicalScenarioFamilyId(decision);
    if(usedStimulusFamilies.has(stimulusFamily)||(scenarioUse.get(scenarioFamily)??0)>=2) return;
    focused.push(normalizeTransferLabel(item));
    used.add(item.decisionId);
    usedStimulusFamilies.add(stimulusFamily);
    scenarioUse.set(scenarioFamily,(scenarioUse.get(scenarioFamily)??0)+1);
  };
  for(const item of seeded) tryPush(item);
  const recentlyAttempted=recentlyAttemptedDecisionIds(state);
  const recentFamilies=new Set([...recentlyAttempted].flatMap((decisionId)=>{
    const decision=practicalDecisionById.get(decisionId);
    return decision?[practicalStimulusFamilyId(decision)]:[];
  }));
  const attemptedFamilies=new Set(state.attempts.filter((attempt)=>attempt.skillId===skillId&&isSemanticallyValidPracticalAttempt(attempt)).flatMap((attempt)=>{
    const decision=practicalDecisionById.get(attempt.decisionId);
    return decision?[practicalStimulusFamilyId(decision)]:[];
  }));
  const pool=practicalDecisions.filter((decision)=>isOrdinaryLearnerDecision(decision)&&decision.skillId===skillId);
  const ordered=[
    ...pool.filter((decision)=>!attemptedFamilies.has(practicalStimulusFamilyId(decision))),
    ...pool.filter((decision)=>attemptedFamilies.has(practicalStimulusFamilyId(decision))&&!recentFamilies.has(practicalStimulusFamilyId(decision))),
  ];
  for(const decision of ordered){
    if(focused.length>=size) break;
    tryPush(focusItemForDecision(decision.id,skillId,focused.length));
  }
  return focused.slice(0,size);
}

export function requestedIntegratedFocusItem(state:PracticalMasteryState,skillId:string):IntegratedSessionItem|null{
  if(!isIntegratedFocusAdmissible(state,skillId)) return null;
  const decision=practicalDecisions.find((candidate)=>candidate.skillId===skillId&&isOrdinaryLearnerDecision(candidate));
  return decision?focusItemForDecision(decision.id,skillId,0):null;
}

export function buildAdaptiveIntegratedSession(state:PracticalMasteryState,now=new Date(),size=8,performance:PracticalPerformanceSample[]=[],requestedSkillId?:string|null):IntegratedSessionItem[]{
  if(requestedSkillId) return buildFocusedIntegratedSession(state,now,size,performance,requestedSkillId);
  return buildGenericAdaptiveSession(state,now,size,performance);
}
