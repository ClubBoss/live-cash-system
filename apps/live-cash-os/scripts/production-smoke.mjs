import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";

const liveUrl = process.env.LIVE_URL ?? "https://live-cash-os.elmarsal.chatgpt.site/";
const attempts = Number(process.env.SMOKE_ATTEMPTS ?? 4);
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
  let desktop;
  try {
    const desktopContext = await browser.newContext();
    desktop = await desktopContext.newPage();
    const response = await desktop.goto(liveUrl, { waitUntil: "domcontentloaded", timeout: 45_000 });
    console.log(`attempt=${attempt} status=${response?.status() ?? "none"} finalUrl=${desktop.url()} title=${await desktop.title()}`);
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
