import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";

const liveUrl = process.env.LIVE_URL ?? "https://live-cash-os.elmarsal.chatgpt.site/";
const attempts = Number(process.env.SMOKE_ATTEMPTS ?? 4);
const waitMs = Number(process.env.SMOKE_WAIT_MS ?? 15_000);
const forbiddenMarkers = ["accepted slice", "Calculate post-action SPR", "T1 — дополнительный cold diagnostic"];

console.log(`production-smoke target=${liveUrl} attempts=${attempts}`);
await mkdir("smoke-evidence", { recursive: true });
let lastError = new Error("Production smoke did not start");

async function assertNoOverflow(page, label) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  if (overflow > 1) throw new Error(`${label} horizontal overflow: ${overflow}px`);
}

async function verifyLocale(page, locale) {
  const isRussian = locale === "ru";
  const heading = isRussian ? /Учись коротко/i : /Learn in small pieces/i;
  const t1 = isRussian ? /T1 — дополнительная диагностика без подсказок/i : /T1 — optional cold diagnostic/i;
  await page.getByRole("heading", { name: heading }).waitFor({ timeout: 20_000 });
  await page.getByText(t1).waitFor({ timeout: 10_000 });
  const selected = isRussian ? "RU" : "EN";
  const toggle = page.getByRole("button", { name: selected });
  if ((await toggle.getAttribute("aria-pressed")) !== "true") throw new Error(`${selected} toggle is not active`);
  if ((await page.locator("html").getAttribute("lang")) !== locale) throw new Error(`Document lang is not ${locale}`);
}

for (let attempt = 1; attempt <= attempts; attempt += 1) {
  const browser = await chromium.launch({ headless: true });
  let desktop;
  try {
    const desktopContext = await browser.newContext();
    desktop = await desktopContext.newPage();
    const response = await desktop.goto(liveUrl, { waitUntil: "domcontentloaded", timeout: 45_000 });
    console.log(`attempt=${attempt} status=${response?.status() ?? "none"} finalUrl=${desktop.url()} title=${await desktop.title()}`);
    if (response?.status() !== 200) throw new Error(`Unexpected HTTP status: ${response?.status() ?? "none"}`);
    if ((await desktop.title()) !== "Live Cash OS") throw new Error("Unexpected document title");

    await verifyLocale(desktop, "ru");
    let body = await desktop.locator("body").innerText();
    if (!body.includes("LIVE CASH OS")) throw new Error("Brand marker is missing");
    for (const marker of forbiddenMarkers) if (body.includes(marker)) throw new Error(`Forbidden old marker is present: ${marker}`);
    await desktop.screenshot({ path: "smoke-evidence/desktop-ru.png", fullPage: true });

    await desktop.getByRole("button", { name: "EN" }).click();
    await verifyLocale(desktop, "en");
    body = await desktop.locator("body").innerText();
    const forbiddenRussianUi = ["Учись коротко", "СЕГОДНЯ · ОДИН ГЛАВНЫЙ ШАГ", "УЧИТЬСЯ", "КАРТА НАВЫКОВ"];
    for (const marker of forbiddenRussianUi) if (body.includes(marker)) throw new Error(`English UI contains Russian fallback marker: ${marker}`);
    await desktop.screenshot({ path: "smoke-evidence/desktop-en.png", fullPage: true });

    await desktop.reload({ waitUntil: "domcontentloaded" });
    await verifyLocale(desktop, "en");
    await desktopContext.close();

    const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const mobile = await mobileContext.newPage();
    await mobile.goto(liveUrl, { waitUntil: "domcontentloaded", timeout: 45_000 });
    await verifyLocale(mobile, "ru");
    await assertNoOverflow(mobile, "Russian mobile");
    await mobile.screenshot({ path: "smoke-evidence/mobile-ru.png", fullPage: true });
    await mobile.getByRole("button", { name: "EN" }).click();
    await verifyLocale(mobile, "en");
    await assertNoOverflow(mobile, "English mobile");
    await mobile.screenshot({ path: "smoke-evidence/mobile-en.png", fullPage: true });
    await mobileContext.close();

    const report = {
      result: "LIVE_SMOKE_GREEN",
      url: liveUrl,
      http_status: response?.status(),
      title: "Live Cash OS",
      locales: ["ru", "en"],
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
      console.log(`LIVE_BODY_START ${body.slice(0, 1500).replaceAll("\n", " | ")} LIVE_BODY_END`);
      await writeFile(`smoke-evidence/attempt-${attempt}.txt`, `URL: ${desktop.url()}\nTITLE: ${title}\n\nBODY:\n${body}\n\nHTML:\n${html}`, "utf8");
      await desktop.screenshot({ path: `smoke-evidence/attempt-${attempt}.png`, fullPage: true }).catch(() => undefined);
    }
    console.log(`attempt ${attempt}/${attempts} not ready: ${lastError.message}`);
    await browser.close();
    if (attempt < attempts) await new Promise((resolve) => setTimeout(resolve, waitMs));
  }
}

throw lastError;
