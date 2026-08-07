import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

const moduleIds = ["geometry", "preflop", "blinds", "filtering", "shape", "aggression", "ancestry", "multiway", "river", "evidence", "transfer"];
const approvedModuleIds = ["geometry", "preflop", "blinds", "aggression"];
const manifestPath = new URL("../content/i18n/editorial-manifest.json", import.meta.url);
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const requireFull = process.env.REQUIRE_FULL_EDITORIAL === "1";

function gitBlobSha(buffer) {
  return createHash("sha1")
    .update(`blob ${buffer.byteLength}\0`)
    .update(buffer)
    .digest("hex");
}

function quotedStringValues(source) {
  return [...source.matchAll(/"((?:\\.|[^"\\])*)"/gu)]
    .map((match) => match[1])
    .join("\n");
}

assert.equal(manifest.schema_version, 3, "Unsupported editorial manifest schema");
assert.ok(["GOLD_SLICE_ACCEPTED", "FULLY_ACCEPTED"].includes(manifest.status), "Invalid editorial status");
assert.deepEqual(Object.keys(manifest.modules), moduleIds, "Editorial manifest module order or coverage changed");
assert.match(manifest.review_policy, /can never create an approval/u, "Review policy must forbid automatic approval");

for (const [relativePath, expectedSha] of Object.entries(manifest.source_blobs)) {
  const bytes = await readFile(new URL(`../${relativePath}`, import.meta.url));
  assert.equal(gitBlobSha(bytes), expectedSha, `Editorial source lock is stale: ${relativePath}`);
}

for (const moduleId of moduleIds) {
  const row = manifest.modules[moduleId];
  assert.ok(row && typeof row.note === "string", `${moduleId}: missing editorial row`);
  assert.ok(["APPROVED", "PENDING"].includes(row.ru), `${moduleId}: invalid RU status`);
  assert.ok(["APPROVED", "PENDING"].includes(row.en), `${moduleId}: invalid EN status`);
  if (approvedModuleIds.includes(moduleId)) {
    assert.equal(row.ru, "APPROVED", `${moduleId}: Russian gold is not approved`);
    assert.equal(row.en, "APPROVED", `${moduleId}: English gold is not approved`);
  } else {
    assert.equal(row.ru, "PENDING", `${moduleId}: Russian copy must remain pending until manual review`);
    assert.equal(row.en, "PENDING", `${moduleId}: English copy must remain pending until manual review`);
  }
}

if (requireFull) {
  assert.equal(manifest.status, "FULLY_ACCEPTED", "Full editorial release requested without FULLY_ACCEPTED manifest");
  for (const moduleId of moduleIds) {
    assert.equal(manifest.modules[moduleId].ru, "APPROVED", `${moduleId}: Russian is not approved`);
    assert.equal(manifest.modules[moduleId].en, "APPROVED", `${moduleId}: English is not approved`);
  }
}

const geometryEn = await readFile(new URL("../content/i18n/geometry-gold.ts", import.meta.url), "utf8");
for (const drillId of ["geo-01", "geo-02", "geo-03", "geo-04", "geo-05"]) {
  assert.ok(geometryEn.includes(`setDrillCopy("${drillId}"`), `Missing English gold drill ${drillId}`);
}
for (const cardId of ["geo-card-unit", "geo-card-pair", "geo-card-spr"]) {
  assert.ok(geometryEn.includes(`"${cardId}"`), `Missing English gold card ${cardId}`);
}
assert.equal(/[А-Яа-яЁё]/u.test(geometryEn), false, "English geometry gold contains Cyrillic copy");

const geometryRu = await readFile(new URL("../content/i18n/geometry-ru-gold.ts", import.meta.url), "utf8");
for (const drillId of ["geo-01", "geo-02", "geo-03", "geo-04", "geo-05"]) {
  assert.ok(geometryRu.includes(`"${drillId}"`), `Missing Russian gold drill ${drillId}`);
}
for (const cardId of ["geo-card-unit", "geo-card-pair", "geo-card-spr"]) {
  assert.ok(geometryRu.includes(`"${cardId}"`), `Missing Russian gold card ${cardId}`);
}

const wave3 = await readFile(new URL("../content/i18n/wave3-priority-gold.ts", import.meta.url), "utf8");
for (const drillId of [
  "pre-01", "pre-02", "pre-03", "pre-04", "pre-05",
  "bli-01", "bli-02", "bli-03", "bli-04", "bli-05",
  "agg-01", "agg-02", "agg-03", "agg-04", "agg-05",
]) {
  assert.ok(wave3.includes(`"${drillId}"`), `Missing Wave 3 gold drill ${drillId}`);
}
for (const cardId of [
  "pre-card-seq", "pre-card-flat", "pre-card-polar",
  "bli-card-source", "bli-card-close", "bli-card-sb",
  "agg-card-value", "agg-card-job", "agg-card-scary",
]) {
  assert.ok(wave3.includes(`"${cardId}"`), `Missing Wave 3 gold card ${cardId}`);
}
const ruPriority = wave3.slice(wave3.indexOf("const RU_PRIORITY"), wave3.indexOf("const EN_PRIORITY"));
const enPriority = wave3.slice(wave3.indexOf("const EN_PRIORITY"), wave3.indexOf("function replaceStrings"));
assert.equal(/[А-Яа-яЁё]/u.test(enPriority), false, "English Wave 3 gold contains Cyrillic copy");

const bannedRuPhrases = [
  /Переноси глубоко/u,
  /due review/iu,
  /learner state/iu,
  /Explicit transfer probe/iu,
  /Field validated/iu,
  /Content introduced/iu,
  /Cold response/iu,
  /Strategic denominator/iu,
  /pairwise effective stack/iu,
  /post-action SPR/iu,
  /Side confrontations/iu,
  /single-raised pot/iu,
  /preflop-дерев/iu,
  /Players-behind gate/iu,
  /Value squeeze core/iu,
  /node signature/iu,
  /jobless bluff/iu,
  /arrival range/iu,
  /credible bluff supply/iu,
];
const runtimeRu = await readFile(new URL("../content/i18n/runtime.ts", import.meta.url), "utf8");
const route = await readFile(new URL("../content/i18n/learning-route.ts", import.meta.url), "utf8");
const ruRoute = route.slice(route.indexOf("ru: ["), route.indexOf("en: ["));
const ruRouteLearnerCopy = quotedStringValues(ruRoute);
for (const pattern of bannedRuPhrases) {
  assert.doesNotMatch(`${runtimeRu}\n${geometryRu}\n${ruPriority}\n${ruRouteLearnerCopy}`, pattern, `Russian learner copy contains banned phrase ${pattern}`);
}

assert.equal((route.match(/percent:\s*(?:0|10|20|35|50|65|80|90|100),/gu) ?? []).length, 18, "Both locales must contain nine route stages");
assert.equal((route.match(/evidenceGate:/gu) ?? []).length, 19, "Every route stage must name an evidence gate");
for (const pattern of [/evidence/iu, /probe/iu, /repair/iu, /retention/iu, /field validation/iu]) {
  assert.doesNotMatch(ruRouteLearnerCopy, pattern, `Russian route contains internal terminology ${pattern}`);
}

const app = await readFile(new URL("../components/LiveCashApp.tsx", import.meta.url), "utf8");
assert.match(app, /not a decorative overall percentage/u, "Route UI must reject decorative progress claims");
assert.match(app, /applyGeometryLocale/u, "Direct LCM-01 locale application is missing");
assert.match(app, /applyWave3PriorityLocale/u, "Wave 3 bilingual locale application is missing");
assert.match(app, /data-editorial-gold/u, "Approved-module editorial banner boundary is missing");
assert.ok(app.includes("LCM-0[1236]"), "Approved gold LCM set is not represented in runtime status logic");
assert.match(app, /РАЗБОР РЕШЕНИЯ/u, "Hard-coded learner labels are not localized");

const runtimeCore = await readFile(new URL("../content/i18n/runtime-core.ts", import.meta.url), "utf8");
assert.match(runtimeCore, /contentFallback/u, "Pending-module fallback is missing");
assert.match(runtimeCore, /moduleHeadings/u, "English module headings are missing");

console.log(`editorial gate passed: ${approvedModuleIds.length} bilingual gold modules approved; ${moduleIds.length - approvedModuleIds.length} RU/EN modules honestly pending${requireFull ? " (full release mode)" : ""}.`);
