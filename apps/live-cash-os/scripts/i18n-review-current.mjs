import "./add-learning-route.mjs";
import "./i18n-quality-fixes.mjs";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";

const sourcePath = new URL("../content/i18n/source.ru.json", import.meta.url);
const ruPath = new URL("../content/i18n/ru.json", import.meta.url);
const enPath = new URL("../content/i18n/en.json", import.meta.url);
const lockPath = new URL("../content/i18n/review-lock.json", import.meta.url);

const sourceText = await readFile(sourcePath, "utf8");
const source = JSON.parse(sourceText);
const ru = JSON.parse(await readFile(ruPath, "utf8"));
const en = JSON.parse(await readFile(enPath, "utf8"));
const keys = Object.keys(source).sort();

assert.deepEqual(Object.keys(ru).sort(), keys, "Russian translation memory does not match source keys");
assert.deepEqual(Object.keys(en).sort(), keys, "English translation memory does not match source keys");

const bannedRu = [
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
const criticalTokens = /\$?\d+(?:[.,]\d+)?%?|\b(?:SPR|MDF|OOP|IP|BB|SB|BTN|CO|HJ|LJ|UTG|EP|3-bet|4-bet|c-bet|A5s|AJo|KJo|KQ|TT|76s|98s)\b/gi;
const normalizeToken = (token) => token.toUpperCase().replace(",", ".");
const tokens = (value) => (String(value).match(criticalTokens) ?? []).map(normalizeToken).sort();

function containsToken(text, token, localeTokens) {
  if (localeTokens.includes(token)) return true;
  const upper = text.toUpperCase();
  if (token === "OOP" && upper.includes("БЕЗ ПОЗИЦИИ")) return true;
  if (token === "IP" && upper.includes("В ПОЗИЦИИ")) return true;
  return false;
}

const issues = [];
for (const key of keys) {
  const sourceValue = String(source[key]);
  const ruEntry = ru[key];
  const enEntry = en[key];
  assert.equal(ruEntry?.source, sourceValue, `RU stale source: ${key}`);
  assert.equal(enEntry?.source, sourceValue, `EN stale source: ${key}`);
  const ruText = String(ruEntry?.text ?? "").trim();
  const enText = String(enEntry?.text ?? "").trim();
  if (!ruText) issues.push(`RU blank: ${key}`);
  if (!enText) issues.push(`EN blank: ${key}`);
  if (/[А-Яа-яЁё]/u.test(enText)) issues.push(`EN contains Cyrillic: ${key}`);
  if (ruText.includes("__TERM_") || enText.includes("__TERM_")) issues.push(`Unresolved protected term: ${key}`);
  for (const pattern of bannedRu) if (pattern.test(ruText)) issues.push(`RU software-style jargon ${pattern}: ${key}`);
  const sourceTokens = tokens(sourceValue);
  const ruTokens = tokens(ruText);
  const enTokens = tokens(enText);
  for (const token of sourceTokens) {
    if (!containsToken(ruText, token, ruTokens)) issues.push(`RU lost critical token ${token}: ${key}`);
    if (!enTokens.includes(token)) issues.push(`EN lost critical token ${token}: ${key}`);
  }
  ruEntry.status = ruEntry.status === "REVIEWED" ? "REVIEWED" : "DRAFT";
  enEntry.status = enEntry.status === "REVIEWED" ? "REVIEWED" : "DRAFT";
}

if (issues.length) {
  console.error(issues.slice(0, 150).join("\n"));
  throw new Error(`Editorial candidate blocked by ${issues.length} issue(s)`);
}

const sourceSha256 = createHash("sha256").update(sourceText).digest("hex");
const reviewedRu = keys.filter((key) => ru[key].status === "REVIEWED").length;
const reviewedEn = keys.filter((key) => en[key].status === "REVIEWED").length;
const lock = {
  schema_version: 2,
  status: reviewedRu === keys.length && reviewedEn === keys.length ? "REVIEWED" : "DRAFT_NOT_ACCEPTED",
  source_sha256: sourceSha256,
  locales: ["ru", "en"],
  entries_per_locale: keys.length,
  reviewed_entries: { ru: reviewedRu, en: reviewedEn },
  policy: "draft generation and deterministic semantic checks cannot grant REVIEWED status",
};

await writeFile(ruPath, `${JSON.stringify(ru, null, 2)}\n`, "utf8");
await writeFile(enPath, `${JSON.stringify(en, null, 2)}\n`, "utf8");
await writeFile(lockPath, `${JSON.stringify(lock, null, 2)}\n`, "utf8");
console.log(`Editorial candidate checked: ${keys.length} keys; reviewed RU=${reviewedRu}, EN=${reviewedEn}.`);
