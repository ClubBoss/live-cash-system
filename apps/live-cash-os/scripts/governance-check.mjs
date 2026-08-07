import { readdir, readFile } from "node:fs/promises";
import {
  validateClaimSet,
  validateGapRegistryAgainstLedger,
  validateManifest,
} from "./governance-contract.mjs";

const manifest = JSON.parse(await readFile(new URL("../content/i18n/editorial-manifest.json", import.meta.url), "utf8"));
const acceptanceLedger = await readFile(new URL("../ACCEPTANCE_LEDGER.md", import.meta.url), "utf8");
const gapRegistry = JSON.parse(await readFile(new URL("../content/claims/source-gap-dependencies.json", import.meta.url), "utf8"));
const sourceGapLedger = await readFile(new URL("../../../sources/carrot-poker/source-gap-ledger.md", import.meta.url), "utf8");

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
const result = validateManifest(manifest, acceptanceLedger);

console.log(
  `governance gate passed: ${claims.length} claims source-gap reviewed; ${result.approvedCount} locale approvals current; ${result.reviewRequiredCount} locale reviews pending.`,
);
