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

const reviewRows = ledger.rows
  .filter((row) => row.auditStatus === "REVIEW")
  .map((row) => ({
    sequence: row.sequence,
    wave: row.wave,
    skillId: row.skillId,
    itemId: row.itemId,
    itemKind: row.itemKind,
    decisionKind: row.decisionKind,
    sourceStatus: row.sourceStatus,
    changedVariables: row.changedVariables,
    missingChangedVariables: row.reviewSignals.missingChangedVariables,
    wrongOptionsWithoutMisconception: row.reviewSignals.wrongOptionsWithoutMisconception,
    promptLeakageCandidateOptionIds: row.reviewSignals.promptLeakageCandidateOptionIds,
    actionCorrectOrder: row.reviewSignals.actionCorrectOrder,
    reasonCorrectOrder: row.reviewSignals.reasonCorrectOrder,
  }));

console.log(JSON.stringify({
  schema: ledger.schema,
  output: outputPath,
  counts: ledger.counts,
  invariantErrors: ledger.invariantErrors.length,
  reviewRows,
}, null, 2));
