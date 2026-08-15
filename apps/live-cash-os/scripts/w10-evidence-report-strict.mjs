import { readFile } from "node:fs/promises";
import path from "node:path";
import { validateStrictW10ObservationLedger } from "../lib/w10-observation-integrity.ts";

const [, observationsPath] = process.argv.slice(2);
if (!observationsPath) {
  console.error("Usage: npm run w10:report -- <live-cash-progress.json> <w10-observations.json> [output-dir]");
  process.exit(2);
}

const observationsRaw = JSON.parse(await readFile(path.resolve(observationsPath), "utf8"));
validateStrictW10ObservationLedger(observationsRaw);

await import("./w10-evidence-report.mjs");
