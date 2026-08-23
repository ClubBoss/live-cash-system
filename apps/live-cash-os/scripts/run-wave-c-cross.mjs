import { spawnSync } from "node:child_process";

const projects = [
  "w8-chromium-desktop",
  "w8-webkit-390",
  "w8-chromium-android",
];

const specs = [
  "e2e/post-tester-access-mobile.spec.mjs",
  "e2e/post-tester-sync-performance.spec.mjs",
  "e2e/practical-mastery-access.spec.mjs",
];

const npx = process.platform === "win32" ? "npx.cmd" : "npx";

for (const project of projects) {
  for (const spec of specs) {
    console.log(`Wave C isolated runtime: project=${project} spec=${spec}`);
    const result = spawnSync(
      npx,
      [
        "playwright",
        "test",
        spec,
        "--config=playwright.cross-browser.config.mjs",
        `--project=${project}`,
      ],
      {
        cwd: process.cwd(),
        env: process.env,
        stdio: "inherit",
      },
    );

    if (result.error) throw result.error;
    if (result.status !== 0) process.exit(result.status ?? 1);
  }
}
