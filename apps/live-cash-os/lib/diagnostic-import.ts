import type { MeasurementContext, ModuleId } from "./model";

export type DiagnosticScoreOutput = {
  schema_version: "score-0.2";
  scorer_version: string;
  learner_id: "current_learner";
  tranche_id: "T1";
  run_id: string;
  measurement_context: MeasurementContext;
  locale_at_start: "ru" | "en";
  submitted_at: string;
  responses_scored: 10;
  rerank_ready: true;
  module_summary: Record<string, { observed_error_rate: number; exposures: number; items: string[] }>;
  misconception_evidence: Record<string, { observations: number; high_confidence: number; items: string[] }>;
  tentative_priority_order: string[];
};

const LCM_TO_MODULE: Record<string, ModuleId> = {
  "LCM-01": "geometry",
  "LCM-02": "preflop",
  "LCM-03": "blinds",
  "LCM-04": "filtering",
  "LCM-05": "shape",
  "LCM-06": "aggression",
  "LCM-07": "ancestry",
  "LCM-08": "multiway",
  "LCM-09": "river",
  "LCM-10": "evidence",
  "LCM-11": "transfer",
};
const T1_IDS = new Set(Array.from({ length: 10 }, (_, index) => `LD-${String(index + 1).padStart(3, "0")}`));
const CANONICAL_MC = new Set(Array.from({ length: 30 }, (_, index) => `MC-${String(index + 1).padStart(3, "0")}`));
const CONTEXTS = new Set<MeasurementContext>([
  "COLD_BASELINE",
  "POST_LEARNING_DIAGNOSTIC",
  "MIXED_EXPOSURE_INVALID_FOR_BASELINE",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
function finite(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}
function exactKeys(value: Record<string, unknown>, allowed: string[], label: string) {
  const extras = Object.keys(value).filter((key) => !allowed.includes(key));
  if (extras.length) throw new Error(`${label} contains unknown fields: ${extras.join(", ")}`);
}

export function parseDiagnosticScore(value: unknown): DiagnosticScoreOutput {
  if (!isRecord(value)) throw new Error("Scorer output must be a JSON object.");
  exactKeys(value, [
    "schema_version",
    "scorer_version",
    "learner_id",
    "tranche_id",
    "run_id",
    "measurement_context",
    "locale_at_start",
    "submitted_at",
    "responses_scored",
    "rerank_ready",
    "module_summary",
    "misconception_evidence",
    "tentative_priority_order",
    "response_class_counts",
    "candidate_summary",
    "notes",
  ], "Scorer output");
  if (value.schema_version !== "score-0.2") throw new Error("Unsupported scorer schema. Expected score-0.2.");
  if (typeof value.scorer_version !== "string" || !/^0\.2\./u.test(value.scorer_version)) throw new Error("Unsupported or missing scorer version.");
  if (value.learner_id !== "current_learner") throw new Error("The scorer result belongs to another learner.");
  if (value.tranche_id !== "T1") throw new Error("Only a complete T1 scorer result can be imported here.");
  if (typeof value.run_id !== "string" || !/^t1-[A-Za-z0-9-]+$/u.test(value.run_id)) throw new Error("Invalid diagnostic run identity.");
  if (!CONTEXTS.has(value.measurement_context as MeasurementContext)) throw new Error("Invalid diagnostic measurement context.");
  if (value.locale_at_start !== "ru" && value.locale_at_start !== "en") throw new Error("Invalid diagnostic start locale.");
  if (typeof value.submitted_at !== "string" || Number.isNaN(Date.parse(value.submitted_at))) throw new Error("Invalid diagnostic submission timestamp.");
  if (value.responses_scored !== 10 || value.rerank_ready !== true) throw new Error("The scorer result must contain all ten T1 responses.");
  if (!isRecord(value.module_summary) || !isRecord(value.misconception_evidence) || !Array.isArray(value.tentative_priority_order)) throw new Error("Incomplete scorer output.");

  const seen = new Set<string>();
  for (const [lcm, unknownRow] of Object.entries(value.module_summary)) {
    if (!LCM_TO_MODULE[lcm] || !isRecord(unknownRow)) throw new Error(`Invalid module summary: ${lcm}`);
    exactKeys(unknownRow, ["observed_error_rate", "exposures", "items"], `Module summary ${lcm}`);
    if (!finite(unknownRow.observed_error_rate) || unknownRow.observed_error_rate < 0 || unknownRow.observed_error_rate > 1) throw new Error(`Invalid error rate: ${lcm}`);
    if (!Number.isInteger(unknownRow.exposures) || Number(unknownRow.exposures) < 1 || !Array.isArray(unknownRow.items)) throw new Error(`Invalid exposure data: ${lcm}`);
    if (Number(unknownRow.exposures) !== unknownRow.items.length) throw new Error(`Exposure count does not match item count: ${lcm}`);
    for (const item of unknownRow.items) {
      if (typeof item !== "string" || !T1_IDS.has(item)) throw new Error(`Invalid T1 item in ${lcm}`);
      if (seen.has(item)) throw new Error(`Duplicate T1 item across module summaries: ${item}`);
      seen.add(item);
    }
  }
  if (seen.size !== T1_IDS.size || [...T1_IDS].some((item) => !seen.has(item))) throw new Error("Scorer output does not cover exactly LD-001 through LD-010.");

  for (const [misconceptionId, unknownRow] of Object.entries(value.misconception_evidence)) {
    if (!CANONICAL_MC.has(misconceptionId) || !isRecord(unknownRow)) throw new Error(`Invalid misconception row: ${misconceptionId}`);
    exactKeys(unknownRow, ["observations", "high_confidence", "items"], `Misconception ${misconceptionId}`);
    if (!Number.isInteger(unknownRow.observations) || Number(unknownRow.observations) < 0
      || !Number.isInteger(unknownRow.high_confidence) || Number(unknownRow.high_confidence) < 0
      || Number(unknownRow.high_confidence) > Number(unknownRow.observations)
      || !Array.isArray(unknownRow.items)) throw new Error(`Invalid misconception evidence: ${misconceptionId}`);
    if (!unknownRow.items.every((item) => typeof item === "string" && T1_IDS.has(item))) throw new Error(`Invalid misconception item list: ${misconceptionId}`);
  }
  if (!value.tentative_priority_order.every((item) => typeof item === "string" && /^H-[A-Z0-9-]+$/u.test(item))) throw new Error("Invalid candidate priority order.");
  if (new Set(value.tentative_priority_order).size !== value.tentative_priority_order.length) throw new Error("Candidate priority order contains duplicates.");
  return value as DiagnosticScoreOutput;
}

export function deriveDiagnosticPriorityModules(score: DiagnosticScoreOutput): ModuleId[] {
  return Object.entries(score.module_summary)
    .map(([lcm, row]) => ({ moduleId: LCM_TO_MODULE[lcm], weight: row.observed_error_rate * row.exposures }))
    .filter((row) => Boolean(row.moduleId) && row.weight > 0)
    .sort((left, right) => right.weight - left.weight)
    .slice(0, 2)
    .map((row) => row.moduleId);
}
