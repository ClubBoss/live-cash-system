import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import ts from "typescript";

async function load(relativePath) {
  const source = await readFile(new URL(`../${relativePath}`, import.meta.url), "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
      importsNotUsedAsValues: ts.ImportsNotUsedAsValues.Remove,
    },
  }).outputText;
  const directory = await mkdtemp(join(tmpdir(), "lcos-i18n-"));
  const output = join(directory, relativePath.replaceAll("/", "-").replace(/\.ts$/, ".mjs"));
  await writeFile(output, compiled, "utf8");
  return import(`${new URL(`file://${output}`).href}?${Date.now()}`);
}

function add(target, key, value) {
  if (typeof value === "string" && value.trim()) target[key] = value;
}

function collectModule(target, module) {
  const root = `module.${module.id}`;
  for (const field of ["title", "shortTitle", "description", "scope", "plainGoal", "tableCue", "technicalTerm", "counterexample", "explainBackPrompt"]) add(target, `${root}.${field}`, module[field]);
  module.theory.forEach((value, index) => add(target, `${root}.theory.${index}`, value));
  module.heuristics.forEach((value, index) => add(target, `${root}.heuristics.${index}`, value));
  module.decisionTree.forEach((value, index) => add(target, `${root}.decisionTree.${index}`, value));
  add(target, `${root}.worked.situation`, module.workedExample.situation);
  module.workedExample.steps.forEach((value, index) => add(target, `${root}.worked.steps.${index}`, value));
  add(target, `${root}.worked.answer`, module.workedExample.answer);
  add(target, `${root}.lab.title`, module.lab.title);
  add(target, `${root}.lab.description`, module.lab.description);
  if (module.lab.type === "compare") {
    for (const field of ["leftTitle", "leftText", "rightTitle", "rightText"]) add(target, `${root}.lab.${field}`, module.lab[field]);
  }
  module.tableCard.forEach((value, index) => add(target, `${root}.tableCard.${index}`, value));
  module.glossary.forEach((item, index) => {
    add(target, `${root}.glossary.${index}.term`, item.term);
    add(target, `${root}.glossary.${index}.meaning`, item.meaning);
  });
  module.drills.forEach((drill) => {
    const drillRoot = `drill.${drill.id}`;
    drill.assumptions.forEach((value, index) => add(target, `${drillRoot}.assumptions.${index}`, value));
    add(target, `${drillRoot}.cue`, drill.cue);
    add(target, `${drillRoot}.question`, drill.question);
    drill.actionOptions.forEach((item) => add(target, `${drillRoot}.option.${item.id}`, item.text));
    drill.reasonOptions.forEach((item) => add(target, `${drillRoot}.option.${item.id}`, item.text));
    add(target, `${drillRoot}.explanation`, drill.explanation);
  });
  module.flashcards.forEach((card) => {
    add(target, `card.${card.id}.front`, card.front);
    add(target, `card.${card.id}.back`, card.back);
  });
}

const { modules } = await load("content/modules.ts");
const catalog = {};
modules.forEach((module) => collectModule(catalog, module));
const sorted = Object.fromEntries(Object.entries(catalog).sort(([left], [right]) => left.localeCompare(right)));
const output = `${JSON.stringify(sorted, null, 2)}\n`;
const outputUrl = new URL("../content/i18n/source.ru.json", import.meta.url);

if (process.argv.includes("--check")) {
  const current = await readFile(outputUrl, "utf8").catch(() => "");
  assert.equal(current, output, "The extracted localization source catalogue is stale. Run npm run i18n:extract.");
  console.log(`Localization source catalogue is current: ${Object.keys(sorted).length} strings.`);
} else {
  await mkdir(new URL("../content/i18n/", import.meta.url), { recursive: true });
  await writeFile(outputUrl, output, "utf8");
  console.log(`Extracted ${Object.keys(sorted).length} learner-facing source strings.`);
}
