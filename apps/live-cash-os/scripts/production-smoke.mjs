import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const liveUrl = process.env.LIVE_URL ?? "https://live-cash-os.elmarsal.chatgpt.site/";
const attempts = Number(process.env.SMOKE_ATTEMPTS ?? 20);
const waitMs = Number(process.env.SMOKE_WAIT_MS ?? 15_000);
const expectedMarkers = [
  "Учись коротко",
  "T1 — дополнительный cold diagnostic",
  "LIVE CASH OS",
];
const forbiddenMarkers = ["accepted slice", "Calculate post-action SPR"];

await mkdir("smoke-evidence", { recursive: true });
let lastError = new Error("Production smoke did not start");

for (let attempt = 1; attempt <= attempts; attempt += 1) {
  const browser = await chromium.launch({ headless: true });
  try {
    const desktopContext = await browser.newContext();
    const desktop = await desktopContext.newPage();
    await desktop.goto(liveUrl, { waitUntil: "domcontentloaded", timeout: 45_000 });
    await desktop.getByRole("heading", { name: /Учись коротко/i }).waitFor({ timeout: 20_000 });

    const body = await desktop.locator("body").innerText();
    for (const marker of expectedMarkers) {
      if (!body.includes(marker)) throw new Error(`Missing production marker: ${marker}`);
    }
    for (const marker of forbiddenMarkers) {
      if (body.includes(marker)) throw new Error(`Old runtime marker is still present: ${marker}`);
    }
    await desktop.screenshot({ path: "smoke-evidence/desktop.png", fullPage: true });
    await desktopContext.close();

    const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const mobile = await mobileContext.newPage();
    await mobile.goto(liveUrl, { waitUntil: "domcontentloaded", timeout: 45_000 });
    await mobile.getByRole("heading", { name: /Учись коротко/i }).waitFor({ timeout: 20_000 });
    const overflow = await mobile.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    if (overflow > 1) throw new Error(`Mobile horizontal overflow: ${overflow}px`);
    await mobile.screenshot({ path: "smoke-evidence/mobile.png", fullPage: true });
    await mobileContext.close();

    console.log(`LIVE_SMOKE_GREEN attempt=${attempt} url=${liveUrl}`);
    await browser.close();
    process.exit(0);
  } catch (error) {
    lastError = error instanceof Error ? error : new Error(String(error));
    console.log(`attempt ${attempt}/${attempts} not ready: ${lastError.message}`);
    await browser.close();
    if (attempt < attempts) await new Promise((resolve) => setTimeout(resolve, waitMs));
  }
}

throw lastError;
