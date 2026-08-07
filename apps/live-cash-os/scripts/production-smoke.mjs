import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";

const liveUrl = process.env.LIVE_URL ?? "https://live-cash-os.elmarsal.chatgpt.site/";
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

console.log(`production-smoke target=${liveUrl} attempts=${attempts}`);
await mkdir("smoke-evidence", { recursive: true });
let lastError = new Error("Production smoke did not start");

function mainNav(page) {
  return page.getByRole("navigation", { name: /Основная навигация|Primary navigation/ });
}

async function assertNoOverflow(page, label) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  if (overflow > 1) throw new Error(`${label} horizontal overflow: ${overflow}px`);
}

async function verifyHomeLocale(page, locale) {
  const russian = locale === "ru";
  await page.getByRole("heading", { name: russian ? /Учись понемногу/i : /Learn in small blocks/i }).waitFor({ timeout: 20_000 });
  await page.getByRole("heading", { name: russian ? /Стартовая проверка мышления/i : /Starting decision check/i }).waitFor({ timeout: 10_000 });
  await page.getByText(russian ? /Можно пропустить и сразу начать первый урок/i : /You can skip it and start lesson one/i).waitFor({ timeout: 10_000 });
  await page.getByRole("heading", { name: russian ? /Что означает путь 0.*100%/i : /What the 0.*100% route means/i }).waitFor({ timeout: 10_000 });
  if (await page.locator(".route-grid article").count() !== 9) throw new Error(`${locale}: route does not contain nine stages`);
  const routeText = await page.locator(".route-grid").innerText();
  if (!routeText.includes("0%") || !routeText.includes("100%")) throw new Error(`${locale}: route endpoints are missing`);
  if (russian && /evidence|probe|repair|retention|field validated/iu.test(routeText)) throw new Error("Russian route exposes internal terminology");

  const expectedNav = russian
    ? ["Сегодня", "Учиться", "Повтор", "Карточки", "Карта", "Руки", "Проверка"]
    : ["Today", "Learn", "Review", "Cards", "Map", "Hands", "Check"];
  const nav = mainNav(page);
  if (await nav.getByRole("button").count() !== expectedNav.length) throw new Error(`${locale}: primary navigation does not contain seven destinations`);
  for (const name of expectedNav) await nav.getByRole("button", { name, exact: true }).waitFor({ timeout: 10_000 });

  const toggle = page.getByRole("button", { name: russian ? "RU" : "EN", exact: true });
  if ((await toggle.getAttribute("aria-pressed")) !== "true") throw new Error(`${locale}: locale toggle is not active`);
  if ((await page.locator("html").getAttribute("lang")) !== locale) throw new Error(`${locale}: document lang mismatch`);
}

async function openGoldLesson(page, locale) {
  const russian = locale === "ru";
  await mainNav(page).getByRole("button", { name: russian ? "Учиться" : "Learn", exact: true }).click();
  await page.locator(".module-list article").first().getByRole("button", { name: russian ? "Изучить" : "Study", exact: true }).click();
  await page.getByText(russian ? "1 · РЕШИ БЕЗ ПОДСКАЗКИ" : "1 · COLD CHECK").waitFor({ timeout: 10_000 });
  await page.getByRole("heading", { name: russian ? /В каких единицах сначала оценить глубину/i : /Which unit should describe the depth first/i }).waitFor({ timeout: 10_000 });
}

for (let attempt = 1; attempt <= attempts; attempt += 1) {
  const browser = await chromium.launch({ headless: true });
  let desktop;
  try {
    const desktopContext = await browser.newContext();
    desktop = await desktopContext.newPage();
    const response = await desktop.goto(liveUrl, { waitUntil: "domcontentloaded", timeout: 45_000 });
    if (response?.status() !== 200) throw new Error(`Unexpected HTTP status: ${response?.status() ?? "none"}`);
    if ((await desktop.title()) !== "Live Cash OS") throw new Error("Unexpected document title");

    await verifyHomeLocale(desktop, "ru");
    const body = await desktop.locator("body").innerText();
    if (!body.includes("LIVE CASH OS")) throw new Error("Brand marker is missing");
    for (const marker of forbiddenMarkers) if (body.includes(marker)) throw new Error(`Forbidden old marker is present: ${marker}`);
    await desktop.screenshot({ path: "smoke-evidence/desktop-home-ru.png", fullPage: true });

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
    if (/[А-Яа-яЁё]/u.test(englishSession)) throw new Error("Approved English LCM-01 contains Cyrillic fallback copy");
    await desktop.screenshot({ path: "smoke-evidence/desktop-lcm01-en.png", fullPage: true });

    await desktop.waitForTimeout(900);
    await desktop.reload({ waitUntil: "domcontentloaded" });
    await desktop.getByRole("heading", { name: /Which unit should describe the depth first/i }).waitFor({ timeout: 10_000 });
    if ((await desktop.getByRole("button", { name: "EN", exact: true }).getAttribute("aria-pressed")) !== "true") throw new Error("English locale did not survive reload");
    if ((await desktop.getByRole("button", { name: "140 straddle big blinds; also note 280 ordinary BB" }).getAttribute("aria-pressed")) !== "true") throw new Error("Active decision did not survive reload");
    await desktopContext.close();

    const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const mobile = await mobileContext.newPage();
    await mobile.goto(liveUrl, { waitUntil: "domcontentloaded", timeout: 45_000 });
    await verifyHomeLocale(mobile, "ru");
    await assertNoOverflow(mobile, "Russian mobile home");
    await mobile.screenshot({ path: "smoke-evidence/mobile-home-ru.png", fullPage: true });
    await mobile.getByRole("button", { name: "EN", exact: true }).click();
    await verifyHomeLocale(mobile, "en");
    await assertNoOverflow(mobile, "English mobile home");
    await mobile.screenshot({ path: "smoke-evidence/mobile-home-en.png", fullPage: true });
    await mobileContext.close();

    const report = {
      result: "LIVE_SMOKE_GREEN",
      url: liveUrl,
      http_status: response?.status(),
      locales: ["ru", "en"],
      verified_routes: ["home", "primary navigation", "0-to-100 skill route", "LCM-01 cold decision"],
      wave1_first_use_shell_contract: true,
      diagnostic_optionality_visible: true,
      superseded_wave1_shell_markers_rejected: true,
      bilingual_lcm01_approved: true,
      stable_ids_and_state_across_locale_switch: true,
      locale_and_active_session_persist_reload: true,
      approved_english_lcm01_has_no_cyrillic_fallback: true,
      mobile_viewport: "390x844",
      timestamp: new Date().toISOString(),
    };
    await writeFile("smoke-evidence/report.json", `${JSON.stringify(report, null, 2)}\n`, "utf8");
    console.log(`LIVE_SMOKE_GREEN attempt=${attempt} url=${liveUrl}`);
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
