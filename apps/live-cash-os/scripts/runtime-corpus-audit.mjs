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

const decisions = ledger.rows.filter((row) => row.itemKind === "DECISION");
const counts = (key) => decisions.reduce((result, row) => {
  const value = row.reviewSignals[key];
  result[value] = (result[value] ?? 0) + 1;
  return result;
}, {});
const words = (text) => text.trim().split(/\s+/u).filter(Boolean).length;
const severeLength = [];
const lexicalTell = [];
const negativePolarity = [];
const numericAsymmetry = [];
const negativeRu = /(?:ошибк|неверн|ловушк|trap|wrong|error|avoid)/iu;
const negativeEn = /(?:\bwrong\b|\berror\b|\btrap\b|\bavoid\b|incorrect)/iu;
const tellRu = /(?:\bвсегда\b|\bникогда\b|автоматически|только\s+(?:из-за|потому)|безусловно)/iu;
const tellEn = /(?:\balways\b|\bnever\b|automatically|merely|solely|only\s+because|unconditionally)/iu;
const numericTokens = (text) => [...text.matchAll(/\b\d+(?:[.,]\d+)?(?:%|bb)?\b/giu)].map((match) => match[0].replace(",", "."));

for (const row of decisions) {
  if (negativeRu.test(row.questionRu) || negativeEn.test(row.questionEn)) {
    negativePolarity.push({ itemId: row.itemId, skillId: row.skillId, questionRu: row.questionRu, questionEn: row.questionEn, correctActionId: row.correctActionId });
  }
  for (const [kind, options] of [["action", row.actionOptions], ["reason", row.reasonOptions]]) {
    const correct = options.find((option) => option.correct);
    const wrong = options.filter((option) => !option.correct);
    if (!correct || wrong.length < 1) continue;
    for (const locale of ["Ru", "En"]) {
      const textKey = `text${locale}`;
      const correctWords = words(correct[textKey]);
      const wrongWords = wrong.map((option) => words(option[textKey]));
      const wrongAverage = wrongWords.reduce((sum, value) => sum + value, 0) / wrongWords.length;
      const wrongMax = Math.max(...wrongWords);
      const wrongMin = Math.min(...wrongWords);
      if (correctWords >= 10 && correctWords > wrongAverage * 1.75 && correctWords - wrongMax >= 4) {
        severeLength.push({ itemId: row.itemId, kind, locale, direction: "correct-long", correctWords, wrongWords });
      }
      if (wrongMin >= 10 && wrongMin > correctWords * 2 && wrongMin - correctWords >= 8) {
        severeLength.push({ itemId: row.itemId, kind, locale, direction: "correct-short", correctWords, wrongWords });
      }
      const tell = locale === "Ru" ? tellRu : tellEn;
      for (const option of wrong) if (tell.test(option[textKey])) lexicalTell.push({ itemId: row.itemId, kind, locale, optionId: option.id, text: option[textKey] });
    }
    const correctNumbers = new Set([...numericTokens(correct.textRu), ...numericTokens(correct.textEn)]);
    const wrongNumbers = new Set(wrong.flatMap((option) => [...numericTokens(option.textRu), ...numericTokens(option.textEn)]));
    const uniqueCorrect = [...correctNumbers].filter((value) => !wrongNumbers.has(value));
    if (uniqueCorrect.length > 0 && wrongNumbers.size === 0) numericAsymmetry.push({ itemId: row.itemId, kind, uniqueCorrect });
  }
}

console.log(JSON.stringify({
  schema: ledger.schema,
  output: outputPath,
  counts: ledger.counts,
  invariantErrors: ledger.invariantErrors.length,
  adversarial: {
    actionCorrectOrder: counts("actionCorrectOrder"),
    reasonCorrectOrder: counts("reasonCorrectOrder"),
    severeLength,
    lexicalTell,
    negativePolarity,
    numericAsymmetry,
  },
}, null, 2));
