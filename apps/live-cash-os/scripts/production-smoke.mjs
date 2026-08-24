import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";

const liveUrl = process.env.LIVE_URL ?? "https://live-cash-os-mobile-test.blufferus.workers.dev/";
const canonicalUrl = new URL("/mastery/journey", liveUrl).toString();
const dataUrl = new URL("/tools?tab=data", liveUrl).toString();
const deployedSha = process.env.DEPLOYED_SHA?.trim() || null;
const testInviteCode = process.env.LIVE_CASH_TEST_SMOKE_CODE?.trim().toUpperCase() || null;
const attempts = Number(process.env.SMOKE_ATTEMPTS ?? 4);
const waitMs = Number(process.env.SMOKE_WAIT_MS ?? 15_000);

console.log(`production-smoke target=${canonicalUrl} attempts=${attempts}`);
await mkdir("smoke-evidence", { recursive: true });
let lastError = new Error("Production smoke did not start");

function practicalNav(page) {
  return page.getByRole("navigation", { name: "Practical Mastery navigation" });
}

function legacyNav(page) {
  return page.getByRole("navigation", { name: /Основная навигация|Primary navigation/ });
}

async function assertNoOverflow(page, label) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  if (overflow > 1) throw new Error(`${label} horizontal overflow: ${overflow}px`);
}

async function verifyBuildIdentity(page) {
  if (!deployedSha) return;
  const badge = page.locator("[data-build-sha]").first();
  await badge.waitFor({ timeout: 10_000 });
  const actual = await badge.getAttribute("data-build-sha");
  if (actual !== deployedSha) throw new Error(`Build identity mismatch: expected ${deployedSha}, got ${actual ?? "missing"}`);
}

async function applyTestInvite(page) {
  if (!testInviteCode) return;
  await page.addInitScript((code) => {
    localStorage.setItem("live-cash-os:portable-profile-code", code);
  }, testInviteCode);
}

async function verifyTestInviteGate(browser) {
  if (!testInviteCode) return;
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(canonicalUrl, { waitUntil: "domcontentloaded", timeout: 45_000 });
  await page.getByRole("heading", { name: "Вход для тестирования" }).waitFor({ timeout: 20_000 });
  if (await legacyNav(page).count()) throw new Error("Test invite gate exposed legacy navigation before access");
  if (await practicalNav(page).count()) throw new Error("Test invite gate exposed Practical navigation before access");
  await context.close();
}

async function isolateTestMirrorState(page) {
  if (!testInviteCode) return;
  await page.route("**/api/state", async (route) => {
    if (route.request().method() === "GET") {
      const response = await route.fetch();
      if (!response.ok()) {
        await route.fulfill({ response });
        return;
      }
      let payload = {};
      try { payload = await response.json(); } catch { /* real response already verified access */ }
      await route.fulfill({ response, json: { ...payload, state: null } });
      return;
    }
    await route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({ error: "browser smoke uses isolated local state", code: "AUTH_REQUIRED" }),
    });
  });
}

async function verifyCanonicalMastery(page, locale) {
  const russian = locale === "ru";
  const nav = practicalNav(page);
  await nav.waitFor({ timeout: 20_000 });
  await page.getByText(russian ? /БЫСТРЫЙ СТАРТ · ШАГ 1 ИЗ 8/i : /QUICK START · STEP 1 OF 8/i).waitFor({ timeout: 20_000 });
  const continueLink = nav.getByRole("link", {
    name: russian ? "Продолжить обучение" : "Continue learning",
    exact: true,
  });
  await continueLink.waitFor({ timeout: 10_000 });
  const href = await continueLink.getAttribute("href");
  if (href !== "/mastery/journey") throw new Error(`${locale}: generic Continue learning must target /mastery/journey, got ${href}`);
  if (await legacyNav(page).count()) throw new Error(`${locale}: canonical Practical leaked legacy primary navigation`);
  const toggle = nav.getByRole("button", { name: russian ? "RU" : "EN", exact: true });
  if ((await toggle.getAttribute("aria-pressed")) !== "true") throw new Error(`${locale}: locale toggle is not active`);
  if ((await page.locator("html").getAttribute("lang")) !== locale) throw new Error(`${locale}: document lang mismatch`);
  await nav.getByRole("link", { name: russian ? "Данные" : "Data", exact: true }).waitFor({ timeout: 10_000 });
  await assertNoOverflow(page, `${locale} Practical canonical home`);
}

async function verifyDataRecovery(page, locale) {
  const russian = locale === "ru";
  await page.goto(dataUrl, { waitUntil: "domcontentloaded", timeout: 45_000 });
  const dataTab = page.getByRole("button", { name: russian ? "Данные и восстановление" : "Data & Recovery", exact: true });
  await dataTab.waitFor({ timeout: 20_000 });
  if ((await dataTab.getAttribute("aria-current")) !== "page") throw new Error(`${locale}: Data & Recovery tab is not current`);
  if (!page.url().includes("tab=data")) throw new Error(`${locale}: Data & Recovery URL lost tab=data`);
  if (await legacyNav(page).count()) throw new Error(`${locale}: support-only /tools exposed legacy learner navigation`);
  await assertNoOverflow(page, `${locale} Data & Recovery`);
}

for (let attempt = 1; attempt <= attempts; attempt += 1) {
  const browser = await chromium.launch({ headless: true });
  let desktop;
  try {
    await verifyTestInviteGate(browser);

    const desktopContext = await browser.newContext();
    desktop = await desktopContext.newPage();
    await applyTestInvite(desktop);
    await isolateTestMirrorState(desktop);
    const response = await desktop.goto(canonicalUrl, { waitUntil: "domcontentloaded", timeout: 45_000 });
    if (response?.status() !== 200) throw new Error(`Unexpected HTTP status: ${response?.status() ?? "none"}`);
    if ((await desktop.title()) !== "Live Cash OS") throw new Error("Unexpected document title");
    await verifyCanonicalMastery(desktop, "ru");
    await verifyBuildIdentity(desktop);
    await desktop.screenshot({ path: "smoke-evidence/desktop-practical-home-ru.png", fullPage: true });

    await practicalNav(desktop).getByRole("button", { name: "EN", exact: true }).click();
    await verifyCanonicalMastery(desktop, "en");
    await desktop.screenshot({ path: "smoke-evidence/desktop-practical-home-en.png", fullPage: true });
    await verifyDataRecovery(desktop, "en");
    await desktop.screenshot({ path: "smoke-evidence/desktop-data-recovery-en.png", fullPage: true });
    await desktopContext.close();

    const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const mobile = await mobileContext.newPage();
    await applyTestInvite(mobile);
    await isolateTestMirrorState(mobile);
    await mobile.goto(canonicalUrl, { waitUntil: "domcontentloaded", timeout: 45_000 });
    await verifyCanonicalMastery(mobile, "ru");
    await verifyBuildIdentity(mobile);
    await mobile.screenshot({ path: "smoke-evidence/mobile-practical-home-ru.png", fullPage: true });
    await verifyDataRecovery(mobile, "ru");
    await mobile.screenshot({ path: "smoke-evidence/mobile-data-recovery-ru.png", fullPage: true });
    await mobileContext.close();

    const report = {
      result: "LIVE_SMOKE_GREEN",
      url: canonicalUrl,
      data_recovery_url: dataUrl,
      http_status: response?.status(),
      deployed_sha: deployedSha,
      build_identity_verified: Boolean(deployedSha),
      canonical_continue_learning_verified: true,
      generic_continue_target: "/mastery/journey",
      support_data_recovery_verified: true,
      canonical_root_has_no_legacy_primary_navigation: true,
      mobile_viewport: "390x844",
      test_invite_gate_verified: Boolean(testInviteCode),
      test_mirror_browser_state_isolated_after_gate: Boolean(testInviteCode),
      timestamp: new Date().toISOString(),
    };
    await writeFile("smoke-evidence/report.json", `${JSON.stringify(report, null, 2)}\n`, "utf8");
    console.log(`LIVE_SMOKE_GREEN attempt=${attempt} url=${canonicalUrl}`);
    await browser.close();
    process.exit(0);
  } catch (error) {
    lastError = error instanceof Error ? error : new Error(String(error));
    if (desktop) {
      const title = await desktop.title().catch(() => "");
      const body = await desktop.locator("body").innerText().catch(() => "");
      const html = await desktop.content().catch(() => "");
      await writeFile(`smoke-evidence/attempt-${attempt}.txt`, `URL: ${desktop.url()}\nTITLE: ${title}\n\nBODY:\n${body}\n\nHTML:\n${html}`, "utf8");
      await desktop.screenshot({ path: `smoke-evidence/attempt-${attempt}.png`, fullPage: true }).catch(() => undefined);
    }
    console.log(`attempt ${attempt}/${attempts} not ready: ${lastError.message}`);
    await browser.close();
    if (attempt < attempts) await new Promise((resolve) => setTimeout(resolve, waitMs));
  }
}

throw lastError;
