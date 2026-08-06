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

const ruEditorial = [
  [/\bHero\b/g, "Hero"],
  [/\bVillain\b/gi, "соперник"],
  [/\bdecision\b/gi, "решение"],
  [/\bdefault\b/gi, "базовая линия"],
  [/\bpattern\b/gi, "схема"],
  [/\bworking evidence\b/gi, "подтверждение в практике"],
  [/\bfield evidence\b/gi, "подтверждение за столом"],
  [/\bfield transfer\b/gi, "применение за столом"],
  [/\bdelayed retrieval\b/gi, "повторение через время"],
  [/\bdelayed review\b/gi, "повторение через время"],
  [/\bdue review\b/gi, "запланированное повторение"],
  [/\bchanged node(s)?\b/gi, "изменённая ситуация"],
  [/\bnode signature\b/gi, "условия ситуации"],
  [/\bexplain-back\b/gi, "объяснение своими словами"],
  [/\btable card\b/gi, "памятка за столом"],
  [/\bcold diagnostic\b/gi, "диагностика без подсказок"],
  [/\bmastery\b/gi, "устойчивый навык"],
  [/\bevidence grade\b/gi, "надёжность наблюдения"],
  [/\bevidence\b/gi, "подтверждение"],
  [/\bfalsifier\b/gi, "признак, который опровергнет вывод"],
  [/\bbranch-specific\b/gi, "привязанный к конкретной ветке"],
  [/\bsource range\b/gi, "исходный диапазон"],
  [/\brange source\b/gi, "источник диапазона"],
  [/\barrival range\b/gi, "диапазон, дошедший до решения"],
  [/\bsource ranges\b/gi, "исходные диапазоны"],
  [/\baction history\b/gi, "история действий"],
  [/\bfuture tree\b/gi, "дальнейший розыгрыш"],
  [/\bdecision tree\b/gi, "порядок решения"],
  [/\bplayer behind\b/gi, "игрок сзади"],
  [/\bplayers behind\b/gi, "игроки сзади"],
  [/\bclosing action\b/gi, "закрытие торгов"],
  [/\bshared defence\b/gi, "общая защита нескольких диапазонов"],
  [/\braw equity\b/gi, "исходное эквити"],
  [/\brealised equity\b/gi, "реализованное эквити"],
  [/\brealized equity\b/gi, "реализованное эквити"],
  [/\brealisation\b/gi, "реализация эквити"],
  [/\bcoverage\b/gi, "покрытие доски"],
  [/\bownership\b/gi, "преимущество по сильным рукам"],
  [/\bdenial\b/gi, "выбивание живого эквити"],
  [/\bhigh-confidence miss\b/gi, "ошибка при высокой уверенности"],
  [/\bstructural miss\b/gi, "ошибка в понимании структуры"],
  [/\bfeedback\b/gi, "разбор ответа"],
  [/\bskill\b/gi, "навык"],
  [/\blearner\b/gi, "ученик"],
  [/\bitem\b/gi, "задание"],
  [/\bitems\b/gi, "задания"],
];

const enEditorial = [
  [/\bThe villain\b/g, "Villain"],
  [/\bThe hero\b/g, "Hero"],
  [/\bthe villain\b/g, "Villain"],
  [/\bthe hero\b/g, "Hero"],
  [/\bturne\b/gi, "turn"],
  [/\brivere\b/gi, "river"],
  [/\bfloppe\b/gi, "flop"],
  [/\bpreflop tree price\b/gi, "preflop decision tree"],
  [/\bworking proof\b/gi, "practice evidence"],
  [/\brepair family\b/gi, "repair family"],
  [/\bdispersal\b/gi, "range construction"],
  [/\bdistribution owner\b/gi, "range owner"],
];

const bannedRu = [
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
  /\bnode signature\b/iu,
];

const criticalTokens = /\$?\d+(?:[.,]\d+)?%?|\b(?:SPR|MDF|OOP|IP|BB|SB|BTN|CO|HJ|LJ|UTG|EP|3-bet|4-bet|c-bet|A5s|AJo|KJo|KQ|TT|76s|98s)\b/gi;

function normalizeToken(token) {
  return token.toUpperCase().replace(",", ".");
}

function tokens(value) {
  return (value.match(criticalTokens) ?? []).map(normalizeToken).sort();
}

function edit(value, replacements) {
  let text = value;
  for (const [pattern, replacement] of replacements) text = text.replace(pattern, replacement);
  return text.replace(/\s+/g, " ").replace(/\s+([,.!?;:])/g, "$1").trim();
}

const reviewedRu = {};
const reviewedEn = {};
const issues = [];

for (const key of keys) {
  const sourceValue = source[key];
  assert.equal(ru[key]?.source, sourceValue, `RU stale source: ${key}`);
  assert.equal(en[key]?.source, sourceValue, `EN stale source: ${key}`);

  const ruText = edit(String(ru[key]?.text ?? ""), ruEditorial);
  const enText = edit(String(en[key]?.text ?? ""), enEditorial);

  if (!ruText) issues.push(`RU blank: ${key}`);
  if (!enText) issues.push(`EN blank: ${key}`);
  if (/[А-Яа-яЁё]/u.test(enText)) issues.push(`EN contains Cyrillic: ${key}`);
  if (enText.includes("__TERM_")) issues.push(`EN unresolved protected term: ${key}`);
  if (ruText.includes("__TERM_")) issues.push(`RU unresolved protected term: ${key}`);
  for (const pattern of bannedRu) if (pattern.test(ruText)) issues.push(`RU software-style jargon ${pattern}: ${key}`);

  const sourceTokens = tokens(sourceValue);
  const ruTokens = tokens(ruText);
  const enTokens = tokens(enText);
  for (const token of sourceTokens) {
    if (!ruTokens.includes(token)) issues.push(`RU lost critical token ${token}: ${key}`);
    if (!enTokens.includes(token)) issues.push(`EN lost critical token ${token}: ${key}`);
  }

  reviewedRu[key] = { source: sourceValue, text: ruText, status: "REVIEWED" };
  reviewedEn[key] = { source: sourceValue, text: enText, status: "REVIEWED" };
}

if (issues.length) {
  console.error(issues.slice(0, 100).join("\n"));
  throw new Error(`Editorial review blocked by ${issues.length} issue(s)`);
}

const sourceSha256 = createHash("sha256").update(sourceText).digest("hex");
const lock = {
  schema_version: 1,
  source_sha256: sourceSha256,
  reviewed_at: new Date().toISOString(),
  locales: ["ru", "en"],
  reviewed_entries_per_locale: keys.length,
  policy: "machine-assisted draft plus deterministic poker-language editorial and semantic-token gate",
};

await writeFile(ruPath, `${JSON.stringify(reviewedRu, null, 2)}\n`, "utf8");
await writeFile(enPath, `${JSON.stringify(reviewedEn, null, 2)}\n`, "utf8");
await writeFile(lockPath, `${JSON.stringify(lock, null, 2)}\n`, "utf8");
console.log(`Reviewed ${keys.length} entries in RU and EN; source=${sourceSha256}`);
