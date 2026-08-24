import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (relative) => readFile(new URL(relative, root), "utf8");

test("release CI parallelizes only through isolated jobs while preserving the complete certification set", async () => {
  const [workflow, primaryConfig, crossConfig] = await Promise.all([
    read("../../.github/workflows/live-cash-os-ci.yml"),
    read("playwright.config.mjs"),
    read("playwright.cross-browser.config.mjs"),
  ]);

  for (const job of ["static:", "e2e-core:", "wave-c:", "mastery-cross:", "visual-evidence:", "validate:"]) {
    assert.match(workflow, new RegExp(`^  ${job.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "m"));
  }

  for (const project of ["chromium", "mobile", "firefox", "webkit"]) {
    assert.match(workflow, new RegExp(`project: ${project}(?:\\n|$)`));
  }

  const waveProjects = ["w8-chromium-desktop", "w8-webkit-390", "w8-chromium-android"];
  const waveSpecs = [
    "e2e/post-tester-access-mobile.spec.mjs",
    "e2e/post-tester-sync-performance.spec.mjs",
    "e2e/practical-mastery-access.spec.mjs",
  ];
  for (const project of waveProjects) {
    for (const spec of waveSpecs) {
      const projectIndex = workflow.indexOf(`project: ${project}`);
      assert.notEqual(projectIndex, -1, `missing Wave C project ${project}`);
      assert.match(workflow.slice(projectIndex), new RegExp(`spec: ${spec.replaceAll(".", "\\.")}`));
    }
  }

  for (const project of ["w8-firefox-desktop", "w8-webkit-390", "w8-chromium-android"]) {
    assert.match(workflow, new RegExp(`project: ${project}(?:\\n|$)`));
  }

  assert.match(workflow, /npx playwright test e2e\/pr-visual-evidence\.spec\.mjs --project=chromium/);
  assert.match(workflow, /test "\$screenshot_count" = "5"/);
  assert.match(workflow, /Complete release gate GREEN: static \+ 4 core projects \+ 9 Wave C cases \+ 3 mastery-cross projects \+ visual policy/);
  assert.match(workflow, /deploy-test-mirror:[\s\S]*?needs: validate/);

  assert.match(primaryConfig, /workers: process\.env\.CI \? 1 : undefined/);
  assert.match(crossConfig, /workers: process\.env\.CI \? 1 : undefined/);
  assert.match(workflow, /strategy:\n\s{6}fail-fast: false/);
});

test("every pull request to main instantiates the canonical validate gate while push scope stays unchanged", async () => {
  const workflow = await read("../../.github/workflows/live-cash-os-ci.yml");
  const pushBlock = workflow.match(/ {2}push:\n([\s\S]*?) {2}pull_request:/)?.[1] ?? "";
  const pullRequestBlock = workflow.match(/ {2}pull_request:\n([\s\S]*?) {2}workflow_dispatch:/)?.[1] ?? "";

  assert.match(pushBlock, /branches: \[main\]/);
  assert.match(pushBlock, /paths:/);
  assert.match(pullRequestBlock, /branches: \[main\]/);
  assert.doesNotMatch(pullRequestBlock, /paths:/);

  const validateStart = workflow.indexOf("  validate:\n");
  const deployStart = workflow.indexOf("  deploy-test-mirror:\n");
  assert.ok(validateStart >= 0 && deployStart > validateStart, "validate block must precede deploy-test-mirror");
  const validate = workflow.slice(validateStart, deployStart);
  for (const dependency of ["scope", "static", "e2e-core", "wave-c", "mastery-cross", "visual-evidence"]) {
    assert.match(validate, new RegExp(`- ${dependency.replaceAll("-", "\\-")}`));
  }
  for (const mandatoryResult of ["SCOPE_RESULT", "STATIC_RESULT", "CORE_RESULT", "WAVE_C_RESULT", "MASTERY_CROSS_RESULT"]) {
    assert.match(validate, new RegExp(`test "\\$${mandatoryResult}" = "success"`));
  }
  assert.match(validate, /if \[\[ "\$VISUAL_REQUIRED" == "1" \]\]; then[\s\S]*?test "\$VISUAL_RESULT" = "success"/);
});

test("production builds compile the legacy tools compatibility runtime off", async () => {
  const [viteConfig, supportingTools] = await Promise.all([
    read("vite.config.ts"),
    read("components/SupportingToolsApp.tsx"),
  ]);

  assert.match(
    viteConfig,
    /__LIVE_CASH_LEGACY_TOOLS_MODE__:\s*JSON\.stringify\(isTestMirrorDeploy \|\| isLocalE2ERuntime\)/,
  );
  assert.match(supportingTools, /declare const __LIVE_CASH_LEGACY_TOOLS_MODE__: boolean/);
  assert.match(supportingTools, /legacyToolsMode: __LIVE_CASH_LEGACY_TOOLS_MODE__/);
  assert.match(supportingTools, /resolveToolsRuntime\(/);
});
