import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";

const sourcePath = new URL("../content/i18n/source.ru.json", import.meta.url);
const ruPath = new URL("../content/i18n/ru.json", import.meta.url);
const enPath = new URL("../content/i18n/en.json", import.meta.url);
const manifestPath = new URL("../content/i18n/review-manifest.json", import.meta.url);
const lockPath = new URL("../content/i18n/review-lock.json", import.meta.url);

const sourceText = await readFile(sourcePath, "utf8");
const source = JSON.parse(sourceText);
const ru = JSON.parse(await readFile(ruPath, "utf8"));
const en = JSON.parse(await readFile(enPath, "utf8"));
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const sourceSha256 = createHash("sha256").update(sourceText).digest("hex");

assert.equal(manifest.schema_version, 1, "Unsupported review manifest");
assert.equal(manifest.source_sha256, sourceSha256, "Review manifest does not match the extracted source catalogue");
assert.equal(typeof manifest.reviewer, "string");
assert.ok(manifest.reviewer.trim().length > 0, "Reviewer is required");

const drillModule = {
  geo: "geometry",
  pre: "preflop",
  bli: "blinds",
  fil: "filtering",
  sha: "shape",
  agg: "aggression",
  anc: "ancestry",
  mul: "multiway",
  riv: "river",
  evi: "evidence",
  tra: "transfer",
};
const cardModule = {
  geo: "geometry",
  pre: "preflop",
  bli: "blinds",
  fil: "filtering",
  sha: "shape",
  agg: "aggression",
  anc: "ancestry",
  mul: "multiway",
  riv: "river",
  evi: "evidence",
  tra: "transfer",
};

function moduleForKey(key) {
  if (key.startsWith("module.")) return key.split(".")[1];
  if (key.startsWith("drill.")) return drillModule[key.split(".")[1].split("-")[0]];
  if (key.startsWith("card.")) return cardModule[key.split(".")[1].split("-")[0]];
  throw new Error(`Unmapped localization key: ${key}`);
}

let reviewedRu = 0;
let reviewedEn = 0;
for (const key of Object.keys(source)) {
  const moduleId = moduleForKey(key);
  const approval = manifest.modules?.[moduleId];
  if (!approval) throw new Error(`Missing module review row: ${moduleId}`);
  if (approval.ru === "APPROVED") {
    assert.equal(ru[key].source, source[key], `RU stale entry: ${key}`);
    ru[key].status = "REVIEWED";
    reviewedRu += 1;
  } else ru[key].status = "DRAFT";
  if (approval.en === "APPROVED") {
    assert.equal(en[key].source, source[key], `EN stale entry: ${key}`);
    en[key].status = "REVIEWED";
    reviewedEn += 1;
  } else en[key].status = "DRAFT";
}

const total = Object.keys(source).length;
const allApproved = Object.values(manifest.modules).every((row) => row.ru === "APPROVED" && row.en === "APPROVED");
assert.equal(manifest.status === "APPROVED", allApproved, "Manifest status and module approvals disagree");
if (manifest.status === "APPROVED") {
  assert.equal(reviewedRu, total, "Russian review is incomplete");
  assert.equal(reviewedEn, total, "English review is incomplete");
}

const lock = {
  schema_version: 2,
  status: allApproved ? "REVIEWED" : "DRAFT_NOT_ACCEPTED",
  source_sha256: sourceSha256,
  locales: ["ru", "en"],
  entries_per_locale: total,
  reviewed_entries: { ru: reviewedRu, en: reviewedEn },
  reviewer: manifest.reviewer,
  review_manifest: "content/i18n/review-manifest.json",
  policy: "only explicit source-locked module approvals can grant REVIEWED status",
};

await writeFile(ruPath, `${JSON.stringify(ru, null, 2)}\n`, "utf8");
await writeFile(enPath, `${JSON.stringify(en, null, 2)}\n`, "utf8");
await writeFile(lockPath, `${JSON.stringify(lock, null, 2)}\n`, "utf8");
console.log(`Applied explicit review manifest: RU ${reviewedRu}/${total}; EN ${reviewedEn}/${total}.`);
