import assert from "node:assert/strict";
import test from "node:test";

const REPO = "ClubBoss/live-cash-system";
const LIVE_URL = "https://live-cash-os-mobile-test.blufferus.workers.dev/";
const EXPECTED_SHA = "36a0d0084d57cee0389f817e12b69d3ebbc2b644";
const API_HEADERS = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  "User-Agent": "live-cash-os-release-evidence-probe",
};

async function fetchJson(url) {
  const response = await fetch(url, { headers: API_HEADERS, cache: "no-store" });
  const text = await response.text();
  assert.equal(response.status, 200, `${url} returned ${response.status}: ${text.slice(0, 500)}`);
  return JSON.parse(text);
}

async function fetchText(url) {
  const response = await fetch(url, { redirect: "follow", cache: "no-store" });
  const text = await response.text();
  return { response, text };
}

function assetUrls(html) {
  const urls = new Set();
  for (const match of html.matchAll(/(?:src|href)=["']([^"']+)["']/g)) {
    const value = match[1];
    if (!value || value.startsWith("data:")) continue;
    try {
      const url = new URL(value, LIVE_URL);
      if (url.origin === new URL(LIVE_URL).origin && /\.(?:js|mjs)(?:\?|$)/.test(url.pathname + url.search)) {
        urls.add(url.href);
      }
    } catch {
      // Ignore malformed asset URLs; they cannot contain the build marker.
    }
  }
  return [...urls];
}

test("exact merged main has GREEN push CI, exact-SHA deploy, smoke, and live build identity", async () => {
  const runs = await fetchJson(
    `https://api.github.com/repos/${REPO}/actions/runs?head_sha=${EXPECTED_SHA}&event=push&per_page=20`,
  );
  const run = runs.workflow_runs?.find(
    (candidate) =>
      candidate.name === "Live Cash OS CI" &&
      candidate.head_sha === EXPECTED_SHA &&
      candidate.head_branch === "main" &&
      candidate.event === "push",
  );
  assert.ok(run, `No exact-main push workflow found for ${EXPECTED_SHA}`);
  assert.equal(run.status, "completed", `Exact-main run ${run.id} is not complete`);
  assert.equal(run.conclusion, "success", `Exact-main run ${run.id} concluded ${run.conclusion}`);

  const jobs = await fetchJson(`${run.jobs_url}?per_page=100`);
  const validate = jobs.jobs?.find((job) => job.name === "validate");
  const deploy = jobs.jobs?.find((job) => job.name === "deploy-test-mirror");
  assert.ok(validate, `Exact-main run ${run.id} has no validate job`);
  assert.equal(validate.conclusion, "success", `Exact-main validate concluded ${validate.conclusion}`);
  assert.ok(deploy, `Exact-main run ${run.id} has no deploy-test-mirror job`);
  assert.equal(deploy.conclusion, "success", `Exact-main deploy concluded ${deploy.conclusion}`);

  for (const stepName of [
    "Deploy exact accepted SHA to Cloudflare Workers",
    "Smoke the deployed test mirror",
    "Upload test-mirror smoke evidence",
  ]) {
    const step = deploy.steps?.find((candidate) => candidate.name === stepName);
    assert.ok(step, `Deploy job is missing required step: ${stepName}`);
    assert.equal(step.conclusion, "success", `${stepName} concluded ${step.conclusion}`);
  }

  const artifacts = await fetchJson(
    `https://api.github.com/repos/${REPO}/actions/runs/${run.id}/artifacts?per_page=100`,
  );
  for (const required of ["live-cash-os-release-gate-log", "live-cash-os-test-mirror-smoke"]) {
    assert.ok(
      artifacts.artifacts?.some((artifact) => artifact.name === required && artifact.expired === false),
      `Exact-main run ${run.id} is missing ${required}`,
    );
  }

  const { response, text: html } = await fetchText(LIVE_URL);
  assert.equal(response.status, 200, "canonical Workers root must return HTTP 200");

  let found = html.includes(EXPECTED_SHA);
  let checkedAssets = 0;
  if (!found) {
    for (const url of assetUrls(html).slice(0, 80)) {
      const asset = await fetchText(url);
      if (!asset.response.ok) continue;
      checkedAssets += 1;
      if (asset.text.includes(EXPECTED_SHA)) {
        found = true;
        break;
      }
    }
  }
  assert.ok(found, `Exact build SHA ${EXPECTED_SHA} not found in root or ${checkedAssets} JS assets`);

  const unknown = await fetch(new URL("/api/state", LIVE_URL), {
    headers: { "x-live-cash-profile-code": "LCO-AAAAAAAAAAAAAAAAAAAA" },
    cache: "no-store",
  });
  assert.equal(unknown.status, 401, "test-mirror unknown invite must be rejected");
  const body = await unknown.json();
  assert.equal(body.code, "AUTH_REQUIRED");

  console.log(
    `POST_DEPLOY_EXACT_MAIN_GREEN sha=${EXPECTED_SHA} run_id=${run.id} validate_job=${validate.id} deploy_job=${deploy.id} url=${LIVE_URL}`,
  );
});
