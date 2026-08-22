import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import {
  assertRuntimeCorpusAuditInvariants,
  runtimeCorpusAuditLedger,
} from "../content/practical-mastery/audit-surface.ts";

const outputArg = process.argv.find((arg) => arg.startsWith("--output="));
const outputPath = resolve(
  process.cwd(),
  outputArg?.slice("--output=".length) ?? "content/audits/runtime-corpus-ledger.generated.json",
);

const ledger = runtimeCorpusAuditLedger();
assertRuntimeCorpusAuditInvariants(ledger);

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(ledger, null, 2)}\n`, "utf8");

console.log(JSON.stringify({
  schema: ledger.schema,
  output: outputPath,
  counts: ledger.counts,
  invariantErrors: ledger.invariantErrors.length,
}, null, 2));
