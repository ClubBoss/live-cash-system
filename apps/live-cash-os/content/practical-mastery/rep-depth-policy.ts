export type PracticalRepDepthTier = "STANDARD" | "INTENSIVE";

export type PracticalRepDepthPolicy = {
  skillId: string;
  tier: PracticalRepDepthTier;
  rationale: string;
  targetRecognition: number;
  targetDirect: number;
  targetTransfer: number;
  targetBoundary: number;
  targetPerceptual: number;
};

const intensive = new Set([
  "PF-01","PF-04","PF-06","PF-07","BL-03","BL-04","W4-BOARD-01","W4-RUNOUT-01",
  "OOP-02","IP-01","3BP-05","TURN-02","TURN-03","RIV-01","RIV-03","MW-01","MW-02",
  "DEEP-01","DEEP-03","EXP-01",
]);

const rationaleBySkill: Record<string,string> = {
  "PF-01":"Frequent preflop origin decision with strong downstream range effects.",
  "PF-04":"High-frequency blind call node; price, origin, rake and realization interact.",
  "PF-06":"3-bet construction is a reusable preflop primitive across many live branches.",
  "PF-07":"Facing 3-bets has large mistake cost and strong sizing/position sensitivity.",
  "BL-03":"BB versus BTN is among the highest-frequency live blind nodes and was previously under transfer depth.",
  "BL-04":"Open-size sensitivity prevents memorized blind-defence autopilot.",
  "W4-BOARD-01":"Board×range ownership is a perceptual primitive reused across postflop.",
  "W4-RUNOUT-01":"Runout ancestry is reused on every later street.",
  "OOP-02":"Check-call/fold is a frequent OOP realization boundary.",
  "IP-01":"Range-vs-selective c-bet is a reusable IP flop primitive.",
  "3BP-05":"Role×board×size matrix prevents generic 3BP heuristics.",
  "TURN-02":"Turn barrel selection is frequent and transfer-sensitive.",
  "TURN-03":"Turn probes require ancestry/cap recognition and are easy to overgeneralize.",
  "RIV-01":"River value targeting directly affects realized winrate.",
  "RIV-03":"Bluff catching combines price, bluff supply, blockers and ancestry.",
  "MW-01":"Relative position is the core multiway geometry primitive.",
  "MW-02":"Multiway value thresholds are materially different from heads-up.",
  "DEEP-01":"150–200bb planning is common in target games and expensive when misapplied.",
  "DEEP-03":"Straddles change action order, working depth and SPR across the whole hand.",
  "EXP-01":"Evidence qualification governs every exploit deviation and must resist salience bias.",
};

export const practicalRepDepthPolicies: PracticalRepDepthPolicy[] = [...intensive].map((skillId) => ({
  skillId,
  tier:"INTENSIVE",
  rationale:rationaleBySkill[skillId],
  targetRecognition:3,
  targetDirect:4,
  targetTransfer:4,
  targetBoundary:1,
  targetPerceptual:2,
}));

export const practicalRepDepthPolicyBySkillId = new Map(practicalRepDepthPolicies.map((policy)=>[policy.skillId,policy]));

export function practicalRepDepthTierForSkill(skillId:string): PracticalRepDepthTier {
  return intensive.has(skillId)?"INTENSIVE":"STANDARD";
}

export function practicalRepDepthTargetForSkill(skillId:string){
  return practicalRepDepthPolicyBySkillId.get(skillId) ?? {
    skillId,
    tier:"STANDARD" as const,
    rationale:"Minimum honest evidence floor; expand only when additional variants have positive net EV.",
    targetRecognition:2,
    targetDirect:3,
    targetTransfer:2,
    targetBoundary:1,
    targetPerceptual:0,
  };
}
