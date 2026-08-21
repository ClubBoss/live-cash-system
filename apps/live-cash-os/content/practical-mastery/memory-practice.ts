import { practicalRuleById, type PracticalRule } from "./mental-model";

export type PracticalMemoryPracticeStage =
  | "PREDICT"
  | "EXPLAIN"
  | "ONE_VARIABLE_TRANSFER"
  | "HIDDEN_CUE_RETRIEVAL";

export type PracticalMemoryPracticePrompt = {
  ruleId: string;
  stage: PracticalMemoryPracticeStage;
  promptRu: string;
  promptEn: string;
  scaffoldVisible: boolean;
};

export function memoryPracticePrompt(rule: PracticalRule, stage: PracticalMemoryPracticeStage): PracticalMemoryPracticePrompt {
  if (stage === "PREDICT") {
    return {
      ruleId: rule.id,
      stage,
      promptRu: `${rule.triggerRu} До объяснения предскажи: куда должно сдвинуться решение и почему?`,
      promptEn: `${rule.triggerEn} Before the explanation, predict: which way should the decision move, and why?`,
      scaffoldVisible: true,
    };
  }
  if (stage === "EXPLAIN") {
    return {
      ruleId: rule.id,
      stage,
      promptRu: `Default: ${rule.defaultRu} Почему: ${rule.whyRu}`,
      promptEn: `Default: ${rule.defaultEn} Why: ${rule.whyEn}`,
      scaffoldVisible: true,
    };
  }
  if (stage === "ONE_VARIABLE_TRANSFER") {
    return {
      ruleId: rule.id,
      stage,
      promptRu: `Измени одну переменную: ${rule.transferCueRu} Назови, что изменилось в механизме, а что осталось прежним.`,
      promptEn: `Change one variable: ${rule.transferCueEn} Name what changed in the mechanism and what stayed stable.`,
      scaffoldVisible: true,
    };
  }
  return {
    ruleId: rule.id,
    stage,
    promptRu: "Без названия темы и без чек-листа: какой сигнал здесь важен, что он означает и куда двигает решение?",
    promptEn: "Without a topic label or checklist: which signal matters here, what does it mean, and which way does it move the decision?",
    scaffoldVisible: false,
  };
}

export function memoryPracticeSequence(ruleId: string): PracticalMemoryPracticePrompt[] {
  const rule = practicalRuleById.get(ruleId);
  if (!rule) return [];
  return (["PREDICT", "EXPLAIN", "ONE_VARIABLE_TRANSFER", "HIDDEN_CUE_RETRIEVAL"] as const).map((stage) => memoryPracticePrompt(rule, stage));
}
