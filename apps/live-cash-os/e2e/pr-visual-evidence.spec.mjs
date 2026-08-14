import { createHash } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { expect, test } from "@playwright/test";

const ENABLED = process.env.LIVE_CASH_VISUAL_EVIDENCE === "1";
const OUTPUT_DIR = path.resolve("visual-evidence", "pr");
const NAV_LABELS = ["Сегодня", "Учиться", "Повтор", "Карточки", "Карта", "Руки", "Диагностика"];

async function openFresh(page) {
  await page.addInitScript(() => localStorage.setItem("live-cash-os:theme", "light"));
  await page.route("**/api/state", async (route) => {
    await route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ error: "visual evidence fixture" }) });
  });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Учись понемногу/i })).toBeVisible();
}

async function sha256(filePath) {
  const bytes = await readFile(filePath);
  return createHash("sha256").update(bytes).digest("hex");
}

async function collectControls(page) {
  const controls = {};
  for (const label of NAV_LABELS) {
    const control = page.getByRole("button", { name: label, exact: true }).first();
    if ((await control.count()) === 0) continue;
    controls[label] = { visible: await control.isVisible(), box: await control.boundingBox() };
  }
  return controls;
}

async function capture(page, name, browserErrors) {
  await page.evaluate(async () => {
    window.scrollTo(0, 0);
    if (document.fonts?.ready) await document.fonts.ready;
  });
  await expect(page.locator("main")).toBeVisible();

  const fileName = `${name}.png`;
  const filePath = path.join(OUTPUT_DIR, fileName);
  await page.screenshot({ path: filePath, animations: "disabled" });

  const geometry = await page.evaluate(() => ({
    viewport: { width: window.innerWidth, height: window.innerHeight, devicePixelRatio: window.devicePixelRatio },
    document: {
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      clientHeight: document.documentElement.clientHeight,
      scrollHeight: document.documentElement.scrollHeight,
    },
    body: { clientWidth: document.body.clientWidth, scrollWidth: document.body.scrollWidth },
  }));
  expect(geometry.document.scrollWidth).toBeLessThanOrEqual(geometry.document.clientWidth + 1);

  const build = page.locator("[data-build-sha]").first();
  const buildIdentity = (await build.count()) > 0
    ? { sha: await build.getAttribute("data-build-sha"), appVersion: await build.getAttribute("data-app-version") }
    : null;

  return {
    name,
    file: fileName,
    sha256: await sha256(filePath),
    url: page.url(),
    title: await page.title(),
    theme: await page.locator("html").getAttribute("data-theme"),
    buildIdentity,
    geometry,
    controls: await collectControls(page),
    browserErrors: [...browserErrors],
  };
}

test("UI-relevant PR emits compact real-browser visual evidence", async ({ page }, testInfo) => {
  test.skip(!ENABLED, "visual evidence is only enabled for UI-relevant PRs or manual dispatch");
  test.skip(testInfo.project.name !== "chromium", "one Chromium probe owns the evidence packet");

  await rm(OUTPUT_DIR, { recursive: true, force: true });
  await mkdir(OUTPUT_DIR, { recursive: true });
  const browserErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") browserErrors.push(`console: ${message.text()}`);
  });
  page.on("pageerror", (error) => browserErrors.push(`pageerror: ${error.message}`));

  await page.setViewportSize({ width: 1440, height: 1000 });
  await openFresh(page);
  const screenshots = [];
  screenshots.push(await capture(page, "today-desktop-light", browserErrors));

  await page.getByRole("button", { name: "Учиться", exact: true }).click();
  await expect(page.locator(".module-list")).toBeVisible();
  screenshots.push(await capture(page, "learn-desktop-light", browserErrors));

  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Сегодня", exact: true }).click();
  await expect(page.getByRole("heading", { name: /Учись понемногу/i })).toBeVisible();
  screenshots.push(await capture(page, "today-mobile-light", browserErrors));

  await page.getByRole("button", { name: "Руки", exact: true }).click();
  await expect(page.getByText(/0\/11 обязательных полей заполнено/i)).toBeVisible();
  screenshots.push(await capture(page, "hands-mobile-light", browserErrors));

  await page.getByRole("button", { name: "Сегодня", exact: true }).click();
  const themeToggle = page.getByRole("switch", { name: "Темная тема / Dark theme" });
  await expect(themeToggle).toBeVisible();
  await themeToggle.click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  screenshots.push(await capture(page, "today-mobile-dark", browserErrors));

  const evidence = {
    schema: "LIVE_CASH_PR_VISUAL_EVIDENCE_V1",
    generatedAt: new Date().toISOString(),
    trigger: process.env.GITHUB_EVENT_NAME ?? null,
    sourceHeadSha: process.env.LIVE_CASH_VISUAL_SOURCE_HEAD_SHA ?? null,
    renderCommitSha: process.env.GITHUB_SHA ?? null,
    reason: process.env.LIVE_CASH_VISUAL_EVIDENCE_REASON ?? null,
    project: testInfo.project.name,
    screenshotCount: screenshots.length,
    screenshots,
  };

  await writeFile(path.join(OUTPUT_DIR, "evidence.json"), `${JSON.stringify(evidence, null, 2)}\n`, "utf8");
  expect(screenshots).toHaveLength(5);
});
