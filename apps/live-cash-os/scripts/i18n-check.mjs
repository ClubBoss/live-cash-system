import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

const sourceText = await readFile(new URL("../content/i18n/source.ru.json", import.meta.url), "utf8");
const source = JSON.parse(sourceText);
const ru = JSON.parse(await readFile(new URL("../content/i18n/ru.json", import.meta.url), "utf8"));
const en = JSON.parse(await readFile(new URL("../content/i18n/en.json", import.meta.url), "utf8"));
const reviewLock = JSON.parse(await readFile(new URL("../content/i18n/review-lock.json", import.meta.url), "utf8"));
const sourceKeys = Object.keys(source).sort();
const workflowName = String(process.env.GITHUB_WORKFLOW ?? "");
const allowDraft = process.env.ALLOW_DRAFT_I18N === "1" || /Materialize|Materializer/u.test(workflowName);

function verifyMemory(locale, memory) {
  assert.deepEqual(Object.keys(memory).sort(), sourceKeys, `${locale}: missing or orphaned keys`);
  for (const key of sourceKeys) {
    const entry = memory[key];
    assert.equal(entry.source, source[key], `${locale}:${key}: stale source snapshot`);
    assert.equal(typeof entry.text, "string", `${locale}:${key}: text missing`);
    assert.ok(entry.text.trim().length > 0, `${locale}:${key}: blank translation`);
    assert.ok(["DRAFT", "REVIEWED"].includes(entry.status), `${locale}:${key}: invalid status`);
    if (!allowDraft) assert.equal(entry.status, "REVIEWED", `${locale}:${key}: translation is not reviewed`);
    assert.ok(!entry.text.includes("__TERM_"), `${locale}:${key}: unresolved protected term`);
  }
}

verifyMemory("ru", ru);
verifyMemory("en", en);

const expectedSourceHash = createHash("sha256").update(sourceText).digest("hex");
assert.equal(reviewLock.source_sha256, expectedSourceHash, "The editorial review lock is stale");
assert.deepEqual(reviewLock.locales, ["ru", "en"], "The editorial review lock must cover both locales");
assert.equal(reviewLock.entries_per_locale ?? reviewLock.reviewed_entries_per_locale, sourceKeys.length, "The editorial review lock has the wrong entry count");
if (!allowDraft) {
  assert.equal(reviewLock.status, "REVIEWED", "The editorial review lock is not accepted");
  assert.equal(reviewLock.reviewed_entries?.ru ?? sourceKeys.length, sourceKeys.length, "Russian review count is incomplete");
  assert.equal(reviewLock.reviewed_entries?.en ?? sourceKeys.length, sourceKeys.length, "English review count is incomplete");
}

const englishCyrillic = sourceKeys.filter((key) => /[А-Яа-яЁё]/u.test(en[key].text));
assert.deepEqual(englishCyrillic, [], `English memory contains Cyrillic: ${englishCyrillic.slice(0, 10).join(", ")}`);

const bannedRussianSystemJargon = [
  /\bteaching layer(s)?\b/iu,
  /\bworking evidence\b/iu,
  /\bdue review\b/iu,
  /\bfield (?:evidence|transfer)\b/iu,
  /\bdelayed (?:review|retrieval)\b/iu,
  /\bchanged node(s)?\b/iu,
  /\bexplain-back\b/iu,
  /\btable card\b/iu,
  /\bcold diagnostic\b/iu,
  /\bmastery\b/iu,
  /\bnode signature\b/iu,
];
for (const key of sourceKeys) {
  for (const pattern of bannedRussianSystemJargon) assert.ok(!pattern.test(ru[key].text), `ru:${key}: learner-facing system jargon ${pattern}`);
}

const uiSource = await readFile(new URL("../content/i18n/ui.ts", import.meta.url), "utf8");
assert.match(uiSource, /ru:\s*\{/u);
assert.match(uiSource, /en:\s*\{/u);
assert.match(uiSource, /heroLine2:\s*"Применяй за столом\."/u);
assert.match(uiSource, /heroLine2:\s*"Apply them at the table\."/u);

const diagnosticSource = await readFile(new URL("../content/i18n/diagnostic.ts", import.meta.url), "utf8");
assert.equal((diagnosticSource.match(/id: "LD-\d{3}"/gu) ?? []).length, 20, "Both diagnostic locales must contain 10 stable IDs");

const runtimeSource = await readFile(new URL("../content/i18n/runtime.ts", import.meta.url), "utf8");
assert.match(runtimeSource, /entry\.source !== source/u, "Runtime must reject stale translations");
assert.match(runtimeSource, /getLocalizedContent/u, "Locale runtime is missing");

console.log(`${allowDraft ? "i18n draft integrity" : "i18n release"} gate passed for ${sourceKeys.length} content strings in RU and EN.`);
