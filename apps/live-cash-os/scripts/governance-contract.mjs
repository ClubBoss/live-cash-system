import assert from "node:assert/strict";
import { createHash } from "node:crypto";

const admittedStatuses = new Set(["ADMITTED", "FIELD_VALIDATED"]);
const openQuestionStatuses = new Set(["RESEARCH_NOTE", "CANDIDATE", "BLOCKED_SOURCE_GAP", "REJECTED_OR_SUPERSEDED"]);
const localeStatuses = new Set(["APPROVED", "REVIEW_REQUIRED"]);

export function corpusFingerprint(sourceBlobs) {
  const canonical = Object.entries(sourceBlobs)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([path, sha]) => `${path}=${sha}`)
    .join("\n");
  return createHash("sha256").update(canonical).digest("hex");
}

export function extractGapLabels(markdown) {
  function section(start, end) {
    const startIndex = markdown.indexOf(start);
    const endIndex = markdown.indexOf(end, startIndex + start.length);
    assert.notEqual(startIndex, -1, `Missing source-gap section: ${start}`);
    assert.notEqual(endIndex, -1, `Missing source-gap section boundary: ${end}`);
    return markdown
      .slice(startIndex + start.length, endIndex)
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.startsWith("- "))
      .map((line) => line.slice(2).replace(/;$/, ""));
  }

  return [
    ...section("## Strategic gaps still open", "## Claim-driven visual dependencies"),
    ...section("## Claim-driven visual dependencies", "## Unknown-supplement audit status"),
  ];
}

export function validateGapRegistryAgainstLedger(registry, markdown) {
  assert.equal(registry.schema_version, 1, "Unsupported source-gap dependency schema");
  const ledgerLabels = extractGapLabels(markdown).sort();
  const registryLabels = registry.open_gaps.map((gap) => gap.label).sort();
  assert.deepEqual(registryLabels, ledgerLabels, "Machine-readable open-gap registry is stale against the source ledger");

  const ids = new Set();
  for (const gap of registry.open_gaps) {
    assert.match(gap.gap_id, /^GAP-[A-Z0-9-]+$/, `Invalid gap id: ${gap.gap_id}`);
    assert.equal(ids.has(gap.gap_id), false, `Duplicate gap id: ${gap.gap_id}`);
    ids.add(gap.gap_id);
  }
  return ids;
}

export function validateClaimAdmission(claim, dependencies, openGapIds) {
  if (["LOW", "UNRESOLVED"].includes(claim.confidence)) {
    assert.equal(admittedStatuses.has(claim.status), false, `${claim.claim_id}: ${claim.confidence} confidence cannot be admitted`);
  }
  if (claim.claim_type === "OPEN_QUESTION") {
    assert.equal(openQuestionStatuses.has(claim.status), true, `${claim.claim_id}: OPEN_QUESTION became learner prescription`);
  }

  for (const dependency of dependencies ?? []) {
    assert.equal(openGapIds.has(dependency.gap_id), true, `${claim.claim_id}: unknown source gap ${dependency.gap_id}`);
    assert.ok(dependency.rationale?.trim(), `${claim.claim_id}: source-gap dependency needs rationale`);
    if (dependency.materiality === "MATERIAL_BLOCKING") {
      assert.equal(
        ["BLOCKED_SOURCE_GAP", "REJECTED_OR_SUPERSEDED"].includes(claim.status),
        true,
        `${claim.claim_id}: material unresolved source gap must block admission`,
      );
    } else {
      assert.equal(dependency.materiality, "NON_BLOCKING_SCOPED", `${claim.claim_id}: invalid source-gap materiality`);
    }
  }
}

export function validateClaimSet(claims, registry, openGapIds) {
  const actualIds = claims.map((claim) => claim.claim_id).sort();
  const reviewedIds = [...registry.reviewed_claim_ids].sort();
  assert.deepEqual(reviewedIds, actualIds, "Every current strategic claim must have an explicit source-gap dependency review");

  const claimsById = new Map(claims.map((claim) => [claim.claim_id, claim]));
  for (const claimId of Object.keys(registry.dependencies)) {
    assert.equal(claimsById.has(claimId), true, `Source-gap dependency references unknown claim ${claimId}`);
  }
  for (const claim of claims) validateClaimAdmission(claim, registry.dependencies[claim.claim_id] ?? [], openGapIds);
}

export function validateManifest(manifest, acceptanceLedger) {
  assert.equal(manifest.schema_version, 4, "Unsupported editorial manifest schema");
  assert.equal(manifest.strategy_status, "CURRICULUM_STRATEGY_GOLD", "Strategy truth must be represented separately from language approval");
  assert.ok(manifest.review_policy.includes("can never create an approval"), "Manifest must preserve rejection-only automation policy");

  const fingerprint = corpusFingerprint(manifest.source_blobs);
  let approvedCount = 0;
  let reviewRequiredCount = 0;
  const validEvidenceKeys = new Set();

  for (const [moduleId, row] of Object.entries(manifest.modules)) {
    for (const locale of ["ru", "en"]) {
      const status = row[locale];
      assert.equal(localeStatuses.has(status), true, `${moduleId}.${locale}: invalid editorial status ${status}`);
      const evidenceKey = `${moduleId}.${locale}`;
      validEvidenceKeys.add(evidenceKey);
      const evidence = manifest.human_approvals[evidenceKey];
      if (status === "APPROVED") {
        approvedCount += 1;
        assert.ok(evidence, `${evidenceKey}: APPROVED requires explicit human evidence`);
        assert.equal(evidence.reviewer_kind, "HUMAN", `${evidenceKey}: approval is human-only`);
        assert.ok(evidence.reviewer?.trim(), `${evidenceKey}: human reviewer identity is required`);
        assert.match(evidence.reviewed_at ?? "", /^\d{4}-\d{2}-\d{2}$/, `${evidenceKey}: review date is required`);
        assert.equal(evidence.corpus_fingerprint, fingerprint, `${evidenceKey}: approved claim/copy fingerprint is stale; review is invalidated`);
      } else {
        reviewRequiredCount += 1;
      }
    }
  }

  for (const evidenceKey of Object.keys(manifest.human_approvals)) {
    assert.equal(validEvidenceKeys.has(evidenceKey), true, `Human approval evidence references unknown locale ${evidenceKey}`);
  }

  const ledgerRequiresLanguageRepair = /LANGUAGE_REPAIR_REQUIRED/u.test(acceptanceLedger);
  if (ledgerRequiresLanguageRepair) {
    assert.equal(
      manifest.status,
      "TRANSITIONAL_LANGUAGE_REVIEW_REQUIRED",
      "Manifest cannot contradict upper acceptance ledger while language repair is required",
    );
  }

  if (manifest.status === "FULLY_ACCEPTED") {
    assert.equal(ledgerRequiresLanguageRepair, false, "FULLY_ACCEPTED contradicts LANGUAGE_REPAIR_REQUIRED");
    assert.equal(reviewRequiredCount, 0, "FULLY_ACCEPTED requires every locale to have current human approval evidence");
  } else {
    assert.equal(manifest.status, "TRANSITIONAL_LANGUAGE_REVIEW_REQUIRED", `Unknown manifest acceptance state: ${manifest.status}`);
    assert.equal(manifest.language_repair_owner, "W4R", "Transitional language state must name W4R as the single repair owner");
    assert.ok(reviewRequiredCount > 0, "Transitional language state requires at least one locale review to remain open");
  }

  return { approvedCount, reviewRequiredCount, fingerprint };
}
