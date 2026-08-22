import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:5173",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "w8-chromium-desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "w8-firefox-desktop", use: { ...devices["Desktop Firefox"] } },
    { name: "w8-webkit-desktop", use: { ...devices["Desktop Safari"] } },
    { name: "w8-webkit-390", use: { ...devices["iPhone 13"], viewport: { width: 390, height: 844 } } },
    { name: "w8-chromium-android", use: { ...devices["Pixel 5"], viewport: { width: 393, height: 851 } } },
    { name: "w8-tablet-webkit", use: { ...devices["iPad (gen 7)"] } },
  ],
  webServer: {
    command: "npm run build && npm run start -- --ip 127.0.0.1 --port 5173",
    url: "http://127.0.0.1:5173",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
