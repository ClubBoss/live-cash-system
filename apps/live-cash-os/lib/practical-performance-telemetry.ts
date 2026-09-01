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

const PRACTICAL_STIMULUS_MODES = ["FIRST_JOURNEY", "TEXT_MIXED", "PERCEPTUAL_TABLE", "REAL_HAND"] as const;
const PRACTICAL_SCAFFOLD_VALUES = ["guided", "reduced", "hidden"] as const;

// Semantic validity authority for a persisted PracticalPerformanceEvent —
// everything provably derivable from the event's own fields, matching what
// createPracticalPerformanceEvent can legitimately produce. actionId/reasonId
// are not persisted on the event (only the derived correctness booleans), and
// call sites do not share a strict id/timestamp key with the mastery-side
// attempt record (the perceptual submit path records that attempt and this
// event from two separate `new Date()` calls, not one shared instant) — so
// this is intentionally an independent telemetry authority, never
// cross-validated against mastery evidence. This module stays free of any
// dependency on the mastery-state type by design (see the B7 separate-storage-truth
// test); see SELF_CONSISTENT_FORGED_PERFORMANCE_ADJUDICATION in the repair report.
export function isSemanticallyValidPracticalPerformanceEvent(event: unknown): event is PracticalPerformanceEvent {
  if (!event || typeof event !== "object" || Array.isArray(event)) return false;
  const candidate = event as Record<string, unknown>;
  if (typeof candidate.id !== "string" || candidate.id.length === 0) return false;
  if (typeof candidate.decisionId !== "string" || typeof candidate.skillId !== "string") return false;
  if (typeof candidate.mode !== "string" || !PRACTICAL_STIMULUS_MODES.includes(candidate.mode as typeof PRACTICAL_STIMULUS_MODES[number])) return false;
  if (candidate.scaffold !== undefined && (typeof candidate.scaffold !== "string" || !PRACTICAL_SCAFFOLD_VALUES.includes(candidate.scaffold as typeof PRACTICAL_SCAFFOLD_VALUES[number]))) return false;
  if (typeof candidate.startedAt !== "string" || typeof candidate.answeredAt !== "string") return false;
  const startedMs = Date.parse(candidate.startedAt);
  const answeredMs = Date.parse(candidate.answeredAt);
  if (!Number.isFinite(startedMs) || new Date(startedMs).toISOString() !== candidate.startedAt) return false;
  if (!Number.isFinite(answeredMs) || new Date(answeredMs).toISOString() !== candidate.answeredAt) return false;
  if (startedMs > answeredMs) return false;
  if (typeof candidate.responseMs !== "number" || !Number.isInteger(candidate.responseMs) || candidate.responseMs < 0) return false;
  if (candidate.responseMs !== answeredMs - startedMs) return false;
  if (typeof candidate.confidence !== "number" || !Number.isInteger(candidate.confidence) || candidate.confidence < 0 || candidate.confidence > 100) return false;
  if (typeof candidate.actionCorrect !== "boolean" || typeof candidate.reasonCorrect !== "boolean" || typeof candidate.correct !== "boolean") return false;
  if (candidate.correct !== (candidate.actionCorrect && candidate.reasonCorrect)) return false;
  if (typeof candidate.kind !== "string") return false;
  const decision = practicalDecisionById.get(candidate.decisionId);
  if (!decision || decision.skillId !== candidate.skillId || decision.kind !== candidate.kind) return false;
  if (candidate.id !== `${candidate.decisionId}:${candidate.answeredAt}`) return false;
  return true;
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
