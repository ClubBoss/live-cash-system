import { readFile, writeFile } from "node:fs/promises";

const path = new URL("../content/modules.ts", import.meta.url);
let source = await readFile(path, "utf8");

const remap = {
  "MC-031": "MC-024", "MC-032": "MC-024", "MC-033": "MC-019", "MC-034": "MC-019",
  "MC-035": "MC-030", "MC-036": "MC-030", "MC-037": "MC-007", "MC-038": "MC-007",
  "MC-039": "MC-007", "MC-040": "MC-012", "MC-041": "MC-013", "MC-042": "MC-012",
  "MC-043": "MC-007", "MC-044": "MC-022", "MC-045": "MC-011", "MC-046": "MC-022",
  "MC-047": "MC-007", "MC-048": "MC-007", "MC-049": "MC-012", "MC-050": "MC-012",
  "MC-051": "MC-012", "MC-052": "MC-012", "MC-053": "MC-012", "MC-054": "MC-023",
  "MC-055": "MC-013", "MC-056": "MC-013", "MC-057": "MC-013", "MC-058": "MC-013",
  "MC-059": "MC-008", "MC-060": "MC-010", "MC-061": "MC-009", "MC-062": "MC-010",
  "MC-063": "MC-011", "MC-064": "MC-026", "MC-065": "MC-026", "MC-066": "MC-009",
  "MC-067": "MC-023", "MC-068": "MC-003", "MC-069": "MC-015", "MC-070": "MC-021",
  "MC-071": "MC-023", "MC-072": "MC-024", "MC-073": "MC-012", "MC-074": "MC-024",
  "MC-075": "MC-024", "MC-076": "MC-005", "MC-077": "MC-024", "MC-078": "MC-027",
  "MC-079": "MC-005", "MC-080": "MC-024", "MC-081": "MC-017", "MC-082": "MC-017",
  "MC-083": "MC-018", "MC-084": "MC-029", "MC-085": "MC-029", "MC-086": "MC-023",
  "MC-087": "MC-028", "MC-088": "MC-029", "MC-089": "MC-030", "MC-090": "MC-004",
  "MC-091": "MC-015", "MC-092": "MC-015", "MC-093": "MC-021", "MC-094": "MC-030",
  "MC-095": "MC-030", "MC-096": "MC-003", "MC-097": "MC-003", "MC-098": "MC-030",
  "MC-099": "MC-030", "MC-100": "MC-030", "MC-101": "MC-030", "MC-102": "MC-030",
  "MC-103": "MC-004", "MC-104": "MC-004"
};

for (const [from, to] of Object.entries(remap)) source = source.replaceAll(`"${from}"`, `"${to}"`);
const remaining = [...new Set(source.match(/MC-\d{3}/gu) ?? [])].filter((id) => Number(id.slice(3)) > 30);
if (remaining.length) throw new Error(`Non-canonical misconception IDs remain: ${remaining.join(", ")}`);
await writeFile(path, source, "utf8");
console.log(`Normalized distractors to MC-001..MC-030 using ${Object.keys(remap).length} explicit mappings.`);
