import { defineConfig, devices } from "@playwright/test";

const crossBrowserCritical = /(cross-browser-critical|real-use-continuity)\.spec\.mjs/;

export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global-setup.mjs",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  // Release E2E shares one local Workerd + D1 runtime. CI must not drive that
  // singleton with parallel Playwright workers: aborted browser requests can
  // destroy local request IoContexts while another worker is still using the
  // same dev runtime. Serial execution preserves every test/browser assertion
  // while matching one deterministic local certification runtime.
  workers: process.env.CI ? 1 : undefined,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: "http://127.0.0.1:5173",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    // Chromium remains the canonical full desktop regression suite.
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    // Firefox/WebKit exercise the critical learner surface and the real-use
    // continuity regressions observed on mobile Safari. PWA/offline and
    // service-worker lifecycle behavior remain covered by Chromium/W9 and the
    // deployed test-mirror smoke; these projects focus on browser-engine parity.
    { name: "firefox", testMatch: crossBrowserCritical, use: { ...devices["Desktop Firefox"], serviceWorkers: "block" } },
    { name: "webkit", testMatch: crossBrowserCritical, use: { ...devices["Desktop Safari"], serviceWorkers: "block" } },
    // Mobile Chromium keeps the existing full mobile/project-specific coverage.
    { name: "mobile", use: { ...devices["Pixel 5"] } },
  ],
  webServer: {
    command: "npm run start:e2e -- --ip 127.0.0.1 --port 5173",
    url: "http://127.0.0.1:5173",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
