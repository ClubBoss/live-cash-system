export const CONTENT_QUALITY_STATUS = {
  geometry: "GOLD_ACCEPTED",
  preflop: "VALIDATION_PENDING",
  blinds: "VALIDATION_PENDING",
  filtering: "VALIDATION_PENDING",
  shape: "VALIDATION_PENDING",
  aggression: "VALIDATION_PENDING",
  ancestry: "VALIDATION_PENDING",
  multiway: "VALIDATION_PENDING",
  river: "VALIDATION_PENDING",
  evidence: "VALIDATION_PENDING",
  transfer: "VALIDATION_PENDING",
} as const;

export type ContentQualityStatus = (typeof CONTENT_QUALITY_STATUS)[keyof typeof CONTENT_QUALITY_STATUS];
