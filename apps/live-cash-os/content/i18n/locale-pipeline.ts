import { diagnosticT1 } from "../diagnostic";
import type { LocaleCode } from "../../lib/model";
import { diagnosticEnglish } from "./runtime";
import { applyGeometryLocale } from "./geometry-locale";
import { applyWave3PriorityLocale } from "./wave3-priority-gold";
import { applyWave4CurriculumLocale } from "./wave4-curriculum-gold";
import { applyWave4FinalEditorialLocale } from "./wave4-final-editorial";
import { applyWave5PracticeCopy } from "./wave5-practice-copy";
import { applyWave4RFinalLanguage } from "./wave4r-final-language";
import { applyNoviceTerminologyCopy } from "./novice-scaffold";
import { applyFinalPlusEvCopy } from "./final-plus-ev";
import { applyDecisionTransferIntegrity } from "./decision-transfer-integrity";
import { applyDecisionOptionBalance } from "./decision-option-balance";
import { applyFinalLearningIntegrityClosure } from "./final-learning-integrity";

function applyDiagnosticIntegrityLabels() {
  diagnosticT1.forEach((item, index) => {
    item.title = `Диагностический спот ${index + 1}`;
    if (diagnosticEnglish[item.id]) diagnosticEnglish[item.id].title = `Diagnostic spot ${index + 1}`;
  });
}

/**
 * Applies the bilingual corpus before React renders the locale. Wave 4R remains
 * the broad editorial pass; N1 then applies bounded novice-comprehension wording,
 * followed by final low-risk clarity, concrete decision transfer, compact option
 * balancing, and the final learning-integrity closure. None of these deterministic
 * layers create human approval or change stable strategy/evidence identities.
 */
export function applyLocaleData(locale: LocaleCode) {
  applyGeometryLocale(locale);
  applyWave3PriorityLocale(locale);
  applyWave4CurriculumLocale(locale);
  applyWave4FinalEditorialLocale(locale);
  applyWave5PracticeCopy(locale);
  applyWave4RFinalLanguage(locale);
  applyNoviceTerminologyCopy(locale);
  applyFinalPlusEvCopy(locale);
  applyDecisionTransferIntegrity(locale);
  applyDecisionOptionBalance(locale);
  applyFinalLearningIntegrityClosure(locale);
  applyDiagnosticIntegrityLabels();
}
