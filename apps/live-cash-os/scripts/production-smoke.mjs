import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";

const liveUrl = process.env.LIVE_URL ?? "https://live-cash-os-mobile-test.blufferus.workers.dev/";
const canonicalUrl = new URL("/", liveUrl).toString();
const toolsUrl = new URL("/tools", liveUrl).toString();
const deployedSha = process.env.DEPLOYED_SHA?.trim() || null;
const testInviteCode = process.env.LIVE_CASH_TEST_SMOKE_CODE?.trim().toUpperCase() || null;
const attempts = Number(process.env.SMOKE_ATTEMPTS ?? 4);
const waitMs = Number(process.env.SMOKE_WAIT_MS ?? 15_000);
const forbiddenMarkers = [
  "accepted slice",
  "Calculate post-action SPR",
  "T1 — дополнительный cold diagnostic",
  "T1 — необязательная стартовая проверка",
  "T1 — optional diagnostic",
  "Переноси глубоко",
  "due review",
  "Нет evidence",
  "Explicit transfer probe",
  "Field validated",
];

console.log(`production-smoke target=${canonicalUrl} attempts=${attempts}`);
await mkdir("smoke-evidence", { recursive: true });
let lastError = new Error("Production smoke did not start");

function legacyNav(page) {
  return page.getByRole("navigation", { name: /Основная навигация|Primary navigation/ });
}

function practicalNav(page) {
  return page.getByRole("navigation", { name: "Practical Mastery navigation" });
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
  const lockedContext = await browser.newContext();
  const locked = await lockedContext.newPage();
  await locked.goto(canonicalUrl, { waitUntil: "domcontentloaded", timeout: 45_000 });
  await locked.getByRole("heading", { name: "Вход для тестирования" }).waitFor({ timeout: 20_000 });
  if (await legacyNav(locked).count()) throw new Error("Test invite gate exposed legacy navigation before a code was accepted");
  if (await practicalNav(locked).count()) throw new Error("Test invite gate exposed Practical Mastery navigation before a code was accepted");
  await lockedContext.close();
}

async function isolateTestMirrorState(page) {
  if (!testInviteCode) return;
  // The workflow proves TEST_DB with a fake-code 401 and an issued-code 200
  // before browser smoke. Browser GETs still hit the real deployed endpoint so
  // the invite is revalidated on initial load and reload, but the returned
  // learner snapshot is masked to keep this UX scenario independent from state
  // persisted by earlier CI runs. Mutations stay local-only for the same reason.
  await page.route("**/api/state", async (route) => {
    if (route.request().method() === "GET") {
      const response = await route.fetch();
      if (!response.ok()) {
        await route.fulfill({ response });
        return;
      }
      let payload = {};
      try { payload = await response.json(); } catch { /* invite validation still used the real response */ }
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
  await practicalNav(page).waitFor({ timeout: 20_000 });
  await page.getByText(russian ? /БЫСТРЫЙ СТАРТ · ШАГ 1 ИЗ 8/i : /QUICK START · STEP 1 OF 8/i).waitFor({ timeout: 20_000 });
  await practicalNav(page).getByRole("link", { name: russian ? "Учиться" : "Learn", exact: true }).waitFor({ timeout: 10_000 });
  if (await legacyNav(page).count()) throw new Error(`${locale}: canonical home leaked legacy primary navigation`);
  const toggle = page.getByRole("button", { name: russian ? "RU" : "EN", exact: true });
  if ((await toggle.getAttribute("aria-pressed")) !== "true") throw new Error(`${locale}: Practical locale toggle is not active`);
  if ((await page.locator("html").getAttribute("lang")) !== locale) throw new Error(`${locale}: Practical document lang mismatch`);
  await assertNoOverflow(page, `${locale} Practical canonical home`);
}

async function verifyToolsLocale(page, locale) {
  const russian = locale === "ru";
  await page.getByRole("heading", { name: russian ? /Учись понемногу/i : /Learn in small blocks/i }).waitFor({ timeout: 20_000 });
  await page.getByRole("heading", { name: russian ? /Стартовая диагностика/i : /Starting Diagnostic/i }).waitFor({ timeout: 10_000 });
  await page.getByText(russian ? /Можно пропустить и сразу начать первый урок/i : /You can skip it and start lesson one/i).waitFor({ timeout: 10_000 });
  await page.getByRole("heading", { name: russian ? /Что означает путь 0.*100%/i : /What the 0.*100% route means/i }).waitFor({ timeout: 10_000 });
  if (await page.locator(".route-grid article").count() !== 9) throw new Error(`${locale}: support route does not contain nine stages`);
  const routeText = await page.locator(".route-grid").innerText();
  if (!routeText.includes("0%") || !routeText.includes("100%")) throw new Error(`${locale}: support route endpoints are missing`);
  if (russian && /evidence|probe|repair|retention|field validated/iu.test(routeText)) throw new Error("Russian support route exposes internal terminology");

  const expectedNav = russian
    ? ["Сегодня", "Учиться", "Повтор", "Карточки", "Карта", "Руки", "Диагностика"]
    : ["Today", "Learn", "Review", "Cards", "Map", "Hands", "Diagnostic"];
  const nav = legacyNav(page);
  if (await nav.getByRole("button").count() !== expectedNav.length) throw new Error(`${locale}: support navigation does not contain seven destinations`);
  for (const name of expectedNav) await nav.getByRole("button", { name, exact: true }).waitFor({ timeout: 10_000 });

  const toggle = page.getByRole("button", { name: russian ? "RU" : "EN", exact: true });
  if ((await toggle.getAttribute("aria-pressed")) !== "true") throw new Error(`${locale}: support locale toggle is not active`);
  if ((await page.locator("html").getAttribute("lang")) !== locale) throw new Error(`${locale}: support document lang mismatch`);
}

async function openGoldLesson(page, locale) {
  const russian = locale === "ru";
  await legacyNav(page).getByRole("button", { name: russian ? "Учиться" : "Learn", exact: true }).click();
  await page.locator(".module-list article").first().getByRole("button", { name: russian ? /^Изучить/ : /^Study/ }).click();
  await page.getByText(russian ? "1 · РЕШИ БЕЗ ПОДСКАЗКИ" : "1 · COLD CHECK").waitFor({ timeout: 10_000 });
  await page.getByRole("heading", { name: russian ? /В каких единицах сначала оценить глубину/i : /Which unit should describe the depth first/i }).waitFor({ timeout: 10_000 });
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
    const canonicalBody = await desktop.locator("body").innerText();
    if (!canonicalBody.includes("LIVE CASH OS")) throw new Error("Canonical brand marker is missing");
    await desktop.screenshot({ path: "smoke-evidence/desktop-practical-home-ru.png", fullPage: true });

    await desktop.getByRole("button", { name: "EN", exact: true }).click();
    await verifyCanonicalMastery(desktop, "en");
    await desktop.screenshot({ path: "smoke-evidence/desktop-practical-home-en.png", fullPage: true });

    await desktop.goto(toolsUrl, { waitUntil: "domcontentloaded", timeout: 45_000 });
    await verifyToolsLocale(desktop, "en");
    await verifyBuildIdentity(desktop);
    await desktop.getByRole("button", { name: "RU", exact: true }).click();
    await verifyToolsLocale(desktop, "ru");
    const body = await desktop.locator("body").innerText();
    for (const marker of forbiddenMarkers) if (body.includes(marker)) throw new Error(`Forbidden old marker is present: ${marker}`);
    await desktop.screenshot({ path: "smoke-evidence/desktop-tools-home-ru.png", fullPage: true });

    await openGoldLesson(desktop, "ru");
    const russianChoice = desktop.getByRole("button", { name: "140 страддлов; отдельно отметить 280 обычных BB" });
    await russianChoice.click();
    const russianSession = await desktop.locator(".session").innerText();
    for (const marker of ["COLD CHECK", "DECISION REVIEW", "Strategic denominator", "Side confrontations", "single-raised pot"]) {
      if (russianSession.includes(marker)) throw new Error(`Russian LCM-01 contains old learner marker: ${marker}`);
    }
    await desktop.screenshot({ path: "smoke-evidence/desktop-lcm01-ru.png", fullPage: true });

    await desktop.getByRole("button", { name: "EN", exact: true }).click();
    const englishChoice = desktop.getByRole("button", { name: "140 straddle big blinds; also note 280 ordinary BB" });
    await englishChoice.waitFor({ timeout: 10_000 });
    if ((await englishChoice.getAttribute("aria-pressed")) !== "true") throw new Error("Selected action did not survive locale switch");
    await desktop.getByRole("heading", { name: /Which unit should describe the depth first/i }).waitFor({ timeout: 10_000 });
    if ((await desktop.locator("html").getAttribute("lang")) !== "en") throw new Error("Document lang is not en inside LCM-01");
    const englishSession = await desktop.locator(".session").innerText();
    if (/[А-Яа-яЁё]/u.test(englishSession)) throw new Error("English LCM-01 contains Cyrillic fallback copy");
    await desktop.screenshot({ path: "smoke-evidence/desktop-lcm01-en.png", fullPage: true });

    await desktop.waitForTimeout(900);
    await desktop.reload({ waitUntil: "domcontentloaded" });
    await desktop.getByRole("heading", { name: /Which unit should describe the depth first/i }).waitFor({ timeout: 10_000 });
    if ((await desktop.getByRole("button", { name: "EN", exact: true }).getAttribute("aria-pressed")) !== "true") throw new Error("English locale did not survive reload");
    if ((await desktop.getByRole("button", { name: "140 straddle big blinds; also note 280 ordinary BB" }).getAttribute("aria-pressed")) !== "true") throw new Error("Active decision did not survive reload");
    await desktopContext.close();

    const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const mobile = await mobileContext.newPage();
    await applyTestInvite(mobile);
    await isolateTestMirrorState(mobile);
    await mobile.goto(canonicalUrl, { waitUntil: "domcontentloaded", timeout: 45_000 });
    await verifyCanonicalMastery(mobile, "ru");
    await verifyBuildIdentity(mobile);
    await mobile.screenshot({ path: "smoke-evidence/mobile-practical-home-ru.png", fullPage: true });
    await mobile.getByRole("button", { name: "EN", exact: true }).click();
    await verifyCanonicalMastery(mobile, "en");
    await mobile.screenshot({ path: "smoke-evidence/mobile-practical-home-en.png", fullPage: true });
    await mobile.goto(toolsUrl, { waitUntil: "domcontentloaded", timeout: 45_000 });
    await verifyToolsLocale(mobile, "en");
    await verifyBuildIdentity(mobile);
    await assertNoOverflow(mobile, "English mobile support tools");
    await mobile.screenshot({ path: "smoke-evidence/mobile-tools-home-en.png", fullPage: true });
    await mobileContext.close();

    const report = {
      result: "LIVE_SMOKE_GREEN",
      url: canonicalUrl,
      support_tools_url: toolsUrl,
      http_status: response?.status(),
      deployed_sha: deployedSha,
      build_identity_verified: Boolean(deployedSha),
      build_identity_verified_on: ["practical_mastery", "support_tools"],
      locales: ["ru", "en"],
      verified_routes: ["canonical Practical Mastery", "support tools", "LCM-01 cold decision"],
      canonical_root_has_no_legacy_primary_navigation: true,
      diagnostic_optionality_visible_on_support_tools: true,
      superseded_wave1_shell_markers_rejected: true,
      bilingual_lcm01_smoke_passed: true,
      stable_ids_and_state_across_locale_switch: true,
      locale_and_active_session_persist_reload: true,
      english_lcm01_no_cyrillic_fallback_verified: true,
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
