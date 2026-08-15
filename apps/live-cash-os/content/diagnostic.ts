import { drillById } from "./modules";
import type { LocaleCode } from "../lib/model";

export type DiagnosticItem = {
  id: string;
  title: string;
  prompt: string;
  targetSeconds: number;
  drillId: string;
};

// title/prompt are compatibility fields for LegacyDiagnostic only. They are intentionally
// empty at source and are derived from the mapped final drill after locale composition,
// so this file cannot become a second source of learner-facing Diagnostic truth.
export const diagnosticT1: DiagnosticItem[] = [
  { id: "LD-001", title: "", prompt: "", targetSeconds: 30, drillId: "geo-04" },
  { id: "LD-002", title: "", prompt: "", targetSeconds: 25, drillId: "pre-04" },
  { id: "LD-003", title: "", prompt: "", targetSeconds: 35, drillId: "bli-03" },
  { id: "LD-004", title: "", prompt: "", targetSeconds: 40, drillId: "fil-04" },
  { id: "LD-005", title: "", prompt: "", targetSeconds: 45, drillId: "agg-04" },
  { id: "LD-006", title: "", prompt: "", targetSeconds: 50, drillId: "sha-04" },
  { id: "LD-007", title: "", prompt: "", targetSeconds: 35, drillId: "anc-04" },
  { id: "LD-008", title: "", prompt: "", targetSeconds: 50, drillId: "evi-04" },
  { id: "LD-009", title: "", prompt: "", targetSeconds: 45, drillId: "mul-04" },
  { id: "LD-010", title: "", prompt: "", targetSeconds: 55, drillId: "riv-04" },
];

export function syncDiagnosticCompatibility(locale: LocaleCode) {
  diagnosticT1.forEach((entry, index) => {
    const drill = drillById[entry.drillId];
    if (!drill) throw new Error(`Missing Diagnostic drill ${entry.drillId}`);
    entry.title = locale === "ru" ? `Диагностический спот ${index + 1}` : `Diagnostic spot ${index + 1}`;
    entry.prompt = drill.question;
  });
}
