import type { LocaleCode } from "../../lib/model";
import { applyGeometryLocale } from "./geometry-locale";
import { applyWave3PriorityLocale } from "./wave3-priority-gold";
import { applyWave4CurriculumLocale } from "./wave4-curriculum-gold";
import { applyWave4FinalEditorialLocale } from "./wave4-final-editorial";
import { applyWave5PracticeCopy } from "./wave5-practice-copy";
import { applyWave4RFinalLanguage } from "./wave4r-final-language";

/**
 * Applies the approved bilingual corpus directly before React renders the locale.
 * The final Wave 4R pass is language-only and is the last authority for repaired
 * learner-facing wording; it must not change strategic identities or state.
 */
export function applyLocaleData(locale: LocaleCode) {
  applyGeometryLocale(locale);
  applyWave3PriorityLocale(locale);
  applyWave4CurriculumLocale(locale);
  applyWave4FinalEditorialLocale(locale);
  applyWave5PracticeCopy(locale);
  applyWave4RFinalLanguage(locale);
}
