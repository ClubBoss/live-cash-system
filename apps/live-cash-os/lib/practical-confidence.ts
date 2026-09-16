export type PracticalConfidenceProvenance = "SELF_REPORT" | "NOT_CAPTURED";

export function isPracticalConfidenceProvenance(value: unknown): value is PracticalConfidenceProvenance {
  return value === "SELF_REPORT" || value === "NOT_CAPTURED";
}

export function practicalSelfReportedConfidence(value: {
  confidence: number;
  confidenceProvenance?: PracticalConfidenceProvenance;
}): number | null {
  return value.confidenceProvenance === "SELF_REPORT" ? value.confidence : null;
}

export function hasHighPracticalSelfReportedConfidence(
  value: {
    confidence: number;
    confidenceProvenance?: PracticalConfidenceProvenance;
  },
  threshold: number,
): boolean {
  const confidence = practicalSelfReportedConfidence(value);
  return confidence !== null && confidence >= threshold;
}
