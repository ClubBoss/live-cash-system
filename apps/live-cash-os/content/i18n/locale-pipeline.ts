import { diagnosticT1 } from "../diagnostic";
import { syncDiagnosticCompatibility } from "../diagnostic";
import type { LocaleCode } from "../../lib/model";
import { diagnosticEnglish } from "./runtime";
import { applyGeometryLocale } from "./geometry-locale";
import { applyWave3PriorityLocale } from "./wave3-priority-gold";
import { applyWave4CurriculumLocale } from "./wave4-curriculum-gold";
import { applyWave4FinalEditorialLocale } from "./wave4-final-editorial";
import { applyWave5PracticeCopy } from "./wave5-practice-copy";
import { applyWave4RFinalLanguage } from "./wave4r-final-language";
import { applyNoviceTerminologyCopy } from "./novice-scaffold";
import { applyFinalLanguagePolish, applyFinalPlusEvCopy } from "./final-plus-ev";
import { applyDecisionTransferIntegrity } from "./decision-transfer-integrity";
import { applyDecisionOptionBalance } from "./decision-option-balance";
import { applyFinalLearningIntegrityClosure } from "./final-learning-integrity";
import { applyStimulusGeneralisationMicro, resetStimulusGeneralisationMicro } from "./stimulus-generalisation-micro";
import { applyPokerNativeTerminologyRebalance } from "./poker-native-terminology-rebalance";
import { applyDecisionComprehensionClosure } from "./decision-comprehension-closure";

export function applyLocaleData(locale: LocaleCode) {
  resetStimulusGeneralisationMicro();
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
  applyStimulusGeneralisationMicro(locale);
  applyFinalLanguagePolish(locale);
  applyPokerNativeTerminologyRebalance(locale);
  applyDecisionComprehensionClosure(locale);

  function applyDiagnosticIntegrityLabels() {
    syncDiagnosticCompatibility(locale);
    diagnosticT1.forEach((item, index) => {
      if (locale === "ru") item.title = `Диагностический спот ${index + 1}`;
      else item.title = `Diagnostic spot ${index + 1}`;
      if (locale !== "en") return;
      diagnosticEnglish[item.id].title = `Diagnostic spot ${index + 1}`;
      diagnosticEnglish[item.id].prompt = item.prompt;
    });
  }

  applyDiagnosticIntegrityLabels();
}
