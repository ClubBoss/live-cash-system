export type DiagnosticItem = {
  id: string;
  targetSeconds: number;
  drillId: string;
};

export const diagnosticT1: DiagnosticItem[] = [
  { id: "LD-001", targetSeconds: 30, drillId: "geo-04" },
  { id: "LD-002", targetSeconds: 25, drillId: "pre-04" },
  { id: "LD-003", targetSeconds: 35, drillId: "bli-03" },
  { id: "LD-004", targetSeconds: 40, drillId: "fil-04" },
  { id: "LD-005", targetSeconds: 45, drillId: "agg-04" },
  { id: "LD-006", targetSeconds: 50, drillId: "sha-04" },
  { id: "LD-007", targetSeconds: 35, drillId: "anc-04" },
  { id: "LD-008", targetSeconds: 50, drillId: "evi-04" },
  { id: "LD-009", targetSeconds: 45, drillId: "mul-04" },
  { id: "LD-010", targetSeconds: 55, drillId: "riv-04" },
];
