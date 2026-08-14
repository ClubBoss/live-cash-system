import { diagnosticT1 } from "../diagnostic";
import { moduleById } from "../modules";
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

function applyFinalLanguageParity(locale: LocaleCode) {
  if (locale !== "en") return;
  const drill = moduleById.multiway.drills.find((item) => item.id === "mul-05");
  if (!drill) throw new Error("Missing final-language parity drill mul-05");
  const correctReason = drill.reasonOptions.find((option) => option.id === drill.correctReasonId);
  if (!correctReason) throw new Error("Missing final-language parity reason mul-05");
  correctReason.text = "Repeated evidence updates that overcall range without erasing action order";
}

function applyDiagnosticIntegrityLabels() {
  diagnosticT1.forEach((item, index) => {
    item.title = `Диагностический спот ${index + 1}`;
    if (diagnosticEnglish[item.id]) diagnosticEnglish[item.id].title = `Diagnostic spot ${index + 1}`;
  });
}

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
  applyFinalLanguageParity(locale);
  applyDiagnosticIntegrityLabels();
}
