import { practicalDecisionById } from "../content/practical-mastery";
import { hasHighPracticalSelfReportedConfidence } from "./practical-confidence";
import { isCurrentPracticalEvidenceAttempt, latestAttemptsByDecision, practicalSuccessfulDecisionIds, type PracticalMasteryState } from "./practical-mastery-core";
import { practicalEvidenceFamilyId, practicalEvidenceScenarioId } from "./practical-stimulus-identity";

export type PracticalScaffoldLevel = "guided" | "reduced" | "hidden";

function successfulSemanticEvidenceByKind(state:PracticalMasteryState,skillId:string,kinds:string[]){
  const families=new Set<string>(); const scenarios=new Set<string>();
  for(const decisionId of practicalSuccessfulDecisionIds(state,skillId)){
    const decision=practicalDecisionById.get(decisionId);
    if(!decision||decision.skillId!==skillId||!kinds.includes(decision.kind)) continue;
    families.add(practicalEvidenceFamilyId(decision)); scenarios.add(practicalEvidenceScenarioId(decision));
  }
  return {families:families.size,scenarios:scenarios.size};
}

function latestSkillAttempt(state:PracticalMasteryState,skillId:string){
  const latest=[...latestAttemptsByDecision(state,skillId).values()].at(-1)??null;
  return latest&&isCurrentPracticalEvidenceAttempt(latest)?latest:null;
}

export function recommendedPracticalScaffold(state:PracticalMasteryState,skillId:string):PracticalScaffoldLevel{
  const progress=state.skills[skillId];
  if(!progress?.conceptTaught) return "guided";
  const latest=latestSkillAttempt(state,skillId);
  if(latest&&!latest.correct){
    if(hasHighPracticalSelfReportedConfidence(latest,75)) return "guided";
    return "reduced";
  }
  const recognition=successfulSemanticEvidenceByKind(state,skillId,["recognition"]);
  const transfer=successfulSemanticEvidenceByKind(state,skillId,["changed","mixed"]);
  const boundary=successfulSemanticEvidenceByKind(state,skillId,["boundary"]);
  if(recognition.families<2||recognition.scenarios<2) return "guided";
  if(transfer.families<2||transfer.scenarios<2||boundary.families<1) return "reduced";
  return "hidden";
}

export function effectivePracticalScaffold(state:PracticalMasteryState,skillId:string,contentDefault:PracticalScaffoldLevel):PracticalScaffoldLevel{
  const evidence=recommendedPracticalScaffold(state,skillId);
  const order:PracticalScaffoldLevel[]=["guided","reduced","hidden"];
  return order[Math.min(order.indexOf(evidence),order.indexOf(contentDefault))];
}

export function practicalScaffoldCue(level:PracticalScaffoldLevel,locale:"ru"|"en"){
  if(level==="guided") return locale==="ru"?"Найди один сигнал, который меняет ветку: цена, позиция, глубина, история действий или диапазоны.":"Find the one signal that changes the branch: price, position, depth, action history, or ranges.";
  if(level==="reduced") return locale==="ru"?"Что здесь изменяет решение?":"What changes the decision here?";
  return "";
}
