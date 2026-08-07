import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { validateSourceLockState } from "./governance-contract.mjs";

const moduleIds = ["geometry", "preflop", "blinds", "filtering", "shape", "aggression", "ancestry", "multiway", "river", "evidence", "transfer"];
const approvedLcmCodes = Array.from({ length: 11 }, (_, index) => `LCM-${String(index + 1).padStart(2, "0")}`);
const manifest = JSON.parse(await readFile(new URL("../content/i18n/editorial-manifest.json", import.meta.url), "utf8"));
const requireFull = process.env.REQUIRE_FULL_EDITORIAL === "1" || process.argv.includes("--release");

function gitBlobSha(buffer) {
  return createHash("sha1").update(`blob ${buffer.byteLength}\0`).update(buffer).digest("hex");
}

function quoted(source) {
  return [...source.matchAll(/"((?:\\.|[^"\\])*)"/gu)].map((match) => match[1]).join("\n");
}

assert.equal(manifest.schema_version, 5, "Unsupported editorial manifest schema");
assert.ok(
  ["FULLY_ACCEPTED", "TRANSITIONAL_REVIEW_REQUIRED"].includes(manifest.status),
  `Unsupported editorial acceptance state: ${manifest.status}`,
);
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
  assert.equal(
    manifest.final_composition?.approved_digest,
    manifest.final_composition?.current_digest,
    "Full editorial mode rejects a stale final composition digest",
  );
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

const wave4 = await readFile(new URL("../content/i18n/wave4-curriculum-gold.ts", import.meta.url), "utf8");
const ruWave4 = wave4.slice(wave4.indexOf("const RU_WAVE4"), wave4.indexOf("const EN_WAVE4"));
const enWave4 = wave4.slice(wave4.indexOf("const EN_WAVE4"), wave4.indexOf("function applyDrillCopy"));
assert.equal(/[А-Яа-яЁё]/u.test(enWave4), false, "English Wave 4 gold contains Cyrillic copy");
for (const prefix of ["fil", "sha", "anc", "mul", "riv", "evi", "tra"]) {
  for (let index = 1; index <= 5; index += 1) assert.ok(wave4.includes(`"${prefix}-0${index}"`), `Missing Wave 4 drill ${prefix}-0${index}`);
}

const wave4Final = await readFile(new URL("../content/i18n/wave4-final-editorial.ts", import.meta.url), "utf8");
assert.match(wave4Final, /applyEvidenceRussianFinal/u, "Final LCM-10 Russian editorial layer is missing");
assert.match(wave4Final, /applyTransferRussianFinal/u, "Final LCM-11 Russian editorial layer is missing");
assert.match(wave4Final, /if \(locale !== "ru"\) return/u, "Final Wave 4 editorial layer must not mutate English gold");

const runtime = await readFile(new URL("../content/i18n/runtime.ts", import.meta.url), "utf8");
const route = await readFile(new URL("../content/i18n/learning-route.ts", import.meta.url), "utf8");
const diagnostic = await readFile(new URL("../content/diagnostic.ts", import.meta.url), "utf8");
const app = await readFile(new URL("../components/LiveCashApp.tsx", import.meta.url), "utf8");
const core = await readFile(new URL("../components/LiveCashAppCore.tsx", import.meta.url), "utf8");

// Wave 4R remains the single language-specific enforcement owner.
const diagnosticCopy = quoted(diagnostic);
assert.deepEqual([...diagnostic.matchAll(/id:\s*"(LD-\d{3})"/gu)].map((match) => match[1]),
  Array.from({ length: 10 }, (_, index) => `LD-${String(index + 1).padStart(3, "0")}`), "T1 identity changed");
for (const pattern of [
  /Straddle denominator/iu, /Pairwise multiway depth/iu, /Blind source identity/iu,
  /compensation-test/iu, /OOP defence/iu, /preflop air/iu, /near-range node/iu,
  /directional raise incentive/iu, /thin\/protection raise branch/iu, /\bMDF\b/u,
  /population evidence/iu, /bluff supply/iu,
]) assert.doesNotMatch(diagnosticCopy, pattern, `T1 contains hybrid learner phrase ${pattern}`);

assert.equal((route.match(/percent:\s*(?:0|10|20|35|50|65|80|90|100),/gu) ?? []).length, 18, "Both locales must contain nine route stages");
assert.equal((route.match(/evidenceGate:/gu) ?? []).length, 19, "Every route stage must expose its learner-facing completion cue");
const ruRoute = route.slice(route.indexOf("ru: ["), route.indexOf("en: ["));
const enRoute = route.slice(route.indexOf("en: ["), route.indexOf("};\n\nexport function"));
for (const pattern of [/evidence/iu, /probe/iu, /repair/iu, /retention/iu, /field validation/iu]) {
  assert.doesNotMatch(quoted(ruRoute), pattern, `Russian route contains internal terminology ${pattern}`);
}
for (const pattern of [/skill evidence/iu, /current model/iu, /admitted probe/iu, /transfer probe/iu, /repair resolved/iu, /retention/iu, /field validated/iu, /learner-state/iu, /evidence map/iu]) {
  assert.doesNotMatch(quoted(enRoute), pattern, `English route contains internal terminology ${pattern}`);
}

assert.match(runtime, /export const moduleHeadings = Object\.fromEntries/u, "Legacy moduleHeadings must be a compatibility export");
assert.match(runtime, /\[id, \{ en: \{\} \}\]/u, "Legacy moduleHeadings must not contain semantic copy");
for (const stale of ["Exploit filters before adjustment", "Aggression with a clear job", "River evidence before blockers"]) {
  assert.doesNotMatch(runtime, new RegExp(stale.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "u"), `Stale heading survived: ${stale}`);
}

const runtimeOverrides = runtime.slice(runtime.indexOf("Object.assign(runtimeCopy.ru"));
assert.doesNotMatch(runtimeOverrides, /EN REVIEW REQUIRED/u, "Approved runtime still exposes EN REVIEW REQUIRED");
assert.doesNotMatch(runtimeOverrides, /still under poker-aware editorial review/iu, "Approved runtime still exposes an editorial-pending claim");
assert.match(runtimeOverrides, /translationPending:\s*""/u, "Approved runtime pending label must be empty");
assert.match(runtimeOverrides, /contentFallback:\s*""/u, "Approved runtime fallback must be empty");

for (const symbol of ["applyGeometryLocale", "applyWave3PriorityLocale", "applyWave4CurriculumLocale", "applyWave4FinalEditorialLocale", "applyWave5PracticeCopy"]) {
  assert.match(app, new RegExp(symbol, "u"), `Locale pipeline misses ${symbol}`);
}
assert.match(app, /annotateLegacyUi/u, "Legacy hardcoded UI bridge is missing");
assert.match(app, /data-wave4r-label/u, "Safe attribute-based legacy labels are missing");
assert.match(app, /setAttribute\("aria-label"/u, "Legacy labels must expose accessible localized text");
assert.doesNotMatch(app, /\.textContent\s*=/u, "Wave 4R bridge must not mutate React-owned text nodes");
assert.match(app, /const structureObserver = new MutationObserver\(syncStructure\)/u, "Structural bridge must use safe annotation sync");
assert.match(app, /This is not one overall mastery score/u, "English route boundary is not learner-facing");
assert.doesNotMatch(app, /distinct learner-state event/iu, "Route UI still exposes learner-state jargon");
assert.doesNotMatch(app, /not a decorative overall percentage/iu, "Route UI still uses product-spec language");
for (const code of approvedLcmCodes) assert.ok(app.includes(`"${code}"`) || app.includes("length: 11"), `Runtime gold marker misses ${code}`);

for (const raw of ["ACTIVE RECALL", "Cue:", "Action:", "Reason:", "DECISION REVIEW", "AWAITING_REVIEW", "SCORED", "ROUTED", "90 sec", "Due", "All"]) {
  assert.ok(core.includes(raw), `Core hardcode inventory changed; update the Wave 4R gate for ${raw}`);
  assert.ok(app.includes(raw) || app.includes(raw.replace("DECISION REVIEW", "review")), `Legacy bridge does not account for ${raw}`);
}
assert.match(app, /wave4rEmptyFallback/u, "Blank approved-English fallback must be hidden safely");
assert.match(app, /English interface enabled\. Your current session and progress are preserved\./u, "Stale English approval notice is not neutralised");

const ruRuntime = runtime.slice(runtime.indexOf("Object.assign(runtimeCopy.ru"), runtime.indexOf("Object.assign(runtimeCopy.en"));
const ruWave4BeforeEvidence = ruWave4.slice(0, ruWave4.indexOf("  evidence: {"));
const generalRuCopy = [quoted(ruRuntime), quoted(geometryRu), quoted(ruPriority), quoted(ruWave4BeforeEvidence), quoted(ruRoute)].join("\n");
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

console.log(
  `editorial rejection gate passed: ${moduleIds.length} bilingual strategic modules checked; `
  + `${sourceLockResult.stalePaths.length} source locks intentionally stale under explicit repair scope; `
  + `Wave 4R language-truth regressions checked${requireFull ? " (full approval evidence required)" : ""}.`,
);
