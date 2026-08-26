import {
  learnerPresentationLeakClasses,
  sanitizeLearnerPresentationText,
  type LearnerPresentationLeakClass,
  type LearnerPresentationLocale,
} from "./learner-presentation-firewall";

export type LearnerAccessibilityAttributeLeakClass = LearnerPresentationLeakClass | "OPAQUE_RECORD_ID";

const OPAQUE_RECORD_ID_SOURCE = String.raw`(?:explain|field|review)-\d{10,}-[a-z0-9]{5,}`;

function opaqueRecordIdPattern(): RegExp {
  return new RegExp(`\\b${OPAQUE_RECORD_ID_SOURCE}\\b`, "giu");
}

export function learnerAccessibilityAttributeLeakClasses(value: string): LearnerAccessibilityAttributeLeakClass[] {
  const classes: LearnerAccessibilityAttributeLeakClass[] = [...learnerPresentationLeakClasses(value)];
  if (opaqueRecordIdPattern().test(value)) classes.push("OPAQUE_RECORD_ID");
  return classes;
}

export function sanitizeLearnerAccessibilityAttribute(
  value: string,
  locale: LearnerPresentationLocale,
): string {
  if (!value) return value;
  return sanitizeLearnerPresentationText(value, locale)
    .replace(opaqueRecordIdPattern(), "")
    .replace(/[ \t]{2,}/gu, " ")
    .replace(/\s+([,.;:!?])/gu, "$1")
    .trim();
}
