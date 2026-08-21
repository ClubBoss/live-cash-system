import { practicalDecisionById } from "../content/practical-mastery";

export type PracticalStimulusMode="FIRST_JOURNEY"|"TEXT_MIXED"|"PERCEPTUAL_TABLE"|"REAL_HAND";
export type PracticalPerformanceEvent={
  id:string; decisionId:string; skillId:string; mode:PracticalStimulusMode;
  startedAt:string; answeredAt:string; responseMs:number; confidence:number;
  actionCorrect:boolean; reasonCorrect:boolean; correct:boolean;
  kind:"recognition"|"decision"|"changed"|"boundary"|"mixed";
  scaffold?:"guided"|"reduced"|"hidden";
};

export function createPracticalPerformanceEvent(input:{decisionId:string;actionId:string;reasonId:string;confidence:number;startedAt:Date;answeredAt?:Date;mode:PracticalStimulusMode;scaffold?:PracticalPerformanceEvent["scaffold"]}):PracticalPerformanceEvent{
 const decision=practicalDecisionById.get(input.decisionId); if(!decision) throw new Error(`Unknown practical decision: ${input.decisionId}`);
 const answeredAt=input.answeredAt??new Date(); const actionCorrect=input.actionId===decision.correctActionId; const reasonCorrect=input.reasonId===decision.correctReasonId;
 return {id:`${input.decisionId}:${answeredAt.toISOString()}`,decisionId:input.decisionId,skillId:decision.skillId,mode:input.mode,startedAt:input.startedAt.toISOString(),answeredAt:answeredAt.toISOString(),responseMs:Math.max(0,answeredAt.getTime()-input.startedAt.getTime()),confidence:Math.max(0,Math.min(100,Math.round(input.confidence))),actionCorrect,reasonCorrect,correct:actionCorrect&&reasonCorrect,kind:decision.kind,scaffold:input.scaffold};
}

function median(values:number[]):number|null{if(!values.length)return null;const sorted=[...values].sort((a,b)=>a-b);const mid=Math.floor(sorted.length/2);return sorted.length%2?sorted[mid]:(sorted[mid-1]+sorted[mid])/2;}
function rate(events:PracticalPerformanceEvent[],predicate:(event:PracticalPerformanceEvent)=>boolean):number|null{return events.length?events.filter(predicate).length/events.length:null;}

export function summarizePracticalPerformance(events:PracticalPerformanceEvent[]){
 const hidden=events.filter((event)=>event.scaffold==="hidden"||event.mode==="TEXT_MIXED");
 const transfer=events.filter((event)=>event.kind==="changed"||event.kind==="mixed");
 const boundary=events.filter((event)=>event.kind==="boundary");
 const perceptual=events.filter((event)=>event.mode==="PERCEPTUAL_TABLE");
 const calibration=events.map((event)=>Math.abs(event.confidence-(event.correct?100:0)));
 return {
  samples:events.length,
  actionAccuracy:rate(events,(event)=>event.actionCorrect),
  reasonAccuracy:rate(events,(event)=>event.reasonCorrect),
  combinedAccuracy:rate(events,(event)=>event.correct),
  medianResponseMs:median(events.map((event)=>event.responseMs)),
  hiddenCueAccuracy:rate(hidden,(event)=>event.correct),
  transferAccuracy:rate(transfer,(event)=>event.correct),
  boundaryAccuracy:rate(boundary,(event)=>event.correct),
  perceptualAccuracy:rate(perceptual,(event)=>event.correct),
  medianPerceptualResponseMs:median(perceptual.map((event)=>event.responseMs)),
  meanCalibrationError:calibration.length?calibration.reduce((sum,value)=>sum+value,0)/calibration.length:null,
 } as const;
}

export function parsePracticalPerformanceTelemetry(raw:string|null):PracticalPerformanceEvent[]{
 if(!raw)return[];try{const value=JSON.parse(raw);if(!Array.isArray(value))return[];return value.filter((event)=>event&&typeof event.decisionId==="string"&&typeof event.responseMs==="number");}catch{return[];}
}
