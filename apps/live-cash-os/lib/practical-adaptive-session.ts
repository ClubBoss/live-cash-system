import { allPracticalTableStates, isOrdinaryLearnerDecision, practicalDecisionById, practicalDecisions } from "../content/practical-mastery";
import { classifyPracticalAdaptiveNeed, decisionMatchesAdaptiveNeed, type PracticalPerformanceSample } from "./practical-adaptive-repair";
import { buildIntegratedSession, supportedIntegratedSkillIds, type IntegratedSessionItem } from "./practical-integrated-session";
import { isSemanticallyValidPracticalAttempt, type PracticalMasteryState } from "./practical-mastery-core";
import { recentlyAttemptedDecisionIds } from "./practical-repeat-window";
import { decisionHasAuthoritativeVisibleChange } from "./practical-visible-scenario";

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
//   FOCUSED_CAN_EXCEED_2               (buildFocusedIntegratedSession intentionally
//                                        allows same-skill multiplicity beyond 2)
function buildGenericAdaptiveSession(state:PracticalMasteryState,now:Date,size:number,performance:PracticalPerformanceSample[]):IntegratedSessionItem[]{
  const base=buildIntegratedSession(state,now,size);
  const used=new Set<string>();
  const recentlyAttempted=recentlyAttemptedDecisionIds(state);
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
    const pool=practicalDecisions.filter((decision)=>isOrdinaryLearnerDecision(decision)&&decision.skillId===need.skillId&&decisionMatchesAdaptiveNeed(decision,need)&&decision.id!==latest?.decisionId&&!recentlyAttempted.has(decision.id));
    const decision=(need.preferPerceptual?pool.find((candidate)=>perceptualIds.has(candidate.id)):undefined)??pool[0];
    if(!decision||used.has(decision.id)) continue;
    const transferLike=need.need==="TRANSFER"||need.need==="BOUNDARY";
    const reason:IntegratedSessionItem["reason"]=need.need==="RECOGNITION"||need.need==="AUTOMATICITY"?"RECOGNITION":transferLike&&decisionHasAuthoritativeVisibleChange(decision.id)?"TRANSFER":need.need==="UNDEREXPOSED"||transferLike?"REINFORCE":"REPAIR";
    adaptive.push(normalizeTransferLabel({decisionId:decision.id,skillId:decision.skillId,priority:150+need.priority,reason,whyAfterAnswer:`${need.need}: ${need.reason}`,retentionTierDays:null}));
    used.add(decision.id);
  }

  for(const item of base){
    if(adaptive.length>=size) break;
    if(used.has(item.decisionId)) continue;
    adaptive.push(normalizeTransferLabel(item)); used.add(item.decisionId);
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
  const used=new Set(seeded.map((item)=>item.decisionId));
  const recentlyAttempted=recentlyAttemptedDecisionIds(state);
  const attempted=new Set(state.attempts.filter((attempt)=>attempt.skillId===skillId&&isSemanticallyValidPracticalAttempt(attempt)).map((attempt)=>attempt.decisionId));
  const pool=practicalDecisions.filter((decision)=>isOrdinaryLearnerDecision(decision)&&decision.skillId===skillId);
  const ordered=[
    ...pool.filter((decision)=>!attempted.has(decision.id)),
    ...pool.filter((decision)=>attempted.has(decision.id)&&!recentlyAttempted.has(decision.id)),
  ];
  const focused=[...seeded];
  for(const decision of ordered){
    if(focused.length>=size) break;
    if(used.has(decision.id)) continue;
    focused.push(focusItemForDecision(decision.id,skillId,focused.length));
    used.add(decision.id);
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
