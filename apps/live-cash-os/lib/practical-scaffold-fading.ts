import { practicalDecisionById } from "../content/practical-mastery";
import type { PracticalMasteryState } from "./practical-mastery-core";

export type PracticalScaffoldLevel = "guided" | "reduced" | "hidden";

function successfulDistinctByKind(state:PracticalMasteryState,skillId:string,kinds:string[]):number{
  const ids=new Set(state.attempts.filter((attempt)=>attempt.skillId===skillId&&attempt.correct).filter((attempt)=>{
    const decision=practicalDecisionById.get(attempt.decisionId);
    return decision?kinds.includes(decision.kind):false;
  }).map((attempt)=>attempt.decisionId));
  return ids.size;
}

function latestSkillAttempt(state:PracticalMasteryState,skillId:string){
  return [...state.attempts].reverse().find((attempt)=>attempt.skillId===skillId)??null;
}

export function recommendedPracticalScaffold(state:PracticalMasteryState,skillId:string):PracticalScaffoldLevel{
  const progress=state.skills[skillId];
  if(!progress?.conceptTaught) return "guided";
  const latest=latestSkillAttempt(state,skillId);
  if(latest&&!latest.correct){
    if(latest.confidence>=75) return "guided";
    return "reduced";
  }
  const recognition=successfulDistinctByKind(state,skillId,["recognition"]);
  const transfer=successfulDistinctByKind(state,skillId,["changed","mixed"]);
  const boundary=successfulDistinctByKind(state,skillId,["boundary"]);
  if(recognition<2) return "guided";
  if(transfer<2||boundary<1) return "reduced";
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
