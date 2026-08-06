import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import ts from "typescript";

const source = JSON.parse(await readFile(new URL("../content/i18n/source.ru.json", import.meta.url), "utf8"));
const ru = JSON.parse(await readFile(new URL("../content/i18n/ru.json", import.meta.url), "utf8"));
const en = JSON.parse(await readFile(new URL("../content/i18n/en.json", import.meta.url), "utf8"));
const sourceKeys = Object.keys(source).sort();

function verifyMemory(locale, memory) {
  assert.deepEqual(Object.keys(memory).sort(), sourceKeys, `${locale}: missing or orphaned keys`);
  for (const key of sourceKeys) {
    const entry = memory[key];
    assert.equal(entry.source, source[key], `${locale}:${key}: stale source snapshot`);
    assert.equal(typeof entry.text, "string", `${locale}:${key}: text missing`);
    assert.ok(entry.text.trim().length > 0, `${locale}:${key}: blank translation`);
    assert.equal(entry.status, "REVIEWED", `${locale}:${key}: translation is not reviewed`);
    assert.ok(!entry.text.includes("__TERM_"), `${locale}:${key}: unresolved protected term`);
  }
}

verifyMemory("ru", ru);
verifyMemory("en", en);

const englishCyrillic = sourceKeys.filter((key) => /[А-Яа-яЁё]/u.test(en[key].text));
assert.deepEqual(englishCyrillic, [], `English memory contains Cyrillic: ${englishCyrillic.slice(0, 10).join(", ")}`);

const bannedRussianSystemJargon = [
  /\bteaching layer(s)?\b/iu,
  /\bworking evidence\b/iu,
  /\bdue review\b/iu,
  /\bfield transfer\b/iu,
  /\bdelayed review\b/iu,
  /\bchanged node(s)?\b/iu,
  /\bexplain-back\b/iu,
  /\btable card\b/iu,
  /\bcold diagnostic\b/iu,
  /\bmastery\b/iu,
];
for (const key of sourceKeys) {
  for (const pattern of bannedRussianSystemJargon) assert.ok(!pattern.test(ru[key].text), `ru:${key}: learner-facing system jargon ${pattern}`);
}

async function loadTypeScriptModule(relativePath) {
  const file = new URL(`../${relativePath}`, import.meta.url);
  const sourceText = await readFile(file, "utf8");
  const compiled = ts.transpileModule(sourceText, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
      resolveJsonModule: true,
      esModuleInterop: true,
      importsNotUsedAsValues: ts.ImportsNotUsedAsValues.Remove,
    },
  }).outputText;
  const directory = await mkdtemp(join(tmpdir(), "lcos-i18n-check-"));
  const output = join(directory, relativePath.replaceAll("/", "-").replace(/\.ts$/, ".mjs"));
  await writeFile(output, compiled, "utf8");
  return import(`${new URL(`file://${output}`).href}?${Date.now()}-${Math.random()}`);
}

const uiSource = await readFile(new URL("../content/i18n/ui.ts", import.meta.url), "utf8");
assert.match(uiSource, /ru:\s*\{/u);
assert.match(uiSource, /en:\s*\{/u);
assert.match(uiSource, /heroLine2:\s*"Применяй за столом\."/u);
assert.match(uiSource, /heroLine2:\s*"Apply them at the table\."/u);

const diagnosticSource = await readFile(new URL("../content/i18n/diagnostic.ts", import.meta.url), "utf8");
assert.equal((diagnosticSource.match(/id: "LD-\d{3}"/gu) ?? []).length, 20, "Both diagnostic locales must contain 10 stable IDs");

console.log(`i18n release gate passed for ${sourceKeys.length} content strings in RU and EN.`);
