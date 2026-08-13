import { diagnosticT1 } from "../content/diagnostic";
import { drillById } from "../content/modules";
import type { DiagnosticRawResponse, ModuleId } from "./model-core";

export type DiagnosticFeedbackLevel = "STRONG" | "FRAGILE" | "NEEDS_WORK" | "UNCERTAIN";

export type DiagnosticItemAssessment = {
  itemId: string;
  drillId: string;
  moduleId: ModuleId;
  level: DiagnosticFeedbackLevel;
  actionOk: boolean;
  reasonOk: boolean;
  confidence: number;
  selectedActionId: string;
  selectedReasonId: string;
};

export type DiagnosticAssessment = {
  structured: boolean;
  items: DiagnosticItemAssessment[];
  priorityModules: ModuleId[];
};

function itemDrill(itemId: string) {
  const item = diagnosticT1.find((candidate) => candidate.id === itemId);
  return item ? drillById[item.drillId] ?? null : null;
}

export function isStructuredDiagnosticResponse(response: DiagnosticRawResponse): boolean {
  const drill = itemDrill(response.item_id);
  return Boolean(drill
    && drill.actionOptions.some((option) => option.id === response.answer)
    && drill.reasonOptions.some((option) => option.id === response.reasoning));
}

export function assessDiagnosticResponses(responses: DiagnosticRawResponse[]): DiagnosticAssessment {
  if (responses.length !== diagnosticT1.length || !responses.every(isStructuredDiagnosticResponse)) {
    return { structured: false, items: [], priorityModules: [] };
  }
  const items = responses.map((response): DiagnosticItemAssessment => {
    const drill = itemDrill(response.item_id)!;
    const actionOk = response.answer === drill.correctActionId;
    const reasonOk = response.reasoning === drill.correctReasonId;
    const level: DiagnosticFeedbackLevel = !actionOk
      ? "NEEDS_WORK"
      : !reasonOk
        ? "FRAGILE"
        : response.confidence < 50
          ? "UNCERTAIN"
          : "STRONG";
    return {
      itemId: response.item_id,
      drillId: drill.id,
      moduleId: drill.moduleId,
      level,
      actionOk,
      reasonOk,
      confidence: response.confidence,
      selectedActionId: response.answer,
      selectedReasonId: response.reasoning,
    };
  });
  const scores = new Map<ModuleId, number>();
  for (const item of items) {
    const weight = item.level === "NEEDS_WORK" ? 3 : item.level === "FRAGILE" ? 2 : item.level === "UNCERTAIN" ? 1 : 0;
    const highConfidenceMiss = (!item.actionOk || !item.reasonOk) && item.confidence >= 75 ? 1 : 0;
    scores.set(item.moduleId, (scores.get(item.moduleId) ?? 0) + weight + highConfidenceMiss);
  }
  const priorityModules = [...scores.entries()]
    .filter(([, score]) => score > 0)
    .sort((left, right) => right[1] - left[1])
    .slice(0, 2)
    .map(([moduleId]) => moduleId);
  return { structured: true, items, priorityModules };
}

export function diagnosticFeedbackLevelLabel(level: DiagnosticFeedbackLevel, locale: "ru" | "en"): string {
  const labels = locale === "ru"
    ? { STRONG: "Сильный сигнал", FRAGILE: "Хрупкое понимание", NEEDS_WORK: "Нужно разобрать", UNCERTAIN: "Верно, но неуверенно" }
    : { STRONG: "Strong signal", FRAGILE: "Fragile reasoning", NEEDS_WORK: "Needs work", UNCERTAIN: "Correct but uncertain" };
  return labels[level];
}
