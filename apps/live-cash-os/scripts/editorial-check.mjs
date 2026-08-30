import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { validateSourceLockState } from "./governance-contract.mjs";

const moduleIds = ["geometry", "preflop", "blinds", "filtering", "shape", "aggression", "ancestry", "multiway", "river", "evidence", "transfer"];
const manifest = JSON.parse(await readFile(new URL("../content/i18n/editorial-manifest.json", import.meta.url), "utf8"));
const requireFull = process.env.REQUIRE_FULL_EDITORIAL === "1" || process.argv.includes("--release");

function gitBlobSha(buffer) {
  return createHash("sha1").update(`blob ${buffer.byteLength}\0`).update(buffer).digest("hex");
}

function quoted(source) {
  return [...source.matchAll(/"((?:\\.|[^"\\])*)"/gu)].map((match) => match[1]).join("\n");
}

assert.equal(manifest.schema_version, 5, "Unsupported editorial manifest schema");
assert.ok(["FULLY_ACCEPTED", "TRANSITIONAL_REVIEW_REQUIRED"].includes(manifest.status), `Unsupported editorial acceptance state: ${manifest.status}`);
assert.deepEqual(Object.keys(manifest.modules), moduleIds, "Editorial manifest module order or coverage changed");
assert.match(manifest.review_policy, /can never create an approval/u, "Review policy must forbid automatic approval");

const actualSourceBlobs = {};
for (const relativePath of Object.keys(manifest.source_blobs)) {
  const bytes = await readFile(new URL(`../${relativePath}`, import.meta.url));
  actualSourceBlobs[relativePath] = gitBlobSha(bytes);
}
const sourceLockResult = validateSourceLockState(manifest, actualSourceBlobs, { requireFull });

for (const moduleId of moduleIds) {
  const row = manifest.modules[moduleId];
  assert.ok(row && typeof row.note === "string" && row.note.trim(), `${moduleId}: missing editorial row`);
  assert.ok(["APPROVED", "REVIEW_REQUIRED"].includes(row.ru), `${moduleId}: invalid Russian editorial state`);
  assert.ok(["APPROVED", "REVIEW_REQUIRED"].includes(row.en), `${moduleId}: invalid English editorial state`);
  if (requireFull) {
    assert.equal(row.ru, "APPROVED", `${moduleId}: Russian is not approved in full mode`);
    assert.equal(row.en, "APPROVED", `${moduleId}: English is not approved in full mode`);
  }
}
if (requireFull) {
  assert.equal(manifest.status, "FULLY_ACCEPTED", "Full editorial mode requires FULLY_ACCEPTED");
  assert.equal(manifest.strategy_status, "CURRICULUM_STRATEGY_GOLD", "Full editorial mode requires strategy gold");
  assert.equal(manifest.drill_content_status, "DRILLS_APPROVED", "Full editorial mode requires approved drills");
  assert.equal(manifest.final_composition?.status, "CURRENT", "Full editorial mode requires a current final composition digest");
  assert.equal(manifest.final_composition?.approved_digest, manifest.final_composition?.current_digest, "Full editorial mode rejects a stale final composition digest");
}

const geometryEn = await readFile(new URL("../content/i18n/geometry-gold.ts", import.meta.url), "utf8");
const geometryRu = await readFile(new URL("../content/i18n/geometry-ru-gold.ts", import.meta.url), "utf8");
for (const drillId of ["geo-01", "geo-02", "geo-03", "geo-04", "geo-05"]) {
  assert.ok(geometryEn.includes(`setDrillCopy("${drillId}"`), `Missing English gold drill ${drillId}`);
  assert.ok(geometryRu.includes(`"${drillId}"`), `Missing Russian gold drill ${drillId}`);
}
assert.equal(/[А-Яа-яЁё]/u.test(geometryEn), false, "English geometry gold contains Cyrillic copy");

const wave3 = await readFile(new URL("../content/i18n/wave3-priority-gold.ts", import.meta.url), "utf8");
const ruPriority = wave3.slice(wave3.indexOf("const RU_PRIORITY"), wave3.indexOf("const EN_PRIORITY"));
const enPriority = wave3.slice(wave3.indexOf("const EN_PRIORITY"), wave3.indexOf("function replaceStrings"));
assert.equal(/[А-Яа-яЁё]/u.test(enPriority), false, "English Wave 3 gold contains Cyrillic copy");
for (const prefix of ["pre", "bli", "agg"]) {
  for (let index = 1; index <= 5; index += 1) assert.ok(wave3.includes(`"${prefix}-0${index}"`), `Missing Wave 3 drill ${prefix}-0${index}`);
}
// Internal source-family/codename leak guard: a small explicit denylist of
// confirmed internal names that must never surface as learner-facing prose
// (distinct from admitted sourceRefs citations like "FTGU-E05", which are
// intentionally exposed). Currently guards the demonstrated "Carrot" leak in
// the agg-05 EN explanation.
for (const internalName of [/\bCarrot\b/u]) {
  assert.doesNotMatch(ruPriority, internalName, `Wave 3 RU priority copy leaks an internal source-family name: ${internalName}`);
  assert.doesNotMatch(enPriority, internalName, `Wave 3 EN priority copy leaks an internal source-family name: ${internalName}`);
}

const wave4 = await readFile(new URL("../content/i18n/wave4-curriculum-gold.ts", import.meta.url), "utf8");
const ruWave4 = wave4.slice(wave4.indexOf("const RU_WAVE4"), wave4.indexOf("const EN_WAVE4"));
const enWave4 = wave4.slice(wave4.indexOf("const EN_WAVE4"), wave4.indexOf("function applyDrillCopy"));
assert.equal(/[А-Яа-яЁё]/u.test(enWave4), false, "English Wave 4 gold contains Cyrillic copy");
for (const prefix of ["fil", "sha", "anc", "mul", "riv", "evi", "tra"]) {
  for (let index = 1; index <= 5; index += 1) assert.ok(wave4.includes(`"${prefix}-0${index}"`), `Missing Wave 4 drill ${prefix}-0${index}`);
}

const wave4Final = await readFile(new URL("../content/i18n/wave4-final-editorial.ts", import.meta.url), "utf8");
const wave4rFinalLanguage = await readFile(new URL("../content/i18n/wave4r-final-language.ts", import.meta.url), "utf8");
const wave5PracticeCopy = await readFile(new URL("../content/i18n/wave5-practice-copy.ts", import.meta.url), "utf8");
assert.match(wave4Final, /applyEvidenceRussianFinal/u, "Final LCM-10 Russian editorial layer is missing");
assert.match(wave4Final, /applyTransferRussianFinal/u, "Final LCM-11 Russian editorial layer is missing");
assert.match(wave4Final, /if \(locale !== "ru"\) return/u, "Final Wave 4 editorial layer must not mutate English gold");
assert.match(wave4rFinalLanguage, /applyEnglishFinalLanguage/u, "Final Wave 4R English language pass is missing");
assert.equal(/[А-Яа-яЁё]/u.test(quoted(wave4rFinalLanguage)), false, "Final English language pass contains Cyrillic learner copy");
for (const required of [
  "How bet size changes your response",
  "Trace the range through the hand",
  "Count the bluffs first",
  "Understand the price and your real options",
  "a jamming range is built around strong value, the best bluffs, and a few hybrid hands",
]) assert.ok(wave4rFinalLanguage.includes(required), `Final learner-language repair is missing: ${required}`);
for (const pattern of [
  /Range ancestry/iu,
  /response shape/iu,
  /range compensation/iu,
  /OOP raise gate/iu,
  /source branch/iu,
  /arrival range/iu,
  /node-specific/iu,
  /claim-driven/iu,
]) assert.doesNotMatch(quoted(wave4rFinalLanguage), pattern, `Final English module repair contains research phrase ${pattern}`);
assert.doesNotMatch(wave4rFinalLanguage, /situation:\s*"200bb\. BB 3-bets BTN clearly wider than normal/iu, "Unsupported exact 200bb depth returned to the active EN aggression example");
assert.doesNotMatch(wave5PracticeCopy, /wave4r-poker-native/u, "Wave 5 practice copy must not reactivate dead Wave 4R compatibility semantics");

const runtime = await readFile(new URL("../content/i18n/runtime.ts", import.meta.url), "utf8");
const route = await readFile(new URL("../content/i18n/learning-route.ts", import.meta.url), "utf8");
const diagnostic = await readFile(new URL("../content/diagnostic.ts", import.meta.url), "utf8");
const app = await readFile(new URL("../components/LiveCashApp.tsx", import.meta.url), "utf8");
const core = await readFile(new URL("../components/LiveCashAppCore.tsx", import.meta.url), "utf8");
const practice = await readFile(new URL("../components/Wave5PracticeLayer.tsx", import.meta.url), "utf8");
const localePipeline = await readFile(new URL("../content/i18n/locale-pipeline.ts", import.meta.url), "utf8");
const learnerUi = await readFile(new URL("../content/i18n/learner-ui.ts", import.meta.url), "utf8");
const routeComponent = await readFile(new URL("../components/LearningRoute.tsx", import.meta.url), "utf8");
const e2e = await readFile(new URL("../e2e/live-cash.spec.mjs", import.meta.url), "utf8");

const diagnosticRuCopy = quoted(diagnostic);
const diagnosticEnBlock = runtime.slice(runtime.indexOf("export const diagnosticEnglish"), runtime.indexOf("Object.assign(runtimeCopy.ru"));
const diagnosticEnCopy = quoted(diagnosticEnBlock);
assert.deepEqual([...diagnostic.matchAll(/id:\s*"(LD-\d{3})"/gu)].map((match) => match[1]), Array.from({ length: 10 }, (_, index) => `LD-${String(index + 1).padStart(3, "0")}`), "T1 identity changed");
assert.deepEqual([...diagnosticEnBlock.matchAll(/"(LD-\d{3})":/gu)].map((match) => match[1]), Array.from({ length: 10 }, (_, index) => `LD-${String(index + 1).padStart(3, "0")}`), "English T1 identity coverage changed");
assert.equal(/[А-Яа-яЁё]/u.test(diagnosticEnCopy), false, "English T1 contains Cyrillic copy");
for (const pattern of [
  /Straddle denominator/iu, /Pairwise multiway depth/iu, /Blind source identity/iu,
  /compensation(?:-| )test/iu, /preflop air/iu, /near-range node/iu,
  /directional raise incentive/iu, /thin\/protection raise branch/iu, /\bMDF\b/u,
  /population evidence/iu, /bluff supply/iu, /range ancestry/iu,
]) {
  assert.doesNotMatch(diagnosticRuCopy, pattern, `Russian T1 contains hybrid learner phrase ${pattern}`);
  assert.doesNotMatch(diagnosticEnCopy, pattern, `English T1 contains research/editorial phrase ${pattern}`);
}

assert.equal((route.match(/percent:\s*(?:0|10|20|35|50|65|80|90|100),/gu) ?? []).length, 18, "Both locales must contain nine route stages");
const ruRoute = route.slice(route.indexOf("ru: ["), route.indexOf("en: ["));
const enRoute = route.slice(route.indexOf("en: ["), route.indexOf("};\n\nexport function"));
for (const pattern of [/evidence/iu, /probe/iu, /repair/iu, /retention/iu, /field validation/iu, /state machine/iu]) {
  assert.doesNotMatch(quoted(ruRoute), pattern, `Russian route contains internal terminology ${pattern}`);
  assert.doesNotMatch(quoted(enRoute), pattern, `English route contains internal terminology ${pattern}`);
}
assert.match(routeComponent, /This is not one overall mastery score/u, "English route boundary is not learner-facing");
assert.doesNotMatch(routeComponent, /distinct learner-state event/iu, "Route UI still exposes learner-state jargon");

assert.match(runtime, /export const moduleHeadings = Object\.fromEntries/u, "Legacy moduleHeadings must be a compatibility export");
assert.match(runtime, /\[id, \{ en: \{\} \}\]/u, "Legacy moduleHeadings must not contain semantic copy");
for (const stale of ["Exploit filters before adjustment", "Aggression with a clear job", "River evidence before blockers"]) {
  assert.doesNotMatch(runtime, new RegExp(stale.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "u"), `Stale heading survived: ${stale}`);
}

const runtimeOverrides = runtime.slice(runtime.indexOf("Object.assign(runtimeCopy.ru"));
assert.doesNotMatch(runtimeOverrides, /EN REVIEW REQUIRED/u, "Approved runtime still exposes EN REVIEW REQUIRED");
assert.doesNotMatch(runtimeOverrides, /still under poker-aware editorial review/iu, "Runtime still exposes an obsolete editorial-pending claim");
assert.equal((runtimeOverrides.match(/translationPending:\s*""/gu) ?? []).length, 2, "Both runtime locales must have an empty pending label");
assert.equal((runtimeOverrides.match(/contentFallback:\s*""/gu) ?? []).length, 2, "Both runtime locales must have an empty fallback");
for (const stale of [/module bodies remain source-locked/iu, /editorial approval/iu, /translation pending/iu]) {
  assert.doesNotMatch(quoted(core), stale, `Core contains stale approval message ${stale}`);
}

for (const symbol of ["applyGeometryLocale", "applyWave3PriorityLocale", "applyWave4CurriculumLocale", "applyWave4FinalEditorialLocale", "applyWave5PracticeCopy", "applyWave4RFinalLanguage"]) {
  assert.match(localePipeline, new RegExp(symbol, "u"), `Locale pipeline misses ${symbol}`);
}
assert.ok(localePipeline.lastIndexOf("applyWave4RFinalLanguage(locale)") > localePipeline.lastIndexOf("applyWave5PracticeCopy(locale)"), "Final Wave 4R language pass must be the last locale copy authority");
assert.doesNotMatch(localePipeline, /wave4r-poker-native/u, "Canonical locale pipeline must not import dead compatibility semantics");
assert.match(core, /applyLocaleData\(nextLocale\)/u, "Restore path must apply locale data before render");
assert.match(core, /applyLocaleData\(next\)/u, "Locale switch must apply locale data before render");
assert.match(core, /<LearningRoute locale=\{locale\} \/>/u, "Learning route must render from React state");
for (const [name, source] of [["LiveCashApp", app], ["LiveCashAppCore", core]]) {
  for (const forbidden of [/MutationObserver/u, /data-wave4r-label/u, /annotateLegacyUi/u, /wave4rEmptyFallback/u, /\.textContent\s*=/u]) {
    assert.doesNotMatch(source, forbidden, `${name} retains removed post-render localisation bridge ${forbidden}`);
  }
}
for (const forbidden of [/data-wave4r-label/u, /annotateLegacyUi/u, /wave4rEmptyFallback/u, /\.textContent\s*=/u]) {
  assert.doesNotMatch(practice, forbidden, `Wave5PracticeLayer retains removed post-render localisation bridge ${forbidden}`);
}
const liveHostStart = practice.indexOf("function useLiveHost(");
const liveHostEnd = practice.indexOf("\nfunction ", liveHostStart + 1);
assert.ok(liveHostStart >= 0 && liveHostEnd > liveHostStart, "Wave5PracticeLayer must keep bounded useLiveHost portal discovery");
const liveHostSource = practice.slice(liveHostStart, liveHostEnd);
const practiceOutsideLiveHost = practice.slice(0, liveHostStart) + practice.slice(liveHostEnd);
assert.equal((practice.match(/new MutationObserver\s*\(/gu) ?? []).length, 1, "Wave5PracticeLayer may contain exactly one portal-host MutationObserver");
assert.equal((liveHostSource.match(/new MutationObserver\s*\(/gu) ?? []).length, 1, "Wave5PracticeLayer MutationObserver must stay inside useLiveHost");
assert.doesNotMatch(practiceOutsideLiveHost, /MutationObserver/u, "Wave5PracticeLayer must not add MutationObserver outside useLiveHost");
assert.match(liveHostSource, /document\.querySelector<HTMLElement>\(selector\)/u, "useLiveHost must discover only the requested portal selector");
assert.match(liveHostSource, /setHost\(/u, "useLiveHost must update React host state rather than learner copy");
assert.match(liveHostSource, /new MutationObserver\(sync\)/u, "useLiveHost observer must only re-run host discovery");
assert.match(liveHostSource, /observer\.observe\(document\.body,\s*\{\s*childList:\s*true,\s*subtree:\s*true\s*\}\)/u, "useLiveHost observer must remain bounded to DOM host availability");
assert.match(liveHostSource, /return \(\) => observer\.disconnect\(\)/u, "useLiveHost observer must disconnect on cleanup");
assert.doesNotMatch(core, /translationPending/u, "Core must not render obsolete pending labels");
assert.doesNotMatch(core, /contentFallback/u, "Core must not render obsolete fallback copy");

for (const pattern of [
  /session\.mode\.toUpperCase/u,
  /\{drill\.kind\}<\/p>/u,
  /\{card\.kind\}<\/p>/u,
  />\{note\.status\}<\/span>/u,
  /T1 · \{diagnostic\.status\}/u,
  />ACTIVE RECALL/u,
  />Cue:<\/b>/u,
  />Action:<\/b>/u,
  />Reason:<\/b>/u,
  /<label>Pot<input/u,
  /<label>Stack<input/u,
  /<label>Bet \/ call<input/u,
]) assert.doesNotMatch(core, pattern, `Core renders raw learner label ${pattern}`);
for (const helper of ["sessionModeLabel", "drillKindLabel", "cardKindLabel", "fieldStatusLabel", "diagnosticStatusLabel", "labLabels", "fieldFactLabels"]) {
  assert.match(core, new RegExp(helper, "u"), `Core must use direct locale helper ${helper}`);
  assert.match(learnerUi, new RegExp(`export function ${helper}`, "u"), `Missing learner UI helper ${helper}`);
}

const ruRuntime = runtime.slice(runtime.indexOf("Object.assign(runtimeCopy.ru"), runtime.indexOf("Object.assign(runtimeCopy.en"));
const enRuntime = runtime.slice(runtime.indexOf("Object.assign(runtimeCopy.en"), runtime.indexOf("const RU_CLASS_MESSAGES"));
assert.equal(/[А-Яа-яЁё]/u.test(quoted(enRuntime)), false, "English runtime shell contains Cyrillic copy");
for (const pattern of [/current model/iu, /mechanism/iu, /retention/iu, /transfer probe/iu, /learner-state/iu, /field validated/iu, /decorative overall/iu, /evidence gate/iu]) {
  assert.doesNotMatch(quoted(ruRuntime), pattern, `Russian runtime contains internal learner phrase ${pattern}`);
  assert.doesNotMatch(quoted(enRuntime), pattern, `English runtime contains internal learner phrase ${pattern}`);
}

const ruWave4BeforeEvidence = ruWave4.slice(0, ruWave4.indexOf("  evidence: {"));
const generalRuCopy = [quoted(ruRuntime), quoted(geometryRu), quoted(ruPriority), quoted(ruWave4BeforeEvidence), quoted(ruRoute), quoted(learnerUi)].join("\n");
for (const pattern of [
  /Переноси глубоко/u, /due review/iu, /Explicit transfer probe/iu, /Strategic denominator/iu,
  /pairwise effective stack/iu, /post-action SPR/iu, /Players-behind gate/iu,
  /Value squeeze core/iu, /node signature/iu, /jobless bluff/iu, /arrival range/iu,
  /credible bluff supply/iu, /range ownership audit/iu,
]) assert.doesNotMatch(generalRuCopy, pattern, `Russian learner copy contains banned phrase ${pattern}`);

const finalEvidenceRuCopy = quoted(wave4Final);
for (const pattern of [/learner state/iu, /WORKING evidence/iu, /transfer probe/iu, /PENDING_REVIEW/iu, /REVIEWED_VALID/iu, /REVIEWED_REPAIR/iu, /RETAINED/iu, /FIELD_VALIDATED/iu, /CONTENT_COMPLETED/iu, /product contract/iu, /field evidence/iu, /retention evidence/iu]) {
  assert.doesNotMatch(finalEvidenceRuCopy, pattern, `Final Russian LCM-10/11 copy contains system phrase ${pattern}`);
}

for (const required of [
  "RU to EN to RU preserves the active decision and learner identity",
  "the starting check has natural T1 copy in both locales",
  "approved EN module cards use final poker-native headings",
  "direct learner labels do not expose raw internal statuses",
]) assert.ok(e2e.includes(required), `Missing Wave 4R rendered-output browser coverage: ${required}`);

console.log(
  `editorial rejection gate passed: ${moduleIds.length} bilingual strategic modules checked; `
  + `${sourceLockResult.stalePaths.length} source locks stale inside represented repair scope; `
  + `W2 governance lifecycle and W4R language/runtime rejection rules checked${requireFull ? " (full approval evidence required)" : ""}.`,
);
