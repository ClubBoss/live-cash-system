import { practicalDecisionById, practicalSkillFamilies } from "../content/practical-mastery";
import type { CurrentPracticalMistake } from "./practical-current-mistakes";
import {
  validatePracticalFieldBinding,
  type PracticalFieldTransferNote,
} from "./practical-field-transfer";

export type PracticalImprovementLocale = "ru" | "en";

export type PracticalMistakeLearnerPresentation = Readonly<{
  pattern: string | null;
  evidenceCopy: string;
}>;

export function practicalMistakeLearnerPresentation(
  row: CurrentPracticalMistake,
  locale: PracticalImprovementLocale,
): PracticalMistakeLearnerPresentation {
  const decision = practicalDecisionById.get(row.representativeDecisionId);
  const labels: string[] = [];
  if (decision?.skillId === row.skillId) {
    for (const option of [...decision.actionOptions, ...decision.reasonOptions]) {
      if (option.misconception !== row.misconceptionId) continue;
      const text = locale === "ru" ? option.textRu : option.textEn;
      if (text && !labels.includes(text)) labels.push(text);
    }
  }

  const evidenceCopy = locale === "ru"
    ? row.evidenceCount >= 2
      ? row.highConfidenceEvidenceCount > 0
        ? "Эта ошибка повторяется, в том числе в ответах, где ты был уверен."
        : "Эта ошибка повторяется."
      : row.highConfidenceEvidenceCount > 0
        ? "Эта ошибка пока не закрыта, и в этом ответе ты был уверен."
        : "Эта ошибка пока не закрыта."
    : row.evidenceCount >= 2
      ? row.highConfidenceEvidenceCount > 0
        ? "This mistake is repeating, including in answers you felt confident about."
        : "This mistake is repeating."
      : row.highConfidenceEvidenceCount > 0
        ? "This mistake is still unresolved, and you were confident in this answer."
        : "This mistake is still unresolved.";

  return {
    pattern: labels.join(" · ") || null,
    evidenceCopy,
  };
}

export function reviewedRealHandRepairSkillIds(
  notes: readonly PracticalFieldTransferNote[],
): readonly string[] {
  const exact = new Set<string>();
  for (const note of notes) {
    if (note.status !== "REVIEWED_REPAIR" || note.reviewOutcome !== "REPAIR_REQUIRED") continue;
    const binding = validatePracticalFieldBinding(note.id, note.reviewerKind, note.practicalBinding);
    if (binding) exact.add(binding.practicalSkillId);
  }

  return practicalSkillFamilies
    .filter((skill) => exact.has(skill.id))
    .map((skill) => skill.id);
}
