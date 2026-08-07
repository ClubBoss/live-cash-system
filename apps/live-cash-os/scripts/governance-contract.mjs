import assert from "node:assert/strict";
import { createHash } from "node:crypto";

const admittedStatuses = new Set(["ADMITTED", "FIELD_VALIDATED"]);
const openQuestionStatuses = new Set(["RESEARCH_NOTE", "CANDIDATE", "BLOCKED_SOURCE_GAP", "REJECTED_OR_SUPERSEDED"]);
const localeStatuses = new Set(["APPROVED", "REVIEW_REQUIRED"]);
const strategyStatuses = new Set([
  "CURRICULUM_STRATEGY_GOLD",
  "CURRICULUM_STRATEGY_REPAIR_REQUIRED",
  "CURRICULUM_STRATEGY_REVIEW_PENDING",
]);
const drillContentStatuses = new Set([
  "DRILLS_APPROVED",
  "DRILLS_REPAIR_REQUIRED",
  "DRILLS_REVIEW_PENDING",
]);
const finalCompositionStatuses = new Set(["STALE_REVIEW_REQUIRED", "REVIEW_PENDING", "CURRENT"]);

function isStrategyRepairState(status) {
  return status === "CURRICULUM_STRATEGY_REPAIR_REQUIRED" || status === "CURRICULUM_STRATEGY_REVIEW_PENDING";
}

function isDrillRepairState(status) {
  return status === "DRILLS_REPAIR_REQUIRED" || status === "DRILLS_REVIEW_PENDING";
}

function assertUniqueStrings(values, label) {
  assert.ok(Array.isArray(values), `${label} must be an array`);
  assert.equal(new Set(values).size, values.length, `${label} contains duplicates`);
  for (const value of values) assert.ok(typeof value === "string" && value.trim(), `${label} contains an empty value`);
}

function validateHumanEvidence(evidence, label, fingerprint, { finalCompositionDigest = null } = {}) {
  assert.ok(evidence, `${label}: approval requires explicit human evidence`);
  assert.equal(evidence.reviewer_kind, "HUMAN", `${label}: approval is human-only`);
  assert.ok(evidence.reviewer?.trim(), `${label}: human reviewer identity is required`);
  assert.match(evidence.reviewed_at ?? "", /^\d{4}-\d{2}-\d{2}$/, `${label}: review date is required`);
  assert.equal(evidence.corpus_fingerprint, fingerprint, `${label}: approved corpus fingerprint is stale`);
  if (finalCompositionDigest !== null) {
    assert.equal(
      evidence.final_composition_digest,
      finalCompositionDigest,
      `${label}: approved final composition digest is stale`,
    );
  }
}

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

export function validateSourceLockState(manifest, actualSourceBlobs, { requireFull = false } = {}) {
  const expectedPaths = Object.keys(manifest.source_blobs).sort();
  const actualPaths = Object.keys(actualSourceBlobs).sort();
  assert.deepEqual(actualPaths, expectedPaths, "Actual source-lock inventory does not match manifest source_blobs");

  const stalePaths = expectedPaths.filter((path) => actualSourceBlobs[path] !== manifest.source_blobs[path]);
  if (stalePaths.length === 0) return { stalePaths: [], allowedStalePaths: [] };

  assert.equal(requireFull, false, `Full approval cannot use stale source locks: ${stalePaths.join(", ")}`);
  assert.notEqual(manifest.status, "FULLY_ACCEPTED", "FULLY_ACCEPTED cannot carry stale source locks");

  const allowedStalePaths = new Set();
  const repairPaths = manifest.repair_source_paths ?? {};
  if (isStrategyRepairState(manifest.strategy_status)) {
    for (const path of repairPaths.strategy ?? []) allowedStalePaths.add(path);
  }
  if (isDrillRepairState(manifest.drill_content_status)) {
    for (const path of repairPaths.drills ?? []) allowedStalePaths.add(path);
  }
  const localeRepairOpen = Object.values(manifest.modules ?? {}).some((row) => row.ru === "REVIEW_REQUIRED" || row.en === "REVIEW_REQUIRED");
  if (localeRepairOpen) {
    for (const path of repairPaths.language ?? []) allowedStalePaths.add(path);
  }

  for (const path of stalePaths) {
    assert.equal(
      allowedStalePaths.has(path),
      true,
      `Editorial source lock is stale outside an explicit repair scope: ${path}`,
    );
  }

  return { stalePaths, allowedStalePaths: [...allowedStalePaths].sort() };
}

export function validateManifest(manifest, acceptanceLedger, { requireRelease = false } = {}) {
  assert.equal(manifest.schema_version, 5, "Unsupported editorial manifest schema");
  assert.equal(strategyStatuses.has(manifest.strategy_status), true, `Unknown strategy state: ${manifest.strategy_status}`);
  assert.equal(drillContentStatuses.has(manifest.drill_content_status), true, `Unknown drill-content state: ${manifest.drill_content_status}`);
  assert.ok(
    ["FULLY_ACCEPTED", "TRANSITIONAL_REVIEW_REQUIRED"].includes(manifest.status),
    `Unknown manifest acceptance state: ${manifest.status}`,
  );
  assert.ok(manifest.review_policy.includes("can never create an approval"), "Manifest must preserve rejection-only automation policy");

  assertUniqueStrings(manifest.strategy_repair_scope ?? [], "strategy_repair_scope");
  assertUniqueStrings(manifest.drill_repair_scope ?? [], "drill_repair_scope");
  for (const group of ["strategy", "drills", "language"]) {
    assertUniqueStrings(manifest.repair_source_paths?.[group] ?? [], `repair_source_paths.${group}`);
    for (const path of manifest.repair_source_paths?.[group] ?? []) {
      assert.ok(manifest.source_blobs[path], `repair_source_paths.${group}: ${path} is not source-locked`);
    }
  }

  const fingerprint = corpusFingerprint(manifest.source_blobs);

  if (manifest.strategy_status === "CURRICULUM_STRATEGY_GOLD") {
    assert.equal(manifest.strategy_repair_scope.length, 0, "Strategy gold cannot retain an open repair scope");
    validateHumanEvidence(manifest.strategy_approval, "strategy", fingerprint);
  } else {
    assert.ok(manifest.strategy_repair_scope.length > 0, "Strategy repair/review state must name the affected module scope");
    assert.equal(manifest.strategy_approval, null, "Strategy repair/review state must invalidate active approval evidence");
  }

  if (manifest.drill_content_status === "DRILLS_APPROVED") {
    assert.equal(manifest.drill_repair_scope.length, 0, "Approved drills cannot retain an open repair scope");
    validateHumanEvidence(manifest.drill_approval, "drills", fingerprint);
  } else {
    assert.ok(manifest.drill_repair_scope.length > 0, "Drill repair/review state must name the affected module scope");
    assert.equal(manifest.drill_approval, null, "Drill repair/review state must invalidate active approval evidence");
  }

  const composition = manifest.final_composition;
  assert.ok(composition && typeof composition === "object", "Final learner-facing composition state is required");
  assert.equal(finalCompositionStatuses.has(composition.status), true, `Unknown final composition state: ${composition.status}`);
  if (isStrategyRepairState(manifest.strategy_status) || isDrillRepairState(manifest.drill_content_status)) {
    assert.notEqual(composition.status, "CURRENT", "Open strategy/drill repair cannot retain a current approved final composition");
  }
  if (composition.status === "CURRENT") {
    assert.match(composition.current_digest ?? "", /^[a-f0-9]{64}$/u, "Current final composition digest is required");
    assert.match(composition.approved_digest ?? "", /^[a-f0-9]{64}$/u, "Approved final composition digest is required");
    assert.equal(composition.approved_digest, composition.current_digest, "Approved final composition digest is stale");
  } else if (composition.status === "REVIEW_PENDING") {
    assert.match(composition.current_digest ?? "", /^[a-f0-9]{64}$/u, "Review-pending final composition needs a current digest");
    assert.equal(composition.approved_digest, null, "Review-pending composition cannot retain an active approved digest");
  } else {
    assert.equal(composition.approved_digest, null, "Stale composition cannot retain an active approved digest");
    if (composition.current_digest !== null) {
      assert.match(composition.current_digest, /^[a-f0-9]{64}$/u, "Stale current composition digest must be SHA-256 or null");
    }
  }

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
        assert.equal(composition.status, "CURRENT", `${evidenceKey}: locale approval requires a current final composition`);
        validateHumanEvidence(evidence, evidenceKey, fingerprint, { finalCompositionDigest: composition.current_digest });
      } else {
        reviewRequiredCount += 1;
      }
    }
  }

  for (const evidenceKey of Object.keys(manifest.human_approvals)) {
    assert.equal(validEvidenceKeys.has(evidenceKey), true, `Human approval evidence references unknown locale ${evidenceKey}`);
  }

  if (isDrillRepairState(manifest.drill_content_status)) {
    for (const moduleId of manifest.drill_repair_scope) {
      const row = manifest.modules[moduleId];
      assert.ok(row, `Drill repair scope references unknown module ${moduleId}`);
      assert.equal(row.ru, "REVIEW_REQUIRED", `${moduleId}.ru: drill semantic repair invalidates locale approval`);
      assert.equal(row.en, "REVIEW_REQUIRED", `${moduleId}.en: drill semantic repair invalidates locale approval`);
    }
  }
  for (const moduleId of manifest.strategy_repair_scope) {
    assert.ok(manifest.modules[moduleId], `Strategy repair scope references unknown module ${moduleId}`);
  }

  const ledgerRequiresLanguageRepair = /LANGUAGE_REPAIR_REQUIRED/u.test(acceptanceLedger);
  const ledgerRequiresStrategyRepair = /CURRICULUM_STRATEGY_REPAIR_REQUIRED|WAVE_3_STRATEGY_REPAIR_REQUIRED/u.test(acceptanceLedger);

  if (ledgerRequiresStrategyRepair) {
    assert.notEqual(manifest.strategy_status, "CURRICULUM_STRATEGY_GOLD", "Manifest cannot claim strategy gold while upper truth requires repair");
  }
  if (ledgerRequiresLanguageRepair) {
    assert.ok(reviewRequiredCount > 0, "Upper language repair truth requires at least one locale review to remain open");
  }
  if (ledgerRequiresLanguageRepair || ledgerRequiresStrategyRepair) {
    assert.equal(
      manifest.status,
      "TRANSITIONAL_REVIEW_REQUIRED",
      "Manifest cannot contradict an upper repair state",
    );
  }

  const unresolved = manifest.strategy_status !== "CURRICULUM_STRATEGY_GOLD"
    || manifest.drill_content_status !== "DRILLS_APPROVED"
    || reviewRequiredCount > 0
    || composition.status !== "CURRENT";

  if (manifest.status === "FULLY_ACCEPTED") {
    assert.equal(ledgerRequiresLanguageRepair || ledgerRequiresStrategyRepair, false, "FULLY_ACCEPTED contradicts an upper repair state");
    assert.equal(manifest.strategy_status, "CURRICULUM_STRATEGY_GOLD", "FULLY_ACCEPTED requires current strategy approval");
    assert.equal(manifest.drill_content_status, "DRILLS_APPROVED", "FULLY_ACCEPTED requires current drill approval");
    assert.equal(reviewRequiredCount, 0, "FULLY_ACCEPTED requires every locale to have current human approval evidence");
    assert.equal(composition.status, "CURRENT", "FULLY_ACCEPTED requires a current final composition digest");
  } else {
    assert.equal(manifest.status, "TRANSITIONAL_REVIEW_REQUIRED", `Unknown manifest acceptance state: ${manifest.status}`);
    assert.equal(unresolved, true, "Transitional state requires at least one unresolved review dimension");
    if (ledgerRequiresLanguageRepair) {
      assert.equal(manifest.language_repair_owner, "W4R", "Open language repair must retain W4R as the single language owner");
    }
  }

  if (requireRelease) {
    assert.equal(manifest.status, "FULLY_ACCEPTED", "Release/full-approval gate requires FULLY_ACCEPTED");
    assert.equal(unresolved, false, "Release/full-approval gate rejects unresolved repair or review state");
  }

  return {
    approvedCount,
    reviewRequiredCount,
    fingerprint,
    strategyStatus: manifest.strategy_status,
    drillContentStatus: manifest.drill_content_status,
    finalCompositionStatus: composition.status,
  };
}
