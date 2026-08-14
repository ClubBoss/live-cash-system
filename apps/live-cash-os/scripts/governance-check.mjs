import { readdir, readFile } from "node:fs/promises";
import {
  validateClaimSet,
  validateGapRegistryAgainstLedger,
  validateManifest,
} from "./governance-contract.mjs";

const requireRelease = process.argv.includes("--release");
const manifest = JSON.parse(await readFile(new URL("../content/i18n/editorial-manifest.json", import.meta.url), "utf8"));
const acceptanceLedger = await readFile(new URL("../ACCEPTANCE_LEDGER.md", import.meta.url), "utf8");
const gapRegistry = JSON.parse(await readFile(new URL("../content/claims/source-gap-dependencies.json", import.meta.url), "utf8"));
const sourceGapLedger = await readFile(new URL("../../../sources/carrot-poker/source-gap-ledger.md", import.meta.url), "utf8");
const projectAtlas = await readFile(new URL("../../../PROJECT_ATLAS.md", import.meta.url), "utf8");
const startHere = await readFile(new URL("../../../START_HERE.md", import.meta.url), "utf8");
const currentProjectState = await readFile(new URL("../../../state/CURRENT_PROJECT_STATE.yaml", import.meta.url), "utf8");

function validateActiveProjectTruth() {
  const featureFreeze = /feature_freeze:\s*true/u.test(currentProjectState);
  const w10Pending = /w10[^\n]*NOT_COMPLETED/iu.test(currentProjectState);
  if (!featureFreeze || !w10Pending) return;

  const stale = ["DIAGNOSTIC_EXECUTION_PHASE", "cold free-text decisions"]
    .filter((marker) => projectAtlas.includes(marker));
  if (/^`T1_EXECUTION_NEXT`$/mu.test(projectAtlas)) stale.push("standalone T1_EXECUTION_NEXT verdict");
  if (stale.length) {
    throw new Error(`PROJECT_ATLAS contradicts feature-freeze/W10 truth: stale markers=${stale.join(", ")}`);
  }
  if (!projectAtlas.includes("REAL_USE_VALIDATION") || !projectAtlas.includes("W10_EMPIRICAL_VALIDATION")) {
    throw new Error("PROJECT_ATLAS must route feature-freeze work through REAL_USE_VALIDATION -> W10_EMPIRICAL_VALIDATION");
  }
  if (!startHere.includes("REAL_USE_VALIDATION") || !startHere.includes("W10_EMPIRICAL_VALIDATION")) {
    throw new Error("START_HERE must preserve the active REAL_USE_VALIDATION -> W10_EMPIRICAL_VALIDATION route");
  }
}

validateActiveProjectTruth();

const claimsDirectory = new URL("../content/claims/", import.meta.url);
const claimFiles = (await readdir(claimsDirectory))
  .filter((name) => /^lcm-\d{2}\.claims\.json$/u.test(name))
  .sort();
const claims = [];
for (const file of claimFiles) {
  claims.push(...JSON.parse(await readFile(new URL(file, claimsDirectory), "utf8")));
}

const openGapIds = validateGapRegistryAgainstLedger(gapRegistry, sourceGapLedger);
validateClaimSet(claims, gapRegistry, openGapIds);
const result = validateManifest(manifest, acceptanceLedger, { requireRelease });

console.log(
  `${requireRelease ? "release/full-approval" : "candidate"} governance gate passed: ${claims.length} claims source-gap reviewed; `
  + `strategy=${result.strategyStatus}; drills=${result.drillContentStatus}; final=${result.finalCompositionStatus}; `
  + `${result.approvedCount} locale approvals current; ${result.reviewRequiredCount} locale reviews pending.`,
);
