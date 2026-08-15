export type DiagnosticItem = {
  id: string;
  title: string;
  prompt: string;
  targetSeconds: number;
  drillId: string;
};

const item = (id: string, targetSeconds: number, drillId: string): DiagnosticItem => ({
  id,
  title: "",
  prompt: "",
  targetSeconds,
  drillId,
});

// title/prompt are compatibility fields for LegacyDiagnostic only. They are intentionally
// empty here and are derived from the mapped final drill by the locale pipeline, so this
// file cannot become a second source of learner-facing Diagnostic truth.
export const diagnosticT1: DiagnosticItem[] = [
  item("LD-001", 30, "geo-04"),
  item("LD-002", 25, "pre-04"),
  item("LD-003", 35, "bli-03"),
  item("LD-004", 40, "fil-04"),
  item("LD-005", 45, "agg-04"),
  item("LD-006", 50, "sha-04"),
  item("LD-007", 35, "anc-04"),
  item("LD-008", 50, "evi-04"),
  item("LD-009", 45, "mul-04"),
  item("LD-010", 55, "riv-04"),
];
