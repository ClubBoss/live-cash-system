import type { PracticalEvidenceStage } from "../content/practical-mastery";
import { practicalSourceGapBySkillId, type PracticalSourceGapStatus } from "../content/practical-mastery/source-gaps";
import { practicalSkillCorpusCanReach } from "./practical-mastery-core";

export type PracticalLearnerLocale = "ru" | "en";

const STAGE_ORDER: readonly PracticalEvidenceStage[] = [
  "SOURCE_SUPPORTED",
  "CONCEPT_TAUGHT",
  "RECOGNITION_TRAINED",
  "DECISION_TRAINED",
  "CHANGED_NODE_TRANSFER",
  "BOUNDARY_TESTED",
  "DELAYED_RETRIEVAL",
  "REAL_HAND_TRANSFER",
];

export const PRACTICAL_EVIDENCE_STAGE_LABELS: Readonly<Record<PracticalLearnerLocale, Record<PracticalEvidenceStage, string>>> = {
  ru: {
    SOURCE_SUPPORTED: "ещё не начато",
    CONCEPT_TAUGHT: "механизм показан",
    RECOGNITION_TRAINED: "распознавание подтверждено на разных ситуациях",
    DECISION_TRAINED: "самостоятельные решения подтверждены",
    CHANGED_NODE_TRANSFER: "перенос подтвержден на изменённых условиях",
    BOUNDARY_TESTED: "границы правила проверены",
    DELAYED_RETRIEVAL: "воспроизведено после паузы",
    REAL_HAND_TRANSFER: "подтверждено в разобранной реальной руке",
  },
  en: {
    SOURCE_SUPPORTED: "not started",
    CONCEPT_TAUGHT: "mechanism introduced",
    RECOGNITION_TRAINED: "recognition confirmed across distinct situations",
    DECISION_TRAINED: "independent decisions confirmed",
    CHANGED_NODE_TRANSFER: "transfer confirmed in changed conditions",
    BOUNDARY_TESTED: "rule boundaries checked",
    DELAYED_RETRIEVAL: "recalled after a delay",
    REAL_HAND_TRANSFER: "supported by a reviewed real hand",
  },
};

export function practicalEvidenceLabel(locale: PracticalLearnerLocale, stage: PracticalEvidenceStage): string {
  return PRACTICAL_EVIDENCE_STAGE_LABELS[locale][stage];
}

function sourceCeiling(status: PracticalSourceGapStatus | undefined): PracticalEvidenceStage | null {
  if (status === "SOURCE_BLOCKED") return "SOURCE_SUPPORTED";
  if (status === "PARTIAL") return "RECOGNITION_TRAINED";
  return null;
}

export function effectivePracticalLearnerTarget(
  skillId: string,
  authoredTarget: PracticalEvidenceStage,
  currentStage: PracticalEvidenceStage = "SOURCE_SUPPORTED",
): { stage: PracticalEvidenceStage; sourceLimited: boolean; sourceStatus: PracticalSourceGapStatus | "SUPPORTED" } {
  const sourceStatus = practicalSourceGapBySkillId.get(skillId)?.status ?? "SUPPORTED";
  const ceiling = sourceCeiling(sourceStatus);
  if (!ceiling) return { stage: authoredTarget, sourceLimited: false, sourceStatus };
  const boundedTarget = STAGE_ORDER.indexOf(authoredTarget) > STAGE_ORDER.indexOf(ceiling) ? ceiling : authoredTarget;
  // A source ceiling is an upper bound, not proof that the current corpus has a
  // grantable path all the way to that bound. If the bounded stage is not
  // reachable with admitted evidence, show the learner the stage the product
  // can honestly stand behind now instead of inventing a next requirement.
  const stage = practicalSkillCorpusCanReach(skillId, boundedTarget) ? boundedTarget : currentStage;
  return { stage, sourceLimited: true, sourceStatus };
}
