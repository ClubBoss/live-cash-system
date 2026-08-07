import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const reportUrl = new URL("../reports/WAVE_1_ACCEPTANCE_2026-08-07.md", import.meta.url);
const protocolUrl = new URL("../reports/WAVE_1_FIRST_USE_WALKTHROUGH_PROTOCOL_2026-08-07.md", import.meta.url);
const evidenceUrl = new URL("../reports/WAVE_1_FIRST_USE_EVIDENCE_TEMPLATE_2026-08-07.json", import.meta.url);

test("Wave 1 acceptance truth remains evidence-bounded", async () => {
  const [report, protocol, evidenceRaw] = await Promise.all([
    readFile(reportUrl, "utf8"),
    readFile(protocolUrl, "utf8"),
    readFile(evidenceUrl, "utf8"),
  ]);
  const evidence = JSON.parse(evidenceRaw);

  assert.match(report, /WAVE_1_IMPLEMENTATION_ACCEPTED \/ COMPREHENSION_EVIDENCE_PENDING/u);
  assert.doesNotMatch(report, /^`WAVE_1_ACCEPTED_WITH_EMPIRICAL_COMPREHENSION_VALIDATION_DEFERRED_TO_WAVE_10`$/mu);
  assert.match(report, /BLOCKED_HUMAN_EVIDENCE/u);

  assert.match(protocol, /At least 3 eligible fresh-context walkthroughs/u);
  assert.match(protocol, /At least 90% correctly explain the diagnostic purpose and that it is optional/u);
  assert.match(protocol, /At least 90% correctly locate Learn, Review, and Real Hands/u);
  assert.match(protocol, /no more than 2 intentional actions/u);

  assert.equal(evidence.evidence_state, "HUMAN_EVIDENCE_PENDING");
  assert.equal(evidence.participant.fresh_context_eligible, false);
  assert.equal(evidence.first_screen.purpose_pass, false);
  assert.equal(evidence.navigation.core_learn_review_real_hands_pass, false);
  assert.equal(evidence.diagnostic.threshold_bundle_pass, false);
});
